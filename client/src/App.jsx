import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import NewPatient from "./pages/NewPatient/NewPatient";
import Consent from "./pages/Consent/Consent";
import Interview from "./pages/Interview/Interview";
import DangerCheck from "./pages/DangerCheck/DangerCheck";
import Summary from "./pages/Summary/Summary";
import ActiveSessions from "./pages/ActiveSessions/ActiveSessions";
import Patients from "./pages/Patients/Patients";
import PatientDetails from "./pages/PatientDetails/PatientDetails";
import DangerAlerts from "./pages/DangerAlerts/DangerAlerts";
import DoctorReview from "./pages/DoctorReview/DoctorReview";
import Reports from "./pages/Reports/Reports";
import SyncStatus from "./pages/SyncStatus/SyncStatus";
import SignupStatus from "./pages/SignupStatus/SignupStatus";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-patient" element={<NewPatient />} />
      <Route path="/consent" element={<Consent />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/danger-check" element={<DangerCheck />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/active-sessions" element={<ActiveSessions />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patient-details" element={<PatientDetails />} />
      <Route path="/danger-alerts" element={<DangerAlerts />} />
      <Route path="/doctor-review" element={<DoctorReview />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/sync-status" element={<SyncStatus />} />
      <Route path="/signup-status" element={<SignupStatus />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;