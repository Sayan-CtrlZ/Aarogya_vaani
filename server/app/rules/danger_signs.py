"""AarogyaVaani Medical Danger-Sign & Red-Flag Rule Engine.

Evaluates patient answers and spontaneous speech for emergency symptoms across
both Maternal ANC (Obstetric) and General Adult Acute conditions.
Enforces deterministic, clinical-grade safety guardrails.
"""

from __future__ import annotations

import re
from typing import Any

# ==============================================================================
# Clinical Red-Flag Rule Registry
# ==============================================================================

MATERNAL_DANGER_RULES = [
    {
        "id": "vaginal_bleeding",
        "category": "maternal",
        "question_id": "anc_bleeding",
        "severity": "EMERGENCY",
        "alert": "Obstetric hemorrhage risk. Immediate clinical evaluation required.",
        # Explicit clinical phrases; NEVER bare 'yes' or 'no'
        "text_triggers": [
            "vaginal bleeding", "heavy bleeding", "bleeding per vaginum", "spotting blood",
            "রক্তপাত", "যোনিপথে রক্তপাত", "রক্ত যাচ্ছে", "অনেক রক্ত পড়ছে", "রক্তক্ষরণ",
            "खून बह रहा", "रक्तस्राव", "योनि से खून", "ब्लीडिंग"
        ],
        "affirmative_keys": ["bleeding", "severe bleeding", "heavy bleeding", "yes", "হ্যাঁ", "हाँ"]
    },
    {
        "id": "severe_headache_preeclampsia",
        "category": "maternal",
        "question_id": "anc_headache",
        "severity": "CRITICAL",
        "alert": "Severe persistent headache with preeclampsia risk. Urgent blood pressure check needed.",
        "text_triggers": [
            "severe headache", "unbearable headache", "throbbing headache", "blurred vision",
            "অসহ্য মাথা ব্যথা", "তীব্র মাথা ব্যথা", "খুব বেশি মাথা ব্যথা", "চোখে ঝাপসা",
            "চোখে অন্ধকার", "बहुत तेज सिरदर्द", "असहनीय सिरदर्द", "आँखों में धुंधलापन"
        ],
        "affirmative_keys": ["severe", "unbearable", "very high", "blurred vision"]
    },
    {
        "id": "reduced_fetal_movement",
        "category": "maternal",
        "question_id": "anc_movement",
        "severity": "HIGH",
        "alert": "Reduced or absent fetal movement reported. Fetal wellbeing assessment recommended.",
        "text_triggers": [
            "no fetal movement", "reduced movement", "baby not moving", "decreased movement",
            "বাচ্চা নড়ছে না", "কম নড়াচড়া", "নড়াচড়া করছে না", "পেটে নড়াচড়া বন্ধ",
            "बच्चा हलचल नहीं कर रहा", "हलचल कम हो गई", "बच्चा नहीं हिल रहा"
        ],
        "affirmative_keys": ["no movement", "less movement", "reduced", "none"]
    },
    {
        "id": "fluid_leakage",
        "category": "maternal",
        "question_id": "anc_fluid",
        "severity": "CRITICAL",
        "alert": "Premature rupture of membranes / amniotic fluid leakage risk.",
        "text_triggers": [
            "water leaking", "fluid leaking", "amniotic fluid", "water broke",
            "জল ভাঙা", "জল পড়ছে", "তরল নির্গমন", "জল ভাঙছে",
            "पानी छूट गया", "पानी गिर रहा", "तरल निकल रहा"
        ],
        "affirmative_keys": ["water broke", "leaking", "yes", "হ্যাঁ"]
    }
]

GENERAL_ACUTE_RULES = [
    {
        "id": "acute_chest_pain",
        "category": "general",
        "question_id": "symptom_chest",
        "severity": "EMERGENCY",
        "alert": "Acute chest pain / pressure reported. Immediate cardiac evaluation required.",
        "text_triggers": [
            "chest pain", "pressure on chest", "crushing chest", "heart attack", "pain in heart",
            "বুকে তীব্র ব্যথা", "বুকে চাপ", "বুকে ব্যথা", "হার্ট অ্যাটাক",
            "छाती में तेज दर्द", "सीने में दर्द", "सीने में दबाव", "दिल का दौरा"
        ],
        "affirmative_keys": ["severe chest pain", "crushing pressure"]
    },
    {
        "id": "severe_respiratory_distress",
        "category": "general",
        "question_id": "symptom_breathing",
        "severity": "EMERGENCY",
        "alert": "Severe dyspnea / respiratory distress. Immediate oxygen & medical care required.",
        "text_triggers": [
            "can't breathe", "cannot breathe", "gasping for air", "severe shortness of breath",
            "শ্বাস নিতে পারছি না", "তীব্র শ্বাসকষ্ট", "শ্বাস বন্ধ হয়ে আসছে", "শ্বাস কষ্ট",
            "सांस नहीं ले पा रहा", "बहुत ज्यादा सांस फूलना", "दम घुट रहा"
        ],
        "affirmative_keys": ["severe breathlessness", "cannot breathe"]
    },
    {
        "id": "convulsions_or_altered_sensorium",
        "category": "general",
        "question_id": "symptom_convulsion",
        "severity": "EMERGENCY",
        "alert": "Convulsions, seizure, or loss of consciousness reported.",
        "text_triggers": [
            "convulsion", "seizure", "fits", "passed out", "unconscious", "fainted",
            "খিঁচুনি", "জ্ঞান হারানো", "অজ্ঞান হয়ে যাওয়া", "ফিট লাগা",
            "दौरा पड़ा", "बेहोश हो गया", "मूर्छित", "चक्कर खाकर गिरना"
        ],
        "affirmative_keys": ["seizure", "unconscious", "fainted"]
    },
    {
        "id": "critical_high_fever",
        "category": "general",
        "question_id": "symptom_fever_critical",
        "severity": "HIGH",
        "alert": "Very high fever (>103°F / 39.4°C) with persistent duration.",
        "text_triggers": [
            "103 fever", "104 fever", "105 fever", "103°f", "104°f", "105°f",
            "১০৩ জ্বর", "১০৪ জ্বর", "১০৫ জ্বর", "১০৩ ডিগ্রি", "১০৪ ডিগ্রি",
            "103 डिग्री", "104 डिग्री", "105 डिग्री", "तेज बुखार 103"
        ],
        "affirmative_keys": ["103", "104", "105", ">103"]
    }
]

