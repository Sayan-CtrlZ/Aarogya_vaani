"""Test suite for AarogyaVaani language switching, session isolation,
lock enforcement, and provider integration.
"""

import asyncio
import os
import re
import pytest
from dotenv import load_dotenv

load_dotenv()

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
from agent import AarogyaVaaniAssistant
from livekit.agents import llm
from livekit.agents.utils import http_context
from livekit.plugins import openai, sarvam

BENGALI_REGEX = re.compile(r"[\u0980-\u09FF]")
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")


class TestLanguageNormalizationAndIntent:
    """Tests for language normalization and intent classification."""

    def test_normalize_language_codes(self):
        assert normalize_language_code("bn-IN") == "bn-IN"
        assert normalize_language_code("bengali") == "bn-IN"
        assert normalize_language_code("বাংলা") == "bn-IN"

        assert normalize_language_code("hi-IN") == "hi-IN"
        assert normalize_language_code("hindi") == "hi-IN"
        assert normalize_language_code("हिंदी") == "hi-IN"

        assert normalize_language_code("en-IN") == "en-IN"
        assert normalize_language_code("english") == "en-IN"
        assert normalize_language_code("ইংরেজি") == "en-IN"
        assert normalize_language_code("अंग्रेजी") == "en-IN"

        assert normalize_language_code("french") is None
        assert normalize_language_code("spanish") is None
        assert normalize_language_code("") is None

    def test_initial_language_selection(self):
        for phrase, target in [
            ("বাংলা", "bn-IN"),
            ("Bengali", "bn-IN"),
            ("বাংলায় কথা বলতে চাই", "bn-IN"),
            ("Hindi", "hi-IN"),
            ("हिंदी", "hi-IN"),
            ("हिंदी में बात करो", "hi-IN"),
            ("English", "en-IN"),
            ("ইংরেজি", "en-IN"),
            ("Please speak in English", "en-IN"),
        ]:
            intent = detect_language_intent(phrase, is_selected=False)
            assert intent.is_explicit_change is True, f"Failed for {phrase}"
            assert intent.target_language == target, f"Wrong target for {phrase}"

    def test_explicit_language_changes(self):
        switch_cases = [
            ("হিন্দিতে কথা বলুন", "hi-IN"),
            ("বাংলায় বলুন", "bn-IN"),
            ("Can we switch to Hindi?", "hi-IN"),
            ("Switch to English", "en-IN"),
            ("Please speak in Bengali", "bn-IN"),
            ("हिंदी में बात करें", "hi-IN"),
            ("अंग्रेजी में बोलिए", "en-IN"),
            ("Let's talk in English", "en-IN"),
        ]
        for phrase, target in switch_cases:
            intent = detect_language_intent(phrase, current_language="bn-IN", is_selected=True)
            assert intent.is_explicit_change is True, f"Failed for {phrase}"
            assert intent.target_language == target, f"Wrong target for {phrase}"

    def test_ambiguous_language_requests(self):
        ambiguous_cases = [
            "I know a little Hindi",
            "My doctor speaks English",
            "What languages do you speak?",
            "Do you understand Spanish?",
            "Can you speak French?",
            "Maybe Hindi or maybe English",
            "I take English medicine (allopathy)",
            "কি কি ভাষা জানেন?",
            "क्या आप जर्मन बोल सकते हैं?",
        ]
        for phrase in ambiguous_cases:
            intent = detect_language_intent(phrase, current_language="bn-IN", is_selected=True)
            assert intent.is_explicit_change is False, f"Should not be explicit: {phrase}"
            assert intent.is_ambiguous is True, f"Should be marked ambiguous: {phrase}"

    def test_mixed_medical_terms_no_change(self):
        clinical_cases = [
            "Doctor, I have severe chest pain and vomiting since morning",
            "আমার chest pain আর vomiting হচ্ছে",
            "Mujhe do din se high fever and acute cough feel ho rahi hai",
            "Fever since 2 days, paracetamol khayechi",
            "High blood pressure tablet nite bhule gechi",
            "Severe headache and dizziness",
        ]
        for phrase in clinical_cases:
            intent = detect_language_intent(phrase, current_language="bn-IN", is_selected=True)
            assert intent.is_explicit_change is False, f"Clinical phrase triggered language change: {phrase}"
            assert intent.is_ambiguous is False, f"Clinical phrase marked ambiguous: {phrase}"


