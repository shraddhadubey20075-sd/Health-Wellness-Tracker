// Core data models for the Health & Wellness Tracker

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type AvailableTime = '5-10' | '15-20' | '30+';
export type RoutinePreference = 'daily' | '3-days' | '5-days' | 'weekend';

export type WellnessGoal =
  | 'fitness'
  | 'sleep'
  | 'stress'
  | 'flexibility'
  | 'weight'
  | 'concentration'
  | 'general';

export type PhysicalConsideration =
  | 'back'
  | 'neck'
  | 'knee'
  | 'flexibility'
  | 'none';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender?: Gender;
  goals: WellnessGoal[];
  experience: ExperienceLevel;
  availableTime: AvailableTime;
  routine: RoutinePreference;
  considerations: PhysicalConsideration[];
  createdAt: string;
}

export interface Account {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type SleepQuality = 'poor' | 'average' | 'good' | 'excellent';
export type MoodLevel = 'excellent' | 'good' | 'okay' | 'low' | 'very-low';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type ExerciseType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'gym'
  | 'yoga'
  | 'stretching'
  | 'sports'
  | 'other';
export type Intensity = 'low' | 'moderate' | 'high';

export interface ExerciseEntry {
  id: string;
  date: string;
  activity: ExerciseType;
  duration: number;
  intensity: Intensity;
  notes?: string;
}

export interface DailyRecord {
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepHours: number;
  sleepQuality: SleepQuality;
  mood: MoodLevel;
  stress: StressLevel;
  exerciseMinutes: number;
  waterGlasses: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  fruitsVeg: boolean;
  junkFood: boolean;
  notes: string;
}

export interface YogaSession {
  id: string;
  date: string;
  poses: string[];
  durationMinutes: number;
  completed: boolean;
}

export interface MeditationSession {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: 'water' | 'exercise' | 'yoga' | 'sleep' | 'daily-record' | 'meditation';
  time: string;
  enabled: boolean;
}

export interface StreakData {
  current: number;
  best: number;
  lastRecordDate: string;
}

export type YogaCategory =
  | 'beginner'
  | 'flexibility'
  | 'stress-relief'
  | 'better-sleep'
  | 'general-fitness'
  | 'relaxation';

export interface YogaPose {
  id: string;
  name: string;
  sanskrit?: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationSeconds: number;
  benefits: string[];
  safety: string;
  categories: YogaCategory[];
  instructions: string[];
  videoPath?: string;
}

export interface MeditationTrack {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  icon: string;
  color: string;
  audioPath: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioPath: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}
