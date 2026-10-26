import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Calendar,
  Share2,
  User,
  Settings,
  Heart,
  Stethoscope,
  Phone,
  PhoneCall,
  PhoneOff,
  Paperclip,
  Thermometer,
  Brain,
  LayoutGrid,
  ShieldAlert,
  Mic,
  MicOff,
  ArrowRight,
  Camera,
  Video,
  VideoOff,
  Pill,
  Droplets,
  Flower2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  GripVertical,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  FolderOpen,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient, getPatientDocuments, getAllPatients } from "../../utils/patientStore";
import { sendAIDoctorChatTurn, sendAIDoctorVoiceTurn, saveAIConsultation } from "../../services/api";
import { callSounds } from "../../utils/callSounds";
import { generateClinicalReport } from "../../utils/clinicalReportGenerator";
import ClinicalReportModal from "../../components/ClinicalReportModal";

// Dynamic Emerald Waveform for In-Chat Voice Call View
function EmeraldCallWaveform({ isListening, isSpeaking }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isListening && !isSpeaking) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 12);
    }, 110);
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const barHeights = isSpeaking
    ? [
        [16, 36, 64, 42, 20],
        [24, 52, 78, 56, 28],
        [32, 68, 92, 70, 36],
        [40, 78, 62, 80, 42],
        [28, 60, 84, 64, 30],
        [18, 44, 70, 48, 22],
        [30, 70, 96, 72, 38],
        [38, 80, 66, 82, 44],
        [26, 56, 80, 60, 32],
        [20, 48, 74, 52, 24],
        [34, 74, 90, 68, 34],
        [16, 38, 58, 40, 18],
      ][frame]
    : isListening
    ? [
        [14, 28, 42, 30, 16],
        [20, 36, 54, 38, 22],
        [16, 44, 62, 46, 18],
        [22, 50, 40, 52, 24],
        [18, 38, 56, 40, 20],
        [14, 30, 46, 32, 16],
        [22, 46, 64, 48, 24],
        [18, 52, 42, 54, 20],
        [16, 36, 54, 38, 18],
        [20, 32, 48, 34, 22],
        [18, 48, 60, 44, 20],
        [14, 26, 38, 28, 14],
      ][frame]
    : [12, 16, 20, 16, 12];

  return (
    <div className="flex items-center justify-center gap-2.5 h-16 select-none">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-2 rounded-full bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs transition-all duration-150 ease-out"
          style={{ height: `${barHeights[i]}px`, minHeight: "8px" }}
        />
      ))}
    </div>
  );
}

// Custom SVG Icons matching the reference design
const LungsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v7" />
    <path d="M12 8a4 4 0 0 0-4-4H7a5 5 0 0 0-5 5v3a7 7 0 0 0 7 7h1a2 2 0 0 0 2-2v-4" />
    <path d="M12 8a4 4 0 0 1 4-4h1a5 5 0 0 1 5 5v3a7 7 0 0 1-7 7h-1a2 2 0 0 1-2-2v-4" />
  </svg>
);

const StomachIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3c0 2-1.5 3.5-3 5-2 2-3 4.5-3 7a5 5 0 0 0 9 3c4-1 6-4.5 6-9 0-3-1.5-6-4.5-6H14" />
  </svg>
);

const PregnancyFetusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="3" />
    <path d="M7 13a5 5 0 0 0 10 0v-1a5 5 0 0 0-10 0v1z" />
    <path d="M10 18a4 4 0 0 0 4 0" />
  </svg>
);

