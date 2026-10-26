/**
 * AarogyaVaani Frontend API Service
 * Connects React Vite UI to FastAPI (:8001) and Supabase Cloud.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

/**
 * Universal Patient ID Normalizer (converts short demo IDs 'AV-8921' to official Supabase format 'AV-2026-8921')
 */
export function normalizePatientId(id) {
  if (!id) return "AV-2026-8921";
  const str = String(id).trim();
  if (str.startsWith("AV-") && str.length === 7) {
    return `AV-2026-${str.slice(3)}`;
  }
  return str;
}

/**
 * 0. Authentication APIs (Phone + 4-digit PIN)
 */
export async function registerUser({ name, phone, pin, district, age, gender, preferred_language }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, pin, district: district || "", age: age || "", gender: gender || "", preferred_language: preferred_language || "bn-IN" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

export async function loginUser({ phone, pin }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, pin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function getAuthProfile(patientRef) {
  const res = await fetch(`${API_BASE}/auth/profile/${patientRef}`);
  if (!res.ok) return null;
  return await res.json();
}

/**
 * 1. Patients APIs
 */
export async function getPatients() {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] Falling back for getPatients:", err);
    return [];
  }
}

export async function getPatient(patientId) {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Falling back for getPatient(${patientId}):`, err);
    return null;
  }
}

export async function updatePatient(patientId, updates) {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to update patient ${patientId}:`, err);
    return null;
  }
}

