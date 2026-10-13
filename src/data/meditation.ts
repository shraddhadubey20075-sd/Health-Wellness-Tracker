import type { MeditationTrack } from '@/types';

export const meditationTracks: MeditationTrack[] = [
  {
    id: 'meditation-ambient',
    name: 'Meditation Ambient',
    description: 'A calming ambient meditation for quiet relaxation.',
    durationMinutes: 5,
    icon: 'flower',
    color: '#10b981',
    audioPath: `${import.meta.env.BASE_URL}meditation/forest.mp3`,
  },
  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    description: 'A peaceful meditation to support steady, coherent breathing.',
    durationMinutes: 5,
    icon: 'waves',
    color: '#06b6d4',
    audioPath: `${import.meta.env.BASE_URL}meditation/rain.mp3`,
  },
  {
    id: 'om',
    name: 'OM',
    description: 'A focused meditation with the resonant sound of Om.',
    durationMinutes: 5,
    icon: 'circle',
    color: '#f59e0b',
    audioPath: `${import.meta.env.BASE_URL}meditation/om.mp3`,
  },
];
