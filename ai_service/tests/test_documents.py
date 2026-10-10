import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import pymupdf as fitz
from app.main import app
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(autouse=True)
def enable_mock_ai():
    original = settings.ENABLE_MOCK_AI
    settings.ENABLE_MOCK_AI = True
    yield
    settings.ENABLE_MOCK_AI = original


def create_sample_png_bytes() -> bytes:
    img = Image.new("RGB", (300, 300), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_sample_jpg_bytes() -> bytes:
    img = Image.new("RGB", (300, 300), color=(240, 240, 240))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_sample_webp_bytes() -> bytes:
    img = Image.new("RGB", (300, 300), color=(200, 200, 200))
    buf = io.BytesIO()
    img.save(buf, format="WEBP")
    return buf.getvalue()


def create_sample_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Patient Name: Jane Doe. Hemoglobin: 10.2 g/dL (Ref: 12-16).")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_analyze_single_file():
    img_bytes = create_sample_png_bytes()
    response = client.post(
        "/api/v1/documents/analyze",
        files=[("files", ("prescription.png", img_bytes, "image/png"))],
        data={"document_type": "prescription", "language": "English"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "request_id" in data
    assert data["processing"]["status"] == "completed"
    assert data["processing"]["documents_received"] == 1
    assert data["processing"]["documents_processed"] == 1
    assert data["processing"]["documents_failed"] == 0
    assert len(data["documents"]) == 1
    assert data["documents"][0]["filename"] == "prescription.png"
    assert data["documents"][0]["status"] == "completed"

    req_id = data["request_id"]

    # Test retrieval by ID
    get_resp = client.get(f"/api/v1/documents/{req_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["request_id"] == req_id

    # Test summary retrieval
    summary_resp = client.get(f"/api/v1/documents/{req_id}/summary")
    assert summary_resp.status_code == 200
    assert "clinical_summary" in summary_resp.json()

    # Test highlights retrieval
    highlights_resp = client.get(f"/api/v1/documents/{req_id}/highlights")
    assert highlights_resp.status_code == 200
    assert "important_findings" in highlights_resp.json()


def test_dedicated_upload_fields():
    png_bytes = create_sample_png_bytes()
    pdf_bytes = create_sample_pdf_bytes()
    jpg_bytes = create_sample_jpg_bytes()

    # Test uploading prescription_file, image_file, and document_file individually or together
    response = client.post(
        "/api/v1/documents/analyze",
        files=[
            ("prescription_file", ("prescription.png", png_bytes, "image/png")),
            ("image_file", ("photo.jpg", jpg_bytes, "image/jpeg")),
            ("document_file", ("lab_report.pdf", pdf_bytes, "application/pdf"))
        ],
        data={"generate_summary": "true"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["processing"]["documents_received"] == 3
    assert data["processing"]["documents_processed"] == 3


def test_analyze_multi_file_batch():
    img_bytes = create_sample_png_bytes()
    pdf_bytes = create_sample_pdf_bytes()
    jpg_bytes = create_sample_jpg_bytes()

    response = client.post(
        "/api/v1/documents/analyze",
        files=[
            ("files", ("prescription.png", img_bytes, "image/png")),
            ("files", ("lab_report.pdf", pdf_bytes, "application/pdf")),
            ("files", ("discharge_summary.jpg", jpg_bytes, "image/jpeg"))
        ],
        data={"document_type": "auto", "generate_summary": "true"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["processing"]["status"] == "completed"
    assert data["processing"]["documents_received"] == 3
    assert data["processing"]["documents_processed"] == 3
    assert data["processing"]["documents_failed"] == 0
    assert len(data["documents"]) == 3


def test_analyze_mixed_formats():
    png_bytes = create_sample_png_bytes()
    jpg_bytes = create_sample_jpg_bytes()
    webp_bytes = create_sample_webp_bytes()
    pdf_bytes = create_sample_pdf_bytes()

    response = client.post(
        "/api/v1/documents/analyze",
        files=[
            ("files", ("doc1.png", png_bytes, "image/png")),
            ("files", ("doc2.jpg", jpg_bytes, "image/jpeg")),
            ("files", ("doc3.webp", webp_bytes, "image/webp")),
            ("files", ("doc4.pdf", pdf_bytes, "application/pdf"))
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["processing"]["documents_processed"] == 4


def test_partial_failure_support():
    img_bytes = create_sample_png_bytes()
    corrupted_bytes = b"NOT_A_VALID_IMAGE_OR_PDF_HEADER_DATA"

    response = client.post(
        "/api/v1/documents/analyze",
        files=[
            ("files", ("valid_prescription.png", img_bytes, "image/png")),
            ("files", ("corrupted_file.pdf", corrupted_bytes, "application/pdf"))
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["processing"]["status"] == "partial"
    assert data["processing"]["documents_received"] == 2
    assert data["processing"]["documents_processed"] == 1
    assert data["processing"]["documents_failed"] == 1

    docs = data["documents"]
    assert docs[0]["status"] == "completed"
    assert docs[1]["status"] == "failed"
    assert docs[1]["error"]["code"] == "INVALID_DOCUMENT"


def test_unsupported_file_type():
    img_bytes = create_sample_png_bytes()
    response = client.post(
        "/api/v1/documents/analyze",
        files=[
            ("files", ("valid.png", img_bytes, "image/png")),
            ("files", ("malicious.exe", b"MZ executable header", "application/octet-stream"))
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["processing"]["status"] == "partial"
    assert data["processing"]["documents_failed"] == 1
    assert data["documents"][1]["error"]["code"] == "INVALID_DOCUMENT"


def test_empty_upload_validation():
    response = client.post(
        "/api/v1/documents/analyze",
        files=[]
    )
    assert response.status_code in [422, 400]
