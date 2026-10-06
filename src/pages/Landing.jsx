import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
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

import "./Landing.css";

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
    <div className="brand">
      <div className="brand-mark">
        <Leaf size={20} strokeWidth={2.4} />
        <AudioLines size={17} strokeWidth={2.5} />
      </div>

      <div className="brand-text">
        <strong>AarogyaVaani</strong>
        <span>Tripura Health</span>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <span className="section-eyebrow">
        <Sparkles size={14} />
        {eyebrow}
      </span>

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </div>
  );
}

function App() {
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
    window.location.href = "/login";
  };

  return (
    <div className="landing-page">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="navbar">
        <div className="nav-inner">
          <button
            type="button"
            className="brand-button"
            onClick={() => navigateTo("home", "Home")}
            aria-label="AarogyaVaani Home"
          >
            <Logo />
          </button>

          <nav
            className={`nav-links ${menuOpen ? "open" : ""}`}
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
                className="nav-link"
                onClick={() => navigateTo(id, label)}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              className="nav-cta"
              onClick={goToLogin}
            >
              Get Started
              <ArrowRight size={17} />
            </button>
          </nav>

          <button
            type="button"
            className="mobile-menu"
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
        <section className="hero">
          <div className="hero-background">
            <div className="hero-grid" />

            <motion.img
              className="tripura-map"
              src={TRIPURA_MAP_URL}
              alt="Tripura state map outline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.14, scale: 1 }}
              transition={{ duration: 1.4 }}
            />

            <div className="map-label">
              <MapPin size={13} />
              <span>Tripura, India</span>
            </div>

            <div className="ambient-orb orb-one" />
            <div className="ambient-orb orb-two" />

            <div className="heritage-card heritage-one">
              <img
                src={heritagePlaces[0].image}
                alt="Ujjayanta Palace in Agartala, Tripura"
                loading="eager"
                decoding="async"
              />
              <span>Ujjayanta Palace</span>
            </div>

            <div className="heritage-card heritage-two">
              <img
                src={heritagePlaces[1].image}
                alt="Neermahal in Tripura"
                loading="eager"
                decoding="async"
              />
              <span>Neermahal</span>
            </div>

            <div className="heritage-card heritage-three">
              <img
                src={heritagePlaces[2].image}
                alt="Unakoti in Tripura"
                loading="eager"
                decoding="async"
              />
              <span>Unakoti</span>
            </div>
          </div>

          <div className="container hero-container">
            <div className="hero-content">
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="live-dot" />
                Voice-first healthcare • Tripura
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Healthcare that
                <span> listens to you.</span>
              </motion.h1>

              <motion.p
                className="hero-description"
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
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <button
                  type="button"
                  className="primary-button"
                  onClick={goToLogin}
                >
                  <Mic2 size={18} />
                  Start with your voice
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    navigateTo("how-it-works", "How It Works")
                  }
                >
                  <Activity size={18} />
                  See how it works
                </button>
              </motion.div>

              <motion.div
                className="hero-trust"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span>
                  <CheckCircle2 size={16} />
                  Bengali + Hindi MVP
                </span>

                <span>
                  <CheckCircle2 size={16} />
                  Offline capable
                </span>

                <span>
                  <CheckCircle2 size={16} />
                  Tripura-focused
                </span>
              </motion.div>
            </div>

            {/* HERO PHONE / PERSON VISUAL */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, x: 70, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.25 }}
            >
              <div className="visual-glow" />

              <motion.div
                className="person-panel"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="person-avatar">
                  <div className="person-hair" />
                  <div className="person-face" />
                  <div className="person-body" />
                </div>

                <div className="voice-status">
                  <div className="voice-icon">
                    <Mic2 size={17} />
                  </div>

                  <div>
                    <strong>Listening...</strong>
                    <span>Speak naturally</span>
                  </div>
                </div>

                <div className="voice-bars">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <i
                      key={index}
                      style={{
                        animationDelay: `${index * 0.07}s`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="phone"
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
                <div className="phone-notch" />

                <div className="phone-screen">
                  <div className="phone-top">
                    <span>9:41</span>
                    <span>● ● ●</span>
                  </div>

                  <div className="phone-brand">
                    <div className="mini-logo">
                      <Leaf size={13} />
                      <AudioLines size={12} />
                    </div>
                    AarogyaVaani
                  </div>

                  <div className="phone-question">
                    <span>Question 04</span>
                    <strong>How are you feeling today?</strong>
                  </div>

                  <div className="phone-mic">
                    <motion.div
                      className="mic-ring"
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

                  <div className="phone-hint">
                    <Volume2 size={13} />
                    Tap to speak
                  </div>

                  <div className="phone-progress">
                    <span />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="floating-status status-offline"
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                <WifiOff size={18} />

                <div>
                  <strong>Offline Ready</strong>
                  <span>Works without internet</span>
                </div>
              </motion.div>

              <motion.div
                className="floating-status status-language"
                animate={{ y: [0, 7, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              >
                <Languages size={18} />

                <div>
                  <strong>Local Language</strong>
                  <span>বাংলা • हिन्दी • Kokborok</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="hero-bottom-fade" />
        </section>

        {/* =========================================================
            TRIPURA IDENTITY
        ========================================================== */}
        <section className="tripura-section" id="about">
          <div className="container">
            <SectionHeading
              eyebrow="Made with Tripura in focus"
              title="Technology rooted in the place it serves."
              description="Simple, accessible, and built around the way healthcare workers and patients actually interact—with essential tools available without unnecessary complexity."
            />

            <div className="tripura-grid">
              <motion.div
                className="tripura-map-panel"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="panel-glow" />

                <img
                  src={TRIPURA_MAP_URL}
                  alt="Tripura state map"
                />

                <div className="map-panel-label">
                  <Map size={17} />

                  <div>
                    <strong>Tripura</strong>
                    <span>State-focused healthcare solution</span>
                  </div>
                </div>

                <div className="map-pin pin-agartala">
                  <span />
                  Agartala
                </div>

                <div className="map-pin pin-udaipur">
                  <span />
                  Udaipur
                </div>

                <div className="map-pin pin-kailashahar">
                  <span />
                  Unakoti
                </div>
              </motion.div>

              <div className="tripura-copy">
                <span className="mini-kicker">
                  <HeartPulse size={15} />
                  Healthcare • Culture • Accessibility
                </span>

                <h3>
                  From the hills and health centres of Tripura to the
                  doctor&apos;s screen.
                </h3>

                <p>
                  AarogyaVaani is a voice-first, offline healthcare
                  platform connecting patients from the remote hills and
                  communities of Tripura with doctors. It helps patients
                  share their health concerns easily through voice and
                  simple interactions, even where connectivity is limited.
                  From a patient&apos;s voice at a local health centre to a
                  doctor&apos;s screen, AarogyaVaani turns distance into a
                  bridge for better care.
                </p>

                <div className="language-grid">
                  {languages.map((language, index) => (
                    <motion.div
                      className="language-card"
                      key={language.name}
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      whileHover={{
                        y: -5,
                        scale: 1.02,
                      }}
                    >
                      <span className="language-number">
                        {language.icon}
                      </span>

                      <strong>{language.script}</strong>

                      <b>{language.name}</b>

                      <small>{language.description}</small>
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
        <section className="heritage-section">
          <div className="container">
            <div className="heritage-heading">
              <div>
                <span className="section-eyebrow">
                  <Building2 size={14} />
                  Tripura heritage layer
                </span>

                <h2>Places that make the state recognizable.</h2>
              </div>

              <p>
                Tripura is a beautiful, green state in Northeast India,
                famous for its rich tribal heritage, dense forests, and
                beautiful bamboo handicrafts.
              </p>
            </div>

            <div className="heritage-grid">
              {heritagePlaces.map((place, index) => (
                <motion.div
                  className="heritage-place"
                  key={place.name}
                  initial={{
                    opacity: 0,
                    y: 35,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.015,
                  }}
                >
                  <img
                    src={place.image}
                    alt={`${place.name}, ${place.location}, Tripura`}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="heritage-overlay" />

                  <div className="heritage-place-info">
                    <MapPin size={15} />

                    <div>
                      <strong>{place.name}</strong>
                      <span>{place.location}, Tripura</span>
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
        <section className="features-section" id="features">
          <div className="container">
            <SectionHeading
              eyebrow="Built for the real workflow"
              title="Simple for patients. Useful for health workers. Clear for doctors."
              description="AarogyaVaani is built for real communities—supporting healthcare workers and patients with simple, voice-friendly, offline access that works even when connectivity is limited."
              centered
            />

            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    className="feature-card"
                    key={feature.title}
                    initial={{
                      opacity: 0,
                      y: 35,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.07,
                    }}
                    whileHover={{
                      y: -8,
                    }}
                  >
                    <div className="feature-icon">
                      <Icon
                        size={22}
                        strokeWidth={2}
                      />
                    </div>

                    <span className="feature-number">
                      0{index + 1}
                    </span>

                    <h3>{feature.title}</h3>

                    <p>{feature.text}</p>

                    <div className="feature-arrow">
                      <ChevronRight size={17} />
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
        <section
          className="how-section"
          id="how-it-works"
        >
          <div className="how-background">
            <div className="sound-line line-one" />
            <div className="sound-line line-two" />
            <div className="sound-line line-three" />
          </div>

          <div className="container">
            <SectionHeading
              eyebrow="How AarogyaVaani works"
              title="A guided conversation, not a complicated form."
              description="The app moves the first step of history-taking closer to the patient and health worker."
              centered
            />

            <div className="steps-grid">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    className="step-card"
                    key={step.number}
                    initial={{
                      opacity: 0,
                      scale: 0.94,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.12,
                    }}
                  >
                    <div className="step-top">
                      <span>{step.number}</span>

                      <div className="step-icon">
                        <Icon size={22} />
                      </div>
                    </div>

                    <h3>{step.title}</h3>

                    <p>{step.text}</p>

                    {index < howItWorks.length - 1 && (
                      <ArrowRight
                        className="step-arrow"
                        size={20}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="safety-banner"
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
            >
              <div className="safety-icon">
                <ShieldCheck size={23} />
              </div>

              <div>
                <strong>
                  Safety remains human-reviewed.
                </strong>

                <span>
                  AarogyaVaani does not diagnose. The doctor reviews,
                  edits and approves the generated summary.
                </span>
              </div>

              <Clock3 size={21} />
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="cta-section">
          <div className="cta-map">
            <img
              src={TRIPURA_MAP_URL}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="container">
            <motion.div
              className="cta-card"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
              }}
            >
              <div className="cta-icon">
                <HeartPulse size={28} />
              </div>

              <span className="section-eyebrow">
                <Sparkles size={14} />
                From Tripura, for better conversations in healthcare
              </span>

              <h2>Let every patient be heard.</h2>

              <p>
                Voice-first. Offline-ready. Designed around the
                patient, health worker and doctor.
              </p>

              <button
                type="button"
                className="primary-button large"
                onClick={goToLogin}
              >
                <Mic2 size={19} />
                Explore AarogyaVaani
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Logo />

            <p>
              A voice-first, offline patient intake tool for primary
              health centres.
            </p>

            <span className="footer-state">
              <MapPin size={14} />
              State focus: Tripura
            </span>
          </div>

          <div className="footer-links">
            <button
              type="button"
              onClick={() => navigateTo("home", "Home")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigateTo("about", "About")}
            >
              About
            </button>

            <button
              type="button"
              onClick={() => navigateTo("features", "Features")}
            >
              Features
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("how-it-works", "How It Works")
              }
            >
              How It Works
            </button>
          </div>

          <div className="footer-credit">
            <span>
              AarogyaVaani • Hack for Social Cause
            </span>

            <small>
              Tripura-focused healthcare accessibility
            </small>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 AarogyaVaani</span>

          <span>
            Tripura&apos;s Voice-First Healthcare Platform
          </span>
        </div>
      </footer>

      {/* =========================================================
          POPUP / TOAST
      ========================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="site-toast"
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.96,
            }}
          >
            <div className="toast-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <strong>AarogyaVaani</strong>
              <span>{toast}</span>
            </div>

            <button
              type="button"
              onClick={() => setToast("")}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;