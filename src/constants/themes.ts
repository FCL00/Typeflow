import { ThemeColors } from '../types';

export const THEMES: ThemeColors[] = [
  {
    id: 'serika-dark',
    name: 'Serika Dark',
    bg: '#323437',
    main: '#e2b714',
    caret: '#e2b714',
    sub: '#646669',
    subAlt: '#2c2e31',
    text: '#d1d0c5',
    error: '#ca4754',
    errorExtra: '#7e2a33',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    bg: '#161616',
    main: '#f6a623',
    caret: '#f6a623',
    sub: '#525252',
    subAlt: '#222222',
    text: '#f4f4f4',
    error: '#da3633',
    errorExtra: '#8b1e1d',
  },
  {
    id: 'nord',
    name: 'Nord',
    bg: '#242933',
    main: '#88c0d0',
    caret: '#88c0d0',
    sub: '#4c566a',
    subAlt: '#1e222a',
    text: '#eceff4',
    error: '#bf616a',
    errorExtra: '#7a3e44',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    main: '#bd93f9',
    caret: '#ff79c6',
    sub: '#6272a4',
    subAlt: '#1f2029',
    text: '#f8f8f2',
    error: '#ff5555',
    errorExtra: '#992222',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    bg: '#0d1117',
    main: '#3fb950',
    caret: '#3fb950',
    sub: '#484f58',
    subAlt: '#161b22',
    text: '#7ee787',
    error: '#f85149',
    errorExtra: '#851a15',
  },
  {
    id: 'taro',
    name: 'Taro',
    bg: '#13131e',
    main: '#a39ec4',
    caret: '#ffe3eb',
    sub: '#6f6a8e',
    subAlt: '#1b1b2a',
    text: '#b3baff',
    error: '#ff6e6e',
    errorExtra: '#aa3333',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#090a0f',
    main: '#00adb5',
    caret: '#00adb5',
    sub: '#393e46',
    subAlt: '#141720',
    text: '#eeeeee',
    error: '#ff2e63',
    errorExtra: '#991533',
  },
  {
    id: 'paper-light',
    name: 'Paper Light',
    bg: '#f7f7f5',
    main: '#d97706',
    caret: '#d97706',
    sub: '#9ca3af',
    subAlt: '#e5e7eb',
    text: '#1f2937',
    error: '#dc2626',
    errorExtra: '#991b1b',
  },
];

export const DEFAULT_THEME = THEMES[0];

export function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--bg-color', theme.bg);
  root.style.setProperty('--main-color', theme.main);
  root.style.setProperty('--caret-color', theme.caret);
  root.style.setProperty('--sub-color', theme.sub);
  root.style.setProperty('--sub-alt-color', theme.subAlt);
  root.style.setProperty('--text-color', theme.text);
  root.style.setProperty('--error-color', theme.error);
  root.style.setProperty('--error-extra-color', theme.errorExtra);
}
