"""Language management module for AarogyaVaani AI Assistant.

Provides session state management, language intent detection, prompt generation,
and provider language code normalization for Bengali (bn-IN), Hindi (hi-IN),
and English (en-IN).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

# Supported languages with metadata and recommended natural speakers
SUPPORTED_LANGUAGES = {
    "bn-IN": {
        "name": "Bengali",
        "native_name": "বাংলা",
        "style": "Benglish",
        "default_speaker": "roopa",  # Sarvam recommended Bengali voice
        "prompt_desc": "conversational Bengali in Bengali script mixed with common English medical terms (Benglish)",
        "example": "নমস্কার, আমি Aarogya AI, আপনার clinical assistant. আপনার fever কবে থেকে start হলো?",
    },
    "hi-IN": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "style": "Hinglish",
        "default_speaker": "priya",  # Tier 1 Excellent voice (0.13% CER), warm and empathetic
        "prompt_desc": "conversational Hindi in Devanagari script mixed with common English medical terms (Hinglish)",
        "example": "नमस्कार, मैं Aarogya AI हूँ, आपकी clinical assistant. आपको exactly क्या symptoms feel हो रहे हैं?",
    },
    "en-IN": {
        "name": "English",
        "native_name": "English",
        "style": "English",
        "default_speaker": "ishita",  # Tier 1 Excellent voice (0.13% CER), articulate and clear
        "prompt_desc": "clear, compassionate Indian English with simple medical explanations",
        "example": "Hello, I am Aarogya AI, your clinical assistant. When did your symptoms first start?",
    },
}

LANGUAGE_SPEAKERS = {
    code: info["default_speaker"] for code, info in SUPPORTED_LANGUAGES.items()
}

DEFAULT_LANGUAGE_CODE = "bn-IN"

INITIAL_GREETING_TEXT = (
    "নমস্কার, আমি Aarogya AI, আপনার clinical assistant। "
    "অনুগ্রহ করে আপনার কথা বলার ভাষা বেছে নিন: বাংলা, হিন্দি, নাকি ইংরেজি?"
)

UNSUPPORTED_LANGUAGES = [
    "spanish", "french", "german", "japanese", "chinese",
    "tamil", "telugu", "kannada", "malayalam", "marathi",
    "gujarati", "punjabi", "odia", "assamese", "kokborok",
    "arabic", "russian", "urdu",
    # Script representations of unsupported languages
    "जर्मन", "জার্মান", "स्पैनिश", "স্প্যানিশ", "फ्रेंच", "ফ্রেঞ্চ",
    "फ्रांसीसी", "ফরাসি", "तमिल", "তামিল", "तेलुगु", "তেলেগু",
    "ককবরক", "कॉकबोरोक",
]


@dataclass
class LanguageSessionState:
    """Application-managed session state for language selection and locking."""
    current_language: str = DEFAULT_LANGUAGE_CODE
    is_language_selected: bool = False

    def to_dict(self) -> dict:
        return {
            "current_language": self.current_language,
            "is_language_selected": self.is_language_selected,
            "language_name": SUPPORTED_LANGUAGES.get(self.current_language, {}).get("name", "Unknown"),
        }


@dataclass
class LanguageIntent:
    """Result of language intent detection from user speech/text."""
    is_explicit_change: bool = False
    target_language: str | None = None
    is_ambiguous: bool = False
    unsupported_language: str | None = None
    reason: str = ""


def normalize_language_code(lang_str: str | None) -> str | None:
    """Normalize input string to supported provider language codes ('bn-IN', 'hi-IN', 'en-IN')."""
    if not lang_str:
        return None
    s = lang_str.strip().lower()

    if s in ["bn-in", "bn", "bengali", "bangla", "bengla", "বাংলা", "বাঙালি"]:
        return "bn-IN"
    if s in ["hi-in", "hi", "hindi", "हिन्दी", "हिंदी", "hindustani"]:
        return "hi-IN"
    if s in ["en-in", "en", "english", "ইংরেজি", "अंग्रेजी", "अंग्रेज़ी", "ingreji", "angrezi"]:
        return "en-IN"

    return None


def detect_language_intent(
    text: str,
    current_language: str = DEFAULT_LANGUAGE_CODE,
    is_selected: bool = False,
) -> LanguageIntent:
    """Detect whether a user utterance expresses an explicit language change,
    an ambiguous query, or standard conversational content.
    """
    t = text.strip()
    if not t:
        return LanguageIntent(reason="empty_text")

    low = t.lower()

    # 1. Check for unsupported language requests
    for lang in UNSUPPORTED_LANGUAGES:
        pattern = rf"\b{re.escape(lang)}\b" if lang.isascii() else re.escape(lang)
        if re.search(pattern, low):
            return LanguageIntent(
                is_ambiguous=True,
                unsupported_language=lang,
                reason=f"unsupported_language_{lang}",
            )

    # 2. Check for queries about language capabilities
    capability_patterns = [
        r"what\s+languages?\s+(do|can)\s+you\s+(speak|know|understand)",
        r"which\s+languages?\s+(do|can)\s+you",
        r"do\s+you\s+(speak|know|understand)\b",
        r"কি\s+কি\s+ভাষা",
        r"কোন\s+ভাষা\s+জানেন",
        r"বলতে\s*পারেন",
        r"क्या\s+आप\s+.*(बोल|जानते|आती)",
        r"बोल\s*(सकते|सकती)\s*हैं",
    ]
    for cp in capability_patterns:
        if re.search(cp, low):
            return LanguageIntent(is_ambiguous=True, reason="capability_query")

    # 3. Check for multiple conflicting languages or expressions of uncertainty
    found_langs = []
    if re.search(r"\b(bengali|bangla|বাংলা)\b", low):
        found_langs.append("bn-IN")
    if re.search(r"\b(hindi|हिंदी|हिन्दी)\b", low):
        found_langs.append("hi-IN")
    if re.search(r"\b(english|ইংরেজি|अंग्रेजी|अंग्रेज़ी)\b", low):
        found_langs.append("en-IN")

    if len(set(found_langs)) > 1:
        return LanguageIntent(is_ambiguous=True, reason="multiple_languages_mentioned")

    # 4. Check for someone else speaking or passive/incidental mentions
    passive_patterns = [
        r"\b(my\s+doctor|doctor|physician|nurse)\s+speaks\b",
        r"\bi\s+(know|speak|understand)\s+(a\s+little|some|only\s+a\s+bit)\b",
        r"জানা\s+আছে",
        r"आती\s+है",
        r"\b(english|allopathy|ইংরেজি|अंग्रेजी)\s+(medicine|ohe|dawa|ঔষধ|ওষুধ|দবা)\b",
    ]
    for pp in passive_patterns:
        if re.search(pp, low):
            return LanguageIntent(is_ambiguous=True, reason="passive_or_contextual_mention")

    # 5. Check for explicit switch commands
    explicit_patterns = [
        # English phrases
        (r"\b(switch\s+to|change\s+to|change\s+language\s+to|speak\s+in|talk\s+in|converse\s+in|let'?s\s+speak\s+in|can\s+we\s+speak\s+in|please\s+speak\s+in|use)\s+(the\s+)?(bengali|bangla)\b", "bn-IN"),
        (r"\b(switch\s+to|change\s+to|change\s+language\s+to|speak\s+in|talk\s+in|converse\s+in|let'?s\s+speak\s+in|can\s+we\s+speak\s+in|please\s+speak\s+in|use)\s+(the\s+)?(hindi)\b", "hi-IN"),
        (r"\b(switch\s+to|change\s+to|change\s+language\s+to|speak\s+in|talk\s+in|converse\s+in|let'?s\s+speak\s+in|can\s+we\s+speak\s+in|please\s+speak\s+in|use)\s+(the\s+)?(english)\b", "en-IN"),
        (r"\b(please\s+talk\s+in\s+english|can\s+we\s+speak\s+english|speak\s+english)\b", "en-IN"),
        (r"\b(bengali|bangla)\s+please\b", "bn-IN"),
        (r"\bhindi\s+please\b", "hi-IN"),
        (r"\benglish\s+please\b", "en-IN"),

        # Bengali phrases
        (r"(বাংলায়|বাংলা\s+ভাষায়)\s*(কথা\s*বলুন|বলুন|বলবেন|কথা\s*বলব|কথা\s*বলতে\s*চাই)", "bn-IN"),
        (r"(হিন্দিতে|হিন্দি\s+ভাষায়)\s*(কথা\s*বলুন|বলুন|বলবেন|কথা\s*বলব|কথা\s*বলতে\s*চাই)", "hi-IN"),
        (r"(ইংরেজিতে|ইংরেজি\s+ভাষায়)\s*(কথা\s*বলুন|বলুন|বলবেন|কথা\s*বলব|কথা\s*বলতে\s*চাই)", "en-IN"),
        (r"বাংলা\s*হবে", "bn-IN"),
        (r"হিন্দি\s*হবে", "hi-IN"),
        (r"ইংরেজি\s*হবে", "en-IN"),

        # Hindi phrases
        (r"(हिंदी|हिन्दी|हिन्दी\s+भाषा|हिंदी\s+भाषा)\s*(में\s*बात\s*कर|में\s*बोल|बोलिए|बात\s*करिए)", "hi-IN"),
        (r"(बंगाली|बांग्ला)\s*(में\s*बात\s*कर|में\s*बोल|बोलिए|बात\s*करिए)", "bn-IN"),
        (r"(अंग्रेजी|अंग्रेज़ी)\s*(में\s*बात\s*कर|में\s*बोल|बोलिए|बात\s*करिए)", "en-IN"),
    ]

    for pat, target in explicit_patterns:
        if re.search(pat, low):
            return LanguageIntent(is_explicit_change=True, target_language=target, reason="explicit_phrase")

    # 6. Standalone language selection (especially during initial selection or short utterance)
    standalone_patterns = [
        (r"^(please\s+)?(bengali|bangla|বাংলা)(\s+please)?[\.!\?]?$", "bn-IN"),
        (r"^(please\s+)?(hindi|हिंदी|हिन्दी)(\s+please)?[\.!\?]?$", "hi-IN"),
        (r"^(please\s+)?(english|ইংরেজি|अंग्रेजी|अंग्रेज़ी)(\s+please)?[\.!\?]?$", "en-IN"),
        (r"^(আমি\s+)?বাংলা(য়)?(\s+বলব|\s+বলতে\s+চাই)?[\.!\?]?$", "bn-IN"),
        (r"^(मुझे\s+)?हिंदी(\s+चाहिए|\s+बोलनी\s+है)?[\.!\?]?$", "hi-IN"),
    ]
    for pat, target in standalone_patterns:
        if re.search(pat, low):
            return LanguageIntent(is_explicit_change=True, target_language=target, reason="standalone_selection")

    # 7. Initial turn when language is not yet selected and user mentions exactly one language
    if not is_selected and len(found_langs) == 1:
        symptom_words = ["fever", "pain", "cough", "vomit", "ব্যথা", "জ্বর", "दर्द", "बुखार", "বমি", "headache", "throat"]
        has_symptoms = any(sw in low for sw in symptom_words)
        if not has_symptoms:
            return LanguageIntent(is_explicit_change=True, target_language=found_langs[0], reason="initial_selection_mention")

    return LanguageIntent(is_explicit_change=False, target_language=None, reason="normal_utterance")


def build_system_prompt(current_language: str = DEFAULT_LANGUAGE_CODE, is_language_selected: bool = False) -> str:
    """Build the comprehensive clinical intake system prompt enforcing the locked language."""
    lang_info = SUPPORTED_LANGUAGES.get(current_language, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE_CODE])
    lang_name = lang_info["name"]
    lang_style = lang_info["style"]
    lang_desc = lang_info["prompt_desc"]
    example = lang_info["example"]

    selection_status = (
        f"LOCKED to {lang_name} ({current_language})"
        if is_language_selected
        else f"INITIAL STATE (Default: {lang_name} [{current_language}], awaiting patient choice)"
    )

    prompt = f"""# Role and Identity
