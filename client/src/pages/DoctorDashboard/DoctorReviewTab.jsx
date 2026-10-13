import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Printer,
  User,
  Heart,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Pill,
  KeyRound,
  ShieldAlert,
  Lock,
  Eye,
  Download,
  X,
  Layers,
  Phone,
  Activity,
  Calendar,
  Check,
} from "lucide-react";
import {
  getAllPatients,
  getPatientById,
  updatePatientReview,
  getPatientDocuments,
  addPatientDocument,
} from "../../utils/patientStore";
import {
  verifyAccessCode,
  logAuditEvent,
} from "../../utils/accessCodeStore";
import {
  getPatientConsultations,
  submitDoctorReview,
} from "../../services/api";

const QUICK_MEDS = [
  "Tab Paracetamol 650mg SOS",
  "Tab IFA 1 OD x 30 days",
  "Tab Calcium 500mg BD x 30 days",
  "ORS Sachet x 2 packets",
  "Tab Methyldopa 250mg TDS",
  "Tab Amoxicillin 500mg TDS x 5 days",
];

export default function DoctorReviewTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("id");

  const [patientsList, setPatientsList] = useState(() => getAllPatients());
  const [searchQuery, setSearchQuery] = useState(paramId || "");
  const [selectedPatientId, setSelectedPatientId] = useState(
    paramId || (patientsList[0] ? patientsList[0].id : "AV-8921")
  );

  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeAccessCodeData, setActiveAccessCodeData] = useState(null);
  const [codeLookupError, setCodeLookupError] = useState("");

  // Clinical Sub-tab in Left Column: "summary" | "history" | "documents"
  const [activeClinicalTab, setActiveClinicalTab] = useState("summary");

  // Document preview modal
  const [previewingDoc, setPreviewingDoc] = useState(null);

  // Sync with searchParams
  useEffect(() => {
    const list = getAllPatients();
    setPatientsList(list);
    if (paramId) {
      setSelectedPatientId(paramId);
      setSearchQuery(paramId);
    }
  }, [paramId]);

  const currentPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || patientsList[0] || null;
  }, [selectedPatientId, patientsList]);

  // Cloud-synced Supabase consultations
  const [supabaseConsultations, setSupabaseConsultations] = useState([]);

  useEffect(() => {
    if (currentPatient?.id) {
      const pId = currentPatient.id;
      const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;
      getPatientConsultations(normalizedPId)
        .then((data) => {
          if (Array.isArray(data)) setSupabaseConsultations(data);
        })
        .catch(() => {});
    }
  }, [currentPatient?.id]);

  // Documents for the current patient
  const patientDocs = useMemo(() => {
    if (!currentPatient) return [];
    return getPatientDocuments(currentPatient.id);
  }, [currentPatient]);

  // Compute permissions based on active access code
  const canAccessHistory = useMemo(() => {
    if (!activeAccessCodeData) return true; // Direct clinic login has full access
    return !!activeAccessCodeData.scope?.medicalHistory;
  }, [activeAccessCodeData]);

  const canAccessReports = useMemo(() => {
    if (!activeAccessCodeData) return true; // Direct clinic login has full access
    return !!activeAccessCodeData.scope?.selectedReports;
  }, [activeAccessCodeData]);

  const canAccessCurrentVisit = useMemo(() => {
    if (!activeAccessCodeData) return true;
    return !!activeAccessCodeData.scope?.currentVisit;
  }, [activeAccessCodeData]);

  // Pre-fill doctor notes & Rx
  useEffect(() => {
    if (currentPatient) {
      if (currentPatient.doctorReview) {
        setDoctorNotes(currentPatient.doctorReview.notes || "");
        setPrescription(currentPatient.doctorReview.prescription || "");
      } else {
        if (currentPatient.triage === "Critical Red Flag") {
          setDoctorNotes(
            "High suspicion of preeclampsia. Immediate BP monitoring, USG scan, and urgent obstetrician consultation."
          );
          setPrescription(
            "Tab Methyldopa 250mg TDS (if BP > 150/100), Inj Labetalol SOS. Repeat BP in 30 mins."
          );
        } else if (currentPatient.triage === "Moderate") {
          setDoctorNotes(
            "Acute febrile illness. Order RDT Malaria and Complete Blood Count (CBC). Advise bed rest and oral fluids."
          );
          setPrescription(
            "Tab Paracetamol 650mg SOS for fever, ORS sachets x 2 packets."
          );
        } else {
          setDoctorNotes(
            "Routine antenatal checkup. Fetal heart rate and movements normal. Advise balanced nutrition."
          );
          setPrescription(
            "Tab Iron Folic Acid (IFA) 1 tab daily, Tab Calcium 500mg twice daily x 30 days."
          );
        }
      }
    }
  }, [currentPatient]);

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setSearchQuery(id);
    setSearchParams({ id });
  };

  const handleAddMed = (medText) => {
    setPrescription((prev) => (prev ? `${prev}, ${medText}` : medText));
  };

  const toggleDoctorAudio = () => {
    if (!("speechSynthesis" in window) || !currentPatient) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const assistedDetail = currentPatient.assistedMode
      ? `Intake recorded by ASHA Worker ${currentPatient.assistedBy || "Kalpana Reang"}.`
      : "Direct patient intake.";

    const brief = `Patient ID: ${currentPatient.id}. Name: ${currentPatient.name}, ${currentPatient.age} years old. ${assistedDetail} Chief complaint: ${currentPatient.chiefComplaint}. AI Triage level: ${currentPatient.triage}. ${currentPatient.clinicalSummary}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(brief);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveReview = () => {
    if (!currentPatient) return;

    updatePatientReview(currentPatient.id, {
      doctorName: "Dr. S. Roy (Medical Officer)",
      facility: "Bishalgarh Community Health Centre",
      notes: doctorNotes,
      prescription: prescription,
    });

    // Automatically issue verified prescription document to patient vault
    addPatientDocument({
      patientId: currentPatient.id,
      title: `Official OPD Prescription Slip - Dr. S. Roy`,
      fileName: `Prescription_${currentPatient.id}_Signed.pdf`,
      category: "Prescription",
      facility: "Bishalgarh Community Health Centre",
      fileSize: "480 KB",
    });

    // Log the clinical audit trail
    logAuditEvent({
      patientId: currentPatient.id,
      code: activeAccessCodeData ? activeAccessCodeData.code : "CLINICAL_PORTAL",
      accessorRole: "Doctor",
      accessorName: "Dr. S. Roy",
      facility: "Bishalgarh Community Health Centre",
      action: "REVIEW_SAVED",
      details: `Prescription & clinical orders issued for ${currentPatient.name}. Synced to patient health vault.`,
    });

    // Sync review to Supabase consultation
    if (supabaseConsultations && supabaseConsultations.length > 0) {
      const pendingConsult =
        supabaseConsultations.find((c) => c.doctor_status === "PENDING") ||
        supabaseConsultations[0];
      if (pendingConsult?.id) {
        submitDoctorReview(pendingConsult.id, {
          doctor_notes: doctorNotes,
          prescription: prescription,
          doctor_name: "Dr. S. Roy (Medical Officer)",
        })
          .then(() => {
            const pId = currentPatient.id;
            const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;
            getPatientConsultations(normalizedPId).then((data) => {
              if (Array.isArray(data)) setSupabaseConsultations(data);
            });
          })
          .catch((err) => console.warn("[API] Supabase review sync notice:", err));
      }
    }

    const refreshed = getAllPatients();
    setPatientsList(refreshed);

    setToastMessage(`✓ Prescription & Review issued to ${currentPatient.name} (${currentPatient.id})`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const isUrgent =
    currentPatient?.triage === "Critical Red Flag" ||
    currentPatient?.status === "Urgent";

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Patient Selector & Code Entry Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Patient:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full sm:w-auto">
            {patientsList.map((p) => {
              const isSelected = currentPatient?.id === p.id;
              const isFlagged = p.triage === "Critical Red Flag";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveAccessCodeData(null);
                    handleSelectPatient(p.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-700 text-white shadow-xs font-black"
                      : isFlagged
                      ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                      : p.status === "Reviewed"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isFlagged && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({p.id})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient / Access Code Lookup Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCodeLookupError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = searchQuery.trim().toUpperCase();
                  if (!query) return;

                  // 1. First test if it is a temporary patient-shared code
                  const codeCheck = verifyAccessCode(query);
                  if (codeCheck.valid) {
                    const codeData = codeCheck.codeData;
                    const match = getPatientById(codeData.patientId);
                    if (match) {
                      setActiveAccessCodeData(codeData);
                      handleSelectPatient(match.id);
                      logAuditEvent({
                        patientId: match.id,
                        code: codeData.code,
                        accessorRole: "Doctor",
                        accessorName: "Dr. S. Roy",
                        facility: "Bishalgarh Community Health Centre",
                        action: "RECORD_ACCESSED",
                        details: `Doctor entered valid temporary access code ${codeData.code}. Authorized scope: ${Object.keys(codeData.scope).filter((k) => codeData.scope[k]).join(", ")}.`,
                      });
                      setToastMessage(`✓ Valid Code ${query}! Unlocked records for ${match.name}`);
                      setTimeout(() => setToastMessage(""), 4000);
                      return;
                    }
                  } else if (query.startsWith("AV-") && query.length >= 8) {
                    setCodeLookupError(codeCheck.error || "Invalid or expired temporary access code.");
                    return;
                  }

                  // 2. Fallback to direct Patient ID match
                  const directMatch = getPatientById(query);
                  if (directMatch) {
                    setActiveAccessCodeData(null);
                    handleSelectPatient(directMatch.id);
                    setToastMessage(`Loaded patient ${directMatch.id}`);
                    setTimeout(() => setToastMessage(""), 2500);
                  } else {
                    setCodeLookupError("No patient or valid access code found for this input.");
                  }
                }
              }}
              placeholder="Enter Patient Code (e.g. AV-7K4P-92)"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const query = searchQuery.trim().toUpperCase();
              if (!query) return;
              const codeCheck = verifyAccessCode(query);
              if (codeCheck.valid) {
                const codeData = codeCheck.codeData;
                const match = getPatientById(codeData.patientId);
                if (match) {
                  setActiveAccessCodeData(codeData);
                  handleSelectPatient(match.id);
                  setToastMessage(`✓ Valid Code ${query}! Unlocked records for ${match.name}`);
                  setTimeout(() => setToastMessage(""), 4000);
                }
              } else {
                const directMatch = getPatientById(query);
                if (directMatch) {
                  setActiveAccessCodeData(null);
                  handleSelectPatient(directMatch.id);
                } else {
                  setCodeLookupError(codeCheck.error || "Invalid code or ID.");
                }
              }
            }}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            Access
          </button>
        </div>
      </div>

      {codeLookupError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{codeLookupError}</span>
          </div>
          <button
            onClick={() => setCodeLookupError("")}
            className="text-rose-500 hover:text-rose-800 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Clinical Desk Layout */}
      {currentPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Patient Case Data */}
          <div className="lg:col-span-7 space-y-5">
            {/* Active Code Scope Notice Banner */}
            {activeAccessCodeData && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">
                      Patient-Authorized Temporary Access: {activeAccessCodeData.code}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold mt-0.5">
                      <span>Expires: {new Date(activeAccessCodeData.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>Scopes:</span>
                      <span className="inline-flex gap-1">
                        <span className={`px-1.5 py-0.2 rounded ${canAccessCurrentVisit ? "bg-emerald-200 text-emerald-900 font-bold" : "bg-slate-200 text-slate-500 line-through"}`}>
                          Current Visit
                        </span>
                        <span className={`px-1.5 py-0.2 rounded ${canAccessReports ? "bg-emerald-200 text-emerald-900 font-bold" : "bg-slate-200 text-slate-500 line-through"}`}>
                          Reports
                        </span>
                        <span className={`px-1.5 py-0.2 rounded ${canAccessHistory ? "bg-emerald-200 text-emerald-900 font-bold" : "bg-slate-200 text-slate-500 line-through"}`}>
                          Past History
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    DPDP Audit Logged
                  </span>
                  <button
                    onClick={() => setActiveAccessCodeData(null)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear Code
                  </button>
                </div>
              </div>
            )}

            {/* Patient Profile Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg shrink-0">
                    <User className="w-6 h-6 text-blue-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                        {currentPatient.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isUrgent
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isUrgent ? "Critical Red Flag" : "Stable Case"}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      {currentPatient.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {currentPatient.age} yrs • {currentPatient.gender}
                    </p>
                  </div>
                </div>

                {/* 20-Sec Audio Summary Player */}
                <button
                  type="button"
                  onClick={toggleDoctorAudio}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isSpeaking
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 border border-slate-200"
                  }`}
                  title="Listen to clinical summary audio"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-blue-700" />
                      <span>Listen Summary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vitals Summary Strip */}
              {currentPatient.vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Blood Pressure
                    </span>
                    <strong
                      className={`text-xs font-black block mt-0.5 ${
                        currentPatient.vitals.bp?.includes("15") ||
                        currentPatient.vitals.bp?.includes("16")
                          ? "text-rose-600"
                          : "text-slate-800"
                      }`}
                    >
                      {currentPatient.vitals.bp || "120/80 mmHg"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Weight / Hb
                    </span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {currentPatient.vitals.weight || "52 kg"} • {currentPatient.vitals.hb || "11.2 g/dL"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Fetal Rate
                    </span>
                    <strong className="text-xs font-black text-emerald-800 block mt-0.5">
                      {currentPatient.vitals.fetalHeartRate || "140 bpm"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Intake Mode
                    </span>
                    <strong className="text-xs font-black text-slate-700 block mt-0.5">
                      {currentPatient.assistedMode ? "ASHA Assisted" : "Direct Voice"}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Tabs Selector for Left Column */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveClinicalTab("summary")}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeClinicalTab === "summary"
                    ? "bg-white text-slate-900 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-700" />
                <span>Current Intake & AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveClinicalTab("history")}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeClinicalTab === "history"
                    ? "bg-white text-slate-900 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {canAccessHistory ? (
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Medical History</span>
                {!canAccessHistory && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                    Locked
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveClinicalTab("documents")}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeClinicalTab === "documents"
                    ? "bg-white text-slate-900 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {canAccessReports ? (
                  <FileText className="w-3.5 h-3.5 text-indigo-700" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Reports Vault ({patientDocs.length})</span>
                {!canAccessReports && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                    Locked
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: CURRENT INTAKE & AI TRIAGE */}
            {activeClinicalTab === "summary" && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Reported Chief Complaint:
                  </span>
                  <p className="text-xs font-bold text-slate-900 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed">
                    {currentPatient.chiefComplaint}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    AI Clinical Impression & Triage:
                  </span>
                  <p className="text-xs font-medium text-slate-800 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 leading-relaxed">
                    {currentPatient.clinicalSummary}
                  </p>
                </div>

                {/* Question and Answer History */}
                {currentPatient.assessmentHistory && (
                  <div className="pt-2">
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      Symptom Assessment Responses ({currentPatient.assessmentHistory.length}):
                    </span>
                    <div className="space-y-2">
                      {currentPatient.assessmentHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100"
                        >
                          <p className="font-semibold text-slate-600">
                            {idx + 1}. {item.question}
                          </p>
                          <p className="font-black text-slate-900 mt-1 pl-3 text-xs">
                            ↳ {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LiveKit Voice Consultation & Supabase Records */}
                {supabaseConsultations && supabaseConsultations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[11px] uppercase font-black text-blue-700 tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      Live Voice Consultations in Supabase ({supabaseConsultations.length})
                    </span>

                    <div className="space-y-3">
                      {supabaseConsultations.map((consult) => (
                        <div
                          key={consult.id}
                          className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[11px] text-blue-900">
                              {consult.id} ({consult.language_used || "bn-IN"})
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                consult.triage_level === "EMERGENCY"
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : consult.triage_level === "MONITOR"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              }`}
                            >
                              {consult.triage_level}
                            </span>
                          </div>

                          {/* Dedicated Patient Name Row */}
                          <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-blue-100 text-xs shadow-2xs">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="font-semibold text-slate-500 text-[11px]">Patient Name:</span>
                            <span className="font-bold text-slate-900">
                              {consult.user_name || currentPatient?.name || "Mamta Debbarma"}
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-slate-400 font-semibold">
                              ID: {consult.patient_id || currentPatient?.id}
                            </span>
                          </div>

                          {consult.danger_signs && consult.danger_signs.length > 0 && (
                            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold text-[11px] space-y-1">
                              <span className="font-black flex items-center gap-1 text-rose-700">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Red-Flag Alert Detected:
                              </span>
                              {consult.danger_signs.map((ds, i) => (
                                <p key={i} className="pl-4 text-[10px]">
                                  • {ds.alert_message || ds.rule_id} ({ds.severity})
                                </p>
                              ))}
                            </div>
                          )}

                          {consult.transcript && Array.isArray(consult.transcript) && consult.transcript.length > 0 && (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Spoken Audio Transcript:
                              </span>
                              {consult.transcript.map((t, tidx) => (
                                <div
                                  key={tidx}
                                  className={`p-2 rounded-xl text-[11px] leading-relaxed ${
                                    t.role === "user"
                                      ? "bg-white border border-slate-200/70 text-slate-900 font-medium ml-2"
                                      : "bg-blue-100/60 border border-blue-200 text-blue-950 font-normal mr-2"
                                  }`}
                                >
                                  <span className="font-bold block text-[10px] uppercase text-slate-500 mb-0.5">
                                    {t.role === "user" ? "Patient" : "AarogyaVaani Voice Assistant"}
                                  </span>
                                  {t.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAST MEDICAL HISTORY */}
            {activeClinicalTab === "history" && (
              <div className="space-y-4">
                {!canAccessHistory ? (
                  <div className="bg-amber-50/90 border border-amber-300 p-6 rounded-3xl text-amber-950 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-950">
                          Medical History Restricted by Patient Consent Scope
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          India DPDP Act 2023 Enforced Gate
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Patient <strong>{currentPatient.name}</strong> generated temporary access code <strong>{activeAccessCodeData?.code}</strong> without the <em>"Complete Medical History"</em> permission scope. To view prior visits, allergies, and chronic conditions, request the patient to regenerate a temporary code with full history scope.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Clinical Profile & Allergies */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Critical Medical Flags & Profile
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                          <span className="font-black text-slate-900 block mt-0.5">{currentPatient.bloodGroup || "B Positive (Rh+)"}</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                          <span className="text-[10px] font-black uppercase text-rose-700 block">Known Allergies</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentPatient.allergies?.map((al, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px]">
                                {al}
                              </span>
                            )) || <span className="text-slate-600">None documented</span>}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Chronic Conditions</span>
                          <span className="font-bold text-slate-800 block mt-0.5">
                            {currentPatient.chronicConditions?.join(", ") || "None"}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                            <span className="font-bold text-slate-800 block mt-0.5">
                              {currentPatient.emergencyContact?.name || "Family Member"}
                            </span>
                          </div>
                          {currentPatient.emergencyContact?.phone && (
                            <a
                              href={`tel:${currentPatient.emergencyContact.phone}`}
                              className="px-2.5 py-1.5 bg-blue-100 text-blue-900 rounded-xl font-bold text-[11px] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-blue-700" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Active Medications List */}
                      {currentPatient.currentMedications && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Active Medications ({currentPatient.currentMedications.length}):
                          </span>
                          <div className="space-y-1.5">
                            {currentPatient.currentMedications.map((m, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <Pill className="w-3.5 h-3.5 text-blue-700" />
                                  <span className="font-bold text-slate-900">{m.name}</span>
                                  <span className="text-slate-500 text-[11px]">({m.dose})</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {m.purpose}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prior Facility Consultations Timeline */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Past Clinic Consultations ({currentPatient.priorVisits?.length || 0})
                      </h4>

                      <div className="space-y-3">
                        {currentPatient.priorVisits?.map((visit, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-black text-slate-900 text-xs block">
                                  {visit.type}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {visit.facility} • {visit.doctor}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                                {visit.date}
                              </span>
                            </div>

                            <p className="text-slate-700 text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                              {visit.summary}
                            </p>

                            {visit.prescription && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg">
                                <Stethoscope className="w-3 h-3 text-emerald-700" />
                                <span>Rx: {visit.prescription}</span>
                              </div>
                            )}
                          </div>
                        )) || (
                          <p className="text-xs text-slate-500 italic">No prior visits recorded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIAGNOSTIC REPORTS VAULT */}
            {activeClinicalTab === "documents" && (
              <div className="space-y-4">
                {!canAccessReports ? (
                  <div className="bg-amber-50/90 border border-amber-300 p-6 rounded-3xl text-amber-950 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-950">
                          Diagnostic Reports Vault Restricted by Patient
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          India DPDP Act 2023 Enforced Gate
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Patient <strong>{currentPatient.name}</strong> did not authorize the <em>"Diagnostic Reports & Uploaded Documents"</em> scope under code <strong>{activeAccessCodeData?.code}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Digital Health Records Vault
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          ABDM & DigiLocker Verified Diagnostic Documents
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                        {patientDocs.length} Documents
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {patientDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-slate-900 block">
                                {doc.title}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{doc.facility}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] bg-slate-200/70 px-1.5 py-0.2 rounded">
                                  {doc.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              ABDM Verified ✓
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewingDoc(doc)}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Doctor Orders & Rx */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-600/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Doctor's Clinical Orders & Prescription
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                  Prescription (Rx)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Doctor's Clinical Advice:
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Clinical advice, lab tests, dietary instructions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Medicines & Dosage (Rx):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tap quick pills below</span>
                </label>
                <textarea
                  rows={3}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Tab IFA 1 daily, Tab Calcium 500mg BD x 30 days..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none transition-all"
                />

                {/* Quick Med Pills */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_MEDS.map((med, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddMed(med)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {med}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="w-full bg-[#0b6651] hover:bg-[#084e3e] text-white font-black text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Review & Issue Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Official Prescription Slip</span>
                </button>
              </div>
            </div>

            {/* Patient Queue List on Right */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Today's OPD Queue ({patientsList.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Click to review</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {patientsList.map((p) => {
                  const isCurrent = currentPatient.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveAccessCodeData(null);
                        handleSelectPatient(p.id);
                      }}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-blue-50 border border-blue-300 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-900">
                            {p.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {p.chiefComplaint}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          p.triage === "Critical Red Flag"
                            ? "bg-rose-100 text-rose-800"
                            : p.status === "Reviewed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.status === "Reviewed" ? "Reviewed ✓" : p.triage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-bold text-sm">No patient selected.</p>
        </div>
      )}

      {/* ========================================================
          DOCUMENT PREVIEW MODAL
          ======================================================== */}
      {previewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {previewingDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewingDoc.facility} • {previewingDoc.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Patient</span>
                <span className="font-black text-slate-900">{currentPatient.name} ({currentPatient.id})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Document ID</span>
                <span className="font-mono text-slate-700">{previewingDoc.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">File Name</span>
                <span className="font-mono text-blue-900 font-bold">{previewingDoc.fileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Digital Verification</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  ABDM Verified & Encrypted
                </span>
              </div>
            </div>

            {/* Document Content Simulation */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Clinical Content Summary:
              </span>

              {previewingDoc.category === "Prescription" ? (
                <div className="space-y-1 text-slate-800">
                  <p className="font-bold text-blue-900">Issued by: Dr. S. Roy (Medical Officer)</p>
                  <p>Prescription: {currentPatient?.doctorReview?.prescription || "Routine Antenatal Support Regimen."}</p>
                  <p className="text-slate-500 text-[11px]">Next Follow-up: 4 Weeks at Bishalgarh CHC.</p>
                </div>
              ) : previewingDoc.category === "Lab Report" ? (
                <div className="space-y-1.5 text-slate-800">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span>Hemoglobin (Hb):</span>
                    <strong className="font-mono">10.4 g/dL (Mild Anaemia)</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span>Blood Sugar (Fasting):</span>
                    <strong className="font-mono">88 mg/dL (Normal)</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Urine Albumin / Sugar:</span>
                    <strong className="font-mono text-emerald-800">Nil / Negative</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-slate-800">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span>Tetanus Toxoid (TT-1):</span>
                    <strong className="text-emerald-800 font-bold">Administered (14-Jul-2026)</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span>TT Booster / TT-2:</span>
                    <strong className="text-emerald-800 font-bold">Scheduled (Next Visit)</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>IFA Distribution:</span>
                    <strong className="text-slate-900 font-bold">100 Tablets Issued</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setPreviewingDoc(null);
                }}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewingDoc(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
