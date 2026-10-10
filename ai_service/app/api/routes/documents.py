from typing import Optional, List, Union, Any
from fastapi import APIRouter, UploadFile, File, Form, status, HTTPException
from app.schemas.responses import DocumentAnalysisResponse
from app.services.document_service import document_service

router = APIRouter()


def _is_valid_upload_file(item: Any) -> bool:
    return (
        hasattr(item, "filename")
        and hasattr(item, "file")
        and isinstance(getattr(item, "filename", None), str)
        and len(item.filename.strip()) > 0
    )


def _extract_all_uploaded_files(
    prescription_file: Any = None,
    image_file: Any = None,
    document_file: Any = None,
    files: Any = None
) -> List[UploadFile]:
    upload_list: List[UploadFile] = []
    for f in [prescription_file, image_file, document_file]:
        if _is_valid_upload_file(f):
            upload_list.append(f)
    if files:
        file_items = files if isinstance(files, list) else [files]
        for item in file_items:
            if _is_valid_upload_file(item):
                upload_list.append(item)
    return upload_list


@router.post(
    "/analyze",
    response_model=DocumentAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze uploaded medical documents or images (Prescription, Photo, or Lab Copy)",
    description="Upload prescription file, medical photo/image, or lab report document directly from your computer (Single or Multiple). Performs vision OCR analysis with Claude API, extracts structured medical entities, validates lab values, and generates a unified clinical summary."
)
async def analyze_documents(
    prescription_file: Optional[Union[UploadFile, str]] = File(None, description="Upload Prescription file directly from computer (PDF, JPG, PNG, WEBP)"),
    image_file: Optional[Union[UploadFile, str]] = File(None, description="Upload Medical Photo / Image directly from computer (JPG, PNG, WEBP)"),
    document_file: Optional[Union[UploadFile, str]] = File(None, description="Upload Lab Report / PDF / Document directly from computer (PDF, JPG, PNG)"),
    files: Optional[Union[List[Union[UploadFile, str]], UploadFile, str]] = File(None, description="Additional medical document files (PDF, JPG, PNG, WEBP)"),
    document_type: Optional[str] = Form("auto", description="Optional hint: auto | prescription | lab_report | discharge_summary | etc."),
    language: Optional[str] = Form("English", description="Optional patient language preference (e.g. English, Bengali, Hindi)"),
    patient_id: Optional[str] = Form(None, description="Optional patient ID to associate with extraction"),
    generate_summary: bool = Form(True, description="Whether to generate a unified clinical summary across uploaded documents")
):
    upload_list = _extract_all_uploaded_files(
        prescription_file=prescription_file,
        image_file=image_file,
        document_file=document_file,
        files=files
    )

    if not upload_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "NO_FILES_PROVIDED", "message": "Please upload at least one prescription, image, or medical document."}
        )

    return await document_service.process_and_analyze_documents(
        files=upload_list,
        user_doc_type=document_type,
        language=language,
        patient_id=patient_id,
        generate_summary=generate_summary
    )


@router.get(
    "/{document_id}",
    response_model=DocumentAnalysisResponse,
    summary="Get analyzed document or request batch by ID",
    description="Retrieves the complete processed document analysis structure by request_id or document_id."
)
def get_document_by_id(document_id: str):
    return document_service.get_document(document_id)


@router.get(
    "/{document_id}/summary",
    summary="Get physician clinical summary by ID",
    description="Retrieves only the formatted clinical summary for physician review."
)
def get_document_summary(document_id: str):
    doc_response = document_service.get_document(document_id)
    return {
        "request_id": doc_response.request_id,
        "clinical_summary": doc_response.clinical_summary
    }


@router.get(
    "/{document_id}/highlights",
    summary="Get important findings & highlights by ID",
    description="Retrieves out-of-range lab results, warnings, and important findings."
)
def get_document_highlights(document_id: str):
    doc_response = document_service.get_document(document_id)
    return {
        "request_id": doc_response.request_id,
        "important_findings": doc_response.combined.important_findings,
        "warnings": doc_response.warnings
    }
