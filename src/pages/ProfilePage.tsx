import { useState } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { showToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import type { Gender, ExperienceLevel, AvailableTime, RoutinePreference, WellnessGoal, PhysicalConsideration, Reminder } from '@/types';
import { User, Edit3, Save, Trash2, LogOut, RotateCcw, Bell, Plus, AlertTriangle, Check } from 'lucide-react';

const goalLabels: Record<WellnessGoal, string> = {
  fitness: 'Improve fitness',
  sleep: 'Better sleep',
  stress: 'Reduce stress',
  flexibility: 'Improve flexibility',
  weight: 'Weight management',
  concentration: 'Improve concentration',
  general: 'General wellness',
};

const experienceLabels: Record<ExperienceLevel, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const timeLabels: Record<AvailableTime, string> = { '5-10': '5–10 minutes', '15-20': '15–20 minutes', '30+': '30+ minutes' };
const routineLabels: Record<RoutinePreference, string> = { daily: 'Daily', '3-days': '3 days/week', '5-days': '5 days/week', weekend: 'Weekend only' };
const considerationLabels: Record<PhysicalConsideration, string> = { back: 'Back discomfort', neck: 'Neck discomfort', knee: 'Knee discomfort', flexibility: 'Limited flexibility', none: 'No specific limitation' };

const reminderTypeLabels: Record<string, string> = {
  water: 'Drink Water',
  exercise: 'Exercise',
  yoga: 'Yoga',
  sleep: 'Sleep',
  'daily-record': 'Daily Wellness Record',
};

export function ProfilePage() {
  const { profile, updateProfile, resetProgress, clearAll, logout, reminders, addReminder, toggleReminder, deleteReminder } = useApp();
  const { navigate } = useNav();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState<number | ''>(profile?.age ?? '');
  const [gender, setGender] = useState<Gender | ''>(profile?.gender ?? '');
  const [goals, setGoals] = useState<WellnessGoal[]>(profile?.goals ?? []);
  const [experience, setExperience] = useState<ExperienceLevel | ''>(profile?.experience ?? '');
  const [availableTime, setAvailableTime] = useState<AvailableTime | ''>(profile?.availableTime ?? '');
  const [routine, setRoutine] = useState<RoutinePreference | ''>(profile?.routine ?? '');
  const [considerations, setConsiderations] = useState<PhysicalConsideration[]>(profile?.considerations ?? []);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderType, setReminderType] = useState<Reminder['type']>('water');
  const [reminderTime, setReminderTime] = useState('08:00');

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-slate-500">No profile found.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name || !age) {
      showToast('Please enter your name and age.', 'error');
      return;
    }
    if (!(await updateProfile({
      name,
      age: Number(age),
      gender: gender || undefined,
      goals,
      experience: (experience || 'beginner') as ExperienceLevel,
      availableTime: (availableTime || '15-20') as AvailableTime,
      routine: (routine || 'daily') as RoutinePreference,
      considerations,
    }))) return;
    setEditing(false);
    showToast('Profile updated!');
  };

  const handleReset = async () => {
    const ok = await confirm('Reset Progress', 'This will delete all your daily records, exercises, yoga sessions, goals, and streaks. Your profile will be kept. This cannot be undone.');
    if (ok) {
      if (await resetProgress()) showToast('Progress reset.');
    }
  };

  const handleClearAll = async () => {
    const ok = await confirm('Clear All Data', 'This will permanently delete ALL data including your account, profile, records, and settings. This cannot be undone.');
    if (ok) {
      if (!(await clearAll())) return;
      showToast('All data cleared.');
      navigate('landing');
    }
  };

  const handleLogout = async () => {
    if (!(await logout())) return;
    navigate('landing');
  };

  const handleAddReminder = async () => {
    if (!(await addReminder({ type: reminderType, time: reminderTime, enabled: true }))) return;
    setShowReminderForm(false);
    showToast('Reminder added!');
  };

  const toggleGoal = (g: WellnessGoal) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleConsideration = (c: PhysicalConsideration) => {
    setConsiderations((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-3xl mx-auto">
      {dialog}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><User className="text-emerald-500" /> My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
            <Edit3 size={16} /> Edit
          </button>
        )}
      </div>

      {/* Profile card */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-gray-400 dark:text-slate-500">{profile.email}</p>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            <ProfileRow label="Age" value={`${profile.age}`} />
            <ProfileRow label="Gender" value={profile.gender ? ({ male: 'Male', female: 'Female', other: 'Other', 'prefer-not-to-say': 'Prefer not to say' })[profile.gender] : 'Not specified'} />
            <ProfileRow label="Goals" value={profile.goals.map((g) => goalLabels[g]).join(', ')} />
            <ProfileRow label="Experience" value={experienceLabels[profile.experience]} />
            <ProfileRow label="Available Time" value={timeLabels[profile.availableTime]} />
            <ProfileRow label="Routine" value={routineLabels[profile.routine]} />
            <ProfileRow label="Considerations" value={profile.considerations.map((c) => considerationLabels[c]).join(', ')} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} min={10} max={120} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['male', 'female', 'other', 'prefer-not-to-say'] as Gender[]).map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${gender === g ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {g === 'prefer-not-to-say' ? 'Prefer not to say' : g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Wellness Goals</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(goalLabels) as WellnessGoal[]).map((g) => (
                  <button key={g} type="button" onClick={() => toggleGoal(g)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${goals.includes(g) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Experience</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(experienceLabels) as ExperienceLevel[]).map((e) => (
                  <button key={e} type="button" onClick={() => setExperience(e)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${experience === e ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {experienceLabels[e]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Available Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(timeLabels) as AvailableTime[]).map((t) => (
                    <button key={t} type="button" onClick={() => setAvailableTime(t)} className={`px-2 py-2 rounded-xl text-xs font-medium border transition-all ${availableTime === t ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                      {timeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Routine</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(routineLabels) as RoutinePreference[]).map((r) => (
                    <button key={r} type="button" onClick={() => setRoutine(r)} className={`px-2 py-2 rounded-xl text-xs font-medium border transition-all ${routine === r ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                      {routineLabels[r]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Physical Considerations</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(considerationLabels) as PhysicalConsideration[]).map((c) => (
                  <button key={c} type="button" onClick={() => toggleConsideration(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${considerations.includes(c) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {considerationLabels[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </Card>

      {/* Reminders */}
      <Card className="wellness-reminders-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Bell size={18} className="wellness-reminder-accent" /> Reminders</h2>
          <button onClick={() => setShowReminderForm(!showReminderForm)} className="wellness-reminder-button px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add
          </button>
        </div>

        {showReminderForm && (
          <div className="wellness-reminder-form bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-3 space-y-3 animate-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Type</label>
                <select value={reminderType} onChange={(e) => setReminderType(e.target.value as Reminder['type'])} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 outline-none text-sm bg-white dark:bg-slate-800 dark:text-white">
                  {Object.entries(reminderTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Time</label>
                <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 outline-none text-sm dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            <button onClick={handleAddReminder} className="wellness-reminder-button wellness-reminder-primary w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">Add Reminder</button>
          </div>
        )}

        {reminders.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No reminders set. Add one to stay on track!</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${r.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{reminderTypeLabels[r.type]}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{r.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleReminder(r.id)} className={`relative w-10 h-5 rounded-full transition-colors ${r.enabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.enabled ? 'translate-x-5' : ''}`} />
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="text-gray-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 text-center">Reminders are stored locally and displayed within the app.</p>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-rose-100">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Data Management</h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Manage your data and account.</p>
        <div className="space-y-2">
          <button onClick={handleReset} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors text-sm font-medium">
            <span className="flex items-center gap-2"><RotateCcw size={16} /> Reset Progress</span>
            <span className="text-xs opacity-70">Keep profile, clear records</span>
          </button>
          <button onClick={handleClearAll} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors text-sm font-medium">
            <span className="flex items-center gap-2"><Trash2 size={16} /> Clear All Data</span>
            <span className="text-xs opacity-70">Delete everything</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
            <span className="flex items-center gap-2"><LogOut size={16} /> Logout</span>
          </button>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20">
        <div className="flex gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Health & Wellness Tracker is designed for general wellness tracking and educational purposes. It does not diagnose, treat, or prevent medical conditions and should not replace professional medical advice.</p>
        </div>
      </Card>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}
