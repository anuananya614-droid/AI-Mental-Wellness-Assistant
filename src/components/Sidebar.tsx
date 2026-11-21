import React from 'react';
import {
  LayoutDashboard,
  MessageSquareHeart,
  Mic,
  Camera,
  UploadCloud,
  Layers,
  Smile,
  History,
  BarChart3,
  User,
  Settings,
  ShieldAlert,
  Moon,
  Sun,
  Award,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavSection =
  | 'dashboard'
  | 'chat'
  | 'voice_analysis'
  | 'facial_analysis'
  | 'upload_analysis'
  | 'multimodal_fusion'
  | 'history'
  | 'analytics'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenCrisis: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenCrisis,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, theme, toggleTheme, logout } = useAuth();

  const navItems: Array<{ id: NavSection; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Text Chat', icon: MessageSquareHeart, badge: 'AI Chat' },
    { id: 'voice_analysis', label: 'Voice Analysis', icon: Mic },
    { id: 'facial_analysis', label: 'Facial Analysis', icon: Camera },
    { id: 'upload_analysis', label: 'Image Upload', icon: UploadCloud },
    { id: 'multimodal_fusion', label: 'Multimodal Fusion Lab', icon: Layers, badge: 'Fusion' },
    { id: 'history', label: 'Emotion History', icon: History },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                AI-Powered Mental Wellness Assistant
              </h1>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                Multimodal Emotion Recognition
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1 scrollbar-thin">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Crisis Helpline & User Status */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Crisis Hotline Button */}
          <button
            onClick={() => {
              onOpenCrisis();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Crisis Helpline (112 / 14416)</span>
          </button>

          {/* User Bar (No hardcoded names) */}
          <div className="pt-1 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left max-w-[120px]">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'Active User'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.wellness_goal || 'Wellness Tracking'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Toggle Dark / Light Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              {user && user.id !== 'guest_user' && (
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
