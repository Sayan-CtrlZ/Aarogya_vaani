import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewPatient from "./pages/NewPatient";
import Consent from "./pages/Consent";
import Interview from "./pages/Interview";
import DangerCheck from "./pages/DangerCheck";
import Summary from "./pages/Summary";
import DoctorReview from "./pages/DoctorReview";
import Reports from "./pages/Reports";

import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import ActiveSessions from "./pages/ActiveSessions";
import DangerAlerts from "./pages/DangerAlerts";
import Settings from "./pages/Settings";
import SignupStatus from "./pages/SignupStatus";
import SyncStatus from "./pages/SyncStatus";

function App() {
  const path = window.location.pathname;

  if (path === "/login") return <Login />;

  if (path === "/dashboard") return <Dashboard />;

  if (path === "/new-patient") return <NewPatient />;

  if (path === "/consent") return <Consent />;

  if (path === "/interview") return <Interview />;

  if (path === "/danger-check") return <DangerCheck />;

  if (path === "/summary") return <Summary />;

  if (path === "/doctor-review") return <DoctorReview />;

  if (path === "/reports") return <Reports />;

  if (path === "/patients") return <Patients />;

  if (path === "/patient-details") return <PatientDetails />;

  if (path === "/active-sessions") return <ActiveSessions />;

  if (path === "/danger-alerts") return <DangerAlerts />;

  if (path === "/settings") return <Settings />;

  if (path === "/signup-status") return <SignupStatus />;

  if (path === "/sync-status") return <SyncStatus />;

  return <Landing />;
}

export default App;