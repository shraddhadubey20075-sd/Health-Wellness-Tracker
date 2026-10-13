import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import type { Goal } from '@/types';
import { Target, Plus, Trash2, Check } from 'lucide-react';

export function GoalsPage() {
  const { goals, addGoal, deleteGoal, updateGoalProgress } = useApp();
  const { navigate } = useNav();
  const { confirm, dialog } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name || !target || target <= 0) {
      setError('Please enter a goal name and a valid target.');
      return;
    }
    if (!(await addGoal({ name, target: Number(target), current: 0, unit: unit || 'units' }))) return;
    setName('');
    setTarget('');
    setUnit('');
    setError('');
    setShowForm(false);
    showToast('Goal added!');
  };

  const handleDelete = async (goal: Goal) => {
    const ok = await confirm('Delete Goal', `Are you sure you want to delete "${goal.name}"?`);
    if (ok) {
      if (await deleteGoal(goal.id)) showToast('Goal deleted.');
    }
  };

  const presetGoals = [
    { name: 'Exercise 30 minutes', target: 30, unit: 'min/day' },
    { name: 'Drink 8 glasses of water', target: 8, unit: 'glasses/day' },
    { name: 'Practice yoga 5 days/week', target: 5, unit: 'days/week' },
    { name: 'Maintain a sleep routine', target: 7, unit: 'hours/night' },
    { name: 'Complete daily wellness record', target: 7, unit: 'days/week' },
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-3xl mx-auto">
      {dialog}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target className="text-emerald-500" /> My Wellness Goals</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Set targets and track your progress.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="p-5 animate-in">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">New Goal</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Goal Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Walk 10000 steps" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Target</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value === '' ? '' : Number(e.target.value))} placeholder="8" min={1} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Unit</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="glasses/day" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            {error && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>}
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">Add Goal</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
          {/* Presets */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
            <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Quick presets</div>
            <div className="flex flex-wrap gap-2">
              {presetGoals.map((p) => (
                <button key={p.name} onClick={() => { setName(p.name); setTarget(p.target); setUnit(p.unit); }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <Card className="p-5">
          <EmptyState icon={<Target size={28} />} title="No goals yet" message="Set wellness goals to track your progress and stay motivated." actionLabel="Add a Goal" onAction={() => setShowForm(true)} />
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
            const isComplete = g.current >= g.target;
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                      {isComplete && <Check size={18} className="text-emerald-500" />}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{g.current} / {g.target} {g.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'}`}>{pct}%</span>
                    <button onClick={() => handleDelete(g)} className="text-gray-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <ProgressBar value={g.current} max={g.target} color={isComplete ? '#10b981' : '#3b82f6'} />
                {/* Quick update */}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => updateGoalProgress(g.id, Math.max(0, g.current - 1))} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-bold">−</button>
                  <input
                    type="number"
                    value={g.current}
                    onChange={(e) => updateGoalProgress(g.id, e.target.value === '' ? 0 : Math.min(Number(e.target.value), g.target * 2))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-center text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none dark:bg-slate-800 dark:text-white"
                  />
                  <button onClick={() => updateGoalProgress(g.id, Math.min(g.current + 1, g.target * 2))} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-bold">+</button>
                  <button onClick={() => updateGoalProgress(g.id, g.target)} className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Mark complete</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
