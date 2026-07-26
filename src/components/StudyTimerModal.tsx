import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Pause, Square, Clock } from 'lucide-react';
import { TopicStatus } from '../types';

export const StudyTimerModal: React.FC = () => {
  const {
    isStudyTimerModalOpen,
    setIsStudyTimerModalOpen,
    studyTimer,
    startStudyTimer,
    pauseStudyTimer,
    resumeStudyTimer,
    stopStudyTimer,
    discardStudyTimer,
    programs,
    subjects,
    topics,
  } = useApp();

  const [progId, setProgId] = useState(programs[0]?.id || '');
  const [subjId, setSubjId] = useState('');
  const [topicId, setTopicId] = useState('');

  // Log details
  const [whatStudied, setWhatStudied] = useState('');
  const [academicMode, setAcademicMode] = useState<'Studied' | 'Practised' | 'Revised' | 'Completed'>('Studied');
  const [qAttempted, setQAttempted] = useState<number | ''>('');
  const [qCorrect, setQCorrect] = useState<number | ''>('');
  const [setsAttempted, setSetsAttempted] = useState<number | ''>('');
  const [setsSolved, setSetsSolved] = useState<number | ''>('');
  const [rcsAttempted, setRcsAttempted] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [newTopicStatus, setNewTopicStatus] = useState<TopicStatus | ''>('');

  if (!isStudyTimerModalOpen) return null;

  const currentSubject = subjects.find((s) => s.id === (studyTimer ? studyTimer.subjectId : subjId));
  const isCAT = (studyTimer ? studyTimer.programId : progId) === 'prog-cat-2026';
  const isDILR = currentSubject?.code === 'DILR' || currentSubject?.name?.includes('DILR');
  const isVARC = currentSubject?.code === 'VARC' || currentSubject?.name?.includes('VARC');

  const availableSubjects = subjects.filter((s) => s.programId === (studyTimer ? studyTimer.programId : progId));
  const availableTopics = topics.filter((t) => t.subjectId === (studyTimer ? studyTimer.subjectId : subjId));

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progId || !subjId) return;
    startStudyTimer(progId, subjId, topicId || undefined);
  };

  const handleStopAndSave = (e: React.FormEvent) => {
    e.preventDefault();

    let fullNote = notes ? `[${academicMode}] ${notes}` : `[${academicMode}]`;
    if (isDILR && setsAttempted) {
      fullNote += ` • DILR Sets: ${setsAttempted} attempted, ${setsSolved || 0} solved`;
    }
    if (isVARC && rcsAttempted) {
      fullNote += ` • VARC RCs: ${rcsAttempted} attempted`;
    }

    let mappedStatus: TopicStatus | undefined = newTopicStatus === '' ? undefined : newTopicStatus;
    if (!mappedStatus) {
      if (academicMode === 'Completed') mappedStatus = 'completed';
      else if (academicMode === 'Practised') mappedStatus = 'practised';
      else if (academicMode === 'Revised') mappedStatus = 'practised';
      else if (academicMode === 'Studied') mappedStatus = 'learning';
    }

    stopStudyTimer(
      whatStudied || `${academicMode} ${currentSubject?.name || 'Subject'}`,
      qAttempted === '' ? undefined : Number(qAttempted),
      qCorrect === '' ? undefined : Number(qCorrect),
      fullNote,
      mappedStatus
    );
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? `${h}h ` : ''}${m % 60}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">
              {studyTimer ? 'Active Study Session' : 'Start Study Timer'}
            </span>
          </div>
          <button
            onClick={() => setIsStudyTimerModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {studyTimer ? (
            /* Active Running Timer Controls & Log Form */
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center space-y-2">
                <div className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">
                  {formatSeconds(studyTimer.elapsedSeconds)}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {programs.find((p) => p.id === studyTimer.programId)?.name} &bull;{' '}
                  {subjects.find((s) => s.id === studyTimer.subjectId)?.name}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2">
                  {studyTimer.isRunning ? (
                    <button
                      onClick={pauseStudyTimer}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={resumeStudyTimer}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  )}
                  <button
                    onClick={discardStudyTimer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400 border border-rose-500/30"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              </div>

              {/* Log Form when stopping */}
              <form onSubmit={handleStopAndSave} className="space-y-3">
                <h4 className="font-semibold text-zinc-300">Complete & Save Session</h4>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Academic Activity Mode *</label>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                    {(['Studied', 'Practised', 'Revised', 'Completed'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setAcademicMode(m)}
                        className={`py-1.5 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                          academicMode === m
                            ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">
                    What was studied? *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Logarithms formulas or 10 PYQ questions"
                    value={whatStudied}
                    onChange={(e) => setWhatStudied(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 outline-none focus:border-teal-400"
                  />
                </div>

                {/* Section Specific Inputs for CAT */}
                {isDILR && (
                  <div className="grid grid-cols-2 gap-2 bg-purple-950/20 border border-purple-500/30 p-2.5 rounded-xl">
                    <div>
                      <label className="block text-purple-300 text-[10px] mb-1 font-bold">DILR Sets Attempted</label>
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={setsAttempted}
                        onChange={(e) => setSetsAttempted(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 text-[10px] mb-1 font-bold">DILR Sets Solved</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={setsSolved}
                        onChange={(e) => setSetsSolved(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                {isVARC && (
                  <div className="bg-cyan-950/20 border border-cyan-500/30 p-2.5 rounded-xl">
                    <label className="block text-cyan-300 text-[10px] mb-1 font-bold">VARC Reading Comprehensions (RCs) Attempted</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={rcsAttempted}
                      onChange={(e) => setRcsAttempted(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-zinc-100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      Questions Attempted
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={qAttempted}
                      onChange={(e) =>
                        setQAttempted(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      Questions Correct
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={qCorrect}
                      onChange={(e) =>
                        setQCorrect(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>
                </div>

                {studyTimer.topicId && (
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      Update Topic Status
                    </label>
                    <select
                      value={newTopicStatus}
                      onChange={(e) => setNewTopicStatus(e.target.value as TopicStatus)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    >
                      <option value="">-- Keep Current Status --</option>
                      <option value="learning">Learning</option>
                      <option value="practised">Practised</option>
                      <option value="completed">Completed</option>
                      <option value="revision_due">Revision Due</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Notes / Reminders</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key takeaways or formulas to remember..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-md cursor-pointer"
                  >
                    Save Study Session
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Start Timer Form */
            <form onSubmit={handleStart} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Program *</label>
                <select
                  value={progId}
                  onChange={(e) => {
                    setProgId(e.target.value);
                    setSubjId('');
                    setTopicId('');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Subject *</label>
                <select
                  required
                  value={subjId}
                  onChange={(e) => {
                    setSubjId(e.target.value);
                    setTopicId('');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                >
                  <option value="">-- Select Subject --</option>
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Topic (Optional)</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                >
                  <option value="">-- None / General Subject --</option>
                  {availableTopics.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudyTimerModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!subjId}
                  className="px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Timer</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
