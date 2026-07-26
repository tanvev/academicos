export type ProgramType =
  | 'competitive_exam'
  | 'degree'
  | 'course'
  | 'certification'
  | 'placement_prep'
  | 'other';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  createdAt: string;
  onboardingCompleted?: boolean;
  hasSeenTour?: boolean;
  interests?: string[];
  preferences?: Partial<UserSettings>;
}

export interface Program {
  id: string;
  userId?: string;
  name: string;
  type: ProgramType;
  institution?: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  description?: string;
  color: string;
  icon?: string;
  archived: boolean;
  weeklyTargetHours: number;
}

export interface Subject {
  id: string;
  userId?: string;
  programId: string;
  name: string;
  code?: string;
  color?: string;
  archived?: boolean;
  order: number;
}

export interface Module {
  id: string;
  userId?: string;
  subjectId: string;
  name: string;
  order: number;
}

export type TopicStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'revision_due'
  | 'learning'
  | 'practised';

export type TopicPriority = 'low' | 'medium' | 'high';
export type TopicConfidence = 'low' | 'medium' | 'high' | 1 | 2 | 3 | 4 | 5;

export interface Topic {
  id: string;
  userId?: string;
  programId: string;
  subjectId: string;
  moduleId?: string;
  name: string;
  status: TopicStatus;
  priority: TopicPriority;
  confidence: TopicConfidence;
  lastStudied?: string; // ISO date string
  lastStudiedAt?: string; // ISO date string
  lastRevised?: string; // ISO date string
  lastRevisedAt?: string; // ISO date string
  totalStudyTimeMinutes: number;
  notes?: string;
  order: number;
}

export type TaskType =
  | 'study'
  | 'assignment'
  | 'exam'
  | 'quiz'
  | 'mock'
  | 'sectional'
  | 'revision'
  | 'application'
  | 'deadline'
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom' | 'monthly';

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  programId: string;
  subjectId?: string;
  topicId?: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  estimatedMinutes?: number;
  status: TaskStatus;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  // Recurring Task extensions
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  recurrenceInterval?: number;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  isPaused?: boolean;
  // Measurable Task extensions
  metricType?: 'count' | 'minutes' | 'pages' | 'questions' | 'custom';
  targetValue?: number;
  unit?: string;
  currentValue?: number;
  // Traceability
  sourceUpdateId?: string;
  sourceUrl?: string;
}

export interface TaskCompletion {
  id: string;
  userId: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'skipped';
  completedAt: string;
  currentValue?: number;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  availableMinutes: number; // in minutes (e.g. 180 for 3h)
  energy: 'low' | 'normal' | 'high';
  nonNegotiableTaskId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  programId: string;
  subjectId: string;
  topicId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  whatWasStudied: string;
  questionsAttempted?: number;
  questionsCorrect?: number;
  notes?: string;
  createdAt: string;
}

export type UniversalTestType =
  | 'Full Mock'
  | 'Sectional'
  | 'Practice Test'
  | 'Quiz'
  | 'Midsem'
  | 'Endsem'
  | 'Exam'
  | 'Other';

export type UniversalTestStatus = 'scheduled' | 'completed' | 'result_added' | 'analysed' | 'missed' | 'rescheduled';

export interface Test {
  id: string;
  userId?: string;
  programId?: string;
  subjectId?: string;
  name: string;
  provider?: string;
  type: UniversalTestType | string;
  date: string; // YYYY-MM-DD (Scheduled Date)
  startTime?: string; // Scheduled Time
  durationMinutes?: number | null;
  status: UniversalTestStatus;
  analysisDueDate?: string; // YYYY-MM-DD (Analysis Due Date)
  analysisDeadline?: string;
  analysisStatus?: 'not_analysed' | 'partially_analysed' | 'analysed';
  analysisDate?: string;
  notes?: string;
  // Score details
  overallScore?: number | null;
  overallPercentile?: number | null;
  totalAttempted?: number | null;
  correct?: number | null;
  incorrect?: number | null;
  unattempted?: number | null;
  accuracy?: number | null;
  section?: SectionName | string;
  varc?: CATMockSection;
  dilr?: CATMockSection;
  qa?: CATMockSection;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[];
  createdAt?: string;
}

export interface CATMockSection {
  score: number | null;
  percentile: number | null;
  attempted: number | null;
  correct: number | null;
  incorrect: number | null;
  unattempted: number | null;
  accuracy: number | null;
  timeSpentMinutes: number | null;
}

export interface CATMock {
  id: string;
  userId?: string;
  name: string;
  provider: string; // IMS, Career Launcher, TIME, Cracku, etc.
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm e.g. "10:00 AM"
  durationMinutes: number | null;
  testType?: 'full_cat' | 'varc_sectional' | 'dilr_sectional' | 'qa_sectional' | 'other_test';
  programId?: string; // e.g. 'prog-cat-2026'
  status?: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  overallScore: number | null;
  overallPercentile: number | null;
  totalAttempted: number | null;
  correct: number | null;
  incorrect: number | null;
  unattempted: number | null;
  accuracy: number | null;
  varc: CATMockSection;
  dilr: CATMockSection;
  qa: CATMockSection;
  analysisStatus: 'not_analysed' | 'partially_analysed' | 'analysed';
  analysisDate?: string;
  analysisDeadline?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[];
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
}

export type SectionName = 'QA' | 'DILR' | 'VARC';

