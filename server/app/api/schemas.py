"""Pydantic V2 schemas for API requests and responses."""

from typing import Any
from pydantic import BaseModel, Field


class MedicationSchema(BaseModel):
    name: str
    dosage: str | None = None
    frequency: str | None = None
    timing: str | None = None
    duration: str | None = None
    instructions: str | None = None


class LabMetricSchema(BaseModel):
    test_name: str
    value: str | float | int
    unit: str | None = None
    reference_range: str | None = None
    flag: str = "NORMAL"  # NORMAL, HIGH, LOW, CRITICAL


class RadiologyFindingSchema(BaseModel):
    anatomical_region: str
    observation: str
    status: str = "NORMAL"  # NORMAL, ABNORMAL


class PatientSummarySchema(BaseModel):
    english: str = ""
    hindi: str = ""
    bengali: str = ""


class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    record_type: str
    title: str
    category: str | None = None
    facility: str | None = None
    doctor_name: str | None = None
    visit_date: str | None = None
    file_name: str
    file_url: str
    signed_url: str | None = None
    file_size: str | None = None
    mime_type: str | None = None
    analysis_status: str = "COMPLETED"
    structured_data: dict[str, Any] = Field(default_factory=dict)
    patient_summary: PatientSummarySchema = Field(default_factory=PatientSummarySchema)
    urgency: str = "NORMAL"
    created_at: str | None = None


class AskQuestionRequest(BaseModel):
    question: str
    language: str = "en-IN"  # bn-IN, hi-IN, en-IN


class AskQuestionResponse(BaseModel):
    document_id: str
    question: str
    answer: str
    language: str


class PatientContextResponse(BaseModel):
    patient_id: str
    total_records: int
    active_medications: list[dict[str, Any]]
    latest_lab_flags: list[dict[str, Any]]
    recent_radiology_findings: list[dict[str, Any]]
    red_flags: list[str]
    synthesized_voice_briefing: str
