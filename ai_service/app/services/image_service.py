import io
from typing import Tuple
from PIL import Image, ImageOps
from fastapi import HTTPException, status
from app.utils.logging import logger


def validate_and_preprocess_image(image_bytes: bytes, original_filename: str) -> Tuple[bytes, str, int, int]:
    """
    Validates image readability using Pillow, corrects orientation,
    converts unsupported modes to RGB, and returns (processed_bytes, mime_type, width, height).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify image integrity
    except Exception as e:
        logger.warning("Image verification failed for %s: %s", original_filename, str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_IMAGE",
                "message": f"Corrupted or unreadable image file: {str(e)}"
            }
        )

    # Re-open after verify (PIL requirement)
    image = Image.open(io.BytesIO(image_bytes))

    # Correct EXIF orientation if available
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    width, height = image.size
    if width < 50 or height < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_IMAGE",
                "message": f"Image resolution ({width}x{height}) is too small to extract text."
            }
        )

    # Convert mode to RGB if RGBA, CMYK, P, L, etc.
    mime_type = "image/jpeg"
    if image.format == "PNG":
        mime_type = "image/png"
    elif image.format == "WEBP":
        mime_type = "image/webp"

    output_format = "JPEG"
    if mime_type == "image/png":
        output_format = "PNG"
    elif mime_type == "image/webp":
        output_format = "WEBP"

    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
        mime_type = "image/jpeg"
        output_format = "JPEG"

    # Mild contrast and sharpness enhancement to make ink lines stand out over background watermarks
    try:
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        sharpener = ImageEnhance.Sharpness(image)
        image = sharpener.enhance(1.3)
    except Exception:
        pass

    # Resize only if excessively large (>4096px in any dimension) while preserving details
    max_dim = 4096
    if width > max_dim or height > max_dim:
        image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        width, height = image.size

    output_io = io.BytesIO()
    image.save(output_io, format=output_format, quality=92)
    processed_bytes = output_io.getvalue()

    return processed_bytes, mime_type, width, height
