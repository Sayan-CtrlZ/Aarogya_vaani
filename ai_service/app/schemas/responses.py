from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from app.schemas.clinical import (
    PatientInfo,
    ProviderInfo,
    Diagnosis,
    Medication,
    Investigation,
    Procedure,
    MedicalHistoryItem,
    Allergy,
    ImportantFinding,
    DocumentWarning
)


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


class ProcessingBatchMeta(BaseModel):
    status: str = "completed"  # completed | partial | failed
    documents_received: int = 0
    documents_processed: int = 0
    documents_failed: int = 0
    processing_time_ms: int = Field(default=0, ge=0)


class PerDocumentResult(BaseModel):
    document_id: str
    filename: str
    document_type: str = Field(
        default="auto",
        description="auto | prescription | lab_report | discharge_summary | diagnostic_report | medical_certificate | consultation_note | imaging_report | other"
    )
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    status: str = "completed"  # completed | failed
    extracted_data: Optional[Dict[str, Any]] = None
    error: Optional[ErrorDetail] = None


class CombinedClinicalRecord(BaseModel):
    patient: PatientInfo = Field(default_factory=PatientInfo)
    provider: ProviderInfo = Field(default_factory=ProviderInfo)
    diagnoses: List[Diagnosis] = Field(default_factory=list)
    medications: List[Medication] = Field(default_factory=list)
    investigations: List[Investigation] = Field(default_factory=list)
    procedures: List[Procedure] = Field(default_factory=list)
    medical_history: List[MedicalHistoryItem] = Field(default_factory=list)
    allergies: List[Allergy] = Field(default_factory=list)
    important_findings: List[ImportantFinding] = Field(default_factory=list)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)


class DocumentAnalysisResponse(BaseModel):
    success: bool = True
    request_id: str
    processing: ProcessingBatchMeta
    documents: List[PerDocumentResult] = Field(default_factory=list)
    combined: CombinedClinicalRecord = Field(default_factory=CombinedClinicalRecord)
    clinical_summary: str = ""
    warnings: List[DocumentWarning] = Field(default_factory=list)
