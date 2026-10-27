import React, { useState } from 'react';
import { 
  User, Lock, Sliders, ShieldCheck, Settings, 
  CheckCircle2, Bell, Building2, Save, FileText, Check
} from 'lucide-react';

export default function DoctorSettingsTab() {
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [saveStatus, setSaveStatus] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Clinician profile state
  const [doctorProfile, setDoctorProfile] = useState(() => {
    try {
      const stored = sessionStorage.getItem("aarogyaVaaniDoctorSession") ||
                     sessionStorage.getItem("aarogyaVaaniUserProfile");
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      name: "Dr. Sandeep Roy",
      workerId: "MO-8841",
      councilReg: "MCI-TR-2018-9941",
      designation: "Medical Officer (General Physician)",
      facility: "Bishalgarh Community Health Centre (CHC)",
      district: "Sepahijala District, Tripura",
      phone: "+91 94361 23456",
      email: "dr.sandeep.roy@tripurahealth.gov.in"
    };
  });

  const handleProfileSave = (e) => {
    if (e) e.preventDefault();
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handlePasswordUpdate = (e) => {
    if (e) e.preventDefault();
    setPasswordUpdated(true);
    setTimeout(() => setPasswordUpdated(false), 3000);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F9FC] p-6 lg:p-8 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 custom-scrollbar">
      {/* --- INJECT FONTS & ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        .font-sans { font-family: 'Inter', -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Settings size={24} className="stroke-[2.5]" />
              <h1 className="text-2xl font-bold tracking-tight">Clinician & Portal Settings</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Configure medical credentials, digital signature security, and system display preferences.
            </p>
          </div>
        </header>

        {/* SETTINGS CARD CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          
          {/* Left Tab Navigation */}
          <div className="md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-slate-200/80 p-4 space-y-1.5 bg-slate-50/50">
            <TabButton 
              icon={User} 
              label="Clinician Profile" 
              id="PROFILE" 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
            <TabButton 
              icon={Lock} 
              label="Account & Security" 
              id="SECURITY" 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
            <TabButton 
              icon={Sliders} 
              label="System & Display" 
              id="SYSTEM" 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
            <TabButton 
              icon={ShieldCheck} 
              label="ABDM & Telemetry" 
              id="ABDM" 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>

          {/* Right Tab Content */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Clinician Profile</h2>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Registered medical practitioner information reflected on digitally-signed e-prescriptions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <InputField 
                      label="Doctor Full Name" 
                      defaultValue={doctorProfile.name || "Dr. Sandeep Roy"} 
                      placeholder="e.g. Dr. Sandeep Roy" 
                    />
                    <InputField 
                      label="Medical Council Reg. No." 
                      defaultValue={doctorProfile.councilReg || "MCI-TR-2018-9941"} 
                      placeholder="e.g. MCI-TR-2018-9941" 
                    />
                    <InputField 
                      label="Designation / Specialty" 
                      defaultValue={doctorProfile.designation || "Medical Officer (General Physician)"} 
                      placeholder="e.g. Medical Officer" 
                    />
                    <InputField 
                      label="Official Worker ID" 
                      defaultValue={doctorProfile.workerId || "MO-8841"} 
                      placeholder="e.g. MO-8841" 
                    />
                    <InputField 
                      label="Primary Health Centre (PHC/CHC)" 
                      defaultValue={doctorProfile.facility || "Bishalgarh Community Health Centre (CHC)"} 
                      placeholder="e.g. Bishalgarh CHC" 
                    />
                    <InputField 
                      label="District / Health Circle" 
                      defaultValue={doctorProfile.district || "Sepahijala District, Tripura"} 
                      placeholder="e.g. Sepahijala District" 
                    />
                    <InputField 
                      label="Registered Mobile Number" 
                      defaultValue={doctorProfile.phone || "+91 94361 23456"} 
                      placeholder="+91 xxxxx xxxxx" 
                    />
                    <InputField 
                      label="Official Email (Health Dept.)" 
                      defaultValue={doctorProfile.email || "dr.sandeep.roy@tripurahealth.gov.in"} 
                      placeholder="dr.name@tripurahealth.gov.in" 
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={handleProfileSave}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                    {saveStatus && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                        <Check size={14} /> Profile details successfully updated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'SECURITY' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Account & Security</h2>
                  <p className="text-sm text-slate-500 font-medium mb-6">Manage your password and digital signature credentials.</p>

                  <div className="space-y-5 mb-8 max-w-md">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Change Password</h3>
                    <InputField label="Current Password" type="password" placeholder="••••••••" />
                    <InputField label="New Password" type="password" placeholder="••••••••" />
                    <InputField label="Confirm New Password" type="password" placeholder="••••••••" />
                    <div className="flex items-center gap-3 pt-1">
                      <button 
                        onClick={handlePasswordUpdate}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-sm active:scale-98"
                      >
                        Update Password
                      </button>
                      {passwordUpdated && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                          <Check size={14} /> Password updated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100"></div>

                  <div className="pt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Advanced Security</h3>
                    <ToggleOption 
                      title="Two-Factor Authentication (2FA)" 
                      description="Require a 6-digit OTP sent to your registered phone number when logging in from a new device." 
                      defaultChecked={true} 
                    />
                    <ToggleOption 
                      title="Biometric Digital Signature" 
                      description="Use fingerprint or face ID to authorize and sign e-prescriptions." 
                      defaultChecked={false} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- SYSTEM TAB --- */}
            {activeTab === 'SYSTEM' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">System & Display</h2>
                  <p className="text-sm text-slate-500 font-medium mb-6">Customize the interface appearance and default behaviors.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mb-8">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Application Theme</label>
                      <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer shadow-sm">
                        <option value="light">Light Mode (Default)</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">Sync with System</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Clinical Language</label>
                      <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer shadow-sm">
                        <option value="en">English (EN)</option>
                        <option value="bn">Bengali (BN)</option>
                        <option value="kb">Kokborok (KB)</option>
                        <option value="hi">Hindi (HI)</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100"></div>

                  <div className="pt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Clinical Sound & Triage Alerts</h3>
                    <ToggleOption 
                      title="Audible Siren on Critical Red Flags" 
                      description="Automatically sound an audio alarm when an emergency preeclampsia or hypoxia triage case arrives." 
                      defaultChecked={true} 
                    />
                    <ToggleOption 
                      title="Low Bandwidth Offline Caching" 
                      description="Save patient queue dossiers locally in browser storage when rural network cuts out." 
                      defaultChecked={true} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- ABDM TAB --- */}
            {activeTab === 'ABDM' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">ABDM Health Facility Node</h2>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Ayushman Bharat Digital Mission (ABDM) sandbox credentials and FHIR R4 interoperability gateway.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 max-w-2xl">
                    <InputField 
                      label="Health Facility Registry ID (HFR)" 
                      defaultValue="HFR-TR-SEP-004291" 
                      placeholder="e.g. HFR-TR-..." 
                    />
                    <InputField 
                      label="Doctor Healthcare Professional ID (HPID)" 
                      defaultValue="91-4432-8871-0021" 
                      placeholder="e.g. 91-xxxx-xxxx-xxxx" 
                    />
                    <InputField 
                      label="ABDM Client ID (M2 Node)" 
                      defaultValue="SBX_TRIPURA_PHC_NODE_01" 
                      placeholder="Client ID" 
                    />
                    <InputField 
                      label="Gateway Endpoint" 
                      defaultValue="https://dev.abdm.gov.in/gateway/v0.5" 
                      placeholder="https://dev.abdm.gov.in/..." 
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-800 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      ABDM Gateway Connected (Milestone 1, 2 & 3 Certified)
                    </div>
                    <p className="text-slate-600">
                      e-Prescriptions and clinical summaries are automatically formatted as FHIR R4 JSON bundles.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ icon: Icon, label, id, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${
        isActive 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
      {label}
    </button>
  );
}

function InputField({ label, defaultValue, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors placeholder:text-slate-400"
      />
    </div>
  );
}

function ToggleOption({ title, description, defaultChecked }) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <div 
      className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:border-slate-200 transition-all cursor-pointer" 
      onClick={() => setIsChecked(!isChecked)}
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">{description}</p>
      </div>
      
      {/* Custom Tailwind Toggle */}
      <button 
        type="button"
        aria-label={title}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
