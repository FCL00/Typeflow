export type TestMode = 'time' | 'words' | 'quote';

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type QuoteLength = 'all' | 'short' | 'medium' | 'long';

export interface TestConfig {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
}

export type CaretStyle = 'line' | 'underline' | 'block' | 'outline' | 'off';

export type SoundFeedback = 'off' | 'mechanical' | 'pop' | 'typewriter' | 'beep';

export type FontFamily = 'jetbrains' | 'plusjakarta' | 'spacemono' | 'sourcecode';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface UserSettings {
  themeId: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  caretStyle: CaretStyle;
  soundFeedback: SoundFeedback;
  soundVolume: number; // 0 to 1
  strictMode: boolean; // cannot proceed past errors without fixing
  smoothCaret: boolean;
  quickRestart: boolean;
  blindMode: boolean; // hides correct/incorrect while typing
}

export interface LetterData {
  char: string;
  state: 'untyped' | 'correct' | 'incorrect' | 'extra';
}

export interface WordItem {
  id: number;
  original: string;
  letters: LetterData[];
  typed: string;
  isCompleted: boolean;
  hasMistake: boolean;
}

export interface TimelineDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  durationSeconds: number;
  mode: TestMode;
  configSummary: string;
  quoteAuthor?: string;
  characters: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
    total: number;
  };
  timeline: TimelineDataPoint[];
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  length: 'short' | 'medium' | 'long';
}

export interface ThemeColors {
  id: string;
  name: string;
  bg: string;
  main: string;
  caret: string;
  sub: string;
  subAlt: string;
  text: string;
  error: string;
  errorExtra: string;
}
