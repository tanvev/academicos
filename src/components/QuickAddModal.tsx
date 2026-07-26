import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckSquare, Clock, Award, FileCheck, Target } from 'lucide-react';
import { TaskType, TaskPriority, ProgramType } from '../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    programs,
    subjects,
    topics,
    addTask,
    addStudySession,
    addCATMock,
    addCATSectional,
    scheduleMock,
    addProgram,
  } = useApp();

  const [tab, setTab] = useState<'task' | 'study' | 'mock' | 'sectional' | 'program'>('task');

  // Form states
  // Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProgId, setTaskProgId] = useState(programs[0]?.id || '');
  const [taskSubjId, setTaskSubjId] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('study');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskEstMinutes, setTaskEstMinutes] = useState(30);
  const [taskIsRecurring, setTaskIsRecurring] = useState(false);
  const [taskRecurrenceType, setTaskRecurrenceType] = useState<'daily' | 'weekdays' | 'weekly' | 'custom' | 'monthly'>('daily');
  const [taskIsMeasurable, setTaskIsMeasurable] = useState(false);
  const [taskTargetValue, setTaskTargetValue] = useState<number | ''>('');
  const [taskUnit, setTaskUnit] = useState('RCs');

  // Manual Study
  const [studyProgId, setStudyProgId] = useState(programs[0]?.id || '');
  const [studySubjId, setStudySubjId] = useState('');
  const [studyTopicId, setStudyTopicId] = useState('');
  const [studyDuration, setStudyDuration] = useState(60);
  const [studyNotes, setStudyNotes] = useState('');
  const [studyQuestions, setStudyQuestions] = useState(0);

  // Mock
  const [mockAction, setMockAction] = useState<'schedule' | 'log'>('schedule');
  const [mockName, setMockName] = useState('');
  const [mockProvider, setMockProvider] = useState('IMS');
  const [mockDate, setMockDate] = useState(new Date().toISOString().split('T')[0]);
  const [mockTime, setMockTime] = useState('10:00 AM');
  const [mockScore, setMockScore] = useState<number | ''>('');
  const [mockPercentile, setMockPercentile] = useState<number | ''>('');

  // Sectional
  const [secAction, setSecAction] = useState<'schedule' | 'log'>('schedule');
  const [secName, setSecName] = useState('');
  const [secSection, setSecSection] = useState<'VARC' | 'DILR' | 'QA'>('QA');
  const [secDate, setSecDate] = useState(new Date().toISOString().split('T')[0]);
  const [secTime, setSecTime] = useState('06:00 PM');
  const [secScore, setSecScore] = useState<number | ''>('');
  const [secPercentile, setSecPercentile] = useState<number | ''>('');

  // Program
  const [progName, setProgName] = useState('');
  const [progType, setProgType] = useState<ProgramType>('competitive_exam');
  const [progTargetDate, setProgTargetDate] = useState('2026-11-29');

  if (!isQuickAddOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProgId) return;
    addTask({
      title: taskTitle.trim(),
      programId: taskProgId,
      subjectId: taskSubjId || undefined,
      type: taskType,
      dueDate: taskDueDate,
      priority: taskPriority,
      estimatedMinutes: taskEstMinutes,
      status: 'pending',
      isRecurring: taskIsRecurring,
      recurrenceType: taskIsRecurring ? taskRecurrenceType : undefined,
      metricType: taskIsMeasurable ? 'count' : undefined,
      targetValue: taskIsMeasurable && taskTargetValue !== '' ? Number(taskTargetValue) : undefined,
      unit: taskIsMeasurable ? taskUnit : undefined,
    });
    setIsQuickAddOpen(false);
  };

  const handleStudySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyProgId || !studySubjId) return;
    addStudySession({
      programId: studyProgId,
      subjectId: studySubjId,
      topicId: studyTopicId || undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
      durationMinutes: Number(studyDuration),
      whatWasStudied: studyNotes || 'Self study session',
      questionsAttempted: studyQuestions || undefined,
    });
    setIsQuickAddOpen(false);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) return;

    if (mockAction === 'schedule') {
      scheduleMock({
        name: mockName.trim(),
        provider: mockProvider || 'IMS',
        date: mockDate,
        startTime: mockTime,
        durationMinutes: 120,
        testType: 'full_cat',
        programId: 'prog-cat-2026',
      });
    } else {
      addCATMock({
        name: mockName.trim(),
        provider: mockProvider || 'IMS',
        date: mockDate,
        startTime: mockTime,
        status: 'completed',
        overallScore: mockScore === '' ? null : Number(mockScore),
        overallPercentile: mockPercentile === '' ? null : Number(mockPercentile),
        totalAttempted: null,
        correct: null,
        incorrect: null,
        unattempted: null,
        accuracy: null,
        durationMinutes: 120,
        varc: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        dilr: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        qa: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        analysisStatus: 'not_analysed',
      });
    }
    setIsQuickAddOpen(false);
  };

  const handleSectionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim()) return;

    if (secAction === 'schedule') {
      scheduleMock({
        name: secName.trim(),
        provider: 'General',
        date: secDate,
        startTime: secTime,
        durationMinutes: 40,
        testType: secSection === 'VARC' ? 'varc_sectional' : secSection === 'DILR' ? 'dilr_sectional' : 'qa_sectional',
        programId: 'prog-cat-2026',
      });
    } else {
      addCATSectional({
        name: secName.trim(),
        provider: 'General',
        date: secDate,
        startTime: secTime,
        section: secSection,
        status: 'completed',
        score: secScore === '' ? null : Number(secScore),
        percentile: secPercentile === '' ? null : Number(secPercentile),
        attempted: null,
        correct: null,
        incorrect: null,
        unattempted: null,
        accuracy: null,
        durationMinutes: 40,
      });
    }
    setIsQuickAddOpen(false);
  };

  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim()) return;
    addProgram({
      name: progName.trim(),
      type: progType,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: progTargetDate,
      color: '#06b6d4',
      archived: false,
      weeklyTargetHours: 15,
    });
    setIsQuickAddOpen(false);
  };

  const availableSubjects = subjects.filter((s) => s.programId === (tab === 'task' ? taskProgId : studyProgId));
  const availableTopics = topics.filter((t) => t.subjectId === studySubjId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-100">Quick Add</span>
          </div>
          <button onClick={() => setIsQuickAddOpen(false)} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1.5 gap-1">
          <button
            onClick={() => setTab('task')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'task' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>

          <button
            onClick={() => setTab('study')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'study' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Study Log</span>
          </button>

          <button
            onClick={() => setTab('mock')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'mock' ? 'bg-zinc-800 text-purple-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mock</span>
          </button>

          <button
            onClick={() => setTab('sectional')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'sectional' ? 'bg-zinc-800 text-amber-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Sectional</span>
          </button>

          <button
            onClick={() => setTab('program')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'program' ? 'bg-zinc-800 text-teal-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Program</span>
          </button>
        </div>

        <div className="p-4">
          {tab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 2 DILR sets or Read Chapter 3"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Program *</label>
                  <select
                    value={taskProgId}
                    onChange={(e) => {
                      setTaskProgId(e.target.value);
                      setTaskSubjId('');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Subject (Optional)</label>
                  <select
                    value={taskSubjId}
                    onChange={(e) => setTaskSubjId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- None --</option>
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="study">Study</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="mock">Mock</option>
                    <option value="sectional">Sectional</option>
                    <option value="revision">Revision</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Recurring Task Options */}
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                  <input
                    type="checkbox"
                    checked={taskIsRecurring}
                    onChange={(e) => setTaskIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700"
                  />
                  <span>Recurring Task</span>
                </label>

                {taskIsRecurring && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-zinc-400">Frequency:</span>
                    <select
                      value={taskRecurrenceType}
                      onChange={(e) => setTaskRecurrenceType(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-zinc-200"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays (Mon-Fri)</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Measurable Task Target */}
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                  <input
                    type="checkbox"
                    checked={taskIsMeasurable}
                    onChange={(e) => setTaskIsMeasurable(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700"
                  />
                  <span>Measurable Goal (e.g. 2 RCs, 30 questions)</span>
                </label>

                {taskIsMeasurable && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-zinc-500 text-[10px] mb-0.5">Target Value</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={taskTargetValue}
                        onChange={(e) => setTaskTargetValue(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] mb-0.5">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. RCs, questions, minutes"
                        value={taskUnit}
                        onChange={(e) => setTaskUnit(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-zinc-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {tab === 'study' && (
            <form onSubmit={handleStudySubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Program *</label>
                  <select
                    value={studyProgId}
                    onChange={(e) => {
                      setStudyProgId(e.target.value);
                      setStudySubjId('');
                      setStudyTopicId('');
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
                    value={studySubjId}
                    onChange={(e) => {
                      setStudySubjId(e.target.value);
                      setStudyTopicId('');
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
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Topic (Optional)</label>
                <select
                  value={studyTopicId}
                  onChange={(e) => setStudyTopicId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Questions Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={studyQuestions}
                    onChange={(e) => setStudyQuestions(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Notes / Summary</label>
                <textarea
                  rows={2}
                  placeholder="What did you study?"
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                >
                  Log Study
                </button>
              </div>
            </form>
          )}

          {tab === 'mock' && (
            <form onSubmit={handleMockSubmit} className="space-y-3">
              {/* Toggle Mode */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMockAction('schedule')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    mockAction === 'schedule'
                      ? 'bg-purple-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📅 Schedule Future Mock
                </button>
                <button
                  type="button"
                  onClick={() => setMockAction('log')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    mockAction === 'log'
                      ? 'bg-purple-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📊 Log Completed Score
                </button>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Mock Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMS SimCAT 04 or CL Prime 2"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Provider</label>
                  <select
                    value={mockProvider}
                    onChange={(e) => setMockProvider(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  >
                    <option value="IMS">IMS SimCAT</option>
                    <option value="Career Launcher">Career Launcher AIMCAT</option>
                    <option value="TIME">TIME AIMCAT</option>
                    <option value="Cracku">Cracku</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={mockDate}
                    onChange={(e) => setMockDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              {mockAction === 'schedule' ? (
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Start Time</label>
                  <select
                    value={mockTime}
                    onChange={(e) => setMockTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  >
                    <option value="10:00 AM">10:00 AM (Slot 1)</option>
                    <option value="02:00 PM">02:00 PM (Slot 2)</option>
                    <option value="06:00 PM">06:00 PM (Slot 3)</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Overall Score</label>
                    <input
                      type="number"
                      placeholder="e.g. 78"
                      value={mockScore}
                      onChange={(e) => setMockScore(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Percentile %</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 94.2"
                      value={mockPercentile}
                      onChange={(e) => setMockPercentile(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold cursor-pointer"
                >
                  {mockAction === 'schedule' ? 'Schedule Mock' : 'Log Mock Result'}
                </button>
              </div>
            </form>
          )}

          {tab === 'sectional' && (
            <form onSubmit={handleSectionalSubmit} className="space-y-3">
              {/* Toggle Mode */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSecAction('schedule')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    secAction === 'schedule'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📅 Schedule Sectional
                </button>
                <button
                  type="button"
                  onClick={() => setSecAction('log')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    secAction === 'log'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📊 Log Score
                </button>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Sectional Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QA Speed Test Arithmetic"
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Section</label>
                  <select
                    value={secSection}
                    onChange={(e) => setSecSection(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value="QA">QA</option>
                    <option value="DILR">DILR</option>
                    <option value="VARC">VARC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={secDate}
                    onChange={(e) => setSecDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              {secAction === 'log' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Score</label>
                    <input
                      type="number"
                      value={secScore}
                      onChange={(e) => setSecScore(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Percentile %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={secPercentile}
                      onChange={(e) => setSecPercentile(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold cursor-pointer"
                >
                  {secAction === 'schedule' ? 'Schedule Sectional' : 'Log Sectional Score'}
                </button>
              </div>
            </form>
          )}

          {tab === 'program' && (
            <form onSubmit={handleProgramSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GMAT Focus or Machine Learning Cert"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Type</label>
                  <select
                    value={progType}
                    onChange={(e) => setProgType(e.target.value as ProgramType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value="competitive_exam">Competitive Exam</option>
                    <option value="degree">Degree</option>
                    <option value="course">Course</option>
                    <option value="certification">Certification</option>
                    <option value="placement_prep">Placement Prep</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Target / Exam Date</label>
                  <input
                    type="date"
                    value={progTargetDate}
                    onChange={(e) => setProgTargetDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold"
                >
                  Create Program
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
