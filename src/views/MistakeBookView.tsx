import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { ErrorCategory, SectionName } from '../types';

export const MistakeBookView: React.FC = () => {
  const { mistakes, addMistake, toggleMistakeResolved, deleteMistake } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<'unresolved' | 'resolved' | 'all'>(
    'unresolved'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qIdentifier, setQIdentifier] = useState('');
  const [section, setSection] = useState<SectionName>('QA');
  const [errorCat, setErrorCat] = useState<ErrorCategory>('conceptual_gap');
  const [notes, setNotes] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  const filteredMistakes = mistakes.filter((m) => {
    if (categoryFilter !== 'all' && m.errorCategory !== categoryFilter) return false;
    if (sectionFilter !== 'all' && m.section !== sectionFilter) return false;
    if (resolvedFilter === 'unresolved' && m.resolved) return false;
    if (resolvedFilter === 'resolved' && !m.resolved) return false;
    if (
      searchQuery.trim() &&
      !m.questionIdentifier.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
      !m.notes.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
      return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qIdentifier.trim() || !notes.trim()) return;

    addMistake({
      questionIdentifier: qIdentifier.trim(),
      section,
      errorCategory: errorCat,
      notes: notes.trim(),
      lessonLearned: lessonLearned.trim() || undefined,
      needsRevision: true,
      resolved: false,
      dateAdded: new Date().toISOString().split('T')[0],
    });

    setQIdentifier('');
    setNotes('');
    setLessonLearned('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-zinc-100">Mistake Book Repository</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log and review conceptual gaps, calculation errors, and time pressure mistakes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Mistake</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search mistakes or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none w-48"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="unresolved">Unresolved Only</option>
            <option value="resolved">Resolved Only</option>
            <option value="all">All Mistakes</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="conceptual_gap">Conceptual Gap</option>
            <option value="calculation_error">Calculation Error</option>
            <option value="reading_misinterpretation">Reading Misinterpretation</option>
            <option value="time_pressure">Time Pressure</option>
            <option value="silly_mistake">Silly Mistake</option>
            <option value="wrong_set_selection">Wrong Set Selection</option>
            <option value="unattempted">Unattempted</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Sections</option>
            <option value="QA">QA</option>
            <option value="DILR">DILR</option>
            <option value="VARC">VARC</option>
          </select>
        </div>
      </div>

      {/* Mistake Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMistakes.map((mk) => (
          <div
            key={mk.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 shadow-md ${
              mk.resolved
                ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                : 'bg-zinc-900/90 border-zinc-800/80 hover:border-amber-500/40'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-100 text-sm">{mk.questionIdentifier}</h3>
                    <span className="text-[9px] font-mono uppercase bg-zinc-950 text-cyan-400 border border-zinc-800 px-1.5 py-0.2 rounded">
                      {mk.section}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Added {mk.dateAdded}</p>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                    mk.errorCategory === 'conceptual_gap'
                      ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                      : mk.errorCategory === 'calculation_error'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {mk.errorCategory.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                {mk.notes}
              </p>

              {mk.lessonLearned && (
                <div className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-xl">
                  <strong>Takeaway:</strong> {mk.lessonLearned}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
              <button
                onClick={() => toggleMistakeResolved(mk.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  mk.resolved
                    ? 'bg-zinc-800 text-zinc-400'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{mk.resolved ? 'Mark Unresolved' : 'Mark Resolved'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this mistake log?')) deleteMistake(mk.id);
                }}
                className="text-zinc-600 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredMistakes.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
            No mistakes found matching this filter criteria.
          </div>
        )}
      </div>

      {/* Modal: Add Mistake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-5 text-xs text-zinc-200 space-y-3 shadow-2xl">
            <h3 className="font-bold text-zinc-100">Add Mistake Log</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Question Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q18 QA Logarithms or SimCAT 5 DILR Set 2"
                  value={qIdentifier}
                  onChange={(e) => setQIdentifier(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as SectionName)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value="QA">QA</option>
                    <option value="DILR">DILR</option>
                    <option value="VARC">VARC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Error Category</label>
                  <select
                    value={errorCat}
                    onChange={(e) => setErrorCat(e.target.value as ErrorCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                  >
                    <option value="conceptual_gap">Conceptual Gap</option>
                    <option value="calculation_error">Calculation Error</option>
                    <option value="reading_misinterpretation">Reading Misinterpretation</option>
                    <option value="time_pressure">Time Pressure</option>
                    <option value="silly_mistake">Silly Mistake</option>
                    <option value="wrong_set_selection">Wrong Set Selection</option>
                    <option value="unattempted">Unattempted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Why did it go wrong? *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the mistake..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Lesson Learned</label>
                <input
                  type="text"
                  placeholder="Actionable takeaway for next time..."
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
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
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                >
                  Save Mistake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
