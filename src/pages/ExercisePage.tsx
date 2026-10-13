import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { activityLabels, intensityLabels } from '@/utils/wellness';
import { lastNDays, formatWeekdayLabel, todayKey, formatDateLabel } from '@/utils/storage';
import type { ExerciseType, Intensity, ExerciseEntry } from '@/types';
import { Dumbbell, Plus, Trash2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function ExercisePage() {
  const { exercises, addExercise, deleteExercise, exerciseGoal } = useApp();
  const { navigate } = useNav();

  const [activity, setActivity] = useState<ExerciseType>('walking');
  const [duration, setDuration] = useState<number | ''>('');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [date, setDate] = useState(todayKey());
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!duration || duration <= 0) {
      setError('Please enter a valid duration.');
      return;
    }
    if (duration > 600) {
      setError('Duration seems too high (max 600 min).');
      return;
    }
    if (!(await addExercise({ activity, duration: Number(duration), intensity, date }))) return;
    setDuration('');
    setError('');
    showToast('Exercise logged!');
  };

  const last7 = lastNDays(7);
  const weeklyData = last7.map((d) => ({
    date: formatWeekdayLabel(d),
    minutes: exercises.filter((e) => e.date === d).reduce((s, e) => s + e.duration, 0),
  }));

  const todayMin = exercises.filter((e) => e.date === todayKey()).reduce((s, e) => s + e.duration, 0);
  const weekTotal = weeklyData.reduce((s, d) => s + d.minutes, 0);
  const last30 = lastNDays(30);
  const monthTotal = last30.reduce((s, d) => s + exercises.filter((e) => e.date === d).reduce((sum, e) => sum + e.duration, 0), 0);
  const recentExercises = [...exercises].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Dumbbell className="text-emerald-500" /> Exercise & Activity</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Log your activities and track your movement throughout the week.</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500 dark:text-slate-400">Today</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{todayMin} <span className="text-sm text-gray-400 dark:text-slate-500 font-normal">min</span></div>
          <ProgressBar value={todayMin} max={exerciseGoal} color="#10b981" />
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 dark:text-slate-400">This Week</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{weekTotal} <span className="text-sm text-gray-400 dark:text-slate-500 font-normal">min</span></div>
          <ProgressBar value={weekTotal} max={exerciseGoal * 7} color="#3b82f6" />
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 dark:text-slate-400">This Month</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{monthTotal} <span className="text-sm text-gray-400 dark:text-slate-500 font-normal">min</span></div>
        </Card>
      </div>

      {/* Add form */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-emerald-500" /> Log Activity</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Activity</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as ExerciseType)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white dark:bg-slate-800 dark:text-white">
              {Object.entries(activityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Duration (min)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" min={1} max={600} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Intensity</label>
            <select value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white dark:bg-slate-800 dark:text-white">
              {Object.entries(intensityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayKey()} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>}
        <button onClick={handleAdd} className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
          <Plus size={16} /> Add Activity
        </button>
      </Card>

      {/* Weekly chart */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Target size={18} className="text-emerald-500" /> Weekly Activity</h2>
        {weeklyData.some((d) => d.minutes > 0) ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
              <Tooltip formatter={(v: number) => [`${v} min`, 'Exercise']} contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-tooltip-border)', fontSize: 12, backgroundColor: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-ink)' }} labelStyle={{ color: 'var(--chart-tooltip-ink)' }} itemStyle={{ color: 'var(--chart-tooltip-ink)' }} />
              <ReferenceLine y={exerciseGoal} stroke="var(--chart-olive)" strokeDasharray="4 4" label={{ value: 'Daily goal', fontSize: 10, fill: 'var(--chart-olive)' }} />
              <Bar dataKey="minutes" fill="var(--chart-sage)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<Dumbbell size={28} />} title="No activities logged yet" message="Start logging your exercises to see your weekly activity." actionLabel="Log Activity" onAction={() => navigate('exercise')} />
        )}
      </Card>

      {/* Recent entries */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
        {recentExercises.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No exercises logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentExercises.map((e: ExerciseEntry) => (
              <div key={e.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Dumbbell size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{activityLabels[e.activity]}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{formatDateLabel(e.date)} · {intensityLabels[e.intensity]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{e.duration} min</span>
                  <button onClick={() => deleteExercise(e.id)} className="text-gray-300 dark:text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import { showToast } from '@/components/Toast';
