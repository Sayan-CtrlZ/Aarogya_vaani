# Design Audit & Implementation Plan: LiveKit Voice Agent UI & Patient Intake Portal

## Design language
- Audited surface: Patient AI Doctor Consultation (`/patient/ai-doctor` & `LiveVoiceAssistant.jsx`)
- Design sources: 
  - User Excalidraw Wireframe (`media_1791746373526.png`)
  - LiveKit Agents UI Design Spec & 5-bar Waveform Spec (User Image 2)
  - LiveKit React Component & Shadcn Agents UI reference documentation
- Documented decisions:
  - Main intake view must be clean, human, and conversational ("hello User_name / what is the issue").
  - Assessment cards must be presented in a clean 4-card layout without robotic toggles or distracting headers.
  - Bottom input capsule must be branded for AarogyaVani ("ask arogyavaani ai") with a circular voice launcher button, without robotic "Think" buttons or ChatGPT references.
  - Clicking the voice button transitions seamlessly to the deep-blue LiveKit Voice Room UI with live audio waveform animation (5 rounded vertical bars matching Image 2), picture-in-picture user video tile, and LiveKit AgentControlBar with an `END CALL` action.
- Governing owners and consumers: `LiveVoiceAssistant.jsx`, `PatientAIDoctorPage.jsx`, `PatientDashboard.jsx`
- Explicit exceptions: None documented

---

## Findings
| # | Problem | Evidence | Proposed change | Scope | Confidence |
|---|---|---|---|---|---|
| 1 | Robotic header clutter & disparate visual hierarchy | Current header shows mode toggles, dark/light buttons, and chat/voice tabs; user Excalidraw wireframe specifies a clean header with "hello User_name / what is the issue" and 4 cards | Remove robotic upper header elements; render welcoming "hello {user} / what is the issue" hero followed by 4 clean clinical option cards | `LiveVoiceAssistant.jsx` hero & header layout | High |
| 2 | Outdated ChatGPT placeholder & unnecessary "Think" button | Bottom capsule had "Ask ChatGPT" and "Think" pill button; user wireframe requires "ask arogyavaani ai" and removal of the "Think" button | Update input placeholder to "ask arogyavaani ai", remove "Think" button, and place the circular voice launcher button on the right | `LiveVoiceAssistant.jsx` bottom input capsule | High |
| 3 | Voice room animation & layout does not match LiveKit Agents UI spec | Current voice mode used complex floating orb; user provided LiveKit Agents UI blueprint with blue background, 5-bar rounded waveform (Image 2), webcam PIP tile, and red `END CALL` button | Rebuild voice room to match LiveKit Agents UI: deep-blue background (`#070d1e`), 5-bar animated audio waveform, webcam PIP tile in bottom-right, and LiveKit AgentControlBar with `END CALL` button | `LiveVoiceAssistant.jsx` voice room view & visualizer | High |

---

## Improve first
Rebuild the Voice Agent experience into the dual-surface model depicted in the user's Excalidraw drawing:
1. **Intake Portal View:** Clean, uncluttered layout with `hello {user} / what is the issue`, 4 interactive clinical option cards, and the `ask arogyavaani ai` capsule bar.
2. **LiveKit Agents Voice Room:** Triggered when clicking the circular voice launcher button; displays deep-blue background, the exact 5-bar rounded waveform animation from Image 2, picture-in-picture webcam tile of the user's face, and LiveKit control bar with `END CALL`.

---

## Self-Contained Implementation Plan

### Phase 1: Clean Intake Hero & 4 Cards Layout
- In `LiveVoiceAssistant.jsx`, simplify the initial screen when voice room is not active.
- Display a prominent, friendly header:
  - `hello {patientDisplayName}`
  - `what is the issue`
- Render the 4 clinical intake / symptom cards in a clean, balanced grid with subtle hover animations and direct one-click selection.
- Update the bottom input bar:
  - Clean pill container.
  - Placeholder: `ask arogyavaani ai`.
  - Remove `Think` button.
  - Render circular Voice Launcher button on the right.

### Phase 2: LiveKit Agents UI Voice Room (Deep Blue Theme)
- When clicking the voice button, activate full-screen LiveKit Voice Room (`isVoiceRoomOpen = true`).
- Background: Deep navy/blue (`bg-[#070d1e]` or `bg-[#0b1329]`).
- Top Bar:
  - Left: Cyan `LK` badge + `AarogyaVani Voice`.
  - Right: `BUILT WITH LIVEKIT AGENTS`.
- Center:
  - Implement `LiveKitWaveformVisualizer` featuring the exact 5 rounded vertical bars matching User Image 2.
  - Animate heights dynamically on voice input and AI synthesis.
  - Live subtitles captioning spoken dialogue.
- Bottom-Right:
  - Picture-in-Picture webcam video tile (`getUserMedia({ video: true })`) allowing the patient to see their own face.
- Bottom Control Bar:
  - Microphone mute/unmute button.
  - Camera toggle button.
  - Red `END CALL` button on the far right that ends the session, persists transcript to Supabase with `user_name`, and returns to the main intake view.
