"""Clinical Orchestrator Router: Voice Consultation Persistence & WebRTC Access."""

import logging
import time
import uuid
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.supabase_client import (
    insert_consultation,
    get_patient_consultations,
    get_consultation_by_id,
    update_consultation,
    delete_consultation_by_id,
    get_patient_dossier,
)
from app.services.gemini_analyzer import generate_conversational_health_turn
from app.rules.danger_signs import (
    evaluate_danger_signs,
    get_emergency_guidance,
    get_triage_decision,
)

logger = logging.getLogger(__name__)

try:
    from livekit.api import AccessToken, VideoGrants, LiveKitAPI, CreateAgentDispatchRequest  # type: ignore[import-not-found, import-untyped]
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False


router = APIRouter(prefix="/orchestrator", tags=["Clinical Orchestrator"])


# ==============================================================================
# Pydantic Schemas for Consultations
# ==============================================================================

class SpeechTurn(BaseModel):
    role: str = Field(description="'user' or 'agent'")
    text: str = Field(description="Utterance text")
    timestamp: float | str | None = None


class ConsultationCreateRequest(BaseModel):
    id: str | None = None
    patient_id: str = Field(default="NEW_PATIENT", description="Patient Reference or UUID")
    user_name: str | None = Field(default=None, description="Patient Full Name")
    started_at: str | None = None
    ended_at: str | None = None
    duration_seconds: int = 0
    language_used: str = "bn-IN"
    chief_complaint: str | None = None
    symptoms_timeline: str | None = None
    transcript: list[dict[str, Any]] = Field(default_factory=list)
    danger_signs: list[dict[str, Any]] = Field(default_factory=list)
    triage_level: str = "STABLE"  # STABLE, MONITOR, EMERGENCY
    clinical_summary: str | None = None


class ConsultationReviewRequest(BaseModel):
    doctor_status: str = "REVIEWED"  # REVIEWED, REFERRED, PENDING
    doctor_notes: str | None = None
    doctor_prescription: str | None = None
    prescription: str | None = None  # Frontend alias support
    doctor_name: str | None = None
    triage_level: str | None = None


class LiveKitTokenRequest(BaseModel):
    patient_id: str = "NEW_PATIENT"
    room_name: str | None = None
    patient_name: str | None = None
    language: str | None = None


class VoiceChatTurnRequest(BaseModel):
    consultation_id: str | None = None
    patient_id: str = "NEW_PATIENT"
    user_name: str | None = None
    user_message: str
    language: str = "bn-IN"
    history: list[dict[str, Any]] = Field(default_factory=list)
    attached_document: dict[str, Any] | None = None


class VoiceChatTurnResponse(BaseModel):
    consultation_id: str
    user_name: str | None = None
    ai_message: str
    language: str
    triage_level: str
    danger_signs: list[dict[str, Any]] = Field(default_factory=list)
    suggested_options: list[str] = Field(default_factory=list)
    chief_complaint: str = "General Consultation"
    timestamp: str
    display_time: str


# ==============================================================================
# Rule-Based Danger Sign Evaluator (Hardened Clinical Engine)
# ==============================================================================

