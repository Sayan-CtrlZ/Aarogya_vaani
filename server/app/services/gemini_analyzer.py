"""Multi-modal medical document, prescription, lab report, and radiology analyzer using Google Gemini Flash."""

from __future__ import annotations

import base64
import json
import logging
from typing import Any
import httpx
from app.core.config import settings

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
    valid_mime = mime_type if mime_type in ["image/jpeg", "image/png", "image/webp", "image/bmp"] else "image/jpeg"

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

    raise RuntimeError(f"All Gemini vision models failed or were unavailable. Last error: {last_error}")


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
