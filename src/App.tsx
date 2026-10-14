/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TestConfiguration } from './components/TestConfiguration';
import { LiveStatistics } from './components/LiveStatistics';
import { TypingArea } from './components/TypingArea';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryStatsView } from './components/HistoryStatsView';
import { SettingsView } from './components/SettingsView';
import { THEMES, DEFAULT_THEME, applyTheme } from './constants/themes';
import {
  TestConfig,
  TestResult,
  TimelineDataPoint,
  UserSettings,
  WordItem,
  ThemeColors,
  LetterData,
} from './types';
import { generateTestWords, generateWordsText } from './utils/textGenerator';
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
} from './utils/calculateStats';
import {
  loadUserSettings,
  saveUserSettings,
  loadTestHistory,
  saveTestResult,
} from './utils/storage';
import { playKeySound } from './utils/audio';

const DEFAULT_CONFIG: TestConfig = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  quoteLength: 'medium',
  punctuation: false,
  numbers: false,
};

export default function App() {
  // Navigation & Settings
  const [activeView, setActiveView] = useState<'test' | 'history' | 'settings'>('test');
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());
  const [history, setHistory] = useState<TestResult[]>(() => loadTestHistory());
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);

  // Active theme
  const currentTheme = THEMES.find(t => t.id === settings.themeId) || DEFAULT_THEME;

  // Apply theme to DOM on mount and settings change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Typing Test Engine States
  const [words, setWords] = useState<WordItem[]>([]);
  const [quoteInfo, setQuoteInfo] = useState<{ text: string; author: string } | undefined>();
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(config.timeDuration);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAcc, setLiveAcc] = useState<number>(100);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Refs for real-time tracking
  const startTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<TimelineDataPoint[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalKeystrokesRef = useRef<number>(0);
  const correctKeystrokesRef = useRef<number>(0);
  const wordsRef = useRef<WordItem[]>([]);
  wordsRef.current = words;

  // Initialize a new test
  const initTest = useCallback((newConfig?: TestConfig) => {
    const activeConfig = newConfig || config;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const generated = generateTestWords(activeConfig);
    setWords(generated.words);
    setQuoteInfo(generated.quoteInfo);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setIsTestActive(false);
    setIsCompleted(false);
    setTimeLeft(activeConfig.timeDuration);
    setElapsedSeconds(0);
    setLiveWpm(0);
    setLiveAcc(100);
    setTestResult(null);

    startTimeRef.current = null;
    timelineRef.current = [];
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
  }, [config]);

  // Initialize on mount
  useEffect(() => {
    initTest();
  }, [initTest]);

  // Finish Test Helper
  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration = config.mode === 'time'
      ? config.timeDuration
      : Math.max(1, elapsedSeconds);

    // Calculate characters breakdown
    let correctCount = 0;
    let incorrectCount = 0;
    let extraCount = 0;
    let missedCount = 0;

    wordsRef.current.forEach((word, idx) => {
      if (idx <= currentWordIndex) {
        word.letters.forEach(letter => {
          if (letter.state === 'correct') correctCount++;
          else if (letter.state === 'incorrect') incorrectCount++;
          else if (letter.state === 'extra') extraCount++;
          else if (letter.state === 'untyped') missedCount++;
        });
      }
    });

    const totalChars = correctCount + incorrectCount + extraCount;
    const finalWpm = calculateNetWpm(correctCount, duration);
    const finalRawWpm = calculateRawWpm(totalKeystrokesRef.current, duration);
    const finalAcc = calculateAccuracy(correctCount, totalKeystrokesRef.current);
    const finalConsistency = calculateConsistency(timelineRef.current);

    let configSummary = '';
    if (config.mode === 'time') {
      configSummary = `time ${config.timeDuration}s`;
    } else if (config.mode === 'words') {
      configSummary = `words ${config.wordCount}`;
    } else {
      configSummary = `quote ${config.quoteLength}`;
    }
    if (config.punctuation) configSummary += ' +punc';
    if (config.numbers) configSummary += ' +num';

    const result: TestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      consistency: finalConsistency,
      durationSeconds: duration,
      mode: config.mode,
      configSummary,
      quoteAuthor: quoteInfo?.author,
      characters: {
        correct: correctCount,
        incorrect: incorrectCount,
        extra: extraCount,
        missed: missedCount,
        total: totalChars,
      },
      timeline: timelineRef.current,
    };

    const updatedHistory = saveTestResult(result);
    setHistory(updatedHistory);
    setTestResult(result);
    setIsTestActive(false);
    setIsCompleted(true);
  }, [config, elapsedSeconds, currentWordIndex, quoteInfo]);

  // Start Test Timer
  const startTestTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsTestActive(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(prevElapsed => {
        const nextElapsed = prevElapsed + 1;

        // Current live values
        const currentCorrect = correctKeystrokesRef.current;
        const currentTotal = totalKeystrokesRef.current;
        const currentWpm = calculateNetWpm(currentCorrect, nextElapsed);
        const currentRawWpm = calculateRawWpm(currentTotal, nextElapsed);
        const currentAcc = calculateAccuracy(currentCorrect, currentTotal);

        setLiveWpm(currentWpm);
        setLiveAcc(currentAcc);

        // Record timeline point
        timelineRef.current.push({
          second: nextElapsed,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          errors: currentTotal - currentCorrect,
        });

        // Time mode countdown
        if (config.mode === 'time') {
          setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              finishTest();
              return 0;
            }
            return prevTime - 1;
          });
        }

        return nextElapsed;
      });
    }, 1000);
  }, [config.mode, finishTest]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle character input
  const handleInputChange = (newInput: string, key: string) => {
    if (isCompleted) return;

    // Start timer on first valid character
    if (!isTestActive) {
      startTestTimer();
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    totalKeystrokesRef.current += 1;

    // Evaluate typed character
    const charIndex = newInput.length - 1;
    let isCorrect = false;

    if (charIndex < currentWord.original.length) {
      isCorrect = newInput[charIndex] === currentWord.original[charIndex];
    } else {
      isCorrect = false; // extra character is considered incorrect
    }

    if (isCorrect) {
      correctKeystrokesRef.current += 1;
    }

    // Play feedback sound
    playKeySound(settings.soundFeedback, settings.soundVolume, !isCorrect);

    // Update word letters structure
    const updatedLetters: LetterData[] = currentWord.original.split('').map((char, idx) => {
      if (idx < newInput.length) {
        return {
          char,
          state: (newInput[idx] === char ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
        };
      }
      return {
        char,
        state: 'untyped' as const,
      };
    });

    // Handle extra characters
    if (newInput.length > currentWord.original.length) {
      const extraChars = newInput.slice(currentWord.original.length);
      for (const extraChar of extraChars) {
        updatedLetters.push({
          char: extraChar,
          state: 'extra',
        });
      }
    }

    // Update words state
    setWords(prevWords => {
      const newWords = [...prevWords];
      newWords[currentWordIndex] = {
        ...currentWord,
        letters: updatedLetters,
        typed: newInput,
        hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
      };
      return newWords;
    });

    setCurrentInput(newInput);

    // Update live metrics
    const elapsed = Math.max(1, elapsedSeconds);
    setLiveWpm(calculateNetWpm(correctKeystrokesRef.current, elapsed));
    setLiveAcc(calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current));
  };

  // Handle Space press
  const handleSpacePress = () => {
    if (isCompleted || currentInput.length === 0) return;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Strict mode check: cannot proceed if errors exist
    if (settings.strictMode && currentWord.hasMistake) {
      playKeySound(settings.soundFeedback, settings.soundVolume, true);
      return;
    }

    // Mark current word as completed
    const updatedLetters = currentWord.letters.map(letter => {
      if (letter.state === 'untyped') {
        return { ...letter, state: 'incorrect' as const };
      }
      return letter;
    });

    setWords(prevWords => {
      const newWords = [...prevWords];
      newWords[currentWordIndex] = {
        ...currentWord,
        letters: updatedLetters,
        isCompleted: true,
        hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
      };
      return newWords;
    });

    playKeySound(settings.soundFeedback, settings.soundVolume, false);

    // Check if test completed (words or quote mode)
    if (currentWordIndex >= words.length - 1) {
      finishTest();
      return;
    }

    // Move to next word
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setCurrentInput('');

    // If time mode and nearing end of word list, dynamically append more words
    if (config.mode === 'time' && words.length - nextIndex <= 10) {
      const extraRaw = generateWordsText(30, config.punctuation, config.numbers);
      const extraItems: WordItem[] = extraRaw.map((w, idx) => ({
        id: words.length + idx,
        original: w,
        letters: w.split('').map(char => ({ char, state: 'untyped' as const })),
        typed: '',
        isCompleted: false,
        hasMistake: false,
      }));
      setWords(prev => [...prev, ...extraItems]);
    }
  };

  // Handle Backspace press
  const handleBackspacePress = (isCtrlOrAlt: boolean) => {
    if (isCompleted) return;

    if (currentInput.length > 0) {
      const newInput = isCtrlOrAlt ? '' : currentInput.slice(0, -1);
      const currentWord = words[currentWordIndex];
      if (!currentWord) return;

      const updatedLetters: LetterData[] = currentWord.original.split('').map((char, idx) => {
        if (idx < newInput.length) {
          return {
            char,
            state: (newInput[idx] === char ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
          };
        }
        return {
          char,
          state: 'untyped' as const,
        };
      });

      // Extra chars if any
      if (newInput.length > currentWord.original.length) {
        const extraChars = newInput.slice(currentWord.original.length);
        for (const extraChar of extraChars) {
          updatedLetters.push({
            char: extraChar,
            state: 'extra',
          });
        }
      }

      setWords(prevWords => {
        const newWords = [...prevWords];
        newWords[currentWordIndex] = {
          ...currentWord,
          letters: updatedLetters,
          typed: newInput,
          hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
        };
        return newWords;
      });

      setCurrentInput(newInput);
      playKeySound(settings.soundFeedback, settings.soundVolume, false);
    } else if (currentWordIndex > 0 && !settings.strictMode) {
      // Step back to previous word if not in strict mode
      const prevWordIndex = currentWordIndex - 1;
      const prevWord = words[prevWordIndex];
      if (prevWord) {
        setCurrentWordIndex(prevWordIndex);
        setCurrentInput(prevWord.typed);
        playKeySound(settings.soundFeedback, settings.soundVolume, false);
      }
    }
  };

  // Configuration change
  const handleChangeConfig = (newConfigPartial: Partial<TestConfig>) => {
    const updated = { ...config, ...newConfigPartial };
    setConfig(updated);
    initTest(updated);
  };

  // Update Settings
  const handleUpdateSettings = (newSettingsPartial: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettingsPartial };
    setSettings(updated);
    saveUserSettings(updated);
  };

  // Theme selection
  const handleSelectTheme = (theme: ThemeColors) => {
    handleUpdateSettings({ themeId: theme.id });
    applyTheme(theme);
  };

  // Restart handler
  const handleRestartTest = () => {
    initTest();
  };

  // Global restart keyboard shortcut listener (Tab+Enter, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeView !== 'test') {
          setActiveView('test');
        } else {
          handleRestartTest();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col justify-between selection:bg-[var(--main-color)] selection:text-[var(--bg-color)] transition-colors duration-200">
      {/* Header */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        activeView={activeView}
        onNavigate={view => {
          if (isTestActive) {
            handleRestartTest();
          }
          setActiveView(view);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 w-full">
        {activeView === 'history' && (
          <HistoryStatsView
            history={history}
            onBackToTest={() => setActiveView('test')}
            onClearHistory={() => setHistory([])}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSelectTheme={handleSelectTheme}
            onBackToTest={() => setActiveView('test')}
          />
        )}

        {activeView === 'test' && (
          <>
            {isCompleted && testResult ? (
              <ResultsScreen
                result={testResult}
                onRestartSameTest={handleRestartTest}
                onStartNewTest={() => initTest()}
                onViewHistory={() => setActiveView('history')}
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-6">
                {/* Test Configuration Toolbar */}
                <TestConfiguration
                  config={config}
                  onChangeConfig={handleChangeConfig}
                  onRestartTest={handleRestartTest}
                  isTestActive={isTestActive}
                />

                {/* Live Statistics Row */}
                <LiveStatistics
                  config={config}
                  isTestActive={isTestActive}
                  timeLeft={timeLeft}
                  completedWords={currentWordIndex}
                  totalWords={words.length}
                  liveWpm={liveWpm}
                  liveAcc={liveAcc}
                  quoteAuthor={quoteInfo?.author}
                />

                {/* Main Typing Canvas */}
                <TypingArea
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentInput={currentInput}
                  onInputChange={handleInputChange}
                  onSpacePress={handleSpacePress}
                  onBackspacePress={handleBackspacePress}
                  onRestartTest={handleRestartTest}
                  settings={settings}
                  isTestActive={isTestActive}
                  isCompleted={isCompleted}
                />

                {/* Footer shortcut helper hint */}
                <div className="flex items-center gap-4 text-xs text-[var(--sub-color)] font-sans opacity-60 transition-opacity hover:opacity-100">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Tab</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Enter</kbd> to restart test
                  </span>
                  <span>·</span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Esc</kbd> to restart
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--sub-color)] gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('test')}
            className="hover:text-[var(--text-color)] transition-colors"
          >
            Practice
          </button>
          <span>·</span>
          <button
            onClick={() => setActiveView('history')}
            className="hover:text-[var(--text-color)] transition-colors"
          >
            Statistics
          </button>
          <span>·</span>
          <button
            onClick={() => setActiveView('settings')}
            className="hover:text-[var(--text-color)] transition-colors"
          >
            Settings
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>Typeflow</span>
          <span>·</span>
          <span className="text-[var(--main-color)] font-medium">Fast & Minimalist</span>
        </div>
      </footer>
    </div>
  );
}