ALL_DANGER_RULES = MATERNAL_DANGER_RULES + GENERAL_ACUTE_RULES


# ==============================================================================
# Rule Evaluation Engine
# ==============================================================================

def evaluate_danger_signs(
    answers: dict[str, Any] | None = None,
    free_text: str = "",
) -> list[dict[str, Any]]:
    """Deterministically evaluates clinical danger signs across structured facts and free text.

    Args:
        answers: Key-value dictionary of structured clinical facts/answers.
        free_text: Raw patient utterance in English, Bengali, or Hindi.

    Returns:
        Deduplicated list of detected danger sign alerts with severity and guidance.
    """
    detected: dict[str, dict[str, Any]] = {}
    normalized_text = (free_text or "").lower().strip()
    answers_dict = answers or {}

    for rule in ALL_DANGER_RULES:
        rule_id = rule["id"]
        matched_trigger = None

        # 1. Check structured answer map if question_id key is present
        q_id = rule.get("question_id")
        if q_id and q_id in answers_dict:
            val = str(answers_dict[q_id]).lower().strip()
            # Only match against affirmative keys specifically defined for this question
            if any(k in val for k in rule.get("affirmative_keys", [])):
                matched_trigger = f"structured_key:{q_id}={val}"

        # 2. Check free text utterance for clinically explicit trigger phrases
        if not matched_trigger and normalized_text:
            for trigger in rule.get("text_triggers", []):
                # Ensure word/phrase matching
                if trigger in normalized_text:
                    matched_trigger = f"phrase:'{trigger}'"
                    break

        if matched_trigger and rule_id not in detected:
            detected[rule_id] = {
                "rule_id": rule_id,
                "category": rule["category"],
                "severity": rule["severity"],
                "alert_message": rule["alert"],
                "matched_trigger": matched_trigger,
            }

    return list(detected.values())


def get_triage_decision(flags: list[dict[str, Any]]) -> str:
    """Determine clinical action decision from detected flags.

    Returns:
        'ESCALATE'  -> Immediate emergency brake (EMERGENCY or CRITICAL severity)
        'MONITOR'   -> Clinical alert flagged, continue with high priority (HIGH severity)
        'ROUTINE'   -> Standard clinical intake
    """
    if not flags:
        return "ROUTINE"

    severities = {f.get("severity") for f in flags}
    if "EMERGENCY" in severities or "CRITICAL" in severities:
        return "ESCALATE"
    if "HIGH" in severities:
        return "MONITOR"
    return "ROUTINE"


def get_emergency_guidance(flags: list[dict[str, Any]], language: str = "bn-IN") -> str:
    """Produce immediate, standardized emergency escalation guidance in the selected language."""
    lang = (language or "bn-IN").lower()

    if "bn" in lang:
        return (
            "মনোযোগ দিয়ে শুনুন: আপনার লক্ষণটিতে অবিলম্বে জরুরী চিকিৎসা সেবা প্রয়োজন। "
            "প্রশ্নোত্তর চালিয়ে না গিয়ে, দয়া করে অবিলম্বে নিকটস্থ প্রাথমিক স্বাস্থ্যকেন্দ্র (PHC), "
            "মহকুমা হাসপাতাল, বা ১০৮ অ্যাম্বুলেন্সে যোগাযোগ করুন।"
        )
    elif "hi" in lang:
        return (
            "कृपया ध्यान दें: आपके इन लक्षणों में तुरंत आपातकालीन चिकित्सा सहायता की आवश्यकता है। "
            "कृपया आगे के सवालों की प्रतीक्षा न करें और तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC), "
            "अस्पताल जाएं या 108 एम्बुलेंस से संपर्क करें।"
        )
    else:
        return (
            "Please note: These symptoms require immediate emergency medical evaluation. "
            "Rather than continuing routine questioning, please seek prompt care at your nearest "
            "Primary Health Centre (PHC), hospital, or call emergency medical services immediately."
        )
