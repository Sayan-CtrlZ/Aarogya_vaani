"""Radiology & X-Ray Analysis API Router with Supabase Cloud persistence."""

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
from app.services.gemini_analyzer import analyze_xray_radiology_image

router = APIRouter(prefix="/xray-radiology", tags=["Radiology & X-Ray"])


@router.post(
    "/analyze",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Inspect Radiology X-Ray / Medical Scan",
)
async def analyze_xray(
    file: Annotated[UploadFile, File(description="X-Ray or scan image (JPG, PNG) or DICOM export")],
    patient_id: Annotated[str, Form(description="Patient ID / Reference")] = "AV-2026-8921",
    body_part: Annotated[str | None, Form(description="Anatomical site (e.g. 'Chest', 'Left Knee', 'Lumbar Spine')")] = None,
    clinical_history: Annotated[str | None, Form(description="Patient history / reason for scan")] = None,
    facility: Annotated[str | None, Form(description="Imaging Centre / Hospital")] = None,
):
    storage_meta = await save_uploaded_file(file, patient_id=patient_id, subfolder="xray_scans")

    try:
        data = await analyze_xray_radiology_image(
            image_bytes=storage_meta["raw_bytes"],
            mime_type=storage_meta["mime_type"],
            body_part=body_part,
            clinical_history=clinical_history,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Radiology vision analysis failed: {str(e)}",
        )

    patient_summary = data.get("patient_summary", {})
    record_id = f"xray_{uuid.uuid4().hex[:10]}"
    detected_part = data.get("body_part") or body_part or "Scan"
    visit_date = data.get("scan_date") or data.get("date")

    record_payload = {
        "id": record_id,
        "patient_id": patient_id,
        "record_type": "xray_radiology",
        "title": f"Radiology Scan - {detected_part}",
        "category": "Medical Scan / X-Ray",
        "facility": facility,
        "doctor_name": data.get("radiologist_or_doctor"),
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
            detail=f"Failed to save radiology record to Supabase: {str(e)}",
        )

    return format_record_for_api(inserted)


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Radiology Scans for Patient",
)
def get_patient_xrays(patient_id: str):
    records = get_patient_medical_records(
        patient_id=patient_id,
        record_type="xray_radiology",
    )
    return [format_record_for_api(r) for r in records]
