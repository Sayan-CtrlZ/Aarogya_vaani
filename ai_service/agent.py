import asyncio
import dataclasses
import logging
import time
import uuid
from typing import Any
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AgentStateChangedEvent,
    JobContext,
    JobProcess,
    JobRequest,
    MetricsCollectedEvent,
    llm,
    metrics,
    room_io,
)
from livekit.agents.voice.agent import ModelSettings

try:
    from livekit.plugins import noise_cancellation
    _HAS_NOISE_CANCELLATION = True
except Exception as e:
    logging.warning(f"Noise cancellation plugin unavailable (bypassing): {e}")
    _HAS_NOISE_CANCELLATION = False

from livekit.plugins import openai, sarvam, silero
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
from intake_workflow import (
    IntakeState,
    initialize_intake_state,
    process_intake_turn,
)
from orchestrator_client import save_voice_consultation, get_patient_dossier
from tools.medical_tools import (
    query_prescription_medicines,
    query_xray_findings,
    query_lab_results,
)

load_dotenv()


class AarogyaVaaniAssistant(Agent):
    """Clinical Intake AI Assistant for AarogyaVaani.

    Maintains session-isolated language state and enforces strict language locking
    across LLM, STT, and TTS pipelines with Supabase consultation persistence.
    """

    def __init__(
        self,
        session_state: LanguageSessionState | None = None,
        patient_id: str = "AV-2026-8921",
        dossier: dict | None = None,
        room: Any = None,
        patient_name: str | None = None,
    ) -> None:
        self.session_state = session_state or LanguageSessionState()
        self.patient_id = patient_id
        self.dossier = dossier or {}
        self.transcript: list[dict] = []
        self.room = room

        # Resolve patient display name without forcing old static fallbacks
        resolved_name = patient_name
        if not resolved_name and self.dossier and self.dossier.get("patient"):
            p_name = self.dossier.get("patient", {}).get("name")
            if p_name and not p_name.startswith("Patient AV"):
                resolved_name = p_name
        self.patient_name = resolved_name or "Patient"

        self.consultation_id = f"con_{uuid.uuid4().hex[:10]}"
        self.session_start_time = time.time()

        # Initialize shared clinical intake workflow state
        self.intake_state = initialize_intake_state(
            patient_id=self.patient_id,
            patient_name=self.patient_name,
            dossier=self.dossier,
            language=self.session_state.current_language,
            consultation_id=self.consultation_id,
        )

        base_prompt = build_system_prompt(
            current_language=self.session_state.current_language,
            is_language_selected=self.session_state.is_language_selected,
            is_new_patient=self.intake_state.is_new_patient,
        )
        if self.dossier and not self.intake_state.is_new_patient:
            p_brief = (
                self.dossier.get("voice_brief", {}).get(self.session_state.current_language[:2])
                or self.dossier.get("voice_brief", {}).get("en")
                or ""
            )
            base_prompt += (
                f"\n\n[PATIENT CLINICAL DOSSIER FROM SUPABASE]\n{p_brief}\n"
                "You have access to tools: 'check_prescription_medicines', 'check_xray_findings', 'check_lab_results'. "
                "Always consult these tools to verify medications, dosages, and test results from official records."
            )

        super().__init__(instructions=base_prompt)

    async def sync_turn_to_backend(self) -> None:
        """Asynchronously sync real-time consultation turns to Supabase so every turn is saved immediately."""
        try:
            duration = int(time.time() - self.session_start_time)
            await save_voice_consultation(
                patient_id=self.patient_id,
                user_name=self.patient_name,
                transcript=self.transcript,
                language_used=self.session_state.current_language,
                duration_seconds=duration,
                consultation_id=self.consultation_id,
                chief_complaint=self.intake_state.chief_complaint,
                symptoms_timeline=self.intake_state.symptoms_timeline,
                danger_signs=self.intake_state.danger_flags,
                triage_level=self.intake_state.triage_level,
            )
            logging.info(
                f"[CONSULTATION_REALTIME_SYNC] Saved turn {len(self.transcript)} for patient '{self.patient_name}' "
                f"({self.patient_id}) [ID: {self.consultation_id}, Triage: {self.intake_state.triage_level}]"
            )
        except Exception as e:
            logging.warning(f"[CONSULTATION_REALTIME_SYNC_WARN] Failed to sync turn: {e}")

    async def broadcast_transcript(self, role: str, text: str) -> None:
        """Publish real-time text transcript packet to LiveKit room participants."""
        if self.room and hasattr(self.room, "local_participant") and self.room.local_participant:
            try:
                import json
                is_ai = role in ["agent", "ai", "assistant"]
                packet = json.dumps({
                    "type": "transcript",
                    "speaker": "assistant" if is_ai else "user",
                    "role": "assistant" if is_ai else "user",
                    "text": text,
                    "timestamp": time.time(),
                }).encode("utf-8")
                await self.room.local_participant.publish_data(packet, reliable=True, topic="transcript")
            except Exception as e:
                logging.debug(f"[TRANSCRIPT_BROADCAST_WARN] {e}")

    @llm.function_tool
    async def check_prescription_medicines(self, medicine_name: str = "") -> str:
        """Check the patient's verified active prescriptions, exact dosages, frequency, and instructions from Supabase records.
        Call this when the patient asks about which medicines to take, when to take them, or if a medicine is prescribed.

        Args:
            medicine_name: Optional name of the specific medicine (e.g. 'IFA', 'Iron', 'Calcium', 'Paracetamol'). Leave blank to check all active medicines.
        """
        return query_prescription_medicines(
            self.dossier,
            medicine_query=medicine_name,
            language_code=self.session_state.current_language,
        )

    @llm.function_tool
    async def check_xray_findings(self) -> str:
        """Check the patient's verified radiology imaging (Chest X-Ray, ultrasound) findings and doctor impressions from Supabase records.
        Call this when the patient asks about their scan or X-ray reports.
        """
        return query_xray_findings(
            self.dossier,
            language_code=self.session_state.current_language,
        )

    @llm.function_tool
    async def check_lab_results(self, test_name: str = "") -> str:
        """Check the patient's verified pathology lab reports (Hemoglobin, blood tests, etc.) from Supabase records.
        Call this when the patient asks about their blood test, hemoglobin, or laboratory results.

        Args:
            test_name: Optional specific test name (e.g. 'hemoglobin', 'Hb', 'blood sugar').
        """
        return query_lab_results(
            self.dossier,
            test_query=test_name,
            language_code=self.session_state.current_language,
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

        self.intake_state.language = code

        # 3. Update agent system instructions
        new_prompt = build_system_prompt(
            current_language=code,
            is_language_selected=True,
            is_new_patient=self.intake_state.is_new_patient,
        )
        if self.dossier and not self.intake_state.is_new_patient:
            p_brief = (
                self.dossier.get("voice_brief", {}).get(code[:2])
                or self.dossier.get("voice_brief", {}).get("en")
                or ""
            )
            new_prompt += (
                f"\n\n[PATIENT CLINICAL DOSSIER FROM SUPABASE]\n{p_brief}\n"
                "You have access to tools: 'check_prescription_medicines', 'check_xray_findings', 'check_lab_results'. "
                "Always consult these tools to verify medications, dosages, and test results from official records."
            )
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

        # Process user utterance through shared clinical intake workflow engine
        intake_decision = process_intake_turn(
            state=self.intake_state,
            user_text=user_text,
            dossier=self.dossier,
        )

        if intake_decision["action"] == "ESCALATE":
            guidance = intake_decision.get("emergency_guidance") or ""
            intake_directive_note = (
                f"\n[CRITICAL SAFETY BRAKE: {intake_decision['directive']}]\n"
                f"SPOKEN EMERGENCY GUIDANCE TO CONVEY IMMEDIATELY: '{guidance}'\n"
                f"STOP ALL ROUTINE QUESTIONS. Deliver this emergency hospital referral now."
            )
        elif intake_decision["action"] == "COMPLETE_INTAKE":
            intake_directive_note = f"\n[CLINICAL INTAKE COMPLETED]: {intake_decision['directive']}"
        else:
            intake_directive_note = f"\n[INTAKE FLOW DIRECTIVE]: {intake_decision['directive']}"

        turn_note += f" {intake_directive_note}"

        # Record user turn in conversation transcript
        if user_text.strip():
            self.transcript.append({
                "role": "user",
                "text": user_text.strip(),
                "timestamp": time.time(),
            })
            await self.broadcast_transcript("user", user_text.strip())
            asyncio.create_task(self.sync_turn_to_backend())

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
        is present in chat_ctx before generating response and records assistant turns.
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

        full_chunks = []
        async for chunk in Agent.default.llm_node(self, chat_ctx, tools, model_settings):
            if hasattr(chunk, "text") and chunk.text:
                full_chunks.append(chunk.text)
            elif isinstance(chunk, str):
                full_chunks.append(chunk)
            yield chunk

        # Record agent turn in conversation transcript
        if full_chunks:
            full_text = "".join(full_chunks).strip()
            if full_text:
                self.transcript.append({
                    "role": "agent",
                    "text": full_text,
                    "timestamp": time.time(),
                })
                await self.broadcast_transcript("agent", full_text)
                asyncio.create_task(self.sync_turn_to_backend())


def setup_fnc(proc: JobProcess):
    """Prewarm heavy inference models (Silero VAD) outside the event loop."""
    try:
        proc.userdata["vad"] = silero.VAD.load()
        logging.info("[PREWARM] Successfully prewarmed Silero VAD model.")
    except Exception as e:
        logging.warning(f"[PREWARM_NOTICE] Model prewarming notice: {e}")


active_room_jobs: dict[str, str] = {}


async def on_job_request(job_request: JobRequest):
    """Accept incoming job requests for consultation rooms."""
    room_name = job_request.room.name
    active_room_jobs[room_name] = job_request.id
    logging.info(f"[JOB_REQUEST_ACCEPT] Accepted job {job_request.id} for room '{room_name}'")
    await job_request.accept(
        name="AarogyaVaani AI Doctor",
        identity="aarogyavaani_agent",
    )


server = AgentServer(setup_fnc=setup_fnc)


@server.rtc_session(on_request=on_job_request)
async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # Aggregate data across all conversation turns
    usage_collector = metrics.UsageCollector()

    # Track End of Utterance timing
    last_eou_metrics: metrics.EOUMetrics | None = None

    # 1. Extract patient identity and language preferences from dispatch or room metadata
    init_lang = DEFAULT_LANGUAGE_CODE
    patient_id = "NEW_PATIENT"
    patient_name = None

    if ctx.room and ctx.room.name:
        if "consultation_" in ctx.room.name:
            cand = ctx.room.name.split("consultation_")[-1]
            if cand:
                # Strip trailing timestamp if present (e.g. AV_2026_8921_1729868123456)
                parts = cand.split("_")
                if len(parts) >= 2 and parts[-1].isdigit() and len(parts[-1]) >= 10:
                    cand = "_".join(parts[:-1])
                patient_id = cand.replace("_", "-")

    # Check job metadata (from agent dispatch) or room metadata
    raw_meta = getattr(ctx.job, "metadata", None) or (ctx.room.metadata if ctx.room else None)
    if raw_meta:
        try:
            import json
            meta = json.loads(raw_meta) if isinstance(raw_meta, str) else raw_meta
            if isinstance(meta, dict):
                if meta.get("language"):
                    norm_l = normalize_language_code(meta["language"])
                    if norm_l:
                        init_lang = norm_l
                if meta.get("patient_id"):
                    patient_id = meta["patient_id"]
                if meta.get("user_name"):
                    patient_name = meta["user_name"]
        except Exception as e:
            logging.warning(f"[AGENT_METADATA_PARSE_WARN] {e}")

    # Load patient clinical dossier from Supabase / FastAPI (skip for NEW_PATIENT)
    dossier = None
    if patient_id and patient_id != "NEW_PATIENT" and not patient_id.startswith("NEW_"):
        try:
            dossier = await get_patient_dossier(patient_id)
            logging.info(f"[DOSSIER_LOADED] Loaded clinical dossier for {patient_id}: {dossier.get('patient', {}).get('name') if dossier else 'None'}")
        except Exception as e:
            logging.warning(f"[DOSSIER_LOAD_WARN] Failed to load dossier for {patient_id}: {e}")
            dossier = None

    # Patient display name from dossier if known and not already set
    if not patient_name and dossier and dossier.get("patient"):
        p_name = dossier.get("patient", {}).get("name")
        if p_name and not p_name.startswith("Patient AV"):
            patient_name = p_name

    logging.info(f"[AGENT_INIT] Starting session for patient='{patient_name or patient_id}' with initial language='{init_lang}'")

    # 2. STT initialized with preferred initial language
    stt_provider = sarvam.STT(language=init_lang)

    # Groq (via OpenAI plugin) for fast LLM reasoning
    llm_provider = openai.LLM(model="openai/gpt-oss-120b")

    # 3. TTS initialized with preferred initial language and matched speaker
    initial_speaker = LANGUAGE_SPEAKERS.get(init_lang, "roopa")
    tts_provider = sarvam.TTS(
        target_language_code=init_lang,
        speaker=initial_speaker,
    )

    # Retrieve prewarmed VAD and Turn Detector models from proc userdata to prevent event loop blocking
    vad_model = None
    turn_detector_model = None
    if hasattr(ctx, "proc") and hasattr(ctx.proc, "userdata"):
        vad_model = ctx.proc.userdata.get("vad")
        turn_detector_model = ctx.proc.userdata.get("turn_detector")

    if not vad_model:
        vad_model = silero.VAD.load()
    if not turn_detector_model:
        turn_detector_model = MultilingualModel()

    # Configure the voice pipeline with STT, LLM, TTS, VAD, and Turn Detection
    session = AgentSession(
        stt=stt_provider,
        llm=llm_provider,
        tts=tts_provider,
        vad=vad_model,
        turn_detection=turn_detector_model,
        preemptive_generation=False,  # Disabled to eliminate audio race conditions during dynamic language changes
    )

    # Track session start timestamp
    session_start_time = time.time()

    # Create session-isolated assistant
    session_state = LanguageSessionState(
        current_language=init_lang,
        is_language_selected=True,
    )
    assistant = AarogyaVaaniAssistant(
        session_state=session_state,
        patient_id=patient_id,
        dossier=dossier,
        room=ctx.room,
        patient_name=patient_name,
    )

    # Start the session with noise cancellation enabled if available on this platform
    audio_input_opts = None
    if _HAS_NOISE_CANCELLATION:
        try:
            audio_input_opts = room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            )
        except Exception as e:
            logging.warning(f"AudioFilter noise cancellation initialization skipped: {e}")

    await session.start(
        agent=assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(audio_input=audio_input_opts) if audio_input_opts else None,
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

    async def log_usage_and_save_consultation():
        summary = usage_collector.get_summary()
        logging.info(f"Usage summary: {summary}")

        # Persist completed voice consultation to Supabase
        duration = int(time.time() - session_start_time)
        try:
            await save_voice_consultation(
                patient_id=assistant.patient_id,
                user_name=assistant.patient_name or patient_name or "Patient",
                transcript=assistant.transcript,
                language_used=assistant.session_state.current_language,
                duration_seconds=duration,
                consultation_id=assistant.consultation_id,
                chief_complaint=assistant.intake_state.chief_complaint,
                symptoms_timeline=assistant.intake_state.symptoms_timeline,
                danger_signs=assistant.intake_state.danger_flags,
                triage_level=assistant.intake_state.triage_level,
            )
            logging.info(
                f"[CONSULTATION_PERSISTED] Saved session {assistant.consultation_id} with {len(assistant.transcript)} turns "
                f"for patient '{assistant.patient_name}' ({assistant.patient_id}) [Triage: {assistant.intake_state.triage_level}]"
            )
        except Exception as e:
            logging.error(f"[CONSULTATION_PERSIST_ERROR] Could not save consultation: {e}")

    # Immediately persist when participant disconnects or room closes
    @ctx.room.on("participant_connected")
    def on_participant_connected(p):
        logging.info(f"[PARTICIPANT_CONNECTED] {p.identity} (Name: {p.name})")
        if p.name and (not assistant.patient_name or assistant.patient_name == "Patient"):
            assistant.patient_name = p.name

    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(p):
        logging.info(f"[PARTICIPANT_DISCONNECTED] {p.identity} left room. Triggering consultation save...")
        asyncio.create_task(log_usage_and_save_consultation())

    @ctx.room.on("disconnected")
    def on_room_disconnected():
        logging.info("[ROOM_DISCONNECTED] LiveKit room disconnected. Triggering consultation save...")
        asyncio.create_task(log_usage_and_save_consultation())

    def cleanup_room_job():
        if ctx.room and ctx.room.name in active_room_jobs:
            active_room_jobs.pop(ctx.room.name, None)
            logging.info(f"[JOB_CLEANUP] Released active job slot for room '{ctx.room.name}'")

    ctx.add_shutdown_callback(log_usage_and_save_consultation)
    ctx.add_shutdown_callback(cleanup_room_job)

    # 1. Wait for human participant to connect so greeting is heard by the user
    try:
        remote_participant = await ctx.wait_for_participant()
        if remote_participant and remote_participant.name and (not assistant.patient_name or assistant.patient_name in ["Patient", "New Patient"]):
            assistant.patient_name = remote_participant.name
            logging.info(f"[PARTICIPANT_READY] Human participant connected: '{remote_participant.name}' ({remote_participant.identity})")
    except Exception as wait_e:
        logging.warning(f"[WAIT_FOR_PARTICIPANT_NOTICE] Proceeding with greeting: {wait_e}")

    # Brief delay for client WebRTC audio subscription to mount
    await asyncio.sleep(0.4)

    # 1. Begin session with greeting in the user's preferred language (Bengali, Hindi, or English)
    clean_pname = assistant.patient_name if (assistant.patient_name and assistant.patient_name not in ["Patient", "New Patient"]) else ""
    if init_lang == "hi-IN":
        if clean_pname:
            initial_greeting = (
                f"नमस्ते {clean_pname}, आरोग्यवाणी में आपका स्वागत है। आप कैसा महसूस कर रहे हैं और आज आपको क्या स्वास्थ्य समस्या है? "
                "यदि आप चाहें तो हम हिंदी, বাংলা (Bengali), या English में बात कर सकते हैं।"
            )
        else:
            initial_greeting = (
                "नमस्ते, आरोग्यवाणी में आपका स्वागत है। आप कैसा महसूस कर रहे हैं और आज आपको क्या स्वास्थ्य समस्या है? "
                "यदि आप चाहें तो हम हिंदी, বাংলা (Bengali), या English में बात कर सकते हैं।"
            )
    elif init_lang == "en-IN":
        if clean_pname:
            initial_greeting = (
                f"Hello {clean_pname}, welcome to AarogyaVaani. How are you feeling today and what health concern brings you in? "
                "We can also converse in English, বাংলা (Bengali), or हिन्दी (Hindi)."
            )
        else:
            initial_greeting = (
                "Hello, welcome to AarogyaVaani. How are you feeling today and what health concern brings you in? "
                "We can also converse in English, বাংলা (Bengali), or हिन्दी (Hindi)."
            )
    else:  # bn-IN
        if clean_pname:
            initial_greeting = (
                f"নমস্কার {clean_pname}, আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি কেমন অনুভব করছেন এবং আজ কী সমস্যা হচ্ছে? "
                "আপনার সুবিধার জন্য আপনি কি বাংলায়, হিন্দিতে (Hindi), নাকি ইংরেজিতে (English) কথা বলতে চান?"
            )
        else:
            initial_greeting = (
                "নমস্কার, আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি কেমন অনুভব করছেন এবং আজ আপনার কী শারীরিক সমস্যা হচ্ছে? "
                "আপনার সুবিধার জন্য আপনি কি বাংলায়, হিন্দিতে (Hindi), নাকি ইংরেজিতে (English) কথা বলতে চান?"
            )

    assistant.transcript.append({
        "role": "agent",
        "text": initial_greeting,
        "timestamp": time.time(),
    })
    await assistant.broadcast_transcript("agent", initial_greeting)
    asyncio.create_task(assistant.sync_turn_to_backend())
    await session.say(initial_greeting)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)
