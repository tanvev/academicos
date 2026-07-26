import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContextualHelp } from '../components/ContextualHelp';
import {
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Search,
  List,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  FileCheck,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { Task, CATMock, CATSectional } from '../types';
import { ScheduleMockModal } from '../components/ScheduleMockModal';

export const TasksView: React.FC = () => {
  const {
    tasks,
    catMocks,
    catSectionals,
    programs,
    subjects,
    toggleTaskStatus,
    deleteTask,
    setIsQuickAddOpen,
    updateCATMock,
    updateCATSectional,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>(
    'today'
  );
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'cat' | 'tasks' | 'mocks' | 'sectionals'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  // Schedule Mock Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDateForMock, setSelectedDateForMock] = useState<string | undefined>();
  const [editingMockItem, setEditingMockItem] = useState<{
    mock: CATMock | CATSectional;
    type: 'mock' | 'sectional';
  } | null>(null);

  // Calendar Date Navigation (Offset in weeks)
  const [weekOffset, setWeekOffset] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to determine missed mocks
  const getMockStatus = (m: CATMock | CATSectional): 'scheduled' | 'completed' | 'missed' | 'rescheduled' => {
    if ((m.status as string) === 'completed' || (m as CATMock).overallScore !== null || (m as CATSectional).score !== null) {
      return 'completed';
    }
    if (m.date < todayStr && (m.status as string) !== 'completed') {
      return 'missed';
    }
    return m.status || 'scheduled';
  };

  // Filter tasks based on activeTab
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }
    if (programFilter !== 'all' && task.programId !== programFilter) {
      return false;
    }
    if (activeTab === 'today') return task.status === 'pending' && task.dueDate === todayStr;
    if (activeTab === 'upcoming') return task.status === 'pending' && task.dueDate > todayStr;
    if (activeTab === 'overdue') return task.status === 'pending' && task.dueDate < todayStr;
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pMap = { high: 1, medium: 2, low: 3 };
      return pMap[a.priority] - pMap[b.priority];
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return a.dueDate.localeCompare(b.dueDate);
  });

  // Calculate 28-day window for Calendar Grid based on weekOffset
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + weekOffset * 7); // Start on Sunday of current weekOffset

  const calendarDays: Array<{ dateStr: string; dateObj: Date; isToday: boolean }> = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    calendarDays.push({
      dateStr: dStr,
      dateObj: d,
      isToday: dStr === todayStr,
    });
  }

  // Aggregate items for a specific date
  const getItemsForDate = (dateStr: string) => {
    const items: Array<{
      id: string;
      kind: 'task' | 'mock' | 'sectional' | 'analysis';
      title: string;
      date: string;
      startTime?: string;
      status: 'pending' | 'completed' | 'scheduled' | 'missed' | 'rescheduled';
      badgeText?: string;
      original: Task | CATMock | CATSectional;
    }> = [];

    // 1. Tasks
    if (calendarFilter === 'all' || calendarFilter === 'tasks') {
      tasks
        .filter((t) => {
          if (programFilter !== 'all' && t.programId !== programFilter) return false;
          if (t.dueDate === dateStr) return true;
          if (t.isRecurring && !t.isPaused && t.dueDate <= dateStr) {
            if (t.recurrenceType === 'daily') return true;
            if (t.recurrenceType === 'weekdays') {
              const day = new Date(dateStr).getDay();
              return day >= 1 && day <= 5;
            }
          }
          return false;
        })
        .forEach((t) => {
          items.push({
            id: t.id,
            kind: 'task',
            title: t.title,
            date: dateStr,
            status: t.status === 'completed' ? 'completed' : dateStr < todayStr ? 'missed' : 'pending',
            badgeText: t.type.toUpperCase(),
            original: t,
          });
        });
    }

    // 2. Full CAT Mocks
    if (calendarFilter === 'all' || calendarFilter === 'cat' || calendarFilter === 'mocks') {
      catMocks
        .filter((m) => {
          if (programFilter !== 'all' && m.programId && m.programId !== programFilter) return false;
          return m.date === dateStr;
        })
        .forEach((m) => {
          const st = getMockStatus(m);
          items.push({
            id: m.id,
            kind: 'mock',
            title: `${m.name}`,
            date: m.date,
            startTime: m.startTime,
            status: st,
            badgeText: st === 'completed' ? `${m.overallScore ?? '-'}m (${m.overallPercentile ?? '-'}%)` : m.provider || 'CAT',
            original: m,
          });
        });

      // Check for Mock Analysis Deadlines
      catMocks
        .filter((m) => {
          if (programFilter !== 'all' && m.programId && m.programId !== programFilter) return false;
          return m.analysisDeadline === dateStr || (m as any).analysisDueDate === dateStr;
        })
        .forEach((m) => {
          items.push({
            id: `analysis-${m.id}`,
            kind: 'analysis',
            title: `Analyse: ${m.name}`,
            date: dateStr,
            status: m.analysisStatus === 'analysed' ? 'completed' : 'pending',
            badgeText: 'ANALYSIS DUE',
            original: m,
          });
        });
    }

    // 3. CAT Sectionals
    if (calendarFilter === 'all' || calendarFilter === 'cat' || calendarFilter === 'sectionals') {
      catSectionals
        .filter((s) => {
          if (programFilter !== 'all' && s.programId && s.programId !== programFilter) return false;
          return s.date === dateStr;
        })
        .forEach((s) => {
          const st = getMockStatus(s);
          items.push({
            id: s.id,
            kind: 'sectional',
            title: `${s.section}: ${s.name}`,
            date: s.date,
            startTime: s.startTime,
            status: st,
            badgeText: st === 'completed' ? `${s.score ?? '-'}m` : s.section,
            original: s,
          });
        });

      // Sectional Analysis Deadlines
      catSectionals
        .filter((s) => {
          if (programFilter !== 'all' && s.programId && s.programId !== programFilter) return false;
          return s.analysisDeadline === dateStr || (s as any).analysisDueDate === dateStr;
        })
        .forEach((s) => {
          items.push({
            id: `analysis-${s.id}`,
            kind: 'analysis',
            title: `Analyse: ${s.section} ${s.name}`,
            date: dateStr,
            status: 'pending',
            badgeText: 'ANALYSIS DUE',
            original: s,
          });
        });
    }

    return items;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-zinc-100">Academicos Calendar</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Unified view of Tasks, Deadlines, Full CAT Mocks & Sectional Tests.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <ContextualHelp topic="recurring_tasks" />

          <button
            onClick={() => {
              setSelectedDateForMock(todayStr);
              setEditingMockItem(null);
              setIsScheduleModalOpen(true);
            }}
            className="bg-purple-500 hover:bg-purple-400 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Schedule Mock</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls & Filters */}
      {viewMode === 'calendar' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 text-xs">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'cat', label: 'CAT Tests' },
                { id: 'mocks', label: 'Full Mocks' },
                { id: 'sectionals', label: 'Sectionals' },
                { id: 'tasks', label: 'Tasks & Deadlines' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCalendarFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    calendarFilter === f.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                title="Previous Weeks"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setWeekOffset(0)}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] hover:text-zinc-100 cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                title="Next Weeks"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-2 text-[11px] text-zinc-400 flex-wrap">
            <span className="font-semibold text-zinc-300">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>CAT Full Mock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Sectional Test</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Academic Task</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Missed / Overdue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-bold text-zinc-500 text-[10px] uppercase py-1">
                {d}
              </div>
            ))}

            {calendarDays.map(({ dateStr, dateObj, isToday }) => {
              const dayItems = getItemsForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  className={`p-2 min-h-[110px] sm:min-h-[125px] rounded-2xl border flex flex-col justify-between text-left transition-all ${
                    isToday
                      ? 'bg-purple-950/20 border-purple-500/60 shadow-xs ring-1 ring-purple-500/30'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span className={`font-semibold ${isToday ? 'text-purple-400 font-bold' : ''}`}>
                      {dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedDateForMock(dateStr);
                        setEditingMockItem(null);
                        setIsScheduleModalOpen(true);
                      }}
                      className="text-zinc-600 hover:text-purple-300 p-0.5 rounded transition-colors cursor-pointer"
                      title="Schedule Mock on this day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Day Items List */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[90px] custom-scrollbar pr-0.5">
                    {dayItems.map((item) => {
                      if (item.kind === 'mock') {
                        const m = item.original as CATMock;
                        const isMissed = item.status === 'missed';
                        const isCompleted = item.status === 'completed';

                        return (
                          <div
                            key={item.id}
                            className={`p-1.5 rounded-xl text-[10px] border transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : isMissed
                                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                                : 'bg-purple-950/40 border-purple-500/50 text-purple-200 hover:bg-purple-900/50'
                            }`}
                            onClick={() => {
                              setEditingMockItem({ mock: m, type: 'mock' });
                              setIsScheduleModalOpen(true);
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate">{item.title}</span>
                              {item.badgeText && (
                                <span className="text-[9px] font-mono shrink-0 px-1 rounded bg-black/40">
                                  {item.badgeText}
                                </span>
                              )}
                            </div>
                            {item.startTime && (
                              <div className="text-[9px] text-zinc-400 mt-0.5 flex items-center justify-between">
                                <span>{item.startTime}</span>
                                {isMissed && <span className="text-rose-400 font-bold">Missed</span>}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.kind === 'sectional') {
                        const sec = item.original as CATSectional;
                        const isMissed = item.status === 'missed';
                        const isCompleted = item.status === 'completed';

                        return (
                          <div
                            key={item.id}
                            className={`p-1.5 rounded-xl text-[10px] border transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : isMissed
                                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                                : 'bg-amber-950/40 border-amber-500/50 text-amber-200 hover:bg-amber-900/50'
                            }`}
                            onClick={() => {
                              setEditingMockItem({ mock: sec, type: 'sectional' });
                              setIsScheduleModalOpen(true);
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate">{item.title}</span>
                              <span className="text-[9px] font-mono shrink-0 px-1 rounded bg-black/40">
                                {item.badgeText}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      if (item.kind === 'analysis') {
                        const isMock = 'overallScore' in item.original || 'varc' in item.original;
                        return (
                          <div
                            key={item.id}
                            className="p-1.5 rounded-xl text-[10px] border border-sky-500/50 bg-sky-950/40 text-sky-200 hover:bg-sky-900/50 cursor-pointer transition-all"
                            onClick={() => {
                              setEditingMockItem({ mock: item.original as any, type: isMock ? 'mock' : 'sectional' });
                              setIsScheduleModalOpen(true);
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate">{item.title}</span>
                              <span className="text-[8px] font-mono shrink-0 px-1 rounded bg-sky-900/80 text-sky-200 font-bold">
                                ANALYSIS
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Task item
                      const t = item.original as Task;
                      const isCompleted = t.status === 'completed';
                      const isOverdue = item.status === 'missed';

                      return (
                        <div
                          key={item.id}
                          className={`p-1 rounded-lg text-[9.5px] border flex items-center justify-between gap-1 ${
                            isCompleted
                              ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500 line-through'
                              : isOverdue
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                              : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                          }`}
                        >
                          <span className="truncate">{t.title}</span>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(t.id);
                            }}
                            className="w-3 h-3 rounded text-cyan-500 bg-zinc-900 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All Tasks' },
            ].map((tab) => {
              const count = tasks.filter((t) => {
                if (tab.id === 'today') return t.status === 'pending' && t.dueDate === todayStr;
                if (tab.id === 'upcoming') return t.status === 'pending' && t.dueDate > todayStr;
                if (tab.id === 'overdue') return t.status === 'pending' && t.dueDate < todayStr;
                if (tab.id === 'completed') return t.status === 'completed';
                return true;
              }).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 text-cyan-400 border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Task Title & Details</span>
              <span>Due Date & Priority</span>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {sortedTasks.map((task) => {
                const prog = programs.find((p) => p.id === task.programId);
                const subj = subjects.find((s) => s.id === task.subjectId);
                const isOverdue = task.status === 'pending' && task.dueDate < todayStr;

                return (
                  <div
                    key={task.id}
                    className={`p-3 hover:bg-zinc-800/40 flex items-center justify-between gap-3 text-xs transition-colors ${
                      isOverdue ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleTaskStatus(task.id)}
                        className="w-4 h-4 rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500/20 bg-zinc-900 cursor-pointer"
                      />

                      <div>
                        <p
                          className={`font-semibold ${
                            task.status === 'completed'
                              ? 'line-through text-zinc-500'
                              : 'text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                          <span
                            className="font-mono text-[9px] px-1.5 py-0.2 rounded text-zinc-300 font-bold"
                            style={{ backgroundColor: `${prog?.color}20`, color: prog?.color }}
                          >
                            {prog?.name}
                          </span>
                          {subj && <span>&bull; {subj.name}</span>}
                          <span className="uppercase font-mono bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800 text-zinc-400">
                            {task.type}
                          </span>
                          {task.sourceUrl && (
                            <a
                              href={task.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[9px]"
                            >
                              <span>Official Source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono block ${
                            isOverdue
                              ? 'text-rose-400 font-bold'
                              : task.dueDate === todayStr
                              ? 'text-cyan-400 font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          {isOverdue ? `Overdue (${task.dueDate})` : task.dueDate}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {sortedTasks.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No tasks found matching this criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Mock Modal */}
      <ScheduleMockModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingMockItem(null);
        }}
        initialDate={selectedDateForMock}
        existingMock={editingMockItem?.mock}
        existingType={editingMockItem?.type}
      />
    </div>
  );
};

