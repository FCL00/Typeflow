import React from 'react';
import { TestConfig } from '../types';

interface LiveStatisticsProps {
  config: TestConfig;
  isTestActive: boolean;
  timeLeft: number;
  completedWords: number;
  totalWords: number;
  liveWpm: number;
  liveAcc: number;
  quoteAuthor?: string;
}

export const LiveStatistics: React.FC<LiveStatisticsProps> = ({
  config,
  isTestActive,
  timeLeft,
  completedWords,
  totalWords,
  liveWpm,
  liveAcc,
  quoteAuthor,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto h-12 flex items-center justify-between text-[var(--main-color)] font-mono select-none px-2">
      {/* Primary Left Metric: Timer or Word progress */}
      <div className="text-2xl font-semibold tabular-nums tracking-tight">
        {config.mode === 'time' && (
          <span className={isTestActive ? 'text-[var(--main-color)]' : 'text-[var(--sub-color)] opacity-60'}>
            {isTestActive ? timeLeft : config.timeDuration}
          </span>
        )}

        {config.mode === 'words' && (
          <span className={isTestActive ? 'text-[var(--main-color)]' : 'text-[var(--sub-color)] opacity-60'}>
            {completedWords}/{totalWords}
          </span>
        )}

        {config.mode === 'quote' && (
          <span className="text-sm font-sans text-[var(--sub-color)] truncate max-w-sm">
            {quoteAuthor ? `— ${quoteAuthor}` : 'Quote Mode'}
          </span>
        )}
      </div>

      {/* Live secondary metrics: WPM & Accuracy (revealed while typing) */}
      <div className={`flex items-center gap-6 text-sm font-medium transition-opacity duration-150 ${
        isTestActive ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-baseline gap-1 text-[var(--sub-color)]">
          <span className="text-lg font-bold text-[var(--main-color)] tabular-nums">{liveWpm}</span>
          <span className="text-xs">wpm</span>
        </div>

        <div className="flex items-baseline gap-1 text-[var(--sub-color)]">
          <span className="text-lg font-bold text-[var(--text-color)] tabular-nums">{liveAcc}%</span>
          <span className="text-xs">acc</span>
        </div>
      </div>
    </div>
  );
};
