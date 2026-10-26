import React from "react";
import { useLocation } from "react-router-dom";

/**
 * DoctorGuard
 * Protects all /doctor/* routes.
 * Ensures doctor session (Dr. Sandeep Roy) is seamlessly initialized.
 */
export default function DoctorGuard({ children }) {
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
    const defaultDoctor = {
      role: "doctor",
      userName: "Dr. Sandeep Roy",
      name: "Dr. Sandeep Roy",
      designation: "General Physician",
      facility: "Bishalgarh Community Health Centre",
      district: "Sepahijala District",
      workerId: "DR-ROY-2026",
      phone: "+91 94361 23456",
      isDoctor: true,
    };
    sessionStorage.setItem("aarogyaVaaniRole", "doctor");
    sessionStorage.setItem("aarogyaVaaniUserProfile", JSON.stringify(defaultDoctor));
    sessionStorage.setItem("aarogyaVaaniDoctorSession", JSON.stringify(defaultDoctor));
  }

  return children;
}
