import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Target,
  FileText,
  Search,
} from 'lucide-react';
import { TopicStatus, TopicPriority, TopicConfidence } from '../types';

export const ProgramDetailView: React.FC = () => {
  const {
    selectedProgramId,
    programs,
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopicStatus,
    deleteTopic,
    setCurrentView,
  } = useApp();

  const program = programs.find((p) => p.id === selectedProgramId) || programs[0];
  const programSubjs = subjects.filter((s) => s.programId === program?.id);
  const programTopics = topics.filter((t) => t.programId === program?.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'tasks' | 'study' | 'resources' | 'tests' | 'performance'>('overview');
  const [activeSubjectId, setActiveSubjectId] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicSearch, setTopicSearch] = useState('');

  // Add Subject Modal
  const [isSubjModalOpen, setIsSubjModalOpen] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');

  // Add Module Modal
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleSubjId, setModuleSubjId] = useState('');
  const [moduleName, setModuleName] = useState('');

  // Add Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicSubjId, setTopicSubjId] = useState(programSubjs[0]?.id || '');
  const [topicModuleId, setTopicModuleId] = useState<string | undefined>(undefined);
  const [topicPriority, setTopicPriority] = useState<TopicPriority>('medium');
  const [topicConfidence, setTopicConfidence] = useState<TopicConfidence>('medium');

  if (!program) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Program not found.{' '}
        <button
          onClick={() => setCurrentView('programs')}
          className="text-cyan-400 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;
    addSubject({
      programId: program.id,
      name: subjName.trim(),
      code: subjCode.trim() || undefined,
      color: program.color,
      order: programSubjs.length + 1,
    });
    setSubjName('');
    setSubjCode('');
    setIsSubjModalOpen(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !topicSubjId) return;
    addTopic({
      programId: program.id,
      subjectId: topicSubjId,
      name: topicName.trim(),
      status: 'not_started',
      priority: topicPriority,
      confidence: topicConfidence,
      totalStudyTimeMinutes: 0,
      order: programTopics.length + 1,
    });
    setTopicName('');
    setIsTopicModalOpen(false);
  };

  // Filter topics
  const filteredTopics = programTopics.filter((t) => {
    if (activeSubjectId !== 'all' && t.subjectId !== activeSubjectId) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (
      topicSearch.trim() &&
      !t.name.toLowerCase().includes(topicSearch.toLowerCase().trim())
    )
      return false;
    return true;
  });

  const completedCount = programTopics.filter((t) => t.status === 'completed').length;
  const progressPct =
    programTopics.length > 0 ? Math.round((completedCount / programTopics.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('programs')}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: program.color }}
              />
              <h2 className="text-xl font-bold text-zinc-100">{program.name}</h2>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-cyan-400 px-2 py-0.5 rounded-full uppercase font-mono">
                {program.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {program.institution || 'Academic Program'} &bull; Target: {program.targetDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentView('syllabus');
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabus View</span>
          </button>

          <button
            onClick={() => setIsSubjModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => {
              setTopicSubjId(programSubjs[0]?.id || '');
              setIsTopicModalOpen(true);
            }}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Overall Syllabus Completion</span>
            <span className="font-mono font-bold text-cyan-400">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: program.color, width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500">
            {completedCount} of {programTopics.length} topics completed
          </p>
        </div>

        <div className="text-xs space-y-0.5 border-l border-zinc-800/80 pl-4 hidden md:block">
          <span className="text-zinc-500 block text-[10px] uppercase font-mono">
            Weekly Target
          </span>
          <span className="font-bold text-zinc-200 text-sm">
            {program.weeklyTargetHours} hrs / week
          </span>
        </div>

        <div className="text-xs space-y-0.5 border-l border-zinc-800/80 pl-4 hidden md:block">
          <span className="text-zinc-500 block text-[10px] uppercase font-mono">
            Total Subjects
          </span>
          <span className="font-bold text-zinc-200 text-sm">{programSubjs.length} Subjects</span>
        </div>
      </div>

      {/* Subjects Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
          <button
            onClick={() => setActiveSubjectId('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeSubjectId === 'all'
                ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Subjects ({programSubjs.length})
          </button>
          {programSubjs.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSubjectId(s.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeSubjectId === s.id
                  ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{s.name}</span>
              {s.code && (
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.2 rounded">
                  {s.code}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-lg">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none w-28 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 focus:outline-none text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="practised">Practised</option>
            <option value="completed">Completed</option>
            <option value="revision_due">Revision Due</option>
          </select>
        </div>
      </div>

      {/* Topics List Table */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>Topic Name & Subject</span>
          <span>Status (Click to toggle)</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredTopics.map((topic) => {
            const subj = programSubjs.find((s) => s.id === topic.subjectId);
            return (
              <div
                key={topic.id}
                className="p-3 hover:bg-zinc-800/40 flex items-center justify-between text-xs transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{topic.name}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                        topic.priority === 'high'
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                          : topic.priority === 'medium'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {topic.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                    <span className="text-cyan-400/80">{subj?.name}</span>
                    {topic.totalStudyTimeMinutes > 0 && (
                      <span>&bull; {topic.totalStudyTimeMinutes} mins studied</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={topic.status}
                    onChange={(e) => updateTopicStatus(topic.id, e.target.value as TopicStatus)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                      topic.status === 'completed'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                        : topic.status === 'practised'
                        ? 'bg-teal-950/50 border-teal-500/40 text-teal-400'
                        : topic.status === 'learning'
                        ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-400'
                        : topic.status === 'revision_due'
                        ? 'bg-purple-950/50 border-purple-500/40 text-purple-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="learning">Learning</option>
                    <option value="practised">Practised</option>
                    <option value="completed">Completed</option>
                    <option value="revision_due">Revision Due</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`Delete topic "${topic.name}"?`)) deleteTopic(topic.id);
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-1"
                    title="Delete topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTopics.length === 0 && (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No topics found. Add topics to this program using the button above!
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Subject */}
      {isSubjModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-4 text-xs text-zinc-200 space-y-3">
            <h3 className="font-bold text-zinc-100">Add Subject to {program.name}</h3>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantitative Aptitude or Computer Networks"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CS-301 or QA"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Topic */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-4 text-xs text-zinc-200 space-y-3">
            <h3 className="font-bold text-zinc-100">Add Topic to {program.name}</h3>
            <form onSubmit={handleAddTopic} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Select Subject *</label>
                <select
                  required
                  value={topicSubjId}
                  onChange={(e) => setTopicSubjId(e.target.value)}
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
                <label className="block text-zinc-400 text-[11px] mb-1">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logarithms or Transport Layer TCP"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Priority</label>
                  <select
                    value={topicPriority}
                    onChange={(e) => setTopicPriority(e.target.value as TopicPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Confidence (1-5)</label>
                  <select
                    value={topicConfidence}
                    onChange={(e) => setTopicConfidence(Number(e.target.value) as TopicConfidence)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value={1}>1 - Low Confidence</option>
                    <option value={2}>2 - Below Average</option>
                    <option value={3}>3 - Average</option>
                    <option value={4}>4 - Good</option>
                    <option value={5}>5 - High Confidence</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
