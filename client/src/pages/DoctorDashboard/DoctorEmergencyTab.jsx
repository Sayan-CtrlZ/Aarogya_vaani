import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Phone, Activity, Clock, 
  ArrowRight, ShieldAlert, PhoneCall, Stethoscope, CheckCircle2,
  Search, MapPin, User, Siren, X, Check
} from 'lucide-react';
import { getAllPatients } from '../../utils/patientStore';
import { callSounds } from '../../utils/callSounds';

// --- MOCK EMERGENCY DATA PROVIDED BY USER ---
const DEFAULT_EMERGENCY_CASES = [
  {
    id: 'AV-2026-2103',
    name: 'Sunita Das',
    age: 29,
    gender: 'F',
    location: 'Bishalgarh CHC, Ward 2',
    asha: 'Rina Das (+91 98765 43210)',
    level: 'CRITICAL',
    timeElapsed: '12 mins ago',
    trigger: 'Severe Hypertensive Crisis (Suspected Preeclampsia)',
    description: 'Patient is Postnatal Day 12. Sudden onset of high BP, severe headache, and visual disturbances reported by ASHA.',
    vitals: [
      { label: 'BP', value: '160/110', unit: 'mmHg', isAbnormal: true },
      { label: 'PULSE', value: '98', unit: 'bpm', isAbnormal: false },
      { label: 'SPO2', value: '97', unit: '%', isAbnormal: false }
    ],
    status: 'AWAITING_INTERVENTION'
  },
  {
    id: 'AV-2026-7788',
    name: 'Deepak Das',
    age: 48,
    gender: 'M',
    location: 'Sepahijala Village (Field)',
    asha: 'Mamta Roy (+91 87654 32109)',
    level: 'CRITICAL',
    timeElapsed: '4 mins ago',
    trigger: 'Hypoxia & Severe Dyspnea',
    description: 'Sudden breathlessness radiating to left chest. SpO2 dropping rapidly. Patient is currently in field location.',
    vitals: [
      { label: 'SPO2', value: '86', unit: '%', isAbnormal: true },
      { label: 'PULSE', value: '112', unit: 'bpm', isAbnormal: true },
      { label: 'BP', value: '145/90', unit: 'mmHg', isAbnormal: false }
    ],
    status: 'AWAITING_INTERVENTION'
  },
  {
    id: 'AV-2026-9902',
    name: 'Pritam Saha',
    age: 31,
    gender: 'M',
    location: 'Takarjala PHC',
    asha: 'Anita Debbarma (+91 76543 21098)',
    level: 'URGENT',
    timeElapsed: '28 mins ago',
    trigger: 'Acute Asthma Exacerbation',
    description: 'Severe wheezing and nocturnal cough exacerbated by recent weather changes. Unresponsive to initial inhaler dose.',
    vitals: [
      { label: 'SPO2', value: '92', unit: '%', isAbnormal: true },
      { label: 'PULSE', value: '105', unit: 'bpm', isAbnormal: true },
      { label: 'RESP', value: '28', unit: 'bpm', isAbnormal: true }
    ],
    status: 'WATCH'
  }
];

