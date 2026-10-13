"""Unified Medical Document API router with Supabase Cloud persistence.

Provides endpoints to upload, inspect, and analyze any medical document:
prescriptions, lab reports, and radiology X-ray scans with private cloud vault storage.
"""

import uuid
from typing import Annotated
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status

from app.api.schemas import (
    AskQuestionRequest,
    AskQuestionResponse,
    MedicalRecordResponse,
)
from app.db.supabase_client import (
    insert_medical_record,
    get_patient_medical_records,
    get_medical_record_by_id,
    format_record_for_api,
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
)
@router.post(
    "/upload",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def upload_and_analyze_document(
    file: Annotated[UploadFile, File(description="Image file (JPG, PNG, WEBP) or PDF")],
    patient_id: Annotated[str, Form(description="Patient ID / Reference")] = "AV-2026-8921",
    category: Annotated[str, Form(description="Category: 'Prescription', 'Lab Report', 'Radiology / X-Ray', or 'Auto-Detect'")] = "Auto-Detect",
    title: Annotated[str | None, Form(description="Custom title (optional)")] = None,
    facility: Annotated[str | None, Form(description="Issuing clinic / hospital (optional)")] = None,
    notes: Annotated[str | None, Form(description="Clinical notes / symptoms (optional)")] = None,
):
    # 1. Save uploaded file directly to Supabase Storage 'medical-vault'
    storage_meta = await save_uploaded_file(file, patient_id=patient_id, subfolder="documents")
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

    # 4. Save record to Supabase medical_records table
    record_id = f"doc_{uuid.uuid4().hex[:10]}"
    record_payload = {
        "id": record_id,
        "patient_id": patient_id,
        "record_type": doc_type,
        "title": resolved_title,
        "category": resolved_category,
        "facility": resolved_facility,
        "doctor_name": doctor_name,
        "visit_date": str(visit_date) if visit_date else None,
        "file_name": storage_meta["file_name"],
        "storage_path": storage_meta["storage_path"],
        "file_size": storage_meta["file_size"],
        "mime_type": storage_meta["mime_type"],
        "analysis_status": "COMPLETED",
        "structured_data": analysis_result,
        "summary_en": summary_en,
        "summary_hi": summary_hi,
        "summary_bn": summary_bn,
        "urgency": urgency,
    }

    try:
        inserted = insert_medical_record(record_payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save medical record to Supabase: {str(e)}",
        )

    if storage_meta.get("file_url"):
        inserted["file_url"] = storage_meta["file_url"]

    return format_record_for_api(inserted)


@router.get(
    "/{record_id}",
    response_model=MedicalRecordResponse,
    summary="Get Analyzed Document by ID",
)
def get_document_by_id(record_id: str):
    record = get_medical_record_by_id(record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical record '{record_id}' not found",
        )
    return format_record_for_api(record)


@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalRecordResponse],
    summary="List All Analyzed Documents for Patient with Search and Filters",
)
def list_documents_for_patient(
    patient_id: str,
    category: Annotated[str | None, Query(description="Filter by category (Prescription, Lab Report, Medical Scan / X-Ray)")] = None,
    search: Annotated[str | None, Query(description="Search title, doctor, or facility")] = None,
    visit_date: Annotated[str | None, Query(description="Filter by visit date")] = None,
):
    records = get_patient_medical_records(
        patient_id=patient_id,
        category=category,
        search=search,
        visit_date=visit_date,
    )
    return [format_record_for_api(r) for r in records]


@router.post(
    "/{record_id}/ask",
    response_model=AskQuestionResponse,
    summary="Ask AI a Question About an Analyzed Document",
    description="Interactive Q&A to answer patient questions based on doctor notes or X-ray findings.",
)
async def ask_question_on_document(
    record_id: str,
    body: AskQuestionRequest,
):
    record = get_medical_record_by_id(record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical record '{record_id}' not found",
        )

    structured_data = record.get("structured_data")
    if not isinstance(structured_data, dict):
        structured_data = {}

    answer = await ask_question_about_document(
        document_context=structured_data,
        question=body.question,
        language=body.language,
    )

    return {
        "document_id": record_id,
        "question": body.question,
        "answer": answer,
        "language": body.language,
    }
