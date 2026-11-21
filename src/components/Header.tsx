import React from 'react';
import { Menu, Globe, Wind, Smile, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  onOpenCrisis: () => void;
  onOpenBreathing: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileSidebar,
  onOpenCrisis,
  onOpenBreathing
}) => {
  const { language, setLanguage } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Language Selector & Quick Wellness Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multilingual Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none text-xs font-medium text-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
            title="Preferred Language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Guided Breathing Quick Launcher */}
        <button
          onClick={onOpenBreathing}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          title="Start 1-minute calming breathing"
        >
          <Wind className="w-3.5 h-3.5 text-indigo-500" />
          <span>Breathe</span>
        </button>

        {/* Crisis SOS button */}
        <button
          onClick={onOpenCrisis}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-all shadow-sm"
          title="Crisis Helplines"
        >
          <ShieldAlert className="w-4 h-4 sm:hidden text-rose-600" />
          <span className="hidden sm:inline">SOS Help</span>
        </button>
      </div>
    </header>
  );
};
