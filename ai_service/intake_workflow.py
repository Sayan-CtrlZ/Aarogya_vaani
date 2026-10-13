"""AarogyaVaani Shared Clinical Intake Workflow Engine.

Unified state machine and decision logic shared between:
1. LiveKit Voice Agent (ai_service/agent.py)
2. Web / REST Chat Agent (server/app/api/orchestrator.py)

Enforces:
- Consistent patient history awareness (dossier from Supabase).
- Dedicated 'New Patient' pathway when no prior records exist in Supabase.
- Turn-by-turn deterministic safety checks via danger_signs.py.
- Adaptive 1-question-at-a-time intake progression (soft cap 4-7 turns).
- Structured triage decisions: ESCALATE | ASK_NEXT_QUESTION | COMPLETE_INTAKE.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from typing import Any

from rules.danger_signs import (
    evaluate_danger_signs,
    get_emergency_guidance,
    get_triage_decision,
)


@dataclass
class IntakeState:
    """Session-isolated clinical intake state machine."""

    consultation_id: str = field(default_factory=lambda: f"con_{uuid.uuid4().hex[:10]}")
    patient_id: str = "AV-2026-8921"
    patient_name: str = "Patient"
    language: str = "bn-IN"

    # Patient record status
    is_new_patient: bool = False
    has_dossier: bool = False

    # Clinical progression
    turn_count: int = 0
    max_turns: int = 6
    chief_complaint: str = ""
    symptoms_timeline: str = ""
    severity: str = ""
    extracted_facts: dict[str, Any] = field(default_factory=dict)
    questions_asked: list[str] = field(default_factory=list)

    # Safety status
    danger_flags: list[dict[str, Any]] = field(default_factory=list)
    triage_level: str = "STABLE"  # STABLE, MONITOR, EMERGENCY
    is_emergency: bool = False
    is_completed: bool = False

    def to_summary_dict(self) -> dict[str, Any]:
        """Convert to consultation persistence dictionary."""
        return {
            "consultation_id": self.consultation_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "language": self.language,
            "is_new_patient": self.is_new_patient,
            "chief_complaint": self.chief_complaint or "General Health Inquiry",
            "symptoms_timeline": self.symptoms_timeline or "Recent onset",
            "triage_level": self.triage_level,
            "danger_flags": self.danger_flags,
            "is_emergency": self.is_emergency,
            "is_completed": self.is_completed,
            "turn_count": self.turn_count,
            "extracted_facts": self.extracted_facts,
        }


def initialize_intake_state(
    patient_id: str,
    patient_name: str | None = None,
    dossier: dict[str, Any] | None = None,
    language: str = "bn-IN",
    consultation_id: str | None = None,
) -> IntakeState:
    """Initialize an intake session, distinguishing new patients from returning ones.

    Else-condition logic:
    - If dossier is empty, missing, or has no active records/patient entry,
      mark as is_new_patient = True so the intake collects baseline context.
    - If dossier has verified patient profile & prescriptions,
      mark as is_new_patient = False and leverage historical context.
    """
    cid = consultation_id or f"con_{uuid.uuid4().hex[:10]}"
    resolved_name = patient_name

    has_records = False
    is_new = True

    if dossier and isinstance(dossier, dict):
        p_obj = dossier.get("patient") or {}
        if p_obj.get("name") and not p_obj.get("name", "").startswith("Patient AV"):
            resolved_name = resolved_name or p_obj.get("name")

        active_meds = dossier.get("active_medications") or []
        findings = dossier.get("diagnostic_findings") or []
        records = dossier.get("recent_consultations") or []

        # If patient has recorded history in database
        if active_meds or findings or records or (p_obj.get("pregnancy_stage") and p_obj.get("pregnancy_stage") != "Not pregnant"):
            has_records = True
            is_new = False

    if not resolved_name or resolved_name.startswith("Patient AV"):
        resolved_name = "Patient"
        is_new = True

    return IntakeState(
        consultation_id=cid,
        patient_id=patient_id,
        patient_name=resolved_name,
        language=language,
        is_new_patient=is_new,
        has_dossier=has_records,
    )


def extract_clinical_facts_from_utterance(text: str) -> dict[str, Any]:
    """Lightweight rule-based clinical fact extraction from user utterance."""
    facts: dict[str, Any] = {}
    lower = text.lower()

    # Timeline extraction
    timeline_match = re.search(
        r"(\d+)\s*(days?|দিন|দিনের|दिन|hours?|ঘণ্টা|घंटे|weeks?|সপ্তাহ|हफ़्ते)",
        lower,
    )
    if timeline_match:
        facts["timeline"] = timeline_match.group(0)
    elif "yesterday" in lower or "গতকাল" in lower or "कल से" in lower:
        facts["timeline"] = "since yesterday"
    elif "today" in lower or "আজকে" in lower or "আজ" in lower or "आज" in lower:
        facts["timeline"] = "started today"

    # Temperature extraction
    temp_match = re.search(r"(\d{2,3}(?:\.\d)?)\s*(?:°?\s*[fc]|degree|ডিগ্রি|डिग्री)?", lower)
    if temp_match:
        val = float(temp_match.group(1))
        if 95.0 <= val <= 108.0:
            facts["temperature"] = f"{val}°F"

    # Symptom categories
    if any(w in lower for w in ["fever", "জ্বর", "বুখার", "তাপ"]):
        facts["symptom"] = "fever"
    elif any(w in lower for w in ["cough", "কাশি", "খাঁসি"]):
        facts["symptom"] = "cough"
    elif any(w in lower for w in ["headache", "মাথা ব্যথা", "মাথা ধরেছে", "सिरदर्द"]):
        facts["symptom"] = "headache"
    elif any(w in lower for w in ["stomach pain", "পেটে ব্যথা", "পেট ব্যথা", "पेट दर्द"]):
        facts["symptom"] = "abdominal_pain"
    elif any(w in lower for w in ["vomit", "বমি", "উল্টি"]):
        facts["symptom"] = "vomiting"

    return facts


def process_intake_turn(
    state: IntakeState,
    user_text: str,
    dossier: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Core turn-by-turn intake evaluation.

    Returns a decision dictionary:
    {
        "action": "ESCALATE" | "ASK_NEXT_QUESTION" | "COMPLETE_INTAKE",
        "triage_level": "EMERGENCY" | "MONITOR" | "STABLE",
        "directive": str,
        "is_completed": bool,
        "danger_flags": list,
        "emergency_guidance": str | None,
        "next_question_target": str | None
    }
    """
    clean_text = user_text.strip()
    if not clean_text:
        return {
            "action": "ASK_NEXT_QUESTION",
            "triage_level": state.triage_level,
            "directive": "Prompt the patient gently to describe what symptom or health concern they have today.",
            "is_completed": False,
            "danger_flags": state.danger_flags,
            "emergency_guidance": None,
            "next_question_target": "symptom_inquiry",
        }

    state.turn_count += 1

    # 1. Continuous Safety Check (Deterministic Red-Flag Evaluation)
    new_flags = evaluate_danger_signs(answers=state.extracted_facts, free_text=clean_text)
    if new_flags:
        for nf in new_flags:
            if not any(f["rule_id"] == nf["rule_id"] for f in state.danger_flags):
                state.danger_flags.append(nf)

    triage_action = get_triage_decision(state.danger_flags)

    # If Emergency or Critical Rule has fired: IMMEDIATE SAFETY BRAKE
    if triage_action == "ESCALATE":
        state.is_emergency = True
        state.triage_level = "EMERGENCY"
        state.is_completed = True
        guidance = get_emergency_guidance(state.danger_flags, state.language)
        return {
            "action": "ESCALATE",
            "triage_level": "EMERGENCY",
            "directive": (
                "EMERGENCY RED FLAG DETECTED. Do NOT ask any more intake questions. "
                "Immediately speak the emergency referral guidance in the active language. "
                "Advise immediate evaluation at the nearest hospital / PHC / 108 ambulance."
            ),
            "is_completed": True,
            "danger_flags": state.danger_flags,
            "emergency_guidance": guidance,
            "next_question_target": None,
        }

    if triage_action == "MONITOR":
        state.triage_level = "MONITOR"

    # 2. Extract facts and update clinical state
    new_facts = extract_clinical_facts_from_utterance(clean_text)
    state.extracted_facts.update(new_facts)

    if not state.chief_complaint and new_facts.get("symptom"):
        state.chief_complaint = new_facts["symptom"]
    elif not state.chief_complaint and state.turn_count == 1:
        state.chief_complaint = clean_text[:60]

    if new_facts.get("timeline"):
        state.symptoms_timeline = new_facts["timeline"]

    # 3. Check for early completion signals (Patient says they're done)
    completion_phrases = [
        "that's all", "nothing else", "no other problem", "that is it",
        "আর কিছু নেই", "এটুকুই", "আর কোনো সমস্যা নেই", "সব ঠিক আছে",
        "बस इतना ही", "और कुछ नहीं", "कोई अन्य समस्या नहीं"
    ]
    patient_done = any(phrase in clean_text.lower() for phrase in completion_phrases)

    # 4. Completion Condition
    if patient_done or state.turn_count >= state.max_turns:
        state.is_completed = True
        directive = (
            "Clinical intake complete. "
            "Formulate a structured closing summary in the active language: "
            "1. Acknowledge reported symptoms and duration warmly. "
            "2. State clear clinical guidance (e.g. hydration, rest, or visiting the PHC). "
            "3. Remind that a medical officer will review this summary."
        )
        return {
            "action": "COMPLETE_INTAKE",
            "triage_level": state.triage_level,
            "directive": directive,
            "is_completed": True,
            "danger_flags": state.danger_flags,
            "emergency_guidance": None,
            "next_question_target": "summary",
        }

    # 5. Adaptive 1-Question Progression
    # Different adaptive targets for NEW PATIENT vs EXISTING PATIENT
    next_target = None
    target_prompt = ""

    if state.is_new_patient:
        # NEW PATIENT (No history in database)
        if not state.symptoms_timeline:
            next_target = "onset_duration"
            target_prompt = "Ask exactly ONE question about when this symptom started (onset and duration)."
        elif "severity" not in state.extracted_facts:
            next_target = "severity"
            target_prompt = "Ask exactly ONE question about the severity (e.g. temperature reading, pain scale, or intensity)."
        elif "chronic_check" not in state.extracted_facts:
            state.extracted_facts["chronic_check"] = "asked"
            next_target = "baseline_health"
            target_prompt = "Since this is a new patient without past records, ask ONE question about whether they have any other known health conditions, allergies, or regular medications."
        else:
            next_target = "associated_symptoms"
            target_prompt = "Ask ONE question about any accompanying symptoms (e.g. chills, nausea, dizziness)."
    else:
        # EXISTING PATIENT (Dossier available in database)
        if not state.symptoms_timeline:
            next_target = "onset_duration"
            target_prompt = "Ask exactly ONE question about when this symptom started."
        elif "severity" not in state.extracted_facts:
            next_target = "severity"
            target_prompt = "Ask exactly ONE question about the symptom's intensity or severity."
        else:
            next_target = "associated_symptoms"
            target_prompt = "Ask ONE focused question about any related symptoms or if this affects their current prescription medications."

    state.questions_asked.append(next_target)

    return {
        "action": "ASK_NEXT_QUESTION",
        "triage_level": state.triage_level,
        "directive": (
            f"Ask exactly ONE concise question. Target: {target_prompt} "
            f"Do NOT ask multiple questions at once. Do NOT repeat questions already asked: {state.questions_asked[:-1]}."
        ),
        "is_completed": False,
        "danger_flags": state.danger_flags,
        "emergency_guidance": None,
        "next_question_target": next_target,
    }
