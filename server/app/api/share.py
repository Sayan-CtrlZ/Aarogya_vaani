"""Patient Record Sharing & ABDM Consent Access Passcode Router for AarogyaVaani."""

import random
from typing import Any
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.supabase_client import (
    insert_share_code,
    get_patient_share_codes,
    revoke_share_code_by_id,
    get_patient_audit_logs,
    get_patient_dossier,
    get_doctor_recent_access_logs,
    record_doctor_access_event,
    get_supabase_client,
)

router = APIRouter(prefix="/share", tags=["ABDM Record Sharing & Doctor Passcode"])


class GenerateShareCodeRequest(BaseModel):
    patient_id: str = Field(default="AV-2026-8921")
    patient_name: str | None = None
    duration_hours: int = 24
    scope: dict[str, bool] = Field(
        default_factory=lambda: {
            "recentConsultation": True,
            "prescriptions": True,
            "labReports": True,
        }
    )


class VerifyShareCodeRequest(BaseModel):
    code: str = Field(description="6-digit passcode or sharing token")
    doctor_name: str | None = "Dr. S. Roy"
    facility: str | None = "Bishalgarh Community Health Centre"


@router.post("/generate-code", summary="Generate a 6-digit Doctor Access Passcode")
def generate_share_code(body: GenerateShareCodeRequest):
    code_digits = f"{random.randint(100000, 999999)}"
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=body.duration_hours)

    record = {
        "id": f"code-{int(now.timestamp())}",
        "patient_id": body.patient_id,
        "patient_name": body.patient_name or "Patient",
        "code": code_digits,
        "duration_hours": body.duration_hours,
        "scope": body.scope,
        "status": "ACTIVE",
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "formatted_expiry": expires.strftime("%d %b %Y, %I:%M %p"),
    }

    saved = insert_share_code(record)
    return saved


@router.get("/codes/{patient_id}", summary="List active share passcodes for a patient")
def list_share_codes(patient_id: str):
    return get_patient_share_codes(patient_id)


@router.delete("/codes/{code_id}", summary="Revoke a share passcode immediately")
def revoke_share_code(code_id: str):
    revoke_share_code_by_id(code_id)
    return {"status": "ok", "message": f"Passcode {code_id} revoked"}


@router.get("/audit/{patient_id}", summary="List consent access history and audit logs")
def list_audit_logs(patient_id: str):
    return get_patient_audit_logs(patient_id)


@router.get("/doctor-history", summary="Doctor dashboard recent access history")
def doctor_recent_access():
    return get_doctor_recent_access_logs()


@router.post("/verify", summary="Doctor unlocks patient record using 6-digit passcode")
def verify_share_code(body: VerifyShareCodeRequest):
    clean_code = body.code.strip()
    norm_code = clean_code.replace(" ", "").upper()
    
    matched = None
    # 1. Try Supabase
    try:
        client = get_supabase_client()
        res = client.table("share_codes").select("*").eq("code", clean_code).eq("status", "ACTIVE").execute()
        if res.data and len(res.data) > 0:
            matched = res.data[0]
        else:
            # Try normalized uppercase (e.g. AV-7K4P-92)
            res2 = client.table("share_codes").select("*").eq("code", norm_code).eq("status", "ACTIVE").execute()
            if res2.data and len(res2.data) > 0:
                matched = res2.data[0]
    except Exception:
        pass

    # 2. Try Local fallback share codes
    if not matched:
        from app.db.supabase_client import _LOCAL_SHARE_CODES
        for c in _LOCAL_SHARE_CODES:
            c_code = str(c.get("code", "")).strip()
            if (c_code == clean_code or c_code.upper() == norm_code) and c.get("status") == "ACTIVE":
                matched = c
                break

    # 3. Allow direct fallback matching if code matches patient ID format
    if not matched:
        from app.db.supabase_client import _LOCAL_SHARE_CODES
        for c in _LOCAL_SHARE_CODES:
            if c.get("patient_id") == clean_code and c.get("status") == "ACTIVE":
                matched = c
                break

    if not matched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired 6-digit doctor access code",
        )

    p_id = matched.get("patient_id")
    dossier = get_patient_dossier(p_id)
    patient_name = matched.get("patient_name") or dossier.get("patient", {}).get("name", "Patient")

    # Record doctor access audit entry
    now = datetime.now(timezone.utc)
    audit_entry = {
        "id": f"aud-{int(now.timestamp())}",
        "patient_id": p_id,
        "patient_name": patient_name,
        "doctor_name": body.doctor_name or "Dr. S. Roy",
        "facility": body.facility or "Bishalgarh Community Health Centre",
        "access_type": "Doctor Access Passcode",
        "scope": "Voice Consultations, Prescriptions & Lab Reports",
        "time": "Just now",
        "accessed_at": now.strftime("%d %b %Y, %I:%M %p"),
        "status": "APPROVED",
        "active": True,
    }
    record_doctor_access_event(audit_entry)

    return {
        "status": "AUTHORIZED",
        "patient_id": p_id,
        "patient_name": patient_name,
        "scope": matched.get("scope"),
        "expires_at": matched.get("expires_at"),
        "formatted_expiry": matched.get("formatted_expiry"),
        "dossier": dossier,
    }

