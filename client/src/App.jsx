import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DoctorGuard from "./pages/DoctorDashboard/DoctorGuard";

const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const NewPatient = lazy(() => import("./pages/NewPatient/NewPatient"));
const Consent = lazy(() => import("./pages/Consent/Consent"));
const Interview = lazy(() => import("./pages/Interview/Interview"));
const DangerCheck = lazy(() => import("./pages/DangerCheck/DangerCheck"));
const Summary = lazy(() => import("./pages/Summary/Summary"));
const ActiveSessions = lazy(() => import("./pages/ActiveSessions/ActiveSessions"));
const Patients = lazy(() => import("./pages/Patients/Patients"));
const PatientDetails = lazy(() => import("./pages/PatientDetails/PatientDetails"));
const DangerAlerts = lazy(() => import("./pages/DangerAlerts/DangerAlerts"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const SyncStatus = lazy(() => import("./pages/SyncStatus/SyncStatus"));
const SignupStatus = lazy(() => import("./pages/SignupStatus/SignupStatus"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const RoutesDirectory = lazy(() => import("./pages/RoutesDirectory/RoutesDirectory"));

// Doctor Portal Layout & Subpages
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard/DoctorDashboard"));
const DoctorReviewTab = lazy(() => import("./pages/DoctorDashboard/DoctorReviewTab"));
const DoctorEmergencyTab = lazy(() => import("./pages/DoctorDashboard/DoctorEmergencyTab"));
const DoctorPatientsTab = lazy(() => import("./pages/DoctorDashboard/DoctorPatientsTab"));
const DoctorAnalyticsTab = lazy(() => import("./pages/DoctorDashboard/DoctorAnalyticsTab"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f9f8]">
    <div className="w-[40px] h-[40px] border-4 border-[#e2ece9] border-t-[#159b80] rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/routes" element={<RoutesDirectory />} />
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

        {/* Doctor Portal: Role-guarded at parent route, with nested subpages */}
        <Route
          path="/doctor"
          element={
            <DoctorGuard>
              <DoctorDashboard />
            </DoctorGuard>
          }
        >
          <Route index element={<Navigate to="review" replace />} />
          <Route path="review" element={<DoctorReviewTab />} />
          <Route path="emergency" element={<DoctorEmergencyTab />} />
          <Route path="patients" element={<DoctorPatientsTab />} />
          <Route path="analytics" element={<DoctorAnalyticsTab />} />
        </Route>

        {/* Doctor route aliases / backward-compatibility */}
        <Route path="/doctor-review" element={<Navigate to="/doctor/review" replace />} />
        <Route path="/doctor-dashboard" element={<Navigate to="/doctor/review" replace />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/sync-status" element={<SyncStatus />} />
        <Route path="/signup-status" element={<SignupStatus />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

export default App;