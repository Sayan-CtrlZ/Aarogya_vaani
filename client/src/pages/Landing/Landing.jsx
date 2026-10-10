import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Building2,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Languages,
  Leaf,
  Map,
  MapPin,
  Menu,
  Mic2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tripura_map_for_WLM-IN.svg";

const heritagePlaces = [
  {
    name: "Ujjayanta Palace",
    location: "Agartala",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ujjayanta%20Palace%20Tripura.jpg",
  },
  {
    name: "Neermahal",
    location: "Melaghar",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Neer%20Mahal%20Palace%2C%20Tripura.jpg",
  },
  {
    name: "Unakoti",
    location: "Kailashahar",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Unakoti.jpg",
  },
  {
    name: "Tripura Sundari Temple",
    location: "Udaipur",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tripura%20Sundari%20Temple%20or%20Tripureswari%20Temple.jpg",
  },
];

const languages = [
  {
    script: "বাংলা",
    name: "Bengali",
    description:
      "Bengali is the most widely spoken language in Tripura.",
    icon: "01",
  },
  {
    script: "हिन्दी",
    name: "Hindi",
    description:
      "Hindi is spoken by a smaller section of Tripura's population.",
    icon: "02",
  },
  {
    script: "Kokborok",
    name: "Kokborok",
    description:
      "Kokborok is an important indigenous language of Tripura, with voice support planned for the roadmap.",
    icon: "03",
  },
];

const features = [
  {
    icon: Mic2,
    title: "Voice-First Intake",
    text: "Every question can be spoken aloud and answered naturally.",
  },
  {
    icon: Languages,
    title: "Language + Pictures",
    text: "Bengali and Hindi in the MVP, with visual answers for easier interaction.",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    text: "The complete intake can continue even when the health centre has no internet.",
  },
  {
    icon: ShieldCheck,
    title: "Danger-Sign Alerts",
    text: "Fixed safety rules check answers and flag urgent pregnancy signs.",
  },
  {
    icon: Users,
    title: "ASHA / ANM Assist",
    text: "Health workers can guide patients through the same simple screens.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Summary",
    text: "A structured history can be reviewed, edited and approved by the doctor.",
  },
];

