# AarogyaVaani: Test Matrix, Test Cases & Quality Assurance Guide

> **Document Version:** 1.0.0  
> **Target Environment:** Hack for Social Good 2026 Evaluation  
> **Scope:** End-to-End Verification across Voice Agent, Vision AI, REST APIs, and Doctor Workflow

---

## 🧪 Quick Test Execution

Run automated unit and integration tests across the stack:

### 1. Backend REST API & Clinical Services
```bash
cd server
PYTHONPATH=. .venv/bin/pytest -v
```
*Expected Result: 12+ tests pass covering phone authentication, document persistence, orchestrator turns, and clinical entity extraction.*

### 2. LiveKit AI Voice Agent & Indic Language Locking
```bash
cd ai_service
uv run pytest -v
```
*Expected Result: Verifies Sarvam STT/TTS connectors, Groq clinical prompt synthesis, and silence threshold detection.*

### 3. Frontend Production Build & Bundle Check
```bash
cd client
npm run build
```
*Expected Result: Zero TypeScript/JSX compilation errors; Vite generates optimized static assets.*

---

## 📋 Comprehensive Test Cases Matrix

| Test ID | Module / Feature | Test Description | Input / Precondition | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Patient Authentication | Login with registered phone & 4-digit PIN | `+919862100001`, PIN `1234` | HTTP 200, JWT token returned, redirect to Patient Dashboard | ✅ PASS |
| **TC-AUTH-02** | Security & Brute Force | Attempt login with invalid PIN 3 times | `+919862100001`, PIN `9999` | HTTP 401 Unauthorized, descriptive error message | ✅ PASS |
| **TC-VOICE-01**| WebRTC Connection | Establish WebRTC room connection via LiveKit SDK | Click "Start Consultation" in browser | Room status `connected`, audio track published in <1.2s | ✅ PASS |
| **TC-VOICE-02**| Indic Language Locking | Voice dialogue in pure Bengali (`bn-IN`) | "আমার তিন দিন ধরে খুব জ্বর" | Sarvam STT transcribes Bengali script; Groq replies in fluent Bengali | ✅ PASS |
| **TC-VOICE-03**| Language Toggle (Hindi) | Switch language preference to Hindi (`hi-IN`) | "मुझे कल रात से पेट में दर्द है" | STT correctly routes to Hindi acoustic model; audio output in Hindi | ✅ PASS |
| **TC-VOICE-04**| Turn-taking Latency | Measure end-to-end latency from silence to audio reply | 3-second patient speech utterance | VAD triggers at 400ms silence; first TTS audio byte plays within <1800ms | ✅ PASS |
| **TC-VISION-01**| Medical Prescription OCR | Upload handwritten doctor prescription image | Upload `samples/sample_prescription.jpg` | Gemini 2.5 Flash extracts Doctor name, diagnosis, medication table | ✅ PASS |
| **TC-VISION-02**| Chest Radiograph (X-Ray)| Upload Chest X-Ray radiograph | Upload `samples/sample_xray.jpg` | Returns anatomical findings, cardiothoracic ratio, impression | ✅ PASS |
| **TC-VISION-03**| CBC Pathology Lab Panel | Upload automated blood test PDF/image | Upload `samples/sample_lab_report.jpg` | Tables extracted: Hemoglobin, TLC, Platelets with out-of-range flags | ✅ PASS |
| **TC-DOC-01**  | Doctor EMR Triage | Verify patient appears in Doctor OPD queue | Patient finishes voice consultation | Queue displays patient with triage badge (YELLOW/RED) & chief complaint | ✅ PASS |
| **TC-DOC-02**  | Slide-to-Confirm | Doctor approves clinical notes via UI slider | Drag slider to 100% confirmation | Status transitions to `APPROVED`, digital prescription generated | ✅ PASS |
| **TC-SEC-01**  | Document Privacy | Verify private vault signed URL expiration | Access direct Supabase storage link | Direct link returns HTTP 403; access only permitted via 15-min signed token | ✅ PASS |

---

## 🎯 Realistic Edge Case Scenarios

### Edge Case 1: Code-Mixing (Bengali-English / "Banglish")
* **Scenario:** A patient in Agartala says: *"Amar throat pain hocche ar fever 101 ache."*
* **Verification:** Sarvam STT normalizes the phonetic transliteration. The Groq clinical reasoning agent correctly extracts:
  * Symptom: Pharyngitis / Sore throat
  * Symptom: Fever (101°F)
* **Result:** No crash or hallucination; dialogue remains medically relevant.

### Edge Case 2: Rural Network Packet Loss (Simulated 20% Packet Loss)
* **Scenario:** WebRTC connection experiences jitter or 20% UDP packet loss over 2G/3G rural cellular connections.
* **Verification:** LiveKit Opus codec auto-adjusts bitrate from 32kbps down to 12kbps with Forward Error Correction (FEC). Voice remains intelligible without dropped WebSocket connection.

### Edge Case 3: Blurry or Low-Light Camera Scans
* **Scenario:** Patient photographs paper report in dim rural PHC lighting with slight camera blur.
* **Verification:** Gemini 2.5 Flash Lite applies internal contrast balancing; prompts explicitly flag ambiguous handwriting with `[unclear]` tags instead of hallucinating medication dosages.
