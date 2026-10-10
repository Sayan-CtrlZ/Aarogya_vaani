import React from "react";
import { useNavigate } from "react-router-dom";
import UniversalNavbar from "../../components/UniversalNavbar";
import LiveVoiceAssistant from "../../components/LiveVoiceAssistant";
import { getCurrentPatient, savePatient } from "../../utils/patientStore";

/**
 * PatientAIDoctorPage
 *
 * Dedicated AI Doctor Live Voice Consultation page.
 * Powered by dynamic JSON-generated questions with 4 interactive option cards,
 * Light Mode Voice Sphere, and real-time input & output speech transcription.
 * Integrated with UniversalNavbar for seamless navigation consistency.
 */
export default function PatientAIDoctorPage() {
  const navigate = useNavigate();
  const patient = getCurrentPatient();

  const handleSaveAssessment = (updatedData) => {
    savePatient(updatedData);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f8fafc] flex flex-col font-sans">
      <UniversalNavbar showBack backPath="/patient" />
      <div className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col">
        <LiveVoiceAssistant
          onClose={() => navigate("/patient")}
          patientName={patient?.name || "Patient"}
          onSaveAssessment={handleSaveAssessment}
          hideTopHeader={true}
        />
      </div>
    </div>
  );
}
