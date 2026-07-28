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

export const STARTER_PROGRAMS: Program[] = [];

export const STARTER_SETTINGS: UserSettings = {
  userName: 'User',
  defaultTheme: 'dark',
  themeMode: 'midnight',
  accentColor: 'cyan',
  appearance: {
    mode: 'system',
    palette: 'ocean',
  },
  weeklyStartDay: 'Monday',
  weeklyStudyTargets: {},
  catMockTarget: 20,
  catSectionalTarget: 40,
  catExamDate: DEFAULT_CAT_EXAM_DATE,
  isDemoLoaded: false,
};

export const STARTER_SUBJECTS: Subject[] = [];

export function getStarterTopics(): Topic[] {
  return [];
}

export function getStarterTasks(): Task[] {
  return [];
}

export function getDemoMocks(): CATMock[] {
  return [];
}

export function getDemoSectionals(): CATSectional[] {
  return [];
}

export function getDemoMistakes(): Mistake[] {
  return [];
}

export function getDemoStudySessions(): StudySession[] {
  return [];
}
