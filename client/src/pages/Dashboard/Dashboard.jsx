import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  Home,
  Languages,
  LogOut,
  Menu,
  Mic,
  Network,
  PlayCircle,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tripura_map_for_WLM-IN.svg";

const healthWorkerPatients = [
  {
    id: "patient-1",
    name: "Mamta Debbarma",
    age: "27",
    gender: "F",
    type: "Antenatal",
    language: "Bengali",
    status: "Completed",
    time: "10:32 AM",
    details: "Routine antenatal intake completed.",
  },
  {
    id: "patient-2",
    name: "Rani Tripura",
    age: "24",
    gender: "F",
    type: "Antenatal",
    language: "Hindi",
    status: "In Progress",
    time: "10:15 AM",
    details: "Interview currently in progress.",
  },
  {
    id: "patient-3",
    name: "Sukanta Das",
    age: "42",
    gender: "M",
    type: "General Intake",
    language: "Bengali",
    status: "Awaiting Review",
    time: "09:48 AM",
    details: "General health history awaiting review.",
  },
  {
    id: "patient-4",
    name: "Bimala Reang",
    age: "31",
    gender: "F",
    type: "Antenatal",
    language: "Bengali",
    status: "Urgent",
    time: "09:21 AM",
    details: "Severe headache detected during intake.",
    dangerSigns: ["Severe headache / blurred vision"],
  },
];

const doctorPatients = [
  {
    id: "patient-4",
    name: "Bimala Reang",
    age: "31",
    gender: "F",
    type: "Antenatal",
    details: "Severe headache",
    status: "Urgent",
    time: "09:21 AM",
  },
  {
    id: "patient-2",
    name: "Rani Tripura",
    age: "24",
    gender: "F",
    type: "Antenatal",
    details: "20 weeks",
    status: "Pending Review",
    time: "10:15 AM",
  },
  {
    id: "patient-1",
    name: "Mamta Debbarma",
    age: "27",
    gender: "F",
    type: "Antenatal",
    details: "Routine check",
    status: "Pending Review",
    time: "10:32 AM",
  },
  {
    id: "patient-3",
    name: "Sukanta Das",
    age: "42",
    gender: "M",
    type: "General Intake",
    details: "Fever",
    status: "Pending Review",
    time: "09:48 AM",
  },
];

const weeklyData = [
  { day: "Mon", value: 8 },
  { day: "Tue", value: 12 },
  { day: "Wed", value: 10 },
  { day: "Thu", value: 16 },
  { day: "Fri", value: 14 },
  { day: "Sat", value: 19 },
  { day: "Sun", value: 13 },
];

