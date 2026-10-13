import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { moodMeta, stressMeta } from '@/utils/wellness';
import { lastNDays, formatWeekdayLabel, todayKey } from '@/utils/storage';
import type { MoodLevel, StressLevel } from '@/types';
import { Smile, Brain, Save, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MoodStressPage() {
  const { dailyRecords, saveDailyRecord, getTodayRecord } = useApp();
  const { navigate } = useNav();
  const today = getTodayRecord();

  const [mood, setMood] = useState<MoodLevel | ''>(today?.mood ?? '');
  const [stress, setStress] = useState<StressLevel | ''>(today?.stress ?? '');
  const [note, setNote] = useState(today?.notes ?? '');

  const last7 = lastNDays(7);
  const moodData = last7.map((d) => {
    const rec = dailyRecords.find((r) => r.date === d);
    return { date: formatWeekdayLabel(d), mood: rec ? moodMeta[rec.mood].value : 0, stress: rec ? stressMeta[rec.stress].value : 0 };
  });

  const handleSave = async () => {
    if (!mood || !stress) return;
    const existing = getTodayRecord();
    if (!(await saveDailyRecord({
      ...existing,
      date: todayKey(),
      bedtime: existing?.bedtime ?? '',
      wakeTime: existing?.wakeTime ?? '',
      sleepHours: existing?.sleepHours ?? 0,
      sleepQuality: existing?.sleepQuality ?? 'average',
      mood: (mood || 'okay') as MoodLevel,
      stress: (stress || 'moderate') as StressLevel,
      exerciseMinutes: existing?.exerciseMinutes ?? 0,
      waterGlasses: existing?.waterGlasses ?? 0,
      breakfast: existing?.breakfast ?? false,
      lunch: existing?.lunch ?? false,
      dinner: existing?.dinner ?? false,
      fruitsVeg: existing?.fruitsVeg ?? false,
      junkFood: existing?.junkFood ?? false,
      notes: note,
    }))) return;
    showToast('Mood & stress saved!');
  };

  // Insight: lower stress on exercise days
  const exerciseDays = dailyRecords.filter((r) => r.exerciseMinutes > 0);
  const exerciseStressAvg = exerciseDays.length > 0 ? exerciseDays.reduce((s, r) => s + stressMeta[r.stress].value, 0) / exerciseDays.length : 0;
  const noExerciseDays = dailyRecords.filter((r) => r.exerciseMinutes === 0);
  const noExStressAvg = noExerciseDays.length > 0 ? noExerciseDays.reduce((s, r) => s + stressMeta[r.stress].value, 0) / noExerciseDays.length : 0;
  const hasInsight = exerciseDays.length >= 2 && noExerciseDays.length >= 1 && exerciseStressAvg < noExStressAvg;

  const currentMood = today ? moodMeta[today.mood] : null;
  const currentStress = today ? stressMeta[today.stress] : null;

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Smile className="text-amber-500" /> Stress & Mood</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Track your emotional wellbeing and find patterns over time.</p>
      </div>

      {/* Current status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Current Mood</div>
          {currentMood ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentMood.emoji}</span>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{currentMood.label}</div>
              </div>
            </div>
          ) : <div className="text-gray-300 dark:text-slate-600 font-bold text-xl">No record yet</div>}
        </Card>
        <Card className="p-5">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Current Stress</div>
          {currentStress ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentStress.color }} />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{currentStress.label}</div>
            </div>
          ) : <div className="text-gray-300 dark:text-slate-600 font-bold text-xl">No record yet</div>}
        </Card>
      </div>

      {/* Record */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Record Today's Mood & Stress</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><Smile size={16} className="text-amber-500" /> Mood</label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(moodMeta) as MoodLevel[]).map((m) => (
              <button key={m} type="button" onClick={() => setMood(m)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${mood === m ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-gray-200 dark:border-slate-700 hover:border-amber-200'}`}>
                <span className="text-2xl">{moodMeta[m].emoji}</span>
                <span className="text-[10px] font-medium text-gray-600 dark:text-slate-300">{moodMeta[m].label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><Brain size={16} className="text-orange-500" /> Stress Level</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(stressMeta) as StressLevel[]).map((s) => (
              <button key={s} type="button" onClick={() => setStress(s)}
                className={`px-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${stress === s ? 'text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-orange-200'}`}
                style={stress === s ? { backgroundColor: stressMeta[s].color, borderColor: stressMeta[s].color } : {}}>
                {stressMeta[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Daily Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What's on your mind today?" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none" />
        </div>
        <button onClick={handleSave} disabled={!mood || !stress} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          <Save size={16} /> Save
        </button>
      </Card>

      {/* Weekly charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Mood</h2>
          {moodData.some((d) => d.mood > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
                <Tooltip formatter={(v: number) => [v > 0 ? Object.entries(moodMeta).find(([, m]) => m.value === v)?.[1].label ?? v : 'No data', 'Mood']} contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-tooltip-border)', fontSize: 12, backgroundColor: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-ink)' }} labelStyle={{ color: 'var(--chart-tooltip-ink)' }} itemStyle={{ color: 'var(--chart-tooltip-ink)' }} />
                <Line type="monotone" dataKey="mood" stroke="var(--chart-olive)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-olive)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Smile size={28} />} title="No mood data yet" message="Record your mood to see trends." actionLabel="Add Record" onAction={() => navigate('daily-record')} />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Stress</h2>
          {moodData.some((d) => d.stress > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
                <Tooltip formatter={(v: number) => [v > 0 ? Object.entries(stressMeta).find(([, s]) => s.value === v)?.[1].label ?? v : 'No data', 'Stress']} contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-tooltip-border)', fontSize: 12, backgroundColor: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-ink)' }} labelStyle={{ color: 'var(--chart-tooltip-ink)' }} itemStyle={{ color: 'var(--chart-tooltip-ink)' }} />
                <Line type="monotone" dataKey="stress" stroke="var(--chart-teal)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-teal)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Brain size={28} />} title="No stress data yet" message="Record your stress to see trends." actionLabel="Add Record" onAction={() => navigate('daily-record')} />
          )}
        </Card>
      </div>

      {/* Insight */}
      {hasInsight && (
        <Card className="p-5 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-slate-700">
          <div className="flex gap-3">
            <Lightbulb size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Personal Insight</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">Your stress level was lower on days when you completed exercise. Keep up the activity!</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

import { showToast } from '@/components/Toast';