class TestSessionIsolationAndValidation:
    """Tests for application-managed session state and session isolation."""

    @pytest.mark.asyncio
    async def test_session_isolation(self):
        assistant_1 = AarogyaVaaniAssistant()
        assistant_2 = AarogyaVaaniAssistant()

        assert assistant_1.session_state.current_language == DEFAULT_LANGUAGE_CODE
        assert assistant_2.session_state.current_language == DEFAULT_LANGUAGE_CODE
        assert assistant_1.session_state is not assistant_2.session_state

        # Update assistant_1 to Hindi
        success_1 = await assistant_1.update_session_language("hi-IN", reason="test")
        assert success_1 is True
        assert assistant_1.session_state.current_language == "hi-IN"
        assert assistant_2.session_state.current_language == "bn-IN"

        # Update assistant_2 to English
        success_2 = await assistant_2.update_session_language("en-IN", reason="test")
        assert success_2 is True
        assert assistant_1.session_state.current_language == "hi-IN"
        assert assistant_2.session_state.current_language == "en-IN"

    @pytest.mark.asyncio
    async def test_update_session_language_validation(self):
        assistant = AarogyaVaaniAssistant()

        # Valid updates
        assert await assistant.update_session_language("bn-IN") is True
        assert assistant.session_state.current_language == "bn-IN"

        assert await assistant.update_session_language("hi-IN") is True
        assert assistant.session_state.current_language == "hi-IN"

        assert await assistant.update_session_language("en-IN") is True
        assert assistant.session_state.current_language == "en-IN"

        # Invalid updates must be rejected without altering current state
        assert await assistant.update_session_language("french") is False
        assert assistant.session_state.current_language == "en-IN"

        assert await assistant.update_session_language("spanish") is False
        assert assistant.session_state.current_language == "en-IN"

        assert await assistant.update_session_language("") is False
        assert assistant.session_state.current_language == "en-IN"

    @pytest.mark.asyncio
    async def test_set_language_tool_execution(self):
        assistant = AarogyaVaaniAssistant()

        # Valid tool call
        result = await assistant.set_language("hindi")
        assert "successfully updated" in result
        assert assistant.session_state.current_language == "hi-IN"

        # Invalid tool call
        result_invalid = await assistant.set_language("german")
        assert "not supported" in result_invalid
        assert assistant.session_state.current_language == "hi-IN"


class TestInitialGreetingAndPrompts:
    """Verify initial greeting content and language prompt construction."""

    def test_initial_greeting_is_bengali_and_asks_selection(self):
        # Must contain Bengali script
        assert BENGALI_REGEX.search(INITIAL_GREETING_TEXT) is not None
        # Must mention the 3 options
        assert "বাংলা" in INITIAL_GREETING_TEXT
        assert "হিন্দি" in INITIAL_GREETING_TEXT
        assert "ইংরেজি" in INITIAL_GREETING_TEXT

    def test_prompt_generation_reflects_locked_language(self):
        bn_prompt = build_system_prompt("bn-IN", is_language_selected=True)
        assert "LOCKED to Bengali (bn-IN)" in bn_prompt
        assert "Benglish" in bn_prompt

        hi_prompt = build_system_prompt("hi-IN", is_language_selected=True)
        assert "LOCKED to Hindi (hi-IN)" in hi_prompt
        assert "Hinglish" in hi_prompt

        en_prompt = build_system_prompt("en-IN", is_language_selected=True)
        assert "LOCKED to English (en-IN)" in en_prompt


