import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Volume2,
  Camera,
  Mic,
  Database,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { playTextToSpeech } from '../utils/audio';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage } = useAuth();
  const [testingSpeech, setTestingSpeech] = useState<boolean>(false);
  const [consentCamera, setConsentCamera] = useState<boolean>(true);
  const [consentAudio, setConsentAudio] = useState<boolean>(true);

  const handleTestTts = () => {
    setTestingSpeech(true);
    const testPhrases: Record<string, string> = {
      en: 'AI-Powered Mental Wellness Assistant voice synthesis is operational and ready.',
      hi: 'मानसिक स्वास्थ्य सहायक वॉइस सिंथेसिस सक्रिय है।',
      kn: 'ಮಾನಸಿಕ ಕ್ಷೇಮ ಸಹಾಯಕ ಧ್ವನಿ ಸಂಶ್ಲೇಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
      ta: 'மன நல உதவியாளர் குரல் தொகுப்பு தயாராக உள்ளது.',
      te: 'మానసిక క్షేమ సహాయక వాయిస్ సంశ్లేషణ సిద్ధంగా ఉంది.',
      ml: 'മാനസിക ക്ഷേമ സഹായി വോയ്സ് സിന്തസിസ് സജ്ജമാണ്.',
      es: 'La síntesis de voz del asistente de bienestar mental está activa.',
      fr: 'La synthèse vocale de l’assistant de bien-être mental est opérationnelle.',
      de: 'Die Sprachausgabe des Assistenten für mentale Gesundheit ist aktiv.',
    };

    const phrase = testPhrases[language] || testPhrases['en'];
    playTextToSpeech(phrase, language, () => {
      setTestingSpeech(false);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <Settings className="w-3.5 h-3.5" /> Preferences
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Configuration & Settings</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Configure display aesthetics, dark/light theme appearance, multilingual language priorities, and hardware permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Display & Language */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Theme & Language Settings</span>
          </h3>

          {/* Theme Appearance Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theme Appearance
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Selected preference is saved automatically and applies across all pages.
            </p>
          </div>

          {/* Multilingual Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Preferred Assistant & Speech Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) — [{lang.speechCode}]
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              All AI conversation, speech responses, and follow-ups will prioritize this language.
            </p>
          </div>

          {/* TTS Audio Readout Test */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
                Speech Synthesizer Audio Test
              </span>
            </div>
            <button
              onClick={handleTestTts}
              disabled={testingSpeech}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {testingSpeech ? 'Playing...' : 'Play Sample Audio'}
            </button>
          </div>
        </div>

        {/* Card 2: Permissions & Security */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Privacy & Device Hardware Permissions</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-pink-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Webcam Facial Stream
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ephemeral in-memory processing only
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentCamera}
                onChange={(e) => setConsentCamera(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Microphone Acoustic Ingestion
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Zero permanent audio file storage
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentAudio}
                onChange={(e) => setConsentAudio(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-teal-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    SQLite Local Persistence
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Encrypted relational records (WAL Mode)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
