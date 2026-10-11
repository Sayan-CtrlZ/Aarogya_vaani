"""Radiology & X-Ray Analysis API Router."""

import json
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MedicalRecord
from app.api.schemas import MedicalRecordResponse
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
    patient_id: Annotated[str, Form(description="Patient ID")] = "AV-8921",
    body_part: Annotated[str | None, Form(description="Anatomical site (e.g. 'Chest', 'Left Knee', 'Lumbar Spine')")] = None,
    clinical_history: Annotated[str | None, Form(description="Patient history / reason for scan")] = None,
    facility: Annotated[str | None, Form(description="Imaging Centre / Hospital")] = None,
    db: Session = Depends(get_db),
):
    storage_meta = await save_uploaded_file(file, subfolder="xray_scans")
    
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
    
    db_record = MedicalRecord(
        id=record_id,
        patient_id=patient_id,
        record_type="xray_radiology",
        title=f"Radiology Scan - {detected_part}",
        category="Medical Scan / X-Ray",
        facility=facility,
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
    summary="List All Radiology Scans for Patient",
)
def get_patient_xrays(patient_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id, MedicalRecord.record_type == "xray_radiology")
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return [r.to_dict() for r in records]
