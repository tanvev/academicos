import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, CheckSquare, BookOpen, Award, AlertCircle, Target, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    programs,
    subjects,
    topics,
    tasks,
    catMocks,
    catSectionals,
    mistakes,
    setCurrentView,
    setSelectedProgramId,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingPrograms = q ? programs.filter((p) => p.name.toLowerCase().includes(q)) : [];
  const matchingTopics = q ? topics.filter((t) => t.name.toLowerCase().includes(q)) : [];
  const matchingTasks = q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : [];
  const matchingMocks = q ? catMocks.filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)) : [];
  const matchingSectionals = q ? catSectionals.filter((s) => s.name.toLowerCase().includes(q)) : [];
  const matchingMistakes = q ? mistakes.filter((m) => m.questionIdentifier.toLowerCase().includes(q) || m.notes.toLowerCase().includes(q)) : [];

  const totalResults =
    matchingPrograms.length +
    matchingTopics.length +
    matchingTasks.length +
    matchingMocks.length +
    matchingSectionals.length +
    matchingMistakes.length;

  const navigateTo = (view: any, progId?: string) => {
    setCurrentView(view);
    if (progId) setSelectedProgramId(progId);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        <div className="p-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, topics, mocks, sectionals, mistakes, programs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none"
          />
          <button onClick={() => setIsSearchOpen(false)} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {!q ? (
            <div className="py-8 text-center text-zinc-500">
              Type to search across Academicos
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {/* Programs */}
              {matchingPrograms.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-cyan-400" />
                    <span>Programs</span>
                  </div>
                  <div className="space-y-1">
                    {matchingPrograms.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateTo('program_detail', p.id)}
                        className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                      >
                        <span className="font-medium text-zinc-200 group-hover:text-cyan-400">{p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {matchingTopics.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span>Syllabus Topics</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTopics.slice(0, 5).map((t) => {
                      const subj = subjects.find((s) => s.id === t.subjectId);
                      return (
                        <div
                          key={t.id}
                          onClick={() => navigateTo('cat_syllabus', t.programId)}
                          className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                        >
                          <div>
                            <span className="font-medium text-zinc-200 group-hover:text-emerald-400">{t.name}</span>
                            <p className="text-[10px] text-zinc-500">{subj?.name}</p>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckSquare className="w-3 h-3 text-teal-400" />
                    <span>Tasks</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTasks.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigateTo('tasks')}
                        className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                      >
                        <span className="font-medium text-zinc-200 group-hover:text-teal-400">{t.title}</span>
                        <span className="text-[10px] text-zinc-500">Due {t.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mocks & Sectionals */}
              {(matchingMocks.length > 0 || matchingSectionals.length > 0) && (
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-purple-400" />
                    <span>Mocks & Sectionals</span>
                  </div>
                  <div className="space-y-1">
                    {matchingMocks.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => navigateTo('cat_mocks')}
                        className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <span className="font-medium text-zinc-200 group-hover:text-purple-400">{m.name}</span>
                          <span className="text-[10px] text-zinc-500 ml-2">({m.provider})</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400">Score: {m.overallScore ?? 'N/A'}</span>
                      </div>
                    ))}
                    {matchingSectionals.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => navigateTo('cat_sectionals')}
                        className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <span className="font-medium text-zinc-200 group-hover:text-purple-400">{s.name}</span>
                          <span className="text-[10px] text-zinc-500 ml-2">[{s.section}]</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400">Score: {s.score ?? 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mistakes */}
              {matchingMistakes.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>Mistakes</span>
                  </div>
                  <div className="space-y-1">
                    {matchingMistakes.slice(0, 5).map((mk) => (
                      <div
                        key={mk.id}
                        onClick={() => navigateTo('mistakes')}
                        className="p-2 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <span className="font-medium text-amber-200">{mk.questionIdentifier}</span>
                          <p className="text-[10px] text-zinc-400 truncate">{mk.notes}</p>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">{mk.errorCategory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
