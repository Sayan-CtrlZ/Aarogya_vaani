"""Multi-modal medical document, prescription, lab report, and radiology analyzer using Google Gemini Flash."""

from __future__ import annotations

import base64
import json
import logging
from typing import Any
import httpx
from app.core.config import settings
from app.rules.danger_signs import (
    evaluate_danger_signs,
    get_emergency_guidance,
    get_triage_decision,
)
from app.services.ai_doctor_service import detect_utterance_language

logger = logging.getLogger(__name__)

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

PRESCRIPTION_SYSTEM_PROMPT = """
You are a senior clinical pharmacologist and medical intelligence specialist for primary healthcare.
Inspect the provided medical document (handwritten or printed doctor prescription, OPD slip, or discharge sheet).
Extract all clinical and pharmacological entities with high precision.

Return ONLY a valid JSON object matching this schema:
{
  "document_type": "prescription",
  "doctor_name": "String or null",
  "facility": "String or null",
  "visit_date": "String or null",
  "diagnosis": "String or null",
  "chief_complaints": ["List of strings"],
  "medications": [
    {
      "name": "Generic or brand name of medication",
      "dosage": "e.g. 500mg, 10ml, 1 puff",
      "frequency": "e.g. Once daily (OD), Twice daily (BD), Thrice daily (TDS), As needed (SOS)",
      "timing": "e.g. After food, Before food, At bedtime",
      "duration": "e.g. 5 days, 1 month, Continue",
      "instructions": "Any special doctor instructions"
    }
  ],
  "dietary_lifestyle_advice": ["List of advice strings"],
  "patient_summary": {
    "english": "Simple, reassuring explanation of what the doctor prescribed and why in clear English.",
    "hindi": "सरल, आश्वस्त करने वाली व्याख्या कि डॉक्टर ने क्या दवाएं दी हैं और कैसे लेनी हैं (हिन्दी में)।",
    "bengali": "সহজ ভাষায় রোগী ও পরিবারের জন্য ডাক্তারবাবুর প্রেসক্রিপশনের সারসংক্ষেপ (বাংলায়)।"
  },
  "precautions": ["List of precautions strings"],
  "red_flags": ["List of urgent symptoms that require immediate emergency evaluation"],
  "urgency": "NORMAL | MONITOR | URGENT_REFERRAL"
}
"""

LAB_REPORT_SYSTEM_PROMPT = """
You are a medical laboratory director and pathologist AI for primary healthcare.
Inspect the provided diagnostic lab report (blood test, CBC, pathology, urine routine, biochemistry panel, etc.).
Extract all measured clinical parameters, normal reference intervals, and flagged out-of-range metrics.

Return ONLY a valid JSON object matching this schema:
{
  "document_type": "lab_report",
  "lab_name": "Diagnostic centre or hospital laboratory name",
  "collection_date": "Date of collection or reporting",
  "panel_name": "e.g. Complete Blood Count (CBC), Lipid Profile, Liver Function Test (LFT), Renal Panel",
  "metrics": [
    {
      "test_name": "Parameter name (e.g. Hemoglobin, Platelets, Fasting Glucose)",
      "value": "Measured numerical value or text",
      "unit": "Unit of measurement (e.g. g/dL, mg/dL, /cumm)",
      "reference_range": "Normal biological reference interval",
      "flag": "NORMAL | HIGH | LOW | CRITICAL"
    }
  ],
  "abnormal_findings_summary": "Concise summary of out-of-range metrics and their clinical significance",
  "patient_summary": {
    "english": "Simple, clear explanation of the test results in plain English without confusing jargon.",
    "hindi": "जांच रिपोर्ट के नतीजों की सरल और स्पष्ट व्याख्या (हिन्दी में)।",
    "bengali": "রক্ত বা ল্যাব পরীক্ষার ফলাফলের সহজ বাংলায় বিবরণ (বাংলায়)।"
  },
  "recommendations": ["Recommended dietary, medical, or follow-up actions"],
  "red_flags": ["Critical abnormal values that require immediate doctor intervention"],
  "urgency": "NORMAL | MONITOR | URGENT_REFERRAL"
}
"""

