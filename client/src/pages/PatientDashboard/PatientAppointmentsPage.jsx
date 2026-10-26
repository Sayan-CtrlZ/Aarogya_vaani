import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Building2,
  Stethoscope,
  Clock,
  MapPin,
  CheckCircle2,
  Printer,
  Trash2,
  Search,
  User,
  X,
  ShieldCheck,
  Plus,
  Bot,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient } from "../../utils/patientStore";
import {
  fetchPatientAppointments,
  bookPatientAppointment,
  cancelPatientAppointment,
  fetchHealthcareFacilities,
} from "../../services/api";

const NEARBY_HEALTH_CENTRES = [
  {
    id: "fac-1",
    name: "Bishalgarh Community Health Centre (CHC)",
    type: "Community Health Centre",
    distance: "2.4 km away",
    address: "Bishalgarh Bazar Road, Sepahijala District, Tripura",
    timings: "09:00 AM - 02:00 PM (Daily OPD)",
    emergency: "24/7 Casualty & Delivery Room",
    phone: "+91 381 236 1222",
    doctors: [
      { id: "doc-1", name: "Dr. S. Roy", specialty: "General Medicine & Medical Officer", available: "Mon - Sat" },
      { id: "doc-2", name: "Dr. M. Begum", specialty: "Gynaecology & Maternal Health", available: "Tue, Thu, Sat" },
    ],
    facilities: ["Free OPD Token", "In-house Pharmacy", "Digital ABHA Scan"],
  },
  {
    id: "fac-2",
    name: "Boxanagar Primary Health Centre (PHC)",
    type: "Primary Health Centre",
    distance: "5.1 km away",
    address: "Boxanagar Main Block, Sepahijala District, Tripura",
    timings: "08:30 AM - 01:30 PM (Mon - Sat)",
    emergency: "Maternal Delivery & First Aid",
    phone: "+91 381 286 4101",
    doctors: [
      { id: "doc-3", name: "Dr. P. Jamatia", specialty: "Medical Officer (General OPD)", available: "Daily" },
      { id: "doc-4", name: "Kalpana Reang", specialty: "Senior ANM & ASHA Supervisor", available: "Daily" },
    ],
    facilities: ["Routine Immunization", "Free Essential Medicines"],
  },
  {
    id: "fac-3",
    name: "Charilam Primary Health Centre (PHC)",
    type: "Primary Health Centre",
    distance: "8.3 km away",
    address: "Charilam Sub-division, Sepahijala District, Tripura",
    timings: "09:00 AM - 01:00 PM",
    emergency: "Day Care & First Aid",
    phone: "+91 381 289 0044",
    doctors: [
      { id: "doc-5", name: "Dr. D. Barman", specialty: "Medical Officer", available: "Mon, Wed, Fri" },
    ],
    facilities: ["Basic Pathology Tests", "General Health Counselling"],
  },
];

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const patient = getCurrentPatient() || {};

  // Sidebar drag & resize state
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Filter state
  const [selectedState] = useState("Tripura");
  const [selectedDistrict] = useState("Sepahijala");
  const [facilitySearch, setFacilitySearch] = useState("");

  // Facilities list (remote with local fallback)
  const [facilities, setFacilities] = useState(NEARBY_HEALTH_CENTRES);

  // Confirmed Appointments state
  const [appointments, setAppointments] = useState(() => {
    try {
      const stored = localStorage.getItem("aarogyaVaaniAppointments");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "apt-101",
        tokenNumber: "OPD-42",
        facilityName: "Bishalgarh Community Health Centre (CHC)",
        facilityAddress: "Bishalgarh Bazar Road, Sepahijala",
        doctorName: "Dr. S. Roy (Medical Officer)",
        specialty: "General Medicine",
        date: "Tomorrow, 14 Oct 2024",
        timeSlot: "10:30 AM",
        reason: "General Consultation Review",
        attachedRecords: true,
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Booking Modal State
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("Tomorrow (14 Oct 2024)");
  const [bookingTimeSlot, setBookingTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [bookingReason, setBookingReason] = useState("General Health Review & Check-up");
  const [attachHealthSummary, setAttachHealthSummary] = useState(true);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(null);

  // Load facilities and appointments from FastAPI Backend on mount
  useEffect(() => {
    fetchHealthcareFacilities().then((facs) => {
      if (Array.isArray(facs) && facs.length > 0) {
        setFacilities(facs);
      }
    });

    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

    fetchPatientAppointments(normalizedPId).then((remoteApts) => {
      if (Array.isArray(remoteApts) && remoteApts.length > 0) {
        const mapped = remoteApts.map((a) => ({
          id: a.id,
          tokenNumber: a.token_number || a.tokenNumber || "OPD-10",
          facilityName: a.facility_name || a.facilityName,
          facilityAddress: a.facility_address || a.facilityAddress,
          doctorName: a.doctor_name || a.doctorName,
          specialty: a.specialty || "General Medicine",
          date: a.date,
          timeSlot: a.time_slot || a.timeSlot,
          reason: a.reason,
          attachedRecords: a.attached_records !== undefined ? a.attached_records : a.attachedRecords,
          status: a.status || "CONFIRMED",
          createdAt: a.created_at || a.createdAt || new Date().toISOString(),
        }));
        setAppointments(mapped);
      }
    });
  }, [patient?.patient_ref, patient?.id]);

  useEffect(() => {
    try {
      localStorage.setItem("aarogyaVaaniAppointments", JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  // Sidebar drag tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.min(420, Math.max(180, e.clientX));
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (isDraggingLeft) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedFacilityForBooking) return;

    const chosenDoctor =
      selectedFacilityForBooking.doctors.find((d) => d.id === selectedDoctorId) ||
      selectedFacilityForBooking.doctors[0];

    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const tokenNum = `OPD-${Math.floor(10 + Math.random() * 89)}`;

    const bookingPayload = {
      patient_id: pId,
      facility_name: selectedFacilityForBooking.name,
      facility_address: selectedFacilityForBooking.address || "",
      doctor_name: chosenDoctor.name,
      specialty: chosenDoctor.specialty || "General Medicine",
      date: bookingDate,
      time_slot: bookingTimeSlot,
      reason: bookingReason,
      attached_records: attachHealthSummary,
    };

    try {
      const res = await bookPatientAppointment(bookingPayload);
      const newApt = {
        id: res?.id || `apt-${Date.now()}`,
        tokenNumber: res?.token_number || tokenNum,
        facilityName: res?.facility_name || bookingPayload.facility_name,
        facilityAddress: res?.facility_address || bookingPayload.facility_address,
        doctorName: res?.doctor_name || bookingPayload.doctor_name,
        specialty: res?.specialty || bookingPayload.specialty,
        date: res?.date || bookingPayload.date,
        timeSlot: res?.time_slot || bookingPayload.time_slot,
        reason: res?.reason || bookingPayload.reason,
        attachedRecords: res?.attached_records ?? bookingPayload.attached_records,
        status: res?.status || "CONFIRMED",
        createdAt: res?.created_at || new Date().toISOString(),
      };
      setAppointments((prev) => [newApt, ...prev]);
      setShowBookingSuccessModal(newApt);
    } catch {
      const fallbackApt = {
        id: `apt-${Date.now()}`,
        tokenNumber: tokenNum,
        facilityName: selectedFacilityForBooking.name,
        facilityAddress: selectedFacilityForBooking.address,
        doctorName: chosenDoctor.name,
        specialty: chosenDoctor.specialty,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        reason: bookingReason,
        attachedRecords: attachHealthSummary,
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [fallbackApt, ...prev]);
      setShowBookingSuccessModal(fallbackApt);
    }

    setSelectedFacilityForBooking(null);
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm("Are you sure you want to cancel this OPD appointment?")) return;
    try {
      await cancelPatientAppointment(aptId);
    } catch {}
    setAppointments((prev) => prev.filter((a) => a.id !== aptId));
  };

  const filteredFacilities = facilities.filter((f) => {
    const q = facilitySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.address.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||

      f.doctors.some((d) => d.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="appointments"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

      {/* 2. RESIZER HANDLE */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          onDoubleClick={() => setLeftWidth(240)}
          className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
          title="Drag to resize sidebar (Double-click to reset)"
        />
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
        <div className="p-6 sm:p-8 w-full space-y-6">

          {/* PAGE TITLE BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Book Doctor Appointment
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Find nearby government health centres and get an OPD appointment token
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ayushman Bharat (ABDM) OPD</span>
              </span>
            </div>
          </div>

          {/* AI DOCTOR ACTIVE CONSULTATION BANNER */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">AarogyaVaani AI Doctor Assistant</h3>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">24/7 Available</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Need instant symptom check or triage before booking OPD? Consult the AI Doctor in Kokborok, Bengali or Hindi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/patient/ai-doctor")}
              className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Consult AI Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CONFIRMED APPOINTMENTS ON TOP (GOVERNMENT REGISTRY TABLE) */}
          {appointments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Your Booked OPD Tokens ({appointments.length})</span>
              </h3>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-3.5">Token #</th>
                        <th className="py-3 px-4">Health Facility</th>
                        <th className="py-3 px-4">Doctor & Specialty</th>
                        <th className="py-3 px-4">Date & Slot</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              {apt.tokenNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>{apt.facilityName}</div>
                            <span className="text-[10.5px] text-slate-400 font-normal">{apt.reason}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            {apt.doctorName}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                            <div>{apt.date}</div>
                            <span className="text-[10.5px] text-slate-400">{apt.timeSlot}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setShowBookingSuccessModal(apt)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Token</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="p-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Cancel Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH & LOCATION FILTER */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Location:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedDistrict}, {selectedState}
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                placeholder="Search hospital or doctor..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* SUGGESTED HEALTH CENTRES LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Government Health Centres
            </h3>

            <div className="space-y-3">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900">
                        {facility.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {facility.distance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 pl-6">
                      {facility.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pl-6 pt-0.5">
                      <span className="font-medium">
                        Doctors: {facility.doctors.map((d) => d.name).join(", ")}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">
                        {facility.timings}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-6 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFacilityForBooking(facility);
                        setSelectedDoctorId(facility.doctors[0]?.id || "");
                      }}
                      className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book OPD Token</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      </div>

      {/* BOOKING MODAL */}
      {selectedFacilityForBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setSelectedFacilityForBooking(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Book OPD Visit
                </h3>
                <p className="text-xs text-slate-500">{selectedFacilityForBooking.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacilityForBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Doctor:</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  {selectedFacilityForBooking.doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.available})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Date:</label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Today (Walk-in Token)">Today (Walk-in)</option>
                    <option value="Tomorrow (14 Oct 2024)">Tomorrow (14 Oct 2024)</option>
                    <option value="Wednesday (15 Oct 2024)">Wednesday (15 Oct 2024)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Time Slot:</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="09:30 AM - 10:30 AM">Morning (09:30 AM)</option>
                    <option value="10:30 AM - 11:30 AM">Morning (10:30 AM)</option>
                    <option value="11:30 AM - 12:30 PM">Noon (11:30 AM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason for Visit:</label>
                <input
                  type="text"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="e.g. Fever checkup, blood pressure follow-up"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachHealthSummary}
                  onChange={(e) => setAttachHealthSummary(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-[#059669]"
                />
                <span className="text-slate-700 font-medium text-[11px]">
                  Attach my recent AI consultation notes for the attending doctor
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacilityForBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs cursor-pointer"
                >
                  Confirm & Get Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOKEN SLIP MODAL */}
      {showBookingSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setShowBookingSuccessModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-800 text-white text-center space-y-0.5">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">National Health Mission</p>
              <h3 className="text-base font-bold">OPD Appointment Token</h3>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Queue Token Number</span>
                <p className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
                  {showBookingSuccessModal.tokenNumber}
                </p>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-semibold text-slate-900">{patient?.name || "Hare Krishna"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Centre:</span>
                  <span className="font-semibold text-slate-900 text-right">{showBookingSuccessModal.facilityName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-semibold text-slate-800">{showBookingSuccessModal.doctorName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Time:</span>
                  <span className="font-semibold text-slate-900">{showBookingSuccessModal.date} ({showBookingSuccessModal.timeSlot})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingSuccessModal(null)}
                  className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
