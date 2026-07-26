import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Update } from '../types';
import { Calendar, Clock, AlertCircle, Bell, ExternalLink, CheckCircle2, X } from 'lucide-react';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  update: Update | null;
}

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({
  isOpen,
  onClose,
  update,
}) => {
  const { programs, addTask, setUserUpdateStates, setCurrentView } = useApp();

  const [title, setTitle] = useState('');
  const [programId, setProgramId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [reminder, setReminder] = useState('7 days before');

  useEffect(() => {
    if (update) {
      setTitle(update.title);
      setDueDate(update.actionableDeadline || update.publishedAt);

      // Best program match
      const matchedProg = programs.find((p) =>
        update.relevantPrograms.some(
          (rp) => p.id === rp || p.name.toLowerCase().includes(rp.toLowerCase())
        )
      );
      setProgramId(matchedProg ? matchedProg.id : programs[0]?.id || 'prog-cat-2026');
    }
  }, [update, programs]);

  if (!isOpen || !update) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !programId) return;

    // Create ONE canonical task
    const taskId = `task-deadline-${update.id}-${Date.now()}`;
    const newTask = {
      id: taskId,
      title: title.trim(),
      programId,
      type: 'deadline' as const,
      dueDate,
      dueTime,
      priority,
      status: 'pending' as const,
      notes: `Official Source: ${update.sourceName} (${update.sourceUrl}).\nReminder: ${reminder}.\n${update.summary}`,
      sourceUpdateId: update.id,
      sourceUrl: update.sourceUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addTask(newTask);

    // Link update state
    setUserUpdateStates((prev) => ({
      ...prev,
      [update.id]: {
        ...(prev[update.id] || {
          userId: 'usr-1',
          updateId: update.id,
          read: true,
          saved: true,
        }),
        deadlineCreated: true,
        deadlineTaskId: taskId,
      },
    }));

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="p-4 border-b border-[#27272A] flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              ADD TO PLANNER
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-semibold">Deadline Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
            />
          </div>

          {/* Program Select */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-semibold">Academic Program</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-400 font-semibold">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-semibold">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
              />
            </div>
          </div>

          {/* Priority & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-400 font-semibold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-semibold">Reminder Notification</label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-xl px-3 py-2 text-white outline-none font-medium"
              >
                <option value="7 days before">7 days before</option>
                <option value="3 days before">3 days before</option>
                <option value="1 day before">1 day before</option>
                <option value="On due date">On due date</option>
              </select>
            </div>
          </div>

          {/* Source Link info */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1 text-[11px]">
            <span className="text-slate-400 font-bold block">Original Update Source</span>
            <div className="flex items-center justify-between text-cyan-400">
              <span className="truncate pr-2">{update.sourceName}</span>
              <a
                href={update.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline text-cyan-300 font-mono text-[10px]"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Add to Planner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
