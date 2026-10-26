import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Stethoscope,
  Video,
  Phone,
  MoreVertical,
  ChevronDown,
  Sparkles,
  Edit2,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Eye,
  Download,
  X,
  Mic,
  MicOff,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  User,
  UsersRound,
  Heart,
  Share2,
  Send,
  Check,
} from "lucide-react";
import {
  getAllPatients,
  getPatientById,
  setCurrentPatient,
  updatePatientReview,
  getPatientDocuments,
  addPatientDocument,
} from "../../utils/patientStore";
import { logAuditEvent, verifyAccessCode } from "../../utils/accessCodeStore";
import { getPatientConsultations, submitDoctorReview } from "../../services/api";

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

export default function DoctorReviewTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("id");
  const paramCode = searchParams.get("code");

  const [allPatients, setAllPatients] = useState(() => getAllPatients());
  const [patientQueueTab, setPatientQueueTab] = useState("today"); // "today" | "upcoming" | "followup"
  const [patientListSearch, setPatientListSearch] = useState("");

  // Currently selected patient
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (paramId) return paramId;
    const initialList = getAllPatients();
    return initialList[0]?.id || "AV-2026-8921";
  });

  const currentPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || allPatients[0] || null;
  }, [selectedPatientId, allPatients]);

  // Center tabs
  const [activeCenterTab, setActiveCenterTab] = useState("summary"); // "summary" | "history" | "documents" | "consultations" | "timeline"

  // Right column: documents filter tab
  const [activeDocsCategory, setActiveDocsCategory] = useState("all"); // "all" | "prescriptions" | "lab" | "imaging"

  // Prescription medicines state
  const [rxItems, setRxItems] = useState([]);
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedDose, setCustomMedDose] = useState("");
  const [customMedDuration, setCustomMedDuration] = useState("x 5 days");
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  // Doctor Consultation Notes & Rich Editing
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const notesTextareaRef = useRef(null);

  // Audio speech player for patient voice intake
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showTeleconsultModal, setShowTeleconsultModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(null); // "more" | "records" | "followup" | "advice"

  // Feedback notifications
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Sync paramId and paramCode from URL
  useEffect(() => {
    if (paramId) {
      setSelectedPatientId(paramId);
    } else if (paramCode) {
      const codeCheck = verifyAccessCode(paramCode);
      if (codeCheck?.valid && codeCheck.codeData) {
        setSelectedPatientId(codeCheck.codeData.patientId);
        showToast(`✓ Access code ${paramCode} verified. Unlocked patient.`);
      }
    }
  }, [paramId, paramCode]);

  // Load patient prescriptions & default notes when currentPatient changes
  useEffect(() => {
    if (currentPatient) {
      if (currentPatient.prescriptions && currentPatient.prescriptions.length > 0) {
        setRxItems(currentPatient.prescriptions);
      } else {
        setRxItems(PRESCRIPTION_TEMPLATES["ANC Routine"]);
      }

      if (currentPatient.doctorReview?.notes) {
        setDoctorNotes(currentPatient.doctorReview.notes);
      } else {
        setDoctorNotes(
          currentPatient.chiefComplaint
            ? `Clinical assessment for ${currentPatient.name}: ${currentPatient.chiefComplaint}. Patient is stable, advice provided.`
            : ""
        );
      }
    }
  }, [currentPatient?.id]);

  // Filter patients by queue tab & search
  const filteredPatients = useMemo(() => {
    let list = allPatients.filter((p) => {
      if (patientQueueTab === "today") return p.queueType === "today" || !p.queueType;
      if (patientQueueTab === "upcoming") return p.queueType === "upcoming";
      if (patientQueueTab === "followup") return p.queueType === "followup";
      return true;
    });

    if (patientListSearch.trim()) {
      const q = patientListSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allPatients, patientQueueTab, patientListSearch]);

  // Counts for tabs
  const todayCount = useMemo(() => allPatients.filter((p) => p.queueType === "today" || !p.queueType).length, [allPatients]);
  const upcomingCount = useMemo(() => allPatients.filter((p) => p.queueType === "upcoming").length, [allPatients]);
  const followupCount = useMemo(() => allPatients.filter((p) => p.queueType === "followup").length, [allPatients]);

  // Documents for current patient
  const patientDocs = useMemo(() => {
    if (!currentPatient) return [];
    const docs = getPatientDocuments(currentPatient.id);
    if (activeDocsCategory === "all") return docs;
    if (activeDocsCategory === "prescriptions") return docs.filter((d) => d.category?.toLowerCase().includes("prescription") || d.type === "prescription");
    if (activeDocsCategory === "lab") return docs.filter((d) => d.category?.toLowerCase().includes("lab") || d.type === "lab");
    if (activeDocsCategory === "imaging") return docs.filter((d) => d.category?.toLowerCase().includes("imaging") || d.type === "imaging");
    return docs;
  }, [currentPatient, activeDocsCategory]);

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setSearchParams({ id });
  };

  // Medicine search auto-complete
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
    showToast(`Added ${drug.name} to prescription`);
  };

  const handleToggleMed = (id) => {
    setRxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleRemoveMed = (id) => {
    setRxItems((prev) => prev.filter((item) => item.id !== id));
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
    showToast(`Added ${newMed.name} to prescription`);
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
      showToast(`Applied "${tmplKey}" prescription template`);
    }
  };

  // Audio Speech Synthesis for Patient Voice
  const togglePlayAudio = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = currentPatient?.englishIntake || currentPatient?.chiefComplaint || "No patient voice intake available.";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-text dictation simulation/Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Friendly dictation simulator fallback
      if (isRecording) {
        setIsRecording(false);
      } else {
        setIsRecording(true);
        showToast("Doctor dictation listening...");
        setTimeout(() => {
          setDoctorNotes((prev) =>
            prev
              ? `${prev} \nPatient evaluated. Vitals stable. Advised adequate hydration and routine ANC follow-up.`
              : "Patient evaluated. Vitals stable. Advised adequate hydration and routine ANC follow-up."
          );
          setIsRecording(false);
          showToast("Dictation appended to notes");
        }, 3000);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

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

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Formatting buttons for Consultation Notes
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

  // Save Review and Issue Prescription
  const handleApproveAndIssue = () => {
    if (!currentPatient) return;

    const selectedMeds = rxItems.filter((m) => m.selected);
    const rxString = selectedMeds.map((m) => `${m.name} (${m.dose}, ${m.duration})`).join("; ");

    // Update patient record
    updatePatientReview(currentPatient.id, {
      doctorName: "Dr. Sandeep Roy (General Physician)",
      facility: "Bishalgarh Community Health Centre",
      notes: doctorNotes,
      prescription: rxString,
      prescriptionsList: selectedMeds,
    });

    // Automatically generate verified prescription PDF document in vault
    addPatientDocument({
      patientId: currentPatient.id,
      title: `Official OPD Prescription Slip - Dr. Sandeep Roy`,
      fileName: `Rx_${currentPatient.id}_Signed.pdf`,
      category: "Prescription",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      pages: "1 page",
      facility: "Bishalgarh Community Health Centre",
      fileSize: "460 KB",
      verified: true,
      type: "prescription",
    });

    // Log DPDP audit event
    logAuditEvent({
      patientId: currentPatient.id,
      code: paramCode || "CLINICAL_PORTAL",
      accessorRole: "Doctor",
      accessorName: "Dr. Sandeep Roy",
      facility: "Bishalgarh Community Health Centre",
      action: "REVIEW_SAVED",
      details: `Prescription & clinical orders issued for ${currentPatient.name}. Synced to patient health vault.`,
    });

    // Refresh patients list
    setAllPatients(getAllPatients());
    showToast(`✓ Prescription issued to ${currentPatient.name} (${currentPatient.id})`);
  };

  const handleSaveNotesOnly = () => {
    if (!currentPatient) return;
    updatePatientReview(currentPatient.id, {
      notes: doctorNotes,
      doctorName: "Dr. Sandeep Roy",
    });
    setAllPatients(getAllPatients());
    showToast("✓ Clinical notes saved successfully");
  };


  return (
    <div className="space-y-4">
      {/* Toast Feedback Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b6651] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-white/80 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* 3-Column Clinical Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-start">
        {/* ============================================================== */}
        {/* COLUMN 1: PATIENT LIST (3 of 12 cols on desktop)              */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col h-[calc(100vh-175px)] min-h-[640px] overflow-hidden">
          {/* Header & Filter */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Patient List</span>
            </h3>
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Filter Patients"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Queue Category Tabs: Today | Upcoming | Follow-up */}
          <div className="px-3 pt-2 pb-1 border-b border-slate-100 flex items-center gap-1 text-[11px] font-bold text-slate-500 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPatientQueueTab("today")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                patientQueueTab === "today"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Today ({todayCount})
            </button>

            <button
              type="button"
              onClick={() => setPatientQueueTab("upcoming")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                patientQueueTab === "upcoming"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>

            <button
              type="button"
              onClick={() => setPatientQueueTab("followup")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                patientQueueTab === "followup"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Follow-up ({followupCount})
            </button>
          </div>

          {/* Search inside queue */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientListSearch}
                onChange={(e) => setPatientListSearch(e.target.value)}
                placeholder="Filter by name, ID or disease..."
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0b6651]"
              />
            </div>
          </div>

          {/* Scrollable Patient List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
            {filteredPatients.map((p) => {
              const isSelected = (currentPatient?.id === p.id) || (currentPatient?.altId === p.id);
              const isUrgent = p.status === "Urgent" || p.triage === "Critical Red Flag";
              const isCurrent = p.status === "Current" || isSelected;
              const initialLetter = p.name ? p.name.charAt(0).toUpperCase() : "P";

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPatient(p.id)}
                  className={`p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2.5 select-none ${
                    isSelected
                      ? "bg-[#f0f9f4] border border-[#a5d6a7] shadow-2xs"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Circle Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-[#0b6651] text-white"
                          : isUrgent
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {initialLetter}
                    </div>

                    {/* Patient Information */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 truncate block">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        <span className="font-mono text-slate-600">{p.id}</span>
                        <span className="mx-1">•</span>
                        <span>
                          {p.age} yrs{typeof p.pregnancy === "string" && p.pregnancy ? ` · ${p.pregnancy.includes("(") ? p.pregnancy.replace("Pregnant", "").replace(/[()]/g, "").trim() : p.pregnancy}` : typeof p.category === "string" && p.category ? ` · ${p.category.split("/")[0].trim()}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time & Status Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      {p.time || "10:00 AM"}
                    </span>
                    {isUrgent ? (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                        Urgent
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-[#e8f5e9] text-[#0b6651] border border-[#c8e6c9]">
                        Current
                      </span>
                    ) : p.status === "Completed" ? (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 bg-emerald-50">
                        Done
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No patients found in this queue.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: CENTER CONSULTATION CONSOLE (6 of 12 cols on desktop)*/}
        {/* ============================================================== */}
        <div className="lg:col-span-6 space-y-4">
          {/* Patient Header Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Patient Basic Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0b6651] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                  {currentPatient?.name?.charAt(0) || "M"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 leading-tight">
                      {currentPatient?.name || "Patient"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#e8f5e9] text-[#0b6651] border border-[#c8e6c9]">
                      Active Case
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    <span className="font-mono text-slate-700 font-bold">{currentPatient?.id}</span>
                    <span className="mx-1.5">•</span>
                    <span>{currentPatient?.age} yrs · {currentPatient?.gender}</span>
                    {currentPatient?.pregnancy && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span className="text-[#0b6651] font-bold">{currentPatient.pregnancy}</span>
                      </>
                    )}
                    <span className="mx-1.5">•</span>
                    <span>Blood Group: <strong className="text-slate-800">{currentPatient?.bloodGroup || "B+"}</strong></span>
                  </p>
                </div>
              </div>

              {/* Consultation Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPatient) {
                      setCurrentPatient(currentPatient);
                    }
                    navigate("/patient");
                  }}
                  className="px-3 py-2 bg-slate-50 hover:bg-[#e8f5e9] text-slate-700 hover:text-[#0b6651] border border-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={`Open ${currentPatient?.name || "Patient"}'s portal`}
                >
                  <User className="w-3.5 h-3.5 text-[#0b6651]" />
                  <span className="hidden sm:inline">Patient View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTeleconsultModal(true)}
                  className="px-3.5 py-2 bg-[#0b6651] hover:bg-[#084e3e] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Consultation</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(showActionModal === "more" ? null : "more")}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* More Dropdown */}
                  {showActionModal === "more" && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1 z-30 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setShowTeleconsultModal(true);
                          setShowActionModal(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Video className="w-3.5 h-3.5 text-[#0b6651]" />
                        <span>Launch Video OPD</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPrintModal(true);
                          setShowActionModal(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Print Clinical Case Summary</span>
                      </button>
                      <button
                        onClick={() => {
                          showToast(`ASHA worker Kalpana Reang notified for ${currentPatient.name}`);
                          setShowActionModal(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>Call ASHA Field Worker</span>
                      </button>
                      <button
                        onClick={() => {
                          showToast(`Emergency referral alert dispatched to District Hospital`);
                          setShowActionModal(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Refer to District Hospital</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Demographics & Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              {/* Clinical Category or Pregnancy Chip */}
              <div className="bg-[#fef8f4] border border-[#fde8d7] p-2 rounded-2xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  {currentPatient?.pregnancy ? <Flame className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-orange-800 uppercase block truncate">
                    {currentPatient?.pregnancy ? "Pregnancy" : "Clinical Care"}
                  </span>
                  <span className="text-[11px] font-black text-slate-900 truncate block">
                    {currentPatient?.pregnancyBadge || currentPatient?.pregnancy || currentPatient?.category || "General Medicine"}
                  </span>
                </div>
              </div>

              {/* Allergies Chip */}
              <div className="bg-[#f5f8ff] border border-[#e0eaff] p-2 rounded-2xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-blue-800 uppercase block truncate">
                    Allergies
                  </span>
                  <span className="text-[11px] font-black text-slate-900 truncate block">
                    {currentPatient?.allergies && currentPatient.allergies.length > 0
                      ? currentPatient.allergies[0]
                      : "None known"}
                  </span>
                </div>
              </div>

              {/* Chronic Conditions Chip */}
              <div className="bg-[#faf5ff] border border-[#f3e8ff] p-2 rounded-2xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-purple-800 uppercase block truncate">
                    Chronic Conditions
                  </span>
                  <span className="text-[11px] font-black text-slate-900 truncate block">
                    {currentPatient?.chronicConditions && currentPatient.chronicConditions.length > 0
                      ? currentPatient.chronicConditions[0].split("(")[0].trim()
                      : "None"}
                  </span>
                </div>
              </div>

              {/* Last Visit Chip */}
              <div className="bg-[#f0fdf4] border border-[#dcfce7] p-2 rounded-2xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase block truncate">
                    Last Visit
                  </span>
                  <span className="text-[11px] font-black text-slate-900 truncate block">
                    {currentPatient?.lastVisit || "11 Oct 2024"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Console Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-600 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCenterTab("summary")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCenterTab === "summary"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0b6651]" />
              <span>AI Summary</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCenterTab("history")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCenterTab === "history"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Medical History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCenterTab("documents")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCenterTab === "documents"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reports & Documents ({patientDocs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCenterTab("consultations")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCenterTab === "consultations"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <UsersRound className="w-3.5 h-3.5" />
              <span>Consultations ({currentPatient?.consultationsCount || 2})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCenterTab("timeline")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCenterTab === "timeline"
                  ? "bg-[#e8f5e9] text-[#0b6651] font-black shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          {/* TAB CONTENT: AI SUMMARY */}
          {activeCenterTab === "summary" && (
            <div className="space-y-4">
              {/* 2 Side-by-Side Cards: AI Clinical Summary & Current Intake & Symptoms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: AI Clinical Summary */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 leading-tight">
                        AI Clinical Summary
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Generated from patient intake, reports and history
                      </p>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-[#0b6651]" />
                      <span>Chief Complaint</span>
                    </div>
                    <p className="text-xs text-slate-700 pl-5 leading-relaxed">
                      {currentPatient?.chiefComplaint || "Dry cough for 3 days with mild throat irritation. No fever reported."}
                    </p>
                  </div>

                  {/* Key Findings */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Key Findings</span>
                    </div>
                    <ul className="pl-5 space-y-1 text-slate-600 text-xs list-disc marker:text-slate-400">
                      {currentPatient?.keyFindings?.map((kf, idx) => (
                        <li key={idx}>{kf}</li>
                      )) || (
                        <>
                          <li>Currently 20 weeks pregnant (antenatal checkup normal).</li>
                          <li>No history of asthma or chronic lung disease.</li>
                          <li>Recent vitals within normal range.</li>
                          <li>No known allergies.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* AI Impression (Non-diagnostic) */}
                  <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>AI Impression (Non-diagnostic)</span>
                    </div>
                    <p className="text-xs text-emerald-950 pl-5 font-medium leading-relaxed">
                      {currentPatient?.aiImpression || "Likely viral upper respiratory tract infection. No red flag symptoms reported."}
                    </p>
                  </div>

                  {/* Suggested Next Questions */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        ?
                      </span>
                      <span>Suggested Next Questions</span>
                    </div>
                    <ul className="pl-5 space-y-1 text-slate-600 text-xs list-disc marker:text-slate-400">
                      {currentPatient?.suggestedQuestions?.map((sq, idx) => (
                        <li key={idx}>{sq}</li>
                      )) || (
                        <>
                          <li>Has the cough changed over time?</li>
                          <li>Any throat pain or nasal congestion?</li>
                          <li>Any recent exposure to someone with infection?</li>
                          <li>Any difficulty in sleep due to cough?</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* AI Disclaimer Warning */}
                  <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[10px] font-medium flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>This is an AI-generated summary and not a substitute for clinical judgment.</span>
                  </div>
                </div>

                {/* Right Card: Current Intake & Symptoms */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black text-slate-900">
                        Current Intake & Symptoms
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Opening symptom intake editor")}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Native Language Audio Transcription Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Patient Voice Transcript
                      </span>
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          isPlayingAudio
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-white text-[#0b6651] border border-[#c8e6c9] hover:bg-[#e8f5e9]"
                        }`}
                        title="Listen to intake audio"
                      >
                        {isPlayingAudio ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hindi / Regional text */}
                    <div className="text-xs font-semibold text-slate-900 font-sans tracking-wide">
                      {currentPatient?.nativeIntake || "बुखार और बदन दर्द, कभी कभी हल्का बुखार, पिछले ३ दिन से सूखी खांसी।"}
                    </div>

                    {/* English translation */}
                    <p className="text-[11px] text-slate-500 font-medium italic border-t border-slate-200/60 pt-1.5">
                      {currentPatient?.englishIntake || "Dry cough for 3 days, mild body ache, occasional low-grade fever."}
                    </p>
                  </div>

                  {/* Structured Symptom Key-Values */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration</span>
                      </span>
                      <strong className="text-slate-900">{currentPatient?.intakeDetails?.duration || "3 days"}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        <span>Severity</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {currentPatient?.intakeDetails?.severity || "Mild"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <UsersRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>Related Symptoms</span>
                      </span>
                      <strong className="text-slate-800 text-[11px]">
                        {currentPatient?.intakeDetails?.relatedSymptoms || "No breathlessness, no chest pain"}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Self Medication</span>
                      </span>
                      <strong className="text-slate-800">{currentPatient?.intakeDetails?.selfMedication || "None"}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Concerns</span>
                      </span>
                      <span className="text-[#0b6651] font-bold text-[11px]">
                        {currentPatient?.intakeDetails?.concerns || "Safe in pregnancy?"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0b6651]" />
                  <span>Quick Actions</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (notesTextareaRef.current) notesTextareaRef.current.focus();
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3 text-[#0b6651]" />
                    <span>Add Clinical Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const medInput = document.getElementById("search-medicine-input");
                      if (medInput) medInput.focus();
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span>Create Prescription</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Record request SMS sent to ASHA worker & ${currentPatient.name}`);
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-3 h-3 text-purple-600" />
                    <span>Request More Records</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Follow-up appointment booked for 4 weeks from today`);
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>Book Follow-up</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Pregnancy lifestyle advice & warning signs SMS sent to patient phone`);
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-emerald-600" />
                    <span>Send Advice to Patient</span>
                  </button>
                </div>
              </div>

              {/* Consultation Notes Rich Card */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0b6651]" />
                    <h3 className="text-xs font-black text-slate-900">
                      Consultation Notes
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDoctorNotes("")}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#0b6651] focus-within:ring-1 focus-within:ring-[#0b6651] transition-all">
                  <textarea
                    ref={notesTextareaRef}
                    rows={4}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Write your clinical notes, observations, and advice..."
                    className="w-full p-3.5 text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-white font-sans leading-relaxed"
                  />

                  {/* Formatting Toolbar */}
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertFormatting("**", "**")}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("*", "*")}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-700 italic font-serif text-xs flex items-center justify-center cursor-pointer"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<u>", "</u>")}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-700 underline text-xs flex items-center justify-center cursor-pointer"
                        title="Underline"
                      >
                        U
                      </button>
                      <div className="h-4 w-px bg-slate-200 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting("• ")}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-700 text-xs flex items-center justify-center cursor-pointer"
                        title="Bullet List"
                      >
                        ≡
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("1. ")}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-700 text-xs flex items-center justify-center cursor-pointer font-bold"
                        title="Numbered List"
                      >
                        1.
                      </button>

                      {/* Microphone Dictation Button */}
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className={`w-7 h-7 rounded-lg ml-1 text-xs flex items-center justify-center cursor-pointer transition-colors ${
                          isRecording
                            ? "bg-rose-500 text-white animate-pulse"
                            : "hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Doctor Voice Dictation"
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveNotesOnly}
                      className="px-3.5 py-1.5 bg-[#0b6651] hover:bg-[#084e3e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: MEDICAL HISTORY */}
          {activeCenterTab === "history" && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0b6651]" />
                <span>Longitudinal Medical History</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Antenatal & Obstetric Profile</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    G2P1, 1 living child delivered normally at Bishalgarh CHC (2022). LMP: 15-May-2024. EDD: 22-Feb-2025. TT-1 booster administered in July.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Past Medical Conditions</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Mild nutritional microcytic anemia documented during 1st trimester. Hb improved from 9.8 g/dL to 11.2 g/dL following daily IFA supplementation.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Allergies & Drug Intolerances</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    No documented hypersensitivity to Penicillin, Sulfa drugs, or NSAIDs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: REPORTS & DOCUMENTS */}
          {activeCenterTab === "documents" && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0b6651]" />
                <span>Uploaded Clinical Records ({patientDocs.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#0b6651] transition-all bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {doc.category || "Report"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">{doc.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 mt-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.fileName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold">{doc.pages || "1 page"}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1 bg-[#0b6651] text-white hover:bg-[#084e3e] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CONSULTATIONS */}
          {activeCenterTab === "consultations" && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-[#0b6651]" />
                <span>Prior Consultations Record</span>
              </h3>

              <div className="space-y-3">
                {currentPatient?.priorVisits?.map((pv, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{pv.doctor}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{pv.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#0b6651]">{pv.type} · {pv.facility}</div>
                    <p className="text-xs text-slate-700 leading-relaxed">{pv.summary}</p>
                    {pv.prescription && (
                      <div className="p-2 rounded-xl bg-white border border-slate-100 text-xs font-mono text-slate-800">
                        Rx: {pv.prescription}
                      </div>
                    )}
                  </div>
                )) || (
                  <p className="text-xs text-slate-500">No prior consultations recorded.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: TIMELINE */}
          {activeCenterTab === "timeline" && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0b6651]" />
                <span>Patient Care Journey Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 border-l-2 border-emerald-200 ml-3 py-2">
                <div className="relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0b6651] absolute -left-[31px] top-1 ring-4 ring-white" />
                  <span className="text-[10px] font-bold text-slate-400">Today, 10:24 AM</span>
                  <h4 className="text-xs font-black text-slate-900">Digital Voice Intake Recorded</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Patient completed self-intake for dry cough and mild body ache. Triage classified as Stable.
                  </p>
                </div>

                <div className="relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 absolute -left-[31px] top-1 ring-4 ring-white" />
                  <span className="text-[10px] font-bold text-slate-400">11 Oct 2024</span>
                  <h4 className="text-xs font-black text-slate-900">Dr. Sandeep Roy · CHC OPD Visit</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Routine ANC 2nd Trimester review. IFA and Calcium prescribed for 30 days.
                  </p>
                </div>

                <div className="relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-600 absolute -left-[31px] top-1 ring-4 ring-white" />
                  <span className="text-[10px] font-bold text-slate-400">28 Sep 2024</span>
                  <h4 className="text-xs font-black text-slate-900">Complete Blood Panel & Hemogram</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hb recorded at 11.2 g/dL. Platelet count 240,000/uL. Normal limits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: RIGHT PANEL (3 of 12 cols on desktop)                */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Reports & Documents */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0b6651]" />
                <h3 className="text-xs font-black text-slate-900">
                  Reports & Documents
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCenterTab("documents")}
                className="text-[11px] font-bold text-[#0b6651] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Document Sub-Pills */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveDocsCategory("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeDocsCategory === "all" ? "bg-[#e8f5e9] text-[#0b6651] font-black" : "hover:bg-slate-100"
                }`}
              >
                All (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveDocsCategory("prescriptions")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeDocsCategory === "prescriptions" ? "bg-[#e8f5e9] text-[#0b6651] font-black" : "hover:bg-slate-100"
                }`}
              >
                Prescriptions (1)
              </button>
              <button
                type="button"
                onClick={() => setActiveDocsCategory("lab")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeDocsCategory === "lab" ? "bg-[#e8f5e9] text-[#0b6651] font-black" : "hover:bg-slate-100"
                }`}
              >
                Lab Reports (1)
              </button>
              <button
                type="button"
                onClick={() => setActiveDocsCategory("imaging")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeDocsCategory === "imaging" ? "bg-[#e8f5e9] text-[#0b6651] font-black" : "hover:bg-slate-100"
                }`}
              >
                Imaging (1)
              </button>
            </div>

            {/* Document Items List with Thumbnails */}
            <div className="space-y-2">
              {patientDocs.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Document Thumbnail */}
                    <div className="w-10 h-11 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-[7px] font-black text-slate-400 uppercase mt-0.5">
                        {doc.type === "imaging" ? "IMG" : doc.type === "lab" ? "LAB" : "PDF"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate block">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {doc.date} · {doc.pages || "2 pages"}
                      </p>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700 mt-0.5">
                        {doc.category || "Document"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 text-xs font-bold text-[#0b6651] hover:bg-[#e8f5e9] rounded-lg transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Options for ${doc.title}`)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Prescription (Rx) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[#0b6651] font-black text-sm">℞</span>
                <h3 className="text-xs font-black text-slate-900">
                  Prescription (Rx)
                </h3>
              </div>

              {/* Templates Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                  className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <span>Templates</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {templateDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1 z-30 text-xs font-semibold">
                    {Object.keys(PRESCRIPTION_TEMPLATES).map((tmpl) => (
                      <button
                        key={tmpl}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 block"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons: Add Medicine | Quick Pills | History */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  const inputEl = document.getElementById("search-medicine-input");
                  if (inputEl) inputEl.focus();
                }}
                className="px-2.5 py-1 bg-[#e8f5e9] text-[#0b6651] font-black rounded-lg cursor-pointer"
              >
                Add Medicine
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Quick Pills
              </button>
              <button
                type="button"
                onClick={() => setActiveCenterTab("consultations")}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                History
              </button>
            </div>

            {/* Search Medicine Input with Autocomplete */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-medicine-input"
                type="text"
                value={medSearchQuery}
                onChange={(e) => handleMedSearchChange(e.target.value)}
                placeholder="Search medicine (e.g. Paracetamol)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0b6651] focus:bg-white"
              />

              {/* Search Suggestions Dropdown */}
              {medSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {medSearchResults.map((drug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddSearchedMed(drug)}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 block">{drug.name}</strong>
                        <span className="text-[10px] text-slate-500">{drug.defaultDose}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-[#0b6651]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medication Checklist Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rxItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    item.selected
                      ? "bg-white border-slate-200 shadow-2xs"
                      : "bg-slate-50/60 border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleMed(item.id)}
                      className="w-4 h-4 rounded text-[#0b6651] focus:ring-[#0b6651] accent-[#0b6651] cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-slate-900 truncate block">
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {item.dose}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMed(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded cursor-pointer"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {rxItems.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No medicines added to this prescription yet.
                </div>
              )}
            </div>

            {/* Add Custom Medicine Button */}
            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="text-xs font-bold text-[#0b6651] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Medicine</span>
            </button>

            {/* CTA Buttons: Approve & Print */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleApproveAndIssue}
                className="w-full py-2.5 px-4 bg-[#0b6651] hover:bg-[#084e3e] text-white rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Review & Issue Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Prescription Slip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD CUSTOM MEDICINE DIALOG                            */}
      {/* ============================================================== */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0b6651]" />
                <span>Add Custom Medicine</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomMed} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medicine Name & Strength
                </label>
                <input
                  type="text"
                  required
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="e.g. Tab Azithromycin 500mg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0b6651]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dosage & Frequency
                  </label>
                  <input
                    type="text"
                    value={customMedDose}
                    onChange={(e) => setCustomMedDose(e.target.value)}
                    placeholder="e.g. 1 tablet OD after meals"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0b6651]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={customMedDuration}
                    onChange={(e) => setCustomMedDuration(e.target.value)}
                    placeholder="e.g. x 5 days"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0b6651]"
                  />
                </div>
              </div>

              {/* Quick Pills selector */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Popular Common Pills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DRUGS.slice(0, 6).map((pill) => (
                    <button
                      key={pill.name}
                      type="button"
                      onClick={() => {
                        setCustomMedName(pill.name);
                        setCustomMedDose(pill.defaultDose);
                        setCustomMedDuration(pill.defaultDuration);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#e8f5e9] hover:text-[#0b6651] text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      {pill.name.split(" ")[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#0b6651] hover:bg-[#084e3e] cursor-pointer shadow-xs"
                >
                  Add to Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DOCUMENT PREVIEW MODAL                                */}
      {/* ============================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">{previewDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {previewDoc.fileName} · {previewDoc.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content Simulation */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-sans text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                <h4 className="font-black text-slate-900 text-xs">GOVERNMENT OF TRIPURA · HEALTH & FAMILY WELFARE</h4>
                <p className="text-[11px] text-slate-500">{previewDoc.facility || "Bishalgarh Community Health Centre"}</p>
                <div className="text-[10px] font-mono text-emerald-800 font-bold">ABHA Verified Record</div>
              </div>

              {previewDoc.type === "lab" ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <strong className="text-slate-900 block">Complete Hemogram & Blood Chemistry</strong>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px]">
                        <th className="py-1">Test Parameter</th>
                        <th>Observed</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1">Hemoglobin (Hb)</td>
                        <td className="font-bold">11.2 g/dL</td>
                        <td>11.0 - 15.0 g/dL</td>
                        <td className="text-emerald-700 font-bold">Normal</td>
                      </tr>
                      <tr>
                        <td className="py-1">Total Leukocyte Count</td>
                        <td className="font-bold">7,800 /uL</td>
                        <td>4,000 - 11,000 /uL</td>
                        <td className="text-emerald-700 font-bold">Normal</td>
                      </tr>
                      <tr>
                        <td className="py-1">Platelet Count</td>
                        <td className="font-bold">240,000 /uL</td>
                        <td>150,000 - 450,000 /uL</td>
                        <td className="text-emerald-700 font-bold">Normal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : previewDoc.type === "imaging" ? (
                <div className="bg-slate-900 p-4 rounded-xl text-center space-y-2 text-white">
                  <div className="w-48 h-48 mx-auto bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <Activity className="w-12 h-12 text-slate-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-300">
                    Chest Radiograph PA View: Lung fields clear. Cardiac silhouette normal. No consolidation or pleural effusion.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-slate-800">
                  <h5 className="font-bold text-slate-900">Clinical Consultation Orders & Prescription</h5>
                  <p>Diagnosis: Routine Antenatal Care (Trimester 2) - Gestational Progress Normal.</p>
                  <p className="font-mono text-xs bg-slate-50 p-2 rounded-lg">
                    1. Tab IFA 1 OD x 30 days<br />
                    2. Tab Calcium 500mg BD x 30 days<br />
                    3. Tab Paracetamol 650mg SOS for body ache
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Authenticated via AarogyaVaani Vault</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Downloaded ${previewDoc.fileName}`);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-[#0b6651] text-white hover:bg-[#084e3e] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: TELECONSULTATION / VIDEO OPD MODAL                     */}
      {/* ============================================================== */}
      {showTeleconsultModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="p-4 bg-slate-800/80 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Tele-OPD Session with {currentPatient?.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patient ID: {currentPatient?.id} · Facility: Bishalgarh CHC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeleconsultModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative bg-slate-950 h-96 flex items-center justify-center overflow-hidden">
              {/* Simulated Patient Video Stream */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full bg-[#0b6651] text-white mx-auto flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-[#0b6651]/30">
                  {currentPatient?.name?.charAt(0) || "P"}
                </div>
                <h4 className="text-base font-bold text-white">{currentPatient?.name}</h4>
                <p className="text-xs text-emerald-400">Audio/Video Connected (Tripura Tele-Health)</p>
              </div>

              {/* Doctor PiP Video Thumbnail */}
              <div className="absolute bottom-4 right-4 w-36 h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center text-center p-2">
                <div className="w-8 h-8 rounded-full bg-[#0b6651] text-white flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-1">Dr. Sandeep Roy</span>
                <span className="text-[8px] text-emerald-400">Broadcasting</span>
              </div>
            </div>

            {/* Teleconsult Bottom Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                Duration: 02:45
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast("Microphone muted")}
                  className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  title="Toggle Microphone"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Camera toggled")}
                  className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  title="Toggle Camera"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTeleconsultModal(false);
                    showToast("Teleconsultation session concluded");
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 rotate-[135deg]" />
                  <span>End Consultation</span>
                </button>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Encrypted WebRTC
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: PRINT OFFICIAL PRESCRIPTION SLIP                       */}
      {/* ============================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#0b6651]" />
                <span>Prescription Slip Print Preview</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Slip Layout */}
            <div className="p-6 border-2 border-slate-300 rounded-2xl bg-white space-y-4 font-sans text-xs">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
                <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                  National Health Mission · Government of Tripura
                </h2>
                <h3 className="text-xs font-bold text-slate-700">
                  Bishalgarh Community Health Centre, Sepahijala
                </h3>
                <p className="text-[10px] text-slate-500">
                  OPD Clinical Consultation Slip · ABHA Ayushman Bharat
                </p>
              </div>

              {/* Doctor & Patient Credentials */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 text-xs">
                <div>
                  <strong className="text-slate-900 block">Dr. Sandeep Roy, MBBS, MD</strong>
                  <span className="text-slate-500">Medical Officer / General Physician</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Reg. No: TR-MC-8921</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block">{currentPatient?.name}</strong>
                  <span className="text-slate-600 font-mono">{currentPatient?.id}</span>
                  <span className="text-slate-500 block">
                    {currentPatient?.age} yrs / {currentPatient?.gender} · Blood: {currentPatient?.bloodGroup || "B+"}
                  </span>
                </div>
              </div>

              {/* Vitals */}
              <div className="bg-slate-50 p-2.5 rounded-xl grid grid-cols-4 gap-2 text-center text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">BP</span>
                  <strong>{currentPatient?.vitals?.bp || "118/76 mmHg"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Pulse</span>
                  <strong>{currentPatient?.vitals?.pulse || "74 bpm"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">SpO2</span>
                  <strong>{currentPatient?.vitals?.spo2 || "99%"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Weight / Temp</span>
                  <strong>{currentPatient?.vitals?.weight || "54 kg"}</strong>
                </div>
              </div>

              {/* Rx Medicines List */}
              <div className="space-y-2 pt-2">
                <span className="text-lg font-black text-[#0b6651] font-serif">℞</span>
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

              {/* Doctor Clinical Notes */}
              {doctorNotes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Clinical Advice:</span>
                  <p className="text-xs text-slate-700 italic mt-0.5">{doctorNotes}</p>
                </div>
              )}

              {/* Signature Stamp */}
              <div className="pt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString("en-GB")}</span>
                  <div className="text-[9px] font-mono text-emerald-800 font-bold">Verified Digital Signature</div>
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
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 bg-[#0b6651] hover:bg-[#084e3e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
