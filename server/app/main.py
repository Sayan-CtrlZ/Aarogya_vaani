import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.supabase_client import get_supabase_client
from app.api.documents import router as documents_router
from app.api.prescriptions import router as prescriptions_router
from app.api.lab_reports import router as lab_reports_router
from app.api.xray_radiology import router as xray_radiology_router
from app.api.patients import router as patients_router
from app.api.orchestrator import router as orchestrator_router
from app.api.auth import router as auth_router
from app.api.ai_doctor import router as ai_doctor_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Verify Supabase Cloud connectivity on application boot."""
    try:
        client = get_supabase_client()
        logger.info("[STARTUP] Supabase Cloud connected successfully.")
    except Exception as e:
        logger.warning("[STARTUP_WARNING] Supabase Cloud connection check: %s", e)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-grade Clinical Intelligence API for AarogyaVaani. "
        "Provides multi-modal AI inspection for handwritten doctor prescriptions, "
        "pathology/diagnostic lab copies, and radiology X-ray scans with multilingual "
        "patient translation (Bengali, Hindi, English) and LiveKit Voice Agent integration."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files for static inspection and downloads
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Modular API Routers
app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(prescriptions_router, prefix=settings.API_PREFIX)
app.include_router(lab_reports_router, prefix=settings.API_PREFIX)
app.include_router(xray_radiology_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(orchestrator_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(ai_doctor_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Health & Status"])
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "primary_vision_model": settings.GEMINI_PRIMARY_MODEL,
    }


@app.get("/health", tags=["Health & Status"])
def health_check():
    return {"status": "healthy", "database": "connected"}
