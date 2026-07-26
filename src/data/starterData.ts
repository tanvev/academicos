import {
  Program,
  Subject,
  Topic,
  Task,
  StudySession,
  CATMock,
  CATSectional,
  Mistake,
  UserSettings,
} from '../types';

export const DEFAULT_CAT_EXAM_DATE = '2026-11-29';

export const STARTER_PROGRAMS: Program[] = [
  {
    id: 'prog-cat-2026',
    name: 'CAT 2026',
    type: 'competitive_exam',
    institution: 'IIMs',
    startDate: '2026-01-01',
    targetDate: DEFAULT_CAT_EXAM_DATE,
    description: 'Common Admission Test for IIMs & top B-schools',
    color: '#06b6d4', // Cyan
    icon: 'Target',
    archived: false,
    weeklyTargetHours: 25,
  },
  {
    id: 'prog-manit-btech',
    name: 'B.Tech CSE - MANIT',
    type: 'degree',
    institution: 'MANIT Bhopal',
    startDate: '2024-08-01',
    targetDate: '2028-05-30',
    description: 'Bachelor of Technology in Computer Science & Engineering',
    color: '#3b82f6', // Blue
    icon: 'GraduationCap',
    archived: false,
    weeklyTargetHours: 15,
  },
  {
    id: 'prog-iitm-bs',
    name: 'IITM BS Data Science',
    type: 'degree',
    institution: 'IIT Madras',
    startDate: '2025-01-15',
    targetDate: '2028-12-20',
    description: 'Bachelor of Science in Data Science & Applications',
    color: '#10b981', // Emerald
    icon: 'BookOpen',
    archived: false,
    weeklyTargetHours: 12,
  },
];

export const STARTER_SETTINGS: UserSettings = {
  userName: 'Tanvi',
  defaultTheme: 'dark',
  weeklyStartDay: 'Monday',
  weeklyStudyTargets: {
    'prog-cat-2026': 25,
    'prog-manit-btech': 15,
    'prog-iitm-bs': 12,
  },
  catMockTarget: 25,
  catSectionalTarget: 50,
  catExamDate: DEFAULT_CAT_EXAM_DATE,
  isDemoLoaded: false,
};

// CAT 2026 Subjects
export const STARTER_SUBJECTS: Subject[] = [
  {
    id: 'subj-cat-qa',
    programId: 'prog-cat-2026',
    name: 'Quantitative Aptitude (QA)',
    code: 'QA',
    color: '#06b6d4',
    order: 1,
  },
  {
    id: 'subj-cat-dilr',
    programId: 'prog-cat-2026',
    name: 'Data Interpretation & Logical Reasoning (DILR)',
    code: 'DILR',
    color: '#8b5cf6',
    order: 2,
  },
  {
    id: 'subj-cat-varc',
    programId: 'prog-cat-2026',
    name: 'Verbal Ability & Reading Comprehension (VARC)',
    code: 'VARC',
    color: '#f59e0b',
    order: 3,
  },
  // MANIT Starter Subjects
  {
    id: 'subj-manit-cn',
    programId: 'prog-manit-btech',
    name: 'Computer Networks',
    code: 'CS-301',
    color: '#3b82f6',
    order: 1,
  },
  {
    id: 'subj-manit-dbms',
    programId: 'prog-manit-btech',
    name: 'Database Management Systems',
    code: 'CS-302',
    color: '#3b82f6',
    order: 2,
  },
  // IITM BS Starter Subjects
  {
    id: 'subj-iitm-mlf',
    programId: 'prog-iitm-bs',
    name: 'Machine Learning Foundations',
    code: 'BS-MLF',
    color: '#10b981',
    order: 1,
  },
  {
    id: 'subj-iitm-bdm',
    programId: 'prog-iitm-bs',
    name: 'Business Data Management',
    code: 'BS-BDM',
    color: '#10b981',
    order: 2,
  },
];

