# AarogyaVaani: Comprehensive System Architecture & API Reference Manual

> **Document Version:** 1.0.0  
> **Audience:** Core Engineering Team, Hackathon Judges & Contributors  
> **Repository:** `Aarogya_vaani` (Voice-First Vernacular Clinical Intake & Triage Portal for PHCs)  
> **Architecture Pattern:** Microservices Architecture (FastAPI Core Server + LiveKit AI Voice Agent + React Vite Frontend + Supabase Cloud)

---

## 1. High-Level System Architecture

AarogyaVaani is built with three distinct layers operating concurrently:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   REACT VITE FRONTEND                                  │
│                              (Port 5173 - Client Browser)                              │
│                                                                                        │
│   [Login / Registration]    [Live Voice Room]    [Medical Drive]    [Doctor Dashboard] │
└─────────────┬───────────────────────┬───────────────────┬──────────────────────┬───────┘
              │                       │                   │                      │
     HTTP REST Auth & Data     WebRTC Audio Stream &  Multipart File Upload &  REST EMR &
     (/api/auth, /api/patients) Data Channel Events     Vision AI Analysis     Doctor Review
              │                       │                   │                      │
              ▼                       │                   ▼                      ▼
┌───────────────────────────┐         │         ┌────────────────────────────────────────┐
│     FASTAPI BACKEND       │         │         │         FASTAPI BACKEND                │
│       (Port 8001)         │         │         │           (Port 8001)                  │
│                           │         │         │                                        │
│ • Authentication & Token  │         │         │ • Gemini Vision AI Analyzers           │
│ • LiveKit Agent Dispatch  │         │         │ • Clinical EMR & Consultations         │
│ • Clinical Dossier Synthes│         │         │ • Supabase Storage Private Vault       │
└─────────────┬─────────────┘         │         └───────────────────┬────────────────────┘
              │                       │                             │
       Issues Token &                 │                      Persists Records,
       Triggers Dispatch              │                      Signatures & Triage
              │                       │                             │
              ▼                       ▼                             ▼
