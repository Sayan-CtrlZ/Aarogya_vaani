"""Comprehensive Automated Tests for AI Doctor Voice & Chat REST API with Supabase Persistence."""

import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ai_doctor_chat_turn_endpoint():
    """Test text chat consultation endpoint with Gemini and Supabase persistence."""
    payload = {
        "consultation_id": None,
        "patient_id": "AV-2026-8921",
        "user_name": "Pooja Debbarma",
        "user_message": "I have fever and severe headache for 2 days",
        "language": "en-IN",
        "history": [],
        "attached_document": None,
    }

    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200, f"Error: {response.text}"

    data = response.json()
    assert "consultation_id" in data
    assert data["consultation_id"].startswith("con_") or len(data["consultation_id"]) > 5
    assert data["user_name"] == "Pooja Debbarma"
    assert "ai_message" in data and len(data["ai_message"]) > 0
    assert data["language"] == "en-IN"
    assert "triage_level" in data
    assert isinstance(data.get("suggested_options"), list)
    assert "display_time" in data


def test_ai_doctor_voice_turn_emergency_detection_bengali():
    """Test voice speech turn in Bengali detecting emergency danger signs."""
    payload = {
        "consultation_id": None,
        "patient_id": "AV-2026-8921",
        "user_name": "সুনীতা দেববর্মা",
        "user_message": "আমার বুকে তীব্র ব্যথা এবং শ্বাসকষ্ট হচ্ছে",
        "language": "bn-IN",
        "history": [],
    }

    response = client.post("/api/ai/voice", json=payload)
    assert response.status_code == 200, f"Error: {response.text}"

    data = response.json()
    assert data["user_name"] == "সুনীতা দেববর্মা"
    assert data["triage_level"] == "EMERGENCY"
    assert len(data.get("danger_signs", [])) > 0
    assert "ai_message" in data


def test_ai_doctor_attached_document_query():
    """Test AI Doctor turn with attached lab pathology report."""
    payload = {
        "consultation_id": None,
        "patient_id": "AV-2026-8921",
        "user_name": "Ramesh Kumar",
        "user_message": "What does my HbA1c value mean in this report?",
        "language": "en-IN",
        "history": [],
        "attached_document": {
            "id": "doc_lab_982",
            "title": "Complete Blood Count & Diabetic Panel",
            "category": "Lab Report",
            "structured_data": {
                "HbA1c": "8.4 %",
                "Fasting Blood Sugar": "180 mg/dL",
                "Hemoglobin": "12.1 g/dL",
            },
            "summary_en": "Elevated HbA1c indicating suboptimal glycemic regulation.",
        },
    }

    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200, f"Error: {response.text}"

    data = response.json()
    assert data["consultation_id"]
    assert data["user_name"] == "Ramesh Kumar"
    assert len(data["ai_message"]) > 10


def test_save_ai_consultation_endpoint():
    """Test saving a completed consultation session with user_name to Supabase."""
    unique_id = f"con_test_{uuid.uuid4().hex[:8]}"
    payload = {
        "id": unique_id,
        "patient_id": "AV-2026-8921",
        "user_name": "Pooja Debbarma",
        "language_used": "bn-IN",
        "chief_complaint": "Persistent cough and sore throat",
        "duration_seconds": 65,
        "transcript": [
            {"role": "user", "text": "আমার ২ দিন ধরে কাশি হচ্ছে", "display_time": "10:15 AM"},
            {"role": "agent", "text": "কাশি নিয়ে উদ্বিগ্ন হবেন না। গরম জল খান।", "display_time": "10:15 AM"},
        ],
        "danger_signs": [],
        "triage_level": "STABLE",
        "clinical_summary": "Stable presentation of acute upper respiratory cough.",
    }

    response = client.post("/api/ai/consultation/save", json=payload)
    assert response.status_code == 201, f"Error: {response.text}"

    data = response.json()
    assert data["id"] == unique_id
    assert data.get("user_name") == "Pooja Debbarma"
    assert data["patient_id"] == "AV-2026-8921"
