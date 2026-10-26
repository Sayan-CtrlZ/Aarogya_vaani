"""End-to-end automated test suite for AarogyaVaani Medical Intelligence routes.

Tests:
1. Health & Service Status
2. Unified Medical Document Analyzer (/api/documents/analyze)
3. Dedicated Prescription Analyzer (/api/prescriptions/analyze)
4. Dedicated Lab Report Analyzer (/api/lab-reports/analyze)
5. Dedicated Radiology / X-Ray Analyzer (/api/xray-radiology/analyze)
6. Document Retrieval & Patient Document Listing
7. Consolidated Clinical Context for Voice Agent (/api/patients/{id}/context)
8. Interactive Clinical Document Q&A (/api/documents/{id}/ask)
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

# Ensure SQLite tables exist
init_db()

SAMPLES_DIR = Path(__file__).resolve().parent / "samples"
PRESCRIPTION_PATH = SAMPLES_DIR / "sample_prescription.jpg"
LAB_REPORT_PATH = SAMPLES_DIR / "sample_lab_report.jpg"
XRAY_PATH = SAMPLES_DIR / "sample_xray.jpg"

client = TestClient(app)


def test_health_and_service_info():
    """Verify backend health and model configuration endpoints."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

    resp_root = client.get("/")
    assert resp_root.status_code == 200
    root_data = resp_root.json()
    assert root_data["status"] == "online"
    assert "AarogyaVaani" in root_data["service"]
    assert "gemini" in root_data["primary_vision_model"]


