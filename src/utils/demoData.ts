import type { DailyRecord, ExerciseEntry, YogaSession, MeditationSession, Goal, StreakData } from '@/types';
import { dateKey, lastNDays } from './storage';
import { calcSleepHours } from './wellness';

export function generateDemoRecords(): DailyRecord[] {
  const days = lastNDays(7);
  const moods: DailyRecord['mood'][] = ['good', 'okay', 'excellent', 'good', 'okay', 'good', 'excellent'];
  const stresses: DailyRecord['stress'][] = ['low', 'moderate', 'low', 'moderate', 'low', 'low', 'low'];
  const sleepQualities: DailyRecord['sleepQuality'][] = ['good', 'average', 'excellent', 'good', 'average', 'good', 'good'];

  return days.map((date, i) => {
    const bedtime = `2${2 - (i % 2)}:0${i % 3 === 0 ? 0 : 5}`;
    const wakeTime = `0${6 + (i % 3)}:1${i % 2 === 0 ? 0 : 5}`;
    return {
      date, bedtime, wakeTime, sleepHours: calcSleepHours(bedtime, wakeTime),
      sleepQuality: sleepQualities[i], mood: moods[i], stress: stresses[i],
      exerciseMinutes: [25, 0, 40, 30, 0, 35, 45][i],
      waterGlasses: [5, 6, 8, 7, 4, 6, 8][i],
      breakfast: true, lunch: true, dinner: i % 4 !== 3,
      fruitsVeg: i % 2 === 0, junkFood: i % 3 === 2,
      notes: i === 0 ? "Felt refreshed after a good night's sleep." : i === 2 ? 'Great workout today!' : '',
    };
  });
}

export function generateDemoExercises(): ExerciseEntry[] {
  const days = lastNDays(7);
  const activities: ExerciseEntry['activity'][] = ['walking', 'yoga', 'running', 'gym', 'stretching'];
  const durations = [25, 40, 30, 35, 45];
  const intensities: ExerciseEntry['intensity'][] = ['low', 'moderate', 'high', 'moderate', 'moderate'];
  const entries: ExerciseEntry[] = [];
  days.forEach((date, i) => {
    if (i % 5 !== 1) {
      entries.push({ id: `demo-ex-${i}`, date, activity: activities[i % activities.length], duration: durations[i % durations.length], intensity: intensities[i % intensities.length], notes: '' });
    }
  });
  return entries;
}

export function generateDemoYogaSessions(): YogaSession[] {
  const days = lastNDays(7);
  return days.filter((_, i) => i % 2 === 0).map((date, i) => ({
    id: `demo-yoga-${i}`, date, poses: ['tadasana', 'vrikshasana', 'bhujangasana', 'balasana', 'shavasana'], durationMinutes: 15, completed: true,
  }));
}

export function generateDemoMeditationSessions(): MeditationSession[] {
  const days = lastNDays(7);
  const types = ['calm-breathing', 'deep-relaxation', 'guided-breathing', 'focus-meditation', 'sleep-relaxation', 'calm-breathing', 'deep-relaxation'];
  const durations = [5, 10, 5, 10, 15, 5, 10];
  return days.map((date, i) => ({
    id: `demo-med-${i}`, date, type: types[i], durationMinutes: durations[i], completed: true,
  }));
}

export function generateDemoGoals(): Goal[] {
  return [
    { id: 'demo-g1', name: 'Exercise 30 minutes', target: 30, current: 25, unit: 'min/day', createdAt: new Date().toISOString() },
    { id: 'demo-g2', name: 'Drink 8 glasses of water', target: 8, current: 6, unit: 'glasses/day', createdAt: new Date().toISOString() },
    { id: 'demo-g3', name: 'Practice yoga 5 days/week', target: 5, current: 3, unit: 'days/week', createdAt: new Date().toISOString() },
    { id: 'demo-g4', name: 'Sleep 8 hours', target: 8, current: 7, unit: 'hours/night', createdAt: new Date().toISOString() },
  ];
}

export function generateDemoStreak(): StreakData {
  return { current: 7, best: 12, lastRecordDate: dateKey(new Date()) };
}
