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
import { useNavigate } from "react-router-dom";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tripura_map_for_WLM-IN.svg";

function Logo({ isMobile = false }) {
  return (
    <div className={`inline-flex items-center gap-[11px] ${isMobile ? "" : "max-[650px]:hidden"}`}>
      <div className="w-[43px] h-[43px] rounded-[13px] grid place-items-center relative text-[#e7f7e9] bg-[linear-gradient(135deg,rgba(106,181,134,0.9),rgba(37,119,97,0.9))] shadow-[0_10px_30px_rgba(53,150,112,0.2),inset_0_0_0_1px_rgba(255,255,255,0.18)]">
        <Leaf size={20} strokeWidth={2.4} />
        <AudioLines className="-ml-[5px]" size={17} strokeWidth={2.5} />
      </div>

      <div className="flex flex-col leading-[1.05]">
        <strong className="text-[17px] tracking-[-0.4px]">AarogyaVaani</strong>
        <span className="mt-[5px] text-[10px] uppercase tracking-[1.5px] text-[rgba(232,242,235,0.55)]">Tripura Health</span>
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
  const navigate = useNavigate();
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

    sessionStorage.setItem("aarogyaVaaniRole", selectedRole);

    sessionStorage.setItem(
      "aarogyaVaaniUserName",
      selectedRole === "doctor"
        ? "Dr. Aarogya"
        : "Health Worker"
    );

    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(61,126,99,0.18),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(32,116,102,0.15),transparent_30%),#071713] text-[#f4f7f3] font-sans">
      <style>{`
        @keyframes mapPulse {
          0% { box-shadow: 0 0 0 0 rgba(164, 223, 177, 0.35); }
          70% { box-shadow: 0 0 0 14px rgba(164, 223, 177, 0); }
          100% { box-shadow: 0 0 0 0 rgba(164, 223, 177, 0); }
        }
      `}</style>
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[380px] h-[380px] rounded-full blur-[70px] opacity-18 top-[-180px] left-[-100px] bg-[#62b18b]" />
        <div className="absolute w-[380px] h-[380px] rounded-full blur-[70px] opacity-18 right-[-170px] top-[25%] bg-[#3a9c94]" />
        <div className="absolute w-[380px] h-[380px] rounded-full blur-[70px] opacity-18 bottom-[-200px] left-[40%] bg-[#9dbb75]" />
        <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:48px_48px]" />
      </div>

      <div className="relative z-10 w-[min(1440px,100%)] min-h-screen mx-auto grid grid-cols-[1.08fr_0.92fr] max-[1050px]:grid-cols-1">
        {/* LEFT SIDE */}
        <motion.section
          className="min-h-screen px-[clamp(30px,5vw,72px)] py-[32px] flex flex-col justify-between border-r border-[rgba(255,255,255,0.08)] relative max-[1050px]:min-h-auto max-[1050px]:border-r-0 max-[1050px]:border-b max-[1050px]:pb-[35px] max-[650px]:p-[20px]"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-between gap-[20px] max-[650px]:items-start">
            <button className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.045)] text-[rgba(245,248,245,0.76)] rounded-full px-[14px] py-[9px] inline-flex items-center gap-[8px] cursor-pointer text-[12px] transition-[0.25s_ease] hover:text-white hover:border-[rgba(151,213,172,0.35)] hover:bg-[rgba(255,255,255,0.08)] hover:-translate-x-[2px] max-[650px]:text-[10px] max-[650px]:px-[11px] max-[650px]:py-[8px]" onClick={handleBack}>
              <ArrowLeft size={17} />
              Back to home
            </button>

            <Logo />
          </div>

          <div className="w-[min(680px,100%)] my-auto py-[50px] pb-[34px] max-[1050px]:m-0 max-[650px]:pt-[40px] max-[650px]:pb-[10px]">
            <div className="inline-flex items-center gap-[7px] px-[11px] py-[7px] rounded-full text-[#b8dec1] bg-[rgba(97,169,124,0.08)] border border-[rgba(111,189,140,0.16)] text-[11px] tracking-[0.4px]">
              <MapPin size={15} />
              <span>Tripura • Primary Healthcare</span>
            </div>

            <motion.h1
              className="my-[22px] mb-[15px] max-w-[650px] text-[clamp(42px,5vw,72px)] leading-[0.98] tracking-[-3px] font-bold max-[650px]:text-[44px] max-[650px]:tracking-[-2px] max-[390px]:text-[38px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              Healthcare that
              <span className="text-[#9ed2a9]"> listens.</span>
            </motion.h1>

            <motion.p
              className="max-w-[570px] text-[rgba(237,245,239,0.64)] leading-[1.75] text-[15px] m-0 mb-[30px] max-[650px]:text-[13px]"
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
              className="h-[230px] rounded-[25px] relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(73,152,111,0.12),transparent_60%),rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.09)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_25px_70px_rgba(0,0,0,0.16)] max-[650px]:h-[190px] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] before:bg-[length:30px_30px]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              <div className="absolute w-[230px] h-[230px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(86,176,119,0.14)] blur-[45px]" />

              <img
                src={TRIPURA_MAP_URL}
                alt="Map of Tripura"
                className="absolute h-[185px] w-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.82] filter brightness-[0.95] saturate-[0.8] drop-shadow-[0_15px_20px_rgba(0,0,0,0.25)] max-[650px]:h-[155px]"
              />

              <div className="absolute left-[18px] bottom-[17px] flex items-center gap-[7px] px-[10px] py-[7px] rounded-[8px] text-[11px] text-[#c9e6cf] bg-[rgba(4,19,15,0.68)] border border-[rgba(139,205,157,0.17)] backdrop-blur-[10px]">
                <MapPin size={14} />
                <span>Tripura</span>
              </div>

              <div className="absolute w-[9px] h-[9px] rounded-full bg-[#a4dfb1] shadow-[0_0_0_5px_rgba(164,223,177,0.08)] animate-[mapPulse_2.5s_infinite_ease-out] left-[47%] top-[28%]" />
              <div className="absolute w-[9px] h-[9px] rounded-full bg-[#a4dfb1] shadow-[0_0_0_5px_rgba(164,223,177,0.08)] animate-[mapPulse_2.5s_infinite_ease-out] left-[55%] top-[56%] [animation-delay:0.8s]" />
              <div className="absolute w-[9px] h-[9px] rounded-full bg-[#a4dfb1] shadow-[0_0_0_5px_rgba(164,223,177,0.08)] animate-[mapPulse_2.5s_infinite_ease-out] left-[43%] top-[72%] [animation-delay:1.5s]" />
            </motion.div>

            {/* Feature strip */}
            <div className="grid grid-cols-3 gap-[10px] mt-[13px] max-[650px]:grid-cols-1">
              <div className="flex items-center gap-[9px] p-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] rounded-[13px]">
                <div className="w-[32px] h-[32px] shrink-0 grid place-items-center rounded-[9px] text-[#bde8c7] bg-[rgba(96,180,123,0.1)]">
                  <AudioLines size={17} />
                </div>

                <div>
                  <strong className="block text-[11px]">Voice-first</strong>
                  <span className="block mt-[3px] text-[rgba(238,244,239,0.45)] text-[9px]">Speak naturally</span>
                </div>
              </div>

              <div className="flex items-center gap-[9px] p-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] rounded-[13px]">
                <div className="w-[32px] h-[32px] shrink-0 grid place-items-center rounded-[9px] text-[#bde8c7] bg-[rgba(96,180,123,0.1)]">
                  <WifiOff size={17} />
                </div>

                <div>
                  <strong className="block text-[11px]">Offline-ready</strong>
                  <span className="block mt-[3px] text-[rgba(238,244,239,0.45)] text-[9px]">Works without internet</span>
                </div>
              </div>

              <div className="flex items-center gap-[9px] p-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] rounded-[13px]">
                <div className="w-[32px] h-[32px] shrink-0 grid place-items-center rounded-[9px] text-[#bde8c7] bg-[rgba(96,180,123,0.1)]">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong className="block text-[11px]">Consent-first</strong>
                  <span className="block mt-[3px] text-[rgba(238,244,239,0.45)] text-[9px]">Patient-controlled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[8px] text-[rgba(239,247,241,0.4)] text-[10px] pt-[15px] max-[650px]:hidden">
            <Activity size={15} />

            <span>
              Designed for public healthcare delivery in Tripura
            </span>
          </div>
        </motion.section>

        {/* RIGHT SIDE */}
        <motion.section
          className="min-h-screen px-[clamp(25px,5vw,72px)] py-[32px] flex flex-col justify-center items-center max-[1050px]:min-h-auto max-[1050px]:py-[50px] max-[650px]:px-[20px] max-[650px]:pt-[30px] max-[650px]:pb-[35px]"
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hidden max-[650px]:block max-[650px]:w-full max-[650px]:mb-[22px]">
            <Logo isMobile={true} />
          </div>

          <div className="w-[min(500px,100%)] p-[clamp(25px,4vw,42px)] rounded-[27px] bg-[rgba(10,30,24,0.72)] border border-[rgba(255,255,255,0.09)] shadow-[0_35px_100px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[24px] max-[1050px]:w-[min(560px,100%)] max-[650px]:p-[22px] max-[650px]:rounded-[21px] max-[390px]:p-[18px]">
            <div className="flex items-center gap-[13px]">
              <div className="w-[43px] h-[43px] grid place-items-center rounded-[13px] text-[#bde8c7] bg-[rgba(95,177,120,0.1)] border border-[rgba(127,200,148,0.12)]">
                <LockKeyhole size={20} />
              </div>

              <div>
                <span className="block mb-[5px] text-[9px] tracking-[1.7px] text-[#86bd94] font-bold">SECURE ACCESS</span>
                <h2 className="m-0 text-[29px] tracking-[-1px] max-[650px]:text-[25px]">Welcome back</h2>
              </div>
            </div>

            <p className="text-[rgba(237,244,239,0.56)] text-[13px] leading-[1.6] my-[13px] mb-[25px]">
              Sign in to access the AarogyaVaani healthcare workspace.
            </p>

            {/* Role selection */}
            <div>
              <div className="mb-[9px] text-[rgba(237,244,239,0.52)] text-[10px] uppercase tracking-[1px]">
                <span>Continue as</span>
              </div>

              <div className="grid grid-cols-2 gap-[10px] max-[650px]:grid-cols-1">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;

                  return (
                    <button
                      type="button"
                      key={role.id}
                      className={`relative min-h-[75px] rounded-[14px] p-[12px] flex items-center gap-[10px] text-left cursor-pointer text-white border transition-[0.25s_ease] hover:-translate-y-[1px] max-[650px]:min-h-[66px] ${
                        isActive ? "border-[rgba(128,207,151,0.42)] bg-[rgba(88,169,111,0.1)] shadow-[0_10px_30px_rgba(56,143,87,0.08)]" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] hover:border-[rgba(137,205,154,0.25)] hover:bg-[rgba(255,255,255,0.045)]"
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="w-[38px] h-[38px] shrink-0 grid place-items-center rounded-[11px] text-[#acdcb8] bg-[rgba(95,177,120,0.09)]">
                        <Icon size={21} />
                      </div>

                      <div>
                        <strong className="block text-[12px]">{role.title}</strong>
                        <span className="block mt-[4px] text-[rgba(237,244,239,0.42)] text-[9px]">{role.subtitle}</span>
                      </div>

                      {isActive && (
                        <motion.div
                          className="absolute top-[8px] right-[8px] text-[#a5ddb1]"
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
            <form className="mt-[24px]" onSubmit={handleSubmit}>
              <div className="mb-[17px]">
                <label htmlFor="identifier" className="block mb-[7px] text-[rgba(243,248,244,0.68)] text-[11px] font-medium">
                  Mobile number or email
                </label>

                <div className="h-[48px] flex items-center gap-[9px] px-[14px] rounded-[12px] text-[rgba(203,232,210,0.55)] border border-[rgba(255,255,255,0.09)] bg-[rgba(0,0,0,0.12)] transition-[0.25s_ease] focus-within:border-[rgba(124,202,148,0.45)] focus-within:shadow-[0_0_0_3px_rgba(105,181,128,0.07)]">
                  <Mail size={18} />

                  <input
                    id="identifier"
                    type="text"
                    className="min-w-0 w-full h-full border-0 outline-0 text-white bg-transparent font-inherit text-[12px] placeholder:text-[rgba(237,244,239,0.28)]"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(event.target.value)
                    }
                    placeholder="Enter your mobile or email"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-[17px]">
                <div className="flex items-center justify-between mb-[7px]">
                  <label htmlFor="password" className="block text-[rgba(243,248,244,0.68)] text-[11px] font-medium mb-0">Password</label>

                  <button
                    type="button"
                    className="border-0 bg-transparent text-[#91c69e] cursor-pointer text-[10px] p-0 hover:text-[#b4e3be]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="h-[48px] flex items-center gap-[9px] px-[14px] rounded-[12px] text-[rgba(203,232,210,0.55)] border border-[rgba(255,255,255,0.09)] bg-[rgba(0,0,0,0.12)] transition-[0.25s_ease] focus-within:border-[rgba(124,202,148,0.45)] focus-within:shadow-[0_0_0_3px_rgba(105,181,128,0.07)]">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="min-w-0 w-full h-full border-0 outline-0 text-white bg-transparent font-inherit text-[12px] placeholder:text-[rgba(237,244,239,0.28)]"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="border-0 bg-transparent text-[rgba(230,242,233,0.48)] cursor-pointer grid place-items-center p-[4px] hover:text-white"
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

              <label className="relative inline-flex items-center gap-[8px] text-[rgba(235,244,237,0.5)] text-[10px] cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="absolute opacity-0 pointer-events-none peer"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                />

                <span className="w-[16px] h-[16px] rounded-[5px] grid place-items-center text-[#0a1b15] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.03)] peer-checked:border-[#9dd3a8] peer-checked:bg-[#9dd3a8]">
                  {remember && <CheckCircle2 size={13} />}
                </span>

                <span>Keep me signed in</span>
              </label>

              <button className="w-full h-[51px] mt-[21px] border-0 rounded-[13px] flex justify-center items-center gap-[9px] cursor-pointer text-[#082017] bg-[linear-gradient(135deg,#a6d9ae,#72b986)] text-[12px] font-bold shadow-[0_14px_30px_rgba(83,173,109,0.16)] transition-[0.25s_ease] hover:-translate-y-[2px] hover:shadow-[0_18px_35px_rgba(83,173,109,0.23)] active:translate-y-0" type="submit">
                Sign in
                <ArrowRight size={18} />
              </button>

              <AnimatePresence>
                {message && (
                  <motion.div
                    className="mt-[13px] flex items-start gap-[8px] px-[12px] py-[11px] rounded-[10px] text-[#c7e6cd] bg-[rgba(92,172,112,0.08)] border border-[rgba(92,172,112,0.14)] text-[10px] leading-[1.5]"
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
            <div className="flex gap-[11px] mt-[20px] p-[13px] rounded-[13px] bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.06)]">
              <div className="w-[31px] h-[31px] shrink-0 grid place-items-center rounded-[9px] text-[#b3ddb9] bg-[rgba(92,172,112,0.08)]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong className="block text-[10px]">Authorized healthcare access</strong>

                <p className="block m-0 mt-[4px] text-[rgba(236,244,238,0.43)] text-[9px] leading-[1.5]">
                  Health workers and doctors use accounts provided through
                  the healthcare system. Patient accounts are not required
                  for the AarogyaVaani health-centre workflow.
                </p>
              </div>
            </div>

            {/* Patient workflow explanation */}
            <div className="flex gap-[11px] mt-[10px] p-[13px] rounded-[13px] bg-[rgba(71,139,101,0.06)] border border-[rgba(105,181,128,0.1)]">
              <div className="w-[31px] h-[31px] shrink-0 grid place-items-center rounded-[9px] text-[#acdcb7] bg-[rgba(95,177,120,0.09)]">
                <UserRound size={20} />
              </div>

              <div>
                <strong className="block text-[10px]">What about the patient?</strong>

                <p className="block m-0 mt-[4px] text-[rgba(236,244,238,0.43)] text-[9px] leading-[1.5]">
                  Patients use the health-centre device during their visit.
                  They can speak or tap answers, while an ASHA or ANM can
                  operate the same flow in Assist Mode.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-[20px] flex items-center gap-[9px] text-[rgba(235,243,237,0.3)] text-[9px]">
            <span>© AarogyaVaani</span>

            <span className="w-[3px] h-[3px] rounded-full bg-[rgba(235,243,237,0.25)]" />

            <span>Tripura Health</span>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default Login;