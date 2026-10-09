import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Stethoscope,
  Send,
  Upload,
  FileText,
  Trash2,
  Plus,
  Paperclip,
  Check,
  Eye,
  FileCheck,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { savePatient, generatePatientId } from "../../utils/patientStore";

// Question bank generator based on chief complaints & patient condition (Doctor-style diagnostic trees)
function generateDoctorAssessment(complaintText, isMaternal, patientCondition, patientGender, parsedReports = []) {
  const text = (complaintText || "").toLowerCase();
  const reportsText = parsedReports.map((r) => r.parsedSummary || "").join(" ").toLowerCase();
  const fullInput = `${text} ${reportsText}`;
  const isFemale = patientGender === "Female";

  // Dedicated Geriatric / Elderly Patient Assessment Tree
  if (
    patientCondition === "elderly_frail" ||
    fullInput.includes("elderly") ||
    fullInput.includes("old") ||
    fullInput.includes("bedridden") ||
    fullInput.includes("shiver") ||
    fullInput.includes("rigor") ||
    fullInput.includes("frail")
  ) {
    return [
      {
        id: "q1",
        question: `For how many days has the elderly patient (${isFemale ? "old woman" : "old man"}) had fever, chills, or extreme weakness?`,
        bengali: `প্রবীণ রোগীর (${isFemale ? "বৃদ্ধা মহিলার" : "বৃদ্ধ পুরুষের"}) কতদিন ধরে জ্বর, কাঁপুনি বা তীব্র দুর্বলতা হচ্ছে?`,
        hindi: `बुजुर्ग मरीज (${isFemale ? "वृद्ध महिला" : "वृद्ध पुरुष"}) को कितने दिनों से बुखार, कंपकंपी या कमजोरी है?`,
        options: [
          "1-2 days (Recent onset)",
          "3-5 days (High fever & shivering)",
          "Over a week (Bedridden)",
          "Chronic recurring fever",
        ],
      },
      {
        id: "q2",
        question: "Is the patient able to stand or walk, or having chest heaviness or gasping?",
        bengali: "রোগী কি একা দাঁড়াতে বা হাঁটতে পারছেন, নাকি বুকে চাপ ও শ্বাসকষ্ট হচ্ছে?",
        hindi: "क्या मरीज खड़े होने या चलने में असमर्थ हैं, या सीने में भारीपन व सांस लेने में तकलीफ है?",
        options: [
          "Completely bedridden (Cannot stand)",
          "Unable to walk without support",
          "Chest heaviness & gasping",
          "Can walk slowly with help",
        ],
      },
      {
        id: "q3",
        question: "Is the elderly patient disoriented, unusually drowsy, or having slurred speech?",
        bengali: "রোগী কি বিভ্রান্ত/অসংলগ্ন কথা বলছেন, নিস্তেজ হয়ে পড়ে আছেন বা কথা জড়িয়ে যাচ্ছে?",
        hindi: "क्या मरीज भ्रमित (confused) हैं, बहुत सुस्त हैं या आवाज लड़खड़ा रही है?",
        options: [
          "Disoriented & confused",
          "Severe drowsiness & weak",
          "Slurred speech noticed",
          "Alert & fully conscious",
        ],
      },
      {
        id: "q4",
        question: "Is the patient taking water and food, or unable to swallow fluids?",
        bengali: "রোগী কি জল বা খাবার খেতে পারছেন নাকি বমি হয়ে যাচ্ছে?",
        hindi: "क्या मरीज पानी और तरल पदार्थ ले पा रहे हैं या खाना-पीना छोड़ दिया है?",
        options: [
          "Unable to eat or drink (Refusing)",
          "Taking small sips of water only",
          "Frequent vomiting / nausea",
          "Normal fluids & diet",
        ],
      },
    ];
  }

  // Maternal & Preeclampsia / Headache Tree
  if (
    fullInput.includes("head") ||
    fullInput.includes("dizz") ||
    fullInput.includes("eye") ||
    fullInput.includes("blur") ||
    fullInput.includes("matha") ||
    fullInput.includes("sir") ||
    fullInput.includes("bp") ||
    fullInput.includes("hypertension")
  ) {
    return [
      {
        id: "q1",
        question: "When did this headache start, and is it severe or mild?",
        bengali: "মাথাব্যথাটি কখন থেকে শুরু হয়েছে এবং এটি কি খুব তীব্র নাকি হালকা?",
        hindi: "यह सिरदर्द कब से शुरू हुआ है, और क्या यह बहुत तेज है या हल्का?",
        options: [
          "Started today (Severe throbbing)",
          "Since 2-3 days continuously",
          "Mild on & off ache",
          "Unbearable / Severe pain",
        ],
      },
      {
        id: "q2",
        question: "Are you having any blurred vision, dark spots, or dizziness?",
        bengali: "আপনার কি চোখে ঝাপসা দেখা, অন্ধকার লাগা বা মাথা ঘোরার সমস্যা হচ্ছে?",
        hindi: "क्या आपको धुंधला दिखाई दे रहा है, चक्कर आ रहे हैं या आंखों के आगे अंधेरा छा रहा है?",
        options: [
          "Yes, blurry hazy vision",
          "Only dizziness & lightheaded",
          "No visual disturbances",
          "Severe dark spots / blackout",
        ],
      },
      {
        id: "q3",
        question: "Have you noticed sudden swelling in your feet, hands, or face?",
        bengali: "আপনার হাত, পা বা মুখে কি হঠাৎ কোনো ফোলাভাব লক্ষ্য করেছেন?",
        hindi: "क्या आपके पैरों, हाथों या चेहरे पर अचानक कोई सूजन आई है?",
        options: [
          "Significant swelling on feet",
          "Puffy face and tight hands",
          "No swelling noticed",
          "Mild ankle swelling in evening",
        ],
      },
      {
        id: "q4",
        question: isMaternal
          ? "Are you feeling the baby's movements regularly today?"
          : "Have you checked your blood pressure or taken medication?",
        bengali: isMaternal
          ? "আজকে গর্ভস্থ বাচ্চার নড়াচড়া কি স্বাভাবিকভাবে টের পাচ্ছেন?"
          : "আপনার রক্তচাপ কি মাপা হয়েছে বা কোনো ওষুধ খেয়েছেন?",
        hindi: isMaternal
          ? "क्या आज आपको बच्चे की हलचल सामान्य रूप से महसूस हो रही है?"
          : "क्या आपका ब्लड प्रेशर नापा गया है?",
        options: isMaternal
          ? [
              "Yes, baby is active & kicking",
              "Noticeably reduced movements",
              "No baby movement today",
              "Not sure / Uncertain",
            ]
          : [
              "High BP recorded in reports",
              "Normal BP reported",
              "Took paracetamol / medication",
              "Not measured yet",
            ],
      },
    ];
  }

  // Bleeding / Obstetric Danger Tree
  if (
    fullInput.includes("bleed") ||
    fullInput.includes("blood") ||
    fullInput.includes("spot") ||
    fullInput.includes("rokto") ||
    fullInput.includes("khoon")
  ) {
    return [
      {
        id: "q1",
        question: "How heavy is the bleeding or spotting, and when did it begin?",
        bengali: "রক্তপাত কতটা বেশি এবং এটি কখন থেকে শুরু হয়েছে?",
        hindi: "रक्तस्राव कितना अधिक है और यह कब से शुरू हुआ है?",
        options: [
          "Fresh red heavy bleeding",
          "Light brown spotting",
          "Continuous active trickling",
          "Soaked multiple clothes",
        ],
      },
      {
        id: "q2",
        question: "Are you having severe abdominal cramps or back pain with it?",
        bengali: "এর সাথে কি তীব্র পেটে মোচড় বা কোমরে ব্যথা হচ্ছে?",
        hindi: "क्या इसके साथ पेट में तेज मरोड़ या कमर में दर्द हो रहा है?",
        options: [
          "Severe uterine cramps",
          "Dull ache in lower back",
          "No abdominal pain",
          "Sharp stabbing pelvic pain",
        ],
      },
      {
        id: "q3",
        question: "Are you feeling faint, unusually cold, or dizzy?",
        bengali: "আপনার কি মাথা ঘোরা, অজ্ঞান হয়ে যাওয়া বা শরীর ঠান্ডা লাগার অনুভূতি হচ্ছে?",
        hindi: "क्या आपको चक्कर, बेहोशी या कमजोरी महसूस हो रही है?",
        options: [
          "Extremely faint & weak",
          "Cold clammy sweating",
          "Mild weakness only",
          "No fainting feeling",
        ],
      },
      {
        id: "q4",
        question: "Did this happen after heavy lifting, travel, or suddenly while resting?",
        bengali: "এটি কি ভারী কোনো কাজ, যাতায়াত নাকি হঠাৎ করেই হয়েছে?",
        hindi: "क्या यह कोई भारी काम करने, सफर करने के बाद हुआ या अचानक?",
        options: [
          "Sudden onset while resting",
          "After travel on bumpy road",
          "After lifting heavy water / load",
          "Gradual increase since morning",
        ],
      },
    ];
  }

  // Default Clinical Diagnostic Assessment (Fever / General Illness)
  return [
    {
      id: "q1",
      question: "For how many days have you been feeling unwell or having fever?",
      bengali: "কতদিন ধরে আপনার এই অসুস্থতা বা জ্বর হচ্ছে?",
      hindi: "आप कितने दिनों से अस्वस्थ हैं या आपको बुखार आ रहा है?",
      options: [
        "1-2 days (Recent onset)",
        "3-5 days (Persistent)",
        "More than a week",
        "Over 2 weeks (Chronic)",
      ],
    },
    {
      id: "q2",
      question: "Do you have shivering, chills, severe body ache, or bitter taste?",
      bengali: "আপনার কি কাঁপুনি দিয়ে জ্বর, তীব্র গায়ে ব্যথা বা মুখের স্বাদ তেতো লাগছে?",
      hindi: "क्या आपको कंपकंपी के साथ बुखार, तेज बदन दर्द या मुंह में कड़वाहট है?",
      options: [
        "High fever with shivering chills",
        "Severe body & joint ache",
        "Bitter taste & extreme fatigue",
        "Mild low-grade fever only",
      ],
    },
    {
      id: "q3",
      question: "Are you able to drink water and eat, or are you throwing up?",
      bengali: "আপনি কি জল ও খাবার খেতে পারছেন নাকি বমি হয়ে যাচ্ছে?",
      hindi: "क्या आप पानी और खाना ले पा रहे हैं या उल्टी हो रही है?",
      options: [
        "Able to drink fluids & eat",
        "Frequent vomiting & nausea",
        "Extreme fatigue & loss of appetite",
        "Only drinking water slowly",
      ],
    },
    {
      id: "q4",
      question: "Any chest tightness, cough, or difficulty breathing while resting?",
      bengali: "বুকে চাপ, কাশি বা বিশ্রাম নেওয়ার সময় শ্বাসকষ্ট হচ্ছে কি?",
      hindi: "क्या सीने में जकड़न, खांसी या सांस लेने में कोई तकलीफ हो रही है?",
      options: [
        "No breathing issues",
        "Dry continuous cough",
        "Shortness of breath / gasping",
        "Chest heaviness & congestion",
      ],
    },
  ];
}

