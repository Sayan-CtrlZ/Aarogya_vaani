import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Baby,
  Stethoscope,
  ShieldAlert,
  RefreshCw,
  Volume2,
  Mic,
  Clock,
  UsersRound,
  Building,
  CheckCircle2,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const metrics = [
    {
      value: t("statConsultationSub"),
      label: t("statConsultation"),
      source: "BMJ Open 2017",
      colorClass: "glass-card-amber",
    },
    {
      value: t("statRuralSub"),
      label: t("statRural"),
      source: "Census 2011 / NHSRC",
      colorClass: "glass-card-emerald",
    },
    {
      value: t("statLanguageSub"),
      label: t("statLanguage"),
      source: "Census 2011 (C-16)",
      colorClass: "glass-card-blue",
    },
    {
      value: t("statInstitutionalSub"),
      label: t("statInstitutional"),
      source: "NFHS-5 (2019-21)",
      colorClass: "glass-card-purple",
    },
    {
      value: t("statAshasSub"),
      label: t("statAshas"),
      source: "NHSRC Tripura",
      colorClass: "glass-card-emerald",
    },
    {
      value: t("statOfflineSub"),
      label: t("statOffline"),
      source: "Core Spec",
      colorClass: "glass-card-blue",
    },
  ];

  const steps = [
    {
      num: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: Volume2,
      colorClass: "glass-card-emerald",
    },
    {
      num: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: Mic,
      colorClass: "glass-card-blue",
    },
    {
      num: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: ShieldAlert,
      colorClass: "glass-card-red",
    },
    {
      num: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: Stethoscope,
      colorClass: "glass-card-purple",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader showBack={false} />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-5 pb-24">
        {/* Hero Card */}
        <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-sm border border-white/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-[#0b6651]" />
              <span>Voice-First Mobile Intake</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {t("brandName")}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#0b6651] mt-1">
              {t("landingSubtitle")}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {t("landingDesc")}
            </p>

            {/* 4 Colored Glassmorphic Action Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              {/* Card 1: Start Intake */}
              <div
                onClick={() => navigate("/new-patient")}
                className="glass-card-emerald p-4 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3 shadow-xs">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">AI Voice Intake</h3>
                  <p className="text-[11px] text-emerald-800 font-medium mt-1">Talk to AI in simple language</p>
                </div>
                <div className="mt-3 flex items-center text-xs font-bold gap-1 text-[#0b6651]">
                  <span>Start Intake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Doctor Dashboard */}
              <div
                onClick={() => navigate("/doctor-review")}
                className="glass-card-blue p-4 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-xs">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-blue-950">Doctor Portal</h3>
                  <p className="text-[11px] text-blue-800 font-medium mt-1">Search patient ID & review</p>
                </div>
                <div className="mt-3 flex items-center text-xs font-bold gap-1 text-blue-700">
                  <span>Open Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: Patient Directory */}
              <div
                onClick={() => navigate("/patients")}
                className="glass-card p-4 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-3 shadow-xs">
                    <UsersRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Patient Directory</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">View health summaries</p>
                </div>
                <div className="mt-3 flex items-center text-xs font-bold gap-1 text-slate-700">
                  <span>View Patients</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 4: Red Flag Triage */}
              <div
                onClick={() => navigate("/danger-alerts")}
                className="glass-card-red p-4 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-rose-950">Red Flag Triage</h3>
                  <p className="text-[11px] text-rose-800 font-medium mt-1">Critical alerts queue</p>
                </div>
                <div className="mt-3 flex items-center text-xs font-bold gap-1 text-rose-700">
                  <span>View Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Problem in Numbers (Colored Glass Cards) */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t("numbersTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t("numbersDesc")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics.map((m, i) => (
              <div key={i} className={`${m.colorClass} p-5 rounded-2xl flex flex-col justify-between`}>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{m.value}</span>
                  <h4 className="text-base font-bold text-slate-800 mt-2">{m.label}</h4>
                </div>
                <div className="mt-4 pt-2 border-t border-black/5 text-[11px] font-semibold text-slate-500">
                  Source: {m.source}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Workflow Steps (Color Glass Cards) */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t("workflowTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t("workflowDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className={`${s.colorClass} p-6 rounded-2xl flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-slate-900/60">{s.num}</span>
                      <div className="w-10 h-10 rounded-xl bg-white/80 shadow-xs flex items-center justify-center text-slate-800">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="glass-panel rounded-2xl p-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/80">
          <div>
            <strong className="text-slate-800 text-sm">{t("brandName")}</strong>
            <p className="text-slate-500 mt-0.5">
              {t("deptTitle")} • {t("govTitle")}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span
              onClick={() => navigate("/login")}
              className="cursor-pointer text-[#0b6651] hover:underline"
            >
              {t("staff")} Login
            </span>
            <span>•</span>
            <span
              onClick={() => navigate("/settings")}
              className="cursor-pointer text-[#0b6651] hover:underline"
            >
              {t("settingsTitle")}
            </span>
          </div>
        </footer>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}