import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type {
  UserProfile,
  DailyRecord,
  ExerciseEntry,
  YogaSession,
  MeditationSession,
  Goal,
  Reminder,
  StreakData,
  WellnessGoal,
} from '@/types';
import { load, save, todayKey, dateKey } from './storage';
import { calcWellnessScore } from './wellness';
import {
  generateDemoRecords,
  generateDemoExercises,
  generateDemoYogaSessions,
  generateDemoMeditationSessions,
  generateDemoGoals,
  generateDemoStreak,
} from './demoData';
import { auth } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import {
  clearUserData,
  clearUserProgress,
  deleteWellnessItem,
  loadWellnessData,
  saveUserProfile,
  saveUserSettings,
  saveWellnessItem,
} from '@/lib/wellnessData';
import { showToast } from '@/components/Toast';

interface AppData {
  currentEmail: string | null;
  profile: UserProfile | null;
  isAuthed: boolean;
  isDemo: boolean;
  authLoading: boolean;
  authError: string | null;
  retryAuthData: () => void;
  dailyRecords: DailyRecord[];
  exercises: ExerciseEntry[];
  yogaSessions: YogaSession[];
  meditationSessions: MeditationSession[];
  goals: Goal[];
  reminders: Reminder[];
  streak: StreakData;
  waterGoal: number;
  sleepGoal: number;
  exerciseGoal: number;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<boolean>;
  saveProfile: (p: UserProfile) => Promise<boolean>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<boolean>;
  saveDailyRecord: (rec: DailyRecord) => Promise<boolean>;
  getTodayRecord: () => DailyRecord | undefined;
  addExercise: (ex: Omit<ExerciseEntry, 'id'>) => Promise<boolean>;
  deleteExercise: (id: string) => Promise<boolean>;
  addYogaSession: (s: Omit<YogaSession, 'id'>) => Promise<boolean>;
  addMeditationSession: (s: Omit<MeditationSession, 'id'>) => Promise<boolean>;
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  updateGoalProgress: (id: string, current: number) => Promise<boolean>;
  addReminder: (r: Omit<Reminder, 'id'>) => Promise<boolean>;
  toggleReminder: (id: string) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  setWaterGoal: (n: number) => Promise<boolean>;
  setSleepGoal: (n: number) => Promise<boolean>;
  setExerciseGoal: (n: number) => Promise<boolean>;
  resetProgress: () => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

const AppContext = createContext<AppData | null>(null);
export { AppContext };

const emptyStreak: StreakData = { current: 0, best: 0, lastRecordDate: '' };

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nextStreak(previous: StreakData, date: string): StreakData {
  if (previous.lastRecordDate === date) return previous;
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  const current = previous.lastRecordDate === yesterday ? previous.current + 1 : 1;
  return { current, best: Math.max(previous.best, current), lastRecordDate: date };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [currentEmailState, setCurrentEmailState] = useState<string | null>(() => load('currentEmail', null));
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(() => load('profiles', {}));
  const [demoProfile, setDemoProfile] = useState<UserProfile | null>(null);
  const [firebaseProfile, setFirebaseProfile] = useState<UserProfile | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(() => load('isDemo', false));
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>(() => load('dailyRecords', []));
  const [exercises, setExercises] = useState<ExerciseEntry[]>(() => load('exercises', []));
  const [yogaSessions, setYogaSessions] = useState<YogaSession[]>(() => load('yogaSessions', []));
  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>(() => load('meditationSessions', []));
  const [goals, setGoals] = useState<Goal[]>(() => load('goals', []));
  const [reminders, setReminders] = useState<Reminder[]>(() => load('reminders', []));
  const [streak, setStreak] = useState<StreakData>(() => load('streak', emptyStreak));
  const [waterGoal, setWaterGoalState] = useState<number>(() => load('waterGoal', 8));
  const [sleepGoal, setSleepGoalState] = useState<number>(() => load('sleepGoal', 8));
  const [exerciseGoal, setExerciseGoalState] = useState<number>(() => load('exerciseGoal', 30));
  const isDemoRef = useRef(isDemo);
  isDemoRef.current = isDemo;

  useEffect(() => {
    let active = true;
    let request = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentRequest = ++request;
      setAuthError(null);

      if (!user) {
        setFirebaseUser(null);
        setFirebaseProfile(null);
        if (!isDemoRef.current) {
          setCurrentEmailState(null);
          setDailyRecords([]);
          setExercises([]);
          setYogaSessions([]);
          setMeditationSessions([]);
          setGoals([]);
          setReminders([]);
          setStreak(emptyStreak);
          setWaterGoalState(8);
          setSleepGoalState(8);
          setExerciseGoalState(30);
        }
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setFirebaseUser(user);
      setIsDemo(false);
      setCurrentEmailState(user.email);
      setFirebaseProfile(null);
      setDailyRecords([]);
      setExercises([]);
      setYogaSessions([]);
      setMeditationSessions([]);
      setGoals([]);
      setReminders([]);
      setStreak(emptyStreak);
      setWaterGoalState(8);
      setSleepGoalState(8);
      setExerciseGoalState(30);

      try {
        const data = await loadWellnessData(user.uid);
        if (!active || currentRequest !== request) return;
        setFirebaseProfile(data.profile);
        setDailyRecords(data.dailyRecords);
        setExercises(data.exercises);
        setYogaSessions(data.yogaSessions);
        setMeditationSessions(data.meditationSessions);
        setGoals(data.goals);
        setReminders(data.reminders);
        setStreak(data.settings.streak ?? emptyStreak);
        setWaterGoalState(data.settings.waterGoal ?? 8);
        setSleepGoalState(data.settings.sleepGoal ?? 8);
        setExerciseGoalState(data.settings.exerciseGoal ?? 30);
      } catch (error) {
        if (active && currentRequest === request) {
          setAuthError(getFirebaseErrorMessage(error));
        }
      } finally {
        if (active && currentRequest === request) setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [retryVersion]);

  useEffect(() => {
    if (isDemo) save('currentEmail', currentEmailState);
  }, [currentEmailState, isDemo]);
  useEffect(() => {
    if (isDemo) save('profiles', profiles);
  }, [isDemo, profiles]);
  useEffect(() => save('isDemo', isDemo), [isDemo]);
  useEffect(() => { if (isDemo) save('dailyRecords', dailyRecords); }, [dailyRecords, isDemo]);
  useEffect(() => { if (isDemo) save('exercises', exercises); }, [exercises, isDemo]);
  useEffect(() => { if (isDemo) save('yogaSessions', yogaSessions); }, [isDemo, yogaSessions]);
  useEffect(() => { if (isDemo) save('meditationSessions', meditationSessions); }, [isDemo, meditationSessions]);
  useEffect(() => { if (isDemo) save('goals', goals); }, [goals, isDemo]);
  useEffect(() => { if (isDemo) save('reminders', reminders); }, [isDemo, reminders]);
  useEffect(() => { if (isDemo) save('streak', streak); }, [isDemo, streak]);
  useEffect(() => { if (isDemo) save('waterGoal', waterGoal); }, [isDemo, waterGoal]);
  useEffect(() => { if (isDemo) save('sleepGoal', sleepGoal); }, [isDemo, sleepGoal]);
  useEffect(() => { if (isDemo) save('exerciseGoal', exerciseGoal); }, [exerciseGoal, isDemo]);

  const currentEmail = firebaseUser?.email ?? (isDemo ? currentEmailState : null);
  const profile = firebaseUser ? firebaseProfile : isDemo ? demoProfile ?? (currentEmail ? profiles[currentEmail] ?? null : null) : null;
  const isAuthed = firebaseUser !== null || isDemo;

  const writeForUser = async (operation: (uid: string) => Promise<void>): Promise<boolean> => {
    if (isDemo) return true;
    if (!firebaseUser) {
      showToast('Sign in before saving wellness data.', 'error');
      return false;
    }
    try {
      await operation(firebaseUser.uid);
      return true;
    } catch (error) {
      showToast(`Unable to save your data: ${getFirebaseErrorMessage(error)}`, 'error');
      return false;
    }
  };

  const signup = async (_name: string, email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginDemo = () => {
    if (firebaseUser) {
      showToast('Log out of your account before entering the demo.', 'warning');
      return;
    }
    const demoEmail = 'demo@wellness.app';
    setCurrentEmailState(demoEmail);
    setIsDemo(true);
    const profileData: UserProfile = {
      name: 'Alex Demo', email: demoEmail, age: 24, gender: 'prefer-not-to-say',
      goals: ['stress', 'sleep', 'fitness'] as WellnessGoal[],
      experience: 'intermediate', availableTime: '15-20', routine: 'daily',
      considerations: ['none'], createdAt: new Date().toISOString(),
    };
    setDemoProfile(profileData);
    setProfiles((previous) => ({ ...previous, [demoEmail]: profileData }));
    setDailyRecords(generateDemoRecords());
    setExercises(generateDemoExercises());
    setYogaSessions(generateDemoYogaSessions());
    setMeditationSessions(generateDemoMeditationSessions());
    setGoals(generateDemoGoals());
    setStreak(generateDemoStreak());
    setWaterGoalState(8);
    setSleepGoalState(8);
    setExerciseGoalState(30);
  };

  const logout = async (): Promise<boolean> => {
    if (isDemo) {
      setCurrentEmailState(null);
      setDemoProfile(null);
      setIsDemo(false);
      return true;
    }
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      showToast(`Unable to log out: ${getFirebaseErrorMessage(error)}`, 'error');
      return false;
    }
  };

  const saveProfile = async (profileData: UserProfile): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((uid) => saveUserProfile(uid, profileData)))) return false;
    if (isDemo) {
      if (!currentEmail) return false;
      setProfiles((previous) => ({ ...previous, [currentEmail]: profileData }));
      setDemoProfile(profileData);
    } else {
      setFirebaseProfile(profileData);
    }
    return true;
  };

  const updateProfile = async (patch: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    return saveProfile({ ...profile, ...patch });
  };

  const saveDailyRecord = async (record: DailyRecord): Promise<boolean> => {
    const updatedStreak = nextStreak(streak, record.date);
    const saved = isDemo || await writeForUser(async (uid) => {
      await Promise.all([
        saveWellnessItem(uid, 'dailyRecords', record.date, record),
        saveUserSettings(uid, { streak: updatedStreak }),
      ]);
    });
    if (!saved) return false;
    setDailyRecords((previous) => [...previous.filter((item) => item.date !== record.date), record]
      .sort((a, b) => a.date.localeCompare(b.date)));
    setStreak(updatedStreak);
    return true;
  };

  const getTodayRecord = useCallback(
    () => dailyRecords.find((record) => record.date === todayKey()),
    [dailyRecords],
  );

  const addExercise = async (exercise: Omit<ExerciseEntry, 'id'>): Promise<boolean> => {
    const item = { ...exercise, id: uid() };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'exercises', item.id, item)))) return false;
    setExercises((previous) => [...previous, item]);
    return true;
  };

  const deleteExercise = async (id: string): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((userId) => deleteWellnessItem(userId, 'exercises', id)))) return false;
    setExercises((previous) => previous.filter((item) => item.id !== id));
    return true;
  };

  const addYogaSession = async (session: Omit<YogaSession, 'id'>): Promise<boolean> => {
    const item = { ...session, id: uid() };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'yogaSessions', item.id, item)))) return false;
    setYogaSessions((previous) => [...previous, item]);
    return true;
  };

  const addMeditationSession = async (session: Omit<MeditationSession, 'id'>): Promise<boolean> => {
    const item = { ...session, id: uid() };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'meditationSessions', item.id, item)))) return false;
    setMeditationSessions((previous) => [...previous, item]);
    return true;
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>): Promise<boolean> => {
    const item = { ...goal, id: uid(), createdAt: new Date().toISOString() };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'goals', item.id, item)))) return false;
    setGoals((previous) => [...previous, item]);
    return true;
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((userId) => deleteWellnessItem(userId, 'goals', id)))) return false;
    setGoals((previous) => previous.filter((item) => item.id !== id));
    return true;
  };

  const updateGoalProgress = async (id: string, current: number): Promise<boolean> => {
    const goal = goals.find((item) => item.id === id);
    if (!goal) return false;
    const updated = { ...goal, current };
    setGoals((previous) => previous.map((item) => item.id === id ? updated : item));
    if (isDemo) return true;
    const saved = await writeForUser((userId) => saveWellnessItem(userId, 'goals', id, updated));
    if (!saved) {
      setGoals((previous) => previous.map((item) =>
        item.id === id && item.current === current ? goal : item,
      ));
    }
    return saved;
  };

  const addReminder = async (reminder: Omit<Reminder, 'id'>): Promise<boolean> => {
    const item = { ...reminder, id: uid() };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'reminders', item.id, item)))) return false;
    setReminders((previous) => [...previous, item]);
    return true;
  };

  const toggleReminder = async (id: string): Promise<boolean> => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return false;
    const updated = { ...reminder, enabled: !reminder.enabled };
    if (!isDemo && !(await writeForUser((userId) => saveWellnessItem(userId, 'reminders', id, updated)))) return false;
    setReminders((previous) => previous.map((item) => item.id === id ? updated : item));
    return true;
  };

  const deleteReminder = async (id: string): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((userId) => deleteWellnessItem(userId, 'reminders', id)))) return false;
    setReminders((previous) => previous.filter((item) => item.id !== id));
    return true;
  };

  const setGoalSetting = async (
    key: 'waterGoal' | 'sleepGoal' | 'exerciseGoal',
    value: number,
    update: (goal: number) => void,
  ): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((uid) => saveUserSettings(uid, { [key]: value })))) return false;
    update(value);
    return true;
  };

  const setWaterGoal = (value: number) => setGoalSetting('waterGoal', value, setWaterGoalState);
  const setSleepGoal = (value: number) => setGoalSetting('sleepGoal', value, setSleepGoalState);
  const setExerciseGoal = (value: number) => setGoalSetting('exerciseGoal', value, setExerciseGoalState);

  const resetProgress = async (): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((uid) => clearUserProgress(uid, emptyStreak)))) return false;
    setDailyRecords([]);
    setExercises([]);
    setYogaSessions([]);
    setMeditationSessions([]);
    setGoals([]);
    setStreak(emptyStreak);
    return true;
  };

  const clearAll = async (): Promise<boolean> => {
    if (!isDemo && !(await writeForUser((uid) => clearUserData(uid, emptyStreak)))) return false;
    setDailyRecords([]);
    setExercises([]);
    setYogaSessions([]);
    setMeditationSessions([]);
    setGoals([]);
    setReminders([]);
    setStreak(emptyStreak);
    setDemoProfile(null);
    setFirebaseProfile(null);
    setProfiles({});
    setCurrentEmailState(null);
    setIsDemo(false);
    setWaterGoalState(8);
    setSleepGoalState(8);
    setExerciseGoalState(30);
    return true;
  };

  const value: AppData = {
    currentEmail,
    profile,
    isAuthed,
    isDemo,
    authLoading,
    authError,
    retryAuthData: () => setRetryVersion((version) => version + 1),
    dailyRecords,
    exercises,
    yogaSessions,
    meditationSessions,
    goals,
    reminders,
    streak,
    waterGoal,
    sleepGoal,
    exerciseGoal,
    signup,
    login,
    loginDemo,
    logout,
    saveProfile,
    updateProfile,
    saveDailyRecord,
    getTodayRecord,
    addExercise,
    deleteExercise,
    addYogaSession,
    addMeditationSession,
    addGoal,
    deleteGoal,
    updateGoalProgress,
    addReminder,
    toggleReminder,
    deleteReminder,
    setWaterGoal,
    setSleepGoal,
    setExerciseGoal,
    resetProgress,
    clearAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppData {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function useWellnessScore(): number {
  const { getTodayRecord, waterGoal } = useApp();
  return calcWellnessScore(getTodayRecord(), waterGoal);
}
