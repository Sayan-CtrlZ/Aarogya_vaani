"""Diagnostic Lab Reports & Pathology API Router."""

import json
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MedicalRecord
from app.api.schemas import MedicalRecordResponse
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
    patient_id: Annotated[str, Form(description="Patient ID")] = "AV-8921",
    lab_name: Annotated[str | None, Form(description="Diagnostic Lab / Centre Name")] = None,
    db: Session = Depends(get_db),
):
    storage_meta = await save_uploaded_file(file, subfolder="lab_reports")
    
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
    
    db_record = MedicalRecord(
        id=record_id,
        patient_id=patient_id,
        record_type="lab_report",
        title=f"Lab Report - {panel_name}",
        category="Lab Report",
        facility=lab_name or data.get("lab_name"),
        visit_date=data.get("collection_date"),
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
    summary="List All Lab Reports for Patient",
)
def get_patient_lab_reports(patient_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id, MedicalRecord.record_type == "lab_report")
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return [r.to_dict() for r in records]