const howItWorks = [
  {
    number: "01",
    icon: Languages,
    title: "Choose language & consent",
    text: "The patient hears a short explanation and agrees by voice or touch.",
  },
  {
    number: "02",
    icon: Volume2,
    title: "Speak or tap",
    text: "The patient answers naturally while the app guides the conversation.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Safety checks",
    text: "Every answer is checked for important maternal danger signs.",
  },
  {
    number: "04",
    icon: Stethoscope,
    title: "Doctor-ready summary",
    text: "The system creates a concise structured history for review and approval.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-[11px] text-left">
      <div className="w-[40px] h-[40px] relative grid place-items-center text-white bg-[linear-gradient(145deg,#1e8d77,#0d6657)] rounded-[13px] shadow-[0_10px_25px_rgba(22,128,109,0.24)]">
        <Leaf size={20} strokeWidth={2.4} className="absolute left-[7px] top-[7px]" />
        <AudioLines size={17} strokeWidth={2.5} className="absolute right-[5px] bottom-[6px]" />
      </div>

      <div className="flex flex-col gap-[1px]">
        <strong className="text-[16px] tracking-[-0.02em]">AarogyaVaani</strong>
        <span className="text-[#16806d] text-[10px] font-bold uppercase tracking-[0.13em]">Tripura Health</span>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  light = false,
}) {
  return (
    <div className={`max-w-[720px] mb-[48px] ${centered ? "mx-auto text-center" : ""}`}>
      <span className={`inline-flex items-center gap-[7px] text-[11px] font-[800] uppercase tracking-[0.13em] ${light ? "text-[#b9e9dc]" : "text-[#16806d]"}`}>
        <Sparkles size={14} />
        {eyebrow}
      </span>

      <h2 className={`mt-[14px] mb-[15px] text-[clamp(34px,4vw,52px)] leading-[1.05] tracking-[-0.045em] font-bold ${light ? "text-white" : ""}`}>
        {title}
      </h2>

      {description && (
        <p className={`m-0 text-[15px] leading-[1.75] ${light ? "text-[rgba(255,255,255,0.66)]" : "text-[#61716d]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    if (window.__aarogyaToastTimer) {
      window.clearTimeout(window.__aarogyaToastTimer);
    }

    window.__aarogyaToastTimer = window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const navigateTo = (id, label) => {
    setMenuOpen(false);

    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      showToast(
        "Welcome to AarogyaVaani • Built with Tripura in focus"
      );

      return;
    }

    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    showToast(`${label} • AarogyaVaani`);
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_80%_5%,rgba(23,128,109,0.06),transparent_28%),#f7faf8] text-[#12221f] font-sans">
      <style>{`
        @keyframes landingMapFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.5deg); }
        }
        @keyframes landingOrbMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(12px, -18px); }
        }
        @keyframes landingHeritageFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes landingPulseDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
        @keyframes landingTextShimmer {
          to { background-position: 200% center; }
        }
        @keyframes landingVoiceWave {
          0%, 100% { transform: scaleY(0.55); }
          50% { transform: scaleY(1.15); }
        }
        @keyframes landingProgressMove {
          0% { transform: translateX(-110%); }
          50%, 100% { transform: translateX(140%); }
        }
        @keyframes landingMapPanelPulse {
          0%, 100% { opacity: 0.17; transform: scale(1); }
          50% { opacity: 0.27; transform: scale(1.025); }
        }
        @keyframes landingPinFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes landingSoundLine {
          0%, 100% { transform: translateX(0) rotate(-8deg); }
          50% { transform: translateX(-70px) rotate(-5deg); }
        }
        .hero-bg-grid {
          background-image: linear-gradient(rgba(22, 128, 109, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 128, 109, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }
        .panel-bg-grid::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(22, 128, 109, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 128, 109, 0.04) 1px, transparent 1px);
          background-size: 35px 35px;
        }
      `}</style>

      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="sticky top-0 z-[1000] bg-[rgba(247,250,248,0.78)] backdrop-blur-[20px] border-b border-[rgba(18,34,31,0.06)]">
        <div className="w-[min(1240px,calc(100%-40px))] h-[78px] mx-auto flex items-center justify-between max-[760px]:h-[70px] max-[760px]:w-[calc(100%-28px)]">
          <button
            type="button"
            className="border-0 bg-transparent cursor-pointer p-0"
            onClick={() => navigateTo("home", "Home")}
            aria-label="AarogyaVaani Home"
          >
            <Logo />
          </button>

          <nav
            className={`flex items-center gap-[8px] max-[760px]:hidden max-[760px]:absolute max-[760px]:left-[14px] max-[760px]:right-[14px] max-[760px]:top-[78px] max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:p-[12px] max-[760px]:border max-[760px]:border-[rgba(18,34,31,0.09)] max-[760px]:rounded-[18px] max-[760px]:bg-[rgba(255,255,255,0.96)] max-[760px]:backdrop-blur-[18px] max-[760px]:shadow-[0_30px_80px_rgba(18,34,31,0.14)] ${menuOpen ? 'max-[760px]:!flex' : ''}`}
            aria-label="Main navigation"
          >
            {[
              ["home", "Home"],
              ["about", "About"],
              ["features", "Features"],
              ["how-it-works", "How It Works"],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                className="border-0 bg-transparent cursor-pointer text-[#53635f] px-[13px] py-[10px] rounded-[10px] text-[14px] font-semibold transition-all hover:text-[#16806d] hover:bg-[rgba(22,128,109,0.07)] hover:-translate-y-[1px] max-[760px]:text-left"
                onClick={() => navigateTo(id, label)}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              className="ml-[12px] border-0 cursor-pointer inline-flex items-center gap-[8px] text-white px-[18px] py-[11px] rounded-[12px] text-[14px] font-[750] bg-[linear-gradient(135deg,#1b8b76,#0b6657)] shadow-[0_10px_25px_rgba(22,128,109,0.22)] transition-all hover:-translate-y-[2px] hover:shadow-[0_15px_30px_rgba(22,128,109,0.28)] max-[760px]:mt-[5px] max-[760px]:ml-0 max-[760px]:justify-center"
              onClick={goToLogin}
            >
              Get Started
              <ArrowRight size={17} />
            </button>
          </nav>

          <button
            type="button"
            className="hidden max-[760px]:grid max-[760px]:place-items-center w-[42px] h-[42px] border border-[rgba(18,34,31,0.09)] rounded-[12px] bg-white text-[#12221f] cursor-pointer"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <main id="home">
        <section className="min-h-[720px] relative flex items-center isolate bg-[radial-gradient(circle_at_75%_35%,rgba(30,150,126,0.12),transparent_30%),linear-gradient(180deg,#f7faf8_0%,#edf7f3_100%)] max-[760px]:min-h-fit">
          <div className="absolute inset-0 z-[-2] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-[0.38] hero-bg-grid" />

            <motion.img
              className="relative w-[570px] h-[760px] right-[2%] top-[-60px] object-contain z-[2] opacity-[0.55] pointer-events-none drop-shadow-[0_0_40px_rgba(22,128,109,0.22)] max-[1050px]:right-[-5%] max-[1050px]:opacity-10"
              style={{ animation: 'landingMapFloat 10s ease-in-out infinite' }}
              src={TRIPURA_MAP_URL}
              alt="Tripura state map outline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.14, scale: 1 }}
              transition={{ duration: 1.4 }}
            />

            <div className="absolute right-[8%] top-[145px] flex items-center gap-[6px] px-[12px] py-[8px] border border-[rgba(22,128,109,0.14)] rounded-full text-[#16806d] bg-[rgba(255,255,255,0.72)] backdrop-blur-[12px] text-[11px] font-[750] tracking-[0.03em] shadow-[0_10px_30px_rgba(18,34,31,0.07)]">
              <MapPin size={13} />
              <span>Tripura, India</span>
            </div>

            <div className="absolute rounded-full blur-[2px] w-[180px] h-[180px] right-[34%] top-[16%] bg-[rgba(33,169,143,0.08)]" style={{ animation: 'landingOrbMove 8s ease-in-out infinite' }} />
            <div className="absolute rounded-full blur-[2px] w-[110px] h-[110px] right-[10%] bottom-[16%] bg-[rgba(35,108,177,0.06)]" style={{ animation: 'landingOrbMove 8s ease-in-out infinite -2s' }} />

            <div className="absolute w-[150px] h-[112px] overflow-hidden border-[4px] border-[rgba(255,255,255,0.78)] rounded-[18px] shadow-[0_30px_80px_rgba(18,34,31,0.14)] bg-white right-[43%] top-[11%] max-[760px]:hidden" style={{ animation: 'landingHeritageFloat 7s ease-in-out infinite' }}>
              <img
                src={heritagePlaces[0].image}
                alt="Ujjayanta Palace in Agartala, Tripura"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover block saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,24,20,0.7),transparent_55%)]" />
              <span className="absolute left-[11px] bottom-[8px] z-[2] text-white text-[10px] font-[750]">Ujjayanta Palace</span>
            </div>

            <div className="absolute w-[150px] h-[112px] overflow-hidden border-[4px] border-[rgba(255,255,255,0.78)] rounded-[18px] shadow-[0_30px_80px_rgba(18,34,31,0.14)] bg-white right-[3%] bottom-[14%] max-[760px]:hidden" style={{ animation: 'landingHeritageFloat 7s ease-in-out infinite -2s' }}>
              <img
                src={heritagePlaces[1].image}
                alt="Neermahal in Tripura"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover block saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,24,20,0.7),transparent_55%)]" />
              <span className="absolute left-[11px] bottom-[8px] z-[2] text-white text-[10px] font-[750]">Neermahal</span>
            </div>

            <div className="absolute w-[150px] h-[112px] overflow-hidden border-[4px] border-[rgba(255,255,255,0.78)] rounded-[18px] shadow-[0_30px_80px_rgba(18,34,31,0.14)] bg-white left-[2%] bottom-[11%] max-[1050px]:left-[5%] max-[760px]:hidden" style={{ animation: 'landingHeritageFloat 7s ease-in-out infinite -4s' }}>
              <img
                src={heritagePlaces[2].image}
                alt="Unakoti in Tripura"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover block saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,24,20,0.7),transparent_55%)]" />
              <span className="absolute left-[11px] bottom-[8px] z-[2] text-white text-[10px] font-[750]">Unakoti</span>
            </div>
          </div>

          <div className="w-[min(1180px,calc(100%-40px))] mx-auto min-h-[720px] grid grid-cols-[1.02fr_0.98fr] items-center gap-[60px] py-[70px] max-[1050px]:grid-cols-1 max-[1050px]:pt-[100px] max-[760px]:w-[min(100%-28px,620px)] max-[760px]:min-h-fit max-[760px]:pt-[80px] max-[760px]:pb-[50px]">
            <div className="max-w-[650px] relative z-[4] max-[1050px]:max-w-[760px]">
              <motion.div
                className="w-fit inline-flex items-center gap-[9px] px-[13px] py-[8px] text-[#16806d] border border-[rgba(22,128,109,0.15)] rounded-full bg-[rgba(255,255,255,0.68)] backdrop-blur-[12px] text-[12px] font-[750] shadow-[0_8px_25px_rgba(18,34,31,0.05)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="w-[7px] h-[7px] rounded-full bg-[#22a885] shadow-[0_0_0_5px_rgba(34,168,133,0.11)]" style={{ animation: 'landingPulseDot 1.8s ease-in-out infinite' }} />
                Voice-first healthcare • Tripura
              </motion.div>

              <motion.h1
                className="mt-[25px] mb-[20px] max-w-[700px] text-[clamp(50px,6vw,76px)] leading-[0.99] tracking-[-0.055em] font-[850] max-[760px]:text-[clamp(43px,14vw,65px)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Healthcare that
                <span className="block text-transparent bg-[linear-gradient(120deg,#0b6657,#2a9c83,#0b6657)] bg-[length:200%_auto] bg-clip-text" style={{ animation: 'landingTextShimmer 5s linear infinite' }}> listens to you.</span>
              </motion.h1>

              <motion.p
                className="max-w-[620px] m-0 text-[#61716d] text-[17px] leading-[1.75] max-[760px]:text-[15px]"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                AarogyaVaani is an offline, voice-led patient intake tool
                designed for primary health centres in Tripura. It helps
                patients speak naturally, helps health workers capture a
                complete history, and gives doctors a structured summary.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-[12px] mt-[30px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <button
                  type="button"
                  className="min-h-[48px] inline-flex items-center justify-center gap-[9px] rounded-[13px] px-[18px] text-[14px] font-[750] cursor-pointer transition-all hover:-translate-y-[3px] border-0 text-white bg-[linear-gradient(135deg,#1b8e77,#0a6253)] shadow-[0_12px_25px_rgba(22,128,109,0.25)] hover:shadow-[0_18px_35px_rgba(22,128,109,0.31)]"
                  onClick={goToLogin}
                >
                  <Mic2 size={18} />
                  Start with your voice
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="min-h-[48px] inline-flex items-center justify-center gap-[9px] rounded-[13px] px-[18px] text-[14px] font-[750] cursor-pointer transition-all hover:-translate-y-[3px] border border-[rgba(18,34,31,0.1)] text-[#12221f] bg-[rgba(255,255,255,0.75)] backdrop-blur-[12px] hover:bg-white hover:shadow-[0_10px_30px_rgba(18,34,31,0.07)]"
                  onClick={() =>
                    navigateTo("how-it-works", "How It Works")
                  }
                >
                  <Activity size={18} />
                  See how it works
                </button>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-[18px] mt-[25px] max-[760px]:flex-col max-[760px]:gap-[9px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span className="inline-flex items-center gap-[6px] text-[#62726e] text-[11px] font-[650]">
                  <CheckCircle2 size={16} className="text-[#16806d]" />
                  Bengali + Hindi MVP
                </span>

                <span className="inline-flex items-center gap-[6px] text-[#62726e] text-[11px] font-[650]">
                  <CheckCircle2 size={16} className="text-[#16806d]" />
                  Offline capable
                </span>

                <span className="inline-flex items-center gap-[6px] text-[#62726e] text-[11px] font-[650]">
                  <CheckCircle2 size={16} className="text-[#16806d]" />
                  Tripura-focused
                </span>
              </motion.div>
            </div>

            {/* HERO PHONE / PERSON VISUAL */}
            <motion.div
              className="min-h-[560px] relative flex items-center justify-center max-[1050px]:min-h-[600px] max-[760px]:min-h-[530px]"
              initial={{ opacity: 0, x: 70, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.25 }}
            >
              <div className="absolute w-[430px] h-[430px] rounded-full bg-[radial-gradient(circle,rgba(26,149,123,0.18),transparent_67%)] blur-[8px]" />

              <motion.div
                className="w-[270px] h-[340px] absolute left-[2%] top-[120px] z-[2] border border-[rgba(255,255,255,0.8)] rounded-[28px] bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(233,245,241,0.75))] backdrop-blur-[18px] shadow-[0_30px_70px_rgba(18,34,31,0.12)] max-[760px]:w-[230px] max-[760px]:h-[300px] max-[760px]:left-0"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-[150px] h-[190px] absolute left-1/2 top-[28px] -translate-x-1/2 overflow-hidden rounded-[80px_80px_55px_55px] bg-[linear-gradient(180deg,#dcefe9,#bcded5)]">
                  <div className="w-[112px] h-[105px] absolute left-[19px] top-[15px] rounded-[50px_50px_30px_30px] bg-[#263a36]" />
                  <div className="w-[78px] h-[94px] absolute left-[36px] top-[46px] rounded-[45%] bg-[linear-gradient(135deg,#e9b58e,#c98665)]" />
                  <div className="w-[130px] h-[100px] absolute left-[10px] bottom-[-8px] rounded-[65px_65px_0_0] bg-[linear-gradient(135deg,#166f61,#0e5147)]" />
                </div>

                <div className="absolute left-[22px] right-[22px] bottom-[70px] flex items-center gap-[10px] p-[12px] rounded-[14px] bg-[rgba(255,255,255,0.86)] shadow-[0_10px_25px_rgba(18,34,31,0.08)]">
                  <div className="w-[36px] h-[36px] grid place-items-center text-white rounded-[11px] bg-[#16806d]">
                    <Mic2 size={17} />
                  </div>

                  <div className="flex flex-col gap-[2px]">
                    <strong className="text-[11px]">Listening...</strong>
                    <span className="text-[#76837f] text-[9px]">Speak naturally</span>
                  </div>
                </div>

                <div className="absolute left-[22px] right-[22px] bottom-[30px] h-[20px] flex items-center justify-center gap-[3px]">
                  {[6, 10, 16, 12, 20, 11, 17, 8, 18, 12, 20, 9, 16, 7, 14, 19, 10, 6].map((h, index) => (
                    <i
                      key={index}
                      className="w-[3px] rounded-full bg-[#16806d]"
                      style={{
                        height: `${h}px`,
                        animation: 'landingVoiceWave 1s ease-in-out infinite',
                        animationDelay: `${index * 0.07}s`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="w-[245px] h-[490px] absolute right-[4%] top-[55px] z-[5] p-[9px] border-[7px] border-[#1a2a27] rounded-[39px] bg-[#111c1a] shadow-[0_40px_80px_rgba(18,34,31,0.28)] max-[760px]:w-[205px] max-[760px]:h-[420px] max-[760px]:right-0 max-[760px]:top-[65px]"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 1, 0, -1, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-[80px] h-[20px] absolute top-0 left-1/2 -translate-x-1/2 rounded-[0_0_14px_14px] bg-[#1a2a27] z-10" />

                <div className="w-full h-full overflow-hidden relative rounded-[29px] bg-[linear-gradient(160deg,#f2faf7,#d9eee8)]">
                  <div className="flex justify-between px-[17px] pt-[15px] text-[8px] font-[750]">
                    <span>9:41</span>
                    <span>● ● ●</span>
                  </div>

                  <div className="flex items-center gap-[7px] mt-[25px] mx-[17px] text-[#16806d] text-[11px] font-[800]">
                    <div className="w-[25px] h-[25px] relative grid place-items-center text-white rounded-[8px] bg-[#16806d]">
                      <Leaf size={13} className="absolute left-[3px] top-[3px]" />
                      <AudioLines size={12} className="absolute right-[3px] bottom-[3px]" />
                    </div>
                    AarogyaVaani
                  </div>

                  <div className="flex flex-col gap-[8px] mt-[60px] mx-[20px]">
                    <span className="text-[#16806d] text-[9px] font-[800] uppercase tracking-[0.1em]">Question 04</span>
                    <strong className="text-[20px] leading-[1.2] tracking-[-0.03em]">How are you feeling today?</strong>
                  </div>

                  <div className="w-[78px] h-[78px] absolute left-1/2 bottom-[110px] -translate-x-1/2 grid place-items-center text-white rounded-full bg-[linear-gradient(145deg,#1d9078,#0c6254)] shadow-[0_18px_35px_rgba(22,128,109,0.3)]">
                    <motion.div
                      className="absolute -inset-[10px] rounded-full border border-[rgba(22,128,109,0.28)]"
                      animate={{
                        scale: [1, 1.12, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                      }}
                    />

                    <Mic2 size={30} />
                  </div>

                  <div className="absolute bottom-[82px] left-0 right-0 flex items-center justify-center gap-[5px] text-[#71817c] text-[9px]">
                    <Volume2 size={13} />
                    Tap to speak
                  </div>

                  <div className="absolute left-[20px] right-[20px] bottom-[35px] h-[4px] overflow-hidden rounded-full bg-[rgba(22,128,109,0.12)]">
                    <span className="block w-[46%] h-full rounded-full bg-[#16806d]" style={{ animation: 'landingProgressMove 3s ease-in-out infinite' }} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute z-[8] flex items-center gap-[10px] px-[13px] py-[11px] border border-[rgba(255,255,255,0.8)] rounded-[14px] bg-[rgba(255,255,255,0.88)] backdrop-blur-[15px] shadow-[0_10px_30px_rgba(18,34,31,0.07)] right-[-15px] top-[90px] max-[760px]:right-[-5px] max-[760px]:top-[70px]"
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                <WifiOff size={18} className="text-[#16806d]" />

                <div className="flex flex-col gap-[2px]">
                  <strong className="text-[10px]">Offline Ready</strong>
                  <span className="text-[#788680] text-[8px]">Works without internet</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute z-[8] flex items-center gap-[10px] px-[13px] py-[11px] border border-[rgba(255,255,255,0.8)] rounded-[14px] bg-[rgba(255,255,255,0.88)] backdrop-blur-[15px] shadow-[0_10px_30px_rgba(18,34,31,0.07)] left-0 bottom-[80px] max-[760px]:left-[-5px] max-[760px]:bottom-[45px]"
                animate={{ y: [0, 7, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              >
                <Languages size={18} className="text-[#16806d]" />

                <div className="flex flex-col gap-[2px]">
                  <strong className="text-[10px]">Local Language</strong>
                  <span className="text-[#788680] text-[8px]">বাংলা • हिन्दी • Kokborok</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute left-0 right-0 bottom-[-1px] h-[90px] bg-[linear-gradient(to_bottom,transparent,#f7faf8)]" />
        </section>

        {/* =========================================================
            TRIPURA IDENTITY
        ========================================================== */}
        <section className="py-[115px] bg-[#f7faf8] max-[760px]:py-[85px]" id="about">
          <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)]">
            <SectionHeading
              eyebrow="Made with Tripura in focus"
              title="Technology rooted in the place it serves."
              description="Simple, accessible, and built around the way healthcare workers and patients actually interact—with essential tools available without unnecessary complexity."
            />

            <div className="grid grid-cols-[0.95fr_1.05fr] gap-[70px] items-center max-[1050px]:grid-cols-1">
              <motion.div
                className="min-h-[500px] relative overflow-hidden border border-[rgba(22,128,109,0.1)] rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(26,149,123,0.11),transparent_60%),#edf7f3] shadow-[0_30px_80px_rgba(18,34,31,0.14)] panel-bg-grid max-[1050px]:min-h-[520px]"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={TRIPURA_MAP_URL}
                  alt="Tripura state map"
                  className="absolute w-[80%] h-[90%] left-[10%] top-[4%] object-contain opacity-[0.2] drop-shadow-[0_20px_35px_rgba(22,128,109,0.2)]"
                  style={{ animation: 'landingMapPanelPulse 7s ease-in-out infinite' }}
                />

                <div className="absolute left-[25px] top-[25px] flex items-center gap-[10px] px-[13px] py-[10px] rounded-[14px] bg-[rgba(255,255,255,0.82)] backdrop-blur-[12px] shadow-[0_10px_30px_rgba(18,34,31,0.07)]">
                  <Map size={17} className="text-[#16806d]" />

                  <div className="flex flex-col gap-[2px]">
                    <strong className="text-[12px]">Tripura</strong>
                    <span className="text-[#73817d] text-[9px]">State-focused healthcare solution</span>
                  </div>
                </div>

                <div className="absolute left-[47%] top-[43%] flex items-center gap-[7px] px-[10px] py-[7px] text-[#16806d] rounded-full bg-[rgba(255,255,255,0.8)] backdrop-blur-[10px] shadow-[0_8px_20px_rgba(18,34,31,0.08)] text-[9px] font-[750]" style={{ animation: 'landingPinFloat 4s ease-in-out infinite' }}>
                  <span className="w-[7px] h-[7px] rounded-full bg-[#16806d] shadow-[0_0_0_5px_rgba(22,128,109,0.1)]" />
                  Agartala
                </div>

                <div className="absolute left-[53%] top-[62%] flex items-center gap-[7px] px-[10px] py-[7px] text-[#16806d] rounded-full bg-[rgba(255,255,255,0.8)] backdrop-blur-[10px] shadow-[0_8px_20px_rgba(18,34,31,0.08)] text-[9px] font-[750]" style={{ animation: 'landingPinFloat 4s ease-in-out infinite -1s' }}>
                  <span className="w-[7px] h-[7px] rounded-full bg-[#16806d] shadow-[0_0_0_5px_rgba(22,128,109,0.1)]" />
                  Udaipur
                </div>

                <div className="absolute left-[43%] top-[22%] flex items-center gap-[7px] px-[10px] py-[7px] text-[#16806d] rounded-full bg-[rgba(255,255,255,0.8)] backdrop-blur-[10px] shadow-[0_8px_20px_rgba(18,34,31,0.08)] text-[9px] font-[750]" style={{ animation: 'landingPinFloat 4s ease-in-out infinite -2s' }}>
                  <span className="w-[7px] h-[7px] rounded-full bg-[#16806d] shadow-[0_0_0_5px_rgba(22,128,109,0.1)]" />
                  Unakoti
                </div>
              </motion.div>

              <div>
                <span className="inline-flex items-center gap-[7px] text-[#16806d] text-[11px] font-[800] uppercase tracking-[0.1em]">
                  <HeartPulse size={15} />
                  Healthcare • Culture • Accessibility
                </span>

                <h3 className="my-[16px] max-w-[620px] text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.045em] font-bold">
                  From the hills and health centres of Tripura to the
                  doctor&apos;s screen.
                </h3>

                <p className="max-w-[620px] text-[#61716d] leading-[1.8] text-[15px]">
                  AarogyaVaani is a voice-first, offline healthcare
                  platform connecting patients from the remote hills and
                  communities of Tripura with doctors. It helps patients
                  share their health concerns easily through voice and
                  simple interactions, even where connectivity is limited.
                  From a patient&apos;s voice at a local health centre to a
                  doctor&apos;s screen, AarogyaVaani turns distance into a
                  bridge for better care.
                </p>

                <div className="grid grid-cols-3 gap-[10px] mt-[25px] max-[760px]:grid-cols-1">
                  {languages.map((language, index) => (
                    <motion.div
                      className="min-h-[145px] relative flex flex-col p-[17px] overflow-hidden border border-[rgba(18,34,31,0.09)] rounded-[18px] bg-white shadow-[0_10px_25px_rgba(18,34,31,0.04)] max-[760px]:min-h-[110px]"
                      key={language.name}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <span className="absolute right-[12px] top-[10px] text-[rgba(22,128,109,0.2)] text-[10px] font-[800]">
                        {language.icon}
                      </span>

                      <strong className="mb-[8px] text-[21px]">{language.script}</strong>

                      <b className="text-[11px]">{language.name}</b>

                      <small className="mt-[5px] text-[#788680] leading-[1.4] text-[9px]">{language.description}</small>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            HERITAGE VISUAL STRIP
        ========================================================== */}
        <section className="py-[95px] bg-[linear-gradient(180deg,#edf7f3,#f7faf8)] max-[760px]:py-[75px]">
          <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)]">
            <div className="flex items-end justify-between gap-[50px] mb-[35px] max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[10px]">
              <div>
                <span className="inline-flex items-center gap-[7px] text-[#16806d] text-[11px] font-[800] uppercase tracking-[0.13em]">
                  <Building2 size={14} />
                  Tripura heritage layer
                </span>

                <h2 className="mt-[14px] mb-0 text-[clamp(31px,4vw,48px)] leading-[1.05] tracking-[-0.045em] font-bold">Places that make the state recognizable.</h2>
              </div>

              <p className="max-w-[360px] m-0 text-[#61716d] text-[15px] leading-[1.75]">
                Tripura is a beautiful, green state in Northeast India,
                famous for its rich tribal heritage, dense forests, and
                beautiful bamboo handicrafts.
              </p>
            </div>

            <div className="grid grid-cols-[1.25fr_0.85fr_0.85fr] grid-rows-[250px_180px] gap-[14px] max-[760px]:grid-cols-2 max-[760px]:grid-rows-[190px_160px]">
              {heritagePlaces.map((place, index) => (
                <motion.div
                  className={`relative overflow-hidden rounded-[22px] shadow-[0_10px_30px_rgba(18,34,31,0.07)] bg-[#183b34] group ${index === 0 ? "row-span-2 max-[760px]:row-span-2" : ""} ${index === 1 ? "col-span-2 max-[760px]:col-span-1" : ""} ${index > 1 ? "max-[760px]:col-span-1" : ""}`}
                  key={place.name}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.015 }}
                >
                  <img
                    src={place.image}
                    alt={`${place.name}, ${place.location}, Tripura`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full block object-cover transition-all duration-[0.6s] ease-in-out group-hover:scale-[1.06] group-hover:saturate-[1.12]"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,25,21,0.78),rgba(5,25,21,0.02)_65%)]" />

                  <div className="absolute left-[17px] right-[17px] bottom-[15px] flex items-center gap-[9px] text-white">
                    <MapPin size={15} className="text-[#b5e3d6]" />

                    <div className="flex flex-col gap-[2px]">
                      <strong className="text-[12px]">{place.name}</strong>
                      <span className="opacity-[0.72] text-[9px]">{place.location}, Tripura</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FEATURES
        ========================================================== */}
        <section className="py-[120px] bg-[#f7faf8] max-[760px]:py-[85px]" id="features">
          <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)]">
            <SectionHeading
              eyebrow="Built for the real workflow"
              title="Simple for patients. Useful for health workers. Clear for doctors."
              description="AarogyaVaani is built for real communities—supporting healthcare workers and patients with simple, voice-friendly, offline access that works even when connectivity is limited."
              centered
            />

            <div className="grid grid-cols-3 gap-[15px] max-[1050px]:grid-cols-2 max-[760px]:grid-cols-1">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    className="min-h-[250px] relative p-[25px] overflow-hidden border border-[rgba(18,34,31,0.09)] rounded-[23px] bg-white shadow-[0_10px_30px_rgba(18,34,31,0.035)] transition-all duration-200 hover:border-[rgba(22,128,109,0.18)] hover:shadow-[0_25px_55px_rgba(18,34,31,0.1)] group"
                    key={feature.title}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55, delay: index * 0.07 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="w-[48px] h-[48px] grid place-items-center text-[#16806d] rounded-[14px] bg-[#e8f6f2]">
                      <Icon size={22} strokeWidth={2} />
                    </div>

                    <div className="absolute right-[22px] top-[24px] text-[rgba(22,128,109,0.13)] text-[12px] font-[850]">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <h3 className="mt-[27px] mb-[9px] text-[17px] tracking-[-0.02em] font-bold">
                      {feature.title}
                    </h3>

                    <p className="max-w-[270px] m-0 text-[#61716d] text-[13px] leading-[1.7]">
                      {feature.text}
                    </p>

                    <div className="w-[32px] h-[32px] absolute right-[20px] bottom-[20px] grid place-items-center text-[#16806d] rounded-full bg-[#f1f8f5] transition-all duration-200 group-hover:translate-x-[4px] group-hover:bg-[#e8f6f2]">
                      <ChevronRight size={16} />
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================== */}
        <section className="relative overflow-hidden py-[120px] text-white bg-[radial-gradient(circle_at_15%_20%,rgba(50,180,150,0.15),transparent_30%),linear-gradient(135deg,#0b332d,#0c4c40_55%,#08352e)] max-[760px]:py-[85px]" id="how-it-works">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute h-[1px] w-[70%] right-[-10%] rounded-full bg-[rgba(164,228,211,0.12)] top-[30%]" style={{ animation: 'landingSoundLine 8s ease-in-out infinite' }} />
            <div className="absolute h-[1px] w-[70%] right-[-10%] rounded-full bg-[rgba(164,228,211,0.12)] top-[50%]" style={{ animation: 'landingSoundLine 8s ease-in-out infinite -2s' }} />
            <div className="absolute h-[1px] w-[70%] right-[-10%] rounded-full bg-[rgba(164,228,211,0.12)] top-[70%]" style={{ animation: 'landingSoundLine 8s ease-in-out infinite -4s' }} />
          </div>

          <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)] relative z-[2]">
            <SectionHeading
              eyebrow="A simpler process"
              title="How AarogyaVaani Works"
              description="Four simple steps to capture comprehensive maternal and general health histories—completely offline."
              light
            />

            <div className="grid grid-cols-4 gap-[12px] relative z-[2] max-[1050px]:grid-cols-2 max-[760px]:grid-cols-1">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    className="min-h-[270px] relative p-[23px] border border-[rgba(255,255,255,0.09)] rounded-[22px] bg-[rgba(255,255,255,0.055)] backdrop-blur-[10px] transition-all duration-[0.25s] ease hover:bg-[rgba(255,255,255,0.09)]"
                    key={step.title}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-[48px] h-[48px] grid place-items-center text-[#c5eee2] rounded-[14px] bg-[rgba(157,228,210,0.1)] border border-[rgba(157,228,210,0.13)]">
                        <Icon size={22} />
                      </div>

                      <span className="text-[rgba(181,227,214,0.6)] text-[11px] font-[800]">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="mt-[35px] mb-[10px] text-[17px] font-bold">
                      {step.title}
                    </h3>

                    <p className="m-0 text-[rgba(255,255,255,0.62)] text-[12px] leading-[1.7]">
                      {step.text}
                    </p>

                    {index < howItWorks.length - 1 && (
                      <div className="absolute right-[-18px] top-[45%] z-[5] text-[#80cdbb] max-[1050px]:hidden max-[760px]:hidden">
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="mt-[28px] flex items-center gap-[15px] px-[20px] py-[17px] border border-[rgba(255,255,255,0.09)] rounded-[18px] bg-[rgba(255,255,255,0.055)] backdrop-blur-[12px] max-[760px]:items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="shrink-0 w-[44px] h-[44px] grid place-items-center text-[#b9e9dc] rounded-[13px] bg-[rgba(128,205,187,0.1)] max-[760px]:hidden">
                <ShieldCheck size={20} />
              </div>

              <div className="flex flex-col gap-[4px] flex-1">
                <strong className="text-[12px]">Clinical Safety Baseline</strong>
                <span className="text-[rgba(255,255,255,0.58)] text-[10px]">
                  All recorded interviews strictly check against predefined maternal health danger signs (e.g. bleeding, severe headache, swelling).
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================== */}
        <section className="relative py-[100px] bg-[#f7faf8] max-[760px]:py-[70px]">
          <div className="absolute right-[-100px] top-[-80px] w-[450px] h-[550px] opacity-[0.08] pointer-events-none">
            <img src={TRIPURA_MAP_URL} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)] relative">
            <motion.div
              className="relative overflow-hidden px-[35px] py-[75px] text-center rounded-[34px] text-white bg-[radial-gradient(circle_at_50%_0%,rgba(77,205,174,0.2),transparent_40%),linear-gradient(135deg,#0c5d4f,#0b342e)] shadow-[0_35px_80px_rgba(10,70,59,0.2)] max-[760px]:px-[20px] max-[760px]:py-[55px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-[58px] h-[58px] grid place-items-center mx-auto mb-[20px] text-[#c5eee2] rounded-[18px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]">
                <HeartPulse size={26} />
              </div>

              <span className="inline-flex items-center gap-[7px] text-[#b9e9dc] text-[11px] font-[800] uppercase tracking-[0.13em]">
                <Sparkles size={14} />
                Try AarogyaVaani
              </span>

              <h2 className="my-[15px] text-[clamp(38px,5vw,58px)] tracking-[-0.05em] font-bold">Ready to modernize intake?</h2>

              <p className="mx-auto mt-0 mb-[28px] text-[rgba(255,255,255,0.65)] text-[14px]">
                AarogyaVaani is completely free and works directly in your
                browser.
                <br />
                Try the patient interview now—no installation required.
              </p>

              <button
                type="button"
                className="min-h-[52px] px-[22px] inline-flex items-center justify-center gap-[9px] rounded-[13px] text-[14px] font-[750] cursor-pointer transition-all hover:-translate-y-[3px] border-0 text-white bg-[linear-gradient(135deg,#1b8e77,#0a6253)] shadow-[0_12px_25px_rgba(22,128,109,0.25)] hover:shadow-[0_18px_35px_rgba(22,128,109,0.31)]"
                onClick={goToLogin}
              >
                Launch AarogyaVaani
                <ArrowRight size={17} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="py-[60px] pb-[25px] bg-[#071f1b] text-white">
        <div className="w-[min(1180px,calc(100%-40px))] mx-auto max-[760px]:w-[min(100%-28px,620px)]">
          <div className="grid grid-cols-[1.2fr_0.7fr_1fr] gap-[60px] max-[1050px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-[30px]">
            <div>
              <Logo />
              <p className="max-w-[330px] my-[17px] text-[rgba(255,255,255,0.5)] text-[12px] leading-[1.7]">
                A voice-first, offline-capable patient intake system designed
                specifically for the primary health centres and communities of
                Tripura.
              </p>

              <div className="inline-flex items-center gap-[5px] text-[#8fcfbe] text-[10px] font-bold">
                <MapPin size={12} />
                Agartala, Tripura
              </div>
            </div>

            <div>
              <span className="block mb-[15px] text-white text-[12px] font-bold uppercase tracking-[0.08em]">Explore</span>
              <div className="flex flex-col items-start gap-[4px]">
                <button type="button" className="pl-0 text-[rgba(255,255,255,0.58)] border-0 bg-transparent cursor-pointer py-[10px] rounded-[10px] text-[14px] font-semibold transition-all hover:bg-transparent hover:text-white" onClick={() => navigateTo("home", "Home")}>
                  Home
                </button>
                <button type="button" className="pl-0 text-[rgba(255,255,255,0.58)] border-0 bg-transparent cursor-pointer py-[10px] rounded-[10px] text-[14px] font-semibold transition-all hover:bg-transparent hover:text-white" onClick={() => navigateTo("about", "About")}>
                  About
                </button>
                <button type="button" className="pl-0 text-[rgba(255,255,255,0.58)] border-0 bg-transparent cursor-pointer py-[10px] rounded-[10px] text-[14px] font-semibold transition-all hover:bg-transparent hover:text-white" onClick={() => navigateTo("features", "Features")}>
                  Features
                </button>
                <button type="button" className="pl-0 text-[rgba(255,255,255,0.58)] border-0 bg-transparent cursor-pointer py-[10px] rounded-[10px] text-[14px] font-semibold transition-all hover:bg-transparent hover:text-white" onClick={goToLogin}>
                  Login
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-[7px] items-end text-right max-[1050px]:items-start max-[1050px]:text-left max-[760px]:items-start max-[760px]:text-left">
              <span className="text-[rgba(255,255,255,0.72)] text-[11px] font-bold">Privacy & Clinical Notice</span>
              <small className="max-w-[250px] text-[rgba(255,255,255,0.4)] text-[9px] leading-[1.6]">
                AarogyaVaani is an intake assistant, not a diagnostic tool. All
                patient data remains strictly local to the device until
                expressly submitted.
              </small>
            </div>
          </div>

          <div className="flex justify-between mt-[45px] pt-[20px] border-t border-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.35)] text-[9px] max-[760px]:flex-col max-[760px]:gap-[10px]">
            <span>© {new Date().getFullYear()} AarogyaVaani Tripura.</span>
            <span>Made for the people of Tripura.</span>
          </div>
        </div>
      </footer>

      {/* =========================================================
          TOAST NOTIFICATION
      ========================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed right-[25px] bottom-[25px] z-[2000] min-w-[300px] flex items-center gap-[11px] p-[13px] border border-[rgba(22,128,109,0.15)] rounded-[16px] bg-[rgba(255,255,255,0.94)] backdrop-blur-[18px] shadow-[0_25px_60px_rgba(18,34,31,0.17)] max-[760px]:left-[14px] max-[760px]:right-[14px] max-[760px]:bottom-[14px] max-[760px]:min-w-0"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-[37px] h-[37px] shrink-0 grid place-items-center text-white rounded-[11px] bg-[#16806d]">
              <Clock3 size={16} />
            </div>

            <div className="flex-1 flex flex-col gap-[3px]">
              <strong className="text-[11px]">{toast}</strong>
              <span className="text-[#71807b] text-[9px]">Just now</span>
            </div>

            <button
              type="button"
              className="w-[30px] h-[30px] grid place-items-center border-0 rounded-[9px] text-[#70807b] bg-[#f2f6f4] cursor-pointer"
              onClick={() => setToast("")}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;