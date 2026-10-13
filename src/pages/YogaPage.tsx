import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/utils/store';
import { useNav } from '@/utils/nav';
import { Card } from '@/components/Card';
import { showToast } from '@/components/Toast';
import { yogaPoses, yogaCategoryLabels, getPoseVideoPath } from '@/data/yogaPoses';
import type { YogaPose, YogaCategory, WellnessGoal } from '@/types';
import { Flower2, Play, Pause, SkipForward, SkipBack, Check, CheckCircle2, X, Clock, Volume2, Sparkles, RotateCcw, Maximize2, AlertCircle } from 'lucide-react';

export function YogaPage() {
  const { profile, addYogaSession, yogaSessions } = useApp();
  const { navigate } = useNav();
  const [activeCategory, setActiveCategory] = useState<YogaCategory | 'recommended'>('recommended');
  const [sessionPoses, setSessionPoses] = useState<YogaPose[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completedPoses, setCompletedPoses] = useState<Set<number>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const recommendedIds = getRecommendedPoseIds(profile?.goals ?? []);
  const recommendedPoses = yogaPoses.filter((p) => recommendedIds.has(p.id));

  const categories: { value: YogaCategory | 'recommended'; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    ...Object.entries(yogaCategoryLabels).map(([value, label]) => ({ value: value as YogaCategory, label })),
  ];

  const filteredPoses =
    activeCategory === 'recommended'
      ? recommendedPoses
      : yogaPoses.filter((p) => p.categories.includes(activeCategory as YogaCategory));

  const startSession = (poses: YogaPose[]) => {
    if (poses.length === 0) {
      showToast('No poses in this category.', 'warning');
      return;
    }
    setSessionPoses(poses);
    setSessionIndex(0);
    setTimer(poses[0].durationSeconds);
    setSessionActive(true);
    setPaused(false);
    setCompletedPoses(new Set());
    setSessionComplete(false);
    setVideoError(false);
  };

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (sessionActive && !paused && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setCompletedPoses((prev) => new Set(prev).add(sessionIndex));
            if (sessionIndex < sessionPoses.length - 1) {
              const nextIdx = sessionIndex + 1;
              setSessionIndex(nextIdx);
              setVideoError(false);
              return sessionPoses[nextIdx].durationSeconds;
            } else {
              setSessionActive(false);
              setSessionComplete(true);
              return 0;
            }
          }
          return t - 1;
        });
      }, 1000);
      return () => stopInterval();
    }
  }, [sessionActive, paused, timer, sessionIndex, sessionPoses, stopInterval]);

  // Sync video play/pause with timer
  useEffect(() => {
    if (!sessionActive) return;
    if (paused) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play().catch(() => undefined);
    }
  }, [paused, sessionActive, sessionIndex]);

  const handleNext = () => {
    if (sessionIndex < sessionPoses.length - 1) {
      setCompletedPoses((prev) => new Set(prev).add(sessionIndex));
      const nextIdx = sessionIndex + 1;
      setSessionIndex(nextIdx);
      setTimer(sessionPoses[nextIdx].durationSeconds);
      setVideoError(false);
    }
  };

  const handlePrev = () => {
    if (sessionIndex > 0) {
      const prevIdx = sessionIndex - 1;
      setSessionIndex(prevIdx);
      setTimer(sessionPoses[prevIdx].durationSeconds);
      setVideoError(false);
    }
  };

  const handleRestart = () => {
    setTimer(sessionPoses[sessionIndex].durationSeconds);
    setPaused(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleComplete = async () => {
    setCompletedPoses((prev) => new Set(prev).add(sessionIndex));
    setSessionActive(false);
    setSessionComplete(true);
    const saved = await addYogaSession({
      date: new Date().toISOString().slice(0, 10),
      poses: sessionPoses.map((p) => p.id),
      durationMinutes: Math.round(sessionPoses.reduce((s, p) => s + p.durationSeconds, 0) / 60),
      completed: true,
    });
    if (saved) showToast('Yoga session completed! Great job.');
  };

  const handleExitSession = () => {
    stopInterval();
    setSessionActive(false);
    setSessionComplete(false);
    setSessionPoses([]);
    setTimer(0);
  };

  const handleDoneComplete = () => {
    setSessionComplete(false);
    setSessionPoses([]);
    setTimer(0);
  };

  // Session complete screen
  if (sessionComplete) {
    return (
      <div className="wellness-yoga-complete min-h-[calc(100vh-3.5rem)] md:min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center animate-scale">
          <CheckCircle2 size={52} strokeWidth={1.6} className="mx-auto mb-4 text-teal-600 dark:text-cyan-200" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">You completed {sessionPoses.length} poses. Great work on your wellness journey.</p>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(sessionPoses.reduce((s, p) => s + p.durationSeconds, 0) / 60)} min</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Total practice time</div>
          </div>
          <button onClick={handleDoneComplete} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
            Back to Yoga
          </button>
        </Card>
      </div>
    );
  }

  // Session screen with video player
  if (sessionActive && sessionPoses.length > 0) {
    const pose = sessionPoses[sessionIndex];
    const progress = ((pose.durationSeconds - timer) / pose.durationSeconds) * 100;
    const videoPath = getPoseVideoPath(pose.id);

    return (
      <div className="wellness-yoga-screen min-h-[calc(100vh-3.5rem)] md:min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Flower2 size={18} className="text-emerald-500" />
            Yoga Session
          </div>
          <button onClick={handleExitSession} className="p-2 text-gray-400 hover:text-rose-500 dark:text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="px-4 flex gap-1.5 mb-2">
          {sessionPoses.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${completedPoses.has(i) ? 'bg-emerald-500' : i === sessionIndex ? 'bg-emerald-300 dark:bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="px-4 text-xs text-gray-400 dark:text-slate-500 text-center mb-4">
          Pose {sessionIndex + 1} of {sessionPoses.length}
        </div>

        {/* Video + Pose card */}
        <div className="flex-1 flex items-center justify-center px-4 pb-6">
          <div className="w-full max-w-lg">
            {/* Video player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-4 shadow-soft">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={videoPath}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onError={() => setVideoError(true)}
                  onVolumeChange={(e) => setVolume((e.target as HTMLVideoElement).volume)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-600/20">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3 animate-breathe">
                    <Flower2 className="text-white" size={36} />
                  </div>
                  <p className="text-white/70 text-sm">Video coming soon</p>
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> Add {pose.id}.mp4 to /yoga-videos/</p>
                </div>
              )}
              {/* Timer overlay */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm font-bold tabular-nums">
                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </div>
            </div>

            {/* Pose info */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{pose.name}</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500">{pose.sanskrit}</p>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium capitalize mt-1">{pose.difficulty}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-4">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Instructions</div>
              <ol className="space-y-1.5">
                {pose.instructions.map((inst, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-slate-300 flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">{i + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Safety */}
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 mb-4">
              <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <span className="font-semibold">Safety: </span>{pose.safety}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button onClick={handlePrev} disabled={sessionIndex === 0} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <SkipBack size={20} />
              </button>
              <button onClick={() => setPaused(!paused)} className="w-16 h-16 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center shadow-glow">
                {paused ? <Play size={28} /> : <Pause size={28} />}
              </button>
              <button onClick={handleNext} disabled={sessionIndex === sessionPoses.length - 1} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={handleRestart} className="p-2 text-gray-400 dark:text-slate-500 hover:text-emerald-500 transition-colors" title="Restart pose">
                <RotateCcw size={18} />
              </button>
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-gray-400 dark:text-slate-500" />
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => handleVolume(Number(e.target.value))} className="w-20 accent-emerald-500" />
              </div>
              <button onClick={handleFullscreen} className="p-2 text-gray-400 dark:text-slate-500 hover:text-emerald-500 transition-colors" title="Fullscreen">
                <Maximize2 size={18} />
              </button>
            </div>

            <button onClick={handleComplete} className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
              <Check size={18} /> Complete Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main yoga page
  const totalYogaMin = yogaSessions.reduce((s, y) => s + y.durationMinutes, 0);

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Flower2 className="text-emerald-500" /> Yoga & Relaxation</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Move, breathe and relax at your own pace.</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.value ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Start session button */}
      {filteredPoses.length > 0 && (
        <Card className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2"><Sparkles size={18} /> {activeCategory === 'recommended' ? 'Your Recommended Routine' : yogaCategoryLabels[activeCategory as YogaCategory]}</div>
              <div className="text-sm opacity-90 mt-0.5">{filteredPoses.length} poses · ~{Math.round(filteredPoses.reduce((s, p) => s + p.durationSeconds, 0) / 60)} min</div>
            </div>
            <button onClick={() => startSession(filteredPoses)} className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2">
              <Play size={16} /> Start Session
            </button>
          </div>
        </Card>
      )}

      {/* Pose cards */}
      {filteredPoses.length === 0 ? (
        <Card className="p-5">
          <div className="text-center py-8">
            <Flower2 size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-slate-500">No poses in this category yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredPoses.map((pose) => (
            <Card key={pose.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{pose.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{pose.sanskrit}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium capitalize">{pose.difficulty}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-3">{pose.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {pose.benefits.map((b) => (
                  <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">{b}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                  <Clock size={14} /> {Math.round(pose.durationSeconds / 60)} min
                </div>
                <button onClick={() => startSession([pose])} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                  <Play size={14} /> Start
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Session history */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">Total: {totalYogaMin} min</span>
        </div>
        {yogaSessions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No yoga sessions yet. Start your first one above!</p>
        ) : (
          <div className="space-y-2">
            {[...yogaSessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Flower2 size={20} strokeWidth={1.8} className="text-teal-700 dark:text-cyan-200" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{s.poses.length} poses</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{s.date}</div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400">{s.durationMinutes} min</span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}

function getRecommendedPoseIds(goals: WellnessGoal[]): Set<string> {
  if (goals.length === 0) {
    return new Set(yogaPoses.filter((p) => p.categories.includes('beginner')).map((p) => p.id));
  }
  const map: Record<WellnessGoal, string[]> = {
    stress: ['balasana', 'anulom-vilom', 'shavasana', 'marjariasana'],
    flexibility: ['trikonasana', 'paschimottanasana', 'baddha-konasana', 'adho-mukha-svanasana', 'ardha-matsyendrasana'],
    fitness: ['tadasana', 'utkatasana', 'virabhadrasana-1', 'virabhadrasana-2', 'naukasana', 'phalakasana'],
    sleep: ['balasana', 'anulom-vilom', 'baddha-konasana', 'shavasana'],
    weight: ['tadasana', 'utkatasana', 'phalakasana', 'naukasana', 'virabhadrasana-2'],
    concentration: ['vrikshasana', 'vajrasana', 'anulom-vilom', 'tadasana'],
    general: ['tadasana',  'bhujangasana', 'balasana', 'shavasana'],
  };
  const ids = new Set<string>();
  goals.forEach((g) => map[g]?.forEach((id) => ids.add(id)));
  return ids;
}
