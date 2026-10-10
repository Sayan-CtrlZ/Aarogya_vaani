import time
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, status, HTTPException
from app.services.huggingface_service import huggingface_service
from app.utils.file_validation import validate_file_metadata, ALLOWED_IMAGE_EXTENSIONS
from app.core.security import sanitize_filename
from app.utils.logging import logger

router = APIRouter()


@router.post(
    "/analyze",
    status_code=status.HTTP_200_OK,
    summary="Analyze Chest X-Ray / Radiology image (Hulu-Med VLM)",
    description="Uploads a Chest X-Ray or radiology scan image (JPG, PNG, WEBP). Uses Hulu-Med VLM via Hugging Face Serverless API to extract anatomical findings, visual abnormalities, and radiological impression."
)
async def analyze_radiology_scan(
    xray_file: UploadFile = File(..., description="Upload Chest X-Ray or Radiology image file (JPG, PNG, WEBP) directly from computer"),
    prompt: Optional[str] = Form(None, description="Optional custom radiologist query or hint"),
    language: Optional[str] = Form("English", description="Optional patient language preference"),
    patient_id: Optional[str] = Form(None, description="Optional patient ID")
):
    start_time = time.time()
    raw_filename = xray_file.filename or "xray_scan.jpg"
    clean_name = sanitize_filename(raw_filename)

    content_bytes = await xray_file.read()
    file_size = len(content_bytes)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_FILE", "message": "The uploaded X-ray image file is empty."}
        )

    clean_name, ext = validate_file_metadata(
        filename=clean_name,
        content_type=xray_file.content_type,
        file_size=file_size
    )

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "UNSUPPORTED_RADIOLOGY_FORMAT", "message": "Radiology X-ray analysis requires a valid image file (JPG, PNG, WEBP)."}
        )

    logger.info("Starting dedicated Radiology Hulu-Med analysis filename=%s size=%d", clean_name, file_size)

    result = await huggingface_service.analyze_radiology_xray(
        image_bytes=content_bytes,
        filename=clean_name,
        prompt=prompt
    )

    processing_time_ms = int((time.time() - start_time) * 1000)
    document_id = f"rad_{uuid.uuid4()}"

    return {
        "success": True,
        "document_id": document_id,
        "patient_id": patient_id,
        "processing_time_ms": processing_time_ms,
        "model_used": result.get("model_used"),
        "filename": clean_name,
        "radiology_findings": result.get("radiology_findings"),
        "impression": result.get("impression"),
        "investigations": result.get("investigations"),
        "diagnoses": result.get("diagnoses"),
        "warnings": result.get("warnings")
    }