export async function fetchPatientDossier(patientId) {
  try {
    const pId = normalizePatientId(patientId);
    const res = await fetch(`${API_BASE}/orchestrator/patient/${pId}/dossier`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch dossier for ${patientId}:`, err);
    return null;
  }
}


/**
 * 2. Dedicated AI Doctor Voice & Chat REST APIs
 */
export async function sendAIDoctorChatTurn(params) {
  try {
    const consultationId = params.consultationId || params.consultation_id || null;
    const patientId = params.patientId || params.patient_id || "NEW_PATIENT";
    const userName = params.userName || params.user_name || null;
    const userMessage = params.userMessage || params.user_message || "";
    const language = params.language || "bn-IN";
    const history = params.history || [];
    const attachedDocument = params.attachedDocument || params.attached_document || null;

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultation_id: consultationId,
        patient_id: patientId,
        user_name: userName,
        user_message: userMessage,
        language: language,
        history: history,
        attached_document: attachedDocument,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] Failed sendAIDoctorChatTurn:", err);
    throw err;
  }
}

export async function sendAIDoctorVoiceTurn(params) {
  try {
    const consultationId = params.consultationId || params.consultation_id || null;
    const patientId = params.patientId || params.patient_id || "NEW_PATIENT";
    const userName = params.userName || params.user_name || null;
    const userMessage = params.userMessage || params.user_message || "";
    const language = params.language || "bn-IN";
    const history = params.history || [];
    const attachedDocument = params.attachedDocument || params.attached_document || null;

    const res = await fetch(`${API_BASE}/ai/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
      body: JSON.stringify({
        consultation_id: consultationId,
        patient_id: patientId,
        user_name: userName,
        user_message: userMessage,
        language: language,
        history: history,
        attached_document: attachedDocument,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] Failed sendAIDoctorVoiceTurn:", err);
    throw err;
  }
}

export async function queryDocumentWithAI({ consultationId, patientId, userName, documentId, query, language, history }) {
  try {
    const res = await fetch(`${API_BASE}/ai/document-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultation_id: consultationId || null,
        patient_id: patientId || "NEW_PATIENT",
        user_name: userName || null,
        document_id: documentId || null,
        query: query,
        language: language || "bn-IN",
        history: history || [],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] Failed queryDocumentWithAI:", err);
    throw err;
  }
}

export async function saveAIConsultation(payload) {
  try {
    const res = await fetch(`${API_BASE}/ai/consultation/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errDetail = await res.text();
      throw new Error(`HTTP ${res.status}: ${errDetail}`);
    }
    return await res.json();
  } catch (err) {
    console.error("[API_ERROR] Failed to persist AI consultation:", err);
    throw err;
  }
}

// Backward-compatibility aliases & consultation management
export const saveVoiceConsultation = saveAIConsultation;
export const sendVoiceChatTurn = sendAIDoctorChatTurn;

export async function getPatientConsultations(patientId) {
  try {
    const pId = normalizePatientId(patientId);
    const res = await fetch(`${API_BASE}/orchestrator/consultations/patient/${pId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch consultations for ${patientId}:`, err);
    return [];
  }
}

export async function getConsultationById(consultationId) {
  try {
    const res = await fetch(`${API_BASE}/orchestrator/consultations/${consultationId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch consultation ${consultationId}:`, err);
    return null;
  }
}

export async function submitDoctorReview(consultationId, reviewData) {
  try {
    const res = await fetch(`${API_BASE}/orchestrator/consultations/${consultationId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[API_ERROR] Failed to review consultation ${consultationId}:`, err);
    throw err;
  }
}

/**
 * 3. LiveKit WebRTC Room Access Token
 */
export async function fetchLiveKitToken(patientId, patientName, roomName, language = "en-IN") {
  try {
    const res = await fetch(`${API_BASE}/orchestrator/livekit/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        patient_name: patientName,
        room_name: roomName,
        language: language,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API_ERROR] Failed to generate LiveKit token:", err);
    throw err;
  }
}

/**
 * 4. Medical Drive & Evidence Documents
 */
export async function fetchPatientDocuments(patientId, category = null, query = null) {
  try {
    const pId = normalizePatientId(patientId);
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (query) params.append("title", query);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/documents/patient/${pId}${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch documents for ${patientId}:`, err);
    return [];
  }
}

export async function uploadMedicalDocument(formData) {
  try {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API_ERROR] Upload failed:", err);
    throw err;
  }
}

export async function deletePatientDocument(recordId) {
  try {
    const res = await fetch(`${API_BASE}/documents/${recordId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to delete document ${recordId}:`, err);
    return { status: "error", error: err.message };
  }
}

export async function deletePatientConsultation(consultationId) {
  try {
    const res = await fetch(`${API_BASE}/orchestrator/consultations/${consultationId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to delete consultation ${consultationId}:`, err);
    return { status: "error", error: err.message };
  }
}

/**
 * 5. Appointments & Healthcare Facilities
 */
export async function fetchHealthcareFacilities() {
  try {
    const res = await fetch(`${API_BASE}/appointments/facilities`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] Failed to fetch facilities:", err);
    return [];
  }
}

export async function fetchPatientAppointments(patientId) {
  try {
    const res = await fetch(`${API_BASE}/appointments/patient/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch appointments for ${patientId}:`, err);
    return [];
  }
}

export async function bookPatientAppointment(appointmentData) {
  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API_ERROR] Failed to book appointment:", err);
    throw err;
  }
}

export async function cancelPatientAppointment(appointmentId) {
  try {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to cancel appointment ${appointmentId}:`, err);
    return { status: "error", error: err.message };
  }
}

/**
 * 6. Doctor Sharing & ABDM Temporary Passcodes
 */
export async function generateShareCode({ patientId, patientName, durationHours = 24, scope }) {
  try {
    const res = await fetch(`${API_BASE}/share/generate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        patient_name: patientName,
        duration_hours: durationHours,
        scope: scope,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API_ERROR] Failed to generate share code:", err);
    throw err;
  }
}

export async function fetchShareCodes(patientId) {
  try {
    const res = await fetch(`${API_BASE}/share/codes/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch share codes for ${patientId}:`, err);
    return [];
  }
}

export async function revokeShareCode(codeId) {
  try {
    const res = await fetch(`${API_BASE}/share/codes/${codeId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to revoke share code ${codeId}:`, err);
    return { status: "error", error: err.message };
  }
}

export async function fetchShareAuditLogs(patientId) {
  try {
    const res = await fetch(`${API_BASE}/share/audit/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch audit logs for ${patientId}:`, err);
    return [];
  }
}

