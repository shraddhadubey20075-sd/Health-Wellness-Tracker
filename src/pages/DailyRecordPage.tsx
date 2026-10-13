import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { showToast } from '@/components/Toast';
import type { DailyRecord, MoodLevel, StressLevel, SleepQuality, ExerciseType, Intensity } from '@/types';
import { calcSleepHours, moodMeta, stressMeta, sleepQualityMeta, activityLabels, intensityLabels } from '@/utils/wellness';
import { todayKey } from '@/utils/storage';
import { Moon, Smile, Brain, Dumbbell, Droplets, Salad, StickyNote, Save, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const steps = [
  { num: 1, label: 'Sleep', icon: Moon, color: '#3b82f6' },
  { num: 2, label: 'Mood', icon: Smile, color: '#f59e0b' },
  { num: 3, label: 'Stress', icon: Brain, color: '#f97316' },
  { num: 4, label: 'Exercise', icon: Dumbbell, color: '#10b981' },
  { num: 5, label: 'Hydration', icon: Droplets, color: '#06b6d4' },
  { num: 6, label: 'Diet', icon: Salad, color: '#22c55e' },
];

export function DailyRecordPage() {
  const { getTodayRecord, saveDailyRecord } = useApp();
  const { navigate } = useNav();
  const existing = getTodayRecord();

  const [step, setStep] = useState(1);
  const [bedtime, setBedtime] = useState(existing?.bedtime ?? '');
  const [wakeTime, setWakeTime] = useState(existing?.wakeTime ?? '');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | ''>(existing?.sleepQuality ?? '');
  const [mood, setMood] = useState<MoodLevel | ''>(existing?.mood ?? '');
  const [stress, setStress] = useState<StressLevel | ''>(existing?.stress ?? '');
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>(existing ? 'walking' : '');
  const [exerciseMin, setExerciseMin] = useState<number | ''>(existing?.exerciseMinutes ?? '');
  const [intensity, setIntensity] = useState<Intensity | ''>('');
  const [waterGlasses, setWaterGlasses] = useState(existing?.waterGlasses ?? 0);
  const [breakfast, setBreakfast] = useState(existing?.breakfast ?? false);
  const [lunch, setLunch] = useState(existing?.lunch ?? false);
  const [dinner, setDinner] = useState(existing?.dinner ?? false);
  const [fruitsVeg, setFruitsVeg] = useState(existing?.fruitsVeg ?? false);
  const [junkFood, setJunkFood] = useState(existing?.junkFood ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const sleepHours = bedtime && wakeTime ? calcSleepHours(bedtime, wakeTime) : 0;
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = async () => {
    const rec: DailyRecord = {
      date: todayKey(),
      bedtime,
      wakeTime,
      sleepHours,
      sleepQuality: (sleepQuality || 'average') as SleepQuality,
      mood: (mood || 'okay') as MoodLevel,
      stress: (stress || 'moderate') as StressLevel,
      exerciseMinutes: exerciseMin === '' ? 0 : Number(exerciseMin),
      waterGlasses,
      breakfast,
      lunch,
      dinner,
      fruitsVeg,
      junkFood,
      notes,
    };
    if (!(await saveDailyRecord(rec))) return;
    showToast('Daily record saved!');
    navigate('dashboard');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Wellness Check-in</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Take a few minutes to log your wellness today.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">Step {step} of {totalSteps}</span>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? 'shadow-glow' : ''} ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}
                style={isActive ? { backgroundColor: s.color } : {}}
              >
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <Card className="p-6 animate-fade">
        {/* Step 1: Sleep */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={20} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How did you sleep?</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Bedtime</label>
                <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Wake-up time</label>
                <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm" />
              </div>
            </div>
            {sleepHours > 0 && (
              <div className="text-sm text-gray-500 dark:text-slate-400">Total sleep: <span className="font-semibold text-gray-700 dark:text-slate-200">{Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m</span></div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Sleep Quality</label>
              <div className="grid grid-cols-4 gap-2">
                {(['poor', 'average', 'good', 'excellent'] as SleepQuality[]).map((q) => (
                  <button key={q} type="button" onClick={() => setSleepQuality(q)}
                    className={`px-2 py-2.5 rounded-xl text-xs font-medium border capitalize transition-all ${sleepQuality === q ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-blue-200'}`}>
                    {sleepQualityMeta[q].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mood */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Smile size={20} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How are you feeling?</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(moodMeta) as MoodLevel[]).map((m) => (
                <button key={m} type="button" onClick={() => setMood(m)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all ${mood === m ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 shadow-soft' : 'border-gray-200 dark:border-slate-600 hover:border-amber-200'}`}>
                  <span className="text-3xl transition-transform duration-200" style={{ transform: mood === m ? 'scale(1.2)' : 'scale(1)' }}>{moodMeta[m].emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-slate-300">{moodMeta[m].label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Stress */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={20} className="text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How stressed are you?</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(stressMeta) as StressLevel[]).map((s) => (
                <button key={s} type="button" onClick={() => setStress(s)}
                  className={`px-2 py-3 rounded-xl text-sm font-medium border transition-all ${stress === s ? 'text-white' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-orange-200'}`}
                  style={stress === s ? { backgroundColor: stressMeta[s].color, borderColor: stressMeta[s].color } : {}}>
                  {stressMeta[s].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Exercise */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={20} className="text-emerald-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How active were you?</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Activity</label>
                <select value={exerciseType} onChange={(e) => setExerciseType(e.target.value as ExerciseType)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm">
                  <option value="">Select</option>
                  {Object.entries(activityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Duration (min)</label>
                <input type="number" value={exerciseMin} onChange={(e) => setExerciseMin(e.target.value === '' ? '' : Math.min(Math.max(0, Number(e.target.value)), 600))} placeholder="0" min={0} max={600} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Intensity</label>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm">
                  <option value="">Select</option>
                  {Object.entries(intensityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Water */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={20} className="text-cyan-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How much water did you drink?</h2>
            </div>
            <div className="flex items-center justify-center gap-6 py-4">
              <button type="button" onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))} className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold text-2xl transition-colors">−</button>
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-500">{waterGlasses}</div>
                <div className="text-sm text-gray-400 dark:text-slate-500 mt-1">glasses</div>
              </div>
              <button type="button" onClick={() => setWaterGlasses(Math.min(20, waterGlasses + 1))} className="w-14 h-14 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 font-bold text-2xl transition-colors">+</button>
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: Math.min(waterGlasses, 10) }, (_, i) => (
                <div key={i} className="w-6 h-8 rounded-b-lg bg-cyan-400/30 border border-cyan-300 dark:border-cyan-500/30 animate-fill-water" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Diet */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Salad size={20} className="text-green-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">How was your diet?</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Breakfast completed', val: breakfast, set: setBreakfast },
                { label: 'Lunch completed', val: lunch, set: setLunch },
                { label: 'Dinner completed', val: dinner, set: setDinner },
                { label: 'Fruits / Vegetables', val: fruitsVeg, set: setFruitsVeg },
                { label: 'Junk food consumed', val: junkFood, set: setJunkFood },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between py-2.5 cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                  <button type="button" onClick={() => item.set(!item.val)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${item.val ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-600'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.val ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><StickyNote size={14} /> Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Write a short note about your day..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 outline-none text-sm resize-none" />
            </div>
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button onClick={handlePrev} className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5">
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {step < totalSteps ? (
          <button onClick={handleNext} className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5">
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSave} className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-glow">
            <Save size={18} /> Save Daily Record
          </button>
        )}
      </div>
    </div>
  );
}
