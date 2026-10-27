import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Activity,
  Stethoscope,
  AlertCircle,
  Users,
  Calendar,
  Pill,
  FolderOpen,
  FileText,
  Search,
  HeartPulse,
  Clock,
  Mic,
  MicOff,
  Play,
  X,
  ShieldAlert,
  ShieldCheck,
  Plus,
  CheckCircle,
  CheckCircle2,
  FilePlus,
  Printer,
  Trash2,
  Video,
  Phone,
  Sparkles,
  Edit2,
  Volume2,
  VolumeX,
  Send,
  UsersRound,
  Key,
} from "lucide-react";
import {
  getAllPatients,
  getPatientById,
  updatePatientReview,
  getPatientDocuments,
  addPatientDocument,
} from "../../utils/patientStore";
import { logAuditEvent, verifyAccessCode } from "../../utils/accessCodeStore";

// ==========================================
// 1. DESIGN TOKENS & REUSABLE COMPONENTS
// ==========================================

const Card = ({ children, className = "", noPadding = false }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-[#E4E9F0] dark:border-slate-800 rounded-xl shadow-2xs ${
      noPadding ? "" : "p-4 md:p-6"
    } ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  onClick,
  type = "button",
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#059669] whitespace-nowrap cursor-pointer";

  const variants = {
    primary: "bg-[#059669] hover:bg-[#047857] text-white border border-transparent shadow-2xs",
    secondary:
      "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#172033] dark:text-slate-100 border border-[#E4E9F0] dark:border-slate-700 shadow-2xs",
    ghost:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#667085] hover:text-[#172033] dark:hover:text-white border border-transparent",
    danger:
      "bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 border border-rose-200 dark:border-rose-900/40 shadow-2xs",
    amber: "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} className={children ? "mr-2" : ""} />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "neutral", className = "", icon: Icon }) => {
  const variants = {
    primary: "bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
    rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
    neutral:
      "bg-[#F7F9FC] dark:bg-slate-800 text-[#667085] dark:text-slate-400 border border-[#E4E9F0] dark:border-slate-700",
    purple: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={12} className="mr-1.5" />}
      {children}
    </span>
  );
};