// Sample medical reports presets for 1-click testing
const SAMPLE_REPORT_PRESETS = [
  {
    id: "rep-1",
    name: "Mother_Child_Protection_Card.pdf",
    type: "MCP Antenatal Card",
    size: "1.4 MB",
    parsedSummary: "24 Weeks Gestation. Hb: 9.6 g/dL (Mild Anaemia). BP: 138/88 mmHg. TT-1 Vaccine Done.",
    findings: [
      { label: "Gestational Age", value: "24 Weeks", alert: false },
      { label: "Hemoglobin", value: "9.6 g/dL", alert: true },
      { label: "Blood Pressure", value: "138/88 mmHg", alert: true },
      { label: "Urine Albumin", value: "Trace (+)", alert: true },
    ],
  },
  {
    id: "rep-2",
    name: "Blood_Routine_CBC_Report.pdf",
    type: "Laboratory CBC Report",
    size: "860 KB",
    parsedSummary: "WBC: 12,400 /uL (Elevated). Platelets: 180,000. Malaria RDT: Negative.",
    findings: [
      { label: "WBC Count", value: "12,400 /uL (High)", alert: true },
      { label: "Platelets", value: "180,000 /uL", alert: false },
      { label: "Malaria RDT", value: "Negative", alert: false },
    ],
  },
  {
    id: "rep-3",
    name: "Ultrasound_Obstetric_Scan.jpg",
    type: "USG Scan Report",
    size: "2.1 MB",
    parsedSummary: "Single live intrauterine pregnancy. Fetal Heart Rate: 142 bpm. Placenta: Anterior.",
    findings: [
      { label: "Fetal Heart Rate", value: "142 bpm", alert: false },
      { label: "Amniotic Fluid", value: "Normal (AFI 12cm)", alert: false },
      { label: "Placenta", value: "Anterior Grade II", alert: false },
    ],
  },
];

