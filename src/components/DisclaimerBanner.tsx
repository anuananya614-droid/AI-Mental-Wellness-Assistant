import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  onOpenCrisis: () => void;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ onOpenCrisis }) => {
  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>Ethical Wellness Disclaimer:</strong> This AI-Powered Mental Wellness Assistant is an intelligent supportive companion designed for emotional awareness and educational demonstration. It is not a clinical medical diagnostic tool.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCrisis}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-lg hover:bg-rose-100 transition-colors font-medium text-[11px] cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Immediate Crisis Helplines (112 / 14416 / 988)
        </button>
      </div>
    </div>
  );
};