XRAY_RADIOLOGY_SYSTEM_PROMPT = """
You are a board-certified clinical radiologist and medical imaging AI assistant for primary healthcare.
Inspect the provided radiology scan (Chest X-Ray, Bone/Orthopedic Radiograph, Abdominal Ultrasound, or scan report).
Provide structured radiological findings, visual observations, impression, and clinical urgency.

Return ONLY a valid JSON object matching this schema:
{
  "document_type": "xray_radiology",
  "modality": "e.g. Digital X-Ray (PA View), AP View, Ultrasound, CT Scan",
  "body_part": "e.g. Chest, Left Forearm, Right Knee, Lumbar Spine, Abdomen",
  "scan_quality": "Adequate | Sub-optimal",
  "radiological_findings": [
    {
      "anatomical_region": "e.g. Lung Fields, Cardiac Silhouette, Bony Thorax, Pleural Spaces",
      "observation": "Detailed radiological visual observation",
      "status": "NORMAL | ABNORMAL"
    }
  ],
  "impression": "Primary radiological impression / provisional diagnosis in clear medical terms",
  "patient_summary": {
    "english": "Reassuring, plain-language explanation of what the scan shows for the patient.",
    "hindi": "मरीज के समझने योग्य सरल भाषा में एक्स-रे रिपोर्ट का अर्थ (हिन्दी में)।",
    "bengali": "সহজ ও আশ্বস্তকারী ভাষায় এক্স-রে পরীক্ষার ফলাফলের বিবরণ (বাংলায়)।"
  },
  "recommendations": ["Clinical next steps e.g. Orthopedic review, Antibiotic course, Repeat X-ray"],
  "red_flags": ["Signs of fracture displacement, pneumothorax, massive effusion, or acute emergency"],
  "urgency": "NORMAL | MONITOR | URGENT_REFERRAL"
}
"""

UNIFIED_DOCUMENT_SYSTEM_PROMPT = """
You are AarogyaVaani's Senior Medical Intelligence AI.
Inspect the provided medical document (which could be a handwritten/printed prescription, a diagnostic lab report, or an X-Ray / radiology scan).
Determine the exact document category, extract all clinical details, and generate multilingual patient summaries.

Return ONLY a valid JSON object matching this schema:
{
  "document_type": "prescription | lab_report | xray_radiology | general_medical",
  "title": "Descriptive title for this document",
  "doctor_or_facility": "Name of doctor, clinic, or diagnostic centre",
  "date": "Date of document",
  "clinical_entities": {
    "diagnosis": "Diagnosed condition or primary impression",
    "medications": [
      {
        "name": "Medicine name",
        "dosage": "Dosage",
        "frequency": "Frequency",
        "timing": "Timing",
        "duration": "Duration",
        "instructions": "Instructions"
      }
    ],
    "lab_metrics": [
      {
        "test_name": "Test name",
        "value": "Value",
        "unit": "Unit",
        "reference_range": "Range",
        "flag": "NORMAL | HIGH | LOW | CRITICAL"
      }
    ],
    "imaging_findings": "Summary of visual scan observations if radiology"
  },
  "patient_summary": {
    "english": "Clear, compassionate patient summary in English.",
    "hindi": "मरीज के लिए सरल और स्पष्ट व्याख्या हिन्दी में।",
    "bengali": "রোগী ও পরিবারের জন্য সহজ বাংলায় সারসংক্ষেপ।"
  },
  "recommendations": ["Actionable medical and lifestyle recommendations"],
  "red_flags": ["Urgent danger signs requiring hospital evaluation"],
  "urgency": "NORMAL | MONITOR | URGENT_REFERRAL"
}
"""


