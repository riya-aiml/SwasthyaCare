/**
 * ============================================================================
 * SWASTHYACARE CLINICAL INTELLIGENCE ASSISTANT (FRONTEND REACT COMPONENT)
 * ============================================================================
 * Location: client/src/components/AIHealthAssistant.jsx
 *
 * ARCHITECTURAL SPECIFICATION & CLINICAL GOVERNANCE:
 * 1. Clinical Evidence Grounding:
 *    - Structured clinical markdown renderer powered by react-markdown & remark-gfm.
 *    - In-text citation badges for ICMR, WHO, NIMHANS, and Hospital Platform guidelines.
 *    - Strict pre-render sanitization eliminating raw LaTeX and formatting artifacts.
 * 2. Enterprise IDOR & RBAC Security:
 *    - Communicates exclusively through authenticated Express gateway (/api/chat/sessions).
 *    - Strictly isolates patient session data across tenants.
 * 3. Priority 0 Emergency Intercepts:
 *    - Renders emergency callout cards with direct 112 / 108 / Tele-MANAS dials.
 * 4. Two-Step Consequential Action Requisitions:
 *    - Action proposals (appointment booking/cancellation) are rendered as formal
 *      Clinical Requisitions requiring patient confirmation before mutation.
 * 5. Multi-Turn Session Lifecycle:
 *    - Supports multi-turn contextual conversations with past session navigation.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PhoneCall,
  Loader2,
  Sparkles,
  Stethoscope,
  Activity,
  Award,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Key,
  Headphones,
  Phone,
  PhoneOff,
  Radio,
} from 'lucide-react';
import chatService from '../services/chatService.js';
import { getAuthToken } from '../services/authService.js';

/**
 * Strips raw LaTeX math markers ($ ... $, \text{...}) and unescapes standard clinical symbols
 * to guarantee physician-grade typography and zero robot artifacts.
 */
function sanitizeClientText(raw) {
  if (!raw) return '';
  return raw
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\[ ,]/g, ' ')
    .trim();
}

/**
 * Transforms in-text citation brackets [DOC-CLIN-01] into clean clinical evidence badges.
 */
