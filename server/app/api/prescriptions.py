"""Prescription Analysis API Router with Supabase Cloud persistence."""

import uuid
from typing import Annotated
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.api.schemas import MedicalRecordResponse
from app.db.supabase_client import (
    insert_medical_record,
    get_patient_medical_records,
    format_record_for_api,
)
from app.services.storage_service import save_uploaded_file
from app.services.gemini_analyzer import analyze_prescription_image

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post(
    "/analyze",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Inspect Doctor Prescription (Handwritten / Printed)",
)
async def analyze_prescription(
    file: Annotated[UploadFile, File(description="Prescription slip image (JPG, PNG) or PDF")],
    patient_id: Annotated[str, Form(description="Patient ID / Reference")] = "AV-2026-8921",
    facility: Annotated[str | None, Form(description="Issuing Clinic or Hospital")] = None,
):
    storage_meta = await save_uploaded_file(file, patient_id=patient_id, subfolder="prescriptions")

    try:
        data = await analyze_prescription_image(
            image_bytes=storage_meta["raw_bytes"],
            mime_type=storage_meta["mime_type"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Prescription vision analysis failed: {str(e)}",
        )

    patient_summary = data.get("patient_summary", {})
    record_id = f"rx_{uuid.uuid4().hex[:10]}"
    doctor_name = data.get("doctor_name")
    resolved_facility = facility or data.get("facility")
    visit_date = data.get("visit_date") or data.get("date")

    record_payload = {
        "id": record_id,
        "patient_id": patient_id,
        "record_type": "prescription",
        "title": f"Doctor Prescription - {doctor_name or storage_meta['file_name']}",
        "category": "Prescription",
        "facility": resolved_facility,
        "doctor_name": doctor_name,
        "visit_date": str(visit_date) if visit_date else None,
        "file_name": storage_meta["file_name"],
        "storage_path": storage_meta["storage_path"],
        "file_size": storage_meta["file_size"],
        "mime_type": storage_meta["mime_type"],
        "analysis_status": "COMPLETED",
        "structured_data": data,
        "summary_en": patient_summary.get("english", ""),
        "summary_hi": patient_summary.get("hindi", ""),
        "summary_bn": patient_summary.get("bengali", ""),
        "urgency": data.get("urgency", "NORMAL"),
    }

    try:
        inserted = insert_medical_record(record_payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save prescription to Supabase: {str(e)}",
        )

    return format_record_for_api(inserted)


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Prescriptions for Patient",
)
def get_patient_prescriptions(patient_id: str):
    records = get_patient_medical_records(
        patient_id=patient_id,
        record_type="prescription",
    )
    return [format_record_for_api(r) for r in records]
