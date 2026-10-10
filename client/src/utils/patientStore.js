// Central Patient Data Store for AarogyaVaani

const STORAGE_KEY = "aarogyaVaaniAllPatients";

export const INITIAL_PATIENTS = [
  {
    id: "AV-8921",
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    phone: "9862100000",
    bloodGroup: "B Positive (Rh+)",
    allergies: ["Sulfa Antibiotics", "Seasonal Pollen / Dust"],
    chronicConditions: ["Mild Gestational Anaemia (Under management)"],
    currentMedications: [
      { name: "Iron & Folic Acid (IFA)", dose: "1 tab daily (morning)", purpose: "Anaemia prevention" },
      { name: "Calcium Carbonate", dose: "500 mg twice daily", purpose: "Bone & fetal development" },
    ],
    emergencyContact: { name: "Rajesh Debbarma (Husband)", phone: "+91 98621 11223" },
    category: "Maternal & Antenatal (ANC)",
    pregnancyMonths: "5 Months (2nd Trimester)",
    assistedMode: true,
    assistedBy: "Kalpana Reang (ASHA Worker)",
    assistedReason: "Pregnant mother in distress (acute dizziness & fatigue, assisted intake)",
    patientCondition: "pregnant_distress",
    status: "Reviewed",
    triage: "Stable",
    chiefComplaint: "Mild frontal headache and generalized tiredness for 2 days. No bleeding or severe swelling.",
    assessmentHistory: [
      { question: "When did the tiredness or headache start?", answer: "Started 2 days ago after working in field." },
      { question: "Do you have any blurring of vision, dizziness, or vomiting?", answer: "No blurred vision, slightly dizzy in the morning." },
      { question: "Are you feeling the baby's movements regularly?", answer: "Yes, baby moves active every few hours." },
      { question: "Have you taken your daily Iron Folic Acid tablets?", answer: "Yes, taking IFA tablet daily." }
    ],
    dangerSigns: [],
    clinicalSummary: "27-year-old G2P1 at 5 months gestation. Assisted intake conducted by ASHA Worker Kalpana Reang as patient was dizzy. Presenting with mild fatigue and frontal headache. Fetal movements active. No preeclampsia warning signs detected. Routine ANC vitals recommended.",
    vitals: { bp: "118/76 mmHg", weight: "54 kg", hb: "10.4 g/dL", fetalHeartRate: "142 bpm" },
    doctorReview: {
      doctorName: "Dr. S. Roy (Medical Officer)",
      facility: "Bishalgarh Community Health Centre",
      notes: "Continue IFA and Calcium. Ensure adequate hydration. Next routine checkup in 4 weeks.",
      prescription: "Tab IFA 1 daily OD, Tab Calcium 500mg BD x 30 days.",
      reviewedAt: "Today, 10:45 AM"
    },
    priorVisits: [
      {
        date: "14-Jul-2026",
        facility: "Bishalgarh CHC",
        doctor: "Dr. Anita Sen (Gynecologist)",
        type: "Routine ANC Trimester 2 Check",
        summary: "TT-1 booster administered. Fetal heartbeat audible and regular. Hb recorded at 10.1 g/dL.",
        prescription: "Tab IFA 1 OD x 100 days, Tab Calcium 500mg BD.",
        status: "Completed",
      },
      {
        date: "18-May-2026",
        facility: "Boxanagar PHC",
        doctor: "Dr. P. Barman",
        type: "Early Antenatal Confirmation",
        summary: "Pregnancy confirmed, LMP verified. Urine pregnancy test positive. Baseline ultrasound advised.",
        prescription: "Folic Acid 5mg OD x 30 days.",
        status: "Completed",
      }
    ],
    createdAt: "Today, 10:32 AM"
  },
  {
    id: "AV-9012",
    name: "Bimala Reang",
    age: "31",
    gender: "Female",
    village: "Karbook, Gomati",
    phone: "9436100000",
    category: "Maternal & Antenatal (ANC)",
    pregnancyMonths: "8 Months (3rd Trimester)",
    assistedMode: true,
    assistedBy: "Kalpana Reang (ASHA Worker)",
    assistedReason: "Pregnant mother in acute pain & preeclampsia distress (unable to hold phone)",
    patientCondition: "pregnant_distress",
    status: "Urgent",
    triage: "Critical Red Flag",
    chiefComplaint: "Severe throbbing headache that won't go away, and vision feels blurry since morning. Patient groaning in pain.",
    assessmentHistory: [
      { question: "When did the severe headache start, and is medicine helping?", answer: "Started yesterday night, paracetamol didn't help." },
      { question: "Are you seeing dark spots or blurring in your eyes?", answer: "Yes, things look hazy when looking at light." },
      { question: "Is there any swelling on your face or hands?", answer: "Feet and hands are swollen since last 3 days." },
      { question: "How are the baby's movements?", answer: "Slightly reduced compared to yesterday." },
      { question: "Any severe pain under your ribs on the right side?", answer: "Yes, mild pain in upper right abdomen." }
    ],
    dangerSigns: [
      "Severe headache with visual blurring (High Preeclampsia Risk)",
      "Significant peripheral edema",
      "Reduced fetal activity"
    ],
    clinicalSummary: "31-year-old G3P2 at 32 weeks gestation. Urgent field intake conducted by ASHA Worker Kalpana Reang. Patient in acute distress with severe headache, visual disturbance, and sudden swelling. Elevated risk of Preeclampsia / Eclampsia. Immediate Medical Officer evaluation, BP auscultation, and urine albumin dipstick test required.",
    vitals: { bp: "154/98 mmHg", weight: "62 kg", hb: "9.2 g/dL", fetalHeartRate: "138 bpm" },
    doctorReview: null,
    createdAt: "Today, 09:21 AM"
  },
  {
    id: "AV-4401",
    name: "Birendra Tripura",
    age: "68",
    gender: "Male",
    phone: "9436200000",
    category: "Elderly & Geriatric OPD",
    pregnancyMonths: null,
    assistedMode: true,
    assistedBy: "Kalpana Reang (ASHA Worker)",
    assistedReason: "Elderly frail man, bedridden with high fever & unable to operate mobile phone",
    patientCondition: "elderly_frail",
    status: "Pending Review",
    triage: "Moderate",
    chiefComplaint: "Elderly patient bedridden with high shivering fever for 3 days, severe backache, shaking chills, and unable to take food.",
    assessmentHistory: [
      { question: "How many days has the elderly patient had fever, and does it spike at night?", answer: "3 days, fever spikes high every evening with heavy shivering." },
      { question: "Is the patient able to stand or walk, or any chest tightness?", answer: "Patient is bedridden, cannot walk alone, mild chest heaviness." },
      { question: "Is the patient able to drink water or eat meals?", answer: "Refusing meals due to nausea and bitter taste in mouth." },
      { question: "Any mosquito exposure or visits to forest areas?", answer: "Lives near rubber forest zone with heavy mosquito presence." }
    ],
    dangerSigns: [
      "Intermittent high fever with rigors in elderly patient (Malaria/Dengue endemic zone)"
    ],
    clinicalSummary: "68-year-old elderly male. Assisted intake conducted by ASHA Worker Kalpana Reang as patient is bedridden and frail. Presenting with intermittent high-grade fever with rigors for 3 days and severe debility. Suspected Acute Febrile Illness / Vector-borne fever. Rapid diagnostic test (RDT) for Malaria and Dengue NS1 recommended.",
    vitals: { bp: "128/82 mmHg", weight: "58 kg", hb: "11.2 g/dL", temp: "102.6 °F" },
    doctorReview: null,
    createdAt: "Today, 09:48 AM"
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    patientId: "AV-8921",
    title: "Tripura Mother & Child Protection (MCP) Card",
    fileName: "MCP_Tripura_Card_Scanned.pdf",
    category: "Immunization & ANC",
    date: "14-Jul-2026",
    facility: "Community Health Centre",
    fileSize: "1.8 MB",
    verified: true,
  },
  {
    id: "doc-2",
    patientId: "AV-8921",
    title: "Routine ANC Blood Panel & Hemoglobin Test",
    fileName: "Blood_Report_Diagnostic_Lab.pdf",
    category: "Lab Report",
    date: "02-Aug-2026",
    facility: "District Diagnostic Centre",
    fileSize: "840 KB",
    verified: true,
  },
  {
    id: "doc-3",
    patientId: "AV-8921",
    title: "OPD Consultation Prescription Slip",
    fileName: "OPD_Prescription_DrRoy.pdf",
    category: "Prescription",
    date: "10-Oct-2026",
    facility: "Bishalgarh CHC",
    fileSize: "520 KB",
    verified: true,
  },
];

