import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, LayoutDashboard, Calendar, FileText, Share2,
  Settings, LogOut, Paperclip, Mic, MicOff, Phone, PhoneOff, ShieldAlert,
  Baby, Droplet, Activity, Moon, User, Send, Bot,
  Volume2, VolumeX, Sparkles, Square, AudioLines, Power, ArrowLeft, Sun,
  AlertTriangle, CheckCircle, Wifi, WifiOff, RefreshCw, X
} from 'lucide-react';
import { getCurrentPatient, savePatient } from '../../utils/patientStore';
import { sendAIDoctorChatTurn, sendAIDoctorVoiceTurn, transcribeAudio, synthesizeSpeech } from '../../services/api';
import { callSounds } from '../../utils/callSounds';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const LANG_CODE_MAP = { 'EN': 'en-IN', 'বাংলা': 'bn-IN', 'हिंदी': 'hi-IN' };
const STT_LANG_MAP = { 'en-IN': 'en-IN', 'bn-IN': 'bn-IN', 'hi-IN': 'hi-IN' };

const LOCALIZED_GREETINGS = {
  'EN': {
    author: 'Dr. Aditya Sharma · AI Doctor',
    content: "Hello! 👋 I'm Dr. Aditya Sharma, your AI clinical assistant. Tell me your symptoms or health concerns today.",
    suggestedOptions: ['Fever & Body Ache', 'Dry Cough & Throat', 'Stomach Pain & Acidity', 'General Health Check'],
    voicePrompt: "Hello! I am Dr. Aditya Sharma, your AarogyaVaani AI Doctor. Tap the microphone and tell me your symptoms.",
    listeningHint: "🔴 Listening to your voice — speak now...",
    thinkingHint: "⟳ Analyzing clinical symptoms...",
    speakingHint: "🔊 Dr. Aditya Sharma Speaking — tap to pause",
    idleHint: "Tap the circular microphone below to start speaking in English, বাংলা, or हिंदी.",
    speechTitle: "Dr. Aditya Sharma Speaking",
  },
  'বাংলা': {
    author: 'ডাঃ আদিত্য শর্মা · এআই চিকিৎসক',
    content: "নমস্কার! 👋 আমি ডাঃ আদিত্য শর্মা, আপনার এআই চিকিৎসক। আজ আপনার কী শারীরিক সমস্যা বা অসুস্থতা হচ্ছে বলুন?",
    suggestedOptions: ['জ্বর ও গা ব্যথা', 'শুকনো কাশি ও গলা ব্যথা', 'পেট ব্যথা ও অম্বল', 'সাধারণ স্বাস্থ্য পরীক্ষা'],
    voicePrompt: "নমস্কার! আমি ডাঃ আদিত্য শর্মা, আপনার আরোগ্যবাণী এআই চিকিৎসক। মাইকে চাপ দিয়ে আপনার সমস্যার কথা বলুন।",
    listeningHint: "🔴 আপনার কথা শুনছি — এখন আপনার সমস্যা বলুন...",
    thinkingHint: "⟳ শারীরিক উপসর্গ বিশ্লেষণ করা হচ্ছে...",
    speakingHint: "🔊 ডাঃ আদিত্য শর্মা কথা বলছেন — থামাতে চাপ দিন",
    idleHint: "বাংলায় কথা বলতে নিচে গোল মাইক চিহ্নে চাপ দিন।",
    speechTitle: "ডাঃ আদিত্য শর্মা কথা বলছেন",
  },
  'हिंदी': {
    author: 'डॉ. आदित्य शर्मा · एआई डॉक्टर',
    content: "नमस्ते! 👋 मैं डॉ. आदित्य शर्मा हूँ, आपका एआई डॉक्टर। आज आपकी क्या स्वास्थ्य समस्या या तकलीफ है, बताइए?",
    suggestedOptions: ['तेज बुखार और बदन दर्द', 'सूखी खांसी और गले में खराश', 'पेट दर्द और गैस', 'सामान्य स्वास्थ्य जांच'],
    voicePrompt: "नमस्ते! मैं डॉ. आदित्य शर्मा हूँ, आपका आरोग्यवाणी एआई डॉक्टर। माइक दबाकर अपनी बीमारी या लक्षण बताएं।",
    listeningHint: "🔴 आपकी आवाज सुन रहा हूँ — अभी बोलें...",
    thinkingHint: "⟳ स्वास्थ्य लक्षणों का विश्लेषण हो रहा है...",
    speakingHint: "🔊 डॉ. आदित्य शर्मा बोल रहे हैं — रोकने के लिए टैप करें",
    idleHint: "हिंदी में बात करने के लिए नीचे दिए गए गोल माइक पर टैप करें।",
    speechTitle: "डॉ. आदित्य शर्मा बोल रहे हैं",
  },
};

const INITIAL_MESSAGES = [{
  id: '1',
  author: LOCALIZED_GREETINGS['EN'].author,
  role: 'ai',
  content: LOCALIZED_GREETINGS['EN'].content,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isWarning: true,
  suggestedOptions: LOCALIZED_GREETINGS['EN'].suggestedOptions,
}];

// ── Audio & Media helpers ───────────────────────────────────────────────────
const isSpeechSupported = () =>
  typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
const isTTSSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;
const isMediaRecorderSupported = () =>
  typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';

let currentAudio = null;
let currentUtterance = null;

function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }
  if (isTTSSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  currentUtterance = null;
  window._aarogyaUtterance = null;
}

function playBase64Audio(base64Wav, onEnd, onError) {
  stopSpeaking();
  if (!base64Wav) {
    onEnd?.();
    return;
  }
  try {
    const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };
    audio.onerror = (e) => {
      console.warn("[playBase64Audio] Audio playback notice:", e);
      currentAudio = null;
      onError?.(e);
    };
    const p = audio.play();
    if (p && p.catch) {
      p.catch((err) => {
        console.warn("[playBase64Audio] Audio play() blocked or error:", err);
        currentAudio = null;
        onError?.(err);
      });
    }
  } catch (err) {
    console.warn("[playBase64Audio] Exception:", err);
    currentAudio = null;
    onError?.(err);
  }
}

