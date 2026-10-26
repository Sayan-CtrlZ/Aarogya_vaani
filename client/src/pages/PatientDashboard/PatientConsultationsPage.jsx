import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Stethoscope,
  Activity,
  ChevronRight,
  Search,
  Plus,
  Mic,
  Calendar,
  Clock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  User,
  Printer,
  Download,
  X,
  Bot,
  Pill,
  Sparkles,
  ArrowRight,
  Filter,
  Share2,
  HeartPulse,
  Trash2,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient } from "../../utils/patientStore";
import { getPatientConsultations, deletePatientConsultation } from "../../services/api";

// Seeded real-world clinical consultations matching the user's reference mockup
const DEFAULT_CONSULTATIONS = [
  {
    id: "av-c-101",
    title: "Cough and Cold",
    chief_complaint: "Persistent dry cough, mild sore throat, and low-grade fever for 3 days",
    date: "12 Oct 2024",
    duration: "8 min",
    duration_seconds: 480,
    language: "Bengali",
    language_code: "bn-IN",
    triage_level: "STABLE",
    icon_type: "document", // blue document badge
    icon_bg: "bg-[#e0f2fe]",
    icon_color: "text-[#0284c7]",
    doctor_status: "REVIEWED",
    doctor_name: "Dr. S. Roy (Medical Officer, CHC)",
    doctor_facility: "Bishalgarh Community Health Centre",
    reviewed_at: "12 Oct 2024, 04:30 PM",
    clinical_summary:
      "Patient presented with 3-day history of non-productive cough and mild throat irritation. SpO2 and vitals stable. No shortness of breath or hemoptysis. Diagnosed as acute viral upper respiratory tract infection.",
    danger_signs: [],
    doctor_notes:
      "Upper respiratory tract viral infection. Chest clear on auscultation. Advised warm steam inhalation, hydration, and salt-water gargle. Paracetamol given for fever control.",
    prescription: [
      { name: "Tab. Paracetamol 500mg", dosage: "1 tablet thrice daily after meals", duration: "3 days" },
      { name: "Syp. Montair LC (5ml)", dosage: "1 teaspoon at bedtime", duration: "5 days" },
      { name: "Saline Nasal Drops", dosage: "2 drops in each nostril", duration: "As needed" },
    ],
    transcript: [
      {
        role: "user",
        text: "আমার তিন দিন ধরে শুকনো কাশি আর হালকা জ্বর আসছে। গলায়ও ব্যথা করছে।",
        translation: "I have had a dry cough and mild fever for three days. My throat is also sore.",
        timestamp: "04:12 PM",
      },
      {
        role: "agent",
        text: "নমস্কার! চিন্তা করবেন না। আপনার কাশির সাথে কি বুকে ব্যথা বা শ্বাসকষ্ট হচ্ছে? আপনি কি কোনো ওষুধ খেয়েছেন?",
        translation: "Hello! Don't worry. Along with the cough, do you have chest pain or breathing difficulty? Have you taken any medicine?",
        timestamp: "04:13 PM",
      },
      {
        role: "user",
        text: "না, শ্বাসকষ্ট নেই। কিন্তু রাতে কাশি বেশি বাড়ে। কোনো ওষুধ এখনো খাইনি।",
        translation: "No breathing difficulty, but cough worsens at night. Haven't taken any medicine yet.",
        timestamp: "04:14 PM",
      },
      {
        role: "agent",
        text: "আচ্ছা, বুঝতে পেরেছি। প্রচুর পরিমাণে গরম জল ও চা পান করুন। দিনে দুবার গরম জলের ভাপ নিন। প্যারাসিটামল ৫০০ মিলিগ্রাম জ্বর এলে খেতে পারেন। আপনার লক্ষণগুলি স্থিতিশীল রয়েছে। আমি আপনার রেকর্ডটি মেডিকেল অফিসারের চূড়ান্ত পর্যালোচনার জন্য জমা দিয়েছি।",
        translation: "Understood. Drink plenty of warm water. Inhale steam twice daily. You may take Paracetamol 500mg if fever appears. Your symptoms are stable.",
        timestamp: "04:15 PM",
      },
    ],
  },
  {
    id: "av-c-102",
    title: "Stomach Ache",
    chief_complaint: "Epigastric cramps and burning acidity sensation post-dinner",
    date: "05 Oct 2024",
    duration: "6 min",
    duration_seconds: 360,
    language: "English",
    language_code: "en-IN",
    triage_level: "MONITOR",
    icon_type: "stethoscope", // red stethoscope badge
    icon_bg: "bg-[#fee2e2]",
    icon_color: "text-[#dc2626]",
    doctor_status: "REVIEWED",
    doctor_name: "Dr. P. Jamatia (CHC MO)",
    doctor_facility: "Boxanagar Primary Health Centre",
    reviewed_at: "05 Oct 2024, 02:15 PM",
    clinical_summary:
      "Patient experienced acute upper abdominal discomfort with mild heartburn following an oily meal. No persistent vomiting, jaundice, or peritoneal guarding. Advised antacid therapy and bland diet.",
    danger_signs: [
      { rule_id: "DS-GI-01", description: "Upper quadrant cramps without fever", severity: "MONITOR" },
    ],
    doctor_notes:
      "Acute gastritis / dyspepsia. Advised small frequent bland meals. Avoid spicy and deep-fried food. Return to emergency if pain radiates to back or vomiting persists.",
    prescription: [
      { name: "Cap. Pantoprazole 40mg", dosage: "1 capsule once daily before breakfast", duration: "5 days" },
      { name: "Syp. Digene Gel (10ml)", dosage: "2 teaspoons after meals", duration: "3 days" },
      { name: "ORS Hydration Sachet", dosage: "Mix in 1L boiled cool water", duration: "Daily" },
    ],
    transcript: [
      {
        role: "user",
        text: "I have had stomach burning and sharp cramps since yesterday evening after having dinner.",
        timestamp: "02:02 PM",
      },
      {
        role: "agent",
        text: "Hello! I am here to help you. Is the pain in the upper abdomen, or lower? Have you experienced any vomiting or loose stools?",
        timestamp: "02:03 PM",
      },
      {
        role: "user",
        text: "It feels like burning in the upper stomach right below the ribs. No vomiting, but feeling slightly bloated.",
        timestamp: "02:04 PM",
      },
      {
        role: "agent",
        text: "Thank you for the information. This strongly aligns with acute acid dyspepsia. Please drink small sips of water and avoid oily food. I am marking this for priority doctor review so the physician can prescribe gastric protection.",
        timestamp: "02:05 PM",
      },
    ],
  },
  {
    id: "av-c-103",
    title: "Prenatal Check-in",
    chief_complaint: "Routine 2nd Trimester Antenatal Care follow-up (20 Weeks Gestation)",
    date: "28 Sep 2024",
    duration: "10 min",
    duration_seconds: 600,
    language: "Hindi",
    language_code: "hi-IN",
    triage_level: "STABLE",
    icon_type: "clipboard", // mint clipboard badge
    icon_bg: "bg-[#dcfce7]",
    icon_color: "text-[#16a34a]",
    doctor_status: "REVIEWED",
    doctor_name: "Dr. S. Roy & Kalpana Reang (ASHA Worker)",
    doctor_facility: "Bishalgarh Community Health Centre",
    reviewed_at: "28 Sep 2024, 11:45 AM",
    clinical_summary:
      "Routine second-trimester antenatal voice consultation. Gestational age: 20 weeks. Maternal vitals optimal (BP 118/76 mmHg). Fetal movements active. IFA and calcium supplementation on schedule.",
    danger_signs: [],
    doctor_notes:
      "Pregnancy progressing normally. No pedal edema, visual disturbances, or vaginal bleeding. Hemoglobin stable at 11.4 g/dL. Continued antenatal nutrition counseling.",
    prescription: [
      { name: "Tab. IFA (Iron & Folic Acid)", dosage: "1 tablet daily after lunch", duration: "100 days" },
      { name: "Tab. Calcium 500mg + Vit D3", dosage: "1 tablet daily after dinner", duration: "100 days" },
    ],
    transcript: [
      {
        role: "user",
        text: "नमस्ते डॉक्टर, मेरा २०वाँ हफ्ता चल रहा है। आज का रूटीन एएनसी चेकअप करवाना था।",
        translation: "Hello doctor, my 20th week is ongoing. Wanted to complete today's routine ANC checkup.",
        timestamp: "11:25 AM",
      },
      {
        role: "agent",
        text: "नमस्ते! बहुत अच्छी बात है। क्या आपको बच्चे की हलचल (fetal movement) रोज़ महसूस हो रही है? क्या कोई चक्कर या सिरदर्द है?",
        translation: "Hello! That's wonderful. Are you feeling regular baby kicks daily? Any dizziness or headache?",
        timestamp: "11:26 AM",
      },
      {
        role: "user",
        text: "हाँ, हलचल दिन में कई बार महसूस होती है। कोई सिरदर्द या पैरों में सूजन नहीं है।",
        translation: "Yes, movements are felt several times a day. No headache or swelling in feet.",
        timestamp: "11:27 AM",
      },
      {
        role: "agent",
        text: "बहुत बढ़िया! आपके सभी लक्षण बहुत स्वस्थ और सामान्य हैं। आयरन और कैल्शियम की गोलियां नियमित रूप से लेते रहें और हरी पत्तेदार सब्जियां खाएं। आपकी अगली जांच 4 सप्ताह बाद होगी।",
        translation: "Great! All symptoms are very healthy and normal. Continue taking iron and calcium regularly.",
        timestamp: "11:28 AM",
      },
    ],
  },
];

