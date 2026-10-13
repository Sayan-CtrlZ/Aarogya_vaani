-- ==============================================================================
-- AarogyaVaani: Auth PIN Migration
-- Run this in the Supabase Cloud SQL Editor AFTER 001_initial_schema.sql
-- ==============================================================================

-- Add PIN hash column for phone-based authentication (if not already present)
ALTER TABLE public.patients
    ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128);

-- Phone must be unique for auth lookups (if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
