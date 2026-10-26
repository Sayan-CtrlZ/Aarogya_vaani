"""AI Doctor Router: Real-time Multi-lingual Voice & Chat Clinical Consultations with Supabase Persistence."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.supabase_client import (
    insert_consultation,
    update_consultation,
    get_consultation_by_id,
    get_patient_dossier,
    get_medical_record_by_id,
)
from app.services.ai_doctor_service import (
    generate_ai_doctor_chat_turn,
    evaluate_clinical_danger_signs,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Doctor Clinical Services"])


# ==============================================================================
# Request & Response Schemas
# ==============================================================================

class AIDoctorTurnRequest(BaseModel):
    consultation_id: str | None = None
    patient_id: str = Field(default="NEW_PATIENT", description="Patient Reference or ID")
    user_name: str | None = Field(default=None, description="Patient full name")
    user_message: str = Field(description="Patient utterance or typed message")
    language: str = Field(default="bn-IN", description="Language code: 'bn-IN', 'hi-IN', or 'en-IN'")
    history: list[dict[str, Any]] = Field(default_factory=list, description="Recent conversation turns")
    attached_document: dict[str, Any] | None = Field(default=None, description="Lab report or prescription object")


class AIDocumentQueryRequest(BaseModel):
    consultation_id: str | None = None
    patient_id: str = Field(default="NEW_PATIENT", description="Patient Reference or ID")
    user_name: str | None = Field(default=None, description="Patient full name")
    document_id: str | None = Field(default=None, description="Medical record ID in Supabase")
    query: str = Field(description="Question about the lab report or prescription")
    language: str = Field(default="bn-IN", description="Language code: 'bn-IN', 'hi-IN', or 'en-IN'")
    history: list[dict[str, Any]] = Field(default_factory=list)


class AIDoctorTurnResponse(BaseModel):
    consultation_id: str
    user_name: str | None = None
    ai_message: str
    language: str
    triage_level: str
    danger_signs: list[Any] = Field(default_factory=list)
    suggested_options: list[str] = Field(default_factory=list)
    clinical_questions: list[str] = Field(default_factory=list)
    chief_complaint: str = "General Consultation"
    request_document: bool = False
    timestamp: str
    display_time: str


class AIConsultationSaveRequest(BaseModel):
    id: str | None = None
    consultation_id: str | None = None
    patient_id: str = Field(default="NEW_PATIENT", description="Patient Reference or ID")
    user_name: str | None = Field(default=None, description="Patient Full Name")
    started_at: str | None = None
    ended_at: str | None = None
    duration_seconds: int = 0
    language_used: str = "bn-IN"
    chief_complaint: str | None = None
    symptoms_timeline: str | None = None
    transcript: Any = Field(default_factory=list)
    turns: Any = Field(default_factory=list)
    danger_signs: Any = Field(default_factory=list)
    triage_level: str = "STABLE"
    clinical_summary: str | None = None


# ==============================================================================
# Helper for Supabase Persistence
# ==============================================================================

def _persist_turn_to_supabase(
    consultation_id: str | None,
    patient_id: str,
    user_name: str,
    user_message: str,
    ai_message: str,
    language: str,
    triage_level: str,
    danger_signs: list[Any],
    suggested_options: list[str],
    chief_complaint: str,
    attached_document: dict[str, Any] | None = None,
) -> str:
    """Save or update conversation turn in Supabase consultations table with user_name."""
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    display_time = datetime.now().strftime("%I:%M %p")

    # Format danger signs cleanly
    formatted_danger = []
    for d in danger_signs:
        if isinstance(d, str):
            formatted_danger.append({"alert": d, "severity": triage_level})
        elif isinstance(d, dict):
            formatted_danger.append(d)

    user_entry = {
        "role": "user",
        "text": user_message,
        "timestamp": now_iso,
        "display_time": display_time,
    }
    if attached_document:
        user_entry["attached_document"] = {
            "id": attached_document.get("id"),
            "title": attached_document.get("title") or attached_document.get("file_name"),
            "category": attached_document.get("category"),
        }

    ai_entry = {
        "role": "agent",
        "text": ai_message,
        "timestamp": now_iso,
        "display_time": display_time,
        "options": suggested_options,
    }

    existing = None
    if consultation_id:
        try:
            existing = get_consultation_by_id(consultation_id)
        except Exception:
            existing = None

    if existing:
        transcript = existing.get("transcript") or []
        if isinstance(transcript, list):
            transcript.extend([user_entry, ai_entry])
        else:
            transcript = [user_entry, ai_entry]

        combined_danger = list(existing.get("danger_signs") or [])
        combined_danger.extend(formatted_danger)

        effective_triage = triage_level
        if existing.get("triage_level") == "EMERGENCY" or triage_level == "EMERGENCY":
            effective_triage = "EMERGENCY"
        elif existing.get("triage_level") == "MONITOR" or triage_level == "MONITOR":
            effective_triage = "MONITOR"

        updates = {
            "user_name": user_name,
            "ended_at": now_iso,
            "transcript": transcript,
            "danger_signs": combined_danger,
            "triage_level": effective_triage,
            "clinical_summary": f"Active AI Consultation with {user_name}: {chief_complaint}. Total turns: {len(transcript)}.",
        }
        try:
            update_consultation(consultation_id, updates)
        except Exception as e:
            logger.warning(f"[AI_CONSULTATION_UPDATE_WARN] {e}")
        return consultation_id
    else:
        new_id = consultation_id or f"con_{uuid.uuid4().hex[:10]}"
        new_record = {
            "id": new_id,
            "patient_id": patient_id,
            "user_name": user_name,
            "started_at": now_iso,
            "ended_at": now_iso,
            "duration_seconds": 20,
            "language_used": language,
            "chief_complaint": chief_complaint,
            "symptoms_timeline": "Acute presentation",
            "transcript": [user_entry, ai_entry],
            "danger_signs": formatted_danger,
            "triage_level": triage_level,
            "clinical_summary": f"AI Consultation with {user_name} for {chief_complaint} ({language}).",
            "doctor_status": "PENDING",
            "doctor_notes": None,
            "doctor_prescription": None,
        }
        try:
            insert_consultation(new_record)
        except Exception as e:
            logger.warning(f"[AI_CONSULTATION_INSERT_WARN] {e}")
        return new_id


# ==============================================================================
# Endpoints
# ==============================================================================

@router.post(
    "/chat",
    response_model=AIDoctorTurnResponse,
    summary="AI Doctor Text Chat Turn with Gemini & Supabase Persistence",
)
async def ai_doctor_chat_endpoint(body: AIDoctorTurnRequest):
    """
    ChatGPT-style Text Consultation:
    1. Loads patient clinical background from Supabase.
    2. Calls Gemini clinical assistant with patient context, multi-lingual support, and attached documents.
    3. Persists conversation turn in real-time to Supabase table 'consultations' with user_name.
    4. Returns AI message, triage classification, and suggested response options.
    """
    patient_ref = body.patient_id or "NEW_PATIENT"
    now_iso = datetime.now(timezone.utc).isoformat()
    display_time = datetime.now().strftime("%I:%M %p")

    # Load patient context
    is_new = patient_ref == "NEW_PATIENT" or patient_ref.startswith("NEW_")
    dossier = None
    patient_info = {}
    if not is_new:
        try:
            dossier = get_patient_dossier(patient_ref)
            patient_info = dossier.get("patient") or {}
            if dossier.get("is_new_patient"):
                is_new = True
        except Exception:
            patient_info = {}
            is_new = True
    else:
        patient_info = {"is_new_patient": True, "name": body.user_name or "New Patient"}

    user_name = body.user_name or patient_info.get("name") or ("New Patient" if is_new else "Patient")
    if is_new and not patient_info.get("name"):
        patient_info["name"] = user_name

    # Invoke Gemini AI Doctor Service with full clinical records (prescriptions, labs, radiology)
    ai_turn = await generate_ai_doctor_chat_turn(
        user_message=body.user_message,
        patient_context=dossier if dossier else patient_info,
        history=body.history,
        language=body.language,
        attached_document=body.attached_document,
        is_voice=False,
    )

    ai_msg = ai_turn.get("ai_message", "I understand your concern. Please consult your medical officer.")
    triage_lvl = ai_turn.get("triage_level", "STABLE")
    danger_signs = ai_turn.get("danger_signs", [])
    suggested_opts = ai_turn.get("suggested_options", [])
    complaint = ai_turn.get("chief_complaint") or body.user_message[:50]

    # Save to Supabase
    saved_con_id = _persist_turn_to_supabase(
        consultation_id=body.consultation_id,
        patient_id=patient_ref,
        user_name=user_name,
        user_message=body.user_message,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        chief_complaint=complaint,
        attached_document=body.attached_document,
    )

    return AIDoctorTurnResponse(
        consultation_id=saved_con_id,
        user_name=user_name,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        clinical_questions=ai_turn.get("clinical_questions", []),
        chief_complaint=complaint,
        request_document=bool(ai_turn.get("request_document", False)),
        timestamp=now_iso,
        display_time=display_time,
    )


@router.post(
    "/voice",
    response_model=AIDoctorTurnResponse,
    summary="AI Doctor Live Voice Turn with Speech-Paced Gemini Output & Supabase Persistence",
)
async def ai_doctor_voice_endpoint(body: AIDoctorTurnRequest):
    """
    Live Voice Agent Speech Consultation:
    1. Optimized for spoken voice interaction (concise, natural pacing).
    2. Incorporates attached lab reports / prescriptions.
    3. Persists voice turn in real-time to Supabase table 'consultations' with user_name.
    4. Returns speech text, red flags, and triage level.
    """
    patient_ref = body.patient_id or "NEW_PATIENT"
    now_iso = datetime.now(timezone.utc).isoformat()
    display_time = datetime.now().strftime("%I:%M %p")

    # Load patient context
    is_new = patient_ref == "NEW_PATIENT" or patient_ref.startswith("NEW_")
    dossier = None
    patient_info = {}
    if not is_new:
        try:
            dossier = get_patient_dossier(patient_ref)
            patient_info = dossier.get("patient") or {}
            if dossier.get("is_new_patient"):
                is_new = True
        except Exception:
            patient_info = {}
            is_new = True
    else:
        patient_info = {"is_new_patient": True, "name": body.user_name or "New Patient"}

    user_name = body.user_name or patient_info.get("name") or ("New Patient" if is_new else "Patient")
    if is_new and not patient_info.get("name"):
        patient_info["name"] = user_name

    # Invoke Gemini AI Doctor Service with voice tuning and clinical records
    ai_turn = await generate_ai_doctor_chat_turn(
        user_message=body.user_message,
        patient_context=dossier if dossier else patient_info,
        history=body.history,
        language=body.language,
        attached_document=body.attached_document,
        is_voice=True,
    )

    ai_msg = ai_turn.get("ai_message", "I hear your concern. Please visit your healthcare center.")
    triage_lvl = ai_turn.get("triage_level", "STABLE")
    danger_signs = ai_turn.get("danger_signs", [])
    suggested_opts = ai_turn.get("suggested_options", [])
    complaint = ai_turn.get("chief_complaint") or body.user_message[:50]

    # Save to Supabase
    saved_con_id = _persist_turn_to_supabase(
        consultation_id=body.consultation_id,
        patient_id=patient_ref,
        user_name=user_name,
        user_message=body.user_message,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        chief_complaint=complaint,
        attached_document=body.attached_document,
    )

    return AIDoctorTurnResponse(
        consultation_id=saved_con_id,
        user_name=user_name,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        clinical_questions=ai_turn.get("clinical_questions", []),
        chief_complaint=complaint,
        request_document=bool(ai_turn.get("request_document", False)),
        timestamp=now_iso,
        display_time=display_time,
    )


@router.post(
    "/document-query",
    response_model=AIDoctorTurnResponse,
    summary="Ask AI Questions about Lab Reports or Prescriptions with Supabase Persistence",
)
async def ai_doctor_document_query_endpoint(body: AIDocumentQueryRequest):
    """
    Lab Report & Prescription Interactive Inquiry:
    1. Loads the specified medical record from Supabase.
    2. Passes lab values and clinical summary to Gemini.
    3. Explains findings in the patient's language.
    4. Persists the Q&A turn to Supabase table 'consultations'.
    """
    patient_ref = body.patient_id or "NEW_PATIENT"
    now_iso = datetime.now(timezone.utc).isoformat()
    display_time = datetime.now().strftime("%I:%M %p")

    attached_doc = None
    if body.document_id:
        try:
            attached_doc = get_medical_record_by_id(body.document_id)
        except Exception:
            attached_doc = None

    # Load patient context
    is_new = patient_ref == "NEW_PATIENT" or patient_ref.startswith("NEW_")
    dossier = None
    patient_info = {}
    if not is_new:
        try:
            dossier = get_patient_dossier(patient_ref)
            patient_info = dossier.get("patient") or {}
            if dossier.get("is_new_patient"):
                is_new = True
        except Exception:
            patient_info = {}
            is_new = True
    else:
        patient_info = {"is_new_patient": True, "name": body.user_name or "New Patient"}

    user_name = body.user_name or patient_info.get("name") or ("New Patient" if is_new else "Patient")
    if is_new and not patient_info.get("name"):
        patient_info["name"] = user_name

    ai_turn = await generate_ai_doctor_chat_turn(
        user_message=body.query,
        patient_context=dossier if dossier else patient_info,
        history=body.history,
        language=body.language,
        attached_document=attached_doc,
        is_voice=False,
    )

    ai_msg = ai_turn.get("ai_message", "Document analyzed. Please discuss with your doctor.")
    triage_lvl = ai_turn.get("triage_level", "STABLE")
    danger_signs = ai_turn.get("danger_signs", [])
    suggested_opts = ai_turn.get("suggested_options", [])
    complaint = ai_turn.get("chief_complaint") or f"Inquiry on {attached_doc.get('title') if attached_doc else 'Report'}"

    saved_con_id = _persist_turn_to_supabase(
        consultation_id=body.consultation_id,
        patient_id=patient_ref,
        user_name=user_name,
        user_message=body.query,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        chief_complaint=complaint,
        attached_document=attached_doc,
    )

    return AIDoctorTurnResponse(
        consultation_id=saved_con_id,
        user_name=user_name,
        ai_message=ai_msg,
        language=body.language,
        triage_level=triage_lvl,
        danger_signs=danger_signs,
        suggested_options=suggested_opts,
        clinical_questions=ai_turn.get("clinical_questions", []),
        chief_complaint=complaint,
        timestamp=now_iso,
        display_time=display_time,
    )


@router.post(
    "/consultation/save",
    status_code=status.HTTP_201_CREATED,
    summary="Save Completed AI Consultation Session to Supabase with User Name",
)
async def save_ai_consultation_endpoint(body: AIConsultationSaveRequest):
    """Save finished consultation transcript and triage assessment to Supabase."""
    consultation_id = body.consultation_id or body.id or f"con_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    raw_transcript = body.transcript or body.turns or []
    flags: list[Any] = list(body.danger_signs) if isinstance(body.danger_signs, list) else []
    if not flags and raw_transcript:
        if isinstance(raw_transcript, list):
            for t in raw_transcript:
                if isinstance(t, dict):
                    msg_text = t.get("text") or t.get("message") or t.get("content") or ""
                    if t.get("role") in ["user", "patient"] or t.get("speaker") in ["user", "patient"]:
                        flags.extend(evaluate_clinical_danger_signs(msg_text))
                elif isinstance(t, str):
                    flags.extend(evaluate_clinical_danger_signs(t))
        elif isinstance(raw_transcript, str):
            flags.extend(evaluate_clinical_danger_signs(raw_transcript))

    triage = body.triage_level
    if any(isinstance(f, dict) and f.get("severity") in ["EMERGENCY", "CRITICAL"] for f in flags):
        triage = "EMERGENCY"
    elif any(isinstance(f, dict) and f.get("severity") in ["HIGH", "MONITOR"] for f in flags) and triage == "STABLE":
        triage = "MONITOR"

    record = {
        "id": consultation_id,
        "patient_id": body.patient_id,
        "user_name": body.user_name,
        "started_at": body.started_at or now_iso,
        "ended_at": body.ended_at or now_iso,
        "duration_seconds": body.duration_seconds,
        "language_used": body.language_used,
        "chief_complaint": body.chief_complaint,
        "symptoms_timeline": body.symptoms_timeline,
        "transcript": raw_transcript,
        "danger_signs": flags,
        "triage_level": triage,
        "clinical_summary": body.clinical_summary or f"AI Consultation with {body.user_name or 'Patient'}. Turns: {len(raw_transcript)}.",
        "doctor_status": "PENDING",
        "doctor_notes": None,
        "doctor_prescription": None,
    }

    try:
        existing = get_consultation_by_id(consultation_id)
        if existing:
            saved = update_consultation(consultation_id, record)
            return saved or record
        saved = insert_consultation(record)
        return saved or record
    except Exception as e:
        # If insert failed due to duplicate key, attempt update
        try:
            saved = update_consultation(consultation_id, record)
            return saved or record
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist consultation to Supabase: {str(e)}",
            )
