"""Automated verification tests for Phase 1 (Supabase Foundation)."""

import pytest
from app.db.supabase_client import get_supabase_client, VAULT_BUCKET_NAME


def test_supabase_client_initialization():
    """Verify that the Supabase client initializes with valid URL and key."""
    client = get_supabase_client()
    assert client is not None
    assert client.storage is not None


def test_storage_vault_bucket_exists():
    """Verify that private medical-vault bucket is present on Supabase Cloud."""
    client = get_supabase_client()
    buckets = [b.name for b in client.storage.list_buckets()]
    assert VAULT_BUCKET_NAME in buckets, f"Bucket '{VAULT_BUCKET_NAME}' missing. Found: {buckets}"


def test_patients_table_query():
    """Verify patients table query via Supabase PostgREST client."""
    client = get_supabase_client()
    try:
        res = client.table("patients").select("patient_ref, name").limit(5).execute()
        assert res.data is not None
        print(f"\n[PASS] Supabase 'patients' table connected. Found {len(res.data)} patient records.")
    except Exception as e:
        if "PGRST205" in str(e) or "Could not find the table" in str(e):
            pytest.fail(
                "Table 'public.patients' not found in Supabase schema. "
                "Please run 'server/app/db/migrations/001_initial_schema.sql' in the Supabase SQL Editor."
            )
        else:
            raise e
