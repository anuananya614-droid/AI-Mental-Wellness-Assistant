import React, { useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Eye,
  MessageSquareHeart,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmotionBadge } from '../components/EmotionBadge';

interface ImageUploadAnalysisProps {
  onNavigateToChat: () => void;
}

export const ImageUploadAnalysis: React.FC<ImageUploadAnalysisProps> = ({ onNavigateToChat }) => {
  const { authFetch, language } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userContext, setUserContext] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveToHistory, setSaveToHistory] = useState<boolean>(true);

  // Pre-configured sample image presets for instant testing
  const samplePresets = [
    {
      title: 'Preset: Genuine Smile (Joy)',
      description: 'Zygomatic elevation & peri-orbital crinkling',
      context: 'Photo taken during our engineering major project completion celebration.',
      // High-quality SVG data url representing a stylized facial expression for instant testing
      svgUrl: createSampleFaceSvg('smile')
    },
    {
      title: 'Preset: Pensive / Furrowed Brow (Stress)',
      description: 'Corrugator supercilii contraction & focused gaze',
      context: 'Late night preparation session before the internal project evaluation.',
      svgUrl: createSampleFaceSvg('frown')
    },
    {
      title: 'Preset: Relaxed Neutral Composure',
      description: 'Unwrinkled forehead, even eye gaze, neutral mouth',
      context: 'Morning reflection check-in before beginning workday.',
      svgUrl: createSampleFaceSvg('neutral')
    }
  ];

  function createSampleFaceSvg(type: 'smile' | 'frown' | 'neutral'): string {
    const mouthPath =
      type === 'smile'
        ? 'M 60 130 Q 100 165 140 130'
        : type === 'frown'
        ? 'M 60 145 Q 100 120 140 145'
        : 'M 65 135 L 135 135';

    const browPath =
      type === 'frown'
        ? '<path d="M 50 72 L 85 82 M 150 72 L 115 82" stroke="#475569" stroke-width="4" stroke-linecap="round"/>'
        : '<path d="M 50 75 Q 70 70 90 75 M 110 75 Q 130 70 150 75" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
        <rect width="200" height="200" fill="#f8fafc"/>
        <circle cx="100" cy="100" r="75" fill="#fde68a" stroke="#d97706" stroke-width="3"/>
        ${browPath}
        <circle cx="70" cy="95" r="8" fill="#1e293b"/>
        <circle cx="130" cy="95" r="8" fill="#1e293b"/>
        <path d="${mouthPath}" stroke="#92400e" stroke-width="5" stroke-linecap="round" fill="none"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      setError('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('File size exceeds 8MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setMimeType(file.type);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.svgUrl);
    setMimeType('image/svg+xml');
    setUserContext(preset.context);
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select or upload an image first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/analyze/facial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          userContext: userContext.trim() || undefined,
          sourceType: 'uploaded_image',
          saveToHistory
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze uploaded photo.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(err.message || 'Error occurred while analyzing image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setUserContext('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-lg shadow-teal-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <UploadCloud className="w-3.5 h-3.5" /> Module 7
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Upload Facial Image Analysis</h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            Upload a facial photo (JPG, PNG, WEBP) to inspect visible Action Units, correlate with user context, and receive supportive suggestions.
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs text-teal-100 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md cursor-pointer">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="rounded text-teal-600 focus:ring-0"
            />
            <span>Log to Emotion History</span>
          </label>
        </div>
      </div>

      {/* Ethical Guardrail Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Non-Diagnostic & Privacy Policy:</strong> AI-Powered Mental Wellness Assistant does not identify the person in the photograph and never diagnoses clinical psychiatric conditions from an image. Visible expressions are treated as outward behavioral cues.
        </div>
      </div>

      {/* Upload Zone & Presets */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Drag/Drop Box */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 hover:border-teal-400 dark:hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50 text-center relative overflow-hidden min-h-[220px]">
            {selectedImage ? (
              <div className="relative w-full h-48 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-sm"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors text-xs"
                  title="Clear photo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center space-y-3 w-full h-full justify-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Upload Facial Photograph
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Drag and drop or browse (JPG, PNG, WEBP up to 8MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Context Input & Presets */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Contextual Narrative (Optional)
              </label>
              <textarea
                rows={3}
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="What was happening when this photo was taken? (e.g. studying, celebrating with friends, feeling fatigued...)"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Quick Preset Scenarios:
              </span>
              <div className="space-y-1.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-teal-400 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-teal-700 dark:text-teal-300 block text-[11px]">
                        {preset.title}
                      </span>
                      <span className="text-slate-400 text-[10px]">{preset.description}</span>
                    </div>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Use Preset</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Action Bar */}
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className={`px-7 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all flex items-center gap-2 ${
              !selectedImage || loading
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
            }`}
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analyzing Facial Action Units...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Uploaded Image</span>
              </>
            )}
          </button>

          {selectedImage && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear & Upload Another
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-950 shadow-xl space-y-6 animate-fade-in">
          {/* Top Classification Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Likely Visible Expression
              </span>
              <div className="flex items-center gap-3">
                <EmotionBadge emotion={result.visibleExpression} size="lg" showKannada={language === 'kn'} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center min-w-[90px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Intensity
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {result.intensity}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center min-w-[90px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Confidence
                </span>
                <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {Math.round((result.confidence || 0.85) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Morphological Cues */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
              Observed Morphological Indicators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {(result.visibleIndicators || []).map((ind: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <Eye className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cautious Interpretation */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
            <strong className="block font-bold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-300">
              Interpretation & Context Synthesis:
            </strong>
            <p>{result.cautiousInterpretation}</p>
          </div>

          {/* Calibrating Question */}
          {result.followUpQuestion && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider mb-1">
                  Calibrating Reflection
                </strong>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {result.followUpQuestion}
                </p>
              </div>
            </div>
          )}

          {/* Supportive Recommendations */}
          {result.supportiveSuggestions && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Personalized Recommendations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {result.supportiveSuggestions.map((sug: string, idx: number) => (
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
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Discuss Photo Context in Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
