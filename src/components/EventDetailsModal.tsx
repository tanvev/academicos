import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Edit3,
  Tag,
  BookOpen,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Task, CATMock, CATSectional, StudySession } from '../types';

export interface CalendarEventItem {
  id: string;
  kind: 'task' | 'mock' | 'sectional' | 'analysis' | 'study_session';
  title: string;
  date: string;
  startTime?: string;
  status: 'pending' | 'completed' | 'scheduled' | 'missed' | 'rescheduled';
  badgeText?: string;
  original: Task | CATMock | CATSectional | StudySession;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEventItem | null;
  onEditMock?: (mock: CATMock | CATSectional, type: 'mock' | 'sectional') => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEditMock,
}) => {
  const {
    programs,
    subjects,
    deleteTask,
    deleteCATMock,
    deleteCATSectional,
    deleteStudySession,
    toggleTaskStatus,
    updateCATMock,
    updateCATSectional,
  } = useApp();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !event) return null;

  // Determine underlying canonical entity type
  let entityType = 'Task';
  let collectionName = 'tasks';
  let icon = Calendar;
  let iconColor = 'text-cyan-400';

  if (event.kind === 'task') {
    const t = event.original as Task;
    if (t.type === 'assignment') {
      entityType = 'Assignment';
    } else if (t.type === 'deadline' || t.type === 'exam') {
      entityType = 'Deadline';
    } else {
      entityType = 'Task';
    }
    collectionName = 'tasks';
    icon = CheckCircle2;
    iconColor = 'text-cyan-400';
  } else if (event.kind === 'mock') {
    entityType = 'Mock / Test';
    collectionName = 'catMocks';
    icon = Award;
    iconColor = 'text-purple-400';
  } else if (event.kind === 'sectional') {
    entityType = 'Sectional';
    collectionName = 'catSectionals';
    icon = FileCheck;
    iconColor = 'text-amber-400';
  } else if (event.kind === 'study_session') {
    entityType = 'Study Session';
    collectionName = 'studySessions';
    icon = BookOpen;
    iconColor = 'text-emerald-400';
  } else if (event.kind === 'analysis') {
    entityType = 'Analysis Deadline';
    const isMock = 'overallScore' in event.original || 'varc' in event.original;
    collectionName = isMock ? 'catMocks' : 'catSectionals';
    icon = AlertCircle;
    iconColor = 'text-sky-400';
  }

  const IconComp = icon;

  const handleCloseModal = () => {
    setShowConfirmDelete(false);
    onClose();
  };

  const handleDelete = () => {
    if (!event) return;

    if (event.kind === 'task') {
      deleteTask(event.original.id);
    } else if (event.kind === 'mock') {
      deleteCATMock(event.original.id);
    } else if (event.kind === 'sectional') {
      deleteCATSectional(event.original.id);
    } else if (event.kind === 'study_session') {
      deleteStudySession(event.original.id);
    } else if (event.kind === 'analysis') {
      const isMock = 'overallScore' in event.original || 'varc' in event.original;
      if (isMock) {
        updateCATMock(event.original.id, { analysisDeadline: '' });
      } else {
        updateCATSectional(event.original.id, { analysisDeadline: '' });
      }
    }

    handleCloseModal();
  };

  // Helper renderers for details
  const renderDetails = () => {
    if (event.kind === 'task') {
      const t = event.original as Task;
      const prog = programs.find((p) => p.id === t.programId);
      const subj = subjects.find((s) => s.id === t.subjectId);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">Due Date & Time</span>
              <span className="font-semibold text-zinc-200">
                {t.dueDate} {t.dueTime ? `@ ${t.dueTime}` : ''}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Priority</span>
              <span
                className={`font-semibold capitalize ${
                  t.priority === 'high'
                    ? 'text-rose-400'
                    : t.priority === 'medium'
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {t.priority} Priority
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Program & Subject</span>
              <span className="font-semibold text-zinc-200">
                {prog?.name || 'General'} {subj ? `• ${subj.name}` : ''}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Estimated Time</span>
              <span className="font-semibold text-zinc-200">
                {t.estimatedMinutes ? `${t.estimatedMinutes} mins` : 'N/A'}
              </span>
            </div>
          </div>

          {t.isRecurring && (
            <div className="bg-purple-950/20 border border-purple-500/30 p-2.5 rounded-xl text-xs text-purple-300">
              <span className="font-semibold">Recurring Rule: </span>
              <span className="capitalize">{t.recurrenceType || 'Weekly'}</span>
            </div>
          )}

          {t.notes && (
            <div>
              <span className="text-zinc-500 text-[10px] font-semibold block mb-1">Notes / Instructions</span>
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
                {t.notes}
              </p>
            </div>
          )}

          {t.sourceUrl && (
            <a
              href={t.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/30"
            >
              <span>View Source / Attachment</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      );
    }

    if (event.kind === 'mock') {
      const m = event.original as CATMock;
      const prog = programs.find((p) => p.id === m.programId);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">Scheduled Date & Time</span>
              <span className="font-semibold text-zinc-200">
                {m.date} {m.startTime ? `@ ${m.startTime}` : ''}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Provider / Series</span>
              <span className="font-semibold text-purple-300">{m.provider || 'IMS'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Program</span>
              <span className="font-semibold text-zinc-200">{prog?.name || 'CAT Prep'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Duration</span>
              <span className="font-semibold text-zinc-200">
                {m.durationMinutes || 120} minutes
              </span>
            </div>
          </div>

          {(m.overallScore !== null || m.overallPercentile !== null) && (
            <div className="bg-purple-950/30 border border-purple-500/40 p-3 rounded-xl text-xs space-y-2">
              <span className="text-purple-300 font-bold block">Score Summary</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Overall Score</span>
                  <span className="font-mono font-bold text-purple-200 text-sm">{m.overallScore ?? 'N/A'}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Percentile</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{m.overallPercentile ?? 'N/A'}%</span>
                </div>
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Accuracy</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{m.accuracy ? `${m.accuracy}%` : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {m.analysisDeadline && (
            <div className="bg-sky-950/20 border border-sky-500/30 p-2.5 rounded-xl text-xs text-sky-300 flex items-center justify-between">
              <span>Analysis Deadline:</span>
              <span className="font-mono font-bold">{m.analysisDeadline}</span>
            </div>
          )}

          {m.notes && (
            <div>
              <span className="text-zinc-500 text-[10px] font-semibold block mb-1">Notes / Plan</span>
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
                {m.notes}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (event.kind === 'sectional') {
      const s = event.original as CATSectional;

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">Section</span>
              <span className="font-bold text-amber-400">{s.section}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Scheduled Date</span>
              <span className="font-semibold text-zinc-200">{s.date} {s.startTime ? `@ ${s.startTime}` : ''}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Provider</span>
              <span className="font-semibold text-zinc-300">{s.provider || 'General'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Duration</span>
              <span className="font-semibold text-zinc-200">{s.durationMinutes || 40} mins</span>
            </div>
          </div>

          {s.score !== null && (
            <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-xs space-y-2">
              <span className="text-amber-300 font-bold block">Sectional Result</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Score</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{s.score} pts</span>
                </div>
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Accuracy</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{s.accuracy ? `${s.accuracy}%` : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {s.notes && (
            <div>
              <span className="text-zinc-500 text-[10px] font-semibold block mb-1">Notes</span>
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
                {s.notes}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (event.kind === 'study_session') {
      const ss = event.original as StudySession;
      const prog = programs.find((p) => p.id === ss.programId);
      const subj = subjects.find((s) => s.id === ss.subjectId);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">Date & Start Time</span>
              <span className="font-semibold text-zinc-200">{ss.date} {ss.startTime ? `@ ${ss.startTime}` : ''}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Duration</span>
              <span className="font-semibold text-emerald-400">{ss.durationMinutes} minutes</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Program & Subject</span>
              <span className="font-semibold text-zinc-200">{prog?.name || 'Academic'} • {subj?.name || 'Subject'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Questions Attempted</span>
              <span className="font-semibold text-zinc-200">
                {ss.questionsAttempted ? `${ss.questionsCorrect || 0}/${ss.questionsAttempted}` : 'N/A'}
              </span>
            </div>
          </div>

          {ss.notes && (
            <div>
              <span className="text-zinc-500 text-[10px] font-semibold block mb-1">Session Notes</span>
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
                {ss.notes}
              </p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200 relative">
        {/* Top bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <IconComp className={`w-4 h-4 ${iconColor}`} />
            <span className="font-bold text-sm text-zinc-100">Event Details</span>
          </div>

          <button onClick={handleCloseModal} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Header Title & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">
                {entityType}
              </span>
              <span className="bg-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded-md border border-zinc-700/60">
                Collection: {collectionName}
              </span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-md capitalize font-semibold ${
                  event.status === 'completed'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : event.status === 'missed'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {event.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100">{event.title}</h3>
          </div>

          {/* Details Body */}
          {renderDetails()}

          {/* Confirmation Box when Delete clicked */}
          {showConfirmDelete && (
            <div className="bg-rose-950/40 border border-rose-500/50 p-3.5 rounded-xl text-rose-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Confirm Deletion</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Are you sure you want to delete this <strong className="text-white">{entityType}</strong>? This action will permanently delete the document from Firestore collection <code className="text-rose-300 bg-black/40 px-1 rounded">{collectionName}</code>.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showConfirmDelete && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/60 text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all text-xs"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Event</span>
            </button>

            <div className="flex items-center gap-2">
              {event.kind === 'task' && (
                <button
                  type="button"
                  onClick={() => {
                    toggleTaskStatus(event.original.id);
                    handleCloseModal();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-200 font-bold flex items-center gap-1.5 cursor-pointer transition-all text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>
                    {(event.original as Task).status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                  </span>
                </button>
              )}

              {(event.kind === 'mock' || event.kind === 'sectional' || event.kind === 'analysis') && onEditMock && (
                <button
                  type="button"
                  onClick={() => {
                    const isMock = event.kind === 'mock' || ('overallScore' in event.original);
                    onEditMock(event.original as any, isMock ? 'mock' : 'sectional');
                    handleCloseModal();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-purple-200 font-bold flex items-center gap-1.5 cursor-pointer transition-all text-xs"
                >
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  <span>Reschedule / Edit</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
