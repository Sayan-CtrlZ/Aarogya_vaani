import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(autouse=True)
def enable_mock_ai():
    original = settings.ENABLE_MOCK_AI
    settings.ENABLE_MOCK_AI = True
    yield
    settings.ENABLE_MOCK_AI = original


def create_sample_xray_bytes() -> bytes:
    img = Image.new("RGB", (400, 400), color=(100, 100, 100))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_analyze_radiology_scan_endpoint():
    img_bytes = create_sample_xray_bytes()
    response = client.post(
        "/api/v1/radiology/analyze",
        files={"xray_file": ("chest_xray.jpg", img_bytes, "image/jpeg")},
        data={"prompt": "Check for lung opacity", "patient_id": "P-9876"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "document_id" in data
    assert data["patient_id"] == "P-9876"
    assert "radiology_findings" in data
    assert "impression" in data
