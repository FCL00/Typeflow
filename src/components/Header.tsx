import React from 'react';
import { Keyboard, BarChart3, Settings, Moon, Sun, Palette } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { ThemeColors } from '../types';

interface HeaderProps {
  currentTheme: ThemeColors;
  onSelectTheme: (theme: ThemeColors) => void;
  activeView: 'test' | 'history' | 'settings';
  onNavigate: (view: 'test' | 'history' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onSelectTheme,
  activeView,
  onNavigate,
}) => {
  const isLight = currentTheme.id === 'paper-light' || currentTheme.id === 'light';

  const toggleQuickTheme = () => {
    if (isLight) {
      const darkTheme = THEMES.find(t => t.id === 'serika-dark') || THEMES[0];
      onSelectTheme(darkTheme);
    } else {
      const lightTheme = THEMES.find(t => t.id === 'paper-light') || THEMES[0];
      onSelectTheme(lightTheme);
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between gap-8">
      {/* Zone 1: Wordmark brand */}
      <button
        onClick={() => onNavigate('test')}
        className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--main-color)] rounded-md px-1"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--sub-alt-color)] text-[var(--main-color)] transition-transform group-hover:scale-105">
          <Keyboard className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors whitespace-nowrap">
            typeflow
          </span>
        </div>
      </button>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-[var(--sub-color)]">
        <button
          onClick={() => onNavigate('test')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[var(--text-color)] ${
            activeView === 'test' ? 'text-[var(--main-color)] font-semibold' : ''
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Test</span>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[var(--text-color)] ${
            activeView === 'history' ? 'text-[var(--main-color)] font-semibold' : ''
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statistics</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[var(--text-color)] ${
            activeView === 'settings' ? 'text-[var(--main-color)] font-semibold' : ''
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Zone 3: Quick theme switcher & controls */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative group">
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[var(--sub-alt-color)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors"
            title="Current theme"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span className="hidden sm:inline whitespace-nowrap">{currentTheme.name}</span>
          </button>
        </div>

        <button
          onClick={toggleQuickTheme}
          className="p-1.5 rounded-md text-[var(--sub-color)] hover:text-[var(--main-color)] hover:bg-[var(--sub-alt-color)] transition-colors"
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle light/dark theme"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
