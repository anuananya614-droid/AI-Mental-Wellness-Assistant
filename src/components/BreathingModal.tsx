import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Technique = '4-7-8' | 'box';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const { authFetch } = useAuth();
  const [technique, setTechnique] = useState<Technique>('4-7-8');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [logged, setLogged] = useState<boolean>(false);

  // Phase configurations in seconds
  const configs: Record<Technique, Array<{ phase: 'Inhale' | 'Hold' | 'Exhale' | 'Pause'; duration: number }>> = {
    '4-7-8': [
      { phase: 'Inhale', duration: 4 },
      { phase: 'Hold', duration: 7 },
      { phase: 'Exhale', duration: 8 },
    ],
    box: [
      { phase: 'Inhale', duration: 4 },
      { phase: 'Hold', duration: 4 },
      { phase: 'Exhale', duration: 4 },
      { phase: 'Pause', duration: 4 },
    ]
  };

  const currentSequence = configs[technique];
  const [stepIdx, setStepIdx] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setCompletedCycles(0);
      setLogged(false);
      setStepIdx(0);
      setPhase('Inhale');
      setCountdown(4);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Next step
            const nextIdx = (stepIdx + 1) % currentSequence.length;
            if (nextIdx === 0) {
              setCompletedCycles((c) => c + 1);
            }
            setStepIdx(nextIdx);
            setPhase(currentSequence[nextIdx].phase);
            return currentSequence[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, stepIdx, currentSequence]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setStepIdx(0);
    setPhase(currentSequence[0].phase);
    setCountdown(currentSequence[0].duration);
  };

  const handleCompleteAndLog = async () => {
    try {
      await authFetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'breathing',
          title: `${technique === '4-7-8' ? '4-7-8 Calming' : 'Box'} Breathwork (${completedCycles || 1} cycles)`,
          duration_minutes: Math.max(1, Math.round((completedCycles * 19) / 60)),
          notes: 'Completed guided breathing exercise.'
        })
      });
      setLogged(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Error logging activity', e);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Visual circle scale computation
  let circleScale = 'scale-100';
  let circleColor = 'from-indigo-400 to-purple-500';
  if (phase === 'Inhale') {
    circleScale = 'scale-125';
    circleColor = 'from-sky-400 to-indigo-500';
  } else if (phase === 'Hold') {
    circleScale = 'scale-125';
    circleColor = 'from-purple-500 to-pink-500';
  } else if (phase === 'Exhale') {
    circleScale = 'scale-90';
    circleColor = 'from-teal-400 to-emerald-500';
  } else {
    circleScale = 'scale-90';
    circleColor = 'from-slate-400 to-slate-500';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 overflow-hidden flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
          <Wind className="w-6 h-6" />
          <h3 className="text-lg font-bold">Guided Breathing Activity</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
          Slow diaphragmatic respiration signals safety to the autonomic nervous system.
        </p>

        {/* Technique Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 text-xs font-medium">
          <button
            onClick={() => {
              setTechnique('4-7-8');
              setIsActive(false);
              setStepIdx(0);
              setPhase('Inhale');
              setCountdown(4);
            }}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              technique === '4-7-8'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            4-7-8 Calming Breath
          </button>
          <button
            onClick={() => {
              setTechnique('box');
              setIsActive(false);
              setStepIdx(0);
              setPhase('Inhale');
              setCountdown(4);
            }}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              technique === 'box'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
        </div>

        {/* Pulsing Visual Sphere */}
        <div className="relative w-56 h-56 flex items-center justify-center my-4">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${circleColor} opacity-25 filter blur-xl transition-all duration-1000 ${
              isActive ? circleScale : 'scale-100'
            }`}
          />
          <div
            className={`relative w-44 h-44 rounded-full bg-gradient-to-tr ${circleColor} shadow-xl flex flex-col items-center justify-center text-white transition-all duration-1000 ${
              isActive ? circleScale : 'scale-100'
            }`}
          >
            <span className="text-xl font-bold tracking-wider uppercase mb-1">
              {isActive ? phase : 'Ready'}
            </span>
            <span className="text-4xl font-extrabold font-mono">
              {isActive ? countdown : '▶'}
            </span>
            <span className="text-[11px] opacity-80 mt-1">
              {isActive ? `Cycle ${completedCycles + 1}` : 'Tap Start Below'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm text-white shadow-md transition-all ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start Exercise'}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Save & Log to Activity */}
        <div className="mt-6 w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Completed: <strong className="text-slate-800 dark:text-slate-200">{completedCycles} cycles</strong>
          </span>
          <button
            onClick={handleCompleteAndLog}
            disabled={logged || completedCycles === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              logged
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : completedCycles > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                : 'opacity-40 cursor-not-allowed text-slate-400'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {logged ? 'Logged to Profile!' : 'Log Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};
