import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Baby,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Users,
  IdCard,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { generatePatientId } from "../../utils/patientStore";

const TRIPURA_DISTRICTS = [
  "Sepahijala District",
  "West Tripura District",
  "Gomati District",
  "South Tripura District",
  "Khowai District",
  "Dhalai District",
  "Unakoti District",
  "North Tripura District",
];

export default function NewPatient() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [patientId] = useState(() => generatePatientId());
  const [patientType, setPatientType] = useState("maternal");
  const [assistedMode, setAssistedMode] = useState(true);
  const [patientCondition, setPatientCondition] = useState("pregnant_distress");
  const ashaWorkerName = "Kalpana Reang (ASHA Worker)";

  const [formData, setFormData] = useState({
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    phone: "9862100000",
    village: "Bishramganj, Sepahijala",
    district: "Sepahijala District",
    abhaId: "",
    rchId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConditionSelect = (cond) => {
    setPatientCondition(cond);
    if (cond === "pregnant_distress") {
      setAssistedMode(true);
      setPatientType("maternal");
      setFormData((prev) => ({
        ...prev,
        name: prev.name === "Birendra Tripura" ? "Mamta Debbarma" : prev.name,
        age: prev.age === "68" ? "27" : prev.age,
        gender: "Female",
      }));
    } else if (cond === "elderly_frail") {
      setAssistedMode(true);
      setPatientType("general");
      setFormData((prev) => ({
        ...prev,
        name: prev.name === "Mamta Debbarma" ? "Birendra Tripura" : prev.name,
        age: prev.age === "27" ? "68" : prev.age,
        gender: prev.gender || "Male",
      }));
    } else if (cond === "acute_frail") {
      setAssistedMode(true);
      setPatientType("general");
    } else if (cond === "direct") {
      setAssistedMode(false);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age.trim()) {
      alert("Please enter patient name and age.");
      return;
    }

    const patientRecord = {
      id: patientId,
      patient: {
        ...formData,
        id: patientId,
      },
      patientType,
      assistedMode,
      assistedBy: assistedMode ? ashaWorkerName : null,
      patientCondition: assistedMode ? patientCondition : "direct",
      assistedReason:
        !assistedMode
          ? "Direct patient self-intake"
          : patientCondition === "pregnant_distress"
          ? "Pregnant mother in distress / pain (ASHA assisted intake)"
          : patientCondition === "elderly_frail"
          ? `Elderly patient (${formData.gender === "Female" ? "Old woman" : "Old man"} unable to operate phone)`
          : "Frail patient unable to use phone directly",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aarogyaVaaniCurrentPatient",
      JSON.stringify(patientRecord)
    );

    navigate("/interview");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("newPatientTitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 pb-24">
        {/* Main Registration Card */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md">
          <div className="border-b border-slate-200/70 pb-4 mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t("newPatientTitle")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register patient to start AI voice assessment
              </p>
            </div>
            <div className="glass-card-emerald px-3 py-1.5 rounded-xl border border-emerald-500/30 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Patient ID</span>
              <strong className="font-mono text-sm font-black text-emerald-950">{patientId}</strong>
            </div>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* 1. Intake Operator & Assisted Scenario Selection */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-4.5 rounded-2xl border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                    Intake Mode
                  </span>
                  <h4 className="text-sm font-black text-emerald-950">
                    Who is operating the phone?
                  </h4>
                </div>
                {assistedMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                    👩‍⚕️ ASHA Proxy
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed font-medium">
                If the patient is not in a condition to operate the phone (pregnant mother in distress, old man/woman), the ASHA worker records on their behalf.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Scenario 1: Pregnant Mother in Distress */}
                <button
                  type="button"
                  onClick={() => handleConditionSelect("pregnant_distress")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    assistedMode && patientCondition === "pregnant_distress"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300"
                      : "bg-white/85 text-slate-800 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <span>🤰</span> Pregnant Mother in Distress
                    </span>
                    {assistedMode && patientCondition === "pregnant_distress" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      assistedMode && patientCondition === "pregnant_distress"
                        ? "text-emerald-100"
                        : "text-slate-500"
                    }`}
                  >
                    Pain / contractions, unable to hold phone
                  </span>
                </button>

                {/* Scenario 2: Elderly Patient (Old Man / Woman) */}
                <button
                  type="button"
                  onClick={() => handleConditionSelect("elderly_frail")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    assistedMode && patientCondition === "elderly_frail"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300"
                      : "bg-white/85 text-slate-800 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <span>👴</span> Elderly (Old Man / Woman)
                    </span>
                    {assistedMode && patientCondition === "elderly_frail" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      assistedMode && patientCondition === "elderly_frail"
                        ? "text-emerald-100"
                        : "text-slate-500"
                    }`}
                  >
                    Bedridden, frail, or unable to use mobile
                  </span>
                </button>

                {/* Scenario 3: Acute Frail / Child */}
                <button
                  type="button"
                  onClick={() => handleConditionSelect("acute_frail")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    assistedMode && patientCondition === "acute_frail"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300"
                      : "bg-white/85 text-slate-800 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <span>🤒</span> Acute Emergency / Frail
                    </span>
                    {assistedMode && patientCondition === "acute_frail" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      assistedMode && patientCondition === "acute_frail"
                        ? "text-emerald-100"
                        : "text-slate-500"
                    }`}
                  >
                    High fever, vomiting, or altered state
                  </span>
                </button>

                {/* Scenario 4: Direct Patient Self */}
                <button
                  type="button"
                  onClick={() => handleConditionSelect("direct")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    !assistedMode
                      ? "bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-blue-300"
                      : "bg-white/85 text-slate-800 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <span>👤</span> Direct Patient Self-Intake
                    </span>
                    {!assistedMode && (
                      <CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      !assistedMode ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    Patient speaks directly to AI
                  </span>
                </button>
              </div>

              {assistedMode && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/50 flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    ASHA Field Worker: <span className="text-emerald-800">{ashaWorkerName}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">Dhalai / Sepahijala</span>
                </div>
              )}
            </div>

            {/* Module Selection (Colored Glass Cards) */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3">
                {t("clinicalModule")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Maternal ANC Module */}
                <div
                  onClick={() => setPatientType("maternal")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-start gap-4 ${
                    patientType === "maternal"
                      ? "glass-card-emerald border-[#0b6651] shadow-sm"
                      : "bg-white/70 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      patientType === "maternal"
                        ? "bg-[#0b6651] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Baby className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{t("maternalModule")}</h3>
                      {patientType === "maternal" && (
                        <CheckCircle2 className="w-5 h-5 text-[#0b6651]" />
                      )}
                    </div>
                    <span className="inline-block bg-emerald-600/15 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-bold mt-1">
                      Maternal ANC
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {t("maternalModuleSub")}
                    </p>
                  </div>
                </div>

                {/* General Outpatient Module */}
                <div
                  onClick={() => setPatientType("general")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-start gap-4 ${
                    patientType === "general"
                      ? "glass-card-blue border-blue-600 shadow-sm"
                      : "bg-white/70 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      patientType === "general"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{t("generalModule")}</h3>
                      {patientType === "general" && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <span className="inline-block bg-blue-600/15 text-blue-800 text-[11px] px-2 py-0.5 rounded font-bold mt-1">
                      General / Geriatric OPD
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {t("generalModuleSub")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ABHA / Govt Health IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("abhaId")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="abhaId"
                    value={formData.abhaId}
                    onChange={handleChange}
                    placeholder="91-XXXX-XXXX-XXXX"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("rchId")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Baby className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="rchId"
                    value={formData.rchId}
                    onChange={handleChange}
                    placeholder="TR-RCH-XXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>
            </div>

            {/* Patient Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("fullName")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Mamta Debbarma"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("age")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="27"
                    required
                    min="1"
                    max="110"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>
            </div>

            {/* Patient Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Patient Gender {patientCondition === "elderly_frail" && <span className="text-emerald-700 lowercase font-medium">(Select Old Man / Old Woman)</span>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, gender: "Female" }))}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.gender === "Female"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white/80 text-slate-700 border-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  <span>Female {patientCondition === "elderly_frail" ? "(Old Woman)" : ""}</span>
                  {formData.gender === "Female" && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, gender: "Male" }))}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.gender === "Male"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white/80 text-slate-700 border-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  <span>Male {patientCondition === "elderly_frail" ? "(Old Man)" : ""}</span>
                  {formData.gender === "Male" && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                </button>
              </div>
            </div>

            {/* Phone & Address / Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("phone")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("village")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Bishramganj, Sepahijala"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200/70">
              <button
                type="submit"
                className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg"
              >
                <span>Start AI Voice Intake</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}