"""Unified Medical Document API router.

Provides a single endpoint to upload, inspect, and analyze any medical document:
prescriptions, lab copies, and radiology X-ray scans.
"""

import json
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import MedicalRecord
from app.api.schemas import (
    AskQuestionRequest,
    AskQuestionResponse,
    MedicalRecordResponse,
)
from app.services.storage_service import save_uploaded_file
from app.services.gemini_analyzer import (
    analyze_unified_medical_document,
    ask_question_about_document,
)

router = APIRouter(prefix="/documents", tags=["Unified Medical Documents"])


@router.post(
    "/analyze",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Unified Medical Document Analyzer (Prescription, Lab Copy, X-Ray)",
    description=(
        "Upload any medical file (handwritten prescription, lab report, or X-Ray scan). "
        "The multi-modal Gemini Vision AI automatically analyzes findings, extracts entities, "
        "generates multilingual summaries, and saves the record to the database."
    ),
)
async def upload_and_analyze_document(
    file: Annotated[UploadFile, File(description="Image file (JPG, PNG, WEBP) or PDF")],
    patient_id: Annotated[str, Form(description="Patient ID")] = "AV-8921",
    category: Annotated[str, Form(description="Category: 'Prescription', 'Lab Report', 'Radiology / X-Ray', or 'Auto-Detect'")] = "Auto-Detect",
    title: Annotated[str | None, Form(description="Custom title (optional)")] = None,
    facility: Annotated[str | None, Form(description="Issuing clinic / hospital (optional)")] = None,
    notes: Annotated[str | None, Form(description="Clinical notes / symptoms (optional)")] = None,
    db: Session = Depends(get_db),
):
    # 1. Save uploaded file to disk
    storage_meta = await save_uploaded_file(file, subfolder="medical_vault")
    raw_bytes = storage_meta["raw_bytes"]
    mime_type = storage_meta["mime_type"]

    # 2. Perform multimodal AI vision analysis with Gemini Flash
    try:
        analysis_result = await analyze_unified_medical_document(
            image_bytes=raw_bytes,
            mime_type=mime_type,
            hint_category=category,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Vision Analysis failed: {str(e)}",
        )

    # 3. Determine record metadata
    doc_type = analysis_result.get("document_type", "general_medical")
    resolved_category = category if category != "Auto-Detect" else doc_type.replace("_", " ").title()
    resolved_title = title or analysis_result.get("title") or f"{resolved_category} - {storage_meta['file_name']}"
    doctor_name = analysis_result.get("doctor_name") or analysis_result.get("doctor_or_facility")
    resolved_facility = facility or analysis_result.get("facility") or analysis_result.get("doctor_or_facility")
    visit_date = analysis_result.get("visit_date") or analysis_result.get("date") or analysis_result.get("collection_date")
    urgency = analysis_result.get("urgency", "NORMAL")

    patient_summary = analysis_result.get("patient_summary", {})
    summary_en = patient_summary.get("english", "")
    summary_hi = patient_summary.get("hindi", "")
    summary_bn = patient_summary.get("bengali", "")

    # 4. Save record to SQLite database
    record_id = f"doc_{uuid.uuid4().hex[:10]}"
    db_record = MedicalRecord(
        id=record_id,
        patient_id=patient_id,
        record_type=doc_type,
        title=resolved_title,
        category=resolved_category,
        facility=resolved_facility,
        doctor_name=doctor_name,
        visit_date=visit_date,
        file_name=storage_meta["file_name"],
        file_path=storage_meta["file_path"],
        file_url=storage_meta["file_url"],
        file_size=storage_meta["file_size"],
        mime_type=storage_meta["mime_type"],
        analysis_status="COMPLETED",
        raw_text=notes,
        structured_data=json.dumps(analysis_result, ensure_ascii=False),
        summary_en=summary_en,
        summary_hi=summary_hi,
        summary_bn=summary_bn,
        urgency=urgency,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record.to_dict()


@router.get(
    "/{record_id}",
    response_model=MedicalRecordResponse,
    summary="Get Analyzed Document by ID",
)
def get_document_by_id(record_id: str, db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical record '{record_id}' not found",
        )
    return record.to_dict()


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Analyzed Documents for Patient",
)
def list_documents_for_patient(patient_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return [r.to_dict() for r in records]


@router.post(
    "/{record_id}/ask",
    response_model=AskQuestionResponse,
    summary="Ask AI a Question About an Analyzed Document",
    description="Interactive Q&A to answer patient questions based on doctor notes or X-ray findings.",
)
async def ask_question_on_document(
    record_id: str,
    body: AskQuestionRequest,
    db: Session = Depends(get_db),
):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical record '{record_id}' not found",
        )

    context = record.get_parsed_data()
    answer = await ask_question_about_document(
        document_context=context,
        question=body.question,
        language=body.language,
    )

    return {
        "document_id": record_id,
        "question": body.question,
        "answer": answer,
        "language": body.language,
    }