// Helper to construct CAT starter topics
export function getStarterTopics(): Topic[] {
  let topics: Topic[] = [];
  let orderCounter = 1;

  // 1. QA Topics
  const qaTopics = [
    // Arithmetic
    { name: 'Percentages', status: 'completed', priority: 'high', confidence: 4 },
    { name: 'Profit Loss Discount', status: 'completed', priority: 'high', confidence: 4 },
    { name: 'Ratio Proportion', status: 'practised', priority: 'medium', confidence: 3 },
    { name: 'Averages', status: 'practised', priority: 'medium', confidence: 4 },
    { name: 'Mixtures Alligation', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Simple and Compound Interest', status: 'practised', priority: 'medium', confidence: 4 },
    { name: 'Time and Work', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Pipes and Cisterns', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'Time Speed Distance', status: 'not_started', priority: 'high', confidence: 2 },
    // Algebra
    { name: 'Linear Equations', status: 'completed', priority: 'medium', confidence: 5 },
    { name: 'Quadratic Equations', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Inequalities', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Functions', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Logarithms', status: 'revision_due', priority: 'high', confidence: 4 },
    { name: 'Progressions', status: 'not_started', priority: 'medium', confidence: 2 },
    // Geometry
    { name: 'Lines and Angles', status: 'practised', priority: 'low', confidence: 4 },
    { name: 'Triangles', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Quadrilaterals', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'Circles', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Polygons', status: 'not_started', priority: 'low', confidence: 3 },
    { name: 'Coordinate Geometry', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'Mensuration', status: 'not_started', priority: 'low', confidence: 2 },
    // Number Systems
    { name: 'Divisibility', status: 'practised', priority: 'medium', confidence: 4 },
    { name: 'Factors', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Remainders', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'HCF LCM', status: 'completed', priority: 'medium', confidence: 4 },
    { name: 'Units Digit', status: 'completed', priority: 'low', confidence: 5 },
    // Modern Math
    { name: 'Permutations and Combinations', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Probability', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Set Theory', status: 'learning', priority: 'medium', confidence: 3 },
  ];

  qaTopics.forEach((t) => {
    topics.push({
      id: `topic-qa-${orderCounter}`,
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-qa',
      name: t.name,
      status: t.status as any,
      priority: t.priority as any,
      confidence: t.confidence as any,
      totalStudyTimeMinutes: t.status === 'completed' ? 180 : t.status === 'learning' ? 90 : 0,
      order: orderCounter++,
    });
  });

  // 2. DILR Topics
  const dilrTopics = [
    { name: 'Arrangements', status: 'practised', priority: 'high', confidence: 4 },
    { name: 'Scheduling', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Games and Tournaments', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Routes and Networks', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'Distribution', status: 'practised', priority: 'medium', confidence: 3 },
    { name: 'Selection', status: 'learning', priority: 'medium', confidence: 3 },
    { name: 'Venn Diagrams', status: 'completed', priority: 'high', confidence: 4 },
    { name: 'Tables', status: 'completed', priority: 'medium', confidence: 5 },
    { name: 'Bar/Line Charts', status: 'completed', priority: 'medium', confidence: 5 },
    { name: 'Caselets', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Mixed DI', status: 'not_started', priority: 'high', confidence: 2 },
    { name: 'Logical Puzzles', status: 'practised', priority: 'high', confidence: 3 },
  ];

  dilrTopics.forEach((t) => {
    topics.push({
      id: `topic-dilr-${orderCounter}`,
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-dilr',
      name: t.name,
      status: t.status as any,
      priority: t.priority as any,
      confidence: t.confidence as any,
      totalStudyTimeMinutes: t.status === 'completed' ? 120 : t.status === 'learning' ? 60 : 0,
      order: orderCounter++,
    });
  });

  // 3. VARC Topics
  const varcTopics = [
    // Reading Comprehension
    { name: 'RC - Philosophy', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'RC - Economics', status: 'practised', priority: 'high', confidence: 4 },
    { name: 'RC - Science', status: 'completed', priority: 'medium', confidence: 4 },
    { name: 'RC - Sociology', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'RC - History', status: 'practised', priority: 'medium', confidence: 4 },
    { name: 'RC - Psychology', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'RC - Literature', status: 'not_started', priority: 'medium', confidence: 2 },
    { name: 'RC - Business', status: 'completed', priority: 'medium', confidence: 5 },
    // Verbal Ability
    { name: 'Para Summary', status: 'practised', priority: 'high', confidence: 4 },
    { name: 'Para Jumbles', status: 'learning', priority: 'high', confidence: 3 },
    { name: 'Odd Sentence Out', status: 'completed', priority: 'medium', confidence: 4 },
    { name: 'Para Completion', status: 'not_started', priority: 'medium', confidence: 2 },
  ];

  varcTopics.forEach((t) => {
    topics.push({
      id: `topic-varc-${orderCounter}`,
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-varc',
      name: t.name,
      status: t.status as any,
      priority: t.priority as any,
      confidence: t.confidence as any,
      totalStudyTimeMinutes: t.status === 'completed' ? 150 : t.status === 'learning' ? 75 : 0,
      order: orderCounter++,
    });
  });

  // MANIT topics
  topics.push(
    {
      id: `topic-cn-1`,
      programId: 'prog-manit-btech',
      subjectId: 'subj-manit-cn',
      name: 'Unit 1: Physical Layer & Network Models',
      status: 'completed',
      priority: 'high',
      confidence: 4,
      totalStudyTimeMinutes: 240,
      order: 1,
    },
    {
      id: `topic-cn-2`,
      programId: 'prog-manit-btech',
      subjectId: 'subj-manit-cn',
      name: 'Unit 2: Data Link Layer & Framing',
      status: 'completed',
      priority: 'high',
      confidence: 4,
      totalStudyTimeMinutes: 180,
      order: 2,
    },
    {
      id: `topic-cn-3`,
      programId: 'prog-manit-btech',
      subjectId: 'subj-manit-cn',
      name: 'Unit 3: Transport Layer (TCP/UDP)',
      status: 'learning',
      priority: 'high',
      confidence: 3,
      totalStudyTimeMinutes: 120,
      order: 3,
    }
  );

  // IITM topics
  topics.push(
    {
      id: `topic-mlf-1`,
      programId: 'prog-iitm-bs',
      subjectId: 'subj-iitm-mlf',
      name: 'Week 1-3: Linear Algebra & Matrix Math',
      status: 'completed',
      priority: 'high',
      confidence: 5,
      totalStudyTimeMinutes: 300,
      order: 1,
    },
    {
      id: `topic-mlf-2`,
      programId: 'prog-iitm-bs',
      subjectId: 'subj-iitm-mlf',
      name: 'Week 4: Linear Regression Foundations',
      status: 'learning',
      priority: 'high',
      confidence: 3,
      totalStudyTimeMinutes: 150,
      order: 2,
    }
  );

  return topics;
}

export function getStarterTasks(): Task[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const in6Days = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'task-1',
      title: 'Solve 2 DILR Sets (Arrangements & Venn)',
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-dilr',
      type: 'study',
      dueDate: todayStr,
      priority: 'high',
      estimatedMinutes: 45,
      status: 'pending',
      createdAt: todayStr,
    },
    {
      id: 'task-2',
      title: 'Arithmetic Practice - Time & Work 10 Questions',
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-qa',
      type: 'study',
      dueDate: todayStr,
      priority: 'high',
      estimatedMinutes: 60,
      status: 'pending',
      createdAt: todayStr,
    },
    {
      id: 'task-3',
      title: 'Analyse SimCAT 5 Mock Mistakes',
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-qa',
      type: 'mock',
      dueDate: todayStr,
      priority: 'high',
      estimatedMinutes: 90,
      status: 'pending',
      createdAt: todayStr,
    },
    {
      id: 'task-4',
      title: 'MANIT Computer Networks Unit 3 Notes',
      programId: 'prog-manit-btech',
      subjectId: 'subj-manit-cn',
      type: 'assignment',
      dueDate: in3Days,
      priority: 'medium',
      estimatedMinutes: 120,
      status: 'pending',
      createdAt: todayStr,
    },
    {
      id: 'task-5',
      title: 'IITM Week 4 Graded Assignment Submission',
      programId: 'prog-iitm-bs',
      subjectId: 'subj-iitm-mlf',
      type: 'deadline',
      dueDate: in6Days,
      priority: 'high',
      estimatedMinutes: 180,
      status: 'pending',
      createdAt: todayStr,
    },
  ];
}

export function getDemoMocks(): CATMock[] {
  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() + 1);
  const d2 = new Date(today); d2.setDate(today.getDate() + 4);
  const d3 = new Date(today); d3.setDate(today.getDate() + 10);

  const formatD = (d: Date) => d.toISOString().split('T')[0];

  return [
    {
      id: 'mock-sched-1',
      name: 'SIMCAT 04',
      provider: 'IMS',
      date: formatD(d1),
      startTime: '10:00 AM',
      durationMinutes: 120,
      testType: 'full_cat',
      programId: 'prog-cat-2026',
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
      analysisDeadline: formatD(d2),
      notes: 'Focus on time allocation in DILR sets.',
    },
    {
      id: 'mock-sched-2',
      name: 'CDC 05',
      provider: 'Career Launcher',
      date: formatD(d3),
      startTime: '02:00 PM',
      durationMinutes: 120,
      testType: 'full_cat',
      programId: 'prog-cat-2026',
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
      notes: 'Full length test.',
    },
    {
      id: 'mock-1',
      name: 'IMS SimCAT 1',
      provider: 'IMS',
      date: '2026-06-10',
      startTime: '10:00 AM',
      durationMinutes: 120,
      testType: 'full_cat',
      programId: 'prog-cat-2026',
      status: 'completed',
      overallScore: 78,
      overallPercentile: 94.2,
      totalAttempted: 42,
      correct: 28,
      incorrect: 14,
      unattempted: 24,
      accuracy: 66.7,
      varc: {
        score: 32,
        percentile: 92.5,
        attempted: 18,
        correct: 12,
        incorrect: 6,
        unattempted: 6,
        accuracy: 66.7,
        timeSpentMinutes: 40,
      },
      dilr: {
        score: 22,
        percentile: 91.0,
        attempted: 10,
        correct: 8,
        incorrect: 2,
        unattempted: 10,
        accuracy: 80.0,
        timeSpentMinutes: 40,
      },
      qa: {
        score: 24,
        percentile: 95.1,
        attempted: 14,
        correct: 8,
        incorrect: 6,
        unattempted: 8,
        accuracy: 57.1,
        timeSpentMinutes: 40,
      },
      analysisStatus: 'analysed',
      analysisDate: '2026-06-11',
      notes: 'Strong DILR accuracy, QA calculation mistakes in Logarithms.',
    },
    {
      id: 'mock-2',
      name: 'Career Launcher Prime 3',
      provider: 'Career Launcher',
      date: '2026-06-25',
      startTime: '02:00 PM',
      durationMinutes: 120,
      testType: 'full_cat',
      programId: 'prog-cat-2026',
      status: 'completed',
      overallScore: 84,
      overallPercentile: 96.8,
      totalAttempted: 45,
      correct: 31,
      incorrect: 14,
      unattempted: 21,
      accuracy: 68.9,
      varc: {
        score: 38,
        percentile: 97.2,
        attempted: 20,
        correct: 14,
        incorrect: 6,
        unattempted: 4,
        accuracy: 70.0,
        timeSpentMinutes: 40,
      },
      dilr: {
        score: 21,
        percentile: 89.5,
        attempted: 11,
        correct: 8,
        incorrect: 3,
        unattempted: 9,
        accuracy: 72.7,
        timeSpentMinutes: 40,
      },
      qa: {
        score: 25,
        percentile: 94.8,
        attempted: 14,
        correct: 9,
        incorrect: 5,
        unattempted: 8,
        accuracy: 64.3,
        timeSpentMinutes: 40,
      },
      analysisStatus: 'analysed',
      analysisDate: '2026-06-26',
      notes: 'Good VARC RC performance in Philosophy.',
    },
    {
      id: 'mock-3',
      name: 'IMS SimCAT 5',
      provider: 'IMS',
      date: '2026-07-15',
      startTime: '10:00 AM',
      durationMinutes: 120,
      testType: 'full_cat',
      programId: 'prog-cat-2026',
      status: 'completed',
      overallScore: 68,
      overallPercentile: 89.4,
      totalAttempted: 40,
      correct: 25,
      incorrect: 15,
      unattempted: 26,
      accuracy: 62.5,
      varc: {
        score: 28,
        percentile: 86.0,
        attempted: 18,
        correct: 11,
        incorrect: 7,
        unattempted: 6,
        accuracy: 61.1,
        timeSpentMinutes: 40,
      },
      dilr: {
        score: 18,
        percentile: 84.2,
        attempted: 10,
        correct: 6,
        incorrect: 4,
        unattempted: 10,
        accuracy: 60.0,
        timeSpentMinutes: 40,
      },
      qa: {
        score: 22,
        percentile: 91.0,
        attempted: 12,
        correct: 8,
        incorrect: 4,
        unattempted: 10,
        accuracy: 66.7,
        timeSpentMinutes: 40,
      },
      analysisStatus: 'not_analysed',
      notes: 'Time pressure in DILR set 2.',
    },
  ];
}

export function getDemoSectionals(): CATSectional[] {
  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() + 2);

  return [
    {
      id: 'sec-sched-1',
      name: 'DILR Sectional 08',
      provider: 'IMS',
      date: d1.toISOString().split('T')[0],
      startTime: '07:00 PM',
      section: 'DILR',
      status: 'scheduled',
      programId: 'prog-cat-2026',
      score: null,
      percentile: null,
      attempted: null,
      correct: null,
      incorrect: null,
      unattempted: null,
      accuracy: null,
      durationMinutes: 40,
      notes: 'Focus on arrangements.',
    },
    {
      id: 'sec-1',
      name: 'QA Speed Test - Arithmetic',
      provider: 'IMS',
      date: '2026-07-02',
      startTime: '06:00 PM',
      section: 'QA',
      status: 'completed',
      programId: 'prog-cat-2026',
      score: 30,
      percentile: 95.0,
      attempted: 12,
      correct: 10,
      incorrect: 2,
      unattempted: 3,
      accuracy: 83.3,
      durationMinutes: 40,
    },
    {
      id: 'sec-2',
      name: 'DILR Puzzle Sprint 4',
      provider: 'Cracku',
      date: '2026-07-10',
      startTime: '08:00 PM',
      section: 'DILR',
      status: 'completed',
      programId: 'prog-cat-2026',
      score: 24,
      percentile: 91.2,
      attempted: 9,
      correct: 8,
      incorrect: 1,
      unattempted: 6,
      accuracy: 88.9,
      durationMinutes: 40,
    },
  ];
}

export function getDemoMistakes(): Mistake[] {
  return [
    {
      id: 'mistake-1',
      mockId: 'mock-1',
      section: 'QA',
      questionIdentifier: 'Q12 - Logarithms',
      type: 'incorrect',
      errorCategory: 'calculation_error',
      notes: 'Forgot base change formula rule log_a(b) = 1 / log_b(a)',
      lessonLearned: 'Double check log properties when base is a variable.',
      needsRevision: true,
      resolved: false,
      createdAt: '2026-06-11',
    },
    {
      id: 'mistake-2',
      mockId: 'mock-1',
      section: 'DILR',
      questionIdentifier: 'Q8 - Tournament Set',
      type: 'incorrect',
      errorCategory: 'misread_question',
      notes: 'Misread "at most 3 wins" as "at least 3 wins".',
      lessonLearned: 'Highlight exact boundary phrases in problem statement.',
      needsRevision: false,
      resolved: true,
      createdAt: '2026-06-11',
    },
    {
      id: 'mistake-3',
      mockId: 'mock-3',
      section: 'VARC',
      questionIdentifier: 'Q14 - RC Philosophy',
      type: 'incorrect',
      errorCategory: 'bad_question_selection',
      notes: 'Spent 6 minutes on an overly abstract 2-choice trap.',
      lessonLearned: 'If 2 choices feel identical after 2 mins, skip and come back.',
      needsRevision: true,
      resolved: false,
      createdAt: '2026-07-16',
    },
  ];
}

export function getDemoStudySessions(): StudySession[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'session-1',
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-qa',
      topicId: 'topic-qa-1',
      date: todayStr,
      startTime: '09:00',
      durationMinutes: 75,
      whatWasStudied: 'Solved 15 Time & Work level 2 practice problems.',
      questionsAttempted: 15,
      questionsCorrect: 12,
      notes: 'Pipes & Cisterns formula concepts clarified.',
      createdAt: todayStr,
    },
    {
      id: 'session-2',
      programId: 'prog-manit-btech',
      subjectId: 'subj-manit-cn',
      topicId: 'topic-cn-3',
      date: todayStr,
      startTime: '14:30',
      durationMinutes: 90,
      whatWasStudied: 'Read Transport layer TCP 3-way handshake and congestion control.',
      notes: 'TCP Reno vs Tahoe differences noted.',
      createdAt: todayStr,
    },
    {
      id: 'session-3',
      programId: 'prog-cat-2026',
      subjectId: 'subj-cat-dilr',
      date: yesterdayStr,
      startTime: '20:00',
      durationMinutes: 110,
      whatWasStudied: 'Attempted 3 PYQ DILR sets on Arrangements and Selection.',
      questionsAttempted: 12,
      questionsCorrect: 10,
      createdAt: yesterdayStr,
    },
  ];
}
