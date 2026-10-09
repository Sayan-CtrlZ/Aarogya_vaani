import React, { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  HeartPulse,
  Home,
  Languages,
  Mic,
  ShieldCheck,
  UserRound,
  UsersRound,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tripura_in_India.svg/800px-Tripura_in_India.svg.png";

function NewPatient() {
  const navigate = useNavigate();
  const [patientType, setPatientType] = useState("maternal");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    village: "",
  });

  const userName =
    sessionStorage.getItem("aarogyaVaaniUsername") || "Health Worker";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const handleContinue = () => {
    if (!formData.name.trim()) {
      alert("Please enter the patient's name.");
      return;
    }

    if (!formData.age.trim()) {
      alert("Please enter the patient's age.");
      return;
    }

    const patientRecord = {
      patient: formData,
      patientType,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aarogyaVaaniCurrentPatient",
      JSON.stringify(patientRecord)
    );

    navigate("/consent");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f6fbf8_0%,#eef7f2_48%,#f8fbf9_100%)] text-[#183c31] font-sans">

      {/* =====================================================
          TRIPURA BACKGROUND
          ===================================================== */}

      <div className="fixed right-[-80px] top-[70px] w-[470px] h-[620px] opacity-7 pointer-events-none z-0 flex justify-center items-center max-[1000px]:right-[-130px] max-[1000px]:opacity-5 max-[560px]:w-[350px] max-[560px]:h-[500px] max-[560px]:right-[-120px] max-[560px]:top-[230px] max-[560px]:opacity-[0.045]">
        <img
          src={TRIPURA_MAP_URL}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain filter grayscale brightness-[0.65] sepia"
        />
      </div>

      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_88%_28%,rgba(24,117,79,0.1),transparent_30%),radial-gradient(circle_at_5%_90%,rgba(45,137,99,0.06),transparent_25%)]"></div>

      {/* =====================================================
          TOP NAVIGATION
          ===================================================== */}

      <header className="relative z-10 w-full min-h-[78px] px-[6%] bg-[rgba(9,49,38,0.98)] flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] shadow-[0_5px_25px_rgba(5,39,29,0.12)] max-[1000px]:px-[4%] max-[760px]:min-h-[70px] max-[560px]:px-[18px]">

        <div className="flex flex-col">
          <div className="text-white text-[21px] font-[850] tracking-[-0.6px] leading-[1.1] max-[560px]:text-[18px]">
            AarogyaVaani
          </div>

          <div className="mt-[5px] text-[#91c7a9] text-[9px] font-bold uppercase tracking-[1.5px] max-[560px]:text-[8px]">
            Tripura Health
          </div>
        </div>

        <div className="flex items-center gap-[24px] max-[760px]:gap-[10px]">

          <div className="flex items-center gap-[7px] text-[#c6e7d3] text-[10px] font-bold px-[12px] py-[8px] border border-[rgba(183,229,201,0.15)] rounded-full bg-[rgba(255,255,255,0.045)] max-[560px]:hidden">
            <span className="w-[7px] h-[7px] rounded-full bg-[#62d48d] shadow-[0_0_0_4px_rgba(98,212,141,0.12)]"></span>
            <WifiOff size={14} />
            <span className="max-[760px]:hidden">Offline Ready</span>
          </div>

          <div className="flex items-center gap-[9px]">
            <div className="w-[36px] h-[36px] rounded-full bg-[#d8f0e0] text-[#126047] flex items-center justify-center">
              <UserRound size={17} />
            </div>

            <div className="flex flex-col gap-[2px] max-[760px]:hidden">
              <strong className="text-white text-[10px]">{userName}</strong>
              <span className="text-[rgba(255,255,255,0.48)] text-[8px]">Health Worker</span>
            </div>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="relative z-[2] w-[min(1180px,88%)] mx-auto py-[28px] pb-[55px] max-[1000px]:w-[92%] max-[760px]:w-[94%] max-[760px]:pt-[21px] max-[560px]:w-[92%] max-[560px]:pb-[35px] max-[380px]:w-[94%]">

        {/* BACK BUTTON */}

        <button
          className="border-0 bg-transparent text-[#527268] inline-flex items-center gap-[8px] py-[5px] text-[11px] font-[750] cursor-pointer transition-[0.2s_ease] hover:text-[#126047] hover:-translate-x-[3px]"
          onClick={goToDashboard}
        >
          <ArrowLeft size={17} />
          <span>Back to Dashboard</span>
        </button>

        {/* BREADCRUMB */}

        <div className="mt-[15px] flex items-center gap-[8px] text-[#91a19a] text-[9px] max-[560px]:text-[8px]">
          <span>Dashboard</span>
          <span>/</span>
          <strong className="text-[#277356]">New Patient Intake</strong>
        </div>

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="mt-[19px] flex items-end justify-between gap-[30px] max-[1000px]:items-start max-[1000px]:flex-col max-[560px]:mt-[15px]">

          <div>

            <div className="inline-flex items-center gap-[7px] text-[#237653] text-[9px] font-[850] tracking-[1.4px]">
              <Activity size={14} />
              <span>PRIMARY HEALTH CENTRE</span>
            </div>

            <h1 className="max-w-[700px] mt-[11px] text-[#123c30] text-[clamp(34px,5vw,53px)] leading-[1.02] tracking-[-2px] font-black max-[760px]:text-[38px] max-[560px]:mt-[9px] max-[560px]:text-[32px] max-[560px]:tracking-[-1.2px] max-[380px]:text-[28px]">
              Start a New
              <span className="text-[#25805b]"> Patient Record</span>
            </h1>

            <p className="max-w-[650px] mt-[14px] text-[#71867d] text-[12px] leading-[1.7] max-[560px]:text-[10px]">
              Begin a simple, voice-first and offline-ready
              health intake for a patient at your health centre.
            </p>

          </div>

          <div className="min-w-[270px] p-[15px] border border-[#cce5d6] rounded-[14px] bg-[rgba(245,252,248,0.92)] flex items-center gap-[12px] shadow-[0_8px_25px_rgba(28,90,64,0.05)] max-[1000px]:min-w-0 max-[560px]:w-full">
            <div className="w-[40px] h-[40px] rounded-[11px] bg-[#dff3e6] text-[#176b4b] flex items-center justify-center shrink-0">
              <ShieldCheck size={21} />
            </div>

            <div className="flex flex-col gap-[4px]">
              <strong className="text-[#205541] text-[11px]">Consent First</strong>
              <span className="text-[#83978e] text-[9px] leading-[1.4]">
                Patient permission is required before recording.
              </span>
            </div>
          </div>

        </section>

        {/* ===================================================
            PROGRESS
            =================================================== */}

        <section className="mt-[27px] min-h-[88px] px-[23px] py-[17px] border border-[#dce8e1] rounded-[17px] bg-[rgba(255,255,255,0.9)] flex items-center shadow-[0_8px_28px_rgba(24,67,50,0.04)] max-[760px]:overflow-x-auto max-[560px]:p-[14px] max-[560px]:rounded-[14px]">

          <div className="flex-1 flex items-center gap-[11px] opacity-100 max-[760px]:min-w-[160px] max-[560px]:min-w-[145px]">
            <div className="w-[35px] h-[35px] rounded-full bg-[#15734f] text-white shadow-[0_5px_14px_rgba(21,115,79,0.2)] flex items-center justify-center text-[9px] font-[850] shrink-0">01</div>

            <div className="flex flex-col gap-[3px]">
              <strong className="text-[#36594e] text-[10px] font-[850] whitespace-nowrap max-[560px]:text-[9px]">Patient Details</strong>
              <span className="text-[#9aa9a3] text-[8px] whitespace-nowrap max-[560px]:text-[7px]">Basic information</span>
            </div>
          </div>

          <div className="flex-[0.45] h-[1px] bg-[#dce7e1] max-[760px]:min-w-[25px]"></div>

          <div className="flex-1 flex items-center gap-[11px] opacity-55 max-[760px]:min-w-[160px] max-[560px]:min-w-[145px]">
            <div className="w-[35px] h-[35px] rounded-full bg-[#edf3ef] text-[#8a9b94] flex items-center justify-center text-[9px] font-[850] shrink-0">02</div>

            <div className="flex flex-col gap-[3px]">
              <strong className="text-[#36594e] text-[10px] font-[850] whitespace-nowrap max-[560px]:text-[9px]">Language & Consent</strong>
              <span className="text-[#9aa9a3] text-[8px] whitespace-nowrap max-[560px]:text-[7px]">Permission & language</span>
            </div>
          </div>

          <div className="flex-[0.45] h-[1px] bg-[#dce7e1] max-[760px]:min-w-[25px]"></div>

          <div className="flex-1 flex items-center gap-[11px] opacity-55 max-[760px]:min-w-[160px] max-[560px]:min-w-[145px]">
            <div className="w-[35px] h-[35px] rounded-full bg-[#edf3ef] text-[#8a9b94] flex items-center justify-center text-[9px] font-[850] shrink-0">03</div>

            <div className="flex flex-col gap-[3px]">
              <strong className="text-[#36594e] text-[10px] font-[850] whitespace-nowrap max-[560px]:text-[9px]">Health Interview</strong>
              <span className="text-[#9aa9a3] text-[8px] whitespace-nowrap max-[560px]:text-[7px]">Voice or touch intake</span>
            </div>
          </div>

        </section>

        {/* ===================================================
            PATIENT RECORD
            =================================================== */}

        <section className="mt-[22px] overflow-hidden border border-[#dce8e1] rounded-[21px] bg-white shadow-[0_18px_55px_rgba(20,65,49,0.07)] max-[560px]:mt-[17px] max-[560px]:rounded-[16px]">

          {/* CARD HEADER */}

          <div className="min-h-[88px] px-[27px] py-[19px] flex items-center justify-between gap-[20px] border-b border-[#e5eee9] bg-[linear-gradient(100deg,#ffffff,#f8fcfa)] max-[760px]:items-start max-[760px]:flex-col max-[560px]:p-[17px] max-[380px]:p-[15px]">

            <div className="flex items-center gap-[13px]">

              <div className="w-[45px] h-[45px] rounded-[12px] bg-[#e2f4e8] text-[#176c4c] flex items-center justify-center">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="m-0 text-[#193f34] text-[17px] font-[850] max-[560px]:text-[15px]">Patient Information</h2>

                <p className="mt-[4px] m-0 text-[#8a9b95] text-[9px] max-[560px]:text-[8px]">
                  Enter a few details to create the patient's
                  local health record.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-[6px] text-[#237454] px-[11px] py-[8px] rounded-full bg-[#edf9f1] text-[9px] font-[750] whitespace-nowrap max-[760px]:ml-[58px] max-[560px]:ml-0">
              <CheckCircle2 size={14} />
              <span>Secure Local Record</span>
            </div>

          </div>

          {/* FORM */}

          <div className="p-[29px] max-[560px]:p-[18px] max-[380px]:p-[15px]">

            <div className="flex items-start gap-[12px]">
              <span className="w-[29px] h-[29px] rounded-[8px] bg-[#edf7f1] text-[#237454] flex items-center justify-center text-[9px] font-[850] shrink-0">01</span>

              <div>
                <h3 className="m-0 text-[#244c3f] text-[14px] font-[850] max-[560px]:text-[13px]">Basic Patient Details</h3>
                <p className="mt-[4px] m-0 text-[#8b9b95] text-[9px] leading-[1.5]">
                  These details help identify the patient during
                  the health interview.
                </p>
              </div>
            </div>

            <div className="mt-[23px] grid grid-cols-2 gap-[21px] max-[760px]:grid-cols-1">

              {/* NAME */}

              <div className="flex flex-col gap-[8px] col-span-1">

                <label className="flex items-center gap-[4px] text-[#34584d] text-[10px] font-[850]">
                  Patient Full Name
                  <span className="text-[#d54c4c]">*</span>
                </label>

                <div className="h-[50px] relative flex items-center border border-[#d5e3dc] rounded-[11px] bg-[#fbfdfc] transition-all duration-200 focus-within:border-[#338f68] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(51,143,104,0.09)] max-[560px]:h-[47px]">

                  <UserRound className="absolute left-[15px] text-[#8da39a] pointer-events-none" size={18} />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter patient's full name"
                    autoComplete="off"
                    className="w-full h-full border-0 outline-0 py-0 pr-[14px] pl-[44px] rounded-[11px] bg-transparent text-[#193f34] text-[12px] placeholder:text-[#a6b4ae]"
                  />

                </div>

                <small className="text-[#9ba9a4] text-[8px]">
                  Use the patient's preferred name.
                </small>

              </div>

              {/* AGE */}

              <div className="flex flex-col gap-[8px]">

                <label className="flex items-center gap-[4px] text-[#34584d] text-[10px] font-[850]">
                  Age
                  <span className="text-[#d54c4c]">*</span>
                </label>

                <div className="h-[50px] relative flex items-center border border-[#d5e3dc] rounded-[11px] bg-[#fbfdfc] transition-all duration-200 focus-within:border-[#338f68] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(51,143,104,0.09)] max-[560px]:h-[47px]">

                  <Activity className="absolute left-[15px] text-[#8da39a] pointer-events-none" size={18} />

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age in years"
                    min="0"
                    max="120"
                    className="w-full h-full border-0 outline-0 py-0 pr-[14px] pl-[44px] rounded-[11px] bg-transparent text-[#193f34] text-[12px] placeholder:text-[#a6b4ae]"
                  />

                </div>

                <small className="text-[#9ba9a4] text-[8px]">
                  Enter age in completed years.
                </small>

              </div>

              {/* PHONE */}

              <div className="flex flex-col gap-[8px]">

                <label className="flex items-center gap-[4px] text-[#34584d] text-[10px] font-[850]">
                  Mobile Number
                  <em className="ml-auto text-[#9aa9a3] text-[8px] not-italic font-semibold">Optional</em>
                </label>

                <div className="h-[50px] relative flex items-center border border-[#d5e3dc] rounded-[11px] bg-[#fbfdfc] transition-all duration-200 focus-within:border-[#338f68] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(51,143,104,0.09)] max-[560px]:h-[47px]">

                  <span className="absolute left-[14px] text-[#5e786d] text-[10px] font-[750]">
                    +91
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    maxLength="10"
                    className="w-full h-full border-0 outline-0 py-0 pr-[14px] pl-[48px] rounded-[11px] bg-transparent text-[#193f34] text-[12px] placeholder:text-[#a6b4ae]"
                  />

                </div>

                <small className="text-[#9ba9a4] text-[8px]">
                  Optional contact information.
                </small>

              </div>

              {/* VILLAGE */}

              <div className="flex flex-col gap-[8px]">

                <label className="flex items-center gap-[4px] text-[#34584d] text-[10px] font-[850]">
                  Village / Locality
                  <em className="ml-auto text-[#9aa9a3] text-[8px] not-italic font-semibold">Optional</em>
                </label>

                <div className="h-[50px] relative flex items-center border border-[#d5e3dc] rounded-[11px] bg-[#fbfdfc] transition-all duration-200 focus-within:border-[#338f68] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(51,143,104,0.09)] max-[560px]:h-[47px]">

                  <Home className="absolute left-[15px] text-[#8da39a] pointer-events-none" size={18} />

                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Enter village or locality"
                    className="w-full h-full border-0 outline-0 py-0 pr-[14px] pl-[44px] rounded-[11px] bg-transparent text-[#193f34] text-[12px] placeholder:text-[#a6b4ae]"
                  />

                </div>

                <small className="text-[#9ba9a4] text-[8px]">
                  Helpful for local health-worker follow-up.
                </small>

              </div>

            </div>

            {/* =================================================
                INTAKE TYPE
                ================================================= */}

            <div className="mt-[31px] pt-[28px] border-t border-[#e5ede9]">

              <div className="flex items-start gap-[12px]">

                <span className="w-[29px] h-[29px] rounded-[8px] bg-[#edf7f1] text-[#237454] flex items-center justify-center text-[9px] font-[850] shrink-0">02</span>

                <div>
                  <h3 className="m-0 text-[#244c3f] text-[14px] font-[850] max-[560px]:text-[13px]">Choose Intake Type</h3>

                  <p className="mt-[4px] m-0 text-[#8b9b95] text-[9px] leading-[1.5]">
                    Select the health interview you want to start.
                  </p>
                </div>

              </div>

              <div className="mt-[21px] grid grid-cols-2 gap-[17px] max-[760px]:grid-cols-1">

                {/* MATERNAL */}

                <button
                  type="button"
                  className={`relative min-h-[185px] p-[19px] border-[1.5px] rounded-[16px] text-left cursor-pointer transition-all duration-[220ms] hover:-translate-y-[3px] max-[560px]:min-h-[180px] max-[380px]:p-[15px] ${
                    patientType === "maternal"
                      ? "border-[#29845f] bg-[linear-gradient(135deg,#f4fbf7,#eaf7ef)] shadow-[0_10px_28px_rgba(27,112,77,0.1)]"
                      : "border-[#dce7e1] bg-white hover:border-[#a9cfbb] hover:shadow-[0_10px_25px_rgba(25,100,70,0.08)]"
                  }`}
                  onClick={() => setPatientType("maternal")}
                >

                  <div className="flex items-start justify-between">

                    <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[#176c4c] bg-[#dff3e7]">
                      <HeartPulse size={23} />
                    </div>

                    <div
                      className={`w-[19px] h-[19px] border-2 rounded-full flex items-center justify-center ${
                        patientType === "maternal"
                          ? "border-[#19734f]"
                          : "border-[#c1d0c9]"
                      }`}
                    >
                      {patientType === "maternal" && (
                        <span className="w-[9px] h-[9px] rounded-full bg-[#19734f]"></span>
                      )}
                    </div>

                  </div>

                  <div className="mt-[17px]">

                    <h4 className="m-0 text-[#244d40] text-[13px] font-[850]">
                      Maternal & Antenatal Care
                    </h4>

                    <p className="max-w-[490px] mt-[6px] m-0 text-[#81958c] text-[9px] leading-[1.6]">
                      Pregnancy and antenatal questions,
                      danger-sign checks and maternal health
                      information.
                    </p>

                  </div>

                  <div className="absolute inset-x-[19px] bottom-[16px] pt-[11px] border-t border-[rgba(42,107,79,0.1)] flex items-center justify-between text-[#277555] text-[8px] font-[750] max-[380px]:inset-x-[15px]">
                    <span>Recommended MVP flow</span>
                    <ArrowRight size={15} />
                  </div>

                </button>

                {/* GENERAL */}

                <button
                  type="button"
                  className={`relative min-h-[185px] p-[19px] border-[1.5px] rounded-[16px] text-left cursor-pointer transition-all duration-[220ms] hover:-translate-y-[3px] max-[560px]:min-h-[180px] max-[380px]:p-[15px] ${
                    patientType === "general"
                      ? "border-[#29845f] bg-[linear-gradient(135deg,#f4fbf7,#eaf7ef)] shadow-[0_10px_28px_rgba(27,112,77,0.1)]"
                      : "border-[#dce7e1] bg-white hover:border-[#a9cfbb] hover:shadow-[0_10px_25px_rgba(25,100,70,0.08)]"
                  }`}
                  onClick={() => setPatientType("general")}
                >

                  <div className="flex items-start justify-between">

                    <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[#315f75] bg-[#e5f1f5]">
                      <UsersRound size={23} />
                    </div>

                    <div
                      className={`w-[19px] h-[19px] border-2 rounded-full flex items-center justify-center ${
                        patientType === "general"
                          ? "border-[#19734f]"
                          : "border-[#c1d0c9]"
                      }`}
                    >
                      {patientType === "general" && (
                        <span className="w-[9px] h-[9px] rounded-full bg-[#19734f]"></span>
                      )}
                    </div>

                  </div>

                  <div className="mt-[17px]">

                    <h4 className="m-0 text-[#244d40] text-[13px] font-[850]">
                      General Patient Intake
                    </h4>

                    <p className="max-w-[490px] mt-[6px] m-0 text-[#81958c] text-[9px] leading-[1.6]">
                      Basic health interview for patients
                      outside the maternal care workflow.
                    </p>

                  </div>

                  <div className="absolute inset-x-[19px] bottom-[16px] pt-[11px] border-t border-[rgba(42,107,79,0.1)] flex items-center justify-between text-[#277555] text-[8px] font-[750] max-[380px]:inset-x-[15px]">
                    <span>General health workflow</span>
                    <ArrowRight size={15} />
                  </div>

                </button>

              </div>

            </div>

            {/* =================================================
                CONSENT NOTICE
                ================================================= */}

            <div className="mt-[27px] p-[17px] border border-[#cde5d6] rounded-[14px] bg-[linear-gradient(135deg,#f4fbf6,#edf8f1)] flex items-start gap-[12px] max-[560px]:p-[13px]">

              <div className="w-[37px] h-[37px] rounded-[10px] bg-[#d9f0e1] text-[#17694b] flex items-center justify-center shrink-0">
                <ShieldCheck size={21} />
              </div>

              <div>

                <h4 className="m-0 text-[#225641] text-[11px] font-[850]">
                  Privacy & Consent Protection
                </h4>

                <p className="max-w-[820px] mt-[5px] m-0 text-[#71897e] text-[9px] leading-[1.6]">
                  No voice recording will begin on this screen.
                  Before any audio is captured, the patient will
                  be shown a clear consent step and can choose
                  whether to continue.
                </p>

                <div className="mt-[9px] flex items-center flex-wrap gap-[14px] max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-[7px]">

                  <span className="flex items-center gap-[5px] text-[#35765b] text-[8px] font-[750]">
                    <CheckCircle2 size={13} />
                    Consent required
                  </span>

                  <span className="flex items-center gap-[5px] text-[#35765b] text-[8px] font-[750]">
                    <CheckCircle2 size={13} />
                    Offline storage
                  </span>

                  <span className="flex items-center gap-[5px] text-[#35765b] text-[8px] font-[750]">
                    <CheckCircle2 size={13} />
                    Patient can refuse
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="mt-[26px] pt-[20px] border-t border-[#e5ede9] flex items-center justify-between gap-[15px] max-[560px]:flex-col-reverse max-[560px]:items-stretch">

              <button
                type="button"
                className="min-h-[45px] px-[19px] border border-[#d5e1dc] rounded-[10px] bg-white text-[#61766e] text-[10px] font-[750] cursor-pointer transition-[0.2s_ease] hover:bg-[#f5f9f7] hover:border-[#bed2c8] max-[560px]:w-full"
                onClick={goToDashboard}
              >
                Cancel
              </button>

              <button
                type="button"
                className="min-h-[47px] px-[21px] border-0 rounded-[10px] bg-[linear-gradient(135deg,#197b55,#106342)] text-white inline-flex items-center justify-center gap-[9px] text-[10px] font-extrabold cursor-pointer shadow-[0_8px_18px_rgba(18,103,69,0.2)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_11px_24px_rgba(18,103,69,0.26)] active:translate-y-0 max-[560px]:w-full"
                onClick={handleContinue}
              >
                <span>Continue to Consent</span>
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            BOTTOM INFORMATION
            =================================================== */}

        <section className="mt-[19px] px-[18px] py-[14px] border border-[#dce8e1] rounded-[13px] bg-[rgba(255,255,255,0.72)] flex items-center justify-center gap-[34px] max-[760px]:flex-wrap max-[760px]:gap-x-[25px] max-[760px]:gap-y-[15px] max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-[11px]">

          <div className="flex items-center gap-[8px] text-[#70867d] text-[8px] font-bold">
            <div className="w-[26px] h-[26px] rounded-[8px] bg-[#e5f3ea] text-[#237454] flex items-center justify-center">
              <Mic size={16} />
            </div>

            <span>
              Voice-first interview
            </span>
          </div>

          <div className="flex items-center gap-[8px] text-[#70867d] text-[8px] font-bold">
            <div className="w-[26px] h-[26px] rounded-[8px] bg-[#e5f3ea] text-[#237454] flex items-center justify-center">
              <Languages size={16} />
            </div>

            <span>
              Bengali & Hindi ready
            </span>
          </div>

          <div className="flex items-center gap-[8px] text-[#70867d] text-[8px] font-bold">
            <div className="w-[26px] h-[26px] rounded-[8px] bg-[#e5f3ea] text-[#237454] flex items-center justify-center">
              <WifiOff size={16} />
            </div>

            <span>
              Works without internet
            </span>
          </div>

        </section>

        <footer className="pt-[20px] px-[4px] pb-0 flex items-center justify-between text-[#9aa8a3] text-[8px] max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-[7px]">
          <span>
            AarogyaVaani • Tripura Health
          </span>

          <span>
            Patient-first • Consent-first • Offline-ready
          </span>
        </footer>

      </main>
    </div>
  );
}

export default NewPatient;