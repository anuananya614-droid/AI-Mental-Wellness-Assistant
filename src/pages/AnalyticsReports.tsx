import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  PieChart,
  Activity,
  Layers,
  Info,
  MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnalyticsData } from '../types';
import { generateWellnessPdfReport } from '../utils/pdfReport';

export const AnalyticsReports: React.FC = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await authFetch('/api/report/data');
      if (res.ok) {
        const reportData = await res.json();
        generateWellnessPdfReport(reportData);
      }
    } catch (e) {
      console.error('Failed to generate PDF report', e);
      alert('Could not generate PDF report at this time.');
    } finally {
      setDownloading(false);
    }
  };

  const hasData = (data?.summary?.totalAnalyses || 0) > 0 || (data?.summary?.totalConversations || 0) > 0;

  const maxEmotionCount =
    data?.emotionDistribution && data.emotionDistribution.length > 0
      ? Math.max(...data.emotionDistribution.map((e) => e.count), 1)
      : 1;

  const totalModalityAnalyses =
    data?.modalityDistribution && data.modalityDistribution.length > 0
      ? data.modalityDistribution.reduce((acc, m) => acc + m.count, 0)
      : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-teal-700 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics & Reports
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Analytics & Report Generation</h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Real-time emotion category frequency distributions, intensity levels, modality statistics, and downloadable PDF wellness reports.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-5 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>{downloading ? 'Compiling PDF...' : 'Download Wellness PDF Report'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total AI Emotion Analyses
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
            {data?.summary.totalAnalyses || 0}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Recorded across text, voice, & facial sensors</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dominant Emotion
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
            {data?.summary.dominantEmotion || 'Neutral'}
          </div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Most frequently observed pattern</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Chat Sessions
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
            {data?.summary.totalConversations || 0}
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Text Chat conversations completed</span>
        </div>
      </div>

      {!hasData && !loading ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No analysis data available yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Start a Text Chat session, Voice Analysis, or Facial Analysis to generate your personalized emotional intelligence insights and reports.
          </p>
        </div>
      ) : (
        /* Main Analytics Section */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Emotion Category Frequency Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    <span>Emotion Category Distribution</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Observed occurrence across 16 recognized affective categories
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
                {data?.emotionDistribution && data.emotionDistribution.length > 0 ? (
                  data.emotionDistribution.map((item, idx) => {
                    const percent = Math.round((item.count / maxEmotionCount) * 100);
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {item.primary_emotion}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {item.count} {item.count === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No emotion distribution data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Emotional Intensity Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Emotional Intensity Distribution</span>
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Classification of detected affective intensity across Low, Moderate, and High levels
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {['Low', 'Moderate', 'High'].map((lvl) => {
                    const item = data?.intensityDistribution?.find((i) => i.intensity === lvl);
                    const count = item?.count || 0;
                    return (
                      <div key={lvl} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {lvl} Intensity
                        </span>
                        <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
                          {count}
                        </div>
                        <span className="text-[10px] text-slate-400">analyses</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <strong>Intensity Overview:</strong> Intensity levels are evaluated using linguistic keyword density, vocal prosody cadence, and facial Action Unit muscular movement depth.
              </div>
            </div>
          </div>

          {/* Modality Statistics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Modality Usage Statistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              {data?.modalityDistribution && data.modalityDistribution.length > 0 ? (
                data.modalityDistribution.map((m, idx) => {
                  const percent = Math.round((m.count / totalModalityAnalyses) * 100);
                  const labelMap: Record<string, string> = {
                    text: 'Text Analysis',
                    voice: 'Voice Analysis',
                    face_live: 'Live Facial Camera',
                    face_upload: 'Facial Image Upload',
                    multimodal: 'Multimodal Fusion'
                  };
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {labelMap[m.input_mode] || m.input_mode}
                        </span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
                          {m.count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 col-span-3">No modality usage recorded yet.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>Report System Note:</strong> All analytics represent pattern correlations calculated directly from your stored text chat, voice, and facial analysis interactions.
        </div>
      </div>
    </div>
  );
};
