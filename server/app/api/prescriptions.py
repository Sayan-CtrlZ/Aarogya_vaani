"""Prescription Analysis API Router."""

import json
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MedicalRecord
from app.api.schemas import MedicalRecordResponse
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
    patient_id: Annotated[str, Form(description="Patient ID")] = "AV-8921",
    facility: Annotated[str | None, Form(description="Issuing Clinic or Hospital")] = None,
    db: Session = Depends(get_db),
):
    storage_meta = await save_uploaded_file(file, subfolder="prescriptions")
    
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
    
    db_record = MedicalRecord(
        id=record_id,
        patient_id=patient_id,
        record_type="prescription",
        title=f"Doctor Prescription - {data.get('doctor_name') or storage_meta['file_name']}",
        category="Prescription",
        facility=facility or data.get("facility"),
        doctor_name=data.get("doctor_name"),
        visit_date=data.get("visit_date"),
        file_name=storage_meta["file_name"],
        file_path=storage_meta["file_path"],
        file_url=storage_meta["file_url"],
        file_size=storage_meta["file_size"],
        mime_type=storage_meta["mime_type"],
        analysis_status="COMPLETED",
        structured_data=json.dumps(data, ensure_ascii=False),
        summary_en=patient_summary.get("english", ""),
        summary_hi=patient_summary.get("hindi", ""),
        summary_bn=patient_summary.get("bengali", ""),
        urgency=data.get("urgency", "NORMAL"),
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record.to_dict()


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Prescriptions for Patient",
)
def get_patient_prescriptions(patient_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id, MedicalRecord.record_type == "prescription")
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return [r.to_dict() for r in records]
