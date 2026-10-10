import pymupdf as fitz  # PyMuPDF
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
from app.utils.logging import logger


def process_pdf_document(pdf_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Processes a PDF file using PyMuPDF.
    1. Validates PDF integrity & page count limit.
    2. Extracts text per page.
    3. If page text is sparse/scanned, renders page to PNG image (200 DPI) for Claude Vision.
    4. Preserves page_number for page-level traceability.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logger.warning("PDF open failed for %s: %s", filename, str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_FILE",
                "message": f"Corrupted or invalid PDF file: {str(e)}"
            }
        )

    page_count = doc.page_count
    if page_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_FILE",
                "message": "PDF document contains 0 pages."
            }
        )

    if page_count > settings.MAX_PDF_PAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "PDF_TOO_MANY_PAGES",
                "message": f"PDF has {page_count} pages, which exceeds the limit of {settings.MAX_PDF_PAGES} pages."
            }
        )

    pages_data: List[Dict[str, Any]] = []
    total_text_length = 0

    for page_num in range(1, page_count + 1):
        page = doc.load_page(page_num - 1)
        text = page.get_text("text").strip()
        text_len = len(text)
        total_text_length += text_len

        # If text is minimal (<50 chars), render page to image for Vision OCR
        is_scanned = text_len < 50
        page_image_bytes = None

        if is_scanned or page_count <= settings.MAX_PDF_PAGES:
            # Render page image (200 DPI = matrix 2.0x2.0)
            pix = page.get_pixmap(dpi=200)
            page_image_bytes = pix.tobytes("png")

        pages_data.append({
            "page_number": page_num,
            "text": text,
            "is_scanned": is_scanned,
            "image_bytes": page_image_bytes
        })

    has_extractable_text = total_text_length > (100 * page_count)

    doc.close()

    return {
        "page_count": page_count,
        "has_extractable_text": has_extractable_text,
        "pages": pages_data
    }
