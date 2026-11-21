import React from 'react';
import { Phone, ShieldAlert, Heart, X, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    { country: 'India', name: 'National Emergency Helpline', number: '112', desc: 'Immediate police, medical, and rescue dispatch (24/7 Toll-free)' },
    { country: 'India', name: 'Tele-MANAS (Ministry of Health)', number: '14416 / 1800-891-4416', desc: 'Government 24/7 mental health counseling in 20+ regional languages' },
    { country: 'India', name: 'Vandrevala Foundation', number: '+91 9999 666 555', desc: 'Free 24/7 psychological crisis intervention and counseling' },
    { country: 'India', name: 'KIRAN National Helpline', number: '1800-599-0019', desc: 'Govt. 24/7 mental health rehabilitation helpline' },
    { country: 'USA & Canada', name: 'Suicide & Crisis Lifeline', number: '988', desc: 'Free, confidential support 24/7 via call or text' },
    { country: 'United Kingdom', name: 'NHS Mental Health Crisis', number: '111', desc: 'Urgent mental health assessment line' },
    { country: 'Global', name: 'Befrienders Worldwide', number: 'befrienders.org', desc: 'Worldwide emotional support volunteer centers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Immediate Crisis Support & Safety</h2>
              <p className="text-rose-100 text-sm mt-0.5">You are not alone. Empathetic and confidential help is ready right now.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Grounding Message */}
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
              <strong>Please take a gentle pause.</strong> If you or someone you know is in immediate physical danger, feeling unable to stay safe, or contemplating self-harm, please reach out to one of the trusted emergency resources below immediately.
            </div>
          </div>

          {/* Helpline Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified 24/7 Helplines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {helplines.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        {item.country}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {item.number}
                    </span>
                    {item.number.includes('.') ? (
                      <a
                        href={`https://${item.number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href={`tel:${item.number.split('/')[0].replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                      >
                        <Phone className="w-3 h-3" /> Call Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Grounding Step */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
              Immediate Grounding Technique (5-4-3-2-1)
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• Look around and notice <strong>5 things you can see</strong>.</li>
              <li>• Notice <strong>4 things you can touch</strong> or feel against your skin.</li>
              <li>• Listen for <strong>3 distinct sounds</strong> around you.</li>
              <li>• Acknowledge <strong>2 things you can smell</strong> or like the scent of.</li>
              <li>• Take <strong>1 deep, slow breath</strong> and drink a sip of cool water.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-medium text-sm rounded-xl transition-colors"
          >
            I am Safe / Close
          </button>
        </div>
      </div>
    </div>
  );
};
