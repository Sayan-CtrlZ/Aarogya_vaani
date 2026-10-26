"""Automated test suite for unified clinical intake, danger-sign rules, and new patient logic in FastAPI server."""

import pytest
import asyncio
from fastapi.testclient import TestClient

from app.main import app
from app.rules.danger_signs import (
    evaluate_danger_signs,
    get_emergency_guidance,
    get_triage_decision,
)
from app.db.supabase_client import get_patient_dossier
from app.services.gemini_analyzer import (
    _build_fallback_chat_turn,
    generate_conversational_health_turn,
)


client = TestClient(app)


# ==============================================================================
# 1. Hardened Danger Signs Test
# ==============================================================================

def test_danger_signs_rules():
    """Verify that innocent phrases are safe and emergencies are detected."""
    # Innocent phrases: must NOT trigger any flags
    safe_turns = [
        "Yes, I understand what you are saying.",
        "হ্যাঁ, আমি বুঝতে পারছি।",
        "हाँ, मैं ठीक हूँ।",
        "Mild body ache since morning",
    ]
    for text in safe_turns:
        flags = evaluate_danger_signs(free_text=text)
        assert len(flags) == 0, f"False positive flag on safe phrase: '{text}' -> {flags}"
        assert get_triage_decision(flags) == "ROUTINE"

    # Emergency: Chest pain
    flags = evaluate_danger_signs(free_text="Doctor, I have severe chest pain and crushing pressure on my chest")
    assert len(flags) > 0
    assert any(f["rule_id"] == "acute_chest_pain" for f in flags)
    assert get_triage_decision(flags) == "ESCALATE"

    # Emergency: Vaginal bleeding
    flags_bleeding = evaluate_danger_signs(free_text="যোনিপথে অনেক রক্তপাত হচ্ছে")
    assert len(flags_bleeding) > 0
    assert any(f["rule_id"] == "vaginal_bleeding" for f in flags_bleeding)
    assert get_triage_decision(flags_bleeding) == "ESCALATE"

    # Emergency: Severe preeclampsia headache
    flags_ha = evaluate_danger_signs(free_text="অসহ্য মাথা ব্যথা এবং চোখে ঝাপসা দেখছি")
    assert len(flags_ha) > 0
    assert any(f["rule_id"] == "severe_headache_preeclampsia" for f in flags_ha)
    assert get_triage_decision(flags_ha) == "ESCALATE"

    # Multilingual emergency guidance
    guidance_bn = get_emergency_guidance(flags_ha, "bn-IN")
    assert "জরুরী চিকিৎসা" in guidance_bn or "১০৮" in guidance_bn

    guidance_hi = get_emergency_guidance(flags_ha, "hi-IN")
    assert "आपातकालीन" in guidance_hi or "108" in guidance_hi

    guidance_en = get_emergency_guidance(flags_ha, "en-IN")
    assert "immediate emergency" in guidance_en.lower() or "hospital" in guidance_en.lower()


# ==============================================================================
# 2. New Patient vs Returning Patient Dossier Test
# ==============================================================================

def test_new_patient_dossier():
    """Verify that a brand new patient has empty baseline history and is flagged is_new_patient."""
    new_patient_ref = "AV-NEW-TEST-USER-999"
    dossier = get_patient_dossier(new_patient_ref)

    assert dossier["is_new_patient"] is True, "New patient should be flagged is_new_patient=True"
    patient = dossier["patient"]
    assert patient["is_new_patient"] is True

    # Critical: No fabricated 2nd trimester pregnancy or sulfa allergy!
    assert patient.get("pregnancy_stage") is None
    assert patient.get("allergies") == []
    assert len(dossier.get("active_medications", [])) == 0

    # Voice brief should explicitly state new patient
    assert "new patient" in dossier["voice_brief"]["en"].lower()
    assert "নতুন রোগী" in dossier["voice_brief"]["bn"]


def test_returning_patient_dossier():
    """Verify that a returning demo patient has historical context."""
    returning_ref = "AV-2026-8921"
    dossier = get_patient_dossier(returning_ref)

    assert dossier["is_new_patient"] is False
    assert len(dossier.get("active_medications", [])) > 0
    assert "patient" in dossier
    assert dossier["voice_brief"]["en"] != ""


# ==============================================================================
# 3. Conversational Health Turn (Fallback & Logic) Test
# ==============================================================================

@pytest.mark.asyncio
async def test_conversational_turn_emergency_override():
    """Verify that acute emergencies immediately override normal conversation with EMERGENCY guidance."""
    emergency_text = "I am having sudden severe crushing chest pain and cannot breathe"
    turn = await generate_conversational_health_turn(
        user_message=emergency_text,
        patient_context={"name": "Unknown", "is_new_patient": True},
        language="en-IN",
    )

    assert turn["triage_level"] == "EMERGENCY"
    assert len(turn["danger_signs"]) > 0
    assert "immediate emergency" in turn["ai_message"].lower() or "hospital" in turn["ai_message"].lower()


@pytest.mark.asyncio
async def test_conversational_turn_new_patient():
    """Verify that new patient without history gets appropriate greeting and 1-question intake."""
    turn = _build_fallback_chat_turn(
        user_msg="Hello, I need some help today.",
        lang_code="en-IN",
        patient_name="Patient",
        is_new_patient=True,
    )

    assert turn["triage_level"] == "STABLE"
    assert "first consultation" in turn["ai_message"].lower() or "no prior medical history" in turn["ai_message"].lower()
    assert len(turn["suggested_options"]) >= 3


# ==============================================================================
# 4. HTTP API Endpoints Test
# ==============================================================================

def test_api_voice_chat_new_patient():
    """Test POST /api/orchestrator/voice/chat for a new patient."""
    payload = {
        "patient_id": "AV-NEW-GUEST-1234",
        "user_message": "আমার পেট খুব ব্যথা করছে",  # My stomach hurts badly
        "language": "bn-IN",
        "history": [],
    }
    response = client.post("/api/orchestrator/voice/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["consultation_id"].startswith("con_")
    assert data["user_name"] == "New Patient"
    assert data["language"] == "bn-IN"
    assert data["triage_level"] in ["STABLE", "MONITOR"]
    assert len(data["suggested_options"]) > 0


def test_api_voice_chat_emergency():
    """Test POST /api/orchestrator/voice/chat when patient reports emergency symptoms."""
    payload = {
        "patient_id": "AV-NEW-GUEST-1234",
        "user_message": "বুকে তীব্র ব্যথা এবং শ্বাস নিতে পারছি না",  # Chest pain & can't breathe
        "language": "bn-IN",
        "history": [],
    }
    response = client.post("/api/orchestrator/voice/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["triage_level"] == "EMERGENCY"
    assert len(data["danger_signs"]) > 0
    assert "জরুরী" in data["ai_message"] or "১০৮" in data["ai_message"] or "হাসপাতাল" in data["ai_message"]


def test_api_save_consultation():
    """Test POST /api/orchestrator/consultations saves consultation with automatic danger sign audit."""
    payload = {
        "patient_id": "AV-TEST-9988",
        "user_name": "New Patient",
        "language_used": "bn-IN",
        "transcript": [
            {"role": "user", "text": "নমস্কার ডাক্তারবাবু"},
            {"role": "agent", "text": "নমস্কার, আজ আপনার কি সমস্যা?"},
            {"role": "user", "text": "আমার বুকে তীব্র ব্যথা এবং শ্বাসকষ্ট"},
        ],
    }
    response = client.post("/api/orchestrator/consultations", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["triage_level"] == "EMERGENCY"
    assert len(data["danger_signs"]) > 0
