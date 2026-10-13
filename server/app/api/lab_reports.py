"""Diagnostic Lab Reports & Pathology API Router with Supabase Cloud persistence."""

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
from app.services.gemini_analyzer import analyze_lab_report_image

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports & Pathology"])


@router.post(
    "/analyze",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Inspect Diagnostic Lab / Pathology Report",
)
async def analyze_lab_report(
    file: Annotated[UploadFile, File(description="Lab report image (JPG, PNG) or PDF")],
    patient_id: Annotated[str, Form(description="Patient ID / Reference")] = "AV-2026-8921",
    lab_name: Annotated[str | None, Form(description="Diagnostic Lab / Centre Name")] = None,
):
    storage_meta = await save_uploaded_file(file, patient_id=patient_id, subfolder="lab_reports")

    try:
        data = await analyze_lab_report_image(
            image_bytes=storage_meta["raw_bytes"],
            mime_type=storage_meta["mime_type"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Lab report analysis failed: {str(e)}",
        )

    patient_summary = data.get("patient_summary", {})
    record_id = f"lab_{uuid.uuid4().hex[:10]}"
    panel_name = data.get("panel_name") or "Diagnostic Lab Report"
    visit_date = data.get("collection_date") or data.get("date")

    record_payload = {
        "id": record_id,
        "patient_id": patient_id,
        "record_type": "lab_report",
        "title": f"Lab Report - {panel_name}",
        "category": "Lab Report",
        "facility": lab_name or data.get("lab_name"),
        "doctor_name": data.get("pathologist_or_doctor"),
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
            detail=f"Failed to save lab report to Supabase: {str(e)}",
        )

    return format_record_for_api(inserted)


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Lab Reports for Patient",
)
def get_patient_lab_reports(patient_id: str):
    records = get_patient_medical_records(
        patient_id=patient_id,
        record_type="lab_report",
    )
    return [format_record_for_api(r) for r in records]
