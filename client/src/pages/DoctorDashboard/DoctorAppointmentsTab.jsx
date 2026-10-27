import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as LucideCalendar, 
  Clock, 
  Video as LucideVideo, 
  MapPin, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ChevronRight,
  User,
  Stethoscope,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  Check,
  X,
  FileText,
  CalendarCheck,
  Building2,
  Users
} from "lucide-react";

// Import Animated UI Icons
import { CalendarIcon } from "../../components/icons/calendar";
import { VideoIcon } from "../../components/icons/video";
import { PhoneCallIcon } from "../../components/icons/phone-call";
import { callSounds } from "../../utils/callSounds";

// --- INITIAL MOCK APPOINTMENT DATA ---
const INITIAL_APPOINTMENTS = [
  {
    id: "APT-8829-1",
    patientName: "Sunita Das",
    patientId: "AV-2026-2103",
    time: "09:00 AM",
    duration: "30 min",
    type: "IN_PERSON",
    status: "COMPLETED",
    category: "Postnatal Checkup",
    date: "TODAY",
    village: "Mohanpur",
    notes: "BP stable at 122/80. Prescribed iron supplements."
  },
  {
    id: "APT-8829-2",
    patientName: "Mamta Debbarma",
    patientId: "AV-2026-8921",
    time: "10:30 AM",
    duration: "15 min",
    type: "VIDEO",
    status: "SCHEDULED",
    category: "ANC Routine (20w)",
    date: "TODAY",
    isNext: true,
    village: "Lefunga Sub-Centre",
    notes: "Review ultrasound scan and anemia blood panel."
  },
  {
    id: "APT-8829-3",
    patientName: "Hare Krishna",
    patientId: "AV-2026-7316",
    time: "11:15 AM",
    duration: "20 min",
    type: "IN_PERSON",
    status: "SCHEDULED",
    category: "Hypertension Follow-up",
    date: "TODAY",
    village: "Bishalgarh",
    notes: "Review 14-day ambulatory blood pressure log."
  },
  {
    id: "APT-8829-4",
    patientName: "Bappaditya Paul",
    patientId: "AV-2026-4454",
    time: "02:00 PM",
    duration: "15 min",
    type: "VIDEO",
    status: "SCHEDULED",
    category: "General Consult",
    date: "TODAY",
    village: "Agartala Ward 6",
    notes: "Seasonal dust allergy and rhinitis review."
  },
  {
    id: "APT-8829-5",
    patientName: "Pritam Saha",
    patientId: "AV-2026-9902",
    time: "03:30 PM",
    duration: "30 min",
    type: "IN_PERSON",
    status: "CANCELLED",
    category: "Asthma Review",
    date: "TODAY",
    village: "Melaghar",
    notes: "Patient requested reschedule to next week."
  },
  {
    id: "APT-8829-6",
    patientName: "Anita Roy",
    patientId: "AV-2026-1120",
    time: "09:30 AM",
    duration: "20 min",
    type: "VIDEO",
    status: "SCHEDULED",
    category: "Endocrinology / HbA1c",
    date: "TOMORROW",
    village: "Khowai CHC",
    notes: "Fasting blood sugar 126 mg/dL. Titrate Metformin."
  },
  {
    id: "APT-8829-7",
    patientName: "Bimala Reang",
    patientId: "AV-2026-5542",
    time: "11:00 AM",
    duration: "25 min",
    type: "IN_PERSON",
    status: "SCHEDULED",
    category: "Pediatric Immunization",
    date: "TOMORROW",
    village: "Dhalai Sub-Centre",
    notes: "Pentavalent booster dose."
  }
];