export default function DoctorEmergencyTab() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState(DEFAULT_EMERGENCY_CASES);
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState({});
  const [activeCallingPatient, setActiveCallingPatient] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Sync any real critical red-flag patients from patientStore
  useEffect(() => {
    try {
      const storedPatients = getAllPatients();
      const redFlags = storedPatients.filter(
        p => p.triage === 'Critical Red Flag' || p.status === 'Urgent' || p.category === 'Emergency'
      );
      if (redFlags.length > 0) {
        // Merge without duplicating existing IDs
        const existingIds = new Set(DEFAULT_EMERGENCY_CASES.map(c => c.id.toUpperCase()));
        const additional = [];
        redFlags.forEach(rf => {
          const id = (rf.id || rf.patient_ref || '').toUpperCase();
          if (id && !existingIds.has(id)) {
            additional.push({
              id: rf.id || rf.patient_ref,
              name: rf.name,
              age: rf.age || 27,
              gender: (rf.gender || 'F').charAt(0).toUpperCase(),
              location: `${rf.village || rf.district || 'Bishalgarh CHC'}, Tripura`,
              asha: 'Local ASHA Worker (+91 94361 55981)',
              level: 'CRITICAL',
              timeElapsed: 'Just now',
              trigger: rf.chiefComplaint || 'Emergency Triaged Case',
              description: rf.notes || rf.chiefComplaint || 'High risk clinical presentation triaged by voice intake.',
              vitals: [
                { label: 'BP', value: rf.vitals?.bp || '150/95', unit: 'mmHg', isAbnormal: true },
                { label: 'PULSE', value: rf.vitals?.pulse || '102', unit: 'bpm', isAbnormal: true },
                { label: 'SPO2', value: rf.vitals?.spo2 || '94%', unit: '%', isAbnormal: false }
              ],
              status: 'AWAITING_INTERVENTION'
            });
          }
        });
        if (additional.length > 0) {
          setCases([...DEFAULT_EMERGENCY_CASES, ...additional]);
        }
      }
    } catch {
      // fallback to default mock cases
    }
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer;
    if (activeCallingPatient) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCallingPatient]);

  const handleCallAsha = (patient) => {
    setActiveCallingPatient(patient);
    try {
      callSounds?.playRingtone?.();
    } catch {
      // sound fallback
    }
  };

  const handleEndCall = () => {
    try {
      callSounds?.stopRingtone?.();
    } catch {
      // sound fallback
    }
    setActiveCallingPatient(null);
  };

  const handleDispatchAmbulance = (patientId) => {
    setDispatchedAmbulances(prev => ({
      ...prev,
      [patientId]: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicleNumber: `TR-01-AMB-${Math.floor(1000 + Math.random() * 9000)}`
      }
    }));
  };

  const handleReviewCase = (patientId) => {
    navigate(`/doctor/review?id=${patientId}`);
  };

  const filteredCases = cases.filter(c => {
    const matchesFilter = filter === 'ALL' || c.level === filter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.trigger.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = cases.filter(c => c.level === 'CRITICAL').length;
  const urgentCount = cases.filter(c => c.level === 'URGENT').length;

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F9FC] p-6 lg:p-8 font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-900 custom-scrollbar">
      {/* --- INJECT FONTS & ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        .font-sans { font-family: 'Inter', -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes pulse-ring-rose {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(225, 29, 72, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }
        .animate-pulse-rose { animation: pulse-ring-rose 2s infinite; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <Siren size={24} className="stroke-[2.5]" />
              <h1 className="text-2xl font-bold tracking-tight">Emergency & Critical Triage</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">Real-time monitoring of red-flag cases and automated alerts.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse-rose"></div>
              <span className="text-sm font-bold text-slate-700">{criticalCount} Critical Active</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-sm font-bold text-slate-700">{urgentCount} Urgent Watch</span>
            </div>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          
          {/* Flat Segmented Control for Tabs */}
          <div className="flex w-full md:w-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {['ALL', 'CRITICAL', 'URGENT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  filter === tab 
                    ? (tab === 'CRITICAL' ? 'bg-white text-rose-700 shadow-sm border border-slate-200/50' 
                      : tab === 'URGENT' ? 'bg-white text-amber-700 shadow-sm border border-slate-200/50' 
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200/50')
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab === 'ALL' ? 'All Flagged' : tab === 'CRITICAL' ? 'Critical (Red Flags)' : 'Urgent (Watch)'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search ID, name, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAFAFA] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* EMERGENCY LIST */}
        <div className="space-y-5">
          {filteredCases.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No active emergencies</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm">
                The triage queue is clear. No patients match your current filter criteria.
              </p>
            </div>
          ) : (
            filteredCases.map(patient => (
              <EmergencyCard 
                key={patient.id} 
                patient={patient} 
                dispatchedInfo={dispatchedAmbulances[patient.id]}
                onCallAsha={() => handleCallAsha(patient)}
                onDispatchAmbulance={() => handleDispatchAmbulance(patient.id)}
                onReviewCase={() => handleReviewCase(patient.id)}
              />
            ))
          )}
        </div>

      </div>

      {/* ACTIVE CALL MODAL */}
      {activeCallingPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
              <PhoneCall size={32} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Connected Secure Line
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3">{activeCallingPatient.asha}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Patient: {activeCallingPatient.name} ({activeCallingPatient.id})</p>
              <p className="text-xs font-mono font-semibold text-slate-400 mt-2">
                Call Duration: {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/70 text-xs space-y-1.5">
              <p className="font-bold text-slate-700">Immediate Instructions for ASHA:</p>
              <p className="text-slate-600">• Keep patient in left lateral position.</p>
              <p className="text-slate-600">• Monitor SpO2 and Blood Pressure every 5 mins.</p>
              <p className="text-slate-600">• Keep oral airway clear. Do not administer oral fluids if drowsy.</p>
            </div>
            <button
              onClick={handleEndCall}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
            >
              End Emergency Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function EmergencyCard({ patient, dispatchedInfo, onCallAsha, onDispatchAmbulance, onReviewCase }) {
  const isCritical = patient.level === 'CRITICAL';
  
  const theme = isCritical ? {
    accent: 'bg-rose-500',
    border: 'border-rose-200',
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    icon: <ShieldAlert size={16} className="text-rose-600" />
  } : {
    accent: 'bg-amber-500',
    border: 'border-amber-200',
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    icon: <AlertTriangle size={16} className="text-amber-600" />
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 transition-colors group shadow-sm">
      
      {/* Top Status Bar */}
      <div className={`px-5 py-2.5 flex items-center justify-between border-b ${theme.border} ${theme.bg}`}>
        <div className="flex items-center gap-2">
          {theme.icon}
          <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
            {patient.level} Triage Alert
          </span>
        </div>
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400" /> {patient.timeElapsed}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Col 1: Identity & Location (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1.5">{patient.name}</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {patient.id}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {patient.age}y · {patient.gender}
              </span>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{patient.location}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <User size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">ASHA: {patient.asha}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Clinical Trigger (Span 4) */}
        <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Automated AI Flag</h3>
          <div className="flex flex-col gap-2">
            <h4 className={`text-base font-bold ${theme.text} leading-snug`}>{patient.trigger}</h4>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {patient.description}
            </p>
          </div>
        </div>

        {/* Col 3: Vitals Snapshot (Span 4) */}
        <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Activity size={14} /> Live Vitals
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {patient.vitals.map((vital, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${vital.isAbnormal ? 'bg-rose-50 border-rose-200' : 'bg-[#FAFAFA] border-slate-200'} flex flex-col`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${vital.isAbnormal ? 'text-rose-600' : 'text-slate-500'}`}>
                  {vital.label}
                </span>
                <div className="flex items-baseline gap-1 mt-auto">
                  <span className={`font-mono text-xl font-bold tracking-tight ${vital.isAbnormal ? 'text-rose-700' : 'text-slate-900'}`}>
                    {vital.value}
                  </span>
                  <span className={`font-mono text-[10px] font-medium ${vital.isAbnormal ? 'text-rose-500' : 'text-slate-400'}`}>
                    {vital.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dispatched alert banner if active */}
      {dispatchedInfo && (
        <div className="mx-6 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <Check size={16} className="text-emerald-600" />
            108 Ambulance Dispatched ({dispatchedInfo.vehicleNumber}) at {dispatchedInfo.timestamp}
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
            GPS Live Tracking Active
          </span>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-6 py-4 bg-[#FAFAFA] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button 
          onClick={onCallAsha}
          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
        >
          <PhoneCall size={16} /> Call ASHA
        </button>
        
        {isCritical && (
          <button 
            onClick={onDispatchAmbulance}
            disabled={!!dispatchedInfo}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              dispatchedInfo
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 shadow-sm active:scale-98'
            }`}
          >
            <Siren size={16} /> {dispatchedInfo ? 'Ambulance Dispatched' : 'Dispatch 108 Ambulance'}
          </button>
        )}
        
        <button 
          onClick={onReviewCase}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
        >
          <Stethoscope size={16} /> Review Case <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
