import { COMMON_WORDS, QUOTES } from '../constants/words';
import { Quote, TestConfig, WordItem } from '../types';

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateWordsText(
  count: number,
  includePunctuation: boolean,
  includeNumbers: boolean
): string[] {
  const words: string[] = [];
  const punctuationMarks = ['.', ',', '!', '?', ';', ':'];
  
  for (let i = 0; i < count; i++) {
    // 10% chance of a number if enabled
    if (includeNumbers && Math.random() < 0.12) {
      const num = Math.random() < 0.6 
        ? Math.floor(Math.random() * 100).toString() 
        : (1970 + Math.floor(Math.random() * 60)).toString();
      words.push(num);
      continue;
    }

    let word = getRandomElement(COMMON_WORDS);

    // Apply punctuation if enabled
    if (includePunctuation) {
      // 15% chance to capitalize
      if (i === 0 || Math.random() < 0.15) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      // 15% chance of suffix punctuation
      if (Math.random() < 0.15) {
        const mark = getRandomElement(punctuationMarks);
        word += mark;
      }
      // 4% chance of quotes
      else if (Math.random() < 0.04) {
        word = `"${word}"`;
      }
    }

    words.push(word);
  }

  return words;
}

export function getQuoteForConfig(length: 'all' | 'short' | 'medium' | 'long'): Quote {
  let filtered = QUOTES;
  if (length !== 'all') {
    filtered = QUOTES.filter(q => q.length === length);
  }
  if (filtered.length === 0) filtered = QUOTES;
  return getRandomElement(filtered);
}

export function generateTestWords(config: TestConfig): { words: WordItem[]; quoteInfo?: { text: string; author: string } } {
  let rawWords: string[] = [];
  let quoteInfo: { text: string; author: string } | undefined;

  if (config.mode === 'quote') {
    const quote = getQuoteForConfig(config.quoteLength);
    quoteInfo = { text: quote.text, author: quote.author };
    rawWords = quote.text.trim().split(/\s+/);
  } else if (config.mode === 'words') {
    rawWords = generateWordsText(config.wordCount, config.punctuation, config.numbers);
  } else {
    // Time mode: provide sufficient buffer for fast typers (up to 180 words, appends seamlessly if needed)
    const wordCount = config.timeDuration <= 15 ? 50 : config.timeDuration <= 30 ? 90 : 180;
    rawWords = generateWordsText(wordCount, config.punctuation, config.numbers);
  }

  const wordItems: WordItem[] = rawWords.map((word, index) => ({
    id: index,
    original: word,
    letters: word.split('').map(char => ({
      char,
      state: 'untyped'
    })),
    typed: '',
    isCompleted: false,
    hasMistake: false,
  }));

  return { words: wordItems, quoteInfo };
}
