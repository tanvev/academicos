import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  Target,
  BookOpen,
  GraduationCap,
  Award,
  FileCheck,
  BarChart3,
  TrendingUp,
  FileText,
  UploadCloud,
  Inbox,
  Settings,
  Plus,
  Zap,
  AlertCircle,
  X,
  Radio,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentView,
    setCurrentView,
    selectedProgramId,
    setSelectedProgramId,
    programs,
    catMocks,
    setIsQuickAddOpen,
    currentUser,
    logout,
  } = useApp();

  // Collapsible menu sections state
  const [plannerOpen, setPlannerOpen] = useState(true);
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [testCenterOpen, setTestCenterOpen] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);

  // Mock debt counter
  const mockDebt = catMocks.filter((m) => m.analysisStatus !== 'analysed').length;

  const activePrograms = programs.filter((p) => !p.archived);

  const handleNav = (view: any, programId?: string) => {
    setCurrentView(view);
    if (programId !== undefined) {
      setSelectedProgramId(programId);
    }
    setIsMobileOpen(false);
  };

  const navClass = (view: string, idMatch?: string) => {
    const isActive =
      currentView === view && (idMatch === undefined || selectedProgramId === idMatch);
    return `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;
  };

  const content = (
    <div className="flex flex-col h-full bg-[#09090B] border-r border-[#27272A] w-64 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] shrink-0 font-bold">
            <Zap className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-white uppercase font-mono">
              ACADEMICOS
            </h1>
            <p className="text-[10px] text-teal-400/90 font-medium">Your Academic Operating System</p>
          </div>
        </div>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2 border-b border-[#27272A]">
        <button
          onClick={() => {
            setIsQuickAddOpen(true);
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 px-3 rounded-xl text-xs shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>QUICK ADD</span>
        </button>
      </div>

      {/* Sidebar Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar text-xs">
        {/* TODAY */}
        <div>
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full ${navClass('dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-400" />
            <span>Today</span>
          </button>
        </div>

        {/* PLANNER */}
        <div className="space-y-1">
          <button
            onClick={() => setPlannerOpen(!plannerOpen)}
            className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1 hover:text-slate-300 transition-colors"
          >
            <span>Planner</span>
            {plannerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {plannerOpen && (
            <div className="pl-2 space-y-0.5 border-l border-zinc-800/80 ml-2">
              <button
                onClick={() => handleNav('calendar')}
                className={`w-full ${navClass('calendar')}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => handleNav('tasks')}
                className={`w-full ${navClass('tasks')}`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </button>
            </div>
          )}
        </div>

        {/* ACADEMICS */}
        <div className="space-y-1">
          <button
            onClick={() => setAcademicsOpen(!academicsOpen)}
            className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1 hover:text-slate-300 transition-colors"
          >
            <span>Academics</span>
            {academicsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {academicsOpen && (
            <div className="pl-2 space-y-0.5 border-l border-zinc-800/80 ml-2">
              <button
                onClick={() => handleNav('programs')}
                className={`w-full ${navClass('programs')}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Programs</span>
              </button>

              {/* Active programs list under Academics */}
              {activePrograms.map((prog) => {
                const isSelected =
                  (currentView === 'program_detail' || currentView === 'syllabus') &&
                  selectedProgramId === prog.id;
                return (
                  <button
                    key={prog.id}
                    onClick={() => handleNav('program_detail', prog.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-500/10 text-teal-300 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: prog.color || '#2DD4BF' }}
                      />
                      <span className="truncate">{prog.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TEST CENTER */}
        <div className="space-y-1">
          <button
            onClick={() => setTestCenterOpen(!testCenterOpen)}
            className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1 hover:text-slate-300 transition-colors"
          >
            <span>Test Center</span>
            {testCenterOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {testCenterOpen && (
            <div className="pl-2 space-y-0.5 border-l border-zinc-800/80 ml-2">
              <button
                onClick={() => handleNav('cat_mocks')}
                className={`w-full ${navClass('cat_mocks')}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </button>
              <button
                onClick={() => handleNav('cat_sectionals')}
                className={`w-full ${navClass('cat_sectionals')}`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Completed</span>
              </button>
              <button
                onClick={() => handleNav('cat_analysis')}
                className={`w-full ${navClass('cat_analysis')}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analysis</span>
                  </span>
                  {mockDebt > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      {mockDebt}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleNav('analytics_cat')}
                className={`w-full ${navClass('analytics_cat')}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Performance</span>
              </button>
            </div>
          )}
        </div>

        {/* INSIGHTS */}
        <div className="space-y-1">
          <button
            onClick={() => setInsightsOpen(!insightsOpen)}
            className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1 hover:text-slate-300 transition-colors"
          >
            <span>Insights</span>
            {insightsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {insightsOpen && (
            <div className="pl-2 space-y-0.5 border-l border-zinc-800/80 ml-2">
              <button
                onClick={() => handleNav('analytics_study')}
                className={`w-full ${navClass('analytics_study')}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => handleNav('cat_overview')}
                className={`w-full ${navClass('cat_overview')}`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>CAT</span>
              </button>
              <button
                onClick={() => handleNav('study')}
                className={`w-full ${navClass('study')}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Study</span>
              </button>
              <button
                onClick={() => handleNav('weekly_review')}
                className={`w-full ${navClass('weekly_review')}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Consistency & Weekly</span>
              </button>
            </div>
          )}
        </div>

        {/* UPDATES */}
        <div>
          <button
            onClick={() => handleNav('updates')}
            className={`w-full ${navClass('updates')}`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <div className="flex items-center justify-between w-full">
              <span>Updates</span>
              <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase">
                Live
              </span>
            </div>
          </button>
        </div>

        {/* UTILITIES (Smart Import & Settings) */}
        <div className="pt-2 border-t border-zinc-900 space-y-0.5">
          <button
            onClick={() => handleNav('smart_import')}
            className={`w-full ${navClass('smart_import')}`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
            <span>Smart Import</span>
          </button>
          <button
            onClick={() => handleNav('settings')}
            className={`w-full ${navClass('settings')}`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-bold text-xs text-teal-400 shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-zinc-200 truncate">{currentUser?.name || 'Academic User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{currentUser?.email || 'Logged In'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="text-xs text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
