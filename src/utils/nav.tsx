import { createContext, useContext, useState, useCallback } from 'react';

export type Route =
  | 'landing'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'daily-record'
  | 'sleep'
  | 'mood-stress'
  | 'exercise'
  | 'diet-water'
  | 'yoga'
  | 'meditation'
  | 'goals'
  | 'progress'
  | 'reports'
  | 'profile';

interface NavCtx {
  route: Route;
  navigate: (r: Route) => void;
}

const Ctx = createContext<NavCtx | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const navigate = useCallback((r: Route) => {
    setRoute(r);
    window.scrollTo(0, 0);
  }, []);
  return <Ctx.Provider value={{ route, navigate }}>{children}</Ctx.Provider>;
}

export function useNav(): NavCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
