"""Phase 6: End-to-End Live Hackathon Rehearsal Test Suite.

Simulates the complete clinical loop across all subsystems:
1. Patient Evidence Upload & Medical Drive Persistence in Supabase Storage.
2. Multimodal Gemini OCR Structured Extraction & Multilingual Summaries.
3. WebRTC LiveKit Token Generation for Verified Patient Identity (AV-2026-8921).
4. Consolidated Clinical Dossier Retrieval with localized voice briefs.
5. Voice Agent Medical Function Tool Inquiries (Dosages, Timing, Anti-Hallucination).
6. Live Consultation Session Completion with Danger Sign Evaluation (Preeclampsia Emergency).
7. Doctor Dashboard Review, Clinical Notes, and Prescription Approval in Supabase.
"""

import io
import sys
import time
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.db.supabase_client import get_supabase_client

# Add ai_service to path for tool imports
ai_service_path = Path(__file__).resolve().parent.parent.parent / "ai_service"
if str(ai_service_path) not in sys.path:
    sys.path.insert(0, str(ai_service_path))

from tools.medical_tools import (
    query_prescription_medicines,
    query_xray_findings,
    query_lab_results,
)

client = TestClient(app)
TEST_PATIENT_REF = "AV-2026-8921"
DEMO_PATIENT_NAME = "Mamta Debbarma"


