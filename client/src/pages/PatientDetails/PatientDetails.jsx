import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  User,
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Heart,
  Droplet,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const PATIENT_DATABASE = {
  "patient-1": {
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    village: "Bishramganj, Sepahijala District",
    phone: "9862100000",
    abhaId: "91-4829-1048-2831",
    rchId: "TR-RCH-89211",
    type: "Maternal & Antenatal (ANC)",
    status: "Completed",
    gestationalWeeks: "20 Weeks (2nd Trimester)",
    gravidaPara: "G2 P1 L1 A0",
    lmp: "15-May-2026",
    edd: "19-Feb-2027",
    vitals: {
      bp: "118/76 mmHg",
      weight: "54 kg",
      hb: "10.4 g/dL",
      fetalHeartRate: "142 bpm (Regular)",
    },
    visits: [
      {
        visit: "ANC Visit 1 (Registration)",
        date: "10-Jul-2026",
        facility: "Bishalgarh CHC",
        notes: "Urine pregnancy test positive. TT-1 injection given. IFA 100 tablets issued.",
      },
      {
        visit: "ANC Visit 2 (Current)",
        date: "Today, 10-Oct-2026",
        facility: "Bishalgarh CHC",
        notes: "Quick ultrasound scan recommended. Fetal movements normal. No bleeding or severe headache.",
      },
    ],
    dangerSigns: [],
    medications: ["Iron Folic Acid (IFA) - 1 daily", "Calcium Carbonate 500mg - 2 daily"],
  },
  "patient-4": {
    name: "Bimala Reang",
    age: "31",
    gender: "Female",
    village: "Karbook, Gomati District",
    phone: "9436100000",
    abhaId: "91-9921-4401-2098",
    rchId: "TR-RCH-90112",
    type: "Maternal & Antenatal (ANC)",
    status: "Urgent",
    gestationalWeeks: "32 Weeks (3rd Trimester)",
    gravidaPara: "G3 P2 L2 A0",
    lmp: "22-Feb-2026",
    edd: "29-Nov-2026",
    vitals: {
      bp: "152/98 mmHg (Elevated)",
      weight: "61 kg",
      hb: "9.2 g/dL (Mild Anaemia)",
      fetalHeartRate: "138 bpm",
    },
    visits: [
      {
        visit: "ANC Visit 3 (Emergency Triage)",
        date: "Today, 09:21 AM",
        facility: "Karbook Sub-Centre -> Bishalgarh CHC",
        notes: "Patient reported acute severe headache and visual blurring. High risk of preeclampsia. Urgent Medical Officer review requested.",
      },
    ],
    dangerSigns: ["Severe headache or blurred vision (Preeclampsia risk)"],
    medications: ["Methyldopa (under doctor review)", "Iron Folic Acid"],
  },
};

