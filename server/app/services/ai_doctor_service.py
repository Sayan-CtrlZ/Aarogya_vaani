"""AI Doctor Service: Multi-lingual Clinical Intelligence powered by Gemini & Fallback Heuristics."""

import json
import logging
import re
from typing import Any
import httpx

from app.core.config import settings
from app.rules.danger_signs import (
    evaluate_danger_signs,
    get_emergency_guidance,
    get_triage_decision,
)

logger = logging.getLogger(__name__)

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

# Clinical Red-Flag Indicators for Triage Classification
DANGER_FLAG_KEYWORDS = [
    {
        "id": "severe_headache_preeclampsia",
        "keywords": ["severe headache", "মাথা ব্যথা", "খুব বেশি মাথা ব্যথা", "सिरदर्द", "तेज सिरदर्द"],
        "severity": "CRITICAL",
        "alert": "Severe persistent headache reported. Clinical preeclampsia / neurological risk.",
    },
    {
        "id": "vaginal_bleeding",
        "keywords": ["bleeding", "blood", "রক্তপাত", "রক্ত", "खून", "रक्तस्राव"],
        "severity": "EMERGENCY",
        "alert": "Vaginal bleeding / hemorrhage indicator reported. Immediate emergency referral required.",
    },
    {
        "id": "chest_pain",
        "keywords": ["chest pain", "বুকে ব্যথা", "छाती में दर्द", "heart pain", "pressure on chest"],
        "severity": "EMERGENCY",
        "alert": "Acute chest pain reported. Urgent cardiovascular / respiratory evaluation required.",
    },
    {
        "id": "breathing_difficulty",
        "keywords": ["breathless", "shortness of breath", "শ্বাসকষ্ট", "সাংস নিতে পারছি না", "सांस फूलना"],
        "severity": "EMERGENCY",
        "alert": "Acute shortness of breath reported. Emergency airway and pulmonary evaluation needed.",
    },
    {
        "id": "high_fever",
        "keywords": ["high fever", "জ্বর", "খুব বেশি জ্বর", "तेज बुखार", "বুখার"],
        "severity": "MONITOR",
        "alert": "High body temperature / fever reported. Monitor for sepsis or infection progression.",
    },
]


def evaluate_clinical_danger_signs(text: str) -> list[dict[str, Any]]:
    """Scan utterance for critical maternal, infant, and acute clinical danger flags using hardened rule engine."""
    return evaluate_danger_signs(free_text=text)


def detect_utterance_language(user_message: str, fallback_lang: str = "bn-IN") -> str:
    """
    Detect the communication language of the user's message:
    - Bengali script (0x0980-0x09FF) -> 'bn-IN'
    - Devanagari script (0x0900-0x097F) -> 'hi-IN'
    - Standard English / Latin script with English keywords -> 'en-IN'
    - Hinglish keywords -> 'hi-IN'
    - Banglish keywords -> 'bn-IN'
    - Ambiguous or neutral inputs -> fallback_lang
    """
    if not user_message or not user_message.strip():
        return fallback_lang or "bn-IN"

    text = user_message.strip()

    # 1. Script checks
    if re.search(r"[\u0980-\u09FF]", text):
        return "bn-IN"
    if re.search(r"[\u0900-\u097F]", text):
        return "hi-IN"

    text_lower = text.lower()
    words = re.findall(r"\b[a-z]+\b", text_lower)
    if not words:
        return fallback_lang or "bn-IN"

    # Hinglish keywords
    hinglish_words = {
        "mujhe", "mera", "meri", "mere", "hai", "hain", "kya", "kyun", "kaise",
        "bukhar", "dard", "sirdard", "sar", "pet", "dawa", "dawai", "karo", "kijiye",
        "batao", "bataye", "theek", "thik", "nahi", "nahin", "bohot", "bahut", "tez",
        "ulti", "dast", "khansi", "chhati", "saans", "chakkar"
    }
    # Banglish keywords
    banglish_words = {
        "amar", "amake", "ache", "achhe", "hoyeche", "hoche", "ki", "keno", "kivabe",
        "jor", "byatha", "matha", "pet", "oshudh", "bolun", "bhalo", "kharap",
        "bomi", "kashi", "shwash", "shashkosto"
    }

    hinglish_count = sum(1 for w in words if w in hinglish_words)
    banglish_count = sum(1 for w in words if w in banglish_words)

    if hinglish_count >= 2 or (hinglish_count >= 1 and len(words) <= 3):
        return "hi-IN"
    if banglish_count >= 2 or (banglish_count >= 1 and len(words) <= 3):
        return "bn-IN"

    # English words
    english_words = {
        "i", "have", "my", "me", "am", "is", "are", "feeling", "feel", "fever", "pain",
        "headache", "stomach", "ache", "cough", "cold", "body", "days", "day", "yesterday",
        "today", "since", "high", "low", "severe", "mild", "doctor", "medicine", "tablet",
        "help", "what", "how", "can", "should", "do", "please", "vomiting", "weakness",
        "chest", "throat", "blood", "bleed", "pregnant", "pregnancy", "test", "report",
        "hello", "hi", "hey", "good", "morning", "afternoon", "evening"
    }
    english_count = sum(1 for w in words if w in english_words)

    if english_count >= 1 or len(words) >= 2:
        return "en-IN"

    return fallback_lang or "bn-IN"


