import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Search,
  Stethoscope,
  UsersRound,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  User,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { getAllPatients } from "../../utils/patientStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [patients, setPatients] = useState(() => getAllPatients());
  const [lookupId, setLookupId] = useState("");

  const role = sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";
  const userName =
    sessionStorage.getItem("aarogyaVaaniUserName") ||
    (role === "doctor" ? "Dr. S. Roy" : "Kalpana Reang");

  useEffect(() => {
    setPatients(getAllPatients());
  }, []);

  const urgentCount = patients.filter(
    (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
  ).length;

  const reviewedCount = patients.filter((p) => p.status === "Reviewed").length;

  const handleLookup = (e) => {
    e.preventDefault();
    const clean = lookupId.trim().toUpperCase();
    if (!clean) return;
    navigate(`/summary?id=${clean}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-10">
      <GovHeader title="Staff Dashboard" showBack={true} backPath="/" />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* User Greeting Bar */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {role === "doctor" ? "Medical Officer" : "Health Worker Portal"}
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-0.5">
              Namaste, {userName}
            </h1>
          </div>

          <button
            onClick={() => navigate("/doctor/review")}
            className="glass-card hover:bg-white text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
            <span>Doctor Portal</span>
          </button>
        </div>

        {/* 1. Hero Action: Start AI Voice Intake */}
        <div className="glass-panel p-5 rounded-3xl shadow-md border border-emerald-500/30 bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Voice-First Clinical Intake</span>
            </span>

            <div>
              <h2 className="text-xl font-black leading-tight">
                Start AI Voice Patient Intake
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Talk to the AI in simple language. The AI asks doctor-like assessment questions and creates a proper clinical summary.
              </p>
            </div>

            <button
              onClick={() => navigate("/new-patient")}
              className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02]"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <span>Register & Start Voice Intake</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        </div>

        {/* 2. Patient ID Quick Lookup */}
        <div className="glass-panel p-4 rounded-3xl shadow-sm border border-white/80">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Patient ID Lookup:
          </label>
          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter Patient ID (e.g. AV-8921)"
                className="w-full pl-9 pr-3 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            >
              View Summary
            </button>
          </form>
        </div>

        {/* 3. Triage & Clinical Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass-card p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Intakes</span>
            <strong className="text-lg font-black text-slate-900 mt-0.5 block">{patients.length}</strong>
          </div>

          <div
            onClick={() => navigate("/danger-alerts")}
            className="glass-card-red p-3 rounded-2xl text-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-[10px] font-bold text-rose-800 block uppercase">Red Flags</span>
            <strong className="text-lg font-black text-rose-950 mt-0.5 block">{urgentCount}</strong>
          </div>

          <div
            onClick={() => navigate("/doctor/review")}
            className="glass-card-emerald p-3 rounded-2xl text-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-[10px] font-bold text-emerald-800 block uppercase">Reviewed</span>
            <strong className="text-lg font-black text-emerald-950 mt-0.5 block">{reviewedCount}</strong>
          </div>
        </div>

        {/* 4. Recent Patient Health Summaries Queue */}
        <div className="glass-panel p-4.5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Recent Patient Intakes
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {patients.length} records
            </span>
          </div>

          <div className="space-y-2.5">
            {patients.map((p) => {
              const isCrit = p.triage === "Critical Red Flag" || p.status === "Urgent";
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/summary?id=${p.id}`)}
                  className="glass-card p-3.5 rounded-2xl hover:bg-white transition-all cursor-pointer shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#0b6651] bg-emerald-50 px-2 py-0.5 rounded-md">
                        {p.id}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{p.name}</h4>
                      {p.assistedMode && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                          👩‍⚕️ Proxy
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isCrit
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : p.status === "Reviewed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p.status === "Reviewed" ? "Reviewed ✓" : isCrit ? "Red Flag" : "Stable"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic font-medium">
                    "{p.chiefComplaint}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>{p.village}</span>
                    <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View Health Summary</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}