export default function PatientDetails() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "patient-1";

  const patient = useMemo(() => {
    if (id === "current-patient") {
      try {
        const stored = JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}");
        const answers = JSON.parse(localStorage.getItem("aarogyaVaaniInterview") || "{}").answers || {};
        const danger = JSON.parse(localStorage.getItem("aarogyaVaaniDangerCheck") || "{}").dangerSigns || [];
        if (stored.patient) {
          return {
            name: stored.patient.name,
            age: stored.patient.age,
            gender: stored.patient.gender || "Female",
            village: stored.patient.village || "Sepahijala",
            phone: stored.patient.phone || "9862000000",
            abhaId: stored.patient.abhaId || "91-4829-1048-2831",
            rchId: stored.patient.rchId || "TR-RCH-89211",
            type: stored.patientType === "maternal" ? "Maternal & Antenatal (ANC)" : "General OPD",
            status: danger.length > 0 ? "Urgent" : "Pending Review",
            gestationalWeeks: `${answers.pregnancyMonths || "5"} Months`,
            gravidaPara: "G1 P0",
            vitals: { bp: "120/80 mmHg", weight: "52 kg", hb: "10.2 g/dL", fetalHeartRate: "140 bpm" },
            visits: [{ visit: "Intake Visit", date: "Today", facility: "PHC Bishalgarh", notes: "Current voice intake." }],
            dangerSigns: danger.map((d) => (typeof d === "string" ? d : d.title || d.sign)),
            medications: ["Iron Folic Acid tablets"],
          };
        }
      } catch {
        // fallback
      }
    }
    return PATIENT_DATABASE[id] || PATIENT_DATABASE["patient-1"];
  }, [id]);

  const isUrgent = patient.status === "Urgent" || patient.dangerSigns?.length > 0;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("profileTitle")}
        showBack={true}
        backPath="/patients"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Urgent Alert Banner */}
        {isUrgent && (
          <div className="glass-card-red p-4 rounded-2xl flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Critical Red Flag
              </span>
              <h3 className="text-base font-extrabold text-red-950 mt-1">
                {t("urgentAlerts")}
              </h3>
              <p className="text-xs text-red-900/90 mt-0.5 font-semibold">
                {patient.dangerSigns?.join(", ") || "Critical maternal indicators reported."}
              </p>
            </div>
          </div>
        )}

        {/* Digital Health ID Card */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-emerald-500/30 shadow-md">
          {/* Card Top Pill Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Digital Health Card</span>
            </div>
            <span className="text-[11px] font-mono bg-white/20 px-2.5 py-0.5 rounded-md font-bold">
              {patient.type?.includes("Maternal") ? "ANC" : "OPD"}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 border border-emerald-300 text-emerald-900 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 truncate">{patient.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-semibold flex-wrap">
                  <span>{patient.age} {t("age")}</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                  <span>•</span>
                  <span className="truncate">{patient.village}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
                  <div className="glass-card px-2.5 py-1 font-mono font-bold text-slate-800 text-[11px]">
                    ABHA: {patient.abhaId}
                  </div>
                  <div className="glass-card-emerald px-2.5 py-1 font-mono font-bold text-emerald-950 text-[11px]">
                    RCH: {patient.rchId}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate("/doctor-review")}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{t("openChart")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.print()}
                className="glass-card hover:bg-white text-slate-700 font-bold text-xs px-3.5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>{t("printSlip")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Antenatal Care (ANC) Maternal Status Grid - 2x2 for mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card-emerald p-3.5 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">{t("gestationalWeeks")}</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Baby className="w-4 h-4 text-emerald-700 shrink-0" />
              <strong className="text-sm text-emerald-950 font-black truncate">{patient.gestationalWeeks}</strong>
            </div>
          </div>

          <div className="glass-card-blue p-3.5 rounded-2xl">
            <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider">{t("bloodPressure")}</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Heart className={`w-4 h-4 ${patient.vitals?.bp?.includes("152") ? "text-red-600" : "text-sky-700"} shrink-0`} />
              <strong className={`text-sm font-black truncate ${patient.vitals?.bp?.includes("152") ? "text-red-700" : "text-sky-950"}`}>
                {patient.vitals?.bp}
              </strong>
            </div>
          </div>

          <div className="glass-card-amber p-3.5 rounded-2xl">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">{t("hemoglobin")}</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Droplet className="w-4 h-4 text-amber-700 shrink-0" />
              <strong className="text-sm text-amber-950 font-black">{patient.vitals?.hb}</strong>
            </div>
          </div>

          <div className="glass-card-purple p-3.5 rounded-2xl">
            <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider">{t("fetalHeartRate")}</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Heart className="w-4 h-4 text-purple-700 shrink-0" />
              <strong className="text-sm text-purple-950 font-black">{patient.vitals?.fetalHeartRate?.split(" ")[0]} bpm</strong>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-panel p-4 rounded-3xl">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{t("ancTimeline")}</span>
          </h4>
          <div className="space-y-2.5">
            {patient.visits?.map((v, i) => (
              <div key={i} className="glass-card p-3 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                  <span className="text-emerald-800">{v.visit}</span>
                  <span>{v.date}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">{v.facility}</p>
                <p className="text-xs text-slate-700 mt-1 font-medium">{v.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prescribed Medications */}
        <div className="glass-panel p-4 rounded-3xl">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>{t("medications")}</span>
          </h4>
          <div className="space-y-2">
            {patient.medications?.map((m, i) => (
              <div key={i} className="glass-card-emerald p-2.5 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{m}</span>
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