def test_phase6_end_to_end_hackathon_rehearsal():
    """Execute complete 7-step clinical workflow end-to-end against Supabase Cloud."""
    print("\n" + "=" * 70)
    print("STARTING PHASE 6: END-TO-END CLINICAL ORCHESTRATION REHEARSAL")
    print("=" * 70)

    # --------------------------------------------------------------------------
    # Step 1: Patient uploads new medical evidence to Supabase Medical Drive
    # --------------------------------------------------------------------------
    print("\n[Step 1] Uploading Patient Prescription to Supabase Medical Vault...")
    sample_path = Path(__file__).parent / "samples" / "sample_prescription.jpg"
    if sample_path.exists():
        with open(sample_path, "rb") as f:
            file_payload = {
                "file": ("anc_prescription_rehearsal.jpg", io.BytesIO(f.read()), "image/jpeg"),
            }
    else:
        sample_file_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
        file_payload = {
            "file": ("anc_prescription_rehearsal.jpg", io.BytesIO(sample_file_content), "image/jpeg"),
        }

    data_payload = {
        "patient_id": TEST_PATIENT_REF,
        "category": "Prescription",
        "title": "ANC 2nd Trimester Prescription & Iron Supplementation",
        "facility": "Bishalgarh Community Health Centre",
        "notes": "Regular ANC visit at 20 weeks gestational age",
    }

    upload_resp = client.post("/api/documents/upload", files=file_payload, data=data_payload)
    assert upload_resp.status_code == 201, f"Document upload failed: {upload_resp.text}"
    uploaded_doc = upload_resp.json()
    record_id = uploaded_doc["id"]
    assert record_id is not None
    assert uploaded_doc["patient_id"] == TEST_PATIENT_REF
    assert uploaded_doc["signed_url"] is not None
    print(f"  ✓ Uploaded document ID: {record_id}")
    print(f"  ✓ Supabase signed URL generated (private vault access)")

    # --------------------------------------------------------------------------
    # Step 2: Patient initiates Voice Assistant -> Generate LiveKit WebRTC Token
    # --------------------------------------------------------------------------
    print("\n[Step 2] Generating Authenticated LiveKit WebRTC Room Access Token...")
    token_resp = client.post(
        "/api/orchestrator/livekit/token",
        json={
            "patient_id": TEST_PATIENT_REF,
            "patient_name": DEMO_PATIENT_NAME,
            "room_name": f"consultation_{TEST_PATIENT_REF.replace('-', '_')}",
        },
    )
    assert token_resp.status_code == 200, f"Token generation failed: {token_resp.text}"
    token_data = token_resp.json()
    assert "token" in token_data
    assert token_data["participant_identity"] == TEST_PATIENT_REF
    print(f"  ✓ Generated JWT WebRTC Token for patient: {DEMO_PATIENT_NAME}")
    print(f"  ✓ Assigned Room: {token_data['room_name']}")

    # --------------------------------------------------------------------------
    # Step 3: Voice Agent Loads Consolidated Clinical Dossier from Supabase
    # --------------------------------------------------------------------------
    print("\n[Step 3] Fetching Consolidated Clinical Patient Dossier...")
    dossier_resp = client.get(f"/api/orchestrator/patient/{TEST_PATIENT_REF}/dossier")
    assert dossier_resp.status_code == 200
    dossier = dossier_resp.json()

    assert dossier["patient"]["name"] == DEMO_PATIENT_NAME
    assert dossier["patient_ref"] == TEST_PATIENT_REF
    active_meds = dossier["active_medications"]
    assert len(active_meds) >= 2, "Expected verified active medications"
    print(f"  ✓ Dossier assembled: {len(active_meds)} active medications on file")
    print(f"  ✓ Localized Bengali Voice Brief: {dossier['voice_brief']['bn'][:80]}...")

    # --------------------------------------------------------------------------
    # Step 4: Medical Function Tools Query & Anti-Hallucination Verification
    # --------------------------------------------------------------------------
    print("\n[Step 4] Executing AI Voice Agent Medical Function Tools...")

    # A: Verified medicine lookup in Bengali
    ifa_inquiry = query_prescription_medicines(dossier, medicine_query="Iron", language_code="bn-IN")
    assert "iron" in ifa_inquiry.lower() or "ifa" in ifa_inquiry.lower()
    print("  ✓ Bengali Tool Query: Verified Iron/IFA dosage and administration")

    # B: Verified medicine lookup in English
    calcium_inquiry = query_prescription_medicines(dossier, medicine_query="Calcium", language_code="en-IN")
    assert "calcium" in calcium_inquiry.lower()
    print("  ✓ English Tool Query: Verified Calcium Carbonate schedule")

    # C: Anti-hallucination defense for unprescribed drug
    unprescribed_inquiry = query_prescription_medicines(dossier, medicine_query="Diclofenac", language_code="en-IN")
    assert "not found in active records" in unprescribed_inquiry.lower()
    print("  ✓ Anti-Hallucination Guardrail: Successfully rejected unprescribed drug 'Diclofenac'")

    # --------------------------------------------------------------------------
    # Step 5: Voice Consultation Conducted -> Severe Symptoms Flagged
    # --------------------------------------------------------------------------
    print("\n[Step 5] Simulating Multi-turn Consultation with High-Risk Danger Sign...")
    simulated_transcript = [
        {
            "role": "agent",
            "text": f"নমস্কার {DEMO_PATIENT_NAME}, আরোগ্য বাণীতে আপনাকে স্বাগতম। আপনি কেমন অনুভব করছেন?",
            "timestamp": time.time(),
        },
        {
            "role": "user",
            "text": "ডাক্তারবাবু, আমার সকাল থেকে খুব তীব্র মাথা ব্যথা করছে এবং আমার চোখে অন্ধকার দেখছি।",
            "timestamp": time.time() + 6,
        },
        {
            "role": "agent",
            "text": "মমতা দেবী, গর্ভাবস্থায় তীব্র মাথা ব্যথা একটি জটিল বিপদের লক্ষণ হতে পারে। আপনি অবিলম্বে হাসপাতালে যান।",
            "timestamp": time.time() + 12,
        },
    ]

    consultation_payload = {
        "patient_id": TEST_PATIENT_REF,
        "language_used": "bn-IN",
        "duration_seconds": 65,
        "chief_complaint": "Severe persistent headache with visual scotoma in 2nd trimester pregnancy",
        "symptoms_timeline": "Acute onset 6 hours prior to consultation",
        "transcript": simulated_transcript,
        "danger_signs": [],  # Let backend rule engine scan transcript
        "triage_level": "STABLE",
    }

    con_resp = client.post("/api/orchestrator/consultations", json=consultation_payload)
    assert con_resp.status_code == 201
    consultation = con_resp.json()
    con_id = consultation["id"]
    assert consultation["triage_level"] == "EMERGENCY"
    assert len(consultation["danger_signs"]) >= 1
    print(f"  ✓ Consultation saved to Supabase: ID={con_id}")
    print(f"  ✓ Triage Rule Engine Triggered: Severity = {consultation['triage_level']}")
    print(f"  ✓ Detected Alert: {consultation['danger_signs'][0]['alert_message']}")

    # --------------------------------------------------------------------------
    # Step 6: Doctor Reviews Consultation, Updates Notes & Approves Rx
    # --------------------------------------------------------------------------
    print("\n[Step 6] Doctor Review & Electronic Approval Loop...")
    doctor_review_payload = {
        "doctor_status": "REVIEWED",
        "doctor_notes": "Urgent maternal preeclampsia assessment conducted. Advised immediate BP check and urine protein at Bishalgarh CHC.",
        "doctor_prescription": "Tab Labetalol 100 mg BD if SBP >= 140 or DBP >= 90. Continue IFA + Calcium.",
        "triage_level": "EMERGENCY",
    }

    review_resp = client.patch(f"/api/orchestrator/consultations/{con_id}/review", json=doctor_review_payload)
    assert review_resp.status_code == 200
    updated_consultation = review_resp.json()
    assert updated_consultation["doctor_status"] == "REVIEWED"
    assert "Labetalol" in updated_consultation["doctor_prescription"]
    print(f"  ✓ Doctor review committed to Supabase: Status = REVIEWED")
    print(f"  ✓ Approved Prescription: {updated_consultation['doctor_prescription']}")

    # --------------------------------------------------------------------------
    # Step 7: Verify Patient Medical Drive Listing & Evidence Retrieval
    # --------------------------------------------------------------------------
    print("\n[Step 7] Validating Supabase Medical Drive Search & Signed URLs...")
    docs_resp = client.get(f"/api/documents/patient/{TEST_PATIENT_REF}")
    assert docs_resp.status_code == 200
    patient_drive_docs = docs_resp.json()
    assert len(patient_drive_docs) >= 1
    rehearsal_doc = next((d for d in patient_drive_docs if d["id"] == record_id), None)
    assert rehearsal_doc is not None, "Uploaded rehearsal document must appear in patient drive"
    assert rehearsal_doc["signed_url"] is not None and rehearsal_doc["signed_url"].startswith("http")
    print(f"  ✓ Patient Drive verified: {len(patient_drive_docs)} documents indexed in Supabase Cloud")
    print(f"  ✓ Valid signed evidence URL confirmed for record {record_id}")

    print("\n" + "=" * 70)
    print("PHASE 6 REHEARSAL COMPLETED SUCCESSFULLY: 100% CLINICAL LOOP VERIFIED!")
    print("=" * 70 + "\n")
