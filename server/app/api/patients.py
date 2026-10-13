"""Patient Medical Context & Voice Agent Integration Router with Supabase Cloud persistence."""

import json
from typing import Any
from fastapi import APIRouter

from app.api.schemas import PatientContextResponse
from app.db.supabase_client import get_patient_medical_records

router = APIRouter(prefix="/patients", tags=["Patient Clinical Context & Voice Agent"])


@router.get(
    "/{patient_id}/context",
    response_model=PatientContextResponse,
    summary="Get Consolidated Medical Context for Voice Agent & EMR",
    description=(
        "Synthesizes patient's uploaded prescriptions, lab reports, and radiology scans "
        "into a structured briefing used directly by the LiveKit Voice Agent."
    ),
)
def get_patient_clinical_context(patient_id: str):
    records = get_patient_medical_records(patient_id=patient_id)

    active_medications: list[dict[str, Any]] = []
    latest_lab_flags: list[dict[str, Any]] = []
    recent_radiology_findings: list[dict[str, Any]] = []
    red_flags: list[str] = []
    briefing_points: list[str] = []

    for r in records:
        raw_struct = r.get("structured_data") or {}
        if isinstance(raw_struct, str):
            try:
                parsed = json.loads(raw_struct)
            except Exception:
                parsed = {}
        elif isinstance(raw_struct, dict):
            parsed = raw_struct
        else:
            parsed = {}

        record_type = r.get("record_type")

        # 1. Prescriptions & Medications
        if record_type == "prescription":
            meds = parsed.get("medications", [])
            for m in meds:
                active_medications.append({
                    "name": m.get("name"),
                    "dosage": m.get("dosage"),
                    "frequency": m.get("frequency"),
                    "timing": m.get("timing"),
                    "duration": m.get("duration"),
                    "instructions": m.get("instructions"),
                    "prescribed_by": r.get("doctor_name"),
                    "date": r.get("visit_date"),
                })
            doc_flags = parsed.get("red_flags", [])
            if isinstance(doc_flags, list):
                red_flags.extend(doc_flags)

        # 2. Lab & Pathology Reports
        elif record_type == "lab_report":
            metrics = parsed.get("metrics", [])
            for m in metrics:
                if m.get("flag") in ["HIGH", "LOW", "CRITICAL"]:
                    latest_lab_flags.append({
                        "test_name": m.get("test_name"),
                        "value": m.get("value"),
                        "unit": m.get("unit"),
                        "reference_range": m.get("reference_range"),
                        "flag": m.get("flag"),
                        "date": r.get("visit_date"),
                    })

        # 3. Radiology Scans
        elif record_type == "xray_radiology":
            recent_radiology_findings.append({
                "body_part": parsed.get("body_part") or r.get("title"),
                "modality": parsed.get("modality"),
                "impression": parsed.get("impression"),
                "urgency": parsed.get("urgency", "NORMAL"),
                "date": str(r.get("created_at") or "")[:10],
            })

    # Build concise voice assistant digest
    if active_medications:
        med_summary = ", ".join(
            [f"{m['name']} ({m.get('dosage','') or ''}, {m.get('frequency','') or ''}, {m.get('timing','') or ''})".strip() for m in active_medications[:5]]
        )
        briefing_points.append(f"Active Prescribed Medications: {med_summary}.")
    else:
        briefing_points.append("No active prescriptions recorded yet.")

    if latest_lab_flags:
        flags_summary = ", ".join([f"{f['test_name']}: {f['value']} {f.get('unit','')} ({f['flag']})" for f in latest_lab_flags[:4]])
        briefing_points.append(f"Abnormal Lab Values: {flags_summary}.")

    if recent_radiology_findings:
        rad_summary = "; ".join([f"{rad['body_part']}: {rad['impression']} (Urgency: {rad['urgency']})" for rad in recent_radiology_findings[:2]])
        briefing_points.append(f"Radiology Findings: {rad_summary}.")

    synthesized_voice_briefing = " ".join(briefing_points)

    return {
        "patient_id": patient_id,
        "total_records": len(records),
        "active_medications": active_medications,
        "latest_lab_flags": latest_lab_flags,
        "recent_radiology_findings": recent_radiology_findings,
        "red_flags": list(set(red_flags)),
        "synthesized_voice_briefing": synthesized_voice_briefing,
    }


@router.get("", summary="List all patients from database")
def list_all_patients():
    """List all registered patients from Supabase."""
    from app.db.supabase_client import list_patients
    return list_patients()


@router.get("/{patient_id}", summary="Get patient profile by ID or reference")
def get_patient_profile(patient_id: str):
    """Fetch patient profile by ID or patient_ref."""
    from app.db.supabase_client import get_patient_by_ref
    from fastapi import HTTPException
    patient = get_patient_by_ref(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", summary="Update patient demographic details")
def update_patient_profile(patient_id: str, updates: dict[str, Any]):
    """Update patient name, age, gender, district, or emergency contact in Supabase."""
    from app.db.supabase_client import update_patient_by_ref
    from fastapi import HTTPException
    patient = update_patient_by_ref(patient_id, updates)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or could not be updated")
    return patient

