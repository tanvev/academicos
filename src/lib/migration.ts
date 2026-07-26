import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export function checkForLegacyData(): boolean {
  try {
    if (localStorage.getItem('academicos_users')) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('academicos_user_') || key.startsWith('tanvi_os_app_state_v1_'))) {
        const val = localStorage.getItem(key);
        if (val && val !== '[]' && val !== '{}') {
          return true;
        }
      }
    }
  } catch (e) {
    console.error('Error checking legacy data:', e);
  }
  return false;
}

export async function migrateLegacyDataToFirestore(targetUid: string): Promise<boolean> {
  const pathPrefix = `users/${targetUid}`;
  try {
    // 1. Identify legacy data keys
    const getLocal = <T>(key: string, fallbackKey?: string): T[] => {
      const activeUid = localStorage.getItem('academicos_active_user_uid') || 'usr-tanvi';
      const userKey = `academicos_user_${activeUid}_${key}`;
      const saved = localStorage.getItem(userKey) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          /* ignore */
        }
      }
      return [];
    };

    const getLocalObj = <T>(key: string, fallbackKey?: string): T | null => {
      const activeUid = localStorage.getItem('academicos_active_user_uid') || 'usr-tanvi';
      const userKey = `academicos_user_${activeUid}_${key}`;
      const saved = localStorage.getItem(userKey) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          /* ignore */
        }
      }
      return null;
    };

    const programs = getLocal<any>('programs', 'tanvi_os_app_state_v1_programs');
    const subjects = getLocal<any>('subjects', 'tanvi_os_app_state_v1_subjects');
    const modules = getLocal<any>('modules');
    const topics = getLocal<any>('topics', 'tanvi_os_app_state_v1_topics');
    const tasks = getLocal<any>('tasks', 'tanvi_os_app_state_v1_tasks');
    const taskCompletions = getLocal<any>('task_completions');
    const dailyCheckIns = getLocal<any>('daily_checkins');
    const studySessions = getLocal<any>('sessions', 'tanvi_os_app_state_v1_sessions');
    const catMocks = getLocal<any>('cat_mocks', 'tanvi_os_app_state_v1_cat_mocks');
    const catSectionals = getLocal<any>('cat_sectionals', 'tanvi_os_app_state_v1_cat_sectionals');
    const mistakes = getLocal<any>('mistakes', 'tanvi_os_app_state_v1_mistakes');
    const inbox = getLocal<any>('inbox', 'tanvi_os_app_state_v1_inbox');
    const importHistory = getLocal<any>('import_history');
    const weeklyReports = getLocal<any>('weekly_reports');
    const settings = getLocalObj<any>('settings') || {};

    // Helper to upload collections safely in batches or setDoc
    const migrateCollection = async (collName: string, items: any[]) => {
      for (const item of items) {
        if (!item || !item.id) continue;
        const itemDocRef = doc(db, 'users', targetUid, collName, String(item.id));
        const cleanedItem = { ...item, userId: targetUid };
        await setDoc(itemDocRef, cleanedItem, { merge: true });
      }
    };

    await migrateCollection('programs', programs);
    await migrateCollection('subjects', subjects);
    await migrateCollection('modules', modules);
    await migrateCollection('topics', topics);
    await migrateCollection('tasks', tasks);
    await migrateCollection('taskCompletions', taskCompletions);
    await migrateCollection('dailyCheckIns', dailyCheckIns);
    await migrateCollection('studySessions', studySessions);
    await migrateCollection('catMocks', catMocks);
    await migrateCollection('catSectionals', catSectionals);
    await migrateCollection('mistakes', mistakes);
    await migrateCollection('inbox', inbox);
    await migrateCollection('importHistory', importHistory);
    await migrateCollection('weeklyReports', weeklyReports);

    // Update main user profile document with settings and completion flags
    const userDocRef = doc(db, 'users', targetUid);
    await setDoc(
      userDocRef,
      {
        uid: targetUid,
        settings,
        legacyMigrationCompletedAt: new Date().toISOString(),
        legacyMigrationVersion: 1,
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathPrefix);
    return false;
  }
}