function renderTextWithCitations(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\[DOC-[A-Z]+-\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(DOC-[A-Z]+-\d+)\]$/);
    if (match) {
      const docId = match[1];
      let label = 'Clinical Guideline';
      let badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200/80';

      if (docId.includes('CLIN-01')) {
        label = 'ICMR Diabetes';
        badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (docId.includes('CLIN-02')) {
        label = 'ICMR Hypertension';
        badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
      } else if (docId.includes('CLIN-03')) {
        label = 'WHO HEARTS';
        badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      } else if (docId.includes('CLIN-04')) {
        label = 'Dietary Guidelines';
        badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
      } else if (docId.includes('CLIN-05')) {
        label = 'Tele-MANAS';
        badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
      } else if (docId.includes('PLAT')) {
        label = 'Hospital Guide';
        badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
      }

      return (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 text-[10px] font-medium rounded-full border align-baseline ${badgeStyle}`}
          title={`Medical Source: ${docId}`}
        >
          <span>📘</span>
          <span>{label}</span>
        </span>
      );
    }
    return part;
  });
}

/**
 * Rich clinical markdown renderer with custom typographic components.
 */
function ClinicalMessageContent({ content, isUser }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-medium">{content}</div>;
  }

  const cleanText = sanitizeClientText(content);

  return (
    <div className="clinical-rich-text text-[13px] leading-relaxed text-slate-800 space-y-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-slate-800 font-normal">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? renderTextWithCitations(child) : child
              )}
            </p>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-[12.5px] text-slate-800 my-0.5">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? renderTextWithCitations(child) : child
              )}
            </li>
          ),
          h3: ({ children }) => (
            <div className="mt-3 mb-1 pb-1 border-b border-teal-100 flex items-center gap-1.5">
              <span className="w-1.5 h-3 rounded-full bg-teal-600 inline-block shrink-0"></span>
              <h4 className="text-xs font-semibold text-teal-900 tracking-wide">
                {children}
              </h4>
            </div>
          ),
          h2: ({ children }) => (
            <div className="mt-3.5 mb-1.5 pb-1 border-b border-teal-200 flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-teal-700 inline-block shrink-0"></span>
              <h3 className="text-[13px] font-semibold text-teal-950">
                {children}
              </h3>
            </div>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 space-y-1 pl-4 list-disc marker:text-teal-600 text-[12.5px] text-slate-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 space-y-1 pl-4 list-decimal marker:text-teal-700 font-medium text-[12.5px] text-slate-800">
              {children}
            </ol>
          ),
          hr: () => <hr className="my-3 border-t border-slate-200/80" />,
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 p-2.5 bg-teal-50/70 border-l-4 border-teal-600 rounded-r-lg text-xs text-teal-950 italic shadow-2xs">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5 border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs text-slate-800 divide-y divide-slate-200">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 text-[11px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-t border-slate-100 text-[11px]">
              {children}
            </td>
          ),
        }}
      >
        {cleanText}
      </ReactMarkdown>
    </div>
  );
}

export default function AIHealthAssistant({ isOpen, setIsOpen }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true); // Voice Assistant Auto-Speech enabled by default
  const [voices, setVoices] = useState([]);
  const [elevenApiKey, setElevenApiKey] = useState(() => localStorage.getItem('elevenlabs_api_key') || '');
  const [showVoiceKeyModal, setShowVoiceKeyModal] = useState(false);
  const [isElevenVoicePlaying, setIsElevenVoicePlaying] = useState(false);

  // OpenAI Realtime Low-Latency Speech-to-Speech State
  const [isRealtimeCallActive, setIsRealtimeCallActive] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('idle'); // 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'
  const [realtimeApiKey, setRealtimeApiKey] = useState(() => localStorage.getItem('openai_realtime_api_key') || '');
  const [showRealtimeKeyModal, setShowRealtimeKeyModal] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState([]);
  const [isRealtimeMuted, setIsRealtimeMuted] = useState(false);

  const audioPlayerRef = useRef(new Audio());
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const dataChannelRef = useRef(null);
  const realtimeAudioElementRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const quickPromptsEn = [
    '🩺 Knee & Joint Pain Care',
    '💓 High Blood Pressure Tips',
    '🍬 Blood Sugar Guidance',
    '📅 Book a Specialist Doctor',
    '🧘 Stress & Sleep Support',
  ];

  const quickPromptsHi = [
    '🩺 घुटनों और जोड़ों के दर्द का इलाज',
    '💓 हाई ब्लड प्रेशर कम करने के उपाय',
    '🍬 शुगर (डायबिटीज) डाइट और लक्षण',
    '📅 किसी विशेषज्ञ डॉक्टर से मिलें',
    '🧘 तनाव और बेहतर नींद के सुझाव',
  ];

  const quickPrompts = language === 'hi' ? quickPromptsHi : quickPromptsEn;

  const resumeIntervalRef = useRef(null);

  // Stop any active speech synthesis or ElevenLabs audio playback cleanly
  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {}
    }
    setIsElevenVoicePlaying(false);
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  // End OpenAI Realtime Speech-to-Speech Call cleanly
  const endRealtimeCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (realtimeAudioElementRef.current) {
      realtimeAudioElementRef.current.srcObject = null;
      realtimeAudioElementRef.current = null;
    }
    setIsRealtimeCallActive(false);
    setRealtimeStatus('idle');
  };

  const toggleRealtimeMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsRealtimeMuted(!audioTrack.enabled);
      }
    }
  };

  // Connects Low-Latency Speech-to-Speech Call via WebRTC
  const startRealtimeCall = async () => {
    stopSpeaking();
    setIsRealtimeCallActive(true);
    setRealtimeStatus('connecting');
    setRealtimeTranscript([]);

    try {
      // 1. Request ephemeral token from Node backend
      const sessionRes = await chatService.createRealtimeSession({
        apiKey: realtimeApiKey || undefined,
        voice: 'shimmer', // Warm, gentle clinical voice
        language,
      });

      const clientSecret = sessionRes.data?.client_secret?.value;
      if (!clientSecret) {
        throw new Error('Failed to obtain OpenAI Realtime ephemeral session token.');
      }

      // 2. Initialize WebRTC Peer Connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // 3. Audio output
      const remoteAudio = new Audio();
      remoteAudio.autoplay = true;
      realtimeAudioElementRef.current = remoteAudio;

      pc.ontrack = (e) => {
        remoteAudio.srcObject = e.streams[0];
      };

      // 4. Capture Local Microphone
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      pc.addTrack(localStream.getTracks()[0]);

      // 5. Data Channel for Events & Transcripts
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        setRealtimeStatus('connected');
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'response.audio_transcript.delta') {
            setRealtimeTranscript((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text + event.delta }];
              }
              return [...prev, { role: 'assistant', text: event.delta }];
            });
            setRealtimeStatus('speaking');
          } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
            const userText = event.transcript;
            if (userText) {
              setRealtimeTranscript((prev) => [...prev, { role: 'user', text: userText }]);
            }
            setRealtimeStatus('listening');
          } else if (event.type === 'input_audio_buffer.speech_started') {
            setRealtimeStatus('listening');
          } else if (event.type === 'response.done') {
            setRealtimeStatus('connected');
          }
        } catch (err) {
          console.warn('Realtime event parse warning:', err);
        }
      };

      // 6. WebRTC SDP Negotiation with OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`OpenAI SDP handshake failed: ${sdpResponse.statusText}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer = { type: 'answer', sdp: answerSdp };
      await pc.setRemoteDescription(answer);

      setRealtimeStatus('connected');
    } catch (err) {
      console.error('Realtime Speech-to-Speech connection error:', err);
      endRealtimeCall();
      if (err?.isKeyMissing) {
        setShowRealtimeKeyModal(true);
      } else {
        alert(
          language === 'hi'
            ? 'लाइव वॉइस कॉल शुरू नहीं हो सकी: ' + (err.message || 'कृपया अपनी OpenAI Key जांचें')
            : 'Could not connect live voice call: ' + (err.message || 'Check your OpenAI API key')
        );
      }
    }
  };

  // Stop speech and calls when widget is closed
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      endRealtimeCall();
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isOpen]);

  // Initialize Web Speech Recognition (Voice Input / STT)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Voice input is not supported in your browser. Please use Google Chrome or Edge.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert(
            language === 'hi'
              ? 'कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति (Microphone Permission) दें।'
              : 'Please enable microphone permission in your browser.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  // Text-To-Speech (TTS) Voice Note Player
  const cleanTextForSpeech = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/\[DOC-[A-Z]+-\d+\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*#_`~>]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/•|\-|\+/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakMessage = async (msgId, content) => {
    stopSpeaking();

    const clean = cleanTextForSpeech(content);
    if (!clean) return;

    setSpeakingMessageId(msgId);

    // 1. Prioritize ElevenLabs Neural Human Voice Model
    try {
      const audioUrl = await chatService.generateTTS({
        text: clean.slice(0, 1000),
        language,
        apiKey: elevenApiKey || undefined,
      });

      if (audioUrl) {
        setIsElevenVoicePlaying(true);
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.onended = () => {
          stopSpeaking();
          URL.revokeObjectURL(audioUrl);
        };
        audioPlayerRef.current.onerror = () => {
          stopSpeaking();
          URL.revokeObjectURL(audioUrl);
        };
        await audioPlayerRef.current.play();
        return;
      }
    } catch (err) {
      setIsElevenVoicePlaying(false);
      if (err?.isKeyMissing) {
        console.info('ElevenLabs API key not set, falling back to browser voice.');
      }
    }

    // 2. High-Reliability Browser SpeechSynthesis Fallback
    if (!('speechSynthesis' in window)) return;

    // Fix Chrome paused speech state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const availVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (language === 'hi') {
      selectedVoice =
        availVoices.find((v) => v.lang.toLowerCase().includes('hi-in') || v.lang.toLowerCase() === 'hi') ||
        availVoices.find((v) => v.name.toLowerCase().includes('hindi')) ||
        availVoices.find((v) => v.lang.includes('IN'));
    } else {
      selectedVoice =
        availVoices.find((v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')) ||
        availVoices.find((v) => v.lang.toLowerCase().startsWith('en-us')) ||
        availVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
      // Workaround for Chrome 15s freeze bug: keep active resume pulse
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = setInterval(() => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(resumeIntervalRef.current);
          resumeIntervalRef.current = null;
        }
      }, 5000);
    };

    utterance.onend = () => {
      stopSpeaking();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      stopSpeaking();
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeak = (msgId, content) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
    } else {
      speakMessage(msgId, content);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load user sessions when chat widget opens
  useEffect(() => {
    if (isOpen) {
      if (getAuthToken()) {
        loadSessions();
      } else {
        setMessages([
          {
            _id: 'guest-init',
            role: 'assistant',
            content:
              'Hello! 👋 I am your **SwasthyaCare AI Health Assistant**.\n\n' +
              'I can help you understand your symptoms, share trusted advice based on ICMR & WHO guidelines, or match you with the right specialist doctor.\n\n' +
              'How are you feeling today?',
            citations: [],
            intent: 'INTENT_GENERAL_CHITCHAT',
          },
        ]);
      }
    }
  }, [isOpen]);

  const loadSessions = async () => {
    try {
      setIsInitializing(true);
      const res = await chatService.getSessions(1, 10);
      const userSessions = res.data?.sessions || [];
      setSessions(userSessions);

      if (userSessions.length > 0) {
        const latest = userSessions[0];
        setActiveSessionId(latest._id);
        await loadSessionMessages(latest._id);
      } else {
        await handleCreateNewSession();
      }
    } catch (err) {
      console.warn('Could not load user chat sessions, falling back to local mode:', err.message);
      setMessages([
        {
          _id: 'local-init',
          role: 'assistant',
          content:
            'Hello! 👋 I am your **SwasthyaCare AI Health Assistant**.\n\n' +
            'I can help you understand your symptoms, answer health questions with ICMR & WHO medical guidance, and help you schedule specialist appointments.\n\n' +
            'What health symptoms or questions would you like to discuss today?',
          citations: [],
          intent: 'INTENT_GENERAL_CHITCHAT',
        },
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      const res = await chatService.getSession(sessionId);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      setIsLoading(true);
      const res = await chatService.createSession({
        title: `Clinical Consultation (${new Date().toLocaleDateString()})`,
      });
      const newSession = res.data?.session;
      if (newSession) {
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession._id);
        setMessages([
          {
            _id: `welcome-${newSession._id}`,
            role: 'assistant',
            content:
              '**Clinical Consultation Active**\n\n' +
              'Your consultation session is securely connected to the SwasthyaCare Clinical Intelligence Engine. ' +
              'Responses are grounded in verified ICMR and WHO consensus guidelines.\n\n' +
              'You may ask about symptom triage, chronic condition management (diabetes, hypertension), or schedule an outpatient specialist appointment.',
            citations: [],
            intent: 'INTENT_GENERAL_CHITCHAT',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    } finally {
      setIsLoading(false);
      setShowSessionsDropdown(false);
    }
  };

  const handleSelectSession = async (sId) => {
    setActiveSessionId(sId);
    setShowSessionsDropdown(false);
    await loadSessionMessages(sId);
  };

  const handleSendMessage = async (textToSend, retryMsgId = null) => {
    stopSpeaking();
    // Prime speech synthesis on user interaction
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (!retryMsgId) {
      setInputMessage('');
    }

    const tempId = retryMsgId || `temp-${Date.now()}`;
    const tempUserMsg = {
      _id: tempId,
      role: 'user',
      content: text,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    if (retryMsgId) {
      setMessages((prev) =>
        prev.map((m) => (m._id === retryMsgId ? { ...tempUserMsg, isFailed: false } : m))
      );
    } else {
      setMessages((prev) => [...prev, tempUserMsg]);
    }

    setIsLoading(true);

    try {
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        const newSessionRes = await chatService.createSession();
        currentSessionId = newSessionRes.data?.session?._id;
        setActiveSessionId(currentSessionId);
      }

      const res = await chatService.sendMessage(currentSessionId, text, language);
      const { assistantMessage } = res.data || {};

      if (assistantMessage) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...m, status: 'sent', isFailed: false } : m))
        );
        setMessages((prev) => [...prev, assistantMessage]);

        // Auto-Speak: Chatbot speaks its response out loud automatically!
        if (autoSpeak && assistantMessage.content) {
          setTimeout(() => {
            speakMessage(assistantMessage._id, assistantMessage.content);
          }, 250);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'failed', isFailed: true } : m))
      );
      const fallbackMsg = {
        _id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          '**System Notice: Network Resilience Mode**\n\n' +
          'SwasthyaCare Assistant was unable to complete this query due to network latency. ' +
          'For acute symptoms, please immediately dial **112** or **108**.',
        isEmergency: false,
        citations: [],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (failedMsg) => {
    handleSendMessage(failedMsg.content, failedMsg._id);
  };

  const handleFeedback = async (messageId, rating) => {
    try {
      await chatService.submitFeedback(messageId, rating);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, feedback: { ...(m.feedback || {}), rating } }
            : m
        )
      );
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const handleActionConfirm = async (messageId, confirmed) => {
    try {
      setActionLoading((prev) => ({ ...prev, [messageId]: true }));
      const res = await chatService.confirmAction(messageId, confirmed);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                actionProposal: {
                  ...m.actionProposal,
                  status: res.data?.actionStatus || (confirmed ? 'confirmed' : 'rejected'),
                },
              }
            : m
        )
      );
    } catch (err) {
      console.error('Action confirmation failed:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const toggleCitations = (messageId) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Trigger floating pill when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white font-medium rounded-full shadow-xl hover:shadow-teal-900/30 transition-all duration-300 hover:scale-105 group border border-teal-500/30"
          title="Open AI Health Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:rotate-6 transition-transform">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>AI Health Assistant</span>
            </div>
            <div className="text-[10px] text-teal-100/80 font-normal">Symptom check & booking</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="SwasthyaCare Clinical Intelligence Assistant"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setIsOpen(false);
      }}
      className="fixed bottom-4 right-4 z-50 w-full max-w-[480px] h-[680px] max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* 1. Modern Health Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-xs shrink-0">
              <Stethoscope size={20} className="text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-teal-800" title="Online & Ready"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">
                SwasthyaCare Assistant
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-600/60 text-teal-100 border border-teal-500/30">
                ICMR & WHO
              </span>
            </div>
            <p className="text-[11px] text-teal-100/80 font-normal">Health guidance & doctor appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Toggle: English | Hindi */}
          <div className="flex items-center bg-teal-950/70 p-0.5 rounded-lg border border-teal-600/40 text-[10px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                language === 'hi'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="हिन्दी में बात करें"
            >
              हिन्दी
            </button>
          </div>

          {/* Voice Mode Toggle (Auto-Speak) */}
          <button
            onClick={() => {
              if (speakingMessageId) stopSpeaking();
              setAutoSpeak((prev) => !prev);
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
              autoSpeak
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-xs'
                : 'bg-white/10 text-teal-200 hover:text-white'
            }`}
            title={autoSpeak ? (language === 'hi' ? 'आवाज़ मोड: चालू (बॉट बोलकर बताएगा)' : 'Voice Mode: ON (Bot speaks aloud)') : (language === 'hi' ? 'आवाज़ मोड: बंद' : 'Voice Mode: OFF')}
          >
            {autoSpeak ? <Volume2 size={13} className="text-emerald-300" /> : <VolumeX size={13} />}
          </button>

          {/* ChatGPT Voice Model & Key Config */}
          <button
            onClick={() => setShowVoiceSettingsModal(true)}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-teal-100 rounded-lg text-xs font-semibold transition-all border border-teal-500/30 shrink-0"
            title="ChatGPT Voice Settings (Voice Model & API Key)"
          >
            <Headphones size={12} className={openAiApiKey ? 'text-emerald-300' : 'text-teal-200'} />
            <span className="text-[10px] font-bold capitalize">{selectedVoice}</span>
          </button>

          {/* Sessions Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSessionsDropdown((prev) => !prev)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
              title="Consultation History"
            >
              <Clock size={13} />
              <span>{sessions.length}</span>
              {showSessionsDropdown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>

            {/* Dropdown Menu */}
            {showSessionsDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-700 text-[11px]">
                  <span>Past Consultations</span>
                  <button
                    onClick={() => {
                      setShowSessionsDropdown(false);
                      handleCreateNewSession();
                    }}
                    className="text-teal-700 hover:text-teal-900 flex items-center gap-0.5 text-[10px] font-bold"
                  >
                    <Plus size={10} /> New
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {sessions.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-400 italic">No past consultations</div>
                  ) : (
                    sessions.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => handleSelectSession(s._id)}
                        className={`w-full text-left px-3 py-2 hover:bg-teal-50 transition-colors flex flex-col gap-0.5 ${
                          s._id === activeSessionId ? 'bg-teal-50/80 font-bold border-l-2 border-teal-700' : ''
                        }`}
                      >
                        <span className="truncate text-slate-800 text-[11px]">{s.title || 'Consultation'}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(s.updatedAt || s.createdAt).toLocaleDateString()} • {s.messageCount || 0} turns
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* New Session Button */}
          <button
            onClick={handleCreateNewSession}
            disabled={isLoading}
            className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Start New Consultation"
          >
            <Plus size={18} />
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Speaking Audio Banner (Visualizer when Bot is speaking) */}
      {speakingMessageId && (
        <div className="px-3.5 py-2 bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white text-xs flex items-center justify-between border-b border-teal-700/60 shadow-xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3"></span>
              <span className="w-1 bg-emerald-300 rounded-full animate-bounce h-2"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3.5"></span>
              <span className="w-1 bg-emerald-200 rounded-full animate-bounce h-2"></span>
            </div>
            <span className="text-[11px] font-semibold text-teal-100 flex items-center gap-1.5">
              <span>🎙️ ChatGPT Voice ({selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}):</span>
              <span className="text-emerald-300 font-normal">
                {language === 'hi' ? 'सलाह बोलकर दी जा रही है...' : 'Speaking advice...'}
              </span>
            </span>
          </div>
          <button
            onClick={stopSpeaking}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold transition flex items-center gap-1"
          >
            <VolumeX size={11} />
            <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
          </button>
        </div>
      )}

      {/* 3. Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80">
        {isInitializing && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-xs gap-2">
            <Loader2 size={16} className="animate-spin text-teal-600" />
            <span>Initializing clinical decision support...</span>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const citations = msg.citations || [];
          const hasCitations = citations.length > 0;
          const isCitationOpen = expandedCitations[msg._id];
          const actionProposal = msg.actionProposal;

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-xs max-w-[92%] transition-all ${
                  isUser
                    ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-br-xs'
                    : msg.isEmergency
                    ? 'bg-rose-50/95 border-2 border-rose-400 text-rose-950 rounded-bl-xs shadow-md'
                    : 'bg-white border border-slate-200/95 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                {/* Emergency Header if Red-Flag */}
                {msg.isEmergency && (
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-2.5 pb-2 border-b border-rose-200">
                    <AlertTriangle size={16} className="text-rose-600 animate-pulse" />
                    <span className="tracking-wide">PRIORITY 0 MEDICAL ALERT: IMMEDIATE TRIAGE</span>
                  </div>
                )}

                {/* Assistant Badge Header (Non-Emergency) */}
                {!isUser && !msg.isEmergency && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2 pb-1.5 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                      <Stethoscope size={13} />
                      <span>Health Assistant</span>
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      Evidence-Grounded
                    </span>
                  </div>
                )}

                {/* Structured Clinical Message Content */}
                <ClinicalMessageContent content={msg.content} isUser={isUser} />

                {/* User Message Delivery Failure & Retry Button */}
                {isUser && msg.isFailed && (
                  <div className="mt-2 pt-1.5 border-t border-teal-600/70 flex items-center justify-between text-[11px] text-rose-200">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-rose-300" />
                      <span>Delivery failed</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRetry(msg)}
                      className="underline font-bold text-white hover:text-teal-100 cursor-pointer ml-2"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Emergency Helplines Callout Buttons */}
                {msg.isEmergency && (
                  <div className="mt-3.5 pt-2.5 border-t border-rose-200/90 flex flex-wrap gap-2">
                    <a
                      href="tel:112"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs transition-colors"
                    >
                      <PhoneCall size={13} />
                      <span>Call 112 (Unified Emergency)</span>
                    </a>
                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs transition-colors"
                    >
                      <PhoneCall size={13} />
                      <span>Call 108 (Ambulance)</span>
                    </a>
                    <a
                      href="tel:14416"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white text-rose-700 border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <PhoneCall size={13} />
                      <span>Tele-MANAS (14416)</span>
                    </a>
                  </div>
                )}

                {/* Modern Specialist Recommendation & Booking Card */}
                {actionProposal && actionProposal.actionType !== 'NONE' && (
                  <div className="mt-3 bg-white border border-teal-100 rounded-2xl p-3.5 shadow-xs space-y-3 text-slate-800">
                    {/* Header: Friendly recommendation badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200/60 rounded-full text-[10px] font-semibold tracking-wide">
                        <Sparkles size={11} className="text-teal-600" />
                        <span>Recommended Specialist Match</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          actionProposal.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : actionProposal.status === 'rejected'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {actionProposal.status === 'confirmed' ? '✓ Booked' : actionProposal.status === 'rejected' ? 'Declined' : 'Ready to Book'}
                      </span>
                    </div>

                    {/* Simple Match Reason */}
                    <div className="bg-teal-50/60 p-2 rounded-xl border border-teal-100/70 text-[11px] text-teal-950 flex items-center gap-2">
                      <span className="text-sm shrink-0">🎯</span>
                      <p className="text-[10.5px] text-teal-900 leading-tight">
                        Matched to <strong>{(actionProposal.parameters?.department || 'General Medicine').replace('_', ' ')}</strong> based on your reported symptoms.
                      </p>
                    </div>

                    {/* Doctor Profile Header */}
                    <div className="flex items-start gap-3 pt-0.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                        {actionProposal.parameters?.doctor_name ? (
                          actionProposal.parameters.doctor_name
                            .replace('Dr. ', '')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                        ) : (
                          <Stethoscope size={18} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {actionProposal.parameters?.doctor_name || 'Specialist Doctor'}
                          </h4>
                          <span className="text-teal-600 shrink-0" title="Verified Hospital Specialist">
                            <CheckCircle2 size={14} className="fill-teal-600 text-white" />
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 font-medium truncate">
                          {actionProposal.parameters?.specialization ||
                           (actionProposal.parameters?.department ? `${actionProposal.parameters.department.replace('_', ' ')} Specialist` : 'Clinical Specialist')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>15+ yrs exp</span>
                          <span>•</span>
                          <span>Hospital OPD Panel</span>
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-teal-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-400 font-medium">Preferred Slot</div>
                          <div className="font-semibold text-slate-800 truncate">
                            {actionProposal.parameters?.preferred_time || 'Tomorrow, 10:00 AM'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope size={13} className="text-teal-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-400 font-medium">Department</div>
                          <div className="font-semibold text-slate-800 truncate">
                            {(actionProposal.parameters?.department || 'General Medicine').replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Actions */}
                    {actionProposal.status === 'proposed' && (
                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => handleActionConfirm(msg._id, true)}
                          disabled={actionLoading[msg._id]}
                          className="w-full py-2.5 px-3 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                          {actionLoading[msg._id] ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Calendar size={13} />
                          )}
                          <span>Book Appointment with {actionProposal.parameters?.doctor_name || 'Specialist Doctor'}</span>
                        </button>
                        <button
                          onClick={() => handleActionConfirm(msg._id, false)}
                          disabled={actionLoading[msg._id]}
                          className="w-full py-1 text-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Not now, continue chatting
                        </button>
                      </div>
                    )}

                    {actionProposal.status === 'confirmed' && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>Appointment confirmed! We've reserved your slot at the clinic.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsible Verified Citations Accordion */}
                {hasCitations && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleCitations(msg._id)}
                      className="flex items-center justify-between w-full text-[11px] text-teal-800 font-semibold hover:text-teal-900 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-teal-600" />
                        <span>Verified Guidelines & Sources ({citations.length})</span>
                      </span>
                      {isCitationOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {isCitationOpen && (
                      <div className="mt-2.5 space-y-2 pl-2.5 border-l-2 border-teal-400">
                        {citations.map((c, cIdx) => (
                          <div key={cIdx} className="text-[11px] bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-900 font-semibold">
                              <span>{c.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200">
                                {c.docId || c.doc_id}
                              </span>
                            </div>
                            <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                              Publishing Body: {c.sourceOrganization || c.source_organization}
                            </div>
                            {c.snippet && (
                              <p className="text-[10px] text-slate-600 italic mt-1.5 line-clamp-2 bg-white/70 p-1.5 rounded border border-slate-200/50">
                                "{c.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assistant Message Footer: Feedback Buttons, Voice Read-Aloud, Latency, and Provider */}
              {!isUser && !msg.isEmergency && (
                <div className="flex items-center gap-2 mt-1 px-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
                    <button
                      onClick={() => handleFeedback(msg._id, 'helpful')}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                        msg.feedback?.rating === 'helpful' ? 'text-teal-700 font-bold' : 'text-slate-400'
                      }`}
                      title="Clinical Advice Helpful"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg._id, 'unhelpful')}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                        msg.feedback?.rating === 'unhelpful' ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                      title="Clinical Advice Needs Refinement"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>

                  {/* Text-to-Speech Voice Output Button */}
                  <button
                    onClick={() => toggleSpeak(msg._id, msg.content)}
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      speakingMessageId === msg._id
                        ? 'border-teal-400 bg-teal-50 text-teal-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    title={speakingMessageId === msg._id ? (language === 'hi' ? 'आवाज़ बंद करें' : 'Stop voice note') : (language === 'hi' ? 'बोलकर सुनाएं' : 'Listen aloud')}
                  >
                    {speakingMessageId === msg._id ? (
                      <>
                        <VolumeX size={11} className="text-teal-700 animate-pulse" />
                        <span>{language === 'hi' ? 'आवाज़ रोकें' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={11} />
                        <span>{language === 'hi' ? 'सुनें' : 'Listen'}</span>
                      </>
                    )}
                  </button>

                  {msg.latencyMs > 0 && <span>• {(msg.latencyMs / 1000).toFixed(1)}s</span>}
                  {msg.provider && <span>• {msg.provider === 'anthropic' ? 'OmniRoute' : msg.provider}</span>}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-600 text-xs bg-white px-4 py-3 rounded-2xl rounded-bl-xs border border-teal-200/80 w-fit shadow-xs">
            <Loader2 size={15} className="animate-spin text-teal-600" />
            <span className="font-medium">Finding the best medical guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Curated Clinical Prompts Carousel */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 transition-all shrink-0 shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Voice Listening Live Indicator */}
      {isListening && (
        <div className="px-3.5 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-[11px]">
              {language === 'hi' ? '🎙️ आपकी आवाज़ सुन रहे हैं... बोलिए...' : '🎙️ Listening... Speak your health question...'}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[10px] px-2 py-0.5 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-md font-bold transition"
          >
            {language === 'hi' ? 'पूर्ण' : 'Done'}
          </button>
        </div>
      )}

      {/* 5. Input Area with Voice (Mic) & Text */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shadow-xs"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white shadow-md animate-pulse ring-2 ring-rose-300'
              : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-800'
          }`}
          title={isListening ? (language === 'hi' ? 'माइक बंद करें' : 'Stop voice') : (language === 'hi' ? 'बोलकर पूछें (माइक)' : 'Speak your question (Mic)')}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            isListening
              ? (language === 'hi' ? 'सुन रहे हैं... बोलिए...' : 'Listening... Speak now...')
              : (language === 'hi' ? 'अपनी समस्या बोलें या टाइप करें...' : 'Ask a question or tap mic to speak...')
          }
          disabled={isLoading}
          maxLength={1000}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all font-normal"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 bg-teal-700 text-white rounded-xl hover:bg-teal-800 disabled:opacity-40 disabled:hover:bg-teal-700 transition-colors shadow-xs shrink-0"
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>

      {/* ChatGPT Voice Assistant Settings Modal */}
      {showVoiceSettingsModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    ChatGPT Voice Assistant
                  </h4>
                  <span className="text-[10px] text-teal-700 font-semibold">OpenAI Neural Voice (TTS-1)</span>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Experience authentic, human-like responses just like ChatGPT's Voice Assistant. Powered by OpenAI's official speech model with natural breathing, cadence, and clear pronunciation in Hindi and English.
            </p>

            {/* Choose ChatGPT Voice */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Choose ChatGPT Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'nova', name: 'Nova', desc: 'Warm & Empathetic (Female)' },
                  { id: 'shimmer', name: 'Shimmer', desc: 'Expressive & Gentle (Female)' },
                  { id: 'alloy', name: 'Alloy', desc: 'Clear & Neutral (Unisex)' },
                  { id: 'echo', name: 'Echo', desc: 'Warm Doctor (Male)' },
                ].map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      localStorage.setItem('chatgpt_voice', v.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedVoice === v.id
                        ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{v.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-700">
                OpenAI API Key (sk-...)
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-600 font-mono"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Can also be configured in <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">server/.env</code> as <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">OPENAI_API_KEY</code>.
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('openai_tts_key');
                  setOpenAiApiKey('');
                  setShowVoiceSettingsModal(false);
                }}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowVoiceSettingsModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (openAiApiKey.trim()) {
                      localStorage.setItem('openai_tts_key', openAiApiKey.trim());
                    }
                    setShowVoiceSettingsModal(false);
                  }}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
