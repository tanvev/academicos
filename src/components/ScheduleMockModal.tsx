import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, Award, Target, FileCheck, Layers, Trash2, AlertTriangle } from 'lucide-react';
import { CATMock, CATSectional, RecurrenceType } from '../types';

interface ScheduleMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  existingMock?: CATMock | CATSectional;
  existingType?: 'mock' | 'sectional';
}

export const ScheduleMockModal: React.FC<ScheduleMockModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  existingMock,
  existingType,
}) => {
  const { programs, scheduleMock, updateCATMock, updateCATSectional, deleteCATMock, deleteCATSectional } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [testType, setTestType] = useState<
    'full_cat' | 'varc_sectional' | 'dilr_sectional' | 'qa_sectional' | 'other_test'
  >('full_cat');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('IMS');
  const [programId, setProgramId] = useState(programs[0]?.id || 'prog-cat-2026');

  useEffect(() => {
    if (programs.length > 0 && (!programId || !programs.some((p) => p.id === programId))) {
      setProgramId(programs[0].id);
    }
  }, [programs, programId]);
  const [date, setDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [analysisDeadline, setAnalysisDeadline] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('weekly');
  const [notes, setNotes] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      // Default analysis deadline to 1 day after scheduled date
      const d = new Date(initialDate);
      d.setDate(d.getDate() + 1);
      setAnalysisDeadline(d.toISOString().split('T')[0]);
    }
  }, [initialDate]);

  useEffect(() => {
    if (existingMock) {
      setName(existingMock.name);
      setProvider(existingMock.provider || 'IMS');
      setDate(existingMock.date);
      setStartTime(existingMock.startTime || '10:00 AM');
      setDurationMinutes(existingMock.durationMinutes || 120);
      setNotes(existingMock.notes || '');
      setAnalysisDeadline(existingMock.analysisDeadline || '');
      if (existingType === 'sectional') {
        const sec = (existingMock as CATSectional).section;
        setTestType(sec === 'VARC' ? 'varc_sectional' : sec === 'DILR' ? 'dilr_sectional' : 'qa_sectional');
      } else {
        setTestType((existingMock as CATMock).testType || 'full_cat');
      }
    }
  }, [existingMock, existingType]);

  if (!isOpen) return null;

  const handleTestTypeChange = (type: typeof testType) => {
    setTestType(type);
    if (type === 'full_cat' || type === 'other_test') {
      setDurationMinutes(120);
    } else {
      setDurationMinutes(40);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (existingMock) {
      if (existingType === 'mock') {
        updateCATMock(existingMock.id, {
          name: name.trim(),
          provider: provider || 'IMS',
          date,
          startTime: startTime || '10:00 AM',
          durationMinutes: durationMinutes || 120,
          notes: notes || '',
          analysisDeadline: analysisDeadline || '',
          status: 'rescheduled',
        });
      } else {
        updateCATSectional(existingMock.id, {
          name: name.trim(),
          provider: provider || 'General',
          date,
          startTime: startTime || '06:00 PM',
          durationMinutes: durationMinutes || 40,
          notes: notes || '',
          analysisDeadline: analysisDeadline || '',
          status: 'rescheduled',
        });
      }
    } else {
      scheduleMock({
        name: name.trim(),
        provider: provider || 'IMS',
        date,
        startTime: startTime || '10:00 AM',
        durationMinutes,
        testType,
        programId,
        analysisDeadline: analysisDeadline || '',
        notes: notes || '',
        isRecurring: !!isRecurring,
        recurrenceType: isRecurring ? recurrenceType : null,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-sm text-zinc-100">
              {existingMock ? 'Reschedule Mock / Test' : 'Schedule Mock or Test'}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Test Type Selector */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-1.5">Test Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'full_cat', label: 'Full CAT Mock', icon: Award, color: 'text-purple-400' },
                { id: 'varc_sectional', label: 'VARC Sectional', icon: FileCheck, color: 'text-amber-400' },
                { id: 'dilr_sectional', label: 'DILR Sectional', icon: FileCheck, color: 'text-teal-400' },
                { id: 'qa_sectional', label: 'QA Sectional', icon: FileCheck, color: 'text-emerald-400' },
                { id: 'other_test', label: 'Other Exam/Test', icon: Target, color: 'text-cyan-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSel = testType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTestTypeChange(item.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
                      isSel
                        ? 'bg-purple-950/40 border-purple-500/60 text-zinc-100'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="font-bold text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                Mock / Test Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Mock Test 01, Sectional Test 02"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                <option value="IMS">IMS SimCAT</option>
                <option value="Career Launcher">Career Launcher AIMCAT / Prime</option>
                <option value="TIME">TIME AIMCAT</option>
                <option value="Cracku">Cracku Daily / Mock</option>
                <option value="iQuanta">iQuanta</option>
                <option value="Other">Other Provider</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Program */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM (Standard Slot 1)</option>
                <option value="02:00 PM">02:00 PM (Standard Slot 2)</option>
                <option value="06:00 PM">06:00 PM (Evening Slot)</option>
                <option value="08:00 PM">08:00 PM (Night Slot)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">Program</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Analysis Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                Expected Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                Analysis Due Date (Optional)
              </label>
              <input
                type="date"
                value={analysisDeadline}
                onChange={(e) => setAnalysisDeadline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Recurrence option */}
          {!existingMock && (
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-purple-500 focus:ring-0"
                />
                <span className="font-semibold text-zinc-300">Set as Recurring Test Schedule</span>
              </label>

              {isRecurring && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-400">Repeats:</span>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 text-xs focus:outline-none"
                  >
                    <option value="weekly">Every Week</option>
                    <option value="biweekly">Every 2 Weeks</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-1">Strategy / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on DILR selection, VARC accuracy >75%"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {showConfirmDelete && (
            <div className="bg-rose-950/40 border border-rose-500/50 p-3.5 rounded-xl text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Confirm Deletion</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Are you sure you want to delete this test? This will permanently remove the canonical document from Firestore.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (existingMock) {
                      if (existingType === 'sectional') {
                        deleteCATSectional(existingMock.id);
                      } else {
                        deleteCATMock(existingMock.id);
                      }
                      setShowConfirmDelete(false);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            {existingMock && !showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/60 text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Test</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold transition-all shadow-md cursor-pointer text-xs"
              >
                {existingMock ? 'Save Rescheduled Date' : 'Schedule Mock'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
