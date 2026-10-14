import { TestResult, UserSettings } from '../types';

const SETTINGS_KEY = 'typeflow_user_settings_v1';
const HISTORY_KEY = 'typeflow_test_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  themeId: 'serika-dark',
  fontFamily: 'jetbrains',
  fontSize: 'lg',
  caretStyle: 'line',
  soundFeedback: 'off',
  soundVolume: 0.5,
  strictMode: false,
  smoothCaret: true,
  quickRestart: true,
  blindMode: false,
};

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function loadTestHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTestResult(result: TestResult): TestResult[] {
  try {
    const history = loadTestHistory();
    // Keep up to 200 recent tests
    const updated = [result, ...history].slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save test result to localStorage:', err);
    return loadTestHistory();
  }
}

export function clearTestHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear test history:', err);
  }
}

export interface UserStatsSummary {
  totalTests: number;
  personalBestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  totalTimeSeconds: number;
  testsCompletedByMode: {
    time: number;
    words: number;
    quote: number;
  };
}

export function computeStatsSummary(history: TestResult[]): UserStatsSummary {
  if (history.length === 0) {
    return {
      totalTests: 0,
      personalBestWpm: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      totalTimeSeconds: 0,
      testsCompletedByMode: { time: 0, words: 0, quote: 0 },
    };
  }

  let pb = 0;
  let totalWpm = 0;
  let totalAcc = 0;
  let totalTime = 0;
  const modeCounts = { time: 0, words: 0, quote: 0 };

  for (const item of history) {
    if (item.wpm > pb) pb = item.wpm;
    totalWpm += item.wpm;
    totalAcc += item.accuracy;
    totalTime += item.durationSeconds;
    if (modeCounts[item.mode] !== undefined) {
      modeCounts[item.mode]++;
    }
  }

  return {
    totalTests: history.length,
    personalBestWpm: pb,
    averageWpm: Math.round(totalWpm / history.length),
    averageAccuracy: Math.round((totalAcc / history.length) * 10) / 10,
    totalTimeSeconds: totalTime,
    testsCompletedByMode: modeCounts,
  };
}
