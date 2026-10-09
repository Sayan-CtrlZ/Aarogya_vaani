import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  CheckCircle2,
  Printer,
  QrCode,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

export default function SignupStatus() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const role = sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";
  const userName =
    sessionStorage.getItem("aarogyaVaaniUserName") ||
    (role === "doctor" ? "Dr. S. Roy (Medical Officer)" : "Kalpana Reang (ASHA Worker)");
  const facility = sessionStorage.getItem("aarogyaVaaniFacility") || "Bishalgarh CHC";
  const district = sessionStorage.getItem("aarogyaVaaniDistrict") || "Sepahijala District";
  const workerId =
    sessionStorage.getItem("aarogyaVaaniWorkerId") ||
    (role === "doctor" ? "TR-MO-8841" : "TR-ASHA-0412");

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("staffIdTitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Verification Pill */}
        <div className="glass-card-emerald p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">
              Verified Healthcare ID
            </span>
          </div>
          <span className="bg-emerald-700 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            ACTIVE
          </span>
        </div>

        {/* Staff Identity Card */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-emerald-500/30 shadow-md">
          {/* Card Top Pill Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Health Worker Badge</span>
            <span className="text-[11px] font-mono bg-white/20 px-2.5 py-0.5 rounded-md font-bold">
              {role === "doctor" ? "Doctor" : "ASHA"}
            </span>
          </div>

          <div className="p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 border border-emerald-300 text-emerald-900 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {role === "doctor" ? t("doctor") : t("healthWorker")}
              </span>
              <h2 className="text-lg font-black text-slate-900 truncate mt-0.5">{userName}</h2>
              <div className="text-xs text-slate-600 mt-1 font-semibold truncate">
                🏥 {facility} • {district}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="glass-card px-2.5 py-1 text-[11px] font-mono font-bold text-slate-800">
                  ID: {workerId}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Meta */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <div>Facility: <strong className="text-slate-800">{facility}</strong></div>
              <div>District: <strong className="text-slate-800">{district}</strong></div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-2xs">
                <QrCode className="w-12 h-12 text-emerald-700" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 font-bold">
                {workerId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => window.print()}
            className="w-full glass-card hover:bg-white text-slate-700 font-bold text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{t("printIdCard")}</span>
          </button>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}