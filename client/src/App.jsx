import React, { Component, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DoctorGuard from "./pages/DoctorDashboard/DoctorGuard";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">Portal View Recovered</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-[#0b6651] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login/Login"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard/PatientDashboard"));
const PatientAIDoctorPage = lazy(() => import("./pages/PatientDashboard/PatientAIDoctorPage"));
const PatientConsultationsPage = lazy(() => import("./pages/PatientDashboard/PatientConsultationsPage"));
const PatientSharePage = lazy(() => import("./pages/PatientDashboard/PatientSharePage"));
const PatientDocumentsPage = lazy(() => import("./pages/PatientDashboard/PatientDocumentsPage"));
const PatientAppointmentsPage = lazy(() => import("./pages/PatientDashboard/PatientAppointmentsPage"));
const PatientProfilePage = lazy(() => import("./pages/PatientDashboard/PatientProfilePage"));
const PatientSettingsPage = lazy(() => import("./pages/PatientDashboard/PatientSettingsPage"));

// Doctor Portal Layout & Subpages
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard/DoctorDashboard"));
const DoctorReviewTab = lazy(() => import("./pages/DoctorDashboard/DoctorReviewTab"));
const DoctorEmergencyTab = lazy(() => import("./pages/DoctorDashboard/DoctorEmergencyTab"));
const DoctorPrescriptionsTab = lazy(() => import("./pages/DoctorDashboard/DoctorPrescriptionsTab"));
const DoctorAppointmentsTab = lazy(() => import("./pages/DoctorDashboard/DoctorAppointmentsTab"));
const DoctorPatientsTab = lazy(() => import("./pages/DoctorDashboard/DoctorPatientsTab"));
const DoctorRecordsVaultTab = lazy(() => import("./pages/DoctorDashboard/DoctorRecordsVaultTab"));
const DoctorAnalyticsTab = lazy(() => import("./pages/DoctorDashboard/DoctorAnalyticsTab"));
const DoctorSettingsTab = lazy(() => import("./pages/DoctorDashboard/DoctorSettingsTab"));
const DoctorAccessRecordsTab = lazy(() => import("./pages/DoctorDashboard/DoctorAccessRecordsTab"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="w-[42px] h-[42px] border-4 border-[#e2ece9] border-t-[#0b6651] rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Landing & Login */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Patient Dashboard and Dedicated Feature Pages */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/ai-doctor" element={<PatientAIDoctorPage />} />
        <Route path="/patient/overview" element={<PatientDashboard />} />
        <Route path="/patient/consultations" element={<PatientConsultationsPage />} />
        <Route path="/patient/share" element={<PatientSharePage />} />
        <Route path="/patient/documents" element={<PatientDocumentsPage />} />
        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/patient/profile" element={<PatientProfilePage />} />
        <Route path="/patient/settings" element={<PatientSettingsPage />} />
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
          <Route path="access" element={<DoctorAccessRecordsTab />} />
          <Route path="access-records" element={<DoctorAccessRecordsTab />} />
          <Route path="emergency" element={<DoctorEmergencyTab />} />
          <Route path="prescriptions" element={<DoctorPrescriptionsTab />} />
          <Route path="appointments" element={<DoctorAppointmentsTab />} />
          <Route path="patients" element={<DoctorPatientsTab />} />
          <Route path="records" element={<DoctorRecordsVaultTab />} />
          <Route path="vault" element={<DoctorRecordsVaultTab />} />
          <Route path="analytics" element={<DoctorAnalyticsTab />} />
          <Route path="settings" element={<DoctorSettingsTab />} />
        </Route>

        {/* Doctor route aliases / backward-compatibility */}
        <Route path="/doctor-review" element={<Navigate to="/doctor/review" replace />} />
        <Route path="/doctor-dashboard" element={<Navigate to="/doctor/review" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}

export default App;