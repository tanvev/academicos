import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Play,
  Pause,
  Square,
  Bell,
  Menu,
  AlertTriangle,
  Clock,
  Calendar,
  AlertCircle,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface TopbarProps {
  setIsMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ setIsMobileOpen }) => {
  const {
    currentView,
    searchQuery,
    setSearchQuery,
    setIsSearchOpen,
    setIsQuickAddOpen,
    setIsStudyTimerModalOpen,
    studyTimer,
    pauseStudyTimer,
    resumeStudyTimer,
    tasks,
    catMocks,
    topics,
    programs,
    updates,
    userUpdateStates,
    weeklyReports,
    setCurrentView,
    currentUser,
    dailyCheckIns,
    setIsDailyCheckInOpen,
    computeStreakInfo,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const streakInfo = computeStreakInfo();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkedInToday = dailyCheckIns.some((c) => c.date === todayStr);

  // Compute 7 Actionable Derived Notifications
  const overdueTasks = tasks.filter((t) => t.status === 'pending' && t.dueDate < todayStr);

  const upcomingDeadlines = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const diffDays =
      (new Date(t.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 2;
  });

  const testsTomorrow = catMocks.filter(
    (m) => (m.status === 'scheduled' || !m.overallScore) && (m.date === todayStr || m.date === tomorrowStr)
  );

  const mockDebt = catMocks.filter(
    (m) => m.overallScore !== null && m.analysisStatus !== 'analysed'
  );

  const revisionDueTopics = topics.filter((tp) => tp.status === 'revision_due');

  const unreadOfficialUpdates = updates.filter(
    (up) => !userUpdateStates[up.id]?.read
  );

  const latestWeeklyReport = weeklyReports[0] || null;

  const totalNotifications =
    overdueTasks.length +
    upcomingDeadlines.length +
    testsTomorrow.length +
    mockDebt.length +
    revisionDueTopics.length +
    unreadOfficialUpdates.length +
    (latestWeeklyReport ? 1 : 0);

  // Timer format helper
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      return `${h}h ${m % 60}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const currentProgram = studyTimer
    ? programs.find((p) => p.id === studyTimer.programId)
    : null;

  return (
    <header className="h-16 border-b border-[#27272A] flex items-center justify-between px-4 sm:px-8 bg-[#09090B] sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Header Title and Date / Breadcrumbs */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-white capitalize">
            {currentView.replace(/_/g, ' ')}
          </h2>
          <span className="hidden md:inline text-slate-500 text-xs sm:text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search Bar */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs w-36 sm:w-60 cursor-pointer transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Search tasks, topics...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono text-slate-500 bg-[#09090B] px-1.5 py-0.5 rounded border border-[#27272A]">
            ⌘K
          </kbd>
        </div>

        {/* Active Study Timer Bar in Topbar */}
        {studyTimer ? (
          <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 px-3 py-1.5 rounded-lg text-xs shadow-xs">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
            <span className="font-mono font-bold">{formatTimer(studyTimer.elapsedSeconds)}</span>
            <span className="hidden md:inline text-slate-400 text-[11px] truncate max-w-[100px]">
              {currentProgram?.name || 'Studying'}
            </span>
            <div className="flex items-center gap-1 border-l border-teal-500/30 pl-2 ml-1">
              {studyTimer.isRunning ? (
                <button
                  onClick={pauseStudyTimer}
                  className="p-1 hover:bg-teal-500/20 rounded text-teal-300"
                  title="Pause Timer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={resumeStudyTimer}
                  className="p-1 hover:bg-teal-500/20 rounded text-teal-300"
                  title="Resume Timer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsStudyTimerModalOpen(true)}
                className="bg-teal-500 text-black font-bold px-2 py-0.5 rounded text-[11px] hover:bg-teal-400 cursor-pointer"
              >
                Log
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsStudyTimerModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-[#18181B] hover:bg-zinc-800 text-teal-400 border border-teal-500/30 font-medium px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Study Timer</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-full shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">QUICK ADD</span>
        </button>

        {/* Notifications / Attention Center */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Attention Center"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center leading-none">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Attention Center Dropdown Modal */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3 border-b border-[#27272A] flex items-center justify-between bg-[#09090B]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">Attention Center</span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {totalNotifications === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No urgent items! Everything is on track.
                  </div>
                ) : (
                  <>
                    {/* Overdue Tasks */}
                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setCurrentView('tasks');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-rose-500/10"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-rose-200">{t.title}</p>
                          <p className="text-[10px] text-rose-400/80">
                            Overdue Task &bull; Due {t.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Upcoming Deadlines */}
                    {upcomingDeadlines.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setCurrentView('tasks');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-amber-500/10"
                      >
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-200">{t.title}</p>
                          <p className="text-[10px] text-amber-400/80">
                            Upcoming Deadline &bull; Due {t.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Tests Tomorrow / Today */}
                    {testsTomorrow.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setCurrentView('test_center');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-cyan-500/10"
                      >
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-cyan-200">Scheduled Test: {m.name}</p>
                          <p className="text-[10px] text-cyan-400/80">
                            Date: {m.date} {m.startTime ? `at ${m.startTime}` : ''} &bull; Test Center
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Mock Debt Analysis Overdue */}
                    {mockDebt.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setCurrentView('cat_analysis');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-teal-500/5 border border-teal-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-teal-500/10"
                      >
                        <AlertTriangle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-teal-200">
                            Mock Analysis Overdue: {m.name}
                          </p>
                          <p className="text-[10px] text-teal-400/80">
                            Taken on {m.date} &bull; Analysis pending
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Revision Due Topics */}
                    {revisionDueTopics.map((tp) => (
                      <div
                        key={tp.id}
                        onClick={() => {
                          setCurrentView('cat_syllabus');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-purple-500/10"
                      >
                        <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-purple-200">
                            Revision Due: {tp.name}
                          </p>
                          <p className="text-[10px] text-purple-300/80">
                            Topic flagged for spaced repetition review
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* New Relevant Official Updates */}
                    {unreadOfficialUpdates.map((up) => (
                      <div
                        key={up.id}
                        onClick={() => {
                          setCurrentView('updates');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-blue-500/10"
                      >
                        <Bell className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-200 truncate max-w-[240px]">
                            Official Update: {up.title}
                          </p>
                          <p className="text-[10px] text-blue-300/80">
                            {up.sourceName} &bull; {up.publishedAt}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Weekly Report Ready */}
                    {latestWeeklyReport && (
                      <div
                        onClick={() => {
                          setCurrentView('weekly_review');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-200">Weekly Performance Report Ready</p>
                          <p className="text-[10px] text-emerald-300/80">
                            Review study metrics & recommendations for {latestWeeklyReport.weekStart}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Streak Counter Badge */}
        <div
          title={`${streakInfo.currentStreak} Day Academic Streak!`}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{streakInfo.currentStreak}d Streak</span>
        </div>

        {/* Daily Check-In Pill */}
        <button
          onClick={() => setIsDailyCheckInOpen(true)}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            checkedInToday
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 animate-pulse'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{checkedInToday ? 'Checked In' : 'Daily Check-In'}</span>
        </button>

        {/* Profile Avatar Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('help_guide')}
            title="Help & Guide"
            className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-cyan-400 text-slate-300 flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            ?
          </button>

          <div
            onClick={() => setCurrentView('settings')}
            title={currentUser?.name || 'Academic User'}
            className="w-8 h-8 rounded-full border border-teal-500/40 bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0 cursor-pointer hover:border-teal-400 transition-colors"
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