export interface CATSectional {
  id: string;
  userId?: string;
  name: string;
  provider: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  section: SectionName;
  status?: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  programId?: string;
  score: number | null;
  percentile: number | null;
  attempted: number | null;
  correct: number | null;
  incorrect: number | null;
  unattempted: number | null;
  accuracy: number | null;
  durationMinutes: number | null;
  analysisStatus?: 'not_analysed' | 'partially_analysed' | 'analysed';
  analysisDeadline?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[];
}

export type ErrorCategory =
  | 'conceptual_gap'
  | 'calculation_error'
  | 'reading_misinterpretation'
  | 'time_pressure'
  | 'silly_mistake'
  | 'wrong_set_selection'
  | 'unattempted'
  | 'concept_gap'
  | 'misread_question'
  | 'bad_question_selection'
  | 'blind_guess'
  | 'should_have_skipped'
  | 'execution_error'
  | 'other';

export interface Mistake {
  id: string;
  userId?: string;
  mockId?: string;
  sectionalId?: string;
  section: string; // VARC, DILR, QA
  topicId?: string;
  topicName?: string;
  questionIdentifier: string; // e.g. "Q14 - QA"
  type?: 'correct' | 'incorrect' | 'unattempted';
  errorCategory: ErrorCategory;
  notes: string;
  lessonLearned?: string;
  needsRevision?: boolean;
  resolved: boolean;
  dateAdded?: string;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  userId?: string;
  text: string;
  rawText?: string;
  createdAt: string;
}

export interface UserSettings {
  userName: string;
  defaultTheme: 'dark';
  weeklyStartDay: 'Monday' | 'Sunday';
  weeklyStudyTargets: Record<string, number>; // programId -> target hours
  catMockTarget: number;
  catSectionalTarget: number;
  catExamDate: string; // YYYY-MM-DD
  isDemoLoaded: boolean;
  weeklyReportEmail?: string;
  emailWeeklyReport?: boolean;
  reportDay?: string;
  reportTime?: string;
  whatsappEnabled?: boolean;
  whatsappPhone?: string;
  updateInterests?: string[];
  hasSeenTour?: boolean;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  metrics: {
    totalStudyHours: number;
    prevWeekStudyHours: number;
    hoursChangePct: number;
    tasksCompleted: number;
    tasksMissed: number;
    recurringTaskCompletionPct: number;
    topicsCompleted: number;
    daysActive: number;
    dailyCheckInsCount: number;
    currentStreak: number;
    longestStreak: number;
    plannedStudyMinutes: number;
    actualStudyMinutes: number;
    todayFocusCompletionPct: number;
    programBreakdown: Record<string, { hours: number; target: number; topicsDone: number; pendingTasks: number }>;
    catMetrics?: {
      mocksTaken: number;
      sectionalsTaken: number;
      mockAnalysesDone: number;
      mockDebtCount: number;
      latestMockScore: number | null;
      latestPercentile: number | null;
      avgPercentile: number;
      accuracyTrend: number;
      catStudyHours: number;
      syllabusPct: number;
    };
  };
  summary: string;
  achievements: string[];
  needsAttention: string[];
  nextWeekActions: string[];
  generatedAt: string;
  emailStatus?: 'pending' | 'sent' | 'failed';
  emailSentAt?: string;
  whatsappStatus?: string;
}

export interface Update {
  id: string;
  title: string;
  category:
    | 'Exam Notification'
    | 'Registration'
    | 'Deadline'
    | 'Admit Card'
    | 'Result'
    | 'Syllabus'
    | 'Pattern Change'
    | 'Official Announcement'
    | 'Academic'
    | 'MBA Admissions'
    | 'Placement/Career'
    | 'Other';
  sourceName: string;
  sourceUrl: string; // MUST be a real source URL
  publishedAt: string;
  fetchedAt: string;
  summary: string;
  relevantPrograms: string[];
  // Actionable Deadline Metadata
  hasActionableDeadline?: boolean;
  actionableDeadline?: string; // YYYY-MM-DD
  deadlineType?:
    | 'registration'
    | 'application'
    | 'fee_payment'
    | 'form_correction'
    | 'document_submission'
    | 'exam_application'
    | 'counselling'
    | 'choice_filling'
    | 'other_actionable';
  deadlineConfidence?: 'high' | 'medium' | 'low';
  eventDate?: string;
  isExtensionOfUpdateId?: string;
  previousDeadlineDate?: string;
}

export interface UserUpdateState {
  userId: string;
  updateId: string;
  read: boolean;
  saved: boolean;
  deadlineCreated?: boolean;
  deadlineTaskId?: string;
}

export interface ImportHistoryRecord {
  id: string;
  userId?: string;
  fileName: string;
  detectedType: 'Test Result' | 'Syllabus' | 'Timetable' | 'Academic Calendar' | 'Exam Schedule' | 'Other';
  status: 'pending' | 'confirmed' | 'cancelled';
  linkedEntityType?: 'Test' | 'CATMock' | 'CATSectional' | 'Syllabus' | 'Task';
  linkedEntityId?: string;
  createdTime: string;
  confirmedTime?: string;
}

export type ViewMode =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'study'
  | 'programs'
  | 'program_detail'
  | 'syllabus'
  | 'cat_overview'
  | 'cat_syllabus'
  | 'cat_mocks'
  | 'cat_sectionals'
  | 'cat_analysis'
  | 'test_center'
  | 'mistakes'
  | 'analytics_study'
  | 'analytics_cat'
  | 'weekly_review'
  | 'smart_import'
  | 'inbox'
  | 'updates'
  | 'auth'
  | 'onboarding'
  | 'help_guide'
  | 'settings';

