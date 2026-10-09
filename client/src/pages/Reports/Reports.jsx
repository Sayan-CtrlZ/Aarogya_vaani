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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
      navigate("/danger-check");
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
  }, [interviewData.visitHistory, patientKey, navigate]);

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

    navigate("/danger-check");
  };

  const patientName =
    patientData.patient?.name || "Returning Patient";

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center content-center gap-[15px] bg-[#f5faf7] text-[#103f32]">
        <div className="w-[40px] h-[40px] border-4 border-[#d7e8df] border-t-[#2f8f69] rounded-full animate-[spin_0.8s_linear_infinite]"></div>
        <p>Loading patient reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(rgba(245,250,247,0.95),rgba(245,250,247,0.97)),url('https://upload.wikimedia.org/wikipedia/commons/3/36/Tripura_in_India.svg')] bg-[center/500px_no-repeat] text-[#103f32]">
      <header className="h-[76px] bg-[#103f32] text-white flex items-center justify-between px-[6%] max-sm:px-[5%]">
        <div>
          <h1 className="m-0 text-[25px] font-extrabold">AarogyaVaani</h1>
          <span className="block mt-[2px] text-[12px] opacity-78">Tripura Health</span>
        </div>

        <div className="flex items-center gap-[8px] text-[13px] opacity-90 max-sm:hidden">
          <span className="w-[8px] h-[8px] bg-[#7ee2ad] rounded-full"></span>
          Offline Mode
        </div>
      </header>

      <main className="w-[min(1120px,92%)] mx-auto py-[30px] pb-[60px] max-sm:w-[94%] max-sm:pt-[20px]">
        <div className="flex gap-[9px] text-[13px] text-[#6a8278] mb-[24px]">
          <span>Patient Intake</span>
          <span>/</span>
          <strong className="text-[#103f32]">Previous Reports</strong>
        </div>

        <section className="flex justify-between gap-[30px] items-center mb-[24px] max-[850px]:items-start max-sm:flex-col">
          <div>
            <p className="text-[#2f8f69] text-[12px] font-extrabold tracking-[1.5px] m-0">RETURNING PATIENT</p>

            <h2 className="text-[clamp(30px,5vw,44px)] my-[8px] m-0">Previous Medical Reports</h2>

            <p className="max-w-[700px] text-[#60756d] leading-[1.7] m-0">
              Welcome back, <strong>{patientName}</strong>. You can attach
              previous reports to help the doctor review your history.
            </p>
          </div>

          <div className="w-[90px] h-[90px] rounded-full bg-[#e0f1e8] flex flex-col items-center justify-center shrink-0 max-sm:w-[70px] max-sm:h-[70px]">
            <span className="text-[26px] font-extrabold">04</span>
            <small className="text-[10px] text-[#668078]">OF 06</small>
          </div>
        </section>

        <section className="flex gap-[14px] items-start bg-[#e8f5ef] border border-[#cce6d9] rounded-[16px] px-[20px] py-[18px] mb-[22px]">
          <CheckCircle2 className="text-[#2f8f69] shrink-0" size={22} />

          <div>
            <strong className="block mb-[4px]">Stored securely on this device</strong>
            <p className="m-0 text-[#61786e] text-[14px] leading-[1.5]">
              Reports are stored locally for this patient. They are not
              analyzed by AI on this screen.
            </p>
          </div>
        </section>

        <section className="bg-[rgba(255,255,255,0.95)] border border-[#d7e8df] rounded-[20px] p-[26px] shadow-[0_10px_35px_rgba(16,63,50,0.07)] mb-[22px] max-sm:p-[18px]">
          <div>
            <div>
              <h3 className="m-0 mb-[5px] text-[20px]">Add a previous report</h3>
              <p className="m-0 text-[#71847d] text-[14px]">
                You may upload a PDF or image of an existing medical report.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.4fr_auto] gap-[16px] items-end mt-[22px] max-[850px]:grid-cols-1">
            <div>
              <label htmlFor="reportName" className="block mb-[8px] font-bold text-[14px]">Report name</label>

              <input
                id="reportName"
                type="text"
                className="w-full min-h-[52px] border border-[#cbded5] rounded-[12px] px-[15px] text-[15px] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.12)]"
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                placeholder="Example: BP report"
              />
            </div>

            <div>
              <label className="block mb-[8px] font-bold text-[14px]">Choose report file</label>

              <div
                className="min-h-[52px] border-[1.5px] border-dashed border-[#9fc5b4] rounded-[12px] px-[14px] py-[9px] flex items-center gap-[12px] cursor-pointer bg-[#f7fbf9]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-[#2f8f69] shrink-0" size={24} />

                <div>
                  <strong className="block text-[13px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[260px]">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose a PDF or image"}
                  </strong>

                  <span className="block text-[#7a8e86] text-[11px] mt-[3px]">
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
              className="min-h-[52px] border-0 rounded-[12px] px-[19px] bg-[#0f5c45] text-white font-[750] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#103f32] max-sm:w-full"
              type="button"
              onClick={handleAddReport}
            >
              <Upload size={19} />
              Add Report
            </button>
          </div>

          {error && (
            <div className="flex gap-[8px] items-center text-[#a72a22] bg-[#fff1f0] border border-[#f0c8c4] rounded-[10px] px-[14px] py-[11px] mt-[15px] text-[13px]">
              <AlertCircle size={19} />
              {error}
            </div>
          )}
        </section>

        <section className="bg-[rgba(255,255,255,0.95)] border border-[#d7e8df] rounded-[20px] p-[26px] shadow-[0_10px_35px_rgba(16,63,50,0.07)] mb-[22px] max-sm:p-[18px] min-h-[180px]">
          <div>
            <div>
              <h3 className="m-0 mb-[5px] text-[20px]">Uploaded reports</h3>
              <p className="m-0 text-[#71847d] text-[14px]">
                {reports.length === 0
                  ? "No previous reports added yet."
                  : `${reports.length} report${
                      reports.length > 1 ? "s" : ""
                    } attached`}
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center pt-[35px] pb-[20px] px-[10px] text-[#71847d] flex flex-col items-center">
              <FileText className="text-[#8eb4a4]" size={42} />
              <h4 className="text-[#35574b] my-[10px] mb-[5px] m-0">No reports attached</h4>
              <p className="m-0 text-[13px]">
                You can continue without uploading a report.
              </p>
            </div>
          ) : (
            <div className="grid gap-[12px] mt-[20px]">
              {reports.map((report) => (
                <div className="flex items-center gap-[15px] p-[15px] border border-[#dceae4] rounded-[14px] bg-[#fbfdfc]" key={report.id}>
                  <div className="w-[48px] h-[48px] rounded-[12px] bg-[#e5f3eb] text-[#2f8f69] grid place-items-center shrink-0">
                    {getFileIcon(report.fileType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <strong className="block mb-[3px]">{report.reportName}</strong>

                    <span className="block text-[13px] text-[#687b73] overflow-hidden text-ellipsis whitespace-nowrap">{report.fileName}</span>

                    <small className="block mt-[5px] text-[#899991] text-[11px]">
                      {formatFileSize(report.fileSize)} •{" "}
                      {new Date(
                        report.uploadedAt
                      ).toLocaleDateString()}
                    </small>
                  </div>

                  <button
                    className="w-[42px] h-[42px] border-0 rounded-[10px] text-[#a72a22] bg-[#fff1f0] grid place-items-center cursor-pointer"
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

        <div className="flex justify-between gap-[15px] mt-[28px] max-sm:flex-col-reverse">
          <button
            className="min-h-[52px] border border-[#cbded5] bg-white text-[#103f32] rounded-[12px] px-[20px] font-bold flex items-center justify-center gap-[8px] cursor-pointer max-sm:w-full"
            onClick={() => {
              navigate("/interview");
            }}
          >
            <ArrowLeft size={19} />
            Back
          </button>

          <button
            className="min-h-[52px] border-0 rounded-[12px] px-[19px] bg-[#0f5c45] text-white font-[750] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#103f32] max-sm:w-full"
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