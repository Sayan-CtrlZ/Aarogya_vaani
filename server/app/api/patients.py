"""Patient Medical Context & Voice Agent Integration Router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MedicalRecord
from app.api.schemas import PatientContextResponse

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
def get_patient_clinical_context(patient_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )

    active_medications: list[dict] = []
    latest_lab_flags: list[dict] = []
    recent_radiology_findings: list[dict] = []
    red_flags: list[str] = []
    briefing_points: list[str] = []

    for r in records:
        parsed = r.get_parsed_data()
        
        # 1. Prescriptions & Medications
        if r.record_type == "prescription":
            meds = parsed.get("medications", [])
            for m in meds:
                active_medications.append({
                    "name": m.get("name"),
                    "dosage": m.get("dosage"),
                    "frequency": m.get("frequency"),
                    "timing": m.get("timing"),
                    "duration": m.get("duration"),
                    "instructions": m.get("instructions"),
                    "prescribed_by": r.doctor_name,
                    "date": r.visit_date,
                })
            doc_flags = parsed.get("red_flags", [])
            red_flags.extend(doc_flags)

        # 2. Lab & Pathology Reports
        elif r.record_type == "lab_report":
            metrics = parsed.get("metrics", [])
            for m in metrics:
                if m.get("flag") in ["HIGH", "LOW", "CRITICAL"]:
                    latest_lab_flags.append({
                        "test_name": m.get("test_name"),
                        "value": m.get("value"),
                        "unit": m.get("unit"),
                        "reference_range": m.get("reference_range"),
                        "flag": m.get("flag"),
                        "date": r.visit_date,
                    })

        # 3. Radiology Scans
        elif r.record_type == "xray_radiology":
            recent_radiology_findings.append({
                "body_part": parsed.get("body_part") or r.title,
                "modality": parsed.get("modality"),
                "impression": parsed.get("impression"),
                "urgency": parsed.get("urgency", "NORMAL"),
                "date": r.created_at.strftime("%d-%b-%Y") if r.created_at else "",
            })

    # Build concise voice assistant digest
    if active_medications:
        med_summary = ", ".join(
            [f"{m['name']} ({m.get('dosage','')}, {m.get('frequency','')}, {m.get('timing','')})" for m in active_medications[:5]]
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
