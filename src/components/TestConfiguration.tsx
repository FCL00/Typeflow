import React from 'react';
import { Clock, AlignLeft, Quote as QuoteIcon, Hash, AtSign, RotateCcw } from 'lucide-react';
import { QuoteLength, TestConfig, TestMode, TimeDuration, WordCount } from '../types';

interface TestConfigurationProps {
  config: TestConfig;
  onChangeConfig: (newConfig: Partial<TestConfig>) => void;
  onRestartTest: () => void;
  isTestActive: boolean;
}

export const TestConfiguration: React.FC<TestConfigurationProps> = ({
  config,
  onChangeConfig,
  onRestartTest,
  isTestActive,
}) => {
  return (
    <div
      className={`w-full max-w-4xl mx-auto flex items-center justify-center transition-opacity duration-200 ${
        isTestActive ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 rounded-lg bg-[var(--sub-alt-color)] text-xs text-[var(--sub-color)] font-medium select-none shadow-sm">
        
        {/* Toggle Modifiers (Punctuation & Numbers) - only for time & words modes */}
        {config.mode !== 'quote' && (
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChangeConfig({ punctuation: !config.punctuation })}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  config.punctuation
                    ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                    : 'hover:text-[var(--text-color)]'
                }`}
                title="Toggle punctuation"
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>punctuation</span>
              </button>

              <button
                onClick={() => onChangeConfig({ numbers: !config.numbers })}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  config.numbers
                    ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                    : 'hover:text-[var(--text-color)]'
                }`}
                title="Toggle numbers"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>numbers</span>
              </button>
            </div>

            <span className="text-[var(--sub-color)] opacity-30 select-none">|</span>
          </>
        )}

        {/* Mode Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeConfig({ mode: 'time' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              config.mode === 'time'
                ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                : 'hover:text-[var(--text-color)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>

          <button
            onClick={() => onChangeConfig({ mode: 'words' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              config.mode === 'words'
                ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                : 'hover:text-[var(--text-color)]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>words</span>
          </button>

          <button
            onClick={() => onChangeConfig({ mode: 'quote' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              config.mode === 'quote'
                ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                : 'hover:text-[var(--text-color)]'
            }`}
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>quote</span>
          </button>
        </div>

        <span className="text-[var(--sub-color)] opacity-30 select-none">|</span>

        {/* Dynamic Mode Sub-Options */}
        <div className="flex items-center gap-1">
          {config.mode === 'time' && (
            <>
              {([15, 30, 60, 120] as TimeDuration[]).map(duration => (
                <button
                  key={duration}
                  onClick={() => onChangeConfig({ timeDuration: duration })}
                  className={`px-2 py-1 rounded transition-colors ${
                    config.timeDuration === duration
                      ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                      : 'hover:text-[var(--text-color)]'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </>
          )}

          {config.mode === 'words' && (
            <>
              {([10, 25, 50, 100] as WordCount[]).map(count => (
                <button
                  key={count}
                  onClick={() => onChangeConfig({ wordCount: count })}
                  className={`px-2 py-1 rounded transition-colors ${
                    config.wordCount === count
                      ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                      : 'hover:text-[var(--text-color)]'
                  }`}
                >
                  {count}
                </button>
              ))}
            </>
          )}

          {config.mode === 'quote' && (
            <>
              {(['all', 'short', 'medium', 'long'] as QuoteLength[]).map(len => (
                <button
                  key={len}
                  onClick={() => onChangeConfig({ quoteLength: len })}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    config.quoteLength === len
                      ? 'text-[var(--main-color)] font-semibold bg-[var(--bg-color)]'
                      : 'hover:text-[var(--text-color)]'
                  }`}
                >
                  {len}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Quick Restart Action */}
        <div className="pl-1 flex items-center">
          <button
            onClick={onRestartTest}
            className="p-1 rounded text-[var(--sub-color)] hover:text-[var(--main-color)] transition-colors"
            title="Restart Test (Tab + Enter or Esc)"
            aria-label="Restart Test"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
