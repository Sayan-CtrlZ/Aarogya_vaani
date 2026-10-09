import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  User,
  Stethoscope,
  Heart,
  Plus,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { getPatientById, getAllPatients } from "../../utils/patientStore";

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Read ID from URL params or localStorage
  const searchParams = new URLSearchParams(location.search);
  const paramId = searchParams.get("id");

  const patient = useMemo(() => {
    if (paramId) {
      const found = getPatientById(paramId);
      if (found) return found;
    }

    try {
      const storedSummary = JSON.parse(
        localStorage.getItem("aarogyaVaaniCurrentSummary") || "null"
      );
      if (storedSummary) return storedSummary;
    } catch {
      // ignore
    }

    // fallback to latest patient
    const all = getAllPatients();
    return all[0] || null;
  }, [paramId]);

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
        <GovHeader title="Health Summary" showBack={true} backPath="/dashboard" />
        <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 text-center py-12">
          <p className="text-slate-600 font-bold">No patient summary found.</p>
          <button
            onClick={() => navigate("/new-patient")}
            className="mt-4 bg-[#0b6651] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            Start New Intake
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isUrgent =
    patient.triage === "Critical Red Flag" ||
    patient.status === "Urgent" ||
    (patient.dangerSigns && patient.dangerSigns.length > 0);

  const copyPatientId = () => {
    navigator.clipboard?.writeText(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-10">
      <GovHeader
        title="Patient Health Summary"
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Patient ID Banner Card */}
        <div className="glass-panel p-4.5 rounded-3xl border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Official Clinical Record
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-bold">Patient ID:</span>
                <span className="font-mono text-xl font-black text-[#0b6651]">{patient.id}</span>
              </div>
            </div>

            <button
              onClick={copyPatientId}
              className="glass-card px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Copy Patient ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy ID"}</span>
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{patient.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {patient.age} yrs • {patient.gender} • {patient.village}
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                isUrgent
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isUrgent ? "Critical Red Flag" : "Stable"}
            </span>
          </div>
        </div>

        {/* Intake Operator & Assisted Status Card */}
        <div className="glass-card-emerald p-3.5 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              👩‍⚕️
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Intake Method & Operator
              </span>
              <p className="text-xs font-black text-slate-900">
                {patient.assistedMode
                  ? `${patient.assistedBy || "ASHA Worker (Kalpana Reang)"} (Proxy Intake)`
                  : "Direct Patient Self-Intake"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/85 text-emerald-900 border border-emerald-200">
            {patient.assistedReason || (patient.assistedMode ? "Field Assisted Proxy" : "Self-Operated")}
          </span>
        </div>

        {/* Triage / Red Flag Warning if present */}
        {isUrgent && (
          <div className="glass-card-red p-4 rounded-2xl flex items-start gap-3 shadow-xs animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Doctor Attention Needed
              </span>
              <h4 className="text-sm font-extrabold text-rose-950 mt-1">
                Potential High-Risk Symptoms Flagged
              </h4>
              <p className="text-xs text-rose-900 mt-0.5 font-semibold">
                {patient.dangerSigns && patient.dangerSigns.length > 0
                  ? patient.dangerSigns.join(" • ")
                  : "Severe headache / blurred vision indicators detected."}
              </p>
            </div>
          </div>
        )}

        {/* Chief Complaint (What the patient told the AI) */}
        <div className="glass-panel p-4.5 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Chief Complaint (Patient's Words)
          </span>
          <p className="text-sm font-bold text-slate-900 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-slate-100 italic">
            "{patient.chiefComplaint}"
          </p>
        </div>

        {/* Doctor Clinical Q&A Assessment History */}
        {patient.assessmentHistory && patient.assessmentHistory.length > 0 && (
          <div className="glass-panel p-4.5 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Doctor Assessment Q&A
              </h3>
            </div>

            <div className="space-y-2.5">
              {patient.assessmentHistory.map((item, idx) => (
                <div key={idx} className="glass-card p-3 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-slate-800">
                    <span className="text-emerald-800 mr-1.5 font-mono">Q{idx + 1}.</span>
                    {item.question}
                  </p>
                  <p className="text-emerald-950 font-black pl-5">
                    → {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Clinical Summary (Simple Text) */}
        <div className="glass-panel p-4.5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
            <Stethoscope className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Clinical Summary (For Doctor)
            </h3>
          </div>
          <p className="text-xs font-medium text-slate-700 leading-relaxed bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
            {patient.clinicalSummary}
          </p>
        </div>

        {/* Doctor Review Status if already reviewed */}
        {patient.doctorReview && (
          <div className="glass-card-emerald p-4 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Reviewed by {patient.doctorReview.doctorName}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                {patient.doctorReview.reviewedAt}
              </span>
            </div>
            {patient.doctorReview.prescription && (
              <div className="bg-white/80 p-2.5 rounded-xl text-xs font-semibold text-emerald-950">
                Prescription: {patient.doctorReview.prescription}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Primary Action: Open in Doctor's Dashboard */}
          <button
            onClick={() => navigate(`/doctor-review?id=${patient.id}`)}
            className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Open in Doctor's Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => window.print()}
              className="glass-card hover:bg-white text-slate-700 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Summary Slip</span>
            </button>

            <button
              onClick={() => navigate("/new-patient")}
              className="glass-card hover:bg-white text-emerald-900 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>New Patient Intake</span>
            </button>
          </div>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}