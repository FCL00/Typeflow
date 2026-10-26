import { useContext } from 'react';
import { TypingTestContext, TypingTestContextType } from '../contexts/TypingTestContext';

export function useTypingTest(): TypingTestContextType {
  const context = useContext(TypingTestContext);
  if (!context) {
    throw new Error('useTypingTest must be used within a TypingTestProvider');
  }
  return context;
}
