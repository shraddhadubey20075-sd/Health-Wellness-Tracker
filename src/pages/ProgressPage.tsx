import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { calcWellnessScore, moodMeta, formatHours, getStreakMessage } from '@/utils/wellness';
import { lastNDays, formatWeekdayLabel } from '@/utils/storage';
import { TrendingUp, Flame, Activity, Moon, Droplets, Smile, Dumbbell, Flower2, Award, Waves, Lock, Sprout, Brain, type LucideIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Achievement } from '@/types';

export function ProgressPage() {
  const { dailyRecords, exercises, yogaSessions, meditationSessions, streak, waterGoal } = useApp();
  const { navigate } = useNav();
  const gridColor = 'var(--chart-grid)';
  const tickColor = 'var(--chart-label)';
  const tooltipBg = 'var(--chart-tooltip-bg)';
  const tooltipBorder = 'var(--chart-tooltip-border)';
  const tooltipLabelColor = 'var(--chart-tooltip-ink)';

  const last7 = lastNDays(7);
  const last30 = lastNDays(30);

  const weeklyData = last7.map((d) => {
    const rec = dailyRecords.find((r) => r.date === d);
    return {
      date: formatWeekdayLabel(d),
      score: rec ? calcWellnessScore(rec, waterGoal) : 0,
      sleep: rec?.sleepHours ?? 0,
      exercise: rec?.exerciseMinutes ?? 0,
      water: rec?.waterGlasses ?? 0,
      mood: rec ? moodMeta[rec.mood].value : 0,
    };
  });

  const validRecords = dailyRecords.filter((r) => r.sleepHours > 0);
  const avgSleep = validRecords.length > 0 ? validRecords.reduce((s, r) => s + r.sleepHours, 0) / validRecords.length : 0;
  const avgMoodValue = validRecords.length > 0 ? validRecords.reduce((s, r) => s + moodMeta[r.mood].value, 0) / validRecords.length : 0;
  const waterRecords = dailyRecords.filter((r) => r.waterGlasses > 0);
  const avgWater = waterRecords.length > 0 ? waterRecords.reduce((s, r) => s + r.waterGlasses, 0) / waterRecords.length : 0;
  const totalExerciseMin = exercises.reduce((s, e) => s + e.duration, 0);
  const totalMeditationMin = meditationSessions.reduce((s, m) => s + m.durationMinutes, 0);

  const stats = [
    { label: 'Current Streak', value: `${streak.current} days`, icon: Flame, color: '#f97316' },
    { label: 'Best Streak', value: `${streak.best} days`, icon: Award, color: '#f59e0b' },
    { label: 'Yoga Sessions', value: yogaSessions.length, icon: Flower2, color: '#8b5cf6' },
    { label: 'Meditation Sessions', value: meditationSessions.length, icon: Waves, color: '#06b6d4' },
    { label: 'Exercise Minutes', value: `${totalExerciseMin} min`, icon: Dumbbell, color: '#10b981' },
    { label: 'Meditation Minutes', value: `${totalMeditationMin} min`, icon: Waves, color: '#0ea5e9' },
    { label: 'Average Sleep', value: avgSleep > 0 ? formatHours(avgSleep) : '—', icon: Moon, color: '#6366f1' },
    { label: 'Average Water', value: avgWater > 0 ? `${avgWater.toFixed(1)}` : '—', icon: Droplets, color: '#06b6d4' },
  ];

  // Achievements
  const achievements: (Omit<Achievement, 'icon'> & { icon: LucideIcon })[] = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first daily record', icon: Sprout, unlocked: dailyRecords.length >= 1 },
    { id: 'streak-7', name: '7 Day Streak', description: 'Maintain a 7-day wellness streak', icon: Flame, unlocked: streak.current >= 7 || streak.best >= 7 },
    { id: 'meditation-beginner', name: 'Mindful Beginner', description: 'Complete your first meditation session', icon: Brain, unlocked: meditationSessions.length >= 1 },
    { id: 'yoga-explorer', name: 'Yoga Explorer', description: 'Complete 3 yoga sessions', icon: Flower2, unlocked: yogaSessions.length >= 3 },
    { id: 'hydration-hero', name: 'Hydration Hero', description: 'Drink 8+ glasses in a day', icon: Droplets, unlocked: dailyRecords.some((r) => r.waterGlasses >= 8) },
    { id: 'wellness-warrior', name: 'Wellness Warrior', description: 'Score 80+ on your wellness score', icon: Award, unlocked: dailyRecords.some((r) => calcWellnessScore(r, waterGoal) >= 80) },
  ];

  const hasData = dailyRecords.length > 0 || exercises.length > 0;

  const tooltipStyle = { borderRadius: 12, border: `1px solid ${tooltipBorder}`, fontSize: 12, background: tooltipBg, color: tooltipLabelColor };

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp className="text-emerald-500" /> My Progress</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Track your wellness journey over time.</p>
      </div>

      {/* Streak banner */}
      <Card className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-amber-100 dark:border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-bounce-subtle"><Flame size={34} strokeWidth={1.8} className="text-teal-700 dark:text-cyan-200" /></div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{streak.current} Day Wellness Streak</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{getStreakMessage(streak.current)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 dark:text-slate-500">Best streak</div>
            <div className="font-bold text-gray-900 dark:text-white">{streak.best} days</div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${s.color}15` }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{s.label}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Award size={18} className="text-amber-500" /> Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <Card key={a.id} className={`p-4 text-center transition-all ${a.unlocked ? 'shadow-glow' : 'opacity-60'}`}>
              <div className={`mb-2 flex h-9 items-center justify-center ${a.unlocked ? 'text-teal-700 dark:text-cyan-200' : 'text-gray-400 dark:text-slate-500'}`}>
                {a.unlocked ? <a.icon size={24} strokeWidth={1.8} /> : <Lock size={20} strokeWidth={1.8} />}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{a.name}</div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{a.description}</div>
              {a.unlocked && <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">Unlocked</div>}
            </Card>
          ))}
        </div>
      </div>

      {!hasData ? (
        <Card className="p-5">
          <EmptyState icon={<TrendingUp size={28} />} title="No progress data yet" message="Start recording your daily wellness to see your progress here." actionLabel="Add Today's Record" onAction={() => navigate('daily-record')} />
        </Card>
      ) : (
        <>
          {/* Weekly wellness score */}
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Wellness Score</h2>
            {weeklyData.some((d) => d.score > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}`, 'Score']} contentStyle={tooltipStyle} />
                  <ReferenceLine y={80} stroke="var(--chart-olive)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" stroke="var(--chart-sage)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-sage)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No scores yet. Complete a daily record to generate your wellness score.</p>
            )}
          </Card>

          {/* Sleep & Exercise charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Sleep</h2>
              {weeklyData.some((d) => d.sleep > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 12]} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [formatHours(v), 'Sleep']} contentStyle={tooltipStyle} />
                    <Bar dataKey="sleep" fill="var(--chart-azure)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No sleep data yet.</p>}
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Exercise</h2>
              {weeklyData.some((d) => d.exercise > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${v} min`, 'Exercise']} contentStyle={tooltipStyle} />
                    <Bar dataKey="exercise" fill="var(--chart-sage)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No exercise data yet.</p>}
            </Card>
          </div>

          {/* Water & Mood charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Water</h2>
              {weeklyData.some((d) => d.water > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${v} glasses`, 'Water']} contentStyle={tooltipStyle} />
                    <Bar dataKey="water" fill="var(--chart-teal)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No water data yet.</p>}
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Mood</h2>
              {weeklyData.some((d) => d.mood > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [v > 0 ? Object.entries(moodMeta).find(([, m]) => m.value === v)?.[1].label ?? v : 'No data', 'Mood']} contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="mood" stroke="var(--chart-olive)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-olive)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No mood data yet.</p>}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
