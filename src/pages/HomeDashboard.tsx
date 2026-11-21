import React, { useState, useEffect } from 'react';
import {
  MessageSquareHeart,
  Mic,
  Camera,
  UploadCloud,
  Layers,
  Wind,
  Smile,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavSection } from '../components/Sidebar';
import { EmotionBadge } from '../components/EmotionBadge';

interface HomeDashboardProps {
  onNavigate: (section: NavSection) => void;
  onOpenBreathing: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onOpenBreathing
}) => {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, historyRes] = await Promise.all([
        authFetch('/api/analytics'),
        authFetch('/api/emotions/history?limit=4')
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data.summary);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setRecentAnalyses(data.history || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard statistics', e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? `, ${user.name}` : '';

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Mental Wellness Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {getGreeting()}{displayName}. <br className="hidden sm:inline" />
            <span className="text-indigo-200 font-normal">How is your emotional wellbeing today?</span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            An empathetic multimodal AI assistant that unifies natural language text, vocal acoustic prosody, live facial expression tracking, and photograph analysis into one cohesive emotional intelligence engine.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Snapshot Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Analyses</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.totalAnalyses ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">records</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Dominant Emotion</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {stats?.dominantEmotion || 'Neutral'}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Recorded trend</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conversations</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.totalConversations ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">sessions</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Guided Activities</span>
            <div className="p-2 bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 rounded-xl">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.totalActivities ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">completed</span>
          </div>
        </div>
      </div>

      {/* Multimodal Entry Modalities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Multimodal Input Methods & Workspaces
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All four sensory inputs connect to the unified conversation engine.
            </p>
          </div>
          <button
            onClick={() => onNavigate('multimodal_fusion')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Launch Fusion Lab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Text Chat */}
          <div
            onClick={() => onNavigate('chat')}
            className="group p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                1. Text Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Primary conversational interface. Type messages, record voice, capture live facial expressions, or attach photos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Open Text Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Voice Analysis */}
          <div
            onClick={() => onNavigate('voice_analysis')}
            className="group p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                2. Voice Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Microphone recording & audio file upload with fundamental pitch (F0), speaking pace (WPM), and silence pause tracking.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span>Analyze Voice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Facial Analysis */}
          <div
            onClick={() => onNavigate('facial_analysis')}
            className="group p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                3. Live Facial Video
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Real-time webcam capture recognizing visible morphological Action Units (smile, brow furrow, eye widening).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-pink-600 dark:text-pink-400">
              <span>Launch Camera</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Upload Image */}
          <div
            onClick={() => onNavigate('upload_analysis')}
            className="group p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                4. Image Upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Upload facial photographs (JPG, PNG, WEBP) to inspect visible Action Units and integrate contextual narratives.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>Upload Photo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Assistant Callout & Quick Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquareHeart className="w-4 h-4" />
              <span>Unified Conversational Engine</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Dynamic Empathetic Dialogue
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Behaves like a true conversational AI assistant. Remembers your earlier messages, identifies subtle emotional shifts, asks single clarifying questions, and constructs realistic recovery suggestions.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                Example: Tell the assistant "I am sad because I failed my exam" → Assistant understands, asks whether you are more worried about your future or preparation, and crafts an actionable study recovery plan.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Open Text Chat</span>
            </button>
            <button
              onClick={() => onNavigate('multimodal_fusion')}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Multimodal Fusion Lab</span>
            </button>
          </div>
        </div>

        {/* Right Col: Guided Quick Activities */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Guided Care Tools</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              Immediate Relief Tools
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={onOpenBreathing}
                className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100/80 dark:border-slate-700 hover:border-indigo-300 transition-all shadow-sm flex items-center gap-3 group cursor-pointer"
              >
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">4-7-8 Breathing</h4>
                  <p className="text-[11px] text-slate-500">1-minute calming respiration</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 text-[11px] text-slate-400 text-center">
            AI-Powered Mental Wellness Assistant
          </div>
        </div>
      </div>

      {/* Recent Analyses Log */}
      {recentAnalyses.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Recent Emotion Recognition Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit records across text, paralinguistic voice, and visual sensors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.input_mode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <EmotionBadge emotion={item.primary_emotion} intensity={item.intensity} confidence={item.confidence} />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {item.explanation || item.input_text_or_summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