const STORAGE_DOCS_KEY = "aarogyaVaaniDocuments";

export function getPatientDocuments(patientId = "AV-8921") {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS.filter((d) => !patientId || d.patientId === patientId);
    }
    const list = JSON.parse(raw);
    return list.filter((d) => !patientId || d.patientId === patientId);
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function addPatientDocument(doc) {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    const list = raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
    const newDoc = {
      id: `doc-${Date.now()}`,
      patientId: doc.patientId || "AV-8921",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      verified: true,
      ...doc,
    };
    const updated = [newDoc, ...list];
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
    return newDoc;
  } catch {
    return doc;
  }
}

export function getCurrentPatient() {
  try {
    const active = localStorage.getItem("aarogyaVaaniActiveUser");
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed.patientId) {
        const found = getPatientById(parsed.patientId);
        if (found) {
          const { village, abhaNumber, ...cleanFound } = found;
          return cleanFound;
        }
      }
    }
  } catch {}
  const def = getPatientById("AV-8921") || INITIAL_PATIENTS[0];
  const { village, abhaNumber, ...cleanDef } = def;
  return cleanDef;
}

export function getAllPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    // Enrich any cached initial items with assisted metadata while stripping legacy village & abha
    const enriched = parsed.map((p) => {
      const match = INITIAL_PATIENTS.find((init) => init.id === p.id);
      const { village, abhaNumber, ...cleanP } = p;
      if (match) {
        const { village: _v, abhaNumber: _a, ...cleanMatch } = match;
        return {
          ...cleanMatch,
          ...cleanP,
          assistedMode: p.assistedMode !== undefined ? p.assistedMode : match.assistedMode,
          assistedBy: p.assistedBy || match.assistedBy,
          assistedReason: p.assistedReason || match.assistedReason,
          patientCondition: p.patientCondition || match.patientCondition,
        };
      }
      return cleanP;
    });
    return enriched;
  } catch {
    return INITIAL_PATIENTS;
  }
}

export function getPatientById(id) {
  if (!id) return null;
  const patients = getAllPatients();
  const cleanId = String(id).trim().toUpperCase();
  return patients.find((p) => p.id?.toUpperCase() === cleanId) || null;
}

export function savePatient(newPatient) {
  const patients = getAllPatients();
  const existingIndex = patients.findIndex((p) => p.id === newPatient.id);
  let updated;
  if (existingIndex >= 0) {
    updated = [...patients];
    updated[existingIndex] = { ...updated[existingIndex], ...newPatient };
  } else {
    updated = [newPatient, ...patients];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newPatient;
}

export function updatePatientReview(patientId, doctorData) {
  const patients = getAllPatients();
  const updated = patients.map((p) => {
    if (p.id?.toUpperCase() === String(patientId).trim().toUpperCase()) {
      return {
        ...p,
        status: "Reviewed",
        doctorReview: {
          doctorName: doctorData.doctorName || "Dr. S. Roy",
          notes: doctorData.notes || "",
          prescription: doctorData.prescription || "",
          reviewedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.find((p) => p.id?.toUpperCase() === String(patientId).trim().toUpperCase());
}

export function generatePatientId() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `AV-${randNum}`;
}

