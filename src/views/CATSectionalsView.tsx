import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileCheck, Plus, Trash2, Search } from 'lucide-react';
import { SectionName } from '../types';

export const CATSectionalsView: React.FC = () => {
  const { catSectionals, deleteCATSectional, setIsQuickAddOpen } = useApp();

  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = catSectionals.filter((s) => {
    if (sectionFilter !== 'all' && s.section !== sectionFilter) return false;
    if (
      searchQuery.trim() &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-zinc-100">CAT Sectional Tests</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Targeted 40-minute sectional tests for VARC, DILR, and Quantitative Aptitude.
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sectional</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search sectional name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none w-48"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="all">All Sections</option>
          <option value="QA">QA Only</option>
          <option value="DILR">DILR Only</option>
          <option value="VARC">VARC Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>Sectional Name & Section</span>
          <span>Score & Percentile</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filtered.map((sec) => (
            <div
              key={sec.id}
              className="p-3.5 hover:bg-zinc-800/40 flex items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100">{sec.name}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      sec.section === 'QA'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                        : sec.section === 'DILR'
                        ? 'bg-teal-950 text-teal-400 border-teal-500/30'
                        : 'bg-cyan-950 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {sec.section}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Date: {sec.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400 text-sm block">
                    {sec.score ?? 'N/A'} pts
                  </span>
                  <span className="text-[10px] text-teal-400 font-mono">
                    {sec.percentile ? `${sec.percentile}%ile` : 'No percentile'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete sectional "${sec.name}"?`)) deleteCATSectional(sec.id);
                  }}
                  className="text-zinc-600 hover:text-rose-400 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No sectionals recorded. Click "+ Add Sectional" to log your score!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
