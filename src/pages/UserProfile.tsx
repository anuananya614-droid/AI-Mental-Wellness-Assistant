import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Target,
  Globe,
  Calendar,
  CheckCircle,
  Download,
  Trash2,
  Lock,
  Sparkles,
  Award,
  ShieldCheck,
  Wind
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

export const UserProfile: React.FC = () => {
  const { user, login, register, logout, updateProfile, authFetch } = useAuth();
  const [name, setName] = useState<string>(user?.name || '');
  const [wellnessGoal, setWellnessGoal] = useState<string>(user?.wellness_goal || 'Stress Management');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  // Auth form states for switching or signing up
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPass, setAuthPass] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setWellnessGoal(user.wellness_goal || 'Stress Management');
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      const res = await authFetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error('Failed to load user activities', e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateProfile({
        name,
        wellness_goal: wellnessGoal
      });
      setSaveMsg('Profile preferences updated.');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      console.error('Failed to update profile', e);
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('This will permanently erase all your conversations and emotion analyses. Continue?')) return;
    try {
      const res = await authFetch('/api/user/data', { method: 'DELETE' });
      if (res.ok) {
        alert('All personal records have been permanently cleared.');
        window.location.reload();
      }
    } catch (e) {
      console.error('Error clearing user data', e);
    }
  };

  const handleDownloadPersonalData = async () => {
    try {
      const res = await authFetch('/api/report/data');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Mental_Wellness_Data_${user?.id || 'export'}.json`;
        a.click();
      }
    } catch (e) {
      console.error('Failed to export user data', e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPass);
      } else {
        await register(authName, authEmail, authPass);
      }
      setIsAuthModalOpen(false);
      setAuthEmail('');
      setAuthPass('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    }
  };

  const goals = [
    'Stress Management & Reduction',
    'Exam & Viva Anxiety Relief',
    'Cognitive Re-framing & Mindfulness',
    'Healthy Sleep & Energy Hygiene',
    'Emotional Resilience & Growth',
    'General Daily Self-Reflection'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl shadow-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white font-bold text-2xl flex items-center justify-center border border-white/25">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-1">
              <User className="w-3.5 h-3.5" /> Module 10: User Profile
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {user?.name || 'Guest User'}
            </h1>
            <p className="text-xs text-purple-200">
              {user?.email || 'Guest Session (Local Storage)'} • Member since {new Date(user?.created_at || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors"
          >
            Switch / Register Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Personalized Wellness Preferences
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Primary Mental Wellness Objective
              </label>
              <select
                value={wellnessGoal}
                onChange={(e) => setWellnessGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
              >
                {goals.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>

              {saveMsg && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                  ✓ {saveMsg}
                </span>
              )}
            </div>
          </form>

          {/* Privacy & Data Ownership Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Data Rights, Privacy & Consent (GDPR Compliance)</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with academic research and ethical standards, your biometric frames and speech streams are never retained without authorization. You maintain complete ownership of your interaction history.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPersonalData}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export My Data (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleClearData}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe All My Records</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Completed Care Log */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-indigo-600" />
              <span>Completed Activities</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {activities.length} total
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 text-xs">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No guided activities logged yet. Try the 4-7-8 breathing exercise!
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1"
                >
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{new Date(act.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {act.duration_minutes} min
                    </span>
                  </div>
                  {act.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{act.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Switch / Register Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {authMode === 'login' ? 'Sign In to Account' : 'Create New User Account'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                  placeholder="••••••••"
                />
              </div>

              {authError && (
                <p className="text-rose-500 font-medium">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="pt-2 text-center text-slate-400 text-[11px] flex items-center justify-center gap-1">
                <span>{authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
