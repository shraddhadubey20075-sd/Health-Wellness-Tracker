import { Moon, Droplets, Activity, Smile, Brain, Dumbbell, Salad, Flower2, Target, TrendingUp, BarChart3, User, LayoutDashboard, ClipboardList, Waves, type LucideIcon } from 'lucide-react';
import type { Route } from './nav';

export interface NavItem {
  route: Route;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'daily-record', label: 'Daily Record', icon: ClipboardList },
  { route: 'sleep', label: 'Sleep', icon: Moon },
  { route: 'mood-stress', label: 'Mood & Stress', icon: Smile },
  { route: 'exercise', label: 'Exercise', icon: Dumbbell },
  { route: 'diet-water', label: 'Diet & Water', icon: Salad },
  { route: 'yoga', label: 'Yoga', icon: Flower2 },
  { route: 'meditation', label: 'Meditation', icon: Waves },
  { route: 'goals', label: 'Goals', icon: Target },
  { route: 'progress', label: 'Progress', icon: TrendingUp },
  { route: 'reports', label: 'Reports', icon: BarChart3 },
  { route: 'profile', label: 'Profile', icon: User },
];

export const featureIcons = {
  sleep: Moon,
  stress: Brain,
  exercise: Activity,
  diet: Droplets,
  yoga: Flower2,
  reports: BarChart3,
};
