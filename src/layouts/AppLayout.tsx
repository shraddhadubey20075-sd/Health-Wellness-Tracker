import { useState } from 'react';
import { useNav } from '@/utils/nav';
import { useApp } from '@/utils/store';
import { useTheme } from '@/utils/theme';
import { navItems } from '@/utils/navItems';
import { Leaf, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { route, navigate } = useNav();
  const { profile, logout, isDemo } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (r: typeof navItems[number]['route']) => {
    navigate(r);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    if (!(await logout())) return;
    navigate('landing');
  };

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );

  return (
    <div className="wellness-app min-h-screen bg-mesh flex">
      {/* Desktop Sidebar */}
      <aside className="wellness-sidebar hidden md:flex flex-col w-64 bg-white/80 dark:bg-slate-900/80 glass border-r border-gray-100 dark:border-slate-800 shrink-0">
        <div className="wellness-sidebar-brand px-5 h-16 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow">
            <Leaf className="wellness-leaf-mark text-white" size={18} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Health &<br />Wellness Tracker</span>
        </div>
        <nav className="wellness-sidebar-nav flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = route === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} className={active ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="wellness-sidebar-profile">
          <div className="wellness-sidebar-avatar">{profile?.name?.charAt(0).toUpperCase() ?? 'W'}</div>
          <div className="min-w-0">
            <div className="wellness-sidebar-profile-name">{profile?.name ?? 'Wellness profile'}</div>
            <div className="wellness-sidebar-profile-detail">Personal wellness</div>
          </div>
        </div>
        <div className="wellness-sidebar-footer px-3 py-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-1">
            {isDemo && <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-1 font-medium">Demo User</span>}
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 bg-white/80 dark:bg-slate-900/80 glass border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Leaf className="wellness-leaf-mark text-white" size={18} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Wellness Tracker</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-600 dark:text-slate-400">
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 bg-white dark:bg-slate-900 flex flex-col animate-slide-in">
              <div className="px-5 h-14 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Leaf className="wellness-leaf-mark text-white" size={18} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Wellness Tracker</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 dark:text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <nav className="wellness-sidebar-nav flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = route === item.route;
                  return (
                    <button
                      key={item.route}
                      onClick={() => handleNav(item.route)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="wellness-sidebar-profile mobile-profile">
                <div className="wellness-sidebar-avatar">{profile?.name?.charAt(0).toUpperCase() ?? 'W'}</div>
                <div className="min-w-0">
                  <div className="wellness-sidebar-profile-name">{profile?.name ?? 'Wellness profile'}</div>
                  <div className="wellness-sidebar-profile-detail">Personal wellness</div>
                </div>
              </div>
              <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800">
                {isDemo && <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2 mb-2 text-center font-medium">Demo User</div>}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 glass border-t border-gray-100 dark:border-slate-800 flex justify-around px-1 py-1 z-30">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = route === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}
              >
                <Icon size={20} />
                {item.label.split(' ')[0]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
