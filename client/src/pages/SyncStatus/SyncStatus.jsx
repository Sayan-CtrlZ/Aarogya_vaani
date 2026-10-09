import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  CheckCircle2,
  CloudUpload,
  Clock,
  Check,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const INITIAL_QUEUE = [
  {
    id: "REC-081",
    patientName: "Mamta Debbarma",
    type: "Maternal Intake",
    timestamp: "Today, 10:32 AM",
    status: "READY_TO_SYNC",
  },
  {
    id: "REC-082",
    patientName: "Rani Tripura",
    type: "Maternal Intake",
    timestamp: "Today, 10:15 AM",
    status: "READY_TO_SYNC",
  },
  {
    id: "REC-080",
    patientName: "Sukanta Das",
    type: "General OPD",
    timestamp: "Today, 09:48 AM",
    status: "SYNCED",
  },
];

export default function SyncStatus() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [toastMessage, setToastMessage] = useState("");

  const pendingCount = queue.filter((item) => item.status === "READY_TO_SYNC").length;
  const syncedCount = queue.filter((item) => item.status === "SYNCED").length;

  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncProgress(30);

    const timer1 = setTimeout(() => setSyncProgress(75), 600);
    const timer2 = setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setQueue((prev) =>
        prev.map((item) => ({
          ...item,
          status: "SYNCED",
        }))
      );
      setToastMessage(t("allSynced") + " ✓");
      setTimeout(() => setToastMessage(""), 3500);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("syncTitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {toastMessage && (
          <div className="glass-card-emerald px-4 py-3 rounded-2xl flex items-center gap-2.5 animate-fade-in text-emerald-950 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sync Summary Card */}
        <div className="glass-panel p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">{t("syncTitle")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingCount > 0
                  ? `${pendingCount} record(s) ready to upload`
                  : "All records up to date"}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CloudUpload className="w-6 h-6" />
            </div>
          </div>

          {/* Quick Counter Pills */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="glass-card-amber p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Pending
              </span>
              <strong className="text-xl font-black text-amber-950 mt-0.5 block">
                {pendingCount}
              </strong>
            </div>

            <div className="glass-card-emerald p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                Synced
              </span>
              <strong className="text-xl font-black text-emerald-950 mt-0.5 block">
                {syncedCount}
              </strong>
            </div>
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div className="mt-4 animate-fade-in">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                <span>Syncing records...</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sync Action Button */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing || pendingCount === 0}
              className={`w-full font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                pendingCount === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isSyncing
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>
                {isSyncing
                  ? `${t("syncing")}...`
                  : pendingCount === 0
                  ? t("allSynced")
                  : `${t("syncNow")} (${pendingCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* Queued Records Card List */}
        <div className="glass-panel p-4 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 px-1">
            Recent Records
          </h3>
          <div className="space-y-2.5">
            {queue.map((row) => (
              <div
                key={row.id}
                className="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {row.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {row.patientName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{row.type}</span>
                    <span>•</span>
                    <span>{row.timestamp}</span>
                  </div>
                </div>

                <div>
                  {row.status === "SYNCED" ? (
                    <span className="glass-card-emerald text-emerald-900 text-[11px] px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Synced</span>
                    </span>
                  ) : (
                    <span className="glass-card-amber text-amber-950 text-[11px] px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}