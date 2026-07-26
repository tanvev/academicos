import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileNav } from './components/MobileNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, Zap } from 'lucide-react';

// Modals
import { QuickAddModal } from './components/QuickAddModal';
import { SearchModal } from './components/SearchModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { MigrationModal } from './components/MigrationModal';

// Views
import { AuthView } from './views/AuthView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { StudyTrackerView } from './views/StudyTrackerView';
import { ProgramsView } from './views/ProgramsView';
import { ProgramDetailView } from './views/ProgramDetailView';
import { SyllabusTrackerView } from './views/SyllabusTrackerView';
import { CATDashboardView } from './views/CATDashboardView';
import { TestCenterView } from './views/TestCenterView';
import { CATMocksView } from './views/CATMocksView';
import { CATMockAnalysisView } from './views/CATMockAnalysisView';
import { CATSectionalsView } from './views/CATSectionalsView';
import { MistakeBookView } from './views/MistakeBookView';
import { SmartImportView } from './views/SmartImportView';
import { InboxView } from './views/InboxView';
import { AnalyticsView } from './views/AnalyticsView';
import { WeeklyReviewView } from './views/WeeklyReviewView';
import { SettingsView } from './views/SettingsView';
import { UpdatesView } from './views/UpdatesView';
import { HelpGuideView } from './views/HelpGuideView';

const MainContent: React.FC = () => {
  const {
    currentView,
    setIsSearchOpen,
    isAuthenticated,
    authLoading,
    currentUser,
    dailyCheckIns,
    setIsDailyCheckInOpen,
    isTourOpen,
    setIsTourOpen,
  } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto show daily check-in modal once per day if incomplete
  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingCompleted) {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = dailyCheckIns.some((c) => c.date === todayStr);
      const skippedToday = sessionStorage.getItem(`academicos_checkin_skipped_${todayStr}`);
      if (!hasCheckedInToday && !skippedToday) {
        setIsDailyCheckInOpen(true);
      }
    }
  }, [isAuthenticated, currentUser?.onboardingCompleted, dailyCheckIns, setIsDailyCheckInOpen]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-teal-500 text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] animate-pulse">
          <Zap className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>Loading Academicos...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  if (currentUser?.onboardingCompleted === false || currentView === 'onboarding') {
    return <OnboardingView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
      case 'calendar':
        return <TasksView />;
      case 'study':
        return <StudyTrackerView />;
      case 'programs':
        return <ProgramsView />;
      case 'program_detail':
        return <ProgramDetailView />;
      case 'syllabus':
      case 'cat_syllabus':
        return <SyllabusTrackerView />;
      case 'cat_overview':
        return <CATDashboardView />;
      case 'cat_mocks':
      case 'test_center':
        return <TestCenterView initialTab="upcoming" />;
      case 'cat_analysis':
        return <TestCenterView initialTab="analysis" />;
      case 'cat_sectionals':
        return <TestCenterView initialTab="completed" />;
      case 'mistakes':
        return <MistakeBookView />;
      case 'smart_import':
        return <SmartImportView />;
      case 'inbox':
        return <InboxView />;
      case 'analytics_study':
      case 'analytics_cat':
        return <AnalyticsView />;
      case 'weekly_review':
        return <WeeklyReviewView />;
      case 'updates':
        return <UpdatesView />;
      case 'settings':
        return <SettingsView />;
      case 'help_guide':
        return <HelpGuideView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-100 font-sans overflow-hidden antialiased selection:bg-teal-500 selection:text-black">
      {/* Navigation Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        <Topbar setIsMobileOpen={setIsMobileOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6 custom-scrollbar max-w-7xl w-full mx-auto">
          {renderView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Modals */}
      <QuickAddModal />
      <SearchModal />
      <StudyTimerModal />
      <DailyCheckInModal />
      <MigrationModal />
      <OnboardingTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
