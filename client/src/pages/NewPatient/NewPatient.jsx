import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { generatePatientId } from "../../utils/patientStore";

export default function NewPatient() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Retrieve active session profile
  const storedUser = JSON.parse(
    localStorage.getItem("aarogyaVaaniActiveUser") ||
    sessionStorage.getItem("aarogyaVaaniUserProfile") ||
    "{}"
  );

  const [patientId] = useState(() => generatePatientId());

  // Clean, minimal form fields
  const [formData, setFormData] = useState({
    name: storedUser.userName && storedUser.role === "patient" ? storedUser.userName : "Mamta Debbarma",
    age: storedUser.age || "27",
    gender: storedUser.gender || "Female",
    phone: storedUser.phone || "9862100000",
    village: storedUser.village || "Bishramganj, Sepahijala",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartConsultation = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age.trim()) {
      alert("Please enter patient name and age.");
      return;
    }

    const isHelper = storedUser.role === "helper" || storedUser.isMedicalHelper;

    const patientRecord = {
      id: patientId,
      patient: {
        ...formData,
        id: patientId,
      },
      patientType: formData.gender === "Female" && Number(formData.age) < 50 ? "maternal" : "general",
      assistedMode: isHelper,
      assistedBy: isHelper ? storedUser.userName || "Kalpana Reang (ASHA Worker)" : null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aarogyaVaaniCurrentPatient",
      JSON.stringify(patientRecord)
    );

    // Direct transition to the voice consultation & report intake page
    navigate("/interview");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-16">
      <GovHeader
        title="Patient Intake"
        subtitle="Simple Clinical Check-in"
        showBack={true}
        backPath="/"
      />

      <main className="flex-1 w-full max-w-lg lg:max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Simple & Clean Patient Card */}
        <div className="glass-panel rounded-3xl p-5 sm:p-7 lg:p-8 border border-white/90 shadow-md">
          {/* Header */}
          <div className="border-b border-slate-200/70 pb-4 mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Quick Check-In</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Patient Details
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Provide your details to enter the AI Voice & Report consultation.
              </p>
            </div>

            <div className="glass-card-emerald px-3 py-1.5 rounded-xl border border-emerald-500/30 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">ID</span>
              <strong className="font-mono text-xs sm:text-sm font-black text-emerald-950">{patientId}</strong>
            </div>
          </div>

          <form onSubmit={handleStartConsultation} className="space-y-5">
            {/* Full Name & Age (2 Columns on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Mamta Debbarma"
                    required
                    className="w-full pl-9 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="27"
                    required
                    min="1"
                    max="115"
                    className="w-full pl-9 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Gender Selection (Simple 3 options) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {["Female", "Male", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.gender === g
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{g}</span>
                    {formData.gender === g && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Phone & Village (Optional/Simple) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Village / Locality
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Bishramganj, Sepahijala"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg active:scale-[0.99]"
              >
                <span>Continue to AI Voice & Report Intake</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}