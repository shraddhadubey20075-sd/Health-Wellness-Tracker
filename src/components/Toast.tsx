import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: ((t: ToastState) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const t = { id: ++toastId, message, type };
  listeners.forEach((l) => l(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const listener = (t: ToastState) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`wellness-toast ${t.message === 'Reminder added!' ? 'wellness-reminder-toast' : ''} flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-white border border-gray-100 animate-slide-in max-w-xs toast-${t.type}`}
        >
          {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
          {t.type === 'error' && <XCircle size={18} className="text-rose-500 shrink-0" />}
          {t.type === 'warning' && <AlertTriangle size={18} className="text-amber-500 shrink-0" />}
          <span className="text-sm text-gray-700">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
