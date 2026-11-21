import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Mic,
  Camera,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmotionBadge } from '../components/EmotionBadge';

interface MultimodalFusionProps {
  onNavigateToChat: () => void;
}

export const MultimodalFusion: React.FC<MultimodalFusionProps> = ({ onNavigateToChat }) => {
  const { authFetch } = useAuth();

  // Active modalities toggle
  const [includeText, setIncludeText] = useState<boolean>(true);
  const [includeVoice, setIncludeVoice] = useState<boolean>(true);
  const [includeFace, setIncludeFace] = useState<boolean>(true);

  // Inputs
  const [textContent, setTextContent] = useState<string>('I failed my engineering examination. I feel disappointed and anxious about my graduation.');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('My voice feels tight and I keep thinking about how to tell my parents.');
  const [voicePitchHz, setVoicePitchHz] = useState<number>(195);
  const [faceExpression, setFaceExpression] = useState<string>('Sadness');
  const [faceActionUnits, setFaceActionUnits] = useState<string>('Depressor anguli oris (AU15), lowered inner eyebrows');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveToHistory, setSaveToHistory] = useState<boolean>(true);

  // Pre-configured multimodal benchmark scenarios
  const sampleBenchmarks = [
    {
      title: 'Benchmark 1: Congruent Distress (Aligned)',
      desc: 'All 3 modalities converge on anxiety/worry & stress',
      text: 'My final presentation is in one hour and my hands are trembling.',
      voice: 'I am so nervous I cannot focus on my slides.',
      pitch: 210,
      face: 'Anxiety or worry',
      faceAus: 'Eye widening, elevated inner brows (AU1+AU2), lips parted'
    },
    {
      title: 'Benchmark 2: Social Masking (Divergent)',
      desc: 'Face shows smile (AU12), but text & acoustic prosody reveal deep burnout',
      text: 'I haven’t slept in 48 hours and I feel hollow inside, but I must keep smiling.',
      voice: 'Everything is fine... I guess I am just dragging through.',
      pitch: 140,
      face: 'Happiness',
      faceAus: 'Bilateral zygomatic elevation (AU12 social smile)'
    },
    {
      title: 'Benchmark 3: Calm Focus (Partially Aligned)',
      desc: 'Balanced prosody with neutral face and positive cognitive reflection',
      text: 'I submitted my major project thesis and took a long walk in the garden.',
      voice: 'Feeling grounded and relieved to have finished the milestone.',
      pitch: 155,
      face: 'Calmness',
      faceAus: 'Relaxed facial musculature, steady gaze, neutral lip line'
    }
  ];

  const loadBenchmark = (b: typeof sampleBenchmarks[0]) => {
    setIncludeText(true);
    setIncludeVoice(true);
    setIncludeFace(true);
    setTextContent(b.text);
    setVoiceTranscript(b.voice);
    setVoicePitchHz(b.pitch);
    setFaceExpression(b.face);
    setFaceActionUnits(b.faceAus);
    setResult(null);
  };

  const handleFuse = async () => {
    if (!includeText && !includeVoice && !includeFace) {
      setError('Please select at least one modality to fuse.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: any = {
      saveToHistory
    };

    if (includeText && textContent.trim()) {
      payload.textAnalysis = {
        primaryEmotion: textContent.toLowerCase().includes('fail') ? 'Disappointment' : 'Stress',
        text: textContent.trim()
      };
    }

    if (includeVoice && voiceTranscript.trim()) {
      payload.voiceAnalysis = {
        transcription: voiceTranscript.trim(),
        audioFeatures: {
          avgPitchHz: voicePitchHz,
          speakingRateWpm: 130,
          pauseCount: 3
        }
      };
    }

    if (includeFace) {
      payload.facialAnalysis = {
        visibleExpression: faceExpression,
        visibleIndicators: faceActionUnits.split(',').map(s => s.trim())
      };
    }

    try {
      const res = await authFetch('/api/analyze/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Multimodal fusion failed.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Multimodal fusion error:', err);
      setError(err.message || 'Error occurred during multimodal fusion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 text-white shadow-xl shadow-purple-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <Layers className="w-3.5 h-3.5" /> Module 9 (Major Core)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Multimodal Emotion Fusion Engine</h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
            Hybrid decision-level fusion synthesizing verbal semantics, paralinguistic acoustics, and facial Action Units to detect emotional congruence or social masking.
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs text-purple-100 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md cursor-pointer">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="rounded text-purple-600 focus:ring-0"
            />
            <span>Log to Emotion History</span>
          </label>
        </div>
      </div>

      {/* Benchmark Presets Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Benchmark Scenarios:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {sampleBenchmarks.map((b, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadBenchmark(b)}
              className="text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-400 text-xs transition-colors"
            >
              <strong className="text-purple-700 dark:text-purple-300 block text-[11px] mb-0.5">
                {b.title}
              </strong>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-1">
                {b.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modality Stream Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stream 1: Text */}
        <div className={`p-4 rounded-3xl border transition-all ${
          includeText
            ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-sm'
            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">1. Text Stream</span>
            </div>
            <input
              type="checkbox"
              checked={includeText}
              onChange={(e) => setIncludeText(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>
          <textarea
            rows={4}
            disabled={!includeText}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none"
            placeholder="Spoken words or typed text..."
          />
        </div>

        {/* Stream 2: Voice */}
        <div className={`p-4 rounded-3xl border transition-all ${
          includeVoice
            ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/60 shadow-sm'
            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">2. Voice Stream</span>
            </div>
            <input
              type="checkbox"
              checked={includeVoice}
              onChange={(e) => setIncludeVoice(e.target.checked)}
              className="rounded text-purple-600 focus:ring-0 cursor-pointer"
            />
          </div>
          <textarea
            rows={2}
            disabled={!includeVoice}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none mb-2"
            placeholder="Acoustic vocal transcript..."
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Fundamental Pitch (F0):</span>
            <input
              type="number"
              disabled={!includeVoice}
              value={voicePitchHz}
              onChange={(e) => setVoicePitchHz(Number(e.target.value))}
              className="w-16 p-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right text-xs font-mono"
            />
            <span className="text-[10px] text-slate-400">Hz</span>
          </div>
        </div>

        {/* Stream 3: Face */}
        <div className={`p-4 rounded-3xl border transition-all ${
          includeFace
            ? 'bg-white dark:bg-slate-900 border-pink-200 dark:border-pink-900/60 shadow-sm'
            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-pink-600" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">3. Facial Stream</span>
            </div>
            <input
              type="checkbox"
              checked={includeFace}
              onChange={(e) => setIncludeFace(e.target.checked)}
              className="rounded text-pink-600 focus:ring-0 cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Visible Expression:</span>
              <select
                disabled={!includeFace}
                value={faceExpression}
                onChange={(e) => setFaceExpression(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                {['Happiness', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Neutral', 'Calmness', 'Emotional exhaustion'].map((e, i) => (
                  <option key={i} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Action Units:</span>
              <input
                type="text"
                disabled={!includeFace}
                value={faceActionUnits}
                onChange={(e) => setFaceActionUnits(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fusion Trigger Action */}
      <div className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="text-xs text-slate-500">
          Synthesizing {Number(includeText) + Number(includeVoice) + Number(includeFace)} Active Behavioral Channels
        </div>
        <button
          onClick={handleFuse}
          disabled={loading}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Executing Fusion Algorithm...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Execute Multimodal Fusion</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fused Results Card */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 shadow-2xl space-y-6 animate-fade-in">
          {/* Top Consensus Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Fused Primary Emotional Consensus
              </span>
              <div className="flex items-center gap-3">
                <EmotionBadge emotion={result.primaryEmotion} size="lg" />
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.modalityAgreement === 'Aligned'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : result.modalityAgreement === 'Divergent'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                    : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                }`}>
                  Modality: {result.modalityAgreement}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center min-w-[90px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Intensity
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {result.intensity}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center min-w-[90px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Confidence
                </span>
                <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {Math.round((result.confidence || 0.88) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Fusion Explanation & Discrepancy Analysis */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              Cross-Modal Synthesis & Behavioral Reasoning
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {result.fusionExplanation}
            </p>
          </div>

          {/* Cross-Modal Insights */}
          {result.crossModalInsights && result.crossModalInsights.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                Channel Synergy Observations
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {result.crossModalInsights.map((ins: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tailored Recommendations */}
          {result.suggestions && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Multimodal Wellness Interventions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {result.suggestions.map((sug: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100/60 dark:border-emerald-900/40 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onNavigateToChat}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Discuss Consensus in AI Wellness Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
