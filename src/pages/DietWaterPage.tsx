import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { showToast } from '@/components/Toast';
import { todayKey } from '@/utils/storage';
import { Droplets, Plus, Minus, Salad, StickyNote, Save, Info } from 'lucide-react';

export function DietWaterPage() {
  const { getTodayRecord, saveDailyRecord, waterGoal, setWaterGoal } = useApp();
  const { navigate } = useNav();
  const today = getTodayRecord();

  const [water, setWater] = useState(today?.waterGlasses ?? 0);
  const [breakfast, setBreakfast] = useState(today?.breakfast ?? false);
  const [lunch, setLunch] = useState(today?.lunch ?? false);
  const [dinner, setDinner] = useState(today?.dinner ?? false);
  const [fruitsVeg, setFruitsVeg] = useState(today?.fruitsVeg ?? false);
  const [snacks, setSnacks] = useState(today?.junkFood ?? false);
  const [note, setNote] = useState(today?.notes ?? '');
  const [goalInput, setGoalInput] = useState(waterGoal);

  const updateWater = (delta: number) => {
    setWater(Math.max(0, Math.min(20, water + delta)));
  };

  const saveWater = async () => {
    const existing = getTodayRecord();
    if (!(await saveDailyRecord({
      ...existing,
      date: todayKey(),
      bedtime: existing?.bedtime ?? '',
      wakeTime: existing?.wakeTime ?? '',
      sleepHours: existing?.sleepHours ?? 0,
      sleepQuality: existing?.sleepQuality ?? 'average',
      mood: existing?.mood ?? 'okay',
      stress: existing?.stress ?? 'moderate',
      exerciseMinutes: existing?.exerciseMinutes ?? 0,
      waterGlasses: water,
      breakfast: existing?.breakfast ?? false,
      lunch: existing?.lunch ?? false,
      dinner: existing?.dinner ?? false,
      fruitsVeg: existing?.fruitsVeg ?? false,
      junkFood: existing?.junkFood ?? false,
      notes: existing?.notes ?? '',
    }))) return;
    showToast('Water intake updated!');
  };

  const saveDiet = async () => {
    const existing = getTodayRecord();
    if (!(await saveDailyRecord({
      ...existing,
      date: todayKey(),
      bedtime: existing?.bedtime ?? '',
      wakeTime: existing?.wakeTime ?? '',
      sleepHours: existing?.sleepHours ?? 0,
      sleepQuality: existing?.sleepQuality ?? 'average',
      mood: existing?.mood ?? 'okay',
      stress: existing?.stress ?? 'moderate',
      exerciseMinutes: existing?.exerciseMinutes ?? 0,
      waterGlasses: existing?.waterGlasses ?? water,
      breakfast,
      lunch,
      dinner,
      fruitsVeg,
      junkFood: snacks,
      notes: note,
    }))) return;
    showToast('Diet saved!');
    navigate('dashboard');
  };

  const waterPct = waterGoal > 0 ? Math.min((water / waterGoal) * 100, 100) : 0;

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Salad className="text-green-500" /> Diet & Hydration</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Track your water intake and meals with simple daily check-ins.</p>
      </div>

      {/* Water */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Droplets size={18} className="text-cyan-500" /> Water Intake</h2>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{water} / {waterGoal}</div>
        </div>

        {/* Water glasses visual */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => setWater(i + 1 === water ? water - 1 : i + 1)}
              className={`w-8 h-10 rounded-lg border-2 transition-all duration-300 ${i < water ? 'bg-cyan-500 border-cyan-500' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'}`}
              style={i < water ? { animation: 'fillWater 0.4s ease-out' } : {}}
              aria-label={`Glass ${i + 1}`}
            />
          ))}
        </div>

        <ProgressBar value={water} max={waterGoal} color="#06b6d4" height={10} />
        <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{Math.round(waterPct)}% of daily goal</div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => updateWater(-1)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-bold flex items-center justify-center gap-1.5">
            <Minus size={16} /> 1 Glass
          </button>
          <button onClick={() => updateWater(1)} className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 font-bold flex items-center justify-center gap-1.5">
            <Plus size={16} /> 1 Glass
          </button>
          <button onClick={saveWater} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm">
            Save
          </button>
        </div>

        {/* Goal editor */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">Daily Water Goal</label>
          <div className="flex gap-2">
            <input type="number" value={goalInput} onChange={(e) => setGoalInput(Math.min(Math.max(1, Number(e.target.value)), 20))} min={1} max={20} className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
            <button onClick={async () => { if (await setWaterGoal(goalInput)) showToast('Water goal updated!'); }} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-sm font-medium">Update Goal</button>
          </div>
        </div>
      </Card>

      {/* Diet */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Salad size={18} className="text-green-500" /> Food Tracking</h2>
        <div className="space-y-2">
          {[
            { label: 'Breakfast', val: breakfast, set: setBreakfast },
            { label: 'Lunch', val: lunch, set: setLunch },
            { label: 'Dinner', val: dinner, set: setDinner },
            { label: 'Fruits / Vegetables', val: fruitsVeg, set: setFruitsVeg },
            { label: 'Snacks / Junk food', val: snacks, set: setSnacks },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2.5 cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
              <button type="button" onClick={() => item.set(!item.val)}
                className={`relative w-11 h-6 rounded-full transition-colors ${item.val ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.val ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5"><StickyNote size={14} className="text-gray-400 dark:text-slate-500" /> Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Any food notes for today..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none" />
        </div>
        <button onClick={saveDiet} className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
          <Save size={16} /> Save Diet
        </button>
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20">
        <div className="flex gap-2">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">This tracker is for general wellness purposes only. It does not provide calorie calculations or medical dietary recommendations.</p>
        </div>
      </Card>
    </div>
  );
}
