import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  Mic,
  MicOff,
  X,
  Send,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Languages,
  Sun,
  Moon,
  ArrowRight,
  Thermometer,
  Activity,
  HeartPulse,
  Clock,
  Calendar,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  BatteryLow,
  UtensilsCrossed,
  AlertOctagon,
  ShieldCheck,
  Heart,
  Pill,
  MessageSquare,
  Paperclip,
  FileText,
  Upload,
  Info,
  ChevronRight,
  FileSpreadsheet,
  Video,
  VideoOff,
  PhoneOff,
  User,
} from "lucide-react";
import { AudioLinesIcon } from "@animateicons/react/lucide";
import { Room, RoomEvent, Track } from "livekit-client";
import { useLanguage } from "../context/LanguageContext";
import defaultQuestionsData from "../data/assessmentQuestions.json";
import { getCurrentPatient, savePatient } from "../utils/patientStore";
import {
  saveAIConsultation,
  sendAIDoctorChatTurn,
  sendAIDoctorVoiceTurn,
  fetchPatientDocuments,
  uploadMedicalDocument,
  fetchLiveKitToken,
} from "../services/api";

// Icon lookup map for JSON assessment options
const ICON_MAP = {
  Thermometer,
  Activity,
  HeartPulse,
  Clock,
  Calendar,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  CheckCircle2,
  BatteryLow,
  UtensilsCrossed,
  AlertOctagon,
  ShieldCheck,
  Heart,
  Pill,
};

function OptionIcon({ name, className }) {
  const IconComponent = ICON_MAP[name] || Activity;
  return <IconComponent className={className} />;
}

/**
 * LiveKit 5-Bar Pill Audio Waveform Visualizer
 * Exactly replicates user Image 2 (media_1791746373526.png cropped):
 * 5 vertical rounded pill bars of varying heights in crisp white with a soft glowing halo,
 * animating dynamically during user speech or AI doctor responses.
 */
