# AarogyaVaani: Technical Design Document (TDD)

> **Project:** AarogyaVaani (आरोग्यवाणी / আরোগ্যবাণী)  
> **Subtitle:** Voice-First Vernacular Clinical Intake & Offline Healthcare Triage Portal for Rural Primary Health Centres (PHCs) in Tripura  
> **Event:** Hack for Social Good 2026  
> **Version:** 1.0.0 • Production Ready  
> **Status:** APPROVED & DEPLOYED  

---

## 1. Executive Summary & System Objectives

In overburdened rural Primary Health Centres (PHCs) across Tripura and northeastern India, medical doctors routinely face outpatient consultation times constrained to under **2 to 3 minutes per patient**. In this tight window, physicians must bridge language barriers (Bengali, Kokborok, Hindi), review crumpled paper prescriptions and handwritten reports, elicit clinical history, and draft treatment plans.

**AarogyaVaani** solves this critical "first-mile" healthcare bottleneck by introducing a kiosk-compatible, voice-first clinical intake agent that:
1. **Engages Patients in Vernacular Indic Speech:** Conducts compassionate clinical anamnesis via natural voice (Bengali, Hindi, English).
2. **Digitizes Medical Drive Records:** Automatically ingests, classifies, and transcribes handwritten prescriptions and Chest X-Rays using Google Gemini Vision AI.
3. **Generates Structured EMR / SOAP Notes:** Synthesizes subjective history, objective vitals, and red flags into structured clinical dossiers.
4. **Empowers Doctors with Clinical Decision Support (CDS):** Delivers a prioritized triage queue (Red/Yellow/Green) and an intuitive Doctor Dashboard with "Slide-to-Confirm" prescription dispatch.

---

## 2. System Architecture & C4 Container Model

The architecture employs an asynchronous, event-driven microservices pattern separating real-time low-latency audio transport from high-throughput REST transactions.

```mermaid
graph TD
    subgraph Client_Layer ["Client Layer (Patient Kiosk & Doctor Portal)"]
        UI["React 19 + Vite SPA (Port 5173)"]
        AudioClient["LiveKit WebRTC Audio Client"]
        DocPortal["Doctor Clinical Dashboard"]
    end

    subgraph Transport_Layer ["Transport & Real-Time Gateway"]
        LKCloud["LiveKit Cloud SFU (WebRTC Audio Rooms)"]
    end

    subgraph Service_Mesh ["Microservice Core"]
        FastAPI["FastAPI Core Backend (Port 8001)<br/>• Auth & JWT Sessions<br/>• Document Vault Router<br/>• Token & Dispatch Services"]
        AIAgent["LiveKit Voice Worker (ai_service)<br/>• Silero VAD (Edge Voice Detection)<br/>• Indic State Machine<br/>• Clinical Tool Calling"]
    end

    subgraph Intelligence_Cloud ["AI & Foundation Models"]
        SarvamSTT["Sarvam AI Saarika v2.5 (Indic STT)"]
        GroqLLM["Groq Llama 3.3 70B / Fast Clinical LLM"]
        SarvamTTS["Sarvam AI Bulbul v3 (Indic TTS)"]
        GeminiVision["Google Gemini 2.5 Flash Lite (Vision AI)"]
    end

    subgraph Persistence_Layer ["Cloud Persistence & Security"]
        SupaDB[("Supabase PostgreSQL<br/>Patients, Consultations, Clinical Notes")]
        SupaStorage[("Supabase Private S3 Storage<br/>'medical-vault' (15-min Signed URLs)")]
    end

    %% Wiring
    UI -->|HTTP REST /api| FastAPI
    UI -->|WebRTC Audio Stream| LKCloud
    AudioClient <--> LKCloud
    DocPortal -->|HTTP REST /api/doctor| FastAPI

    LKCloud <-->|Bi-directional WebRTC| AIAgent
    FastAPI -->|Token Issuance & Webhook| LKCloud

    AIAgent -->|Audio Frames| SarvamSTT
    SarvamSTT -->|Transcribed Indic Text| GroqLLM
    GroqLLM -->|Synthesized Response| SarvamTTS
    SarvamTTS -->|Synthesized Opus Audio| AIAgent

    FastAPI -->|Scans & Prescriptions| GeminiVision
    FastAPI -->|Store & Query Records| SupaDB
    FastAPI -->|Encrypted Blob Upload| SupaStorage
    AIAgent -->|Persist Clinical Intake| SupaDB
```