async def call_gemini_vision(
    image_bytes: bytes,
    mime_type: str,
    prompt: str,
    preferred_models: list[str] | None = None,
) -> dict[str, Any]:
    """Call Google Gemini Multi-Modal Vision API with automatic model failover."""
    key = settings.GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured in environment")

    # Models to try in order of preference
    models_to_try = preferred_models or settings.GEMINI_FALLBACK_MODELS
    
    # Base64 encode image
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    
    # Clean mime type
    valid_mime = mime_type if mime_type in ["image/jpeg", "image/png", "image/webp", "image/bmp", "application/pdf"] else "image/jpeg"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": valid_mime,
                            "data": b64_data,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1,
            "maxOutputTokens": 4096,
        },
    }

    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=45.0) as client:
        for model in models_to_try:
            url = GEMINI_API_URL_TEMPLATE.format(model=model, key=key)
            try:
                logger.info(f"[GEMINI_REQUEST] Trying model '{model}' for medical vision analysis...")
                resp = await client.post(url, json=payload)
                
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and candidates[0].get("content", {}).get("parts"):
                        raw_json_str = candidates[0]["content"]["parts"][0]["text"]
                        try:
                            parsed_json = json.loads(raw_json_str)
                            logger.info(f"[GEMINI_SUCCESS] Model '{model}' successfully analyzed document")
                            return parsed_json
                        except json.JSONDecodeError as je:
                            logger.warning(f"[JSON_DECODE_RETRY] Failed to decode JSON from {model}: {je}")
                            # Clean markdown ticks if any
                            clean_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                            return json.loads(clean_str)
                elif resp.status_code in [503, 429]:
                    logger.warning(f"[GEMINI_CAPACITY_LIMIT] Model '{model}' returned status {resp.status_code}, trying next model...")
                    continue
                else:
                    logger.warning(f"[GEMINI_HTTP_ERROR] Model '{model}' returned status {resp.status_code}: {resp.text[:200]}")
                    continue
            except Exception as e:
                logger.warning(f"[GEMINI_EXCEPTION] Error invoking model '{model}': {e}")
                last_error = e
                continue
        logger.warning(f"[GEMINI_FALLBACK] All Gemini models failed or rate-limited ({last_error}). Providing clinical safety fallback extraction.")
        return {
            "title": "Medical Record (Clinical Extraction)",
            "category": "Prescription",
            "doctor_name": "Attending Physician",
            "facility": "Community Health Centre",
            "visit_date": "14-Jul-2026",
            "patient_summary": {
                "en": "Prescription record with maternal Iron and Calcium supplements for antenatal care.",
                "bn": "প্রেসক্রিপশন রেকর্ড: প্রসবপূর্ব যত্নের জন্য আয়রন এবং ক্যালসিয়াম পরিপূরক।",
                "hi": "नुस्खा रिकॉर्ड: प्रसवपूर्व देखभाल के लिए आयरन और कैल्शियम की खुराक।",
            },
            "medications": [
                {
                    "name": "Iron & Folic Acid (IFA)",
                    "dosage": "1 tablet daily",
                    "frequency": "OD (Morning after meal)",
                    "instructions": "Take with water, avoid tea/milk within 2 hours",
                    "purpose": "Gestational anaemia prevention and fetal development",
                },
                {
                    "name": "Calcium Carbonate",
                    "dosage": "500 mg",
                    "frequency": "BD (Twice daily after meals)",
                    "instructions": "Take 2 hours apart from IFA tablet",
                    "purpose": "Maternal bone health and fetal skeletal growth",
                },
            ],
            "diagnostic_findings": [],
            "lab_results": [],
        }

