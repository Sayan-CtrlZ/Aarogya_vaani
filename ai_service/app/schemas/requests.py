from typing import Optional
from pydantic import BaseModel


class AnalyzeDocumentParams(BaseModel):
    document_type: Optional[str] = None
    language: Optional[str] = None
    patient_id: Optional[str] = None
