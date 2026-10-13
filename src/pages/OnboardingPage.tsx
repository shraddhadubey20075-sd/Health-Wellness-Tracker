import { useState } from 'react';
import { useNav } from '@/utils/nav';
import { useApp } from '@/utils/store';
import { showToast } from '@/components/Toast';
import type { UserProfile, WellnessGoal, ExperienceLevel, AvailableTime, RoutinePreference, PhysicalConsideration, Gender } from '@/types';
import { Activity, AlertTriangle, ArrowLeft, ArrowRight, Brain, Check, Dumbbell, Flower2, Leaf, Moon, Target, User, type LucideIcon } from 'lucide-react';

export function OnboardingPage() {
  const { navigate } = useNav();
  const { profile, saveProfile, currentEmail } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState<number | ''>(profile?.age ?? '');
  const [gender, setGender] = useState<Gender | ''>(profile?.gender ?? '');
  const [goals, setGoals] = useState<WellnessGoal[]>(profile?.goals ?? []);
  const [experience, setExperience] = useState<ExperienceLevel | ''>(profile?.experience ?? '');
  const [availableTime, setAvailableTime] = useState<AvailableTime | ''>(profile?.availableTime ?? '');
  const [routine, setRoutine] = useState<RoutinePreference | ''>(profile?.routine ?? '');
  const [considerations, setConsiderations] = useState<PhysicalConsideration[]>(profile?.considerations ?? []);
  const [error, setError] = useState('');

  const steps = ['Basic Info', 'Wellness Goals', 'Experience', 'Routine', 'Considerations'];

  const toggleGoal = (g: WellnessGoal) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleConsideration = (c: PhysicalConsideration) => {
    setConsiderations((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const next = () => {
    setError('');
    if (step === 0 && (!name || !age)) {
      setError('Please enter your name and age.');
      return;
    }
    if (step === 1 && goals.length === 0) {
      setError('Please select at least one wellness goal.');
      return;
    }
    if (step === 2 && !experience) {
      setError('Please select your experience level.');
      return;
    }
    if (step === 3 && (!availableTime || !routine)) {
      setError('Please select your available time and routine.');
      return;
    }
    if (step === 4 && considerations.length === 0) {
      setError('Please select any physical considerations (or "No specific limitation").');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const p: UserProfile = {
      name,
      email: currentEmail ?? '',
      age: Number(age),
      gender: gender || undefined,
      goals,
      experience: experience as ExperienceLevel,
      availableTime: availableTime as AvailableTime,
      routine: routine as RoutinePreference,
      considerations,
      createdAt: new Date().toISOString(),
    };
    if (!(await saveProfile(p))) return;
    showToast('Profile saved! Welcome aboard.');
    navigate('dashboard');
  };

  const goalOptions: { value: WellnessGoal; label: string; icon: LucideIcon }[] = [
    { value: 'fitness', label: 'Improve fitness', icon: Dumbbell },
    { value: 'sleep', label: 'Better sleep', icon: Moon },
    { value: 'stress', label: 'Reduce stress', icon: Brain },
    { value: 'flexibility', label: 'Improve flexibility', icon: Flower2 },
    { value: 'weight', label: 'Weight management', icon: Activity },
    { value: 'concentration', label: 'Improve concentration', icon: Target },
    { value: 'general', label: 'General wellness', icon: Flower2 },
  ];

  return (
    <div className="wellness-onboarding min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Leaf className="wellness-leaf-mark text-white" size={18} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Wellness Onboarding</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400">Step {step + 1} of {steps.length}</div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
        {/* progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>

        <div className="wellness-onboarding-card bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8 animate-fade">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Let's get to know you</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Tell us a bit about yourself to personalize your experience.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Your age"
                  min={10}
                  max={120}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Gender <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { v: 'male', l: 'Male' },
                    { v: 'female', l: 'Female' },
                    { v: 'other', l: 'Other' },
                    { v: 'prefer-not-to-say', l: 'Prefer not to say' },
                  ] as { v: Gender; l: string }[]).map((g) => (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => setGender(g.v)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        gender === g.v
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-emerald-200'
                      }`}
                    >
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">What are your wellness goals?</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Select all that apply — we'll tailor recommendations to your goals.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {goalOptions.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => toggleGoal(g.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      goals.includes(g.value)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-emerald-200'
                    }`}
                  >
                    <g.icon size={20} strokeWidth={1.8} className="shrink-0 text-teal-700 dark:text-cyan-200" />
                    <span className="text-sm font-medium flex-1">{g.label}</span>
                    {goals.includes(g.value) && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your experience level</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">How would you rate your current fitness and wellness experience?</p>
              </div>
              <div className="space-y-2.5">
                {([
                  { v: 'beginner', l: 'Beginner', d: 'New to wellness routines' },
                  { v: 'intermediate', l: 'Intermediate', d: 'Some experience with regular practice' },
                  { v: 'advanced', l: 'Advanced', d: 'Consistent, experienced practitioner' },
                ] as { v: ExperienceLevel; l: string; d: string }[]).map((e) => (
                  <button
                    key={e.v}
                    type="button"
                    onClick={() => setExperience(e.v)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                      experience === e.v
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'border-gray-200 dark:border-slate-700 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${experience === e.v ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-800 dark:text-slate-200'}`}>{e.l}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{e.d}</div>
                    </div>
                    {experience === e.v && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your routine preference</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">How much time can you dedicate, and how often?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Daily Available Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: '5-10', l: '5–10 min' },
                    { v: '15-20', l: '15–20 min' },
                    { v: '30+', l: '30+ min' },
                  ] as { v: AvailableTime; l: string }[]).map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setAvailableTime(t.v)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        availableTime === t.v
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-emerald-200'
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Routine Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { v: 'daily', l: 'Daily' },
                    { v: '3-days', l: '3 days/week' },
                    { v: '5-days', l: '5 days/week' },
                    { v: 'weekend', l: 'Weekend only' },
                  ] as { v: RoutinePreference; l: string }[]).map((r) => (
                    <button
                      key={r.v}
                      type="button"
                      onClick={() => setRoutine(r.v)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        routine === r.v
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-emerald-200'
                      }`}
                    >
                      {r.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Physical considerations</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Select any areas of discomfort so we can recommend safe practices.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {([
                  { v: 'back', l: 'Back discomfort', icon: Activity },
                  { v: 'neck', l: 'Neck discomfort', icon: User },
                  { v: 'knee', l: 'Knee discomfort', icon: User },
                  { v: 'flexibility', l: 'Limited flexibility', icon: Flower2 },
                  { v: 'none', l: 'No specific limitation', icon: Check },
                ] as { v: PhysicalConsideration; l: string; icon: LucideIcon }[]).map((c) => (
                  <button
                    key={c.v}
                    type="button"
                    onClick={() => toggleConsideration(c.v)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      considerations.includes(c.v)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-emerald-200'
                    }`}
                  >
                    <c.icon size={19} strokeWidth={1.8} className="shrink-0 text-teal-700 dark:text-cyan-200" />
                    <span className="text-sm font-medium flex-1">{c.l}</span>
                    {considerations.includes(c.v) && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5 items-start bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  This application provides general wellness guidance and is not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => (step === 0 ? navigate('landing') : setStep(step - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {step === 4 ? 'Finish' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
