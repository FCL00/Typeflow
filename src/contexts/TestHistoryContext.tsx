import React, { createContext, useState, useCallback, useMemo } from 'react';
import { TestResult } from '../types';
import { loadTestHistory, saveTestResult, clearTestHistory as clearHistoryStorage } from '../utils/storage';

export interface TestHistoryContextType {
  history: TestResult[];
  addResult: (result: TestResult) => void;
  clearHistory: () => void;
}

export const TestHistoryContext = createContext<TestHistoryContextType | undefined>(undefined);

export interface TestHistoryProviderProps {
  children: React.ReactNode;
}

export const TestHistoryProvider: React.FC<TestHistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<TestResult[]>(() => loadTestHistory());

  const addResult = useCallback((result: TestResult) => {
    setHistory(prev => {
      // Guard against duplicate saving of identical result id
      if (prev.some(item => item.id === result.id)) {
        return prev;
      }
      const updated = saveTestResult(result);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    clearHistoryStorage();
    setHistory([]);
  }, []);

  const value = useMemo(
    () => ({
      history,
      addResult,
      clearHistory,
    }),
    [history, addResult, clearHistory]
  );

  return (
    <TestHistoryContext.Provider value={value}>
      {children}
    </TestHistoryContext.Provider>
  );
};
