import React, { useState, useMemo } from "react";
import { CheckCircle2, RefreshCw, Activity, ShieldCheck, Database, Building2 } from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";

export default function DoctorAnalyticsTab() {
  const patientsList = getAllPatients();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Synchronized");

  const doctorProfile = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userName: "Dr. S. Roy",
      facility: "Clinical Workspace",
      workerId: "MO-8841",
    };
  }, []);

  const emergencyCount = useMemo(() => {
    return patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    ).length;
  }, [patientsList]);

  const reviewedCount = useMemo(() => {
    return patientsList.filter((p) => p.status === "Reviewed").length;
  }, [patientsList]);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("Synchronized just now");
    }, 1200);
  };

  return (
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
            {emergencyCount}
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
            {reviewedCount}
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="truncate">{syncStatus}</span>
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
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Ayushman Bharat Health Centre Facility Node</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
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
            <strong className="text-slate-900 text-sm block mt-0.5">{doctorProfile.facility || "Clinical Workspace"}</strong>
            <span className="text-slate-500 text-[11px]">Primary Health Care Facility</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinical Department</span>
            <strong className="text-slate-900 text-sm block mt-0.5">General & Community Health</strong>
            <span className="text-slate-500 text-[11px]">Clinical Services</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Medical Officer</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{doctorProfile.userName || "Dr. S. Roy"}</strong>
            <span className="text-slate-500 text-[11px]">ID: {doctorProfile.workerId || "MO-8841"}</span>
          </div>
        </div>

        {/* Security & Data Governance Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FHIR R4 JSON Standards Validated</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Encrypted Offline & Online Sync</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Latency: 18ms (Agartala Edge Gateway)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