function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex flex-col leading-[1.1]">
        <strong className="text-[17px] tracking-[-0.4px]">AarogyaVaani</strong>
        <span className="text-[10px] text-white/65 mt-1">Tripura Health</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isUrgent = status === "Urgent";
  const isCompleted = status === "Completed";
  const isInProgress = status === "In Progress";
  const isReview = status === "Pending Review" || status === "Awaiting Review";

  let bgClass = "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]";
  
  if (isUrgent) bgClass = "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]";
  if (isCompleted) bgClass = "bg-[#dcfce7] text-[#16a34a] border-[#86efac]";
  if (isInProgress) bgClass = "bg-[#dbeafe] text-[#2563eb] border-[#93c5fd]";
  if (isReview) bgClass = "bg-[#f3e8ff] text-[#9333ea] border-[#d8b4fe]";

  return (
    <span className={`inline-flex items-center gap-[5px] px-[8px] py-[4px] rounded-full text-[10px] font-bold border ${bgClass}`}>
      {isUrgent && <AlertTriangle size={12} />}
      {isCompleted && <CheckCircle2 size={12} />}
      {isInProgress && <PlayCircle size={12} />}
      {isReview && <Clock3 size={12} />}
      {status}
    </span>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const role = sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";
  const isDoctor = role === "doctor";
  const userName = sessionStorage.getItem("aarogyaVaaniUserName") || (isDoctor ? "Dr. Aarogya" : "Health Worker");
  const patients = isDoctor ? doctorPatients : healthWorkerPatients;

  const goTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const goToNewPatient = () => goTo("/new-patient");

  const handlePrimaryAction = () => {
    if (isDoctor) {
      goTo("/doctor-review");
    } else {
      goToNewPatient();
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = searchText.trim();
    if (!value) {
      goTo("/patients");
      return;
    }
    goTo(`/patients?search=${encodeURIComponent(value)}`);
  };

  const logout = () => {
    sessionStorage.removeItem("aarogyaVaaniRole");
    sessionStorage.removeItem("aarogyaVaaniUserName");
    navigate("/login");
  };

  const stats = useMemo(() => {
    if (isDoctor) {
      return [
        {
          label: "Pending Reviews",
          value: "05",
          helper: "Need your attention",
          icon: FileCheck2,
          type: "blue",
          route: "/doctor-review",
        },
        {
          label: "Urgent Cases",
          value: "02",
          helper: "Danger signs detected",
          icon: AlertTriangle,
          type: "red",
          route: "/danger-alerts",
        },
        {
          label: "Approved Today",
          value: "08",
          helper: "Summaries approved",
          icon: CheckCircle2,
          type: "green",
          route: "/patients?status=approved",
        },
        {
          label: "Waiting to Sync",
          value: "03",
          helper: "Stored on device",
          icon: RefreshCw,
          type: "orange",
          route: "/sync-status",
        },
      ];
    }
    return [
      {
        label: "Today's Intakes",
        value: "08",
        helper: "Patient sessions today",
        icon: UsersRound,
        type: "green",
        route: "/patients",
      },
      {
        label: "In Progress",
        value: "02",
        helper: "Sessions on this device",
        icon: Activity,
        type: "blue",
        route: "/active-sessions",
      },
      {
        label: "Awaiting Review",
        value: "03",
        helper: "Doctor review required",
        icon: FileCheck2,
        type: "purple",
        route: "/patients?status=review",
      },
      {
        label: "Urgent Alerts",
        value: "01",
        helper: "Danger sign detected",
        icon: AlertTriangle,
        type: "red",
        route: "/danger-alerts",
      },
    ];
  }, [isDoctor]);

  const navItemClass = "w-full border-0 bg-transparent text-white/70 min-h-[44px] rounded-[10px] flex items-center gap-[12px] px-[13px] text-[13px] cursor-pointer text-left transition-all hover:bg-white/10 hover:text-white hover:translate-x-[2px]";
  const navItemActiveClass = "w-full border-0 bg-[#159b80] text-white min-h-[44px] rounded-[10px] flex items-center gap-[12px] px-[13px] text-[13px] cursor-pointer text-left shadow-[0_8px_20px_rgba(0,0,0,0.12)]";
  const primaryNavClass = "w-full border-0 bg-white/10 text-white min-h-[44px] rounded-[10px] flex items-center gap-[12px] px-[13px] text-[13px] cursor-pointer text-left transition-all hover:bg-white/15 hover:translate-x-[2px]";

  const statColors = {
    green: { bg: "bg-white hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(26,75,67,0.09)] after:bg-[#dff6ed]", iconBg: "bg-[#e2f6ee] text-[#087f6a]" },
    blue: { bg: "bg-white hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(26,75,67,0.09)] after:bg-[#e4f1fc]", iconBg: "bg-[#e7f2fc] text-[#3987d7]" },
    purple: { bg: "bg-white hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(26,75,67,0.09)] after:bg-[#eee9fb]", iconBg: "bg-[#eeeafb] text-[#7d68c8]" },
    red: { bg: "bg-white hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(26,75,67,0.09)] after:bg-[#fdeaea]", iconBg: "bg-[#fde9e9] text-[#df5c5c]" },
    orange: { bg: "bg-white hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(26,75,67,0.09)] after:bg-[#f9eddc]", iconBg: "bg-[#f9eddd] text-[#e39b43]" },
  };

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] flex font-sans">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-[#03231e]/60 backdrop-blur-[4px] z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`w-[255px] min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(76,182,158,0.18),transparent_28%),linear-gradient(180deg,#064d45_0%,#063c37_100%)] text-white flex flex-col p-[22px_16px] fixed inset-y-0 left-0 z-[100] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <Logo />
          <button className="lg:hidden w-[35px] h-[35px] border border-white/20 rounded-[10px] bg-transparent text-white/80 grid place-items-center cursor-pointer" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/65 bg-white/5 p-[9px_11px] rounded-[9px] mt-[25px]">
          {isDoctor ? <Stethoscope size={15} /> : <UserRound size={15} />}
          <span>{isDoctor ? "Doctor Workspace" : "Health Worker Workspace"}</span>
        </div>

        <nav className="flex flex-col gap-1 mt-5">
          <button type="button" className={navItemActiveClass} onClick={() => goTo("/dashboard")}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          {!isDoctor && (
            <button type="button" className={primaryNavClass} onClick={goToNewPatient}>
              <Mic size={18} />
              <span>New Patient Intake</span>
            </button>
          )}

          {isDoctor && (
            <button type="button" className={primaryNavClass} onClick={() => goTo("/doctor-review")}>
              <FileCheck2 size={18} />
              <span>Pending Reviews</span>
            </button>
          )}

          <button type="button" className={navItemClass} onClick={() => goTo("/patients")}>
            <UsersRound size={18} />
            <span>Patients</span>
          </button>

          {!isDoctor && (
            <button type="button" className={navItemClass} onClick={() => goTo("/active-sessions")}>
              <Activity size={18} />
              <span>Active Sessions</span>
            </button>
          )}

          <button type="button" className={navItemClass} onClick={() => goTo("/danger-alerts")}>
            <AlertTriangle size={18} />
            <span>Danger Alerts</span>
            <span className="ml-auto min-w-[20px] h-[20px] px-[5px] rounded-full inline-flex items-center justify-center bg-[#e85f5f] text-white text-[10px] font-[800]">
              {isDoctor ? "2" : "1"}
            </span>
          </button>

          {isDoctor && (
            <button type="button" className={navItemClass} onClick={() => goTo("/patients?status=approved")}>
              <CheckCircle2 size={18} />
              <span>Approved Summaries</span>
            </button>
          )}

          <button type="button" className={navItemClass} onClick={() => goTo("/sync-status")}>
            <RefreshCw size={18} />
            <span>Sync Status</span>
          </button>

          <button type="button" className={navItemClass} onClick={() => goTo("/signup-status")}>
            <ShieldCheck size={18} />
            <span>Signup Status</span>
          </button>

          <button type="button" className={navItemClass} onClick={() => goTo("/settings")}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-[10px] p-[12px] border border-white/10 bg-white/5 rounded-[12px]">
            <div className="w-[32px] h-[32px] rounded-[9px] bg-[rgba(81,202,167,0.14)] text-[#75e1c2] flex items-center justify-center">
              <WifiOff size={17} />
            </div>
            <div className="flex flex-col gap-[3px]">
              <strong className="text-[11px]">Offline Ready</strong>
              <span className="text-[9px] text-white/50">Data stays on device</span>
            </div>
          </div>

          <div className="flex flex-col text-center gap-[3px] text-white/45 text-[10px] my-[20px_15px]">
            <span>Better Health</span>
            <span>Stronger Tripura</span>
          </div>

          <button type="button" className="w-full border border-white/10 bg-transparent text-white/65 h-[40px] rounded-[10px] flex items-center justify-center gap-[8px] cursor-pointer text-[12px] hover:bg-white/10 hover:text-white" onClick={logout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="w-full lg:w-[calc(100%-255px)] lg:ml-[255px] min-h-screen">
        <header className="h-[72px] bg-white/95 border-b border-[#e2ece9] flex items-center justify-between gap-[25px] px-[30px] sticky top-0 z-[50] backdrop-blur-md max-[760px]:px-[18px]">
          <div className="flex items-center gap-4 lg:hidden">
            <button type="button" className="w-[38px] h-[38px] rounded-[10px] border border-[#e2ece9] bg-white grid place-items-center cursor-pointer" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <Logo />
            </div>
          </div>

          <form className="h-[40px] max-w-[560px] w-full bg-[#f1f6f5] border border-[#e6efed] rounded-[10px] flex items-center gap-[10px] px-[13px] text-[#7a918d] max-[1050px]:max-w-[400px] max-[760px]:hidden" onSubmit={handleSearch}>
            <Search size={18} />
            <input type="text" className="border-0 outline-0 bg-transparent w-full text-[#12322f] text-[12px] placeholder:text-[#94a6a3]" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search patients, ID, or mobile number..." />
          </form>

          <div className="flex items-center gap-[15px] max-[760px]:ml-auto">
            <button type="button" className="w-[38px] h-[38px] rounded-[10px] border border-[#e2ece9] bg-white text-[#12322f] flex items-center justify-center relative cursor-pointer hover:bg-[#e7f7f2] hover:text-[#087f6a]" onClick={() => goTo("/danger-alerts")}>
              <Bell size={19} />
              <span className="absolute -top-[4px] -right-[4px] min-w-[15px] h-[15px] px-[3px] bg-[#df5c5c] text-white rounded-full text-[8px] font-[800] flex items-center justify-center">
                {isDoctor ? "2" : "1"}
              </span>
            </button>

            <div className="w-[1px] h-[30px] bg-[#e2ece9] max-[760px]:hidden" />

            <button type="button" className="border-0 bg-transparent flex items-center gap-[9px] cursor-pointer p-[5px] rounded-[10px] text-inherit text-left hover:bg-[#e7f7f2] max-[760px]:p-[2px]" onClick={() => goTo("/settings")}>
              <div className="w-[37px] h-[37px] rounded-full bg-[#dff3ed] text-[#087f6a] flex items-center justify-center shrink-0">
                {isDoctor ? <Stethoscope size={18} /> : <UserRound size={18} />}
              </div>
              <div className="flex flex-col gap-[2px] max-[760px]:hidden">
                <strong className="text-[12px]">{userName}</strong>
                <span className="text-[9px] text-[#718582]">{isDoctor ? "Doctor" : "ASHA / ANM"}</span>
              </div>
              <ChevronRight size={16} className="text-[#91a5a1] max-[760px]:hidden" />
            </button>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto p-[25px_30px_35px] max-[1050px]:p-[20px] max-[760px]:p-[16px]">
          <motion.section className="min-h-[150px] rounded-[18px] border border-[#d9ece7] bg-[linear-gradient(110deg,#effaf7_0%,#e8f7f3_55%,#dff3ee_100%)] relative overflow-hidden flex items-center p-[28px_32px] max-[760px]:p-[22px_20px] max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[20px]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="absolute w-[300px] h-[300px] rounded-full bg-[rgba(24,151,126,0.05)] right-[250px] top-[-180px]" />
            <div className="relative z-[3] max-[760px]:w-full">
              <div className="flex items-center gap-[6px] text-[#087f6a] text-[10px] font-bold mb-[8px]">
                <ShieldCheck size={14} /> AarogyaVaani • Tripura Health
              </div>
              <h1 className="m-0 font-[700] text-[26px] tracking-[-0.8px] text-[#0a3630]">
                Good morning, {isDoctor ? `Dr. ${userName.replace("Dr. ", "")}` : userName}!
              </h1>
              <p className="my-[7px] mb-[10px] text-[#63807a] text-[12px] max-w-[400px]">
                {isDoctor ? "Review complete patient histories before consultation." : "Guide every patient through a simple, voice-first health intake."}
              </p>
              <div className="flex items-center gap-[6px] text-[#4d746d] text-[10px]">
                <Network size={15} /> Primary Health Centre • Tripura
              </div>
            </div>
            <div className="absolute right-[160px] top-[12px] w-[130px] h-[125px] flex items-center justify-center opacity-30 max-[1050px]:hidden">
              <img src={TRIPURA_MAP_URL} alt="Tripura map" className="w-[95px] h-[105px] object-contain sepia-[0.2] hue-rotate-[95deg] saturate-50" />
              <span className="absolute text-[9px] tracking-[2px] text-[#075b51] font-[800]">TRIPURA</span>
            </div>
            <div className="absolute right-[30px] top-[42px] w-[110px] flex flex-col text-right text-[10px] leading-[1.5] text-[#65807b] max-[760px]:hidden">
              <span>Every voice</span>
              <strong className="text-[#087f6a]">matters in healthcare.</strong>
            </div>
          </motion.section>

          <div className="grid grid-cols-[minmax(0,1fr)_310px] gap-[20px] mt-[20px] max-[1050px]:grid-cols-1 max-[1050px]:flex-col-reverse">
            <section className="min-w-0">
              <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1050px]:grid-cols-2 max-[760px]:grid-cols-2">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colors = statColors[stat.type];
                  return (
                    <motion.button type="button" className={`w-full min-h-[145px] border border-[#e2ece9] rounded-[15px] p-[16px] relative overflow-hidden text-left cursor-pointer transition-all duration-200 ${colors.bg} after:content-[''] after:absolute after:-right-[35px] after:-bottom-[40px] after:w-[100px] after:h-[100px] after:rounded-full after:opacity-35`} key={stat.label} onClick={() => goTo(stat.route)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
                      <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center mb-[12px] relative z-10 ${colors.iconBg}`}>
                        <Icon size={20} />
                      </div>
                      <div className="text-[#6c8580] text-[10px] font-semibold relative z-10">{stat.label}</div>
                      <div className="mt-[2px] text-[27px] leading-[1] font-[800] tracking-[-1px] text-[#12322f] relative z-10">{stat.value}</div>
                      <div className="text-[#98aaa6] text-[9px] mt-[7px] relative z-10">{stat.helper}</div>
                    </motion.button>
                  );
                })}
              </div>

              <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden mb-[18px]">
                <div className="p-[18px_20px_14px] flex items-start justify-between gap-[15px]">
                  <div>
                    <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                      <Activity size={14} /> {isDoctor ? "Review Activity" : "Patient Intake Activity"}
                    </span>
                    <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">
                      {isDoctor ? "Summary Review Overview" : "Today's Patient Flow"}
                    </h2>
                    <p className="m-0 text-[#91a29f] text-[9px]">
                      {isDoctor ? "Structured histories received from the intake workflow." : "Maternal and antenatal intake sessions on this device."}
                    </p>
                  </div>
                  <button type="button" className="border-0 bg-transparent text-[#087f6a] text-[10px] flex items-center gap-[4px] cursor-pointer whitespace-nowrap p-[6px] hover:text-[#075b51]" onClick={() => goTo("/patients?view=activity")}>
                    View all <ArrowRight size={15} />
                  </button>
                </div>
                <div className="p-[5px_20px_20px] grid grid-cols-[1fr_1.1fr] gap-[30px] max-[760px]:grid-cols-1 max-[760px]:gap-[20px]">
                  <div className="flex items-center gap-[25px] min-h-[175px]">
                    <div className="w-[135px] h-[135px] rounded-full bg-[conic-gradient(#159b80_0_75%,#4d91d6_75%_92%,#e7a34e_92%_100%)] flex items-center justify-center shrink-0">
                      <div className="w-[98px] h-[98px] rounded-full bg-white flex flex-col items-center justify-center">
                        <strong className="text-[25px] font-[700] text-[#12322f]">{isDoctor ? "13" : "24"}</strong>
                        <span className="text-[8px] text-[#81928f] mt-[2px]">{isDoctor ? "Summaries" : "Today's Intakes"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[11px] w-full">
                      <div className="grid grid-cols-[9px_1fr_auto] gap-[7px] items-center text-[10px] text-[#657e79]">
                        <span className="w-[7px] h-[7px] rounded-full bg-[#159b80]" /> Completed <strong className="text-[#12322f]">{isDoctor ? "08" : "18"}</strong>
                      </div>
                      <div className="grid grid-cols-[9px_1fr_auto] gap-[7px] items-center text-[10px] text-[#657e79]">
                        <span className="w-[7px] h-[7px] rounded-full bg-[#4d91d6]" /> In Progress <strong className="text-[#12322f]">{isDoctor ? "03" : "04"}</strong>
                      </div>
                      <div className="grid grid-cols-[9px_1fr_auto] gap-[7px] items-center text-[10px] text-[#657e79]">
                        <span className="w-[7px] h-[7px] rounded-full bg-[#e7a34e]" /> Pending <strong className="text-[#12322f]">{isDoctor ? "02" : "02"}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#fcfdfd] border border-[#edf3f1] rounded-[13px] p-[16px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-[20px]">
                      <span className="text-[#889d99] text-[10px]">Last 7 days</span>
                      <strong className="text-[#12322f] text-[11px]">Patient activity</strong>
                    </div>
                    <div className="flex items-end justify-between h-[90px] pt-[15px]">
                      {weeklyData.map((item) => (
                        <div className="flex flex-col items-center gap-[6px] w-[22px]" key={item.day}>
                          <div className="text-[8px] text-[#5e7773] opacity-0 transition-opacity hover:opacity-100">{item.value}</div>
                          <div className="w-[18px] h-[65px] bg-[#eaf2ef] rounded-full relative flex items-end overflow-hidden">
                            <motion.div className="w-full bg-[linear-gradient(180deg,#16a88b_0%,#10735f_100%)] rounded-full" initial={{ height: 0 }} animate={{ height: `${(item.value / 20) * 100}%` }} transition={{ duration: 0.7 }} />
                          </div>
                          <span className="text-[#8f9f9c] text-[8px]">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden mb-[18px]">
                <div className="p-[18px_20px_14px] flex items-start justify-between gap-[15px]">
                  <div>
                    <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                      <UsersRound size={14} /> {isDoctor ? "Doctor Review Queue" : "Patient Sessions"}
                    </span>
                    <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">{isDoctor ? "Patient Summaries" : "Recent Patient Intakes"}</h2>
                    <p className="m-0 text-[#91a29f] text-[9px]">{isDoctor ? "Review the structured history prepared by AarogyaVaani." : "Recent sessions captured through voice or touch."}</p>
                  </div>
                  <button type="button" className="border-0 bg-transparent text-[#087f6a] text-[10px] flex items-center gap-[4px] cursor-pointer whitespace-nowrap p-[6px] hover:text-[#075b51]" onClick={() => goTo("/patients")}>
                    View all <ArrowRight size={15} />
                  </button>
                </div>
                <div className="w-full overflow-x-auto pb-[15px] px-[20px]">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px]">Patient</th>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px]">Type</th>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px]">{isDoctor ? "Details" : "Language"}</th>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px]">Status</th>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px]">Time</th>
                        <th className="pb-[12px] border-b border-[#ecf2f0] text-[#7a928e] text-[10px] font-bold pr-[15px] w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="border-b border-[#f0f5f3] transition-colors hover:bg-[#fafdfc]">
                          <td className="py-[14px] pr-[15px] align-middle">
                            <div className="flex items-center gap-[12px]">
                              <div className="w-[34px] h-[34px] rounded-full bg-[#ecf2f0] text-[#557b73] flex items-center justify-center shrink-0">
                                <UserRound size={15} />
                              </div>
                              <div className="flex flex-col gap-[3px]">
                                <strong className="text-[12px] font-bold text-[#12322f]">{patient.name}</strong>
                                <span className="text-[10px] text-[#788e89]">{patient.age} years • {patient.gender}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-[14px] pr-[15px] align-middle text-[11px] text-[#2d4d47] font-medium">{patient.type}</td>
                          <td className="py-[14px] pr-[15px] align-middle text-[11px] text-[#5a716c]">{isDoctor ? patient.details : patient.language}</td>
                          <td className="py-[14px] pr-[15px] align-middle"><StatusBadge status={patient.status} /></td>
                          <td className="py-[14px] pr-[15px] align-middle text-[11px] text-[#69847e]">{patient.time}</td>
                          <td className="py-[14px] align-middle">
                            <button type="button" className="w-[32px] h-[32px] border-0 rounded-[9px] bg-transparent text-[#97aba7] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#e7f2ef] hover:text-[#087f6a]" onClick={() => goTo(`/patient-details?id=${encodeURIComponent(patient.id)}`)} aria-label={`Open ${patient.name}`}>
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {!isDoctor && (
                <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden mb-[18px]">
                  <div className="p-[18px_20px_14px] flex items-start justify-between gap-[15px]">
                    <div>
                      <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                        <Languages size={14} /> Intake Workflow
                      </span>
                      <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">Maternal & Antenatal MVP</h2>
                      <p className="m-0 text-[#91a29f] text-[9px]">The core AarogyaVaani use case for the hackathon demo.</p>
                    </div>
                    <span className="px-[9px] py-[4px] rounded-[6px] bg-[#f0f6f4] text-[#087f6a] text-[10px] font-bold tracking-[1px]">MVP</span>
                  </div>
                  <div className="p-[15px_20px_25px] flex items-start gap-[12px] max-[760px]:flex-col">
                    <div className="flex-1 flex flex-col gap-[10px]">
                      <div className="w-[38px] h-[38px] rounded-[12px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                        <CheckCircle2 size={17} />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <strong className="text-[11px] font-[700] text-[#12322f]">Language & Consent</strong>
                        <span className="text-[9px] text-[#718582]">Bengali / Hindi</span>
                      </div>
                    </div>
                    <div className="flex-1 h-[2px] bg-[#16a34a] mt-[19px] max-[760px]:hidden" />
                    <div className="flex-1 flex flex-col gap-[10px]">
                      <div className="w-[38px] h-[38px] rounded-[12px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                        <Mic size={17} />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <strong className="text-[11px] font-[700] text-[#12322f]">Voice / Touch Intake</strong>
                        <span className="text-[9px] text-[#718582]">One question at a time</span>
                      </div>
                    </div>
                    <div className="flex-1 h-[2px] bg-[#16a34a] mt-[19px] max-[760px]:hidden" />
                    <div className="flex-1 flex flex-col gap-[10px]">
                      <div className="w-[38px] h-[38px] rounded-[12px] bg-[#f4f7f6] text-[#869f9b] flex items-center justify-center border border-[#e5eeec]">
                        <AlertTriangle size={17} />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <strong className="text-[11px] font-[700] text-[#12322f]">Danger Sign Check</strong>
                        <span className="text-[9px] text-[#718582]">Rule-based safety check</span>
                      </div>
                    </div>
                    <div className="flex-1 h-[2px] bg-[#e5eeec] mt-[19px] max-[760px]:hidden" />
                    <div className="flex-1 flex flex-col gap-[10px]">
                      <div className="w-[38px] h-[38px] rounded-[12px] bg-[#f4f7f6] text-[#869f9b] flex items-center justify-center border border-[#e5eeec]">
                        <FileCheck2 size={17} />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <strong className="text-[11px] font-[700] text-[#12322f]">Doctor Review</strong>
                        <span className="text-[9px] text-[#718582]">Review, edit & approve</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {isDoctor && (
                <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden mb-[18px]">
                  <div className="p-[18px_20px_14px] flex items-start justify-between gap-[15px]">
                    <div>
                      <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                        <CheckCircle2 size={14} /> Doctor Approval
                      </span>
                      <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">Recently Approved Summaries</h2>
                      <p className="m-0 text-[#91a29f] text-[9px]">Summaries that have completed doctor review.</p>
                    </div>
                    <button type="button" className="border-0 bg-transparent text-[#087f6a] text-[10px] flex items-center gap-[4px] cursor-pointer whitespace-nowrap p-[6px] hover:text-[#075b51]" onClick={() => goTo("/patients?status=approved")}>
                      View all <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="p-[0_20px_20px] flex flex-col gap-[10px]">
                    <div className="p-[14px_16px] rounded-[12px] bg-[#f4fbf8] border border-[#d9eee7] flex items-center gap-[12px]">
                      <div className="w-[36px] h-[36px] rounded-[10px] bg-[#c3eadb] text-[#09715e] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={17} />
                      </div>
                      <div className="flex flex-col gap-[3px] flex-1">
                        <strong className="text-[12px] font-[700] text-[#12322f]">Mamta Debbarma</strong>
                        <span className="text-[10px] text-[#5b7a74]">Maternal intake • Approved 10:48 AM</span>
                      </div>
                      <CheckCircle2 size={17} className="text-[#087f6a] ml-auto" />
                    </div>
                    <div className="p-[14px_16px] rounded-[12px] bg-[#f4fbf8] border border-[#d9eee7] flex items-center gap-[12px]">
                      <div className="w-[36px] h-[36px] rounded-[10px] bg-[#c3eadb] text-[#09715e] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={17} />
                      </div>
                      <div className="flex flex-col gap-[3px] flex-1">
                        <strong className="text-[12px] font-[700] text-[#12322f]">Ratan Debbarma</strong>
                        <span className="text-[10px] text-[#5b7a74]">Follow-up history • Approved 09:42 AM</span>
                      </div>
                      <CheckCircle2 size={17} className="text-[#087f6a] ml-auto" />
                    </div>
                  </div>
                </section>
              )}
            </section>

            <aside className="flex flex-col gap-[18px]">
              <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden">
                <div className="p-[18px_20px_13px] flex items-start justify-between gap-[15px]">
                  <div>
                    <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                      <Activity size={14} /> Actions
                    </span>
                    <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">Quick Actions</h2>
                  </div>
                </div>
                <div className="p-[5px_20px_20px] flex flex-col gap-[12px]">
                  <button type="button" className="w-full text-left bg-[linear-gradient(135deg,#0a8c76_0%,#065b4c_100%)] text-white border-0 rounded-[13px] p-[16px_18px] flex items-center gap-[15px] cursor-pointer shadow-[0_8px_20px_rgba(10,140,118,0.2)] transition-transform hover:-translate-y-[2px]" onClick={handlePrimaryAction}>
                    {isDoctor ? <FileCheck2 size={21} /> : <Mic size={21} />}
                    <span className="flex flex-col flex-1 gap-[3px]">
                      <strong className="text-[13px] font-[700]">{isDoctor ? "Review Summaries" : "New Patient Intake"}</strong>
                      <small className="text-[10px] text-white/70">{isDoctor ? "Review waiting cases" : "Start guided interview"}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>

                  {!isDoctor && (
                    <button type="button" className="w-full text-left bg-white text-[#12322f] border border-[#e2ece9] rounded-[13px] p-[16px_18px] flex items-center gap-[15px] cursor-pointer transition-colors hover:border-[#159b80] hover:bg-[#f7fbf9]" onClick={() => goTo("/active-sessions")}>
                      <PlayCircle size={21} className="text-[#3987d7]" />
                      <span className="flex flex-col flex-1 gap-[3px]">
                        <strong className="text-[13px] font-[700]">Resume Intake</strong>
                        <small className="text-[10px] text-[#718582]">Continue saved session</small>
                      </span>
                      <ArrowRight size={16} className="text-[#92a8a4]" />
                    </button>
                  )}

                  <button type="button" className="w-full text-left bg-white text-[#12322f] border border-[#e2ece9] rounded-[13px] p-[16px_18px] flex items-center gap-[15px] cursor-pointer transition-colors hover:border-[#df5c5c] hover:bg-[#fffcfc]" onClick={() => goTo("/danger-alerts")}>
                    <AlertTriangle size={21} className="text-[#df5c5c]" />
                    <span className="flex flex-col flex-1 gap-[3px]">
                      <strong className="text-[13px] font-[700]">{isDoctor ? "Urgent Cases" : "Danger Alerts"}</strong>
                      <small className="text-[10px] text-[#718582]">{isDoctor ? "2 need review" : "1 needs attention"}</small>
                    </span>
                    <ArrowRight size={16} className="text-[#92a8a4]" />
                  </button>
                </div>
              </section>

              <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] overflow-hidden">
                <div className="p-[18px_20px_13px] flex items-start justify-between gap-[15px]">
                  <div>
                    <span className="flex items-center gap-[5px] text-[#087f6a] text-[9px] font-[800] uppercase tracking-[0.7px]">
                      <Network size={14} /> Device
                    </span>
                    <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">System Status</h2>
                  </div>
                </div>
                <div className="p-[5px_20px_20px] flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-[#e7f5f1] text-[#12a183] flex items-center justify-center shrink-0">
                      <Wifi size={17} />
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1">
                      <strong className="text-[11px] font-[700] text-[#12322f]">Connection</strong>
                      <span className="text-[9px] text-[#718582]">Offline ready</span>
                    </div>
                    <i className="w-[8px] h-[8px] rounded-full bg-[#18b88d] shadow-[0_0_0_3px_rgba(24,184,141,0.2)]" />
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f5f5f5] text-[#869f9b] flex items-center justify-center shrink-0 border border-[#e6ebe9]">
                      <RefreshCw size={17} />
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1">
                      <strong className="text-[11px] font-[700] text-[#12322f]">Local Sync</strong>
                      <span className="text-[9px] text-[#718582]">3 records waiting</span>
                    </div>
                    <i className="w-[8px] h-[8px] rounded-full bg-[#f3ad43] shadow-[0_0_0_3px_rgba(243,173,67,0.2)]" />
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f5f5f5] text-[#869f9b] flex items-center justify-center shrink-0 border border-[#e6ebe9]">
                      <ShieldCheck size={17} />
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1">
                      <strong className="text-[11px] font-[700] text-[#12322f]">Privacy</strong>
                      <span className="text-[9px] text-[#718582]">Consent protected</span>
                    </div>
                    <i className="w-[8px] h-[8px] rounded-full bg-[#18b88d] shadow-[0_0_0_3px_rgba(24,184,141,0.2)]" />
                  </div>
                </div>
                <button type="button" className="w-full border-t border-[#e2ece9] bg-[#fbfdfc] p-[14px] text-[#087f6a] text-[11px] font-bold flex items-center justify-center gap-[7px] cursor-pointer hover:bg-[#f2f8f6]" onClick={() => goTo("/sync-status")}>
                  <RefreshCw size={16} /> Check Sync Status
                </button>
              </section>

              <section className="bg-white border border-[#f3cece] rounded-[15px] shadow-[0_8px_25px_rgba(223,92,92,0.12)] overflow-hidden relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-[4px] after:bg-[#df5c5c]">
                <div className="p-[18px_20px_14px] flex items-start justify-between gap-[15px]">
                  <div>
                    <span className="flex items-center gap-[5px] text-[#df5c5c] text-[9px] font-[800] uppercase tracking-[0.7px]">
                      <AlertTriangle size={14} /> Safety Path
                    </span>
                    <h2 className="m-[5px_0_4px] font-[700] text-[15px] tracking-[-0.2px] text-[#12322f]">Danger Sign Alert</h2>
                  </div>
                  <span className="px-[8px] py-[3px] rounded-[6px] bg-[#df5c5c] text-white text-[9px] font-[800] tracking-[1px] flex items-center">
                    URGENT
                  </span>
                </div>
                <div className="p-[0_16px_16px]">
                  <div className="p-[14px] bg-[#fffaf5] border border-[#fce4cd] rounded-[13px] flex flex-col gap-[14px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[32px] h-[32px] rounded-[8px] bg-[#fad8b3] text-[#c97416] flex items-center justify-center shrink-0">
                        <UserRound size={17} />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <strong className="text-[12px] font-bold text-[#12322f]">Bimala Reang</strong>
                        <span className="text-[10px] text-[#86705d]">Maternal intake • 31 years</span>
                      </div>
                    </div>
                    <div className="bg-white border border-[#f7cdcd] rounded-[8px] p-[10px_12px] flex items-center gap-[9px] text-[#df5c5c] text-[11px] font-bold shadow-[0_2px_8px_rgba(223,92,92,0.06)]">
                      <AlertTriangle size={16} />
                      <span>Severe headache detected</span>
                    </div>
                    <button type="button" className="w-full border-0 bg-[#df5c5c] text-white rounded-[9px] p-[10px] text-[11px] font-bold flex items-center justify-center gap-[7px] cursor-pointer transition-colors hover:bg-[#c94d4d]" onClick={() => goTo("/patient-details?id=patient-4")}>
                      {isDoctor ? "Review Case" : "Notify Doctor"} <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#e2ece9] rounded-[15px] shadow-[0_4px_16px_rgba(26,75,67,0.035)] p-[20px] flex items-start gap-[14px]">
                <div className="w-[38px] h-[38px] rounded-[12px] bg-[#edf6f4] text-[#138e78] flex items-center justify-center shrink-0 border border-[#d9eee7]">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <h3 className="m-0 font-bold text-[13px] text-[#12322f]">Consent-first care</h3>
                  <p className="m-0 text-[11px] text-[#637d78] leading-[1.6]">Audio or touch consent is required before patient information is recorded.</p>
                </div>
              </section>

              <section className="bg-[linear-gradient(180deg,#fcfdfc,#f5f9f8)] border border-[#e2ece9] rounded-[15px] p-[20px]">
                <div className="flex items-start gap-[14px] mb-[15px]">
                  <div className="w-[36px] h-[36px] rounded-[11px] bg-[#eef4f2] text-[#4f776f] flex items-center justify-center shrink-0">
                    <Languages size={18} />
                  </div>
                  <div>
                    <h3 className="m-0 font-bold text-[13px] text-[#12322f]">Supported Languages</h3>
                    <p className="m-[3px_0_0] text-[10px] text-[#7b918d]">MVP language packs</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  <span className="px-[12px] py-[6px] rounded-[8px] bg-white border border-[#dbe6e3] text-[#365952] text-[11px] font-medium shadow-[0_2px_5px_rgba(0,0,0,0.02)]">Bengali</span>
                  <span className="px-[12px] py-[6px] rounded-[8px] bg-white border border-[#dbe6e3] text-[#365952] text-[11px] font-medium shadow-[0_2px_5px_rgba(0,0,0,0.02)]">Hindi</span>
                  <span className="px-[12px] py-[6px] rounded-[8px] bg-[#f5f0e6] border border-[#ebdcc2] text-[#917445] text-[11px] font-medium shadow-[0_2px_5px_rgba(0,0,0,0.02)] w-full text-center mt-[3px]">Kokborok • Roadmap</span>
                </div>
              </section>
            </aside>
          </div>

          <footer className="mt-[35px] pt-[25px] border-t border-[#dbece7] flex items-start justify-between gap-[20px] text-[#698b84] text-[11px] max-[760px]:flex-col">
            <div className="flex flex-col gap-[4px]">
              <strong className="text-[#087f6a] text-[12px]">AarogyaVaani</strong>
              <span>Voice-first • Offline • Consent-first</span>
            </div>
            <div className="flex flex-col gap-[4px] text-right max-[760px]:text-left">
              <span>Healthcare • Wellbeing • Service Delivery</span>
              <span className="font-semibold">Tripura</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;