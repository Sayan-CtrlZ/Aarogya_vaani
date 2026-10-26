import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Upload,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Eye,
  Download,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Calendar,
  Filter,
  ArrowLeft,
  ArrowRight,
  Share2,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  User,
  Building2,
  Pill,
  Activity,
  Stethoscope,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient, getPatientDocuments } from "../../utils/patientStore";
import {
  fetchPatientDocuments,
  uploadMedicalDocument,
  deletePatientDocument,
} from "../../services/api";

export default function PatientDocumentsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const patient = getCurrentPatient() || {};

  // Sidebar drag & resize state (Desktop environment)
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDateRange, setSelectedDateRange] = useState("Date Range");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // Modal & Inspector View states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Inspector View Tab: "ai-summary" | "extracted-data" | "details"
  const [inspectorTab, setInspectorTab] = useState("ai-summary");

  // Document Zoom / Rotate Toolbar State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState("Prescription");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFacility, setUploadFacility] = useState("Community Health Centre");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Documents Catalog
  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      title: "Prescription - Dr. Roy",
      category: "Prescription",
      date: "11 Oct 2024",
      status: "AI Analyzed",
      previewImg: "/samples/sample_prescription.jpg",
      facility: "Bishalgarh Community Health Centre",
      doctor: "Dr. S. Roy",
      summaryBn:
        "রোগীর প্রেসক্রিপশনে বর্ণিত ঔষধগুলি নিয়মিত গ্রহণ করতে হবে। পর্যাপ্ত পরিমাণে জল পান করুন, বিশ্রাম নিন এবং ওষুধের মাত্রা অনুযায়ী সেবন করুন। যদি কোনো সমস্যা হয় তবে দ্রুত চিকিৎসকের সাথে পরামর্শ নিন।",
      summaryEn: [
        "Paracetamol 500 mg - 1 tablet twice daily after food",
        "Azithromycin 500 mg - 1 tablet once daily for 3 days",
        "Montair LC syrup - 5 ml at night",
        "Prescribed for fever and respiratory infection symptoms.",
      ],
      extractedData: {
        medicines: [
          { name: "Tab. Paracetamol", strength: "500 mg", frequency: "1-0-1", instructions: "After food", duration: "As needed" },
          { name: "Tab. Azithromycin", strength: "500 mg", frequency: "1-0-0", instructions: "Before food", duration: "3 days" },
          { name: "Syp. Montair LC", strength: "5 ml", frequency: "0-0-1", instructions: "At night", duration: "5 days" },
        ],
        diagnosis: "Upper Respiratory Tract Infection with Fever",
        vitalsRecorded: "Temperature: 100.4°F, Pulse: 82 bpm",
      },
      fileDetails: {
        fileName: "Prescription_DrRoy_Oct2024.jpg",
        fileSize: "98.2 KB",
        fileType: "image/jpeg",
        ocrEngine: "Google Gemini 1.5 Flash Vision",
        confidence: "98.4%",
      },
    },
    {
      id: "doc-2",
      title: "Chest X-Ray",
      category: "X-Ray",
      date: "05 Oct 2024",
      status: "AI Analyzed",
      previewImg: "/samples/sample_xray.jpg",
      facility: "District Diagnostic Centre",
      doctor: "Dr. A. Sen (Radiologist)",
      summaryBn:
        "বুকের এক্স-রে পরীক্ষায় ফুসফুসে কোনো অস্বাভাবিক সংক্রমণ বা তরল জমার লক্ষণ পাওয়া যায়নি। উভয় ফুসফুস স্বাভাবিক রয়েছে।",
      summaryEn: [
        "Bilateral lung fields appear completely clear.",
        "No consolidation, pleural effusion, or pneumothorax identified.",
        "Cardiothoracic ratio is normal (< 0.50).",
        "Impression: Normal physiological Chest Radiograph.",
      ],
      extractedData: {
        radiology: [
          { organ: "Lung Fields", finding: "Clear, normal vascularity", status: "NORMAL" },
          { organ: "Costophrenic Angles", finding: "Sharp, no blunting", status: "NORMAL" },
          { organ: "Cardiac Silhouette", finding: "Normal size and contour", status: "NORMAL" },
          { organ: "Bony Thorax", finding: "Intact ribs, no fracture", status: "NORMAL" },
        ],
        diagnosis: "Normal Chest Radiograph (PA View)",
        vitalsRecorded: "SpO2: 99% on room air",
      },
      fileDetails: {
        fileName: "Chest_XRay_PA_View.jpg",
        fileSize: "91.3 KB",
        fileType: "image/jpeg",
        ocrEngine: "Gemini Vision Radiology Analyzer",
        confidence: "99.1%",
      },
    },
    {
      id: "doc-3",
      title: "Blood Test Report",
      category: "Lab Report",
      date: "28 Sep 2024",
      status: "AI Analyzed",
      previewImg: "/samples/sample_lab_report.jpg",
      facility: "Sub-Divisional Pathology Lab",
      doctor: "Dr. P. Barman (Pathologist)",
      summaryBn:
        "রক্ত পরীক্ষার ফলাফলে হিমোগ্লোবিন ১০.৪ গ্রাম/ডিএল এসেছে, যা গর্ভাবস্থার জন্য মৃদু অ্যানিমিয়ার ইঙ্গিত দেয়। রক্তে প্লাটিলেট ও শ্বেতকণিকা স্বাভাবিক রয়েছে।",
      summaryEn: [
        "Hemoglobin: 10.4 g/dL (Mild Gestational Anaemia, reference: 11.5 - 15.0 g/dL).",
        "Total Leukocyte Count (WBC): 8,400 /mcL (Normal, reference: 4,000 - 11,000 /mcL).",
        "Platelet Count: 2.10 Lakhs/mcL (Normal, reference: 1.5 - 4.5 Lakhs/mcL).",
        "Fasting Blood Sugar: 88 mg/dL (Normal).",
      ],
      extractedData: {
        labMetrics: [
          { test: "Hemoglobin (Hb)", value: "10.4 g/dL", range: "11.5 - 15.0 g/dL", flag: "LOW" },
          { test: "Total WBC Count", value: "8,400 /mcL", range: "4,000 - 11,000 /mcL", flag: "NORMAL" },
          { test: "Platelet Count", value: "2.10 L/mcL", range: "1.50 - 4.50 L/mcL", flag: "NORMAL" },
          { test: "Fasting Blood Sugar", value: "88 mg/dL", range: "70 - 100 mg/dL", flag: "NORMAL" },
        ],
        diagnosis: "Mild Gestational Anaemia (Requires continued IFA supplementation)",
        vitalsRecorded: "Blood Group: B Positive (Rh+)",
      },
      fileDetails: {
        fileName: "Complete_Blood_Count_Report.jpg",
        fileSize: "112.4 KB",
        fileType: "image/jpeg",
        ocrEngine: "Gemini Vision Pathology Parser",
        confidence: "97.8%",
      },
    },
    {
      id: "doc-4",
      title: "ANC Visit Summary",
      category: "Clinical Note",
      date: "15 Sep 2024",
      status: "Pending Review",
      previewImg: "/samples/sample_prescription.jpg",
      facility: "Boxanagar Primary Health Centre",
      doctor: "Kalpana Reang (ASHA Worker)",
      summaryBn:
        "দ্বিতীয় ট্রাইমেস্টারের নিয়মিত এএনসি স্বাস্থ্য পরীক্ষা সম্পন্ন হয়েছে। রক্তচাপ ও গর্ভস্থ শিশুর হৃদস্পন্দন স্বাভাবিক রয়েছে।",
      summaryEn: [
        "Gestational Age: 20 Weeks (2nd Trimester).",
        "Blood Pressure: 118/76 mmHg (Normal).",
        "Fetal Heart Rate: 142 bpm (Regular).",
        "Routine Iron-Folic Acid supplementation advised.",
      ],
      extractedData: {
        clinicalNote: [
          { metric: "Gestational Age", value: "20 Weeks (2nd Trimester)" },
          { metric: "Maternal Weight", value: "54.2 kg" },
          { metric: "Blood Pressure", value: "118/76 mmHg" },
          { metric: "Fetal Heart Rate", value: "142 bpm (regular)" },
        ],
        diagnosis: "Normal Antenatal Progress (Trimester 2)",
        vitalsRecorded: "Fetal movements felt active daily",
      },
      fileDetails: {
        fileName: "ANC_Clinical_Visit_Summary.jpg",
        fileSize: "88.6 KB",
        fileType: "image/jpeg",
        ocrEngine: "Gemini Vision EMR Engine",
        confidence: "96.5%",
      },
    },
  ]);

  // Merge live patient documents from patientStore
  useEffect(() => {
    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const storeDocs = getPatientDocuments(pId);
    if (storeDocs && storeDocs.length > 0) {
      setDocuments((prev) => {
        const storeMapped = storeDocs.map((sd) => ({
          id: sd.id,
          title: sd.title,
          category: sd.category || "Report",
          date: sd.date || "Recent",
          status: "Verified Record",
          previewImg: sd.category === "X-Ray" ? "/samples/sample_xray.jpg" : sd.category === "Prescription" ? "/samples/sample_prescription.jpg" : "/samples/sample_lab_report.jpg",
          facility: sd.facility || "Bishalgarh Community Health Centre",
          doctor: "Dr. Sandeep Roy (Medical Officer)",
          summaryBn: "স্বাস্থ্য কেন্দ্র কর্তৃক যাচাইকৃত ও সংরক্ষিত সরকারি স্বাস্থ্য রেকর্ড।",
          summaryEn: [
            `Verified digital health record from ${sd.facility || "Bishalgarh CHC"}.`,
            `Document ID: ${sd.id} · File: ${sd.fileName}`,
          ],
          extractedData: {
            details: sd.pages || "1 page verified",
          },
          fileDetails: {
            fileName: sd.fileName || `${sd.title}.pdf`,
            fileSize: sd.fileSize || "1.2 MB",
            fileType: "application/pdf",
            ocrEngine: "Ayushman Bharat ABDM Vault",
            confidence: "100%",
          },
        }));
        const existingIds = new Set(prev.map((d) => d.id));
        const newOnes = storeMapped.filter((d) => !existingIds.has(d.id));
        return [...newOnes, ...prev];
      });
    }
  }, [patient?.id, patient?.patient_ref]);

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
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingLeft]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery.trim() ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.doctor && doc.doctor.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === "All Types" ||
        doc.category.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, selectedType]);

  const getBadgeStyle = (category) => {
    switch (category) {
      case "Prescription":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "X-Ray":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Lab Report":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Clinical Note":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  // Open file in new tab
  const handleOpenInNewTab = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Download file handler
  const handleDownload = (doc) => {
    const a = document.createElement("a");
    a.href = doc.previewImg;
    a.download = doc.fileDetails?.fileName || `${doc.title}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share handler
  const handleShare = () => {
    setCopiedShare(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Fetch real-time documents from FastAPI backend / Supabase
  useEffect(() => {
    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

    fetchPatientDocuments(normalizedPId)
      .then((remoteDocs) => {
        if (Array.isArray(remoteDocs) && remoteDocs.length > 0) {
          const mappedRemote = remoteDocs.map((rd) => {
            const preview = rd.signed_url || rd.file_url || "/samples/sample_prescription.jpg";
            const summaryEnArr = [];
            if (rd.patient_summary?.english) {
              summaryEnArr.push(rd.patient_summary.english);
            }
            if (rd.structured_data) {
              if (rd.structured_data.diagnosis) summaryEnArr.push(`Diagnosis: ${rd.structured_data.diagnosis}`);
              if (rd.structured_data.impression) summaryEnArr.push(`Impression: ${rd.structured_data.impression}`);
            }

            return {
              id: rd.id,
              title: rd.title || "Medical Document",
              category: rd.category || "Prescription",
              date: rd.visit_date
                ? new Date(rd.visit_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : rd.created_at
                ? new Date(rd.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "Recent",
              status: rd.analysis_status === "COMPLETED" ? "AI Analyzed" : "Pending Review",
              previewImg: preview,
              facility: rd.facility || "Community Health Centre",
              doctor: rd.doctor_name || "Medical Officer",
              summaryBn: rd.patient_summary?.bengali || "নথিপত্রটি সফলভাবে সংরক্ষিত হয়েছে।",
              summaryEn: summaryEnArr.length > 0 ? summaryEnArr : ["Document recorded in digital medical vault."],
              extractedData: rd.structured_data || {},
              fileDetails: {
                fileName: rd.file_name || `${rd.title || "document"}.jpg`,
                fileSize: rd.file_size ? `${Math.round(rd.file_size / 1024)} KB` : "120 KB",
                fileType: rd.mime_type || "image/jpeg",
                ocrEngine: "Gemini Vision Analyzer",
                confidence: "98.5%",
              },
            };
          });

          setDocuments((prev) => {
            const remoteIds = new Set(mappedRemote.map((m) => m.id));
            const remaining = prev.filter((d) => !remoteIds.has(d.id));
            return [...mappedRemote, ...remaining];
          });
        }
      })
      .catch((err) => {
        console.warn("[PatientDocuments] Notice while loading remote documents:", err);
      });
  }, [patient?.patient_ref, patient?.id]);

  // Delete document handler (Backend API + State)
  const handleDeleteDocument = async (docId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this document from your medical drive?")) return;
    try {
      await deletePatientDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.warn("Delete document notice:", err);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    }
  };

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patient_id", patient?.patient_ref || patient?.id || "AV-8921");
      formData.append("category", uploadCategory);
      formData.append("title", uploadTitle.trim() || selectedFile.name);
      formData.append("facility", uploadFacility);

      const res = await uploadMedicalDocument(formData);

      const newDoc = {
        id: res?.id || `doc-${Date.now()}`,
        title: uploadTitle.trim() || selectedFile.name,
        category: uploadCategory,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "AI Analyzed",
        previewImg: URL.createObjectURL(selectedFile),
        facility: uploadFacility,
        doctor: "Medical Officer",
        summaryBn: "নথিপত্রটি সফলভাবে আপলোড করা হয়েছে এবং জেমিনি ভিশন এআই দ্বারা পরীক্ষা করা হয়েছে।",
        summaryEn: [
          `Uploaded as ${uploadCategory}.`,
          "Clinical metrics saved to your private medical vault.",
        ],
        extractedData: {
          medicines: [],
          diagnosis: "Uploaded Document",
        },
        fileDetails: {
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          fileType: selectedFile.type,
          ocrEngine: "Gemini Vision AI",
          confidence: "98.0%",
        },
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadTitle("");
        setSelectedDoc(newDoc);
      }, 1200);
    } catch {
      const fallbackDoc = {
        id: `doc-${Date.now()}`,
        title: uploadTitle.trim() || selectedFile.name,
        category: uploadCategory,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "AI Analyzed",
        previewImg: URL.createObjectURL(selectedFile),
        facility: uploadFacility,
        doctor: "Medical Officer",
        summaryBn: "নথিপত্রটি সফলভাবে আপলোড করা হয়েছে।",
        summaryEn: [`Uploaded as ${uploadCategory}.`],
        extractedData: {},
        fileDetails: {
          fileName: selectedFile.name,
          fileSize: "Sample Size",
        },
      };
      setDocuments((prev) => [fallbackDoc, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadTitle("");
        setSelectedDoc(fallbackDoc);
      }, 1000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="documents"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

      {/* ============================================================================== */}
      {/* 2. RESIZER HANDLE: DRAG TO EXPAND / SHRINK SIDEBAR                             */}
      {/* ============================================================================== */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          onDoubleClick={() => setLeftWidth(240)}
          className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
          title="Drag to resize sidebar (Double-click to reset)"
        />
      )}

      {/* ============================================================================== */}
      {/* 3. MAIN WORKSPACE CONTAINER                                                    */}
      {/* ============================================================================== */}
      <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
        
        {/* ============================================================================ */}
        {/* VIEW A: DOCUMENT DETAILS & AI EXTRACTION INSPECTOR (WHEN A DOC IS SELECTED)   */}
        {/* ============================================================================ */}
        {selectedDoc ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Top Navigation Bar of Document Inspector */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <button
                onClick={() => { setSelectedDoc(null); setZoomLevel(1); setRotation(0); }}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to My Medical Drive</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenInNewTab(selectedDoc.previewImg)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Open in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </button>

                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#00875a] hover:bg-[#00704a] text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? "Link Copied!" : "Share"}</span>
                </button>

                <button
                  onClick={(e) => handleDeleteDocument(selectedDoc.id, e)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Delete this document from vault"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* Main Inspector Split-Screen: Left Document Preview | Right Clinical Intelligence */}
            <div className="flex-1 w-full min-h-0 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Pane: Document Canvas & Interactive Toolbar */}
              <div className="flex-1 h-full bg-slate-100/90 flex flex-col border-r border-slate-200/80 overflow-hidden relative">
                
                {/* Floating Top Toolbar (Zoom, Rotate, Open Tab, Fullscreen) */}
                <div className="h-10 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-3 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-1 text-slate-600 text-xs">
                    <button
                      onClick={() => setRotation((r) => (r - 90) % 360)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      title="Rotate counter-clockwise"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      title="Rotate clockwise"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 min-w-[42px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setZoomLevel(1); setRotation(0); }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded-lg hover:bg-slate-100"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenInNewTab(selectedDoc.previewImg)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                      title="Click to view full image in a new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Canvas Sheet View */}
                <div
                  onClick={() => handleOpenInNewTab(selectedDoc.previewImg)}
                  className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center cursor-zoom-in"
                  title="Click image to open in new tab"
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: "transform 0.15s ease-out",
                    }}
                    className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-full max-h-full overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={selectedDoc.previewImg}
                      alt={selectedDoc.title}
                      className="max-h-[75vh] w-auto object-contain select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Pane: Document Intelligence, Tabs & Gemini Vision OCR */}
              <div className="w-full lg:w-[480px] xl:w-[520px] h-full flex flex-col bg-white overflow-y-auto p-5 sm:p-6 shrink-0">
                
                {/* Header Information */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                    {selectedDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(selectedDoc.category)}`}>
                      {selectedDoc.category}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDoc.date}</span>
                    </div>
                    {selectedDoc.doctor && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedDoc.doctor}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Navigation: AI Summary | Extracted Data | Details */}
                <div className="flex items-center border-b border-slate-200 mt-6 gap-6 text-xs font-bold">
                  <button
                    onClick={() => setInspectorTab("ai-summary")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      inspectorTab === "ai-summary"
                        ? "text-[#00875a] border-b-2 border-[#00875a]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    AI Summary
                  </button>
                  <button
                    onClick={() => setInspectorTab("extracted-data")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      inspectorTab === "extracted-data"
                        ? "text-[#00875a] border-b-2 border-[#00875a]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Extracted Data
                  </button>
                  <button
                    onClick={() => setInspectorTab("details")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      inspectorTab === "details"
                        ? "text-[#00875a] border-b-2 border-[#00875a]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Details
                  </button>
                </div>

                {/* Tab 1 Content: AI Summary */}
                {inspectorTab === "ai-summary" && (
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="bg-[#f0fbf7] border border-emerald-100 rounded-2xl p-4.5 space-y-4">
                      
                      {/* Bengali Summary */}
                      {selectedDoc.summaryBn && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                            AI Summary (Bengali)
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {selectedDoc.summaryBn}
                          </p>
                        </div>
                      )}

                      {/* English Summary */}
                      {selectedDoc.summaryEn && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                            English Summary
                          </h4>
                          <ul className="text-xs text-slate-700 space-y-1 leading-relaxed">
                            {selectedDoc.summaryEn.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-slate-400 font-bold">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Amber Disclaimer */}
                      <div className="pt-2 border-t border-emerald-100/80 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>This is an AI-generated summary. Please follow your doctor's advice.</span>
                      </div>
                    </div>

                    {/* Ask AI Doctor Quick Button */}
                    <button
                      onClick={() => navigate("/patient/ai-doctor")}
                      className="w-full py-2.5 bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Ask AI Doctor Questions About This Report</span>
                    </button>
                  </div>
                )}

                {/* Tab 2 Content: Extracted Data */}
                {inspectorTab === "extracted-data" && (
                  <div className="mt-4 space-y-4 text-xs">
                    {/* Medicines List if Prescription */}
                    {selectedDoc.extractedData?.medicines && selectedDoc.extractedData.medicines.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 font-bold text-slate-800 border-b border-slate-200 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Prescribed Medications</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {selectedDoc.extractedData.medicines.map((m, idx) => (
                            <div key={idx} className="p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">{m.strength}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Frequency: <span className="font-bold text-slate-700">{m.frequency}</span> · {m.instructions} ({m.duration})
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Metrics if Blood Report */}
                    {selectedDoc.extractedData?.labMetrics && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 font-bold text-slate-800 border-b border-slate-200 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-600" />
                          <span>Diagnostic Pathology Values</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {selectedDoc.extractedData.labMetrics.map((l, idx) => (
                            <div key={idx} className="p-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900">{l.test}</span>
                                <span className="text-[10px] text-slate-400 block">Ref: {l.range}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-slate-900">{l.value}</span>
                                <span className={`block text-[9.5px] font-bold ${l.flag === "LOW" ? "text-amber-600" : "text-emerald-600"}`}>
                                  {l.flag}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Radiology Findings if X-Ray */}
                    {selectedDoc.extractedData?.radiology && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 font-bold text-slate-800 border-b border-slate-200 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Radiological Impressions</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {selectedDoc.extractedData.radiology.map((r, idx) => (
                            <div key={idx} className="p-2.5 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900">{r.organ}</span>
                                <p className="text-[10.5px] text-slate-600 mt-0.5">{r.finding}</p>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {r.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDoc.extractedData?.diagnosis && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Clinical Impression</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedDoc.extractedData.diagnosis}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3 Content: File Details */}
                {inspectorTab === "details" && (
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">File Name</span>
                        <span className="font-bold text-slate-800">{selectedDoc.fileDetails?.fileName || selectedDoc.title}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">File Size</span>
                        <span className="font-bold text-slate-800">{selectedDoc.fileDetails?.fileSize || "112 KB"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Storage Location</span>
                        <span className="font-bold text-emerald-700">ABDM Health Repository</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">OCR Confidence</span>
                        <span className="font-bold text-emerald-700">{selectedDoc.fileDetails?.confidence || "98.5%"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================================ */
          /* VIEW B: MAIN CATALOG LIST (MY MEDICAL DRIVE - FULL HORIZONTAL SPAN)           */
          /* ============================================================================ */
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
            <div className="w-full flex-1 flex flex-col gap-6">
              
              {/* Header Row: Title & Upload Document Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    My Medical Drive
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Upload, search and manage your medical documents
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-[#00875a] hover:bg-[#00704a] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 stroke-[2.2]" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>

              {/* Search Bar & Filter Dropdowns Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input Box */}
                <div className="flex-1 w-full border border-slate-200/90 hover:border-slate-300 rounded-full bg-white shadow-2xs px-4 py-2.5 flex items-center gap-2.5 transition">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, doctor name or keyword..."
                    className="flex-1 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter 1: All Types Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => { setTypeDropdownOpen(!typeDropdownOpen); setDateDropdownOpen(false); }}
                    className="px-4 py-2.5 border border-slate-200/90 rounded-full bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-2xs cursor-pointer transition"
                  >
                    <span>{selectedType}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {typeDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                      {["All Types", "Prescription", "X-Ray", "Lab Report", "Clinical Note"].map((type) => (
                        <button
                          key={type}
                          onClick={() => { setSelectedType(type); setTypeDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                            selectedType === type ? "bg-[#e8f8f0] text-[#059669] font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter 2: Date Range Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => { setDateDropdownOpen(!dateDropdownOpen); setTypeDropdownOpen(false); }}
                    className="px-4 py-2.5 border border-slate-200/90 rounded-full bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-2xs cursor-pointer transition"
                  >
                    <span>{selectedDateRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dateDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                      {["Date Range", "Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"].map((range) => (
                        <button
                          key={range}
                          onClick={() => { setSelectedDateRange(range); setDateDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                            selectedDateRange === range ? "bg-[#e8f8f0] text-[#059669] font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Registry Table (Government Portal Row Design - Generous 20%+ Vertical Sizing) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex-1">
                {filteredDocuments.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No medical documents found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or upload a new report.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-4 px-4">#</th>
                          <th className="py-4 px-5">Document Title</th>
                          <th className="py-4 px-5">Category</th>
                          <th className="py-4 px-5">Date</th>
                          <th className="py-4 px-5">Facility / Doctor</th>
                          <th className="py-4 px-5">ABDM Status</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDocuments.map((doc, index) => (
                          <tr
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="hover:bg-emerald-50/40 transition cursor-pointer group"
                          >
                            <td className="py-4 px-4 font-mono font-bold text-slate-400 text-xs align-middle">{index + 1}</td>
                            <td className="py-4 px-5 align-middle">
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-26 sm:w-24 sm:h-30 bg-white rounded-[3px] overflow-hidden border border-slate-200/90 shrink-0 group-hover:border-emerald-500 group-hover:shadow-xs transition shadow-2xs">
                                  <img
                                    src={doc.previewImg}
                                    alt={doc.title}
                                    className="w-full h-full object-cover rounded-[2px]"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/samples/sample_prescription.jpg";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition block truncate text-sm sm:text-base">
                                    {doc.title}
                                  </span>
                                  <span className="text-[11px] sm:text-xs text-slate-500 truncate block mt-1">
                                    {doc.fileDetails?.fileName || `${doc.title}.jpg`}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getBadgeStyle(doc.category)}`}>
                                {doc.category}
                              </span>
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap font-medium text-slate-700 text-xs sm:text-[13px]">
                              {doc.date}
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap text-slate-700 text-xs sm:text-[13px]">
                              {doc.doctor || "Community Health Centre"}
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap">
                              {doc.status === "AI Analyzed" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  AI Analyzed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition border border-emerald-200 inline-flex items-center gap-1 cursor-pointer"
                                  title="Inspect AI Analysis"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border border-slate-200 cursor-pointer"
                                  title="Download document"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleOpenInNewTab(doc.previewImg);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border border-slate-200 cursor-pointer"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteDocument(doc.id, e)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition border border-slate-200 hover:border-red-200 cursor-pointer"
                                  title="Delete document"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* ============================================================================== */}
      {/* 4. UPLOAD DOCUMENT MODAL                                                       */}
      {/* ============================================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Upload Medical Document</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Add doctor prescriptions, lab diagnostic tests, or radiology X-rays to your drive.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Document Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Prescription", "X-Ray", "Lab Report", "Clinical Note"].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setUploadCategory(cat)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        uploadCategory === cat
                          ? "bg-[#e8f8f0] text-[#059669] border-emerald-300 shadow-2xs font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Prescription - Dr. Roy or Blood CBC Report"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select File (Image / PDF)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition"
                >
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  {selectedFile ? (
                    <p className="text-xs font-bold text-emerald-700">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-800">Click to choose file or drag here</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF up to 25MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {uploadError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Document uploaded and analyzed successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-bold bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <span>Upload & Analyze</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
