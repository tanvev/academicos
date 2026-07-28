import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Target,
  GraduationCap,
  BookOpen,
  Award,
  Archive,
  Trash2,
  Edit2,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { ProgramType } from '../types';

export const ProgramsView: React.FC = () => {
  const {
    programs,
    subjects,
    topics,
    tasks,
    addProgram,
    updateProgram,
    deleteProgram,
    setSelectedProgramId,
    setCurrentView,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ProgramType>('degree');
  const [institution, setInstitution] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('2026-11-29');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [weeklyHours, setWeeklyHours] = useState(15);

  const openCreateModal = () => {
    setEditingProgId(null);
    setName('');
    setType('degree');
    setInstitution('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetDate('2026-11-29');
    setDescription('');
    setColor('#06b6d4');
    setWeeklyHours(15);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProgId(p.id);
    setName(p.name);
    setType(p.type);
    setInstitution(p.institution || '');
    setStartDate(p.startDate);
    setTargetDate(p.targetDate);
    setDescription(p.description || '');
    setColor(p.color);
    setWeeklyHours(p.weeklyTargetHours || 15);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProgId) {
      updateProgram(editingProgId, {
        name: name.trim(),
        type,
        institution: institution.trim(),
        startDate,
        targetDate,
        description: description.trim(),
        color,
        weeklyTargetHours: Number(weeklyHours) || 0,
      });
    } else {
      addProgram({
        name: name.trim(),
        type,
        institution: institution.trim(),
        startDate,
        targetDate,
        description: description.trim(),
        color,
        archived: false,
        weeklyTargetHours: Number(weeklyHours) || 0,
      });
    }
    setIsModalOpen(false);
  };

  const toggleArchive = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    updateProgram(p.id, { archived: !p.archived });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this program and all its subjects & topics?')) {
      deleteProgram(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>My Programs</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage degree courses, competitive exams, certifications, and placement prep.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Program</span>
        </button>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((prog) => {
          const progSubjs = subjects.filter((s) => s.programId === prog.id);
          const progTopics = topics.filter((t) => t.programId === prog.id);
          const completedTopics = progTopics.filter((t) => t.status === 'completed').length;
          const pct =
            progTopics.length > 0 ? Math.round((completedTopics / progTopics.length) * 100) : 0;
          const pendingTasks = tasks.filter(
            (t) => t.programId === prog.id && t.status === 'pending'
          ).length;

          return (
            <div
              key={prog.id}
              onClick={() => {
                setSelectedProgramId(prog.id);
                setCurrentView('program_detail');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md group ${
                prog.archived
                  ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                  : 'bg-zinc-900/90 border-zinc-800/80 hover:border-cyan-500/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: prog.color }}
                    />
                    <div>
                      <h3 className="font-bold text-zinc-100 text-sm group-hover:text-cyan-400 transition-colors">
                        {prog.name}
                      </h3>
                      {prog.institution && (
                        <p className="text-[11px] text-zinc-400">{prog.institution}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-500">
                    <button
                      onClick={(e) => openEditModal(prog, e)}
                      className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                      title="Edit Program"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleArchive(prog, e)}
                      className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                      title={prog.archived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(prog.id, e)}
                      className="p-1 hover:text-rose-400 hover:bg-zinc-800 rounded"
                      title="Delete Program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-full font-mono text-cyan-400 uppercase">
                    {prog.type.replace('_', ' ')}
                  </span>
                  <span className="text-zinc-500">Target: {prog.targetDate}</span>
                </div>

                {prog.description && (
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{prog.description}</p>
                )}
              </div>

              {/* Progress & Subj Stats */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Syllabus Completion</span>
                    <span className="font-mono font-bold text-zinc-200">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: prog.color, width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>
                    {progSubjs.length} Subject{progSubjs.length !== 1 ? 's' : ''} &bull;{' '}
                    {progTopics.length} Topics
                  </span>
                  <span className="text-amber-400 font-medium">
                    {pendingTasks} Pending Tasks
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating / Editing Program */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs text-zinc-200">
            <h3 className="text-sm font-bold text-zinc-100">
              {editingProgId ? 'Edit Program' : 'Create New Program'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Competitive Exam, Higher Education Degree, AWS Certification"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProgramType)}
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
                  <label className="block text-zinc-400 text-[11px] mb-1">
                    Institution / Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University Name, Examination Board, Institute"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Target / Exam Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded-lg p-1 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Weekly Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Program objectives, goals, or schedule notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  {editingProgId ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
