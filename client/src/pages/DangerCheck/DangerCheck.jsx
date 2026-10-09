import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  User,
  Info,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

export default function DangerCheck() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const patientRecord = useMemo(() => {
    return JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}");
  }, []);

  const interviewData = useMemo(() => {
    return JSON.parse(localStorage.getItem("aarogyaVaaniInterview") || "{}");
  }, []);

  const patient = patientRecord.patient || { name: "Mamta Debbarma", age: "27" };
  const patientType = patientRecord.patientType || "maternal";
  const answers = interviewData.answers || {};

  // Deterministic Medical Danger-Sign Evaluation
  const dangerSigns = useMemo(() => {
    const flags = [];
    if (patientType === "maternal") {
      if (answers.bleeding === "Yes") {
        flags.push({
          id: "bleeding",
          title: "Vaginal Bleeding Reported",
          severity: "CRITICAL",
          description: "Obstetric hemorrhage risk. Patient requires immediate speculum examination.",
        });
      }
      if (answers.headacheVision === "Yes") {
        flags.push({
          id: "headacheVision",
          title: "Severe Headache or Blurred Vision",
          severity: "CRITICAL",
          description: "Preeclampsia indicator. Immediate BP monitoring required.",
        });
      }
      if (answers.abdominalPain === "Yes") {
        flags.push({
          id: "abdominalPain",
          title: "Severe Abdominal Pain",
          severity: "HIGH",
          description: "Possible placental abruption or complications.",
        });
      }
      if (answers.babyMovement === "No") {
        flags.push({
          id: "babyMovement",
          title: "Reduced or Absent Fetal Movement",
          severity: "HIGH",
          description: "Possible fetal distress. Doppler auscultation recommended immediately.",
        });
      }
      if (answers.fever === "Yes") {
        flags.push({
          id: "fever",
          title: "High Fever / Infection Signs",
          severity: "MODERATE",
          description: "Maternal systemic infection risk.",
        });
      }
    } else {
      if (answers.breathing === "Yes") {
        flags.push({
          id: "breathing",
          title: "Acute Difficulty Breathing",
          severity: "CRITICAL",
          description: "Respiratory or cardiac distress flag.",
        });
      }
      if (answers.fainting === "Yes") {
        flags.push({
          id: "fainting",
          title: "Fainting or Severe Dizziness",
          severity: "HIGH",
          description: "Syncope or severe hypotension.",
        });
      }
    }
    return flags;
  }, [patientType, answers]);

  const isUrgent = dangerSigns.length > 0;

  const handleContinue = () => {
    localStorage.setItem(
      "aarogyaVaaniDangerCheck",
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        urgent: isUrgent,
        dangerSigns,
      })
    );

    navigate("/summary");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("dangerCheckTitle")}
        showBack={true}
        backPath="/interview"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Patient Pill */}
        <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</span>
              <h3 className="text-xl font-bold text-slate-900">
                {patient.name} ({patient.age} yrs)
              </h3>
            </div>
          </div>
          <span className="bg-emerald-500/15 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
            {patientType === "maternal" ? t("maternalModule") : t("generalModule")}
          </span>
        </div>

        {/* Evaluation Result Card (Colored Glass) */}
        {isUrgent ? (
          <div className="glass-card-red rounded-3xl p-6 sm:p-8 mb-6 shadow-md border-2 border-rose-300">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Critical Red Flags ({dangerSigns.length})
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-rose-950 mt-2">
                  {t("dangerDetected")}
                </h2>
                <p className="text-base text-slate-700 mt-1 font-medium leading-relaxed">
                  {t("dangerDetectedDesc")}
                </p>
              </div>
            </div>

            {/* List of Flagged Danger Signs */}
            <div className="mt-6 space-y-3">
              {dangerSigns.map((sign) => (
                <div
                  key={sign.id}
                  className="bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-4 flex items-start gap-4 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-rose-950">{sign.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-rose-100/70 rounded-2xl border border-rose-200 flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-bold text-rose-900">
                🚨 Emergency Alert queued for Nurse Station (#TR-ALERT-04)
              </span>
              <button
                onClick={() => navigate("/danger-alerts")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer whitespace-nowrap shadow-xs"
              >
                {t("dangerTriage")}
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card-emerald rounded-3xl p-6 sm:p-8 mb-6 shadow-sm border-2 border-emerald-300">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-100" />
              </div>
              <div className="flex-1">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Screening Clear
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
                  {t("dangerClear")}
                </h2>
                <p className="text-base text-slate-700 mt-1 font-medium leading-relaxed">
                  {t("dangerClearDesc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Continue Action Button */}
        <div className="pt-2">
          <button
            onClick={handleContinue}
            className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg"
          >
            <span>{t("continueSummary")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}