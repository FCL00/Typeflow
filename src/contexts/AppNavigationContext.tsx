import React, { createContext, useState, useCallback, useMemo } from 'react';

export type ActiveView = 'test' | 'history' | 'settings';

export interface AppNavigationContextType {
  activeView: ActiveView;
  navigateTo: (view: ActiveView) => void;
  goToTest: () => void;
  goToHistory: () => void;
  goToSettings: () => void;
}

export const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

export interface AppNavigationProviderProps {
  children: React.ReactNode;
  initialView?: ActiveView;
}

export const AppNavigationProvider: React.FC<AppNavigationProviderProps> = ({
  children,
  initialView = 'test',
}) => {
  const [activeView, setActiveView] = useState<ActiveView>(initialView);

  const navigateTo = useCallback((view: ActiveView) => {
    setActiveView(view);
  }, []);

  const goToTest = useCallback(() => setActiveView('test'), []);
  const goToHistory = useCallback(() => setActiveView('history'), []);
  const goToSettings = useCallback(() => setActiveView('settings'), []);

  const value = useMemo(
    () => ({
      activeView,
      navigateTo,
      goToTest,
      goToHistory,
      goToSettings,
    }),
    [activeView, navigateTo, goToTest, goToHistory, goToSettings]
  );

  return (
    <AppNavigationContext.Provider value={value}>
      {children}
    </AppNavigationContext.Provider>
  );
};
