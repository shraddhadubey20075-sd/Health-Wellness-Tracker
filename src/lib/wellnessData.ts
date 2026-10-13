import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import type {
  DailyRecord,
  ExerciseEntry,
  Goal,
  MeditationSession,
  Reminder,
  StreakData,
  UserProfile,
  YogaSession,
} from '@/types';
import { auth, db } from './firebase';

export interface WellnessSettings {
  waterGoal: number;
  sleepGoal: number;
  exerciseGoal: number;
  streak: StreakData;
}

export interface WellnessData {
  profile: UserProfile | null;
  settings: Partial<WellnessSettings>;
  dailyRecords: DailyRecord[];
  exercises: ExerciseEntry[];
  yogaSessions: YogaSession[];
  meditationSessions: MeditationSession[];
  goals: Goal[];
  reminders: Reminder[];
}

export type WellnessCollection =
  | 'dailyRecords'
  | 'exercises'
  | 'yogaSessions'
  | 'meditationSessions'
  | 'goals'
  | 'reminders';

const userDocument = (uid: string) => doc(db, 'users', uid);
const userCollection = (uid: string, name: WellnessCollection) =>
  collection(db, 'users', uid, name);

export class WellnessDataError extends Error {
  constructor(
    readonly operation: 'initialize-read' | 'initialize-create' | 'read' | 'write',
    readonly path: string,
    readonly code: string | undefined,
    readonly originalError: unknown,
  ) {
    super(
      `${operation} Firestore path "${path}" failed` +
        (code ? ` (${code})` : ''),
    );
    this.name = 'WellnessDataError';
  }
}

function logFirestoreFailure(error: WellnessDataError): void {
  if (!import.meta.env.DEV) return;
  console.error('[Firestore]', {
    operation: error.operation,
    path: error.path,
    code: error.code,
  });
}

function firestoreErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return undefined;
}

function assertAuthenticatedOwner(uid: string, operation: 'read' | 'write', path: string): void {
  if (auth.currentUser?.uid === uid) return;
  const error = new WellnessDataError(
    operation,
    path,
    'app/auth-uid-mismatch',
    new Error('Requested Firestore UID does not match the current Firebase Auth user.'),
  );
  logFirestoreFailure(error);
  throw error;
}

async function writeWithPath(path: string, operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch (error) {
    const wrappedError = new WellnessDataError('write', path, firestoreErrorCode(error), error);
    logFirestoreFailure(wrappedError);
    throw wrappedError;
  }
}

async function readWithPath<T>(path: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const wrappedError = new WellnessDataError('read', path, firestoreErrorCode(error), error);
    logFirestoreFailure(wrappedError);
    throw wrappedError;
  }
}