def _build_clinical_fallback_response(
    user_message: str,
    lang_code: str,
    patient_name: str,
    patient_context: dict[str, Any] | None = None,
    attached_document: dict[str, Any] | None = None,
    is_voice: bool = False,
) -> dict[str, Any]:
    """Clinical heuristic fallback if Gemini API is unreachable with smart language mirroring."""
    # Detect effective language from utterance
    effective_lang = detect_utterance_language(user_message, lang_code)
    lang_code = (effective_lang or lang_code or "bn-IN").lower()

    flags = evaluate_clinical_danger_signs(user_message)
    triage_action = get_triage_decision(flags)
    if triage_action == "ESCALATE":
        emergency_msg = get_emergency_guidance(flags, lang_code)
        options = (
            ["জরুরী সেবা (১০৮)", "নিকটস্থ হাসপাতাল", "পরিবারকে জানানো"] if "bn" in lang_code else
            ["आपातकालीन सेवा (108)", "नजदीकी अस्पताल", "परिवार को सूचित करें"] if "hi" in lang_code else
            ["Call 108 Ambulance", "Nearest Hospital", "Notify Family"]
        )
        return {
            "ai_message": emergency_msg,
            "triage_level": "EMERGENCY",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Acute Emergency / Red Flag",
        }
    triage = "MONITOR" if triage_action == "MONITOR" else "STABLE"

    p_info = patient_context or {}
    is_new = bool(p_info.get("is_new_patient")) or not patient_name or patient_name in ["Patient", "New Patient"]
    clean_name = "" if is_new or patient_name in ["Patient", "New Patient"] else f" {patient_name}"

    # Document / Report review fallback
    if attached_document:
        doc_title = attached_document.get("title") or attached_document.get("file_name") or "Medical Report"
        doc_cat = attached_document.get("category") or "Diagnostic"
        if "hi" in lang_code:
            msg = f"नमस्ते{clean_name}, आपकी रिपोर्ट ({doc_title}) मैंने देखी है। इसके परीक्षण परिणामों को सुरक्षित रखा गया है। कृपया अपने नजदीकी डॉक्टर से परामर्श करें।"
            options = ["रिपोर्ट समझाइए", "क्या दवा बदलनी है?", "कब डॉक्टर को दिखाएं?", "सब ठीक है क्या?"]
        elif "bn" in lang_code:
            msg = f"নমস্কার{clean_name}, আপনার মেডিকেল রিপোর্ট ({doc_title}) পর্যালোচনা করেছি। এর গুরুত্বপূর্ণ তথ্যগুলো রেকর্ড করা হয়েছে। চিকিৎসকের সাথে বিস্তারিত আলোচনা করুন।"
            options = ["রিপোর্টটি ব্যাখ্যা করুন", "ঔষধ সংক্রান্ত তথ্য", "কখন ডাক্তার দেখাবো?", "সবকিছু স্বাভাবিক কি?"]
        else:
            msg = f"Hello{clean_name}, I have reviewed your {doc_cat} report ({doc_title}). The diagnostic findings are recorded. Please discuss these with your primary health officer."
            options = ["Explain report findings", "Medication dosage review", "When to consult PHC", "Are values normal?"]

        return {
            "ai_message": msg,
            "triage_level": triage if triage != "STABLE" else "MONITOR",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": f"Document Review: {doc_title}",
        }

    # Emergency danger flags triggered
    if triage == "EMERGENCY":
        if "hi" in lang_code:
            msg = f"चेतावनी{clean_name}: आपके बताए गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल या प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।"
            options = ["एम्बुलेंस 108 पर कॉल करें", "नजदीकी अस्पताल जाएं", "पारिवारिक डॉक्टर से संपर्क करें"]
        elif "bn" in lang_code:
            msg = f"সতর্কতা{clean_name}: আপনার উল্লেখিত উপসর্গগুলো জরুরি চিকিৎসার নির্দেশ করে। অবিলম্বে নিকটস্থ স্বাস্থ্যকেন্দ্র বা হাসপাতালে যোগাযোগ করুন।"
            options = ["অ্যাম্বুলেন্স ১০৮ নম্বরে ফোন করুন", "নিকটস্থ হাসপাতালে যান", "স্বাস্থ্যকর্মীর সাথে যোগাযোগ করুন"]
        else:
            msg = f"Urgent Notice{clean_name}: The symptoms you described indicate potential medical emergency. Please visit the nearest primary health center or hospital immediately."
            options = ["Call Emergency 108", "Visit nearest PHC/Hospital", "Contact local health worker"]

        return {
            "ai_message": msg,
            "triage_level": "EMERGENCY",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Acute Emergency Symptoms",
        }

    msg_lower = (user_message or "").lower()

    # Prescription / Medication inquiry fallback
    medications = (patient_context or {}).get("active_medications") or []
    if any(k in msg_lower for k in ["medicine", "prescription", "ঔষধ", "দবা", "दवा", "tablet", "dosage", "ডোজ", "কখন খাব", "ifa", "iron", "calcium", "paracetamol"]):
        if medications:
            med_summaries = []
            for m in medications:
                if isinstance(m, dict) and m.get("name"):
                    med_summaries.append(f"{m.get('name')} ({m.get('dosage', '')} - {m.get('instructions', '')})")
            med_text = "; ".join(med_summaries[:3])
            if "hi" in lang_code:
                msg = f"नमस्ते{clean_name}, आपके रिकॉर्ड के अनुसार आपकी मुख्य दवाएं हैं: {med_text}। कृपया डॉक्टर के पर्चे अनुसार समय पर लें।"
                options = ["दवा का समय समझाइए", "क्या कोई साइड इफेक्ट है?", "डॉक्टर से बात करनी है", "सब ठीक है"]
            elif "bn" in lang_code:
                msg = f"নমস্কার{clean_name}, আপনার রেকর্ডে নিবন্ধিত প্রেসক্রিপশনের ঔষধগুলো হলো: {med_text}। চিকিৎসকের পরামর্শ অনুযায়ী নিয়মিত সেবন করুন।"
                options = ["ঔষধের সময়সূচী", "কোনো পার্শ্বপ্রতিক্রিয়া আছে কি?", "ডাক্তার দেখাতে চাই", "সব ঠিক আছে"]
            else:
                msg = f"Hello{clean_name}, according to your clinical record, your active prescribed medications are: {med_text}. Please take them as directed."
                options = ["Review medication schedule", "Any side effects?", "Consult doctor", "All clear"]

            return {
                "ai_message": msg,
                "triage_level": "STABLE",
                "danger_signs": flags,
                "suggested_options": options,
                "chief_complaint": "Prescription Review",
            }

    # Fever
    if any(k in msg_lower for k in ["fever", "জ্বর", "बुखार", "temperature", "chill", "কাঁপুনি"]):
        if "hi" in lang_code:
            msg = f"नमस्ते{clean_name}, बुखार और बदन दर्द की तकलीफ मैंने नोट कर ली है। क्या आपने थर्मामीटर से तापमान नापा है? क्या सिरदर्द या खांसी भी है?"
            options = ["101°F से अधिक है", "खांसी और बदन दर्द है", "हल्का बुखार है", "दवा ले ली है"]
        elif "bn" in lang_code:
            msg = f"নমস্কার{clean_name}, জ্বর ও গা ব্যথার বিষয়টি নোট করেছি। থার্মোমিটার দিয়ে তাপমাত্রা মেপেছেন কি? কাশি বা মাথা ব্যথা আছে?"
            options = ["১০১ ডিগ্রির বেশি জ্বর", "কাশি ও গা ব্যথা আছে", "হালকা জ্বর", "প্যারাসিটামল খেয়েছি"]
        else:
            msg = f"Hello{clean_name}, I have noted your fever and body ache. Have you checked your temperature, and are you experiencing chills or headache?"
            options = ["Temperature > 101°F", "Cough & body ache", "Mild low fever", "Took medication"]

        return {
            "ai_message": msg,
            "triage_level": "MONITOR",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Fever & Chills",
        }

    # Cough & Respiratory
    if any(k in msg_lower for k in ["cough", "কাশি", "खांसी", "throat", "গলা", "गले"]):
        if "hi" in lang_code:
            msg = f"खांसी और गले की खराश के बारे में सुना{clean_name}। क्या सांस लेने में तकलीफ हो रही है, या केवल सूखी खांसी है?"
            options = ["सांस फूल रही है", "सूखी खांसी है", "कफ आ रहा है", "रात में ज्यादा होती है"]
        elif "bn" in lang_code:
            msg = f"কাশি ও গলা ব্যথার কষ্ট বুঝতে পারছি{clean_name}। শ্বাস নিতে কি কোনো কষ্ট হচ্ছে, নাকি শুধুই শুকনো কাশি?"
            options = ["শ্বাসকষ্ট হচ্ছে", "শুকনো কাশি", "কফ বের হচ্ছে", "রাতে কাশি বেশি হয়"]
        else:
            msg = f"I hear you have cough and throat discomfort{clean_name}. Are you feeling any breathlessness, or is it a dry persistent cough?"
            options = ["Shortness of breath", "Dry cough", "Phlegm with cough", "Worse at night"]

        return {
            "ai_message": msg,
            "triage_level": "MONITOR",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Cough & Throat Discomfort",
        }

    # Abdominal / Digestion
    if any(k in msg_lower for k in ["stomach", "পেট", "पेट", "दर्द", "vomit", "বমি", "acidity", "loose motion"]):
        if "hi" in lang_code:
            msg = f"पेट दर्द और पाचन की समस्या समझ सकता हूँ{clean_name}। क्या दर्द खाना खाने के बाद बढ़ रहा है, और क्या उल्टी या दस्त है?"
            options = ["खाना खाने के बाद दर्द", "उल्टी जैसा लग रहा है", "दस्त हो रहे हैं", "हल्की मरोड़ है"]
        elif "bn" in lang_code:
            msg = f"পেটে ব্যথা ও অস্বস্তির কষ্ট বুঝতে পারছি{clean_name}। ব্যথাটি কি খাবার খাওয়ার পর বাড়ে, আর বমি বা পাতলা পায়খানা আছে কি?"
            options = ["খাওয়ার পর ব্যথা বাড়ে", "বমি বমি লাগছে", "পাতলা পায়খানা হচ্ছে", "হালকা মোচড় দিচ্ছে"]
        else:
            msg = f"I understand you have stomach pain{clean_name}. Does the ache increase after eating, and do you have nausea or loose motions?"
            options = ["Pain after meals", "Nausea sensation", "Loose motions", "Mild cramping"]

        return {
            "ai_message": msg,
            "triage_level": "STABLE",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Stomach Ache & Indigestion",
        }

    # General clinical welcome / inquiry
    if is_new:
        if "hi" in lang_code:
            msg = "नमस्ते! आरोग्यवाणी में आपका स्वागत है। आप एक नए मरीज़ हैं, इसलिए आपका कोई पिछला रिकॉर्ड नहीं है। कृपया बताएं कि आज आपको क्या शारीरिक समस्या है और यह कब से है?"
            options = ["1-2 दिनों से है", "3-5 दिनों से है", "हल्की समस्या है", "डॉक्टर से सलाह चाहिए"]
        elif "bn" in lang_code:
            msg = "নমস্কার! আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি একজন নতুন রোগী, তাই আপনার কোনো পূর্ববর্তী চিকিৎসা ইতিহাস সংরক্ষিত নেই। দয়া করে বলুন আজ আপনার কি শারীরিক অসুবিধা হচ্ছে এবং কত দিন ধরে?"
            options = ["১-২ দিন ধরে", "৩-৫ দিন ধরে", "হালকা উপসর্গ", "ডাক্তারের পরামর্শ চাই"]
        else:
            msg = "Welcome to AarogyaVaani. Since this is your first consultation with no prior medical history on file, please tell me what health concern brings you in today and when it started?"
            options = ["1-2 days", "3-5 days", "Mild symptoms", "Need doctor consultation"]
    else:
        if "hi" in lang_code:
            msg = f"नमस्ते{clean_name}, आपकी स्वास्थ्य समस्या मैंने नोट कर ली है। कृपया बताएं कि यह परेशानी कितने दिनों से है और क्या कोई अन्य लक्षण भी हैं?"
            options = ["1-2 दिनों से है", "3-5 दिनों से है", "हल्की समस्या है", "डॉक्टर से सलाह चाहिए"]
        elif "bn" in lang_code:
            msg = f"নমস্কার{clean_name}, আপনার শারীরিক সমস্যার কথা শুনলাম। এই অসুবিধাটি কত দিন ধরে এবং এর সাথে অন্য কোনো উপসর্গ আছে কি?"
            options = ["১-২ দিন ধরে", "৩-৫ দিন ধরে", "হালকা উপসর্গ", "ডাক্তারের পরামর্শ চাই"]
        else:
            msg = f"Hello{clean_name}, I have noted your health concern. How long have you had this issue, and do you have any other symptoms?"
            options = ["1-2 days", "3-5 days", "Mild symptoms", "Need doctor consultation"]

    return {
        "ai_message": msg,
        "triage_level": "STABLE",
        "danger_signs": flags,
        "suggested_options": options,
        "chief_complaint": user_message[:40] or "General Consultation",
    }


