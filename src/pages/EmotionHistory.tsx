import React, { useState, useEffect } from 'react';
import {
  History,
  Filter,
  Search,
  Trash2,
  Calendar,
  Eye,
  FileText,
  Mic,
  Camera,
  UploadCloud,
  Layers,
  HelpCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmotionAnalysisRecord, ModalityType } from '../types';
import { EmotionBadge } from '../components/EmotionBadge';

export const EmotionHistory: React.FC = () => {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState<EmotionAnalysisRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<EmotionAnalysisRecord | null>(null);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHistory();
  }, [filterMode]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = filterMode === 'all' ? '/api/emotions/history' : `/api/emotions/history?mode=${filterMode}`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error('Failed to load emotion history', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis record?')) return;

    try {
      const res = await authFetch(`/api/emotions/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete history item', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('This will permanently delete all your recorded emotion analyses. Do you wish to proceed?')) return;

    try {
      const res = await authFetch('/api/emotions/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.primary_emotion.toLowerCase().includes(query) ||
      (item.explanation && item.explanation.toLowerCase().includes(query)) ||
      (item.input_text_or_summary && item.input_text_or_summary.toLowerCase().includes(query))
    );
  });

  const getModeIcon = (mode: ModalityType | string) => {
    switch (mode) {
      case 'text':
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-purple-500" />;
      case 'face_live':
        return <Camera className="w-3.5 h-3.5 text-pink-500" />;
      case 'face_upload':
        return <UploadCloud className="w-3.5 h-3.5 text-teal-500" />;
      case 'multimodal':
        return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
            <History className="w-3.5 h-3.5" /> Module 9
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Emotion Recognition History</h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Audit, inspect, and filter historical predictions, morphological action units, and recommendations across all sensory modalities.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-rose-600/80 text-white text-xs font-medium border border-white/20 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Modality Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'text', label: 'Text' },
            { id: 'voice', label: 'Voice' },
            { id: 'face_live', label: 'Live Face' },
            { id: 'face_upload', label: 'Photo Upload' },
            { id: 'multimodal', label: 'Multimodal' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMode(m.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filterMode === m.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by emotion or text..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-xl border border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHistory.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No emotion records found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run text, voice, live webcam, or image analysis to populate your personalized affective ledger.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {getModeIcon(item.input_mode)}
                    <span>{item.input_mode.replace('_', ' ')}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-opacity"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <EmotionBadge
                    emotion={item.primary_emotion}
                    intensity={item.intensity}
                    confidence={item.confidence}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {item.explanation || item.input_text_or_summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                  Inspect Details →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {getModeIcon(selectedItem.input_mode)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Emotion Record Detail
                  </h3>
                  <span className="text-xs text-slate-400">
                    Captured on {new Date(selectedItem.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Classification */}
              <div className="flex items-center justify-between">
                <EmotionBadge
                  emotion={selectedItem.primary_emotion}
                  intensity={selectedItem.intensity}
                  confidence={selectedItem.confidence}
                  size="lg"
                />
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {selectedItem.id.slice(0, 10)}...
                </span>
              </div>

              {/* Input text / Summary */}
              {selectedItem.input_text_or_summary && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Input Content / Metadata
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-100 italic">
                    "{selectedItem.input_text_or_summary}"
                  </p>
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Affective Model Explanation
                </span>
                <p className="leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40">
                  {selectedItem.explanation}
                </p>
              </div>

              {/* Indicators */}
              {selectedItem.indicators && selectedItem.indicators.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Observed Indicators (Linguistic / Prosodic / FACS)
                  </span>
                  <ul className="space-y-1 pl-1">
                    {selectedItem.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up question */}
              {selectedItem.follow_up_question && (
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Follow-Up Inquiry
                    </strong>
                    <p className="text-slate-800 dark:text-slate-200">
                      {selectedItem.follow_up_question}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedItem.suggestions && selectedItem.suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Associated Wellness Interventions</span>
                  </span>
                  <ul className="space-y-1 pl-1">
                    {selectedItem.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
