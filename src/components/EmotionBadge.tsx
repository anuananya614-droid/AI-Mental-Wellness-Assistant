import React from 'react';
import { getEmotionStyle, getLocalizedEmotionLabel } from '../utils/languages';

interface EmotionBadgeProps {
  emotion: string;
  localizedLabel?: string;
  kannadaLabel?: string;
  intensity?: string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  lang?: string;
  showKannada?: boolean;
}

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  emotion,
  localizedLabel,
  kannadaLabel,
  intensity,
  confidence,
  size = 'md',
  lang = 'en',
  showKannada = false
}) => {
  const style = getEmotionStyle(emotion);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2',
    lg: 'text-sm sm:text-base px-4 py-1.5 gap-2.5 font-medium'
  };

  const effectiveLang = showKannada ? 'kn' : lang;
  const displayLabel = localizedLabel || kannadaLabel || getLocalizedEmotionLabel(emotion, effectiveLang);

  return (
    <div
      className={`inline-flex items-center rounded-full border transition-all ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
      <span className="font-medium tracking-tight">
        {displayLabel && displayLabel !== emotion ? (
          <span>{displayLabel} ({emotion})</span>
        ) : (
          <span>{emotion}</span>
        )}
      </span>
      {intensity && (
        <span className="text-[10px] opacity-75 uppercase tracking-wider font-semibold border-l pl-1.5 border-current/20">
          {intensity}
        </span>
      )}
      {confidence !== undefined && (
        <span className="text-[10px] opacity-75 font-mono">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
};
