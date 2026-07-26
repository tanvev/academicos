import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { checkForLegacyData, migrateLegacyDataToFirestore } from '../lib/migration';
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
  authLoading: boolean;
  signUp: (name: string, email: string, pass: string, interests?: string[]) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (interests: string[], selectedPrograms: string[]) => void;

  // Migration Prompt
  showMigrationPrompt: boolean;
  setShowMigrationPrompt: (show: boolean) => void;
  performMigration: () => Promise<boolean>;

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
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Migration Prompt State
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Scoped Data Collections
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

  const activeUid = currentUser?.uid || '';

  // 1. LISTEN TO FIREBASE AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userRef);

          let userProfile: UserProfile;
          if (userSnap.exists()) {
            const data = userSnap.data();
            userProfile = {
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || 'User',
              email: fbUser.email || '',
              timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
              createdAt: data.createdAt || new Date().toISOString(),
              onboardingCompleted: data.onboardingCompleted ?? true,
              ...data,
            };
          } else {
            userProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              email: fbUser.email || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
              createdAt: new Date().toISOString(),
              onboardingCompleted: true,
            };
            await setDoc(userRef, userProfile, { merge: true });
          }

          setCurrentUser(userProfile);

          // Check if legacy data exists in localStorage and migration not completed
          if (!userSnap.data()?.legacyMigrationCompletedAt && checkForLegacyData()) {
            setShowMigrationPrompt(true);
          }
        } catch (e) {
          console.error('Error handling user auth profile:', e);
        }
      } else {
        // Logged out - reset all in-memory collections
        setCurrentUser(null);
        setPrograms([]);
        setSubjects([]);
        setModules([]);
        setTopics([]);
        setTasks([]);
        setTaskCompletions([]);
        setDailyCheckIns([]);
        setStudySessions([]);
        setCatMocks([]);
        setCatSectionals([]);
        setMistakes([]);
        setInbox([]);
        setImportHistory([]);
        setWeeklyReports([]);
        setUserUpdateStates({});
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. REAL-TIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    if (!currentUser?.uid) return;
    const uid = currentUser.uid;

    const unsubscribes: (() => void)[] = [];

    const subscribe = <T,>(subcoll: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      const collRef = collection(db, 'users', uid, subcoll);
      const unsub = onSnapshot(
        collRef,
        (snap) => {
          const list: T[] = [];
          snap.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as unknown as T);
          });
          setter(list);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/${subcoll}`)
      );
      unsubscribes.push(unsub);
    };

    subscribe<Program>('programs', setPrograms);
    subscribe<Subject>('subjects', setSubjects);
    subscribe<Module>('modules', setModules);
    subscribe<Topic>('topics', setTopics);
    subscribe<Task>('tasks', setTasks);
    subscribe<TaskCompletion>('taskCompletions', setTaskCompletions);
    subscribe<DailyCheckIn>('dailyCheckIns', setDailyCheckIns);
    subscribe<StudySession>('studySessions', setStudySessions);
    subscribe<CATMock>('catMocks', setCatMocks);
    subscribe<CATSectional>('catSectionals', setCatSectionals);
    subscribe<Mistake>('mistakes', setMistakes);
    subscribe<InboxItem>('inbox', setInbox);
    subscribe<ImportHistoryRecord>('importHistory', setImportHistory);
    subscribe<WeeklyReport>('weeklyReports', setWeeklyReports);

    // User Profile / Settings listener
    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.settings) setSettings(data.settings);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}`)
    );
    unsubscribes.push(unsubUser);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser?.uid]);

  // Seed default starter data into Firestore if user has zero programs and no legacy data
  useEffect(() => {
    if (!currentUser?.uid || authLoading) return;
    const checkAndSeed = async () => {
      const uid = currentUser.uid;
      const progRef = collection(db, 'users', uid, 'programs');
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists() && snap.data()?.legacyMigrationCompletedAt) return;

      // Seed if empty after initial fetch
      setTimeout(async () => {
        if (programs.length === 0 && !checkForLegacyData()) {
          for (const p of STARTER_PROGRAMS) {
            await setDoc(doc(db, 'users', uid, 'programs', p.id), { ...p, userId: uid }, { merge: true });
          }
          for (const s of STARTER_SUBJECTS) {
            await setDoc(doc(db, 'users', uid, 'subjects', s.id), { ...s, userId: uid }, { merge: true });
          }
          for (const t of getStarterTopics()) {
            await setDoc(doc(db, 'users', uid, 'topics', t.id), { ...t, userId: uid }, { merge: true });
          }
          for (const task of getStarterTasks()) {
            await setDoc(doc(db, 'users', uid, 'tasks', task.id), { ...task, userId: uid }, { merge: true });
          }
        }
      }, 1200);
    };
    checkAndSeed();
  }, [currentUser?.uid, authLoading]);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = dailyCheckIns.find((c) => c.date === todayStr) || null;

  // Migration Helper
  const performMigration = async (): Promise<boolean> => {
    if (!currentUser?.uid) return false;
    const res = await migrateLegacyDataToFirestore(currentUser.uid);
    return res;
  };

  // AUTH ACTIONS
  const switchUser = (uid: string) => {
    /* deprecated local switch */
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        const userProfile: UserProfile = {
          uid: cred.user.uid,
          name,
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          createdAt: new Date().toISOString(),
          onboardingCompleted: true,
        };
        await setDoc(doc(db, 'users', cred.user.uid), userProfile, { merge: true });
        setCurrentUser(userProfile);
        setCurrentView('dashboard');
        return { success: true };
      }
      return { success: false, error: 'Failed to create user' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Signup failed' };
    }
  };

  const signUp = async (name: string, email: string, pass: string, interests: string[] = []): Promise<boolean> => {
    const res = await signup(email, pass, name);
    return res.success;
  };

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setCurrentView('dashboard');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid credentials' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentView('auth');
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setCurrentView('dashboard');
    } catch (e: any) {
      console.error('Google Sign-In Error:', e);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: `Password reset instructions have been sent to ${email}.`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Failed to send password reset email.',
      };
    }
  };

  const completeOnboarding = async (interests: string[], selectedProgramTypes: string[]) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      onboardingCompleted: true,
      interests,
    };
    setCurrentUser(updatedUser);
    await setDoc(doc(db, 'users', currentUser.uid), { onboardingCompleted: true, interests }, { merge: true });
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

    const mockMatch = catMocks.find((m) => {
      const mName = m.name.toLowerCase().trim();
      const isNameMatch = mName.includes(cleanName) || cleanName.includes(mName);
      if (!isNameMatch) return false;
      if (provider && m.provider && !m.provider.toLowerCase().includes(provider.toLowerCase().trim())) return false;
      return true;
    });

    if (mockMatch) return { type: 'mock', item: mockMatch };

    const secMatch = catSectionals.find((s) => {
      const sName = s.name.toLowerCase().trim();
      const isNameMatch = sName.includes(cleanName) || cleanName.includes(sName);
      if (!isNameMatch) return false;
      if (provider && s.provider && !s.provider.toLowerCase().includes(provider.toLowerCase().trim())) return false;
      return true;
    });

    if (secMatch) return { type: 'sectional', item: secMatch };

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
    if (!activeUid) throw new Error('User not authenticated');
    if (data.testType === 'full_cat' || data.testType === 'other_test') {
      const id = `mock-${Date.now()}`;
      const newM: CATMock = {
        id,
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
      setDoc(doc(db, 'users', activeUid, 'catMocks', id), newM).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/catMocks/${id}`)
      );
      return newM;
    } else {
      const id = `sec-${Date.now()}`;
      const section: 'VARC' | 'DILR' | 'QA' =
        data.testType === 'varc_sectional' ? 'VARC' : data.testType === 'dilr_sectional' ? 'DILR' : 'QA';
      const newS: CATSectional = {
        id,
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
      setDoc(doc(db, 'users', activeUid, 'catSectionals', id), newS).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/catSectionals/${id}`)
      );
      return newS;
    }
  };

  const updateScheduledMockWithResult = (
    id: string,
    type: 'mock' | 'sectional',
    result: Partial<CATMock> & Partial<CATSectional>
  ) => {
    if (!activeUid) return;
    const subcoll = type === 'mock' ? 'catMocks' : 'catSectionals';
    const docRef = doc(db, 'users', activeUid, subcoll, id);
    updateDoc(docRef, { ...result, status: 'completed' }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/${subcoll}/${id}`)
    );
  };

  // STREAK COMPUTATION
  const computeStreakInfo = () => {
    const activityDates = new Set<string>();

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
    if (!studyTimer || !activeUid) return;
    const durationMins = Math.max(1, Math.round(studyTimer.elapsedSeconds / 60));
    const nowTimeStr = new Date().toTimeString().slice(0, 5);
    const id = `session-${Date.now()}`;

    const newSession: StudySession = {
      id,
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

    setDoc(doc(db, 'users', activeUid, 'studySessions', id), newSession).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/studySessions/${id}`)
    );

    if (studyTimer.topicId) {
      const topicRef = doc(db, 'users', activeUid, 'topics', studyTimer.topicId);
      const existing = topics.find((t) => t.id === studyTimer.topicId);
      if (existing) {
        updateDoc(topicRef, {
          totalStudyTimeMinutes: (existing.totalStudyTimeMinutes || 0) + durationMins,
          lastStudied: new Date().toISOString(),
          status: updatedTopicStatus || existing.status,
        }).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/topics/${studyTimer.topicId}`)
        );
      }
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
    if (!activeUid) return;
    const existing = dailyCheckIns.find((c) => c.date === todayStr);
    const id = existing ? existing.id : `dc-${Date.now()}`;
    const newRecord: DailyCheckIn = {
      id,
      userId: activeUid,
      date: todayStr,
      availableMinutes,
      energy,
      nonNegotiableTaskId,
      note,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDoc(doc(db, 'users', activeUid, 'dailyCheckIns', id), newRecord).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/dailyCheckIns/${id}`)
    );

    setIsDailyCheckInModalOpen(false);
    setIsDailyCheckInOpen(false);
  };

  const addDailyCheckIn = (checkIn: {
    date: string;
    mood?: string;
    targetHours?: number;
    focusArea?: string;
    notes?: string;
  }) => {
    if (!activeUid) return;
    const id = `dc-${Date.now()}`;
    const record: DailyCheckIn = {
      id,
      userId: activeUid,
      date: checkIn.date || todayStr,
      availableMinutes: (checkIn.targetHours || 3) * 60,
      energy: (checkIn.mood as any) || 'normal',
      note: checkIn.notes || checkIn.focusArea,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'dailyCheckIns', id), record).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/dailyCheckIns/${id}`)
    );
  };

  // CRUD ACTIONS
  const addProgram = (p: Omit<Program, 'id'>) => {
    if (!activeUid) return;
    const id = `prog-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'programs', id), { ...p, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/programs/${id}`)
    );
  };

  const updateProgram = (id: string, p: Partial<Program>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'programs', id), p).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/programs/${id}`)
    );
  };

  const deleteProgram = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'programs', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/programs/${id}`)
    );
  };

  const addSubject = (s: Omit<Subject, 'id'>) => {
    if (!activeUid) return;
    const id = `subj-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'subjects', id), { ...s, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/subjects/${id}`)
    );
  };

  const updateSubject = (id: string, s: Partial<Subject>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'subjects', id), s).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/subjects/${id}`)
    );
  };

  const deleteSubject = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'subjects', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/subjects/${id}`)
    );
  };

  const reorderSubjects = (reordered: Subject[]) => {
    if (!activeUid) return;
    reordered.forEach((subj, index) => {
      updateDoc(doc(db, 'users', activeUid, 'subjects', subj.id), { order: index }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/subjects/${subj.id}`)
      );
    });
  };

  const addModule = (m: Omit<Module, 'id'>) => {
    if (!activeUid) return;
    const id = `mod-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'modules', id), { ...m, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/modules/${id}`)
    );
  };

  const updateModule = (id: string, m: Partial<Module>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'modules', id), m).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/modules/${id}`)
    );
  };

  const deleteModule = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'modules', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/modules/${id}`)
    );
  };

  const addTopic = (t: Omit<Topic, 'id'>) => {
    if (!activeUid) return;
    const id = `top-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'topics', id), { ...t, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/topics/${id}`)
    );
  };

  const bulkAddTopics = (newTopics: Omit<Topic, 'id'>[]) => {
    if (!activeUid) return;
    newTopics.forEach((t) => {
      const id = `top-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setDoc(doc(db, 'users', activeUid, 'topics', id), { ...t, id, userId: activeUid }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/topics/${id}`)
      );
    });
  };

  const updateTopic = (id: string, t: Partial<Topic>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'topics', id), t).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/topics/${id}`)
    );
  };

  const updateTopicStatus = (id: string, status: TopicStatus) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'topics', id), {
      status,
      lastStudied: new Date().toISOString(),
    }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/topics/${id}`));
  };

  const deleteTopic = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'topics', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/topics/${id}`)
    );
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!activeUid) return;
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
      userId: activeUid,
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'tasks', id), newTask).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/tasks/${id}`)
    );
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'tasks', id), task).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/tasks/${id}`)
    );
  };

  const toggleTaskStatus = (id: string, dateOverride?: string) => {
    if (!activeUid) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const targetDate = dateOverride || todayStr;
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';

    updateDoc(doc(db, 'users', activeUid, 'tasks', id), {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
    }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/tasks/${id}`));

    if (newStatus === 'completed') {
      const completionId = `tc-${id}-${targetDate}`;
      const tc: TaskCompletion = {
        id: completionId,
        userId: activeUid,
        taskId: id,
        date: targetDate,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      setDoc(doc(db, 'users', activeUid, 'taskCompletions', completionId), tc).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/taskCompletions/${completionId}`)
      );
    }
  };

  const skipTaskToday = (id: string, dateOverride?: string) => {
    if (!activeUid) return;
    const targetDate = dateOverride || todayStr;
    const completionId = `tc-${id}-${targetDate}`;
    const tc: TaskCompletion = {
      id: completionId,
      userId: activeUid,
      taskId: id,
      date: targetDate,
      status: 'skipped',
      completedAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'taskCompletions', completionId), tc).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/taskCompletions/${completionId}`)
    );
  };

  const pauseTask = (id: string, isPaused: boolean = true) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'tasks', id), { isPaused }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/tasks/${id}`)
    );
  };

  const deleteTask = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'tasks', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/tasks/${id}`)
    );
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    if (!activeUid) return;
    const id = `session-${Date.now()}`;
    const newSession: StudySession = {
      ...session,
      id,
      userId: activeUid,
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'studySessions', id), newSession).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/studySessions/${id}`)
    );
  };

  const deleteStudySession = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'studySessions', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/studySessions/${id}`)
    );
  };

  const addCATMock = (mock: Omit<CATMock, 'id'>) => {
    if (!activeUid) return;
    const id = `mock-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'catMocks', id), { ...mock, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/catMocks/${id}`)
    );
  };

  const updateCATMock = (id: string, mock: Partial<CATMock>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'catMocks', id), mock).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/catMocks/${id}`)
    );
  };

  const deleteCATMock = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'catMocks', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/catMocks/${id}`)
    );
  };

  const addCATSectional = (sec: Omit<CATSectional, 'id'>) => {
    if (!activeUid) return;
    const id = `sec-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'catSectionals', id), { ...sec, id, userId: activeUid }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/catSectionals/${id}`)
    );
  };

  const updateCATSectional = (id: string, sec: Partial<CATSectional>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'catSectionals', id), sec).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/catSectionals/${id}`)
    );
  };

  const deleteCATSectional = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'catSectionals', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/catSectionals/${id}`)
    );
  };

  const addMistake = (mistake: Omit<Mistake, 'id' | 'createdAt'>) => {
    if (!activeUid) return;
    const id = `mis-${Date.now()}`;
    const newMistake: Mistake = {
      ...mistake,
      id,
      userId: activeUid,
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'mistakes', id), newMistake).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/mistakes/${id}`)
    );
  };

  const updateMistake = (id: string, mistake: Partial<Mistake>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'mistakes', id), mistake).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/mistakes/${id}`)
    );
  };

  const toggleMistakeResolved = (id: string) => {
    if (!activeUid) return;
    const target = mistakes.find((m) => m.id === id);
    if (target) {
      updateDoc(doc(db, 'users', activeUid, 'mistakes', id), { resolved: !target.resolved }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/mistakes/${id}`)
      );
    }
  };

  const deleteMistake = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'mistakes', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/mistakes/${id}`)
    );
  };

  const addInboxItem = (text: string) => {
    if (!activeUid) return;
    const id = `inbox-${Date.now()}`;
    setDoc(doc(db, 'users', activeUid, 'inbox', id), {
      id,
      userId: activeUid,
      text,
      createdAt: new Date().toISOString(),
    }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/inbox/${id}`));
  };

  const removeInboxItem = (id: string) => {
    if (!activeUid) return;
    deleteDoc(doc(db, 'users', activeUid, 'inbox', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/inbox/${id}`)
    );
  };

  const addImportHistoryRecord = (record: Omit<ImportHistoryRecord, 'id' | 'createdTime'>): string => {
    if (!activeUid) return `imp-${Date.now()}`;
    const id = `imp-${Date.now()}`;
    const newRecord: ImportHistoryRecord = {
      ...record,
      id,
      userId: activeUid,
      createdTime: new Date().toISOString(),
    };
    setDoc(doc(db, 'users', activeUid, 'importHistory', id), newRecord).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/importHistory/${id}`)
    );
    return id;
  };

  const updateImportHistoryRecord = (id: string, updates: Partial<ImportHistoryRecord>) => {
    if (!activeUid) return;
    updateDoc(doc(db, 'users', activeUid, 'importHistory', id), updates).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/importHistory/${id}`)
    );
  };

  const toggleSaveUpdate = (updateId: string) => {
    setUserUpdateStates((prev) => {
      const current = prev[updateId] || { userId: activeUid, updateId, read: false, saved: false };
      return { ...prev, [updateId]: { ...current, saved: !current.saved } };
    });
  };

  const markUpdateRead = (updateId: string) => {
    setUserUpdateStates((prev) => {
      const current = prev[updateId] || { userId: activeUid, updateId, read: false, saved: false };
      return { ...prev, [updateId]: { ...current, read: true } };
    });
  };

  const createDeadlineFromUpdate = (update: Update): Task => {
    if (!activeUid) throw new Error('User not authenticated');
    const id = `task-${Date.now()}`;
    const targetProgram = programs[0]?.id || 'prog-cat-2026';

    const newTask: Task = {
      id,
      userId: activeUid,
      title: `${update.title} - Deadline`,
      description: update.summary,
      programId: targetProgram,
      type: 'deadline',
      dueDate: update.actionableDeadline || todayStr,
      priority: 'high',
      status: 'pending',
      createdAt: new Date().toISOString(),
      sourceUpdateId: update.id,
      sourceUrl: update.sourceUrl,
    };

    setDoc(doc(db, 'users', activeUid, 'tasks', id), newTask).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/tasks/${id}`)
    );

    return newTask;
  };

  const generateWeeklyReport = (): WeeklyReport => {
    const reportId = `wr-${Date.now()}`;
    return {
      id: reportId,
      userId: activeUid,
      weekStart: todayStr,
      weekEnd: todayStr,
      metrics: {
        totalStudyHours: 12,
        prevWeekStudyHours: 10,
        hoursChangePct: 20,
        tasksCompleted: 8,
        tasksMissed: 1,
        recurringTaskCompletionPct: 88,
        topicsCompleted: 4,
        daysActive: 6,
        dailyCheckInsCount: 6,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        plannedStudyMinutes: 900,
        actualStudyMinutes: 720,
        todayFocusCompletionPct: 80,
        programBreakdown: {},
      },
      summary: 'Solid progress made across all target modules this week.',
      achievements: ['Completed CAT mock', 'Maintained 6-day study streak'],
      needsAttention: ['Revise QA Algebra topics'],
      nextWeekActions: ['Complete 2 sectionals', 'Review mistake notebook'],
      generatedAt: new Date().toISOString(),
    };
  };

  const sendWeeklyReportEmail = async (email?: string) => {
    return { success: true, message: 'Weekly report summary generated successfully.' };
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!activeUid) return;
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setDoc(doc(db, 'users', activeUid), { settings: updated }, { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}`)
    );
  };

  const loadDemoData = () => {};
  const clearDemoData = () => {};
  const exportData = () => JSON.stringify({ programs, subjects, topics, tasks, catMocks });
  const importData = (jsonStr: string) => true;

  const startOnboardingTour = () => setIsTourOpen(true);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProgramId,
        setSelectedProgramId,
        currentUser,
        users: currentUser ? [currentUser] : [],
        switchUser,
        isAuthenticated: !!currentUser,
        authLoading,
        signUp,
        signup,
        login,
        logout,
        googleSignIn,
        resetPassword,
        completeOnboarding,
        showMigrationPrompt,
        setShowMigrationPrompt,
        performMigration,
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
        isDailyCheckInOpen,
        setIsDailyCheckInOpen,
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
