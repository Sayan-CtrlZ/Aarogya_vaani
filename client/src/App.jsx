import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DoctorGuard from "./pages/DoctorDashboard/DoctorGuard";

const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login/Login"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard/PatientDashboard"));
const PatientAIDoctorPage = lazy(() => import("./pages/PatientDashboard/PatientAIDoctorPage"));
const PatientConsultationsPage = lazy(() => import("./pages/PatientDashboard/PatientConsultationsPage"));
const PatientSharePage = lazy(() => import("./pages/PatientDashboard/PatientSharePage"));
const PatientDocumentsPage = lazy(() => import("./pages/PatientDashboard/PatientDocumentsPage"));

// Doctor Portal Layout & Subpages
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard/DoctorDashboard"));
const DoctorReviewTab = lazy(() => import("./pages/DoctorDashboard/DoctorReviewTab"));
const DoctorEmergencyTab = lazy(() => import("./pages/DoctorDashboard/DoctorEmergencyTab"));
const DoctorPatientsTab = lazy(() => import("./pages/DoctorDashboard/DoctorPatientsTab"));
const DoctorAnalyticsTab = lazy(() => import("./pages/DoctorDashboard/DoctorAnalyticsTab"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="w-[42px] h-[42px] border-4 border-[#e2ece9] border-t-[#0b6651] rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Landing & Login */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Patient Dashboard and Dedicated Feature Pages */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/ai-doctor" element={<PatientAIDoctorPage />} />
        <Route path="/patient/consultations" element={<PatientConsultationsPage />} />
        <Route path="/patient/share" element={<PatientSharePage />} />
        <Route path="/patient/documents" element={<PatientDocumentsPage />} />
        <Route path="/dashboard" element={<Navigate to="/patient" replace />} />
        <Route path="/new-patient" element={<Navigate to="/patient" replace />} />
        <Route path="/patients" element={<Navigate to="/patient" replace />} />

        {/* Doctor Portal: Role-guarded at parent route, with subpages */}
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;