You are Aarogya AI, a professional, highly capable, and calming clinical intake AI assistant.
Your personality is methodical, clear, and formally empathetic. You explicitly introduce yourself as an AI assistant to set clear expectations.

# Current Language Lock Status (ABSOLUTELY CRITICAL)
- CURRENT SESSION LANGUAGE: {selection_status}
- OUTPUT REQUIREMENT: You MUST ALWAYS generate your responses strictly in {lang_desc}.
- MIXED-SPEECH IMMUNITY: Patients will frequently use mixed-language speech, English medical terminology (e.g., 'fever', 'chest pain', 'paracetamol', 'vomiting', 'high blood pressure', 'cough'), or English sentences. YOU MUST NEVER SWITCH YOUR OUTPUT LANGUAGE TO ENGLISH OR ANY OTHER LANGUAGE BASED ON MIXED USER SPEECH OR STT TRANSCRIPTION.
- UNDERSTAND MIXED INPUT, RESPOND IN LOCKED LANGUAGE: Accurately understand what the patient describes, but phrase 100% of your response in {lang_name} ({lang_style}).
- EXAMPLE RESPONSE: "{example}"

# Language Change Policy
- You are ONLY permitted to change languages when the patient EXPLICITLY requests a language change to Bengali, Hindi, or English.
- When an explicit request is made, use the `set_language` tool to execute the validated change.
- Never switch languages on ambiguous statements (e.g., 'I know a little Hindi', 'My doctor speaks English', 'Do you speak French?'). If ambiguous, clarify in {lang_name} that you support Bengali, Hindi, and English.
- Language selection is completely separate from clinical intake consent.

