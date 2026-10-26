// AarogyaVaani Secure Access Code & Audit Log Store
// Manages patient-controlled temporary sharing codes, permission scopes, expiry, and audit trails.

const STORAGE_CODES_KEY = "aarogyaVaaniAccessCodes";
const STORAGE_AUDIT_KEY = "aarogyaVaaniAccessAuditLog";

// Default initial state with an example code and audit entry
const INITIAL_CODES = [
  {
    code: "AV-7K4P-92",
    patientId: "AV-8921",
    patientName: "Mamta Debbarma",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 mins remaining
    durationMinutes: 30,
    status: "ACTIVE", // ACTIVE | EXPIRED | REVOKED
    scope: {
      currentVisit: true,
      selectedReports: true,
      medicalHistory: false,
    },
    doctorAccessCount: 1,
    lastAccessedBy: "Dr. S. Roy (Bishalgarh CHC)",
  },
];

const INITIAL_AUDIT = [
  {
    id: "aud-001",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    patientId: "AV-8921",
    code: "AV-7K4P-92",
    accessorRole: "Doctor",
    accessorName: "Dr. S. Roy",
    facility: "Bishalgarh Community Health Centre",
    action: "RECORD_VIEWED",
    details: "Accessed current clinical consultation and uploaded MCP report.",
  },
];

export function getAccessCodes() {
  try {
    const raw = localStorage.getItem(STORAGE_CODES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CODES_KEY, JSON.stringify(INITIAL_CODES));
      return INITIAL_CODES;
    }
    const codes = JSON.parse(raw);
    // Auto-update expired codes
    const now = new Date();
    let updated = false;
    const sanitized = codes.map((c) => {
      if (c.status === "ACTIVE" && new Date(c.expiresAt) < now) {
        updated = true;
        return { ...c, status: "EXPIRED" };
      }
      return c;
    });
    if (updated) {
      localStorage.setItem(STORAGE_CODES_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return INITIAL_CODES;
  }
}

export function generateTemporaryCode({
  patientId = "AV-8921",
  patientName = "Mamta Debbarma",
  durationMinutes = 15,
  scope = { currentVisit: true, selectedReports: true, medicalHistory: false },
}) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const code = `AV-${part1}-${part2}`;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

  const newCodeObj = {
    code,
    patientId,
    patientName,
    createdAt: now.toISOString(),
    expiresAt,
    durationMinutes,
    status: "ACTIVE",
    scope,
    doctorAccessCount: 0,
    lastAccessedBy: null,
  };

  const current = getAccessCodes();
  const nextList = [newCodeObj, ...current];
  localStorage.setItem(STORAGE_CODES_KEY, JSON.stringify(nextList));

  logAuditEvent({
    patientId,
    code,
    accessorRole: "Patient",
    accessorName: patientName,
    facility: "Patient Portal",
    action: "CODE_GENERATED",
    details: `Generated temporary access code expiring in ${durationMinutes} mins with scope: ${Object.keys(scope).filter((k) => scope[k]).join(", ")}.`,
  });

  return newCodeObj;
}

export function revokeAccessCode(code) {
  const list = getAccessCodes();
  let revokedPatientId = "AV-8921";
  const updated = list.map((item) => {
    if (item.code === code) {
      revokedPatientId = item.patientId;
      return { ...item, status: "REVOKED" };
    }
    return item;
  });
  localStorage.setItem(STORAGE_CODES_KEY, JSON.stringify(updated));

  logAuditEvent({
    patientId: revokedPatientId,
    code,
    accessorRole: "Patient",
    accessorName: "Self (Patient)",
    facility: "Patient Portal",
    action: "ACCESS_REVOKED",
    details: `Patient explicitly revoked access code ${code}. Immediate lock enforced.`,
  });

  return updated;
}

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(INITIAL_AUDIT));
      return INITIAL_AUDIT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT;
  }
}

export function logAuditEvent(event) {
  try {
    const current = getAuditLogs();
    const entry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    const nextList = [entry, ...current];
    localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(nextList.slice(0, 50)));
    return entry;
  } catch {
    return null;
  }
}

export function verifyAccessCode(inputCode) {
  const clean = (inputCode || "").trim().toUpperCase();
  const codes = getAccessCodes();
  const found = codes.find((c) => c.code === clean);

  if (!found) {
    return { valid: false, error: "Invalid code. Please check and try again." };
  }

  if (found.status === "REVOKED") {
    return { valid: false, error: "This access code was revoked by the patient." };
  }

  if (new Date(found.expiresAt) < new Date()) {
    return { valid: false, error: "This temporary access code has expired." };
  }

  return { valid: true, codeData: found };
}
