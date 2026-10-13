import { NavProvider, useNav } from '@/utils/nav';
import { AppProvider, useApp } from '@/utils/store';
import { ToastContainer } from '@/components/Toast';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage, SignupPage } from '@/pages/AuthPages';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DailyRecordPage } from '@/pages/DailyRecordPage';
import { SleepPage } from '@/pages/SleepPage';
import { MoodStressPage } from '@/pages/MoodStressPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { DietWaterPage } from '@/pages/DietWaterPage';
import { YogaPage } from '@/pages/YogaPage';
import { MeditationPage } from '@/pages/MeditationPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import type { Route } from '@/utils/nav';

function Router() {
  const { route, navigate } = useNav();
  const { isAuthed, profile, authLoading, authError, retryAuthData, logout } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-sm text-gray-500 dark:text-slate-400" role="status">Checking your account…</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Your wellness data could not be loaded</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{authError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={retryAuthData} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Try again</button>
            <button onClick={() => { void logout(); }} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-sm font-medium">Log out</button>
          </div>
        </div>
      </div>
    );
  }

  // Public routes
  const publicRoutes: Route[] = ['landing', 'login', 'signup'];
  if (publicRoutes.includes(route) || !isAuthed) {
    if (route === 'login') return <LoginPage />;
    if (route === 'signup') return <SignupPage />;
    return <LandingPage />;
  }

  // Authed but no profile — go to onboarding
  if (!profile && route !== 'onboarding') {
    return <OnboardingPage />;
  }
  if (route === 'onboarding') return <OnboardingPage />;

  // Authed app routes
  const appRoutes: Route[] = ['dashboard', 'daily-record', 'sleep', 'mood-stress', 'exercise', 'diet-water', 'yoga', 'meditation', 'goals', 'progress', 'reports', 'profile'];
  if (!appRoutes.includes(route)) {
    navigate('dashboard');
    return null;
  }

  let page: React.ReactNode;
  switch (route) {
    case 'dashboard': page = <DashboardPage />; break;
    case 'daily-record': page = <DailyRecordPage />; break;
    case 'sleep': page = <SleepPage />; break;
    case 'mood-stress': page = <MoodStressPage />; break;
    case 'exercise': page = <ExercisePage />; break;
    case 'diet-water': page = <DietWaterPage />; break;
    case 'yoga': page = <YogaPage />; break;
    case 'meditation': page = <MeditationPage />; break;
    case 'goals': page = <GoalsPage />; break;
    case 'progress': page = <ProgressPage />; break;
    case 'reports': page = <ReportsPage />; break;
    case 'profile': page = <ProfilePage />; break;
    default: page = <DashboardPage />;
  }

  // Yoga session is full-screen, so we don't wrap it in the layout
  if (route === 'yoga') {
    return <AppLayout>{page}</AppLayout>;
  }

  return <AppLayout>{page}</AppLayout>;
}

function App() {
  return (
    <AppProvider>
      <NavProvider>
        <Router />
        <ToastContainer />
      </NavProvider>
    </AppProvider>
  );
}

export default App;