export async function loadWellnessData(uid: string): Promise<WellnessData> {
  const root = userDocument(uid);
  assertAuthenticatedOwner(uid, 'read', `users/${uid}`);
  let initializationOperation: 'initialize-read' | 'initialize-create' = 'initialize-read';
  try {
    await runTransaction(db, async (transaction) => {
      initializationOperation = 'initialize-read';
      const snapshot = await transaction.get(root);
      if (!snapshot.exists()) {
        initializationOperation = 'initialize-create';
        transaction.set(root, {
          settings: { waterGoal: 8, sleepGoal: 8, exerciseGoal: 30 },
        });
      }
    });
  } catch (error) {
    const wrappedError = new WellnessDataError(
      initializationOperation,
      `users/${uid}`,
      firestoreErrorCode(error),
      error,
    );
    logFirestoreFailure(wrappedError);
    throw wrappedError;
  }

  const [userSnapshot, dailyRecords, exercises, yogaSessions, meditationSessions, goals, reminders] =
    await Promise.all([
      readWithPath(`users/${uid}`, () => getDoc(root)),
      readWithPath(`users/${uid}/dailyRecords`, () => getDocs(userCollection(uid, 'dailyRecords'))),
      readWithPath(`users/${uid}/exercises`, () => getDocs(userCollection(uid, 'exercises'))),
      readWithPath(`users/${uid}/yogaSessions`, () => getDocs(userCollection(uid, 'yogaSessions'))),
      readWithPath(`users/${uid}/meditationSessions`, () => getDocs(userCollection(uid, 'meditationSessions'))),
      readWithPath(`users/${uid}/goals`, () => getDocs(userCollection(uid, 'goals'))),
      readWithPath(`users/${uid}/reminders`, () => getDocs(userCollection(uid, 'reminders'))),
    ]);

  const userData = userSnapshot.data();
  const profile = userData?.profile as UserProfile | undefined;

  return {
    profile: profile ?? null,
    settings: (userData?.settings ?? {}) as Partial<WellnessSettings>,
    dailyRecords: dailyRecords.docs.map((snapshot) => snapshot.data() as DailyRecord),
    exercises: exercises.docs.map(
      (snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as ExerciseEntry,
    ),
    yogaSessions: yogaSessions.docs.map(
      (snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as YogaSession,
    ),
    meditationSessions: meditationSessions.docs.map(
      (snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as MeditationSession,
    ),
    goals: goals.docs.map((snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as Goal),
    reminders: reminders.docs.map(
      (snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as Reminder,
    ),
  };
}

export function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const path = `users/${uid}`;
  assertAuthenticatedOwner(uid, 'write', path);
  return writeWithPath(path, () => setDoc(userDocument(uid), { profile }, { merge: true }));
}

export function saveUserSettings(
  uid: string,
  settings: Partial<WellnessSettings>,
): Promise<void> {
  const path = `users/${uid}`;
  assertAuthenticatedOwner(uid, 'write', path);
  return writeWithPath(path, () => setDoc(userDocument(uid), { settings }, { merge: true }));
}

export function saveWellnessItem(
  uid: string,
  collectionName: WellnessCollection,
  id: string,
  data: object,
): Promise<void> {
  const path = `users/${uid}/${collectionName}/${id}`;
  assertAuthenticatedOwner(uid, 'write', path);
  return writeWithPath(path, () =>
    setDoc(doc(userCollection(uid, collectionName), id), data, { merge: true }),
  );
}

export function deleteWellnessItem(
  uid: string,
  collectionName: WellnessCollection,
  id: string,
): Promise<void> {
  const path = `users/${uid}/${collectionName}/${id}`;
  assertAuthenticatedOwner(uid, 'write', path);
  return writeWithPath(path, () => deleteDoc(doc(userCollection(uid, collectionName), id)));
}

async function deleteCollectionContents(uid: string, collectionName: WellnessCollection): Promise<void> {
  const path = `users/${uid}/${collectionName}`;
  const snapshot = await readWithPath(path, () => getDocs(userCollection(uid, collectionName)));
  for (let start = 0; start < snapshot.docs.length; start += 450) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + 450).forEach((item) => batch.delete(item.ref));
    await writeWithPath(path, () => batch.commit());
  }
}

export async function clearUserProgress(uid: string, streak: StreakData): Promise<void> {
  assertAuthenticatedOwner(uid, 'write', `users/${uid}`);
  await Promise.all([
    deleteCollectionContents(uid, 'dailyRecords'),
    deleteCollectionContents(uid, 'exercises'),
    deleteCollectionContents(uid, 'yogaSessions'),
    deleteCollectionContents(uid, 'meditationSessions'),
    deleteCollectionContents(uid, 'goals'),
    saveUserSettings(uid, { streak }),
  ]);
}

export async function clearUserData(uid: string, streak: StreakData): Promise<void> {
  assertAuthenticatedOwner(uid, 'write', `users/${uid}`);
  const rootPath = `users/${uid}`;
  await Promise.all([
    deleteCollectionContents(uid, 'dailyRecords'),
    deleteCollectionContents(uid, 'exercises'),
    deleteCollectionContents(uid, 'yogaSessions'),
    deleteCollectionContents(uid, 'meditationSessions'),
    deleteCollectionContents(uid, 'goals'),
    deleteCollectionContents(uid, 'reminders'),
    writeWithPath(rootPath, () =>
      setDoc(userDocument(uid), {
        profile: deleteField(),
        settings: { waterGoal: 8, sleepGoal: 8, exerciseGoal: 30, streak },
      }, { merge: true }),
    ),
  ]);
}
