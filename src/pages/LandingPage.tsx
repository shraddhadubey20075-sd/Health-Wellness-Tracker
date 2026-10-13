import { useState } from 'react';
import { useNav } from '@/utils/nav';
import { useApp } from '@/utils/store';
import { useTheme } from '@/utils/theme';
import { Activity, ArrowRight, BarChart3, Brain, Clock, Droplets, Dumbbell, Flower2, Leaf, Menu, Moon, Smile, Sparkles, Sun, Target, Waves, X } from 'lucide-react';

export function LandingPage() {
  const { navigate } = useNav();
  const { loginDemo } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  const features = [
    { icon: Moon, title: 'Sleep Tracking', desc: 'Track your sleep and understand your routine.' },
    { icon: Brain, title: 'Mood & Stress', desc: 'Record your mood and stress levels daily.' },
    { icon: Dumbbell, title: 'Exercise', desc: 'Track daily physical activity and progress.' },
    { icon: Droplets, title: 'Hydration', desc: 'Track daily water intake with visual goals.' },
    { icon: Flower2, title: 'Yoga', desc: 'Follow personalized yoga sessions with videos.' },
    { icon: Waves, title: 'Meditation', desc: 'Relax with guided meditation and calming sounds.' },
    { icon: Target, title: 'Goals', desc: 'Create and track wellness goals with progress.' },
    { icon: BarChart3, title: 'Reports', desc: 'Understand your progress with visual reports.' },
  ];

  return (
    <div className="wellness-welcome min-h-screen bg-mesh text-gray-900 dark:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-light dark:glass-dark border-b border-gray-100/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow">
              <Leaf className="wellness-leaf-mark text-white" size={20} />
            </div>
            <span className="font-bold text-lg hidden sm:block">Health & Wellness Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-slate-300">
            <button onClick={() => navigate('landing')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</button>
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => navigate('login')} className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Login</button>
            <button onClick={() => navigate('signup')} className="hidden sm:block px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-glow transition-all">Get Started</button>
            <button onClick={() => setMobileMenu(true)} className="md:hidden p-2 text-gray-600 dark:text-slate-300">
              <Menu size={22} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
            <div className="relative w-72 bg-white dark:bg-slate-900 flex flex-col animate-slide-in pt-4">
              <div className="flex justify-end px-4">
                <button onClick={() => setMobileMenu(false)} className="p-2 text-gray-500"><X size={20} /></button>
              </div>
              <nav className="flex flex-col gap-1 px-4 py-4 text-sm font-medium">
                <button onClick={() => { navigate('landing'); setMobileMenu(false); }} className="text-left py-2 text-gray-600 dark:text-slate-300">Home</button>
                <a href="#features" onClick={() => setMobileMenu(false)} className="py-2 text-gray-600 dark:text-slate-300">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="py-2 text-gray-600 dark:text-slate-300">How It Works</a>
                <a href="#about" onClick={() => setMobileMenu(false)} className="py-2 text-gray-600 dark:text-slate-300">About</a>
                <button onClick={() => { navigate('login'); setMobileMenu(false); }} className="py-2 text-emerald-600 dark:text-emerald-400">Login</button>
                <button onClick={() => { navigate('signup'); setMobileMenu(false); }} className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center">Get Started</button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="wellness-welcome-hero relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-6">
              <Sparkles size={14} /> Your Personal Wellness Companion
            </div>
            <h1 className="wellness-welcome-title text-4xl md:text-6xl font-bold leading-tight mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              A Healthier You,<br />
              <span className="text-gradient">Naturally.</span>
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
              Track your sleep, mood, stress, exercise, hydration and daily wellness — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('signup')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-glow transition-all flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </button>
              <a href="#features" className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
                Explore Wellness
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400 dark:text-slate-500">Track • Improve • Thrive</p>
          </div>

          {/* Hero Visual — single clean visual, no floating cards */}
          <div className="wellness-hero-art relative animate-fade">
            <div className="aspect-[4/5] max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-200 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 rounded-[2.5rem] blur-3xl opacity-60" />
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 dark:border-slate-700/30">
                <div className="wellness-nature-art absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-md animate-breathe flex items-center justify-center shadow-2xl">
                      <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Leaf size={62} strokeWidth={1.5} className="wellness-leaf-mark text-white drop-shadow-sm" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-8 bg-emerald-900/10 dark:bg-black/20 rounded-full blur-xl" />
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-emerald-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Below-hero benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Moon, label: 'Better Sleep' },
            { icon: Smile, label: 'Mindful Living' },
            { icon: Activity, label: 'Active Lifestyle' },
            { icon: Flower2, label: 'Inner Balance' },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-2 py-4">
              <b.icon size={25} strokeWidth={1.8} className="text-teal-700 dark:text-cyan-200" />
              <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Everything You Need for Better Wellness</h2>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-12 max-w-xl mx-auto">A complete wellness platform that brings every aspect of your health together.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-teal-700 transition-transform duration-300 group-hover:scale-105 dark:bg-cyan-400/10 dark:text-cyan-200">
                  <Icon size={21} strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Wellness, At a Glance</h2>
        <div className="bg-white dark:bg-slate-800/60 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/50 p-6 md:p-10 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Today's Wellness Score</p>
            <div className="text-6xl font-bold text-gradient">82</div>
            <div className="text-sm text-gray-400 mt-1">out of 100</div>
          </div>
          <div className="wellness-preview-stats grid grid-cols-4 gap-4">
            {[
              { label: 'Sleep', value: '7h 20m', color: 'text-blue-500' },
              { label: 'Exercise', value: '25 min', color: 'text-emerald-500' },
              { label: 'Water', value: '6/8', color: 'text-cyan-500' },
              { label: 'Mood', value: <Smile size={21} className="mx-auto text-teal-700 dark:text-cyan-200" />, color: 'text-amber-500' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Yoga + Meditation split section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="wellness-nature-art aspect-square max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-md animate-breathe flex items-center justify-center">
                  <Flower2 size={44} strokeWidth={1.5} className="text-white" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest mb-3">MOVE • BREATHE • RELAX</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Balance</h2>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-6">
              Explore personalized yoga sessions and calming meditation experiences designed to fit into your daily routine.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: 'Yoga', icon: Flower2 },
                { label: 'Relaxation', icon: Activity },
                { label: 'Meditation', icon: Waves },
                { label: '5–20 min', icon: Clock },
              ].map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-300"><tag.icon size={14} strokeWidth={1.8} />{tag.label}</span>
              ))}
            </div>
            <button onClick={() => { loginDemo(); navigate('yoga'); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-glow transition-all flex items-center gap-2">
              Explore Yoga & Meditation <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Start Your Wellness Journey</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Personalize', desc: 'Tell us your goals and routine.' },
            { num: '02', title: 'Track', desc: 'Record your daily wellness habits.' },
            { num: '03', title: 'Improve', desc: 'Understand your progress and build better habits.' },
          ].map((s, i) => (
            <div key={s.num} className="relative text-center">
              {i < 2 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-gradient-to-r from-emerald-300 to-transparent" />}
              <div className="relative inline-flex w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold items-center justify-center mb-4 shadow-glow">
                {s.num}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">About This Project</h2>
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
          The Health & Wellness Tracker brings together every aspect of daily wellness — sleep, stress, mood, exercise, diet, hydration, goals, yoga and meditation — into one personalized platform. It focuses on overall wellness tracking and education, not medical diagnosis.
        </p>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="wellness-welcome-cta relative rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-10 md:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Take Care of Your Wellness?</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">Start tracking your daily habits and discover a healthier, more balanced routine.</p>
            <button onClick={() => navigate('signup')} className="px-8 py-3.5 rounded-xl bg-white text-emerald-700 font-semibold hover:shadow-2xl transition-all inline-flex items-center gap-2">
              Get Started — It's Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Leaf className="wellness-leaf-mark text-white" size={18} />
                </div>
                <span className="font-bold text-white">Health & Wellness Tracker</span>
              </div>
              <p className="text-sm text-gray-400">Track. Improve. Thrive.</p>
            </div>
            <div className="flex flex-wrap gap-12 text-sm">
              <div>
                <div className="font-semibold text-white mb-2">Product</div>
                <a href="#features" className="block text-gray-400 hover:text-white mb-1">Features</a>
                <button onClick={() => navigate('signup')} className="block text-gray-400 hover:text-white mb-1">Yoga</button>
                <button onClick={() => navigate('signup')} className="block text-gray-400 hover:text-white mb-1">Meditation</button>
                <button onClick={() => navigate('signup')} className="block text-gray-400 hover:text-white">Progress</button>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">Company</div>
                <a href="#about" className="block text-gray-400 hover:text-white">About</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500 leading-relaxed">
            © 2026 Health & Wellness Tracker. This application is designed for general wellness tracking and educational purposes only. It does not diagnose, treat, or prevent medical conditions and should not replace professional medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