---

## 3. Real-Time Vernacular Voice Streaming Pipeline

The voice pipeline delivers human-like conversational responsiveness with sub-1800ms end-to-end turn-taking latency.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Rural Patient (Tripura PHC)
    participant Kiosk as Browser Kiosk / Client
    participant LiveKit as LiveKit SFU (WebRTC)
    participant Worker as Voice Agent (ai_service)
    participant VAD as Silero VAD (Voice Detection)
    participant STT as Sarvam AI (Saarika v2.5)
    participant LLM as Groq Fast Clinical LLM
    participant TTS as Sarvam AI (Bulbul v3)
    participant DB as Supabase PostgreSQL

    Patient->>Kiosk: Speaks in Bengali ("আমার তিন দিন ধরে খুব জ্বর আসছে...")
    Kiosk->>LiveKit: Sends 48kHz Opus Audio Track via WebRTC
    LiveKit->>Worker: Audio Frame Stream
    Worker->>VAD: Detect speech boundaries & silence (>400ms)
    VAD-->>Worker: Speech End Frame Dispatched
    Worker->>STT: Audio Payload (Language Locked: bn-IN)
    STT-->>Worker: Transcribed Bengali Text
    Worker->>LLM: Ingest text + System Medical Intake Prompt + Context
    Note over LLM: Evaluates red flags, symptom duration & vitals
    LLM-->>Worker: Response Text ("জ্বর কি কাঁপুনি দিয়ে আসছে?...")
    Worker->>TTS: Stream response text (Bulbul v3 - Bengali)
    TTS-->>Worker: Synthesized Audio PCM / Opus Chunks
    Worker->>LiveKit: Publish Agent Audio Track
    LiveKit->>Kiosk: Stream audio back to Patient
    Kiosk->>Patient: Plays audio response through speakers
    Worker->>DB: Asynchronously commit turn transcript to consultation session
```

---

## 4. Multi-Modal Medical Drive & Vision AI Architecture

Patients routinely arrive with handwritten prescription notes, paper laboratory reports, and physical X-ray film sheets.

```mermaid
flowchart LR
    A[Patient Uploads Scan / Photo] --> B[FastAPI /api/documents/upload]
    B --> C{MIME & Integrity Check}
    C -->|Valid Image/PDF| D[Store in Supabase 'medical-vault']
    D --> E[Generate Temporary Signed URI]
    E --> F[Google Gemini 2.5 Flash Lite Vision API]
    F --> G{Classify Document Type}
    G -->|Prescription| H[Extract Doctor, Hospital, Medications & Dosages]
    G -->|Lab Report| I[Extract Tabular Blood Panel, Normal Ranges, Out-of-Range Flags]
    G -->|Radiograph| J[Analyze Anatomical Fields, CTR, Focal Consolidations]
    H --> K[Normalize Clinical JSON]
    I --> K
    J --> K
    K --> L[Save to Supabase DB: documents table]
    L --> M[Surface in Doctor EMR Vault Viewer]