# Strict Conversation Rules (CRITICAL)
1. ASK ONLY ONE QUESTION AT A TIME. Wait for their answer.
2. NEVER REPEAT A QUESTION. Review conversation history. If the patient has already provided a symptom or severity, do NOT ask for it again.
3. Be an active listener. Briefly acknowledge their statement professionally before moving on.
4. Follow this logical flow. Skip any step the patient has already answered:
   - Step 1: Identify the main symptom.
   - Step 2: Ask when it started (Onset).
   - Step 3: Ask how severe it is (Severity: 1-10 scale or mild/moderate/severe).
   - Step 4: Ask if there are any related symptoms (like cough, body ache, fever, etc.).
5. Once complete, summarize their condition professionally and state that a human doctor will review the file. End the conversation.

# Topical Guardrails & Safety (CRITICAL)
- You are EXCLUSIVELY a clinical intake assistant.
- If the user asks about ANYTHING unrelated to their health or symptoms (politics, general knowledge, entertainment, etc.), politely refuse in {lang_name} and steer the conversation back to their health.

# Medical Boundaries
You are an AI gathering intake information. You CANNOT officially diagnose or prescribe medicine. If symptoms sound severe (e.g., extreme chest pain, acute breathlessness), calmly and firmly advise them to seek emergency medical care immediately.
"""
    return prompt.strip()


def build_turn_directive(
    current_language: str = DEFAULT_LANGUAGE_CODE,
    is_language_selected: bool = False,
    extra_note: str = "",
) -> str:
    """Build a turn-level reminder injected on every turn to ensure the LLM never drifts."""
    lang_info = SUPPORTED_LANGUAGES.get(current_language, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE_CODE])
    lang_name = lang_info["name"]
    lang_style = lang_info["style"]

    if not is_language_selected:
        directive = (
            f"[SYSTEM DIRECTIVE: Language is not yet confirmed by the user. "
            f"If the user has not chosen their language, politely ask them in Bengali to select "
            f"Bengali, Hindi, or English. Extra context: {extra_note}]"
        )
    else:
        directive = (
            f"[SYSTEM DIRECTIVE: Active language is strictly LOCKED to {lang_name} ({current_language}). "
            f"You MUST generate your response ONLY in {lang_name} ({lang_style}). "
            f"Even if the user used English medical terms or mixed speech, DO NOT switch to English or Hindi. "
            f"Maintain {lang_name} output. {extra_note}]"
        )
    return directive