export default function DoctorAppointmentsTab() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState("TODAY"); // 'TODAY' | 'TOMORROW' | 'ALL'
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // 'ALL' | 'VIDEO' | 'IN_PERSON'

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [videoCallDuration, setVideoCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const callTimerRef = useRef(null);

  // New Appointment Form State
  const [formPatientName, setFormPatientName] = useState("");
  const [formPatientId, setFormPatientId] = useState("");
  const [formTime, setFormTime] = useState("10:00 AM");
  const [formDate, setFormDate] = useState("TODAY");
  const [formType, setFormType] = useState("VIDEO");
  const [formCategory, setFormCategory] = useState("General Consult");
  const [formDuration, setFormDuration] = useState("15 min");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Filter logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDate = activeTab === "ALL" || apt.date === activeTab;
      const matchesType = typeFilter === "ALL" || apt.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        apt.patientName.toLowerCase().includes(q) || 
        apt.patientId.toLowerCase().includes(q) ||
        apt.category.toLowerCase().includes(q) ||
        (apt.village && apt.village.toLowerCase().includes(q));
      return matchesDate && matchesType && matchesSearch;
    });
  }, [appointments, activeTab, typeFilter, searchQuery]);

  // Dynamic Metrics
  const metrics = useMemo(() => {
    const todayList = appointments.filter(a => a.date === "TODAY");
    const totalToday = todayList.length;
    const completed = todayList.filter(a => a.status === "COMPLETED").length;
    const videoCount = todayList.filter(a => a.type === "VIDEO").length;
    const nextSlot = todayList.find(a => a.isNext && a.status === "SCHEDULED") || todayList.find(a => a.status === "SCHEDULED");
    return { totalToday, completed, videoCount, nextSlot };
  }, [appointments]);

  // Video call timer
  useEffect(() => {
    if (activeVideoCall) {
      setVideoCallDuration(0);
      callSounds.playCallConnectedChime();
      callTimerRef.current = setInterval(() => {
        setVideoCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeVideoCall]);

  const handleEndVideoCall = () => {
    callSounds.playCallEndTone();
    setActiveVideoCall(null);
    setVideoCallDuration(0);
    showToast("Teleconsultation call ended and recorded.");
  };

  const handleMarkStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: newStatus, isNext: false };
      }
      return apt;
    }));
    callSounds.playCallConnectedChime();
    showToast(`Appointment marked as ${newStatus.toLowerCase()}.`);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!formPatientName) return;

    const newApt = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}-${appointments.length + 1}`,
      patientName: formPatientName,
      patientId: formPatientId || `AV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      time: formTime,
      duration: formDuration,
      type: formType,
      status: "SCHEDULED",
      category: formCategory,
      date: formDate,
      isNext: false,
      village: "CHC Bishalgarh"
    };

    setAppointments([newApt, ...appointments]);
    setIsScheduleModalOpen(false);
    setFormPatientName("");
    setFormPatientId("");
    callSounds.playCallConnectedChime();
    showToast("Follow-up appointment scheduled successfully!");
  };

  const formatCallTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon size={20} duration={1} isAnimated={true} />
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Appointments & Teleconsult Schedule
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">Tuesday, 27 Oct 2026</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-emerald-600" /> Bishalgarh CHC & Rural Sub-Centres
            </span>
          </p>
        </div>

        <button 
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 h-fit cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} /> Schedule Follow-up
        </button>
      </div>

      {/* --- STATS KPI ROW (OpenSource UI Aesthetic) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Today's Scheduled
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {metrics.totalToday}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Appointments</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-mono">
            Up Next Consultation
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-emerald-900 dark:text-emerald-200 truncate">
              {metrics.nextSlot ? metrics.nextSlot.patientName : "All Caught Up"}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {metrics.nextSlot ? `${metrics.nextSlot.time} (${metrics.nextSlot.type === "VIDEO" ? "Video Teleconsult" : "In-Person"})` : "No pending slots"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Completed Today
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {metrics.completed}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={13} /> {metrics.totalToday > 0 ? Math.round((metrics.completed / metrics.totalToday) * 100) : 0}% done
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Teleconsultations
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600 font-mono">
              {metrics.videoCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Livekit / ABDM</span>
          </div>
        </div>

      </div>

      {/* --- MAIN SCHEDULE CONTAINER --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col min-h-[560px] overflow-hidden">
        
        {/* Toolbar (Tabs, Search & Type Filter) */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex flex-col lg:flex-row justify-between gap-4 items-stretch lg:items-center">
          
          {/* Animated Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700">
            {[
              { id: "TODAY", label: "Today" },
              { id: "TOMORROW", label: "Tomorrow" },
              { id: "ALL", label: "All Upcoming" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700" 
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Type Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search patient, ID, or village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Modalities</option>
                <option value="VIDEO">Video Teleconsult</option>
                <option value="IN_PERSON">In-Person OPD</option>
              </select>
              <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Schedule Timeline List */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto bg-slate-50/60 dark:bg-slate-950/40">
          {filteredAppointments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                <LucideCalendar size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Appointments Found</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm">
                There are no scheduled appointments matching your active filter criteria for this date range.
              </p>
              <button
                onClick={() => { setActiveTab("ALL"); setTypeFilter("ALL"); setSearchQuery(""); }}
                className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-5 max-w-4xl mx-auto relative">
              {/* Vertical Timeline Guide Line */}
              <div className="absolute left-[92px] top-6 bottom-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

              {filteredAppointments.map((apt) => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt}
                  onJoinCall={() => setActiveVideoCall(apt)}
                  onMarkStatus={handleMarkStatus}
                  onReviewPatient={(pId) => navigate(`/doctor/review?id=${pId}`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- VIDEO TELECONSULTATION MODAL --- */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-800 shadow-2xl p-6 text-white space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-xs uppercase font-bold text-emerald-400">
                  Live Teleconsultation Channel
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-xs text-slate-300">
                  Encrypted ABDM WebRTC
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {formatCallTimer(videoCallDuration)}
              </span>
            </div>

            {/* Video Canvas Area */}
            <div className="relative h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden group">
              
              {/* Remote Stream Simulation (Patient & ASHA) */}
              {!isVideoMuted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-radial from-slate-900 to-slate-950">
                  <div className="w-24 h-24 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl font-bold font-mono shadow-xl mb-3">
                    {activeVideoCall.patientName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h4 className="text-base font-bold text-white">{activeVideoCall.patientName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sub-Centre Video Node: {activeVideoCall.village}
                  </p>
                  
                  {/* Audio Wave Simulation */}
                  <div className="flex items-center gap-1 mt-4">
                    {[30, 60, 90, 45, 80, 50, 75, 40, 85].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-emerald-500 rounded-full transition-all duration-150"
                        style={{ height: `${(Math.sin(videoCallDuration * 3 + i) * 0.35 + 0.65) * h}%` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <VideoOff size={40} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">Camera Feed Muted</p>
                </div>
              )}

              {/* Local Doctor PIP Preview */}
              <div className="absolute bottom-3 right-3 w-36 h-24 bg-slate-800 rounded-xl border border-slate-700 p-2 flex flex-col justify-between shadow-lg">
                <span className="text-[9px] font-bold uppercase text-slate-400">Dr. S. Roy</span>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono">1080p 30fps</span>
                </div>
              </div>

            </div>

            {/* Quick Clinical Observations Input */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  Category: <strong className="text-white">{activeVideoCall.category}</strong>
                </span>
              </div>
              <button 
                onClick={() => {
                  handleEndVideoCall();
                  navigate(`/doctor/review?id=${activeVideoCall.patientId}`);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Open Clinical Dossier &rarr;
              </button>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isMicMuted 
                    ? "bg-rose-900/60 border-rose-700 text-rose-300" 
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                }`}
                title="Toggle Microphone"
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isVideoMuted 
                    ? "bg-rose-900/60 border-rose-700 text-rose-300" 
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                }`}
                title="Toggle Camera"
              >
                {isVideoMuted ? <VideoOff size={20} /> : <LucideVideo size={20} />}
              </button>

              <button
                type="button"
                onClick={handleEndVideoCall}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <PhoneOff size={18} />
                <span>Disconnect Call</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SCHEDULE FOLLOW-UP MODAL --- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <CalendarCheck size={18} />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Schedule Follow-up Appointment
                </h3>
              </div>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Patient Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mamta Debbarma"
                  value={formPatientName}
                  onChange={(e) => setFormPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ABHA / Patient ID
                  </label>
                  <input 
                    type="text" 
                    placeholder="AV-2026-8921"
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Consultation Type
                  </label>
                  <select 
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="VIDEO">Video Teleconsult</option>
                    <option value="IN_PERSON">In-Person OPD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Day
                  </label>
                  <select 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="TODAY">Today</option>
                    <option value="TOMORROW">Tomorrow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Slot Time
                  </label>
                  <input 
                    type="text" 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <select 
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="30 min">30 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Clinical Reason / Category
                </label>
                <input 
                  type="text" 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <Check size={15} />
                  <span>Confirm Schedule</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// --- APPOINTMENT CARD (OpenSource UI Refined) ---

function AppointmentCard({ appointment, onJoinCall, onMarkStatus, onReviewPatient }) {
  const isCompleted = appointment.status === "COMPLETED";
  const isCancelled = appointment.status === "CANCELLED";
  const isNext = appointment.isNext && !isCompleted && !isCancelled;

  // Determine styling based on status
  let cardStyle = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700";
  let timeStyle = "text-slate-900 dark:text-white";
  
  if (isCompleted) {
    cardStyle = "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80";
    timeStyle = "text-slate-400 dark:text-slate-500";
  } else if (isCancelled) {
    cardStyle = "bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 opacity-75";
    timeStyle = "text-rose-400";
  } else if (isNext) {
    cardStyle = "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/80 shadow-xs ring-1 ring-emerald-500/20";
    timeStyle = "text-emerald-700 dark:text-emerald-400";
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-7 group relative z-10">
      
      {/* Timeline / Time Block */}
      <div className="md:w-[120px] shrink-0 flex md:flex-col items-center md:items-end md:justify-start gap-1 pt-3">
        <span className={`font-mono text-base md:text-lg font-black tracking-tight leading-none ${timeStyle}`}>
          {appointment.time.split(" ")[0]}
        </span>
        <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${isNext ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
          {appointment.time.split(" ")[1]}
        </span>
        
        {/* Timeline Node Dot (Hidden on small screens) */}
        <div className={`hidden md:block absolute left-[88px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950
          ${isCompleted ? "bg-slate-400" : isCancelled ? "bg-rose-400" : isNext ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 animate-pulse" : "bg-slate-400"}
        `} />
      </div>

      {/* Main Card */}
      <div className={`flex-1 flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-2xl border transition-all ${cardStyle}`}>
        
        <div className="flex gap-4">
          
          {/* Animated Icon Badge */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs
            ${appointment.type === "VIDEO" 
              ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400" 
              : "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400"}
            ${isCompleted || isCancelled ? "grayscale opacity-50" : ""}
          `}>
            {appointment.type === "VIDEO" ? (
              <VideoIcon size={22} duration={1} isAnimated={!isCompleted && !isCancelled} />
            ) : (
              <MapPin size={22} />
            )}
          </div>
          
          {/* Patient Details & Clinical Reason */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`text-sm md:text-base font-bold leading-tight ${isCompleted || isCancelled ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                {appointment.patientName}
              </h3>
              <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {appointment.patientId}
              </span>
              {isNext && (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Up Next
                </span>
              )}
            </div>
            
            <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {appointment.category}
            </p>
            
            <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock size={13} /> {appointment.duration}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1">
                {appointment.type === "VIDEO" ? "Video Teleconsultation" : "CHC Room 3, In-Person OPD"}
              </span>
              {appointment.village && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{appointment.village}</span>
                </>
              )}
            </div>

            {appointment.notes && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                &ldquo;{appointment.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
          {!isCompleted && !isCancelled && (
            <>
              {appointment.type === "VIDEO" ? (
                <button 
                  onClick={onJoinCall}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LucideVideo size={14} /> Join Teleconsult
                </button>
              ) : (
                <button 
                  onClick={() => onMarkStatus(appointment.id, "COMPLETED")}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User size={14} /> OPD Check-In
                </button>
              )}

              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <button 
                  onClick={() => onReviewPatient(appointment.patientId)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Open Clinical Dossier"
                >
                  <Stethoscope size={15} />
                </button>
                <button 
                  onClick={() => onMarkStatus(appointment.id, "COMPLETED")}
                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Mark Completed"
                >
                  <CheckCircle2 size={15} />
                </button>
                <button 
                  onClick={() => onMarkStatus(appointment.id, "CANCELLED")}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg hover:text-rose-600 transition-colors cursor-pointer"
                  title="Cancel Slot"
                >
                  <XCircle size={15} />
                </button>
              </div>
            </>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <CheckCircle2 size={13} className="text-emerald-500" /> Completed
            </span>
          )}

          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900">
              <XCircle size={13} /> Cancelled
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