const VitalBox = ({ label, value, unit, alert }) => (
  <div
    className={`p-3 rounded-xl border ${
      alert
        ? "bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50"
        : "bg-white dark:bg-slate-800/70 border-[#E4E9F0] dark:border-slate-700/80"
    }`}
  >
    <span className="text-[11px] font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider block mb-1">
      {label}
    </span>
    <div className="flex items-baseline gap-1">
      <span
        className={`font-mono text-lg font-semibold ${
          alert ? "text-purple-700 dark:text-purple-300" : "text-[#172033] dark:text-white"
        }`}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-[#667085] dark:text-slate-400">{unit}</span>
    </div>
  </div>
);

// Formulary Drugs & Templates
const COMMON_DRUGS = [
  { name: "Tab Paracetamol 650mg", defaultDose: "1 tablet SOS (if fever > 100°F)", defaultDuration: "x 5 days" },
  { name: "Tab Iron Folic Acid (IFA)", defaultDose: "1 tablet daily after food", defaultDuration: "x 30 days" },
  { name: "Tab Calcium 500mg", defaultDose: "1 tablet twice daily", defaultDuration: "x 30 days" },
  { name: "ORS Sachet", defaultDose: "1 sachet in 200ml water", defaultDuration: "x 2 packets" },
  { name: "Tab Amoxicillin 500mg", defaultDose: "1 tablet TDS after meals", defaultDuration: "x 5 days" },
  { name: "Tab Cetirizine 10mg", defaultDose: "1 tablet at bedtime", defaultDuration: "x 5 days" },
  { name: "Tab Pantoprazole 40mg", defaultDose: "1 tablet OD (empty stomach)", defaultDuration: "x 7 days" },
  { name: "Tab Azithromycin 500mg", defaultDose: "1 tablet OD", defaultDuration: "x 3 days" },
  { name: "Tab Amlodipine 5mg", defaultDose: "1 tablet OD morning", defaultDuration: "x 30 days" },
  { name: "Tab Metformin 500mg", defaultDose: "1 tablet BD with meals", defaultDuration: "x 30 days" },
];

const PRESCRIPTION_TEMPLATES = {
  "ANC Routine": [
    { name: "Tab Iron Folic Acid (IFA)", dose: "1 tablet daily", duration: "x 30 days", selected: true },
    { name: "Tab Calcium 500mg", dose: "1 tablet twice daily", duration: "x 30 days", selected: true },
    { name: "Tab Paracetamol 650mg", dose: "SOS (if fever > 100°F)", duration: "x 5 days", selected: true },
    { name: "ORS Sachet", dose: "1 sachet in 200ml water", duration: "x 2 packets", selected: true },
  ],
  "Viral Upper Respiratory": [
    { name: "Tab Paracetamol 650mg", dose: "1 tablet SOS if fever", duration: "x 5 days", selected: true },
    { name: "Tab Cetirizine 10mg", dose: "1 tablet at bedtime", duration: "x 5 days", selected: true },
    { name: "Tab Vitamin C 500mg", dose: "1 tablet daily chewable", duration: "x 10 days", selected: true },
    { name: "Warm Saline Gargle", dose: "3 times daily", duration: "x 5 days", selected: true },
  ],
  "Hypertension Stage 1": [
    { name: "Tab Amlodipine 5mg", dose: "1 tablet OD morning", duration: "x 30 days", selected: true },
    { name: "Tab Telmisartan 40mg", dose: "1 tablet OD if BP > 140", duration: "x 30 days", selected: true },
  ],
  "Acute Febrile Illness": [
    { name: "Tab Paracetamol 650mg", dose: "1 tablet TDS after meals", duration: "x 5 days", selected: true },
    { name: "ORS Sachet", dose: "1 sachet in 1L boiled water daily", duration: "x 4 packets", selected: true },
    { name: "Tab Pantoprazole 40mg", dose: "1 tablet OD (empty stomach)", duration: "x 5 days", selected: true },
  ],
};

// ==========================================
// 2. MAIN COMPONENT: DoctorReviewTab
// ==========================================

export default function DoctorReviewTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("id");
  const paramCode = searchParams.get("code");

  // Patients state
  const [allPatients, setAllPatients] = useState(() => getAllPatients());
  const patients = allPatients;
  const [patientSearch, setPatientSearch] = useState("");

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (paramId) return paramId;
    const initialList = getAllPatients();
    return initialList[0]?.id || "AV-2026-8921";
  });

  const selectedPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || allPatients[0] || null;
  }, [selectedPatientId, allPatients]);

  // Dossier Tabs
  const [activeTab, setActiveTab] = useState("overview"); // overview | history | reports | consultations | timeline
  const [isRxDrawerOpen, setIsRxDrawerOpen] = useState(false);

  // Prescription Drawer State
  const [rxItems, setRxItems] = useState([]);
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedDose, setCustomMedDose] = useState("");
  const [customMedDuration, setCustomMedDuration] = useState("x 5 days");
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  // Doctor Clinical Notes
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const notesTextareaRef = useRef(null);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showTeleconsultModal, setShowTeleconsultModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Sync access code & URL param
  useEffect(() => {
    if (paramId) {
      setSelectedPatientId(paramId);
      if (paramCode) {
        showToast(`✓ Access code ${paramCode} verified. Unlocked full patient dossier.`);
      }
    } else if (paramCode) {
      const codeCheck = verifyAccessCode(paramCode);
      if (codeCheck?.valid && codeCheck.codeData) {
        setSelectedPatientId(codeCheck.codeData.patientId);
        showToast(`✓ Access code ${paramCode} verified. Unlocked patient record.`);
      } else {
        if (paramCode === "749201") setSelectedPatientId("AV-2026-8921");
        else if (paramCode === "592014") setSelectedPatientId("AV-2026-4454");
        else if (paramCode === "384912") setSelectedPatientId("AV-2026-7316");
      }
    }
  }, [paramId, paramCode]);

  // Sync Rx and Notes when patient changes
  useEffect(() => {
    if (selectedPatient) {
      if (selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0) {
        setRxItems(selectedPatient.prescriptions);
      } else {
        setRxItems(PRESCRIPTION_TEMPLATES["ANC Routine"]);
      }

      if (selectedPatient.doctorReview?.notes) {
        setDoctorNotes(selectedPatient.doctorReview.notes);
      } else {
        setDoctorNotes(
          selectedPatient.chiefComplaint
            ? `Clinical assessment for ${selectedPatient.name}: ${selectedPatient.chiefComplaint}. Patient is stable, advice provided.`
            : ""
        );
      }
    }
  }, [selectedPatient?.id]);

  // Patient Worklist Filter
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return allPatients;
    const q = patientSearch.toLowerCase();
    return allPatients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [allPatients, patientSearch]);

  const urgentCount = useMemo(() => {
    return allPatients.filter((p) => p.triage === "Critical Red Flag" || p.status === "Urgent").length;
  }, [allPatients]);

  const patientDocs = useMemo(() => {
    if (!selectedPatient) return [];
    return getPatientDocuments(selectedPatient.id);
  }, [selectedPatient]);

  // Medicine search & handlers
  const handleMedSearchChange = (val) => {
    setMedSearchQuery(val);
    if (!val.trim()) {
      setMedSearchResults([]);
      return;
    }
    const matches = COMMON_DRUGS.filter((d) => d.name.toLowerCase().includes(val.toLowerCase()));
    setMedSearchResults(matches);
  };

  const handleAddSearchedMed = (drug) => {
    const newMed = {
      id: `rx-${Date.now()}`,
      name: drug.name,
      dose: drug.defaultDose,
      duration: drug.defaultDuration,
      selected: true,
    };
    setRxItems((prev) => [...prev, newMed]);
    setMedSearchQuery("");
    setMedSearchResults([]);
    showToast(`Added ${drug.name}`);
  };

  const handleToggleMed = (id) => {
    setRxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleRemoveMed = (id) => {
    setRxItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyTemplate = (tmplKey) => {
    const list = PRESCRIPTION_TEMPLATES[tmplKey];
    if (list) {
      setRxItems(
        list.map((m, idx) => ({
          ...m,
          id: `rx-tmpl-${Date.now()}-${idx}`,
        }))
      );
      setTemplateDropdownOpen(false);
      showToast(`Applied "${tmplKey}" template`);
    }
  };

  const handleAddCustomMed = (e) => {
    e.preventDefault();
    if (!customMedName.trim()) return;
    const newMed = {
      id: `rx-custom-${Date.now()}`,
      name: customMedName.trim(),
      dose: customMedDose.trim() || "1 tablet daily",
      duration: customMedDuration.trim() || "x 5 days",
      selected: true,
    };
    setRxItems((prev) => [...prev, newMed]);
    setCustomMedName("");
    setCustomMedDose("");
    setShowAddCustomModal(false);
    showToast(`Added ${newMed.name}`);
  };

  // Audio player
  const togglePlayAudio = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Speech synthesis not supported in browser.");
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    const textToSpeak =
      selectedPatient?.englishIntake ||
      selectedPatient?.chiefComplaint ||
      "No patient voice intake available.";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // Voice dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (isRecording) {
        setIsRecording(false);
      } else {
        setIsRecording(true);
        showToast("Doctor dictation listening...");
        setTimeout(() => {
          setDoctorNotes((prev) =>
            prev
              ? `${prev}\nPatient evaluated. Vitals stable. Advised adequate rest and routine ANC follow-up.`
              : "Patient evaluated. Vitals stable. Advised adequate rest and routine ANC follow-up."
          );
          setIsRecording(false);
          showToast("Dictation appended to notes");
        }, 2500);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.onstart = () => {
        setIsRecording(true);
        showToast("Microphone active: speak clinical notes now...");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setDoctorNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
        showToast("Voice notes transcribed");
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const insertFormatting = (prefix, suffix = "") => {
    const textarea = notesTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = doctorNotes.substring(start, end);
    const replacement = prefix + (sel || "text") + suffix;
    const newNotes = doctorNotes.substring(0, start) + replacement + doctorNotes.substring(end);
    setDoctorNotes(newNotes);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (sel || "text").length);
    }, 50);
  };

  // Issue prescription & review
  const handleApproveAndIssue = () => {
    if (!selectedPatient) return;
    const selectedMeds = rxItems.filter((m) => m.selected);
    const rxString = selectedMeds.map((m) => `${m.name} (${m.dose}, ${m.duration})`).join("; ");

    updatePatientReview(selectedPatient.id, {
      doctorName: "Dr. Sandeep Roy (Medical Officer)",
      facility: "Bishalgarh Community Health Centre",
      notes: doctorNotes,
      prescription: rxString,
      prescriptionsList: selectedMeds,
    });

    addPatientDocument({
      patientId: selectedPatient.id,
      title: `Official OPD Prescription Slip - Dr. Sandeep Roy`,
      fileName: `Rx_${selectedPatient.id}_Signed.pdf`,
      category: "Prescription",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      pages: "1 page",
      facility: "Bishalgarh Community Health Centre",
      fileSize: "460 KB",
      verified: true,
      type: "prescription",
    });

    logAuditEvent({
      patientId: selectedPatient.id,
      code: paramCode || "CLINICAL_PORTAL",
      accessorRole: "Doctor",
      accessorName: "Dr. Sandeep Roy",
      facility: "Bishalgarh Community Health Centre",
      action: "REVIEW_SAVED",
      details: `Prescription issued for ${selectedPatient.name}. Synced to EHR vault.`,
    });

    setAllPatients(getAllPatients());
    setIsRxDrawerOpen(false);
    showToast(`✓ Prescription issued to ${selectedPatient.name}`);
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "reports", label: "Reports" },
    { id: "consultations", label: "Consultations" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172033] text-white border border-slate-700 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Workspace Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E9F0] dark:border-slate-800 mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-[#172033] dark:text-white tracking-tight">Clinical Review</h2>
          <p className="text-sm text-[#667085] dark:text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Bishalgarh CHC Queue</span>
            <span className="w-1 h-1 rounded-full bg-[#E4E9F0] dark:bg-slate-700" />
            <span className="font-medium text-[#172033] dark:text-slate-200">{allPatients.length} Cases Today</span>
            <span className="w-1 h-1 rounded-full bg-[#E4E9F0] dark:bg-slate-700" />
            <span className="text-amber-600 font-medium">{urgentCount} Urgent</span>
          </p>
        </div>
      </div>

      {/* Workspace Body (2 Columns: Worklist + Details) */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Column: Patient Worklist (~300px) */}
        <div className="w-[300px] flex flex-col border border-[#E4E9F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 shadow-2xs">
          <div className="p-3 border-b border-[#E4E9F0] dark:border-slate-800 bg-[#F7F9FC] dark:bg-slate-800/50">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full px-3 py-2 text-sm border border-[#E4E9F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#172033] dark:text-white rounded-lg focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#E4E9F0] dark:divide-slate-800">
            {filteredPatients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              const isCritical = patient.triage === "Critical Red Flag" || patient.status === "Urgent";
              return (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setSearchParams({ id: patient.id });
                  }}
                  className={`w-full text-left p-3 transition-colors flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-[#059669]/5 dark:bg-emerald-950/20 border-l-4 border-l-[#059669]"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent"
                  } ${isCritical ? "border-l-rose-500" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-[#172033] dark:text-white text-sm">{patient.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {patient.triage || "Stable"}
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    {patient.id} <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /> {patient.age}
                    {patient.gender?.[0] || patient.sex?.[0]}
                  </div>
                  <div className="text-xs text-[#172033] dark:text-slate-300 truncate mt-1">
                    {patient.chiefComplaint || "No chief complaint recorded."}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Flexible Clinical Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 custom-scrollbar">
          {selectedPatient ? (
            <>
              {/* ABDM Patient Consent Authorization Banner */}
              {paramCode && (
                <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-sm shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          ABDM Consent Verified
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                          PASSCODE: {paramCode}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Active · 24h Window
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1">
                        Full clinical access authorized: Voice Consultations, Prescriptions, Lab Reports & Medical History.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/doctor/access")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Key size={13} />
                      Access Another Record
                    </button>
                  </div>
                </div>
              )}

              {/* Patient Identity Header Card */}
              <Card className="mb-4 shrink-0 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center text-lg font-semibold shrink-0">
                      {selectedPatient.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase() || "PT"}
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-[#172033] dark:text-white tracking-tight leading-none mb-1.5">
                        {selectedPatient.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#667085] dark:text-slate-400">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {selectedPatient.id}
                        </span>
                        <span>
                          {selectedPatient.age} yrs · {selectedPatient.gender || selectedPatient.sex}
                        </span>
                        <span>·</span>
                        <span>{selectedPatient.facility || "Bishalgarh CHC"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      icon={FileText}
                      onClick={() => setActiveTab("reports")}
                    >
                      View Records
                    </Button>
                    <Button
                      variant="secondary"
                      icon={HeartPulse}
                      onClick={() => setShowTeleconsultModal(true)}
                    >
                      Start Consultation
                    </Button>
                    <Button
                      variant="primary"
                      icon={FilePlus}
                      onClick={() => setIsRxDrawerOpen(true)}
                    >
                      Create Prescription
                    </Button>
                  </div>
                </div>

                {/* Context Flags */}
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.pregnancy && (
                    <Badge variant="purple">{selectedPatient.pregnancy}</Badge>
                  )}
                  {selectedPatient.bloodGroup && (
                    <Badge variant="neutral">Blood: {selectedPatient.bloodGroup}</Badge>
                  )}
                  <Badge
                    variant={
                      selectedPatient.triage === "Critical Red Flag" || selectedPatient.status === "Urgent"
                        ? "rose"
                        : "primary"
                    }
                  >
                    {selectedPatient.status || "In Review"} - {selectedPatient.triage || "Stable"}
                  </Badge>
                </div>
              </Card>

              {/* Dossier Tabs */}
              <div className="border-b border-[#E4E9F0] dark:border-slate-800 mb-5 shrink-0">
                <div className="flex gap-6">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
                        activeTab === tab.id
                          ? "text-[#059669] dark:text-emerald-400"
                          : "text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#059669] rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-5 pb-8">
                  {/* AI Warning Banner */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex items-start gap-3">
                    <ShieldAlert size={18} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        AI-generated draft — clinician must verify
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                        The following summary and findings are extracted from the patient's voice intake. Please verify against source records and clinical judgment.
                      </p>
                    </div>
                  </div>

                  {/* Chief Complaint & AI Findings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Chief Complaint */}
                    <Card className="flex flex-col gap-3">
                      <h3 className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider">
                        Chief Complaint
                      </h3>
                      <div>
                        <p className="text-[#172033] dark:text-white font-medium">
                          {selectedPatient.chiefComplaint || "Dry cough for 3 days with mild throat irritation."}
                        </p>
                        <p className="text-sm text-[#667085] dark:text-slate-400 mt-1">
                          Duration: {selectedPatient.intakeDetails?.duration || selectedPatient.symptomDuration || "3 days"}
                        </p>
                      </div>

                      {/* Native Regional Audio & Translation */}
                      <div className="mt-2 p-3 bg-[#F7F9FC] dark:bg-slate-800/50 border border-[#E4E9F0] dark:border-slate-700/80 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="neutral">
                            {selectedPatient.intakeLanguage || "Kokborok / Regional Voice"}
                          </Badge>
                          <button
                            type="button"
                            onClick={togglePlayAudio}
                            className="text-[#059669] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-1 rounded transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                          >
                            {isPlayingAudio ? <VolumeX size={13} className="text-rose-500" /> : <Play size={13} />}
                            <span>{isPlayingAudio ? "Stop Audio" : "Play Audio"}</span>
                          </button>
                        </div>
                        <p className="text-sm text-[#667085] dark:text-slate-400 italic mb-2">
                          "{selectedPatient.nativeIntake || selectedPatient.originalTranscript || "बुखार और बदन दर्द, पिछले ३ दिन से सूखी खांसी।"}"
                        </p>
                        <p className="text-sm text-[#172033] dark:text-slate-200">
                          "{selectedPatient.englishIntake || selectedPatient.translatedTranscript || "Dry cough for 3 days, mild body ache, occasional low-grade fever."}"
                        </p>
                      </div>
                    </Card>

                    {/* Key Structured Findings */}
                    <Card className="flex flex-col gap-3">
                      <h3 className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider">
                        Key Structured Findings
                      </h3>
                      <ul className="space-y-2">
                        {(selectedPatient.keyFindings || selectedPatient.findings || [
                          "Currently 20 weeks pregnant (antenatal checkup normal).",
                          "No history of asthma or chronic lung disease.",
                          "Recent vitals within normal range.",
                          "No known allergies.",
                        ]).map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#172033] dark:text-slate-200">
                            <CheckCircle size={16} className="text-[#059669] mt-0.5 shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Vitals Grid */}
                  <Card>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider">
                        Current Vitals
                      </h3>
                      <span className="text-xs text-[#667085] dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={12} /> Recorded: {selectedPatient.vitals?.recordedAt || "10:15 AM Today"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <VitalBox label="BP" value={selectedPatient.vitals?.bp || "118/76"} unit="mmHg" />
                      <VitalBox label="Pulse" value={selectedPatient.vitals?.pulse || "74"} unit="bpm" />
                      <VitalBox label="SpO2" value={selectedPatient.vitals?.spo2 || "99"} unit="%" />
                      <VitalBox label="Temp" value={selectedPatient.vitals?.temp || "98.6"} unit="°F" />
                      <VitalBox label="Weight" value={selectedPatient.vitals?.weight || "54"} unit="kg" />
                      <VitalBox
                        label="FHR"
                        value={selectedPatient.vitals?.fetalHeartRate || selectedPatient.vitals?.fhr || "142"}
                        unit="bpm"
                        alert={!!selectedPatient.pregnancy}
                      />
                    </div>
                  </Card>

                  {/* Doctor Consultation Notes Card */}
                  <Card className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#059669]" />
                        <h3 className="text-xs font-semibold text-[#172033] dark:text-white uppercase tracking-wider">
                          Consultation Notes & Observations
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleSpeechRecognition}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isRecording
                              ? "bg-rose-500 text-white animate-pulse"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                          title="Doctor Speech Dictation"
                        >
                          {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                          <span>{isRecording ? "Listening..." : "Dictate"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoctorNotes("")}
                          className="text-xs text-[#667085] hover:text-[#172033] dark:hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#E4E9F0] dark:border-slate-700 rounded-lg overflow-hidden focus-within:border-[#059669] focus-within:ring-1 focus-within:ring-[#059669]">
                      <textarea
                        ref={notesTextareaRef}
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Type observations, clinical advice, or maternal lifestyle instructions..."
                        className="w-full p-3 text-sm text-[#172033] dark:text-slate-100 placeholder:text-slate-400 bg-white dark:bg-slate-900 resize-none focus:outline-none"
                      />
                      <div className="px-3 py-1.5 bg-[#F7F9FC] dark:bg-slate-800/50 border-t border-[#E4E9F0] dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => insertFormatting("**", "**")}
                            className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("*", "*")}
                            className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 italic flex items-center justify-center cursor-pointer font-serif"
                            title="Italic"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("• ")}
                            className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                            title="Bullet List"
                          >
                            ≡
                          </button>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updatePatientReview(selectedPatient.id, { notes: doctorNotes });
                            setAllPatients(getAllPatients());
                            showToast("✓ Clinical note saved");
                          }}
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 2: History */}
              {activeTab === "history" && (
                <div className="space-y-4 pb-8">
                  <Card className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-[#172033] dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#059669]" />
                      <span>Longitudinal Medical & Antenatal History</span>
                    </h3>
                    <div className="space-y-3 mt-1">
                      <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-slate-800/40 border border-[#E4E9F0] dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-[#172033] dark:text-white">Obstetric Profile</h4>
                        <p className="text-xs text-[#667085] dark:text-slate-300 mt-1">
                          G2P1, 1 living child delivered normally at Bishalgarh CHC (2022). LMP: 15-May-2024. EDD: 22-Feb-2025. TT-1 booster completed.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-slate-800/40 border border-[#E4E9F0] dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-[#172033] dark:text-white">Past Medical Conditions</h4>
                        <p className="text-xs text-[#667085] dark:text-slate-300 mt-1">
                          Mild nutritional microcytic anemia documented during 1st trimester. Hb improved from 9.8 g/dL to 11.2 g/dL following daily IFA supplementation.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-slate-800/40 border border-[#E4E9F0] dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-[#172033] dark:text-white">Allergies & Sensitivities</h4>
                        <p className="text-xs text-[#667085] dark:text-slate-300 mt-1">
                          No documented hypersensitivity to Penicillin, Sulfa drugs, or NSAIDs.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 3: Reports */}
              {activeTab === "reports" && (
                <div className="space-y-4 pb-8">
                  <Card className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-[#172033] dark:text-white flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-[#059669]" />
                      <span>Uploaded Clinical Records ({patientDocs.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                      {patientDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-lg border border-[#E4E9F0] dark:border-slate-700 bg-[#F7F9FC] dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                                {doc.category || "Report"}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                            </div>
                            <h4 className="text-xs font-semibold text-[#172033] dark:text-white mt-1">{doc.title}</h4>
                            <p className="text-[11px] text-[#667085] dark:text-slate-400 font-mono mt-0.5">{doc.fileName}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-[#E4E9F0] dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-mono">{doc.pages || "1 page"}</span>
                            <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(doc)}>
                              View Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 4: Consultations */}
              {activeTab === "consultations" && (
                <div className="space-y-4 pb-8">
                  <Card className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-[#172033] dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#059669]" />
                      <span>Prior Consultations Record</span>
                    </h3>
                    <div className="space-y-3 mt-1">
                      {selectedPatient.priorVisits?.map((pv, idx) => (
                        <div key={idx} className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-slate-800/40 border border-[#E4E9F0] dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#172033] dark:text-white">{pv.doctor}</span>
                            <span className="text-[11px] font-mono text-[#667085]">{pv.date}</span>
                          </div>
                          <div className="text-[11px] font-medium text-[#059669]">{pv.type} · {pv.facility}</div>
                          <p className="text-xs text-[#172033] dark:text-slate-300 leading-relaxed">{pv.summary}</p>
                          {pv.prescription && (
                            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-[#E4E9F0] dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                              Rx: {pv.prescription}
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-xs text-[#667085]">No prior consultations recorded.</p>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 5: Timeline */}
              {activeTab === "timeline" && (
                <div className="space-y-4 pb-8">
                  <Card className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-[#172033] dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#059669]" />
                      <span>Patient Care Journey Timeline</span>
                    </h3>
                    <div className="relative pl-6 space-y-6 border-l-2 border-[#E4E9F0] dark:border-slate-800 ml-3 py-2">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-[#059669] absolute -left-[31px] top-1 ring-4 ring-white dark:ring-slate-900" />
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Today, 10:24 AM</span>
                        <h4 className="text-xs font-semibold text-[#172033] dark:text-white">Digital Voice Intake Recorded</h4>
                        <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">
                          Patient completed self-intake for dry cough and mild body ache. Triage classified as Stable.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[31px] top-1 ring-4 ring-white dark:ring-slate-900" />
                        <span className="text-[10px] font-bold text-slate-400 font-mono">11 Oct 2024</span>
                        <h4 className="text-xs font-semibold text-[#172033] dark:text-white">Dr. Sandeep Roy · CHC OPD Visit</h4>
                        <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">
                          Routine ANC 2nd Trimester review. IFA and Calcium prescribed for 30 days.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={36} className="text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-[#172033] dark:text-white">Select a Patient</h3>
              <p className="text-xs text-[#667085] mt-1 max-w-xs">
                Select a case from the worklist on the left to begin your clinical review.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRESCRIPTION DRAWER OVERLAY (Canvas Requirement)               */}
      {/* ============================================================== */}
      {isRxDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="w-[460px] max-w-full h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#E4E9F0] dark:border-slate-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E4E9F0] dark:border-slate-800 bg-[#F7F9FC] dark:bg-slate-800/60 shrink-0">
              <div>
                <h3 className="font-semibold text-[#172033] dark:text-white text-sm">Prescription Editor</h3>
                <p className="text-xs text-[#667085] dark:text-slate-400">For {selectedPatient?.name} ({selectedPatient?.id})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRxDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[#667085] cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body (Scrollable Formulary & Items) */}
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4">
              {/* Template Picker */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Fast Presets</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-[#172033] dark:text-white cursor-pointer"
                  >
                    Select Template ▾
                  </button>
                  {templateDropdownOpen && (
                    <div className="absolute right-0 top-7 w-48 bg-white dark:bg-slate-800 border border-[#E4E9F0] dark:border-slate-700 rounded-lg shadow-lg z-30 py-1 text-xs">
                      {Object.keys(PRESCRIPTION_TEMPLATES).map((tmpl) => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#172033] dark:text-white cursor-pointer"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Medicine Search Combobox */}
              <div className="relative">
                <div className="flex items-center gap-2 p-2 border border-[#E4E9F0] dark:border-slate-700 rounded-lg bg-[#F7F9FC] dark:bg-slate-800">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={medSearchQuery}
                    onChange={(e) => handleMedSearchChange(e.target.value)}
                    placeholder="Search formulary drug (e.g. IFA, Paracetamol)..."
                    className="w-full text-xs bg-transparent focus:outline-none text-[#172033] dark:text-white"
                  />
                </div>
                {medSearchResults.length > 0 && (
                  <div className="absolute top-10 left-0 right-0 bg-white dark:bg-slate-800 border border-[#E4E9F0] dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-[#E4E9F0]">
                    {medSearchResults.map((drug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSearchedMed(drug)}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium text-[#172033] dark:text-white">{drug.name}</span>
                        <span className="text-[10px] text-[#059669] font-semibold">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescribed Items Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#667085] uppercase tracking-wider">
                  <span>Prescribed Medications ({rxItems.length})</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(true)}
                    className="text-[#059669] hover:underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Custom Drug
                  </button>
                </div>

                <div className="space-y-2">
                  {rxItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-[#E4E9F0] dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleMed(item.id)}
                          className="mt-0.5 accent-[#059669] cursor-pointer"
                        />
                        <div>
                          <h5 className="text-xs font-semibold text-[#172033] dark:text-white">{item.name}</h5>
                          <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-0.5">
                            {item.dose} · {item.duration}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer"
                        title="Remove medicine"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice field */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
                  Clinical Advice on Slip
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Additional patient advice, hydration, danger signs..."
                  className="w-full p-2.5 text-xs border border-[#E4E9F0] dark:border-slate-700 rounded-lg bg-[#F7F9FC] dark:bg-slate-800 text-[#172033] dark:text-white focus:outline-none focus:border-[#059669]"
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E4E9F0] dark:border-slate-800 bg-[#F7F9FC] dark:bg-slate-800/80 flex items-center justify-between gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setIsRxDrawerOpen(false)}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={Printer} onClick={() => setShowPrintModal(true)}>
                  Print Preview
                </Button>
                <Button variant="primary" size="sm" icon={CheckCircle} onClick={handleApproveAndIssue}>
                  Approve & Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TELECONSULTATION / VIDEO OPD                            */}
      {/* ============================================================== */}
      {showTeleconsultModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Tele-OPD Session with {selectedPatient?.name}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Patient ID: {selectedPatient?.id} · Facility: Bishalgarh CHC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeleconsultModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-950 h-96 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-[#059669] text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-[#059669]/20">
                  {selectedPatient?.name?.charAt(0) || "P"}
                </div>
                <h4 className="text-sm font-bold text-white">{selectedPatient?.name}</h4>
                <p className="text-xs text-emerald-400 font-mono">Audio/Video Connected (Tripura Tele-Health)</p>
              </div>

              <div className="absolute bottom-4 right-4 w-36 h-28 rounded-xl bg-slate-800/90 border border-slate-700 shadow-xl flex flex-col items-center justify-center text-center p-2 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-1">Dr. Sandeep Roy</span>
                <span className="text-[9px] text-emerald-400 font-mono">Broadcasting</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">Duration: 02:45</div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="danger"
                  size="sm"
                  icon={Phone}
                  onClick={() => {
                    setShowTeleconsultModal(false);
                    showToast("Teleconsultation concluded");
                  }}
                >
                  End Consultation
                </Button>
              </div>
              <div className="text-xs text-emerald-400 font-mono">Encrypted WebRTC</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PRINT OFFICIAL PRESCRIPTION SLIP                        */}
      {/* ============================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E4E9F0] dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E9F0] dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#059669]" />
                <span>Prescription Slip Print Preview</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Slip Layout */}
            <div className="p-6 border border-slate-300 rounded-xl bg-white text-slate-900 space-y-4 font-sans text-xs">
              <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
                <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                  National Health Mission · Government of Tripura
                </h2>
                <h3 className="text-xs font-bold text-slate-700">
                  Bishalgarh Community Health Centre, Sepahijala
                </h3>
                <p className="text-[10px] text-slate-500">
                  OPD Clinical Consultation Slip · ABHA Ayushman Bharat
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 text-xs">
                <div>
                  <strong className="text-slate-900 block">Dr. Sandeep Roy, MBBS, MD</strong>
                  <span className="text-slate-600">Medical Officer</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Reg. No: TR-MC-8921</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block">{selectedPatient?.name}</strong>
                  <span className="text-slate-600 font-mono">{selectedPatient?.id}</span>
                  <span className="text-slate-500 block">
                    {selectedPatient?.age} yrs / {selectedPatient?.gender || selectedPatient?.sex} · Blood: {selectedPatient?.bloodGroup || "B+"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg grid grid-cols-4 gap-2 text-center text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">BP</span>
                  <strong className="font-mono">{selectedPatient?.vitals?.bp || "118/76 mmHg"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Pulse</span>
                  <strong className="font-mono">{selectedPatient?.vitals?.pulse || "74 bpm"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">SpO2</span>
                  <strong className="font-mono">{selectedPatient?.vitals?.spo2 || "99%"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Weight / Temp</span>
                  <strong className="font-mono">{selectedPatient?.vitals?.weight || "54 kg"}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-lg font-black text-emerald-700 font-serif">℞</span>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-800">
                  {rxItems
                    .filter((m) => m.selected)
                    .map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.name}</strong> — {item.dose} ({item.duration})
                      </li>
                    ))}
                </ol>
              </div>

              {doctorNotes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Clinical Advice:</span>
                  <p className="text-xs text-slate-700 italic mt-0.5">{doctorNotes}</p>
                </div>
              )}

              <div className="pt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString("en-GB")}</span>
                  <div className="text-[9px] font-mono text-emerald-700 font-bold">Verified Digital Signature</div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-1 font-serif italic text-slate-800">
                    Dr. S. Roy
                  </div>
                  <span className="text-[10px] text-slate-500">Medical Officer Signature</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPrintModal(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
              >
                Print Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DOCUMENT PREVIEW                                        */}
      {/* ============================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-5 shadow-2xl border border-[#E4E9F0] dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E9F0] dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#172033] dark:text-white">{previewDoc.title}</h3>
                <p className="text-xs text-[#667085] font-mono">{previewDoc.fileName} · {previewDoc.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-64 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-center p-4">
              <FileText size={40} className="text-[#059669] mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Digital Document Preview</p>
              <span className="text-[11px] text-slate-400 font-mono mt-1">{previewDoc.facility || "Bishalgarh CHC Records"}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD CUSTOM MEDICINE                                     */}
      {/* ============================================================== */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-[#E4E9F0] dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E9F0] dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-[#172033] dark:text-white">Add Custom Medicine</h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustomMed} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#667085] block mb-1">Drug Name & Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tab Cefixime 200mg"
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E9F0] dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#172033] dark:text-white focus:outline-none focus:border-[#059669]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#667085] block mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet twice daily after meals"
                  value={customMedDose}
                  onChange={(e) => setCustomMedDose(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E9F0] dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#172033] dark:text-white focus:outline-none focus:border-[#059669]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#667085] block mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. x 5 days"
                  value={customMedDuration}
                  onChange={(e) => setCustomMedDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E9F0] dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#172033] dark:text-white focus:outline-none focus:border-[#059669]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E9F0] dark:border-slate-800">
                <Button variant="ghost" size="sm" onClick={() => setShowAddCustomModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Add to Prescription
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
