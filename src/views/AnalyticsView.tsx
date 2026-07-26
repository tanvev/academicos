import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  Calendar,
  FileText,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  AlertCircle,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    studySessions,
    programs,
    subjects,
    topics,
    tasks,
    catMocks,
    catSectionals,
    dailyCheckIns,
    mistakes,
    currentUser,
    settings,
    sendWeeklyReportEmail,
  } = useApp();

  // Weekly Email dispatch and Web Share states
  const [weeklyEmailRecipient, setWeeklyEmailRecipient] = useState<string>(
    settings.weeklyReportEmail || currentUser?.email || 'tanvisundarkar@gmail.com'
  );
  const [emailStatus, setEmailStatus] = useState<'idle' | 'pending' | 'sent' | 'failed'>('idle');
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  // Tab State: 'overview' | 'cat' | 'study' | 'consistency' | 'weekly_review'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cat' | 'study' | 'consistency' | 'weekly_review'
  >(() => {
    if (currentView === 'weekly_review') return 'weekly_review';
    if (currentView === 'analytics_cat' || currentView === 'cat_overview') return 'cat';
    return 'overview';
  });

  // Date Range State for Study tab
  const [dateRange, setDateRange] = useState<'this_week' | '7d' | '30d' | 'this_month' | 'all'>('7d');

  // Share Notification State
  const [shareCopied, setShareCopied] = useState(false);

  // --------------------------------------------------------------------------
  // CANONICAL DATE MATH HELPERS
  // --------------------------------------------------------------------------
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate start of current week (Monday)
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - distanceToMon);
  mondayDate.setHours(0, 0, 0, 0);
  const thisWeekStartStr = mondayDate.toISOString().split('T')[0];

  // Calculate start of last week
  const lastWeekMonday = new Date(mondayDate);
  lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
  const lastWeekStartStr = lastWeekMonday.toISOString().split('T')[0];

  // Past 7, 14, 30 days strings
  const past7DaysStr = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const past14DaysStr = new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0];
  const past30DaysStr = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  // --------------------------------------------------------------------------
  // 1. OVERVIEW DATA CALCULATIONS
  // --------------------------------------------------------------------------
  const thisWeekSessions = studySessions.filter((s) => s.date >= thisWeekStartStr);
  const thisWeekMins = thisWeekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const thisWeekHours = Number((thisWeekMins / 60).toFixed(1));

  const lastWeekSessions = studySessions.filter(
    (s) => s.date >= lastWeekStartStr && s.date < thisWeekStartStr
  );
  const lastWeekMins = lastWeekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const lastWeekHours = Number((lastWeekMins / 60).toFixed(1));

  const weekStudyDiff = Number((thisWeekHours - lastWeekHours).toFixed(1));
  const weekStudyPercentChange =
    lastWeekHours > 0
      ? Number((((thisWeekHours - lastWeekHours) / lastWeekHours) * 100).toFixed(1))
      : thisWeekHours > 0
      ? 100
      : 0;

  // Tasks metrics
  const tasksCompletedThisWeek = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt >= thisWeekStartStr
  ).length;

  const recurringTasksTotal = tasks.filter((t) => t.isRecurring);
  const recurringTasksCompleted = recurringTasksTotal.filter((t) => t.status === 'completed');
  const recurringRate =
    recurringTasksTotal.length > 0
      ? Math.round((recurringTasksCompleted.length / recurringTasksTotal.length) * 100)
      : 100;

  // Topics & Tests completed
  const topicsCompletedThisWeek = topics.filter((t) => t.status === 'completed').length;
  const mocksCompletedThisWeek = catMocks.filter(
    (m) => m.status === 'completed' && m.date >= thisWeekStartStr
  ).length;
  const sectionalsCompletedThisWeek = catSectionals.filter(
    (s) => s.status === 'completed' && s.date >= thisWeekStartStr
  ).length;
  const totalTestsCompletedThisWeek = mocksCompletedThisWeek + sectionalsCompletedThisWeek;

  // Upcoming Tests / Deadlines (Next 14 days)
  const upcomingTasks = tasks
    .filter((t) => t.status === 'pending' && t.dueDate && t.dueDate >= todayStr)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  const upcomingMocks = catMocks
    .filter((m) => m.status === 'scheduled' && m.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Program Breakdown (Actual Study Hours vs Weekly Target)
  const activePrograms = programs.filter((p) => !p.archived);
  const programStudyBreakdown = activePrograms.map((p) => {
    const pSessions = thisWeekSessions.filter((s) => s.programId === p.id);
    const pMins = pSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const actualHours = Number((pMins / 60).toFixed(1));
    const targetHours = p.weeklyTargetHours || 10;
    const progressPct = Math.min(100, Math.round((actualHours / targetHours) * 100));

    return {
      ...p,
      actualHours,
      targetHours,
      progressPct,
    };
  });

  // --------------------------------------------------------------------------
  // 2. CAT ANALYTICS CALCULATIONS
  // --------------------------------------------------------------------------
  const catProgramExists = programs.some(
    (p) => p.type === 'competitive_exam' || p.id.includes('cat') || p.name.toLowerCase().includes('cat')
  ) || catMocks.length > 0;

  const completedMocks = catMocks
    .filter((m) => m.status === 'completed' && m.overallScore !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedSectionals = catSectionals
    .filter((s) => s.status === 'completed' && s.score !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Score, Percentile, Accuracy Trends
  const catTrendData = completedMocks.map((m) => ({
    name: m.name,
    date: m.date,
    score: m.overallScore ?? 0,
    percentile: m.overallPercentile ?? 0,
    accuracy: m.accuracy ?? 0,
    varcPercentile: m.varc.percentile ?? 0,
    dilrPercentile: m.dilr.percentile ?? 0,
    qaPercentile: m.qa.percentile ?? 0,
  }));

  // Summary Metrics (Latest, Best, Avg 3, Avg 5)
  const latestMock = completedMocks[completedMocks.length - 1] || null;
  const bestMockScore = completedMocks.reduce(
    (max, m) => (m.overallScore && m.overallScore > max ? m.overallScore : max),
    0
  );
  const bestMockPercentile = completedMocks.reduce(
    (max, m) => (m.overallPercentile && m.overallPercentile > max ? m.overallPercentile : max),
    0
  );

  const last3Mocks = completedMocks.slice(-3);
  const avgLast3Score =
    last3Mocks.length > 0
      ? Number(
          (
            last3Mocks.reduce((acc, m) => acc + (m.overallScore || 0), 0) / last3Mocks.length
          ).toFixed(1)
        )
      : 0;
  const avgLast3Percentile =
    last3Mocks.length > 0
      ? Number(
          (
            last3Mocks.reduce((acc, m) => acc + (m.overallPercentile || 0), 0) / last3Mocks.length
          ).toFixed(1)
        )
      : 0;

  const last5Mocks = completedMocks.slice(-5);
  const avgLast5Score =
    last5Mocks.length > 0
      ? Number(
          (
            last5Mocks.reduce((acc, m) => acc + (m.overallScore || 0), 0) / last5Mocks.length
          ).toFixed(1)
        )
      : 0;
  const avgLast5Percentile =
    last5Mocks.length > 0
      ? Number(
          (
            last5Mocks.reduce((acc, m) => acc + (m.overallPercentile || 0), 0) / last5Mocks.length
          ).toFixed(1)
        )
      : 0;

  // Mock & Sectional Status Counts
  const mocksPlanned = catMocks.filter((m) => m.status === 'scheduled').length;
  const mocksDone = catMocks.filter((m) => m.status === 'completed').length;
  const mocksMissed = catMocks.filter((m) => m.status === 'missed').length;

  const sectionalsPlanned = catSectionals.filter((s) => s.status === 'scheduled').length;
  const sectionalsDone = catSectionals.filter((s) => s.status === 'completed').length;
  const sectionalsMissed = catSectionals.filter((s) => s.status === 'missed').length;

  // Mock Debt = completed tests requiring analysis where analysis is NOT completed
  const mockDebtItems = catMocks.filter(
    (m) => m.status === 'completed' && m.analysisStatus !== 'analysed'
  );
  const sectionalDebtItems = catSectionals.filter(
    (s) => s.status === 'completed' && s.analysisStatus !== 'analysed'
  );
  const totalMockDebtCount = mockDebtItems.length + sectionalDebtItems.length;

  const mockAnalysesCompleted = catMocks.filter((m) => m.analysisStatus === 'analysed').length;

  // Mistake Book Stats
  const errorCatsMap: Record<string, number> = {};
  const topicMistakesMap: Record<string, number> = {};
  let unresolvedMistakesCount = 0;

  mistakes.forEach((m) => {
    if (!m.resolved) {
      unresolvedMistakesCount++;
    }
    const catKey = (m.errorCategory || 'uncategorized').replace(/_/g, ' ');
    errorCatsMap[catKey] = (errorCatsMap[catKey] || 0) + 1;

    const topicKey = m.topicName || 'General';
    topicMistakesMap[topicKey] = (topicMistakesMap[topicKey] || 0) + 1;
  });

  const pieColors = ['#f43f5e', '#f59e0b', '#06b6d4', '#10b981', '#a855f7', '#ec4899'];
  const errorPieData = Object.keys(errorCatsMap).map((k) => ({
    name: k,
    value: errorCatsMap[k],
  }));

  const topMistakeTopics = Object.entries(topicMistakesMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --------------------------------------------------------------------------
  // 3. STUDY ANALYTICS CALCULATIONS (WITH DATE FILTER)
  // --------------------------------------------------------------------------
  let filterStartDateStr = past7DaysStr;
  if (dateRange === 'this_week') filterStartDateStr = thisWeekStartStr;
  if (dateRange === '30d') filterStartDateStr = past30DaysStr;
  if (dateRange === 'this_month') {
    filterStartDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
  if (dateRange === 'all') filterStartDateStr = '2000-01-01';

  const filteredSessions = studySessions.filter((s) => s.date >= filterStartDateStr);

  // By Day of Week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const studyByDayData = daysOfWeek.map((dayName, idx) => {
    // Map idx (0 = Mon, 6 = Sun) to JavaScript Date day (1 = Mon, ... 0 = Sun)
    const jsDay = idx === 6 ? 0 : idx + 1;
    const daySessions = filteredSessions.filter((s) => {
      const d = new Date(s.date);
      return d.getDay() === jsDay;
    });
    const mins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      day: dayName,
      hours: Number((mins / 60).toFixed(1)),
    };
  });

  // By Program
  const studyByProgramData = programs.map((p) => {
    const mins = filteredSessions
      .filter((s) => s.programId === p.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: p.name,
      hours: Number((mins / 60).toFixed(1)),
      target: p.weeklyTargetHours || 10,
      color: p.color || '#06b6d4',
    };
  });

  // By Subject
  const studyBySubjectData = subjects.map((subj) => {
    const mins = filteredSessions
      .filter((s) => s.subjectId === subj.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: subj.name,
      hours: Number((mins / 60).toFixed(1)),
    };
  }).filter((s) => s.hours > 0);

  // --------------------------------------------------------------------------
  // 4. CONSISTENCY CALCULATIONS
  // --------------------------------------------------------------------------
  // Streak Calculation: Consecutive active days up to today
  const activeDatesSet = new Set<string>();
  studySessions.forEach((s) => activeDatesSet.add(s.date));
  dailyCheckIns.forEach((c) => activeDatesSet.add(c.date));
  tasks.filter((t) => t.status === 'completed' && t.completedAt).forEach((t) => {
    activeDatesSet.add(t.completedAt!.split('T')[0]);
  });

  let currentStreak = 0;
  let checkDate = new Date(now);
  // Check if active today
  let checkStr = checkDate.toISOString().split('T')[0];
  if (!activeDatesSet.has(checkStr)) {
    // Check if active yesterday to maintain ongoing streak
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = checkDate.toISOString().split('T')[0];
  }

  while (activeDatesSet.has(checkStr)) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = checkDate.toISOString().split('T')[0];
  }

  // Longest streak calculation
  const sortedActiveDates = Array.from(activeDatesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  sortedActiveDates.forEach((dStr) => {
    const d = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = d;
  });

  // Active Days in Last 30 Days
  let activeDaysLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
    if (activeDatesSet.has(d)) activeDaysLast30++;
  }

  // Daily Check-In Rate in Last 30 Days
  let checkInsLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
    if (dailyCheckIns.some((c) => c.date === d)) checkInsLast30++;
  }
  const checkInRate = Math.round((checkInsLast30 / 30) * 100);

  // Today's Focus completion rate
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.priority === 'high');
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed');
  const todayFocusRate =
    todayTasks.length > 0 ? Math.round((todayCompleted.length / todayTasks.length) * 100) : 100;

  // --------------------------------------------------------------------------
  // 5. SHARE & EXPORT HANDLER
  // --------------------------------------------------------------------------
  const handleShareReport = async () => {
    const reportText = `Academicos Weekly Performance Review (${new Date().toLocaleDateString()})
Study Time: ${thisWeekHours} hrs (Prev: ${lastWeekHours} hrs)
Tasks Completed: ${tasksCompletedThisWeek}
Mocks Completed: ${mocksCompletedThisWeek}
Current Streak: ${currentStreak} Days
Mock Debt: ${totalMockDebtCount} unanalysed mocks`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Academicos Weekly Performance Report',
          text: reportText,
        });
      } catch (err) {
        // Fallback to clipboard if share cancelled or unsupported
        navigator.clipboard.writeText(reportText);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } else {
      navigator.clipboard.writeText(reportText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-zinc-100">Insights & Performance Analytics</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Canonical data-driven intelligence on study time, CAT mocks, consistency streaks, and weekly progress.
          </p>
        </div>

        {/* Global Share & Print Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareReport}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Report!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 5-TAB INSIGHTS NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'cat', label: 'CAT', icon: Target },
          { id: 'study', label: 'Study', icon: Clock },
          { id: 'consistency', label: 'Consistency', icon: Flame },
          { id: 'weekly_review', label: 'Weekly Review', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'weekly_review') setCurrentView('weekly_review');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-cyan-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Study Hours & Comparison */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                Study Time This Week
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-cyan-400">{thisWeekHours} hrs</span>
                <span
                  className={`text-[10px] font-bold font-mono flex items-center ${
                    weekStudyDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {weekStudyDiff >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(weekStudyPercentChange)}%
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                vs {lastWeekHours} hrs last week ({weekStudyDiff > 0 ? `+${weekStudyDiff}` : weekStudyDiff} hrs)
              </span>
            </div>

            {/* Tasks Completed */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                Tasks Completed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {tasksCompletedThisWeek}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">this week</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Recurring Rate: <strong className="text-zinc-300">{recurringRate}%</strong>
              </span>
            </div>

            {/* Topics Completed */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                Topics Mastered
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-purple-400">
                  {topicsCompletedThisWeek}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">topics</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Out of {topics.length} total topics
              </span>
            </div>

            {/* Tests Completed */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                Tests Taken
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-teal-400">
                  {totalTestsCompletedThisWeek}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">this week</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {mocksCompletedThisWeek} Mocks, {sectionalsCompletedThisWeek} Sectionals
              </span>
            </div>
          </div>

          {/* Program Breakdown: Actual vs Weekly Target */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Program Study Hours Breakdown (Actual vs Weekly Target)</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-normal">
                This Week (Mon-Sun)
              </span>
            </h3>

            <div className="space-y-3">
              {programStudyBreakdown.map((prog) => (
                <div
                  key={prog.id}
                  className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: prog.color || '#06b6d4' }}
                      />
                      <span className="font-bold text-zinc-200">{prog.name}</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-300">
                      <strong className="text-cyan-400">{prog.actualHours} hrs</strong> /{' '}
                      {prog.targetHours} hrs target ({prog.progressPct}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${prog.progressPct}%`,
                        backgroundColor: prog.color || '#06b6d4',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tests & Deadlines Section */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Scheduled Tests & Deadlines (Next 14 Days)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Upcoming Mocks */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Upcoming CAT Mocks ({upcomingMocks.length})
                </span>
                {upcomingMocks.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-zinc-200 block">{m.name}</span>
                      <span className="text-[10px] text-zinc-500">{m.provider}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                      {m.date}
                    </span>
                  </div>
                ))}
                {upcomingMocks.length === 0 && (
                  <p className="text-zinc-500 text-xs py-2 italic">No upcoming mocks scheduled.</p>
                )}
              </div>

              {/* Upcoming Tasks */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Upcoming Deadlines & Assignments ({upcomingTasks.length})
                </span>
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-zinc-200 block truncate">{t.title}</span>
                      <span className="text-[10px] text-zinc-500">{t.type}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 shrink-0">
                      {t.dueDate}
                    </span>
                  </div>
                ))}
                {upcomingTasks.length === 0 && (
                  <p className="text-zinc-500 text-xs py-2 italic">No upcoming deadlines.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CAT ANALYTICS */}
      {/* ==================================================================== */}
      {activeTab === 'cat' && (
        <div className="space-y-6">
          {/* MOCK DEBT HIGH-VISIBILITY CALLOUT BANNER */}
          {totalMockDebtCount > 0 ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-200 text-sm">
                    Mock Debt Alert: {totalMockDebtCount} Unanalysed Test{totalMockDebtCount > 1 ? 's' : ''}
                  </h4>
                  <p className="text-rose-300/80 text-[11px]">
                    Mock Debt = completed tests requiring analysis where analysis is not completed. Analyze before taking your next test!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('cat_analysis')}
                className="bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-md"
              >
                Clear Mock Debt Now
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Zero Mock Debt!</strong> All completed tests have been thoroughly analyzed.</span>
            </div>
          )}

          {/* Key CAT Performance Summary Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Latest Mock Result</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {latestMock ? `${latestMock.overallScore} pts` : 'N/A'}
                </span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {latestMock ? `${latestMock.overallPercentile}%ile` : ''}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 truncate block">
                {latestMock ? latestMock.name : 'No completed mocks'}
              </span>
            </div>

            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Best Mock Recorded</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {bestMockScore > 0 ? `${bestMockScore} pts` : 'N/A'}
                </span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {bestMockPercentile > 0 ? `${bestMockPercentile}%ile` : ''}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block">Personal Best</span>
            </div>

            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Average (Last 3)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-purple-400">
                  {avgLast3Score > 0 ? `${avgLast3Score} pts` : 'N/A'}
                </span>
                <span className="text-xs text-purple-300 font-bold font-mono">
                  {avgLast3Percentile > 0 ? `${avgLast3Percentile}%ile` : ''}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block">3-Mock Rolling Avg</span>
            </div>

            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Average (Last 5)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-teal-400">
                  {avgLast5Score > 0 ? `${avgLast5Score} pts` : 'N/A'}
                </span>
                <span className="text-xs text-teal-300 font-bold font-mono">
                  {avgLast5Percentile > 0 ? `${avgLast5Percentile}%ile` : ''}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block">5-Mock Rolling Avg</span>
            </div>
          </div>

          {/* Counts Grid: Planned / Completed / Missed / Debt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Mocks Status */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-zinc-200 block">Full CAT Mocks Progress</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Planned</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">{mocksPlanned}</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Completed</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">{mocksDone}</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Missed</span>
                  <span className="font-mono font-bold text-rose-400 text-base">{mocksMissed}</span>
                </div>
              </div>
            </div>

            {/* Sectional Tests Status */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-zinc-200 block">CAT Sectional Tests Progress</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Planned</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">{sectionalsPlanned}</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Completed</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">{sectionalsDone}</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Missed</span>
                  <span className="font-mono font-bold text-rose-400 text-base">{sectionalsMissed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Mock Score & Percentile Trend Chart */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Full Mock Score & Percentile Trajectory</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Historical Trend ({completedMocks.length} Tests)
              </span>
            </h3>

            {catTrendData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={catTrendData}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                    <Line
                      type="monotone"
                      dataKey="percentile"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Percentile %"
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="Overall Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                No completed CAT mock data available yet. Import or log a test result to view trend lines.
              </div>
            )}
          </div>

          {/* Sectional Percentile Trends & Mistake Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sectional Percentile Trends */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>VARC, DILR, QA Sectional Percentiles</span>
              </h3>

              {catTrendData.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={catTrendData}>
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                      <Line type="monotone" dataKey="varcPercentile" stroke="#06b6d4" name="VARC %ile" />
                      <Line type="monotone" dataKey="dilrPercentile" stroke="#2dd4bf" name="DILR %ile" />
                      <Line type="monotone" dataKey="qaPercentile" stroke="#10b981" name="QA %ile" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No sectional data available.
                </div>
              )}
            </div>

            {/* Mistake Distribution Pie Chart */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-bold text-zinc-100 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Mistake Book Categories</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {unresolvedMistakesCount} Unresolved
                </span>
              </h3>

              {errorPieData.length > 0 ? (
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={errorPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {errorPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No logged mistakes in Mistake Book yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STUDY ANALYTICS */}
      {/* ==================================================================== */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Study Time Filter Range:</span>
            </span>

            <div className="flex items-center gap-1">
              {[
                { id: 'this_week', label: 'This Week' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateRange(f.id as any)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    dateRange === f.id
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Study Time By Day Bar Chart */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Study Hours Distribution by Day of Week</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyByDayData}>
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Bar dataKey="hours" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Planned vs Actual Program Targets Chart */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Planned Target vs Actual Study Hours (By Program)</span>
              </span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyByProgramData}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                  <Bar dataKey="hours" name="Actual Hours" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Weekly Target" fill="#3f3f46" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Study Time By Subject Breakdown */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3 text-xs">
            <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Study Hours by Subject</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {studyBySubjectData.map((subj, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block truncate">{subj.name}</span>
                  <span className="font-mono font-bold text-purple-400 text-base">{subj.hours} hrs</span>
                </div>
              ))}
              {studyBySubjectData.length === 0 && (
                <p className="text-zinc-500 text-xs py-2 col-span-full">No subject study time recorded in this range.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: CONSISTENCY */}
      {/* ==================================================================== */}
      {activeTab === 'consistency' && (
        <div className="space-y-6">
          {/* Consistency Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Active Study Streak
              </span>
              <span className="text-3xl font-mono font-bold text-amber-400">{currentStreak} Days</span>
              <span className="text-[10px] text-zinc-500 block">Current consecutive active days</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" /> Longest Streak Recorded
              </span>
              <span className="text-3xl font-mono font-bold text-purple-400">{longestStreak} Days</span>
              <span className="text-[10px] text-zinc-500 block">All-time personal record</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-1 col-span-2 md:col-span-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Active Days (Last 30)
              </span>
              <span className="text-3xl font-mono font-bold text-cyan-400">{activeDaysLast30} / 30</span>
              <span className="text-[10px] text-zinc-500 block">
                {Math.round((activeDaysLast30 / 30) * 100)}% activity rate
              </span>
            </div>
          </div>

          {/* Consistency Ratios Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-zinc-200 block">Daily Check-In Rate</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-emerald-400">{checkInRate}%</span>
                <span className="text-[10px] text-zinc-500">{checkInsLast30} of 30 days checked in</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${checkInRate}%` }} />
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-zinc-200 block">Recurring Tasks Completion</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-cyan-400">{recurringRate}%</span>
                <span className="text-[10px] text-zinc-500">Habit adherence rate</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-cyan-500 h-full" style={{ width: `${recurringRate}%` }} />
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-zinc-200 block">Today's Focus Completion</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-purple-400">{todayFocusRate}%</span>
                <span className="text-[10px] text-zinc-500">High-priority tasks done</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-purple-500 h-full" style={{ width: `${todayFocusRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: WEEKLY REVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'weekly_review' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Main Report Document Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  ACADEMICOS &bull; DETERMINISTIC PERFORMANCE REPORT
                </span>
                <h3 className="text-lg font-bold text-zinc-100 mt-1">
                  Weekly Academic Review ({thisWeekStartStr} to {todayStr})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Web Share API Action */}
                <button
                  onClick={async () => {
                    const shareText = `📊 Academicos Weekly Review (${thisWeekStartStr} to ${todayStr}):\n• Study Time: ${thisWeekHours} hrs (vs ${lastWeekHours} hrs prev week)\n• Tasks Completed: ${tasksCompletedThisWeek}\n• Topics Completed: ${topicsCompletedThisWeek}\n• Mock Debt: ${totalMockDebtCount}\n• Active Streak: ${currentStreak} days`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'Academicos Weekly Performance Review',
                          text: shareText,
                        });
                      } catch (err) {
                        // User cancelled or share failed
                      }
                    } else {
                      navigator.clipboard.writeText(shareText);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 3000);
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{shareCopied ? 'Copied to Clipboard!' : 'Share Review'}</span>
                </button>
              </div>
            </div>

            {/* Email Dispatch Control Bar */}
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="email"
                  value={weeklyEmailRecipient}
                  onChange={(e) => setWeeklyEmailRecipient(e.target.value)}
                  placeholder="tanvisundarkar@gmail.com"
                  className="bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg py-1.5 px-3 text-xs text-white outline-none w-full sm:w-64 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    setEmailStatus('pending');
                    setEmailStatusMsg('Sending...');
                    const res = await sendWeeklyReportEmail(weeklyEmailRecipient);
                    if (res.success) {
                      setEmailStatus('sent');
                      setEmailStatusMsg(res.message || 'Report email sent!');
                    } else {
                      setEmailStatus('failed');
                      setEmailStatusMsg(res.message || 'Failed: Server provider missing.');
                    }
                  }}
                  disabled={emailStatus === 'pending'}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Send Email Report</span>
                </button>

                {emailStatus !== 'idle' && (
                  <span
                    className={`text-[10px] font-mono px-2 py-1 rounded border ${
                      emailStatus === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : emailStatus === 'sent'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    [{emailStatus.toUpperCase()}]: {emailStatusMsg}
                  </span>
                )}
              </div>
            </div>

            {/* Top 4 Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Total Study Time</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{thisWeekHours} hrs</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  vs {lastWeekHours} hrs prev week
                </span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Tasks Completed</span>
                <span className="text-xl font-bold font-mono text-cyan-400">{tasksCompletedThisWeek}</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Recurring rate: {recurringRate}%
                </span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Topics Completed</span>
                <span className="text-xl font-bold font-mono text-purple-400">{topicsCompletedThisWeek}</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Total topics: {topics.length}
                </span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Mock Debt Status</span>
                <span
                  className={`text-xl font-bold font-mono ${
                    totalMockDebtCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {totalMockDebtCount} Debt
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Unanalysed test results</span>
              </div>
            </div>

            {/* Program Breakdown Table */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                Program Study Breakdown (Actual vs Weekly Target)
              </h4>
              <div className="space-y-2">
                {programStudyBreakdown.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-bold text-zinc-200">{p.name}</span>
                    </div>
                    <div className="font-mono text-xs">
                      <span className="font-bold text-cyan-400">{p.actualHours} hrs</span> / {p.targetHours} hrs target
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CAT Metrics (If CAT exists) */}
            {catProgramExists && (
              <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-xs">
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>CAT Performance Section</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Mocks Taken / Planned</span>
                    <span className="font-mono font-bold text-zinc-100">{mocksDone} / {mocksPlanned + mocksDone}</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Sectionals Taken / Planned</span>
                    <span className="font-mono font-bold text-zinc-100">{sectionalsDone} / {sectionalsPlanned + sectionalsDone}</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Latest Score</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {latestMock ? `${latestMock.overallScore} pts (${latestMock.overallPercentile}%ile)` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Mock Debt</span>
                    <span className={`font-mono font-bold ${totalMockDebtCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {totalMockDebtCount} unanalysed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements, Needs Attention & Next Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Achievements */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Achievements
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                  <li>Logged {thisWeekHours} hours of total focused study time.</li>
                  <li>Completed {tasksCompletedThisWeek} tasks with {recurringRate}% recurring adherence.</li>
                  {currentStreak >= 3 && <li>Maintained a {currentStreak}-day active study streak.</li>}
                  {totalMockDebtCount === 0 && <li>Cleared all Mock Debt with 100% analysis completion!</li>}
                </ul>
              </div>

              {/* Needs Attention */}
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Needs Attention
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                  {totalMockDebtCount > 0 && (
                    <li>{totalMockDebtCount} test result(s) pending detailed mock analysis.</li>
                  )}
                  {programStudyBreakdown.some((p) => p.progressPct < 50) && (
                    <li>Some programs are below 50% of their weekly study targets.</li>
                  )}
                  {unresolvedMistakesCount > 0 && (
                    <li>{unresolvedMistakesCount} unresolved mistake book entries need review.</li>
                  )}
                  {totalMockDebtCount === 0 && unresolvedMistakesCount === 0 && (
                    <li>Keep up the good work! Maintain steady pace across all subjects.</li>
                  )}
                </ul>
              </div>

              {/* Next Week Action Plan */}
              <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Next Week Plan
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                  <li>Focus on completing weekly study hour targets for each program.</li>
                  <li>Review unresolved mistake book items prior to taking scheduled mocks.</li>
                  <li>Perform immediate analysis within 24 hours of taking any new mock test.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
