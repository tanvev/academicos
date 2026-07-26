import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AddDeadlineModal } from '../components/AddDeadlineModal';
import { Update } from '../types';
import {
  Radio,
  Calendar,
  Plus,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Search,
  AlertCircle,
  Sparkles,
  UserCheck,
  Building2,
  GraduationCap,
  Briefcase,
  BookmarkCheck,
  Clock,
  Info,
  Tag,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

type UpdateTab = 'for_you' | 'exams' | 'academic' | 'mba' | 'career' | 'saved';

export const UpdatesView: React.FC = () => {
  const {
    updates,
    userUpdateStates,
    toggleSaveUpdate,
    markUpdateRead,
    tasks,
    updateTask,
    fetchUpdates,
    programs,
    currentUser,
    settings,
    updateSettings,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<UpdateTab>('for_you');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('');
  const [customKeywords, setCustomKeywords] = useState<string[]>(
    settings.updateInterests || ['CAT', 'IIM', 'Registration', 'Deadline']
  );
  const [selectedUpdateForDeadline, setSelectedUpdateForDeadline] = useState<Update | null>(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePrograms = programs.filter((p) => !p.archived);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeywordInput.trim()) return;
    const kw = customKeywordInput.trim();
    if (!customKeywords.includes(kw)) {
      const updated = [...customKeywords, kw];
      setCustomKeywords(updated);
      updateSettings({ updateInterests: updated });
    }
    setCustomKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = customKeywords.filter((k) => k !== kwToRemove);
    setCustomKeywords(updated);
    updateSettings({ updateInterests: updated });
  };

  // Open confirmation modal
  const handleOpenAddDeadline = (up: Update) => {
    // Check duplicate
    const uState = userUpdateStates[up.id];
    const existingTask = tasks.find(
      (t) =>
        t.id === uState?.deadlineTaskId ||
        t.sourceUpdateId === up.id ||
        (t.type === 'deadline' &&
          t.title.toLowerCase().trim() === up.title.toLowerCase().trim() &&
          t.dueDate === (up.actionableDeadline || up.publishedAt))
    );

    if (existingTask || uState?.deadlineCreated) {
      // Go to deadline in planner
      setCurrentView('tasks');
      return;
    }

    setSelectedUpdateForDeadline(up);
    setIsDeadlineModalOpen(true);
  };

  const handleViewDeadlineInPlanner = (up: Update) => {
    setCurrentView('tasks');
  };

  const handleApplyDeadlineExtension = (up: Update, parentUpdateId: string, newDate: string) => {
    const uState = userUpdateStates[parentUpdateId];
    const targetTask = tasks.find(
      (t) => t.id === uState?.deadlineTaskId || t.sourceUpdateId === parentUpdateId
    );

    if (targetTask) {
      updateTask(targetTask.id, {
        dueDate: newDate,
        notes: `${targetTask.notes || ''}\n\n[Deadline Extended]: ${up.title} (${newDate})`,
      });
      setToastMessage(`Deadline extended to ${newDate} in Planner!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setSelectedUpdateForDeadline(up);
      setIsDeadlineModalOpen(true);
    }
  };

  // Filter updates based on active tab, personalization, and search term
  const filteredUpdates = updates.filter((up) => {
    const uState = userUpdateStates[up.id] || { read: false, saved: false };

    // Search filter
    if (
      searchTerm &&
      !up.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !up.summary.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !up.sourceName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Tab specific logic
    if (activeTab === 'saved') {
      return uState.saved;
    }

    if (activeTab === 'exams') {
      return (
        up.category === 'Exam Notification' ||
        up.category === 'Registration' ||
        up.category === 'Admit Card' ||
        up.category === 'Pattern Change' ||
        up.relevantPrograms.some((rp) => /exam|cat|xat|snap|gmat|gate/i.test(rp))
      );
    }

    if (activeTab === 'academic') {
      return (
        up.category === 'Academic' ||
        up.category === 'Syllabus' ||
        up.category === 'Deadline' ||
        up.relevantPrograms.some((rp) => /academic|degree|iitm|manit|b\.tech|semester/i.test(rp))
      );
    }

    if (activeTab === 'mba') {
      return (
        up.category === 'MBA Admissions' ||
        up.relevantPrograms.some((rp) => /mba|cat|xat|snap|iim|xlri/i.test(rp))
      );
    }

    if (activeTab === 'career') {
      return (
        up.category === 'Placement/Career' ||
        up.relevantPrograms.some((rp) => /career|placement|internship|hiring/i.test(rp))
      );
    }

    if (activeTab === 'for_you') {
      const matchesActiveProgram = activePrograms.some((ap) =>
        up.relevantPrograms.some(
          (rp) =>
            ap.name.toLowerCase().includes(rp.toLowerCase()) ||
            rp.toLowerCase().includes(ap.name.toLowerCase()) ||
            ap.id.toLowerCase() === rp.toLowerCase()
        )
      );

      const userInterests = currentUser?.interests || [];
      const matchesInterests = userInterests.some((interest) =>
        up.title.toLowerCase().includes(interest.toLowerCase()) ||
        up.summary.toLowerCase().includes(interest.toLowerCase()) ||
        up.relevantPrograms.some((rp) => rp.toLowerCase().includes(interest.toLowerCase()))
      );

      const matchesKeywords = customKeywords.some((kw) =>
        up.title.toLowerCase().includes(kw.toLowerCase()) ||
        up.summary.toLowerCase().includes(kw.toLowerCase()) ||
        up.category.toLowerCase().includes(kw.toLowerCase()) ||
        up.relevantPrograms.some((rp) => rp.toLowerCase().includes(kw.toLowerCase()))
      );

      return matchesActiveProgram || matchesInterests || matchesKeywords;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Verified Academic & Exam Updates</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified notifications, exam registration dates, admit card alerts & official academic schedules.
          </p>
        </div>

        <button
          onClick={fetchUpdates}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Refresh Updates Feed</span>
        </button>
      </div>

      {/* Official Retrieval Status Indicator */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Verified Primary Source Notifications</span>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              Updates do not modify your Planner automatically. Click <strong className="text-cyan-300">[Add Deadline]</strong> on actionable registration/submission dates to review and create a canonical Task.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-between text-teal-300 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Update Views Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#27272A] pb-2">
        <button
          onClick={() => setActiveTab('for_you')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'for_you'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>For You</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Exams</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'academic'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic</span>
        </button>

        <button
          onClick={() => setActiveTab('mba')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'mba'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>MBA</span>
        </button>

        <button
          onClick={() => setActiveTab('career')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'career'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Career</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ml-auto ${
            activeTab === 'saved'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Saved</span>
        </button>
      </div>

      {/* Personalization Keyword Filter */}
      {activeTab === 'for_you' && (
        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Personalized for Active Programs & User Keywords</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Active Programs: {activePrograms.map((p) => p.name).join(', ') || 'All'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>Custom Keywords:</span>
            </span>
            {customKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-cyan-300 text-[11px] flex items-center gap-1.5"
              >
                <span>{kw}</span>
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-slate-500 hover:text-rose-400 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}

            <form onSubmit={handleAddKeyword} className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add Keyword"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-lg py-1 px-2 text-[11px] text-white outline-none w-28"
              />
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative bg-[#18181B] border border-[#27272A] p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500 absolute left-5 top-4" />
        <input
          type="text"
          placeholder="Search updates by title, summary, or institution portal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none"
        />
      </div>

      {/* Updates Stream */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="p-8 text-center bg-[#18181B] border border-[#27272A] rounded-xl text-slate-500 space-y-2">
            <Radio className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">No official updates found matching your filters.</p>
            <p className="text-xs text-slate-500">
              Try switching tabs or clearing your search term.
            </p>
          </div>
        ) : (
          filteredUpdates.map((up) => {
            const uState = userUpdateStates[up.id] || {
              userId: 'usr-1',
              updateId: up.id,
              read: false,
              saved: false,
              deadlineCreated: false,
              deadlineTaskId: undefined,
            };
            const isRead = uState.read;
            const isSaved = uState.saved;
            const source = up.sourceName;
            const officialUrl = up.sourceUrl;
            const datePublished = up.publishedAt;
            const fetchedAtTime = up.fetchedAt
              ? new Date(up.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recently';

            // Check if deadline is already in Planner
            const isAlreadyInPlanner =
              tasks.some(
                (t) =>
                  t.id === uState.deadlineTaskId ||
                  t.sourceUpdateId === up.id ||
                  (t.type === 'deadline' &&
                    t.title.toLowerCase().trim() === up.title.toLowerCase().trim() &&
                    t.dueDate === (up.actionableDeadline || up.publishedAt))
              ) || uState.deadlineCreated;

            // Extension check
            const isExtension = up.isExtensionOfUpdateId;
            const parentState = isExtension ? userUpdateStates[isExtension] : null;
            const parentTask = isExtension
              ? tasks.find((t) => t.id === parentState?.deadlineTaskId || t.sourceUpdateId === isExtension)
              : null;

            return (
              <div
                key={up.id}
                className={`p-5 rounded-xl border transition-all space-y-3 ${
                  isRead
                    ? 'bg-[#18181B]/80 border-[#27272A]'
                    : 'bg-[#18181B] border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {up.relevantPrograms.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-slate-300 border border-zinc-700">
                      {up.category}
                    </span>
                    {up.deadlineType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {up.deadlineType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveUpdate(up.id)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Bookmarked' : 'Bookmark Update'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    {!isRead && (
                      <button
                        onClick={() => markUpdateRead(up.id)}
                        className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 flex items-center gap-2 flex-wrap">
                    <span>{up.title}</span>
                    {officialUrl && (
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline text-xs inline-flex items-center gap-1 font-normal bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{up.summary}</p>
                </div>

                {/* Extension Banner callout if applicable */}
                {isExtension && up.actionableDeadline && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <strong className="text-amber-300">Possible deadline update detected</strong>
                        <p className="text-[11px] text-amber-200/80">
                          Current: {up.previousDeadlineDate || parentTask?.dueDate || 'Previous Date'} &rarr; New Deadline: <strong className="text-cyan-300">{up.actionableDeadline}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyDeadlineExtension(
                          up,
                          isExtension,
                          up.actionableDeadline!
                        )
                      }
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      Update Deadline
                    </button>
                  </div>
                )}

                {/* Card Footer */}
                <div className="pt-2 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                    <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-slate-300">
                      Source: {source}
                    </span>
                    {datePublished && (
                      <span className="font-mono text-slate-400">
                        Published: {datePublished}
                      </span>
                    )}
                    <span className="font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Fetched: {fetchedAtTime}
                    </span>
                    {up.hasActionableDeadline && up.actionableDeadline && (
                      <span className="text-rose-400 font-bold font-mono flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {up.actionableDeadline}
                      </span>
                    )}
                  </div>

                  {/* Action Button: Add Deadline OR View Deadline */}
                  {up.hasActionableDeadline && up.actionableDeadline ? (
                    isAlreadyInPlanner ? (
                      <button
                        onClick={() => handleViewDeadlineInPlanner(up)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>✓ View Deadline</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAddDeadline(up)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black shadow-[0_0_15px_rgba(45,212,191,0.2)] transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Deadline</span>
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Deadline Modal */}
      <AddDeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        update={selectedUpdateForDeadline}
      />
    </div>
  );
};

