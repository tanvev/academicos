import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Search,
} from 'lucide-react';

export const CATMocksView: React.FC = () => {
  const {
    catMocks,
    addCATMock,
    deleteCATMock,
    setCurrentView,
    setIsQuickAddOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');

  const filteredMocks = catMocks.filter((m) => {
    if (
      searchQuery.trim() &&
      !m.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
      return false;
    if (providerFilter !== 'all' && m.provider !== providerFilter) return false;
    return true;
  });

  const mockDebtCount = catMocks.filter((m) => m.analysisStatus !== 'analysed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-zinc-100">CAT Full-Length Mocks</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            IMS SimCAT, Career Launcher Prime/AIMCAT, Time, and Cracku mock test records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mockDebtCount > 0 && (
            <button
              onClick={() => setCurrentView('cat_analysis')}
              className="bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{mockDebtCount} Mock Debt</span>
            </button>
          )}

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-purple-500 hover:bg-purple-400 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Full Mock</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search mock name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none w-48"
          />
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="all">All Providers</option>
          <option value="IMS">IMS SimCAT</option>
          <option value="Career Launcher">Career Launcher AIMCAT</option>
          <option value="TIME">TIME AIMCAT</option>
          <option value="Cracku">Cracku</option>
        </select>
      </div>

      {/* Mocks Table */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>Mock Name & Provider</span>
          <span>Score / Percentile / Section Breakdown</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredMocks.map((mock) => {
            const isAnalysed = mock.analysisStatus === 'analysed';

            return (
              <div
                key={mock.id}
                className="p-3.5 hover:bg-zinc-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 text-sm">{mock.name}</span>
                    <span className="text-[10px] bg-zinc-950 text-cyan-400 font-mono px-2 py-0.5 rounded border border-zinc-800">
                      {mock.provider}
                    </span>
                    {!isAnalysed && (
                      <span className="text-[9px] bg-rose-950/60 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold">
                        Unanalysed (Mock Debt)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">Date Taken: {mock.date}</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Scores */}
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Overall</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {mock.overallScore ?? 'N/A'} pts
                      </span>
                    </div>

                    <div className="border-l border-zinc-800 pl-3">
                      <span className="text-[10px] text-zinc-500 block">Percentile</span>
                      <span className="font-mono font-bold text-teal-400 text-sm">
                        {mock.overallPercentile ?? 'N/A'}%
                      </span>
                    </div>

                    {/* Sectional badges */}
                    <div className="hidden lg:flex items-center gap-1.5 border-l border-zinc-800 pl-3 text-[10px]">
                      <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        VARC: <strong className="text-zinc-200">{mock.varc.score ?? '-'}</strong>
                      </span>
                      <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        DILR: <strong className="text-zinc-200">{mock.dilr.score ?? '-'}</strong>
                      </span>
                      <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        QA: <strong className="text-zinc-200">{mock.qa.score ?? '-'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentView('cat_analysis')}
                      className="bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete mock "${mock.name}"?`)) deleteCATMock(mock.id);
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-1.5 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMocks.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No CAT mocks recorded. Click "+ Add Full Mock" to record your first score!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
