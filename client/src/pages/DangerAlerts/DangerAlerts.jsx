import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  User,
  Clock,
  CheckCircle,
  Bed,
  Ambulance,
  Stethoscope,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const INITIAL_ALERTS = [
  {
    id: "alert-01",
    patientId: "AV-9012",
    name: "Bimala Reang",
    age: "31",
    village: "Karbook",
    type: "Maternal ANC (32 Weeks)",
    sign: "Severe headache / blurred vision (Preeclampsia risk)",
    severity: "CRITICAL",
    time: "09:21 AM",
    vitalNotice: "BP 154/98 mmHg reported in triage assessment",
    status: "PENDING_ACK",
  },
  {
    id: "alert-02",
    patientId: "patient-7",
    name: "Anita Debnath",
    age: "24",
    village: "Bishalgarh",
    type: "Maternal ANC (28 Weeks)",
    sign: "Fresh vaginal bleeding (Haemorrhage risk)",
    severity: "CRITICAL",
    time: "10:14 AM",
    vitalNotice: "Requires urgent clinical speculum exam & referral",
    status: "PENDING_ACK",
  },
  {
    id: "alert-03",
    patientId: "patient-8",
    name: "Pooja Tripura",
    age: "22",
    village: "Manu",
    type: "Maternal ANC (34 Weeks)",
    sign: "Reduced baby movement (Fetal Distress risk)",
    severity: "HIGH",
    time: "10:45 AM",
    vitalNotice: "Fetal Doppler auscultation required immediately",
    status: "ACKNOWLEDGED",
  },
];

export default function DangerAlerts() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [ackMessage, setAckMessage] = useState("");

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a))
    );
    setAckMessage(t("acknowledged") + " ✓");
    setTimeout(() => setAckMessage(""), 3500);
  };

  const pendingCount = alerts.filter((a) => a.status === "PENDING_ACK").length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f7faf9] pb-24">
      <GovHeader
        title="Red-Flag Triage"
        subtitle={`${pendingCount} urgent maternal cases`}
        showBack={true}
        backPath="/"
      />

      <main className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-3 space-y-4">
        {/* Banner Alert Pill */}
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Emergency Queue
              </span>
              <h2 className="text-base sm:text-lg font-black text-rose-950 mt-0.5">
                {pendingCount} Critical Cases Pending
              </h2>
            </div>
          </div>
        </div>

        {ackMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{ackMessage}</span>
          </div>
        )}

        {/* Triage Cases List */}
        <div className="space-y-3">
          {alerts.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-3xl p-4.5 shadow-xs transition-all ${
                item.severity === "CRITICAL"
                  ? "border-rose-200"
                  : "border-amber-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-900">{item.name}</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        ({item.age}y • {item.village})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{item.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
              </div>

              {/* Danger Sign Highlight */}
              <div className="mt-3 bg-rose-50/70 border border-rose-200 rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="text-xs sm:text-sm text-rose-950 font-black block">
                      {item.sign}
                    </strong>
                    <p className="text-[11px] text-rose-900/80 mt-0.5 font-medium">
                      {item.vitalNotice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile-Friendly Action Buttons */}
              <div className="mt-3.5 pt-2 flex flex-wrap items-center gap-2">
                {item.status === "PENDING_ACK" ? (
                  <button
                    onClick={() => handleAcknowledge(item.id)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Acknowledged
                  </span>
                )}

                <button
                  onClick={() => alert(`Calling 108 Ambulance dispatch for ${item.name}...`)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Call 108"
                >
                  <Ambulance className="w-3.5 h-3.5 text-rose-600" />
                  <span>108</span>
                </button>

                <button
                  onClick={() => alert(`Labour Bed allocated at Bishalgarh CHC for ${item.name}.`)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Allocate Bed"
                >
                  <Bed className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bed</span>
                </button>

                <button
                  onClick={() => navigate(`/doctor/review?id=${item.patientId}`)}
                  className="bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}