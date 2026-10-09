import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  LogOut,
  UsersRound,
  Activity,
  Phone,
  Building2,
  Filter,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getAllPatients,
  getPatientById,
  updatePatientReview,
} from "../../utils/patientStore";

const QUICK_MEDS = [
  "Tab Paracetamol 650mg SOS",
  "Tab IFA 1 OD x 30 days",
  "Tab Calcium 500mg BD x 30 days",
  "ORS Sachet x 2 packets",
  "Tab Methyldopa 250mg TDS",
  "Tab Amoxicillin 500mg TDS x 5 days",
];

export default function DoctorReview() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const paramId = searchParams.get("id");

  // Doctor session profile
  const [doctorProfile, setDoctorProfile] = useState(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userName: "Dr. S. Roy",
      facility: "Bishalgarh CHC",
      district: "Sepahijala District",
      workerId: "MO-8841",
      role: "doctor",
    };
  });

  // Active view tab: "review" | "emergency" | "patients" | "analytics"
  const [activeTab, setActiveTab] = useState("review");

  // Patients & selection state
  const [patientsList, setPatientsList] = useState(() => getAllPatients());
  const [searchQuery, setSearchQuery] = useState(paramId || "");
  const [selectedPatientId, setSelectedPatientId] = useState(
    paramId || (patientsList[0] ? patientsList[0].id : "AV-8921")
  );

  // Clinical Review Form State
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [registryFilter, setRegistryFilter] = useState("all");
  const [registrySearch, setRegistrySearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Reload patient list on mount or paramId change
  useEffect(() => {
    const list = getAllPatients();
    setPatientsList(list);
    if (paramId) {
      setSelectedPatientId(paramId);
      setSearchQuery(paramId);
      setActiveTab("review");
    }
  }, [paramId]);

  // Selected Patient Record
  const currentPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || patientsList[0] || null;
  }, [selectedPatientId, patientsList]);

  // Pre-fill doctor notes & Rx for the active patient
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

  // Emergency red flag patient count
  const emergencyPatients = useMemo(() => {
    return patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    );
  }, [patientsList]);

  // Filtered Registry list
  const filteredRegistry = useMemo(() => {
    let result = [...patientsList];
    if (registryFilter === "critical") {
      result = result.filter(
        (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
      );
    } else if (registryFilter === "pending") {
      result = result.filter((p) => p.status !== "Reviewed");
    } else if (registryFilter === "reviewed") {
      result = result.filter((p) => p.status === "Reviewed");
    }

    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.village?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      );
    }
    return result;
  }, [patientsList, registryFilter, registrySearch]);

  // Explicit Doctor Sign Out
  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    navigate("/");
  };

  // Switch to review of a specific patient
  const handleOpenPatientReview = (id) => {
    setSelectedPatientId(id);
    setSearchQuery(id);
    setActiveTab("review");
  };

  // Quick append medicine to prescription
  const handleAddMed = (medText) => {
    setPrescription((prev) => (prev ? `${prev}, ${medText}` : medText));
  };

  // Audio summary read-back to the doctor
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

  // Save Doctor review & prescription
  const handleSaveReview = () => {
    if (!currentPatient) return;

    updatePatientReview(currentPatient.id, {
      doctorName: doctorProfile.userName || "Dr. S. Roy (Medical Officer)",
      notes: doctorNotes,
      prescription: prescription,
    });

    const refreshed = getAllPatients();
    setPatientsList(refreshed);

    setToastMessage(`Prescription & Review saved for ${currentPatient.name} (${currentPatient.id})`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Mock ABDM Force Sync
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setToastMessage("ABDM cloud synchronization complete. 28 records verified.");
      setTimeout(() => setToastMessage(""), 3500);
    }, 1000);
  };

  const isUrgent =
    currentPatient?.triage === "Critical Red Flag" ||
    currentPatient?.status === "Urgent";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900 pb-12">
      {/* 1. Indian Tricolor Micro Stripe */}
      <div className="gov-tricolor-bar" />

      {/* 2. Unified Doctor Clinical Header */}
      <header className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Brand & Clinic Status */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                    Aarogya<span className="text-blue-700">Vaani</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60">
                    Doctor Portal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                  <span>{doctorProfile.facility || "Bishalgarh CHC"}</span>
                  <span className="text-slate-300">•</span>
                  <span>{doctorProfile.district || "Sepahijala District"}</span>
                </div>
              </div>
            </div>

            {/* Mobile Sign Out button */}
            <button
              onClick={handleSignOut}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Center Tabs: 4 In-Page Views */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("review")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "review"
                  ? "bg-white text-blue-900 shadow-xs border border-blue-600/20 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
              <span>Clinical Review & Rx</span>
            </button>

            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "emergency"
                  ? "bg-white text-rose-900 shadow-xs border border-rose-600/20 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency Queue</span>
              {emergencyPatients.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {emergencyPatients.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "patients"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-300 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UsersRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Patient Registry</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({patientsList.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-white text-teal-900 shadow-xs border border-teal-600/20 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>OPD Stats & ABDM</span>
            </button>
          </nav>

          {/* Right: Doctor Identity & Clean Sign Out */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                {(doctorProfile.userName || "D")[0]}
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  {doctorProfile.userName || "Dr. S. Roy"}
                </span>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {doctorProfile.workerId || "MO-8841"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Sign Out of Doctor Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Workstation Body */}
      <main className="flex-1 max-w-[1720px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* =========================================================================
            TAB 1: CLINICAL REVIEW & PRESCRIPTION (CONSULTATION DESK)
            ========================================================================= */}
        {activeTab === "review" && (
          <div className="space-y-6">
            {/* Quick Patient Selector Bar */}
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
                        onClick={() => handleOpenPatientReview(p.id)}
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

              {/* Patient Lookup Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const match = getPatientById(searchQuery.trim().toUpperCase());
                      if (match) {
                        setSelectedPatientId(match.id);
                        setToastMessage(`Loaded patient ${match.id}`);
                        setTimeout(() => setToastMessage(""), 2500);
                      }
                    }
                  }}
                  placeholder="Jump to Patient ID (e.g. AV-9012)"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 2-Column Clinical Desk Layout */}
            {currentPatient ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (7 cols): Patient Case Data */}
                <div className="lg:col-span-7 space-y-5">
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
                            {currentPatient.age} yrs • {currentPatient.gender} • {currentPatient.village}
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

                  {/* Chief Complaint & AI Clinical Impression */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                        Reported Chief Complaint:
                      </span>
                      <p className="text-xs font-bold text-slate-900 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 italic leading-relaxed">
                        "{currentPatient.chiefComplaint}"
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
                  </div>
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
                            onClick={() => handleOpenPatientReview(p.id)}
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
          </div>
        )}

        {/* =========================================================================
            TAB 2: EMERGENCY RED FLAG QUEUE
            ========================================================================= */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-rose-950">
                    Emergency Red Flag Triage Queue
                  </h2>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Patients flagged with immediate danger signs like severe preeclampsia, high fever, or distress.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs">
                {emergencyPatients.length} Cases Requiring Action
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {emergencyPatients.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-3xl border-2 border-rose-200/80 shadow-sm space-y-4 hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                          {p.id}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          Critical Alert
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.age} yrs • {p.gender} • {p.village} • Phone: {p.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Blood Pressure
                      </span>
                      <span className="text-sm font-black text-rose-600 block">
                        {p.vitals?.bp || "High"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 text-xs">
                    <span className="text-[10px] font-black uppercase text-rose-700 block mb-1">
                      Chief Danger Symptoms:
                    </span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      "{p.chiefComplaint}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPatientReview(p.id)}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Review in Clinical Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`tel:${p.phone}`}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Call Patient</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMPLETE PATIENT REGISTRY TABLE
            ========================================================================= */}
        {activeTab === "patients" && (
          <div className="space-y-5">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRegistryFilter("all")}
                    className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                      registryFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    All ({patientsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistryFilter("critical")}
                    className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                      registryFilter === "critical"
                        ? "bg-rose-600 text-white shadow-2xs font-bold"
                        : "text-slate-600 hover:text-rose-700"
                    }`}
                  >
                    Critical ({emergencyPatients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistryFilter("pending")}
                    className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                      registryFilter === "pending" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistryFilter("reviewed")}
                    className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                      registryFilter === "reviewed" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    Reviewed
                  </button>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  placeholder="Search name, village, ID..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Patient ID</th>
                      <th className="py-3 px-4">Name & Demographics</th>
                      <th className="py-3 px-4">Village / Location</th>
                      <th className="py-3 px-4">Chief Complaint</th>
                      <th className="py-3 px-4">Triage Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistry.map((p) => {
                      const isFlagged = p.triage === "Critical Red Flag";
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                            {p.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{p.name}</div>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {p.age} yrs • {p.gender}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {p.village}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                            {p.chiefComplaint}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isFlagged
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {p.triage}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                p.status === "Reviewed"
                                  ? "bg-emerald-100 text-emerald-800 font-black"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {p.status === "Reviewed" ? "Reviewed ✓" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenPatientReview(p.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: OPD ANALYTICS & ABDM STATUS
            ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Patients Today
                </span>
                <span className="text-3xl font-black text-slate-900 block mt-1">
                  {patientsList.length}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                  Live Primary Care Intake
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Critical Red Flags
                </span>
                <span className="text-3xl font-black text-rose-600 block mt-1">
                  {emergencyPatients.length}
                </span>
                <span className="text-[11px] text-rose-700 font-bold mt-1 block">
                  Immediate triage required
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prescriptions Issued
                </span>
                <span className="text-3xl font-black text-blue-700 block mt-1">
                  {patientsList.filter((p) => p.status === "Reviewed").length}
                </span>
                <span className="text-[11px] text-blue-700 font-bold mt-1 block">
                  Reviewed & signed off
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ABDM Cloud Sync
                </span>
                <span className="text-xl font-black text-emerald-800 block mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Synchronized</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                  DPDP Act 2023 Compliant
                </span>
              </div>
            </div>

            {/* Health Center Facility Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Ayushman Bharat Health Centre Facility Node
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    National Health Mission (NHM) • Electronic Health Record (EHR) Hub
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing ABDM Cloud..." : "Force Sync Cloud Records"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Facility Name</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{doctorProfile.facility}</strong>
                  <span className="text-slate-500 text-[11px]">Primary Health Care Facility</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">District Jurisdiction</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{doctorProfile.district}</strong>
                  <span className="text-slate-500 text-[11px]">State Health Administration</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Medical Officer</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{doctorProfile.userName}</strong>
                  <span className="text-slate-500 text-[11px]">ID: {doctorProfile.workerId}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}