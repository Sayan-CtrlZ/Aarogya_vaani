import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Plus,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getCurrentPatient, getPatientDocuments, addPatientDocument } from "../../utils/patientStore";
import { fetchPatientDocuments, uploadMedicalDocument } from "../../services/api";
import UniversalNavbar from "../../components/UniversalNavbar";

export default function PatientDocumentsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [patient] = useState(() => getCurrentPatient());

  const [documents, setDocuments] = useState(() => getPatientDocuments(patient.id));
  const [uploadCategory, setUploadCategory] = useState("Prescription");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFacility, setUploadFacility] = useState("Community Health Centre");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [activeLangTab, setActiveLangTab] = useState("bn"); // bn, hi, en

  const normalizedPatientId =
    patient?.patient_ref ||
    (patient?.id?.startsWith("AV-") && patient.id.length === 7
      ? `AV-2026-${patient.id.slice(3)}`
      : (patient?.id || "AV-2026-8921"));

  // Load cloud documents from Supabase on mount
  useEffect(() => {
    fetchPatientDocuments(normalizedPatientId)
      .then((cloudDocs) => {
        if (Array.isArray(cloudDocs) && cloudDocs.length > 0) {
          const formattedCloudDocs = cloudDocs.map((cd) => ({
            id: cd.id,
            patientId: cd.patient_id,
            title: cd.title || cd.file_name || "Medical Document",
            fileName: cd.file_name || "document.pdf",
            category: cd.category || "Prescription",
            facility: cd.facility || "Community Health Centre",
            date: cd.visit_date || (cd.created_at ? cd.created_at.split("T")[0] : "Recent"),
            fileSize: "Cloud Vault",
            verified: true,
            signed_url: cd.signed_url || cd.file_url,
            summary_en: cd.summary_en || cd.patient_summary?.english || "",
            summary_bn: cd.summary_bn || cd.patient_summary?.bengali || "",
            summary_hi: cd.summary_hi || cd.patient_summary?.hindi || "",
            structured_data: cd.structured_data,
          }));
          setDocuments(formattedCloudDocs);
        }
      })
      .catch((err) => console.warn("Using local document cache fallback:", err));
  }, [normalizedPatientId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      if (selectedFile) {
        // Upload to Supabase Medical Drive + Gemini Analysis
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("patient_id", normalizedPatientId);
        formData.append("category", uploadCategory);
        formData.append("title", uploadTitle.trim());
        formData.append("facility", uploadFacility);

        const result = await uploadMedicalDocument(formData);
        const newCloudDoc = {
          id: result.id || `doc_${Date.now()}`,
          patientId: normalizedPatientId,
          title: result.title || uploadTitle.trim(),
          fileName: result.file_name || selectedFile.name,
          category: result.category || uploadCategory,
          facility: result.facility || uploadFacility,
          date: result.visit_date || new Date().toISOString().split("T")[0],
          fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          verified: true,
          signed_url: result.signed_url || result.file_url,
          summary_en: result.summary_en || result.patient_summary?.english || "",
          summary_bn: result.summary_bn || result.patient_summary?.bengali || "",
          summary_hi: result.summary_hi || result.patient_summary?.hindi || "",
          structured_data: result.structured_data,
        };

        setDocuments((prev) => [newCloudDoc, ...prev]);
      } else {
        // Fallback if no file is selected
        const newDoc = addPatientDocument({
          patientId: patient.id,
          title: uploadTitle.trim(),
          fileName: uploadFileName || `${uploadTitle.trim().replace(/\s+/g, "_")}.pdf`,
          category: uploadCategory,
          facility: uploadFacility,
          fileSize: "1.2 MB",
          verified: true,
        });
        setDocuments((prev) => [newDoc, ...prev]);
      }

      setUploadTitle("");
      setUploadFileName("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Failed to upload document to secure vault. Please check file format and server connection.");
      setTimeout(() => setUploadError(null), 6000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <UniversalNavbar showBack backPath="/patient" />

      {/* 3. Main Content Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Document Upload Form */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Upload New Medical Document
                </h2>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Add scanned prescriptions, hospital discharge slips, or diagnostic reports
                </span>
              </div>
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-bold animate-fade-in shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Document uploaded and verified in your secure vault.</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2 font-bold animate-fade-in shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600"
                >
                  <option value="Prescription">Doctor Prescription</option>
                  <option value="Lab Report">Lab / Blood Report</option>
                  <option value="Immunization & ANC">Immunization & MCP Card</option>
                  <option value="Medical Scan / X-Ray">Medical Scan / X-Ray</option>
                  <option value="Discharge Summary">Hospital Discharge Slip</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                  Issuing Facility
                </label>
                <input
                  type="text"
                  value={uploadFacility}
                  onChange={(e) => setUploadFacility(e.target.value)}
                  placeholder="e.g. Community Health Centre"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. CBC Blood Count & Platelet Report"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600"
              />
            </div>

            {/* Real File Input & Drag & Drop Zone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl bg-purple-50/40 text-center transition-colors cursor-pointer group"
            >
              <Upload className="w-8 h-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2 transition-colors" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-black text-purple-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Selected: {selectedFile.name}</span>
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze & store
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-purple-950">
                    Click to browse or drop medical files here
                  </p>
                  <span className="text-[10px] text-purple-700/80 mt-1 block">
                    Supports PDF, JPG, PNG up to 15MB (Stored in Supabase Cloud Vault)
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading || !uploadTitle.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>{isUploading ? "Analyzing with AI & Storing in Vault..." : "Upload to Medical Drive"}</span>
            </button>
          </form>
        </section>

        {/* Uploaded Documents Library */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <span>Verified Documents Vault (Supabase Drive)</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {documents.length} Files Stored
            </span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col gap-3 hover:border-purple-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
                        <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                          {doc.category}
                        </span>
                        <span>•</span>
                        <span>{doc.facility}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>

                    {doc.signed_url ? (
                      <a
                        href={doc.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200"
                        title="View Original Evidence in Secure Vault"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Evidence</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Document: ${doc.fileName}`)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-colors cursor-pointer"
                        title="Stored record"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Multilingual AI Intelligence Summary */}
                {(doc.summary_bn || doc.summary_hi || doc.summary_en) && (
                  <div className="mt-1 pt-2.5 border-t border-slate-100 bg-slate-50/70 rounded-xl p-3 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-purple-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Document Summary</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {doc.summary_bn && (
                          <button
                            type="button"
                            onClick={() => setActiveLangTab("bn")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLangTab === "bn" ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-700"}`}
                          >
                            বাংলা
                          </button>
                        )}
                        {doc.summary_hi && (
                          <button
                            type="button"
                            onClick={() => setActiveLangTab("hi")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLangTab === "hi" ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-700"}`}
                          >
                            हिंदी
                          </button>
                        )}
                        {doc.summary_en && (
                          <button
                            type="button"
                            onClick={() => setActiveLangTab("en")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLangTab === "en" ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-700"}`}
                          >
                            English
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-800 leading-relaxed font-medium">
                      {activeLangTab === "bn" && (doc.summary_bn || doc.summary_en)}
                      {activeLangTab === "hi" && (doc.summary_hi || doc.summary_en)}
                      {activeLangTab === "en" && (doc.summary_en || doc.summary_bn)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
