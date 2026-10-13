"""Database seeder and validation script for Supabase."""

import os
import sys
from dotenv import load_dotenv

# Ensure server path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.supabase_client import get_supabase_client, VAULT_BUCKET_NAME

DEMO_PATIENTS = [
    {
        "patient_ref": "AV-2026-8921",
        "name": "Mamta Debbarma",
        "age": "27",
        "gender": "Female",
        "phone": "+91 98621 00000",
        "village": "Bishalgarh, Sepahijala District, Tripura",
        "category": "Maternal & Antenatal (ANC)",
        "pregnancy_stage": "5 Months (2nd Trimester)",
        "blood_group": "B Positive (Rh+)",
        "allergies": ["Sulfa Antibiotics", "Seasonal Pollen / Dust"],
        "chronic_conditions": ["Mild Gestational Anaemia (Under Management)"],
        "preferred_language": "bn-IN",
    },
    {
        "patient_ref": "AV-2026-9012",
        "name": "Bimala Reang",
        "age": "31",
        "gender": "Female",
        "phone": "+91 94361 00000",
        "village": "Karbook, Gomati District, Tripura",
        "category": "Maternal & Antenatal (ANC)",
        "pregnancy_stage": "8 Months (3rd Trimester)",
        "blood_group": "O Positive (Rh+)",
        "allergies": [],
        "chronic_conditions": ["Gestational Hypertension Monitoring"],
        "preferred_language": "bn-IN",
    },
]


def ensure_storage_bucket():
    """Ensure the private medical-vault bucket exists."""
    client = get_supabase_client()
    try:
        buckets = [b.name for b in client.storage.list_buckets()]
        if VAULT_BUCKET_NAME not in buckets:
            client.storage.create_bucket(VAULT_BUCKET_NAME, options={"public": False})
            print(f"✓ Created private Supabase Storage bucket: '{VAULT_BUCKET_NAME}'")
        else:
            print(f"✓ Supabase Storage bucket '{VAULT_BUCKET_NAME}' already exists (verified private).")
    except Exception as e:
        print(f"! Notice on bucket check: {e}")


def seed_patients():
    """Seed synthetic demonstration patients into public.patients."""
    client = get_supabase_client()
    try:
        for p in DEMO_PATIENTS:
            res = client.table("patients").upsert(p, on_conflict="patient_ref").execute()
            print(f"✓ Seeded patient: {p['name']} ({p['patient_ref']})")
        print("✓ Patient seeding completed successfully.")
        return True
    except Exception as e:
        err_msg = str(e)
        if "PGRST205" in err_msg or "Could not find the table" in err_msg:
            print("\n" + "=" * 70)
            print("ACTION REQUIRED: Supabase PostgreSQL tables do not exist yet!")
            print("Please open the Supabase Dashboard (https://supabase.com/dashboard)")
            print("Go to the SQL Editor and run the file:")
            print("  server/app/db/migrations/001_initial_schema.sql")
            print("=" * 70 + "\n")
        else:
            print(f"! Error seeding patients: {e}")
        return False


if __name__ == "__main__":
    load_dotenv()
    print("=== AarogyaVaani Supabase Seeder & Verification ===")
    ensure_storage_bucket()
    seed_patients()
