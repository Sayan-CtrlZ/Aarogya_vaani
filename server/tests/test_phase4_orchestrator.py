"""Phase 4 Automated Test: Clinical Orchestrator & LiveKit Function Tools.

Validates:
1. Consolidated patient dossier retrieval via FastAPI endpoint (/api/orchestrator/patient/{id}/dossier)
2. Supabase Cloud integration (demographics, active medications, radiology, lab metrics, voice briefs)
3. Medical Query Tools (query_prescription_medicines, query_xray_findings, query_lab_results)
4. Anti-hallucination guardrails (unprescribed medication queries return clean safety notice)
5. Multi-language support (Bengali, Hindi, English)
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app

# Also import the medical query tools directly to verify unit behavior
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
SHORT_PATIENT_REF = "AV-8921"


def test_phase4_clinical_dossier_endpoint():
    """Verify GET /api/orchestrator/patient/{patient_ref}/dossier returns structured clinical dossier."""
    resp = client.get(f"/api/orchestrator/patient/{TEST_PATIENT_REF}/dossier")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    dossier = resp.json()
    assert "patient" in dossier
    assert "active_medications" in dossier
    assert "diagnostic_findings" in dossier
    assert "lab_metrics" in dossier
    assert "voice_brief" in dossier

    # Check Patient Demographics
    patient = dossier["patient"]
    assert patient["name"] == "Mamta Debbarma"
    assert "2nd Trimester" in patient.get("pregnancy_stage", "") or "5 Months" in patient.get("pregnancy_stage", "")
    assert "Sulfa Antibiotics" in patient.get("allergies", [])

    # Check Active Medications
    active_meds = dossier["active_medications"]
    assert len(active_meds) >= 2, "Expected at least IFA and Calcium in active medications"
    med_names = [m["name"].lower() for m in active_meds]
    assert any("ifa" in name or "iron" in name for name in med_names)
    assert any("calcium" in name for name in med_names)

    # Check Localized Voice Context Briefs
    voice_brief = dossier["voice_brief"]
    assert "en" in voice_brief and "Mamta Debbarma" in voice_brief["en"]
    assert "bn" in voice_brief and "মমতা দেববর্মা" in voice_brief["bn"] or "Mamta" in voice_brief["bn"]
    assert "hi" in voice_brief and "ममতা" in voice_brief["hi"] or "Mamta" in voice_brief["hi"]


def test_phase4_short_patient_ref_normalization():
    """Verify that querying with short ID (AV-8921) normalizes correctly to AV-2026-8921."""
    resp = client.get(f"/api/orchestrator/patient/{SHORT_PATIENT_REF}/dossier")
    assert resp.status_code == 200
    dossier = resp.json()
    assert dossier["patient"]["name"] == "Mamta Debbarma"
    assert dossier["patient_ref"] == TEST_PATIENT_REF


def test_phase4_medical_function_tools_prescription():
    """Verify query_prescription_medicines tool behavior and anti-hallucination guardrails."""
    resp = client.get(f"/api/orchestrator/patient/{TEST_PATIENT_REF}/dossier")
    dossier = resp.json()

    # 1. Query for all active medicines
    all_meds_text = query_prescription_medicines(dossier, medicine_query="", language_code="en-IN")
    assert "Verified Prescriptions" in all_meds_text
    assert "Iron" in all_meds_text or "IFA" in all_meds_text
    assert "Calcium" in all_meds_text

    # 2. Query for specific medicine 'Iron' / 'IFA'
    iron_text = query_prescription_medicines(dossier, medicine_query="Iron", language_code="en-IN")
    assert "Iron & Folic Acid" in iron_text
    assert "Dosage:" in iron_text

    # 3. Query in Bengali
    bn_meds = query_prescription_medicines(dossier, medicine_query="Calcium", language_code="bn-IN")
    assert "Calcium" in bn_meds

    # 4. Anti-hallucination guardrail: Querying for an unprescribed medicine
    fake_med_text = query_prescription_medicines(dossier, medicine_query="Ciprofloxacin", language_code="en-IN")
    assert "not found in active records" in fake_med_text.lower()
    assert "iron" in fake_med_text.lower() or "calcium" in fake_med_text.lower()

    # 5. Anti-hallucination guardrail in Bengali
    fake_bn_text = query_prescription_medicines(dossier, medicine_query="Azithromycin", language_code="bn-IN")
    assert "পাওয়া যায়নি" in fake_bn_text


def test_phase4_medical_function_tools_radiology_and_lab():
    """Verify radiology and lab query tools handle patient dossier gracefully."""
    resp = client.get(f"/api/orchestrator/patient/{TEST_PATIENT_REF}/dossier")
    dossier = resp.json()

    # Radiology tool
    xray_result_en = query_xray_findings(dossier, language_code="en-IN")
    assert isinstance(xray_result_en, str)
    assert len(xray_result_en) > 0

    xray_result_bn = query_xray_findings(dossier, language_code="bn-IN")
    assert isinstance(xray_result_bn, str)
    assert len(xray_result_bn) > 0

    # Lab tool
    lab_result_en = query_lab_results(dossier, test_query="hemoglobin", language_code="en-IN")
    assert isinstance(lab_result_en, str)
    assert len(lab_result_en) > 0
