import React from 'react';
import { SettingsProvider } from '../contexts/SettingsContext';
import { TestHistoryProvider } from '../contexts/TestHistoryContext';
import { AppNavigationProvider } from '../contexts/AppNavigationContext';
import { TypingTestProvider } from '../contexts/TypingTestContext';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders composes all context providers in the required dependency order:
 * 1. SettingsProvider: Theme, audio, and configuration preferences
 * 2. TestHistoryProvider: Test records storage & history
 * 3. AppNavigationProvider: View routing ('test' | 'history' | 'settings')
 * 4. TypingTestProvider: Active typing engine (depends on Settings & TestHistory)
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SettingsProvider>
      <TestHistoryProvider>
        <AppNavigationProvider>
          <TypingTestProvider>
            {children}
          </TypingTestProvider>
        </AppNavigationProvider>
      </TestHistoryProvider>
    </SettingsProvider>
  );
};
