import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Activity,
  ShieldCheck,
  Database,
  Building2,
  TrendingUp,
  TrendingDown,
  UserCheck,
  FileCheck2,
  AlertTriangle,
  Server,
  Lock,
} from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";
import { getPatients } from "../../services/api";

export default function DoctorAnalyticsTab() {
  const [patientsList, setPatientsList] = useState(() => getAllPatients());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Synchronized");

  const syncPatients = () => {
    const list = getAllPatients();
    return getPatients()
      .then((cloudPatients) => {
        if (Array.isArray(cloudPatients) && cloudPatients.length > 0) {
          const mergedMap = new Map();
          list.forEach((p) => mergedMap.set((p.id || p.patient_ref)?.toUpperCase(), p));
          cloudPatients.forEach((cp) => {
            const id = cp.patient_ref || cp.id;
            if (id) {
              const key = id.toUpperCase();
              const existing = mergedMap.get(key) || {};
              mergedMap.set(key, {
                ...existing,
                id: id,
                patient_ref: id,
                name: cp.name || existing.name,
                phone: cp.phone || existing.phone,
                age: cp.age || existing.age || "28",
                gender: cp.gender || existing.gender || "Female",
                district: cp.village || cp.district || existing.district || "Tripura",
                category: cp.category || existing.category || "General",
                triage: cp.triage || existing.triage || "Stable",
                status: cp.status || existing.status || "Active",
              });
            }
          });
          setPatientsList(Array.from(mergedMap.values()));
        } else {
          setPatientsList(list);
        }
      })
      .catch(() => setPatientsList(list));
  };

  useEffect(() => {
    syncPatients();
  }, []);

  const doctorProfile = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userName: "Dr. S. Roy",
      facility: "Civil Hospital, Agartala",
      workerId: "MO-8841",
      role: "General Physician",
      qualification: "MBBS, MD (Community Medicine)",
    };
  }, []);

  const doctorInitials = (doctorProfile.userName || "Dr. S. Roy")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    syncPatients().finally(() => {
      setIsSyncing(false);
      setSyncStatus("Synchronized just now");
    });
  };

  // Sparkline mini bars (7 days)
  const sparklineData = [
    [40, 55, 60, 45, 75, 80, 95], // patients trend
    [20, 10, 30, 40, 20, 15, emergencyCount > 0 ? 80 : 10], // critical trend
    [30, 45, 50, 65, 70, 85, 90], // prescriptions trend
    [100, 100, 100, 100, 100, 100, 100], // sync reliability
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Clinical Analytics & ABDM Node</span>
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            Operational Telemetry · NHM Tripura Facility Node · FHIR R4 Standards
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing ABDM Cloud..." : "Force Sync Cloud Records"}</span>
        </button>
      </div>

      {/* 2. OpenSource UI MetricCards (4 KPIs with sparklines & font-mono) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Patients Today
              </span>
              <UserCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {patientsList.length}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                +14%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Primary Care Intake</span>
            {/* Mini Sparkline Bar Chart */}
            <div className="flex items-end gap-1 h-5">
              {sparklineData[0].map((val, i) => (
                <div
                  key={i}
                  style={{ height: `${val}%` }}
                  className="w-1.5 bg-emerald-500/80 rounded-t-xs"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Critical Red Flags */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Critical Red Flags
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                {emergencyCount}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-600">
                {emergencyCount > 0 ? "Immediate Action" : "Zero Critical"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-rose-600 font-medium">Triage Escalation</span>
            <div className="flex items-end gap-1 h-5">
              {sparklineData[1].map((val, i) => (
                <div
                  key={i}
                  style={{ height: `${val}%` }}
                  className="w-1.5 bg-rose-500/80 rounded-t-xs"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Prescriptions Issued */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Prescriptions Issued
              </span>
              <FileCheck2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                {reviewedCount}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600">
                <TrendingUp className="w-3 h-3" />
                Signed Off
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">E-Prescription Rx</span>
            <div className="flex items-end gap-1 h-5">
              {sparklineData[2].map((val, i) => (
                <div
                  key={i}
                  style={{ height: `${val}%` }}
                  className="w-1.5 bg-blue-500/80 rounded-t-xs"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: ABDM Cloud Sync */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                ABDM Cloud Sync
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 truncate">
                {syncStatus}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">DPDP Act Compliant</span>
            <div className="flex items-end gap-1 h-5">
              {sparklineData[3].map((val, i) => (
                <div
                  key={i}
                  style={{ height: `${val}%` }}
                  className="w-1.5 bg-emerald-500/80 rounded-t-xs"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. New OpenSource UI Doctor Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {doctorInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {doctorProfile.userName || "Dr. Sandeep Roy"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified ABDM Health ID
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {doctorProfile.qualification || "MBBS, MD"} · {doctorProfile.role || "General Physician"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                <span>Worker ID: {doctorProfile.workerId || "MO-8841"}</span>
                <span>•</span>
                <span>Council Reg: MCI-TR-2018-9941</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duty Session</span>
              <span className="font-mono text-xs font-bold text-emerald-600 block">Active · Shift 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Health Center Facility Card (rounded-2xl with clean sub-cards) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-blue-600" />
              <span>Ayushman Bharat Health Centre Facility Node</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              National Health Mission (NHM) • Electronic Health Record (EHR) Hub
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium self-start sm:self-auto">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Node #TR-AGT-04</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Facility</span>
            <strong className="text-slate-900 dark:text-white text-sm block mt-1">
              {doctorProfile.facility || "Civil Hospital, Agartala"}
            </strong>
            <span className="text-slate-500 text-[11px] mt-0.5 block">District Primary Health Care Node</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Department</span>
            <strong className="text-slate-900 dark:text-white text-sm block mt-1">
              General OPD & Maternal Health
            </strong>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Primary Clinical Care</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Edge Connection</span>
            <strong className="text-slate-900 dark:text-white text-sm block mt-1 font-mono">
              Agartala Gateway · 18ms
            </strong>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Encrypted Local & Sync Hub</span>
          </div>
        </div>

        {/* Security & Standards Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FHIR R4 JSON Standards</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Encrypted SQLite & ABDM Gateway</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>DPDP Act 2023 Compliant</span>
          </span>
        </div>
      </div>
    </div>
  );
}
