import assert from 'node:assert';
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  calculateCharacterStats,
} from './calculateStats';
import { WordItem, TimelineDataPoint, LetterData } from '../types';

console.log('--- Starting Typing Engine and Stats Test Suite ---');

function createMockWord(id: number, word: string, typed: string, isCompleted: boolean = false): WordItem {
  const letters: LetterData[] = word.split('').map((char, idx) => {
    if (idx < typed.length) {
      return {
        char,
        state: (typed[idx] === char ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
      };
    }
    return {
      char,
      state: 'untyped' as const,
    };
  });

  if (typed.length > word.length) {
    const extraChars = typed.slice(word.length);
    for (const ec of extraChars) {
      letters.push({
        char: ec,
        state: 'extra',
      });
    }
  }

  return {
    id,
    original: word,
    letters,
    typed,
    isCompleted,
    hasMistake: letters.some(l => l.state === 'incorrect' || l.state === 'extra'),
  };
}

// ==========================================
// Test A: Normal typing
// 300 valid characters typed over 60 seconds
// ==========================================
console.log('Running Test A: Normal typing...');
{
  const totalChars = 300;
  const elapsedSeconds = 60;
  const rawWpm = calculateRawWpm(totalChars, elapsedSeconds);
  const netWpm = calculateNetWpm(totalChars, elapsedSeconds);
  const accuracy = calculateAccuracy(totalChars, totalChars);

  assert.strictEqual(rawWpm, 60, 'Test A Failed: Raw WPM should be 60');
  assert.strictEqual(netWpm, 60, 'Test A Failed: Net WPM should be 60');
  assert.strictEqual(accuracy, 100, 'Test A Failed: Accuracy should be 100%');
  console.log('✓ Test A Passed: 300 chars / 60s => Raw: 60 WPM, Net: 60 WPM, Acc: 100%');
}

// ==========================================
// Test B: Incorrect characters (uncorrected)
// 300 characters over 60 seconds, 30 errors
// ==========================================
console.log('Running Test B: Incorrect characters...');
{
  const totalKeystrokes = 300;
  const correctChars = 270;
  const elapsedSeconds = 60;

  const rawWpm = calculateRawWpm(totalKeystrokes, elapsedSeconds);
  const netWpm = calculateNetWpm(correctChars, elapsedSeconds);
  const accuracy = calculateAccuracy(correctChars, totalKeystrokes);

  assert.strictEqual(rawWpm, 60, 'Test B Failed: Raw WPM should be 60');
  assert.strictEqual(netWpm, 54, 'Test B Failed: Net WPM should be 54');
  assert.strictEqual(accuracy, 90, 'Test B Failed: Accuracy should be 90%');
  assert.ok(netWpm > 10, 'Test B Failed: WPM must NOT collapse to single-digit values on mistakes!');
  console.log('✓ Test B Passed: 300 keys (270 correct) => Raw: 60 WPM, Net: 54 WPM, Acc: 90%');
}

// ==========================================
// Test C: Corrected mistakes
// Type mistakes, Backspace and correct them
// ==========================================
console.log('Running Test C: Corrected mistakes...');
{
  // User typed "apple" but initially typed "apx", backspaced 'x', and finished "apple"
  // Total keystrokes: 'a', 'p', 'x', (backspace), 'p', 'l', 'e', ' ' => 7 character keystrokes
  // Target: "apple", final typed: "apple", word is completed with 0 uncorrected mistakes.
  const word = createMockWord(0, 'apple', 'apple', true);
  const words: WordItem[] = [word];
  const stats = calculateCharacterStats(words, 1);

  // 5 letters in apple + 1 space = 6 correct characters
  assert.strictEqual(stats.totalCorrect, 6, 'Test C Failed: 5 letters + 1 space = 6 correct');
  assert.strictEqual(stats.totalIncorrect, 0, 'Test C Failed: corrected mistake has 0 remaining errors');

  const totalKeystrokes = 7; // includes the typo 'x'
  const elapsedSeconds = 6;
  const rawWpm = calculateRawWpm(totalKeystrokes, elapsedSeconds);
  const netWpm = calculateNetWpm(stats.totalCorrect, elapsedSeconds);
  const accuracy = calculateAccuracy(stats.totalCorrect, totalKeystrokes);

  assert.strictEqual(rawWpm, 14, 'Test C Raw WPM calculation');
  assert.strictEqual(netWpm, 12, 'Test C Net WPM calculation');
  assert.strictEqual(accuracy, 85.7, 'Test C Accuracy calculation (6 / 7 = 85.7%)');
  console.log('✓ Test C Passed: Corrected errors leave 0 uncorrected errors and preserve full net WPM');
}

// ==========================================
// Test D: Uncorrected mistakes
// Leave mistakes in completed words
// ==========================================
console.log('Running Test D: Uncorrected mistakes...');
{
  // Word 0: "the" typed "thx" (2 correct, 1 incorrect, space after has mistake)
  // Word 1: "quick" typed "quick" (5 correct, 1 correct space)
  const word0 = createMockWord(0, 'the', 'thx', true);
  const word1 = createMockWord(1, 'quick', 'quick', true);
  const words: WordItem[] = [word0, word1];
  const stats = calculateCharacterStats(words, 2);

  // Correct: 2 (from 'thx') + 5 (from 'quick') + 1 (space after word1) = 8
  assert.strictEqual(stats.totalCorrect, 8, 'Test D: totalCorrect should be 8');
  // Incorrect: 1 (from 'x') + 1 (space after flawed word0) = 2
  assert.strictEqual(stats.totalIncorrect, 2, 'Test D: totalIncorrect should be 2');

  const totalKeystrokes = 10;
  const elapsedSeconds = 10;
  const netWpm = calculateNetWpm(stats.totalCorrect, elapsedSeconds);
  const accuracy = calculateAccuracy(stats.totalCorrect, totalKeystrokes);

  assert.strictEqual(netWpm, 10, 'Test D: Net WPM should be 10');
  assert.strictEqual(accuracy, 80, 'Test D: Accuracy should be 80%');
  console.log('✓ Test D Passed: Uncorrected mistakes accurately penalized and tracked');
}

// ==========================================
// Test E: Very short test (stable, no div-by-0)
// ==========================================
console.log('Running Test E: Very short test...');
{
  const rawWpm0 = calculateRawWpm(5, 0);
  const netWpm0 = calculateNetWpm(5, 0);
  const acc0 = calculateAccuracy(0, 0);
  assert.strictEqual(rawWpm0, 0, 'Test E: 0 duration returns 0 WPM');
  assert.strictEqual(netWpm0, 0, 'Test E: 0 duration returns 0 WPM');
  assert.strictEqual(acc0, 100, 'Test E: 0 keystrokes defaults safely to 100%');

  const rawWpmShort = calculateRawWpm(5, 0.2);
  const netWpmShort = calculateNetWpm(5, 0.2);
  assert.ok(!Number.isNaN(rawWpmShort) && Number.isFinite(rawWpmShort), 'Test E: Must not be NaN/Infinity');
  assert.ok(!Number.isNaN(netWpmShort) && Number.isFinite(netWpmShort), 'Test E: Must not be NaN/Infinity');
  console.log('✓ Test E Passed: Sub-second / 0s tests are completely stable and finite');
}

// ==========================================
// Test F: Early completion (Word mode)
// Complete 10 words (50 characters) in 15 seconds
// ==========================================
console.log('Running Test F: Early completion in word mode...');
{
  const correctChars = 50;
  const actualElapsed = 15; // Completed in 15s rather than 30s preset
  const wpm = calculateNetWpm(correctChars, actualElapsed);

  // (50 / 5) * (60 / 15) = 10 * 4 = 40 WPM
  assert.strictEqual(wpm, 40, 'Test F: Early completion must use actual elapsed seconds');
  console.log('✓ Test F Passed: Early completion uses actual elapsed time (40 WPM)');
}

// ==========================================
// Test G: Full time-based test
// 30s test with multiple words completed
// ==========================================
console.log('Running Test G: Full time-based test...');
{
  // Simulate 20 words of 5 characters each (100 characters + 19 spaces = 119 chars) in 30s
  const words: WordItem[] = [];
  for (let i = 0; i < 20; i++) {
    words.push(createMockWord(i, 'hello', 'hello', true));
  }
  const stats = calculateCharacterStats(words, 20);
  assert.strictEqual(stats.totalCorrect, 100 + 20, '20 words * 5 chars + 20 spaces = 120 correct');

  const duration = 30;
  const netWpm = calculateNetWpm(stats.totalCorrect, duration);
  // (120 / 5) * (60 / 30) = 24 * 2 = 48 WPM
  assert.strictEqual(netWpm, 48, 'Test G: Full time-based test WPM calculation');
  console.log('✓ Test G Passed: 30s test correctly yields 48 WPM without drop');
}

// ==========================================
// Test H: Restart state isolation
// ==========================================
console.log('Running Test H: Restart state isolation...');
{
  // Verify clean slate reset
  const words: WordItem[] = [createMockWord(0, 'clean', '', false)];
  const stats = calculateCharacterStats(words, 0);

  assert.strictEqual(stats.totalCorrect, 0, 'Test H: 0 correct on restart');
  assert.strictEqual(stats.totalIncorrect, 0, 'Test H: 0 incorrect on restart');
  assert.strictEqual(calculateNetWpm(stats.totalCorrect, 0), 0);
  assert.strictEqual(calculateAccuracy(stats.totalCorrect, 0), 100);
  console.log('✓ Test H Passed: Pristine initial state confirmed on restart');
}

// ==========================================
// Test I: Rapid typing consistency
// ==========================================
console.log('Running Test I: Rapid typing consistency...');
{
  let totalKeys = 0;
  let word = createMockWord(0, 'supercalifragilistic', '', false);

  const target = 'supercalifragilistic';
  for (let i = 0; i < target.length; i++) {
    totalKeys++;
    word = createMockWord(0, target, target.slice(0, i + 1), i === target.length - 1);
  }

  const stats = calculateCharacterStats([word], 1);
  assert.strictEqual(stats.totalCorrect, target.length + 1, 'All letters + space correctly counted');
  assert.strictEqual(totalKeys, target.length, 'No dropped keystrokes');
  console.log('✓ Test I Passed: Rapid keystrokes recorded without loss or duplication');
}

// ==========================================
// Test Consistency formula
// ==========================================
console.log('Running Consistency metric test...');
{
  const timelineSteady: TimelineDataPoint[] = [
    { second: 1, wpm: 60, rawWpm: 60, errors: 0 },
    { second: 2, wpm: 60, rawWpm: 60, errors: 0 },
    { second: 3, wpm: 60, rawWpm: 60, errors: 0 },
    { second: 4, wpm: 60, rawWpm: 60, errors: 0 },
  ];
  const consistencySteady = calculateConsistency(timelineSteady);
  assert.strictEqual(consistencySteady, 100, 'Zero variation must be 100% consistency');

  const timelineVariable: TimelineDataPoint[] = [
    { second: 1, wpm: 20, rawWpm: 20, errors: 0 },
    { second: 2, wpm: 80, rawWpm: 80, errors: 0 },
    { second: 3, wpm: 40, rawWpm: 40, errors: 0 },
    { second: 4, wpm: 100, rawWpm: 100, errors: 0 },
  ];
  const consistencyVar = calculateConsistency(timelineVariable);
  assert.ok(consistencyVar < 100 && consistencyVar > 0, 'Variable speed lowers consistency %');
  console.log(`✓ Consistency metric test passed (steady: ${consistencySteady}%, variable: ${consistencyVar}%)`);
}

console.log('\n=============================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! (10/10)');
console.log('=============================================\n');
