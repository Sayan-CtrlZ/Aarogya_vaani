-- ==============================================================================
-- AarogyaVaani: Add user_name to consultations table
-- Run this in the Supabase Cloud SQL Editor
-- ==============================================================================

ALTER TABLE public.consultations
    ADD COLUMN IF NOT EXISTS user_name VARCHAR(128);

CREATE INDEX IF NOT EXISTS idx_consultations_user_name ON public.consultations(user_name);
