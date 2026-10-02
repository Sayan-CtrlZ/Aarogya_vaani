import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  WifiOff,
  Leaf,
} from "lucide-react";

import "./Login.css";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tripura_map_for_WLM-IN.svg";

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

const roles = [
  {
    id: "health-worker",
    title: "Health Worker",
    subtitle: "ASHA / ANM",
    icon: UsersRound,
  },
  {
    id: "doctor",
    title: "Doctor",
    subtitle: "Clinical review",
    icon: Stethoscope,
  },
];

function Login() {
  const [selectedRole, setSelectedRole] = useState("health-worker");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!identifier || !password) {
      setMessage("Please enter your login details.");
      return;
    }

    setMessage(
      "Demo login submitted. Connect this form to your authentication backend next."
    );
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <main className="login-page">
      {/* Animated background */}
      <div className="login-background">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />
        <div className="grid-overlay" />
      </div>

      <div className="login-shell">
        {/* LEFT SIDE */}
        <motion.section
          className="login-visual"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="visual-top">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={17} />
              Back to home
            </button>

            <Logo />
          </div>

          <div className="visual-content">
            <div className="location-label">
              <MapPin size={15} />
              <span>Tripura • Primary Healthcare</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              Healthcare that
              <span> listens.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              AarogyaVaani helps health workers capture patient histories
              through voice and simple interactions, even when connectivity is
              limited.
            </motion.p>

            {/* Tripura map */}
            <motion.div
              className="map-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              <div className="map-glow" />

              <img
                src={TRIPURA_MAP_URL}
                alt="Map of Tripura"
                className="tripura-map"
              />

              <div className="map-label">
                <MapPin size={14} />
                <span>Tripura</span>
              </div>

              <div className="map-pulse pulse-one" />
              <div className="map-pulse pulse-two" />
              <div className="map-pulse pulse-three" />
            </motion.div>

            {/* Feature strip */}
            <div className="visual-features">
              <div className="visual-feature">
                <div className="feature-icon">
                  <AudioLines size={17} />
                </div>

                <div>
                  <strong>Voice-first</strong>
                  <span>Speak naturally</span>
                </div>
              </div>

              <div className="visual-feature">
                <div className="feature-icon">
                  <WifiOff size={17} />
                </div>

                <div>
                  <strong>Offline-ready</strong>
                  <span>Works without internet</span>
                </div>
              </div>

              <div className="visual-feature">
                <div className="feature-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>Consent-first</strong>
                  <span>Patient-controlled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="visual-footer">
            <Activity size={15} />

            <span>
              Designed for public healthcare delivery in Tripura
            </span>
          </div>
        </motion.section>

        {/* RIGHT SIDE */}
        <motion.section
          className="login-panel"
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mobile-logo">
            <Logo />
          </div>

          <div className="login-card">
            <div className="login-heading">
              <div className="heading-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <span className="eyebrow">SECURE ACCESS</span>
                <h2>Welcome back</h2>
              </div>
            </div>

            <p className="login-description">
              Sign in to access the AarogyaVaani healthcare workspace.
            </p>

            {/* Role selection */}
            <div className="role-section">
              <div className="section-label">
                <span>Continue as</span>
              </div>

              <div className="role-grid">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;

                  return (
                    <button
                      type="button"
                      key={role.id}
                      className={`role-card ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="role-icon">
                        <Icon size={21} />
                      </div>

                      <div className="role-text">
                        <strong>{role.title}</strong>
                        <span>{role.subtitle}</span>
                      </div>

                      {isActive && (
                        <motion.div
                          className="role-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 size={17} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login form */}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="identifier">
                  Mobile number or email
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(event.target.value)
                    }
                    placeholder="Enter your mobile or email"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="password-label">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="forgot-button"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                />

                <span className="custom-checkbox">
                  {remember && <CheckCircle2 size={13} />}
                </span>

                <span>Keep me signed in</span>
              </label>

              <button className="login-submit" type="submit">
                Sign in
                <ArrowRight size={18} />
              </button>

              <AnimatePresence>
                {message && (
                  <motion.div
                    className="login-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Activity size={16} />
                    <span>{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Registration explanation */}
            <div className="access-note">
              <div className="note-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Authorized healthcare access</strong>

                <p>
                  Health workers and doctors use accounts provided through
                  the healthcare system. Patient accounts are not required
                  for the AarogyaVaani health-centre workflow.
                </p>
              </div>
            </div>

            {/* Patient workflow explanation */}
            <div className="patient-flow-card">
              <div className="patient-flow-icon">
                <UserRound size={20} />
              </div>

              <div>
                <strong>What about the patient?</strong>

                <p>
                  Patients use the health-centre device during their visit.
                  They can speak or tap answers, while an ASHA or ANM can
                  operate the same flow in Assist Mode.
                </p>
              </div>
            </div>
          </div>

          <div className="login-bottom">
            <span>© AarogyaVaani</span>

            <span className="bottom-divider" />

            <span>Tripura Health</span>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default Login;