class TestLLMLanguageLockIntegration:
    """Integration tests with LLM model ensuring language lock under mixed speech."""

    @pytest.mark.asyncio
    async def test_bengali_lock_with_english_medical_terms(self):
        prompt = build_system_prompt("bn-IN", is_language_selected=True)
        turn_directive = build_turn_directive("bn-IN", is_language_selected=True)

        async with http_context.open():
            model = openai.LLM(model="openai/gpt-oss-120b")
            ctx = llm.ChatContext()
            ctx.add_message(role="system", content=prompt)
            ctx.add_message(role="system", content=turn_directive)
            ctx.add_message(
                role="user",
                content="Doctor, I have high fever of 103 and severe chest pain since yesterday. What should I do?",
            )

            response = ""
            async for chunk in model.chat(chat_ctx=ctx):
                if chunk.delta and chunk.delta.content:
                    response += chunk.delta.content

            assert len(response) > 0
            # Must contain Bengali script characters
            assert BENGALI_REGEX.search(response) is not None, (
                f"Expected Bengali response, got: {response[:200]}"
            )

    @pytest.mark.asyncio
    async def test_hindi_lock_with_english_medical_terms(self):
        prompt = build_system_prompt("hi-IN", is_language_selected=True)
        turn_directive = build_turn_directive("hi-IN", is_language_selected=True)

        async with http_context.open():
            model = openai.LLM(model="openai/gpt-oss-120b")
            ctx = llm.ChatContext()
            ctx.add_message(role="system", content=prompt)
            ctx.add_message(role="system", content=turn_directive)
            ctx.add_message(
                role="user",
                content="Doctor, I have severe acute headache and persistent vomiting. Fever started 2 days ago.",
            )

            response = ""
            async for chunk in model.chat(chat_ctx=ctx):
                if chunk.delta and chunk.delta.content:
                    response += chunk.delta.content

            assert len(response) > 0
            # Must contain Devanagari script characters
            assert DEVANAGARI_REGEX.search(response) is not None, (
                f"Expected Hindi response, got: {response[:200]}"
            )


class TestProviderTTSOutput:
    """Verify spoken audio synthesis across all supported languages using Sarvam TTS with Option B speakers."""

    def test_language_speakers_option_b_mapping(self):
        """Verify natural male speaker pairings (Sarvam 'aditya')."""
        assert LANGUAGE_SPEAKERS["bn-IN"] == "aditya"
        assert LANGUAGE_SPEAKERS["hi-IN"] == "aditya"
        assert LANGUAGE_SPEAKERS["en-IN"] == "aditya"

    @pytest.mark.asyncio
    async def test_tts_synthesis_all_languages(self):
        async with http_context.open():
            # 1. Bengali synthesis with male speaker 'aditya'
            bn_speaker = LANGUAGE_SPEAKERS["bn-IN"]
            tts = sarvam.TTS(target_language_code="bn-IN", speaker=bn_speaker)
            assert tts._opts.speaker == "aditya"

            bn_frames = []
            async for frame in tts.synthesize(INITIAL_GREETING_TEXT):
                bn_frames.append(frame)
            assert len(bn_frames) > 0, "Bengali TTS failed to synthesize audio frames"

            # 2. Hindi synthesis with male speaker 'aditya'
            hi_speaker = LANGUAGE_SPEAKERS["hi-IN"]
            tts.update_options(target_language_code="hi-IN", speaker=hi_speaker)
            assert tts._opts.speaker == "aditya"
            hi_text = "नमस्कार, मैं Aarogya AI हूँ। आपको क्या समस्या हो रही है?"
            hi_frames = []
            async for frame in tts.synthesize(hi_text):
                hi_frames.append(frame)
            assert len(hi_frames) > 0, "Hindi TTS failed to synthesize audio frames"

            # 3. English synthesis with male speaker 'aditya'
            en_speaker = LANGUAGE_SPEAKERS["en-IN"]
            tts.update_options(target_language_code="en-IN", speaker=en_speaker)
            assert tts._opts.speaker == "aditya"
            en_text = "Hello, I am Aarogya AI, your clinical assistant. How can I help you today?"
            en_frames = []
            async for frame in tts.synthesize(en_text):
                en_frames.append(frame)
            assert len(en_frames) > 0, "English TTS failed to synthesize audio frames"