function fallbackBrowserSpeech(cleanText, lang, onEnd, onError) {
  if (!isTTSSupported()) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (_) {}

  const utt = new SpeechSynthesisUtterance(cleanText);
  utt.lang = lang;
  utt.rate = 0.94;
  utt.pitch = 0.98;
  utt.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const langPrefix = (lang || 'en').split('-')[0].toLowerCase();
  const preferred =
    voices.find(v => v.lang === lang && v.name.toLowerCase().includes('male')) ||
    voices.find(v => v.lang === lang) ||
    voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
    voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en'));

  if (preferred) utt.voice = preferred;

  currentUtterance = utt;
  window._aarogyaUtterance = utt;

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      currentUtterance = null;
      window._aarogyaUtterance = null;
      onEnd?.();
    }
  };

  utt.onend = finish;
  utt.onerror = (e) => {
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      onError?.(e.error);
    }
    finish();
  };

  try {
    window.speechSynthesis.speak(utt);
  } catch (err) {
    console.warn("SpeechSynthesis speak notice:", err);
    finish();
  }
}

async function speakText(text, lang = 'bn-IN', onEnd, onError, audioBase64 = null) {
  // If we already have synthesized WAV audio from Sarvam AI, play it immediately!
  if (audioBase64) {
    playBase64Audio(audioBase64, onEnd, () => {
      fallbackBrowserSpeech(text, lang, onEnd, onError);
    });
    return;
  }

  // Strip markdown formatting and emojis before reading aloud
  const cleanText = (text || '')
    .replace(/[*#_`~]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return;
  }

  // Auto-detect target script to guarantee correct Sarvam pronunciation
  let targetLang = lang || 'bn-IN';
  if (/[\u0980-\u09FF]/.test(cleanText)) {
    targetLang = 'bn-IN';
  } else if (/[\u0900-\u097F]/.test(cleanText)) {
    targetLang = 'hi-IN';
  }

  // Synthesize on-demand using Sarvam AI Bulbul v3 with male doctor voice 'aditya'
  try {
    const res = await synthesizeSpeech({
      text: cleanText,
      language: targetLang,
      speaker: 'aditya',
    });
    if (res && res.audio_base64) {
      playBase64Audio(res.audio_base64, onEnd, () => {
        fallbackBrowserSpeech(cleanText, targetLang, onEnd, onError);
      });
      return;
    }
  } catch (err) {
    console.warn("[speakText] Sarvam backend TTS fallback:", err);
  }

  // Final fallback to native browser speech synthesis
  fallbackBrowserSpeech(cleanText, targetLang, onEnd, onError);
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PatientAIDoctorPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [aiState, setAiState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  const [selectedLang, setSelectedLang] = useState('EN');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreenVoice, setIsFullscreenVoice] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveAIText, setLiveAIText] = useState('');
  const [voiceAutoRead, setVoiceAutoRead] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [voiceHistory, setVoiceHistory] = useState([
    { id: 1, role: 'ai', text: 'Hello! I am your AarogyaVaani AI Doctor. Tap the microphone and tell me your symptoms.' }
  ]);
  const [micPermission, setMicPermission] = useState('unknown');

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const twIntervalRef = useRef(null);
  const historyRef = useRef([]);

  const [patient] = useState(() => getCurrentPatient() || {
    name: 'Mamta Debbarma', id: 'AV-2026-8921',
    pregnancyBadge: '2nd Trimester (20w)', bloodGroup: 'B+', allergies: ['Sulfa Antibiotics'],
  });

  const currentLangCode = LANG_CODE_MAP[selectedLang] || 'en-IN';

  const handleLanguageChange = useCallback((newLang) => {
    setSelectedLang(newLang);
    const greetingConfig = LOCALIZED_GREETINGS[newLang] || LOCALIZED_GREETINGS['EN'];
    const newLangCode = LANG_CODE_MAP[newLang] || 'en-IN';

    // If chat only contains the initial AI greeting, update it cleanly to the selected language
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: '1',
          author: greetingConfig.author,
          role: 'ai',
          content: greetingConfig.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isWarning: true,
          suggestedOptions: greetingConfig.suggestedOptions,
        }];
      }
      return prev;
    });

    // Update voice history initial greeting for fullscreen voice
    setVoiceHistory(prev => {
      if (prev.length <= 1) {
        return [{ id: 1, role: 'ai', text: greetingConfig.voicePrompt }];
      }
      return prev;
    });

    // If voiceAutoRead is enabled or in fullscreen voice mode, speak the new greeting immediately!
    if (voiceAutoRead || isFullscreenVoice) {
      stopSpeaking();
      speakText(
        greetingConfig.content,
        newLangCode,
        () => setAiState('IDLE'),
        () => setAiState('IDLE')
      );
    }
  }, [voiceAutoRead, isFullscreenVoice]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiState, liveTranscript, liveAIText, voiceHistory]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (isTTSSupported()) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => stopSpeaking();
  }, []);

  const stopRec = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
      mediaRecorderRef.current = null;
    }
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (_) {}
      audioStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRec();
      if (twIntervalRef.current) clearInterval(twIntervalRef.current);
    };
  }, [stopRec]);

  const syncDoctorQueue = useCallback((text) => {
    try {
      const c = getCurrentPatient();
      if (c) {
        c.chiefComplaint = text;
        c.status = 'In Queue';
        savePatient(c);
        window.dispatchEvent(new Event('aarogya_patient_updated'));
      }
    } catch (_) {}
  }, []);

  const typeWriter = useCallback((text, setter, speed = 16, onDone) => {
    let i = 0;
    setter('');
    const iv = setInterval(() => {
      i += 2;
      setter(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, speed);
    twIntervalRef.current = iv;
    return iv;
  }, []);

  const callAPI = useCallback(async (userMessage, isVoice = false) => {
    const fn = isVoice ? sendAIDoctorVoiceTurn : sendAIDoctorChatTurn;
    try {
      const resp = await fn({
        consultationId,
        patientId: patient?.id || 'AV-2026-8921',
        userName: patient?.name || 'Patient',
        userMessage,
        language: currentLangCode,
        history: historyRef.current.slice(-10),
      });
      if (resp.consultation_id) setConsultationId(resp.consultation_id);
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: resp.ai_message }
      ];
      setApiError(null);
      syncDoctorQueue(userMessage);
      return resp;
    } catch (err) {
      console.warn("[callAPI Error]:", err);
      setApiError('Could not reach AI server. Please check your connection.');
      throw err;
    }
  }, [consultationId, patient, currentLangCode, syncDoctorQueue]);

  const handleSend = useCallback(async (text, wasVoice = false) => {
    const msg = (typeof text === 'string' ? text : draft).trim();
    if (!msg || aiState === 'THINKING' || aiState === 'SPEAKING') return;
    setDraft('');
    setLiveTranscript('');
    setApiError(null);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: patient.name || 'Patient',
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setAiState('THINKING');

    try {
      const resp = await callAPI(msg, wasVoice);
      const aiText = resp.ai_message;
      const audioBase64 = resp.audio_base64 || null;
      const aiMsgId = (Date.now() + 1).toString();
      setAiState('SPEAKING');

      typeWriter(aiText, setLiveAIText, 16, () => {
        setMessages(prev => [...prev, {
          id: aiMsgId,
          author: 'Dr. Aditya Sharma · AI Doctor',
          role: 'ai',
          content: aiText,
          time: resp.display_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedOptions: resp.suggested_options || [],
          dangerSigns: resp.danger_signs || [],
          triageLevel: resp.triage_level,
          audio_base64: audioBase64,
        }]);
        setLiveAIText('');
        if (!wasVoice && !voiceAutoRead) {
          setAiState('IDLE');
        }
      });

      if (wasVoice || voiceAutoRead) {
        setSpeakingMessageId(aiMsgId);
        speakText(
          aiText,
          currentLangCode,
          () => { setAiState('IDLE'); setSpeakingMessageId(null); },
          () => { setAiState('IDLE'); setSpeakingMessageId(null); },
          audioBase64
        );
      }
    } catch (_) {
      setAiState('IDLE');
      setSpeakingMessageId(null);
    }
  }, [draft, aiState, patient, callAPI, typeWriter, voiceAutoRead, currentLangCode]);

  const toggleMessageSpeech = useCallback((msg) => {
    if (speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
      if (aiState === 'SPEAKING') setAiState('IDLE');
    } else {
      stopSpeaking();
      setSpeakingMessageId(msg.id);
      setAiState('SPEAKING');
      speakText(
        msg.content || msg.text,
        currentLangCode,
        () => { setSpeakingMessageId(null); setAiState('IDLE'); },
        () => { setSpeakingMessageId(null); setAiState('IDLE'); },
        msg.audio_base64 || null
      );
    }
  }, [speakingMessageId, aiState, currentLangCode]);

  const startListening = useCallback((onResult, onError) => {
    let capturedTranscript = '';
    let hasDelivered = false;
    audioChunksRef.current = [];

    const deliverResult = (text) => {
      if (hasDelivered) return;
      const trimmed = (text || '').trim();
      if (trimmed) {
        hasDelivered = true;
        onResult?.(trimmed);
      }
    };

    // 1. Microphone media stream & MediaRecorder setup (Whisper fallback)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioStreamRef.current = stream;
          setMicPermission('granted');
          if (isMediaRecorderSupported()) {
            try {
              const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
              const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
              mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
              };
              mr.start(250);
              mediaRecorderRef.current = mr;
            } catch (err) {
              console.warn("MediaRecorder init notice:", err);
            }
          }
        })
        .catch(err => {
          console.warn("Microphone access request:", err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setMicPermission('denied');
            onError?.('Microphone access denied. Please allow microphone in browser settings.');
          }
        });
    }

    // 2. Web Speech Recognition (Real-time live transcription)
    if (isSpeechSupported()) {
      try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = STT_LANG_MAP[currentLangCode] || 'en-IN';
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onresult = (e) => {
          let interim = '', final = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) final += t; else interim += t;
          }
          const text = (final || interim).trim();
          if (text) {
            capturedTranscript = text;
            setLiveTranscript(text);
          }
          if (final.trim()) {
            deliverResult(final.trim());
          }
        };

        rec.onerror = async (e) => {
          console.warn("Speech recognition error notice:", e.error);
          if (e.error === 'not-allowed' || e.error === 'permission-denied') {
            setMicPermission('denied');
            onError?.('Microphone access denied. Allow mic in browser settings.');
            return;
          }
          if (e.error === 'no-speech') {
            if (capturedTranscript) {
              deliverResult(capturedTranscript);
            } else {
              onError?.('No speech detected. Please tap mic and try again.');
            }
            return;
          }
          // Network error in Linux Chromium -> attempt Whisper audio fallback
          if (e.error === 'network' && audioChunksRef.current.length > 0) {
            try {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const res = await transcribeAudio(blob, currentLangCode);
              if (res && res.text) {
                deliverResult(res.text);
                return;
              }
            } catch (_) {}
          }
          onError?.(e.error);
        };

        rec.onend = async () => {
          if (capturedTranscript && !hasDelivered) {
            deliverResult(capturedTranscript);
          } else if (!hasDelivered && audioChunksRef.current.length > 0) {
            try {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const res = await transcribeAudio(blob, currentLangCode);
              if (res && res.text) {
                deliverResult(res.text);
                return;
              }
            } catch (_) {}
            setAiState('IDLE');
          } else if (!hasDelivered) {
            setAiState('IDLE');
          }
        };

        recognitionRef.current = rec;
        rec.start();
        setMicPermission('granted');
      } catch (err) {
        console.warn("Could not start Web Speech Recognition:", err);
      }
    } else {
      // Browser does not support Web Speech API -> use MediaRecorder Whisper directly
      console.info("Using MediaRecorder Whisper STT fallback");
    }

    return () => stopRec();
  }, [currentLangCode, stopRec]);

  const handleVoiceToggle = useCallback(() => {
    // If currently listening, clicking mic stops listening and keeps transcribed text in draft
    if (aiState === 'LISTENING') {
      const textToKeep = (liveTranscript || '').trim();
      stopRec();
      stopSpeaking();
      if (textToKeep) {
        setDraft(textToKeep);
      }
      setLiveTranscript('');
      setAiState('IDLE');
      return;
    }

    if (aiState !== 'IDLE') return;

    setAiState('LISTENING');
    setLiveTranscript('');
    setLiveAIText('');
    stopSpeaking();

    startListening(
      async (spoken) => {
        stopRec();
        setLiveTranscript('');
        if (!spoken || !spoken.trim()) {
          setAiState('IDLE');
          return;
        }
        handleSend(spoken, true);
      },
      (err) => {
        console.warn("[Voice STT notice]:", err);
        if (err && !err.includes('no-speech')) {
          setApiError(err);
        }
        setLiveTranscript('');
        setAiState('IDLE');
      }
    );
  }, [aiState, liveTranscript, handleSend, startListening, stopRec]);

  const startFullscreenVoice = useCallback(() => {
    if (aiState === 'SPEAKING') {
      stopSpeaking();
      setAiState('IDLE');
      return;
    }
    if (aiState === 'LISTENING') {
      stopRec();
      setLiveTranscript('');
      setAiState('IDLE');
      return;
    }
    if (aiState !== 'IDLE') return;

    setAiState('LISTENING');
    setLiveTranscript('');
    stopSpeaking();

    startListening(
      async (spoken) => {
        stopRec();
        setVoiceHistory(prev => [...prev, { id: Date.now(), role: 'user', text: spoken }]);
        setLiveTranscript('');
        setAiState('THINKING');

        try {
          const resp = await callAPI(spoken, true);
          const aiText = resp.ai_message;
          const audioBase64 = resp.audio_base64 || null;
          setAiState('SPEAKING');

          typeWriter(aiText, setLiveTranscript, 20, () => {
            setVoiceHistory(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiText, audio_base64: audioBase64 }]);
            setLiveTranscript('');
          });

          speakText(
            aiText,
            currentLangCode,
            () => setAiState('IDLE'),
            () => setAiState('IDLE'),
            audioBase64
          );
        } catch (_) {
          setAiState('IDLE');
        }
      },
      (err) => {
        if (err && !err.includes('no-speech')) {
          setApiError(err);
        }
        setLiveTranscript('');
        setAiState('IDLE');
      }
    );
  }, [aiState, callAPI, startListening, stopRec, typeWriter, currentLangCode]);

  const stopAll = useCallback(() => {
    stopSpeaking();
    stopRec();
    if (twIntervalRef.current) clearInterval(twIntervalRef.current);
    setLiveTranscript('');
    setLiveAIText('');
    setSpeakingMessageId(null);
    setAiState('IDLE');
  }, [stopRec]);

  const openFullscreenVoice = useCallback(() => {
    stopAll();
    try {
      callSounds.playCallConnectedChime();
    } catch (_) {}
    setIsFullscreenVoice(true);
  }, [stopAll]);

  const closeFullscreenVoice = useCallback(() => {
    try {
      callSounds.playCallEndTone();
    } catch (_) {}
    stopAll();
    setIsFullscreenVoice(false);
  }, [stopAll]);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    .font-sans { font-family: 'Inter', -apple-system, sans-serif; }
    .scrollbar-none::-webkit-scrollbar { display:none; }
    .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }
    @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
    .animate-breathe { animation: breathe 4s ease-in-out infinite; }
    @keyframes pulse-ring { 0%{transform:scale(0.85);opacity:0.9} 100%{transform:scale(1.9);opacity:0} }
    .animate-pulse-ring-1 { animation: pulse-ring 2s ease-out infinite; }
    .animate-pulse-ring-2 { animation: pulse-ring 2s ease-out infinite 0.65s; }
    @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .animate-spin-slow { animation: spin-slow 4s linear infinite; }
    @keyframes waveform { 0%,100%{height:4px} 50%{height:22px} }
    .animate-wave-1 { animation: waveform 1.2s ease-in-out infinite; }
    .animate-wave-2 { animation: waveform 1.0s ease-in-out infinite 0.2s; }
    .animate-wave-3 { animation: waveform 1.1s ease-in-out infinite 0.4s; }
    .animate-wave-4 { animation: waveform 0.9s ease-in-out infinite 0.1s; }
    .animate-wave-5 { animation: waveform 1.3s ease-in-out infinite 0.3s; }
    .blinking-cursor::after { content:'|'; animation: blink 1s step-end infinite; }
    @keyframes blink { 50%{opacity:0} }
    @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .slide-up { animation: slideUp 0.25s ease-out forwards; }
  `;

  // ── FULLSCREEN VOICE VIEW ────────────────────────────────────────────────
  if (isFullscreenVoice) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC] font-sans text-slate-900 overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: CSS}} />
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button onClick={closeFullscreenVoice}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
              title="Return to Chat">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white"><HeartPulse size={18}/></div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Dr. Aditya Sharma · AI Voice</h1>
                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live Voice Call · Tripura Health Mission
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1">
              {['EN','বাংলা','हिंदी'].map(lang => (
                <button key={lang} onClick={() => handleLanguageChange(lang)}
                  className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                    selectedLang === lang ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900')}>
                  {lang}
                </button>
              ))}
            </div>
            <button onClick={closeFullscreenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              <PhoneOff size={14}/>End Call
            </button>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <ShieldAlert size={14}/>Emergency: 108
            </span>
          </div>
        </header>

        {apiError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertTriangle size={14}/><span>{apiError}</span>
            <button onClick={() => setApiError(null)} className="ml-auto cursor-pointer"><X size={14}/></button>
          </div>
        )}

        <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-28 px-6 overflow-y-auto scrollbar-none">
          {/* Animated Avatar / Audio Orb */}
          <div className="relative flex items-center justify-center w-52 h-52 mb-6 shrink-0">
            {aiState === 'LISTENING' && (<>
              <div className="absolute inset-0 rounded-full border-[2px] border-rose-400/40 animate-pulse-ring-1"/>
              <div className="absolute inset-0 rounded-full border-[2px] border-rose-400/30 animate-pulse-ring-2"/>
            </>)}
            {aiState === 'THINKING' && <div className="absolute inset-[-16px] rounded-full border-[3px] border-dashed border-cyan-400 animate-spin-slow opacity-70"/>}
            {aiState === 'SPEAKING' && <div className="absolute inset-[-24px] rounded-full bg-emerald-400/20 blur-2xl animate-breathe"/>}
            <div className={cn(
              'relative z-10 w-36 h-36 rounded-[2rem] flex flex-col items-center justify-center shadow-inner transition-all duration-500 animate-breathe',
              aiState === 'IDLE' ? 'bg-slate-800 shadow-xl' : 'bg-[#0F172A]',
              aiState === 'LISTENING' ? 'shadow-[0_0_40px_rgba(244,63,94,0.35)] border border-rose-500/40' : '',
              aiState === 'THINKING' ? 'shadow-[0_0_40px_rgba(6,182,212,0.35)] border border-cyan-500/40' : '',
              aiState === 'SPEAKING' ? 'shadow-[0_0_50px_rgba(52,211,153,0.45)] scale-105 border border-emerald-400/60' : ''
            )}>
              <Bot size={58} strokeWidth={1.5}
                color={aiState === 'IDLE' ? '#94a3b8' : aiState === 'THINKING' ? '#22d3ee' : aiState === 'LISTENING' ? '#fb7185' : '#34d399'}
                className={cn('transition-colors duration-300', aiState !== 'IDLE' && 'animate-pulse', aiState === 'SPEAKING' && 'mb-4')}
              />
              {aiState === 'SPEAKING' && (
                <div className="absolute bottom-5 flex gap-1.5">
                  {[1,2,3,4,5].map(n => <div key={n} className={`w-1.5 bg-emerald-400 rounded-full animate-wave-${n}`}/>)}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            {aiState === 'IDLE' && (
              selectedLang === 'বাংলা' ? '● প্রস্তুত — ডাঃ আদিত্য শর্মার সাথে কথা বলতে মাইকে চাপ দিন' :
              selectedLang === 'हिंदी' ? '● तैयार — डॉ. आदित्य शर्मा से बात करने के लिए माइक टैप करें' :
              '● Ready — tap mic to speak with Dr. Aditya Sharma'
            )}
            {aiState === 'LISTENING' && (
              LOCALIZED_GREETINGS[selectedLang]?.listeningHint || '🔴 Listening to your voice — speak now...'
            )}
            {aiState === 'THINKING' && (
              LOCALIZED_GREETINGS[selectedLang]?.thinkingHint || '⟳ Analyzing clinical symptoms...'
            )}
            {aiState === 'SPEAKING' && (
              LOCALIZED_GREETINGS[selectedLang]?.speakingHint || '🔊 Dr. Aditya Sharma Speaking — tap to pause'
            )}
          </p>

          <div className="w-full max-w-2xl flex flex-col gap-4 mb-4 opacity-75">
            {voiceHistory.slice(-4).map(m => (
              <div key={m.id} className={cn('flex flex-col', m.role === 'user' ? 'items-end text-right' : 'items-start text-left')}>
                <span className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', m.role === 'user' ? 'text-slate-400' : 'text-emerald-600')}>
                  {m.role === 'user' ? 'You' : 'Dr. Aditya Sharma'}
                </span>
                <p className={cn('text-base font-medium leading-relaxed max-w-[90%] px-4 py-2 rounded-2xl',
                  m.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-50 text-emerald-950 border border-emerald-100')}>
                  "{m.text}"
                </p>
              </div>
            ))}
          </div>

          <div className="w-full max-w-2xl min-h-[100px] flex flex-col items-center text-center">
            {aiState === 'LISTENING' && (<>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Mic size={14} className="animate-pulse"/>Live Speech Capture
              </span>
              <h2 className="text-xl font-semibold text-slate-800 leading-tight blinking-cursor">
                {liveTranscript || 'Speak your symptoms now...'}
              </h2>
            </>)}
            {aiState === 'THINKING' && (<>
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse"/>Dr. Aditya Sharma is preparing guidance
              </span>
              <div className="flex gap-2 items-center h-8">
                {[0,150,300].map(d => <span key={d} className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
              </div>
            </>)}
            {aiState === 'SPEAKING' && (<>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AudioLines size={14}/>Dr. Aditya Sharma Speaking
              </span>
              <h2 className="text-xl font-semibold text-emerald-900 leading-tight blinking-cursor">
                "{liveTranscript}"
              </h2>
            </>)}
            {aiState === 'IDLE' && voiceHistory.length <= 1 && (
              <p className="text-sm font-medium text-slate-500">
                {LOCALIZED_GREETINGS[selectedLang]?.idleHint || 'Tap the circular microphone below to start speaking in English, বাংলা, or हिंदी.'}
              </p>
            )}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-3 bg-gradient-to-t from-[#F7F9FC] via-[#F7F9FC]/90 to-transparent pointer-events-none">
          <button onClick={startFullscreenVoice} disabled={aiState === 'THINKING'}
            className={cn('pointer-events-auto flex items-center justify-center rounded-full transition-all duration-300 shadow-xl cursor-pointer',
              aiState === 'IDLE' ? 'w-20 h-20 bg-slate-900 hover:bg-slate-800 text-white hover:scale-105' :
              aiState === 'LISTENING' ? 'w-20 h-20 bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20' :
              aiState === 'SPEAKING' ? 'w-20 h-20 bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-500/20' :
              'w-20 h-20 bg-slate-300 text-slate-400 cursor-not-allowed'
            )}
            title={aiState === 'LISTENING' ? 'Finish Speaking' : aiState === 'SPEAKING' ? 'Stop Audio' : 'Speak'}>
            {aiState === 'IDLE' && <Mic size={32}/>}
            {aiState === 'LISTENING' && <Square size={24} className="fill-current"/>}
            {aiState === 'THINKING' && <RefreshCw size={24} className="animate-spin"/>}
            {aiState === 'SPEAKING' && <Square size={24} className="fill-current"/>}
          </button>
          {micPermission === 'denied' && (
            <p className="pointer-events-auto text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5">
              Microphone access blocked — allow microphone permissions in your browser.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── CHAT VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col h-screen font-sans text-slate-900 overflow-hidden', isDarkMode ? 'bg-slate-950' : 'bg-[#FAFAFA]')}>
      <style dangerouslySetInnerHTML={{__html: CSS}}/>

      {/* HEADER */}
      <header className={cn('h-14 border-b flex items-center justify-between px-6 z-20 shrink-0', isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm"><HeartPulse size={18}/></div>
          <div>
            <h1 className={cn('text-[13px] font-bold leading-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>AarogyaVaani</h1>
            <p className="text-[10px] font-medium text-slate-500">National Health Mission · Tripura</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOnline
            ? <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold"><Wifi size={12}/>Live</span>
            : <span className="flex items-center gap-1 text-rose-500 text-[10px] font-bold"><WifiOff size={12}/>Offline</span>
          }

          {/* Fullscreen Voice Call Trigger */}
          <button onClick={openFullscreenVoice}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer">
            <Phone size={13}/>Talk to our AI Doctor
          </button>

          {/* Voice Auto-Read Toggle */}
          <button onClick={() => setVoiceAutoRead(!voiceAutoRead)}
            className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer',
              voiceAutoRead
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700')}
            title={voiceAutoRead ? 'AI voice speech is ON (click to mute)' : 'AI voice speech is OFF (click to enable)'}>
            {voiceAutoRead ? <Volume2 size={13} className="text-emerald-600"/> : <VolumeX size={13} className="text-slate-400"/>}
            <span>Voice {voiceAutoRead ? 'On' : 'Muted'}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1">
            {['EN','বাংলা','हिंदी'].map(lang => (
              <button key={lang} onClick={() => handleLanguageChange(lang)}
                className={cn('px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                  selectedLang === lang ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900')}>
                {lang}
              </button>
            ))}
          </div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
            {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-100">
              {(patient.name || 'MD').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <span className={cn('text-[13px] font-semibold hidden md:block', isDarkMode ? 'text-slate-200' : 'text-slate-700')}>{patient.name || 'Mamta Debbarma'}</span>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {apiError && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 flex items-center gap-2 text-rose-700 text-xs font-medium z-10">
          <AlertTriangle size={14} className="shrink-0"/><span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded cursor-pointer"><X size={12}/></button>
        </div>
      )}

      <div className="flex-1 min-h-0 flex w-full overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className={cn('w-56 border-r flex flex-col shrink-0 z-10 h-full', isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <div className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
            <NavItem icon={LayoutDashboard} label="Dashboard" dark={isDarkMode} onClick={() => navigate('/patient/dashboard')}/>
            <NavItem icon={HeartPulse} label="AI Doctor" active dark={isDarkMode}/>
            <NavItem icon={Calendar} label="Appointments" dark={isDarkMode} onClick={() => navigate('/patient/appointments')}/>
            <NavItem icon={FileText} label="Documents" dark={isDarkMode} onClick={() => navigate('/patient/documents')}/>
            <NavItem icon={Share2} label="Share Access" dark={isDarkMode} onClick={() => navigate('/patient/share')}/>
          </div>
          <div className={cn('p-3 border-t space-y-0.5', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
            <NavItem icon={User} label="Profile" dark={isDarkMode} onClick={() => navigate('/patient/profile')}/>
            <NavItem icon={Settings} label="Settings" dark={isDarkMode} onClick={() => navigate('/patient/settings')}/>
            <NavItem icon={LogOut} label="Sign Out" dark={isDarkMode} textClass="text-rose-600 hover:bg-rose-50"
              onClick={() => { sessionStorage.clear(); navigate('/login'); }}/>
          </div>
        </aside>

        {/* CHAT AREA */}
        <main className={cn('flex-1 flex flex-col min-w-0 relative border-r h-full overflow-hidden', isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200')}>
          <div className={cn('h-14 border-b flex items-center justify-between px-6 shrink-0 z-10 gap-3', isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100')}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0"><HeartPulse size={16}/></div>
              <div className="min-w-0">
                <h2 className={cn('text-[14px] font-bold truncate', isDarkMode ? 'text-white' : 'text-slate-900')}>Dr. Aditya Sharma · AI Doctor</h2>
                <p className="text-[11px] font-medium text-slate-500 truncate">Instant clinical triage · Voice & text in {selectedLang}</p>
              </div>
            </div>
            <button onClick={openFullscreenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0">
              <Mic size={14}/>Fullscreen Voice
            </button>
          </div>

          <div className={cn('flex-1 overflow-y-auto scrollbar-none px-6 py-6 space-y-4', isDarkMode ? 'bg-slate-950' : 'bg-white')}>
            <div className="flex justify-center mb-6">
              <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">Today</span>
            </div>

            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-3 group slide-up">
                {msg.role === 'ai'
                  ? <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0 shadow-sm border border-slate-700"><Bot size={20} color="#34d399"/></div>
                  : <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <span className="text-[10px] font-bold">{(patient.name || 'MD').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</span>
                    </div>
                }
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span className={cn('text-[13px] font-bold', msg.role === 'ai' ? 'text-emerald-700' : isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{msg.author}</span>
                    <span className="text-[10px] font-medium text-slate-400 font-mono">{msg.time}</span>
                    {msg.triageLevel === 'EMERGENCY' && <span className="text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5 uppercase flex items-center gap-1"><AlertTriangle size={10}/>Emergency</span>}
                    {msg.triageLevel === 'MONITOR' && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 uppercase">Monitor</span>}
                    {msg.triageLevel === 'STABLE' && msg.role === 'ai' && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 uppercase flex items-center gap-1"><CheckCircle size={10}/>Stable</span>}

                    {/* Read Aloud Button for AI messages */}
                    {msg.role === 'ai' && (
                      <button onClick={() => toggleMessageSpeech(msg)}
                        className={cn('ml-auto text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer',
                          speakingMessageId === msg.id
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100')}
                        title={speakingMessageId === msg.id ? 'Stop reading' : 'Read aloud'}>
                        {speakingMessageId === msg.id ? <Square size={10} className="fill-current"/> : <Volume2 size={12}/>}
                        <span className="text-[10px]">{speakingMessageId === msg.id ? 'Speaking' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                  <p className={cn('text-[13px] leading-relaxed max-w-3xl whitespace-pre-wrap', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>{msg.content}</p>

                  {msg.dangerSigns?.length > 0 && (
                    <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2 items-start max-w-2xl">
                      <ShieldAlert size={14} className="text-rose-600 shrink-0 mt-0.5"/>
                      <div>{msg.dangerSigns.map((d,i) => <p key={i} className="text-[11px] font-medium text-rose-900">{typeof d === 'string' ? d : d.alert}</p>)}</div>
                    </div>
                  )}

                  {msg.isWarning && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start max-w-2xl shadow-sm">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                      <p className="text-[11px] font-medium text-amber-900 leading-snug">AarogyaVaani AI provides primary clinical triage. For emergencies, visit your nearest PHC or dial 108.</p>
                    </div>
                  )}

                  {msg.suggestedOptions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {msg.suggestedOptions.map((opt, i) => (
                        <button key={i} onClick={() => handleSend(opt)} disabled={aiState !== 'IDLE'}
                          className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-full text-[11px] font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiState === 'LISTENING' && (
              <div className="flex items-start gap-3 slide-up">
                <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <Mic size={16} className="text-rose-500 animate-pulse"/>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-slate-900">{patient.name || 'Patient'}</span>
                    <span className="text-[10px] font-medium text-rose-500 uppercase tracking-wider font-mono animate-pulse">● Listening...</span>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed blinking-cursor">{liveTranscript || 'Speak your symptoms clearly...'}</p>
                </div>
              </div>
            )}

            {aiState === 'THINKING' && (
              <div className="flex items-start gap-3 slide-up">
                <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0 border border-slate-700"><Bot size={20} color="#22d3ee" className="animate-pulse"/></div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-2 mb-1"><span className="text-[13px] font-bold text-cyan-700">Dr. Aditya Sharma</span><span className="text-[10px] text-slate-400 font-mono">Analyzing symptoms...</span></div>
                  <div className="flex gap-1 items-center h-4">{[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div>
                </div>
              </div>
            )}

            {aiState === 'SPEAKING' && liveAIText && (
              <div className="flex items-start gap-3 slide-up">
                <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0 border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]"><Bot size={20} color="#34d399"/></div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-emerald-700">Dr. Aditya Sharma</span>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono animate-pulse flex items-center gap-1"><AudioLines size={10}/>Speaking</span>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed blinking-cursor">{liveAIText}</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* INPUT AREA */}
          <div className={cn('p-4 shrink-0 z-10 border-t', isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100')}>
            <div className={cn(
              'max-w-4xl mx-auto flex items-center gap-2 p-2 rounded-2xl transition-all shadow-sm border',
              aiState === 'LISTENING' ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/40' :
              aiState === 'THINKING' ? 'border-cyan-300 ring-2 ring-cyan-500/10 opacity-80' :
              aiState === 'SPEAKING' ? 'border-emerald-300 ring-2 ring-emerald-500/10' :
              isDarkMode ? 'bg-slate-800 border-slate-700 focus-within:border-emerald-500' :
              'bg-[#F8FAFC] border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500'
            )}>
              <button type="button" className="p-2 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"><Paperclip size={18}/></button>

              <input type="text"
                value={aiState === 'LISTENING' ? (liveTranscript || draft) : draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={aiState === 'THINKING'}
                placeholder={aiState === 'LISTENING' ? "Listening... Speak your symptoms now" : "Describe your symptoms or ask a health question..."}
                className={cn('flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[13px] font-medium py-1.5',
                  isDarkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400')}
              />

              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                {/* Microphone / Listening Toggle Button */}
                <button type="button" id="voice-toggle-btn" onClick={handleVoiceToggle}
                  title={aiState === 'LISTENING' ? 'Stop Listening' : 'Voice Input (Speak)'}
                  className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer',
                    aiState === 'LISTENING'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20'
                      : aiState === 'THINKING'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200')}>
                  {aiState === 'LISTENING' ? <Square size={14} className="fill-current"/> : <Mic size={17}/>}
                </button>

                {/* Send Button */}
                <button type="button" id="send-btn" onClick={() => handleSend()} disabled={!draft.trim() || aiState === 'THINKING'}
                  className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm',
                    draft.trim() && aiState !== 'THINKING' ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}>
                  <Send size={15}/>
                </button>
              </div>
            </div>

            {aiState === 'LISTENING' && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"/>
                <p className="text-center text-[11px] font-bold text-rose-600 tracking-wide">
                  Microphone active — speak clearly, then tap stop or pause to send
                </p>
              </div>
            )}
            {aiState === 'SPEAKING' && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <AudioLines size={14} className="text-emerald-600 animate-pulse"/>
                <p className="text-center text-[11px] font-medium text-emerald-700">
                  Dr. Aditya Sharma is speaking · <button onClick={stopSpeaking} className="underline font-bold cursor-pointer hover:text-emerald-800">Tap to silence</button>
                </p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className={cn('w-[340px] flex flex-col shrink-0 overflow-y-auto scrollbar-none hidden lg:flex', isDarkMode ? 'bg-slate-900' : 'bg-[#FAFAFA]')}>
          <div className={cn('p-6 flex flex-col items-center justify-center border-b min-h-[320px]', isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
            <div className="w-full flex justify-between items-center mb-6">
              <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Copilot</span><span className="text-[9px] font-mono text-slate-400">Core v2.0 · Tripura PHC</span></div>
              <div className={cn('px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-colors',
                aiState === 'IDLE' ? 'bg-slate-50 border-slate-200 text-slate-500' :
                aiState === 'THINKING' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                aiState === 'LISTENING' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                'bg-emerald-50 border-emerald-200 text-emerald-700')}>
                {aiState}
              </div>
            </div>

            <div className="relative flex items-center justify-center w-36 h-36 mb-6">
              {aiState === 'LISTENING' && (<><div className="absolute inset-0 rounded-full border-[2px] border-rose-400/40 animate-pulse-ring-1"/><div className="absolute inset-0 rounded-full border-[2px] border-rose-400/30 animate-pulse-ring-2"/></>)}
              {aiState === 'THINKING' && <div className="absolute inset-[-12px] rounded-full border-[3px] border-dashed border-cyan-300 animate-spin-slow opacity-70"/>}
              {aiState === 'SPEAKING' && <div className="absolute inset-[-16px] rounded-full bg-emerald-400/20 blur-xl animate-breathe"/>}
              <div className={cn(
                'relative z-10 w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center shadow-inner transition-all duration-500 animate-breathe',
                aiState === 'IDLE' ? 'bg-slate-800' : 'bg-[#0F172A]',
                aiState === 'LISTENING' ? 'shadow-[0_0_30px_rgba(244,63,94,0.3)] border border-rose-500/30' : '',
                aiState === 'THINKING' ? 'shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-500/30' : '',
                aiState === 'SPEAKING' ? 'shadow-[0_0_40px_rgba(52,211,153,0.4)] scale-105 border border-emerald-400/50' : ''
              )}>
                <Bot size={42}
                  color={aiState === 'IDLE' ? '#94a3b8' : aiState === 'THINKING' ? '#22d3ee' : aiState === 'LISTENING' ? '#fb7185' : '#34d399'}
                  className={cn('transition-colors duration-300', aiState !== 'IDLE' && 'animate-pulse', aiState === 'SPEAKING' && 'mb-2')}
                />
                {aiState === 'SPEAKING' && <div className="absolute bottom-3.5 flex gap-1">{[1,2,3,4].map(n => <div key={n} className={`w-1 bg-emerald-400 rounded-full animate-wave-${n}`}/>)}</div>}
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 text-center mb-4 h-4 tracking-wide">
              {aiState === 'IDLE' && 'System is standing by.'}
              {aiState === 'LISTENING' && 'Transcribing your voice...'}
              {aiState === 'THINKING' && 'Analyzing clinical guidelines...'}
              {aiState === 'SPEAKING' && 'Providing medical insights...'}
            </p>

            <div className="w-full bg-[#FAFAFA] border border-slate-200/80 rounded-2xl p-1.5 flex gap-1">
              <ControlButton icon={<Power size={13}/>} label="Idle" isActive={aiState === 'IDLE'} onClick={stopAll} activeColor="bg-white text-slate-800 shadow-sm border-slate-200"/>
              <ControlButton icon={<Mic size={13}/>} label="Listen" isActive={aiState === 'LISTENING'} onClick={handleVoiceToggle} activeColor="bg-rose-50 text-rose-700 shadow-sm border-rose-200"/>
              <ControlButton icon={<Sparkles size={13}/>} label="Think" isActive={aiState === 'THINKING'} onClick={() => {}} activeColor="bg-cyan-50 text-cyan-700 shadow-sm border-cyan-200"/>
              <ControlButton icon={<Volume2 size={13}/>} label="Speak" isActive={aiState === 'SPEAKING'} onClick={stopAll} activeColor="bg-emerald-600 text-white shadow-sm"/>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div>
              <h3 className={cn('text-[11px] font-bold uppercase tracking-wider mb-3', isDarkMode ? 'text-slate-300' : 'text-slate-900')}>Your Health Context</h3>
              <div className={cn('border rounded-xl p-2 space-y-1 shadow-sm', isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
                <ContextItem icon={Baby} iconColor="text-rose-500" bg="bg-rose-50" label="Pregnancy Status" value={patient.pregnancyBadge || '2nd Trimester (20w)'}/>
                <ContextItem icon={Droplet} iconColor="text-rose-500" bg="bg-rose-50" label="Blood Group" value={patient.bloodGroup || 'B+'}/>
                <ContextItem icon={Activity} iconColor="text-purple-500" bg="bg-purple-50" label="Allergies" value={Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || 'None known')}/>
              </div>
            </div>
            <div>
              <h3 className={cn('text-[11px] font-bold uppercase tracking-wider mb-3', isDarkMode ? 'text-slate-300' : 'text-slate-900')}>Quick Prompts</h3>
              <div className="flex flex-col gap-2">
                {['Explain my recent blood test results.', 'When is my next scheduled checkup?', 'I have a mild fever and dry cough.', 'What should I eat during pregnancy?'].map((p, i) => (
                  <button key={i} onClick={() => handleSend(p)} disabled={aiState !== 'IDLE'}
                    className={cn('text-left px-3 py-2 border rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {consultationId && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Active Session</p>
                <p className="text-[10px] font-mono text-emerald-700 truncate">{consultationId}</p>
                <p className="text-[9px] text-emerald-600 mt-1">✓ Saved to Supabase</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, textClass, onClick, dark }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-left cursor-pointer',
      active ? 'bg-emerald-50/80 text-emerald-700 font-semibold' : dark ? 'text-slate-400 hover:bg-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50 font-medium', textClass)}>
      <Icon size={16} className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}/>
      <span className="text-[13px] truncate">{label}</span>
    </button>
  );
}

function ContextItem({ icon: Icon, iconColor, bg, label, value }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-default">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bg, iconColor)}><Icon size={16}/></div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-[12px] font-semibold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function ControlButton({ icon, label, isActive, onClick, activeColor }) {
  return (
    <button onClick={onClick} className={cn('flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 cursor-pointer border',
      isActive ? activeColor : 'bg-transparent text-slate-500 hover:bg-slate-100 border-transparent')}>
      <div className="mb-0.5">{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