export default function PatientConsultationsPage() {
  const navigate = useNavigate();
  const patient = getCurrentPatient() || {};

  // Sidebar drag & resize state (Desktop environment)
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
  const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "reviewed" | "stable" | "needs-review"

  // Consultations state with cache-first initialization to eliminate initial flash/blink
  const [consultations, setConsultations] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`aarogya_consultations_${normalizedPId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`aarogya_consultations_${normalizedPId}`);
      return !cached;
    } catch {
      return true;
    }
  });
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("summary"); // "summary" | "transcript" | "prescription"

  // Sidebar drag tracking
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
    };
  }, [isDraggingLeft]);

  // Fetch real-time remote consultations from FastAPI / Supabase
  useEffect(() => {
    setLoading((prev) => (consultations.length === 0 ? true : prev));

    getPatientConsultations(normalizedPId)
      .then((remoteData) => {
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          // Format remote consultations to match display schema
          const mappedRemote = remoteData.map((rc, idx) => {
            const rawLang = rc.language_used || "bn-IN";
            const langLabel = rawLang.includes("bn")
              ? "Bengali"
              : rawLang.includes("hi")
              ? "Hindi"
              : "English";
            const durationMin = rc.duration_seconds ? Math.max(1, Math.round(rc.duration_seconds / 60)) : 5;

            // Pick appropriate aesthetic icon badge
            const isEmergency = rc.triage_level === "EMERGENCY";
            const isMonitor = rc.triage_level === "MONITOR";

            const badgeBg = isEmergency
              ? "bg-[#fee2e2]"
              : isMonitor
              ? "bg-[#fef3c7]"
              : idx % 2 === 0
              ? "bg-[#e0f2fe]"
              : "bg-[#dcfce7]";

            const badgeColor = isEmergency
              ? "text-[#dc2626]"
              : isMonitor
              ? "text-[#d97706]"
              : idx % 2 === 0
              ? "text-[#0284c7]"
              : "text-[#16a34a]";

            const badgeType = isEmergency ? "stethoscope" : idx % 2 === 0 ? "document" : "clipboard";

            const createdDate = rc.started_at
              ? new Date(rc.started_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            return {
              id: rc.id,
              title: rc.chief_complaint || "Voice Consultation",
              chief_complaint: rc.chief_complaint || rc.clinical_summary || "General Consultation Intake",
              date: createdDate,
              duration: `${durationMin} min`,
              duration_seconds: rc.duration_seconds || durationMin * 60,
              language: langLabel,
              language_code: rawLang,
              triage_level: rc.triage_level || "STABLE",
              icon_type: badgeType,
              icon_bg: badgeBg,
              icon_color: badgeColor,
              doctor_status: rc.doctor_status || "PENDING",
              doctor_name: rc.doctor_name || "Dr. S. Roy (Medical Officer)",
              doctor_facility: "Community Health Centre",
              reviewed_at: rc.reviewed_at || "Recent",
              clinical_summary: rc.clinical_summary || rc.chief_complaint || "Voice consultation completed with AI Assistant.",
              danger_signs: rc.danger_signs || [],
              doctor_notes: rc.doctor_review_notes || rc.doctor_notes || "Pending final physician sign-off.",
              prescription: rc.doctor_prescription
                ? [{ name: rc.doctor_prescription, dosage: "As prescribed", duration: "5 days" }]
                : [],
              transcript: Array.isArray(rc.transcript) ? rc.transcript : [],
            };
          });

          // Store live database records and update cache
          setConsultations(mappedRemote);
          try {
            sessionStorage.setItem(`aarogya_consultations_${normalizedPId}`, JSON.stringify(mappedRemote));
          } catch {}
        } else {
          // If no consultations exist in DB, fall back to default demo seeds
          setConsultations(DEFAULT_CONSULTATIONS);
        }
      })
      .catch((err) => {
        console.warn("[PatientConsultations] Notice while loading remote consultations:", err);
        setConsultations((prev) => (prev && prev.length > 0 ? prev : DEFAULT_CONSULTATIONS));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [normalizedPId]);

  // Delete consultation handler (Backend API + State)
  const handleDeleteConsultation = async (consultationId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this consultation record?")) return;
    try {
      await deletePatientConsultation(consultationId);
    } catch {}
    setConsultations((prev) => {
      const updated = prev.filter((c) => c.id !== consultationId);
      try {
        sessionStorage.setItem(`aarogya_consultations_${normalizedPId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (selectedConsultation?.id === consultationId) {
      setSelectedConsultation(null);
    }
  };

  // Live doctor consultation generated from patientStore
  const doctorConsultation = useMemo(() => {
    if (!patient?.doctorReview || (!patient.doctorReview.notes && !patient.doctorReview.prescription)) {
      return null;
    }
    return {
      id: `doctor-review-${patient.id || "live"}`,
      title: patient.category || "OPD Clinical Consultation & Prescription",
      chief_complaint: patient.chiefComplaint || patient.nativeIntake || "General Clinical Assessment",
      date: "Today",
      duration: "10 min",
      duration_seconds: 600,
      language: "Bengali / Hindi",
      language_code: "bn-IN",
      triage_level: patient.triage?.toUpperCase() || "STABLE",
      icon_type: "stethoscope",
      icon_bg: "bg-[#e8f5e9]",
      icon_color: "text-[#0b6651]",
      doctor_status: "REVIEWED",
      doctor_name: patient.doctorReview.doctorName || "Dr. Sandeep Roy (Medical Officer)",
      doctor_facility: patient.doctorReview.facility || "Bishalgarh Community Health Centre",
      reviewed_at: patient.doctorReview.reviewedAt || "Today, 10:45 AM",
      clinical_summary: patient.aiImpression || patient.keyFindings?.join(". ") || "Comprehensive clinical assessment completed.",
      danger_signs: [],
      doctor_notes: patient.doctorReview.notes || "Continue prescribed regimen and report if symptoms persist.",
      prescription: (patient.doctorReview.prescriptionsList || []).map((m) => ({
        name: m.name,
        dosage: m.dose,
        duration: m.duration,
      })),
      transcript: [
        {
          role: "user",
          text: patient.nativeIntake || "আমার শারীরিক লক্ষণ এবং ঔষধ পর্যালোচনার জন্য এসেছি।",
          translation: patient.englishIntake || "I came for review of my clinical symptoms and medications.",
          timestamp: "10:15 AM",
        },
        {
          role: "agent",
          text: `মেডিকেল অফিসার ${patient.doctorReview.doctorName || "ডাঃ সন্দীপ রায়"} আপনার লক্ষণগুলি পর্যবেক্ষণ করে প্রেসক্রিপশন নিশ্চিত করেছেন।`,
          translation: `Medical Officer ${patient.doctorReview.doctorName || "Dr. Sandeep Roy"} has reviewed your symptoms and confirmed your prescription.`,
          timestamp: "10:45 AM",
        },
      ],
    };
  }, [patient]);

  // Filtered consultations
  const filteredConsultations = useMemo(() => {
    const combined = doctorConsultation ? [doctorConsultation, ...consultations] : consultations;
    return combined.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.chief_complaint.toLowerCase().includes(q) ||
        item.language.toLowerCase().includes(q) ||
        (item.doctor_name && item.doctor_name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterTab === "reviewed") return item.doctor_status === "REVIEWED";
      if (filterTab === "stable") return item.triage_level === "STABLE";
      if (filterTab === "needs-review") return item.doctor_status === "PENDING" || item.triage_level === "MONITOR";
      return true;
    });
  }, [consultations, doctorConsultation, searchQuery, filterTab]);

  // Helper for rendering card badge icon
  const renderCardIcon = (iconType, colorClass) => {
    switch (iconType) {
      case "stethoscope":
        return <Stethoscope className={`w-5 h-5 ${colorClass}`} />;
      case "clipboard":
        return <Activity className={`w-5 h-5 ${colorClass}`} />;
      case "document":
      default:
        return <FileText className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  // Printable summary handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="consultations"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

      {/* ============================================================================== */}
      {/* 2. RESIZER HANDLE: DRAG TO EXPAND / SHRINK SIDEBAR                             */}
      {/* ============================================================================== */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          onDoubleClick={() => setLeftWidth(240)}
          className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
          title="Drag to resize sidebar (Double-click to reset)"
        />
      )}

      {/* ============================================================================== */}
      {/* 3. MAIN WORKSPACE CONTAINER                                                    */}
      {/* ============================================================================== */}
      <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
        <div className="p-6 sm:p-8 w-full space-y-6">

          {/* ============================================================================== */}
          {/* A. PAGE TITLE & HEADER BAR (Matching Reference Image)                          */}
          {/* ============================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                My Consultations
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-1">
                Voice consultations and verified clinical reviews
              </p>
            </div>
          </div>

          {/* ============================================================================== */}
          {/* B. SIMPLE, PATIENT-FRIENDLY INSIGHTS STRIP                                     */}
          {/* ============================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Consultations</span>
                {loading && consultations.length === 0 ? (
                  <div className="h-5 w-20 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-base font-extrabold text-slate-900 leading-tight">
                    {consultations.length} Check-ups
                  </p>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Doctor Prescriptions</span>
                {loading && consultations.length === 0 ? (
                  <div className="h-5 w-24 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-base font-extrabold text-slate-900 leading-tight">
                    {consultations.filter((c) => c.prescription && c.prescription.length > 0).length} Prescriptions
                  </p>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Doctor Checked</span>
                {loading && consultations.length === 0 ? (
                  <div className="h-5 w-20 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-base font-extrabold text-teal-800 leading-tight">
                    {consultations.filter((c) => c.doctor_status === "REVIEWED").length} Completed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================================== */}
          {/* C. SEARCH BAR & SIMPLE FILTERS                                                 */}
          {/* ============================================================================== */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterTab === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100/80 hover:bg-slate-200/60 text-slate-600"
                }`}
              >
                All ({consultations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("reviewed")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterTab === "reviewed"
                    ? "bg-[#059669] text-white shadow-2xs"
                    : "bg-slate-100/80 hover:bg-slate-200/60 text-slate-600"
                }`}
              >
                Doctor Reviewed
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("prescriptions")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterTab === "prescriptions"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100/80 hover:bg-slate-200/60 text-slate-600"
                }`}
              >
                With Medicines
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search check-ups..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* AI DOCTOR ACTIVE CONSULTATION BANNER */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">AarogyaVaani AI Doctor Desk</h3>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">24/7 Live</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Instant guidance on symptoms, medicine explanations, and voice check-ups in Kokborok, Bengali, or Hindi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/patient/ai-doctor")}
              className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Talk to AI Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ============================================================================== */}
          {/* D. CONSULTATIONS REGISTRY TABLE (GOVERNMENT PORTAL ROW DESIGN)                 */}
          {/* ============================================================================== */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {loading && consultations.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-4 animate-pulse py-2">
                    <div className="w-11 h-11 bg-slate-200 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-20 hidden sm:block" />
                    <div className="h-4 bg-slate-100 rounded w-24 hidden md:block" />
                    <div className="h-8 bg-slate-200 rounded-lg w-20 shrink-0" />
                  </div>
                ))}
              </div>
            ) : filteredConsultations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-4 px-4">#</th>
                      <th className="py-4 px-5">Consultation / Chief Complaint</th>
                      <th className="py-4 px-5">Date & Duration</th>
                      <th className="py-4 px-5">Doctor / Mode</th>
                      <th className="py-4 px-5">Language</th>
                      <th className="py-4 px-5">Prescription</th>
                      <th className="py-4 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredConsultations.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedConsultation(item)}
                        className="hover:bg-emerald-50/40 transition cursor-pointer group"
                      >
                        <td className="py-5 px-4 font-mono font-bold text-slate-400 text-xs">{index + 1}</td>
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-md ${item.icon_bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                              {renderCardIcon(item.icon_type, item.icon_color)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition block truncate text-sm">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-400">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-5 font-medium text-slate-700 whitespace-nowrap text-xs sm:text-[13px]">
                          <div>{item.date}</div>
                          <span className="text-[11px] text-slate-400">{item.duration}</span>
                        </td>
                        <td className="py-5 px-5 whitespace-nowrap text-xs sm:text-[13px]">
                          <span className="font-semibold text-slate-800">{item.doctor_name || "AarogyaVaani AI"}</span>
                        </td>
                        <td className="py-5 px-5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {item.language}
                          </span>
                        </td>
                        <td className="py-5 px-5 whitespace-nowrap">
                          {item.prescription && item.prescription.length > 0 ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                              {item.prescription.length} Medicines
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                              Advice Only
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedConsultation(item);
                              }}
                              className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition inline-flex items-center gap-1 border border-emerald-200 cursor-pointer"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConsultation(item.id, e)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition border border-slate-200 hover:border-red-200 cursor-pointer"
                              title="Delete consultation"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No check-ups found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No records match your search. You can talk to the AI Doctor anytime to record a new consultation.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* ============================================================================== */}
          {/* E. SIMPLE FOOTER NOTICE                                                        */}
          {/* ============================================================================== */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] sm:text-xs text-emerald-900 font-medium">
                Your medical records are kept safe and shared only with government medical officers under National Health Mission guidelines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/patient/share")}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 underline cursor-pointer"
            >
              Share Access
            </button>
          </div>

        </div>
      </main>
      </div>

      {/* ============================================================================== */}
      {/* 4. PATIENT-FRIENDLY CONSULTATION DETAILS MODAL                                 */}
      {/* ============================================================================== */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedConsultation(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl ${selectedConsultation.icon_bg} flex items-center justify-center shadow-2xs`}
                >
                  {renderCardIcon(selectedConsultation.icon_type, selectedConsultation.icon_color)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedConsultation.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedConsultation.date} · {selectedConsultation.duration} · {selectedConsultation.language}
                  </p>
                </div>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print Summary"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConsultation(selectedConsultation.id, e)}
                  title="Delete consultation record"
                  className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedConsultation(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (Simple & Human) */}
            <div className="flex items-center border-b border-slate-100 px-5 bg-white text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => setActiveModalTab("summary")}
                className={`py-3 px-3 border-b-2 transition cursor-pointer ${
                  activeModalTab === "summary"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Health Summary & Advice
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("prescription")}
                className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "prescription"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>Medicines (Prescription)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("transcript")}
                className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "transcript"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-slate-500" />
                <span>Recorded Voice Call</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
              {/* TAB 1: Health Summary & Advice */}
              {activeModalTab === "summary" && (
                <div className="space-y-4">
                  {/* Health Concern Reported */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Problem Reported
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {selectedConsultation.chief_complaint}
                    </p>
                  </div>

                  {/* Doctor's Advice Box */}
                  {selectedConsultation.doctor_notes && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Doctor's Advice & Plan</span>
                        </span>
                        <span className="text-emerald-700 text-[11px] font-medium">
                          {selectedConsultation.reviewed_at}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                        {selectedConsultation.doctor_notes}
                      </p>
                      <div className="text-[11px] text-emerald-800 font-semibold pt-1">
                        Checked by: {selectedConsultation.doctor_name} ({selectedConsultation.doctor_facility})
                      </div>
                    </div>
                  )}

                  {/* Summary Overview */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Summary Overview
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedConsultation.clinical_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Medicines (Prescription) */}
              {activeModalTab === "prescription" && (
                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {selectedConsultation.doctor_name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {selectedConsultation.doctor_facility}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Approved
                    </span>
                  </div>

                  {/* Medicines List */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        Medicines to Take
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {Array.isArray(selectedConsultation.prescription) &&
                      selectedConsultation.prescription.length > 0 ? (
                        selectedConsultation.prescription.map((med, idx) => (
                          <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-900">{med.name}</p>
                              <p className="text-[11px] text-slate-500">{med.dosage}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 w-fit">
                              {med.duration}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-slate-400 text-xs text-center">
                          No medicines prescribed for this check-up.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Advice */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                    <span className="font-bold block text-amber-900">Important Note:</span>
                    <p className="leading-relaxed">
                      Take medicines on time as written above. If fever or pain does not improve, please visit your nearest Primary Health Centre (PHC) or Hospital immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Recorded Voice Call */}
              {activeModalTab === "transcript" && (
                <div className="space-y-3">
                  {/* Call Meta */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Mic className="w-4 h-4 text-emerald-600" />
                      <span>Recorded Voice Check-up</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      Call time: {selectedConsultation.duration}
                    </span>
                  </div>

                  {/* Chat Bubbles */}
                  {selectedConsultation.transcript.length > 0 ? (
                    selectedConsultation.transcript.map((turn, idx) => {
                      const isUser = turn.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          {!isUser && (
                            <div className="w-7 h-7 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                              isUser
                                ? "bg-slate-900 text-white shadow-xs rounded-br-xs"
                                : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs"
                            }`}
                          >
                            <p className="font-medium">{turn.text}</p>
                            {turn.translation && (
                              <p className={`mt-1 text-[11px] italic ${isUser ? "text-slate-300" : "text-slate-500"}`}>
                                Meaning: {turn.translation}
                              </p>
                            )}
                            <div
                              className={`mt-1 text-[10px] font-mono flex items-center gap-1 ${
                                isUser ? "text-slate-300 justify-end" : "text-slate-400 justify-start"
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{turn.timestamp || "Recorded"}</span>
                            </div>
                          </div>

                          {isUser && (
                            <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No recorded conversation available.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <button
                type="button"
                onClick={() => navigate("/patient/ai-doctor")}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Call Doctor Again</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
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

