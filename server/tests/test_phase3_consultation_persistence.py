"""Phase 3 Automated Test: Voice Consultation Persistence & Triage in Supabase."""

import time
from fastapi.testclient import TestClient

from app.main import app
from app.db.supabase_client import get_supabase_client

client = TestClient(app)
TEST_PATIENT_REF = "AV-2026-8921"


def test_voice_consultation_persistence_and_triage():
    """Test voice consultation creation, danger signs evaluation, Supabase storage, and doctor review."""
    # 1. Simulated multi-turn consultation transcript with high-risk maternal symptom
    simulated_transcript = [
        {
            "role": "agent",
            "text": "নমস্কার! আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি কি বাংলায় কথা বলতে চান?",
            "timestamp": time.time(),
        },
        {
            "role": "user",
            "text": "হ্যাঁ, আমার নাম মমতা। আমার সকাল থেকে তীব্র মাথা ব্যথা এবং চোখে অন্ধকার দেখছি।",
            "timestamp": time.time() + 5,
        },
        {
            "role": "agent",
            "text": "মমতা দেবী, আপনার লক্ষণটি গুরুত্বপূর্ণ। অবিলম্বে নিকটস্থ স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।",
            "timestamp": time.time() + 10,
        },
    ]

    payload = {
        "patient_id": TEST_PATIENT_REF,
        "language_used": "bn-IN",
        "duration_seconds": 45,
        "chief_complaint": "Severe persistent headache with visual disturbance in 2nd trimester",
        "symptoms_timeline": "Started morning of ANC checkup day",
        "transcript": simulated_transcript,
        # Danger signs left empty to test rule engine automatic scan
        "danger_signs": [],
        "triage_level": "STABLE",
    }

    # 2. Post consultation to orchestrator API
    resp = client.post("/api/orchestrator/consultations", json=payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    consultation = resp.json()

    con_id = consultation["id"]
    assert con_id.startswith("con_")
    assert consultation["patient_id"] == TEST_PATIENT_REF
    assert consultation["language_used"] == "bn-IN"
    assert consultation["duration_seconds"] == 45
    assert len(consultation["transcript"]) == 3

    # Danger signs should be automatically caught by rule engine
    danger_signs = consultation["danger_signs"]
    assert len(danger_signs) >= 1, "Expected danger signs to be detected from severe headache utterance"
    assert any("headache" in f["rule_id"] or "preeclampsia" in f["rule_id"] for f in danger_signs)
    assert consultation["triage_level"] == "EMERGENCY"

    # 3. Verify directly in Supabase PostgreSQL consultations table
    supabase = get_supabase_client()
    db_res = supabase.table("consultations").select("*").eq("id", con_id).execute()
    assert db_res.data and len(db_res.data) == 1, f"Consultation {con_id} not found in Supabase"
    db_row = db_res.data[0]
    assert db_row["doctor_status"] == "PENDING"
    assert db_row["triage_level"] == "EMERGENCY"
    assert len(db_row["transcript"]) == 3

    # 4. Test Consultation Listing for Patient
    list_resp = client.get(f"/api/orchestrator/consultations/patient/{TEST_PATIENT_REF}")
    assert list_resp.status_code == 200
    consultations_list = list_resp.json()
    assert any(c["id"] == con_id for c in consultations_list)

    # 5. Test Doctor Review & Prescription Approval
    review_payload = {
        "doctor_status": "REVIEWED",
        "doctor_notes": "Patient advised immediate BP check at Sepahijala District Hospital. High preeclampsia risk.",
        "doctor_prescription": "Tab Labetalol 100mg BID if SBP >= 140 or DBP >= 90. Urgent ANC ultrasound.",
    }
    review_resp = client.patch(f"/api/orchestrator/consultations/{con_id}/review", json=review_payload)
    assert review_resp.status_code == 200
    updated_con = review_resp.json()
    assert updated_con["doctor_status"] == "REVIEWED"
    assert "Labetalol" in updated_con["doctor_prescription"]

    # 6. Verify update persisted in Supabase
    db_check = supabase.table("consultations").select("doctor_status, doctor_prescription").eq("id", con_id).execute()
    assert db_check.data[0]["doctor_status"] == "REVIEWED"

    # 7. Test LiveKit WebRTC Token Generation
    token_resp = client.post(
        "/api/orchestrator/livekit/token",
        json={"patient_id": TEST_PATIENT_REF, "patient_name": "Mamta Debbarma"},
    )
    assert token_resp.status_code == 200
    token_data = token_resp.json()
    assert "token" in token_data and len(token_data["token"]) > 30
    assert token_data["participant_identity"] == TEST_PATIENT_REF

    print(f"\n[PASS] Voice consultation {con_id} persisted to Supabase and reviewed by doctor!")
    print(f"  - Detected Red Flags: {[f['rule_id'] for f in danger_signs]}")
    print(f"  - Triage Level: {consultation['triage_level']}")
    print(f"  - LiveKit WebRTC Room: {token_data['room_name']}")

    # Clean up test consultation from Supabase
    try:
        supabase.table("consultations").delete().eq("id", con_id).execute()
        print(f"  - Cleaned up test consultation {con_id} from Supabase.")
    except Exception as e:
        print(f"  ! Cleanup notice: {e}")
