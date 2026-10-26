"""API routers package."""
from app.api.documents import router as documents_router
from app.api.prescriptions import router as prescriptions_router
from app.api.lab_reports import router as lab_reports_router
from app.api.xray_radiology import router as xray_radiology_router
from app.api.patients import router as patients_router

__all__ = [
    "documents_router",
    "prescriptions_router",
    "lab_reports_router",
    "xray_radiology_router",
    "patients_router",
]
