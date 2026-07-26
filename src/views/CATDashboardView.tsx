import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Award,
  FileCheck,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Plus,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export const CATDashboardView: React.FC = () => {
  const {
    catMocks,
    catSectionals,
    mistakes,
    topics,
    settings,
    setCurrentView,
    setIsQuickAddOpen,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const catTopics = topics.filter((t) => t.programId === 'prog-cat-2026');

  const varcTopics = catTopics.filter(
    (t) => t.subjectId === 'subj-cat-varc' || t.name.includes('RC') || t.name.includes('VA')
  );
  const dilrTopics = catTopics.filter(
    (t) => t.subjectId === 'subj-cat-dilr' || t.name.includes('DILR') || t.name.includes('LR')
  );
  const qaTopics = catTopics.filter(
    (t) =>
      t.subjectId === 'subj-cat-qa' ||
      t.name.includes('Arithmetic') ||
      t.name.includes('Algebra')
  );

  const calcTopicPct = (topList: typeof catTopics) => {
    if (topList.length === 0) return 0;
    const done = topList.filter((t) => t.status === 'completed').length;
    return Math.round((done / topList.length) * 100);
  };

  const mockDebt = catMocks.filter((m) => m.analysisStatus !== 'analysed');
  const latestMock = catMocks.length > 0 ? catMocks[0] : null;

  const avgMockPercentile =
    catMocks.length > 0
      ? (
          catMocks.reduce((acc, m) => acc + (m.overallPercentile || 0), 0) / catMocks.length
        ).toFixed(1)
      : 'N/A';

  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-cyan-950/60 p-5 rounded-2xl border border-cyan-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <Target className="w-4 h-4" />
            <span>CAT 2026 SPECIALIST DASHBOARD</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            Aptitude Command Center
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Syllabus status, Mock Debt tracker, Sectional stats, and Mistake Book analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('cat_analysis')}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Mock Analysis</span>
            {mockDebt.length > 0 && (
              <span className="bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                {mockDebt.length} debt
              </span>
            )}
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mock / Sectional</span>
          </button>
        </div>
      </div>

      {/* MOCK DEBT WARNING BANNER */}
      {mockDebt.length > 0 && (
        <div
          onClick={() => setCurrentView('cat_analysis')}
          className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:bg-rose-950/50 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="font-bold text-rose-200 text-xs">
                MOCK DEBT ALERT: {mockDebt.length} Unanalysed Mock{mockDebt.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[11px] text-rose-300/80">
                Taking a mock without thorough analysis generates Mock Debt. Analyze your questions now!
              </p>
            </div>
          </div>
          <button className="bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer">
            Resolve Debt
          </button>
        </div>
      )}

      {/* UPCOMING / SCHEDULED MOCKS WIDGET */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-amber-950/20 border border-purple-500/30 p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-zinc-100 text-xs">Upcoming & Scheduled Test Calendar</h3>
            <span className="bg-purple-500/20 text-purple-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
              {catMocks.filter((m) => m.status === 'scheduled' || m.date >= todayStr).length +
                catSectionals.filter((s) => s.status === 'scheduled' || s.date >= todayStr).length}{' '}
              Upcoming
            </span>
          </div>

          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs text-purple-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Open Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ...catMocks
              .filter((m) => m.status === 'scheduled' || m.status === 'rescheduled' || (m.date >= todayStr && m.overallScore === null))
              .map((m) => ({ ...m, kind: 'full' as const })),
            ...catSectionals
              .filter((s) => s.status === 'scheduled' || s.status === 'rescheduled' || (s.date >= todayStr && s.score === null))
              .map((s) => ({ ...s, kind: 'sectional' as const })),
          ]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3)
            .map((test) => {
              const isToday = test.date === todayStr;
              const isSectional = test.kind === 'sectional';

              return (
                <div
                  key={test.id}
                  onClick={() => setCurrentView('tasks')}
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 cursor-pointer transition-all hover:scale-[1.01] ${
                    isToday
                      ? 'bg-purple-950/60 border-purple-500 shadow-xs'
                      : isSectional
                      ? 'bg-zinc-950 border-amber-500/30 hover:border-amber-500/60'
                      : 'bg-zinc-950 border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                          isSectional
                            ? 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                            : 'bg-purple-950/50 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {isSectional ? `SECTIONAL (${(test as any).section})` : 'FULL CAT MOCK'}
                      </span>
                      <h4 className="font-bold text-zinc-100 text-xs mt-1 truncate">{test.name}</h4>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">{test.provider}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <span className={`font-mono ${isToday ? 'text-purple-300 font-bold' : ''}`}>
                      📅 {test.date} {test.startTime ? `• ${test.startTime}` : ''}
                    </span>
                    <span className="text-purple-400 font-semibold hover:underline">Take / Log &rarr;</span>
                  </div>
                </div>
              );
            })}

          {[
            ...catMocks.filter((m) => m.status === 'scheduled' || (m.date >= todayStr && m.overallScore === null)),
            ...catSectionals.filter((s) => s.status === 'scheduled' || (s.date >= todayStr && s.score === null)),
          ].length === 0 && (
            <div className="col-span-full py-4 text-center text-zinc-500 text-xs bg-zinc-950/50 rounded-xl border border-zinc-800/60">
              No upcoming mocks scheduled. Use the "Schedule Mock" button on the Calendar to set future dates!
            </div>
          )}
        </div>
      </div>

      {/* Section-Wise Syllabus Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VARC */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
              VARC Section
            </span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {calcTopicPct(varcTopics)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${calcTopicPct(varcTopics)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            Reading Comprehension, Verbal Ability, Para Jumbles & Summary
          </p>
        </div>

        {/* DILR */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
              DILR Section
            </span>
            <span className="font-mono text-xs font-bold text-teal-400">
              {calcTopicPct(dilrTopics)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full"
              style={{ width: `${calcTopicPct(dilrTopics)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            Arrangements, Games & Tournaments, DI Charts, Networks & Logic
          </p>
        </div>

        {/* QA */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
              QA Section
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {calcTopicPct(qaTopics)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${calcTopicPct(qaTopics)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            Arithmetic, Algebra, Geometry, Modern Math, Number Systems
          </p>
        </div>
      </div>

      {/* Main Grid: Mocks Breakdown & Sectionals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Latest Mock Overview */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <h3 className="font-bold text-zinc-200 text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Latest Mock Overview</span>
            </h3>
            <button
              onClick={() => setCurrentView('cat_mocks')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Mocks ({catMocks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestMock ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-100 text-sm">{latestMock.name}</h4>
                  <p className="text-[10px] text-zinc-500">
                    Provider: {latestMock.provider} &bull; Date: {latestMock.date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {latestMock.overallScore ?? 'N/A'} pts
                  </span>
                  <p className="text-[10px] text-teal-400 font-bold">
                    {latestMock.overallPercentile ?? 'N/A'}%ile
                  </p>
                </div>
              </div>

              {/* Section Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                    VARC
                  </span>
                  <span className="font-mono font-bold text-zinc-100 text-sm">
                    {latestMock.varc.score ?? '-'}
                  </span>
                  <span className="text-[9px] text-cyan-400 block">
                    {latestMock.varc.percentile ? `${latestMock.varc.percentile}%ile` : ''}
                  </span>
                </div>

                <div className="text-center border-x border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                    DILR
                  </span>
                  <span className="font-mono font-bold text-zinc-100 text-sm">
                    {latestMock.dilr.score ?? '-'}
                  </span>
                  <span className="text-[9px] text-cyan-400 block">
                    {latestMock.dilr.percentile ? `${latestMock.dilr.percentile}%ile` : ''}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                    QA
                  </span>
                  <span className="font-mono font-bold text-zinc-100 text-sm">
                    {latestMock.qa.score ?? '-'}
                  </span>
                  <span className="text-[9px] text-cyan-400 block">
                    {latestMock.qa.percentile ? `${latestMock.qa.percentile}%ile` : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No full mocks logged yet. Click "+ Quick Add" to record your first SimCAT or AIMCAT!
            </div>
          )}
        </div>

        {/* Right: Mistake Book Overview */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <h3 className="font-bold text-zinc-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Mistake Book Log</span>
            </h3>
            <button
              onClick={() => setCurrentView('mistakes')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({mistakes.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {unresolvedMistakes.slice(0, 4).map((m) => (
              <div
                key={m.id}
                onClick={() => setCurrentView('mistakes')}
                className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 rounded-xl flex items-start justify-between cursor-pointer transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-200">{m.questionIdentifier}</span>
                    <span className="text-[9px] font-mono uppercase bg-amber-950/40 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                      {m.errorCategory.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{m.notes}</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                  {m.section}
                </span>
              </div>
            ))}

            {unresolvedMistakes.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No unresolved mistakes in your Mistake Book. Great accuracy!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
