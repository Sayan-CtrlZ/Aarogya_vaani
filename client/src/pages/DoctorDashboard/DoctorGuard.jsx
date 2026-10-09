import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * DoctorGuard
 * Protects all /doctor/* routes.
 * Ensures only users with role === "doctor" can enter the Doctor Dashboard.
 * Unauthorized visitors are redirected to /login?role=doctor.
 */
export default function DoctorGuard({ children }) {
  const location = useLocation();

  const role = sessionStorage.getItem("aarogyaVaaniRole") || "";
  let user = null;
  try {
    user = JSON.parse(
      sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser") ||
        "{}"
    );
  } catch {
    user = null;
  }

  const isDoctor =
    role === "doctor" || user?.role === "doctor" || user?.isDoctor === true;

  if (!isDoctor) {
    // Preserve attempted destination in query param or redirect to doctor sign-in
    return <Navigate to="/login?role=doctor" state={{ from: location }} replace />;
  }

  return children;
}
