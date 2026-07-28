import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Flame, Sparkles, X, Target, Clock, Zap, Plus } from 'lucide-react';

export const DailyCheckInModal: React.FC = () => {
  const {
    isDailyCheckInOpen,
    setIsDailyCheckInOpen,
    saveDailyCheckIn,
    dailyCheckIns,
    computeStreakInfo,
    tasks,
    catMocks,
    catSectionals,
    addTask,
    currentUser,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const existingCheckIn = dailyCheckIns.find((c) => c.date === todayStr);

  const [availableTimeOption, setAvailableTimeOption] = useState<string>('2-4h');
  const [customMinutes, setCustomMinutes] = useState<number>(180);
  const [energy, setEnergy] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedNonNegotiableId, setSelectedNonNegotiableId] = useState<string>('');
  const [createNewTask, setCreateNewTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isDailyCheckInOpen) {
      if (existingCheckIn) {
        setCustomMinutes(existingCheckIn.availableMinutes);
        setEnergy(existingCheckIn.energy || 'normal');
        setSelectedNonNegotiableId(existingCheckIn.nonNegotiableTaskId || '');
        setNote(existingCheckIn.note || '');
        
        const mins = existingCheckIn.availableMinutes;
        if (mins <= 45) setAvailableTimeOption('<1h');
        else if (mins <= 90) setAvailableTimeOption('1-2h');
        else if (mins <= 180) setAvailableTimeOption('2-4h');
        else if (mins <= 300) setAvailableTimeOption('4-6h');
        else setAvailableTimeOption('6h+');
      } else {
        setCustomMinutes(180);
        setAvailableTimeOption('2-4h');
        setEnergy('normal');
        setSelectedNonNegotiableId('');
        setCreateNewTask(false);
        setNewTaskTitle('');
        setNote('');
      }
    }
  }, [isDailyCheckInOpen, existingCheckIn]);

  // Listen for Escape key to close/skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDailyCheckInOpen && !isSubmitting) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDailyCheckInOpen, isSubmitting]);

  if (!isDailyCheckInOpen) return null;

  const handleSkip = () => {
    const key = currentUser?.uid ? `academicos_checkin_skipped_${currentUser.uid}_${todayStr}` : `academicos_checkin_skipped_${todayStr}`;
    sessionStorage.setItem(key, 'true');
    setIsDailyCheckInOpen(false);
  };

  // Filter tasks and tests for today / pending
  const todayPendingTasks = tasks.filter((t) => t.status === 'pending');
  const todayMocks = catMocks.filter((m) => m.date === todayStr);
  const todaySectionals = catSectionals.filter((s) => s.date === todayStr);

  const handleTimePreset = (preset: string, mins: number) => {
    setAvailableTimeOption(preset);
    setCustomMinutes(mins);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalNonNegotiableId = selectedNonNegotiableId;

      if (createNewTask && newTaskTitle.trim()) {
        const createdTaskId = `task-${Date.now()}`;
        addTask({
          title: newTaskTitle.trim(),
          programId: 'prog-cat-2026',
          dueDate: todayStr,
          priority: 'high',
          estimatedMinutes: 60,
          status: 'pending',
          type: 'study',
        });
        finalNonNegotiableId = createdTaskId;
      }

      saveDailyCheckIn(customMinutes, energy, finalNonNegotiableId || undefined, note || undefined);
      setIsDailyCheckInOpen(false);
    } catch (err) {
      console.error('Error saving daily check-in:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const streakInfo = computeStreakInfo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleSkip();
        }
      }}
    >
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-[#27272A] flex items-center justify-between bg-[#09090B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Academic Daily Check-In</h3>
              <p className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Streak Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-500" />
              <div>
                <p className="font-bold text-sm">🔥 {streakInfo.currentStreak}-Day Academic Streak!</p>
                <p className="text-[11px] text-amber-400/80">
                  {streakInfo.hasActivityToday
                    ? 'Activity recorded today! Keep the momentum going.'
                    : 'Complete one academic activity today to keep it going.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 px-2 py-1 rounded">
              Best: {streakInfo.bestStreak}d
            </span>
          </div>

          {/* 1. Available Study Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Available Study Time Today</span>
            </label>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[
                { id: '<1h', label: '< 1h', mins: 45 },
                { id: '1-2h', label: '1–2h', mins: 90 },
                { id: '2-4h', label: '2–4h', mins: 180 },
                { id: '4-6h', label: '4–6h', mins: 300 },
                { id: '6h+', label: '6h+', mins: 420 },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTimePreset(item.id, item.mins)}
                  className={`py-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                    availableTimeOption === item.id
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-400">
              <span>Selected:</span>
              <span className="font-mono font-bold text-teal-400">{Math.round(customMinutes / 60)} hours ({customMinutes} mins)</span>
            </div>
          </div>

          {/* 2. Energy Level */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Energy Level Today</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'low', label: 'Low', desc: 'Light practice & revision' },
                { id: 'normal', label: 'Normal', desc: 'Standard study routine' },
                { id: 'high', label: 'High', desc: 'Full mock or intense learning' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEnergy(lvl.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    energy === lvl.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold capitalize">{lvl.label}</div>
                  <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Non-Negotiable Item */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Non-Negotiable Task for Today</span>
            </label>

            {!createNewTask ? (
              <div className="space-y-2">
                <select
                  value={selectedNonNegotiableId}
                  onChange={(e) => setSelectedNonNegotiableId(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="">-- Select from existing tasks/tests --</option>
                  {todayMocks.map((m) => (
                    <option key={m.id} value={m.id}>
                      [Mock Test] {m.name}
                    </option>
                  ))}
                  {todaySectionals.map((s) => (
                    <option key={s.id} value={s.id}>
                      [Sectional] {s.section}: {s.name}
                    </option>
                  ))}
                  {todayPendingTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [Task] {t.title} ({t.dueDate})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setCreateNewTask(true)}
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Or quickly create a new non-negotiable task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Complete 2 VARC RCs + Logarithms PYQs"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setCreateNewTask(false)}
                  className="text-xs text-zinc-400 hover:underline cursor-pointer"
                >
                  Select from existing tasks instead
                </button>
              </div>
            )}
          </div>

          {/* 4. Optional Note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on accuracy over speed today"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#27272A]">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Starting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Start My Day</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

