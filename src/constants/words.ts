import { Quote } from '../types';

export const COMMON_WORDS: string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for',
  'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do',
  'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who',
  'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what',
  'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new',
  'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like',
  'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think',
  'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look',
  'before', 'great', 'back', 'through', 'long', 'where', 'much', 'should', 'well',
  'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel',
  'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still',
  'nation', 'hand', 'old', 'life', 'tell', 'write', 'become', 'here', 'show',
  'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last',
  'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another',
  'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want',
  'point', 'form', 'child', 'few', 'small', 'since', 'against', 'ask', 'late',
  'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow',
  'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible',
  'head', 'consider', 'word', 'program', 'problem', 'however', 'lead', 'system',
  'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact', 'group', 'play',
  'stand', 'increase', 'early', 'course', 'change', 'help', 'line', 'city', 'put',
  'close', 'case', 'force', 'meet', 'once', 'water', 'upon', 'war', 'build',
  'hear', 'light', 'unite', 'live', 'every', 'country', 'bring', 'center', 'let',
  'side', 'try', 'provide', 'continue', 'name', 'certain', 'power', 'pay',
  'result', 'question', 'study', 'woman', 'member', 'until', 'far', 'night',
  'always', 'service', 'away', 'report', 'something', 'company', 'week', 'church',
  'toward', 'start', 'social', 'room', 'figure', 'nature', 'though', 'young',
  'less', 'enough', 'almost', 'read', 'include', 'president', 'nothing', 'yet',
  'better', 'big', 'boy', 'cost', 'business', 'value', 'second', 'why', 'clear',
  'expect', 'family', 'complete', 'act', 'sense', 'mind', 'experience', 'art',
  'next', 'near', 'direct', 'car', 'law', 'industry', 'important', 'girl', 'god',
  'several', 'matter', 'usual', 'rather', 'per', 'often', 'kind', 'among',
  'white', 'reason', 'action', 'return', 'foot', 'care', 'simple', 'within',
  'love', 'human', 'along', 'appear', 'front', 'sound', 'free', 'hope', 'century',
  'music', 'court', 'manage', 'force', 'space', 'level', 'voice', 'door', 'true'
];

export const QUOTES: Quote[] = [
  {
    id: 1,
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    length: "short"
  },
  {
    id: 2,
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    length: "short"
  },
  {
    id: 3,
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    length: "short"
  },
  {
    id: 4,
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs",
    length: "medium"
  },
  {
    id: 5,
    text: "Premature optimization is the root of all evil in programming.",
    author: "Donald Knuth",
    length: "short"
  },
  {
    id: 6,
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    length: "medium"
  },
  {
    id: 7,
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    length: "medium"
  },
  {
    id: 8,
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena.",
    author: "Theodore Roosevelt",
    length: "long"
  },
  {
    id: 9,
    text: "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.",
    author: "Robert Frost",
    length: "medium"
  },
  {
    id: 10,
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupery",
    length: "medium"
  },
  {
    id: 11,
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    length: "short"
  },
  {
    id: 12,
    text: "The future belongs to those who believe in the beauty of their dreams and work each day to realize them.",
    author: "Eleanor Roosevelt",
    length: "medium"
  },
  {
    id: 13,
    text: "Computers are incredibly fast, accurate, and stupid. Humans are incredibly slow, inaccurate, and brilliant. Together they are powerful beyond imagination.",
    author: "Albert Einstein",
    length: "long"
  },
  {
    id: 14,
    text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
    author: "Bill Gates",
    length: "medium"
  },
  {
    id: 15,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    length: "short"
  }
];
