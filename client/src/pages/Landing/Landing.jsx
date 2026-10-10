import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Volume2,
  FileText,
  Activity,
  HeartPulse,
  Languages,
  WifiOff,
  LogIn,
  User,
  UsersRound,
  CheckCircle2,
  Lock,
  Phone,
  Building2,
} from "lucide-react";
import PublicHeader from "../../components/PublicHeader";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/doctor_clinic_banner.jpg",
    title: "Speak Naturally About Your Health",
    subtitle:
      "Describe how you feel in simple Bengali, Hindi, or English. The app prepares clear notes before seeing the doctor.",
  },
  {
    id: 2,
    image: "/asha_community_banner.jpg",
    title: "Simple Healthcare for Rural Families",
    subtitle:
      "Easy for anyone to use. Answer quick health questions by speaking naturally or tapping clear pictures.",
  },
  {
    id: 3,
    image: "/emergency_triage_banner.jpg",
    title: "Instant Warnings for Serious Illnesses",
    subtitle:
      "If someone has severe chest pain, high fever, or pregnancy danger signs, doctors are alerted immediately.",
  },
  {
    id: 4,
    image: "/maternal_banner.jpg",
    title: "Safe Care for Mothers & Babies",
    subtitle:
      "Helping pregnant mothers stay healthy by checking symptoms early and connecting them with doctors.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimerRef = useRef(null);

  // Image loading tracking map
  const [loadedImages, setLoadedImages] = useState({});

  // Active user session detection
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setActiveUser(parsed);
        if (parsed.role === "doctor") {
          navigate("/doctor/review", { replace: true });
        } else {
          navigate("/patient", { replace: true });
        }
      }
    } catch {
      setActiveUser(null);
    }
  }, [navigate]);

  // Carousel autoplay
  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleAccessCheck = (targetPath) => {
    if (activeUser) {
      navigate(targetPath);
    } else {
      navigate("/login?role=patient");
    }
  };

  // 3 Clear Project Pillars (Casual, direct everyday language)
  const aboutPillars = [
    {
      title: "Speak in Your Own Language",
      tag: "Easy For Everyone",
      desc: "Talk comfortably in Bengali, Hindi, or English. No typing or reading required — just speak how you feel.",
      icon: Languages,
      iconColor: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Instant Safety Alerts",
      tag: "Quick Help",
      desc: "Checks your answers right away for urgent danger signs like high fever, severe pain, or bleeding so doctors can help faster.",
      icon: HeartPulse,
      iconColor: "text-rose-700 bg-rose-500/10 border-rose-500/20",
      accentBorder: "hover:border-rose-500/40",
    },
    {
      title: "Works Without Internet",
      tag: "Always Ready",
      desc: "Works anywhere, even in remote villages with no mobile network. Your medical details are saved safely on the device.",
      icon: WifiOff,
      iconColor: "text-blue-700 bg-blue-500/10 border-blue-500/20",
      accentBorder: "hover:border-blue-500/40",
    },
  ];

  // 4 Core System Capabilities (Directly explaining what Patients and Doctors do)
  const systemCapabilities = [
    {
      title: "Patient Voice Intake",
      tag: "For Patients",
      desc: "Patients answer simple spoken questions about their symptoms or tap easy pictures. Takes only a couple of minutes.",
      icon: Mic,
      targetPath: "/patient",
      iconColor: "text-emerald-700 bg-emerald-500/10 border border-emerald-500/20",
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      cardBorder: "border-slate-200/90 hover:border-emerald-500/40",
    },
    {
      title: "Doctor Review & Prescriptions",
      tag: "For Doctors",
      desc: "Doctors get a clean, ready-to-read summary of the patient's symptoms right away, so they can examine and prescribe medicine quickly.",
      icon: Stethoscope,
      targetPath: "/doctor/review",
      iconColor: "text-blue-700 bg-blue-500/10 border border-blue-500/20",
      badgeColor: "bg-blue-500/10 text-blue-800 border-blue-500/20",
      cardBorder: "border-slate-200/90 hover:border-blue-500/40",
    },
    {
      title: "Emergency Warning Queue",
      tag: "Urgent Care",
      desc: "Patients with serious or high-risk symptoms are highlighted at the top of the clinic queue so they get immediate medical attention.",
      icon: ShieldAlert,
      targetPath: "/doctor/emergency",
      iconColor: "text-rose-700 bg-rose-500/10 border border-rose-500/20",
      badgeColor: "bg-rose-500/10 text-rose-800 border-rose-500/20",
      cardBorder: "border-slate-200/90 hover:border-rose-500/40",
    },
    {
      title: "Patient Records & History",
      tag: "Health Records",
      desc: "Keeps past visit summaries and doctor prescriptions neatly organized so patients and doctors can look up past care anytime.",
      icon: UsersRound,
      targetPath: "/patient",
      iconColor: "text-teal-700 bg-teal-500/10 border border-teal-500/20",
      badgeColor: "bg-teal-500/10 text-teal-800 border-teal-500/20",
      cardBorder: "border-slate-200/90 hover:border-teal-500/40",
    },
  ];

  // 4 Public Health Schemes Alignment (Simple everyday language)
  const healthSchemes = [
    {
      title: "Ayushman Bharat Digital Mission (ABDM)",
      tag: "Digital Health Records",
      desc: "Connects securely with your 14-digit ABHA ID so your medical records travel with you wherever you go.",
      icon: ShieldCheck,
      iconColor: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "National Health Mission (NHM)",
      tag: "Primary Healthcare",
      desc: "Supports rural healthcare by helping patients describe their symptoms clearly before meeting clinic doctors.",
      icon: Activity,
      iconColor: "text-blue-700 bg-blue-500/10 border-blue-500/20",
      badgeColor: "bg-blue-500/10 text-blue-800 border-blue-500/20",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Ayushman Arogya Mandir",
      tag: "Clinic Support",
      desc: "Used in Primary Health Centres (PHCs) to cut down waiting lines and give doctors more time to examine each patient.",
      icon: Building2,
      iconColor: "text-teal-700 bg-teal-500/10 border-teal-500/20",
      badgeColor: "bg-teal-500/10 text-teal-800 border-teal-500/20",
      accentBorder: "hover:border-teal-500/40",
    },
    {
      title: "Maternal Health Safeguards",
      tag: "Mother & Baby Care",
      desc: "Careful checks for pregnant mothers to detect high blood pressure, swelling, or warning signs before delivery.",
      icon: HeartPulse,
      iconColor: "text-rose-700 bg-rose-500/10 border-rose-500/20",
      badgeColor: "bg-rose-500/10 text-rose-800 border-rose-500/20",
      accentBorder: "hover:border-rose-500/40",
    },
  ];

  // 3-Step Guided Workflow (Simple, casual, direct)
  const workflowSteps = [
    {
      step: "01",
      title: "1. Listen & Say Yes",
      desc: "Hear a short spoken message explaining the checkup, and easily give permission by voice or a quick tap.",
      icon: Volume2,
      iconColor: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
      badgeText: "Simple Consent",
    },
    {
      step: "02",
      title: "2. Speak Your Health Problem",
      desc: "Answer friendly questions about pain, fever, or pregnancy in your mother tongue. The app organizes everything for the clinic.",
      icon: Mic,
      iconColor: "text-rose-700 bg-rose-500/10 border-rose-500/20",
      badgeText: "Voice Intake",
    },
    {
      step: "03",
      title: "3. Doctor Checkup & Prescription",
      desc: "The doctor reviews your symptom summary, examines you in person, and writes your medicine prescription.",
      icon: FileText,
      iconColor: "text-blue-700 bg-blue-500/10 border-blue-500/20",
      badgeText: "Doctor Care",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8faf9] text-slate-800 selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* 1. Spread-Out Glassmorphic Navbar */}
      <PublicHeader />

      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-9 space-y-12 sm:space-y-16 pb-28 lg:pb-16">
        {/* 2. Hero Carousel: Smooth Crossfade Transition with Loading Shimmer */}
        <section className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-950 group select-none">
          <div className="relative w-full h-[340px] sm:h-[440px] md:h-[520px] lg:h-[580px] xl:h-[620px] overflow-hidden">
            {/* Layered Crossfade Slides with Image Loading State */}
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              const isLoaded = loadedImages[slide.id];
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                    isActive
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                  aria-hidden={!isActive}
                >
                  {/* Loading Shimmer Animation */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-3 z-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-400 animate-spin" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-200/80 tracking-wide">
                        Loading presentation...
                      </span>
                    </div>
                  )}

                  <img
                    src={slide.image}
                    alt={slide.title}
                    onLoad={() =>
                      setLoadedImages((prev) => ({ ...prev, [slide.id]: true }))
                    }
                    className={`w-full h-full object-cover object-center cursor-pointer transition-all duration-700 ${
                      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                    onClick={() => handleAccessCheck("/doctor/review")}
                    title={slide.title}
                  />
                </div>
              );
            })}

            {/* Carousel Navigation Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* 3. About AarogyaVaani: Simple & Casual Language */}
        <section id="about-section" className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              AarogyaVaani: How It Helps Patients & Doctors
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              At busy rural clinics, doctors often have only 2 to 3 minutes per patient. AarogyaVaani lets patients speak their health complaints in advance, so doctors have clear notes ready the moment the consultation begins.
            </p>
          </div>

          {/* 3 Simple Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {aboutPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`min-h-[260px] p-8 sm:p-9 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 ${pillar.accentBorder} shadow-[0_4px_24px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-13 h-13 rounded-2xl ${pillar.iconColor} border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-500 mt-2.5 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-emerald-700 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Simple & Helpful</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. National Health Alignment */}
        <section id="schemes-section" className="space-y-6">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              National Healthcare Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Built to follow national guidelines so patient records are safe, private, and easy to access anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {healthSchemes.map((scheme, idx) => {
              const Icon = scheme.icon;
              return (
                <div
                  key={idx}
                  className={`min-h-[280px] p-8 sm:p-9 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 ${scheme.accentBorder} shadow-[0_4px_24px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-13 h-13 rounded-2xl ${scheme.iconColor} border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {scheme.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 tracking-tight">
                      {scheme.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-500 mt-2.5 leading-relaxed font-normal">
                      {scheme.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center gap-1.5 text-xs font-medium text-emerald-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe & Approved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Core Features for Patients & Doctors */}
        <section id="features-section" className="space-y-6">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Everything You Need in One Place
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Simple tools for patients to record symptoms and for doctors to review and approve clinical notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {systemCapabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`min-h-[320px] p-8 sm:p-9 rounded-3xl bg-white/90 backdrop-blur-xl border ${item.cardBorder} shadow-[0_4px_24px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_45px_rgba(11,102,81,0.09)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer`}
                  onClick={() => handleAccessCheck(item.targetPath)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-2xl ${item.iconColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-500 mt-2.5 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100/90 flex items-center justify-between">
                    {activeUser ? (
                      <span className="text-xs font-semibold text-[#0b6651] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        <span>Open Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 flex items-center gap-1.5 transition-colors">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sign in to access</span>
                      </span>
                    )}
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#0b6651] group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. How AarogyaVaani Works (3 Simple Steps) */}
        <section id="workflow-section" className="space-y-6">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              From speaking your symptoms to getting your doctor&apos;s advice — quick, natural, and clear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {workflowSteps.map((stepItem, idx) => {
              const Icon = stepItem.icon;
              return (
                <div
                  key={idx}
                  className="min-h-[290px] p-8 sm:p-9 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 hover:border-emerald-500/40 shadow-[0_4px_24px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-3xl sm:text-4xl font-medium text-slate-300 group-hover:text-emerald-700/40 transition-colors font-mono">
                        {stepItem.step}
                      </span>
                      <div
                        className={`w-13 h-13 rounded-2xl ${stepItem.iconColor} border flex items-center justify-center shadow-2xs`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 tracking-tight">
                      {stepItem.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-500 mt-2.5 leading-relaxed font-normal">
                      {stepItem.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center gap-2 text-xs font-medium text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fast & Easy</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Action Card for Patients & Doctors */}
        <section className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-[#074235] via-[#0b6651] to-[#0e7490] text-white shadow-[0_20px_50px_rgba(11,102,81,0.25)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-emerald-400/20">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Ready to Get Started?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Patients can start voice intake right away to prepare for their consultation. Doctors can sign in to review patient charts and approve prescriptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => navigate("/login?role=patient")}
              className="flex-1 lg:flex-none bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <User className="w-4 h-4 text-[#0b6651]" />
              <span>Patient Login</span>
            </button>

            <button
              onClick={() => navigate("/login?role=doctor")}
              className="flex-1 lg:flex-none bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl border border-emerald-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span>Doctor Portal</span>
            </button>
          </div>
        </section>

        {/* 8. Minimal Clean Footer */}
        <footer className="p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0b6651] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-sm font-black text-slate-900 block leading-tight">
                Aarogya<span className="text-[#0b6651]">Vaani</span>
              </strong>
              <span className="text-[10.5px] text-slate-400 block leading-tight">
                National Health Mission (NHM) • Ayushman Bharat Digital Mission (ABDM)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button
              onClick={() => navigate("/login?role=patient")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Patient Login
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => navigate("/login?role=doctor")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Doctor Login
            </button>
            <span className="text-slate-300">•</span>
            <a
              href="tel:108"
              className="hover:text-rose-700 text-rose-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Emergency: 108</span>
            </a>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            © 2026 AarogyaVaani • DPDP Act 2023 Compliant
          </div>
        </footer>
      </main>
    </div>
  );
}