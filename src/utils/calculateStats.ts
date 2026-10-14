import { TimelineDataPoint } from '../types';

/**
 * Calculates Net WPM (words per minute).
 * Convention: 5 characters per word.
 * Net WPM considers only correct characters.
 */
export function calculateNetWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  const wpm = Math.round(words / minutes);
  return Math.max(0, wpm);
}

/**
 * Calculates Raw WPM (words per minute).
 * Raw WPM considers all keystrokes typed.
 */
export function calculateRawWpm(totalCharsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = totalCharsTyped / 5;
  const rawWpm = Math.round(words / minutes);
  return Math.max(0, rawWpm);
}

/**
 * Calculates Accuracy percentage (0 to 100).
 */
export function calculateAccuracy(correctChars: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
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
