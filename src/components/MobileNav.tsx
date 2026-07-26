import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  GraduationCap,
  Award,
  BarChart3,
  Radio,
  UploadCloud,
  Settings,
  MoreHorizontal,
  Clock,
  X,
  Plus,
  BookOpen,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsStudyTimerModalOpen,
    setIsQuickAddOpen,
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNav = (view: any) => {
    setCurrentView(view);
    setIsMoreOpen(false);
  };

  const isActive = (views: string[]) => views.includes(currentView);

  return (
    <>
      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-t border-[#27272A] px-2 py-1.5 flex items-center justify-around text-[10px]">
        {/* 1. Today */}
        <button
          onClick={() => handleNav('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            isActive(['dashboard']) ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Today</span>
        </button>

        {/* 2. Planner */}
        <button
          onClick={() => handleNav('tasks')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            isActive(['tasks', 'calendar']) ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Planner</span>
        </button>

        {/* 3. Study (Prominent Central Action) */}
        <div className="relative -top-3">
          <button
            onClick={() => setIsStudyTimerModalOpen(true)}
            className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)] cursor-pointer transition-all active:scale-95"
            title="Start Study Timer"
          >
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Academics */}
        <button
          onClick={() => handleNav('programs')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            isActive(['programs', 'program_detail', 'syllabus', 'cat_syllabus'])
              ? 'text-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academics</span>
        </button>

        {/* 5. More */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            isMoreOpen ||
            isActive([
              'cat_mocks',
              'cat_sectionals',
              'cat_analysis',
              'analytics_study',
              'analytics_cat',
              'weekly_review',
              'updates',
              'smart_import',
              'settings',
            ])
              ? 'text-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-Up "More" Sheet Modal */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#18181B] border-t border-[#27272A] rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 space-y-5 text-xs text-slate-100">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-sm text-white">Academicos Workspace</span>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Center Section */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Center</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('cat_mocks')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-purple-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Upcoming Tests</p>
                    <p className="text-[10px] text-slate-400">Scheduled Mocks</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('cat_mocks')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-purple-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Completed</p>
                    <p className="text-[10px] text-slate-400">Score History</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('cat_analysis')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-purple-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Test Analysis</p>
                    <p className="text-[10px] text-slate-400">Mock Debt & Errors</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('analytics_cat')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-purple-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Performance</p>
                    <p className="text-[10px] text-slate-400">Percentiles & Trends</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Insights Section */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                <span>Insights</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('analytics_study')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-teal-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Overview</p>
                    <p className="text-[10px] text-slate-400">Study Analytics</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('cat_overview')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-teal-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-200">CAT Prep</p>
                    <p className="text-[10px] text-slate-400">Target & Velocity</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('weekly_review')}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-teal-500/50 flex items-center justify-between col-span-2"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Weekly Review & Consistency</p>
                    <p className="text-[10px] text-slate-400">Weekly Progress Reports & Streaks</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Updates & Utilities Section */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Updates & Utilities</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleNav('updates')}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-cyan-500/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Exam Updates & Notifications</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('smart_import')}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-teal-500/50"
                >
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="w-4 h-4 text-teal-400" />
                    <span>Smart Import (Syllabus & Timetable)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNav('settings')}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-slate-500"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Preferences</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
