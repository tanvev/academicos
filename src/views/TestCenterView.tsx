import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContextualHelp } from '../components/ContextualHelp';
import {
  Award,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  BarChart3,
  Search,
  Calendar,
  Clock,
  RotateCcw,
  FileCheck,
  Target,
  Edit3,
  TrendingUp,
} from 'lucide-react';
import { CATMock, CATSectional } from '../types';
import { ScheduleMockModal } from '../components/ScheduleMockModal';

interface TestCenterViewProps {
  initialTab?: 'upcoming' | 'completed' | 'analysis' | 'performance';
}

export const TestCenterView: React.FC<TestCenterViewProps> = ({ initialTab = 'upcoming' }) => {
  const {
    catMocks,
    catSectionals,
    programs,
    subjects,
    scheduleMock,
    updateCATMock,
    updateCATSectional,
    deleteCATMock,
    deleteCATSectional,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'analysis' | 'performance'>(
    initialTab
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    mock: CATMock | CATSectional;
    type: 'mock' | 'sectional';
  } | null>(null);

  // Result Logging Modal State
  const [loggingItem, setLoggingItem] = useState<{
    mock: CATMock | CATSectional;
    type: 'mock' | 'sectional';
  } | null>(null);
  const [score, setScore] = useState<number | ''>('');
  const [percentile, setPercentile] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to determine status
  const getTestStatus = (m: CATMock | CATSectional): 'scheduled' | 'completed' | 'missed' | 'rescheduled' => {
    if ((m.status as string) === 'completed' || (m as CATMock).overallScore !== null || (m as CATSectional).score !== null) {
      return 'completed';
    }
    if (m.date < todayStr && (m.status as string) !== 'completed') {
      return 'missed';
    }
    return m.status || 'scheduled';
  };

  // Combine mocks and sectionals into universal test list
  const allTests = [
    ...catMocks.map((m) => ({ ...m, testCategory: 'mock' as const })),
    ...catSectionals.map((s) => ({ ...s, testCategory: 'sectional' as const })),
  ];

  // Filters
  const filteredTests = allTests.filter((t) => {
    if (searchQuery.trim() && !t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }
    if (providerFilter !== 'all' && t.provider !== providerFilter) return false;
    if (programFilter !== 'all' && t.programId && t.programId !== programFilter) return false;
    return true;
  });

  const upcomingTests = filteredTests.filter((t) => {
    const st = getTestStatus(t);
    return st === 'scheduled' || st === 'rescheduled' || st === 'missed';
  });

  const completedTests = filteredTests.filter((t) => {
    const st = getTestStatus(t);
    return st === 'completed';
  });

  const analysisTests = filteredTests.filter((t) => {
    return t.analysisStatus !== 'analysed';
  });

  const missedTestsCount = upcomingTests.filter((t) => getTestStatus(t) === 'missed').length;

  const handleLogResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingItem) return;

    if (loggingItem.type === 'mock') {
      updateCATMock(loggingItem.mock.id, {
        overallScore: score === '' ? null : Number(score),
        overallPercentile: percentile === '' ? null : Number(percentile),
        status: 'completed',
        notes: notes || loggingItem.mock.notes,
        analysisStatus: 'not_analysed',
      });
    } else {
      updateCATSectional(loggingItem.mock.id, {
        score: score === '' ? null : Number(score),
        percentile: percentile === '' ? null : Number(percentile),
        status: 'completed',
        notes: notes || loggingItem.mock.notes,
      });
    }

    setLoggingItem(null);
    setScore('');
    setPercentile('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-zinc-100">Test Center</h2>
            <ContextualHelp topic="test_center" />
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Universal Test System: Full Mocks, Sectionals, Practice Tests, Quizzes & Academic Exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {missedTestsCount > 0 && (
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{missedTestsCount} Missed</span>
            </div>
          )}

          <button
            onClick={() => {
              setEditingItem(null);
              setIsScheduleModalOpen(true);
            }}
            className="bg-purple-500 hover:bg-purple-400 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Test</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 text-xs">
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingTests.length },
          { id: 'completed', label: 'Completed', count: completedTests.length },
          { id: 'analysis', label: 'Analysis', count: analysisTests.length },
          { id: 'performance', label: 'Performance', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      {activeTab !== 'performance' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search test name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Providers</option>
              <option value="IMS">IMS SimCAT</option>
              <option value="Career Launcher">Career Launcher</option>
              <option value="TIME">TIME AIMCAT</option>
              <option value="Cracku">Cracku</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: UPCOMING TESTS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {upcomingTests.map((t) => {
            const status = getTestStatus(t);
            const isMissed = status === 'missed';
            const prog = programs.find((p) => p.id === t.programId);

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isMissed
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-zinc-100">{t.name}</span>
                    {t.provider && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                        {t.provider}
                      </span>
                    )}
                    {prog && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{ backgroundColor: `${prog.color}20`, color: prog.color }}
                      >
                        {prog.name}
                      </span>
                    )}
                    {isMissed && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        MISSED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.date}</span>
                    </span>
                    {t.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{t.startTime}</span>
                      </span>
                    )}
                    {t.durationMinutes && <span>&bull; {t.durationMinutes} mins</span>}
                    {t.analysisDeadline && (
                      <span className="text-cyan-400">&bull; Analyse by {t.analysisDeadline}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setLoggingItem({ mock: t, type: t.testCategory });
                      setScore((t as any).overallScore ?? (t as any).score ?? '');
                      setPercentile((t as any).overallPercentile ?? (t as any).percentile ?? '');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isMissed ? 'Take Now / Log Result' : 'Log Result'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem({ mock: t, type: t.testCategory });
                      setIsScheduleModalOpen(true);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Reschedule</span>
                  </button>

                  {isMissed && (
                    <button
                      onClick={() => {
                        if (t.testCategory === 'mock') {
                          updateCATMock(t.id, { status: 'missed' });
                        } else {
                          updateCATSectional(t.id, { status: 'missed' });
                        }
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg border border-rose-500/30 text-xs font-semibold"
                    >
                      Mark Missed
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (t.testCategory === 'mock') deleteCATMock(t.id);
                      else deleteCATSectional(t.id);
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {upcomingTests.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-2">
              <Award className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No Upcoming Tests Scheduled</p>
              <p className="text-xs text-zinc-500">
                Click "Schedule Test" to add a full mock, sectional, quiz, or exam.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED TESTS */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedTests.map((t) => {
            const overallScore = (t as any).overallScore ?? (t as any).score ?? '-';
            const overallPercentile = (t as any).overallPercentile ?? (t as any).percentile ?? '-';

            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-zinc-100">{t.name}</span>
                    {t.provider && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                        {t.provider}
                      </span>
                    )}
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      COMPLETED
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>Taken on {t.date}</span>
                    {t.analysisDeadline && (
                      <span className="text-cyan-400">&bull; Analysis Deadline: {t.analysisDeadline}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-emerald-400">{overallScore} Marks</span>
                    {overallPercentile !== '-' && (
                      <span className="block text-[10px] text-zinc-400">{overallPercentile}%ile</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setLoggingItem({ mock: t, type: t.testCategory });
                      setScore((t as any).overallScore ?? (t as any).score ?? '');
                      setPercentile((t as any).overallPercentile ?? (t as any).percentile ?? '');
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (t.testCategory === 'mock') deleteCATMock(t.id);
                      else deleteCATSectional(t.id);
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {completedTests.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No Completed Tests Logged Yet</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-3">
          {analysisTests.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="font-bold text-sm text-zinc-100">{t.name}</span>
                <p className="text-xs text-zinc-400">
                  Scheduled / Taken: {t.date} {t.analysisDeadline && `• Due by: ${t.analysisDeadline}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (t.testCategory === 'mock') {
                      updateCATMock(t.id, { analysisStatus: 'analysed', analysisDate: todayStr });
                    } else {
                      updateCATSectional(t.id, { analysisDeadline: undefined });
                    }
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                >
                  Mark Analysed
                </button>
              </div>
            </div>
          ))}

          {analysisTests.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-2">
              <BarChart3 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No Analysis Debt! All Tests Analysed.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400 font-medium">Total Tests Logged</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{completedTests.length}</p>
            </div>
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400 font-medium">Upcoming Tests</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{upcomingTests.length}</p>
            </div>
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400 font-medium">Analysis Completed</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {allTests.filter((t) => t.analysisStatus === 'analysed').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Mock Modal */}
      <ScheduleMockModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingItem(null);
        }}
        existingMock={editingItem?.mock}
        existingType={editingItem?.type}
      />

      {/* Result Logging Modal */}
      {loggingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-5 space-y-4 text-xs text-zinc-200">
            <h3 className="text-sm font-bold text-zinc-100">Log Test Result & Score</h3>
            <p className="text-zinc-400">{loggingItem.mock.name}</p>

            <form onSubmit={handleLogResultSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Overall Score (Marks)</label>
                <input
                  type="number"
                  placeholder="e.g. 78"
                  value={score}
                  onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Overall Percentile (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 98.5"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLoggingItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold">
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