def test_unified_document_analyze_prescription():
    """Verify unified document route with sample prescription."""
    assert PRESCRIPTION_PATH.exists(), f"Sample not found: {PRESCRIPTION_PATH}"
    
    with open(PRESCRIPTION_PATH, "rb") as f:
        response = client.post(
            "/api/documents/analyze",
            files={"file": ("sample_prescription.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-TEST-001",
                "category": "Prescription",
                "title": "Dr. Mukherjee OPD Prescription",
                "facility": "Aarogya Health Clinic",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    
    # Assert top-level metadata
    assert record["id"].startswith("doc_")
    assert record["patient_id"] == "AV-TEST-001"
    assert record["record_type"] == "prescription"
    assert record["analysis_status"] == "COMPLETED"
    assert record["file_name"] == "sample_prescription.jpg"
    
    # Assert multilingual summaries
    patient_summary = record.get("patient_summary", {})
    assert len(patient_summary.get("english", "")) > 10, "English summary missing"
    assert len(patient_summary.get("hindi", "")) > 5, "Hindi summary missing"
    assert len(patient_summary.get("bengali", "")) > 5, "Bengali summary missing"
    
    # Assert extracted clinical entities
    parsed = record.get("structured_data", {})
    meds = parsed.get("medications") or parsed.get("clinical_entities", {}).get("medications", [])
    assert len(meds) > 0, f"No medications extracted from structured_data: {parsed}"
    
    # Check for known prescribed meds from sample
    med_names = [m.get("name", "").lower() for m in meds]
    assert any("amox" in m or "paracetamol" in m or "pantop" in m or "dolo" in m for m in med_names), f"Expected meds not found in: {med_names}"
    print(f"\n[PASS] Extracted {len(meds)} medications: {[m.get('name') for m in meds]}")


def test_unified_document_analyze_lab_report():
    """Verify unified document route with sample CBC lab report."""
    assert LAB_REPORT_PATH.exists(), f"Sample not found: {LAB_REPORT_PATH}"
    
    with open(LAB_REPORT_PATH, "rb") as f:
        response = client.post(
            "/api/documents/analyze",
            files={"file": ("sample_lab_report.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-TEST-001",
                "category": "Lab Report",
                "facility": "Apex Clinical Diagnostics",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    assert record["id"].startswith("doc_")
    assert record["record_type"] == "lab_report"
    
    parsed = record.get("structured_data", {})
    metrics = parsed.get("metrics") or parsed.get("clinical_entities", {}).get("lab_metrics", [])
    assert len(metrics) > 0, f"Lab metrics missing from structured_data: {parsed}"
    
    # Check for low hemoglobin or high WBC
    test_names = [m.get("test_name", "").lower() for m in metrics]
    assert any("hemo" in t or "hb" in t or "wbc" in t or "leukocyte" in t or "rbc" in t for t in test_names)
    print(f"\n[PASS] Extracted {len(metrics)} lab metrics: {[m.get('test_name') for m in metrics]}")


def test_unified_document_analyze_xray():
    """Verify unified document route with sample Chest X-Ray."""
    assert XRAY_PATH.exists(), f"Sample not found: {XRAY_PATH}"
    
    with open(XRAY_PATH, "rb") as f:
        response = client.post(
            "/api/documents/analyze",
            files={"file": ("sample_xray.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-TEST-001",
                "category": "Radiology / X-Ray",
                "facility": "Apex Medical Imaging",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    assert record["id"].startswith("doc_")
    assert record["record_type"] == "xray_radiology"
    
    parsed = record.get("structured_data", {})
    has_findings = bool(
        parsed.get("radiological_findings") 
        or parsed.get("impression") 
        or parsed.get("clinical_entities", {}).get("imaging_findings")
    )
    assert has_findings, f"Radiology findings missing: {parsed}"
    print(f"\n[PASS] Extracted X-Ray Impression: {parsed.get('impression')}")


def test_dedicated_prescription_route():
    """Verify dedicated POST /api/prescriptions/analyze route."""
    with open(PRESCRIPTION_PATH, "rb") as f:
        response = client.post(
            "/api/prescriptions/analyze",
            files={"file": ("sample_prescription.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-DEDICATED-01",
                "facility": "Apollo Clinic",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    assert record["id"].startswith("rx_")
    assert record["record_type"] == "prescription"
    assert record["patient_id"] == "AV-DEDICATED-01"
    
    # Verify patient prescription list
    list_resp = client.get("/api/prescriptions/patient/AV-DEDICATED-01")
    assert list_resp.status_code == 200
    prescriptions = list_resp.json()
    assert len(prescriptions) >= 1
    assert prescriptions[0]["id"] == record["id"]


def test_dedicated_lab_report_route():
    """Verify dedicated POST /api/lab-reports/analyze route."""
    with open(LAB_REPORT_PATH, "rb") as f:
        response = client.post(
            "/api/lab-reports/analyze",
            files={"file": ("sample_lab_report.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-DEDICATED-01",
                "lab_name": "Lal PathLabs",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    assert record["id"].startswith("lab_")
    assert record["record_type"] == "lab_report"
    
    # Verify patient lab reports list
    list_resp = client.get("/api/lab-reports/patient/AV-DEDICATED-01")
    assert list_resp.status_code == 200
    labs = list_resp.json()
    assert len(labs) >= 1
    assert labs[0]["id"] == record["id"]


def test_dedicated_xray_route():
    """Verify dedicated POST /api/xray-radiology/analyze route."""
    with open(XRAY_PATH, "rb") as f:
        response = client.post(
            "/api/xray-radiology/analyze",
            files={"file": ("sample_xray.jpg", f, "image/jpeg")},
            data={
                "patient_id": "AV-DEDICATED-01",
                "body_part": "Chest PA View",
                "clinical_history": "Productive cough and fever for 3 days",
                "facility": "Govt Medical College Hospital",
            },
        )
    
    assert response.status_code == 201, f"Failed: {response.text}"
    record = response.json()
    assert record["id"].startswith("xray_")
    assert record["record_type"] == "xray_radiology"
    
    # Verify patient xrays list
    list_resp = client.get("/api/xray-radiology/patient/AV-DEDICATED-01")
    assert list_resp.status_code == 200
    xrays = list_resp.json()
    assert len(xrays) >= 1
    assert xrays[0]["id"] == record["id"]


def test_patient_clinical_context_for_voice_agent():
    """Verify GET /api/patients/{id}/context generates synthesized briefing for LiveKit Voice Agent."""
    resp = client.get("/api/patients/AV-TEST-001/context")
    assert resp.status_code == 200
    ctx = resp.json()
    
    assert ctx["patient_id"] == "AV-TEST-001"
    assert ctx["total_records"] >= 3
    assert len(ctx["active_medications"]) > 0
    assert len(ctx["synthesized_voice_briefing"]) > 20
    
    print("\n[PASS] Voice Agent Briefing:")
    print(ctx["synthesized_voice_briefing"])


def test_ask_question_on_prescription():
    """Verify POST /api/documents/{id}/ask answers patient questions using document context."""
    # First get records for patient
    resp = client.get("/api/documents/patient/AV-TEST-001")
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) > 0
    
    rx_record = next(r for r in records if r["record_type"] == "prescription")
    record_id = rx_record["id"]
    
    # Ask in English
    q_resp_en = client.post(
        f"/api/documents/{record_id}/ask",
        json={
            "question": "What is the dosage of Amoxicillin and when should I take it?",
            "language": "en-IN",
        },
    )
    assert q_resp_en.status_code == 200
    en_answer = q_resp_en.json()["answer"]
    assert len(en_answer) > 10
    print(f"\n[PASS] Question Answer (English): {en_answer[:120]}...")
    
    # Ask in Bengali
    q_resp_bn = client.post(
        f"/api/documents/{record_id}/ask",
        json={
            "question": "আমি প্যারাসিটামল ওষুধটি কখন খাব?",
            "language": "bn-IN",
        },
    )
    assert q_resp_bn.status_code == 200
    bn_answer = q_resp_bn.json()["answer"]
    assert len(bn_answer) > 5
    print(f"\n[PASS] Question Answer (Bengali): {bn_answer[:120]}...")
