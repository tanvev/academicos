import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ContextualHelp } from '../components/ContextualHelp';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Plus,
  Flame,
  Sparkles,
  Play,
  RotateCcw,
  Target,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
} from 'lucide-react';
import { Task, CATMock, CATSectional } from '../types';

interface FocusItem {
  id: string;
  kind: 'task' | 'mock' | 'sectional';
  category: 'main' | 'secondary' | 'quick_win';
  title: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  programName?: string;
  dueDate?: string;
  original: Task | CATMock | CATSectional;
}

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    programs,
    subjects,
    topics,
    tasks,
    studySessions,
    catMocks,
    catSectionals,
    dailyCheckIns,
    computeStreakInfo,
    toggleTaskStatus,
    setCurrentView,
    setSelectedProgramId,
    setIsQuickAddOpen,
    setIsStudyTimerModalOpen,
    setIsDailyCheckInOpen,
    startStudyTimer,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = dailyCheckIns.find((c) => c.date === todayStr);
  const streakInfo = computeStreakInfo();

  // 1. Available Capacity (Mins)
  const availableCapacityMins = todayCheckIn ? todayCheckIn.availableMinutes : 240; // default 4 hrs

  // 2. Focus Items State (persisted per date)
  const [focusItems, setFocusItems] = useState<FocusItem[]>([]);

  // Generator for Focus Items
  const generateFocusPlan = () => {
    const items: FocusItem[] = [];

    // Check non-negotiable from Check-In
    const nonNegId = todayCheckIn?.nonNegotiableTaskId;

    // 1. Non-negotiable item or high priority test today
    let mainAssigned = false;
    if (nonNegId) {
      const taskMatch = tasks.find((t) => t.id === nonNegId);
      const mockMatch = catMocks.find((m) => m.id === nonNegId);
      const secMatch = catSectionals.find((s) => s.id === nonNegId);

      if (taskMatch) {
        items.push({
          id: taskMatch.id,
          kind: 'task',
          category: 'main',
          title: `[NON-NEGOTIABLE] ${taskMatch.title}`,
          estimatedMinutes: taskMatch.estimatedMinutes || 60,
          priority: 'high',
          programName: programs.find((p) => p.id === taskMatch.programId)?.name,
          dueDate: taskMatch.dueDate,
          original: taskMatch,
        });
        mainAssigned = true;
      } else if (mockMatch) {
        items.push({
          id: mockMatch.id,
          kind: 'mock',
          category: 'main',
          title: `[NON-NEGOTIABLE] ${mockMatch.name}`,
          estimatedMinutes: mockMatch.durationMinutes || 120,
          priority: 'high',
          programName: programs.find((p) => p.id === mockMatch.programId)?.name || programs[0]?.name || 'Program',
          dueDate: mockMatch.date,
          original: mockMatch,
        });
        mainAssigned = true;
      } else if (secMatch) {
        items.push({
          id: secMatch.id,
          kind: 'sectional',
          category: 'main',
          title: `[NON-NEGOTIABLE] ${secMatch.section}: ${secMatch.name}`,
          estimatedMinutes: secMatch.durationMinutes || 40,
          priority: 'high',
          programName: programs.find((p) => p.id === secMatch.programId)?.name || programs[0]?.name || 'Program',
          dueDate: secMatch.date,
          original: secMatch,
        });
        mainAssigned = true;
      }
    }

    // High priority test today if main not assigned
    if (!mainAssigned) {
      const todayMock = catMocks.find((m) => m.date === todayStr && m.overallScore === null);
      if (todayMock) {
        items.push({
          id: todayMock.id,
          kind: 'mock',
          category: 'main',
          title: todayMock.name,
          estimatedMinutes: todayMock.durationMinutes || 120,
          priority: 'high',
          programName: programs.find((p) => p.id === todayMock.programId)?.name || programs[0]?.name || 'Program',
          dueDate: todayMock.date,
          original: todayMock,
        });
        mainAssigned = true;
      }
    }

    // Overdue or Today high-priority task if main still empty
    if (!mainAssigned) {
      const highTask = tasks.find(
        (t) => t.status === 'pending' && (t.dueDate <= todayStr || t.priority === 'high')
      );
      if (highTask) {
        items.push({
          id: highTask.id,
          kind: 'task',
          category: 'main',
          title: highTask.title,
          estimatedMinutes: highTask.estimatedMinutes || 60,
          priority: highTask.priority,
          programName: programs.find((p) => p.id === highTask.programId)?.name,
          dueDate: highTask.dueDate,
          original: highTask,
        });
        mainAssigned = true;
      }
    }

    // Secondary items (Up to 2)
    const secondaryCandidates = tasks.filter(
      (t) =>
        t.status === 'pending' &&
        !items.some((i) => i.id === t.id) &&
        (t.dueDate <= todayStr || t.priority === 'medium' || t.priority === 'high')
    );

    secondaryCandidates.slice(0, 2).forEach((t) => {
      items.push({
        id: t.id,
        kind: 'task',
        category: 'secondary',
        title: t.title,
        estimatedMinutes: t.estimatedMinutes || 45,
        priority: t.priority,
        programName: programs.find((p) => p.id === t.programId)?.name,
        dueDate: t.dueDate,
        original: t,
      });
    });

    // Quick Wins (Up to 2 tasks <= 30 mins)
    const quickWinCandidates = tasks.filter(
      (t) =>
        t.status === 'pending' &&
        !items.some((i) => i.id === t.id) &&
        (t.estimatedMinutes || 30) <= 30
    );

    quickWinCandidates.slice(0, 2).forEach((t) => {
      items.push({
        id: t.id,
        kind: 'task',
        category: 'quick_win',
        title: t.title,
        estimatedMinutes: t.estimatedMinutes || 20,
        priority: t.priority,
        programName: programs.find((p) => p.id === t.programId)?.name,
        dueDate: t.dueDate,
        original: t,
      });
    });

    setFocusItems(items);
    if (currentUser?.uid) {
      localStorage.setItem(`academicos_focus_plan_${currentUser.uid}_${todayStr}`, JSON.stringify(items));
    }
  };

  // Load or generate focus items on mount / date change
  useEffect(() => {
    if (!currentUser?.uid) {
      setFocusItems([]);
      return;
    }
    const key = `academicos_focus_plan_${currentUser.uid}_${todayStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setFocusItems(JSON.parse(saved));
      } catch (e) {
        generateFocusPlan();
      }
    } else {
      generateFocusPlan();
    }
  }, [todayStr, tasks.length, currentUser?.uid]);

  const removeFocusItem = (id: string) => {
    const updated = focusItems.filter((i) => i.id !== id);
    setFocusItems(updated);
    if (currentUser?.uid) {
      localStorage.setItem(`academicos_focus_plan_${currentUser.uid}_${todayStr}`, JSON.stringify(updated));
    }
  };

  const moveFocusItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= focusItems.length) return;
    const updated = [...focusItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFocusItems(updated);
    if (currentUser?.uid) {
      localStorage.setItem(`academicos_focus_plan_${currentUser.uid}_${todayStr}`, JSON.stringify(updated));
    }
  };

  // Planned Capacity calculation
  const plannedCapacityMins = focusItems.reduce((acc, i) => acc + i.estimatedMinutes, 0);
  const remainingMins = availableCapacityMins - plannedCapacityMins;
  const isOverCapacity = remainingMins < 0;

  // Recurring Tasks today
  const todayRecurringTasks = tasks.filter((t) => {
    if (!t.isRecurring || t.isPaused) return false;
    if (t.recurrenceType === 'daily') return true;
    if (t.recurrenceType === 'weekdays') {
      const day = new Date().getDay();
      return day >= 1 && day <= 5;
    }
    return t.dueDate === todayStr;
  });

  // Today's Schedule Aggregation
  const todaySchedule = [
    ...catMocks
      .filter((m) => m.date === todayStr)
      .map((m) => ({
        id: m.id,
        type: 'Mock Test' as const,
        title: m.name,
        time: m.startTime || 'Anytime',
        status: m.overallScore !== null ? 'completed' : 'pending',
      })),
    ...catSectionals
      .filter((s) => s.date === todayStr)
      .map((s) => ({
        id: s.id,
        type: 'Sectional Test' as const,
        title: `${s.section}: ${s.name}`,
        time: s.startTime || 'Anytime',
        status: s.score !== null ? 'completed' : 'pending',
      })),
    ...tasks
      .filter((t) => t.dueDate === todayStr && t.status === 'pending')
      .map((t) => ({
        id: t.id,
        type: 'Task' as const,
        title: t.title,
        time: 'Today',
        status: t.status,
      })),
  ];

  // Active programs
  const activePrograms = programs.filter((p) => !p.archived);

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Welcome Banner for empty workspace */}
      {programs.length === 0 && (
        <div className="bg-gradient-to-r from-teal-950/40 via-zinc-900 to-indigo-950/40 border border-teal-500/30 p-6 rounded-2xl space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>Welcome to Academicos</span> 👋
            </h3>
            <p className="text-xs text-zinc-400">
              Let's build your academic workspace. Add your programs, import syllabus, and schedule your tasks or tests.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 shrink-0">
            <button
              onClick={() => setCurrentView('programs')}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Program</span>
            </button>
            <button
              onClick={() => setCurrentView('smart_import')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Import Syllabus</span>
            </button>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create First Task</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. GREETING + DATE + STREAK */}
      <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome Back, {currentUser?.name || 'Academic'}!
          </h2>
          <p className="text-xs text-slate-400">
            Systemic Academic Hub &bull; Action-First Dashboard
          </p>
        </div>

        {/* Streak Indicator Widget */}
        <div className="bg-zinc-950/80 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-amber-300">
                🔥 {streakInfo.currentStreak}-Day Academic Streak
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                Best: {streakInfo.bestStreak}d
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {streakInfo.hasActivityToday
                ? 'Activity logged today! Streak safely maintained.'
                : 'Complete one academic activity today to keep it going.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. DAILY CHECK-IN CALLOUT */}
      {!todayCheckIn ? (
        <div className="bg-gradient-to-r from-teal-950/40 via-zinc-900 to-purple-950/30 border border-teal-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100">Daily Check-In Incomplete</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set today's available time, energy level, and non-negotiable target to align your focus plan.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDailyCheckInOpen(true)}
            className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Start Check-In</span>
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900/80 border border-teal-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Today's Check-In Completed</span>
                <span className="font-mono text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                  {Math.round(todayCheckIn.availableMinutes / 60)}h available &bull; {todayCheckIn.energy || 'normal'} energy
                </span>
              </div>
              {todayCheckIn.note && (
                <p className="text-zinc-400 text-[11px] mt-0.5 truncate">
                  Note: {todayCheckIn.note}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsDailyCheckInOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 font-bold text-xs shrink-0 cursor-pointer border border-zinc-700 transition-all"
          >
            Edit Check-In
          </button>
        </div>
      )}

      {/* 3. TODAY'S FOCUS & CAPACITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Focus Card - 8 Cols */}
        <div className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm text-zinc-100">Today's Focus Plan</h3>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                (1 Main &bull; 2 Secondary &bull; 2 Quick Wins)
              </span>
              <ContextualHelp topic="todays_focus" />
            </div>

            <button
              onClick={generateFocusPlan}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate Suggestions</span>
            </button>
          </div>

          {/* Focus Items List */}
          <div className="space-y-2.5">
            {focusItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.category === 'main'
                    ? 'bg-purple-950/20 border-purple-500/40 text-purple-100'
                    : item.category === 'secondary'
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      if (item.kind === 'task') toggleTaskStatus(item.id);
                    }}
                    className="w-5 h-5 rounded border border-zinc-600 flex items-center justify-center shrink-0 cursor-pointer hover:border-teal-400"
                  >
                    {item.kind === 'task' && (item.original as Task).status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    )}
                  </button>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{item.title}</span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                          item.category === 'main'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : item.category === 'secondary'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{item.programName || 'General'}</span>
                      <span>&bull; {item.estimatedMinutes} mins</span>
                      {item.dueDate && <span>&bull; Due {item.dueDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setIsStudyTimerModalOpen(true);
                      startStudyTimer(
                        (item.original as any).programId || 'prog-cat-2026',
                        (item.original as any).subjectId || 'subj-varc',
                        (item.original as any).topicId
                      );
                    }}
                    className="p-1.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Study</span>
                  </button>

                  <button
                    onClick={() => moveFocusItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveFocusItem(index, 'down')}
                    disabled={index === focusItems.length - 1}
                    className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeFocusItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {focusItems.length === 0 && (
              <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center space-y-2">
                <p className="text-xs text-zinc-400">No focus plan generated yet for today.</p>
                <button
                  onClick={generateFocusPlan}
                  className="bg-teal-500 text-zinc-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                >
                  Generate Focus Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Capacity & Quick Study - 4 Cols */}
        <div className="lg:col-span-4 space-y-4">
          {/* Capacity Box */}
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="font-bold text-xs text-zinc-200">Daily Study Capacity</span>
              <span className="text-[10px] font-mono text-zinc-400">
                {Math.round(plannedCapacityMins / 60)}h / {Math.round(availableCapacityMins / 60)}h
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Available</span>
                <span className="font-bold text-teal-400 font-mono">
                  {Math.round(availableCapacityMins / 60)} hrs
                </span>
              </div>
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Planned</span>
                <span className="font-bold text-purple-400 font-mono">
                  {Math.round(plannedCapacityMins / 60)} hrs
                </span>
              </div>
              <div
                className={`bg-zinc-950 p-2 rounded-xl border ${
                  isOverCapacity ? 'border-rose-500/40 text-rose-400' : 'border-zinc-800 text-emerald-400'
                }`}
              >
                <span className="text-[10px] text-zinc-500 block">Status</span>
                <span className="font-bold text-[10px] font-mono">
                  {isOverCapacity ? 'Over Capacity' : `${Math.round(remainingMins / 60)}h Free`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Study Start Widget */}
          <div className="bg-gradient-to-br from-teal-950/30 to-zinc-900 border border-teal-500/30 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs text-zinc-100">Quick Study Session</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400">2-3 clicks</span>
            </div>

            <p className="text-xs text-zinc-400">
              Launch timer immediately with recent or target subject combinations.
            </p>

            <button
              onClick={() => setIsStudyTimerModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Study Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S RECURRING TASKS & SCHEDULE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Recurring Tasks - 6 Cols */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="font-bold text-sm text-zinc-100">Today's Recurring Tasks</h3>
            <span className="text-[10px] font-mono text-zinc-400">
              {todayRecurringTasks.filter((t) => t.status === 'completed').length}/
              {todayRecurringTasks.length} Done
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
            {todayRecurringTasks.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center shrink-0"
                  >
                    {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                  <span className="font-medium text-zinc-200 truncate">{t.title}</span>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 shrink-0">
                  {t.recurrenceType}
                </span>
              </div>
            ))}

            {todayRecurringTasks.length === 0 && (
              <p className="text-xs text-zinc-500 py-4 text-center">No recurring tasks due today.</p>
            )}
          </div>
        </div>

        {/* Today's Schedule - 6 Cols */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="font-bold text-sm text-zinc-100">Today's Schedule & Tests</h3>
            <span className="text-[10px] font-mono text-zinc-400">{todaySchedule.length} Items</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
            {todaySchedule.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200 truncate">{item.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">{item.time}</span>
                </div>

                <button
                  onClick={() => setCurrentView('tasks')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold shrink-0"
                >
                  View
                </button>
              </div>
            ))}

            {todaySchedule.length === 0 && (
              <p className="text-xs text-zinc-500 py-4 text-center">No tests or timed tasks scheduled for today.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. COMPACT PROGRAM PROGRESS */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-zinc-100 border-b border-[#27272A] pb-2">
          Compact Program Progress
        </h3>

        {activePrograms.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center space-y-2">
            <p className="text-xs text-zinc-400">No active programs yet.</p>
            <button
              onClick={() => setCurrentView('programs')}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Add your first Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activePrograms.map((prog) => {
              const progTopics = topics.filter((t) => t.programId === prog.id);
              const completedCount = progTopics.filter((t) => t.status === 'completed').length;
              const pct = progTopics.length > 0 ? Math.round((completedCount / progTopics.length) * 100) : 0;

              return (
                <div
                  key={prog.id}
                  onClick={() => {
                    setSelectedProgramId(prog.id);
                    setCurrentView(prog.type === 'competitive_exam' ? 'cat_overview' : 'programs');
                  }}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-200">{prog.name}</span>
                    <span className="font-mono text-xs font-bold text-teal-400">{pct}%</span>
                  </div>

                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono block">
                    {completedCount} / {progTopics.length} Topics Completed
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