┌───────────────────────────┐   WebRTC Audio    ┌────────────────────────────────────────┐
│    LIVEKIT CLOUD WEBRTC   │◄─────────────────►│             SUPABASE CLOUD             │
│ (wss://hack-for-verma... )│                   │  • PostgreSQL: patients, medical_recs, │
└─────────────┬─────────────┘                   │                consultations           │
              │                                 │  • Storage: private 'medical-vault'    │
       Assigns Room Job                         └────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         LIVEKIT VOICE AGENT WORKER (ai_service)                        │
│                           (Python Agent Worker Process)                                │
│                                                                                        │
│ • Silero VAD (Voice Activity Detection)                                                │
│ • Sarvam AI STT (Saarika v2.5 - Indic Speech-to-Text: Bengali, Hindi, English)         │
│ • Groq Cloud Fast LLM (openai/gpt-oss-120b - Clinical Dialogue & Adaptive Intake)      │
│ • Sarvam AI TTS (Bulbul v3 - Bengali 'roopa', Hindi 'priya', English 'ishita')         │
│ • Function Tools: queries patient prescriptions, lab reports, X-rays from Supabase     │
│ • Real-time Sync: pushes each conversational turn directly to FastAPI / Supabase       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Voice Service (`ai_service`) — Are HTTP Endpoints Created?

### ❓ Does `ai_service` expose HTTP REST endpoints?
**NO.** `ai_service` does **not** expose public HTTP REST endpoints for the client.

### How Does `ai_service` Communicate?
`ai_service` runs as an asynchronous **LiveKit Agents Worker** (`agent.py`). It connects directly to **LiveKit Cloud via WebRTC** and handles communication through three primary channels:

1. **Inbound WebRTC Audio Stream**:
   - The user speaks into their browser microphone.
   - The browser streams raw audio over WebRTC to LiveKit Cloud.
   - `ai_service` receives the audio frames and applies **Silero VAD** (Voice Activity Detection) to detect when the patient stops speaking.
2. **Real-Time Speech Processing Pipeline**:
   - **STT (Speech-to-Text)**: Uses **Sarvam AI** (`saarika:v2.5`) to transcribe vernacular audio (Bengali, Hindi, or English).
   - **Clinical Intake Brain**: Evaluates the patient's symptoms using an adaptive 1-question-per-turn protocol and safety rules (`rules/danger_signs.py`).
   - **TTS (Text-to-Speech)**: Uses **Sarvam AI Bulbul v3** to stream realistic, human-paced vernacular audio back to the room (`roopa` for Bengali, `priya` for Hindi, `ishita` for English).
3. **WebRTC Data Channel (`topic: "transcript"`)**:
   - For every conversational turn, `agent.py` broadcasts JSON packets over the LiveKit WebRTC Data Channel to all room participants:
     ```json
     {
       "type": "transcript",
       "speaker": "assistant",
       "role": "assistant",
       "text": "নমস্কার, আরোগ্যবাণীতে আপনাকে স্বাগতম। আপনি কেমন অনুভব করছেন?",
       "timestamp": 1791895020.12
     }
     ```
   - The React frontend receives this instantly on `room.on(RoomEvent.DataReceived)` and renders live subtitles and chat bubbles without polling.
4. **Outbound HTTP Calls from `ai_service` to `server`**:
   `ai_service` acts as an **HTTP Client** calling the FastAPI backend via [`orchestrator_client.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/ai_service/orchestrator_client.py):
   - `POST /api/orchestrator/consultations`: Persists consultation turns, duration, symptoms timeline, detected maternal/general danger signs, and triage level (`STABLE`, `MONITOR`, `EMERGENCY`) to Supabase.
   - `GET /api/orchestrator/patient/{patient_id}/dossier`: Fetches the patient's full medical history so the AI doctor can answer questions about active medications and past tests.

### Function Tools Available to the Voice Agent
When interacting with returning patients, the voice agent has direct access to LLM tools:
- `check_prescription_medicines(medicine_name)`: Looks up active medicines, dosages, and instructions from Supabase records.
- `check_xray_findings()`: Looks up recent X-ray/radiology impressions and findings.
- `check_lab_results(test_name)`: Looks up blood tests, abnormal flags (HIGH/LOW/CRITICAL), and reference ranges.
- `set_language(language_code)`: Explicitly changes the voice session language between Bengali (`bn-IN`), Hindi (`hi-IN`), and English (`en-IN`).

---

## 3. Backend Server (`server`) — Complete API Endpoint Catalog

All HTTP endpoints are hosted by FastAPI on `http://localhost:8001/api`.

### 3.1 Authentication Router (`/api/auth`)
*Defined in:* [`server/app/api/auth.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/auth.py)

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new patient with Phone + 4-digit PIN | `{ name, phone, pin, district, age, gender, preferred_language }` | Full patient record + success message |
| `POST` | `/api/auth/login` | Authenticate patient with Phone + PIN | `{ phone, pin }` | Full patient record + profile metadata |
| `GET` | `/api/auth/profile/{patient_ref}` | Fetch patient auth profile (excludes PIN hash) | Path param: `patient_ref` | Patient record |

---

### 3.2 Unified Documents & Medical Vault Router (`/api/documents`)
*Defined in:* [`server/app/api/documents.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/documents.py)

| Method | Endpoint | Description | Request | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` or `/api/documents/analyze` | Upload and analyze any medical document (Prescription, Lab Report, or X-Ray) using Gemini Flash Vision AI | `multipart/form-data`: `file`, `patient_id`, `category`, `title`, `facility`, `notes` | Full `MedicalRecordResponse` with extracted JSON & multilingual summaries |
| `GET` | `/api/documents/{record_id}` | Retrieve analyzed document by ID with signed download URL | Path param: `record_id` | `MedicalRecordResponse` |
| `GET` | `/api/documents/patient/{patient_id}` | List all documents for a patient with optional filters | Query params: `category`, `search`, `visit_date` | `list[MedicalRecordResponse]` |
| `POST` | `/api/documents/{record_id}/ask` | Interactive Q&A asking questions about a specific document | Path param: `record_id`, Body: `{ question, language }` | `{ document_id, question, answer, language }` |

---

### 3.3 Dedicated Medical Analyzers (`/api/prescriptions`, `/api/lab-reports`, `/api/xray-radiology`)
*Defined in:* [`server/app/api/prescriptions.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/prescriptions.py), [`lab_reports.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/lab_reports.py), [`xray_radiology.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/xray_radiology.py)

| Method | Endpoint | Description | Request |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/prescriptions/analyze` | Specialized OCR for doctor handwriting, active medications, dosages, frequency | `multipart/form-data`: `file`, `patient_id`, `facility` |
| `POST` | `/api/lab-reports/analyze` | Specialized pathology analyzer: extracts test names, numeric values, units, reference ranges, and flags (`HIGH`, `LOW`, `CRITICAL`) | `multipart/form-data`: `file`, `patient_id`, `lab_name` |
| `POST` | `/api/xray-radiology/analyze` | Specialized radiology scan inspector: anatomical body part, radiologist impression, abnormality detection | `multipart/form-data`: `file`, `patient_id`, `body_part`, `clinical_history` |

---

### 3.4 Patients & EMR Clinical Context Router (`/api/patients`)
*Defined in:* [`server/app/api/patients.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/patients.py)

