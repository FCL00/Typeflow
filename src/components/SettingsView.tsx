import React from 'react';
import { ArrowLeft, RotateCcw, Volume2, Type, Eye, Palette, Check } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { CaretStyle, FontFamily, FontSize, SoundFeedback, ThemeColors, UserSettings } from '../types';
import { playKeySound } from '../utils/audio';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSelectTheme: (theme: ThemeColors) => void;
  onBackToTest: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onSelectTheme,
  onBackToTest,
}) => {
  const handleTestSound = (sound: SoundFeedback) => {
    playKeySound(sound, settings.soundVolume, false);
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    const defaultTheme = THEMES.find(t => t.id === DEFAULT_SETTINGS.themeId) || THEMES[0];
    onSelectTheme(defaultTheme);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToTest}
          className="flex items-center gap-2 text-sm font-medium text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] hover:text-[var(--main-color)] transition-colors px-2.5 py-1.5 rounded bg-[var(--sub-alt-color)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Section 1: Themes */}
        <div className="p-5 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)] mb-4">
            <Palette className="w-4 h-4 text-[var(--main-color)]" />
            <span>Theme Selection</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map(theme => {
              const isSelected = settings.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onUpdateSettings({ themeId: theme.id });
                    onSelectTheme(theme);
                  }}
                  style={{ backgroundColor: theme.bg }}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'border-[var(--main-color)] ring-1 ring-[var(--main-color)] scale-[1.02]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{ color: theme.text }}
                      className="text-xs font-semibold truncate"
                    >
                      {theme.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--main-color)] shrink-0" />
                    )}
                  </div>
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5">
                    <span style={{ backgroundColor: theme.main }} className="w-3 h-3 rounded-full" />
                    <span style={{ backgroundColor: theme.text }} className="w-3 h-3 rounded-full" />
                    <span style={{ backgroundColor: theme.sub }} className="w-3 h-3 rounded-full" />
                    <span style={{ backgroundColor: theme.error }} className="w-3 h-3 rounded-full" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Typography & Appearance */}
        <div className="p-5 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)] mb-4">
            <Type className="w-4 h-4 text-[var(--main-color)]" />
            <span>Typography & Display</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-[var(--sub-color)] mb-2">
                Font Family
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'jetbrains', label: 'JetBrains Mono' },
                    { id: 'plusjakarta', label: 'Plus Jakarta' },
                    { id: 'spacemono', label: 'Space Mono' },
                    { id: 'sourcecode', label: 'Source Code' },
                  ] as { id: FontFamily; label: string }[]
                ).map(font => (
                  <button
                    key={font.id}
                    onClick={() => onUpdateSettings({ fontFamily: font.id })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      settings.fontFamily === font.id
                        ? 'border-[var(--main-color)] text-[var(--main-color)] bg-[var(--bg-color)]'
                        : 'border-[var(--sub-color)]/20 text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium text-[var(--sub-color)] mb-2">
                Font Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'sm', label: 'Small' },
                    { id: 'md', label: 'Medium' },
                    { id: 'lg', label: 'Large' },
                    { id: 'xl', label: 'Extra' },
                  ] as { id: FontSize; label: string }[]
                ).map(size => (
                  <button
                    key={size.id}
                    onClick={() => onUpdateSettings({ fontSize: size.id })}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      settings.fontSize === size.id
                        ? 'border-[var(--main-color)] text-[var(--main-color)] bg-[var(--bg-color)]'
                        : 'border-[var(--sub-color)]/20 text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Caret & Typing Dynamics */}
        <div className="p-5 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)] mb-4">
            <Eye className="w-4 h-4 text-[var(--main-color)]" />
            <span>Caret & Typing Behavior</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Caret Style */}
            <div>
              <label className="block text-xs font-medium text-[var(--sub-color)] mb-2">
                Caret Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'line', label: 'Line' },
                    { id: 'underline', label: 'Underline' },
                    { id: 'block', label: 'Block' },
                    { id: 'outline', label: 'Outline' },
                  ] as { id: CaretStyle; label: string }[]
                ).map(style => (
                  <button
                    key={style.id}
                    onClick={() => onUpdateSettings({ caretStyle: style.id })}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      settings.caretStyle === style.id
                        ? 'border-[var(--main-color)] text-[var(--main-color)] bg-[var(--bg-color)]'
                        : 'border-[var(--sub-color)]/20 text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs text-[var(--sub-color)] cursor-pointer">
                <div>
                  <span className="font-semibold text-[var(--text-color)] block">Smooth Caret Movement</span>
                  <span>Animates the caret smoothly across characters</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smoothCaret}
                  onChange={e => onUpdateSettings({ smoothCaret: e.target.checked })}
                  className="rounded text-[var(--main-color)] focus:ring-[var(--main-color)] h-4 w-4 bg-[var(--bg-color)] border-[var(--sub-color)]"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-[var(--sub-color)] cursor-pointer">
                <div>
                  <span className="font-semibold text-[var(--text-color)] block">Strict Error Correction</span>
                  <span>Must fix incorrect characters before pressing space</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.strictMode}
                  onChange={e => onUpdateSettings({ strictMode: e.target.checked })}
                  className="rounded text-[var(--main-color)] focus:ring-[var(--main-color)] h-4 w-4 bg-[var(--bg-color)] border-[var(--sub-color)]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Sound Feedback */}
        <div className="p-5 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)] mb-4">
            <Volume2 className="w-4 h-4 text-[var(--main-color)]" />
            <span>Sound Effects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-[var(--sub-color)] mb-2">
                Keystroke Sound
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'off', label: 'Off' },
                    { id: 'mechanical', label: 'Mechanical' },
                    { id: 'pop', label: 'Pop' },
                    { id: 'typewriter', label: 'Typewriter' },
                    { id: 'beep', label: 'Beep' },
                  ] as { id: SoundFeedback; label: string }[]
                ).map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => {
                      onUpdateSettings({ soundFeedback: sound.id });
                      handleTestSound(sound.id);
                    }}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      settings.soundFeedback === sound.id
                        ? 'border-[var(--main-color)] text-[var(--main-color)] bg-[var(--bg-color)]'
                        : 'border-[var(--sub-color)]/20 text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {sound.label}
                  </button>
                ))}
              </div>
            </div>

            {settings.soundFeedback !== 'off' && (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[var(--sub-color)] mb-2">
                  <span>Volume</span>
                  <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={e => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[var(--main-color)] cursor-pointer"
                />
                <button
                  onClick={() => handleTestSound(settings.soundFeedback)}
                  className="mt-2 text-xs text-[var(--main-color)] hover:underline"
                >
                  Play audio test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="p-4 rounded-xl bg-[var(--sub-alt-color)]/40 border border-[var(--sub-color)]/10 text-xs text-[var(--sub-color)] flex flex-wrap items-center justify-between gap-4">
          <span className="font-semibold text-[var(--text-color)]">Shortcuts:</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-color)] border border-[var(--sub-color)]/20 font-mono">Tab</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-color)] border border-[var(--sub-color)]/20 font-mono">Enter</kbd> : Restart Test
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-color)] border border-[var(--sub-color)]/20 font-mono">Esc</kbd> : Restart / Focus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
