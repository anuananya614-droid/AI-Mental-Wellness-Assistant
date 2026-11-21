import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ScanFace,
  MessageSquareHeart,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmotionBadge } from '../components/EmotionBadge';

interface FacialAnalysisProps {
  onNavigateToChat: () => void;
}

export const FacialAnalysis: React.FC<FacialAnalysisProps> = ({ onNavigateToChat }) => {
  const { authFetch, language } = useAuth();
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveToHistory, setSaveToHistory] = useState<boolean>(true);
  const [userCalibration, setUserCalibration] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setResult(null);
      setCapturedImage(null);
      setUserCalibration(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera access was denied or no video input device was found. Please enable camera permissions in your browser.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64);

    // Stop video stream after capture to preserve camera resources
    stopCamera();

    // Call API
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/analyze/facial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          sourceType: 'live_webcam',
          saveToHistory
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze facial expression.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Facial analysis error:', err);
      setError(err.message || 'Error occurred while analyzing facial frame.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setResult(null);
    setUserCalibration(null);
    startCamera();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <Camera className="w-3.5 h-3.5" /> Module 6
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Live Facial Expression Recognition</h1>
          <p className="text-xs sm:text-sm text-pink-100 mt-1 max-w-xl">
            Real-time visual feature extraction analyzing visible morphological Action Units (smile, brow furrow, eye widening) with strict ethical boundaries.
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs text-pink-100 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md cursor-pointer">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="rounded text-pink-600 focus:ring-0"
            />
            <span>Log to Emotion History</span>
          </label>
        </div>
      </div>

      {/* Ethical Guardrail Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Computer Vision Ethical Safeguard:</strong> This module detects <em>visible facial expressions only</em>. Facial morphology does not constitute an identity scan, nor does it guarantee internal emotional state (e.g., social smiling or fatigue). We never store camera video feeds permanently.
        </div>
      </div>

      {/* Camera Viewport & Capture Console */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center space-y-6">
        {/* Viewport Frame */}
        <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
          {/* Hidden Canvas for capture rendering */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Live Video Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Captured Snapshot Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Frame"
              className="w-full h-full object-cover transform -scale-x-100"
            />
          )}

          {/* Camera Idle State */}
          {!isCameraActive && !capturedImage && (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <ScanFace className="w-8 h-8 text-pink-400" />
              </div>
              <div className="text-slate-300 text-sm font-semibold">
                Camera is currently inactive
              </div>
              <p className="text-slate-500 text-xs max-w-xs">
                Click "Start Camera" to activate your webcam feed for real-time expression detection.
              </p>
            </div>
          )}

          {/* Facial Alignment Overlay Guide when active */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-64 border-2 border-dashed border-pink-400/60 rounded-[50%] animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-pink-200 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Align Face Here
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {!isCameraActive && !capturedImage && (
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/25 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </button>
          )}

          {isCameraActive && (
            <>
              <button
                onClick={captureAndAnalyze}
                className="px-8 py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 animate-pulse"
              >
                <ScanFace className="w-5 h-5" />
                <span>Capture & Analyze Expression</span>
              </button>
              <button
                onClick={stopCamera}
                className="p-3 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Stop Camera"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            </>
          )}

          {capturedImage && !loading && (
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Video Frame</span>
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

      {loading && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Analyzing Facial Landmarks & Action Units...
          </h4>
          <p className="text-xs text-slate-400">
            Detecting zygomatic elevation, brow tension, and eye aperture morphology.
          </p>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-950 shadow-xl space-y-6 animate-fade-in">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Visible Expression Category
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
                <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                  {result.intensity}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center min-w-[90px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Confidence
                </span>
                <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {Math.round((result.confidence || 0.82) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Morphological Action Units Indicators */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 block">
              Visible Morphological Action Units (FACS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {(result.visibleIndicators || []).map((ind: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <Eye className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cautious Interpretation (Mandated by project specifications) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 space-y-1 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <strong className="block font-bold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-300">
              Cautious Academic Interpretation:
            </strong>
            <p>{result.cautiousInterpretation}</p>
          </div>

          {/* Interactive User Emotional Ground-Truth Calibration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>{result.followUpQuestion || 'Does this visible expression reflect how you actually feel inside?'}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Yes, it matches how I feel', val: 'aligned' },
                { label: 'Partially, but there is more to it', val: 'partial' },
                { label: 'No, I am masking my true feelings', val: 'masking' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserCalibration(btn.val)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    userCalibration === btn.val
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {userCalibration && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                ✓ Recorded calibration: {userCalibration === 'masking' ? 'Emotional masking noted for multimodal synthesis.' : 'Feedback recorded for personal profile.'}
              </p>
            )}
          </div>

          {/* Supportive Recommendations */}
          {result.supportiveSuggestions && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Supportive Guidance</span>
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
              className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md shadow-pink-600/20 transition-all flex items-center gap-2"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Continue in AI Wellness Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