def evaluate_transcript_danger_signs(transcript: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Scan transcript user utterances for clinical danger signs using hardened rule engine."""
    flags: list[dict[str, Any]] = []
    seen_ids = set()

    for turn in transcript:
        if turn.get("role") == "user":
            text = str(turn.get("text", "")).strip()
            detected = evaluate_danger_signs(free_text=text)
            for d in detected:
                if d["rule_id"] not in seen_ids:
                    seen_ids.add(d["rule_id"])
                    flags.append({
                        "rule_id": d["rule_id"],
                        "category": d.get("category", "general"),
                        "severity": d["severity"],
                        "alert_message": d["alert_message"],
                        "detected_in": text[:100],
                    })
    return flags


# ==============================================================================
# Consultation Endpoints
# ==============================================================================

@router.post(
    "/consultations",
    status_code=status.HTTP_201_CREATED,
    summary="Save Completed Voice Consultation to Supabase",
)
async def create_voice_consultation(body: ConsultationCreateRequest):
    """Persist completed voice consultation session to Supabase table 'consultations'."""
    consultation_id = body.id or f"con_{uuid.uuid4().hex[:10]}"

    # Automatic danger signs evaluation if not provided
    evaluated_flags = list(body.danger_signs)
    if not evaluated_flags and body.transcript:
        evaluated_flags = evaluate_transcript_danger_signs(body.transcript)

    # Compute triage level based on danger signs severity
    triage_level = body.triage_level
    if any(f.get("severity") in ["EMERGENCY", "CRITICAL"] for f in evaluated_flags):
        triage_level = "EMERGENCY"
    elif any(f.get("severity") in ["HIGH", "MONITOR"] for f in evaluated_flags) and triage_level == "STABLE":
        triage_level = "MONITOR"

    # Default clinical summary if empty
    clinical_summary = body.clinical_summary
    if not clinical_summary and body.transcript:
        total_turns = len(body.transcript)
        flag_notes = f" Flagged alerts: {len(evaluated_flags)}." if evaluated_flags else ""
        clinical_summary = f"Voice consultation conducted ({total_turns} speech turns, language: {body.language_used}).{flag_notes}"

    now_iso = datetime.now(timezone.utc).isoformat()
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
        "transcript": body.transcript,
        "danger_signs": evaluated_flags,
        "triage_level": triage_level,
        "clinical_summary": clinical_summary,
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
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist consultation to Supabase: {str(e)}",
        )


@router.post(
    "/voice/chat",
    response_model=VoiceChatTurnResponse,
    summary="ChatGPT-Style Real-time AI Health Chat Turn with Supabase Persistence",
)
async def handle_voice_chat_turn(body: VoiceChatTurnRequest):
    """
    ChatGPT-style turn:
    1. Loads patient dossier & clinical history from Supabase.
    2. Invokes multilingual clinical Gemini AI (or resilient fallback).
    3. Persists conversation turn in real-time to Supabase table 'consultations' with timestamps.
    4. Returns conversational message, speech text, triage rating, and options.
    """
    patient_ref = body.patient_id or "NEW_PATIENT"
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    display_time = datetime.now().strftime("%I:%M %p")

    # 1. Fetch patient clinical dossier
    is_new = patient_ref == "NEW_PATIENT" or patient_ref.startswith("NEW_")
    dossier = {}
    patient_info = {}
    if not is_new:
        try:
            dossier = get_patient_dossier(patient_ref)
            patient_info = dossier.get("patient") or {}
            if dossier.get("is_new_patient"):
                is_new = True
        except Exception:
            dossier = {}
            patient_info = {}
            is_new = True
    else:
        patient_info = {"is_new_patient": True, "name": body.user_name or "New Patient"}

    user_name = body.user_name or patient_info.get("name") or ("New Patient" if is_new else "Patient")
    if is_new and not patient_info.get("name"):
        patient_info["name"] = user_name

    # 2. Invoke conversational clinical model with attached document support
    ai_turn = await generate_conversational_health_turn(
        user_message=body.user_message,
        patient_context=patient_info,
        history=body.history,
        language=body.language,
        attached_document=body.attached_document,
    )

    ai_text = ai_turn.get("ai_message", "I understand your concern. Please consult your local health worker.")
    triage_level = ai_turn.get("triage_level", "STABLE")
    raw_danger = ai_turn.get("danger_signs", [])
    suggested_options = ai_turn.get("suggested_options", [])
    chief_complaint = ai_turn.get("chief_complaint") or body.user_message[:60]

    # Format danger signs
    formatted_danger = []
    for d in raw_danger:
        if isinstance(d, str):
            formatted_danger.append({"alert": d, "severity": triage_level})
        elif isinstance(d, dict):
            formatted_danger.append(d)

    # 3. Create or update consultation session in Supabase
    consultation_id = body.consultation_id
    existing_consultation = None
    if consultation_id:
        try:
            existing_consultation = get_consultation_by_id(consultation_id)
        except Exception:
            existing_consultation = None

    user_entry = {
        "role": "user",
        "text": body.user_message,
        "timestamp": now_iso,
        "display_time": display_time,
    }
    if body.attached_document:
        user_entry["attached_document"] = {
            "id": body.attached_document.get("id"),
            "title": body.attached_document.get("title") or body.attached_document.get("file_name"),
            "category": body.attached_document.get("category"),
        }

    ai_entry = {
        "role": "agent",
        "text": ai_text,
        "timestamp": now_iso,
        "display_time": display_time,
        "options": suggested_options,
    }

    if existing_consultation:
        transcript = existing_consultation.get("transcript") or []
        if isinstance(transcript, list):
            transcript.extend([user_entry, ai_entry])
        else:
            transcript = [user_entry, ai_entry]

        # Danger signs aggregation
        combined_danger = list(existing_consultation.get("danger_signs") or [])
        combined_danger.extend(formatted_danger)

        effective_triage = triage_level
        if existing_consultation.get("triage_level") == "EMERGENCY" or triage_level == "EMERGENCY":
            effective_triage = "EMERGENCY"
        elif existing_consultation.get("triage_level") == "MONITOR" or triage_level == "MONITOR":
            effective_triage = "MONITOR"

        updates = {
            "user_name": user_name,
            "ended_at": now_iso,
            "transcript": transcript,
            "danger_signs": combined_danger,
            "triage_level": effective_triage,
            "clinical_summary": f"Active AI Consultation with {user_name}: {chief_complaint}. Turns: {len(transcript)}.",
        }
        try:
            update_consultation(consultation_id, updates)
        except Exception as e:
            logger.warning(f"[CONSULTATION_UPDATE_WARN] {e}")
    else:
        consultation_id = consultation_id or f"con_{uuid.uuid4().hex[:10]}"
        new_record = {
            "id": consultation_id,
            "patient_id": patient_ref,
            "user_name": user_name,
            "started_at": now_iso,
            "ended_at": now_iso,
            "duration_seconds": 15,
            "language_used": body.language,
            "chief_complaint": chief_complaint,
            "symptoms_timeline": "Acute presentation",
            "transcript": [user_entry, ai_entry],
            "danger_signs": formatted_danger,
            "triage_level": triage_level,
            "clinical_summary": f"AI Consultation with {user_name} for {chief_complaint} (language: {body.language}).",
            "doctor_status": "PENDING",
            "doctor_notes": None,
            "doctor_prescription": None,
        }
        try:
            insert_consultation(new_record)
        except Exception as e:
            logger.warning(f"[CONSULTATION_INSERT_WARN] {e}")

    return VoiceChatTurnResponse(
        consultation_id=consultation_id,
        user_name=user_name,
        ai_message=ai_text,
        language=body.language,
        triage_level=triage_level,
        danger_signs=formatted_danger,
        suggested_options=suggested_options,
        chief_complaint=chief_complaint,
        timestamp=now_iso,
        display_time=display_time,
    )


@router.get(
    "/consultations/patient/{patient_id}",
    summary="List Consultations for Patient",
)
def list_consultations(patient_id: str):
    """Retrieve all voice consultation records for a patient ordered by latest first."""
    records = get_patient_consultations(patient_id=patient_id)
    return records


@router.get(
    "/consultations/{consultation_id}",
    summary="Get Consultation Details by ID",
)
def get_consultation(consultation_id: str):
    """Fetch single consultation with full transcript, symptoms timeline, and doctor review status."""
    record = get_consultation_by_id(consultation_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation '{consultation_id}' not found",
        )
    return record


@router.patch(
    "/consultations/{consultation_id}/review",
    summary="Doctor Review & Prescription Approval for Consultation",
)
def review_consultation(consultation_id: str, body: ConsultationReviewRequest):
    """Update consultation with doctor notes, prescription approval, and review status."""
    existing = get_consultation_by_id(consultation_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation '{consultation_id}' not found",
        )

    resolved_rx = body.doctor_prescription or body.prescription
    updates: dict[str, Any] = {
        "doctor_status": body.doctor_status,
        "doctor_notes": body.doctor_notes,
        "doctor_prescription": resolved_rx,
    }
    if body.triage_level:
        updates["triage_level"] = body.triage_level

    updated = update_consultation(consultation_id, updates)
    return updated or {**existing, **updates}


@router.delete(
    "/consultations/{consultation_id}",
    summary="Delete Consultation by ID",
)
def delete_consultation(consultation_id: str):
    delete_consultation_by_id(consultation_id)
    return {"status": "ok", "message": f"Consultation '{consultation_id}' deleted"}


# ==============================================================================
# Clinical Patient Dossier Endpoint (Voice Agent & Clinical Intelligence)
# ==============================================================================

@router.get(
    "/patient/{patient_ref}/dossier",
    summary="Get Consolidated Clinical Patient Dossier from Supabase",
)
async def fetch_patient_dossier(patient_ref: str):
    """Retrieve structured patient clinical dossier compiled from Supabase.

    Used by LiveKit Voice Agent to personalize greetings, extract active medications,
    read radiology findings, and enforce clinical safety guardrails.
    """
    try:
        dossier = get_patient_dossier(patient_ref)
        return dossier
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile dossier: {e}",
        )



# ==============================================================================
# LiveKit WebRTC Token Generator Endpoint
# ==============================================================================

@router.post(
    "/livekit/token",
    summary="Generate LiveKit WebRTC Room Access Token",
)
async def create_livekit_token(body: LiveKitTokenRequest):
    """Generate authenticated LiveKit token with patient reference for real-time audio consultation."""
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LiveKit SDK is not installed on this host",
        )

    api_key = settings.LIVEKIT_API_KEY
    api_secret = settings.LIVEKIT_API_SECRET
    if not api_key or not api_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured in environment",
        )

    room_name = body.room_name or f"consultation_{body.patient_id.replace('-', '_')}"
    participant_identity = body.patient_id
    participant_name = body.patient_name or f"Patient {body.patient_id}"

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(participant_identity)
        .with_name(participant_name)
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
    )

    jwt_token = token.to_jwt()

    # Automatically dispatch AI voice agent worker (agent.py) into this consultation room
    try:
        import json
        lk_client = LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=api_key,
            api_secret=api_secret,
        )
        metadata_dict = {
            "patient_id": participant_identity,
            "patient_name": participant_name,
            "language": body.language or "en-IN",
        }
        dispatch_req = CreateAgentDispatchRequest(
            agent_name="",
            room=room_name,
            metadata=json.dumps(metadata_dict),
        )
        await lk_client.agent_dispatch.create_dispatch(dispatch_req)
        await lk_client.aclose()
        logger.info(f"[LIVEKIT_DISPATCH_SUCCESS] Dispatched AI agent to room '{room_name}' for '{participant_name}'")
    except Exception as dispatch_err:
        logger.warning(f"[LIVEKIT_DISPATCH_NOTICE] Agent dispatch note: {dispatch_err}")

    return {
        "token": jwt_token,
        "url": settings.LIVEKIT_URL,
        "room_name": room_name,
        "participant_identity": participant_identity,
    }
