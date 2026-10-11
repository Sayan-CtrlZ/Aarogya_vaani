import dataclasses
import logging
import time
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AgentStateChangedEvent,
    JobContext,
    MetricsCollectedEvent,
    llm,
    metrics,
    room_io,
)
from livekit.agents.voice.agent import ModelSettings
from livekit.plugins import noise_cancellation, openai, sarvam, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from language_manager import (
    DEFAULT_LANGUAGE_CODE,
    INITIAL_GREETING_TEXT,
    LANGUAGE_SPEAKERS,
    SUPPORTED_LANGUAGES,
    LanguageSessionState,
    build_system_prompt,
    build_turn_directive,
    detect_language_intent,
    normalize_language_code,
)

load_dotenv()


class AarogyaVaaniAssistant(Agent):
    """Clinical Intake AI Assistant for AarogyaVaani.

    Maintains session-isolated language state and enforces strict language locking
    across LLM, STT, and TTS pipelines.
    """

    def __init__(self, session_state: LanguageSessionState | None = None) -> None:
        self.session_state = session_state or LanguageSessionState()
        super().__init__(
            instructions=build_system_prompt(
                self.session_state.current_language,
                self.session_state.is_language_selected,
            ),
        )

    @llm.function_tool
    async def set_language(self, language: str) -> str:
        """Switch or set the conversation language when the patient explicitly requests a change or selects their language.

        Args:
            language: The target language code ('bn-IN', 'hi-IN', or 'en-IN') or name ('bengali', 'hindi', 'english').
        """
        code = normalize_language_code(language)
        if not code:
            supported = ", ".join(f"{info['name']} ({k})" for k, info in SUPPORTED_LANGUAGES.items())
            return f"Language '{language}' is not supported. Supported languages are: {supported}."

        success = await self.update_session_language(code, reason="llm_tool_call")
        if success:
            lang_info = SUPPORTED_LANGUAGES[code]
            return (
                f"Session language successfully updated to {lang_info['name']} ({code}). "
                f"You MUST now formulate your next response entirely in {lang_info['name']} ({lang_info['style']}). "
                f"Acknowledge the language switch to the patient in {lang_info['name']}."
            )
        return f"Failed to switch session language to '{language}'."

    async def update_session_language(self, new_language_code: str, reason: str = "") -> bool:
        """Validated application operation to update session language across all subsystems.

        Updates:
        1. Application session state
        2. Active LiveKit TTS provider options
        3. Active LiveKit STT provider options
        4. LLM system instructions
        """
        code = normalize_language_code(new_language_code)
        if not code:
            logging.warning(f"[LANGUAGE_VALIDATION_FAILED] Unsupported language requested: '{new_language_code}'")
            return False

        old_lang = self.session_state.current_language
        self.session_state.current_language = code
        self.session_state.is_language_selected = True

        # 1. Update TTS provider options if session is active
        try:
            session = self.session
            if session and session.tts and hasattr(session.tts, "update_options"):
                speaker = LANGUAGE_SPEAKERS.get(code, "roopa")
                session.tts.update_options(target_language_code=code, speaker=speaker)
                logging.info(f"[TTS_UPDATED] TTS provider switched target_language_code to '{code}' with speaker='{speaker}'")
        except Exception as e:
            logging.warning(f"[TTS_UPDATE_SKIPPED] Could not update session TTS options (session may not be active): {e}")

        # 2. Update STT provider options if session is active
        try:
            session = self.session
            if session and session.stt and hasattr(session.stt, "_opts"):
                session.stt._opts = dataclasses.replace(
                    session.stt._opts,
                    language=sarvam.stt.LanguageCode(code),
                )
                logging.info(f"[STT_UPDATED] STT provider language set to '{code}'")
        except Exception as e:
            logging.warning(f"[STT_UPDATE_SKIPPED] Could not update session STT options: {e}")

        # 3. Update agent system instructions
        new_prompt = build_system_prompt(code, is_language_selected=True)
        try:
            await self.update_instructions(new_prompt)
            logging.info(f"[INSTRUCTIONS_UPDATED] Agent instructions updated for '{code}'")
        except Exception as e:
            logging.warning(f"[INSTRUCTIONS_UPDATE_SKIPPED] Could not update agent instructions: {e}")

        logging.info(
            f"[SESSION_LANGUAGE_LOCKED] Session {id(self.session_state)}: "
            f"{old_lang} -> {code} (Reason: {reason})"
        )
        return True

    async def on_user_turn_completed(
        self, turn_ctx: llm.ChatContext, new_message: llm.ChatMessage
    ) -> None:
        """Invoked when user turn finishes. Validates language requests and injects
        turn-level language lock directives before LLM generation.
        """
        user_text = new_message.raw_text_content or ""
        intent = detect_language_intent(
            user_text,
            current_language=self.session_state.current_language,
            is_selected=self.session_state.is_language_selected,
        )

        turn_note = ""
        if intent.is_explicit_change and intent.target_language:
            # User explicitly requested a language switch or selected initial language
            await self.update_session_language(
                intent.target_language,
                reason=f"user_explicit_utterance: {intent.reason}",
            )
            target_info = SUPPORTED_LANGUAGES[intent.target_language]
            turn_note = (
                f"The user selected/switched to {target_info['name']}. "
                f"Session language is now LOCKED to {target_info['name']} ({intent.target_language}). "
                f"Respond in {target_info['name']} ({target_info['style']})."
            )
        elif intent.is_ambiguous:
            curr_info = SUPPORTED_LANGUAGES[self.session_state.current_language]
            turn_note = (
                f"The user made an ambiguous or unsupported language statement ('{user_text}'). "
                f"Do NOT change the session language. Keep responding strictly in {curr_info['name']} ({curr_info['style']}). "
                f"If they asked about other languages, clarify in {curr_info['name']} that you support Bengali, Hindi, and English."
            )
        else:
            # Standard utterance (may contain mixed speech or English medical terms)
            curr_info = SUPPORTED_LANGUAGES[self.session_state.current_language]
            turn_note = (
                f"Session is strictly LOCKED to {curr_info['name']} ({self.session_state.current_language}). "
                f"Even if user speech contains English medical terms or mixed phrases, "
                f"you MUST respond in {curr_info['name']} ({curr_info['style']}). Do NOT switch languages."
            )

        # Inject turn directive to guarantee LLM receives the current session language on every turn
        directive = build_turn_directive(
            current_language=self.session_state.current_language,
            is_language_selected=self.session_state.is_language_selected,
            extra_note=turn_note,
        )
        turn_ctx.add_message(role="system", content=[directive])

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        model_settings: ModelSettings,
    ):
        """Pipeline node for LLM inference. Ensures the active session language directive
        is present in chat_ctx before generating response.
        """
        curr_lang = self.session_state.current_language
        is_sel = self.session_state.is_language_selected
        directive = build_turn_directive(curr_lang, is_sel)

        has_directive = False
        if chat_ctx.items and chat_ctx.items[-1].role == "system":
            # Check if directive already at the tail
            has_directive = True

        if not has_directive:
            chat_ctx.add_message(role="system", content=[directive])

        async for chunk in Agent.default.llm_node(self, chat_ctx, tools, model_settings):
            yield chunk


