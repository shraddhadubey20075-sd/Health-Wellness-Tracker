import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/utils/store';
import { Card } from '@/components/Card';
import { showToast } from '@/components/Toast';
import { meditationTracks } from '@/data/meditation';
import type { MeditationTrack } from '@/types';
import { Waves, Play, Pause, SkipBack, SkipForward, Volume2, X, Check, Clock, Flower2, Circle, type LucideIcon } from 'lucide-react';
const meditationIcons: Record<string, LucideIcon> = {
  flower: Flower2,
  waves: Waves,
  circle: Circle,
};

function MeditationTrackIcon({ track, size = 22 }: { track: MeditationTrack | undefined; size?: number }) {
  const Icon = track ? meditationIcons[track.icon] : Flower2;
  return <Icon size={size} strokeWidth={1.8} className="text-teal-700 dark:text-cyan-200" />;
}

export function MeditationPage() {
  const { meditationSessions, addMeditationSession } = useApp();
  const [activeTrack, setActiveTrack] = useState<MeditationTrack | null>(null);
  const [duration, setDuration] = useState(5);
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [breathing, setBreathing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMeditation = (track: MeditationTrack) => {
    setActiveTrack(track);
    setDuration(track.durationMinutes);
    setRemaining(track.durationMinutes * 60);
    setPlaying(false);
    setBreathing(false);
    setCompleted(false);
  };

  const stopMeditation = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setBreathing(false);
  }, []);

  useEffect(() => {
    if (playing && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setPlaying(false);
            setBreathing(false);
            setCompleted(true);
            if (activeTrack) {
              addMeditationSession({
                date: new Date().toISOString().slice(0, 10),
                type: activeTrack.id,
                durationMinutes: duration,
                completed: true,
              });
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [playing, remaining, activeTrack, duration, addMeditationSession]);

  const togglePlay = () => {
    if (!activeTrack) return;
    if (playing) {
      setPlaying(false);
      setBreathing(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setPlaying(true);
      setBreathing(true);
      if (activeTrack.audioPath) {
        if (!audioRef.current) {
          audioRef.current = new Audio(activeTrack.audioPath);
          audioRef.current.loop = true;
        }
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleDone = () => {
    stopMeditation();
    setActiveTrack(null);
    setCompleted(false);
    setRemaining(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const totalMeditationMin = meditationSessions.reduce((s, m) => s + m.durationMinutes, 0);
  const recentSessions = [...meditationSessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Meditation player modal
  if (activeTrack) {
    const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;
    return (
      <div className="wellness-meditation-player fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative w-full max-w-lg text-center text-white">
          <button onClick={handleDone} className="absolute top-0 right-0 p-2 text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>

          {completed ? (
            <div className="animate-scale py-12">
              <Flower2 size={48} strokeWidth={1.6} className="mx-auto mb-4 text-cyan-100" />
              <h2 className="text-3xl font-bold mb-3">Well Done</h2>
              <p className="text-white/70 mb-8">You completed your meditation session.</p>
              <button onClick={handleDone} className="px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:shadow-2xl transition-all">
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Breathing animation */}
              <div className="flex justify-center mb-8 mt-4">
                <div
                  className={`w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 backdrop-blur-md flex items-center justify-center ${breathing ? 'animate-breathe' : ''}`}
                  style={{ animationDuration: '8s' }}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/40 to-teal-500/40 flex items-center justify-center">
                    <MeditationTrackIcon track={activeTrack} size={30} />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1">{activeTrack.name}</h2>
              <p className="text-white/50 text-sm mb-6">{breathing ? 'Breathe In... Breathe Out...' : 'Press play to begin'}</p>

              {/* Timer */}
              <div className="text-5xl font-bold tabular-nums mb-6">{formatTime(remaining)}</div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-8 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button className="p-3 text-white/60 hover:text-white transition-colors">
                  <SkipBack size={22} />
                </button>
                <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-emerald-700 hover:shadow-2xl transition-all flex items-center justify-center">
                  {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button className="p-3 text-white/60 hover:text-white transition-colors">
                  <SkipForward size={22} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 max-w-xs mx-auto">
                <Volume2 size={18} className="text-white/50" />
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => handleVolume(Number(e.target.value))} className="flex-1 accent-emerald-400" />
              </div>

            </>
          )}
        </div>
      </div>
    );
  }

  // Main meditation page
  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Waves className="text-teal-500" /> Meditation & Relaxation</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Take a moment to breathe. Slow down, relax and reconnect with yourself.</p>
      </div>

      {/* Hero banner */}
      <div className="wellness-meditation-banner relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700 p-8 text-center text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-glow" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-glow" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md animate-breathe flex items-center justify-center mb-4">
            <Flower2 size={30} strokeWidth={1.7} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">Take a moment to breathe.</h2>
          <p className="text-white/70 text-sm">Slow down, relax and reconnect with yourself.</p>
        </div>
      </div>

      {/* Meditation cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Choose Your Session</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {meditationTracks.map((track) => (
            <Card key={track.id} className="p-5 group" hover onClick={() => startMeditation(track)}>
              <div className="flex items-start gap-4">
                <div className="wellness-meditation-track-icon w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <MeditationTrackIcon track={track} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{track.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-2">{track.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {track.durationMinutes} min</span>
                    <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Start Meditation <Play size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Session history */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">Total: {totalMeditationMin} min</span>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No meditation sessions yet. Start your first one above!</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const track = meditationTracks.find((t) => t.id === s.type);
              return (
                <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <MeditationTrackIcon track={track} size={20} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{track?.name ?? s.type}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">{s.date}</div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-slate-400">{s.durationMinutes} min</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