export default function PatientAIDoctorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const patient = getCurrentPatient() || {};
  const patientName = patient?.name || "Hare Krishna";

  // Sidebar drag & resize state (Desktop environment)
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(320);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Collapsible right sidebar state
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Active navigation state & modals
  const [activeNav, setActiveNav] = useState("ai-doctor");
  const [selectedLang, setSelectedLang] = useState("EN");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // In-Chat Voice Call States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callPhase, setCallPhase] = useState("idle"); // "idle" | "ringing" | "connected"
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState("listening"); // "connecting" | "listening" | "speaking"
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [liveSubtitle, setLiveSubtitle] = useState("");
  const [callTurns, setCallTurns] = useState([]);
  const callTurnsRef = useRef([]);
  const [showCallTranscript, setShowCallTranscript] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDocumentActionPrompt, setShowDocumentActionPrompt] = useState(false);
  const [showDrivePickerModal, setShowDrivePickerModal] = useState(false);
  const [attachedDocument, setAttachedDocument] = useState(null);
  const attachedDocumentRef = useRef(null);
  const fileUploadInputRef = useRef(null);

  // Voice dictation state (speech-to-text in typing box)
  const [isDictating, setIsDictating] = useState(false);
  const isDictatingRef = useRef(false);
  const dictationRecognitionRef = useRef(null);
  const dictationBaseTextRef = useRef("");
  const currentSessionFinalRef = useRef("");
  const callRecognitionRef = useRef(null);
  const callRecognitionActiveRef = useRef(false);
  const doctorUtteranceRef = useRef(null);
  const speechSafetyTimerRef = useRef(null);
  const userVideoRef = useRef(null);
  const userStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const ringtoneRef = useRef(null);
  const ringingTimerRef = useRef(null);
  const callDurationRef = useRef(0);

  // Chat message stream with initial default question
  const [messages, setMessages] = useState([
    {
      id: "m-init",
      sender: "ai",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello there! 👋\nCan I know what the issue you are facing? What symptoms or health concerns are you experiencing today?`,
      chips: [
        "Fever & Body Ache",
        "Dry Cough & Throat",
        "Stomach Pain & Acidity",
        "Check Recent Lab Reports",
        ...(patient?.pregnancy && !["not pregnant", "none", "n/a", "no"].includes(patient.pregnancy.toLowerCase())
          ? ["Pregnancy Care Guidance"]
          : ["Blood Pressure & Vitals"]),
      ],
      disclaimer: "AarogyaVaani AI provides primary clinical triage. For medical emergencies, visit your nearest Primary Health Centre or dial 108.",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialPromptHandled = useRef(false);

  // Handle queries passed from Dashboard search or auto voice trigger
  useEffect(() => {
    if (location.state?.initialPrompt && !initialPromptHandled.current) {
      initialPromptHandled.current = true;
      handleSend(location.state.initialPrompt);
    }
    if (location.state?.autoStartVoice) {
      setIsCallActive(true);
    }
    return () => {
      // 1. Teardown dictation recognition
      isDictatingRef.current = false;
      if (dictationRecognitionRef.current) {
        try {
          dictationRecognitionRef.current.onend = null;
          dictationRecognitionRef.current.abort();
        } catch {}
      }

      // 2. Teardown call recognition and stop listening immediately
      callRecognitionActiveRef.current = false;
      if (callRecognitionRef.current) {
        try {
          callRecognitionRef.current.onend = null;
          callRecognitionRef.current.abort();
        } catch {}
        callRecognitionRef.current = null;
      }

      // 3. Immediately halt any browser voice speech synthesis
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      // 4. Release all camera & microphone hardware tracks
      if (userStreamRef.current) {
        try {
          userStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
        userStreamRef.current = null;
      }

      // 5. Clear all timers and stop audio tones
      if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
      if (ringingTimerRef.current) clearTimeout(ringingTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callSounds.stopRingtone();
    };
  }, [location.state]);

  // Dragging event listeners for smooth mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        // Clamp left sidebar between 180px and 420px
        const newWidth = Math.min(420, Math.max(180, e.clientX));
        setLeftWidth(newWidth);
      } else if (isDraggingRight) {
        // Clamp right sidebar between 230px and 520px
        const newWidth = Math.min(520, Math.max(230, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft || isDraggingRight) {
        setIsDraggingLeft(false);
        setIsDraggingRight(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (isDraggingLeft || isDraggingRight) {
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
  }, [isDraggingLeft, isDraggingRight]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);



  const handleSend = async (customPrompt) => {
    // If dictation was active, stop and clear
    isDictatingRef.current = false;
    setIsDictating(false);
    if (dictationRecognitionRef.current) {
      try {
        dictationRecognitionRef.current.onend = null;
        dictationRecognitionRef.current.abort();
      } catch {}
    }
    dictationBaseTextRef.current = "";
    currentSessionFinalRef.current = "";

    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText("");
    setIsTyping(true);

    try {
      const langCode = selectedLang === "বাংলা" ? "bn-IN" : selectedLang === "हिंदी" ? "hi-IN" : "en-IN";
      const res = await sendAIDoctorChatTurn({
        patient_id: patient?.patient_ref || patient?.id || "AV-2026-8921",
        user_name: patientName,
        user_message: textToSend,
        language: langCode,
        attachedDocument: attachedDocumentRef.current || attachedDocument,
      });

      if (res && res.ai_message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: res.ai_message,
            chips: res.suggested_options || [
              "Check my recent reports",
              "Is this safe in pregnancy?",
              "When to see a doctor?",
            ],
          },
        ]);
      } else {
        let aiReply = "Thank you for sharing your symptoms. Based on your profile and health context, please monitor yourself carefully. Drink plenty of warm fluids, rest well, and if symptoms persist or worsen, visit your nearest Primary Health Centre.";
        if (textToSend.toLowerCase().includes("pregnancy")) {
          aiReply = "Since you are in your 2nd Trimester (20 weeks), avoid taking any over-the-counter NSAIDs like ibuprofen or aspirin. Paracetamol in recommended therapeutic doses is generally considered safer, but always confirm with your attending Medical Officer. Ensure you maintain adequate hydration and continue your daily Iron & Folic Acid.";
        } else if (textToSend.toLowerCase().includes("report")) {
          aiReply = "I have reviewed your recent records: Your Blood Test Report from 28 Sep 2024 shows Haemoglobin at 10.4 g/dL (mild gestational anaemia), and your Chest X-Ray from 05 Oct 2024 is clear with no consolidation. Your current prescription by Dr. Roy includes Iron & Calcium.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: aiReply,
            chips: ["Suggest home remedies", "Is this safe in pregnancy?", "When to see a doctor?"],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: "I have recorded your symptoms. Please drink warm fluids, rest well, and consult your nearest PHC doctor if fever or pain develops.",
          chips: ["Suggest home remedies", "When to see a doctor?"],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice Dictation (Speech to text in typing input - persistent until explicitly clicked)
  const startDictationSession = () => {
    if (!isDictatingRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (dictationRecognitionRef.current) {
      try {
        dictationRecognitionRef.current.onend = null;
        dictationRecognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";

      currentSessionFinalRef.current = "";

      recognition.onstart = () => {
        if (isDictatingRef.current) {
          setIsDictating(true);
        }
      };

      recognition.onresult = (event) => {
        if (!isDictatingRef.current) return;

        let sessionFinal = "";
        let sessionInterim = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || "";
          if (item.isFinal) {
            sessionFinal += (sessionFinal ? " " : "") + text.trim();
          } else {
            sessionInterim += (sessionInterim ? " " : "") + text.trim();
          }
        }

        currentSessionFinalRef.current = sessionFinal.trim();

        // Assemble full string: base text + all finalized speech + active interim speech
        const spokenParts = [currentSessionFinalRef.current, sessionInterim.trim()].filter(Boolean).join(" ");
        const base = dictationBaseTextRef.current;
        const combined = base ? (spokenParts ? `${base} ${spokenParts}` : base) : spokenParts;
        setInputText(combined);
      };

      recognition.onerror = (e) => {
        console.warn("Dictation notice:", e.error);
        if (e.error === "not-allowed" || e.error === "audio-capture") {
          isDictatingRef.current = false;
          setIsDictating(false);
          alert("Microphone permission was denied or no audio capture device was found.");
          return;
        }
        // Non-fatal errors like 'no-speech', 'network', 'aborted' - do NOT stop dictation!
      };

      recognition.onend = () => {
        // Commit finalized text from this session into base text
        if (currentSessionFinalRef.current) {
          const base = dictationBaseTextRef.current;
          dictationBaseTextRef.current = base
            ? `${base} ${currentSessionFinalRef.current}`
            : currentSessionFinalRef.current;
          currentSessionFinalRef.current = "";
        }

        // Keep running continuously until user explicitly clicks to stop!
        if (isDictatingRef.current) {
          setTimeout(() => {
            if (isDictatingRef.current) {
              startDictationSession();
            }
          }, 80);
        } else {
          setIsDictating(false);
        }
      };

      dictationRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition failed:", err);
      if (isDictatingRef.current) {
        setTimeout(() => {
          if (isDictatingRef.current) startDictationSession();
        }, 250);
      }
    }
  };

  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isDictatingRef.current) {
      // User clicked to stop dictating
      isDictatingRef.current = false;
      setIsDictating(false);
      if (dictationRecognitionRef.current) {
        try {
          dictationRecognitionRef.current.onend = null;
          dictationRecognitionRef.current.abort();
        } catch {}
      }
      dictationBaseTextRef.current = "";
      currentSessionFinalRef.current = "";
      return;
    }

    // User clicked to start dictating
    isDictatingRef.current = true;
    setIsDictating(true);
    dictationBaseTextRef.current = inputText ? inputText.trim() : "";
    currentSessionFinalRef.current = "";

    startDictationSession();
  };

  // AI Doctor Voice Call Session Logic
  const handleStartVoiceCall = () => {
    if (isDictatingRef.current) {
      isDictatingRef.current = false;
      setIsDictating(false);
      if (dictationRecognitionRef.current) {
        try {
          dictationRecognitionRef.current.onend = null;
          dictationRecognitionRef.current.abort();
        } catch {}
      }
      dictationBaseTextRef.current = "";
      currentSessionFinalRef.current = "";
    }

    // 1. Initial State: Start Ringing Phase
    setIsCallActive(true);
    setCallPhase("ringing");
    setCallStatus("connecting");
    setCallDuration(0);
    setCallTurns([]);
    callTurnsRef.current = [];
    attachedDocumentRef.current = null;
    setAttachedDocument(null);
    setShowDocumentActionPrompt(false);
    setShowDrivePickerModal(false);
    setLiveSubtitle("Calling Dr. Preeti Sharma (AI Clinical Officer)...");

    // 2. Start Web Audio API telephone ringing sound
    try {
      ringtoneRef.current = callSounds.startRingtone();
    } catch (e) {
      console.warn("Ringtone could not start:", e);
    }

    // 3. Ring for 2.8s before Dr. Sharma answers the phone
    if (ringingTimerRef.current) clearTimeout(ringingTimerRef.current);
    ringingTimerRef.current = setTimeout(() => {
      // Pick up the call
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
      callSounds.playCallConnectedChime();

      setCallPhase("connected");
      setCallStatus("speaking");

      // Start Call Timer
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          callDurationRef.current = next;
          return next;
        });
      }, 1000);

      // Start Camera Preview
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            userStreamRef.current = stream;
            if (userVideoRef.current) {
              userVideoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn("Camera preview unavailable:", err);
            setIsCameraOn(false);
          });
      }

      // Initial Doctor Greeting on call connect
      const displayName = patientName || "Patient";
      let initialGreeting = `Hello ${displayName}! I am Dr. Preeti Sharma, your clinical officer, here to help you. Can you tell me what health issues or symptoms you are experiencing today? Let's discuss.`;
      let langCode = "en-IN";
      if (language === "hi") {
        initialGreeting = `नमस्ते ${displayName}, मैं डॉ. प्रीति शर्मा हूँ। मैं आपकी मदद के लिए हूँ। क्या आप मुझे बता सकते हैं कि आपको क्या-क्या समस्याएँ हो रही हैं? इस पर थोड़ी बात कर लेते हैं।`;
        langCode = "hi-IN";
      } else if (language === "bn") {
        initialGreeting = `নমস্কার ${displayName}, আমি ডক্টর প্রীতি শর্মা। আপনার সাহায্যের জন্য আমি এখানে আছি। আপনি কি বলতে পারেন আজ আপনার কী কী সমস্যা বা উপসর্গ হচ্ছে? আসুন একটু আলোচনা করে নিই।`;
        langCode = "bn-IN";
      }

      setLiveSubtitle(`Dr. Sharma: "${initialGreeting}"`);
      const greetingTurn = {
        role: "assistant",
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      callTurnsRef.current = [greetingTurn];
      setCallTurns([greetingTurn]);

      speakDoctorUtterance(initialGreeting, langCode, () => {
        setCallStatus("listening");
        startCallRecognition();
      });
    }, 2800);
  };

  const handleCancelCall = () => {
    if (ringingTimerRef.current) {
      clearTimeout(ringingTimerRef.current);
      ringingTimerRef.current = null;
    }
    if (speechSafetyTimerRef.current) {
      clearTimeout(speechSafetyTimerRef.current);
      speechSafetyTimerRef.current = null;
    }
    callRecognitionActiveRef.current = false;
    if (callRecognitionRef.current) {
      try { callRecognitionRef.current.abort(); } catch {}
      callRecognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    callSounds.stopRingtone();
    callSounds.playCallEndTone();
    if (userStreamRef.current) {
      try {
        userStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      userStreamRef.current = null;
    }
    setIsCallActive(false);
    setCallPhase("idle");
    setCallStatus("idle");
    setLiveSubtitle("");
    callTurnsRef.current = [];
    setCallTurns([]);
    attachedDocumentRef.current = null;
    setAttachedDocument(null);
    setShowDocumentActionPrompt(false);
    setShowDrivePickerModal(false);
  };

  // Sync mic mute state with voice recognition during call
  useEffect(() => {
    if (isCallActive && callPhase === "connected") {
      if (isMicMuted) {
        callRecognitionActiveRef.current = false;
        if (callRecognitionRef.current) {
          try {
            callRecognitionRef.current.onend = null;
            callRecognitionRef.current.abort();
          } catch {}
        }
        setLiveSubtitle("(Microphone muted)");
      } else if (callStatus === "listening") {
        startCallRecognition();
      }
    }
  }, [isMicMuted, isCallActive, callPhase]);

  const speakDoctorUtterance = (text, langCode, onComplete) => {
    if (speechSafetyTimerRef.current) {
      clearTimeout(speechSafetyTimerRef.current);
      speechSafetyTimerRef.current = null;
    }

    let isDone = false;
    const triggerComplete = () => {
      if (isDone) return;
      isDone = true;
      if (speechSafetyTimerRef.current) {
        clearTimeout(speechSafetyTimerRef.current);
        speechSafetyTimerRef.current = null;
      }
      if (onComplete) onComplete();
    };

    if (isSoundMuted || !window.speechSynthesis) {
      triggerComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // Retain reference on ref to prevent Chrome garbage-collection cutting audio
      doctorUtteranceRef.current = utterance;
      utterance.rate = 1.0;
      utterance.pitch = 1.03;
      const targetLang = langCode || (language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN");
      utterance.lang = targetLang;

      // Select natural Indian or localized voice
      const voices = window.speechSynthesis.getVoices() || [];
      const matched = voices.find(
        (v) =>
          (v.lang.startsWith(targetLang.slice(0, 2)) || v.lang.startsWith("en-IN") || v.lang.startsWith("hi")) &&
          (v.name.includes("Female") || v.name.includes("India") || v.name.includes("Google") || v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));

      if (matched) utterance.voice = matched;

      utterance.onstart = () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      };

      utterance.onend = () => {
        triggerComplete();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        triggerComplete();
      };

      // Safeguard timeout: If browser suppresses audio or onend fails to fire, continue so user can speak
      const maxMs = Math.max(3500, (text.length * 75) + 2000);
      speechSafetyTimerRef.current = setTimeout(() => {
        triggerComplete();
      }, maxMs);

      window.speechSynthesis.speak(utterance);
      setTimeout(() => {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 50);
    } catch {
      triggerComplete();
    }
  };

  const processUserSpokenTurn = async (userSpeech) => {
    if (!userSpeech || !userSpeech.trim()) return;
    const cleanSpeech = userSpeech.trim();

    callRecognitionActiveRef.current = false;
    if (callRecognitionRef.current) {
      try {
        callRecognitionRef.current.onend = null;
        callRecognitionRef.current.stop();
      } catch {}
    }

    setLiveSubtitle(`You: "${cleanSpeech}"`);
    setCallStatus("speaking");

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userTurn = { role: "user", text: cleanSpeech, timestamp: timeStr };
    const currentTurns = [...callTurnsRef.current, userTurn];
    callTurnsRef.current = currentTurns;
    setCallTurns(currentTurns);

    const langCode = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";

    // Diagnostic question progression helper for fallback / offline mode
    const getProgressionReply = (turnsList) => {
      const lower = cleanSpeech.toLowerCase();
      const userTurnsCount = turnsList.filter((t) => t.role === "user").length;
      const alreadyAskedOtherIssues = turnsList.some(
        (t) =>
          t.role === "assistant" &&
          (t.text?.includes("इसके अलावा") ||
           t.text?.includes("অন্য কোনো সমস্যা") ||
           t.text?.includes("other issues or symptoms"))
      );
      const isThatsIt = [
        "that's it", "thats it", "that is it", "that's all", "thats all", "that is all",
        "nothing else", "no other", "no more", "finished", "done", "bas yahi", "bas itna",
        "aur kuch nahi", "kuch nahi", "etukui", "aar kichu na", "ar kichu na", "aar nei", "ar nei",
        "continue", "proceed", "go ahead",
        "और कुछ नहीं", "बस यही", "बस इतना", "कुछ नहीं", "आगे बोलो", "आगे बढ़ो", "आगे बताइए", "नहीं है", "यही है", "और कुछ नहीं है",
        "আর কিছু নেই", "এটুকুই", "আর কোনো সমস্যা নেই", "কিছু নেই", "আর নেই", "এটাই সব"
      ].some((w) => lower.includes(w) || cleanSpeech.includes(w));

      if (userTurnsCount === 1 && !isThatsIt && !alreadyAskedOtherIssues) {
        return language === "hi"
          ? "मैंने यह नोट कर लिया है। क्या आपको इसके अलावा कोई और समस्या या तकलीफ है, या बस यही है?"
          : language === "bn"
          ? "আমি এটি নোট করেছি। এর বাইরে কি আপনার অন্য কোনো সমস্যা বা উপসর্গ আছে, নাকি এটুকুই?"
          : "I have noted that. Do you have any other issues or symptoms, or is that all?";
      } else if (isThatsIt || userTurnsCount === 2 || (userTurnsCount === 1 && alreadyAskedOtherIssues)) {
        return language === "hi"
          ? "समझ गया। यह समस्या कितने दिनों से हो रही है, और क्या यह अचानक शुरू हुई थी या धीरे-धीरे?"
          : language === "bn"
          ? "বুঝতে পেরেছি। এই সমস্যাটি কত দিন ধরে হচ্ছে, এবং এটি কি হঠাৎ শুরু হয়েছে নাকি ধীরে ধীরে?"
          : "Understood. How many days has this been going on, and did it start suddenly or gradually?";
      } else if (userTurnsCount === 3) {
        return language === "hi"
          ? "ठीक है। 1 से 10 के पैमाने पर तकलीफ कितनी तेज है, और क्या यह लगातार बनी रहती है या बीच-बीच में आती है?"
          : language === "bn"
          ? "ঠিক আছে। ১ থেকে ১০-এর স্কেলে কষ্ট কতটা তীব্র, আর এটি কি সারাক্ষণ থাকে নাকি মাঝে মাঝে আসে?"
          : "Got it. On a scale of 1 to 10, how severe is the discomfort, and is it constant or does it come and go?";
      } else if (userTurnsCount === 4) {
        return language === "hi"
          ? "नोट कर लिया। क्या इसके साथ आपको ठंड लगना, सांस फूलना, सीने में भारीपन या चक्कर आने जैसी कोई तकलीफ है?"
          : language === "bn"
          ? "নোট করলাম। এর সাথে কি আপনার কাঁপুনি, শ্বাসকষ্ট, বুকে চাপ বা মাথা ঘোরার মতো কোনো লক্ষণ আছে?"
          : "Noted. Are you experiencing any chills, shortness of breath, chest tightness, or dizziness with this?";
      } else if (userTurnsCount === 5) {
        return language === "hi"
          ? "क्या आपने इसके लिए अब तक कोई घरेलू उपचार, पैरासिटामोल या कोई दवाई ली है?"
          : language === "bn"
          ? "আপনি কি এর জন্য ইতিমধ্যে কোনো ঘরোয়া প্রতিকার, প্যারাসিটামল বা কোনো ওষুধ খেয়েছেন?"
          : "Have you taken any home remedies, paracetamol, or prescribed medicines for this so far?";
      } else {
        return language === "hi"
          ? "पूरी जानकारी देने के लिए धन्यवाद। आपके लक्षणों के अनुसार पर्याप्त आराम करें और गुनगुना पानी पिएं। यदि तकलीफ 3 दिनों से अधिक रहे, तो नजदीकी प्राथमिक स्वास्थ्य केंद्र पर दिखाएं।"
          : language === "bn"
          ? "সমস্ত তথ্য জানানোর জন্য ধন্যবাদ। আপনার উপসর্গের ভিত্তিতে পর্যাপ্ত বিশ্রাম নিন এবং উষ্ণ তরল খাবার খান। যদি সমস্যা ৩ দিনের বেশি থাকে, তবে নিকটস্থ স্বাস্থ্যকেন্দ্রে ডাক্তার দেখান।"
          : "Thank you for explaining all the details. Based on your symptoms, please take adequate rest and drink warm fluids. If symptoms persist or worsen, visit your nearest Primary Health Centre.";
      }
    };

    // Auto-detect if user mentioned medical tests / reports / prescriptions
    const lowerSpeech = cleanSpeech.toLowerCase();
    const mentionsReport = [
      "test", "report", "prescription", "blood", "xray", "scan", "ha report", "haan report",
      "रिपोर्ट", "जांच", "पर्चा", "পরীক্ষা", "প্রেসক্রিপশন", "হ্যাঁ আছে", "हाँ है", "yes i have", "yes"
    ].some((w) => lowerSpeech.includes(w) || cleanSpeech.includes(w));
    if (mentionsReport && !attachedDocumentRef.current) {
      setShowDocumentActionPrompt(true);
    }

    try {
      const res = await sendAIDoctorVoiceTurn({
        patientId: patient?.patient_ref || patient?.id || "AV-8921",
        userName: patientName,
        userMessage: cleanSpeech,
        language: langCode,
        history: currentTurns,
        attachedDocument: attachedDocumentRef.current,
      });

      if (res?.request_document) {
        setShowDocumentActionPrompt(true);
      }

      let reply = res?.ai_message;

      // Prevent repetitive loop if server returned identical question repeatedly
      const alreadyAskedOther = currentTurns.some(
        (t) =>
          t.role === "assistant" &&
          (t.text?.includes("इसके अलावा") ||
           t.text?.includes("অন্য কোনো সমস্যা") ||
           t.text?.includes("other issues or symptoms"))
      );
      if (reply && alreadyAskedOther && (reply.includes("इसके अलावा") || reply.includes("অন্য কোনো সমস্যা") || reply.includes("other issues or symptoms"))) {
        reply = getProgressionReply(currentTurns);
      }

      if (!reply) {
        reply = getProgressionReply(currentTurns);
      }

      setLiveSubtitle(`Dr. Sharma: "${reply}"`);
      const aiTurn = {
        role: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const updatedWithAi = [...callTurnsRef.current, aiTurn];
      callTurnsRef.current = updatedWithAi;
      setCallTurns(updatedWithAi);

      speakDoctorUtterance(reply, langCode, () => {
        setCallStatus("listening");
        startCallRecognition();
      });
    } catch (err) {
      console.warn("Voice turn fallback:", err);
      const fallbackReply = getProgressionReply(currentTurns);

      setLiveSubtitle(`Dr. Sharma: "${fallbackReply}"`);
      const fallbackAiTurn = {
        role: "assistant",
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const updatedFallback = [...callTurnsRef.current, fallbackAiTurn];
      callTurnsRef.current = updatedFallback;
      setCallTurns(updatedFallback);

      speakDoctorUtterance(fallbackReply, langCode, () => {
        setCallStatus("listening");
        startCallRecognition();
      });
    }
  };

  const handleAttachDocumentFromDrive = (doc) => {
    if (!doc) return;
    attachedDocumentRef.current = doc;
    setAttachedDocument(doc);
    setShowDrivePickerModal(false);
    setShowDocumentActionPrompt(false);
    const docName = doc.title || doc.fileName || "medical report";
    const userSpokenMsg =
      language === "hi"
        ? `मैंने अपनी मेडिकल रिपोर्ट (${docName}) संलग्न कर दी है। कृपया इसे देखकर बताएं।`
        : language === "bn"
        ? `আমি আমার মেডিকেল রিপোর্ট (${docName}) যুক্ত করেছি। দয়া করে দেখে পরামর্শ দিন।`
        : `I have attached my ${docName}. Please review its findings and guide me.`;
    processUserSpokenTurn(userSpokenMsg);
  };

  const handleFileUploadAndAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const docName = file.name.replace(/\.[^/.]+$/, "");
    const lowerName = file.name.toLowerCase();
    const isLab = lowerName.includes("blood") || lowerName.includes("test") || lowerName.includes("lab");
    const isScan = lowerName.includes("xray") || lowerName.includes("scan") || lowerName.includes("radiology");
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docName,
      fileName: file.name,
      category: isLab ? "Lab Reports" : isScan ? "Imaging" : "Prescription",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      fileSize: `${Math.round(file.size / 1024)} KB`,
      summary: `Patient uploaded document (${file.name}) for real-time clinical review.`,
      verified: true,
    };
    attachedDocumentRef.current = newDoc;
    setAttachedDocument(newDoc);
    setShowDocumentActionPrompt(false);
    const userSpokenMsg =
      language === "hi"
        ? `मैंने नया दस्तावेज़ (${newDoc.title}) अपलोड किया है। कृपया इसे देखकर सलाह दें।`
        : language === "bn"
        ? `আমি নতুন নথি (${newDoc.title}) আপলোড করেছি। দয়া করে এটি পরীক্ষা করে জানান।`
        : `I have uploaded my document ${newDoc.title}. Please review it and advise.`;
    processUserSpokenTurn(userSpokenMsg);
    if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
  };

  const startCallRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      setLiveSubtitle("Microphone recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (callRecognitionRef.current) {
      try {
        callRecognitionRef.current.onend = null;
        callRecognitionRef.current.abort();
      } catch {}
      callRecognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      callRecognitionRef.current = recognition;
      callRecognitionActiveRef.current = true;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";

      recognition.onstart = () => {
        setCallStatus("listening");
      };

      recognition.onresult = (event) => {
        let interimText = "";
        let finalPhrase = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalPhrase += (finalPhrase ? " " : "") + transcript;
          } else {
            interimText += (interimText ? " " : "") + transcript;
          }
        }

        if (interimText.trim()) {
          setLiveSubtitle(`You: "${interimText.trim()}"`);
        }

        if (finalPhrase.trim()) {
          callRecognitionActiveRef.current = false;
          try {
            recognition.onend = null;
            recognition.stop();
          } catch {}
          processUserSpokenTurn(finalPhrase.trim());
        }
      };

      recognition.onerror = (e) => {
        console.warn("[SPEECH RECOGNITION NOTICE]", e.error);
        if (e.error === "not-allowed" || e.error === "audio-capture") {
          callRecognitionActiveRef.current = false;
          setLiveSubtitle("Microphone access denied. Please click the camera/mic icon in the browser URL bar to allow microphone.");
        }
      };

      recognition.onend = () => {
        // Automatically restart listening if still in connected call state and waiting for user speech
        if (callRecognitionActiveRef.current) {
          setTimeout(() => {
            if (callRecognitionActiveRef.current) {
              startCallRecognition();
            }
          }, 120);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
    }
  };

  const handleEndCall = useCallback(async () => {
    // 1. Play end call tone & stop ringing if still ringing
    callSounds.playCallEndTone();
    callSounds.stopRingtone();
    if (ringingTimerRef.current) {
      clearTimeout(ringingTimerRef.current);
      ringingTimerRef.current = null;
    }

    // 2. Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // 3. Stop camera and microphone media streams completely to turn off browser mic/cam
    if (userStreamRef.current) {
      try {
        userStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      userStreamRef.current = null;
    }

    // 4. Stop speech recognition & synthesis aggressively
    if (speechSafetyTimerRef.current) {
      clearTimeout(speechSafetyTimerRef.current);
      speechSafetyTimerRef.current = null;
    }
    callRecognitionActiveRef.current = false;
    if (callRecognitionRef.current) {
      try {
        callRecognitionRef.current.onend = null;
        callRecognitionRef.current.abort();
      } catch {}
      callRecognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 5. Completely reset call states so nothing remains active or listening in the background
    setIsCallActive(false);
    setCallPhase("idle");
    setCallStatus("idle");
    setLiveSubtitle("");
    setIsDictating(false);
    isDictatingRef.current = false;

    const duration = callDurationRef.current || callDuration || 30;

    // 5. Generate Comprehensive Clinical Report
    const turnsToUse = (callTurnsRef.current && callTurnsRef.current.length > 0)
      ? callTurnsRef.current
      : (callTurns.length > 0 ? callTurns : [
          { role: "assistant", text: "Hello, what are your issues, may I know?" },
          { role: "user", text: "General health review and routine follow up." },
        ]);

    const clinicalReport = generateClinicalReport({
      patient,
      callTurns: turnsToUse,
      callDuration: duration,
      language: language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN",
      attachedDocument: attachedDocumentRef.current,
    });

    setGeneratedReport(clinicalReport);
    setShowReportModal(true);

    // 6. Save consultation to Supabase & backend
    try {
      await saveAIConsultation({
        id: clinicalReport.reportId,
        consultation_id: clinicalReport.reportId,
        patient_id: patient?.patient_ref || patient?.id || "AV-8921",
        user_name: patientName,
        started_at: clinicalReport.generatedAt,
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        language_used: clinicalReport.languageUsed,
        chief_complaint: clinicalReport.chiefComplaint,
        symptoms_timeline: clinicalReport.symptomsTimeline,
        transcript: turnsToUse,
        danger_signs: clinicalReport.dangerSigns,
        triage_level: clinicalReport.triageLevel,
        clinical_summary: clinicalReport.clinicalSummary,
      });
    } catch (err) {
      console.warn("Could not save to remote backend, continuing with local store:", err);
    }

    // 7. Update patientStore so Doctor Dashboard and Consultations page reflect the new report immediately
    try {
      const patientId = patient?.patient_ref || patient?.id || "AV-2026-8921";
      const normalizedPId = patientId.startsWith("AV-") && patientId.length === 7 ? `AV-2026-${patientId.slice(3)}` : patientId;

      const cachedKey = `aarogya_consultations_${normalizedPId}`;
      const existingCached = sessionStorage.getItem(cachedKey);
      let list = [];
      if (existingCached) {
        try { list = JSON.parse(existingCached); } catch {}
      }

      const newConsultationItem = {
        id: clinicalReport.reportId,
        title: clinicalReport.chiefComplaint.length > 35 ? clinicalReport.chiefComplaint.slice(0, 35) + "..." : clinicalReport.chiefComplaint,
        chief_complaint: clinicalReport.chiefComplaint,
        date: clinicalReport.displayDate,
        duration: clinicalReport.durationFormatted,
        duration_seconds: duration,
        language: language === "bn" ? "Bengali" : language === "hi" ? "Hindi" : "English",
        language_code: clinicalReport.languageUsed,
        triage_level: clinicalReport.triageLevel,
        icon_type: clinicalReport.triageLevel === "EMERGENCY" ? "stethoscope" : "document",
        icon_bg: clinicalReport.triageLevel === "EMERGENCY" ? "bg-[#fee2e2]" : "bg-[#e0f2fe]",
        icon_color: clinicalReport.triageLevel === "EMERGENCY" ? "text-[#dc2626]" : "text-[#0284c7]",
        doctor_status: "PENDING",
        doctor_name: "Dr. Preeti Sharma (AI Clinical Officer)",
        doctor_facility: "Tripura Tele-Health Command Center",
        reviewed_at: `${clinicalReport.displayDate}, ${clinicalReport.displayTime}`,
        clinical_summary: clinicalReport.clinicalSummary,
        danger_signs: clinicalReport.dangerSigns,
        doctor_notes: "AI tele-intake completed. Awaiting physician counter-signature.",
        prescription: clinicalReport.prescriptions.map((rx) => ({
          name: rx.name,
          dosage: rx.dosage,
          duration: rx.duration,
        })),
        transcript: turnsToUse,
      };

      const updatedList = [newConsultationItem, ...list.filter((c) => c.id !== clinicalReport.reportId)];
      sessionStorage.setItem(cachedKey, JSON.stringify(updatedList));

      const allP = getAllPatients();
      const pIdx = allP.findIndex((p) => p.id === patientId || p.altId === patientId || p.id === normalizedPId);
      if (pIdx >= 0) {
        allP[pIdx].consultationsCount = (allP[pIdx].consultationsCount || 0) + 1;
        allP[pIdx].chiefComplaint = clinicalReport.chiefComplaint;
        allP[pIdx].status = "Needs Review";
        allP[pIdx].triage = clinicalReport.triageLevel === "EMERGENCY" ? "Emergency" : clinicalReport.triageLevel === "MONITOR" ? "Monitor" : "Stable";
        localStorage.setItem("aarogyaVaaniAllPatients", JSON.stringify(allP));
        window.dispatchEvent(new CustomEvent("aarogya_patient_updated", { detail: allP[pIdx] }));
      }
    } catch (e) {
      console.warn("Failed to update local cache:", e);
    }

    // 8. Add dialogue turns to main chat messages stream
    setMessages((prev) => [
      ...prev,
      ...turnsToUse.map((turn, idx) => ({
        id: `call-turn-${Date.now()}-${idx}`,
        sender: turn.role === "assistant" ? "ai" : "user",
        time: turn.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: turn.text,
      })),
      {
        id: `call-summary-${Date.now()}`,
        sender: "ai",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Voice consultation completed with Dr. Preeti Sharma.\n\nChief Complaint: ${clinicalReport.chiefComplaint}\nTriage Level: ${clinicalReport.triageLevel}\nProvisional Diagnosis: ${clinicalReport.provisionalDiagnosis}\n\nYour clinical consultation report has been recorded. Click below to view the full report.`,
        chips: ["View Clinical Report", "Book Doctor Appointment", "Ask a Question"],
      },
    ]);

    setIsCallActive(false);
    setCallPhase("idle");
    setCallDuration(0);
    callDurationRef.current = 0;
    setLiveSubtitle("");
    setCallStatus("listening");
  }, [callTurns, patient, patientName, language, callDuration]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (ringingTimerRef.current) clearTimeout(ringingTimerRef.current);
      callSounds.stopRingtone();
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (callRecognitionRef.current) {
        try { callRecognitionRef.current.stop(); } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleChipClick = (chipText) => {
    if (chipText === "View Clinical Report" && generatedReport) {
      setShowReportModal(true);
      return;
    }
    handleSend(chipText);
  };



  const handleNavClick = (navKey, path) => {
    setActiveNav(navKey);
    if (path) navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader onStartCall={handleStartVoiceCall} />

      {/* 2. BODY CONTAINER: SIDEBAR + RESIZER + WORKSPACE */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* ============================================================================== */}
      {/* 1. UNIVERSAL LEFT SIDEBAR: DRAGGABLE & REUSABLE                                */}
      {/* ============================================================================== */}
      <PatientSidebar
        activeNav="ai-doctor"
        width={leftWidth}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* ============================================================================== */}
      {/* 2. LEFT RESIZER HANDLE (DRAG TO RESIZE LEFT SIDEBAR)                           */}
      {/* ============================================================================== */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          onDoubleClick={() => setLeftWidth(240)}
          className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
          title="Drag to resize left sidebar (Double-click to reset)"
        />
      )}

      {/* ============================================================================== */}
      {/* 3. CENTER COLUMN: AI DOCTOR CONSULTATION DESK (FULL VIEWPORT HEIGHT)           */}
      {/* ============================================================================== */}
      <main className="flex-1 min-w-[360px] h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden relative">
        
        {/* Top Header of AI Doctor Screen */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] text-[#059669] flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Talk to AI Doctor</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-tight">
                Get instant guidance in your language. Ask about symptoms, medicines, reports or pregnancy care.
              </p>
            </div>
          </div>
        </div>

        {/* CONDITIONAL RENDER: IN-CHAT AI DOCTOR CALL VIEW VS REGULAR CHAT STREAM */}
        {isCallActive ? (
          /* ========================================================================= */
          /* IN-CHAT AI DOCTOR CALL VIEW (ChatGPT-Style, Warm Clean Theme, Portrait)   */
          /* ========================================================================= */
          <div className="flex-1 w-full h-full flex flex-col justify-between bg-gradient-to-b from-white via-slate-50 to-emerald-50/20 text-slate-900 overflow-hidden relative select-none p-4 sm:p-6">
            {/* Top Bar of Call View */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    callPhase === "ringing"
                      ? "bg-amber-500 animate-ping shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                      : "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-slate-900">Dr. Preeti Sharma (AI Clinical Officer)</span>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    {callPhase === "ringing" ? (
                      <span className="text-amber-700 font-bold animate-pulse">Ringing... Connecting</span>
                    ) : (
                      <>
                        <span>Active Voice Consultation</span>
                        <span>•</span>
                        <span className="font-mono">
                          {Math.floor(callDuration / 60).toString().padStart(2, "0")}:
                          {(callDuration % 60).toString().padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {callPhase === "connected" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCallTranscript((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      showCallTranscript
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {showCallTranscript ? "Hide Transcript" : "Live Transcript"}
                  </button>
                </div>
              )}
            </div>

            {/* Center Area: AI Doctor Photography Portrait + Waveform + Subtitle */}
            <div className="flex-1 flex flex-col items-center justify-center my-auto text-center px-4 max-w-xl mx-auto w-full">
              {/* Doctor Portrait with Soft Pulsing Halo Rings */}
              <div className="relative mb-4">
                <div
                  className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-xl border-4 transition-all duration-300 ${
                    callPhase === "ringing"
                      ? "border-emerald-500 ring-8 ring-emerald-500/30 scale-105 animate-pulse"
                      : callStatus === "speaking"
                      ? "border-emerald-500 ring-8 ring-emerald-500/20 scale-105"
                      : callStatus === "listening"
                      ? "border-teal-500 ring-6 ring-teal-500/15"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src="/ai_doctor_portrait.jpg"
                    alt="Dr. Preeti Sharma AI Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white border-2 border-emerald-500 rounded-full p-1.5 shadow-md">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Dr. Preeti Sharma
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AarogyaVaani Primary Healthcare Officer · Tripura PHC
              </p>

              {/* Status Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {callPhase === "ringing"
                    ? "Ringing Dr. Preeti Sharma... (Connecting)"
                    : callStatus === "speaking"
                    ? "Dr. Sharma is speaking..."
                    : callStatus === "listening"
                    ? "Listening to you... (Speak now)"
                    : "Connecting to AI Doctor..."}
                </span>
              </div>

              {/* Dynamic Emerald 5-Bar Audio Waveform */}
              <div className="mt-4">
                <EmeraldCallWaveform
                  isListening={(callPhase === "connected" && callStatus === "listening" && !isMicMuted) || callPhase === "ringing"}
                  isSpeaking={callPhase === "connected" && callStatus === "speaking"}
                />
              </div>

              {/* Real-time Subtitle Banner */}
              <div className="mt-3 min-h-[48px] w-full max-w-lg bg-white/90 border border-slate-200/90 rounded-2xl p-3 shadow-xs text-xs text-slate-800 leading-relaxed font-medium">
                {liveSubtitle || (callPhase === "ringing" ? "Calling Dr. Preeti Sharma... Please wait while the call connects." : "Speak into your microphone. Dr. Sharma will respond in your language.")}
              </div>

              {/* In-Call Attached Document Badge */}
              {attachedDocument && (
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium shadow-xs animate-in fade-in duration-200">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold">Attached Report:</span>
                  <span className="truncate max-w-[200px] font-semibold">{attachedDocument.title || attachedDocument.fileName}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">{attachedDocument.category}</span>
                  <button
                    type="button"
                    onClick={() => {
                      attachedDocumentRef.current = null;
                      setAttachedDocument(null);
                    }}
                    className="ml-1 text-emerald-700 hover:text-rose-600 transition cursor-pointer"
                    title="Remove attached document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* In-Call Document Action Prompt (Triggered by AI Doctor or Progression) */}
              {showDocumentActionPrompt && !attachedDocument && (
                <div className="mt-3 w-full max-w-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-3.5 shadow-md text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Do you have any medical test reports or prescriptions?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDocumentActionPrompt(false)}
                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Share your diagnostic reports or prescriptions so Dr. Sharma can review the clinical findings.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDrivePickerModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Select from Medical Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileUploadInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 active:scale-95 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Upload New Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDocumentActionPrompt(false);
                        processUserSpokenTurn("No, I don't have any medical test reports or prescriptions right now.");
                      }}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium cursor-pointer"
                    >
                      No tests done
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Quick-Issue Suggestions Bar during Call */}
              {callPhase === "connected" && callStatus === "listening" && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
                  {[
                    "Fever & headache since 2 days",
                    "Dry cough & sore throat",
                    "Stomach burning & cramps",
                    patient?.pregnancy && !["not pregnant", "none", "n/a", "no"].includes(patient.pregnancy.toLowerCase())
                      ? "Check pregnancy care"
                      : "Blood pressure & chest check",
                  ].map((issue, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => processUserSpokenTurn(issue)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-[11px] font-semibold text-emerald-800 shadow-2xs transition cursor-pointer"
                    >
                      💬 {issue}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Webcam Picture-In-Picture (PIP) Tile in Bottom-Right */}
            {callPhase === "connected" && (
              <div className="absolute bottom-24 right-4 sm:right-6 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-800 z-30">
                {isCameraOn ? (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                    <User className="w-7 h-7 text-emerald-400/60 mb-1" />
                    <span className="text-[10px] font-bold">Camera Off</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[9.5px] font-bold text-white">
                  You
                </div>
              </div>
            )}

            {/* Transcript Drawer Overlay if Toggled */}
            {showCallTranscript && (
              <div className="absolute top-16 left-4 sm:left-6 max-w-sm w-full max-h-64 bg-white/95 border border-slate-200 rounded-2xl p-3.5 shadow-xl overflow-y-auto z-30 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Live Consultation Log</span>
                  <button onClick={() => setShowCallTranscript(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {callTurns.map((turn, i) => (
                    <div key={i}>
                      <strong className={turn.role === "user" ? "text-slate-900" : "text-emerald-700"}>
                        {turn.role === "user" ? "You: " : "Dr. Sharma: "}
                      </strong>
                      <span className="text-slate-600">{turn.text}</span>
                    </div>
                  ))}
                  {callTurns.length === 0 && (
                    <p className="text-slate-400 italic">No spoken turns recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Call Controls Bar */}
            <div className="w-full max-w-md mx-auto p-2 bg-white/95 border border-slate-200 rounded-2xl shadow-xl flex items-center justify-between gap-3 z-30 shrink-0">
              {callPhase === "ringing" ? (
                /* Ringing Phase: Single prominent Cancel Call button */
                <div className="w-full flex items-center justify-between px-2">
                  <span className="text-xs text-slate-500 font-medium animate-pulse">Calling doctor...</span>
                  <button
                    type="button"
                    onClick={handleCancelCall}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Cancel Call</span>
                  </button>
                </div>
              ) : (
                /* Connected Phase: Full controls + End Call & Generate Report */
                <>
                  <div className="flex items-center gap-2">
                    {/* Mic Mute Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsMicMuted((prev) => !prev)}
                      className={`p-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isMicMuted
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Camera Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsCameraOn((prev) => !prev)}
                      className={`p-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isCameraOn
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-amber-100 text-amber-700 border border-amber-300"
                      }`}
                      title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                    >
                      {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>

                    {/* Speaker Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsSoundMuted((prev) => !prev)}
                      className="p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Attach / Share Document from Drive */}
                    <button
                      type="button"
                      onClick={() => setShowDrivePickerModal(true)}
                      className={`p-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        attachedDocument
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      title={attachedDocument ? `Attached: ${attachedDocument.title || attachedDocument.fileName}` : "Attach Medical Report from Drive"}
                    >
                      <FolderOpen className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>

                  {/* Hidden File Input for in-call document upload */}
                  <input
                    ref={fileUploadInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUploadAndAttach}
                  />

                  {/* End Call & Generate Report Button */}
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
                    title="End Consultation Call & Generate Report"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End & View Report</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* REGULAR CHAT STREAM & HIGH CONTRAST TYPING AREA                           */
          /* ========================================================================= */
          <>
            {/* Conversation Stream (Scrollable) */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {/* Timestamp date badge */}
              <div className="flex justify-center">
                <span className="bg-slate-100/90 text-slate-500 text-[11px] font-medium px-3 py-0.5 rounded-full">
                  Today, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Rendered Messages */}
              {messages.map((m) => {
                if (m.sender === "ai") {
                  return (
                    <div key={m.id} className="flex items-start gap-2.5 max-w-[90%]">
                      <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-800 leading-relaxed shadow-2xs whitespace-pre-line">
                          {m.text}

                          {/* Optional Warning Disclaimer Box */}
                          {m.disclaimer && (
                            <div className="mt-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl p-2 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{m.disclaimer}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 pl-1">{m.time}</span>

                        {/* Optional Follow-up Suggestion Chips */}
                        {m.chips && m.chips.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {m.chips.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleChipClick(chip)}
                                className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:border-emerald-400 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs transition cursor-pointer"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // User Message
                return (
                  <div key={m.id} className="flex items-start justify-end gap-2.5 self-end ml-auto max-w-[85%]">
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-[#e0f2fe] text-slate-900 border border-sky-100 rounded-2xl rounded-tr-sm p-3 text-xs leading-relaxed shadow-2xs">
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 pr-1">{m.time}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {patientName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                  <span>AI Doctor is preparing clinical response...</span>
                </div>
              )}
            </div>

            {/* HIGH-CONTRAST TYPING AREA WITH MIC DICTATION & CALL BUTTONS */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              {attachedDocument && (
                <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium shadow-2xs animate-in fade-in">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-bold">Attached:</span>
                    <span className="truncate font-semibold">{attachedDocument.title || attachedDocument.fileName}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold shrink-0">{attachedDocument.category}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedDocument(null);
                      attachedDocumentRef.current = null;
                    }}
                    className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition cursor-pointer"
                    title="Remove attached document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="border-2 border-slate-300 dark:border-slate-600 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl bg-slate-50/70 hover:bg-white dark:bg-slate-800 shadow-sm px-3.5 py-2 flex items-center gap-2.5 transition">
                <button
                  type="button"
                  onClick={() => setShowDrivePickerModal(true)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition p-1 cursor-pointer"
                  title="Attach report from Medical Drive"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  id="ai-chat-input-box"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isDictating
                      ? "Listening to your voice... speak now"
                      : "Describe your symptoms or ask a health question..."
                  }
                  className="flex-1 text-xs sm:text-sm bg-transparent outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
                />

                {/* 2 Voice Options: Mic (Dictation) & Audio Call (Voice Mode) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Option 1: Mic Button (Dictation / Speech-to-Text) */}
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                      isDictating
                        ? "bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400/50"
                        : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                    title={isDictating ? "Stop Voice Dictation" : "Voice Dictation (Speak to Type)"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Option 2: Audio Call Button (Interactive Voice Consultation) */}
                  <button
                    type="button"
                    onClick={handleStartVoiceCall}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                    title="Start Audio Call (Talk with AI Doctor)"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!inputText.trim()}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 dark:bg-emerald-500 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                    title="Send Message"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ============================================================================== */}
      {/* 4. RIGHT SIDEBAR DIVIDER & COLLAPSE/EXPAND PILL BUTTON (MATCHING LEFT SIDEBAR) */}
      {/* ============================================================================== */}
      <div className="relative flex-shrink-0 z-40 select-none">
        {/* Single clean divider line */}
        <div className="h-full w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* Vertical divider collapse/expand pill button */}
        <button
          type="button"
          onClick={() => setIsRightCollapsed((prev) => !prev)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 w-6 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer group"
          title={isRightCollapsed ? "Expand Health & Records sidebar" : "Collapse sidebar"}
          aria-label={isRightCollapsed ? "Expand Health & Records sidebar" : "Collapse sidebar"}
        >
          {isRightCollapsed ? (
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.8] group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.8] group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* ============================================================================== */}
      {/* 5. RIGHT SIDEBAR: COLLAPSIBLE & SCROLLABLE (NO EXTRA SCROLLBAR)               */}
      {/* ============================================================================== */}
      <aside
        style={{ width: isRightCollapsed ? "0px" : `${rightWidth}px` }}
        className={`h-full flex-shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-900 transition-all duration-300 ease-out ${
          isRightCollapsed ? "w-0 min-w-0 p-0 border-0 opacity-0 pointer-events-none" : "p-3"
        }`}
      >
        {/* Card 1: Your Health Context */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Your Health Context</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate("/patient/overview")}
                className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                View All
              </button>
              <button
                onClick={() => setIsRightCollapsed(true)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2.5">
            {/* Show Pregnancy ONLY if patient is pregnant, otherwise show Primary Care Category */}
            {patient?.pregnancy && !["not pregnant", "none", "n/a", "no"].includes(patient.pregnancy.toLowerCase()) ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <PregnancyFetusIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 leading-none">Pregnancy Status</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{patient?.pregnancyBadge || patient?.pregnancy}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 leading-none">Clinical Category</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{patient?.category || "General Medicine"}</p>
                </div>
              </div>
            )}

            {/* Blood Group */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-none">Blood Group</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{patient?.bloodGroup || "O+"}</p>
              </div>
            </div>

            {/* Allergies */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Flower2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-none">Allergies</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                  {Array.isArray(patient?.allergies) ? patient.allergies.join(", ") : (patient?.allergies || "None known")}
                </p>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-none">Chronic Conditions</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                  {Array.isArray(patient?.chronicConditions) ? patient.chronicConditions.join(", ") : (patient?.chronicConditions || "None")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Recent Documents */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Recent Documents</h3>
            <button
              onClick={() => navigate("/patient/documents")}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2 pt-2.5">
            {/* Document 1: Prescription */}
            <div
              onClick={() => setSelectedDocPreview({ title: "Prescription - Dr. Roy", date: "11 Oct 2024", type: "Prescription", img: "/samples/sample_prescription.jpg" })}
              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-11 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src="/samples/sample_prescription.jpg" alt="Prescription" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition">
                    Prescription - Dr. Roy
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400">11 Oct 2024</span>
                    <span className="text-[9.5px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-full border border-amber-200/50">
                      Prescription
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
            </div>

            {/* Document 2: Blood Test */}
            <div
              onClick={() => setSelectedDocPreview({ title: "Blood Test Report", date: "28 Sep 2024", type: "Lab Report", img: "/samples/sample_lab_report.jpg" })}
              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-11 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src="/samples/sample_lab_report.jpg" alt="Blood Report" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition">
                    Blood Test Report
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400">28 Sep 2024</span>
                    <span className="text-[9.5px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full border border-blue-200/50">
                      Lab Report
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
            </div>

            {/* Document 3: Chest X-Ray */}
            <div
              onClick={() => setSelectedDocPreview({ title: "Chest X-Ray", date: "05 Oct 2024", type: "X-Ray", img: "/samples/sample_xray.jpg" })}
              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-11 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src="/samples/sample_xray.jpg" alt="Chest X-Ray" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition">
                    Chest X-Ray
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400">05 Oct 2024</span>
                    <span className="text-[9.5px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded-full border border-teal-200/50">
                      X-Ray
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 pb-2.5 border-b border-slate-100">Quick Actions</h3>

          <div className="grid grid-cols-4 gap-1.5 pt-2.5">
            {/* Upload Report */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#eaf8f1] hover:bg-[#ddf4e7] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-center group cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#059669] group-hover:scale-110 transition" />
              <span className="text-[9.5px] font-bold text-slate-800 leading-tight">Upload Report</span>
            </button>

            {/* Book Consultation */}
            <button
              onClick={() => navigate("/patient/consultations")}
              className="bg-[#eef6ff] hover:bg-[#e0efff] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-center group cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#2563eb] group-hover:scale-110 transition" />
              <span className="text-[9.5px] font-bold text-slate-800 leading-tight">Book Consult</span>
            </button>

            {/* View History */}
            <button
              onClick={() => navigate("/patient/consultations")}
              className="bg-[#f5f0ff] hover:bg-[#ebe2ff] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-center group cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#9333ea] group-hover:scale-110 transition" />
              <span className="text-[9.5px] font-bold text-slate-800 leading-tight">View History</span>
            </button>

            {/* Share Access */}
            <button
              onClick={() => navigate("/patient/share")}
              className="bg-[#fff4ed] hover:bg-[#ffe8dc] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-center group cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#ea580c] group-hover:scale-110 transition" />
              <span className="text-[9.5px] font-bold text-slate-800 leading-tight">Share Access</span>
            </button>
          </div>
        </div>
      </aside>
      </div>



      {/* ============================================================================== */}
      {/* 7. DOCUMENT UPLOAD MODAL                                                       */}
      {/* ============================================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Medical Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload handwritten prescriptions, pathology blood tests, or chest X-rays. Gemini Vision AI will parse and verify them.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-xl p-6 text-center cursor-pointer transition mb-4"
            >
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">Click to select file or drag & drop</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, PDF up to 25MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setShowUploadModal(false);
                    navigate("/patient/documents");
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/patient/documents")}
                className="px-4 py-2 text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-xl shadow-xs"
              >
                Go to Medical Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 8. DOCUMENT PREVIEW LIGHTBOX                                                   */}
      {/* ============================================================================== */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedDocPreview.title}</h4>
                <p className="text-[11px] text-slate-500">{selectedDocPreview.date} · {selectedDocPreview.type}</p>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img src={selectedDocPreview.img} alt={selectedDocPreview.title} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            </div>
            <div className="p-3 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedDocPreview(null);
                  handleSend(`Can you analyze and summarize my ${selectedDocPreview.title}?`);
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Ask AI Doctor about this file ➔
              </button>
              <button
                onClick={() => navigate("/patient/documents")}
                className="text-xs font-semibold text-slate-600 hover:underline"
              >
                Open in Medical Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 8.5 IN-CALL MEDICAL DRIVE PICKER MODAL                                         */}
      {/* ============================================================================== */}
      {showDrivePickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowDrivePickerModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Select from Medical Drive</h3>
                <p className="text-xs text-slate-500">
                  Choose a verified lab report or prescription to review with Dr. Sharma
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1">
              {getPatientDocuments(patient?.patient_ref || patient?.id || "AV-2026-8921").map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/40 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-300 shadow-2xs shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {doc.date} · {doc.category} {doc.facility ? `· ${doc.facility}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttachDocumentFromDrive(doc)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shrink-0 shadow-xs transition cursor-pointer"
                  >
                    Select & Review
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Have a new paper document?</span>
              <button
                type="button"
                onClick={() => {
                  setShowDrivePickerModal(false);
                  fileUploadInputRef.current?.click();
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File from Device</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. CLINICAL CONSULTATION REPORT MODAL */}
      {showReportModal && generatedReport && (
        <ClinicalReportModal
          report={generatedReport}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
