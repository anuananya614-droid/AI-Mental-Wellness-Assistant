import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Image as ImageIcon,
  X,
  ScanFace,
  RefreshCw,
  Globe,
  AlertCircle,
  Languages,
  Check,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, Conversation } from '../types';
import { EmotionBadge } from '../components/EmotionBadge';
import {
  playTextToSpeech,
  pauseTextToSpeech,
  resumeTextToSpeech,
  stopTextToSpeech,
  AudioRecorder,
  getAvailableKannadaVoice,
  getAvailableHindiVoice,
  getAvailableTeluguVoice,
  getAvailableEnglishVoice
} from '../utils/audio';
import {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  MULTILINGUAL_QUICK_PROMPTS,
  getLocalizedEmotionLabel
} from '../utils/languages';

export const ChatAssistant: React.FC = () => {
  const { user, language, setLanguage, authFetch } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Voice TTS State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isTtsPaused, setIsTtsPaused] = useState<boolean>(false);
  const [auditioningLang, setAuditioningLang] = useState<string | null>(null);

  // Dedicated speech recognition (STT) language code
  const [speechInputLang, setSpeechInputLang] = useState<string>(
    language === 'auto' ? 'kn-IN' : (SUPPORTED_LANGUAGES.find(l => l.code === language)?.speechCode || 'kn-IN')
  );
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(true);
  const [speechTranscribedNotification, setSpeechTranscribedNotification] = useState<boolean>(false);

  // Multimodal In-Chat Controls
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [capturedCameraFrame, setCapturedCameraFrame] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string>('image/jpeg');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const voiceTimerRef = useRef<any>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState<string>('');

  useEffect(() => {
    loadConversations();
    return () => {
      stopTextToSpeech();
      stopCameraStream();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (language !== 'auto') {
      const match = SUPPORTED_LANGUAGES.find(l => l.code === language);
      if (match && match.speechCode !== 'auto') {
        setSpeechInputLang(match.speechCode);
      }
    }
  }, [language]);

  const auditionVoice = (langCode: string) => {
    setAuditioningLang(langCode);
    const samplePhrases: Record<string, string> = {
      kn: 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಮಾನಸಿಕ ಕ್ಷೇಮ ಸಹಾಯಕ. ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುವ ಸಂಪೂರ್ಣ ಸಾಮರ್ಥ್ಯ ಹೊಂದಿದ್ದೇನೆ.',
      hi: 'नमस्ते, मैं आपका मानसिक स्वास्थ्य सहायक हूँ। मैं हिन्दी में आपसे बातचीत करने के लिए तैयार हूँ।',
      te: 'నమస్కారం, నేను మీ మానసిక ఆరోగ్య సహాయకుడిని. నేను తెలుగులో మీతో మాట్లాడటానికి సిద్ధంగా ఉన్నాను.',
      en: 'Hello, I am your AI Mental Wellness Assistant. I am fully ready to support you.'
    };
    const phrase = samplePhrases[langCode] || samplePhrases.en;
    playTextToSpeech(phrase, langCode, () => setAuditioningLang(null));
  };

  const loadConversations = async () => {
    try {
      const res = await authFetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations && data.conversations.length > 0 && !activeConversationId) {
          selectConversation(data.conversations[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setApiError(null);
    try {
      const res = await authFetch(`/api/chat/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await authFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Multilingual Session',
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        setMessages([]);
        setApiError(null);
      }
    } catch (e) {
      console.error('Failed to create conversation', e);
    }
  };

  const clearActiveConversation = async () => {
    if (!activeConversationId) return;
    try {
      await authFetch(`/api/chat/conversations/${activeConversationId}/messages`, { method: 'DELETE' });
      setMessages([]);
    } catch (e) {
      console.error('Failed to clear conversation', e);
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await authFetch(`/api/chat/conversations/${convId}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  // ================= VOICE RECORDING & TRANSCRIPTION PIPELINE =================

  const startVoiceRecording = async (forcedSpeechCode?: string) => {
    try {
      setApiError(null);
      setLiveSpeechTranscript('');
      setSpeechTranscribedNotification(false);
      const recorder = new AudioRecorder();
      audioRecorderRef.current = recorder;
      await recorder.start();

      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      const speechCodeToUse = forcedSpeechCode || (speechInputLang === 'auto' ? 'kn-IN' : speechInputLang);

      // Web Speech API for real-time speech-to-text
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = speechCodeToUse;

          rec.onresult = (e: any) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript + ' ';
            }
            const trimmed = fullText.trim();
            setLiveSpeechTranscript(trimmed);
            // Populate directly into main editable text area so user can see and edit!
            if (trimmed) {
              setInputText(trimmed);
            }
          };

          rec.start();
          speechRecognitionRef.current = rec;
        } catch (e) {
          console.warn('Speech recognition start notice:', e);
        }
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setApiError('Microphone permission was denied or not found. Please check browser audio permissions.');
      setIsRecordingVoice(false);
    }
  };

  const stopVoiceRecordingToEdit = async () => {
    if (!audioRecorderRef.current || !isRecordingVoice) return;

    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    setIsRecordingVoice(false);

    try {
      const { metrics } = await audioRecorderRef.current.stop();
      const transcribedWords = liveSpeechTranscript.trim() || inputText.trim() || 'I am sharing how I feel through my voice.';
      setInputText(transcribedWords);
      setSpeechTranscribedNotification(true);
    } catch (err: any) {
      console.error('Error stopping voice recording:', err);
      setApiError(err.message || 'Error processing audio recording.');
    }
  };

  const stopVoiceRecordingAndSend = async () => {
    if (!audioRecorderRef.current || !isRecordingVoice) return;

    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    setIsRecordingVoice(false);

    try {
      const { metrics } = await audioRecorderRef.current.stop();
      const transcribedWords = liveSpeechTranscript.trim() || inputText.trim() || 'I am sharing how I feel through my voice.';
      setInputText('');
      setSpeechTranscribedNotification(false);

      const d = detectLanguage(transcribedWords);

      await dispatchMessage({
        text: transcribedWords,
        inputType: 'voice',
        languageOverride: language === 'auto' ? d.lang : language,
        vocalObservations: {
          avgPitchHz: metrics.avgPitchHz,
          speakingRateWpm: metrics.speakingRateWpm,
          pauseCount: metrics.pauseCount
        }
      });
    } catch (err: any) {
      console.error('Error stopping voice recording:', err);
      setApiError(err.message || 'Error processing audio.');
    }
  };

  // ================= CAMERA WEBCAM PIPELINE =================

  const openCameraModal = async () => {
    setIsCameraModalOpen(true);
    setCapturedCameraFrame(null);
    setApiError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setApiError('Camera access was denied or no webcam was detected.');
    }
  };

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  };

  const captureCameraSnapshot = () => {
    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedCameraFrame(base64);
    stopCameraStream();
  };

  const sendCapturedCameraFrame = async () => {
    if (!capturedCameraFrame) return;
    const frame = capturedCameraFrame;
    setIsCameraModalOpen(false);
    setCapturedCameraFrame(null);

    await dispatchMessage({
      text: inputText.trim() || 'Please analyze my live visible facial expression.',
      inputType: 'face_live',
      imageBase64: frame,
      mimeType: 'image/jpeg',
      facialObservations: ['Live webcam frame captured for morphological action unit inspection']
    });
    setInputText('');
  };

  // ================= UPLOAD IMAGE PIPELINE =================

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      setApiError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setApiError('File size exceeds 8MB. Please upload a smaller image.');
      return;
    }

    setUploadedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImagePreview(reader.result as string);
      setApiError(null);
    };
    reader.readAsDataURL(file);
  };

  // ================= UNIFIED DISPATCHER =================

  const dispatchMessage = async (params: {
    text: string;
    inputType?: 'text' | 'voice' | 'face_live' | 'face_upload';
    imageBase64?: string;
    mimeType?: string;
    vocalObservations?: any;
    facialObservations?: string[];
    languageOverride?: string;
  }) => {
    const {
      text,
      inputType = 'text',
      imageBase64,
      mimeType = 'image/jpeg',
      vocalObservations,
      facialObservations,
      languageOverride
    } = params;

    if (!text && !imageBase64) return;
    if (loading) return;

    setApiError(null);
    setSpeechTranscribedNotification(false);
    stopTextToSpeech();
    setSpeakingMsgId(null);
    setIsTtsPaused(false);

    // Auto-detect language if set to 'auto'
    const d = detectLanguage(text);
    const activeLang = languageOverride || (language === 'auto' ? d.lang : language);

    // Optimistically add user bubble to conversation
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConversationId || '',
      role: 'user',
      content: text || '(Sent image for facial analysis)',
      detected_language: activeLang,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await authFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: text,
          inputType,
          imageBase64,
          mimeType,
          vocalObservations,
          facialObservations,
          language: activeLang
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server encountered an issue generating AI response.');
      }

      const data = await res.json();
      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
        loadConversations();
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [
          ...filtered,
          { ...tempUserMsg, id: `user_${Date.now()}` },
          data.assistantMessage
        ];
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      setApiError(err.message || 'Failed to receive AI response. Please check network or API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !uploadedImagePreview) return;

    if (uploadedImagePreview) {
      const img = uploadedImagePreview;
      const mime = uploadedImageMime;
      setUploadedImagePreview(null);
      dispatchMessage({
        text: inputText.trim() || 'Please analyze this photo and tell me what visible expressions you observe.',
        inputType: 'face_upload',
        imageBase64: img,
        mimeType: mime
      });
    } else {
      dispatchMessage({
        text: inputText.trim(),
        inputType: 'text'
      });
    }

    setInputText('');
  };

  const handleToggleTTS = (msgId: string, content: string, msgLang?: string) => {
    if (speakingMsgId === msgId) {
      if (isTtsPaused) {
        resumeTextToSpeech();
        setIsTtsPaused(false);
      } else {
        pauseTextToSpeech();
        setIsTtsPaused(true);
      }
      return;
    }

    stopTextToSpeech();
    setIsTtsPaused(false);
    setSpeakingMsgId(msgId);

    const d = detectLanguage(content);
    const targetLangCode = msgLang && msgLang !== 'auto' ? msgLang : (language === 'auto' ? d.lang : language);

    playTextToSpeech(content, targetLangCode, () => {
      setSpeakingMsgId(null);
      setIsTtsPaused(false);
    });
  };

  const handleStopTTS = () => {
    stopTextToSpeech();
    setSpeakingMsgId(null);
    setIsTtsPaused(false);
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] max-w-7xl mx-auto rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fade-in">
      {/* Left Sidebar: Session Threads */}
      <div className="w-64 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/60 hidden md:flex">
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Conversations
          </span>
          <button
            onClick={createNewConversation}
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            title="Start New Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No previous sessions. Send a message to start!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{conv.title}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversational Workspace */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/40">
        {/* Top Chat Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Text Chat</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 font-semibold">
                  Multilingual
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Kannada (kn-IN) • English (en-IN) • Hindi (hi-IN) • Telugu (te-IN)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Voice Audition Buttons for Evaluators */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => auditionVoice('kn')}
                disabled={auditioningLang !== null}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 hover:bg-amber-100"
                title="Audition Kannada TTS Voice"
              >
                🔊 ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => auditionVoice('hi')}
                disabled={auditioningLang !== null}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border border-orange-200 hover:bg-orange-100"
                title="Audition Hindi TTS Voice"
              >
                🔊 हिन्दी
              </button>
              <button
                type="button"
                onClick={() => auditionVoice('te')}
                disabled={auditioningLang !== null}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 hover:bg-teal-100"
                title="Audition Telugu TTS Voice"
              >
                🔊 తెలుగు
              </button>
            </div>

            {/* Primary Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => {
                  const val = e.target.value;
                  setLanguage(val);
                  if (val === 'kn') setSpeechInputLang('kn-IN');
                  else if (val === 'hi') setSpeechInputLang('hi-IN');
                  else if (val === 'te') setSpeechInputLang('te-IN');
                  else if (val === 'en') setSpeechInputLang('en-IN');
                  else setSpeechInputLang('auto');
                }}
                className="pl-7 pr-2 py-1 bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearActiveConversation}
                className="px-2.5 py-1 text-slate-500 hover:text-rose-600 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear current conversation"
              >
                Clear
              </button>
            )}

            <button
              onClick={createNewConversation}
              className="md:hidden p-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Multilingual AI Mental Wellness Companion
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  ಕನ್ನಡ (Kannada) • हिन्दी (Hindi) • తెలుగు (Telugu) • English (en-IN)
                  <br />
                  Type or speak in your native script or transliteration. The AI responds and reads aloud in your chosen language.
                </p>
              </div>

              {/* Categorized Test Benchmark Prompts */}
              <div className="w-full text-left space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Evaluation & Benchmark Test Prompts (1-Click Test):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MULTILINGUAL_QUICK_PROMPTS.map((kp, idx) => (
                    <button
                      key={idx}
                      onClick={() => dispatchMessage({ text: kp.text, inputType: 'text', languageOverride: kp.lang })}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-left hover:border-indigo-400 transition-colors shadow-2xs group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                          {kp.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {kp.lang.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2">
                        "{kp.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const isSpeaking = speakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Bubble Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble Container */}
                  <div className="space-y-2.5 max-w-xl">
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? msg.isCrisis
                            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 rounded-tl-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/10'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Crisis Helplines Alert */}
                      {msg.isCrisis && (
                        <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 text-xs">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Immediate 24/7 Crisis Helplines Available Right Now</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl">
                              <span className="font-semibold block">Tele-MANAS (India Govt):</span>
                              <span className="font-mono font-bold text-rose-600">14416 / 1800 891 4416</span>
                            </div>
                            <div className="p-2 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl">
                              <span className="font-semibold block">National Emergency:</span>
                              <span className="font-mono font-bold text-rose-600">112</span>
                            </div>
                            <div className="p-2 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl">
                              <span className="font-semibold block">Vandrevala Helpline:</span>
                              <span className="font-mono font-bold text-rose-600">+91 9999 666 555</span>
                            </div>
                            <div className="p-2 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl">
                              <span className="font-semibold block">SAHAI (Bengaluru):</span>
                              <span className="font-mono font-bold text-rose-600">080 2549 7777</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assistant Bottom Bar (Localized Emotion Badge & Multilingual TTS Audio Controls) */}
                      {isAssistant && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                          {msg.detected_emotion && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <EmotionBadge
                                emotion={msg.detected_emotion}
                                localizedLabel={msg.detected_emotion_localized}
                                kannadaLabel={msg.detected_emotion_kannada}
                                intensity={msg.intensity}
                                confidence={msg.confidence}
                                size="sm"
                                lang={msg.detected_language || language}
                              />
                              {msg.detected_language && msg.detected_language !== 'en' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 font-semibold uppercase font-mono">
                                  {msg.detected_language}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Speech Synthesis Controls (Play / Pause / Stop) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleTTS(msg.id, msg.content, msg.detected_language)}
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                isSpeaking
                                  ? isTtsPaused
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                                    : 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={isSpeaking ? (isTtsPaused ? 'Resume voice speech' : 'Pause voice speech') : 'Read AI Response Aloud'}
                            >
                              {isSpeaking ? (
                                isTtsPaused ? (
                                  <>
                                    <Play className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[10px]">Paused</span>
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3.5 h-3.5 animate-pulse" />
                                    <span className="text-[10px]">Pause Voice</span>
                                  </>
                                )
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="text-[10px]">Play Voice</span>
                                </>
                              )}
                            </button>

                            {isSpeaking && (
                              <button
                                onClick={handleStopTTS}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 text-xs font-semibold transition-colors"
                                title="Stop voice speech completely"
                              >
                                <VolumeX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reflective Follow-Up Question */}
                    {isAssistant && msg.follow_up_question && (
                      <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-xs flex items-start gap-2 text-indigo-900 dark:text-indigo-200">
                        <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold mb-0.5">Reflective Follow-Up:</strong>
                          {msg.follow_up_question}
                        </div>
                      </div>
                    )}

                    {/* Coping Recommendations */}
                    {isAssistant && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Personalized Coping Recommendations</span>
                        </div>
                        {msg.suggestions.map((s, sIdx) => (
                          <div key={sIdx} className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing / Thinking Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-xl animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>AI Assistant is reflecting in target language and formulating response...</span>
              </div>
            </div>
          )}

          {/* API Error Notification */}
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Multimodal Controls */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          {/* Automatic Language Detection & STT Notification Bar */}
          {(() => {
            const d = detectLanguage(inputText);
            const isDetectedNonEnglish = d.lang !== 'en' || d.type !== 'latin';
            return (
              <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                {isDetectedNonEnglish ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Language Auto-Detected:{' '}
                      <strong className="uppercase font-mono text-indigo-700 dark:text-indigo-300">
                        {d.lang} ({d.type})
                      </strong>
                      — AI response will match this language natively.
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-medium">
                    Active Mode: {language === 'auto' ? 'Auto Detect (Type or Speak in any language)' : `Language Locked: ${language.toUpperCase()}`}
                  </div>
                )}

                {/* Speech Input Language Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-[11px] font-semibold text-slate-400">Mic STT Language:</span>
                  <select
                    value={speechInputLang}
                    onChange={(e) => setSpeechInputLang(e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="auto">Auto STT</option>
                    <option value="kn-IN">ಕನ್ನಡ (kn-IN)</option>
                    <option value="hi-IN">हिन्दी (hi-IN)</option>
                    <option value="te-IN">తెలుగు (te-IN)</option>
                    <option value="en-IN">English (en-IN)</option>
                  </select>
                </div>
              </div>
            );
          })()}

          {/* Speech Transcribed Editable Preview Notification */}
          {speechTranscribedNotification && (
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Speech recognized:</strong> You can edit your text in the box below before sending to the AI.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechTranscribedNotification(false)}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                Got it
              </button>
            </div>
          )}

          {/* Quick Prompts Carousel Toggle */}
          {showQuickPrompts && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="shrink-0 text-slate-400 font-semibold text-[10px] uppercase">
                Quick Prompts:
              </span>
              {MULTILINGUAL_QUICK_PROMPTS.map((kp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => dispatchMessage({ text: kp.text, inputType: 'text', languageOverride: kp.lang })}
                  className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">[{kp.lang.toUpperCase()}]:</span>
                  <span className="truncate max-w-[190px] inline-block align-bottom">{kp.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Uploaded Photo Attachment Chip if active */}
          {uploadedImagePreview && (
            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit animate-fade-in">
              <img
                src={uploadedImagePreview}
                alt="Upload Attachment"
                className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Photo attached for facial analysis
              </span>
              <button
                type="button"
                onClick={() => setUploadedImagePreview(null)}
                className="p-1 text-slate-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Voice Recording Status Bar if active */}
          {isRecordingVoice && (
            <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl animate-fade-in flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Recording Speech ({recordingSeconds}s)... STT Language: {speechInputLang}
                </span>
                {liveSpeechTranscript && (
                  <span className="text-xs italic text-slate-700 dark:text-slate-200 line-clamp-1 max-w-xs font-medium">
                    "{liveSpeechTranscript}"
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopVoiceRecordingToEdit}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Stop & Edit Text
                </button>
                <button
                  type="button"
                  onClick={stopVoiceRecordingAndSend}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send Audio
                </button>
              </div>
            </div>
          )}

          {/* Unified Input Controls Form */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            {/* 1. Voice Record Button */}
            <button
              type="button"
              onClick={isRecordingVoice ? stopVoiceRecordingToEdit : () => startVoiceRecording()}
              className={`p-2.5 rounded-2xl transition-all ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white animate-pulse shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-600'
              }`}
              title={isRecordingVoice ? 'Stop recording and edit speech text' : `Click to record speech (STT: ${speechInputLang})`}
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* 2. Live Camera Access Button */}
            <button
              type="button"
              onClick={openCameraModal}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-pink-100 hover:text-pink-600 transition-colors"
              title="Capture Live Facial Expression"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* 3. Image Upload Button */}
            <label
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-100 hover:text-teal-600 transition-colors cursor-pointer"
              title="Upload Facial Image (JPG/PNG/WEBP)"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageFileUpload}
                className="hidden"
              />
            </label>

            {/* 4. Text Input Field (Editable for typed text & transcribed speech) */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecordingVoice
                  ? 'Listening to speech... (words appear here in real time)'
                  : uploadedImagePreview
                  ? 'Add context or question about this photo (or tap Send)...'
                  : 'Type or speak in Kannada, English, Hindi, or Telugu (Script or Transliteration)...'
              }
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
            />

            {/* 5. Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !uploadedImagePreview) || loading}
              className={`p-2.5 rounded-2xl text-white shadow-md transition-all ${
                (inputText.trim() || uploadedImagePreview) && !loading
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2 flex-wrap">
            <span>Unified Multimodal Engine</span>
            <span>•</span>
            <span>Context Retention</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Selected Lang: {language.toUpperCase()}
            </span>
            <span>•</span>
            <span>STT Mode: {speechInputLang}</span>
          </div>
        </div>
      </div>

      {/* Camera Live Capture Modal Overlay */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Live Facial Expression Capture
                </h3>
              </div>
              <button
                onClick={() => {
                  stopCameraStream();
                  setIsCameraModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              {capturedCameraFrame ? (
                <img
                  src={capturedCameraFrame}
                  alt="Captured Frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <canvas ref={cameraCanvasRef} className="hidden" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {capturedCameraFrame ? (
                <>
                  <button
                    type="button"
                    onClick={openCameraModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={sendCapturedCameraFrame}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" /> Analyze Frame & Send
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={captureCameraSnapshot}
                  className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Capture Snapshot Frame
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
