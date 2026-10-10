import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  X,
  Plus,
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
  Brain,
  Thermometer,
  Activity,
  HeartPulse,
  Clock,
  Calendar,
  CalendarRange,
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
  FileCheck2,
} from "lucide-react";
import FluidVoiceSphere from "./FluidVoiceSphere";
import { useLanguage } from "../context/LanguageContext";
import defaultQuestionsData from "../data/assessmentQuestions.json";
import { getCurrentPatient, savePatient } from "../utils/patientStore";

// Icon lookup map for JSON data options
const ICON_MAP = {
  Brain,
  Thermometer,
  Activity,
  HeartPulse,
  Clock,
  Calendar,
  CalendarRange,
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

// Audio ping helper using Web Audio API for instant tactile click response
function playAudioPing() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Cheerful harmonic ping (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {}
}

/**
 * LiveVoiceAssistant
 *
 * Full-screen / focused voice interface with:
 * - Dynamic questions & 4 interactive option cards generated from JSON data.
 * - One-click direct submission of option cards with instant audio feedback.
 * - Real-time voice transcription (input on right, output on left).
 * - Light Mode Voice Sphere floating above the bottom capsule bar.
 * - Option to type or speak freely.
 */
export default function LiveVoiceAssistant({
  onClose,
  patientName = "Patient",
  questionsData = defaultQuestionsData,
  onSaveAssessment,
  hideTopHeader = false,
}) {
  const { language, setLanguage } = useLanguage();

  // Mode: Default light mode as requested, with instant toggle to dark if desired
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Question Assessment State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [isAssessmentFinished, setIsAssessmentFinished] = useState(false);

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Real-Time Transcription
  const [interimUserText, setInterimUserText] = useState("");
  const [streamingAiText, setStreamingAiText] = useState("");

  // Bottom drawer typing state
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typeInput, setTypeInput] = useState("");

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // Conversation history: Array of messages
  // Each message can optionally contain question metadata & options
  const [messages, setMessages] = useState([]);

  // Selected option tracking per question id
  const [selectedOptionMap, setSelectedOptionMap] = useState({});

  // Summary saved confirmation
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  // References
  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const synthesisRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Helper to get text based on current language
  const getLocalizedText = useCallback(
    (item, fieldPrefix) => {
      if (!item) return "";
      if (language === "hi" && item[`${fieldPrefix}_hi`]) {
        return item[`${fieldPrefix}_hi`];
      }
      if (language === "bn" && item[`${fieldPrefix}_bn`]) {
        return item[`${fieldPrefix}_bn`];
      }
      return item[fieldPrefix] || "";
    },
    [language]
  );

  // Auto-scroll chat to bottom smoothly when new messages or streaming text arrive
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

  // Text-To-Speech with Realtime Word-by-Word Streaming Transcript Output
  const speakAndStreamAiResponse = useCallback(
    (fullText, onComplete) => {
      if (!("speechSynthesis" in window) || !soundEnabled) {
        setIsSpeaking(false);
        if (onComplete) onComplete();
        return;
      }

      window.speechSynthesis.cancel();
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
      window.speechSynthesis.speak(utterance);
    },
    [soundEnabled, language]
  );

  // Present a specific question from the JSON data
  const presentQuestion = useCallback(
    (qIndex) => {
      const qData = questionsData[qIndex];
      if (!qData) {
        // Assessment finished
        finishAssessment();
        return;
      }

      const questionText = getLocalizedText(qData, "question");
      const questionId = qData.id;

      // Add AI message with question and its 4 option cards
      const newAiMsg = {
        id: `ai-q-${questionId}`,
        sender: "ai",
        text: questionText,
        questionData: qData,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newAiMsg]);

      // Speak question aloud and synchronize real-time transcript
      speakAndStreamAiResponse(questionText);
    },
    [questionsData, getLocalizedText, speakAndStreamAiResponse]
  );

  // Handle Assessment Completion
  const finishAssessment = useCallback(() => {
    setIsAssessmentFinished(true);

    const summaryText =
      language === "hi"
        ? "आपका स्वास्थ्य पूर्व-आकलन पूरा हो गया है। आपका क्लिनिकल सारांश आपके डॉक्टर के परामर्श के लिए सहेज लिया गया है।"
        : language === "bn"
        ? "আপনার স্বাস্থ্য মূল্যায়ন সম্পন্ন হয়েছে। আপনার ক্লিনিকাল সংক্ষিপ্ত বিবরণ ডাক্তারের পরামর্শের জন্য সংরক্ষণ করা হয়েছে।"
        : "Your health pre-assessment is complete! All details have been compiled into a structured clinical summary ready for your doctor's consultation.";

    // Determine danger status
    const hasDangerSign = Object.values(assessmentAnswers).some(
      (ans) => ans.isDanger
    );

    const completionMsg = {
      id: `ai-finish-${Date.now()}`,
      sender: "ai",
      text: summaryText,
      isSummary: true,
      hasDangerSign,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, completionMsg]);
    speakAndStreamAiResponse(summaryText);

    // Save to patient central store
    try {
      const currentPat = getCurrentPatient();
      const updatedPat = {
        ...currentPat,
        chiefComplaint:
          assessmentAnswers["q_primary_symptom"]?.text ||
          currentPat.chiefComplaint ||
          "General Consultation",
        triage: hasDangerSign ? "Urgent Review Required" : "Stable",
        lastAiSession: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      savePatient(updatedPat);
      if (onSaveAssessment) onSaveAssessment(updatedPat);
    } catch {}
  }, [language, assessmentAnswers, speakAndStreamAiResponse, onSaveAssessment]);

  // DIRECT ONE-CLICK OPTION SUBMISSION
  const handleSelectOption = useCallback(
    (question, option) => {
      // 1. Play immediate audio ping chime
      playAudioPing();

      const optionTitle = getLocalizedText(option, "title");
      const questionId = question.id;

      // 2. Mark this option as selected for this question
      setSelectedOptionMap((prev) => ({
        ...prev,
        [questionId]: option.id,
      }));

      // 3. Save to assessment answers state
      setAssessmentAnswers((prev) => ({
        ...prev,
        [questionId]: {
          questionTitle: question.title,
          optionId: option.id,
          text: optionTitle,
          isDanger: option.danger || false,
        },
      }));

      // 4. Immediately submit as user message bubble on the right
      const userMsg = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text: optionTitle,
        selectedOptionId: option.id,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);

      // Stop speech recognition momentarily while AI is responding
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      // 5. AI acknowledges response and moves to the next dynamic question
      setTimeout(() => {
        setIsProcessing(false);
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        if (nextIndex < questionsData.length) {
          presentQuestion(nextIndex);
        } else {
          finishAssessment();
        }
      }, 600);
    },
    [
      getLocalizedText,
      currentQuestionIndex,
      questionsData.length,
      presentQuestion,
      finishAssessment,
    ]
  );

  // Handle Freeform Spoken or Typed Answer Submission
  const handleCommitFreeformAnswer = useCallback(
    (text) => {
      if (!text || !text.trim()) return;
      const trimmed = text.trim();

      playAudioPing();

      // Submit user bubble on the right
      const userMsg = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimUserText("");
      setIsProcessing(true);

      const currentQ = questionsData[currentQuestionIndex];
      if (currentQ) {
        setAssessmentAnswers((prev) => ({
          ...prev,
          [currentQ.id]: {
            questionTitle: currentQ.title,
            text: trimmed,
            isDanger:
              trimmed.toLowerCase().includes("chest pain") ||
              trimmed.toLowerCase().includes("breathless"),
          },
        }));
      }

      setTimeout(() => {
        setIsProcessing(false);
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        if (nextIndex < questionsData.length) {
          presentQuestion(nextIndex);
        } else {
          finishAssessment();
        }
      }, 650);
    },
    [
      currentQuestionIndex,
      questionsData,
      presentQuestion,
      finishAssessment,
    ]
  );

  // Web Speech Recognition
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
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
            handleCommitFreeformAnswer(final);
          } else {
            speechTimeoutRef.current = setTimeout(() => {
              if (currentLive.trim().length > 1) {
                handleCommitFreeformAnswer(currentLive);
              }
            }, 1500);
          }
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition notice:", e);
        if (e.error !== "no-speech") {
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
      setIsListening(false);
    }
  }, [language, handleCommitFreeformAnswer]);

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
    if (interimUserText.trim()) {
      handleCommitFreeformAnswer(interimUserText);
    }
  }, [interimUserText, handleCommitFreeformAnswer]);

  const handleToggleMic = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Initial Boot: Present First Question from JSON
  useEffect(() => {
    if (messages.length === 0 && questionsData && questionsData.length > 0) {
      presentQuestion(0);
    }
  }, [messages.length, questionsData, presentQuestion]);

  // Teardown
  useEffect(() => {
    return () => {
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
  }, []);

  // Copy message helper
  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Typed submission
  const handleSendTyped = (e) => {
    e?.preventDefault();
    if (!typeInput.trim()) return;
    handleCommitFreeformAnswer(typeInput.trim());
    setTypeInput("");
    setIsTypingMode(false);
  };

  // Save consultation summary click
  const handleSaveToConsultations = () => {
    setSavedConfirmation(true);
    setTimeout(() => setSavedConfirmation(false), 2400);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between transition-colors duration-300 font-sans ${
        isDarkMode ? "bg-[#090a0f] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
      style={{
        backgroundImage: isDarkMode
          ? "radial-gradient(at 50% 100%, rgba(30, 58, 138, 0.15) 0px, transparent 60%)"
          : "radial-gradient(at 50% 100%, rgba(186, 230, 253, 0.28) 0px, transparent 65%), radial-gradient(at 0% 0%, rgba(209, 250, 229, 0.2) 0px, transparent 50%)",
      }}
    >
      {/* 1. TOP HEADER (Hidden when hideTopHeader is true) */}
      {!hideTopHeader && (
        <header
          className={`w-full shrink-0 max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between z-30 transition-colors border-b ${
            isDarkMode
              ? "border-slate-800/80 bg-[#090a0f]/80 backdrop-blur-md"
              : "border-slate-200/80 bg-white/80 backdrop-blur-md"
          }`}
        >
          {/* Left: AI Doctor Identity & Assessment Step Counter */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Aarogya Live Voice
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isListening
                      ? "bg-emerald-500 animate-pulse"
                      : isSpeaking
                      ? "bg-blue-500 animate-ping"
                      : "bg-slate-400"
                  }`}
                />
              </div>
              {/* Step Counter */}
              <p className="text-[10px] text-slate-500 font-medium">
                {isAssessmentFinished
                  ? "Assessment Completed"
                  : `Step ${Math.min(currentQuestionIndex + 1, questionsData.length)} of ${questionsData.length} • JSON Clinical Intake`}
              </p>
            </div>
          </div>

          {/* Right: Sound, Theme, Language & Close */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700 shadow-2xs"
              }`}
              onClick={() => {
                const langs = ["en", "hi", "bn"];
                const next = langs[(langs.indexOf(language) + 1) % langs.length];
                setLanguage(next);
              }}
              title="Switch Language (English / Hindi / Bengali)"
            >
              <Languages className="w-3.5 h-3.5 text-blue-500" />
              <span className="uppercase">{language}</span>
            </div>

            {/* Sound Mute/Unmute */}
            <button
              onClick={() => {
                setSoundEnabled((prev) => !prev);
                if (soundEnabled && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-2 rounded-full transition-all cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
              }`}
              title={soundEnabled ? "AI Voice Active" : "AI Voice Muted"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`p-2 rounded-full transition-all cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
              }`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Close button in header */}
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-all cursor-pointer border sm:hidden ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 text-slate-400"
                    : "bg-white border-slate-200 text-slate-600 shadow-2xs"
                }`}
                title="Close Voice Mode"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* 2. MAIN SCROLLABLE REAL-TIME CONVERSATION STREAM */}
      <main
        ref={chatScrollRef}
        className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 pt-4 pb-52 sm:pb-56 overflow-y-auto space-y-6 z-10 minimal-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`w-full flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "user" ? (
              /* User Pill Bubble on the Right (Matches screenshot) */
              <div className="max-w-[84%] sm:max-w-[70%] px-5 py-3 rounded-3xl bg-[#1d4ed8] text-white text-sm sm:text-base font-normal tracking-tight shadow-[0_4px_14px_rgba(29,78,216,0.22)] select-text">
                <p className="leading-snug">{msg.text}</p>
              </div>
            ) : (
              /* Assistant Stream on the Left with Question & 4 Interactive Option Cards */
              <div className="max-w-[96%] sm:max-w-[90%] space-y-3.5 w-full">
                {/* Question Text */}
                <p
                  className={`text-sm sm:text-base leading-relaxed tracking-normal font-normal ${
                    isDarkMode ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  {msg.text}
                </p>

                {/* Copy & Re-listen actions */}
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className={`inline-flex items-center gap-1.5 p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      isDarkMode
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => speakAndStreamAiResponse(msg.text)}
                    className={`inline-flex items-center p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      isDarkMode
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Listen to response"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* THE 4 INTERACTIVE OPTION CARDS (Generated from JSON) */}
                {msg.questionData && msg.questionData.options && (
                  <div className="mt-2 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {msg.questionData.options.slice(0, 4).map((opt) => {
                        const isSelected =
                          selectedOptionMap[msg.questionData.id] === opt.id;
                        const isQuestionAnswered =
                          selectedOptionMap[msg.questionData.id] !== undefined;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={isQuestionAnswered}
                            onClick={() => handleSelectOption(msg.questionData, opt)}
                            className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[74px] sm:min-h-[84px] ${
                              isSelected
                                ? "bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/20"
                                : isQuestionAnswered
                                ? isDarkMode
                                  ? "bg-slate-900/40 border-slate-800/80 opacity-50 cursor-default"
                                  : "bg-slate-50/80 border-slate-200/60 opacity-60 cursor-default"
                                : isDarkMode
                                ? "bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-md active:scale-[0.98]"
                                : "bg-white hover:bg-blue-50/60 border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-md active:scale-[0.98]"
                            }`}
                          >
                            {/* Option Icon Badge */}
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : opt.danger
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : isDarkMode
                                  ? "bg-slate-800 text-blue-400 border border-slate-700"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}
                            >
                              <OptionIcon name={opt.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            {/* Option Text Content */}
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4
                                  className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-1 ${
                                    isSelected
                                      ? "text-blue-900"
                                      : isDarkMode
                                      ? "text-slate-100 group-hover:text-blue-400"
                                      : "text-slate-900 group-hover:text-blue-700"
                                  }`}
                                >
                                  {getLocalizedText(opt, "title")}
                                </h4>
                                {opt.danger && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                                    Flag
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] leading-snug mt-0.5 line-clamp-2 ${
                                  isSelected
                                    ? "text-blue-800 font-medium"
                                    : isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {getLocalizedText(opt, "detail")}
                              </p>
                            </div>

                            {/* Selection Checkmark / Arrow */}
                            <div className="shrink-0 pt-0.5">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : !isQuestionAnswered ? (
                                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Final Assessment Summary Card */}
                {msg.isSummary && (
                  <div
                    className={`mt-3 p-4 sm:p-5 rounded-3xl border shadow-md space-y-4 ${
                      isDarkMode
                        ? "bg-slate-900/90 border-slate-800"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Clinical Pre-Assessment Summary
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          msg.hasDangerSign
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {msg.hasDangerSign ? "Urgent Review" : "Stable Intake"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {Object.entries(assessmentAnswers).map(([k, val]) => (
                        <div key={k} className="flex justify-between gap-4 py-1 border-b border-slate-100">
                          <span className="text-slate-500 font-medium">{val.questionTitle}:</span>
                          <span className="text-slate-900 font-bold text-right">{val.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleSaveToConsultations}
                        className="px-4 py-2 rounded-xl bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                      >
                        {savedConfirmation ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Saved to Medical Records!</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Save to Patient Records</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Real-time Streaming Input User Bubble (User speaking right now!) */}
        {interimUserText && (
          <div className="w-full flex justify-end animate-in fade-in duration-150">
            <div className="max-w-[84%] sm:max-w-[70%] px-5 py-3 rounded-3xl bg-[#1d4ed8] text-white text-sm sm:text-base font-normal tracking-tight shadow-md flex items-center gap-2">
              <span className="leading-snug">{interimUserText}</span>
              <span className="w-1.5 h-4 bg-white/80 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Real-time Streaming Output AI Doctor Response (AI speaking right now!) */}
        {streamingAiText && (
          <div className="w-full flex justify-start animate-in fade-in duration-150">
            <div className="max-w-[96%] sm:max-w-[90%] space-y-2">
              <p
                className={`text-sm sm:text-base leading-relaxed tracking-normal font-normal ${
                  isDarkMode ? "text-slate-200" : "text-slate-900"
                }`}
              >
                {streamingAiText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse rounded-full align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* AI Processing Ping Indicator */}
        {isProcessing && (
          <div className="w-full flex justify-start">
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-2xl ${
                isDarkMode
                  ? "bg-slate-900/80 text-slate-400 border border-slate-800"
                  : "bg-white text-slate-500 border border-slate-200/80 shadow-2xs"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing option & loading next question...</span>
            </div>
          </div>
        )}
      </main>

      {/* 3. LOWER SECTION: FIXED 3D FLOATING VOICE SPHERE & INTEGRATED BOTTOM INPUT BAR */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center justify-end pb-3 sm:pb-4 pointer-events-none select-none">
        {/* Ambient Gradient Fade-Out Mask so scrolling text gracefully passes behind the floating sphere */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-44 sm:h-48 pointer-events-none transition-all ${
            isDarkMode
              ? "bg-gradient-to-t from-[#090a0f] via-[#090a0f]/90 to-transparent"
              : "bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent"
          }`}
        />

        {/* THE VOICE SPHERE (Fixed 3D Floating Presence above the capsule bar) */}
        <div className="relative z-10 pointer-events-auto flex flex-col items-center justify-center mb-1.5 transition-all drop-shadow-[0_8px_20px_rgba(59,130,246,0.22)]">
          <FluidVoiceSphere
            size={86}
            theme={isDarkMode ? "ocean" : "ocean"}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            onClick={handleToggleMic}
          />

          {/* Voice State Badge */}
          <div className="mt-0.5 flex items-center gap-1.5">
            {isListening ? (
              <span
                className={`text-[11px] font-bold tracking-tight px-3 py-0.5 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                  isDarkMode
                    ? "bg-slate-900/90 text-emerald-400 border-emerald-900/40"
                    : "bg-white text-emerald-700 border-emerald-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Listening to your voice... Speak your answer
              </span>
            ) : isSpeaking ? (
              <span
                className={`text-[11px] font-bold tracking-tight px-3 py-0.5 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                  isDarkMode
                    ? "bg-slate-900/90 text-blue-400 border-blue-900/40"
                    : "bg-white text-blue-700 border-blue-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                AI Doctor is speaking...
              </span>
            ) : isProcessing ? (
              <span
                className={`text-[11px] font-bold tracking-tight px-3 py-0.5 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                  isDarkMode
                    ? "bg-slate-900/90 text-indigo-400 border-indigo-900/40"
                    : "bg-white text-indigo-700 border-indigo-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Saving answer...
              </span>
            ) : (
              <span
                className={`text-[11px] font-semibold tracking-tight px-3 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-slate-900/80 text-slate-400 border-slate-800"
                    : "bg-white/80 text-slate-500 border-slate-200"
                }`}
              >
                Click an option card or type/speak below
              </span>
            )}
          </div>
        </div>

        {/* BOTTOM CAPSULE BAR WITH DIRECTLY VISIBLE INPUT FIELD */}
        <form
          onSubmit={handleSendTyped}
          className={`relative z-10 pointer-events-auto w-[94%] max-w-2xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 border shadow-xl transition-all ${
            isDarkMode
              ? "bg-[#1e1f24] border-slate-700/80 shadow-black/40 text-slate-200"
              : "bg-white border-slate-200/90 shadow-[0_12px_36px_rgba(15,23,42,0.12)] text-slate-700"
          }`}
        >
          {/* Sparkles Emblem */}
          <div className="pl-1 text-blue-600 shrink-0 flex items-center">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>

          {/* Direct Visible Input Field */}
          <input
            type="text"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            placeholder="Type your symptom or question (English, हिन्दी, বাংলা)..."
            className={`flex-1 min-w-0 px-2 py-1 text-xs sm:text-sm bg-transparent outline-none font-medium ${
              isDarkMode
                ? "text-white placeholder-slate-500"
                : "text-slate-900 placeholder-slate-400"
            }`}
          />

          {/* Send Arrow Button (active when typing) */}
          {typeInput.trim() && (
            <button
              type="submit"
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mic / Speak Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md animate-pulse ring-4 ring-rose-400/20"
                : isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title={isListening ? "Mute microphone" : "Speak to AI Doctor"}
          >
            {isListening ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Sound Mute/Unmute quick toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled((prev) => !prev);
              if (soundEnabled && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            title={soundEnabled ? "AI Voice Active" : "AI Voice Muted"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Close / Exit Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer shrink-0 ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title="Exit voice session"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
}
