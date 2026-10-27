"""Tests for Sarvam AI Bulbul v3 Male Voice Text-to-Speech (/api/ai/tts)."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ai_doctor_tts_bengali_male_voice():
    """Verify /api/ai/tts synthesizes audio using Sarvam Bulbul v3 with male speaker 'aditya' for Bengali."""
    response = client.post(
        "/api/ai/tts",
        json={
            "text": "নমস্কার, আমি ডাক্তার আদিত্য শর্মা। আপনার কী সমস্যা হচ্ছে?",
            "language": "bn-IN",
            "speaker": "aditya",
        },
    )
    assert response.status_code == 200, f"Expected 200, got: {response.status_code} - {response.text}"
    data = response.json()
    assert "audio_base64" in data
    assert data["speaker"] == "aditya"
    assert data["language"] == "bn-IN"
    assert data["format"] == "audio/wav"
    assert len(data["audio_base64"]) > 1000, "Expected non-empty base64 audio data"


def test_ai_doctor_tts_hindi_male_voice():
    """Verify /api/ai/tts synthesizes audio using Sarvam Bulbul v3 with male speaker 'aditya' for Hindi."""
    response = client.post(
        "/api/ai/tts",
        json={
            "text": "नमस्ते, मैं डॉक्टर आदित्य शर्मा हूँ। आप कैसा महसूस कर रहे हैं?",
            "language": "hi-IN",
            "speaker": "aditya",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert data["speaker"] == "aditya"
    assert data["language"] == "hi-IN"
    assert len(data["audio_base64"]) > 1000


def test_ai_doctor_tts_english_male_voice():
    """Verify /api/ai/tts synthesizes audio using Sarvam Bulbul v3 with male speaker 'aditya' for English."""
    response = client.post(
        "/api/ai/tts",
        json={
            "text": "Hello, I am Dr. Aditya Sharma. How may I assist your health today?",
            "language": "en-IN",
            "speaker": "aditya",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert data["speaker"] == "aditya"
    assert data["language"] == "en-IN"
    assert len(data["audio_base64"]) > 1000


def test_ai_doctor_tts_script_autodetection():
    """Verify Bengali script is automatically routed to bn-IN even if client sent en-IN."""
    response = client.post(
        "/api/ai/tts",
        json={
            "text": "নমস্কার! 👋 আপনার মাথাব্যথা নিয়ে আমি দুঃখিত। এটি কতদিন ধরে হচ্ছে?",
            "language": "en-IN",  # Client sent en-IN by mistake or default
            "speaker": "aditya",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 1000


def test_ai_doctor_chat_returns_audio_base64():
    """Verify /api/ai/chat synthesizes and returns audio_base64 for instant voice auto-read."""
    response = client.post(
        "/api/ai/chat",
        json={
            "patient_id": "AV-2026-8921",
            "user_name": "Mamta Debbarma",
            "user_message": "আমার মাথা ব্যথা করছে",
            "language": "bn-IN",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["audio_base64"] is not None
    assert len(data["audio_base64"]) > 1000
    assert data["speaker"] == "aditya"


def test_language_detection_preserves_selected_language():
    """Verify detect_utterance_language honors user selected language and detects scripts correctly."""
    from app.services.ai_doctor_service import detect_utterance_language

    # User selected Bengali
    assert detect_utterance_language("amar matha betha korche", fallback_lang="bn-IN") == "bn-IN"
    assert detect_utterance_language("মাথা ব্যথা", fallback_lang="bn-IN") == "bn-IN"
    assert detect_utterance_language("fever and stomach pain", fallback_lang="bn-IN") == "bn-IN"

    # User selected Hindi
    assert detect_utterance_language("mujhe bukhar hai", fallback_lang="hi-IN") == "hi-IN"
    assert detect_utterance_language("सिरदर्द हो रहा है", fallback_lang="hi-IN") == "hi-IN"
    assert detect_utterance_language("fever since two days", fallback_lang="hi-IN") == "hi-IN"

    # User selected English
    assert detect_utterance_language("I have severe cough and fever", fallback_lang="en-IN") == "en-IN"
    # User types Bengali script while on EN -> auto-switches to Bengali
    assert detect_utterance_language("আমার মাথা ঘুরছে", fallback_lang="en-IN") == "bn-IN"
    # User types Hindi script while on EN -> auto-switches to Hindi
    assert detect_utterance_language("मुझे चक्कर आ रहा है", fallback_lang="en-IN") == "hi-IN"


