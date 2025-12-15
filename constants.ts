
import { DrumPadConfig, SoundType, ViewState } from './types';

export const DRUM_PADS: DrumPadConfig[] = [
  { id: SoundType.CRASH, label: 'Крэш', color: 'bg-yellow-500', keyTrigger: 'Q' },
  { id: SoundType.HIHAT_OPEN, label: 'Хет Откр.', color: 'bg-yellow-600', keyTrigger: 'W' },
  { id: SoundType.RIDE, label: 'Райд', color: 'bg-yellow-700', keyTrigger: 'E' },
  { id: SoundType.TOM_MID, label: 'Том Ср.', color: 'bg-blue-500', keyTrigger: 'A' },
  { id: SoundType.TOM_LOW, label: 'Том Низ.', color: 'bg-blue-600', keyTrigger: 'S' },
  { id: SoundType.HIHAT_CLOSED, label: 'Хет Закр.', color: 'bg-yellow-400', keyTrigger: 'D' },
  { id: SoundType.KICK, label: 'Бочка', color: 'bg-red-600', keyTrigger: 'Z' },
  { id: SoundType.SNARE, label: 'Снэр', color: 'bg-orange-500', keyTrigger: 'X' },
  { id: SoundType.CLAP, label: 'Хлопок', color: 'bg-pink-500', keyTrigger: 'C' },
];

export const PIANO_KEYS = [
  { note: 'C4', type: 'white', label: 'C' },
  { note: 'C#4', type: 'black', label: '' },
  { note: 'D4', type: 'white', label: 'D' },
  { note: 'D#4', type: 'black', label: '' },
  { note: 'E4', type: 'white', label: 'E' },
  { note: 'F4', type: 'white', label: 'F' },
  { note: 'F#4', type: 'black', label: '' },
  { note: 'G4', type: 'white', label: 'G' },
  { note: 'G#4', type: 'black', label: '' },
  { note: 'A4', type: 'white', label: 'A' },
  { note: 'A#4', type: 'black', label: '' },
  { note: 'B4', type: 'white', label: 'B' },
  { note: 'C5', type: 'white', label: 'C' },
];

// Expanded frequency map covering Bass (E1) to Guitar High E (E5+)
export const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 1 (Bass)
  'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  // Octave 2 (Bass/Guitar/Cello)
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  // Octave 3 (Guitar/Cello)
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4 (Guitar/Piano/Ukulele)
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  // Octave 5 (High range/Violin)
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
  // Octave 5-6 (Violin extension)
  'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

export const GUITAR_TUNING = [
  { note: 'E4', label: 'E (Выс)' },
  { note: 'B3', label: 'B' },
  { note: 'G3', label: 'G' },
  { note: 'D3', label: 'D' },
  { note: 'A2', label: 'A' },
  { note: 'E2', label: 'E (Низ)' }
];

export const BASS_TUNING = [
  { note: 'G2', label: 'G' },
  { note: 'D2', label: 'D' },
  { note: 'A1', label: 'A' },
  { note: 'E1', label: 'E' }
];

export const VIOLIN_TUNING = [
  { note: 'E5', label: 'E' },
  { note: 'A4', label: 'A' },
  { note: 'D4', label: 'D' },
  { note: 'G3', label: 'G' }
];

export const CELLO_TUNING = [
  { note: 'A3', label: 'A' },
  { note: 'D3', label: 'D' },
  { note: 'G2', label: 'G' },
  { note: 'C2', label: 'C' }
];

export const UKULELE_TUNING = [
  { note: 'A4', label: 'A' },
  { note: 'E4', label: 'E' },
  { note: 'C4', label: 'C' },
  { note: 'G4', label: 'G' }
];

// New Instrument Tunings (Mocking as Strings or using for Synthesis reference)
export const HARP_TUNING = [
  { note: 'E5', label: 'E' },
  { note: 'C5', label: 'C' },
  { note: 'A4', label: 'A' },
  { note: 'F4', label: 'F' },
  { note: 'D4', label: 'D' }
];

export const PREMIUM_INSTRUMENTS = [
  { id: ViewState.VIOLIN, icon: '🎻', name: 'Скрипка', price: 3, key: 'violin', color: 'from-yellow-600 to-amber-700', shadow: 'rgba(234,179,8,0.6)' },
  { id: ViewState.CELLO, icon: '🎻', name: 'Виолончель', price: 3, key: 'cello', color: 'from-amber-800 to-orange-900', shadow: 'rgba(234,88,12,0.6)' },
  { id: ViewState.FLUTE, icon: '🎼', name: 'Флейта', price: 2, key: 'flute', color: 'from-teal-500 to-emerald-600', shadow: 'rgba(20,184,166,0.6)' },
  { id: ViewState.SAXOPHONE, icon: '🎷', name: 'Саксофон', price: 3, key: 'sax', color: 'from-amber-400 to-yellow-500', shadow: 'rgba(250,204,21,0.6)' },
  { id: ViewState.UKULELE, icon: '🥥', name: 'Укулеле', price: 2, key: 'ukulele', color: 'from-lime-500 to-green-600', shadow: 'rgba(132,204,22,0.6)' },
  { id: ViewState.EIGHT_BIT, icon: '👾', name: '8-Bit', price: 5, key: '8bit', color: 'from-pink-500 to-rose-500', shadow: 'rgba(244,63,94,0.6)' },
  { id: ViewState.HARP, icon: '🧚‍♀️', name: 'Арфа', price: 5, key: 'harp', color: 'from-cyan-400 to-blue-500', shadow: 'rgba(6,182,212,0.6)' },
  { id: ViewState.MARIMBA, icon: '🪵', name: 'Маримба', price: 3, key: 'marimba', color: 'from-orange-500 to-red-500', shadow: 'rgba(249,115,22,0.6)' },
  { id: ViewState.KALIMBA, icon: '🥘', name: 'Калимба', price: 2, key: 'kalimba', color: 'from-indigo-400 to-violet-500', shadow: 'rgba(129,140,248,0.6)' },
];

// Helper to calculate next semitone
const NOTES_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getNextNote = (note: string, semitones: number): string => {
  if (semitones === 0) return note;
  
  const pitch = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));
  
  let idx = NOTES_ORDER.indexOf(pitch);
  let newIdx = idx + semitones;
  let newOctave = octave + Math.floor(newIdx / 12);
  
  newIdx = newIdx % 12;
  return NOTES_ORDER[newIdx] + newOctave;
};
