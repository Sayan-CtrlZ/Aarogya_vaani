import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Mic,
  Clock,
  ShieldAlert,
  Stethoscope,
  Upload,
  Folder,
  FileText,
  PhoneCall,
  Calendar,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ChevronRight,
  Heart,
  Pill,
  Download,
  Eye,
  Activity,
  Flame,
  User,
  X,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient, getPatientDocuments } from "../../utils/patientStore";
import { fetchPatientDocuments, getPatientConsultations } from "../../services/api";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(() => getCurrentPatient() || {});
  const patientName = patient?.name || "Mamta Debbarma";
  const patientRef = patient?.patient_ref || patient?.id || "AV-2026-8921";

  // Dynamic live metric state
  const [docCount, setDocCount] = useState(3);
  const [consultCount, setConsultCount] = useState(2);
  const [pendingCount, setPendingCount] = useState(0);

  // Sidebar drag & resize state
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [previewingDoc, setPreviewingDoc] = useState(null);

  // Sync latest patient data & documents from store
  useEffect(() => {
    const syncData = () => {
      const p = getCurrentPatient();
      if (p) setPatient(p);
    };
    syncData();
    window.addEventListener("aarogya_patient_updated", syncData);
    window.addEventListener("storage", syncData);
    return () => {
      window.removeEventListener("aarogya_patient_updated", syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  const documents = getPatientDocuments(patientRef);
  const hasDoctorReview = !!(patient?.doctorReview && (patient.doctorReview.notes || patient.doctorReview.prescription));
  const latestReview = patient?.doctorReview || null;

  // Mouse drag tracking for resizing sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.min(420, Math.max(180, e.clientX));
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (isDraggingLeft) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingLeft]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    navigate("/patient/ai-doctor", {
      state: { initialPrompt: searchQuery || "" },
    });
  };

  const handleVoiceSearch = () => {
    navigate("/patient/ai-doctor", {
      state: { autoStartVoice: true },
    });
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER: SIDEBAR + MAIN */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="dashboard"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* RESIZER HANDLE */}
        {!isCollapsed && (
          <div
            onMouseDown={() => setIsDraggingLeft(true)}
            onDoubleClick={() => setLeftWidth(240)}
            className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
            title="Drag to resize sidebar (Double-click to reset)"
          />
        )}

        {/* 3. MAIN DASHBOARD OVERVIEW CONSOLE */}
        <main className="flex-1 h-full bg-[#f8fafc] overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-6 w-full max-w-6xl mx-auto">
            {/* Top Greeting & Ayushman Bharat Citizen Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
              <div>
                <p className="text-sm font-semibold text-slate-500">Welcome back,</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                  <span>{patientName}</span>
                  <span className="text-2xl">👋</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Universal Citizen Health Portal · NHM Ayushman Bharat
                </p>
              </div>

              {/* ABHA Universal Health Card Tag & Switch to Doctor Button */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-white border border-emerald-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#0b6651] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    AB
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
                      Ayushman Bharat ABHA ID
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-900">{patientRef}</p>
                    <p className="text-[10px] text-slate-500">Tripura Health Services</p>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Assistant Search / Ask Anything Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="border border-slate-200/90 hover:border-slate-300 rounded-2xl bg-white shadow-xs px-4 py-2.5 flex items-center gap-3 transition">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask AarogyaVaani about your symptoms, medications, or reports..."
                  className="flex-1 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-xl bg-[#0b6651] hover:bg-[#084e3e] text-white flex items-center justify-center shadow-2xs transition shrink-0 cursor-pointer"
                  title="Submit Query"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Talk to AI Doctor in Bengali / Hindi / English"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* ============================================================================== */}
            {/* CONNECTED DOCTOR REVIEW & ACTIVE PRESCRIPTION BANNER                          */}
            {/* ============================================================================== */}
            {hasDoctorReview && latestReview ? (
              <div className="bg-gradient-to-br from-white to-[#f0fbf5] rounded-3xl border border-emerald-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0b6651] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {latestReview.doctorName || "Dr. Sandeep Roy (Medical Officer)"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#e8f5e9] text-[#0b6651] border border-[#c8e6c9]">
                          Verified Review
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {latestReview.facility || "Bishalgarh Community Health Centre"} · {latestReview.reviewedAt || "Today"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSlipModal(true)}
                      className="px-3.5 py-1.5 bg-[#0b6651] hover:bg-[#084e3e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Prescription Slip</span>
                    </button>
                  </div>
                </div>

                {/* Doctor Notes Box */}
                {latestReview.notes && (
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Doctor's Clinical Advice & Observations:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      "{latestReview.notes}"
                    </p>
                  </div>
                )}

                {/* Active Prescribed Medicines Checklist */}
                {latestReview.prescriptionsList && latestReview.prescriptionsList.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Active Prescribed Medications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {latestReview.prescriptionsList.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0b6651] flex items-center justify-center shrink-0">
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate block">
                              {med.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">{med.dose}</p>
                            <span className="text-[9px] font-bold text-[#0b6651] bg-[#e8f5e9] px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {med.duration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          Dr. Sandeep Roy (Medical Officer)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          In Doctor Queue · Pending Review
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Bishalgarh Community Health Centre · OPD Queue Active
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>In OPD Queue for Doctor</span>
                  </div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Patient Intake Registered:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{patient?.nativeIntake || patient?.chiefComplaint || "General checkup and consultation pending."}"
                  </p>
                </div>
              </div>
            )}

            {/* Vitals Summary Strip (Dynamic & Personalized) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
                <strong className="text-sm font-black text-slate-900 block mt-0.5">
                  {patient?.vitals?.bp || "118/76 mmHg"}
                </strong>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {patient?.vitals?.bp?.startsWith("16") ? "Hypertensive Alert" : "Normal Range"}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Weight / Hb</span>
                <strong className="text-sm font-black text-slate-900 block mt-0.5">
                  {patient?.vitals?.weight || patient?.weight || "54 kg"} · {patient?.vitals?.hb || "11.2 g/dL"}
                </strong>
                <span className="text-[10px] text-emerald-700 font-semibold">Adequate Nutrition</span>
              </div>

              {patient?.pregnancy || patient?.vitals?.fetalHeartRate ? (
                <>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fetal Heart Rate</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {patient?.vitals?.fetalHeartRate || "142 bpm"}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Regular Heartbeat</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pregnancy Stage</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {patient?.pregnancyBadge || patient?.pregnancy || "2nd Trimester (20w)"}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">ANC Checkup Done</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pulse & SpO2</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {patient?.vitals?.pulse || "72 bpm"} · SpO2 {patient?.vitals?.spo2 || "98%"}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Stable Vitals</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Category</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5 truncate">
                      {patient?.category || "General OPD"}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {patient?.status || "In Queue"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Four Primary Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Feature 1: Talk to AI Doctor */}
              <div
                onClick={() => navigate("/patient/ai-doctor")}
                className="bg-white hover:bg-[#f0fbf5] border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] text-[#0b6651] flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-110 transition">
                  <Stethoscope className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">AI Doctor</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">Voice or text symptom check</p>
              </div>

              {/* Feature 2: Book Appointment */}
              <div
                onClick={() => navigate("/patient/appointments")}
                className="bg-white hover:bg-[#f0fbf5] border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-110 transition">
                  <Calendar className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Book Appointment</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">CHC / PHC OPD queue token</p>
              </div>

              {/* Feature 3: Share Health Records */}
              <div
                onClick={() => navigate("/patient/share")}
                className="bg-white hover:bg-[#faf5ff] border border-slate-200/90 hover:border-purple-300 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-110 transition">
                  <Share2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Share Records</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">Generate Doctor Access Passcode</p>
              </div>

              {/* Feature 4: View My Documents */}
              <div
                onClick={() => navigate("/patient/documents")}
                className="bg-white hover:bg-[#f0f9ff] border border-slate-200/90 hover:border-sky-300 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-110 transition">
                  <Folder className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">My Documents</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">Verified labs, prescriptions, scans</p>
              </div>
            </div>

            {/* Stored Health Records & Reports Vault Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#0b6651]" />
                    <span>My Clinical Documents Vault ({documents.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Synchronized with Dr. Sandeep Roy's clinical desk at Bishalgarh CHC
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/patient/documents")}
                  className="text-xs font-bold text-[#0b6651] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex flex-col justify-between space-y-2 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {doc.category || "Report"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">{doc.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 mt-1 truncate block">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{doc.fileName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold">{doc.pages || "1 page"}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewingDoc(doc)}
                        className="px-2.5 py-1 text-xs font-bold text-[#0b6651] hover:bg-[#e8f5e9] rounded-lg transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Educational / Certification Disclaimer Banner */}
          <div className="mt-6 max-w-6xl mx-auto w-full bg-[#fefaf3] border border-amber-200/60 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-amber-900 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                AarogyaVaani is operated under National Health Mission, Government of Tripura. In case of acute distress, visit Bishalgarh CHC or call 108.
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 text-[11px] font-semibold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NHM Certified</span>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================================== */}
      {/* MODAL 1: OFFICIAL PRESCRIPTION SLIP                                            */}
      {/* ============================================================================== */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#0b6651]" />
                <span>Official OPD Prescription Slip</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Slip Layout */}
            <div className="p-6 border-2 border-slate-300 rounded-2xl bg-white space-y-4 font-sans text-xs">
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

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 text-xs">
                <div>
                  <strong className="text-slate-900 block">{latestReview?.doctorName || "Dr. Sandeep Roy (Medical Officer)"}</strong>
                  <span className="text-slate-500">{latestReview?.facility || "Bishalgarh Community Health Centre"}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Reg. No: TR-MC-8921</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block">{patientName}</strong>
                  <span className="text-slate-600 font-mono">{patientRef}</span>
                  <span className="text-slate-500 block">
                    {patient?.age || "27"} yrs / {patient?.gender || "Female"} · Blood: {patient?.bloodGroup || "B+"}
                  </span>
                </div>
              </div>

              {/* Rx Medicines List */}
              <div className="space-y-2 pt-2">
                <span className="text-lg font-black text-[#0b6651] font-serif">℞</span>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-800">
                  {(latestReview?.prescriptionsList || [
                    { name: "Tab Iron Folic Acid (IFA)", dose: "1 tablet daily", duration: "x 30 days" },
                    { name: "Tab Calcium 500mg", dose: "1 tablet twice daily", duration: "x 30 days" },
                  ]).map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.name}</strong> — {item.dose} ({item.duration})
                    </li>
                  ))}
                </ol>
              </div>

              {/* Doctor Clinical Advice */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Clinical Advice:</span>
                <p className="text-xs text-slate-700 italic mt-0.5">
                  {latestReview?.notes || "Follow prescribed dosage, maintain hydration, and attend routine checkups."}
                </p>
              </div>

              <div className="pt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Date: {latestReview?.reviewedAt || "Today"}</span>
                  <div className="text-[9px] font-mono text-emerald-800 font-bold">ABHA Digitally Signed</div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-1 font-serif italic text-slate-800">
                    Dr. Sandeep Roy
                  </div>
                  <span className="text-[10px] text-slate-500">Medical Officer Signature</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowSlipModal(false);
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

      {/* ============================================================================== */}
      {/* MODAL 2: DOCUMENT PREVIEW MODAL                                                */}
      {/* ============================================================================== */}
      {previewingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">{previewingDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {previewingDoc.fileName} · {previewingDoc.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Image or Structured Preview */}
            {previewingDoc.previewImg ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                <img
                  src={previewingDoc.previewImg}
                  alt={previewingDoc.title}
                  className="max-h-72 object-contain rounded-xl"
                />
              </div>
            ) : previewingDoc.category === "Prescription" || previewingDoc.type === "prescription" ? (
              <div className="border-2 border-slate-200 rounded-2xl p-4 bg-[#fcfdfa] space-y-3 text-xs">
                <div className="text-center border-b border-slate-200 pb-2">
                  <p className="font-bold text-slate-900 uppercase">National Health Mission · Tripura</p>
                  <p className="text-[11px] text-slate-500">{previewingDoc.facility || "Bishalgarh Community Health Centre"}</p>
                </div>
                <div>
                  <span className="font-bold text-emerald-800 block mb-1">Prescribed Medicines:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {(latestReview?.prescriptionsList || [
                      { name: "Tab Iron Folic Acid (IFA)", dose: "1 tab daily", duration: "x 30 days" },
                      { name: "Tab Calcium 500mg", dose: "1 tab BD", duration: "x 30 days" },
                    ]).map((m, idx) => (
                      <li key={idx}>
                        <strong>{m.name}</strong> - {m.dose} ({m.duration})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <span>ABHA Verified Digital Prescription</span>
                  <span className="font-mono">Dr. Sandeep Roy (Medical Officer)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800">Facility: {previewingDoc.facility}</p>
                <p className="text-slate-600">Category: {previewingDoc.category}</p>
                <p className="text-slate-600">Verification: ABHA Verified Government Health Record</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewingDoc(null)}
                className="px-4 py-2 bg-[#0b6651] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