server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # Aggregate data across all conversation turns
    usage_collector = metrics.UsageCollector()

    # Track End of Utterance timing
    last_eou_metrics: metrics.EOUMetrics | None = None

    # STT initialized consistently with initial Bengali language
    stt_provider = sarvam.STT(language=DEFAULT_LANGUAGE_CODE)

    # Groq (via OpenAI plugin) for fast LLM reasoning
    llm_provider = openai.LLM(model="openai/gpt-oss-120b")

    # TTS initialized with initial Bengali language and Option B speaker (roopa)
    initial_speaker = LANGUAGE_SPEAKERS.get(DEFAULT_LANGUAGE_CODE, "roopa")
    tts_provider = sarvam.TTS(
        target_language_code=DEFAULT_LANGUAGE_CODE,
        speaker=initial_speaker,
    )

    # Configure the voice pipeline with STT, LLM, TTS, VAD, and Turn Detection
    session = AgentSession(
        stt=stt_provider,
        llm=llm_provider,
        tts=tts_provider,
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
        preemptive_generation=False,  # Disabled to eliminate audio race conditions during dynamic language changes
    )

    # Create session-isolated assistant
    assistant = AarogyaVaaniAssistant()

    # Start the session with noise cancellation enabled
    await session.start(
        agent=assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event):
        if event.is_final:
            logging.info(
                f"[DIAGNOSTIC] STT Final Transcript: '{event.transcript}' (STT detected lang: {event.language}) "
                f"[Session Locked Language: {assistant.session_state.current_language}]"
            )
            # Automatic STT language detection alone does NOT alter session language lock!

    @session.on("agent_state_changed")
    def on_agent_state_changed(event: AgentStateChangedEvent):
        logging.info(f"[DIAGNOSTIC] Agent State: {event.old_state} -> {event.new_state}")
        if event.new_state == "speaking":
            if last_eou_metrics:
                elapsed = time.time() - last_eou_metrics.timestamp
                logging.info(f"Time to first audio (TTFA): {elapsed:.3f}s")

    @session.on("user_state_changed")
    def on_user_state_changed(event):
        logging.info(f"[DIAGNOSTIC] User State: {event.old_state} -> {event.new_state}")

    @session.on("metrics_collected")
    def on_metrics_collected(event: MetricsCollectedEvent):
        nonlocal last_eou_metrics
        if event.metrics.type == "eou_metrics":
            last_eou_metrics = event.metrics

        logging.info(f"[DIAGNOSTIC] Metrics: {event.metrics}")
        metrics.log_metrics(event.metrics)
        usage_collector.collect(event.metrics)

    @session.on("error")
    def on_error(event):
        logging.error(f"[DIAGNOSTIC] Error: {event}")

    async def log_usage():
        summary = usage_collector.get_summary()
        logging.info(f"Usage summary: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # 1. Begin session with a Bengali greeting asking patient to select Bengali, Hindi, or English
    await session.say(INITIAL_GREETING_TEXT)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)
