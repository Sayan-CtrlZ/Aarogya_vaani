import os
from typing import Tuple
from fastapi import HTTPException, status
from app.core.config import settings

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/x-pdf"
}


def validate_file_metadata(filename: str, content_type: str, file_size: int) -> Tuple[str, str]:
    """
    Validates file extension, MIME type, and size limit.
    Returns (clean_filename, extension).
    """
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_FILE",
                "message": "Filename is required."
            }
        )

    _, ext = os.path.splitext(filename.lower())

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": f"Unsupported file extension '{ext}'. Allowed types: PDF, JPG, JPEG, PNG, WEBP."
            }
        )

    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": f"Unsupported MIME type '{content_type}'. Allowed types: PDF, JPG, JPEG, PNG, WEBP."
            }
        )

    if file_size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB} MB."
            }
        )

    return filename, ext
