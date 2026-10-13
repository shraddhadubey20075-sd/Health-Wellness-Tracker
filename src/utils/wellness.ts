import type {
  MoodLevel,
  SleepQuality,
  StressLevel,
  DailyRecord,
} from '@/types';

export const moodMeta: Record<MoodLevel, { label: string; emoji: string; value: number; color: string }> = {
  excellent: { label: 'Excellent', emoji: '😄', value: 5, color: '#10b981' },
  good: { label: 'Good', emoji: '🙂', value: 4, color: '#22c55e' },
  okay: { label: 'Okay', emoji: '😐', value: 3, color: '#f59e0b' },
  low: { label: 'Low', emoji: '😔', value: 2, color: '#f97316' },
  'very-low': { label: 'Very Low', emoji: '😫', value: 1, color: '#ef4444' },
};

export const stressMeta: Record<StressLevel, { label: string; value: number; color: string }> = {
  low: { label: 'Low', value: 1, color: '#10b981' },
  moderate: { label: 'Moderate', value: 2, color: '#f59e0b' },
  high: { label: 'High', value: 3, color: '#f97316' },
  'very-high': { label: 'Very High', value: 4, color: '#ef4444' },
};

export const sleepQualityMeta: Record<SleepQuality, { label: string; value: number }> = {
  poor: { label: 'Poor', value: 1 },
  average: { label: 'Average', value: 2 },
  good: { label: 'Good', value: 3 },
  excellent: { label: 'Excellent', value: 4 },
};

export const activityLabels: Record<string, string> = {
  walking: 'Walking',
  running: 'Running',
  cycling: 'Cycling',
  gym: 'Gym',
  yoga: 'Yoga',
  stretching: 'Stretching',
  sports: 'Sports',
  other: 'Other',
};

export const intensityLabels: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function calcSleepHours(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

// Wellness score 0-100 based on daily record
export function calcWellnessScore(rec: DailyRecord | undefined, waterGoal: number): number {
  if (!rec) return 0;
  let score = 0;
  let total = 0;

  // Sleep: ideal 7-9h
  total += 20;
  if (rec.sleepHours >= 7 && rec.sleepHours <= 9) score += 20;
  else if (rec.sleepHours >= 6 && rec.sleepHours <= 10) score += 15;
  else if (rec.sleepHours >= 5) score += 8;

  // Exercise: 30+ min ideal
  total += 20;
  if (rec.exerciseMinutes >= 30) score += 20;
  else if (rec.exerciseMinutes >= 15) score += 12;
  else if (rec.exerciseMinutes > 0) score += 6;

  // Water
  total += 15;
  const waterPct = waterGoal > 0 ? Math.min(rec.waterGlasses / waterGoal, 1) : 0;
  score += Math.round(waterPct * 15);

  // Mood
  total += 15;
  const moodScore = { excellent: 15, good: 12, okay: 8, low: 4, 'very-low': 1 };
  score += moodScore[rec.mood];

  // Stress (lower is better)
  total += 15;
  const stressScore = { low: 15, moderate: 10, high: 5, 'very-high': 1 };
  score += stressScore[rec.stress];

  // Diet
  total += 15;
  let dietPoints = 0;
  if (rec.breakfast) dietPoints += 3;
  if (rec.lunch) dietPoints += 3;
  if (rec.dinner) dietPoints += 3;
  if (rec.fruitsVeg) dietPoints += 4;
  if (!rec.junkFood) dietPoints += 2;
  score += dietPoints;

  return Math.min(Math.round((score / total) * 100), 100);
}

export function getStreakMessage(streak: number): string {
  if (streak >= 30) return 'Incredible commitment!';
  if (streak >= 14) return 'Amazing consistency!';
  if (streak >= 7) return 'One week strong!';
  if (streak >= 3) return "You're building a habit!";
  if (streak >= 1) return 'Great start!';
  return 'Start your first check-in today!';
}
