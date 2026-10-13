import { useState } from 'react';
import { useApp } from '@/utils/store';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { calcWellnessScore, moodMeta, stressMeta, formatHours } from '@/utils/wellness';
import { lastNDays } from '@/utils/storage';
import { BarChart3, Download, Moon, Dumbbell, Smile, Brain, Droplets, Award, Printer, Flower2, Waves, type LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ReportsPage() {
  const { dailyRecords, exercises, yogaSessions, meditationSessions, waterGoal, profile } = useApp();
  const [range, setRange] = useState<7 | 30>(7);
  const gridColor = 'var(--chart-grid)';
  const tickColor = 'var(--chart-label)';
  const tooltipBg = 'var(--chart-tooltip-bg)';
  const tooltipBorder = 'var(--chart-tooltip-border)';
  const tooltipLabelColor = 'var(--chart-tooltip-ink)';

  const days = lastNDays(range);
  const rangeRecords = dailyRecords.filter((r) => days.includes(r.date));
  const rangeExercises = exercises.filter((e) => days.includes(e.date));
  const rangeYoga = yogaSessions.filter((y) => days.includes(y.date));
  const rangeMeditation = meditationSessions.filter((m) => days.includes(m.date));

  const avgSleep = rangeRecords.length > 0 ? rangeRecords.reduce((s, r) => s + r.sleepHours, 0) / rangeRecords.length : 0;
  const totalExercise = rangeExercises.reduce((s, e) => s + e.duration, 0);
  const avgWater = rangeRecords.length > 0 ? rangeRecords.reduce((s, r) => s + r.waterGlasses, 0) / rangeRecords.length : 0;
  const avgScore = rangeRecords.length > 0 ? rangeRecords.reduce((s, r) => s + calcWellnessScore(r, waterGoal), 0) / rangeRecords.length : 0;

  const moodCounts: Record<string, number> = {};
  rangeRecords.forEach((r) => { moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1; });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const avgStress = rangeRecords.length > 0 ? rangeRecords.reduce((s, r) => s + stressMeta[r.stress].value, 0) / rangeRecords.length : 0;
  const avgStressLabel = avgStress > 0 ? Object.entries(stressMeta).find(([, s]) => Math.round(s.value) === Math.round(avgStress))?.[1].label ?? '—' : '—';

  const chartData = days.map((d) => {
    const rec = dailyRecords.find((r) => r.date === d);
    return {
      date: d.slice(5),
      score: rec ? calcWellnessScore(rec, waterGoal) : 0,
      sleep: rec?.sleepHours ?? 0,
      water: rec?.waterGlasses ?? 0,
    };
  });

  const hasData = rangeRecords.length > 0 || rangeExercises.length > 0;
  const tooltipStyle = { borderRadius: 12, border: `1px solid ${tooltipBorder}`, fontSize: 12, background: tooltipBg, color: tooltipLabelColor };

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const report = generateTextReport({
      name: profile?.name ?? 'User', range, avgSleep, totalExercise, avgWater, avgScore,
      mostCommonMood, avgStressLabel, yogaCount: rangeYoga.length, meditationCount: rangeMeditation.length, recordCount: rangeRecords.length,
    });
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="text-emerald-500" /> Your Wellness Journey</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Visual summaries of your wellness data.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRange(7)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === 7 ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>7 Days</button>
          <button onClick={() => setRange(30)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === 30 ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>30 Days</button>
        </div>
      </div>

      {!hasData ? (
        <Card className="p-5">
          <EmptyState icon={<BarChart3 size={28} />} title="No data for this period" message="Start recording your daily wellness to generate reports." />
        </Card>
      ) : (
        <>
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wellness Report</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">{profile?.name ?? 'User'} · Last {range} days · {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                  <Download size={14} /> Download
                </button>
                <button onClick={handlePrint} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <ReportCard icon={Award} label="Avg Wellness Score" value={avgScore > 0 ? `${Math.round(avgScore)}/100` : '—'} color="#10b981" />
              <ReportCard icon={Moon} label="Avg Sleep" value={avgSleep > 0 ? formatHours(avgSleep) : '—'} color="#3b82f6" />
              <ReportCard icon={Dumbbell} label="Total Exercise" value={`${totalExercise} min`} color="#10b981" />
              <ReportCard icon={Smile} label="Most Common Mood" value={mostCommonMood ? `${moodMeta[mostCommonMood as keyof typeof moodMeta].emoji} ${moodMeta[mostCommonMood as keyof typeof moodMeta].label}` : '—'} color="#f59e0b" />
              <ReportCard icon={Brain} label="Avg Stress" value={avgStressLabel} color="#f97316" />
              <ReportCard icon={Droplets} label="Avg Water" value={avgWater > 0 ? `${avgWater.toFixed(1)} glasses` : '—'} color="#06b6d4" />
              <ReportCard icon={Flower2} label="Yoga Sessions" value={`${rangeYoga.length}`} color="#8b5cf6" />
              <ReportCard icon={Waves} label="Meditation Sessions" value={`${rangeMeditation.length}`} color="#06b6d4" />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Wellness Score Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} interval={range === 30 ? 4 : 0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}`, 'Score']} contentStyle={tooltipStyle} labelStyle={{ color: tooltipLabelColor }} itemStyle={{ color: tooltipLabelColor }} />
                  <Bar dataKey="score" fill="var(--chart-sage)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-gray-400 dark:text-slate-500 text-center pt-3 border-t border-gray-100 dark:border-slate-700">
              Based on {rangeRecords.length} wellness record{rangeRecords.length !== 1 ? 's' : ''} and {rangeExercises.length} exercise entr{rangeExercises.length !== 1 ? 'ies' : 'y'} in this period.
            </div>
          </Card>

          <Card className="p-4 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed text-center">
              This report is for general wellness tracking and educational purposes only. It does not diagnose, treat, or prevent medical conditions and should not replace professional medical advice.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

function ReportCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function generateTextReport(data: {
  name: string; range: number; avgSleep: number; totalExercise: number; avgWater: number; avgScore: number;
  mostCommonMood: string | undefined; avgStressLabel: string; yogaCount: number; meditationCount: number; recordCount: number;
}): string {
  return `HEALTH & WELLNESS TRACKER
Track. Improve. Thrive.
========================================

Report for: ${data.name}
Period: Last ${data.range} days
Generated: ${new Date().toLocaleString()}

----------------------------------------
SUMMARY
----------------------------------------
Average Wellness Score: ${data.avgScore > 0 ? Math.round(data.avgScore) : 'N/A'} / 100
Average Sleep:           ${data.avgSleep > 0 ? formatHours(data.avgSleep) : 'N/A'}
Total Exercise:          ${data.totalExercise} minutes
Average Water:           ${data.avgWater > 0 ? data.avgWater.toFixed(1) + ' glasses/day' : 'N/A'}
Most Common Mood:        ${data.mostCommonMood ?? 'N/A'}
Average Stress:         ${data.avgStressLabel}
Yoga Sessions:          ${data.yogaCount}
Meditation Sessions:    ${data.meditationCount}
Records Logged:         ${data.recordCount}

----------------------------------------
DISCLAIMER
----------------------------------------
This report is for general wellness tracking and educational purposes only.
It does not diagnose, treat, or prevent medical conditions and should not
replace professional medical advice.

========================================
`;
}
