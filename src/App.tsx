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
  calculateCharacterStats,
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

  // Refs for real-time tracking (authoritative ground truth to eliminate stale closures)
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<TimelineDataPoint[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalKeystrokesRef = useRef<number>(0);
  const wordsRef = useRef<WordItem[]>([]);
  const currentWordIndexRef = useRef<number>(0);
  const currentInputRef = useRef<string>('');
  const isTestActiveRef = useRef<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);
  const configRef = useRef<TestConfig>(config);
  configRef.current = config;
  const quoteInfoRef = useRef<{ text: string; author: string } | undefined>(undefined);
  const finishTestRef = useRef<() => void>(() => {});

  // Finish Test Helper (authoritative completion calculation)
  const finishTest = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    isTestActiveRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const currentConfig = configRef.current;
    const now = Date.now();
    endTimeRef.current = now;

    let duration: number;
    if (currentConfig.mode === 'time') {
      duration = currentConfig.timeDuration;
    } else {
      const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 1;
      duration = Math.max(0.5, Math.round(elapsed * 10) / 10);
    }

    // Ground-truth character state evaluation across all words
    const currentWords = wordsRef.current;
    const currentIdx = currentWordIndexRef.current;
    const stats = calculateCharacterStats(currentWords, currentIdx);

    const totalKeystrokes = Math.max(stats.totalCharacters, totalKeystrokesRef.current);
    const finalWpm = calculateNetWpm(stats.totalCorrect, duration);
    const finalRawWpm = calculateRawWpm(totalKeystrokes, duration);
    const finalAcc = calculateAccuracy(stats.totalCorrect, totalKeystrokes);
    const finalConsistency = calculateConsistency(timelineRef.current);

    let configSummary = '';
    if (currentConfig.mode === 'time') {
      configSummary = `time ${currentConfig.timeDuration}s`;
    } else if (currentConfig.mode === 'words') {
      configSummary = `words ${currentConfig.wordCount}`;
    } else {
      configSummary = `quote ${currentConfig.quoteLength}`;
    }
    if (currentConfig.punctuation) configSummary += ' +punc';
    if (currentConfig.numbers) configSummary += ' +num';

    const result: TestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      consistency: finalConsistency,
      durationSeconds: duration,
      mode: currentConfig.mode,
      configSummary,
      quoteAuthor: quoteInfoRef.current?.author,
      characters: {
        correct: stats.totalCorrect,
        incorrect: stats.totalIncorrect,
        extra: stats.extra,
        missed: stats.missed,
        total: totalKeystrokes,
      },
      timeline: timelineRef.current,
    };

    const updatedHistory = saveTestResult(result);
    setHistory(updatedHistory);
    setTestResult(result);
    setIsTestActive(false);
    setIsCompleted(true);
  }, []);

  finishTestRef.current = finishTest;

  // Initialize a new test
  const initTest = useCallback((newConfig?: TestConfig) => {
    const activeConfig = newConfig || configRef.current;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const generated = generateTestWords(activeConfig);
    wordsRef.current = generated.words;
    currentWordIndexRef.current = 0;
    currentInputRef.current = '';
    isTestActiveRef.current = false;
    isCompletedRef.current = false;
    startTimeRef.current = null;
    endTimeRef.current = null;
    totalKeystrokesRef.current = 0;
    timelineRef.current = [];
    quoteInfoRef.current = generated.quoteInfo;

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
  }, []);

  // Initialize on mount
  useEffect(() => {
    initTest();
  }, [initTest]);

  // Start Test Timer
  const startTestTimer = useCallback(() => {
    if (isTestActiveRef.current || isCompletedRef.current) return;
    startTimeRef.current = Date.now();
    isTestActiveRef.current = true;
    setIsTestActive(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    timerIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current || isCompletedRef.current) return;

      const now = Date.now();
      const currentElapsed = Math.max(1, Math.round((now - startTimeRef.current) / 1000));
      setElapsedSeconds(currentElapsed);

      const currentConfig = configRef.current;

      // Time mode countdown
      if (currentConfig.mode === 'time') {
        const remaining = Math.max(0, currentConfig.timeDuration - currentElapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          finishTestRef.current();
          return;
        }
      }

      // Calculate live metrics using identical authoritative formula
      const stats = calculateCharacterStats(
        wordsRef.current,
        currentWordIndexRef.current
      );
      const totalKeys = Math.max(stats.totalCharacters, totalKeystrokesRef.current);
      const currentWpm = calculateNetWpm(stats.totalCorrect, currentElapsed);
      const currentRawWpm = calculateRawWpm(totalKeys, currentElapsed);
      const currentAcc = calculateAccuracy(stats.totalCorrect, totalKeys);

      setLiveWpm(currentWpm);
      setLiveAcc(currentAcc);

      timelineRef.current.push({
        second: currentElapsed,
        wpm: currentWpm,
        rawWpm: currentRawWpm,
        errors: stats.totalIncorrect,
      });
    }, 1000);
  }, []);

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
    if (isCompletedRef.current) return;

    // Start timer on first valid character
    if (!isTestActiveRef.current) {
      startTestTimer();
    }

    const currentIdx = currentWordIndexRef.current;
    const currentWord = wordsRef.current[currentIdx];
    if (!currentWord) return;

    totalKeystrokesRef.current += 1;

    // Evaluate typed character
    const charIndex = newInput.length - 1;
    let isCorrect = false;

    if (charIndex < currentWord.original.length) {
      isCorrect = newInput[charIndex] === currentWord.original[charIndex];
    } else {
      isCorrect = false; // extra character
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

    const updatedWord: WordItem = {
      ...currentWord,
      letters: updatedLetters,
      typed: newInput,
      hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
    };

    const newWords = [...wordsRef.current];
    newWords[currentIdx] = updatedWord;
    wordsRef.current = newWords;
    currentInputRef.current = newInput;

    setWords(newWords);
    setCurrentInput(newInput);

    // Update live metrics immediately on keystroke
    const elapsed = startTimeRef.current
      ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
      : 1;
    const stats = calculateCharacterStats(newWords, currentIdx);
    const totalKeys = Math.max(stats.totalCharacters, totalKeystrokesRef.current);
    setLiveWpm(calculateNetWpm(stats.totalCorrect, elapsed));
    setLiveAcc(calculateAccuracy(stats.totalCorrect, totalKeys));
  };

  // Handle Space press
  const handleSpacePress = () => {
    if (isCompletedRef.current || currentInputRef.current.length === 0) return;

    const currentIdx = currentWordIndexRef.current;
    const currentWord = wordsRef.current[currentIdx];
    if (!currentWord) return;

    // Strict mode check: cannot proceed if errors exist
    if (settings.strictMode && currentWord.hasMistake) {
      playKeySound(settings.soundFeedback, settings.soundVolume, true);
      return;
    }

    // Space counts as a valid keystroke
    totalKeystrokesRef.current += 1;

    // Mark untyped letters in current word as missed/incorrect
    const updatedLetters = currentWord.letters.map(letter => {
      if (letter.state === 'untyped') {
        return { ...letter, state: 'incorrect' as const };
      }
      return letter;
    });

    const completedWord: WordItem = {
      ...currentWord,
      letters: updatedLetters,
      isCompleted: true,
      hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
    };

    const newWords = [...wordsRef.current];
    newWords[currentIdx] = completedWord;
    wordsRef.current = newWords;

    playKeySound(settings.soundFeedback, settings.soundVolume, false);

    // Check if test completed (words or quote mode)
    if (currentIdx >= wordsRef.current.length - 1) {
      currentWordIndexRef.current = currentIdx + 1;
      currentInputRef.current = '';
      setWords(newWords);
      setCurrentInput('');
      finishTestRef.current();
      return;
    }

    // Move to next word
    const nextIndex = currentIdx + 1;
    currentWordIndexRef.current = nextIndex;
    currentInputRef.current = '';

    // If time mode and nearing end of word list, dynamically append more words
    if (configRef.current.mode === 'time' && newWords.length - nextIndex <= 10) {
      const extraRaw = generateWordsText(30, configRef.current.punctuation, configRef.current.numbers);
      const extraItems: WordItem[] = extraRaw.map((w, idx) => ({
        id: newWords.length + idx,
        original: w,
        letters: w.split('').map(char => ({ char, state: 'untyped' as const })),
        typed: '',
        isCompleted: false,
        hasMistake: false,
      }));
      newWords.push(...extraItems);
      wordsRef.current = newWords;
    }

    setWords(newWords);
    setCurrentWordIndex(nextIndex);
    setCurrentInput('');
  };

  // Handle Backspace press
  const handleBackspacePress = (isCtrlOrAlt: boolean) => {
    if (isCompletedRef.current) return;

    const currentInput = currentInputRef.current;
    const currentIdx = currentWordIndexRef.current;

    if (currentInput.length > 0) {
      const newInput = isCtrlOrAlt ? '' : currentInput.slice(0, -1);
      const currentWord = wordsRef.current[currentIdx];
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

      const updatedWord: WordItem = {
        ...currentWord,
        letters: updatedLetters,
        typed: newInput,
        hasMistake: updatedLetters.some(l => l.state === 'incorrect' || l.state === 'extra'),
      };

      const newWords = [...wordsRef.current];
      newWords[currentIdx] = updatedWord;
      wordsRef.current = newWords;
      currentInputRef.current = newInput;

      setWords(newWords);
      setCurrentInput(newInput);
      playKeySound(settings.soundFeedback, settings.soundVolume, false);

      // Recalculate live metrics
      const elapsed = startTimeRef.current
        ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
        : 1;
      const stats = calculateCharacterStats(newWords, currentIdx);
      const totalKeys = Math.max(stats.totalCharacters, totalKeystrokesRef.current);
      setLiveWpm(calculateNetWpm(stats.totalCorrect, elapsed));
      setLiveAcc(calculateAccuracy(stats.totalCorrect, totalKeys));
    } else if (currentIdx > 0 && !settings.strictMode) {
      // Step back to previous word if not in strict mode
      const prevWordIndex = currentIdx - 1;
      const prevWord = wordsRef.current[prevWordIndex];
      if (prevWord) {
        currentWordIndexRef.current = prevWordIndex;
        currentInputRef.current = prevWord.typed;
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
