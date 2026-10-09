import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Mic,
  Trash2,
  User,
  Clock,
  Plus,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import { useLanguage } from "../../context/LanguageContext";

export default function ActiveSessions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentPatientRecord = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "null");
    } catch {
      return null;
    }
  }, []);

  const hasCurrentSession = Boolean(currentPatientRecord?.patient?.name);

  const handleClearSession = () => {
    if (confirm("Clear this active session?")) {
      localStorage.removeItem("aarogyaVaaniCurrentPatient");
      localStorage.removeItem("aarogyaVaaniInterview");
      localStorage.removeItem("aarogyaVaaniDangerCheck");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <GovHeader
        title={t("activeSessionsTitle")}
        subtitle={t("activeSessionsSubtitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Card */}
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {t("activeSessionsTitle")}
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {t("activeSessionsSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {hasCurrentSession ? (
          <div className="glass-panel p-6 sm:p-8 border-l-8 border-l-emerald-600">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  {t("activeNow")}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Today</span>
              </span>
            </div>

            <div className="flex items-start gap-4 my-5">
              <div className="w-14 h-14 rounded-2xl bg-white/80 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentPatientRecord.patient.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mt-0.5">
                  <span>{currentPatientRecord.patient.age} {t("age")}</span>
                  <span>•</span>
                  <span>{currentPatientRecord.patient.village || "Sepahijala"}</span>
                </div>
                <div className="mt-2 inline-block glass-card-emerald text-emerald-950 text-xs px-3 py-1 font-bold">
                  {currentPatientRecord.patientType === "maternal"
                    ? t("maternalModule")
                    : t("generalModule")}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-emerald-900/10 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleClearSession}
                className="glass-card-red text-red-900 font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer hover:shadow-xs"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>{t("discardSession")}</span>
              </button>

              <button
                onClick={() => navigate("/interview")}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>{t("resumeIntake")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t("noActiveSessions")}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto font-medium">
              There are no paused intakes on this tablet right now.
            </p>
            <button
              onClick={() => navigate("/new-patient")}
              className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base px-6 py-3 rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>{t("startNewIntake")}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}