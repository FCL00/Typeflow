import { useContext } from 'react';
import { TestHistoryContext, TestHistoryContextType } from '../contexts/TestHistoryContext';

export function useTestHistory(): TestHistoryContextType {
  const context = useContext(TestHistoryContext);
  if (!context) {
    throw new Error('useTestHistory must be used within a TestHistoryProvider');
  }
  return context;
}
