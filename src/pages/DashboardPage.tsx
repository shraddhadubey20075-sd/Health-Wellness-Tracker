import { useState } from 'react';
import { useNav } from '@/utils/nav';
import { useApp } from '@/utils/store';
import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { calcWellnessScore, moodMeta, stressMeta, formatHours, getStreakMessage } from '@/utils/wellness';
import { lastNDays, formatDateLabel } from '@/utils/storage';
import { yogaPoses } from '@/data/yogaPoses';
import type { WellnessGoal } from '@/types';
import { Moon, Droplets, Dumbbell, Smile, Brain, Flame, ArrowRight, Target, Flower2, Waves, Bell, Clock, Sparkles, X } from 'lucide-react';

export function DashboardPage() {
  const [remindersOpen, setRemindersOpen] = useState(false);
  const { navigate } = useNav();
  const { profile, exercises, yogaSessions, meditationSessions, goals, reminders, streak, waterGoal, sleepGoal, exerciseGoal, getTodayRecord } = useApp();

  const today = getTodayRecord();
  const score = calcWellnessScore(today, waterGoal);
  const greetingName = profile?.name?.split(' ')[0] ?? 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const last7 = lastNDays(7);
  const todayExercises = exercises.filter((e) => e.date === last7[6]);
  const todayExerciseMin = todayExercises.reduce((s, e) => s + e.duration, 0);

  // recommended yoga based on goals
  const recommendedPoses = getRecommendedPoses(profile?.goals ?? []);
  const reminderLabels: Record<string, string> = {
    water: 'Drink Water',
    exercise: 'Exercise',
    yoga: 'Yoga',
    sleep: 'Sleep',
    'daily-record': 'Daily Wellness Record',
    meditation: 'Meditation',
  };

  const quickStats = [
    {
      label: 'Sleep',
      value: today ? formatHours(today.sleepHours) : '—',
      sub: today ? `${today.sleepQuality}` : 'No record',
      icon: Moon,
      color: '#3b82f6',
      pct: today ? Math.min(today.sleepHours / sleepGoal, 1) : 0,
    },
    {
      label: 'Water',
      value: today ? `${today.waterGlasses} / ${waterGoal}` : '—',
      sub: 'glasses',
      icon: Droplets,
      color: '#06b6d4',
      pct: today ? Math.min(today.waterGlasses / waterGoal, 1) : 0,
    },
    {
      label: 'Exercise',
      value: today ? `${todayExerciseMin || today.exerciseMinutes} min` : '—',
      sub: `goal ${exerciseGoal} min`,
      icon: Dumbbell,
      color: '#10b981',
      pct: today ? Math.min((todayExerciseMin || today.exerciseMinutes) / exerciseGoal, 1) : 0,
    },
    {
      label: 'Mood',
      value: today ? `${moodMeta[today.mood].emoji} ${moodMeta[today.mood].label}` : '—',
      sub: 'today',
      icon: Smile,
      color: '#f59e0b',
      pct: today ? moodMeta[today.mood].value / 5 : 0,
    },
    {
      label: 'Stress',
      value: today ? stressMeta[today.stress].label : '—',
      sub: 'today',
      icon: Brain,
      color: '#f97316',
      pct: today ? 1 - (stressMeta[today.stress].value - 1) / 3 : 0,
    },
  ];

  return (
    <div className="wellness-dashboard space-y-6 pb-20 md:pb-6">
      {/* Greeting */}
      <div className="wellness-dashboard-heading animate-in">
        <div>
          <p className="wellness-eyebrow">YOUR DAILY OVERVIEW</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {greetingName} <Sparkles size={18} strokeWidth={1.8} className="inline text-teal-600 dark:text-cyan-200" /></h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Let's take care of your wellness today. · {todayDate}</p>
        </div>
        <div className="wellness-reminder-anchor">
          <button
            type="button"
            aria-label="Open reminders"
            aria-expanded={remindersOpen}
            onClick={() => setRemindersOpen((open) => !open)}
            className="wellness-reminder-bell"
          >
            <Bell size={19} />
            {reminders.some((reminder) => reminder.enabled) && <span className="wellness-reminder-count">{reminders.filter((reminder) => reminder.enabled).length}</span>}
          </button>
          {remindersOpen && (
            <div className="wellness-reminder-popover">
              <div className="wellness-reminder-popover-heading">
                <div>
                  <p className="wellness-eyebrow">YOUR ROUTINE</p>
                  <h2>Reminders</h2>
                </div>
                <button type="button" aria-label="Close reminders" onClick={() => setRemindersOpen(false)} className="wellness-reminder-close"><X size={16} /></button>
              </div>
              {reminders.length === 0 ? (
                <p className="wellness-reminder-empty">No reminders saved yet.</p>
              ) : (
                <div className="wellness-reminder-list">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className={`wellness-reminder-item${reminder.enabled ? '' : ' is-disabled'}`}>
                      <span className="wellness-reminder-icon"><Clock size={15} /></span>
                      <span className="wellness-reminder-name">{reminderLabels[reminder.type] ?? reminder.type}</span>
                      <span className="wellness-reminder-time">{reminder.time}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="wellness-reminder-note">Your saved reminder times are listed here. Manage them in your profile.</p>
              <button
                type="button"
                className="wellness-reminder-manage"
                onClick={() => { setRemindersOpen(false); navigate('profile'); }}
              >
                Manage reminders <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Score + Quick Stats */}
      <div className="wellness-dashboard-overview-grid grid lg:grid-cols-[minmax(17rem,0.9fr)_1.5fr] gap-4">
        <Card className="wellness-score-card min-h-[20rem] lg:min-h-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <div className="p-5 flex flex-col items-center justify-center text-center h-full">
            <p className="text-sm font-medium opacity-90 mb-3">Today's Wellness Score</p>
            {today ? (
              <>
                <ProgressRing
                  value={score}
                  max={100}
                  size={140}
                  color="#ffffff"
                  label={`${score}`}
                  sublabel="/ 100"
                />
                <p className="text-sm opacity-90 mt-3">
                  {score >= 80 ? 'Excellent work today!' : score >= 60 ? 'Good progress — keep going!' : 'Complete more records to improve.'}
                </p>
              </>
            ) : (
              <>
                <div className="w-[140px] h-[140px] rounded-full border-2 border-white/30 flex items-center justify-center mb-3">
                  <span className="text-4xl opacity-50">—</span>
                </div>
                <p className="text-sm opacity-90">Complete today's wellness record to generate your score.</p>
                <button
                  onClick={() => navigate('daily-record')}
                  className="mt-3 px-4 py-2 rounded-xl bg-white text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  Add Today's Record
                </button>
              </>
            )}
          </div>
        </Card>

        <div className="wellness-dashboard-stat-grid grid sm:grid-cols-2 gap-4">
          {quickStats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} hover className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="wellness-stat-icon w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{s.label}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{s.value}</div>
                  </div>
                </div>
                <ProgressBar value={s.pct * 100} max={100} color={s.color} />
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{s.sub}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Goals */}
      <div className="wellness-dashboard-content-grid">
      <div className="wellness-dashboard-section wellness-dashboard-goals">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target size={18} className="text-emerald-500" /> Today's Goals</h2>
          <button onClick={() => navigate('goals')} className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {goals.length === 0 ? (
          <Card className="p-5">
            <EmptyState
              icon={<Target size={28} />}
              title="No goals yet"
              message="Set wellness goals to track your progress and stay motivated."
              actionLabel="Add a Goal"
              onAction={() => navigate('goals')}
            />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {goals.slice(0, 4).map((g) => (
              <Card key={g.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{g.name}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{g.current} / {g.target} {g.unit}</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {Math.min(Math.round((g.current / g.target) * 100), 100)}%
                  </span>
                </div>
                <ProgressBar value={g.current} max={g.target} color="#10b981" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommended For You */}
      <div className="wellness-dashboard-section wellness-dashboard-recommendations">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target size={18} className="text-emerald-500" /> Recommended For You</h2>
          <button onClick={() => navigate('yoga')} className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:underline">
            Explore <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendedPoses.slice(0, 3).map((p) => (
            <Card key={p.id} hover className="p-4" onClick={() => navigate('yoga')}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">{p.sanskrit}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium capitalize">{p.difficulty}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-2">{Math.round(p.durationSeconds / 60)} min</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div className="wellness-dashboard-streak">
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
      </div>
      </div>
    </div>
  );
}

function getRecommendedPoses(goals: WellnessGoal[]) {
  if (goals.length === 0) {
    return yogaPoses.filter((p) => p.categories.includes('beginner')).slice(0, 5);
  }
  const map: Record<WellnessGoal, string[]> = {
    stress: ['balasana', 'anulom-vilom', 'shavasana', 'marjariasana'],
    flexibility: ['trikonasana', 'paschimottanasana', 'baddha-konasana', 'adho-mukha-svanasana', 'ardha-matsyendrasana'],
    fitness: ['tadasana', 'utkatasana', 'virabhadrasana-1', 'virabhadrasana-2', 'naukasana', 'phalakasana'],
    sleep: ['balasana',  'anulom-vilom', 'baddha-konasana', 'shavasana'],
    weight: ['tadasana', 'utkatasana', 'phalakasana', 'naukasana', 'virabhadrasana-2'],
    concentration: ['vrikshasana',  'vajrasana', 'anulom-vilom', 'tadasana'],
    general: ['tadasana',  'bhujangasana', 'balasana', 'shavasana'],
  };
  const ids = new Set<string>();
  goals.forEach((g) => map[g]?.forEach((id) => ids.add(id)));
  return yogaPoses.filter((p) => ids.has(p.id));
}