async def generate_ai_doctor_chat_turn(
    user_message: str,
    patient_context: dict[str, Any] | None = None,
    history: list[dict[str, Any]] | None = None,
    language: str = "bn-IN",
    attached_document: dict[str, Any] | None = None,
    is_voice: bool = False,
) -> dict[str, Any]:
    """
    Core AI Doctor Clinical Turn Engine with Smart Language Mirroring.
    1. Detects language of utterance (mirrors English if input is English, Hindi if Hindi, Bengali if Bengali).
    2. Evaluates clinical danger signs.
    3. Builds clinical prompt incorporating patient context and attached lab/prescription documents.
    4. Calls Gemini Vision/Text API with fallback models.
    5. Enforces strict JSON output schema and language fidelity.
    """
    key = settings.GEMINI_API_KEY
    # Smart language mirroring: inspect the user message language
    effective_lang = detect_utterance_language(user_message, language)
    lang_code = (effective_lang or language or "bn-IN").lower()

    # 0. Deterministic Continuous Safety Brake Check
    flags = evaluate_clinical_danger_signs(user_message)
    if get_triage_decision(flags) == "ESCALATE":
        emergency_msg = get_emergency_guidance(flags, lang_code)
        options = (
            ["জরুরী সেবা (১০৮)", "নিকটস্থ হাসপাতাল", "পরিবারকে জানানো"] if "bn" in lang_code else
            ["आपातकालीन सेवा (108)", "नजदीकी अस्पताल", "परिवार को सूचित करें"] if "hi" in lang_code else
            ["Call 108 Ambulance", "Nearest Hospital", "Notify Family"]
        )
        return {
            "ai_message": emergency_msg,
            "triage_level": "EMERGENCY",
            "danger_signs": flags,
            "suggested_options": options,
            "chief_complaint": "Acute Emergency / Red Flag",
        }

    patient_info = patient_context or {}
    p_details = patient_info.get("patient") if isinstance(patient_info.get("patient"), dict) else patient_info
    p_name = p_details.get("name", "Patient")
    p_age = p_details.get("age", "Unknown")
    p_gender = p_details.get("gender", "Unknown")
    p_category = p_details.get("category", "General")
    p_preg = p_details.get("pregnancy_stage") or "Not pregnant"
    p_allergies = p_details.get("allergies") or []
    p_chronic = p_details.get("chronic_conditions") or []
    is_new = bool(patient_info.get("is_new_patient")) or not p_details.get("name") or p_name in ["Patient", "New Patient"]

    # Extract verified clinical records (prescriptions, labs, radiology)
    medications = patient_info.get("active_medications") or []
    labs = patient_info.get("lab_metrics") or []
    scans = patient_info.get("diagnostic_findings") or []

    meds_section = ""
    if medications:
        meds_lines = []
        for m in medications:
            if isinstance(m, dict):
                m_name = m.get("name") or "Medication"
                m_dose = m.get("dosage") or "As directed"
                m_freq = m.get("frequency") or ""
                m_inst = m.get("instructions") or ""
                m_doc = m.get("prescribing_doctor") or "Attending Physician"
                meds_lines.append(f"  * {m_name} | Dosage: {m_dose} | Schedule: {m_freq} | Notes: {m_inst} (Prescribed by: {m_doc})")
        if meds_lines:
            meds_section = "\nVerified Active Prescriptions (Official Medical Records):\n" + "\n".join(meds_lines)

    labs_section = ""
    if labs:
        labs_lines = []
        for l in labs:
            if isinstance(l, dict):
                ltitle = l.get("title") or "Lab Report"
                tests = l.get("tests") or []
                t_str = ", ".join([f"{t.get('test_name', '')}: {t.get('result_value', '')} {t.get('unit', '')}" for t in tests if isinstance(t, dict)]) if isinstance(tests, list) else str(tests)
                labs_lines.append(f"  * {ltitle}: {t_str}")
        if labs_lines:
            labs_section = "\nVerified Pathology Lab Test Results:\n" + "\n".join(labs_lines)

    scans_section = ""
    if scans:
        scans_lines = []
        for s in scans:
            if isinstance(s, dict):
                stitle = s.get("title") or "Radiology Scan"
                imp = s.get("impression") or ""
                find = s.get("findings") or ""
                scans_lines.append(f"  * {stitle}: Impression: {imp} (Findings: {find})")
        if scans_lines:
            scans_section = "\nVerified Radiology Imaging & Scans:\n" + "\n".join(scans_lines)

    history_turns = history or []
    formatted_history = "\n".join([
        f"{t.get('role', 'user').capitalize()}: {t.get('text', '')}"
        for t in history_turns[-6:]
    ])

    lang_instruction = "Bengali (বাংলা)"
    if "hi" in lang_code:
        lang_instruction = "Hindi (हिंदी)"
    elif "en" in lang_code:
        lang_instruction = "English"

    doc_context = ""
    if attached_document:
        doc_title = attached_document.get("title") or attached_document.get("file_name") or "Medical Document"
        doc_cat = attached_document.get("category") or "Diagnostic Report"
        doc_summary = (
            attached_document.get("summary_en")
            or attached_document.get("summary_bn")
            or attached_document.get("summary")
            or attached_document.get("patient_summary", {}).get("english")
            or ""
        )
        doc_structured = attached_document.get("structured_data") or {}

        doc_context = f"""
Shared Patient Medical Document (Prescription / Lab Pathology Report):
- Document Title: {doc_title}
- Category: {doc_cat}
- Extracted Summary: {doc_summary}
- Clinical Data / Lab Values: {json.dumps(doc_structured, ensure_ascii=False) if isinstance(doc_structured, dict) else str(doc_structured)}
Please inspect these document findings in relation to the patient's query and provide empathetic guidance in {lang_instruction}.
"""

    voice_instruction = (
        "Keep the response concise (25 to 45 words), natural, and clear for voice speech synthesis."
        if is_voice
        else "Keep the response concise (under 60 words), empathetic, and easy to read on mobile."
    )

    if is_new:
        patient_profile_block = """
PATIENT STATUS: NEW PATIENT (First consultation; no database records or prior medical history exist).
- Do NOT assume any past pregnancy, age, allergies, or chronic conditions unless the patient states them.
- If this is an initial greeting/turn, welcome them warmly as a new patient and inquire about their chief complaint and onset.
- Adaptively ask baseline health details only if clinically relevant to their symptom.
- Do NOT address them by an assumed name like Mamta Debbarma. Address them simply and respectfully as the patient.
"""
    else:
        patient_profile_block = f"""
PATIENT STATUS: RETURNING PATIENT (Verified medical records exist in Supabase).
- Name: {p_name}
- Age: {p_age}, Gender: {p_gender}
- Category: {p_category}
- Pregnancy Status: {p_preg}
- Allergies: {p_allergies}
- Chronic Conditions: {p_chronic}
- Address the patient by name warmly and reference active clinical context when relevant.
"""

    prompt = f"""
You are AarogyaVaani AI Doctor Assistant, an empathetic primary healthcare AI doctor for rural and semi-urban patients in India.
You speak naturally, warmly, and responsibly like an experienced tele-health doctor.

{patient_profile_block}
{meds_section}
{labs_section}
{scans_section}
{doc_context}
Previous Dialogue:
{formatted_history}

Current Patient Message: "{user_message}"

Clinical & Anti-Hallucination Instructions:
1. Target Language: {lang_instruction}. The patient communicated in {lang_instruction}; respond STRICTLY and NATURALLY in {lang_instruction}.
2. Tone: Warm, reassuring, clinically safe, empathetic.
3. {voice_instruction}
4. Prescription Grounding: When the patient asks about their medications, dosages, timings, or prescriptions, refer strictly to the Verified Active Prescriptions listed above. Never invent medications or dosages. If an asked medicine is NOT prescribed, clarify that it is not in their records and recommend consulting their medical officer.
5. Lab & Diagnostic Grounding: When patient asks about lab values or scans, explain their official results from the records above.
6. Red Flag Detection: If patient reports severe headache in pregnancy, vaginal bleeding, acute chest pain, or severe breathlessness, mark triage_level as "EMERGENCY" and recommend visiting nearest PHC/Hospital immediately.
7. Provide 3 to 4 short, relevant follow-up options for the patient to easily select or say in {lang_instruction}.
8. Return ONLY valid JSON matching this schema:
{{
  "ai_message": "Spoken/text response string in {lang_instruction}",
  "triage_level": "STABLE | MONITOR | EMERGENCY",
  "danger_signs": ["list of detected red flags if any"],
  "suggested_options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "chief_complaint": "Extracted primary health issue"
}}
"""

    if key:
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600},
        }

        for model in settings.GEMINI_FALLBACK_MODELS:
            url = GEMINI_API_URL_TEMPLATE.format(model=model, key=key)
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and candidates[0].get("content", {}).get("parts"):
                            raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                            clean_text = raw_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                            parsed = json.loads(clean_text)
                            if "ai_message" in parsed:
                                # Validate danger signs from heuristic scanner too
                                heuristic_flags = evaluate_clinical_danger_signs(user_message)
                                if heuristic_flags and not parsed.get("danger_signs"):
                                    parsed["danger_signs"] = heuristic_flags
                                    if any(f["severity"] in ["EMERGENCY", "CRITICAL"] for f in heuristic_flags):
                                        parsed["triage_level"] = "EMERGENCY"
                                return parsed
            except Exception as e:
                logger.warning(f"[GEMINI_AI_DOCTOR_FAIL] Model {model} error: {e}")
                continue

    # Fallback to local heuristic engine
    return _build_clinical_fallback_response(
        user_message=user_message,
        lang_code=lang_code,
        patient_name=p_name,
        patient_context=patient_context,
        attached_document=attached_document,
        is_voice=is_voice,
    )
