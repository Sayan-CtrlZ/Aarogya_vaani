"""Appointments and Healthcare Facilities Router for AarogyaVaani."""

import random
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.supabase_client import (
    insert_appointment,
    get_patient_appointments,
    delete_appointment_by_id,
)

router = APIRouter(prefix="/appointments", tags=["Appointments & Healthcare Facilities"])

NEARBY_HEALTH_CENTRES = [
    {
        "id": "fac-1",
        "name": "Bishalgarh Community Health Centre (CHC)",
        "type": "Community Health Centre",
        "distance": "2.4 km away",
        "district": "Sepahijala District",
        "address": "Bishalgarh Bazar Road, Sepahijala District, Tripura",
        "timings": "09:00 AM - 02:00 PM (Daily OPD)",
        "emergency": "24/7 Casualty & Delivery Room",
        "phone": "+91 381 236 1222",
        "doctors": [
            {"id": "doc-1", "name": "Dr. S. Roy", "specialty": "General Medicine & Medical Officer", "available": "Mon - Sat"},
            {"id": "doc-2", "name": "Dr. M. Begum", "specialty": "Gynaecology & Maternal Health", "available": "Tue, Thu, Sat"},
        ],
        "facilities": ["Free OPD Token", "In-house Pharmacy", "Digital ABHA Scan"],
    },
    {
        "id": "fac-2",
        "name": "Boxanagar Primary Health Centre (PHC)",
        "type": "Primary Health Centre",
        "distance": "5.1 km away",
        "district": "Sepahijala District",
        "address": "Boxanagar Main Block, Sepahijala District, Tripura",
        "timings": "08:30 AM - 01:30 PM (Mon - Sat)",
        "emergency": "Maternal Delivery & First Aid",
        "phone": "+91 381 286 4101",
        "doctors": [
            {"id": "doc-3", "name": "Dr. P. Jamatia", "specialty": "Medical Officer (General OPD)", "available": "Daily"},
            {"id": "doc-4", "name": "Kalpana Reang", "specialty": "Senior ANM & ASHA Supervisor", "available": "Daily"},
        ],
        "facilities": ["Routine Immunization", "Free Essential Medicines"],
    },
    {
        "id": "fac-3",
        "name": "Charilam Primary Health Centre (PHC)",
        "type": "Primary Health Centre",
        "distance": "8.3 km away",
        "district": "Sepahijala District",
        "address": "Charilam Sub-division, Sepahijala District, Tripura",
        "timings": "09:00 AM - 01:00 PM",
        "emergency": "Day Care & First Aid",
        "phone": "+91 381 289 0044",
        "doctors": [
            {"id": "doc-5", "name": "Dr. D. Barman", "specialty": "Medical Officer", "available": "Mon, Wed, Fri"},
        ],
        "facilities": ["Basic Pathology Tests", "General Health Counselling"],
    },
    {
        "id": "fac-4",
        "name": "Agartala Government Medical College & GBP Hospital",
        "type": "District Referral & Teaching Hospital",
        "distance": "18.5 km away",
        "district": "West District",
        "address": "Kunjaban, Agartala, West Tripura",
        "timings": "08:00 AM - 04:00 PM (Super Specialty OPD)",
        "emergency": "24/7 Trauma, ICU & Blood Bank",
        "phone": "+91 381 235 7000",
        "doctors": [
            {"id": "doc-6", "name": "Dr. A. Debnath", "specialty": "Chief Consultant (Internal Medicine)", "available": "Mon - Fri"},
            {"id": "doc-7", "name": "Dr. S. Bhattacharjee", "specialty": "Obstetrics & High-Risk Pregnancy", "available": "Daily"},
        ],
        "facilities": ["Advanced CT / MRI", "Dialysis Unit", "Ayushman Bharat Golden Desk"],
    },
]


class AppointmentCreateRequest(BaseModel):
    patient_id: str = Field(default="AV-2026-8921")
    facility_name: str
    facility_address: str | None = ""
    doctor_name: str
    specialty: str | None = "General Medicine"
    date: str
    time_slot: str
    reason: str
    attached_records: bool = True


@router.get("/facilities", summary="List nearby government healthcare centres & doctors in Tripura")
def list_healthcare_facilities():
    return NEARBY_HEALTH_CENTRES


@router.get("/patient/{patient_id}", summary="List appointments and OPD tokens for a patient")
def list_patient_appointments(patient_id: str):
    return get_patient_appointments(patient_id)


@router.post("", status_code=status.HTTP_201_CREATED, summary="Book OPD queue token / appointment")
def book_appointment(body: AppointmentCreateRequest):
    apt_id = f"apt-{int(datetime.now().timestamp() * 1000)}"
    token_num = f"OPD-{random.randint(10, 99)}"
    now_iso = datetime.now(timezone.utc).isoformat()

    appointment_payload = {
        "id": apt_id,
        "patient_id": body.patient_id,
        "token_number": token_num,
        "facility_name": body.facility_name,
        "facility_address": body.facility_address or "",
        "doctor_name": body.doctor_name,
        "specialty": body.specialty or "General Medicine",
        "date": body.date,
        "time_slot": body.time_slot,
        "reason": body.reason,
        "attached_records": body.attached_records,
        "status": "CONFIRMED",
        "created_at": now_iso,
    }

    created = insert_appointment(appointment_payload)
    return created


@router.delete("/{appointment_id}", summary="Cancel an appointment")
def cancel_appointment(appointment_id: str):
    delete_appointment_by_id(appointment_id)
    return {"status": "ok", "message": f"Appointment {appointment_id} cancelled"}
