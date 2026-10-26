import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TestConfig,
  TestResult,
  TimelineDataPoint,
  WordItem,
  LetterData,
} from '../types';
import { generateTestWords, generateWordsText } from '../utils/textGenerator';
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  calculateCharacterStats,
} from '../utils/calculateStats';
import { playKeySound } from '../utils/audio';
import { useSettings } from '../hooks/useSettings';
import { useTestHistory } from '../hooks/useTestHistory';

export const DEFAULT_CONFIG: TestConfig = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  quoteLength: 'medium',
  punctuation: false,
  numbers: false,
};

export interface TypingTestContextType {
  config: TestConfig;
  words: WordItem[];
  quoteInfo?: { text: string; author: string };
  currentWordIndex: number;
  currentInput: string;
  isTestActive: boolean;
  isCompleted: boolean;
  timeLeft: number;
  elapsedSeconds: number;
  liveWpm: number;
  liveAcc: number;
  testResult: TestResult | null;
  changeConfig: (newConfig: Partial<TestConfig>) => void;
  initTest: (newConfig?: TestConfig) => void;
  restartTest: () => void;
  startNewTest: () => void;
  handleInputChange: (newInput: string, key: string) => void;
  handleSpacePress: () => void;
  handleBackspacePress: (isCtrlOrAlt: boolean) => void;
}

export const TypingTestContext = createContext<TypingTestContextType | undefined>(undefined);

export interface TypingTestProviderProps {
  children: React.ReactNode;
  initialConfig?: TestConfig;
}

export const TypingTestProvider: React.FC<TypingTestProviderProps> = ({
  children,
  initialConfig = DEFAULT_CONFIG,
}) => {
  const { settings } = useSettings();
  const { addResult } = useTestHistory();

  // Test configuration state
  const [config, setConfig] = useState<TestConfig>(initialConfig);

  // Typing Test Engine States
  const [words, setWords] = useState<WordItem[]>([]);
  const [quoteInfo, setQuoteInfo] = useState<{ text: string; author: string } | undefined>();
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(initialConfig.timeDuration);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAcc, setLiveAcc] = useState<number>(100);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Authoritative refs to eliminate stale closures and ensure rock-solid calculations
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

  // Authoritative completion calculation
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

    addResult(result);
    setTestResult(result);
    setIsTestActive(false);
    setIsCompleted(true);
  }, [addResult]);

  finishTestRef.current = finishTest;

  // Initialize a new test session
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

  // Initialize test on initial mount
  useEffect(() => {
    initTest();
  }, [initTest]);

  // Start the timer on first valid keypress
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
  const handleInputChange = useCallback((newInput: string, key: string) => {
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
  }, [settings.soundFeedback, settings.soundVolume, startTestTimer]);

  // Handle Space press
  const handleSpacePress = useCallback(() => {
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
  }, [settings.soundFeedback, settings.soundVolume, settings.strictMode]);

  // Handle Backspace press
  const handleBackspacePress = useCallback((isCtrlOrAlt: boolean) => {
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
  }, [settings.soundFeedback, settings.soundVolume, settings.strictMode]);

  // Configuration change
  const changeConfig = useCallback((newConfigPartial: Partial<TestConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfigPartial };
      configRef.current = updated;
      initTest(updated);
      return updated;
    });
  }, [initTest]);

  // Restart existing or start fresh
  const restartTest = useCallback(() => {
    initTest();
  }, [initTest]);

  const startNewTest = useCallback(() => {
    initTest();
  }, [initTest]);

  const value = useMemo(
    () => ({
      config,
      words,
      quoteInfo,
      currentWordIndex,
      currentInput,
      isTestActive,
      isCompleted,
      timeLeft,
      elapsedSeconds,
      liveWpm,
      liveAcc,
      testResult,
      changeConfig,
      initTest,
      restartTest,
      startNewTest,
      handleInputChange,
      handleSpacePress,
      handleBackspacePress,
    }),
    [
      config,
      words,
      quoteInfo,
      currentWordIndex,
      currentInput,
      isTestActive,
      isCompleted,
      timeLeft,
      elapsedSeconds,
      liveWpm,
      liveAcc,
      testResult,
      changeConfig,
      initTest,
      restartTest,
      startNewTest,
      handleInputChange,
      handleSpacePress,
      handleBackspacePress,
    ]
  );

  return (
    <TypingTestContext.Provider value={value}>
      {children}
    </TypingTestContext.Provider>
  );
};