function LiveKitFiveBarWaveform({ isListening, isSpeaking, isProcessing }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isListening && !isSpeaking && !isProcessing) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 12);
    }, 110);
    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isProcessing]);

  // Proportions matching user Image 2:
  // Outer left: short pill (~20px)
  // Inner left: medium pill (~48px)
  // Center: tallest pill (~84px)
  // Inner right: medium pill (~54px)
  // Outer right: short pill (~24px)
  const getBarHeight = (barIndex) => {
    if (isSpeaking) {
      const patterns = [
        [24, 52, 96, 62, 28],
        [18, 40, 80, 48, 20],
        [28, 64, 104, 68, 32],
        [22, 46, 88, 56, 24],
        [16, 36, 76, 44, 18],
        [26, 58, 100, 64, 30],
      ];
      return patterns[frame % patterns.length][barIndex];
    }
    if (isListening) {
      const patterns = [
        [22, 50, 88, 54, 26],
        [26, 56, 94, 60, 28],
        [18, 42, 80, 48, 22],
        [24, 48, 86, 52, 24],
      ];
      return patterns[frame % patterns.length][barIndex];
    }
    if (isProcessing) {
      const patterns = [
        [18, 32, 52, 36, 18],
        [22, 38, 60, 42, 22],
        [16, 28, 46, 32, 16],
      ];
      return patterns[frame % patterns.length][barIndex];
    }
    // Idle state
    const idleHeights = [20, 48, 84, 54, 24];
    return idleHeights[barIndex];
  };

  const barWidths = [
    "w-4 sm:w-5",
    "w-5 sm:w-6",
    "w-6 sm:w-7",
    "w-5 sm:w-6",
    "w-4 sm:w-5",
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 h-36 select-none">
      {[0, 1, 2, 3, 4].map((i) => {
        const height = getBarHeight(i);
        return (
          <div
            key={i}
            className={`${barWidths[i]} rounded-full bg-white transition-all duration-150 ease-out shadow-[0_0_24px_rgba(255,255,255,0.85)] drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]`}
            style={{
              height: `${height}px`,
              minHeight: "16px",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * LiveVoiceAssistant
 *
 * Implements:
 * 1. Intake Portal per Excalidraw Wireframe (media_1791746373526.png):
 *    - Header: "hello User_name" & "what is the issue"
 *    - 4 Interactive Option Cards
 *    - Bottom Capsule: [+] "ask arogyavaani ai" and circular Voice Launcher ( O )
 * 2. Deep Blue LiveKit Voice Agent Room:
 *    - Header: Cyan LK Logo + "BUILT WITH LIVEKIT AGENTS"
 *    - Center: 5-Bar Waveform Animation from Image 2
 *    - Bottom-Right: User Webcam PIP Tile
 *    - Bottom Control Bar: Mic Toggle, Camera Toggle, Chat Drawer Toggle, Red END CALL
 * 3. Consultation persistence with user_name to Supabase Cloud
 */
export default function LiveVoiceAssistant({
  onClose,
  patientName = "Patient",
  questionsData = defaultQuestionsData,
  onSaveAssessment,
  roomName: initialRoomName,
}) {
  const { language, setLanguage } = useLanguage();

  // Active Mode: "portal" (default Excalidraw intake screen) | "voice" (LiveKit Voice Room)
  const [activeMode, setActiveMode] = useState("portal");

  // Interaction States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Real-time Speech Transcripts
  const [interimUserText, setInterimUserText] = useState("");
  const [streamingAiText, setStreamingAiText] = useState("");

  // Input Field State
  const [typeInput, setTypeInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatTurnHistory, setChatTurnHistory] = useState([]);
  const chatTurnHistoryRef = useRef([]);
  const messagesRef = useRef([]);
  const [activeConsultationId, setActiveConsultationId] = useState(null);

  // Webcam State for PIP Video Tile
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);

  // Document Attachment State
  const [showDocModal, setShowDocModal] = useState(false);
  const [patientDocs, setPatientDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [attachedDocument, setAttachedDocument] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState(null);

  // Diagnostic State
  const [micError, setMicError] = useState(null);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // LiveKit WebRTC Session State
  const [livekitConnected, setLivekitConnected] = useState(false);
  const [livekitConnecting, setLivekitConnecting] = useState(false);
  const livekitRoomRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Refs
  const recognitionRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const chatScrollRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const synthesisRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Patient Identity
  const currentPat = getCurrentPatient();
  const isRealNewPatient = currentPat?.isNewPatient || !currentPat?.id || currentPat?.id === "NEW_PATIENT";
  const patientDisplayName = isRealNewPatient
    ? (patientName && patientName !== "Patient" ? patientName : "New Patient")
    : (currentPat?.name || patientName || "Patient");
  const patientId = isRealNewPatient
    ? "NEW_PATIENT"
    : (currentPat?.patient_ref || currentPat?.id || "NEW_PATIENT");
  const normalizedPatientId =
    patientId.startsWith("AV-") && patientId.length === 7
      ? `AV-2026-${patientId.slice(3)}`
      : patientId;

  // Auto-scroll chat messages
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimUserText, streamingAiText, scrollToBottom]);

  // Load Patient Documents for modal
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    setDocUploadError(null);
    try {
      const docs = await fetchPatientDocuments(normalizedPatientId);
      setPatientDocs(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.warn("[DOCS] Could not load patient documents:", err);
      setPatientDocs([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [normalizedPatientId]);

  useEffect(() => {
    if (showDocModal) {
      loadDocuments();
    }
  }, [showDocModal, loadDocuments]);

  // Text-To-Speech with word streaming
  const speakAndStreamAiResponse = useCallback(
    (fullText, onComplete) => {
      if (!("speechSynthesis" in window) || !soundEnabled) {
        setIsSpeaking(false);
        if (onComplete) onComplete();
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch {}

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setStreamingAiText("");

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      if (language === "hi") {
        utterance.lang = "hi-IN";
      } else if (language === "bn") {
        utterance.lang = "bn-IN";
      } else {
        utterance.lang = "en-IN";
      }

      const words = fullText.split(" ");
      let currentWordIndex = 0;

      const wordInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
          currentWordIndex++;
          setStreamingAiText(words.slice(0, currentWordIndex).join(" "));
        } else {
          clearInterval(wordInterval);
        }
      }, 105);

      utterance.onend = () => {
        clearInterval(wordInterval);
        setStreamingAiText("");
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onComplete) onComplete();
      };

      utterance.onerror = (err) => {
        console.warn("Speech synthesis notice:", err);
        clearInterval(wordInterval);
        setStreamingAiText("");
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onComplete) onComplete();
      };

      synthesisRef.current = utterance;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis trigger failed:", err);
        clearInterval(wordInterval);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
    },
    [soundEnabled, language]
  );

  // Send Turn to AI & Save to Supabase
  const handleSendMessageToAi = useCallback(
    async (userText) => {
      const trimmed = userText?.trim();
      if (!trimmed || isProcessing) return;

      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMsg = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: trimmed,
        time: timeString,
        attachedDoc: attachedDocument,
      };

      messagesRef.current.push(userMsg);
      setMessages((prev) => [...prev, userMsg]);
      setInterimUserText("");
      setIsProcessing(true);

      // Pause speech recognition momentarily
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      try {
        const langParam =
          language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";
        const updatedHistory = [
          ...chatTurnHistory,
          { role: "user", text: trimmed },
        ];
        chatTurnHistoryRef.current.push({ role: "user", text: trimmed });
        setChatTurnHistory(updatedHistory);

        const sendFn = activeMode === "voice" ? sendAIDoctorVoiceTurn : sendAIDoctorChatTurn;
        const resp = await sendFn({
          consultationId: activeConsultationId,
          patientId: normalizedPatientId,
          userName: patientDisplayName,
          userMessage: trimmed,
          language: langParam,
          history: updatedHistory,
          attachedDocument: attachedDocument
            ? {
                id: attachedDocument.id,
                title: attachedDocument.title,
                category: attachedDocument.category,
                summary:
                  attachedDocument.patient_summary?.english ||
                  attachedDocument.summary ||
                  "",
                structured_data: attachedDocument.structured_data || {},
              }
            : null,
        });

        if (resp.consultation_id) {
          setActiveConsultationId(resp.consultation_id);
        }

        const aiTime =
          resp.display_time ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: resp.ai_message,
          time: aiTime,
          suggestedOptions: resp.suggested_options || [],
          triageLevel: resp.triage_level,
          dangerSigns: resp.danger_signs || [],
          attachedDoc: attachedDocument,
        };

        messagesRef.current.push(aiMsg);
        chatTurnHistoryRef.current.push({ role: "assistant", text: resp.ai_message });
        setMessages((prev) => [...prev, aiMsg]);
        setChatTurnHistory((prev) => [
          ...prev,
          { role: "assistant", text: resp.ai_message },
        ]);

        // Update local patient store with clinical status
        const updatedPat = {
          ...currentPat,
          chiefComplaint: resp.chief_complaint || trimmed,
          triage:
            resp.triage_level === "EMERGENCY"
              ? "Urgent Review Required"
              : "Stable",
          lastAiSession: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
        savePatient(updatedPat);
        if (onSaveAssessment) onSaveAssessment(updatedPat);

        // Speak aloud if in voice room or sound is enabled
        if (activeMode === "voice" || soundEnabled) {
          speakAndStreamAiResponse(resp.ai_message, () => {
            // Re-arm speech recognition in voice mode after speaking
            if (activeMode === "voice") {
              startSpeechRecognition();
            }
          });
        }
      } catch (err) {
        console.error("[VOICE_CHAT_ERROR]", err);
        const fallbackText =
          language === "bn"
            ? "আপনার লক্ষণটি লিপিবদ্ধ করা হয়েছে। নিকটবর্তী স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।"
            : language === "hi"
            ? "आपकी समस्या दर्ज कर ली गई है। कृपया प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।"
            : "Your symptoms have been noted. Please consult your primary health center for medical advice.";

        const fallbackMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: fallbackText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        if (activeMode === "voice" || soundEnabled) {
          speakAndStreamAiResponse(fallbackText);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isProcessing,
      attachedDocument,
      chatTurnHistory,
      activeConsultationId,
      normalizedPatientId,
      patientDisplayName,
      language,
      currentPat,
      activeMode,
      soundEnabled,
      onSaveAssessment,
      speakAndStreamAiResponse,
    ]
  );

  // Web Speech Recognition
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("unsupported");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentLive = interim || final;
        if (currentLive) {
          setInterimUserText(currentLive);

          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }

          if (final) {
            handleSendMessageToAi(final);
          } else {
            speechTimeoutRef.current = setTimeout(() => {
              if (currentLive.trim().length > 1) {
                handleSendMessageToAi(currentLive);
              }
            }, 1600);
          }
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition notice:", e);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setMicError("denied");
          setIsListening(false);
        } else if (e.error === "audio-capture") {
          setMicError("no-mic");
          setIsListening(false);
        } else if (e.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start SpeechRecognition:", err);
      setMicError("error");
      setIsListening(false);
    }
  }, [language, handleSendMessageToAi]);

  const stopSpeechRecognition = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // LiveKit Room Connection & Event Management
  const disconnectLiveKitRoom = useCallback(() => {
    if (livekitRoomRef.current) {
      try {
        livekitRoomRef.current.disconnect();
      } catch (err) {
        console.warn("[LIVEKIT DISCONNECT NOTICE]", err);
      }
      livekitRoomRef.current = null;
    }
    setLivekitConnected(false);
    setLivekitConnecting(false);
  }, []);

  const connectLiveKitRoom = useCallback(async () => {
    try {
      setLivekitConnecting(true);
      setMicError(null);

      const langParam =
        language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";
      const targetRoomName =
        initialRoomName ||
        `consultation_${(normalizedPatientId || "guest").replace(/[^a-zA-Z0-9_]/g, "_")}`;

      const tokenData = await fetchLiveKitToken(
        normalizedPatientId,
        patientDisplayName,
        targetRoomName,
        langParam
      );

      if (!tokenData?.token || !tokenData?.url) {
        throw new Error("No LiveKit credentials received from server");
      }

      console.log("[LIVEKIT] Connecting to LiveKit Cloud:", tokenData.url);
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      livekitRoomRef.current = room;

      // 1. Audio track subscription from AI Doctor Agent (agent.py)
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log("[LIVEKIT] Remote track subscribed:", track.kind, participant?.identity);
        if (track.kind === Track.Kind.Audio) {
          if (remoteAudioRef.current) {
            track.attach(remoteAudioRef.current);
          } else {
            const el = track.attach();
            el.autoplay = true;
            document.body.appendChild(el);
          }
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        try {
          track.detach();
        } catch {}
      });

      // 2. Real-time Transcript broadcast packets from agent.py
      room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text);
          console.log("[LIVEKIT DATA RECEIVED]", topic, data);

          if (data.type === "transcript") {
            const isAi =
              data.speaker === "assistant" ||
              data.speaker === "ai" ||
              data.speaker === "agent" ||
              data.role === "assistant" ||
              data.role === "agent";
            const timeString = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            if (isAi) {
              setStreamingAiText(data.text);
              setIsSpeaking(true);
              setIsListening(false);
              const aiMsg = {
                id: `lk-ai-${Date.now()}`,
                sender: "ai",
                text: data.text,
                time: timeString,
              };
              messagesRef.current.push(aiMsg);
              chatTurnHistoryRef.current.push({ role: "assistant", text: data.text });
              setMessages((prev) => [...prev, aiMsg]);
              setChatTurnHistory((prev) => [
                ...prev,
                { role: "assistant", text: data.text },
              ]);
            } else {
              setInterimUserText(data.text);
              const userMsg = {
                id: `lk-user-${Date.now()}`,
                sender: "user",
                text: data.text,
                time: timeString,
              };
              messagesRef.current.push(userMsg);
              chatTurnHistoryRef.current.push({ role: "user", text: data.text });
              setMessages((prev) => [...prev, userMsg]);
              setChatTurnHistory((prev) => [
                ...prev,
                { role: "user", text: data.text },
              ]);
            }
          }
        } catch (err) {
          console.warn("[LIVEKIT DATA PARSE ERROR]", err);
        }
      });

      // 3. Dynamic active speakers pulse
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const localId = room.localParticipant?.identity;
        const remoteSpeaking = speakers.some((s) => s.identity !== localId);
        const userSpeaking = speakers.some((s) => s.identity === localId);

        if (remoteSpeaking) {
          setIsSpeaking(true);
          setIsListening(false);
        } else if (userSpeaking) {
          setIsListening(true);
          setIsSpeaking(false);
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("[LIVEKIT] Disconnected from room");
        setLivekitConnected(false);
        setIsSpeaking(false);
        setIsListening(false);
      });

      // 4. Connect to LiveKit Cloud Room
      await room.connect(tokenData.url, tokenData.token);
      setLivekitConnected(true);
      setLivekitConnecting(false);

      // 5. Enable patient microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsListening(true);
    } catch (err) {
      console.warn("[LIVEKIT CONNECT NOTICE] Using fallback Web Speech / REST mode:", err);
      setLivekitConnecting(false);
      setLivekitConnected(false);
      startSpeechRecognition();
    }
  }, [normalizedPatientId, patientDisplayName, language, initialRoomName, startSpeechRecognition]);

  // Mic Toggle with browser permission check
  const handleToggleMic = async () => {
    setMicError(null);

    // If connected via LiveKit WebRTC, toggle the participant audio track
    if (livekitRoomRef.current && livekitConnected) {
      try {
        const currentEnabled = livekitRoomRef.current.localParticipant.isMicrophoneEnabled;
        await livekitRoomRef.current.localParticipant.setMicrophoneEnabled(!currentEnabled);
        setIsListening(!currentEnabled);
        return;
      } catch (err) {
        console.warn("[LIVEKIT MIC TOGGLE ERROR]", err);
      }
    }

    if (isListening) {
      stopSpeechRecognition();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("unsupported");
      return;
    }

    if (
      !micPermissionRequested &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      try {
        setMicPermissionRequested(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("[MIC_PERMISSION_FAILED]", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setMicError("denied");
          return;
        }
      }
    }

    startSpeechRecognition();
  };

  // Webcam Management for PIP Tile
  const startWebcam = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
        webcamStreamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      }
    } catch (err) {
      console.warn("[WEBCAM_ERROR]", err);
      setIsCameraOn(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
  }, []);

  const handleToggleCamera = useCallback(() => {
    if (webcamStreamRef.current) {
      const videoTracks = webcamStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !isCameraOn;
        videoTracks.forEach((t) => {
          t.enabled = nextState;
        });
        setIsCameraOn(nextState);
      }
    } else if (!isCameraOn) {
      startWebcam();
    }
  }, [isCameraOn, startWebcam]);

  // Synchronize webcam when entering/leaving voice mode
  useEffect(() => {
    if (activeMode === "voice") {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [activeMode, startWebcam, stopWebcam]);

  // Launch Live Voice Agent (triggered when clicking circular ( O ) button in portal)
  const handleLaunchLiveVoiceAgent = () => {
    setActiveMode("voice");
    connectLiveKitRoom();
  };

  // Persist completed consultation session to Supabase consultations table with user_name
  const persistCurrentConsultation = useCallback(async () => {
    const turns =
      chatTurnHistoryRef.current.length > 0
        ? chatTurnHistoryRef.current
        : messagesRef.current.map((m) => ({
            role:
              m.sender === "ai" || m.sender === "assistant"
                ? "assistant"
                : "user",
            text: m.text,
            time: m.time,
          }));

    if (turns.length === 0) return;

    try {
      console.log(
        `[PERSIST_CONSULTATION] Saving ${turns.length} turns to Supabase for ${patientDisplayName} (${normalizedPatientId})...`
      );
      await saveAIConsultation({
        patient_id: normalizedPatientId,
        user_name: patientDisplayName,
        transcript: turns,
        turns: turns,
        triage_level:
          currentPat?.triage === "Urgent Review Required"
            ? "EMERGENCY"
            : "ROUTINE",
        chief_complaint:
          currentPat?.chiefComplaint || "Live Voice Consultation",
        language_used: language,
      });
      console.log("[PERSIST_CONSULTATION] Successfully saved consultation to Supabase!");
    } catch (err) {
      console.warn("[PERSIST_CONSULTATION_ERROR]", err);
    }
  }, [normalizedPatientId, patientDisplayName, currentPat, language]);

  // End Call & Return to Intake Portal
  const handleEndCall = () => {
    persistCurrentConsultation();
    disconnectLiveKitRoom();
    stopSpeechRecognition();
    stopWebcam();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveMode("portal");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      persistCurrentConsultation();
      disconnectLiveKitRoom();
      stopWebcam();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [disconnectLiveKitRoom, stopWebcam, persistCurrentConsultation]);

  // Typed input submission
  const handleSendTyped = (e) => {
    e?.preventDefault();
    if (!typeInput.trim()) return;
    handleSendMessageToAi(typeInput.trim());
    setTypeInput("");
  };

  // Copy message
  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // File upload from document modal
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setDocUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", normalizedPatientId);
      formData.append("category", "Auto-Detect");
      formData.append("title", file.name);

      const uploaded = await uploadMedicalDocument(formData);
      setAttachedDocument(uploaded);
      setShowDocModal(false);
      loadDocuments();
    } catch (err) {
      console.error("[UPLOAD_FAIL]", err);
      setDocUploadError(
        "Upload failed. Please check file format (PDF, JPG, PNG) and try again."
      );
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 4 Primary Clinical Issue Cards matching Excalidraw Wireframe
  const clinicalIssueCards = [
    {
      id: "fever",
      icon: Thermometer,
      title: "Fever & Chills",
      subtitle: "High temperature, body ache, shivering",
      query: "I have high fever and body ache for 2 days",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      id: "cough",
      icon: Activity,
      title: "Cough & Throat",
      subtitle: "Dry cough, sore throat, congestion",
      query: "I have persistent cough and sore throat",
      badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    },
    {
      id: "stomach",
      icon: AlertCircle,
      title: "Stomach Ache",
      subtitle: "Pain after eating, acidity, cramps",
      query: "I have severe stomach pain and indigestion",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      id: "report",
      icon: FileText,
      title: "Review Lab Report",
      subtitle: "Discuss CBC, prescription, or blood test",
      action: "attach",
      badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
  ];

  const handleCardClick = (card) => {
    if (card.action === "attach") {
      setShowDocModal(true);
    } else if (card.query) {
      handleSendMessageToAi(card.query);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between font-sans transition-colors duration-300">
      {/* ========================================================
          MODE 1: INTAKE PORTAL (EXCALIDRAW WIREFRAME)
          ======================================================== */}
      {activeMode === "portal" && (
        <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden bg-[#f8fafc] dark:bg-[#121620] text-slate-900 dark:text-zinc-100">
          {/* Subtle Top Close / Exit if embedded in modal */}
          {onClose && (
            <div className="w-full max-w-4xl mx-auto px-4 pt-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  persistCurrentConsultation();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Exit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Scrollable Intake Body */}
          <div
            ref={chatScrollRef}
            className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 overflow-y-auto flex flex-col justify-center minimal-scrollbar py-4"
          >
            {/* If no conversation yet, show prominent greeting per Excalidraw */}
            {messages.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center my-auto">
                {/* 1. Header: "hello User_name" / "what is the issue" */}
                <div className="text-center pb-8 sm:pb-10 select-none">
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    hello {patientDisplayName}
                  </h1>
                  <p className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-zinc-400 mt-2">
                    what is the issue
                  </p>
                </div>

                {/* 2. Four Interactive Option Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
                  {clinicalIssueCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClick(card)}
                        className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left flex flex-col justify-between min-h-[125px] sm:min-h-[145px] group cursor-pointer shadow-xs"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 border ${card.badgeColor} group-hover:scale-110 transition-transform`}
                        >
                          <CardIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 font-normal">
                            {card.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Conversation Messages Thread if user has sent messages */
              <div className="w-full space-y-4 py-4">
                <div className="text-center pb-2 select-none">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    hello {patientDisplayName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    Clinical consultation in progress
                  </p>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`w-full flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <div className="max-w-[84%] sm:max-w-[72%] space-y-1">
                        {msg.attachedDoc && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-300 dark:border-emerald-800 mb-1">
                            <Paperclip className="w-3 h-3 text-emerald-500" />
                            <span>{msg.attachedDoc.title || "Lab Report"}</span>
                          </div>
                        )}
                        <div className="px-5 py-3 rounded-3xl bg-emerald-600 text-white text-sm sm:text-base font-normal tracking-tight shadow-md select-text">
                          <p className="leading-snug">{msg.text}</p>
                          {msg.time && (
                            <p className="text-[10px] text-emerald-100 text-right mt-1 font-mono">
                              {msg.time}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[96%] sm:max-w-[88%] space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                            Aarogya AI Doctor
                          </span>
                          {msg.triageLevel && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                msg.triageLevel === "EMERGENCY"
                                  ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              }`}
                            >
                              {msg.triageLevel}
                            </span>
                          )}
                        </div>

                        {msg.dangerSigns && msg.dangerSigns.length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1.5 shadow-xs">
                            <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                              <span>Clinical Red Flag Identified</span>
                            </div>
                            {msg.dangerSigns.map((ds, dsIdx) => (
                              <p key={dsIdx} className="text-[11px] leading-relaxed text-rose-700/90 dark:text-rose-300/90 pl-5">
                                • {ds.alert_message || ds.matched_trigger || "Immediate clinical evaluation required."}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs space-y-2">
                          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>

                          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="inline-flex items-center gap-1.5 p-1 rounded-md text-xs text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[11px] text-emerald-500 font-semibold">
                                    Copied
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => speakAndStreamAiResponse(msg.text)}
                              className="inline-flex items-center gap-1.5 p-1 rounded-md text-xs text-slate-400 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Listen</span>
                            </button>
                          </div>
                        </div>

                        {msg.suggestedOptions && msg.suggestedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.suggestedOptions.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isProcessing}
                                onClick={() => {
                                  if (opt.toLowerCase().includes("108") || opt.toLowerCase().includes("ambulance")) {
                                    window.open("tel:108", "_self");
                                  }
                                  handleSendMessageToAi(opt);
                                }}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs ${
                                  msg.triageLevel === "EMERGENCY"
                                    ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200"
                                    : "bg-white hover:bg-emerald-50 dark:bg-zinc-800/90 dark:hover:bg-emerald-950/50 border-slate-200 hover:border-emerald-400 dark:border-zinc-700 dark:hover:border-emerald-600 text-slate-700 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-300"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 animate-pulse pl-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Analyzing clinical guidelines...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Bottom Capsule Input Bar per Excalidraw Wireframe */}
          <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 shrink-0">
            <form
              onSubmit={handleSendTyped}
              className="relative w-full flex items-center gap-2 p-1.5 sm:p-2 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 shadow-lg shadow-slate-900/5 dark:shadow-black/25"
            >
              {/* [+] Button to attach lab reports / documents */}
              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer shrink-0"
                title="Attach Lab Report or Medical Record"
              >
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </button>

              {attachedDocument && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">
                    {attachedDocument.title || "Report"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedDocument(null)}
                    className="hover:text-rose-500 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Input field with exact requested placeholder "ask arogyavaani ai" */}
              <input
                ref={textInputRef}
                type="text"
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                placeholder="ask arogyavaani ai"
                className="flex-1 min-w-0 px-3 py-1.5 text-sm sm:text-base bg-transparent outline-none font-normal text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
              />

              {/* Send Button appears when typing */}
              {typeInput.trim() && (
                <button
                  type="submit"
                  className="p-2 sm:p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs shrink-0"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}

              {/* Circular Voice Launcher Button ( O ) on the right */}
              <button
                type="button"
                onClick={handleLaunchLiveVoiceAgent}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 transition-all cursor-pointer shrink-0"
                title="Talk with ArogyaVani Voice Agent"
              >
                <AudioLinesIcon size={22} duration={1} color="#ffffff" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: DEEP BLUE LIVEKIT VOICE AGENT ROOM (WHEN CLICKED)
          ======================================================== */}
      {activeMode === "voice" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#060c1c] text-white overflow-hidden select-none">
          {/* Ambient Radial Gradient Background in Deep Blue */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(14, 165, 233, 0.18) 0%, transparent 65%), radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
            }}
          />

          {/* 1. TOP HEADER: Cyan LK Logo + "BUILT WITH LIVEKIT AGENTS" */}
          <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between z-20 shrink-0">
            {/* Left: Cyan LK LiveKit Logo */}
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 font-extrabold text-xs tracking-wider shadow-[0_0_14px_rgba(6,182,212,0.35)] flex items-center gap-1.5">
                <span className="font-mono text-sm font-black">LK</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-100">
                  AarogyaVani Voice
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>

            {/* Right: LiveKit Agent Status badge */}
            {livekitConnected ? (
              <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase bg-cyan-950/60 border border-cyan-400/40 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVEKIT WEBRTC ACTIVE
              </div>
            ) : livekitConnecting ? (
              <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-950/40 border border-amber-600/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                CONNECTING AGENT...
              </div>
            ) : (
              <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-cyan-400/90 uppercase bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full shadow-2xs">
                BUILT WITH LIVEKIT AGENTS
              </div>
            )}
          </header>

          {/* Hidden audio element for LiveKit remote agent audio output */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

          {/* 2. CENTER: 5-BAR WAVEFORM ANIMATION (EXACT IMAGE 2 REPLICA) */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center z-20 text-center my-auto">
            {/* LiveKit Five-Bar Waveform Component */}
            <LiveKitFiveBarWaveform
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
            />

            {/* Subtitle & Real-time Transcription Stream */}
            <div className="max-w-xl mx-auto px-4 mt-6 min-h-[56px] flex items-center justify-center">
              {interimUserText ? (
                <div className="bg-cyan-950/50 border border-cyan-700/60 px-5 py-2.5 rounded-2xl shadow-lg backdrop-blur-xs animate-in fade-in">
                  <p className="text-base sm:text-lg font-medium text-cyan-200">
                    <span className="text-cyan-400 font-bold mr-1">You:</span>
                    "{interimUserText}"
                  </p>
                </div>
              ) : streamingAiText ? (
                <div className="bg-slate-900/80 border border-slate-700/70 px-5 py-2.5 rounded-2xl shadow-lg backdrop-blur-xs animate-in fade-in">
                  <p className="text-base sm:text-lg font-medium text-white">
                    <span className="text-emerald-400 font-bold mr-1">Doctor:</span>
                    {streamingAiText}
                  </p>
                </div>
              ) : (
                <p className="text-sm sm:text-base font-medium text-slate-400 tracking-wide">
                  {isListening
                    ? "Listening to your voice... Speak naturally"
                    : isSpeaking
                    ? "AI Doctor Speaking..."
                    : isProcessing
                    ? "Analyzing clinical guidelines..."
                    : "Live voice session active • Speak now"}
                </p>
              )}
            </div>

            {/* Attached Document Indicator if any */}
            {attachedDocument && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-700 text-cyan-300 text-xs font-semibold">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attached: {attachedDocument.title || "Lab Report"}</span>
              </div>
            )}
          </main>

          {/* 3. BOTTOM-RIGHT: PICTURE-IN-PICTURE (PIP) USER WEBCAM VIDEO */}
          <div className="absolute bottom-24 right-4 sm:right-8 w-36 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-950 z-30">
            {isCameraOn ? (
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                <User className="w-8 h-8 text-cyan-400/60 mb-1" />
                <span className="text-[11px] font-bold">Camera Off</span>
              </div>
            )}

            {/* PIP Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>You</span>
            </div>
          </div>

          {/* Optional Transcript Drawer Overlay */}
          {showTranscriptDrawer && (
            <div className="absolute bottom-24 left-4 sm:left-8 max-w-sm w-full max-h-64 bg-slate-900/95 border border-cyan-800/60 rounded-2xl p-4 shadow-2xl overflow-y-auto z-30 minimal-scrollbar">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400">Live Transcript</span>
                <button
                  type="button"
                  onClick={() => setShowTranscriptDrawer(false)}
                  className="p-1 hover:text-white text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                {messages.slice(-4).map((m) => (
                  <div key={m.id}>
                    <strong className={m.sender === "user" ? "text-cyan-300" : "text-emerald-300"}>
                      {m.sender === "user" ? "You: " : "Doctor: "}
                    </strong>
                    <span className="text-slate-200">{m.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. BOTTOM CONTROL BAR: MIC, CAM, CHAT & RED END CALL */}
          <footer className="w-full max-w-xl mx-auto px-4 pb-6 pt-2 z-40 shrink-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0b142c]/90 border border-cyan-900/50 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3">
              {/* Media Controls Group */}
              <div className="flex items-center gap-2">
                {/* Mic Mute / Unmute Toggle */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isListening
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  }`}
                  title={isListening ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                {/* Camera Toggle */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isCameraOn
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  }`}
                  title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                {/* Chat Transcript Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTranscriptDrawer((prev) => !prev)}
                  className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    showTranscriptDrawer
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                  }`}
                  title="Toggle Transcript Drawer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Red END CALL Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
                title="End Consultation"
              >
                <PhoneOff className="w-4 h-4" />
                <span>END CALL</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================
          ATTACH LAB REPORTS & MEDICAL RECORDS MODAL
          ======================================================== */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[85vh] rounded-3xl flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a202c] text-slate-900 dark:text-zinc-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Share Lab Reports & Medical Records
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Select a report to discuss findings with Aarogya AI Doctor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Upload + Existing Documents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 minimal-scrollbar">
              {/* Quick Upload Action */}
              <div
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800/80 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-6 h-6 text-emerald-500 mb-1" />
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {isUploadingDoc
                    ? "Analyzing & Uploading Document..."
                    : "Upload New Lab Report or Prescription"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Accepts PDF, JPG, PNG • Automatically analyzed with Gemini Vision
                </p>
              </div>

              {docUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {docUploadError}
                </div>
              )}

              {/* List of Existing Medical Documents */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Existing Records for {patientDisplayName}
                </p>

                {isLoadingDocs ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Loading records from Supabase...
                  </div>
                ) : patientDocs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No documents found. Upload a report above to discuss it with AI.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientDocs.map((doc) => {
                      const isSelected = attachedDocument?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setAttachedDocument(doc);
                            setShowDocModal(false);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20"
                              : "bg-white dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold truncate">
                                  {doc.title || "Medical Record"}
                                </h4>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 shrink-0">
                                  {doc.category || "Report"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {doc.patient_summary?.english ||
                                  doc.summary ||
                                  `Visit: ${doc.visit_date || "Recent"}`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Attached" : "Attach"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
