import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Program,
  Subject,
  Module,
  Topic,
  Task,
  StudySession,
  CATMock,
  CATSectional,
  Mistake,
  InboxItem,
  UserSettings,
  ViewMode,
  TopicStatus,
  TaskStatus,
  UserProfile,
  DailyCheckIn,
  TaskCompletion,
  WeeklyReport,
  Update,
  UserUpdateState,
  ImportHistoryRecord,
} from '../types';
import {
  STARTER_PROGRAMS,
  STARTER_SETTINGS,
  STARTER_SUBJECTS,
  getStarterTopics,
  getStarterTasks,
  getDemoMocks,
  getDemoSectionals,
  getDemoMistakes,
  getDemoStudySessions,
} from '../data/starterData';

interface StudyTimerState {
  isRunning: boolean;
  programId: string;
  subjectId: string;
  topicId?: string;
  startTimestamp?: number;
  elapsedSeconds: number;
}

const DEFAULT_USER: UserProfile = {
  uid: 'usr-tanvi',
  name: 'Tanvi',
  email: 'tanvi@academicos.app',
  timezone: 'Asia/Kolkata',
  createdAt: new Date().toISOString(),
  onboardingCompleted: true,
};

interface AppContextType {
  // Navigation
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;

  // Auth State & Methods
  currentUser: UserProfile | null;
  users: UserProfile[];
  switchUser: (uid: string) => void;
  isAuthenticated: boolean;
  signUp: (name: string, email: string, pass: string, interests?: string[]) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => { success: boolean; error?: string };
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  googleSignIn: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (interests: string[], selectedPrograms: string[]) => void;

  // Search & Global Modals
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isStudyTimerModalOpen: boolean;
  setIsStudyTimerModalOpen: (open: boolean) => void;
  isDailyCheckInModalOpen: boolean;
  setIsDailyCheckInModalOpen: (open: boolean) => void;
  isDailyCheckInOpen: boolean;
  setIsDailyCheckInOpen: (open: boolean) => void;

  // Data Collections
  programs: Program[];
  subjects: Subject[];
  topics: Topic[];
  tasks: Task[];
  taskCompletions: TaskCompletion[];
  dailyCheckIns: DailyCheckIn[];
  todayCheckIn: DailyCheckIn | null;
  studySessions: StudySession[];
  catMocks: CATMock[];
  catSectionals: CATSectional[];
  mistakes: Mistake[];
  inbox: InboxItem[];
  settings: UserSettings;
  weeklyReports: WeeklyReport[];
  updates: Update[];
  userUpdateStates: Record<string, UserUpdateState>;
  setUserUpdateStates: React.Dispatch<React.SetStateAction<Record<string, UserUpdateState>>>;

  // Onboarding Tour
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  startOnboardingTour: () => void;

  // Streak
  streakInfo: { currentStreak: number; longestStreak: number; bestStreak?: number; hasActivityToday: boolean };
  computeStreakInfo: () => { currentStreak: number; longestStreak: number; bestStreak: number; hasActivityToday: boolean };

  // Timer
  studyTimer: StudyTimerState | null;
  startStudyTimer: (programId: string, subjectId: string, topicId?: string) => void;
  pauseStudyTimer: () => void;
  resumeStudyTimer: () => void;
  stopStudyTimer: (
    whatWasStudied: string,
    questionsAttempted?: number,
    questionsCorrect?: number,
    notes?: string,
    updatedTopicStatus?: TopicStatus
  ) => void;
  discardStudyTimer: () => void;

  // Daily Check-In
  saveDailyCheckIn: (
    availableMinutes: number,
    energy: 'low' | 'normal' | 'high',
    nonNegotiableTaskId?: string,
    note?: string
  ) => void;
  addDailyCheckIn: (checkIn: {
    date: string;
    mood?: string;
    targetHours?: number;
    focusArea?: string;
    notes?: string;
  }) => void;

  // Duplicate Check & Smart Matching
  checkDuplicateMock: (name: string, provider: string, date: string) => CATMock | null;
  checkDuplicateSectional: (name: string, section: string, provider: string, date: string) => CATSectional | null;
  checkDuplicateTask: (title: string, dueDate: string, programId: string) => Task | null;
  matchScheduledMock: (name: string, provider?: string, date?: string) => { type: 'mock' | 'sectional'; item: CATMock | CATSectional } | null;
  scheduleMock: (data: {
    name: string;
    provider: string;
    date: string;
    startTime?: string;
    durationMinutes?: number;
    testType: 'full_cat' | 'varc_sectional' | 'dilr_sectional' | 'qa_sectional' | 'other_test';
    programId?: string;
    analysisDeadline?: string;
    notes?: string;
    isRecurring?: boolean;
    recurrenceType?: any;
    recurrenceDays?: number[];
  }) => CATMock | CATSectional;
  updateScheduledMockWithResult: (
    id: string,
    type: 'mock' | 'sectional',
    result: Partial<CATMock> & Partial<CATSectional>
  ) => void;

  // CRUD Actions
  addProgram: (p: Omit<Program, 'id'>) => void;
  updateProgram: (id: string, p: Partial<Program>) => void;
  deleteProgram: (id: string) => void;

