import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UploadCloud,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { TopicStatus } from '../types';

export const SyllabusTrackerView: React.FC = () => {
  const {
    programs,
    subjects,
    topics,
    selectedProgramId,
    setSelectedProgramId,
    updateTopicStatus,
    bulkAddTopics,
    setCurrentView,
  } = useApp();

  const currentProgram =
    programs.find((p) => p.id === selectedProgramId) ||
    programs.find((p) => p.id === 'prog-cat-2026') ||
    programs[0];

  const programSubjs = subjects.filter((s) => s.programId === currentProgram?.id);
  const programTopics = topics.filter((t) => t.programId === currentProgram?.id);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRevisionOnly, setShowRevisionOnly] = useState(false);

  // Text Syllabus Paste Modal
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteSubjectId, setPasteSubjectId] = useState(programSubjs[0]?.id || '');
  const [rawText, setRawText] = useState('');

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || !pasteSubjectId || !currentProgram) return;

    // Split text line by line to create topics
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newTopics = lines.map((line, idx) => ({
      programId: currentProgram.id,
      subjectId: pasteSubjectId,
      name: line.replace(/^[\*\-\d\.\s]+/, ''), // Strip bullet points or numbers
      status: 'not_started' as TopicStatus,
      priority: 'medium' as any,
      confidence: 3 as any,
      totalStudyTimeMinutes: 0,
      order: programTopics.length + idx + 1,
    }));

    bulkAddTopics(newTopics);
    setRawText('');
    setIsPasteModalOpen(false);
  };

  const completedCount = programTopics.filter((t) => t.status === 'completed').length;
  const overallPct =
    programTopics.length > 0 ? Math.round((completedCount / programTopics.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-zinc-100">Syllabus Tracker</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hierarchical syllabus progress, topic statuses, and revision tracker.
          </p>
        </div>

        {/* Program Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={currentProgram?.id}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setPasteSubjectId(programSubjs[0]?.id || '');
              setIsPasteModalOpen(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text Syllabus</span>
          </button>

          <button
            onClick={() => setCurrentView('smart_import')}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>AI Syllabus Import</span>
          </button>
        </div>
      </div>

      {/* Program Summary Card */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-100 text-sm">{currentProgram?.name} Progress</h3>
          <p className="text-xs text-zinc-400">
            {completedCount} of {programTopics.length} topics completed across{' '}
            {programSubjs.length} subjects
          </p>
        </div>

        <div className="w-full md:w-64 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Completion</span>
            <span className="font-mono font-bold text-cyan-400">{overallPct}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search topic name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none w-48"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRevisionOnly(!showRevisionOnly)}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showRevisionOnly
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Revision Due Only</span>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="practised">Practised</option>
            <option value="completed">Completed</option>
            <option value="revision_due">Revision Due</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Hierarchical Progress Display: Subject -> Topics */}
      <div className="space-y-6">
        {programSubjs.map((subj) => {
          let subjTopics = topics.filter((t) => t.subjectId === subj.id);

          // Apply filters
          if (showRevisionOnly) {
            subjTopics = subjTopics.filter((t) => t.status === 'revision_due');
          }
          if (statusFilter !== 'all') {
            subjTopics = subjTopics.filter((t) => t.status === statusFilter);
          }
          if (priorityFilter !== 'all') {
            subjTopics = subjTopics.filter((t) => t.priority === priorityFilter);
          }
          if (searchQuery.trim()) {
            subjTopics = subjTopics.filter((t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
            );
          }

          const allSubjTopics = topics.filter((t) => t.subjectId === subj.id);
          const doneSubjTopics = allSubjTopics.filter((t) => t.status === 'completed').length;
          const subjPct =
            allSubjTopics.length > 0
              ? Math.round((doneSubjTopics / allSubjTopics.length) * 100)
              : 0;

          if (
            (showRevisionOnly || statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) &&
            subjTopics.length === 0
          ) {
            return null;
          }

          return (
            <div
              key={subj.id}
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xs"
            >
              {/* Subject Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: subj.color || currentProgram?.color }}
                  />
                  <h3 className="font-bold text-zinc-100 text-sm">{subj.name}</h3>
                  {subj.code && (
                    <span className="text-[10px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-800">
                      {subj.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-400">
                    {doneSubjTopics} / {allSubjTopics.length} done
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{subjPct}%</span>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {subjTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      topic.status === 'completed'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : topic.status === 'practised'
                        ? 'bg-teal-950/20 border-teal-500/30 text-teal-200'
                        : topic.status === 'learning'
                        ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
                        : topic.status === 'revision_due'
                        ? 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-medium text-xs truncate">{topic.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <span className="uppercase font-mono">{topic.priority} priority</span>
                        {topic.totalStudyTimeMinutes > 0 && (
                          <span>&bull; {topic.totalStudyTimeMinutes}m</span>
                        )}
                      </div>
                    </div>

                    <select
                      value={topic.status === 'learning' || topic.status === 'practised' ? 'in_progress' : topic.status}
                      onChange={(e) =>
                        updateTopicStatus(topic.id, e.target.value as TopicStatus)
                      }
                      className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] font-semibold px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                    >
                      <option value="not_started">○ Not Started</option>
                      <option value="in_progress">◐ In Progress</option>
                      <option value="completed">✓ Completed</option>
                      <option value="revision_due">! Revision Due</option>
                    </select>
                  </div>
                ))}

                {subjTopics.length === 0 && (
                  <div className="col-span-full py-4 text-center text-zinc-500 text-xs">
                    No topics in this subject.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {programSubjs.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No subjects configured for {currentProgram?.name}. Add subjects or use Paste Text Syllabus.
          </div>
        )}
      </div>

      {/* Paste Syllabus Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-5 text-xs text-zinc-200 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100">
              Bulk Paste Syllabus Topics into {currentProgram?.name}
            </h3>

            <form onSubmit={handlePasteSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Target Subject *</label>
                <select
                  value={pasteSubjectId}
                  onChange={(e) => setPasteSubjectId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                >
                  {programSubjs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Paste Topics (One per line) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder={`1. Percentages\n2. Profit & Loss\n3. Time Speed Distance\n4. Permutations and Combinations`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  Import Topics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
