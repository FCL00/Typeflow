import React, { useState } from 'react';
import { ArrowLeft, Trash2, Award, Zap, Target, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TestResult } from '../types';
import { computeStatsSummary, clearTestHistory } from '../utils/storage';

interface HistoryStatsViewProps {
  history: TestResult[];
  onBackToTest: () => void;
  onClearHistory: () => void;
}

export const HistoryStatsView: React.FC<HistoryStatsViewProps> = ({
  history,
  onBackToTest,
  onClearHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const summary = computeStatsSummary(history);

  // Format historical chart data (chronological order)
  const chartData = [...history]
    .reverse()
    .map((item, index) => ({
      testIndex: index + 1,
      wpm: item.wpm,
      accuracy: item.accuracy,
      date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      mode: item.configSummary,
    }));

  const handleConfirmClear = () => {
    clearTestHistory();
    onClearHistory();
    setShowClearConfirm(false);
  };

  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hours}h ${remMins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToTest}
          className="flex items-center gap-2 text-sm font-medium text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test</span>
        </button>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] hover:text-[var(--error-color)] transition-colors px-2.5 py-1.5 rounded bg-[var(--sub-alt-color)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--error-color)]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--text-color)]">
            Are you sure you want to reset all test statistics and history?
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--sub-color)] hover:text-[var(--text-color)] bg-[var(--bg-color)]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClear}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--error-color)] hover:opacity-90"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] mb-2 font-medium">
            <Award className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span>Personal Best</span>
          </div>
          <span className="text-3xl sm:text-4xl font-bold font-mono text-[var(--main-color)] tabular-nums">
            {summary.personalBestWpm}
          </span>
          <span className="text-xs text-[var(--sub-color)] mt-1">wpm</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] mb-2 font-medium">
            <Zap className="w-3.5 h-3.5 text-[var(--text-color)]" />
            <span>Average Speed</span>
          </div>
          <span className="text-3xl sm:text-4xl font-bold font-mono text-[var(--text-color)] tabular-nums">
            {summary.averageWpm}
          </span>
          <span className="text-xs text-[var(--sub-color)] mt-1">wpm</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] mb-2 font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Accuracy</span>
          </div>
          <span className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tabular-nums">
            {summary.averageAccuracy}%
          </span>
          <span className="text-xs text-[var(--sub-color)] mt-1">accuracy</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] mb-2 font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--sub-color)]" />
            <span>Typing Time</span>
          </div>
          <span className="text-3xl sm:text-4xl font-bold font-mono text-[var(--text-color)] tabular-nums">
            {formatTotalTime(summary.totalTimeSeconds)}
          </span>
          <span className="text-xs text-[var(--sub-color)] mt-1">{summary.totalTests} tests taken</span>
        </div>
      </div>

      {/* Historical Trend Chart */}
      {history.length > 1 ? (
        <div className="mb-8 p-4 rounded-xl bg-[var(--sub-alt-color)]/50 border border-[var(--sub-color)]/20">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)]">
              <Activity className="w-4 h-4 text-[var(--main-color)]" />
              <span>Speed Progression</span>
            </div>
            <span className="text-xs text-[var(--sub-color)]">Last {chartData.length} tests</span>
          </div>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sub-color)" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="testIndex"
                  stroke="var(--sub-color)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `#${val}`}
                />
                <YAxis
                  stroke="var(--sub-color)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--sub-alt-color)',
                    borderColor: 'var(--sub-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} WPM`, 'Speed']}
                  labelFormatter={(idx, items) => {
                    const item = items?.[0]?.payload;
                    return `Test #${idx} (${item?.mode || ''}) - ${item?.date || ''}`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--main-color)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--main-color)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Test Log Table or Empty State */}
      <div className="rounded-xl bg-[var(--sub-alt-color)] border border-[var(--sub-color)]/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--sub-color)]/20 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text-color)]">Recent Tests</span>
          <span className="text-xs text-[var(--sub-color)]">{history.length} completed</span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--sub-alt-color)] text-[var(--main-color)] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-color)] mb-1">
              No tests recorded yet
            </h3>
            <p className="text-sm text-[var(--sub-color)] max-w-sm mb-4">
              Complete your first typing test to start tracking your speed, accuracy, and consistency.
            </p>
            <button
              onClick={onBackToTest}
              className="px-4 py-2 rounded-lg bg-[var(--main-color)] text-[var(--bg-color)] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start Typing Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-[var(--bg-color)]/50 text-xs text-[var(--sub-color)] font-sans border-b border-[var(--sub-color)]/20">
                <tr>
                  <th className="py-2.5 px-4 font-medium">WPM</th>
                  <th className="py-2.5 px-4 font-medium">Accuracy</th>
                  <th className="py-2.5 px-4 font-medium">Raw</th>
                  <th className="py-2.5 px-4 font-medium">Consistency</th>
                  <th className="py-2.5 px-4 font-medium">Mode</th>
                  <th className="py-2.5 px-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sub-color)]/10 text-[var(--text-color)]">
                {history.slice(0, 30).map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg-color)]/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[var(--main-color)] tabular-nums">
                      {item.wpm}
                    </td>
                    <td className="py-2.5 px-4 tabular-nums">
                      {item.accuracy}%
                    </td>
                    <td className="py-2.5 px-4 text-[var(--sub-color)] tabular-nums">
                      {item.rawWpm}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--sub-color)] tabular-nums">
                      {item.consistency}%
                    </td>
                    <td className="py-2.5 px-4 text-xs font-sans text-[var(--sub-color)]">
                      {item.configSummary}
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs font-sans text-[var(--sub-color)]">
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
