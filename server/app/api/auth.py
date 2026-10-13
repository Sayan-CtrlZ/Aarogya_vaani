"""
Authentication API for AarogyaVaani.
Phone + 4-digit PIN based authentication. No email/OAuth needed.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.supabase_client import register_patient_auth, login_patient_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Patient full name")
    phone: str = Field(..., min_length=10, max_length=15, description="10-digit mobile number")
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit security PIN")
    district: str = Field(default="", description="District / village / area")
    age: str = Field(default="", description="Patient age (optional)")
    gender: str = Field(default="", description="Gender (optional)")
    preferred_language: str = Field(default="bn-IN")


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    pin: str = Field(..., min_length=4, max_length=4)


class AuthResponse(BaseModel):
    patient_ref: str
    name: str
    phone: str
    village: str | None = None
    age: str | None = None
    gender: str | None = None
    preferred_language: str = "bn-IN"
    category: str | None = None
    pregnancy_stage: str | None = None
    blood_group: str | None = None
    allergies: list = []
    chronic_conditions: list = []
    message: str = ""


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    """
    Register a new patient account with phone + 4-digit PIN.
    Creates a new patient row in Supabase and returns the patient profile.
    """
    try:
        patient = register_patient_auth(
            name=body.name.strip(),
            phone=body.phone.strip(),
            pin=body.pin.strip(),
            district=body.district.strip(),
            age=body.age.strip(),
            gender=body.gender.strip(),
            preferred_language=body.preferred_language,
        )
        logger.info("[AUTH] New patient registered: %s (%s)", patient.get("patient_ref"), body.phone)
        return {**patient, "message": "Account created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        logger.error("[AUTH_REGISTER_ERROR] %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {e}",
        )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    """
    Authenticate existing patient with phone + 4-digit PIN.
    Returns the full patient profile on success.
    """
    try:
        patient = login_patient_auth(
            phone=body.phone.strip(),
            pin=body.pin.strip(),
        )
        logger.info("[AUTH] Patient logged in: %s (%s)", patient.get("patient_ref"), body.phone)
        return {**patient, "message": "Login successful"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        logger.error("[AUTH_LOGIN_ERROR] %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {e}",
        )


@router.get("/profile/{patient_ref}")
def get_profile(patient_ref: str):
    """Get patient profile by patient_ref (for refreshing local state after login)."""
    from app.db.supabase_client import get_patient_by_ref
    patient = get_patient_by_ref(patient_ref)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.pop("pin_hash", None)
    return patient