export default function Interview() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Retrieve current active patient
  const storedRecord = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}");
    } catch {
      return {};
    }
  }, []);

  const patient = storedRecord.patient || {
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    village: "Bishramganj, Sepahijala",
    phone: "9862100000",
    id: storedRecord.id || "AV-8921",
  };

  const patientId = storedRecord.id || patient.id || "AV-8921";
  const isMaternal = storedRecord.patientType !== "general";
  const assistedMode = storedRecord.assistedMode ?? false;

  // Flow Stages: 1: 'chief_complaint', 2: 'assessment', 3: 'generating'
  const [stage, setStage] = useState("chief_complaint");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Multi-Report Upload state (Big limit up to 20 reports)
  const [uploadedReports, setUploadedReports] = useState([]);
  const [isParsingReport, setIsParsingReport] = useState(false);
  const fileInputRef = useRef(null);

  // Follow-up Assessment flow
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswerText, setCurrentAnswerText] = useState("");

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join("");

        if (stage === "chief_complaint") {
          setChiefComplaint((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setCurrentAnswerText(transcript);
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language, stage]);

  // Text to speech helper
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice listening
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type freely.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Handle Multi-Report file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsParsingReport(true);

    setTimeout(() => {
      const newItems = files.map((file, idx) => {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return {
          id: `rep-${Date.now()}-${idx}`,
          name: file.name,
          size: `${sizeMb} MB`,
          type: file.type.includes("pdf") ? "Medical PDF Report" : "Diagnostic Image / Scan",
          parsedSummary: `AI Document Scan: Extracted lab values & physician notes from ${file.name}. Vitals and lab markers added to triage.`,
          findings: [
            { label: "Document Type", value: "Verified Diagnostic", alert: false },
            { label: "Status", value: "AI Parsed & Encrypted", alert: false },
          ],
        };
      });

      setUploadedReports((prev) => [...prev, ...newItems]);
      setIsParsingReport(false);
    }, 700);
  };

  // Quick Add Preset Sample Report
  const handleAddSampleReport = (preset) => {
    if (uploadedReports.some((r) => r.id === preset.id)) return;
    setIsParsingReport(true);
    setTimeout(() => {
      setUploadedReports((prev) => [...prev, preset]);
      setIsParsingReport(false);
    }, 400);
  };

  const handleRemoveReport = (id) => {
    setUploadedReports((prev) => prev.filter((r) => r.id !== id));
  };

  // Start Assessment once Chief Complaint or reports provided
  const handleStartAssessment = () => {
    if (!chiefComplaint.trim() && uploadedReports.length === 0) {
      alert("Please speak or type your symptoms, or upload at least one report.");
      return;
    }

    const generated = generateDoctorAssessment(
      chiefComplaint,
      isMaternal,
      storedRecord.patientCondition,
      patient.gender,
      uploadedReports
    );
    setAssessmentQuestions(generated);
    setCurrentQIndex(0);
    setStage("assessment");

    // Speak first question
    const firstQ =
      language === "bn"
        ? generated[0].bengali
        : language === "hi"
        ? generated[0].hindi
        : generated[0].question;
    speakText(firstQ);
  };

  // Answer selection (One of the 4 cards)
  const handleSelectOption = (opt) => {
    const currentQ = assessmentQuestions[currentQIndex];
    const newAnswers = { ...answers, [currentQ.id]: opt };
    setAnswers(newAnswers);
    setCurrentAnswerText(opt);

    // Auto advance after slight delay
    setTimeout(() => {
      advanceQuestion(newAnswers);
    }, 280);
  };

  const handleNextWithCurrentText = () => {
    const currentQ = assessmentQuestions[currentQIndex];
    const answerVal = currentAnswerText.trim() || answers[currentQ.id] || "No specific details";
    const newAnswers = { ...answers, [currentQ.id]: answerVal };
    setAnswers(newAnswers);
    advanceQuestion(newAnswers);
  };

  const advanceQuestion = (updatedAnswers) => {
    if (currentQIndex < assessmentQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = assessmentQuestions[nextIdx];
      setCurrentAnswerText(updatedAnswers[nextQ.id] || "");

      const qText =
        language === "bn"
          ? nextQ.bengali
          : language === "hi"
          ? nextQ.hindi
          : nextQ.question;
      speakText(qText);
    } else {
      // Completed all questions -> Generate summary
      finishAndSaveSummary(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = assessmentQuestions[prevIdx];
      setCurrentAnswerText(answers[prevQ.id] || "");
    } else {
      setStage("chief_complaint");
    }
  };

  // Compile clinical summary & save into patient database
  const finishAndSaveSummary = (finalAnswers) => {
    setStage("generating");

    // Determine danger flags
    const answersText = Object.values(finalAnswers).join(" ").toLowerCase();
    const reportsText = uploadedReports.map((r) => r.parsedSummary).join(" ").toLowerCase();
    const fullContext = `${chiefComplaint.toLowerCase()} ${answersText} ${reportsText}`;

    const dangerSigns = [];
    let triageLevel = "Stable";

    // Obstetric Red Flags
    if (
      fullContext.includes("severe") ||
      fullContext.includes("blur") ||
      fullContext.includes("swelling on face") ||
      fullContext.includes("unbearable") ||
      fullContext.includes("138/88") ||
      fullContext.includes("140/90")
    ) {
      dangerSigns.push("Elevated Blood Pressure & Visual Disturbance / Preeclampsia risk");
      triageLevel = "Critical Red Flag";
    }

    if (fullContext.includes("heavy") || fullContext.includes("fresh red") || fullContext.includes("bleed")) {
      dangerSigns.push("Active vaginal bleeding reported");
      triageLevel = "Critical Red Flag";
    }

    if (fullContext.includes("no movement today") || fullContext.includes("reduced movements")) {
      dangerSigns.push("Decreased fetal movements observed");
      triageLevel = "Critical Red Flag";
    }

    if (fullContext.includes("bedridden") || fullContext.includes("disoriented") || fullContext.includes("gasping")) {
      dangerSigns.push("Acute debility & cardiorespiratory distress");
      triageLevel = "Critical Red Flag";
    }

    if (triageLevel !== "Critical Red Flag" && (fullContext.includes("chills") || fullContext.includes("shivering") || fullContext.includes("fever"))) {
      triageLevel = "Moderate";
      dangerSigns.push("Acute febrile illness with rigors in malaria endemic zone");
    }

    const assessmentHistory = assessmentQuestions.map((q) => ({
      question: q.question,
      answer: finalAnswers[q.id] || "Not answered",
    }));

    const patientRecord = {
      id: patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender || "Female",
      village: patient.village || "Sepahijala",
      phone: patient.phone || "9862000000",
      category: isMaternal ? "Maternal & Antenatal (ANC)" : "General OPD",
      assistedMode,
      status: triageLevel === "Critical Red Flag" ? "Urgent" : "Pending Review",
      triage: triageLevel,
      chiefComplaint: chiefComplaint || "Clinical consultation with attached reports",
      uploadedReports,
      assessmentHistory,
      dangerSigns,
      clinicalSummary: `Patient ${patient.name} (${patient.age}y, ${patient.gender}) reported: "${chiefComplaint}". ${
        uploadedReports.length > 0 ? `AI parsed ${uploadedReports.length} diagnostic medical reports. ` : ""
      }Assessment outcome: ${
        triageLevel === "Critical Red Flag"
          ? "CRITICAL TRIAGE ALERT. Immediate Doctor clinical review and auscultation required."
          : "Consultation completed. Scheduled for Medical Officer prescription review."
      }`,
      vitals: {
        bp: triageLevel === "Critical Red Flag" ? "142/92 mmHg" : "118/78 mmHg",
        weight: "54 kg",
        hb: uploadedReports.some((r) => r.id === "rep-1") ? "9.6 g/dL" : "10.4 g/dL",
        fetalHeartRate: isMaternal ? "142 bpm" : undefined,
      },
      doctorReview: null,
      createdAt: "Today, Just now",
    };

    savePatient(patientRecord);
    localStorage.setItem("aarogyaVaaniCurrentPatient", JSON.stringify({ patient: patientRecord }));
    localStorage.setItem("aarogyaVaaniCurrentSummary", JSON.stringify(patientRecord));

    setTimeout(() => {
      navigate(`/summary?id=${patientId}`);
    }, 900);
  };

  const currentQ = assessmentQuestions[currentQIndex];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-16">
      <GovHeader
        title="AI Voice & Report Intake"
        subtitle={`Patient: ${patient.name} (${patientId})`}
        showBack={true}
        backPath="/new-patient"
      />

      {/* Main Responsive Container: Full width on desktop, comfortable on mobile */}
      <main className="flex-1 w-full max-w-lg lg:max-w-7xl mx-auto p-3 sm:p-5 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT DESKTOP COLUMN: Patient Info & Parsed Reports Sidebar */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            {/* Patient Badge */}
            <div className="glass-panel p-5 rounded-3xl border border-white/90 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{patient.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-0.5">
                    <span>{patient.age} Yrs</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-800">{patientId}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
                <span>Location: <strong>{patient.village}</strong></span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                  {isMaternal ? "Maternal ANC" : "General OPD"}
                </span>
              </div>
            </div>

            {/* Parsed Reports Overview Card */}
            <div className="glass-panel p-5 rounded-3xl border border-white/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>AI Parsed Reports ({uploadedReports.length})</span>
                </h4>
                {uploadedReports.length > 0 && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {uploadedReports.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No medical reports attached yet. You can upload multiple reports to enhance the AI doctor's diagnostic accuracy.
                </p>
              ) : (
                <div className="space-y-2">
                  {uploadedReports.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="truncate max-w-[200px]">{r.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{r.size}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {r.parsedSummary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT / MAIN COLUMN: The Active Consultation Interface    */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">

            {/* ---------------- STAGE 1: CHIEF COMPLAINT & REPORT UPLOAD ---------------- */}
            {stage === "chief_complaint" && (
              <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-7 border border-white/90 shadow-md space-y-5 animate-fade-in">
                
                {/* Title and Spoken Guidance */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Step 1 of 2 • Tell Symptoms & Upload Reports</span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                    What health issues or symptoms are you facing?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Type or click the microphone to speak freely in your language. You can also upload any test reports or prescriptions.
                  </p>
                </div>

                {/* 1. Voice Clicking + Typing Area */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>Speak or Type Your Symptoms:</span>
                    </label>

                    {/* Microphone Voice Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                        isListening
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-emerald-700 hover:bg-emerald-800 text-white"
                      }`}
                      title="Click to speak your symptoms"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? "Listening..." : "Click to Speak"}</span>
                    </button>
                  </div>

                  {/* Typing Textarea */}
                  <textarea
                    rows={4}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="e.g. Having severe headache and dizziness since yesterday. Vision feels slightly blurry and feverish with body ache..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white resize-none"
                  />
                </div>

                {/* 2. Multi-Report Upload Section (Big Limit) */}
                <div className="glass-card p-4 rounded-2xl space-y-3 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>Upload Medical Reports (Large Limit)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Attach multiple lab tests, prescriptions, or scan reports (PDF, JPG, PNG).
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Reports</span>
                    </button>
                  </div>

                  {/* 1-Click Demo Report Samples */}
                  <div className="bg-slate-100/70 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Add Sample:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAddSampleReport(SAMPLE_REPORT_PRESETS[0])}
                        className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-200 cursor-pointer shadow-2xs"
                      >
                        + MCP Antenatal Card
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleReport(SAMPLE_REPORT_PRESETS[1])}
                        className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-200 cursor-pointer shadow-2xs"
                      >
                        + CBC Blood Count
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleReport(SAMPLE_REPORT_PRESETS[2])}
                        className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-200 cursor-pointer shadow-2xs"
                      >
                        + USG Ultrasound Scan
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Reports List with AI Parsing indicator */}
                  {uploadedReports.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-emerald-800 block">
                        Attached & Parsed ({uploadedReports.length}):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uploadedReports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {report.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveReport(report.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                              {report.parsedSummary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isParsingReport && (
                    <div className="text-center py-2 text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Parsing document & extracting clinical metrics...</span>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartAssessment}
                    className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg active:scale-[0.99]"
                  >
                    <span>Analyze with AI & Start Follow-up Questions</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STAGE 2: AI FOLLOW-UP QUESTIONS WITH 4 CARDS ---------------- */}
            {stage === "assessment" && currentQ && (
              <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-7 border border-white/90 shadow-md space-y-4 animate-fade-in">
                
                {/* Question Header & Speak Question Audio Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      Question {currentQIndex + 1} of {assessmentQuestions.length}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          language === "bn"
                            ? currentQ.bengali
                            : language === "hi"
                            ? currentQ.hindi
                            : currentQ.question
                        )
                      }
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Listen to Question</span>
                    </button>
                  </div>

                  <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                    {language === "bn"
                      ? currentQ.bengali
                      : language === "hi"
                      ? currentQ.hindi
                      : currentQ.question}
                  </h3>
                </div>

                {/* THE 4 OPTION CARDS (Fitted to Mobile Screen using media query) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Choose one of the 4 options:
                  </span>

                  <div className="four-cards-container">
                    {currentQ.options.slice(0, 4).map((opt, i) => {
                      const isSelected =
                        answers[currentQ.id] === opt || currentAnswerText === opt;

                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectOption(opt)}
                          className={`option-card-compact border-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:scale-[1.01] ${
                            isSelected
                              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300"
                              : "bg-white/90 hover:bg-emerald-50/80 text-slate-800 border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm leading-snug">
                              {opt}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                            )}
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold tracking-wider mt-1 ${
                              isSelected ? "text-emerald-100" : "text-slate-400 group-hover:text-emerald-700"
                            }`}
                          >
                            Option {i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audio Input (Speak Button) & Custom Typing Bar */}
                <div className="pt-2 border-t border-slate-200/70 space-y-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Or Speak / Type Custom Answer:
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentAnswerText}
                      onChange={(e) => setCurrentAnswerText(e.target.value)}
                      placeholder="Type alternative answer if needed..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />

                    {/* Dedicated Speak Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-3 py-2 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                        isListening
                          ? "bg-red-600 animate-pulse"
                          : "bg-emerald-700 hover:bg-emerald-800"
                      }`}
                      title="Speak your answer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isListening ? "Listening..." : "Speak"}</span>
                    </button>
                  </div>
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    className="glass-card hover:bg-white text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextWithCurrentText}
                    className="bg-[#0b6651] hover:bg-[#074738] text-white font-black text-xs py-3 px-5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>
                      {currentQIndex === assessmentQuestions.length - 1
                        ? "Compile Clinical Summary"
                        : "Next Question"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STAGE 3: GENERATING SUMMARY SPINNER ---------------- */}
            {stage === "generating" && (
              <div className="glass-panel p-8 rounded-3xl shadow-md border border-white/80 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-spin">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Compiling Doctor Assessment Sheet...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Synthesizing symptom inputs, parsed medical reports, and screening for red flag alerts
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
