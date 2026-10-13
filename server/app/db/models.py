"""SQLAlchemy models for medical records and patient data."""

import json
from datetime import datetime
from typing import Any
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.db.database import Base


class MedicalRecord(Base):
    """Stores analyzed medical documents, prescriptions, lab copies, and X-ray scans."""
    __tablename__ = "medical_records"

    id = Column(String(64), primary_key=True, index=True)
    patient_id = Column(String(64), index=True, nullable=False, default="AV-8921")
    record_type = Column(String(32), index=True, nullable=False)  # prescription, lab_report, xray_radiology
    title = Column(String(255), nullable=False)
    category = Column(String(64), nullable=True)
    facility = Column(String(255), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    visit_date = Column(String(64), nullable=True)
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_url = Column(String(512), nullable=False)
    file_size = Column(String(32), nullable=True)
    mime_type = Column(String(64), nullable=True)
    
    analysis_status = Column(String(32), default="COMPLETED")
    raw_text = Column(Text, nullable=True)
    structured_data = Column(Text, nullable=True)  # JSON-serialized clinical output
    
    summary_en = Column(Text, nullable=True)
    summary_hi = Column(Text, nullable=True)
    summary_bn = Column(Text, nullable=True)
    
    urgency = Column(String(32), default="NORMAL")  # NORMAL, MONITOR, URGENT_REFERRAL
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def get_parsed_data(self) -> dict[str, Any]:
        """Safely decode JSON structured data."""
        if not self.structured_data:
            return {}
        try:
            return json.loads(self.structured_data)
        except Exception:
            return {}

    def to_dict(self) -> dict[str, Any]:
        """Convert record to dictionary for API response."""
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "record_type": self.record_type,
            "title": self.title,
            "category": self.category,
            "facility": self.facility,
            "doctor_name": self.doctor_name,
            "visit_date": self.visit_date,
            "file_name": self.file_name,
            "file_url": self.file_url,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "analysis_status": self.analysis_status,
            "structured_data": self.get_parsed_data(),
            "patient_summary": {
                "english": self.summary_en or "",
                "hindi": self.summary_hi or "",
                "bengali": self.summary_bn or "",
            },
            "urgency": self.urgency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
