import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Pill,
  Edit3,
  Save,
  QrCode,
  Printer,
  CheckCircle2,
  Activity,
  Heart,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient, savePatient } from "../../utils/patientStore";
import { getPatient, updatePatient } from "../../services/api";

const TRIPURA_DISTRICTS = [
  "Sepahijala District",
  "West District",
  "Gomati District",
  "South District",
  "Khowai District",
  "Dhalai District",
  "Unakoti District",
  "North District",
];

const HEALTH_CENTRES_BY_DISTRICT = {
  "Sepahijala District": [
    "Bishalgarh Community Health Centre (CHC)",
    "Boxanagar Primary Health Centre (PHC)",
    "Charilam Primary Health Centre (PHC)",
    "Kathalia Primary Health Centre (PHC)",
    "TMC & Dr. BRAM Teaching Hospital, Hapania",
  ],
  "West District": [
    "Mohanpur Primary Health Centre (PHC)",
    "Jirania Community Health Centre (CHC)",
    "Ranirbazar PHC",
    "Agartala Government Medical College & GBP Hospital",
  ],
  "Gomati District": [
    "Udaipur District Hospital (Tepania)",
    "Amarpur Sub-Divisional Hospital (SDH)",
    "Kakraban CHC",
    "Killa PHC",
  ],
  "South District": [
    "Belonia Sub-Divisional Hospital (SDH)",
    "Santirbazar CHC",
    "Hrishyamukh PHC",
    "Jolaibari CHC",
  ],
  "Khowai District": [
    "Teliamura Sub-Divisional Hospital (SDH)",
    "Khowai District Hospital",
    "Padmabil PHC",
  ],
  "Dhalai District": [
    "Ambassa District Hospital",
    "Kamalpur Sub-Divisional Hospital",
    "Manu PHC",
  ],
  "Unakoti District": [
    "Kailashahar District Hospital",
    "Kumarghat CHC",
    "Pecharthal PHC",
  ],
  "North District": [
    "Dharmanagar District Hospital",
    "Panisagar CHC",
    "Kanchanpur SDH",
  ],
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientProfilePage() {
  const navigate = useNavigate();
  const currentPatient = getCurrentPatient() || {};

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

  // Edit Mode Toggle
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State - Universal for Men, Women & All Citizens
  const [formData, setFormData] = useState({
    name: currentPatient.name || "Hare Krishna",
    phone: currentPatient.phone || "9862100000",
    age: currentPatient.age || "27",
    gender: currentPatient.gender || "Female",
    bloodGroup: currentPatient.bloodGroup || "B+",
    height: currentPatient.height || "162 cm",
    weight: currentPatient.weight || "58 kg",
    preferredLanguage: currentPatient.preferred_language || "bn-IN",
    state: "Tripura",
    district: currentPatient.district || "Sepahijala District",
    village: currentPatient.village || "Gakulnagar, Ward 3",
    pincode: "799102",
    nearestHospital:
      currentPatient.facility || "Bishalgarh Community Health Centre (CHC)",
    emergencyName: currentPatient.emergencyContact?.name || "Family Contact",
    emergencyPhone: currentPatient.emergencyContact?.phone || "+91 98621 11223",
    allergies: Array.isArray(currentPatient.allergies)
      ? currentPatient.allergies.join(", ")
      : "None reported",
    chronicConditions: Array.isArray(currentPatient.chronicConditions)
      ? currentPatient.chronicConditions.join(", ")
      : "None",
    medications: Array.isArray(currentPatient.currentMedications) && currentPatient.currentMedications.length > 0
      ? currentPatient.currentMedications.map((m) => m.name || m).join(", ")
      : "Paracetamol 500mg (as needed)",
    category: currentPatient.category || "General Healthcare (OPD)",
  });

  // Track sidebar drag
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

  // Load fresh patient profile from FastAPI backend / Supabase
  useEffect(() => {
    const pId = currentPatient?.patient_ref || currentPatient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

    getPatient(normalizedPId).then((remoteData) => {
      if (remoteData) {
        setFormData((prev) => ({
          ...prev,
          name: remoteData.name || prev.name,
          phone: remoteData.phone || prev.phone,
          age: remoteData.age || prev.age,
          gender: remoteData.gender || prev.gender,
          bloodGroup: remoteData.blood_group || prev.bloodGroup,
          preferredLanguage: remoteData.preferred_language || prev.preferredLanguage,
          district: remoteData.village || remoteData.district || prev.district,
          category: remoteData.category || prev.category,
          allergies: Array.isArray(remoteData.allergies) && remoteData.allergies.length > 0
            ? remoteData.allergies.join(", ")
            : prev.allergies,
          chronicConditions: Array.isArray(remoteData.chronic_conditions) && remoteData.chronic_conditions.length > 0
            ? remoteData.chronic_conditions.join(", ")
            : prev.chronicConditions,
        }));
      }
    });
  }, [currentPatient?.patient_ref, currentPatient?.id]);

  // Handle saving profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const allergiesArr = formData.allergies.split(",").map((s) => s.trim()).filter(Boolean);
    const chronicArr = formData.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean);

    const updatedPatient = {
      ...currentPatient,
      name: formData.name,
      phone: formData.phone,
      age: formData.age,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      height: formData.height,
      weight: formData.weight,
      preferred_language: formData.preferredLanguage,
      district: formData.district,
      village: formData.village,
      facility: formData.nearestHospital,
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
      },
      allergies: allergiesArr,
      chronicConditions: chronicArr,
      category: formData.category,
    };

    savePatient(updatedPatient);
    localStorage.setItem("aarogyaVaaniActiveUser", JSON.stringify(updatedPatient));

    // Sync updates to FastAPI backend / Supabase
    const pId = currentPatient?.patient_ref || currentPatient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

    try {
      await updatePatient(normalizedPId, {
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        village: formData.district || formData.village,
        preferred_language: formData.preferredLanguage,
        category: formData.category,
        allergies: allergiesArr,
        chronic_conditions: chronicArr,
      });
    } catch (err) {
      console.warn("[PatientProfile] Backend sync notice:", err);
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const availableHospitals =
    HEALTH_CENTRES_BY_DISTRICT[formData.district] || [
      "Bishalgarh Community Health Centre (CHC)",
      "Boxanagar Primary Health Centre (PHC)",
    ];

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="profile"
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

      {/* 3. MAIN WORKSPACE CONTAINER (Flat & Clean) */}
      <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
        <div className="p-6 sm:p-8 w-full space-y-6">

          {/* PAGE TITLE BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Patient Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Personal health record, address, and primary medical centre
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-4 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          {/* CITIZEN IDENTITY SUMMARY CARD (Flat, No Heavy Shadow or Gradients) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl shrink-0">
                {formData.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {formData.name}
                  </h2>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    ABDM Verified
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>Patient ID: <strong className="font-mono text-slate-800">AV-2026-8921</strong></span>
                  <span>·</span>
                  <span>ABHA Number: <strong className="font-mono text-slate-800">91-4820-9182-3810</strong></span>
                  <span>·</span>
                  <span>Phone: <strong className="text-slate-800">+91 {formData.phone}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {formData.age} Yrs
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {formData.gender}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-800">
                    Blood: {formData.bloodGroup}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {formData.preferredLanguage === "bn-IN" ? "বাংলা" : formData.preferredLanguage === "hi-IN" ? "हिंदी" : "English"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick QR & Print Action */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5 text-center shrink-0">
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-700" />
              </div>
              <button
                type="button"
                onClick={handlePrintCard}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>Print Card</span>
              </button>
            </div>
          </div>

          {/* DETAILS FORM (Flat and Clear) */}
          <form onSubmit={handleSaveProfile} className="space-y-5">

            {/* 1. PERSONAL INFORMATION */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Full Name:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Phone Number:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      +91 {formData.phone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Age:</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                        {formData.age} Years
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Gender:</label>
                    {isEditing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                        {formData.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Blood Group:</label>
                    {isEditing ? (
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                        {formData.bloodGroup}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Primary Language:</label>
                    {isEditing ? (
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="bn-IN">বাংলা (Bengali)</option>
                        <option value="hi-IN">हिंदी (Hindi)</option>
                        <option value="en-IN">English</option>
                      </select>
                    ) : (
                      <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                        {formData.preferredLanguage === "bn-IN" ? "বাংলা (Bengali)" : formData.preferredLanguage === "hi-IN" ? "हिंदी (Hindi)" : "English"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOCATION, ADDRESS & NEAREST HEALTH CENTRE (Universal) */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Address & Nearest Health Centre</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">State:</label>
                  {isEditing ? (
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="Tripura">Tripura</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Assam">Assam</option>
                    </select>
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.state}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">District:</label>
                  {isEditing ? (
                    <select
                      value={formData.district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        const newCentres = HEALTH_CENTRES_BY_DISTRICT[newDist] || [];
                        setFormData({
                          ...formData,
                          district: newDist,
                          nearestHospital: newCentres[0] || formData.nearestHospital,
                        });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {TRIPURA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.district}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Village / Town:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.village}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">PIN Code:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.pincode}
                    </p>
                  )}
                </div>

                {/* NEAREST HEALTH FACILITY */}
                <div className="sm:col-span-2 space-y-1 pt-1">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nearest Hospital / Health Centre (CHC / PHC):</span>
                  </label>

                  {isEditing ? (
                    <select
                      value={formData.nearestHospital}
                      onChange={(e) => setFormData({ ...formData, nearestHospital: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    >
                      {availableHospitals.map((hosp) => (
                        <option key={hosp} value={hosp}>
                          {hosp}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">
                          {formData.nearestHospital}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Approx. 2.4 km from your residence
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/patient/share")}
                        className="px-3 py-1 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer self-start sm:self-center"
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. EMERGENCY CONTACT */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Emergency Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Contact Person & Relationship:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.emergencyName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Emergency Phone:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. GENERAL MEDICAL INFORMATION (Universal for All Patients) */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>General Health & Medical Notes</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Known Allergies:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.allergies || "None reported"}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Chronic Health Conditions:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.chronicConditions}
                      onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.chronicConditions || "None"}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-600 font-medium">Current Regular Medications:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      {formData.medications || "None"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions when Editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            )}
          </form>

        </div>
      </main>
      </div>

    </div>
  );
}
