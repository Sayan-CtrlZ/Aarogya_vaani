"""Tests for ChatGPT-style Voice Interaction REST API & Supabase Retrieval.

Validates:
1. POST /api/orchestrator/voice/chat creates or updates a consultation session
2. Response contains clinical response, suggested follow-up chips, triage level, and timestamp
3. GET /api/orchestrator/consultations/patient/{patient_id} retrieves recorded transcripts
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
TEST_PATIENT_REF = "AV-2026-4454"


def test_voice_chat_turn_endpoint():
    """Verify POST /api/orchestrator/voice/chat handles conversational turns and persists to Supabase."""
    payload = {
        "consultation_id": None,
        "patient_id": TEST_PATIENT_REF,
        "user_message": "মাথা খুব ঘুরছে আর দুর্বল লাগছে",
        "language": "bn-IN",
        "history": []
    }
    resp = client.post("/api/orchestrator/voice/chat", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    data = resp.json()
    assert "ai_message" in data and len(data["ai_message"]) > 0
    assert "suggested_options" in data and isinstance(data["suggested_options"], list)
    assert "triage_level" in data
    assert "consultation_id" in data and data["consultation_id"] is not None
    assert "display_time" in data

    consultation_id = data["consultation_id"]

    # Verify subsequent turn appends to the same consultation
    second_payload = {
        "consultation_id": consultation_id,
        "patient_id": TEST_PATIENT_REF,
        "user_message": "আজ সকাল থেকে এই সমস্যা হচ্ছে",
        "language": "bn-IN",
        "history": [
            {"role": "user", "text": "মাথা খুব ঘুরছে আর দুর্বল লাগছে"},
            {"role": "assistant", "text": data["ai_message"]}
        ]
    }
    resp2 = client.post("/api/orchestrator/voice/chat", json=second_payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["consultation_id"] == consultation_id


def test_patient_consultation_retrieval():
    """Verify GET /api/orchestrator/consultations/patient/{patient_id} returns Supabase consultation history."""
    resp = client.get(f"/api/orchestrator/consultations/patient/{TEST_PATIENT_REF}")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    consultations = resp.json()
    assert isinstance(consultations, list)
    assert len(consultations) > 0, "Expected at least 1 persisted consultation from previous test"

    first = consultations[0]
    assert "id" in first
    assert "patient_id" in first
    assert first["patient_id"] == TEST_PATIENT_REF
    assert "transcript" in first
    assert isinstance(first["transcript"], list)
    assert "triage_level" in first