| Method | Endpoint | Description | Request | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | List all registered patients for Doctor Dashboard | None | `list[PatientRecord]` |
| `GET` | `/api/patients/{patient_id}` | Fetch patient demographics and clinical flags | Path param: `patient_id` | Patient details |
| `PATCH` | `/api/patients/{patient_id}` | Update patient demographics (name, age, district) | Path param: `patient_id`, Body: `dict` | Updated patient record |
| `GET` | `/api/patients/{patient_id}/context` | Consolidated medical briefing synthesizing all uploaded prescriptions, lab flags, and scans | Path param: `patient_id` | `PatientContextResponse` |

---

### 3.5 Clinical Orchestrator & LiveKit WebRTC Router (`/api/orchestrator`)
*Defined in:* [`server/app/api/orchestrator.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/orchestrator.py)

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orchestrator/livekit/token` | **Generates WebRTC token AND automatically dispatches `agent.py`** into the consultation room | `{ patient_id, patient_name, room_name, language }` | `{ token, url, room_name, participant_identity }` |
| `POST` | `/api/orchestrator/consultations` | Persists completed or in-progress voice consultation to Supabase table `consultations` with danger signs | `{ id, patient_id, user_name, duration_seconds, language_used, chief_complaint, symptoms_timeline, transcript, danger_signs, triage_level }` | Created consultation record |
| `GET` | `/api/orchestrator/consultations/patient/{patient_id}` | Retrieve all consultations for a patient ordered by newest first | Path param: `patient_id` | `list[ConsultationRecord]` |
| `GET` | `/api/orchestrator/consultations/{consultation_id}` | Get consultation by ID including full turn-by-turn transcript | Path param: `consultation_id` | `ConsultationRecord` |
| `PATCH` | `/api/orchestrator/consultations/{consultation_id}/review` | PHC Doctor reviews consultation, adds clinical notes, approves prescription | Path param: `consultation_id`, Body: `{ doctor_status, doctor_notes, doctor_prescription, triage_level }` | Updated consultation |
| `GET` | `/api/orchestrator/patient/{patient_ref}/dossier` | Compiles comprehensive clinical dossier from Supabase (demographics, active meds, lab flags, scans) | Path param: `patient_ref` | Clinical dossier |
| `POST` | `/api/orchestrator/voice/chat` | Fallback REST/Chat endpoint for clinical dialogue and emergency evaluation | `{ patient_id, user_message, language, history }` | AI response, triage rating, suggested options |

---

### 3.6 Dedicated AI Doctor Router (`/api/ai`)
*Defined in:* [`server/app/api/ai_doctor.py`](file:///home/bappaditya/coding/2026%20Projects/hack%20for%20social2/Aarogya_vaani/server/app/api/ai_doctor.py)

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Text chat turn with Gemini Flash, vernacular mirroring, and real-time consultation persistence | `{ consultation_id, patient_id, user_name, user_message, language, history, attached_document }` | `{ consultation_id, user_name, ai_message, language, triage_level, danger_signs, suggested_options, chief_complaint, timestamp }` |
| `POST` | `/api/ai/voice` | Speech-optimized AI turn (concise responses tuned for TTS reading) | Same as `/chat` | Same as `/chat` |
| `POST` | `/api/ai/document-query` | Allows patient to ask questions about an attached lab report or prescription while inside a consultation | `{ consultation_id, patient_id, user_name, document_id, query, language, history }` | Same as `/chat` with grounded document answer |
| `POST` | `/api/ai/consultation/save` | Explicitly saves or updates a finished AI consultation session in Supabase | `{ consultation_id, patient_id, user_name, duration_seconds, language_used, chief_complaint, symptoms_timeline, transcript, danger_signs, triage_level }` | Created/updated consultation |

---

## 4. Frontend Wiring Map (`client`)

All network requests from the React application pass through [`client/src/services/api.js`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/services/api.js). Here is how each screen connects to the backend:

| Frontend Page / Component | User Action | Function in `api.js` | Endpoint Called |
| :--- | :--- | :--- | :--- |
| [`Login.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/Login/Login.jsx) | Patient Registers account | `registerUser(payload)` | `POST /api/auth/register` |
| [`Login.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/Login/Login.jsx) | Patient Logs in with Phone + PIN | `loginUser(payload)` | `POST /api/auth/login` |
| [`LiveVoiceAssistant.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/components/LiveVoiceAssistant.jsx) | Enters Live Voice Consultation | `fetchLiveKitToken(...)` | `POST /api/orchestrator/livekit/token` |
| [`LiveVoiceAssistant.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/components/LiveVoiceAssistant.jsx) | Live Voice Communication | *WebRTC direct connection* | *LiveKit Cloud WebRTC* |
| [`LiveVoiceAssistant.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/components/LiveVoiceAssistant.jsx) | Types text in AI chat tab | `sendAIDoctorChatTurn(...)` | `POST /api/ai/chat` |
| [`LiveVoiceAssistant.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/components/LiveVoiceAssistant.jsx) | Ends call or clicks "Save" | `saveAIConsultation(...)` | `POST /api/ai/consultation/save` |
| [`PatientDocumentsPage.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/PatientDashboard/PatientDocumentsPage.jsx) | Views Medical Drive files | `fetchPatientDocuments(...)` | `GET /api/documents/patient/:id` |
| [`PatientDocumentsPage.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/PatientDashboard/PatientDocumentsPage.jsx) | Uploads Prescription / Lab / X-Ray | `uploadMedicalDocument(formData)` | `POST /api/documents/upload` |
| [`PatientDocumentsPage.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/PatientDashboard/PatientDocumentsPage.jsx) | Asks question about uploaded file | `queryDocumentWithAI(...)` | `POST /api/ai/document-query` |
| [`PatientConsultationsPage.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/PatientDashboard/PatientConsultationsPage.jsx) | Views past consultations | `getPatientConsultations(id)` | `GET /api/orchestrator/consultations/patient/:id` |
| [`DoctorReviewTab.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/DoctorDashboard/DoctorReviewTab.jsx) | PHC Doctor views consultation list | `getPatients()` | `GET /api/patients` |
| [`DoctorReviewTab.jsx`](file:///c:/Users/sayan/Desktop/Aarogya_vaani/client/src/pages/DoctorDashboard/DoctorReviewTab.jsx) | Doctor approves prescription & notes | `submitDoctorReview(id, data)` | `PATCH /api/orchestrator/consultations/:id/review` |

---

## 5. Quick-Start Guide for Your Teammates

### Option A: The One-Command Launcher (Recommended)
From the repository root, run:
```bash
./start_all.sh
```
This automatically launches:
1. **FastAPI Server** on `http://localhost:8001` (with auto-reload).
2. **LiveKit Voice Agent** running `uv run python agent.py dev` connected to LiveKit Cloud.
3. **React Vite Client** on `http://localhost:5173`.

---

### Option B: Running Services Manually in 3 Terminals

#### Terminal 1 — FastAPI Server:
```bash
cd server
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
*API Documentation available at:* `http://localhost:8001/docs`

#### Terminal 2 — LiveKit Voice Agent Worker:
```bash
cd ai_service
uv run python agent.py dev
```
*Expected log:* `INFO livekit.agents - registered worker {"id": "AW_...", "url": "wss://hack-for-verma-xdrpqda4.livekit.cloud"}`

#### Terminal 3 — React Client:
```bash
cd client
npm run dev
```
*Access in browser:* `http://localhost:5173`

---

## 6. How to Test Each Core Feature (2-Minute Walkthrough)

### 1. Test Live Voice Consultation (LiveKit + Sarvam AI)
1. Go to `http://localhost:5173/patient/ai-doctor`.
2. Click the circular voice button to launch voice mode.
3. Observe the top-right badge change to: **`LIVEKIT WEBRTC ACTIVE`** (with green pulsing dot).
4. Terminal 2 (`agent.py dev`) will log:
   ```text
   INFO livekit.agents - accepting job
   INFO livekit.agents - connected to room
   ```
5. The AI Doctor will immediately speak the initial greeting aloud through your speakers in your selected language (Bengali, Hindi, or English).
6. Speak into your microphone (e.g. *"I have severe headache and fever for 2 days"*). The 5-bar waveform will animate, live subtitles will appear, and the AI Doctor will ask follow-up clinical questions.

### 2. Test Medical Drive Document Upload & Gemini Vision OCR
1. Go to `http://localhost:5173/patient/documents`.
2. Upload any test medical file (image or PDF):
   - Handwritten Prescription
   - Pathology Blood Test Report
   - Chest X-Ray Scan
3. Click **Upload & Analyze**.
4. Gemini Flash Vision AI will parse the document, extract active medications and abnormal metrics, and save it to Supabase Storage `medical-vault` with an automatic triage status.
5. In the document view, type a question in the Q&A box (e.g., *"What is my hemoglobin level?"*). The AI answers based on the document's structured data.

### 3. Test Doctor Review & Clinical Triage Workflow
1. Switch to the PHC Doctor Portal at `http://localhost:5173/doctor`.
2. Open the **Review Tab**.
3. View the patient's incoming triage rating (`ROUTINE`, `MONITOR`, or `EMERGENCY`) generated by the AI session.
4. Expand the consultation transcript, enter clinical doctor notes, approve the prescription, and click **Submit Review**.
5. The consultation is updated in Supabase in real-time.

---

## 7. Troubleshooting FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Badge says `BUILT WITH LIVEKIT AGENTS` instead of `ACTIVE` | Client could not reach LiveKit Cloud or backend server | Ensure `uvicorn` is running on port 8001 and `LiveVoiceAssistant.jsx` has `targetRoomName` properly defined. |
| AI Doctor speaks in Hindi when you spoke in English | Model language lock mismatch | Fixed: The new `detect_utterance_language` mirror logic automatically matches your spoken or typed tongue. |
| Voice agent doesn't join room | Agent worker not running | Run `cd ai_service && uv run python agent.py dev`. Check that `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` match in both `server/.env` and `ai_service/.env`. |
| Microphone not hearing on Linux | Browser Web Speech permission issue | LiveKit WebRTC handles audio natively and does not rely on Google Cloud's Web Speech API. Ensure browser mic permission is allowed on `localhost:5173`. |
