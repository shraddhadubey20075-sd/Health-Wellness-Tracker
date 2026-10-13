import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { EmptyState } from '@/components/EmptyState';
import { sleepQualityMeta, formatHours } from '@/utils/wellness';
import { lastNDays, formatWeekdayLabel } from '@/utils/storage';
import { Moon, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts';

export function SleepPage() {
  const { dailyRecords, sleepGoal } = useApp();
  const { navigate } = useNav();

  const last7 = lastNDays(7);
  const weeklyData = last7.map((d) => {
    const rec = dailyRecords.find((r) => r.date === d);
    return {
      date: formatWeekdayLabel(d),
      hours: rec?.sleepHours ?? 0,
    };
  });

  const today = dailyRecords.find((r) => r.date === last7[6]);
  const validRecords = dailyRecords.filter((r) => r.sleepHours > 0);
  const avgSleep = validRecords.length > 0 ? validRecords.reduce((s, r) => s + r.sleepHours, 0) / validRecords.length : 0;
  const last30 = lastNDays(30).map((d) => ({ date: d, hours: dailyRecords.find((r) => r.date === d)?.sleepHours ?? 0 })).filter((d) => d.hours > 0);

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Moon className="text-blue-500" /> Sleep Tracker</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Monitor your sleep patterns and build a healthier sleep routine.</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Today's Sleep</div>
          {today ? <ProgressRing value={today.sleepHours} max={sleepGoal} size={90} color="#3b82f6" label={formatHours(today.sleepHours).replace(' ', '\n')} /> : <div className="text-2xl text-gray-300 dark:text-slate-600 font-bold">—</div>}
        </Card>
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Average Sleep</div>
          <ProgressRing value={avgSleep} max={sleepGoal} size={90} color="#06b6d4" label={avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : '—'} />
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Sleep Goal</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{sleepGoal}h</div>
          <div className="text-xs text-gray-400 dark:text-slate-500">per night</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">Quality Today</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{today ? sleepQualityMeta[today.sleepQuality].label : '—'}</div>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Weekly Sleep</h2>
        {weeklyData.some((d) => d.hours > 0) ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
              <Tooltip formatter={(v: number) => [`${formatHours(v)}`, 'Sleep']} contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-tooltip-border)', fontSize: 12, backgroundColor: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-ink)' }} labelStyle={{ color: 'var(--chart-tooltip-ink)' }} itemStyle={{ color: 'var(--chart-tooltip-ink)' }} />
              <ReferenceLine y={sleepGoal} stroke="var(--chart-olive)" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 10, fill: 'var(--chart-olive)' }} />
              <Bar dataKey="hours" fill="var(--chart-azure)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<Moon size={28} />} title="No sleep data yet" message="Record your daily wellness to track sleep patterns." actionLabel="Add Today's Record" onAction={() => navigate('daily-record')} />
        )}
      </Card>

      {/* Trend */}
      {last30.length >= 3 && (
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Sleep Trend (30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last30.map((d) => ({ date: d.date.slice(5), hours: d.hours }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} interval={5} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 12, fill: 'var(--chart-label)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
              <Tooltip formatter={(v: number) => [`${formatHours(v)}`, 'Sleep']} contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-tooltip-border)', fontSize: 12, backgroundColor: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-ink)' }} labelStyle={{ color: 'var(--chart-tooltip-ink)' }} itemStyle={{ color: 'var(--chart-tooltip-ink)' }} />
              <Line type="monotone" dataKey="hours" stroke="var(--chart-azure)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Wellness guidance */}
      <Card className="p-5 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-slate-700">
        <div className="flex gap-3">
          <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Wellness Guidance</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">Maintaining a consistent sleep routine can support overall wellness. Aim for 7–9 hours of sleep per night and try to go to bed and wake up at the same time each day.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
