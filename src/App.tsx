/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProviders } from './providers/AppProviders';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useSettings } from './hooks/useSettings';
import { useTestHistory } from './hooks/useTestHistory';
import { useTypingTest } from './hooks/useTypingTest';
import { Header } from './components/Header';
import { TestConfiguration } from './components/TestConfiguration';
import { LiveStatistics } from './components/LiveStatistics';
import { TypingArea } from './components/TypingArea';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryStatsView } from './components/HistoryStatsView';
import { SettingsView } from './components/SettingsView';

/**
 * Inner component that consumes all modular domain contexts.
 * Handles top-level view orchestration, layout, and global shortcuts.
 */
function TypeflowAppContent() {
  const { activeView, navigateTo, goToTest, goToHistory, goToSettings } = useAppNavigation();
  const { settings, currentTheme, selectTheme, updateSettings } = useSettings();
  const { history, clearHistory } = useTestHistory();
  const {
    config,
    words,
    quoteInfo,
    currentWordIndex,
    currentInput,
    isTestActive,
    isCompleted,
    timeLeft,
    liveWpm,
    liveAcc,
    testResult,
    changeConfig,
    restartTest,
    startNewTest,
    handleInputChange,
    handleSpacePress,
    handleBackspacePress,
  } = useTypingTest();

  // Global restart keyboard shortcut listener (Escape to reset test or return to practice)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeView !== 'test') {
          goToTest();
        } else {
          restartTest();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeView, goToTest, restartTest]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col justify-between selection:bg-[var(--main-color)] selection:text-[var(--bg-color)] transition-colors duration-200">
      {/* Header with Navigation and Theme Controls */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={selectTheme}
        activeView={activeView}
        onNavigate={(view) => {
          if (isTestActive) {
            restartTest();
          }
          navigateTo(view);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 w-full">
        {activeView === 'history' && (
          <HistoryStatsView
            history={history}
            onBackToTest={goToTest}
            onClearHistory={clearHistory}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
            onSelectTheme={selectTheme}
            onBackToTest={goToTest}
          />
        )}

        {activeView === 'test' && (
          <>
            {isCompleted && testResult ? (
              <ResultsScreen
                result={testResult}
                onRestartSameTest={restartTest}
                onStartNewTest={startNewTest}
                onViewHistory={goToHistory}
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-6">
                {/* Test Configuration Toolbar */}
                <TestConfiguration
                  config={config}
                  onChangeConfig={changeConfig}
                  onRestartTest={restartTest}
                  isTestActive={isTestActive}
                />

                {/* Live Statistics Row */}
                <LiveStatistics
                  config={config}
                  isTestActive={isTestActive}
                  timeLeft={timeLeft}
                  completedWords={currentWordIndex}
                  totalWords={words.length}
                  liveWpm={liveWpm}
                  liveAcc={liveAcc}
                  quoteAuthor={quoteInfo?.author}
                />

                {/* Main Typing Canvas */}
                <TypingArea
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentInput={currentInput}
                  onInputChange={handleInputChange}
                  onSpacePress={handleSpacePress}
                  onBackspacePress={handleBackspacePress}
                  onRestartTest={restartTest}
                  settings={settings}
                  isTestActive={isTestActive}
                  isCompleted={isCompleted}
                />

                {/* Footer shortcut helper hint */}
                <div className="flex items-center gap-4 text-xs text-[var(--sub-color)] font-sans opacity-60 transition-opacity hover:opacity-100">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Tab</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Enter</kbd> to restart test
                  </span>
                  <span>·</span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 font-mono">Esc</kbd> to restart
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--sub-color)] gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={goToTest}
            className="hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            Practice
          </button>
          <span>·</span>
          <button
            onClick={goToHistory}
            className="hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            Statistics
          </button>
          <span>·</span>
          <button
            onClick={goToSettings}
            className="hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            Settings
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>Typeflow</span>
          <span>·</span>
          <span className="text-[var(--main-color)] font-medium">Fast &amp; Minimalist</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root Application entry point wrapped in AppProviders.
 * Clean, modular architecture separating navigation, settings, history, and typing engine.
 */
export default function App() {
  return (
    <AppProviders>
      <TypeflowAppContent />
    </AppProviders>
  );
}
