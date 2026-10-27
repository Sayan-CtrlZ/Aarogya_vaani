import React, { useState } from 'react';
import { 
  Search, Filter, FolderOpen, FileText, Image as ImageIcon, 
  Microscope, Baby, Download, Eye, X, Calendar, User, Clock, CheckCircle2
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_RECORDS = [
  {
    id: 'REC-2026-9921',
    title: 'Complete Blood Count (CBC) & HbA1c',
    type: 'LAB',
    patientName: 'Mamta Debbarma',
    patientId: 'AV-2026-8921',
    date: '25 Oct 2026',
    time: '09:30 AM',
    size: '1.2 MB',
    format: 'PDF',
    status: 'VERIFIED',
    uploadedBy: 'Bishalgarh CHC Path Lab'
  },
  {
    id: 'REC-2026-9882',
    title: 'Obstetric Ultrasound (Level 2)',
    type: 'SCAN',
    patientName: 'Mamta Debbarma',
    patientId: 'AV-2026-8921',
    date: '12 Oct 2026',
    time: '11:15 AM',
    size: '4.5 MB',
    format: 'DICOM / JPG',
    status: 'VERIFIED',
    uploadedBy: 'Dr. A. Sen (Radiology)'
  },
  {
    id: 'REC-2026-9710',
    title: 'Mother & Child Protection (MCP) Card',
    type: 'MCP',
    patientName: 'Sunita Das',
    patientId: 'AV-2026-2103',
    date: '20 Oct 2026',
    time: '02:40 PM',
    size: '3.1 MB',
    format: 'PDF',
    status: 'VERIFIED',
    uploadedBy: 'ASHA Rina Das'
  },
  {
    id: 'REC-2026-9655',
    title: 'Discharge Summary - Postnatal',
    type: 'RX',
    patientName: 'Sunita Das',
    patientId: 'AV-2026-2103',
    date: '15 Oct 2026',
    time: '10:00 AM',
    size: '0.8 MB',
    format: 'PDF',
    status: 'VERIFIED',
    uploadedBy: 'Dr. S. Roy'
  },
  {
    id: 'REC-2026-9540',
    title: 'Lipid Profile & Renal Panel',
    type: 'LAB',
    patientName: 'Hare Krishna',
    patientId: 'AV-2026-7316',
    date: '18 Oct 2026',
    time: '08:20 AM',
    size: '1.5 MB',
    format: 'PDF',
    status: 'VERIFIED',
    uploadedBy: 'Agartala Govt Medical College'
  },
  {
    id: 'REC-2026-9432',
    title: 'Chest X-Ray (PA View)',
    type: 'SCAN',
    patientName: 'Pritam Saha',
    patientId: 'AV-2026-9902',
    date: '05 Oct 2026',
    time: '04:10 PM',
    size: '6.2 MB',
    format: 'JPG',
    status: 'VERIFIED',
    uploadedBy: 'Sepahijala District Hospital'
  }
];

export default function DoctorRecordsVaultTab() {
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, LAB, SCAN, RX, MCP
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Filtering Logic
  const filteredRecords = MOCK_RECORDS.filter(record => {
    const matchesFilter = activeFilter === 'ALL' || record.type === activeFilter;
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-8 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Font Injections & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FolderOpen size={24} className="text-emerald-600" /> Records Vault
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Access, search, and review synchronized patient health records (EHR).</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-sm font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>ABDM Sync Active</span>
          </div>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Animated Tabs */}
          <div className="flex w-full lg:w-auto overflow-x-auto custom-scrollbar bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'LAB', label: 'Lab Reports' },
              { id: 'SCAN', label: 'Imaging & Scans' },
              { id: 'RX', label: 'Clinical Notes & Rx' },
              { id: 'MCP', label: 'MCP Cards' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeFilter === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search documents, patients, or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* --- DOCUMENT GRID --- */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No records found</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm">
              We couldn't find any documents matching your current filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filteredRecords.map((record) => (
              <RecordCard 
                key={record.id} 
                record={record} 
                onView={() => setPreviewDoc(record)} 
              />
            ))}
          </div>
        )}

      </div>

      {/* --- PREVIEW MODAL --- */}
      {previewDoc && (
        <DocumentPreviewModal 
          record={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function RecordCard({ record, onView }) {
  // Theme assignments based on document type
  const typeConfig = {
    LAB: { icon: Microscope, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Lab Report' },
    SCAN: { icon: ImageIcon, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Imaging' },
    RX: { icon: FileText, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Clinical Rx' },
    MCP: { icon: Baby, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'MCP Card' },
  };

  const config = typeConfig[record.type] || typeConfig.RX;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:border-slate-300 transition-colors group">
      
      {/* Top Row: Icon & Date */}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${config.bg} ${config.text} ${config.border}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar size={12} /> {record.date}
          </span>
          <span className="font-mono text-[10px] font-medium text-slate-400 mt-0.5">
            {record.time}
          </span>
        </div>
      </div>

      {/* Middle Row: Details */}
      <div className="flex-1 mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
          </span>
          <span className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
            {record.format} • {record.size}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 line-clamp-2" title={record.title}>
          {record.title}
        </h3>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <User size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-700">{record.patientName}</span>
            <span className="font-mono text-xs text-slate-500 ml-auto bg-slate-50 px-1.5 rounded">{record.patientId}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 truncate pr-2">
          By: {record.uploadedBy}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Download">
            <Download size={16} />
          </button>
          <button 
            onClick={onView}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-bold rounded-lg transition-colors"
          >
            <Eye size={16} /> View
          </button>
        </div>
      </div>

    </div>
  );
}

function DocumentPreviewModal({ record, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#FAFAFA] rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden max-h-full animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{record.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
              <span className="font-semibold text-slate-700">{record.patientName}</span>
              <span className="font-mono text-slate-400 bg-slate-50 px-1.5 rounded border border-slate-100">{record.patientId}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar size={12}/> {record.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
              <Download size={14} /> Download {record.format}
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <button 
              onClick={onClose}
              className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body (Placeholder for actual document renderer) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
          
          {/* Simulated Document Paper */}
          <div className="w-full max-w-2xl bg-white border border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-100">
              {record.type === 'SCAN' ? <ImageIcon size={40} /> : <FileText size={40} />}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Secure Document Viewer</p>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm mx-auto">
                In a production environment, this area will securely render the requested {record.format} file using a DICOM or PDF viewing library.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
              <span className="font-mono flex items-center gap-1.5">
                ID: {record.id}
              </span>
              <span className="flex items-center gap-1.5 mt-2 sm:mt-0">
                <CheckCircle2 size={14} className="text-emerald-500" /> ABDM Verified Origin
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}