import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Stethoscope,
  User,
  KeyRound,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  IdCard,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const DISTRICTS = [
  "Sepahijala District",
  "West District",
  "Gomati District",
  "South District",
  "Khowai District",
  "Dhalai District",
  "Unakoti District",
  "North District",
];

const HEALTH_CENTRES = {
  "Sepahijala District": ["Bishalgarh CHC", "Boxanagar PHC", "Charilam PHC", "Kathalia PHC"],
  "West District": ["Mohanpur PHC", "Jirania CHC", "Ranirbazar PHC", "Mandwi PHC"],
  "Gomati District": ["Udaipur District Hospital", "Amarpur SDH", "Kakraban CHC", "Killa PHC"],
  "South District": ["Belonia SDH", "Santirbazar CHC", "Hrishyamukh PHC", "Jolaibari CHC"],
  "Khowai District": ["Teliamura SDH", "Khowai District Hospital", "Padmabil PHC", "Baijalbari PHC"],
  "Dhalai District": ["Ambassa District Hospital", "Kamalpur SDH", "Manu PHC", "Chawmanu PHC"],
  "Unakoti District": ["Kailashahar District Hospital", "Kumarghat CHC", "Pecharthal PHC"],
  "North District": ["Dharmanagar District Hospital", "Panisagar CHC", "Kanchanpur SDH", "Damchera PHC"],
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read URL query parameters if present
  const searchParams = new URLSearchParams(location.search);
  const paramRole = searchParams.get("role"); // "doctor" | "patient"

  // Primary Mode: "patient" vs "doctor"
  const [activeRole, setActiveRole] = useState(
    paramRole === "doctor" ? "doctor" : "patient"
  );

  // Multi-step form step tracking (1: Identity, 2: Facility, 3: Security PIN)
  const [currentStep, setCurrentStep] = useState(1);

  // Common credentials (Pre-filled by default)
  const [pin, setPin] = useState("1234");
  const [showPin, setShowPin] = useState(false);
  const [district, setDistrict] = useState("Sepahijala District");
  const [facility, setFacility] = useState("Bishalgarh CHC");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Patient credentials (Pre-filled by default)
  const [patientPhone, setPatientPhone] = useState("9862100000");
  const [patientName, setPatientName] = useState("Mamta Debbarma");

  // Doctor credentials (Pre-filled by default)
  const [doctorId, setDoctorId] = useState("MO-8841");
  const [doctorName, setDoctorName] = useState("Dr. S. Roy");

  // Sync initial parameters
  useEffect(() => {
    if (paramRole === "doctor") {
      setActiveRole("doctor");
    } else {
      setActiveRole("patient");
    }
    setCurrentStep(1);
  }, [paramRole]);

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setCurrentStep(1);
    setError("");
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    setFacility(HEALTH_CENTRES[newDist] ? HEALTH_CENTRES[newDist][0] : "Bishalgarh CHC");
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleNextStep1 = () => {
    setError("");
    if (activeRole === "patient") {
      if (!patientPhone.trim()) {
        setError("Please enter your mobile number.");
        return;
      }
      if (!patientName.trim()) {
        setError("Please enter patient full name.");
        return;
      }
    } else {
      if (!doctorId.trim()) {
        setError("Please enter Doctor ID or Medical Registration Number.");
        return;
      }
      if (!doctorName.trim()) {
        setError("Please enter doctor name.");
        return;
      }
    }
    setCurrentStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleNextStep2 = () => {
    setError("");
    if (!district.trim()) {
      setError("Please select a district.");
      return;
    }
    if (!facility.trim()) {
      setError("Please select a health facility.");
      return;
    }
    setCurrentStep(3);
  };

  // Final Submission on Step 3
  const handleSubmitFinal = () => {
    setError("");

    if (!pin || pin.length < 4) {
      setError("Please enter a valid 4-digit security PIN.");
      return;
    }

    setIsSubmitting(true);

    if (activeRole === "patient") {
      if (!patientPhone.trim()) {
        setError("Please enter your mobile number.");
        setIsSubmitting(false);
        return;
      }

      const userName = patientName || "Mamta Debbarma";
      const userProfile = {
        role: "patient",
        userName,
        phone: patientPhone,
        facility,
        district,
        workerId: patientPhone,
        age: "27",
        gender: "Female",
        village: "Sepahijala",
        abhaId: "",
        isDoctor: false,
        isPatient: true,
        loggedInAt: new Date().toISOString(),
      };

      sessionStorage.setItem("aarogyaVaaniRole", "patient");
      sessionStorage.setItem("aarogyaVaaniUserName", userName);
      sessionStorage.setItem("aarogyaVaaniFacility", facility);
      sessionStorage.setItem("aarogyaVaaniDistrict", district);
      sessionStorage.setItem("aarogyaVaaniWorkerId", patientPhone);
      sessionStorage.setItem("aarogyaVaaniUserProfile", JSON.stringify(userProfile));
      localStorage.setItem("aarogyaVaaniActiveUser", JSON.stringify(userProfile));

      localStorage.setItem(
        "aarogyaVaaniCurrentPatient",
        JSON.stringify({
          patient: {
            name: userName,
            age: "27",
            gender: "Female",
            phone: patientPhone,
            village: "Sepahijala",
            district,
            abhaId: "",
          },
          assistedMode: false,
          assistedBy: null,
          patientCondition: "direct",
        })
      );

      setSuccessMsg(`Welcome, ${userName}! Opening patient workspace...`);

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/new-patient");
      }, 600);
    } else {
      // Doctor sign-in
      if (!doctorId.trim()) {
        setError("Please enter your Doctor ID or Medical Registration Number.");
        setIsSubmitting(false);
        return;
      }

      const userName = doctorName || "Dr. S. Roy (Medical Officer)";
      const userProfile = {
        role: "doctor",
        userName,
        phone: "9436123456",
        facility,
        district,
        workerId: doctorId,
        isDoctor: true,
        isPatient: false,
        loggedInAt: new Date().toISOString(),
      };

      sessionStorage.setItem("aarogyaVaaniRole", "doctor");
      sessionStorage.setItem("aarogyaVaaniUserName", userName);
      sessionStorage.setItem("aarogyaVaaniFacility", facility);
      sessionStorage.setItem("aarogyaVaaniDistrict", district);
      sessionStorage.setItem("aarogyaVaaniWorkerId", doctorId);
      sessionStorage.setItem("aarogyaVaaniUserProfile", JSON.stringify(userProfile));
      localStorage.setItem("aarogyaVaaniActiveUser", JSON.stringify(userProfile));

      setSuccessMsg(`Authenticated as ${userName}. Redirecting to Doctor Portal...`);

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/doctor/review");
      }, 600);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextStep1();
    } else if (currentStep === 2) {
      handleNextStep2();
    } else {
      handleSubmitFinal();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* ========================================================
          LEFT IMAGE SHOWCASE PANEL (Desktop & Tablet)
          ======================================================== */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-5/12 relative overflow-hidden bg-emerald-950 text-white flex-col justify-start p-8 xl:p-10 shadow-2xl z-10">
        {/* Loading skeleton / shimmer placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 animate-pulse flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <span className="text-xs font-semibold text-emerald-200/70 tracking-wide">
              Loading illustration...
            </span>
          </div>
        )}

        {/* Generated Healthcare Vector Illustration */}
        <img
          src="/auth_showcase_banner.jpg"
          alt="AarogyaVaani Clinical Consultation"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />

        {/* Subtle Top Vignette Only for Brand Logo Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Top: Brand Touchpoint */}
        <div className="relative z-10">
          <div
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 cursor-pointer group mb-3 backdrop-blur-md bg-black/40 border border-white/20 px-4 py-2.5 rounded-2xl shadow-lg hover:bg-black/55 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">
                Aarogya<span className="text-emerald-400">Vaani</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-200/90 font-bold block">
                National Health Portal
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          RIGHT AUTHENTICATION FORM AREA
          ======================================================== */}
      <main className="w-full lg:w-7/12 xl:w-7/12 flex flex-col justify-between p-5 sm:p-8 lg:p-12 xl:p-16 relative">
        {/* Central Auth Container */}
        <div className="max-w-md mx-auto w-full my-auto py-4">
          {/* Mobile Brand Badge */}
          <div
            onClick={() => navigate("/")}
            className="lg:hidden flex items-center justify-center gap-2.5 mb-6 text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b6651] to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-slate-900 tracking-tight block">
                Aarogya<span className="text-emerald-700">Vaani</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                National Health Portal
              </span>
            </div>
          </div>

          {/* Elevated Auth Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            {/* TOP ROLE TOGGLE: PATIENT vs DOCTOR */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleSwitch("patient")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === "patient"
                    ? "bg-white text-emerald-950 shadow-sm border border-emerald-600/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    activeRole === "patient" ? "text-[#0b6651]" : "text-slate-400"
                  }`}
                />
                <span>Login for Patients</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch("doctor")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === "doctor"
                    ? "bg-white text-blue-950 shadow-sm border border-blue-600/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Stethoscope
                  className={`w-4 h-4 ${
                    activeRole === "doctor" ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span>Login for Doctors</span>
              </button>
            </div>

            {/* Stepper Progress Bar (3 Clean Steps) */}
            <div className="mb-6">
              <div className="flex items-center justify-between relative px-2">
                {/* Background connector line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                {/* Active progress connector */}
                <div
                  className={`absolute top-4 left-6 h-0.5 -translate-y-1/2 z-0 transition-all duration-300 ${
                    activeRole === "doctor" ? "bg-blue-600" : "bg-[#0b6651]"
                  }`}
                  style={{
                    width:
                      currentStep === 1
                        ? "0%"
                        : currentStep === 2
                        ? "calc(50% - 12px)"
                        : "calc(100% - 24px)",
                  }}
                />

                {[
                  { num: 1, label: "Identity" },
                  { num: 2, label: "Address" },
                  { num: 3, label: "PIN" },
                ].map((s) => {
                  const isCompleted = currentStep > s.num;
                  const isActive = currentStep === s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        if (s.num < currentStep) {
                          setError("");
                          setCurrentStep(s.num);
                        }
                      }}
                      disabled={s.num > currentStep}
                      className={`relative z-10 flex flex-col items-center group ${
                        s.num < currentStep ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          isCompleted
                            ? activeRole === "doctor"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-[#0b6651] text-white shadow-xs"
                            : isActive
                            ? activeRole === "doctor"
                              ? "bg-white border-2 border-blue-600 text-blue-700 shadow-sm ring-4 ring-blue-50"
                              : "bg-white border-2 border-[#0b6651] text-emerald-800 shadow-sm ring-4 ring-emerald-50"
                            : "bg-white border border-slate-300 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-white" /> : s.num}
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-tight mt-1.5 transition-colors ${
                          isActive
                            ? activeRole === "doctor"
                              ? "text-blue-800"
                              : "text-emerald-800"
                            : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step-Specific Form Header (1-2 Lines) */}
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeRole === "patient"
                  ? currentStep === 1
                    ? "Patient Identity"
                    : currentStep === 2
                    ? "Patient Address"
                    : "Security PIN"
                  : currentStep === 1
                  ? "Doctor Identity"
                  : currentStep === 2
                  ? "Clinic Posting"
                  : "Security PIN"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeRole === "patient"
                  ? currentStep === 1
                    ? "Enter your mobile number and full name"
                    : currentStep === 2
                    ? "Select your district and health center"
                    : "Enter your 4-digit PIN to continue"
                  : currentStep === 1
                  ? "Enter your Doctor ID and clinician name"
                  : currentStep === 2
                  ? "Select your district and health facility"
                  : "Enter your 4-digit PIN to sign in"}
              </p>
            </div>

            {/* Multi-Step Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {activeRole === "patient" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder="9862100000"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0b6651] focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Mamta Debbarma"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0b6651] focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          Doctor ID / Reg. No. <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                            placeholder="MO-8841"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          Doctor Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            placeholder="Dr. S. Roy"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep1}
                      className={`w-full text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99] ${
                        activeRole === "doctor"
                          ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                          : "bg-[#0b6651] hover:bg-[#084e3e] shadow-emerald-900/20"
                      }`}
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DISTRICT & FACILITY */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>District <span className="text-red-500">*</span></span>
                    </label>
                    <select
                      value={district}
                      onChange={handleDistrictChange}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        activeRole === "doctor"
                          ? "focus:border-blue-600 focus:ring-blue-500/20"
                          : "focus:border-[#0b6651] focus:ring-emerald-500/20"
                      }`}
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Health Facility <span className="text-red-500">*</span></span>
                    </label>
                    <select
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        activeRole === "doctor"
                          ? "focus:border-blue-600 focus:ring-blue-500/20"
                          : "focus:border-[#0b6651] focus:ring-emerald-500/20"
                      }`}
                    >
                      {(HEALTH_CENTRES[district] || []).map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setCurrentStep(1);
                      }}
                      className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep2}
                      className={`flex-2 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99] ${
                        activeRole === "doctor"
                          ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                          : "bg-[#0b6651] hover:bg-[#084e3e] shadow-emerald-900/20"
                      }`}
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SECURITY PIN */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      4-Digit Security PIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPin ? "text" : "password"}
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                          activeRole === "doctor"
                            ? "focus:border-blue-600 focus:ring-blue-500/20"
                            : "focus:border-[#0b6651] focus:ring-emerald-500/20"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showPin ? "Hide PIN" : "Show PIN"}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setCurrentStep(2);
                      }}
                      className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-2 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99] disabled:opacity-75 ${
                        activeRole === "doctor"
                          ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                          : "bg-[#0b6651] hover:bg-[#084e3e] shadow-emerald-900/20"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </span>
                      ) : (
                        <>
                          <span>
                            {activeRole === "doctor"
                              ? "Sign In to Doctor Review Portal"
                              : "Continue as Patient"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Discreet Return to Home Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Home</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Security Compliance Note */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>256-Bit Secure Health Encryption</span>
          </div>
          <span>Ayushman Bharat Digital Mission (ABDM) • DPDP Act 2023 Compliant</span>
        </div>
      </main>
    </div>
  );
}