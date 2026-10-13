"""Storage service for handling uploaded medical documents, prescriptions, and scans via Supabase Storage."""

import re
import uuid
from pathlib import Path
from typing import Any
from fastapi import UploadFile, HTTPException

from app.db.supabase_client import (
    VAULT_BUCKET_NAME,
    upload_to_storage_vault,
    get_signed_file_url,
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".bmp"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


def format_file_size(size_bytes: int) -> str:
    """Format bytes into readable size string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and remove unsupported characters."""
    clean = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
    return clean or "medical_upload.jpg"


def create_signed_document_url(storage_path: str, expiry: int = 900) -> str:
    """Create a temporary signed URL (default 15 minutes) for a private Supabase Storage object."""
    return get_signed_file_url(storage_path, expires_in_seconds=expiry)


async def save_uploaded_file(
    file: UploadFile,
    patient_id: str = "AV-2026-8921",
    subfolder: str = "medical_vault",
) -> dict[str, Any]:
    """Upload file directly to Supabase Storage private bucket and return metadata."""
    original_name = file.filename or "medical_upload.jpg"
    ext = Path(original_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Read binary bytes
    content = await file.read()
    size_bytes = len(content)

    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 25MB (got {format_file_size(size_bytes)})",
        )

    clean_name = sanitize_filename(original_name)
    clean_patient = sanitize_filename(patient_id)
    unique_prefix = uuid.uuid4().hex[:10]
    saved_filename = f"{unique_prefix}_{clean_name}"

    # Supabase Storage path: {patient_id}/{subfolder}/{unique_id}_{filename}
    storage_path = f"{clean_patient}/{subfolder}/{saved_filename}"
    mime_type = file.content_type or "image/jpeg"

    # Upload directly to Supabase Storage private bucket
    try:
        upload_to_storage_vault(
            storage_path=storage_path,
            file_bytes=content,
            content_type=mime_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to persist file in Supabase Storage vault: {str(e)}",
        )

    # Generate short-lived signed URL for immediate preview/client access
    file_url = create_signed_document_url(storage_path, expiry=900)

    return {
        "file_name": original_name,
        "saved_filename": saved_filename,
        "storage_path": storage_path,
        "file_path": storage_path,  # Kept for backward compatibility
        "file_url": file_url,
        "file_size": format_file_size(size_bytes),
        "mime_type": mime_type,
        "raw_bytes": content,
    }