```

---

## 5. Doctor Clinical Decision Support (CDS) & Triage Workflow

```mermaid
stateDiagram-v2
    [*] --> Patient_Intake: Patient Arrives at Kiosk
    Patient_Intake --> Voice_Triage: Vernacular Voice Session Active
    Voice_Triage --> Synthesizing_SOAP: Voice Intake Finished
    Synthesizing_SOAP --> Doctor_Queue: Triage Categorization
    
    state Doctor_Queue {
        [*] --> Priority_Assignment
        Priority_Assignment --> RED_CRITICAL: SpO2 < 92% OR Chest Pain OR Dyspnoea
        Priority_Assignment --> YELLOW_MODERATE: High Fever > 101F OR Platelets < 1.5L
        Priority_Assignment --> GREEN_ROUTINE: Stable Mild Symptoms
    }
    
    Doctor_Queue --> Doctor_Consultation: Doctor Opens Patient Chart
    Doctor_Consultation --> Document_Inspection: Review Uploaded Scans & Gemini Vision Summaries
    Document_Inspection --> Prescription_Editing: Adjust Pre-populated Treatment Plan
    Prescription_Editing --> Slide_To_Confirm: Doctor Confirms Diagnosis
    Slide_To_Confirm --> Finalized: Status = APPROVED
    Finalized --> [*]: Digital Prescription Dispatched via SMS / Print
```

---

## 6. Database Entity-Relationship Diagram (ERD)

The system relies on a clean, relational schema hosted on Supabase Cloud (PostgreSQL) with Row-Level Security (RLS) enforcement.

```mermaid
erDiagram
    PATIENTS ||--o{ CONSULTATIONS : "has"
    PATIENTS ||--o{ DOCUMENTS : "owns"
    CONSULTATIONS ||--|| CLINICAL_NOTES : "generates"
    CONSULTATIONS ||--o{ PRESCRIPTIONS : "results_in"

    PATIENTS {
        uuid id PK
        string phone UK
        string pin_hash
        string name
        int age
        string gender
        string language_preference
        string abha_id
        jsonb medical_history
        timestamp created_at
    }

    CONSULTATIONS {
        uuid id PK
        uuid patient_id FK
        string intake_language
        string triage_severity
        string chief_complaint
        jsonb conversation_transcript
        string status
        timestamp started_at
        timestamp ended_at
    }

    CLINICAL_NOTES {
        uuid id PK
        uuid consultation_id FK
        text subjective
        text objective
        text assessment
        text plan
        jsonb red_flags
        jsonb vitals_summary
        timestamp generated_at
    }

    DOCUMENTS {
        uuid id PK
        uuid patient_id FK
        string document_type
        string file_name
        string storage_path
        jsonb vision_ai_analysis
        float confidence_score
        timestamp uploaded_at
    }

    PRESCRIPTIONS {
        uuid id PK
        uuid consultation_id FK
        string doctor_name
        string doctor_reg_no
        jsonb medications
        text instructions
        string status
        timestamp approved_at
    }
```

---

## 7. Security, Privacy & Compliance Architecture

1. **Authentication & Access Control:**
   * Kiosk access uses Phone Number + Salted Bcrypt 4-digit PIN authentication.
   * Doctor Dashboard is protected by scoped role-based access tokens.
2. **Storage Isolation (Zero-Trust):**
   * Medical documents are stored in a private Supabase Storage bucket (`medical-vault`) with public access disabled.
   * Clients access scans strictly through short-lived (15-minute) pre-signed URLs.
3. **Audio Privacy & Ephemeral Processing:**
   * Raw voice audio buffers are processed in memory by the LiveKit worker and discarded post-synthesis.
   * Only the sanitized text transcript and extracted clinical metrics are persisted to the database.
4. **ABDM (Ayushman Bharat Digital Mission) Readiness:**
   * Patient entities carry standard 14-digit ABHA identifiers (`XX-XXXX-XXXX-XXXX`).
   * Clinical notes are structured according to standard FHIR SOAP models ready for National Health Stack interoperability.

---

## 8. Rural Resilience & Low-Bandwidth Optimizations

* **Adaptive Opus Audio Bitrate:** WebRTC audio streams throttle from 48kbps down to 12kbps under poor rural cellular conditions with Forward Error Correction (FEC).
* **Vite Production Bundling:** The client application compiles into lightweight chunks (<300KB initial load) with aggressive local asset caching.
* **Graceful Degradation:** If Gemini Vision is unavailable, documents remain securely stored in the patient's vault for direct visual inspection by the physician.
