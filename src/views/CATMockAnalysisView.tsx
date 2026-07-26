import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Plus,
  BookOpen,
  X,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import { ErrorCategory, SectionName } from '../types';

export const CATMockAnalysisView: React.FC = () => {
  const {
    catMocks,
    mistakes,
    updateCATMock,
    addMistake,
    setCurrentView,
  } = useApp();

  const [selectedMockId, setSelectedMockId] = useState<string>(
    catMocks[0]?.id || ''
  );

  const selectedMock = catMocks.find((m) => m.id === selectedMockId) || catMocks[0];

  // Log mistake form
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [qIdentifier, setQIdentifier] = useState('');
  const [section, setSection] = useState<SectionName>('QA');
  const [errorCat, setErrorCat] = useState<ErrorCategory>('conceptual_gap');
  const [notes, setNotes] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  const mockMistakes = selectedMock
    ? mistakes.filter((m) => m.mockId === selectedMock.id)
    : [];

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qIdentifier.trim() || !selectedMock) return;

    addMistake({
      mockId: selectedMock.id,
      questionIdentifier: qIdentifier.trim(),
      section,
      errorCategory: errorCat,
      notes: notes.trim(),
      lessonLearned: lessonLearned.trim(),
      needsRevision: true,
      resolved: false,
      dateAdded: new Date().toISOString().split('T')[0],
    });

    setQIdentifier('');
    setNotes('');
    setLessonLearned('');
    setIsMistakeModalOpen(false);
  };

  const toggleMockAnalysed = () => {
    if (!selectedMock) return;
    const newStatus =
      selectedMock.analysisStatus === 'analysed' ? 'not_analysed' : 'analysed';
    updateCATMock(selectedMock.id, { analysisStatus: newStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-zinc-100">Mock Debt & Analysis Studio</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Identify error categories (Conceptual Gap, Calculation Error, Time Pressure) & track Mock Debt.
          </p>
        </div>

        {selectedMock && (
          <button
            onClick={toggleMockAnalysed}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              selectedMock.analysisStatus === 'analysed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {selectedMock.analysisStatus === 'analysed'
                ? '✓ Mark as Unanalysed'
                : 'Resolve Mock Debt (Mark Analysed)'}
            </span>
          </button>
        )}
      </div>

      {/* Select Mock Selector */}
      <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-zinc-300">Select Mock Test:</span>
        <select
          value={selectedMockId}
          onChange={(e) => setSelectedMockId(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-cyan-400 font-bold rounded-lg px-3 py-1.5 focus:outline-none"
        >
          {catMocks.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider}) - {m.analysisStatus === 'analysed' ? 'Analysed' : 'DEBT'}
            </option>
          ))}
        </select>
      </div>

      {selectedMock ? (
        <div className="space-y-6">
          {/* Mock Summary Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{selectedMock.name}</h3>
                <p className="text-xs text-zinc-400">
                  Provider: {selectedMock.provider} &bull; Taken on {selectedMock.date}
                </p>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Total Score</span>
                  <span className="font-mono font-bold text-cyan-400 text-lg">
                    {selectedMock.overallScore ?? 'N/A'} pts
                  </span>
                </div>
                <div className="border-l border-zinc-800 pl-3">
                  <span className="text-[10px] text-zinc-500 block">Percentile</span>
                  <span className="font-mono font-bold text-teal-400 text-lg">
                    {selectedMock.overallPercentile ?? 'N/A'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Section Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-bold text-cyan-400 uppercase text-[10px] block">VARC</span>
                <p className="text-sm font-mono font-bold text-zinc-100">
                  {selectedMock.varc.score ?? 'N/A'} pts
                </p>
                <p className="text-[10px] text-zinc-400">
                  Percentile: {selectedMock.varc.percentile ?? 'N/A'}%
                </p>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-bold text-teal-400 uppercase text-[10px] block">DILR</span>
                <p className="text-sm font-mono font-bold text-zinc-100">
                  {selectedMock.dilr.score ?? 'N/A'} pts
                </p>
                <p className="text-[10px] text-zinc-400">
                  Percentile: {selectedMock.dilr.percentile ?? 'N/A'}%
                </p>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 uppercase text-[10px] block">QA</span>
                <p className="text-sm font-mono font-bold text-zinc-100">
                  {selectedMock.qa.score ?? 'N/A'} pts
                </p>
                <p className="text-[10px] text-zinc-400">
                  Percentile: {selectedMock.qa.percentile ?? 'N/A'}%
                </p>
              </div>
            </div>
          </div>

          {/* Question Mistakes List */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h4 className="font-bold text-zinc-100 text-xs">
                  Logged Question Errors for this Mock ({mockMistakes.length})
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Record wrong/unattempted questions to auto-populate Mistake Book.
                </p>
              </div>

              <button
                onClick={() => setIsMistakeModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Question Error</span>
              </button>
            </div>

            <div className="space-y-2">
              {mockMistakes.map((mk) => (
                <div
                  key={mk.id}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-200">{mk.questionIdentifier}</span>
                      <span className="text-[9px] font-mono uppercase bg-amber-950/40 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                        {mk.errorCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">{mk.section}</span>
                  </div>

                  <p className="text-zinc-300">{mk.notes}</p>
                  {mk.lessonLearned && (
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Takeaway: {mk.lessonLearned}
                    </p>
                  )}
                </div>
              ))}

              {mockMistakes.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No question mistakes logged for this mock yet. Click "Log Question Error" to record mistake analysis!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-500 text-xs">
          No CAT mocks found. Add a mock first to perform analysis.
        </div>
      )}

      {/* Log Mistake Modal */}
      {isMistakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-5 text-xs text-zinc-200 space-y-3">
            <h3 className="font-bold text-zinc-100">Log Question Mistake</h3>

            <form onSubmit={handleAddMistake} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Question Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q14 QA (Probability) or RC 2 Q3"
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
                    <option value="unattempted">Unattempted / Left</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Why did it go wrong? *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Forgot the formula for conditional probability..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Lesson Learned</label>
                <input
                  type="text"
                  placeholder="e.g. Always write out sample space before counting"
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMistakeModalOpen(false)}
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
