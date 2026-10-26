import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserSettings, ThemeColors } from '../types';
import { THEMES, DEFAULT_THEME, applyTheme } from '../constants/themes';
import { loadUserSettings, saveUserSettings, DEFAULT_SETTINGS } from '../utils/storage';

export interface SettingsContextType {
  settings: UserSettings;
  currentTheme: ThemeColors;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  selectTheme: (theme: ThemeColors) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());

  // Derive current theme object from active themeId with safe fallback
  const currentTheme = useMemo(
    () => THEMES.find(t => t.id === settings.themeId) || DEFAULT_THEME,
    [settings.themeId]
  );

  // Synchronize CSS variables and root DOM styles on theme change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const updateSettings = useCallback((newSettingsPartial: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettingsPartial };
      saveUserSettings(updated);
      return updated;
    });
  }, []);

  const selectTheme = useCallback((theme: ThemeColors) => {
    updateSettings({ themeId: theme.id });
    applyTheme(theme);
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveUserSettings(DEFAULT_SETTINGS);
    const defaultTheme = THEMES.find(t => t.id === DEFAULT_SETTINGS.themeId) || DEFAULT_THEME;
    applyTheme(defaultTheme);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      currentTheme,
      updateSettings,
      selectTheme,
      resetSettings,
    }),
    [settings, currentTheme, updateSettings, selectTheme, resetSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
