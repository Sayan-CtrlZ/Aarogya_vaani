import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./Reports.css";

const DB_NAME = "aarogyaVaaniDB";
const STORE_NAME = "reports";

function openReportsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function saveReport(report) {
  const db = await openReportsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(report);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getReports() {
  const db = await openReportsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function deleteReport(id) {
  const db = await openReportsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type) {
  if (type?.startsWith("image/")) {
    return <ImageIcon size={24} />;
  }

  if (type === "application/pdf") {
    return <FileText size={24} />;
  }

  return <File size={24} />;
}

export default function Reports() {
  const patientData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
    );
  }, []);

  const interviewData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniInterview") || "{}"
    );
  }, []);

  const fileInputRef = useRef(null);

  const [reportName, setReportName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const patientKey =
    patientData.createdAt ||
    patientData.patient?.phone ||
    patientData.patient?.name ||
    "current-patient";

  useEffect(() => {
    if (interviewData.visitHistory !== "previous") {
      window.location.href = "/danger-check";
      return;
    }

    async function loadReports() {
      try {
        const allReports = await getReports();

        const patientReports = allReports.filter(
          (report) => report.patientKey === patientKey
        );

        setReports(patientReports);
      } catch (err) {
        console.error(err);
        setError("Unable to load saved reports.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [interviewData.visitHistory, patientKey]);

  const handleFileChange = (event) => {
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setError("Please select a PDF or image file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleAddReport = async () => {
    setError("");

    if (!reportName.trim()) {
      setError("Please enter a name for the report.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF or image.");
      return;
    }

    const report = {
      id: crypto.randomUUID(),
      patientKey,

      reportName: reportName.trim(),
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,

      uploadedAt: new Date().toISOString(),

      file: selectedFile,
    };

    try {
      await saveReport(report);

      setReports((previous) => [...previous, report]);

      setReportName("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setError("Unable to save the report on this device.");
    }
  };

  const handleRemoveReport = async (id) => {
    try {
      await deleteReport(id);

      setReports((previous) =>
        previous.filter((report) => report.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to remove the report.");
    }
  };

  const handleContinue = () => {
    const reportMetadata = reports.map((report) => ({
      id: report.id,
      reportName: report.reportName,
      fileName: report.fileName,
      fileType: report.fileType,
      fileSize: report.fileSize,
      uploadedAt: report.uploadedAt,
    }));

    localStorage.setItem(
      "aarogyaVaaniReports",
      JSON.stringify(reportMetadata)
    );

    window.location.href = "/danger-check";
  };

  const patientName =
    patientData.patient?.name || "Returning Patient";

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="reports-spinner"></div>
        <p>Loading patient reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div className="reports-brand">
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <div className="reports-header-status">
          <span className="status-dot"></span>
          Offline Mode
        </div>
      </header>

      <main className="reports-main">
        <div className="reports-breadcrumb">
          <span>Patient Intake</span>
          <span>/</span>
          <strong>Previous Reports</strong>
        </div>

        <section className="reports-hero">
          <div>
            <p className="reports-eyebrow">RETURNING PATIENT</p>

            <h2>Previous Medical Reports</h2>

            <p>
              Welcome back, <strong>{patientName}</strong>. You can attach
              previous reports to help the doctor review your history.
            </p>
          </div>

          <div className="reports-step">
            <span>04</span>
            <small>OF 06</small>
          </div>
        </section>

        <section className="reports-notice">
          <CheckCircle2 size={22} />

          <div>
            <strong>Stored securely on this device</strong>
            <p>
              Reports are stored locally for this patient. They are not
              analyzed by AI on this screen.
            </p>
          </div>
        </section>

        <section className="reports-card">
          <div className="reports-card-heading">
            <div>
              <h3>Add a previous report</h3>
              <p>
                You may upload a PDF or image of an existing medical report.
              </p>
            </div>
          </div>

          <div className="report-form">
            <div className="form-field">
              <label htmlFor="reportName">Report name</label>

              <input
                id="reportName"
                type="text"
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                placeholder="Example: BP report"
              />
            </div>

            <div className="form-field">
              <label>Choose report file</label>

              <div
                className="file-picker"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />

                <div>
                  <strong>
                    {selectedFile
                      ? selectedFile.name
                      : "Choose a PDF or image"}
                  </strong>

                  <span>
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : "Tap to browse files"}
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                hidden
              />
            </div>

            <button
              className="add-report-btn"
              type="button"
              onClick={handleAddReport}
            >
              <Upload size={19} />
              Add Report
            </button>
          </div>

          {error && (
            <div className="reports-error">
              <AlertCircle size={19} />
              {error}
            </div>
          )}
        </section>

        <section className="uploaded-reports">
          <div className="uploaded-heading">
            <div>
              <h3>Uploaded reports</h3>
              <p>
                {reports.length === 0
                  ? "No previous reports added yet."
                  : `${reports.length} report${
                      reports.length > 1 ? "s" : ""
                    } attached`}
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="empty-reports">
              <FileText size={42} />
              <h4>No reports attached</h4>
              <p>
                You can continue without uploading a report.
              </p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div className="report-item" key={report.id}>
                  <div className="report-icon">
                    {getFileIcon(report.fileType)}
                  </div>

                  <div className="report-info">
                    <strong>{report.reportName}</strong>

                    <span>{report.fileName}</span>

                    <small>
                      {formatFileSize(report.fileSize)} •{" "}
                      {new Date(
                        report.uploadedAt
                      ).toLocaleDateString()}
                    </small>
                  </div>

                  <button
                    className="remove-report-btn"
                    type="button"
                    onClick={() => handleRemoveReport(report.id)}
                    aria-label={`Remove ${report.reportName}`}
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="reports-actions">
          <button
            className="secondary-action"
            onClick={() => {
              window.location.href = "/interview";
            }}
          >
            <ArrowLeft size={19} />
            Back
          </button>

          <button
            className="primary-action"
            onClick={handleContinue}
          >
            Continue to Safety Check
            <ArrowRight size={19} />
          </button>
        </div>
      </main>
    </div>
  );
}