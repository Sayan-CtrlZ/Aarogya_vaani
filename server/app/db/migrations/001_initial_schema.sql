-- ==============================================================================
-- AarogyaVaani: Supabase Initial Schema Migration
-- Run this script in the Supabase Cloud SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_ref VARCHAR(64) UNIQUE NOT NULL, -- Human-readable identifier e.g. AV-2026-8921
    name VARCHAR(255) NOT NULL,
    age VARCHAR(16),
    gender VARCHAR(32),
    phone VARCHAR(32),
    village VARCHAR(255),
    category VARCHAR(64) DEFAULT 'General',
    pregnancy_stage VARCHAR(64),
    blood_group VARCHAR(32),
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    preferred_language VARCHAR(16) DEFAULT 'bn-IN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_ref ON public.patients(patient_ref);

-- 3. Medical Records Table (Document Vault & Vision Extractions)
CREATE TABLE IF NOT EXISTS public.medical_records (
    id VARCHAR(64) PRIMARY KEY, -- e.g. rx_a8f9c102, xray_b441e8
    patient_id VARCHAR(64) NOT NULL, -- References patient_ref (e.g. AV-2026-8921)
    record_type VARCHAR(32) NOT NULL, -- prescription, lab_report, xray_radiology
    title VARCHAR(255) NOT NULL, -- Searchable title
    category VARCHAR(64), -- Prescription, Lab Report, Medical Scan / X-Ray
    facility VARCHAR(255),
    doctor_name VARCHAR(255),
    visit_date VARCHAR(64), -- Searchable date string (e.g. 11-Oct-2026)
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL, -- Private Supabase Storage path: medical-vault/{patient_id}/{filename}
    file_size VARCHAR(32),
    mime_type VARCHAR(64),
    analysis_status VARCHAR(32) DEFAULT 'COMPLETED', -- COMPLETED, FAILED, RETRY_PENDING
    structured_data JSONB DEFAULT '{}'::jsonb, -- Extracted clinical entities (medicines, metrics, findings)
    summary_en TEXT,
    summary_hi TEXT,
    summary_bn TEXT,
    urgency VARCHAR(32) DEFAULT 'NORMAL', -- NORMAL, MONITOR, URGENT_REFERRAL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_type ON public.medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_records_date ON public.medical_records(visit_date);

-- 4. Consultations Table (Voice Agent Sessions)
CREATE TABLE IF NOT EXISTS public.consultations (
    id VARCHAR(64) PRIMARY KEY, -- e.g. con_7b82f01
    patient_id VARCHAR(64) NOT NULL, -- References patient_ref
    user_name VARCHAR(128), -- Full patient name for easy identification
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    language_used VARCHAR(16) DEFAULT 'bn-IN',
    chief_complaint TEXT,
    symptoms_timeline TEXT,
    transcript JSONB DEFAULT '[]'::jsonb, -- Array of speech turns: [{"role": "user"|"agent", "text": "...", "timestamp": "..."}]
    danger_signs JSONB DEFAULT '[]'::jsonb, -- Rule-triggered safety items
    triage_level VARCHAR(32) DEFAULT 'STABLE', -- STABLE, MONITOR, EMERGENCY
    clinical_summary TEXT, -- Note for doctor review
    doctor_status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, REVIEWED, REFERRED
    doctor_notes TEXT,
    doctor_prescription TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(doctor_status);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Service Role policies (FastAPI backend uses SUPABASE_SECRET_KEY which has service_role privileges)
CREATE POLICY "Service Role Full Access Patients" ON public.patients
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access Records" ON public.medical_records
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access Consultations" ON public.consultations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated / Public Read Access (for authenticated frontends)
CREATE POLICY "Anon/Auth Select Patients" ON public.patients
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anon/Auth Select Records" ON public.medical_records
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anon/Auth Select Consultations" ON public.consultations
    FOR SELECT TO anon, authenticated USING (true);
