"""Storage service for handling uploaded medical documents, prescriptions, and scans."""

import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings

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


async def save_uploaded_file(file: UploadFile, subfolder: str = "documents") -> dict[str, str]:
    """Save an uploaded file to local disk and return storage metadata."""
    original_name = file.filename or "medical_upload.jpg"
    ext = Path(original_name).suffix.lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    
    # Read file content
    content = await file.read()
    size_bytes = len(content)
    
    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 25MB (got {format_file_size(size_bytes)})",
        )
    
    # Generate unique filename
    target_dir = settings.UPLOAD_DIR / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4().hex[:12]}_{original_name.replace(' ', '_')}"
    file_path = target_dir / unique_filename
    
    # Write file asynchronously
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    # Relative URL for static mount
    file_url = f"/uploads/{subfolder}/{unique_filename}"
    
    return {
        "file_name": original_name,
        "saved_filename": unique_filename,
        "file_path": str(file_path),
        "file_url": file_url,
        "file_size": format_file_size(size_bytes),
        "mime_type": file.content_type or "application/octet-stream",
        "raw_bytes": content,
    }
