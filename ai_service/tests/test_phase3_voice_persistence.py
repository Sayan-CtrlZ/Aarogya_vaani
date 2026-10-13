"""Test suite for Phase 3: Voice consultation persistence from ai_service to Supabase."""

import asyncio
import os
import pytest
from dotenv import load_dotenv

load_dotenv()

from orchestrator_client import save_voice_consultation
from rules.danger_signs import evaluate_danger_signs
from supabase import create_client


@pytest.mark.asyncio
async def test_ai_service_consultation_save_and_danger_sign_detection():
    """Verify that ai_service evaluates danger signs and persists consultation to Supabase."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    assert supabase_url, "SUPABASE_URL must be defined"
    assert supabase_key, "SUPABASE_SECRET_KEY must be defined"

    supa = create_client(supabase_url, supabase_key)
    patient_ref = "AV-2026-8921"

    # Multi-turn transcript in Bengali containing severe headache / preeclampsia alert
    simulated_transcript = [
        {
            "role": "agent",
            "text": "নমস্কার, আরোগ্য বাণীতে আপনাকে স্বাগতম। আপনি কেমন অনুভব করছেন?",
            "timestamp": 1728630000.0,
        },
        {
            "role": "user",
            "text": "আমার মাথা ব্যথা খুব বেশি হচ্ছে এবং চোখে ঝাপসা দেখছি।",
            "timestamp": 1728630010.0,
        },
        {
            "role": "agent",
            "text": "আপনার রক্তচাপ মাপা হয়েছে কি? আমি আপনার লক্ষণগুলো রেকর্ড করছি।",
            "timestamp": 1728630020.0,
        },
    ]

    answers = {
        "anc_headache": "severe",
        "anc_vision": "blurred",
        "anc_bleeding": "no",
        "anc_movement": "active",
    }

    # 1. Verify danger signs evaluation
    detected_flags = evaluate_danger_signs(answers)
    flag_ids = [f["rule_id"] for f in detected_flags]
    assert any("severe_headache" in fid for fid in flag_ids), "Expected severe_headache flag"

    # 2. Persist voice consultation via orchestrator_client
    saved_result = await save_voice_consultation(
        patient_id=patient_ref,
        transcript=simulated_transcript,
        language_used="bn-IN",
        duration_seconds=95,
        chief_complaint="Severe headache with blurred vision during 2nd trimester ANC",
        symptoms_timeline="Started 2 days ago, worsening with vision blurriness",
        answers_dict=answers,
    )

    consultation_id = saved_result["id"]
    assert consultation_id, "Expected consultation ID in saved result"
    assert saved_result["triage_level"] in ["EMERGENCY", "CRITICAL"], f"Expected EMERGENCY, got {saved_result['triage_level']}"

    # 3. Direct verification in Supabase PostgreSQL consultations table
    res = supa.table("consultations").select("*").eq("id", consultation_id).execute()
    assert res.data and len(res.data) == 1, f"Consultation {consultation_id} not found in Supabase"
    row = res.data[0]
    assert row["patient_id"] == patient_ref
    assert row["language_used"] == "bn-IN"
    assert len(row["transcript"]) == 3
    assert row["triage_level"] == "EMERGENCY"
    print(f"\n[PASS] ai_service successfully persisted consultation {consultation_id} to Supabase with EMERGENCY triage!")

    # 4. Clean up test row
    supa.table("consultations").delete().eq("id", consultation_id).execute()
    print(f"  - Cleaned up test consultation {consultation_id} from Supabase.")
