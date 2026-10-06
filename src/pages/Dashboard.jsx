import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

import "./Dashboard.css";

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
    <div className="dashboard-logo">
      <div className="dashboard-logo-text">
        <strong>AarogyaVaani</strong>
        <span>Tripura Health</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace("awaiting-review", "review");

  return (
    <span className={`status-badge ${className}`}>
      {status === "Urgent" && <AlertTriangle size={12} />}
      {status === "Completed" && <CheckCircle2 size={12} />}
      {status === "In Progress" && <PlayCircle size={12} />}
      {status === "Pending Review" && <Clock3 size={12} />}
      {status === "Awaiting Review" && <Clock3 size={12} />}
      {status}
    </span>
  );
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const role =
    sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";

  const isDoctor = role === "doctor";

  const userName =
    sessionStorage.getItem("aarogyaVaaniUserName") ||
    (isDoctor ? "Dr. Aarogya" : "Health Worker");

  const patients = isDoctor ? doctorPatients : healthWorkerPatients;

  /*
   * ============================================================
   * SIDEBAR NAVIGATION
   * ============================================================
   *
   * Every sidebar option uses this function.
   *
   * It closes the mobile sidebar first and then changes the page.
   */
  const goTo = (path) => {
    setSidebarOpen(false);
    window.location.href = path;
  };

  const goToNewPatient = () => {
    goTo("/new-patient");
  };

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

    window.location.href = "/login";
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

  return (
    <div className="dashboard-page">
      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ======================================================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="mobile-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          LEFT SIDEBAR
      ======================================================= */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />

          <button
            className="mobile-close-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-role">
          {isDoctor ? (
            <Stethoscope size={15} />
          ) : (
            <UserRound size={15} />
          )}

          <span>
            {isDoctor ? "Doctor Workspace" : "Health Worker Workspace"}
          </span>
        </div>

        {/* ====================================================
            SIDEBAR NAVIGATION

            All buttons below now have explicit navigation.
        ===================================================== */}
        <nav className="dashboard-nav">
          {/* Dashboard */}
          <button
            type="button"
            className="dashboard-nav-item active"
            onClick={() => goTo("/dashboard")}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          {/* New Patient / Pending Reviews */}
          {!isDoctor && (
            <button
              type="button"
              className="dashboard-nav-item primary-nav"
              onClick={goToNewPatient}
            >
              <Mic size={18} />
              <span>New Patient Intake</span>
            </button>
          )}

          {isDoctor && (
            <button
              type="button"
              className="dashboard-nav-item primary-nav"
              onClick={() => goTo("/doctor-review")}
            >
              <FileCheck2 size={18} />
              <span>Pending Reviews</span>
            </button>
          )}

          {/* Patients */}
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => goTo("/patients")}
          >
            <UsersRound size={18} />
            <span>Patients</span>
          </button>

          {/* Active Sessions */}
          {!isDoctor && (
            <button
              type="button"
              className="dashboard-nav-item"
              onClick={() => goTo("/active-sessions")}
            >
              <Activity size={18} />
              <span>Active Sessions</span>
            </button>
          )}

          {/* Danger Alerts */}
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => goTo("/danger-alerts")}
          >
            <AlertTriangle size={18} />
            <span>Danger Alerts</span>

            <span className="nav-count">
              {isDoctor ? "2" : "1"}
            </span>
          </button>

          {/* Approved Summaries - Doctor only */}
          {isDoctor && (
            <button
              type="button"
              className="dashboard-nav-item"
              onClick={() => goTo("/patients?status=approved")}
            >
              <CheckCircle2 size={18} />
              <span>Approved Summaries</span>
            </button>
          )}

          {/* Sync Status */}
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => goTo("/sync-status")}
          >
            <RefreshCw size={18} />
            <span>Sync Status</span>
          </button>

          {/* Signup Status */}
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => goTo("/signup-status")}
          >
            <ShieldCheck size={18} />
            <span>Signup Status</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => goTo("/settings")}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* ======================================================
            SIDEBAR BOTTOM
        ======================================================= */}
        <div className="sidebar-bottom">
          <div className="offline-card">
            <div className="offline-icon">
              <WifiOff size={17} />
            </div>

            <div>
              <strong>Offline Ready</strong>
              <span>Data stays on device</span>
            </div>
          </div>

          <div className="sidebar-motto">
            <span>Better Health</span>
            <span>Stronger Tripura</span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN DASHBOARD
      ======================================================= */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="mobile-header-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="mobile-brand">
              <Logo />
            </div>
          </div>

          {/* Search */}
          <form
            className="dashboard-search"
            onSubmit={handleSearch}
          >
            <Search size={18} />

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search patients, ID, or mobile number..."
              aria-label="Search patients"
            />
          </form>

          {/* Header actions */}
          <div className="header-actions">
            <button
              type="button"
              className="header-icon-button"
              onClick={() => goTo("/danger-alerts")}
              aria-label="Open notifications"
            >
              <Bell size={19} />

              <span className="notification-dot">
                {isDoctor ? "2" : "1"}
              </span>
            </button>

            <div className="header-divider" />

            <button
              type="button"
              className="user-profile"
              onClick={() => goTo("/settings")}
              aria-label="Open profile settings"
            >
              <div className="user-avatar">
                {isDoctor ? (
                  <Stethoscope size={18} />
                ) : (
                  <UserRound size={18} />
                )}
              </div>

              <div className="user-profile-text">
                <strong>{userName}</strong>
                <span>
                  {isDoctor ? "Doctor" : "ASHA / ANM"}
                </span>
              </div>

              <ChevronRight
                size={16}
                className="profile-arrow"
              />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* ====================================================
              TRIPURA BANNER
          ===================================================== */}
          <motion.section
            className="tripura-banner"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="tripura-banner-content">
              <div className="banner-small-label">
                <ShieldCheck size={14} />
                AarogyaVaani • Tripura Health
              </div>

              <h1>
                Good morning,{" "}
                {isDoctor
                  ? `Dr. ${userName.replace("Dr. ", "")}`
                  : userName}
                !
              </h1>

              <p>
                {isDoctor
                  ? "Review complete patient histories before consultation."
                  : "Guide every patient through a simple, voice-first health intake."}
              </p>

              <div className="banner-location">
                <Network size={15} />
                Primary Health Centre • Tripura
              </div>
            </div>

            <div className="tripura-banner-map">
              <img
                src={TRIPURA_MAP_URL}
                alt="Tripura map"
              />
              <span>TRIPURA</span>
            </div>

            <div className="banner-quote">
              <span>Every voice</span>
              <strong>matters in healthcare.</strong>
            </div>
          </motion.section>

          {/* ====================================================
              DASHBOARD GRID
          ===================================================== */}
          <div className="dashboard-grid">
            <section className="dashboard-left">
              {/* ==================================================
                  STAT CARDS
              =================================================== */}
              <div className="stat-grid">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <motion.button
                      type="button"
                      className={`stat-card ${stat.type}`}
                      key={stat.label}
                      onClick={() => goTo(stat.route)}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.08,
                      }}
                    >
                      <div className="stat-icon">
                        <Icon size={20} />
                      </div>

                      <div className="stat-label">
                        {stat.label}
                      </div>

                      <div className="stat-value">
                        {stat.value}
                      </div>

                      <div className="stat-helper">
                        {stat.helper}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* ==================================================
                  PATIENT FLOW
              =================================================== */}
              <section className="panel patient-flow-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">
                      <Activity size={14} />

                      {isDoctor
                        ? "Review Activity"
                        : "Patient Intake Activity"}
                    </span>

                    <h2>
                      {isDoctor
                        ? "Summary Review Overview"
                        : "Today's Patient Flow"}
                    </h2>

                    <p>
                      {isDoctor
                        ? "Structured histories received from the intake workflow."
                        : "Maternal and antenatal intake sessions on this device."}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      goTo("/patients?view=activity")
                    }
                  >
                    View all
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="flow-content">
                  <div className="flow-ring-wrapper">
                    <div className="flow-ring">
                      <div className="flow-ring-inner">
                        <strong>
                          {isDoctor ? "13" : "24"}
                        </strong>

                        <span>
                          {isDoctor
                            ? "Summaries"
                            : "Today's Intakes"}
                        </span>
                      </div>
                    </div>

                    <div className="flow-legend">
                      <div>
                        <span className="legend-dot completed" />
                        Completed
                        <strong>
                          {isDoctor ? "08" : "18"}
                        </strong>
                      </div>

                      <div>
                        <span className="legend-dot progress" />
                        In Progress
                        <strong>
                          {isDoctor ? "03" : "04"}
                        </strong>
                      </div>

                      <div>
                        <span className="legend-dot pending" />
                        Pending
                        <strong>
                          {isDoctor ? "02" : "02"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="weekly-chart">
                    <div className="chart-title">
                      <span>Last 7 days</span>
                      <strong>Patient activity</strong>
                    </div>

                    <div className="chart">
                      {weeklyData.map((item) => (
                        <div
                          className="chart-column"
                          key={item.day}
                        >
                          <div className="chart-value">
                            {item.value}
                          </div>

                          <div className="chart-bar-wrapper">
                            <motion.div
                              className="chart-bar"
                              initial={{ height: 0 }}
                              animate={{
                                height: `${
                                  (item.value / 20) * 100
                                }%`,
                              }}
                              transition={{
                                duration: 0.7,
                              }}
                            />
                          </div>

                          <span>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  PATIENTS TABLE
              =================================================== */}
              <section className="panel patients-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">
                      <UsersRound size={14} />

                      {isDoctor
                        ? "Doctor Review Queue"
                        : "Patient Sessions"}
                    </span>

                    <h2>
                      {isDoctor
                        ? "Patient Summaries"
                        : "Recent Patient Intakes"}
                    </h2>

                    <p>
                      {isDoctor
                        ? "Review the structured history prepared by AarogyaVaani."
                        : "Recent sessions captured through voice or touch."}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => goTo("/patients")}
                  >
                    View all
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="patient-table-wrapper">
                  <table className="patient-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Type</th>
                        <th>
                          {isDoctor ? "Details" : "Language"}
                        </th>
                        <th>Status</th>
                        <th>Time</th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id}>
                          <td>
                            <div className="patient-name-cell">
                              <div className="patient-avatar">
                                <UserRound size={15} />
                              </div>

                              <div>
                                <strong>
                                  {patient.name}
                                </strong>

                                <span>
                                  {patient.age} years •{" "}
                                  {patient.gender}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>{patient.type}</td>

                          <td>
                            {isDoctor
                              ? patient.details
                              : patient.language}
                          </td>

                          <td>
                            <StatusBadge
                              status={patient.status}
                            />
                          </td>

                          <td>{patient.time}</td>

                          <td>
                            <button
                              type="button"
                              className="row-action"
                              onClick={() =>
                                goTo(
                                  `/patient-details?id=${encodeURIComponent(
                                    patient.id
                                  )}`
                                )
                              }
                              aria-label={`Open ${patient.name}`}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ==================================================
                  HEALTH WORKER WORKFLOW
              =================================================== */}
              {!isDoctor && (
                <section className="panel progress-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-eyebrow">
                        <Languages size={14} />
                        Intake Workflow
                      </span>

                      <h2>
                        Maternal & Antenatal MVP
                      </h2>

                      <p>
                        The core AarogyaVaani use case for the
                        hackathon demo.
                      </p>
                    </div>

                    <span className="mvp-badge">
                      MVP
                    </span>
                  </div>

                  <div className="workflow-steps">
                    <div className="workflow-step completed-step">
                      <div className="workflow-icon">
                        <CheckCircle2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Language & Consent
                        </strong>
                        <span>Bengali / Hindi</span>
                      </div>
                    </div>

                    <div className="workflow-line active-line" />

                    <div className="workflow-step completed-step">
                      <div className="workflow-icon">
                        <Mic size={17} />
                      </div>

                      <div>
                        <strong>
                          Voice / Touch Intake
                        </strong>
                        <span>
                          One question at a time
                        </span>
                      </div>
                    </div>

                    <div className="workflow-line active-line" />

                    <div className="workflow-step">
                      <div className="workflow-icon">
                        <AlertTriangle size={17} />
                      </div>

                      <div>
                        <strong>
                          Danger Sign Check
                        </strong>
                        <span>
                          Rule-based safety check
                        </span>
                      </div>
                    </div>

                    <div className="workflow-line" />

                    <div className="workflow-step">
                      <div className="workflow-icon">
                        <FileCheck2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Doctor Review
                        </strong>
                        <span>
                          Review, edit & approve
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ==================================================
                  DOCTOR APPROVED SUMMARIES
              =================================================== */}
              {isDoctor && (
                <section className="panel approved-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-eyebrow">
                        <CheckCircle2 size={14} />
                        Doctor Approval
                      </span>

                      <h2>
                        Recently Approved Summaries
                      </h2>

                      <p>
                        Summaries that have completed doctor
                        review.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        goTo(
                          "/patients?status=approved"
                        )
                      }
                    >
                      View all
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="approved-list">
                    <div className="approved-item">
                      <div className="approved-icon">
                        <CheckCircle2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Mamta Debbarma
                        </strong>

                        <span>
                          Maternal intake • Approved
                          10:48 AM
                        </span>
                      </div>

                      <CheckCircle2 size={17} />
                    </div>

                    <div className="approved-item">
                      <div className="approved-icon">
                        <CheckCircle2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Ratan Debbarma
                        </strong>

                        <span>
                          Follow-up history • Approved
                          09:42 AM
                        </span>
                      </div>

                      <CheckCircle2 size={17} />
                    </div>
                  </div>
                </section>
              )}
            </section>

            {/* ====================================================
                RIGHT DASHBOARD COLUMN
            ===================================================== */}
            <aside className="dashboard-right">
              {/* Quick Actions */}
              <section className="panel quick-actions-panel">
                <div className="panel-heading compact">
                  <div>
                    <span className="panel-eyebrow">
                      <Activity size={14} />
                      Actions
                    </span>

                    <h2>Quick Actions</h2>
                  </div>
                </div>

                <div className="quick-actions">
                  <button
                    type="button"
                    className="quick-action primary"
                    onClick={handlePrimaryAction}
                  >
                    {isDoctor ? (
                      <FileCheck2 size={21} />
                    ) : (
                      <Mic size={21} />
                    )}

                    <span>
                      <strong>
                        {isDoctor
                          ? "Review Summaries"
                          : "New Patient Intake"}
                      </strong>

                      <small>
                        {isDoctor
                          ? "Review waiting cases"
                          : "Start guided interview"}
                      </small>
                    </span>

                    <ArrowRight size={16} />
                  </button>

                  {!isDoctor && (
                    <button
                      type="button"
                      className="quick-action"
                      onClick={() =>
                        goTo("/active-sessions")
                      }
                    >
                      <PlayCircle size={21} />

                      <span>
                        <strong>
                          Resume Intake
                        </strong>

                        <small>
                          Continue saved session
                        </small>
                      </span>

                      <ArrowRight size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="quick-action"
                    onClick={() =>
                      goTo("/danger-alerts")
                    }
                  >
                    <AlertTriangle size={21} />

                    <span>
                      <strong>
                        {isDoctor
                          ? "Urgent Cases"
                          : "Danger Alerts"}
                      </strong>

                      <small>
                        {isDoctor
                          ? "2 need review"
                          : "1 needs attention"}
                      </small>
                    </span>

                    <ArrowRight size={16} />
                  </button>
                </div>
              </section>

              {/* System Status */}
              <section className="panel system-panel">
                <div className="panel-heading compact">
                  <div>
                    <span className="panel-eyebrow">
                      <Network size={14} />
                      Device
                    </span>

                    <h2>System Status</h2>
                  </div>
                </div>

                <div className="system-status">
                  <div className="system-row">
                    <div className="system-status-icon online">
                      <Wifi size={17} />
                    </div>

                    <div>
                      <strong>Connection</strong>
                      <span>Offline ready</span>
                    </div>

                    <i className="status-light green-light" />
                  </div>

                  <div className="system-row">
                    <div className="system-status-icon">
                      <RefreshCw size={17} />
                    </div>

                    <div>
                      <strong>Local Sync</strong>
                      <span>
                        3 records waiting
                      </span>
                    </div>

                    <i className="status-light orange-light" />
                  </div>

                  <div className="system-row">
                    <div className="system-status-icon">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <strong>Privacy</strong>
                      <span>
                        Consent protected
                      </span>
                    </div>

                    <i className="status-light green-light" />
                  </div>
                </div>

                <button
                  type="button"
                  className="sync-button"
                  onClick={() =>
                    goTo("/sync-status")
                  }
                >
                  <RefreshCw size={16} />
                  Check Sync Status
                </button>
              </section>

              {/* Danger Alert */}
              <section className="panel alert-panel">
                <div className="alert-panel-header">
                  <div>
                    <span className="panel-eyebrow danger-eyebrow">
                      <AlertTriangle size={14} />
                      Safety Path
                    </span>

                    <h2>Danger Sign Alert</h2>
                  </div>

                  <span className="urgent-pill">
                    URGENT
                  </span>
                </div>

                <div className="danger-alert-card">
                  <div className="danger-patient">
                    <div className="danger-avatar">
                      <UserRound size={17} />
                    </div>

                    <div>
                      <strong>
                        Bimala Reang
                      </strong>

                      <span>
                        Maternal intake • 31 years
                      </span>
                    </div>
                  </div>

                  <div className="danger-sign">
                    <AlertTriangle size={16} />
                    <span>
                      Severe headache detected
                    </span>
                  </div>

                  <button
                    type="button"
                    className="danger-action"
                    onClick={() =>
                      goTo(
                        "/patient-details?id=patient-4"
                      )
                    }
                  >
                    {isDoctor
                      ? "Review Case"
                      : "Notify Doctor"}

                    <ArrowRight size={15} />
                  </button>
                </div>
              </section>

              {/* Consent */}
              <section className="panel consent-panel">
                <div className="consent-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3>Consent-first care</h3>

                  <p>
                    Audio or touch consent is required
                    before patient information is
                    recorded.
                  </p>
                </div>
              </section>

              {/* Languages */}
              <section className="panel language-panel">
                <div className="language-header">
                  <div className="language-icon">
                    <Languages size={18} />
                  </div>

                  <div>
                    <h3>
                      Supported Languages
                    </h3>

                    <p>MVP language packs</p>
                  </div>
                </div>

                <div className="language-tags">
                  <span>Bengali</span>
                  <span>Hindi</span>

                  <span className="roadmap-language">
                    Kokborok • Roadmap
                  </span>
                </div>
              </section>
            </aside>
          </div>

          {/* ====================================================
              FOOTER
          ===================================================== */}
          <footer className="dashboard-footer">
            <div>
              <strong>AarogyaVaani</strong>
              <span>
                Voice-first • Offline • Consent-first
              </span>
            </div>

            <div>
              <span>
                Healthcare • Wellbeing • Service Delivery
              </span>

              <span>Tripura</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;