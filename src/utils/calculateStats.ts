import { TimelineDataPoint, WordItem } from '../types';

export interface CharacterStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  spacesCorrect: number;
  spacesIncorrect: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalCharacters: number;
}

/**
 * Calculates Net WPM (words per minute).
 * Convention: 5 characters per word.
 * Net WPM considers only correct characters.
 */
export function calculateNetWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const safeSeconds = Math.max(0.5, elapsedSeconds);
  const minutes = safeSeconds / 60;
  const words = correctChars / 5;
  const wpm = Math.round(words / minutes);
  return Math.max(0, wpm);
}

/**
 * Calculates Raw WPM (words per minute).
 * Raw WPM considers all valid character keystrokes typed.
 */
export function calculateRawWpm(totalKeystrokes: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || totalKeystrokes <= 0) return 0;
  const safeSeconds = Math.max(0.5, elapsedSeconds);
  const minutes = safeSeconds / 60;
  const words = totalKeystrokes / 5;
  const rawWpm = Math.round(words / minutes);
  return Math.max(0, rawWpm);
}

/**
 * Calculates Accuracy percentage (0 to 100).
 */
export function calculateAccuracy(correctChars: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  if (correctChars <= 0) return 0;
  const acc = (correctChars / totalKeystrokes) * 100;
  return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
}

/**
 * Calculates typing consistency percentage from second-by-second timeline.
 * Using 100 * (1 - Coefficient of Variation) where CV = stdev / mean.
 */
export function calculateConsistency(timeline: TimelineDataPoint[]): number {
  if (timeline.length < 2) return 100;
  
  const wpms = timeline.map(point => point.wpm).filter(w => w > 0);
  if (wpms.length < 2) return 100;

  const mean = wpms.reduce((sum, val) => sum + val, 0) / wpms.length;
  if (mean === 0) return 100;

  const variance = wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation
  const cv = stdDev / mean;
  const consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  return consistency;
}

/**
 * Ground-truth character state evaluation across all words.
 * Consistently used for both live stats and final results.
 */
export function calculateCharacterStats(
  words: WordItem[],
  currentWordIndex: number
): CharacterStats {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  let spacesCorrect = 0;
  let spacesIncorrect = 0;

  words.forEach((word, idx) => {
    if (idx < currentWordIndex) {
      // Completed word
      word.letters.forEach(letter => {
        if (letter.state === 'correct') correct++;
        else if (letter.state === 'incorrect') incorrect++;
        else if (letter.state === 'extra') extra++;
        else if (letter.state === 'untyped') missed++;
      });
      // The space entered to complete the word
      if (word.hasMistake) {
        spacesIncorrect++;
      } else {
        spacesCorrect++;
      }
    } else if (idx === currentWordIndex) {
      // Currently active word in progress
      word.letters.forEach(letter => {
        if (letter.state === 'correct') correct++;
        else if (letter.state === 'incorrect') incorrect++;
        else if (letter.state === 'extra') extra++;
        // Untyped letters in active word are in-progress, not yet missed
      });
    } else {
      // Remaining words in text
      word.letters.forEach(letter => {
        if (letter.state === 'untyped') missed++;
      });
    }
  });

  const totalCorrect = correct + spacesCorrect;
  const totalIncorrect = incorrect + extra + spacesIncorrect;
  const totalCharacters = totalCorrect + totalIncorrect;

  return {
    correct,
    incorrect,
    extra,
    missed,
    spacesCorrect,
    spacesIncorrect,
    totalCorrect,
    totalIncorrect,
    totalCharacters,
  };
}