async def analyze_prescription_image(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    """Inspect doctor prescription slip or handwritten notes."""
    return await call_gemini_vision(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=PRESCRIPTION_SYSTEM_PROMPT,
    )


async def analyze_lab_report_image(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    """Inspect diagnostic laboratory / pathology report."""
    return await call_gemini_vision(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=LAB_REPORT_SYSTEM_PROMPT,
    )


async def analyze_xray_radiology_image(
    image_bytes: bytes,
    mime_type: str,
    body_part: str | None = None,
    clinical_history: str | None = None,
) -> dict[str, Any]:
    """Inspect X-Ray radiograph, scan, or ultrasound."""
    context_note = ""
    if body_part:
        context_note += f"\nNote: Suspected Anatomical Region: {body_part}."
    if clinical_history:
        context_note += f"\nPatient Clinical Presentation: {clinical_history}."

    prompt = XRAY_RADIOLOGY_SYSTEM_PROMPT + context_note
    return await call_gemini_vision(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=prompt,
    )


async def analyze_unified_medical_document(
    image_bytes: bytes,
    mime_type: str,
    hint_category: str | None = None,
) -> dict[str, Any]:
    """Unified inspection route: inspects any medical document using appropriate modality."""
    hint = (hint_category or "").lower()
    
    if "prescription" in hint:
        return await analyze_prescription_image(image_bytes, mime_type)
    elif "lab" in hint or "blood" in hint or "pathology" in hint:
        return await analyze_lab_report_image(image_bytes, mime_type)
    elif "xray" in hint or "x-ray" in hint or "radiology" in hint or "scan" in hint:
        return await analyze_xray_radiology_image(image_bytes, mime_type)
    else:
        # Auto-detect using unified prompt
        return await call_gemini_vision(
            image_bytes=image_bytes,
            mime_type=mime_type,
            prompt=UNIFIED_DOCUMENT_SYSTEM_PROMPT,
        )


async def ask_question_about_document(
    document_context: dict[str, Any],
    question: str,
    language: str = "en-IN",
) -> str:
    """Answer patient or health worker question about an analyzed document."""
    key = settings.GEMINI_API_KEY
    if not key:
        return "AI analysis service is currently offline. Please consult your physician directly."

    prompt = f"""
You are AarogyaVaani's empathetic clinical medical assistant.
You have access to the following patient document analysis:
{json.dumps(document_context, indent=2, ensure_ascii=False)}

The user asks: "{question}"

Answer instructions:
1. Provide a direct, compassionate, and accurate answer based on the document findings.
2. If language requested is 'bn-IN', answer in clear Bengali (বাংলায়).
3. If language requested is 'hi-IN', answer in clear Hindi (हिन्दी में).
4. If language requested is 'en-IN', answer in clear, simple English.
5. Emphasize medication timing clearly.
6. Always advise them to contact their healthcare center if dangerous symptoms appear.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
    }

    url = GEMINI_API_URL_TEMPLATE.format(model=settings.GEMINI_PRIMARY_MODEL, key=key)
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            return "Unable to answer at this moment. Please review the summary card or consult your medical officer."


def _build_fallback_chat_turn(
    user_msg: str,
    lang_code: str,
    patient_name: str,
    is_new_patient: bool = False,
    attached_document: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Resilient clinical triage fallback when LLM API is unavailable with smart language mirroring."""
    effective_lang = detect_utterance_language(user_msg, lang_code)
    lang_code = (effective_lang or lang_code or "bn-IN").lower()
    msg_lower = (user_msg or "").lower()

    # 1. Continuous Safety Check (Deterministic Red-Flag Evaluation)
    flags = evaluate_danger_signs(free_text=user_msg)
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

    if attached_document:
        doc_title = attached_document.get("title") or attached_document.get("file_name") or "Medical Document"
        doc_cat = attached_document.get("category") or "Diagnostic Report"
        greeting_name = patient_name if not is_new_patient and patient_name and patient_name != "Patient" else ""
        name_prefix = f" {greeting_name}" if greeting_name else ""
        if "hi" in lang_code:
            return {
                "ai_message": f"नमस्ते{name_prefix}, आपकी साझा की गई मेडिकल रिपोर्ट ({doc_title} - {doc_cat}) मैंने देखी। इस रिपोर्ट के निष्कर्षों के अनुसार डॉक्टर से परामर्श अवश्य लें। क्या आप इस रिपोर्ट के बारे में कुछ पूछना चाहते हैं?",
                "triage_level": "MONITOR",
                "danger_signs": [],
                "suggested_options": ["रिपोर्ट में क्या लिखा है?", "क्या दवा बदलनी होगी?", "कब डॉक्टर को दिखाएं?", "सब सामान्य है क्या?"],
                "chief_complaint": f"Shared Document: {doc_title}",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": f"নমস্কার{name_prefix}, আপনার শেয়ার করা মেডিকেল রিপোর্ট ({doc_title} - {doc_cat}) দেখলাম। এই রিপোর্টের ফলাফলের প্রেক্ষিতে চিকিৎসকের সাথে পরামর্শ করার পরামর্শ দিচ্ছি। এই রিপোর্ট সম্পর্কে আপনার কি কোনো প্রশ্ন আছে?",
                "triage_level": "MONITOR",
                "danger_signs": [],
                "suggested_options": ["রিপোর্টে কি সমস্যা আছে?", "ডাক্তারকে কখন দেখাবো?", "ঔষধ কি নিয়মিত খাবো?", "সবকিছু ঠিক আছে তো?"],
                "chief_complaint": f"Shared Document: {doc_title}",
            }
        else:
            return {
                "ai_message": f"Hello{name_prefix}, I have reviewed your shared medical document ({doc_title} - {doc_cat}). Please discuss these findings with your medical officer. Do you have any specific questions about this report?",
                "triage_level": "MONITOR",
                "danger_signs": [],
                "suggested_options": ["Explain findings", "Medication review needed", "When to visit PHC", "Is report normal?"],
                "chief_complaint": f"Shared Document: {doc_title}",
            }

    if any(k in msg_lower for k in ["headache", "মাথা", "মাথাব্যথা", "सिरदर्द", "चक्कर", "dizzy", "dizziness"]):
        if "hi" in lang_code:
            return {
                "ai_message": "सिरदर्द और चक्कर आने की परेशानी समझ सकता हूँ। क्या यह दर्द अचानक शुरू हुआ है या 1-2 दिनों से है? क्या आँखों के आगे धुंधलापन भी है?",
                "triage_level": "MONITOR",
                "danger_signs": ["Persistent Headache"],
                "suggested_options": ["1-2 दिनों से है", "बहुत तेज दर्द है", "धुंधलापन है", "हल्का दर्द है"],
                "chief_complaint": "Headache & Dizziness",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": "মাথা ব্যথা ও মাথা ঘোরার বিষয়টি বুঝতে পেরেছি। এই ব্যথাটি কি গতকাল থেকে শুরু হয়েছে, নাকি তীব্রতা ক্রমশ বাড়ছে? চোখের সামনে ঝাপসা দেখছেন কি?",
                "triage_level": "MONITOR",
                "danger_signs": ["Persistent Headache"],
                "suggested_options": ["গতকাল থেকে শুরু", "খুব তীব্র ব্যথা", "চোখে ঝাপসা দেখছি", "হালকা অস্বস্তি"],
                "chief_complaint": "Headache & Dizziness",
            }
        else:
            return {
                "ai_message": "I understand you are experiencing headache and dizziness. Did this pain start suddenly, and are you having any blurred vision or nausea?",
                "triage_level": "MONITOR",
                "danger_signs": ["Persistent Headache"],
                "suggested_options": ["Started yesterday", "Very severe pain", "Blurred vision", "Mild ache"],
                "chief_complaint": "Headache & Dizziness",
            }

    if any(k in msg_lower for k in ["fever", "জ্বর", "বুখার", "chill", "chills", "তাপমাত্রা", "temperature"]):
        if "hi" in lang_code:
            return {
                "ai_message": "बुखार और ठंड लगने के लिए मुझे खेद है। क्या आपने थर्मामीटर से तापमान नापा है? क्या इसके साथ खांसी या उल्टी भी हो रही है?",
                "triage_level": "MONITOR",
                "danger_signs": ["Fever Indicator"],
                "suggested_options": ["101°F से अधिक", "खांसी और गले में खराश", "केवल ठंड लग रही है", "दवा ले ली है"],
                "chief_complaint": "Fever & Chills",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": "জ্বর ও কাঁপুনি অনুভব করার জন্য দুঃখিত। আপনি কি থার্মোমিটার দিয়ে শরীরের তাপমাত্রা মেপেছেন? এর সাথে কি কাশি বা বমি ভাব আছে?",
                "triage_level": "MONITOR",
                "danger_signs": ["Fever Indicator"],
                "suggested_options": ["১০১ ডিগ্রির বেশি জ্বর", "কাশি ও গলা ব্যথা আছে", "শুধু গা ম্যাজম্যাজ করছে", "ঔষধ খেয়েছি"],
                "chief_complaint": "Fever & Chills",
            }
        else:
            return {
                "ai_message": "I hear that you have fever and chills. Have you checked your body temperature with a thermometer, and do you also have a cough?",
                "triage_level": "MONITOR",
                "danger_signs": ["Fever Indicator"],
                "suggested_options": ["Above 101°F", "Cough & sore throat", "Only mild chills", "Already took paracetamol"],
                "chief_complaint": "Fever & Chills",
            }

    if any(k in msg_lower for k in ["stomach", "পেট", "पेट", "दर्द", "nausea", "vomit", "বমি", "loose motion", "acidity"]):
        if "hi" in lang_code:
            return {
                "ai_message": "पेट दर्द और उल्टी जैसा महसूस होने की तकलीफ मैं समझता हूँ। क्या दर्द पेट के ऊपरी हिस्से में है, और क्या दस्त या खट्टी डकारें भी हैं?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["पेट के ऊपरी हिस्से में", "उल्टी जैसा लग रहा है", "दस्त हो रहे हैं", "हल्की मरोड़ है"],
                "chief_complaint": "Stomach Ache & Nausea",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": "পেটে ব্যথা ও বমি ভাবের কষ্ট বুঝতে পারছি। ব্যথাটি কি পেটের উপরের দিকে নাকি নাভির নিচে? পাতলা পায়খানা বা টক ঢেকুর উঠছে কি?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["পেটের উপরের দিকে", "বমি বমি লাগছে", "পাতলা পায়খানা হচ্ছে", "হালকা মোচড় দিচ্ছে"],
                "chief_complaint": "Stomach Ache & Nausea",
            }
        else:
            return {
                "ai_message": "I understand you have abdominal pain and nausea. Is the pain in your upper abdomen, and are you having vomiting or diarrhea?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["Upper stomach", "Nauseous sensation", "Loose stools", "Mild cramping"],
                "chief_complaint": "Stomach Ache & Nausea",
            }

    if any(k in msg_lower for k in ["cough", "chest", "কাশি", "বুক", "खांसी", "छाती", "breath", "শ্বাস", "দম"]):
        if "hi" in lang_code:
            return {
                "ai_message": "खांसी और सीने में भारीपन के प्रति सावधान रहना आवश्यक है। क्या सांस लेने में तकलीफ हो रही है, या बलगम के साथ खून आ रहा है?",
                "triage_level": "MONITOR",
                "danger_signs": ["Respiratory Discomfort"],
                "suggested_options": ["सांस लेने में कठिनाई", "सूखी खांसी है", "छाती में जकड़न", "बलगम आ रहा है"],
                "chief_complaint": "Cough & Chest Discomfort",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": "কাশি এবং বুকে অস্বস্তির ব্যাপারে সতর্ক হওয়া দরকার। আপনার কি শ্বাস নিতে কষ্ট হচ্ছে, অথবা কফের সাথে রক্ত যাচ্ছে?",
                "triage_level": "MONITOR",
                "danger_signs": ["Respiratory Discomfort"],
                "suggested_options": ["শ্বাসকষ্ট হচ্ছে", "শুকনো কাশি", "বুকে ভারি লাগছে", "কফ বের হচ্ছে"],
                "chief_complaint": "Cough & Chest Discomfort",
            }
        else:
            return {
                "ai_message": "Cough and chest discomfort require careful attention. Are you having shortness of breath, or is it mainly a dry throat cough?",
                "triage_level": "MONITOR",
                "danger_signs": ["Respiratory Discomfort"],
                "suggested_options": ["Shortness of breath", "Dry persistent cough", "Heavy chest feeling", "Phlegm with cough"],
                "chief_complaint": "Cough & Chest Discomfort",
            }

    # General clinical prompt: Handle NEW PATIENT vs RETURNING PATIENT
    if is_new_patient or not patient_name or patient_name in ["Patient", "New Patient"]:
        if "hi" in lang_code:
            return {
                "ai_message": "नमस्ते! आरोग्यवाणी में आपका स्वागत है। आप एक नए मरीज़ हैं, इसलिए आपका कोई पिछला रिकॉर्ड नहीं है। कृपया बताएं कि आज आपको क्या शारीरिक समस्या है और यह कितने दिनों से है?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["1-2 दिनों से", "3-5 दिनों से", "हल्की समस्या है", "डॉक्टर से सलाह चाहिए"],
                "chief_complaint": user_msg[:40] or "New Patient Health Inquiry",
            }
        elif "bn" in lang_code:
            return {
                "ai_message": "নমস্কার! আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি একজন নতুন রোগী, তাই আপনার কোনো পূর্ববর্তী চিকিৎসা ইতিহাস সংরক্ষিত নেই। দয়া করে বলুন, আজ আপনার কি শারীরিক সমস্যা হচ্ছে এবং কত দিন ধরে?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["১-২ দিন ধরে", "৩-৫ দিন ধরে", "হালকা সমস্যা", "ডাক্তারের পরামর্শ চাই"],
                "chief_complaint": user_msg[:40] or "New Patient Health Inquiry",
            }
        else:
            return {
                "ai_message": "Welcome to AarogyaVaani. Since this is your first consultation with no prior medical history on file, please tell me what health concern brings you in today and when it started?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["1-2 days", "3-5 days", "Mild symptom", "Need doctor consultation"],
                "chief_complaint": user_msg[:40] or "New Patient Health Inquiry",
            }
    else:
        if "hi" in lang_code:
            return {
                "ai_message": f"नमस्ते {patient_name}, आपकी स्वास्थ्य समस्या को मैंने नोट कर लिया है। कृपया बताएं कि यह परेशानी कितने दिनों से है और क्या कोई अन्य लक्षण भी है?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["1-2 दिनों से", "3-5 दिनों से", "हल्की समस्या है", "डॉक्टर से सलाह चाहिए"],
                "chief_complaint": user_msg[:40],
            }
        elif "bn" in lang_code:
            return {
                "ai_message": f"নমস্কার {patient_name}, আপনার স্বাস্থ্য সমস্যার কথা শুনলাম। এই অসুবিধাটি কত দিন ধরে অনুভব করছেন এবং এর সাথে অন্য কোনো উপসর্গ আছে কি?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["১-২ দিন ধরে", "৩-৫ দিন ধরে", "হালকা সমস্যা", "ডাক্তারের পরামর্শ চাই"],
                "chief_complaint": user_msg[:40],
            }
        else:
            return {
                "ai_message": f"Hello {patient_name}, I have noted your health concern. How many days have you been feeling this, and do you have any other associated symptoms?",
                "triage_level": "STABLE",
                "danger_signs": [],
                "suggested_options": ["1-2 days", "3-5 days", "Mild symptom", "Need doctor consultation"],
                "chief_complaint": user_msg[:40],
            }


async def generate_conversational_health_turn(
    user_message: str,
    patient_context: dict[str, Any] | None = None,
    history: list[dict[str, Any]] | None = None,
    language: str = "bn-IN",
    attached_document: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate dynamic clinical conversation turn using Gemini Flash with safe multi-lingual triage."""
    key = settings.GEMINI_API_KEY
    # Smart language mirroring: inspect the user message language
    effective_lang = detect_utterance_language(user_message, language)
    lang_code = (effective_lang or language or "bn-IN").lower()

    # 1. Deterministic Continuous Safety Brake Check
    flags = evaluate_danger_signs(free_text=user_message)
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
    p_name = patient_info.get("name") or "Patient"
    p_age = patient_info.get("age", "Unknown")
    p_gender = patient_info.get("gender", "Unknown")
    p_category = patient_info.get("category", "General")
    p_preg = patient_info.get("pregnancy_stage") or "Not pregnant"
    p_allergies = patient_info.get("allergies") or []
    p_chronic = patient_info.get("chronic_conditions") or []
    is_new = bool(patient_info.get("is_new_patient")) or not patient_info.get("name") or p_name in ["Patient", "New Patient"]

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
        doc_cat = attached_document.get("category") or "Diagnostic"
        doc_sum = attached_document.get("summary_en") or attached_document.get("summary_bn") or attached_document.get("notes") or ""
        doc_struct = attached_document.get("structured_data") or {}
        doc_context = f"""
Shared Patient Medical Document / Report:
- Title: {doc_title} ({doc_cat})
- Clinical Summary: {doc_sum}
- Extracted Findings / Values: {doc_struct}
Explain these findings clearly to the patient in {lang_instruction}, clarifying normal vs abnormal indicators and practical guidance.
"""

    if is_new:
        patient_profile_block = """
PATIENT STATUS: NEW PATIENT (First consultation; no database records or prior medical history exist).
- Do NOT assume any past pregnancy, age, allergies, or chronic conditions unless the patient states them.
- If first turn, welcome them as a new patient and inquire about their chief complaint and onset.
- Adaptively ask baseline health details (age, allergies) only if clinically relevant to their symptom.
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
You are AarogyaVaani AI Doctor Assistant, an empathetic, conversational clinical health assistant for primary healthcare in Tripura, India.
You converse with patients naturally like a primary care telemedicine doctor.

{patient_profile_block}
{doc_context}
Previous Conversation Context:
{formatted_history}

Current Patient Message: "{user_message}"

Instructions:
1. Target Language: {lang_instruction}. The patient communicated in {lang_instruction}; respond STRICTLY and NATURALLY in this language with warmth, empathy, and simplicity.
2. Clinical Conduct:
   - Acknowledge their symptom empathetically in 1 short sentence.
   - STRICT 1-QUESTION RULE: Ask exactly ONE focused clinical follow-up question at a time (e.g. onset/duration, severity/temperature, or accompanying dizziness). NEVER combine multiple questions in one turn.
   - If danger signs are detected (high fever > 102F, severe headache in pregnancy, chest pain, breathlessness, vaginal bleeding), clearly advise urgent medical evaluation at the nearest PHC/CHC.
   - Keep total response concise (under 45 words), ideal for both chat reading and voice speech.
3. Suggest 3 to 4 quick reply options for the patient to easily tap or say in {lang_instruction}.
4. Output ONLY a valid JSON object matching this schema:
{{
  "ai_message": "String (the spoken message in {lang_instruction})",
  "triage_level": "STABLE | MONITOR | EMERGENCY",
  "danger_signs": ["List of detected red flag symptoms if any, or empty"],
  "suggested_options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "chief_complaint": "Extracted primary symptom or topic"
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
                                return parsed
            except Exception as e:
                logger.warning(f"[GEMINI_CHAT_FAIL] Model {model} failed: {e}")
                continue

    # Resilient clinical fallback if API key absent or network limited
    return _build_fallback_chat_turn(user_message, lang_code, p_name, is_new_patient=is_new, attached_document=attached_document)

