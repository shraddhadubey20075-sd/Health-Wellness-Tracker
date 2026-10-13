
import { useState } from 'react';
import { useNav } from '@/utils/nav';
import { useApp } from '@/utils/store';
import { showToast } from '@/components/Toast';
import { Leaf, Mail, Lock, ArrowLeft, User, Sparkles } from 'lucide-react';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';

export function LoginPage() {
  const { navigate } = useNav();
  const { login, loginDemo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
    } catch (authError) {
      setError(getFirebaseErrorMessage(authError));
      return;
    }
    showToast('Welcome back!');
    navigate('dashboard');
  };

  const handleDemo = () => {
    loginDemo();
    showToast('Logged in as demo user');
    navigate('dashboard');
  };

  return (
    <div className="wellness-auth min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <header className="px-4 sm:px-6 py-4">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-emerald-600 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="wellness-auth-panel w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <Leaf className="wellness-leaf-mark text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Log in to continue your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="wellness-auth-card bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              Login
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-slate-700" />
              </div>
              <div className="relative text-center">
                <span className="bg-white dark:bg-slate-800/60 px-3 text-xs text-gray-400 dark:text-slate-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Continue as Demo User
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-white mt-5">
            Don't have an account?{' '}
            <button onClick={() => navigate('signup')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { navigate } = useNav();
  const { signup } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup(name, email, password);
    } catch (authError) {
      setError(getFirebaseErrorMessage(authError));
      return;
    }
    showToast('Account created!');
    navigate('onboarding');
  };

  return (
    <div className="wellness-auth min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <header className="px-4 sm:px-6 py-4">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-emerald-600 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="wellness-auth-panel w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <Leaf className="wellness-leaf-mark text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Start your wellness journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="wellness-auth-card bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Your name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-white mt-5">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-[#33777B] dark:text-[#5EEAD4] font-medium hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
