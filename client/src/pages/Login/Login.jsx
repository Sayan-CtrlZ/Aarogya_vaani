import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersRound,
  Stethoscope,
  KeyRound,
  CheckCircle2,
  Lock,
  User,
  Info,
  ArrowRight,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import { useLanguage } from "../../context/LanguageContext";

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

const HEALTH_CENTRES = {
  "Sepahijala District": ["Bishalgarh CHC", "Boxanagar PHC", "Charilam PHC", "Kathalia PHC"],
  "West Tripura District": ["Mohanpur PHC", "Jirania CHC", "Ranirbazar PHC", "Mandwi PHC"],
  "Gomati District": ["Udaipur District Hospital", "Amarpur SDH", "Kakraban CHC", "Killa PHC"],
  "South Tripura District": ["Belonia SDH", "Santirbazar CHC", "Hrishyamukh PHC", "Jolaibari CHC"],
  "Khowai District": ["Teliamura SDH", "Khowai District Hospital", "Padmabil PHC", "Baijalbari PHC"],
  "Dhalai District": ["Ambassa District Hospital", "Kamalpur SDH", "Manu PHC", "Chawmanu PHC"],
  "Unakoti District": ["Kailashahar District Hospital", "Kumarghat CHC", "Pecharthal PHC"],
  "North Tripura District": ["Dharmanagar District Hospital", "Panisagar CHC", "Kanchanpur SDH", "Damchera PHC"],
};

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState("health-worker");
  const [district, setDistrict] = useState("Sepahijala District");
  const [facility, setFacility] = useState("Bishalgarh CHC");
  const [workerId, setWorkerId] = useState("TR-ASHA-0412");
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState("");

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === "doctor") {
      setWorkerId("TR-MO-8841");
    } else {
      setWorkerId("TR-ASHA-0412");
    }
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    setFacility(HEALTH_CENTRES[newDist][0]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!workerId || !pin) {
      setError("Please fill in Staff ID and 4-digit PIN.");
      return;
    }

    sessionStorage.setItem("aarogyaVaaniRole", selectedRole);
    sessionStorage.setItem(
      "aarogyaVaaniUserName",
      selectedRole === "doctor" ? "Dr. S. Roy" : "Kalpana Reang"
    );
    sessionStorage.setItem("aarogyaVaaniFacility", facility);
    sessionStorage.setItem("aarogyaVaaniDistrict", district);
    sessionStorage.setItem("aarogyaVaaniWorkerId", workerId);

    if (selectedRole === "doctor") {
      navigate("/doctor-review");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("loginTitle")}
        showBack={true}
        backPath="/"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 pb-12 flex flex-col justify-center">
        {/* Soft Glass Notice Banner */}
        <div className="glass-card-emerald p-4 rounded-2xl mb-6 shadow-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-[#0b6651] shrink-0 mt-0.5" />
          <div className="text-sm text-slate-800">
            {t("offlineNotice")}
          </div>
        </div>

        {/* Main Authentication Glass Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md">
          <div className="border-b border-slate-200/70 pb-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t("loginTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t("loginDesc")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Step 1: Role Selection Cards */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3">
                {t("selectRole")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Health Worker Card */}
                <div
                  onClick={() => handleRoleChange("health-worker")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-start gap-4 ${
                    selectedRole === "health-worker"
                      ? "glass-card-emerald border-[#0b6651] shadow-sm"
                      : "bg-white/70 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === "health-worker"
                        ? "bg-[#0b6651] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <UsersRound className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{t("healthWorker")}</h3>
                      {selectedRole === "health-worker" && (
                        <CheckCircle2 className="w-5 h-5 text-[#0b6651]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {t("ashaDesc")}
                    </p>
                  </div>
                </div>

                {/* Doctor Card */}
                <div
                  onClick={() => handleRoleChange("doctor")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-start gap-4 ${
                    selectedRole === "doctor"
                      ? "glass-card-blue border-blue-600 shadow-sm"
                      : "bg-white/70 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === "doctor"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{t("doctor")}</h3>
                      {selectedRole === "doctor" && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {t("docDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: District and Health Facility Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("selectDistrict")}
                </label>
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                >
                  {TRIPURA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("selectFacility")}
                </label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                >
                  {(HEALTH_CENTRES[district] || []).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Staff ID & Security PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("staffId")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    placeholder="e.g. TR-ASHA-0412"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t("pin")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm font-semibold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6651]"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg"
              >
                <span>{t("loginButton")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}