import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  Plus,
  Calendar,
  BookOpen,
  BarChart3,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export const StudyTrackerView: React.FC = () => {
  const {
    studySessions,
    programs,
    subjects,
    topics,
    deleteStudySession,
    setIsStudyTimerModalOpen,
    setIsQuickAddOpen,
  } = useApp();

  const [programFilter, setProgramFilter] = useState<string>('all');

  const filteredSessions = studySessions.filter((s) => {
    if (programFilter !== 'all' && s.programId !== programFilter) return false;
    return true;
  });

  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const totalQuestions = filteredSessions.reduce(
    (acc, s) => acc + (s.questionsAttempted || 0),
    0
  );
  const totalCorrect = filteredSessions.reduce((acc, s) => acc + (s.questionsCorrect || 0), 0);
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-zinc-100">Study Tracker & History</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track study hours, questions attempted, accuracy, and detailed logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudyTimerModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Start Study Timer</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Past Study</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Total Study Hours
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalHours} <span className="text-xs font-normal text-zinc-400">hrs</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{filteredSessions.length} total sessions</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Questions Attempted
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{totalQuestions}</div>
          <p className="text-[10px] text-zinc-500 mt-1">{totalCorrect} correct answers</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Overall Accuracy %
          </span>
          <div className="text-2xl font-bold font-mono text-teal-400">{overallAccuracy}%</div>
          <p className="text-[10px] text-zinc-500 mt-1">Across practice sessions</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Avg Session Length
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {filteredSessions.length > 0
              ? Math.round(totalMinutes / filteredSessions.length)
              : 0}{' '}
            <span className="text-xs font-normal text-zinc-400">mins</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Per study log</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <span className="font-semibold text-zinc-300">Study Logs History</span>

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
      </div>

      {/* Sessions History Table */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>Date & Subject / Topic</span>
          <span>Duration & Questions</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredSessions.map((session) => {
            const prog = programs.find((p) => p.id === session.programId);
            const subj = subjects.find((s) => s.id === session.subjectId);
            const topic = topics.find((t) => t.id === session.topicId);

            const acc =
              session.questionsAttempted && session.questionsCorrect
                ? Math.round((session.questionsCorrect / session.questionsAttempted) * 100)
                : null;

            return (
              <div
                key={session.id}
                className="p-3.5 hover:bg-zinc-800/40 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {session.date}
                    </span>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded font-bold"
                      style={{ backgroundColor: `${prog?.color}20`, color: prog?.color }}
                    >
                      {prog?.name}
                    </span>
                    <span className="font-semibold text-zinc-200">{subj?.name}</span>
                  </div>

                  <p className="text-zinc-300 font-medium">{session.whatWasStudied}</p>

                  {topic && (
                    <p className="text-[10px] text-cyan-400">Topic: {topic.name}</p>
                  )}

                  {session.notes && (
                    <p className="text-[10px] text-zinc-500 italic">{session.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 font-mono text-sm block">
                      {session.durationMinutes} mins
                    </span>
                    {session.questionsAttempted ? (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {session.questionsCorrect ?? 0}/{session.questionsAttempted} Qs (
                        {acc ?? 0}%)
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Reading / Notes</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this study log?')) deleteStudySession(session.id);
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No study logs recorded yet. Use the Start Study Timer button to log your first session!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
