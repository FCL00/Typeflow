import { useContext } from 'react';
import { AppNavigationContext, AppNavigationContextType } from '../contexts/AppNavigationContext';

export function useAppNavigation(): AppNavigationContextType {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within an AppNavigationProvider');
  }
  return context;
}
