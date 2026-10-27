from typing import List, Optional, Union
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class SourceInfo(BaseModel):
    page: int = 1
    bounding_box: Optional[BoundingBox] = None


class PatientInfo(BaseModel):
    name: Optional[str] = None
    age: Optional[Union[int, str]] = None
    sex: Optional[str] = None
    patient_id: Optional[str] = None


class ProviderInfo(BaseModel):
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    department: Optional[str] = None


class Medication(BaseModel):
    name: Optional[str] = None
    strength: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    uncertain: bool = False
    source: Optional[SourceInfo] = None


class Investigation(BaseModel):
    name: str
    value: Union[float, int, str]
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str = Field(
        default="unknown",
        description="normal | high | low | critical | unknown"
    )
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source: Optional[SourceInfo] = None


class Procedure(BaseModel):
    name: str
    date: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[SourceInfo] = None


class Diagnosis(BaseModel):
    name: str
    status: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[SourceInfo] = None


class MedicalHistoryItem(BaseModel):
    condition: str
    duration: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[SourceInfo] = None


class Allergy(BaseModel):
    allergen: str
    reaction: Optional[str] = None
    severity: Optional[str] = None
    source: Optional[SourceInfo] = None


class ImportantFinding(BaseModel):
    type: str = Field(
        description="abnormal_lab | critical_lab | medication | diagnosis | procedure | allergy | follow_up | document_warning | uncertain_extraction"
    )
    severity: str = Field(
        default="moderate",
        description="low | moderate | high | critical"
    )
    title: str
    description: str
    source: Optional[str] = None


class DocumentWarning(BaseModel):
    code: str
    message: str
    details: Optional[str] = None
