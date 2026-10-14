import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Share2, Check, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TestResult } from '../types';

interface ResultsScreenProps {
  result: TestResult;
  onRestartSameTest: () => void;
  onStartNewTest: () => void;
  onViewHistory: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onRestartSameTest,
  onStartNewTest,
  onViewHistory,
}) => {
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    const text = `Typeflow Test Results:\n⚡ ${result.wpm} WPM (raw: ${result.rawWpm})\n🎯 ${result.accuracy}% Accuracy\n🔄 ${result.consistency}% Consistency\n⏱️ ${result.configSummary}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Primary Hero Results Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8">
        {/* Dominant Final WPM */}
        <div className="md:col-span-2 flex flex-col">
          <span className="text-sm font-semibold tracking-wider uppercase text-[var(--sub-color)] mb-1">
            wpm
          </span>
          <span className="text-7xl sm:text-8xl font-black text-[var(--main-color)] font-mono tabular-nums leading-none tracking-tight">
            {result.wpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wider uppercase text-[var(--sub-color)] mb-1">
            acc
          </span>
          <span className="text-5xl sm:text-6xl font-bold text-[var(--text-color)] font-mono tabular-nums leading-none">
            {result.accuracy}%
          </span>
        </div>

        {/* Secondary Test Meta */}
        <div className="flex flex-col justify-end text-sm text-[var(--sub-color)] space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span>test type</span>
            <span className="text-[var(--text-color)] font-semibold">{result.configSummary}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>raw</span>
            <span className="text-[var(--text-color)]">{result.rawWpm} wpm</span>
          </div>
          <div className="flex items-center justify-between">
            <span>consistency</span>
            <span className="text-[var(--text-color)]">{result.consistency}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>characters</span>
            <span className="text-[var(--text-color)]">
              <span className="text-[var(--text-color)]">{result.characters.correct}</span>/
              <span className="text-[var(--error-color)]">{result.characters.incorrect}</span>/
              <span className="text-[var(--error-extra-color)]">{result.characters.extra}</span>/
              <span className="text-[var(--sub-color)]">{result.characters.missed}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>time</span>
            <span className="text-[var(--text-color)]">{result.durationSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Performance Timeline Chart */}
      {result.timeline.length > 1 && (
        <div className="w-full h-48 sm:h-56 mb-8 p-3 rounded-xl bg-[var(--sub-alt-color)]/50 border border-[var(--sub-color)]/20">
          <div className="flex items-center justify-between text-xs text-[var(--sub-color)] mb-2 px-2">
            <span>WPM & Raw WPM over time</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[var(--main-color)] rounded-full" />
                <span>WPM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[var(--sub-color)] rounded-full" />
                <span>Raw WPM</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={result.timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--main-color)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--main-color)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="second"
                stroke="var(--sub-color)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={val => `${val}s`}
              />
              <YAxis
                stroke="var(--sub-color)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--sub-alt-color)',
                  borderColor: 'var(--sub-color)',
                  borderRadius: '8px',
                  color: 'var(--text-color)',
                  fontSize: '12px',
                }}
                labelFormatter={val => `Second ${val}`}
                formatter={(value: any, name: any) => [
                  `${value} wpm`,
                  name === 'wpm' ? 'Net WPM' : 'Raw WPM',
                ]}
              />
              <Area
                type="monotone"
                dataKey="rawWpm"
                stroke="var(--sub-color)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="wpm"
                stroke="var(--main-color)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wpmGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quote attribution if in quote mode */}
      {result.quoteAuthor && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--sub-alt-color)]/30 text-sm text-[var(--sub-color)] text-center italic">
          — {result.quoteAuthor}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRestartSameTest}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--main-color)] text-[var(--bg-color)] font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
          title="Restart same text (Tab + Enter)"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Test</span>
        </button>

        <button
          onClick={onStartNewTest}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sub-alt-color)] text-[var(--text-color)] font-medium text-sm hover:text-[var(--main-color)] transition-all"
        >
          <span>Next Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={copySummary}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--sub-alt-color)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-sm transition-all"
          title="Copy result summary"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </button>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--sub-alt-color)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-sm transition-all"
        >
          <BarChart2 className="w-4 h-4" />
          <span>View Statistics</span>
        </button>
      </div>

      <div className="text-center mt-6 text-xs text-[var(--sub-color)] opacity-60">
        Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/30 font-mono">Tab</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/30 font-mono">Enter</kbd> to quickly restart
      </div>
    </div>
  );
};
