import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bot,
  Mic,
  MicOff,
  Send,
  FileText,
  Clock,
  Share2,
  Upload,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Pill,
  Heart,
  ChevronRight,
  X,
  Copy,
  ExternalLink,
  Lock,
  Eye,
  LogOut,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Building2,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import LiveVoiceAssistant from "../../components/LiveVoiceAssistant";
import UniversalNavbar from "../../components/UniversalNavbar";
import {
  getCurrentPatient,
  getPatientDocuments,
  addPatientDocument,
  savePatient,
} from "../../utils/patientStore";
import { updatePatient } from "../../services/api";
import {
  getAccessCodes,
  generateTemporaryCode,
  revokeAccessCode,
  getAuditLogs,
} from "../../utils/accessCodeStore";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // Active User Profile
  const [patient, setPatient] = useState(() => getCurrentPatient());
  const [documents, setDocuments] = useState(() => getPatientDocuments(patient?.id || patient?.patient_ref));
  const [accessCodes, setAccessCodes] = useState(() => getAccessCodes());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(patient?.name || "");
  const [editAge, setEditAge] = useState(patient?.age || "28");
  const [editGender, setEditGender] = useState(patient?.gender || "Female");
  const [editDistrict, setEditDistrict] = useState(patient?.district || patient?.village || "West District");
  const [editPhone, setEditPhone] = useState(patient?.phone || "");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Sync profile on mount
  useEffect(() => {
    const cur = getCurrentPatient();
    setPatient(cur);
    setEditName(cur?.name || "");
    setEditAge(cur?.age || "28");
    setEditGender(cur?.gender || "Female");
    setEditDistrict(cur?.district || cur?.village || "West District");
    setEditPhone(cur?.phone || "");
    setDocuments(getPatientDocuments(cur?.id || cur?.patient_ref));
  }, []);

  // Active Modals: "none" | "ai-assistant" | "health-records" | "consultations" | "share-doctor" | "upload-docs" | "profile-privacy"
  const [activeModal, setActiveModal] = useState("none");

  // Temporary Sharing Code Generation State
  const [shareScope, setShareScope] = useState({
    currentVisit: true,
    selectedReports: true,
    medicalHistory: false,
  });
  const [shareDuration, setShareDuration] = useState(30);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: "ai-welcome",
      sender: "ai",
      text: "Namaste! I am your AarogyaVaani AI Health Assistant. How are you feeling today? You can describe any symptoms, pain, fever, or questions you have.",
      time: "Just now",
      suggestions: [
        "I have a mild frontal headache and fatigue",
        "Feeling dizzy and nauseous in the morning",
        "High fever with shivering since yesterday",
        "Routine pregnancy symptom checkup"
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [dangerDetected, setDangerDetected] = useState(null);
  const [summarySaved, setSummarySaved] = useState(false);

  // Document Upload State
  const [uploadCategory, setUploadCategory] = useState("Prescription");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFacility, setUploadFacility] = useState("Community Health Centre");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Profile Drawer Consent Settings
  const [aiConsent, setAiConsent] = useState(true);
  const [doctorShareConsent, setDoctorShareConsent] = useState(true);
  const [dataRetentionConsent, setDataRetentionConsent] = useState(true);

  // Refresh lists on interval or modal toggle
  useEffect(() => {
    const interval = setInterval(() => {
      setAccessCodes(getAccessCodes());
      setAuditLogs(getAuditLogs());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeCodesList = useMemo(() => {
    return accessCodes.filter((c) => c.status === "ACTIVE");
  }, [accessCodes]);

  const activeCodeObj = activeCodesList[0] || null;

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    navigate("/login?role=patient");
  };

  // Handle Save Edited Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!editName.trim()) return;

    const patId = patient?.patient_ref || patient?.id;
    const updated = {
      ...patient,
      name: editName.trim(),
      userName: editName.trim(),
      age: editAge.trim() || patient?.age || "28",
      gender: editGender || patient?.gender || "Female",
      district: editDistrict.trim() || patient?.district || "Tripura",
      village: editDistrict.trim() || patient?.village || "Tripura",
      phone: editPhone.trim() || patient?.phone || "",
    };

    setPatient(updated);
    savePatient(updated);

    try {
      if (patId) {
        await updatePatient(patId, {
          name: editName.trim(),
          age: editAge.trim(),
          gender: editGender,
          village: editDistrict.trim(),
          phone: editPhone.trim(),
        });
      }
    } catch (err) {
      console.warn("[UPDATE_PATIENT_API_WARN]", err);
    }

    setProfileSuccessMsg("Profile details updated successfully!");
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // AI Assistant Handler
  const handleSendMessage = (textToSend) => {
    const msg = (textToSend || inputText).trim();
    if (!msg) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAiIsTyping(true);

    // Adaptive reasoning & Danger check
    setTimeout(() => {
      let replyText = "";
      let flagged = null;

      const lower = msg.toLowerCase();
      if (
        lower.includes("chest pain") ||
        lower.includes("cannot breathe") ||
        lower.includes("bleeding") ||
        (lower.includes("severe headache") && lower.includes("vision"))
      ) {
        flagged = "CRITICAL RED FLAG: High risk symptom detected. Immediate clinician evaluation required.";
        replyText = "I have detected potentially urgent warning signs. Please visit your nearest Primary Health Centre or emergency department immediately. I have prioritized this alert in your clinical summary for the doctor.";
      } else if (lower.includes("headache") || lower.includes("tired") || lower.includes("fatigue")) {
        replyText = "Thank you for noting this. Frontal headache and fatigue can be related to hydration, stress, or mild gestational anemia. How long have you experienced this? Have you taken your prescribed Iron & Folic Acid tablet today?";
      } else if (lower.includes("fever") || lower.includes("shiver")) {
        replyText = "Understood. Has the fever been continuous or coming in spikes, and do you experience body chills? Please stay well hydrated while we prepare these notes for your doctor's review.";
      } else {
        replyText = "Thank you. I have recorded your symptoms carefully. When did you first notice this, and does rest or drinking water provide any relief?";
      }

      setDangerDetected(flagged);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isUrgent: !!flagged
        }
      ]);
      setAiIsTyping(false);
    }, 900);
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate voice speech detection
      setTimeout(() => {
        setIsRecording(false);
        handleSendMessage("I have had a mild frontal headache and dizziness since yesterday morning.");
      }, 2500);
    }
  };

  const handleSaveConsultationSummary = () => {
    setSummarySaved(true);
    setTimeout(() => {
      setActiveModal("consultations");
      setSummarySaved(false);
    }, 1200);
  };

  // Generate Temporary Access Code
  const handleGenerateCode = () => {
    const newCode = generateTemporaryCode({
      patientId: patient.id,
      patientName: patient.name,
      durationMinutes: parseInt(shareDuration, 10),
      scope: shareScope,
    });
    setGeneratedCode(newCode);
    setAccessCodes(getAccessCodes());
    setAuditLogs(getAuditLogs());
  };

  const handleRevoke = (code) => {
    revokeAccessCode(code);
    setAccessCodes(getAccessCodes());
    setAuditLogs(getAuditLogs());
    if (generatedCode?.code === code) {
      setGeneratedCode(null);
    }
  };

  const handleCopyCode = (codeStr) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Upload Document Handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc = addPatientDocument({
        patientId: patient.id,
        title: uploadTitle,
        fileName: uploadFileName || `${uploadTitle.replace(/\s+/g, "_")}.pdf`,
        category: uploadCategory,
        facility: uploadFacility,
        fileSize: "1.2 MB",
        verified: true,
      });
      setDocuments(getPatientDocuments(patient.id));
      setIsUploading(false);
      setUploadSuccess(true);
      setUploadTitle("");
      setUploadFileName("");
      setTimeout(() => setUploadSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Universal Consistent Navigation Bar */}
      <UniversalNavbar />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* ========================================================
            PAGE HEADER & WELCOME TITLE (Single clean header)
            ======================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                  ID: {patient.patient_ref || patient.id || "AV-2026"}
                </span>
                {patient.gender && (
                  <span className="text-[11px] font-bold text-slate-500">
                    • {patient.age ? `${patient.age} Yrs` : ""} {patient.gender}
                  </span>
                )}
                {patient.district && (
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    • {patient.district}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Namaste, {patient.name || "Patient"}
              </h1>
              <p className="text-base sm:text-lg font-bold text-slate-700 mt-1">
                How can we help you today?
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Your personal health companion • Speak your symptoms, view health records, or share with your doctor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditName(patient.name || "");
                  setEditAge(patient.age || "28");
                  setEditGender(patient.gender || "Female");
                  setEditDistrict(patient.district || patient.village || "Tripura");
                  setEditPhone(patient.phone || "");
                  setActiveModal("profile-privacy");
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>My Profile & ID</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              GRID OF 4 MULTI-COLORED MATERIALISTIC CARDS (2x2 on Mobile, 4-Cols on Desktop)
              ======================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            
            {/* BUTTON 1: TALK TO AI DOCTOR (EMERALD / MINT MATERIAL CARD) */}
            <div
              onClick={() => navigate("/patient/ai-doctor")}
              className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border-2 border-emerald-300/80 shadow-[0_4px_16px_rgba(16,185,129,0.08)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.22)] hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer group min-h-[145px] sm:min-h-[175px] lg:min-h-[205px]"
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-center ring-2 sm:ring-4 ring-emerald-200/70 group-hover:scale-105 transition-transform mb-2 sm:mb-3">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                <h3 className="text-xs sm:text-base lg:text-lg font-black text-emerald-950 tracking-tight group-hover:text-emerald-700 transition-colors leading-tight">
                  Talk to AI Doctor
                </h3>
                <p className="text-[10px] sm:text-xs text-emerald-900/80 font-medium mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                  Voice & text symptom check, danger triage, and care guidance.
                </p>
              </div>

              <div className="w-full mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-emerald-200/80 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black text-emerald-900 group-hover:text-emerald-950">
                <span>Start Consultation</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BUTTON 2: MY CONSULTATIONS (ROYAL BLUE / SKY MATERIAL CARD) */}
            <div
              onClick={() => navigate("/patient/consultations")}
              className="bg-gradient-to-br from-blue-50 via-sky-50/70 to-indigo-100/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border-2 border-blue-300/80 shadow-[0_4px_16px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.22)] hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer group min-h-[145px] sm:min-h-[175px] lg:min-h-[205px]"
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-blue-600 text-white shadow-md flex items-center justify-center ring-2 sm:ring-4 ring-blue-200/70 group-hover:scale-105 transition-transform mb-2 sm:mb-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                <h3 className="text-xs sm:text-base lg:text-lg font-black text-blue-950 tracking-tight group-hover:text-blue-700 transition-colors leading-tight">
                  My Consultations
                </h3>
                <p className="text-[10px] sm:text-xs text-blue-900/80 font-medium mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                  Past and ongoing visits, clinic timeline, and doctor notes.
                </p>
              </div>

              <div className="w-full mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-blue-200/80 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black text-blue-900 group-hover:text-blue-950">
                <span>View Timeline</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BUTTON 3: SHARE WITH DOCTOR (WARM AMBER / CORAL MATERIAL CARD) */}
            <div
              onClick={() => navigate("/patient/share")}
              className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border-2 border-amber-300/80 shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer group min-h-[145px] sm:min-h-[175px] lg:min-h-[205px]"
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-center ring-2 sm:ring-4 ring-amber-200/70 group-hover:scale-105 transition-transform mb-2 sm:mb-3">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                <h3 className="text-xs sm:text-base lg:text-lg font-black text-amber-950 tracking-tight group-hover:text-amber-700 transition-colors leading-tight">
                  Share with Doctor
                </h3>
                <p className="text-[10px] sm:text-xs text-amber-900/80 font-medium mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                  Temporary access codes. Scoped, expiring, and revokable.
                </p>
              </div>

              <div className="w-full mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-amber-200/80 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black text-amber-950 group-hover:text-amber-900">
                <span>Share Code</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BUTTON 4: UPLOAD MEDICAL DOCUMENTS (PURPLE / VIOLET MATERIAL CARD) */}
            <div
              onClick={() => navigate("/patient/documents")}
              className="bg-gradient-to-br from-purple-50 via-violet-50/70 to-fuchsia-100/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border-2 border-purple-300/80 shadow-[0_4px_16px_rgba(147,51,234,0.08)] hover:shadow-[0_12px_28px_rgba(147,51,234,0.22)] hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer group min-h-[145px] sm:min-h-[175px] lg:min-h-[205px]"
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-purple-600 text-white shadow-md flex items-center justify-center ring-2 sm:ring-4 ring-purple-200/70 group-hover:scale-105 transition-transform mb-2 sm:mb-3">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                <h3 className="text-xs sm:text-base lg:text-lg font-black text-purple-950 tracking-tight group-hover:text-purple-700 transition-colors leading-tight">
                  Upload Documents
                </h3>
                <p className="text-[10px] sm:text-xs text-purple-900/80 font-medium mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                  Prescriptions, lab reports, MCP cards, and medical scans.
                </p>
              </div>

              <div className="w-full mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-purple-200/80 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black text-purple-950 group-hover:text-purple-900">
                <span>Upload & View</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            QUICK STATUS SUMMARY SECTION
            ======================================================== */}
        <section>
          
          {/* Active Consultation Snapshot (Luminous Mint/Slate Material Surface) */}
          <div className="w-full bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 rounded-3xl p-6 border-2 border-emerald-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Current Consultation Status
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Real-time clinical review status
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300/80 shadow-2xs">
                {patient.status || (patient.chiefComplaint ? "Reviewed" : "Active")}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-2xs space-y-1.5">
              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Stated Complaint</p>
              <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                {patient.chiefComplaint ||
                  "No active symptom intake recorded yet. You can speak to your AI Health Assistant or visit your nearest primary health center to begin."}
              </p>
            </div>

            {patient.doctorReview && patient.doctorReview.notes ? (
              <div className="p-4 rounded-2xl bg-emerald-100/60 border-2 border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Doctor's Assessment & Signed Plan
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {patient.doctorReview.doctorName}
                  </span>
                </div>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {patient.doctorReview.notes}
                </p>
                <div className="pt-2 border-t border-emerald-300/80 flex items-center gap-2 text-xs font-mono font-black text-emerald-950">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Rx: {patient.doctorReview.prescription}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/70 border border-emerald-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Clinical Status: New Patient Intake • No pending doctor prescriptions</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/patient/ai-doctor")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Start AI Consultation</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Floating AI Health Assistant Trigger */}
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
          <button
            type="button"
            onClick={() => navigate("/patient/ai-doctor")}
            className="bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-[0_8px_25px_rgba(11,102,81,0.38)] hover:shadow-2xl flex items-center gap-2 sm:gap-2.5 font-black text-xs sm:text-sm cursor-pointer border-2 border-emerald-400/50 active:scale-95 transition-all group"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            </div>
            <span className="hidden xs:inline">Talk to AI Doctor</span>
            <span className="xs:hidden">AI Doctor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

      </main>

      {/* ========================================================
          MODAL 1: TALK TO AI HEALTH ASSISTANT (Voice & Chat)
          ======================================================== */}
      {activeModal === "ai-assistant" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full h-full sm:max-w-3xl sm:h-[92vh] sm:max-h-[850px] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
            <LiveVoiceAssistant
              onClose={() => setActiveModal("none")}
              patientName={patient?.name || "Patient"}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: MY HEALTH RECORDS
          ======================================================== */}
      {activeModal === "health-records" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full h-[90vh] max-h-[720px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    My Health Records
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Permanent health history, medications, allergies, and vitals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Vitals Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
                  <span className="text-base font-black text-slate-900">{patient.vitals?.bp || "118/76 mmHg"}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Group</span>
                  <span className="text-base font-black text-slate-900">{patient.bloodGroup || "B+ Rh Positive"}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Hemoglobin</span>
                  <span className="text-base font-black text-slate-900">{patient.vitals?.hb || "10.4 g/dL"}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fetal Heart Rate</span>
                  <span className="text-base font-black text-slate-900">{patient.vitals?.fetalHeartRate || "142 bpm"}</span>
                </div>
              </div>

              {/* Current Active Medications */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#0b6651]" />
                  <span>Current Active Medications</span>
                </h4>
                <div className="space-y-2">
                  {(patient.currentMedications || []).map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-bold text-emerald-950 block">{med.name}</span>
                        <span className="text-xs text-emerald-700 font-medium">{med.dose} • {med.purpose}</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Allergies & Sensitivities */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Allergies & Adverse Reactions</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(patient.allergies || []).map((alg, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold"
                    >
                      {alg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span>Ongoing Conditions & Health Background</span>
                </h4>
                <div className="space-y-2">
                  {(patient.chronicConditions || []).map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {cond}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prior Clinical History */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Previous Hospital Encounters</span>
                </h4>
                <div className="space-y-2">
                  {(patient.priorVisits || []).map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{v.type} ({v.date})</span>
                        <span className="text-slate-500 font-medium">{v.facility}</span>
                      </div>
                      <p className="text-xs text-slate-600">{v.summary}</p>
                      <span className="text-[11px] font-mono font-bold text-emerald-800 block pt-1">
                        Rx: {v.prescription}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: MY CONSULTATIONS
          ======================================================== */}
      {activeModal === "consultations" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] max-h-[700px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-blue-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    My Consultations
                  </h3>
                  <p className="text-xs text-blue-200 font-medium">
                    Visit timeline, doctor prescriptions, and clinical reviews
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
              {/* Current Active Visit */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">Current Visit Intake</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    {patient.status || "Reviewed"}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <p className="font-bold text-slate-900">Chief Complaint:</p>
                  <p className="leading-relaxed">{patient.chiefComplaint}</p>
                </div>

                {patient.doctorReview && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Doctor Review Notes</span>
                      <span>{patient.doctorReview.reviewedAt}</span>
                    </div>
                    <p className="text-xs text-emerald-950">{patient.doctorReview.notes}</p>
                    <p className="text-xs font-mono font-bold text-[#0b6651] pt-1">
                      Prescription: {patient.doctorReview.prescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Past Visits Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Past Visits History
                </h4>
                {(patient.priorVisits || []).map((visit, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{visit.type}</span>
                      <span className="text-slate-400 font-semibold">{visit.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{visit.summary}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Attending: {visit.doctor}</span>
                      <span className="font-bold text-emerald-800">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: SHARE WITH DOCTOR (Temporary Passcode & Audit)
          ======================================================== */}
      {activeModal === "share-doctor" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] max-h-[720px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-amber-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Share Records with Doctor
                  </h3>
                  <p className="text-xs text-amber-200 font-medium">
                    Temporary access code • Granular scopes • Instant revocation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* How it works info */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  How secure sharing works:
                </p>
                <p className="text-amber-900 leading-relaxed">
                  Generate a random 8-character passcode (e.g. <strong>AV-7K4P-92</strong>). Give this code to your doctor. They can view only the scopes you approve, and access automatically expires.
                </p>
              </div>

              {/* Code Generator Form */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  1. Choose Information Scope
                </h4>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareScope.currentVisit}
                      onChange={(e) => setShareScope({ ...shareScope, currentVisit: e.target.checked })}
                      className="w-4 h-4 text-[#0b6651] rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Share current consultation & AI summary
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareScope.selectedReports}
                      onChange={(e) => setShareScope({ ...shareScope, selectedReports: e.target.checked })}
                      className="w-4 h-4 text-[#0b6651] rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Share uploaded medical reports & prescriptions
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareScope.medicalHistory}
                      onChange={(e) => setShareScope({ ...shareScope, medicalHistory: e.target.checked })}
                      className="w-4 h-4 text-[#0b6651] rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Share entire past medical history & prior visits
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    2. Expiration Duration
                  </label>
                  <select
                    value={shareDuration}
                    onChange={(e) => setShareDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={15}>15 Minutes (Single consultation)</option>
                    <option value={30}>30 Minutes (Recommended)</option>
                    <option value={60}>1 Hour (Extended clinic wait)</option>
                    <option value={120}>2 Hours (Hospital referral)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="w-full py-3 px-4 rounded-xl bg-[#0b6651] hover:bg-[#084e3e] text-white text-xs sm:text-sm font-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Generate Temporary Access Code</span>
                </button>
              </div>

              {/* Active Codes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Active Sharing Permissions
                </h4>

                {accessCodes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No active sharing codes generated yet.</p>
                ) : (
                  <div className="space-y-3">
                    {accessCodes.map((codeObj) => (
                      <div
                        key={codeObj.code}
                        className={`p-4 rounded-2xl border transition-all ${
                          codeObj.status === "ACTIVE"
                            ? "bg-emerald-50/70 border-emerald-300"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black font-mono tracking-wider text-slate-900">
                              {codeObj.code}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                codeObj.status === "ACTIVE"
                                  ? "bg-emerald-200 text-emerald-900"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {codeObj.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {codeObj.status === "ACTIVE" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(codeObj.code)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(codeObj.code)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all cursor-pointer"
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                          <span>Expires: {new Date(codeObj.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>Duration: {codeObj.durationMinutes}m</span>
                          <span>Accessed: {codeObj.doctorAccessCount} times</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Log Trail */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Access History & Audit Log</span>
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {auditLogs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{log.accessorName} ({log.accessorRole})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: UPLOAD MEDICAL DOCUMENTS
          ======================================================== */}
      {activeModal === "upload-docs" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] max-h-[700px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-teal-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Upload Medical Documents
                  </h3>
                  <p className="text-xs text-teal-200 font-medium">
                    Store prescriptions, lab panels, and hospital discharge summaries
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Upload Form */}
              <form onSubmit={handleUploadSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Upload New Medical File
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Prescription">Doctor Prescription Slip</option>
                    <option value="Lab Report">Diagnostic / Lab Blood Report</option>
                    <option value="Immunization & ANC">Tripura MCP Mother & Child Protection Card</option>
                    <option value="Discharge Summary">Hospital Discharge Certificate</option>
                    <option value="Medical Image">Radiology / Ultrasound / X-Ray</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Ultrasound Scan Trimester 2"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Dropzone mock */}
                <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click or drag PDF, JPG, PNG here</p>
                  <p className="text-[11px] text-slate-400 mt-1">Up to 15 MB • Encrypted before save</p>
                  <input
                    type="file"
                    className="hidden"
                    id="doc-file-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFileName(e.target.files[0].name);
                        if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                  />
                  <label htmlFor="doc-file-input" className="mt-3 inline-block px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                    Browse File
                  </label>
                  {uploadFileName && (
                    <p className="text-xs font-bold text-teal-800 mt-2">Selected: {uploadFileName}</p>
                  )}
                </div>

                {uploadSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>File uploaded successfully and verified!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? "Uploading file..." : "Save Medical Document"}
                </button>
              </form>

              {/* Stored Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Available Documents ({documents.length})
                </h4>
                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block">{doc.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                          <span className="text-teal-700">{doc.category}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: MY PROFILE & PRIVACY (Slide-over drawer)
          ======================================================== */}
      {activeModal === "profile-privacy" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">
                  {(patient.name || "P")[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Profile & Privacy Settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Success Banner */}
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Personal Details & Edit Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Personal Demographics
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Patient Ref: {patient.patient_ref || patient.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Gender
                        </label>
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651]"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        District / Area
                      </label>
                      <input
                        type="text"
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651]"
                      />
                    </div>

                    <div className="pt-1 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-[#0b6651] hover:bg-[#084e3e] text-white text-xs font-black shadow-xs cursor-pointer transition-colors"
                      >
                        Save Profile Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Mobile Number</span>
                      <span className="font-bold text-slate-900">{patient.phone}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Age & Gender</span>
                      <span className="font-bold text-slate-900">{patient.age} Yrs • {patient.gender}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">District / Health Center</span>
                      <span className="font-bold text-slate-900">
                        {patient.district || patient.village || "West District"}
                      </span>
                    </div>
                    {patient.emergencyContact && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold block">Emergency Contact</span>
                        <span className="font-bold text-slate-900">
                          {patient.emergencyContact.name} ({patient.emergencyContact.phone})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Privacy & Consent Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Privacy & DPDP Act Controls</span>
                </h4>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">AI Symptom Assistant Consent</span>
                      <span className="text-[10px] text-slate-500">Allow AI assistant to prepare consultation notes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiConsent}
                      onChange={(e) => setAiConsent(e.target.checked)}
                      className="w-4 h-4 text-[#0b6651] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Doctor Passcode Sharing</span>
                      <span className="text-[10px] text-slate-500">Enable temporary code-based authorization</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={doctorShareConsent}
                      onChange={(e) => setDoctorShareConsent(e.target.checked)}
                      className="w-4 h-4 text-[#0b6651] rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out of Patient Account</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
