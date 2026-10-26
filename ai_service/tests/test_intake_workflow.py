"""Unit tests for AarogyaVaani Shared Clinical Intake Workflow."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from intake_workflow import (
    initialize_intake_state,
    process_intake_turn,
    extract_clinical_facts_from_utterance,
)


def test_new_patient_distinction():
    """Verify that a patient without prior records is flagged as is_new_patient = True."""
    # Case 1: Empty dossier -> New Patient
    state_new = initialize_intake_state(patient_id="AV-2026-9999", dossier=None)
    assert state_new.is_new_patient is True, "Expected is_new_patient = True for None dossier"
    assert state_new.has_dossier is False

    # Case 2: Dossier with medical records -> Returning Patient
    existing_dossier = {
        "patient": {"name": "Mamta Debbarma", "pregnancy_stage": "2nd Trimester"},
        "active_medications": [{"name": "IFA"}],
    }
    state_existing = initialize_intake_state(patient_id="AV-2026-8921", dossier=existing_dossier)
    assert state_existing.is_new_patient is False, "Expected is_new_patient = False for existing dossier"
    assert state_existing.has_dossier is True
    assert state_existing.patient_name == "Mamta Debbarma"


def test_routine_intake_progression():
    """Verify adaptive 1-question intake flow for a mild symptom."""
    state = initialize_intake_state(patient_id="AV-2026-1234", dossier=None)

    # Turn 1: Patient reports fever
    t1 = process_intake_turn(state, "Doctor, I have a fever since yesterday.")
    assert t1["action"] == "ASK_NEXT_QUESTION"
    assert t1["triage_level"] == "STABLE"
    assert state.turn_count == 1
    assert "fever" in state.chief_complaint

    # Turn 2: Patient reports temperature
    t2 = process_intake_turn(state, "My temperature was 100.5 degrees.")
    assert t2["action"] == "ASK_NEXT_QUESTION"
    assert state.turn_count == 2
    assert "100.5°F" in state.extracted_facts.get("temperature", "")

    # Turn 3: Patient indicates no more issues
    t3 = process_intake_turn(state, "Nothing else, that is all.")
    assert t3["action"] == "COMPLETE_INTAKE"
    assert t3["is_completed"] is True


def test_immediate_emergency_brake():
    """Verify that critical red flags immediately interrupt intake with ESCALATE."""
    state = initialize_intake_state(patient_id="AV-2026-5555", dossier=None, language="bn-IN")

    # Turn 1: Patient reports acute chest pain
    res = process_intake_turn(state, "আমার বুকে তীব্র ব্যথা এবং শ্বাস নিতে পারছি না")
    assert res["action"] == "ESCALATE"
    assert res["triage_level"] == "EMERGENCY"
    assert res["is_completed"] is True
    assert res["emergency_guidance"] is not None
    assert "জরুরী" in res["emergency_guidance"]
    assert state.is_emergency is True


def test_fact_extraction_multilingual():
    """Verify timeline and symptom extraction across languages."""
    f1 = extract_clinical_facts_from_utterance("I have had fever for 3 days")
    assert f1.get("symptom") == "fever"
    assert "3 days" in f1.get("timeline", "")

    f2 = extract_clinical_facts_from_utterance("গত ২ দিন ধরে মাথা ব্যথা")
    assert f2.get("symptom") == "headache"
    assert "২ দিন" in f2.get("timeline", "")


if __name__ == "__main__":
    test_new_patient_distinction()
    test_routine_intake_progression()
    test_immediate_emergency_brake()
    test_fact_extraction_multilingual()
    print("ALL INTAKE WORKFLOW TESTS PASSED SUCCESSFULLY!")
