export enum ViewState {
  MENU = 'MENU',
  DRUMS = 'DRUMS',
  SYNTH = 'SYNTH',
  GUITAR = 'GUITAR',
  BASS = 'BASS',
  VIOLIN = 'VIOLIN',
  CELLO = 'CELLO',
  UKULELE = 'UKULELE',
  FLUTE = 'FLUTE',
  SAXOPHONE = 'SAXOPHONE',
  EIGHT_BIT = 'EIGHT_BIT',
  LIBRARY = 'LIBRARY'
}

export enum SoundType {
  KICK = 'KICK',
  SNARE = 'SNARE',
  HIHAT_CLOSED = 'HIHAT_CLOSED',
  HIHAT_OPEN = 'HIHAT_OPEN',
  TOM_LOW = 'TOM_LOW',
  TOM_MID = 'TOM_MID',
  CLAP = 'CLAP',
  CRASH = 'CRASH',
  RIDE = 'RIDE'
}

export type InstrumentPreset = 'piano' | 'pad' | '8bit' | 'sax' | 'sine' | 'square' | 'sawtooth' | 'triangle' | 'violin' | 'flute' | 'cello' | 'ukulele';

export interface DrumPadConfig {
  id: SoundType;
  label: string;
  color: string;
  keyTrigger: string;
}

export interface StringConfig {
  note: string; // Base note (Open string)
  label: string;
}

export interface NoteEvent {
  timestamp: number;
  type: 'note' | 'drum';
  instrument: string; // 'piano', 'kick', 'guitar', 'sax', etc.
  note: string; // 'C4', 'KICK', etc.
  duration?: number;
}

export interface Track {
  id: string;
  name: string;
  events: NoteEvent[];
  isMuted?: boolean;
}

export interface Song {
  id: string;
  title: string;
  date: number;
  tracks: Track[];
}

export interface SongIdea {
  title: string;
  genre: string;
  chords: string[];
  lyrics: string;
}

declare global {
  interface Window {
    vkBridge: any;
  }
}