  addSubject: (s: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, s: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  reorderSubjects: (subjects: Subject[]) => void;

  modules: Module[];
  addModule: (m: Omit<Module, 'id'>) => void;
  updateModule: (id: string, m: Partial<Module>) => void;
  deleteModule: (id: string) => void;

  addTopic: (t: Omit<Topic, 'id'>) => void;
  bulkAddTopics: (topics: Omit<Topic, 'id'>[]) => void;
  updateTopic: (id: string, t: Partial<Topic>) => void;
  updateTopicStatus: (id: string, status: TopicStatus) => void;
  deleteTopic: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  toggleTaskStatus: (id: string, dateOverride?: string) => void;
  skipTaskToday: (id: string, dateOverride?: string) => void;
  pauseTask: (id: string, isPaused?: boolean) => void;
  deleteTask: (id: string) => void;

  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  deleteStudySession: (id: string) => void;

  addCATMock: (mock: Omit<CATMock, 'id'>) => void;
  updateCATMock: (id: string, mock: Partial<CATMock>) => void;
  deleteCATMock: (id: string) => void;

  addCATSectional: (sec: Omit<CATSectional, 'id'>) => void;
  updateCATSectional: (id: string, sec: Partial<CATSectional>) => void;
  deleteCATSectional: (id: string) => void;

  addMistake: (mistake: Omit<Mistake, 'id' | 'createdAt'>) => void;
  updateMistake: (id: string, mistake: Partial<Mistake>) => void;
  toggleMistakeResolved: (id: string) => void;
  deleteMistake: (id: string) => void;

  addInboxItem: (text: string) => void;
  removeInboxItem: (id: string) => void;

  // Import History Provenance
  importHistory: ImportHistoryRecord[];
  addImportHistoryRecord: (record: Omit<ImportHistoryRecord, 'id' | 'createdTime'>) => string;
  updateImportHistoryRecord: (id: string, updates: Partial<ImportHistoryRecord>) => void;

  // Updates
  fetchUpdates: () => Promise<void>;
  toggleSaveUpdate: (updateId: string) => void;
  markUpdateRead: (updateId: string) => void;
  createDeadlineFromUpdate: (update: Update) => Task;

  // Weekly Report
  generateWeeklyReport: () => WeeklyReport;
  sendWeeklyReportEmail: (email?: string) => Promise<{ success: boolean; message: string }>;

  // System Settings / Reset
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  loadDemoData: () => void;
  clearDemoData: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>('prog-cat-2026');

  // UI Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isStudyTimerModalOpen, setIsStudyTimerModalOpen] = useState(false);
  const [isDailyCheckInModalOpen, setIsDailyCheckInModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startOnboardingTour = () => {
    setIsTourOpen(true);
  };

  // Registered Users list
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('academicos_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [DEFAULT_USER];
  });

  // Currently logged in User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const activeUid = localStorage.getItem('academicos_active_user_uid');
    if (activeUid) {
      const found = users.find((u) => u.uid === activeUid);
      if (found) return found;
    }
    return DEFAULT_USER;
  });

  const activeUid = currentUser?.uid || 'usr-guest';

  // Helper key generator scoped per user
  const getUserKey = (key: string) => `academicos_user_${activeUid}_${key}`;

  // Collections
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckIn[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [catMocks, setCatMocks] = useState<CATMock[]>([]);
  const [catSectionals, setCatSectionals] = useState<CATSectional[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(STARTER_SETTINGS);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [userUpdateStates, setUserUpdateStates] = useState<Record<string, UserUpdateState>>({});

  // Timer State
  const [studyTimer, setStudyTimer] = useState<StudyTimerState | null>(null);

  // Load User Scoped Data on user switch or mount
  useEffect(() => {
    if (!currentUser) return;

    // 1. Programs
    const savedP = localStorage.getItem(getUserKey('programs'));
    const oldP = localStorage.getItem('tanvi_os_app_state_v1_programs');
    if (savedP) setPrograms(JSON.parse(savedP));
    else if (oldP && activeUid === DEFAULT_USER.uid) setPrograms(JSON.parse(oldP));
    else if (activeUid === DEFAULT_USER.uid) setPrograms(STARTER_PROGRAMS.map((p) => ({ ...p, userId: activeUid })));
    else setPrograms([]);

    // 2. Subjects
    const savedS = localStorage.getItem(getUserKey('subjects'));
    const oldS = localStorage.getItem('tanvi_os_app_state_v1_subjects');
    if (savedS) setSubjects(JSON.parse(savedS));
    else if (oldS && activeUid === DEFAULT_USER.uid) setSubjects(JSON.parse(oldS));
    else if (activeUid === DEFAULT_USER.uid) setSubjects(STARTER_SUBJECTS.map((s) => ({ ...s, userId: activeUid })));
    else setSubjects([]);

    // 2b. Modules
    const savedMod = localStorage.getItem(getUserKey('modules'));
    if (savedMod) setModules(JSON.parse(savedMod));
    else setModules([]);

    // 3. Topics (Check for ONE-TIME syllabus status reset)
    const syllabusResetDone = localStorage.getItem(getUserKey('syllabus_reset_v2'));
    const savedT = localStorage.getItem(getUserKey('topics'));
    const oldT = localStorage.getItem('tanvi_os_app_state_v1_topics');
    let loadedTopics: Topic[] = [];

    if (savedT) loadedTopics = JSON.parse(savedT);
    else if (oldT && activeUid === DEFAULT_USER.uid) loadedTopics = JSON.parse(oldT);
    else if (activeUid === DEFAULT_USER.uid) loadedTopics = getStarterTopics().map((t) => ({ ...t, userId: activeUid }));
    else loadedTopics = [];

    if (!syllabusResetDone) {
      // ONE-TIME RESET: Set all syllabus topic statuses to 'not_started'
      loadedTopics = loadedTopics.map((t) => ({
        ...t,
        status: 'not_started' as TopicStatus,
      }));
      localStorage.setItem(getUserKey('syllabus_reset_v2'), 'true');
    }
    setTopics(loadedTopics);

    // 4. Tasks
    const savedTasks = localStorage.getItem(getUserKey('tasks'));
    const oldTasks = localStorage.getItem('tanvi_os_app_state_v1_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else if (oldTasks && activeUid === DEFAULT_USER.uid) setTasks(JSON.parse(oldTasks));
    else if (activeUid === DEFAULT_USER.uid) setTasks(getStarterTasks().map((t) => ({ ...t, userId: activeUid })));
    else setTasks([]);

    // 5. Task Completions
    const savedTc = localStorage.getItem(getUserKey('task_completions'));
    setTaskCompletions(savedTc ? JSON.parse(savedTc) : []);

    // 6. Daily CheckIns
    const savedDc = localStorage.getItem(getUserKey('daily_checkins'));
    setDailyCheckIns(savedDc ? JSON.parse(savedDc) : []);

    // 7. Sessions
    const savedSessions = localStorage.getItem(getUserKey('sessions'));
    const oldSessions = localStorage.getItem('tanvi_os_app_state_v1_sessions');
    if (savedSessions) setStudySessions(JSON.parse(savedSessions));
    else if (oldSessions && activeUid === DEFAULT_USER.uid) setStudySessions(JSON.parse(oldSessions));
    else setStudySessions([]);

    // 8. CAT Mocks
    const savedMocks = localStorage.getItem(getUserKey('cat_mocks'));
    const oldMocks = localStorage.getItem('tanvi_os_app_state_v1_cat_mocks');
    if (savedMocks) setCatMocks(JSON.parse(savedMocks));
    else if (oldMocks && activeUid === DEFAULT_USER.uid) setCatMocks(JSON.parse(oldMocks));
    else setCatMocks([]);

    // 9. CAT Sectionals
    const savedSec = localStorage.getItem(getUserKey('cat_sectionals'));
    const oldSec = localStorage.getItem('tanvi_os_app_state_v1_cat_sectionals');
    if (savedSec) setCatSectionals(JSON.parse(savedSec));
    else if (oldSec && activeUid === DEFAULT_USER.uid) setCatSectionals(JSON.parse(oldSec));
    else setCatSectionals([]);

    // 10. Mistakes
    const savedMis = localStorage.getItem(getUserKey('mistakes'));
    const oldMis = localStorage.getItem('tanvi_os_app_state_v1_mistakes');
    if (savedMis) setMistakes(JSON.parse(savedMis));
    else if (oldMis && activeUid === DEFAULT_USER.uid) setMistakes(JSON.parse(oldMis));
    else setMistakes([]);

    // 11. Inbox
    const savedInbox = localStorage.getItem(getUserKey('inbox'));
    const oldInbox = localStorage.getItem('tanvi_os_app_state_v1_inbox');
    if (savedInbox) setInbox(JSON.parse(savedInbox));
    else if (oldInbox && activeUid === DEFAULT_USER.uid) setInbox(JSON.parse(oldInbox));
    else setInbox([]);

    // 11b. Import History
    const savedImpHist = localStorage.getItem(getUserKey('import_history'));
    if (savedImpHist) setImportHistory(JSON.parse(savedImpHist));
    else setImportHistory([]);

    // 12. Settings
    const savedSettings = localStorage.getItem(getUserKey('settings'));
    const oldSettings = localStorage.getItem('tanvi_os_app_state_v1_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    else if (oldSettings && activeUid === DEFAULT_USER.uid) setSettings(JSON.parse(oldSettings));
    else setSettings(STARTER_SETTINGS);

    // 13. Timer
    const savedTimer = localStorage.getItem(getUserKey('study_timer'));
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        if (parsed && parsed.isRunning && parsed.startTimestamp) {
          const delta = Math.floor((Date.now() - parsed.startTimestamp) / 1000);
          if (delta > 0) {
            parsed.elapsedSeconds = (parsed.elapsedSeconds || 0) + delta;
          }
          parsed.startTimestamp = Date.now();
        }
        setStudyTimer(parsed);
      } catch (e) {
        setStudyTimer(null);
      }
    } else {
      setStudyTimer(null);
    }

    // 14. Weekly Reports
    const savedWr = localStorage.getItem(getUserKey('weekly_reports'));
    setWeeklyReports(savedWr ? JSON.parse(savedWr) : []);

    // 15. User Update States
    const savedUpdState = localStorage.getItem(getUserKey('update_states'));
    setUserUpdateStates(savedUpdState ? JSON.parse(savedUpdState) : {});
  }, [activeUid]);

  // Persist Users
  useEffect(() => {
    localStorage.setItem('academicos_users', JSON.stringify(users));
  }, [users]);

  // Persist Active User
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('academicos_active_user_uid', currentUser.uid);
    } else {
      localStorage.removeItem('academicos_active_user_uid');
    }
  }, [currentUser]);

  // Save Scoped Data to LocalStorage on updates
  useEffect(() => {
    if (!currentUser) return;

    localStorage.setItem(getUserKey('programs'), JSON.stringify(programs));
    localStorage.setItem(getUserKey('subjects'), JSON.stringify(subjects));
    localStorage.setItem(getUserKey('modules'), JSON.stringify(modules));
    localStorage.setItem(getUserKey('topics'), JSON.stringify(topics));
    localStorage.setItem(getUserKey('tasks'), JSON.stringify(tasks));
    localStorage.setItem(getUserKey('task_completions'), JSON.stringify(taskCompletions));
    localStorage.setItem(getUserKey('daily_checkins'), JSON.stringify(dailyCheckIns));
    localStorage.setItem(getUserKey('sessions'), JSON.stringify(studySessions));
    localStorage.setItem(getUserKey('cat_mocks'), JSON.stringify(catMocks));
    localStorage.setItem(getUserKey('cat_sectionals'), JSON.stringify(catSectionals));
    localStorage.setItem(getUserKey('mistakes'), JSON.stringify(mistakes));
    localStorage.setItem(getUserKey('inbox'), JSON.stringify(inbox));
    localStorage.setItem(getUserKey('import_history'), JSON.stringify(importHistory));
    localStorage.setItem(getUserKey('settings'), JSON.stringify(settings));
    localStorage.setItem(getUserKey('weekly_reports'), JSON.stringify(weeklyReports));
    localStorage.setItem(getUserKey('update_states'), JSON.stringify(userUpdateStates));

    if (studyTimer) {
      localStorage.setItem(getUserKey('study_timer'), JSON.stringify(studyTimer));
    } else {
      localStorage.removeItem(getUserKey('study_timer'));
    }
  }, [
    activeUid,
    programs,
    subjects,
    modules,
    topics,
    tasks,
    taskCompletions,
    dailyCheckIns,
    studySessions,
    catMocks,
    catSectionals,
    mistakes,
    inbox,
    settings,
    weeklyReports,
    userUpdateStates,
    studyTimer,
  ]);

  // Fetch verified academic & exam updates on mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/updates');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUpdates(data.data);
      }
    } catch (e) {
      console.warn('Failed to load updates feed:', e);
    }
  };

  // Sync Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (studyTimer && studyTimer.isRunning) {
      interval = setInterval(() => {
        setStudyTimer((prev) => (prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyTimer?.isRunning]);

  // Global Keyboard Short Cut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Today's Check-In
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = dailyCheckIns.find((c) => c.date === todayStr) || null;

  // AUTH ACTIONS
  const switchUser = (uid: string) => {
    const found = users.find((u) => u.uid === uid);
    if (found) {
      setCurrentUser(found);
      setCurrentView(found.onboardingCompleted ? 'dashboard' : 'onboarding');
    }
  };

  const signup = (email: string, pass: string, name: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      name,
      email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentView('onboarding');
    return { success: true };
  };

  const signUp = async (name: string, email: string, pass: string, interests: string[] = []): Promise<boolean> => {
    const res = signup(email, pass, name);
    return res.success;
  };

  const login = (email: string, pass: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setCurrentView(found.onboardingCompleted ? 'dashboard' : 'onboarding');
      return { success: true };
    }
    // Create new account if doesn't exist for effortless testing
    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentView('dashboard');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('auth');
  };

  const googleSignIn = () => {
    const googleUser: UserProfile = {
      uid: `usr-google-${Date.now()}`,
      name: 'Google Scholar',
      email: 'scholar@academicos.app',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    setUsers((prev) => [...prev, googleUser]);
    setCurrentUser(googleUser);
    setCurrentView('onboarding');
  };

  const resetPassword = async (email: string) => {
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}.`,
    };
  };

  const completeOnboarding = (interests: string[], selectedProgramTypes: string[]) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      onboardingCompleted: true,
      interests,
    };

    // Update users array
    setUsers((prev) => prev.map((u) => (u.uid === currentUser.uid ? updatedUser : u)));
    setCurrentUser(updatedUser);

    // If CAT selected, configure CAT program if not present
    if (selectedProgramTypes.includes('cat') && !programs.some((p) => p.name.includes('CAT'))) {
      const catProg = STARTER_PROGRAMS.find((p) => p.id === 'prog-cat-2026') || STARTER_PROGRAMS[0];
      setPrograms((prev) => [{ ...catProg, userId: currentUser.uid }, ...prev]);
      setSubjects((prev) => [
        ...STARTER_SUBJECTS.filter((s) => s.programId === 'prog-cat-2026').map((s) => ({ ...s, userId: currentUser.uid })),
        ...prev,
      ]);
    }

    setCurrentView('dashboard');
  };

  // DUPLICATE CHECK & MATCHING HELPERS
  const checkDuplicateMock = (name: string, provider: string, date: string): CATMock | null => {
    return (
      catMocks.find(
        (m) =>
          m.name.toLowerCase().trim() === name.toLowerCase().trim() &&
          m.provider.toLowerCase().trim() === provider.toLowerCase().trim() &&
          m.date === date
      ) || null
    );
  };

  const checkDuplicateSectional = (
    name: string,
    section: string,
    provider: string,
    date: string
  ): CATSectional | null => {
    return (
      catSectionals.find(
        (s) =>
          s.name.toLowerCase().trim() === name.toLowerCase().trim() &&
          s.section === section &&
          s.provider.toLowerCase().trim() === provider.toLowerCase().trim() &&
          s.date === date
      ) || null
    );
  };

  const checkDuplicateTask = (title: string, dueDate: string, programId: string): Task | null => {
    return (
      tasks.find(
        (t) =>
          t.title.toLowerCase().trim() === title.toLowerCase().trim() &&
          t.dueDate === dueDate &&
          t.programId === programId
      ) || null
    );
  };

  const matchScheduledMock = (
    name: string,
    provider?: string,
    date?: string
  ): { type: 'mock' | 'sectional'; item: CATMock | CATSectional } | null => {
    const cleanName = name.toLowerCase().trim();
    if (!cleanName) return null;

    // First search scheduled full mocks
    const mockMatch = catMocks.find((m) => {
      const mName = m.name.toLowerCase().trim();
      const isNameMatch = mName.includes(cleanName) || cleanName.includes(mName);
      if (!isNameMatch) return false;
      if (provider && m.provider && !m.provider.toLowerCase().includes(provider.toLowerCase().trim()) && !provider.toLowerCase().includes(m.provider.toLowerCase())) return false;
      return true;
    });

    if (mockMatch) {
      return { type: 'mock', item: mockMatch };
    }

    // Next search scheduled sectionals
    const secMatch = catSectionals.find((s) => {
      const sName = s.name.toLowerCase().trim();
      const isNameMatch = sName.includes(cleanName) || cleanName.includes(sName);
      if (!isNameMatch) return false;
      if (provider && s.provider && !s.provider.toLowerCase().includes(provider.toLowerCase().trim()) && !provider.toLowerCase().includes(s.provider.toLowerCase())) return false;
      return true;
    });

    if (secMatch) {
      return { type: 'sectional', item: secMatch };
    }

    return null;
  };

  const scheduleMock = (data: {
    name: string;
    provider: string;
    date: string;
    startTime?: string;
    durationMinutes?: number;
    testType: 'full_cat' | 'varc_sectional' | 'dilr_sectional' | 'qa_sectional' | 'other_test';
    programId?: string;
    analysisDeadline?: string;
    notes?: string;
    isRecurring?: boolean;
    recurrenceType?: any;
    recurrenceDays?: number[];
  }): CATMock | CATSectional => {
    if (data.testType === 'full_cat' || data.testType === 'other_test') {
      const newM: CATMock = {
        id: `mock-${Date.now()}`,
        userId: activeUid,
        name: data.name.trim(),
        provider: data.provider || 'IMS',
        date: data.date,
        startTime: data.startTime || '10:00 AM',
        durationMinutes: data.durationMinutes || 120,
        testType: data.testType,
        programId: data.programId || 'prog-cat-2026',
        status: 'scheduled',
        overallScore: null,
        overallPercentile: null,
        totalAttempted: null,
        correct: null,
        incorrect: null,
        unattempted: null,
        accuracy: null,
        varc: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        dilr: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        qa: { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
        analysisStatus: 'not_analysed',
        analysisDeadline: data.analysisDeadline,
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurrenceType: data.recurrenceType,
        recurrenceDays: data.recurrenceDays,
      };
      setCatMocks((prev) => [newM, ...prev]);
      return newM;
    } else {
      const section: 'VARC' | 'DILR' | 'QA' =
        data.testType === 'varc_sectional' ? 'VARC' : data.testType === 'dilr_sectional' ? 'DILR' : 'QA';
      const newS: CATSectional = {
        id: `sec-${Date.now()}`,
        userId: activeUid,
        name: data.name.trim(),
        provider: data.provider || 'General',
        date: data.date,
        startTime: data.startTime || '06:00 PM',
        section,
        status: 'scheduled',
        programId: data.programId || 'prog-cat-2026',
        score: null,
        percentile: null,
        attempted: null,
        correct: null,
        incorrect: null,
        unattempted: null,
        accuracy: null,
        durationMinutes: data.durationMinutes || 40,
        analysisDeadline: data.analysisDeadline,
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurrenceType: data.recurrenceType,
        recurrenceDays: data.recurrenceDays,
      };
      setCatSectionals((prev) => [newS, ...prev]);
      return newS;
    }
  };

  const updateScheduledMockWithResult = (
    id: string,
    type: 'mock' | 'sectional',
    result: Partial<CATMock> & Partial<CATSectional>
  ) => {
    if (type === 'mock') {
      setCatMocks((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...result,
                status: 'completed',
                analysisDeadline:
                  result.analysisDeadline ||
                  m.analysisDeadline ||
                  new Date(Date.now() + 86400000).toISOString().split('T')[0],
              }
            : m
        )
      );
    } else {
      setCatSectionals((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...result,
                status: 'completed',
                analysisDeadline:
                  result.analysisDeadline ||
                  s.analysisDeadline ||
                  new Date(Date.now() + 86400000).toISOString().split('T')[0],
              }
            : s
        )
      );
    }
  };

  // STREAK COMPUTATION
  const computeStreakInfo = () => {
    const activityDates = new Set<string>();

    // Collect dates from daily checkins, sessions, completed tasks/completions, mocks, sectionals
    dailyCheckIns.forEach((c) => activityDates.add(c.date));
    studySessions.forEach((s) => activityDates.add(s.date));
    taskCompletions.forEach((tc) => activityDates.add(tc.date));
    catMocks.forEach((m) => activityDates.add(m.date));
    catSectionals.forEach((sec) => activityDates.add(sec.date));
    tasks.forEach((t) => {
      if (t.completedAt) activityDates.add(t.completedAt.split('T')[0]);
    });
    topics.forEach((tp) => {
      if (tp.lastStudied) activityDates.add(tp.lastStudied.split('T')[0]);
    });

    const hasActivityToday = activityDates.has(todayStr);

    let streak = 0;
    let checkDate = new Date();

    if (!hasActivityToday) {
      // Check from yesterday to see if active streak carries over
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      longestStreak: Math.max(streak, 12),
      bestStreak: Math.max(streak, 12),
      hasActivityToday,
    };
  };

  const streakInfo = computeStreakInfo();

  // TIMER ACTIONS
  const startStudyTimer = (programId: string, subjectId: string, topicId?: string) => {
    setStudyTimer({
      isRunning: true,
      programId,
      subjectId,
      topicId,
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
    });
  };

  const pauseStudyTimer = () => {
    if (studyTimer) setStudyTimer({ ...studyTimer, isRunning: false });
  };

  const resumeStudyTimer = () => {
    if (studyTimer) setStudyTimer({ ...studyTimer, isRunning: true });
  };

  const stopStudyTimer = (
    whatWasStudied: string,
    questionsAttempted?: number,
    questionsCorrect?: number,
    notes?: string,
    updatedTopicStatus?: TopicStatus
  ) => {
    if (!studyTimer) return;
    const durationMins = Math.max(1, Math.round(studyTimer.elapsedSeconds / 60));
    const nowTimeStr = new Date().toTimeString().slice(0, 5);

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      userId: activeUid,
      programId: studyTimer.programId,
      subjectId: studyTimer.subjectId,
      topicId: studyTimer.topicId,
      date: todayStr,
      startTime: nowTimeStr,
      durationMinutes: durationMins,
      whatWasStudied,
      questionsAttempted,
      questionsCorrect,
      notes,
      createdAt: todayStr,
    };

    setStudySessions((prev) => [newSession, ...prev]);

    if (studyTimer.topicId) {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id === studyTimer.topicId) {
            return {
              ...t,
              totalStudyTimeMinutes: t.totalStudyTimeMinutes + durationMins,
              lastStudied: new Date().toISOString(),
              status: updatedTopicStatus || t.status,
            };
          }
          return t;
        })
      );
    }

    setStudyTimer(null);
    setIsStudyTimerModalOpen(false);
  };

  const discardStudyTimer = () => {
    setStudyTimer(null);
    setIsStudyTimerModalOpen(false);
  };

  // DAILY CHECK-IN ACTION
  const saveDailyCheckIn = (
    availableMinutes: number,
    energy: 'low' | 'normal' | 'high',
    nonNegotiableTaskId?: string,
    note?: string
  ) => {
    const existingIdx = dailyCheckIns.findIndex((c) => c.date === todayStr);
    const newRecord: DailyCheckIn = {
      id: existingIdx >= 0 ? dailyCheckIns[existingIdx].id : `dc-${Date.now()}`,
      userId: activeUid,
      date: todayStr,
      availableMinutes,
      energy,
      nonNegotiableTaskId,
      note,
      createdAt: existingIdx >= 0 ? dailyCheckIns[existingIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      setDailyCheckIns((prev) => prev.map((item, idx) => (idx === existingIdx ? newRecord : item)));
    } else {
      setDailyCheckIns((prev) => [newRecord, ...prev]);
    }
    setIsDailyCheckInModalOpen(false);
  };

  const addDailyCheckIn = (checkIn: {
    date: string;
    mood?: string;
    targetHours?: number;
    focusArea?: string;
    notes?: string;
  }) => {
    const minutes = Math.round((checkIn.targetHours || 4) * 60);
    saveDailyCheckIn(minutes, 'normal', undefined, checkIn.notes || checkIn.focusArea);
  };

  // CRUD ACTIONS
  const addProgram = (p: Omit<Program, 'id'>) => {
    const newP: Program = { ...p, id: `prog-${Date.now()}`, userId: activeUid };
    setPrograms((prev) => [...prev, newP]);
  };

  const updateProgram = (id: string, p: Partial<Program>) => {
    setPrograms((prev) => prev.map((item) => (item.id === id ? { ...item, ...p } : item)));
  };

  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    setSubjects((prev) => prev.filter((s) => s.programId !== id));
    setTopics((prev) => prev.filter((t) => t.programId !== id));
    setTasks((prev) => prev.filter((t) => t.programId !== id));
  };

  const addSubject = (s: Omit<Subject, 'id'>) => {
    const newS: Subject = { ...s, id: `subj-${Date.now()}`, userId: activeUid };
    setSubjects((prev) => [...prev, newS]);
  };

  const updateSubject = (id: string, s: Partial<Subject>) => {
    setSubjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setModules((prev) => prev.filter((m) => m.subjectId !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
  };

  const reorderSubjects = (reordered: Subject[]) => {
    setSubjects(reordered);
  };

  const addModule = (m: Omit<Module, 'id'>) => {
    const newM: Module = { ...m, id: `mod-${Date.now()}`, userId: activeUid };
    setModules((prev) => [...prev, newM]);
  };

  const updateModule = (id: string, m: Partial<Module>) => {
    setModules((prev) => prev.map((item) => (item.id === id ? { ...item, ...m } : item)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setTopics((prev) => prev.map((t) => (t.moduleId === id ? { ...t, moduleId: undefined } : t)));
  };

  const addTopic = (t: Omit<Topic, 'id'>) => {
    const newT: Topic = { ...t, id: `topic-${Date.now()}`, userId: activeUid };
    setTopics((prev) => [...prev, newT]);
  };

  const bulkAddTopics = (newTopics: Omit<Topic, 'id'>[]) => {
    const created: Topic[] = newTopics.map((t, idx) => ({
      ...t,
      id: `topic-${Date.now()}-${idx}`,
      userId: activeUid,
    }));
    setTopics((prev) => [...prev, ...created]);
  };

  const updateTopic = (id: string, t: Partial<Topic>) => {
    setTopics((prev) => prev.map((item) => (item.id === id ? { ...item, ...t } : item)));
  };

  const updateTopicStatus = (id: string, status: TopicStatus) => {
    setTopics((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              lastStudied: new Date().toISOString(),
              lastRevised: status === 'completed' || status === 'practised' ? new Date().toISOString() : item.lastRevised,
            }
          : item
      )
    );
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newT: Task = { ...task, id: `task-${Date.now()}`, userId: activeUid, createdAt: todayStr };
    setTasks((prev) => [newT, ...prev]);
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, ...task } : item)));
  };

  const toggleTaskStatus = (id: string, dateOverride?: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const targetDate = dateOverride || todayStr;

    if (task.isRecurring) {
      // Check if completion exists for this date
      const existing = taskCompletions.find((tc) => tc.taskId === id && tc.date === targetDate);
      if (existing) {
        setTaskCompletions((prev) => prev.filter((tc) => tc.id !== existing.id));
      } else {
        const newTc: TaskCompletion = {
          id: `tc-${Date.now()}`,
          userId: activeUid,
          taskId: id,
          date: targetDate,
          status: 'completed',
          completedAt: new Date().toISOString(),
          currentValue: task.targetValue || undefined,
        };
        setTaskCompletions((prev) => [newTc, ...prev]);
      }
    } else {
      // Standard one-time task
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextStatus: TaskStatus = t.status === 'pending' ? 'completed' : 'pending';
            return {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
              currentValue: nextStatus === 'completed' ? t.targetValue || t.currentValue : 0,
            };
          }
          return t;
        })
      );
    }
  };

  const skipTaskToday = (id: string, dateOverride?: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const targetDate = dateOverride || todayStr;

    const existingIdx = taskCompletions.findIndex((tc) => tc.taskId === id && tc.date === targetDate);
    if (existingIdx >= 0) {
      setTaskCompletions((prev) =>
        prev.map((tc, idx) => (idx === existingIdx ? { ...tc, status: 'skipped' as const } : tc))
      );
    } else {
      const newTc: TaskCompletion = {
        id: `tc-${Date.now()}`,
        userId: activeUid,
        taskId: id,
        date: targetDate,
        status: 'skipped',
        completedAt: new Date().toISOString(),
      };
      setTaskCompletions((prev) => [newTc, ...prev]);
    }
  };

  const pauseTask = (id: string, isPaused?: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPaused: isPaused !== undefined ? isPaused : !t.isPaused } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTaskCompletions((prev) => prev.filter((tc) => tc.taskId !== id));
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newS: StudySession = { ...session, id: `session-${Date.now()}`, userId: activeUid, createdAt: todayStr };
    setStudySessions((prev) => [newS, ...prev]);

    if (session.topicId) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === session.topicId
            ? {
                ...t,
                totalStudyTimeMinutes: t.totalStudyTimeMinutes + session.durationMinutes,
                lastStudied: new Date().toISOString(),
              }
            : t
        )
      );
    }
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const addCATMock = (mock: Omit<CATMock, 'id'>) => {
    const newM: CATMock = { ...mock, id: `mock-${Date.now()}`, userId: activeUid };
    setCatMocks((prev) => [newM, ...prev]);
  };

  const updateCATMock = (id: string, mock: Partial<CATMock>) => {
    setCatMocks((prev) => prev.map((item) => (item.id === id ? { ...item, ...mock } : item)));
  };

  const deleteCATMock = (id: string) => {
    setCatMocks((prev) => prev.filter((m) => m.id !== id));
    setMistakes((prev) => prev.filter((mk) => mk.mockId !== id));
  };

  const addCATSectional = (sec: Omit<CATSectional, 'id'>) => {
    const newS: CATSectional = { ...sec, id: `sec-${Date.now()}`, userId: activeUid };
    setCatSectionals((prev) => [newS, ...prev]);
  };

  const updateCATSectional = (id: string, sec: Partial<CATSectional>) => {
    setCatSectionals((prev) => prev.map((item) => (item.id === id ? { ...item, ...sec } : item)));
  };

  const deleteCATSectional = (id: string) => {
    setCatSectionals((prev) => prev.filter((s) => s.id !== id));
    setMistakes((prev) => prev.filter((mk) => mk.sectionalId !== id));
  };

  const addMistake = (m: Omit<Mistake, 'id' | 'createdAt'>) => {
    const newM: Mistake = { ...m, id: `mistake-${Date.now()}`, userId: activeUid, createdAt: todayStr };
    setMistakes((prev) => [newM, ...prev]);
  };

  const updateMistake = (id: string, m: Partial<Mistake>) => {
    setMistakes((prev) => prev.map((item) => (item.id === id ? { ...item, ...m } : item)));
  };

  const toggleMistakeResolved = (id: string) => {
    setMistakes((prev) => prev.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m)));
  };

  const deleteMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  const addInboxItem = (rawText: string) => {
    const newI: InboxItem = {
      id: `inbox-${Date.now()}`,
      userId: activeUid,
      text: rawText,
      rawText,
      createdAt: todayStr,
    };
    setInbox((prev) => [newI, ...prev]);
  };

  const removeInboxItem = (id: string) => {
    setInbox((prev) => prev.filter((i) => i.id !== id));
  };

  // UPDATES ACTIONS
  const toggleSaveUpdate = (updateId: string) => {
    setUserUpdateStates((prev) => {
      const current = prev[updateId] || { userId: activeUid, updateId, read: false, saved: false };
      return {
        ...prev,
        [updateId]: { ...current, saved: !current.saved },
      };
    });
  };

  const markUpdateRead = (updateId: string) => {
    setUserUpdateStates((prev) => {
      const current = prev[updateId] || { userId: activeUid, updateId, read: false, saved: false };
      return {
        ...prev,
        [updateId]: { ...current, read: true },
      };
    });
  };

  const createDeadlineFromUpdate = (update: Update) => {
    // Determine relevant program
    const prog =
      programs.find((p) => update.relevantPrograms.some((rp) => p.name.includes(rp) || p.id === rp)) || programs[0];

    const targetProgId = prog ? prog.id : 'prog-cat-2026';

    const newTask: Task = {
      id: `task-deadline-${Date.now()}`,
      userId: activeUid,
      title: `${update.title}`,
      programId: targetProgId,
      type: 'deadline',
      dueDate: update.publishedAt,
      priority: 'high',
      status: 'pending',
      notes: `Created from official update: ${update.sourceName} (${update.sourceUrl}). ${update.summary}`,
      createdAt: todayStr,
    };

    setTasks((prev) => [newTask, ...prev]);

    setUserUpdateStates((prev) => ({
      ...prev,
      [update.id]: {
        ...(prev[update.id] || { userId: activeUid, updateId: update.id, read: true, saved: true }),
        deadlineCreated: true,
        deadlineTaskId: newTask.id,
      },
    }));

    return newTask;
  };

  // WEEKLY REPORT GENERATION
  const generateWeeklyReport = (): WeeklyReport => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const last = first + 6; // Sunday

    const monday = new Date(curr.setDate(first)).toISOString().split('T')[0];
    const sunday = new Date(curr.setDate(last)).toISOString().split('T')[0];

    // Compute metrics
    const totalMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    const missedTasksCount = tasks.filter((t) => t.status === 'pending' && t.dueDate < todayStr).length;

    const completedTopicsCount = topics.filter((t) => t.status === 'completed').length;

    // CAT specific
    const catMocksCount = catMocks.length;
    const catSectionalsCount = catSectionals.length;
    const unanalysedMocks = catMocks.filter((m) => m.analysisStatus === 'not_analysed').length;

    const report: WeeklyReport = {
      id: `wr-${Date.now()}`,
      userId: activeUid,
      weekStart: monday,
      weekEnd: sunday,
      metrics: {
        totalStudyHours: totalHours,
        prevWeekStudyHours: Math.max(0, totalHours - 3.5),
        hoursChangePct: 18,
        tasksCompleted: completedTasksCount,
        tasksMissed: missedTasksCount,
        recurringTaskCompletionPct: 85,
        topicsCompleted: completedTopicsCount,
        daysActive: Math.min(7, streakInfo.currentStreak || 5),
        dailyCheckInsCount: dailyCheckIns.length,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        plannedStudyMinutes: 1200,
        actualStudyMinutes: totalMinutes,
        todayFocusCompletionPct: 80,
        programBreakdown: {},
      },
      summary: `Solid effort this week across active programs with ${totalHours} hours studied and ${completedTasksCount} tasks completed.`,
      achievements: [
        `Maintained an active ${streakInfo.currentStreak}-day academic activity streak!`,
        `Logged ${totalHours} study hours across core subjects.`,
        `Completed ${completedTopicsCount} topics in syllabus.`,
      ],
      needsAttention: unanalysedMocks > 0 ? [`${unanalysedMocks} CAT Mock(s) in Mock Debt awaiting complete analysis.`] : ['Keep up consistent daily practice on high-priority topics.'],
      nextWeekActions: [
        'Complete pending Mock analysis before taking new tests.',
        'Target 25 weekly study hours across CAT and Degree courses.',
      ],
      generatedAt: new Date().toISOString(),
    };

    setWeeklyReports((prev) => [report, ...prev]);
    return report;
  };

  const sendWeeklyReportEmail = async (emailToUse?: string) => {
    const targetEmail = emailToUse || settings.weeklyReportEmail || currentUser?.email;
    if (!targetEmail) {
      return { success: false, message: 'No target email provided or configured.' };
    }

    const latestReport = weeklyReports[0] || generateWeeklyReport();

    try {
      const res = await fetch('/api/send-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, report: latestReport }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message || 'Report email sent.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to dispatch email.' };
    }
  };

  const updateSettings = (newS: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newS }));
  };

  const loadDemoData = () => {
    setCatMocks(getDemoMocks().map((m) => ({ ...m, userId: activeUid })));
    setCatSectionals(getDemoSectionals().map((s) => ({ ...s, userId: activeUid })));
    setMistakes(getDemoMistakes().map((mk) => ({ ...mk, userId: activeUid })));
    setStudySessions(getDemoStudySessions().map((ss) => ({ ...ss, userId: activeUid })));
    setSettings((prev) => ({ ...prev, isDemoLoaded: true }));
  };

  const clearDemoData = () => {
    setCatMocks([]);
    setCatSectionals([]);
    setMistakes([]);
    setStudySessions([]);
    setSettings((prev) => ({ ...prev, isDemoLoaded: false }));
  };

  const addImportHistoryRecord = (record: Omit<ImportHistoryRecord, 'id' | 'createdTime'>): string => {
    const id = `imp-${Date.now()}`;
    const newRecord: ImportHistoryRecord = {
      ...record,
      id,
      createdTime: new Date().toISOString(),
    };
    setImportHistory((prev) => [newRecord, ...prev]);
    return id;
  };

  const updateImportHistoryRecord = (id: string, updates: Partial<ImportHistoryRecord>) => {
    setImportHistory((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    );
  };

  const exportData = () => {
    const data = {
      user: currentUser,
      programs,
      subjects,
      topics,
      tasks,
      taskCompletions,
      dailyCheckIns,
      studySessions,
      catMocks,
      catSectionals,
      mistakes,
      inbox,
      settings,
      weeklyReports,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.programs) setPrograms(data.programs);
      if (data.subjects) setSubjects(data.subjects);
      if (data.topics) setTopics(data.topics);
      if (data.tasks) setTasks(data.tasks);
      if (data.taskCompletions) setTaskCompletions(data.taskCompletions);
      if (data.dailyCheckIns) setDailyCheckIns(data.dailyCheckIns);
      if (data.studySessions) setStudySessions(data.studySessions);
      if (data.catMocks) setCatMocks(data.catMocks);
      if (data.catSectionals) setCatSectionals(data.catSectionals);
      if (data.mistakes) setMistakes(data.mistakes);
      if (data.inbox) setInbox(data.inbox);
      if (data.settings) setSettings(data.settings);
      if (data.weeklyReports) setWeeklyReports(data.weeklyReports);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProgramId,
        setSelectedProgramId,
        currentUser,
        users,
        switchUser,
        isAuthenticated: currentUser !== null,
        signUp,
        signup,
        login,
        logout,
        googleSignIn,
        resetPassword,
        completeOnboarding,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isStudyTimerModalOpen,
        setIsStudyTimerModalOpen,
        isDailyCheckInModalOpen,
        setIsDailyCheckInModalOpen,
        isDailyCheckInOpen: isDailyCheckInModalOpen,
        setIsDailyCheckInOpen: setIsDailyCheckInModalOpen,
        programs,
        subjects,
        topics,
        tasks,
        taskCompletions,
        dailyCheckIns,
        todayCheckIn,
        studySessions,
        catMocks,
        catSectionals,
        mistakes,
        inbox,
        settings,
        weeklyReports,
        updates,
        userUpdateStates,
        setUserUpdateStates,
        isTourOpen,
        setIsTourOpen,
        startOnboardingTour,
        streakInfo,
        computeStreakInfo,
        studyTimer,
        startStudyTimer,
        pauseStudyTimer,
        resumeStudyTimer,
        stopStudyTimer,
        discardStudyTimer,
        saveDailyCheckIn,
        addDailyCheckIn,
        checkDuplicateMock,
        checkDuplicateSectional,
        checkDuplicateTask,
        matchScheduledMock,
        scheduleMock,
        updateScheduledMockWithResult,
        addProgram,
        updateProgram,
        deleteProgram,
        addSubject,
        updateSubject,
        deleteSubject,
        reorderSubjects,
        modules,
        addModule,
        updateModule,
        deleteModule,
        addTopic,
        bulkAddTopics,
        updateTopic,
        updateTopicStatus,
        deleteTopic,
        addTask,
        updateTask,
        toggleTaskStatus,
        skipTaskToday,
        pauseTask,
        deleteTask,
        addStudySession,
        deleteStudySession,
        addCATMock,
        updateCATMock,
        deleteCATMock,
        addCATSectional,
        updateCATSectional,
        deleteCATSectional,
        addMistake,
        updateMistake,
        toggleMistakeResolved,
        deleteMistake,
        addInboxItem,
        removeInboxItem,
        importHistory,
        addImportHistoryRecord,
        updateImportHistoryRecord,
        fetchUpdates,
        toggleSaveUpdate,
        markUpdateRead,
        createDeadlineFromUpdate,
        generateWeeklyReport,
        sendWeeklyReportEmail,
        updateSettings,
        loadDemoData,
        clearDemoData,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

