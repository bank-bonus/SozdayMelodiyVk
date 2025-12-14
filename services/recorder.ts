import { NoteEvent, Song, Track } from '../types';
import { audioEngine } from './audioEngine';

class RecorderService {
  private isRecording = false;
  private isPlaying = false;
  private startTime = 0;
  private currentTrackEvents: NoteEvent[] = [];
  private tracks: Track[] = [];
  
  // Quick listeners for UI updates
  private listeners: (() => void)[] = [];

  constructor() {
    // Load from local storage if needed, but for now we start fresh
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public get isRec() { return this.isRecording; }
  public get isPlay() { return this.isPlaying; }
  public get hasTracks() { return this.tracks.length > 0; }
  public get currentTracks() { return this.tracks; }

  public startRecording() {
    const ctx = audioEngine.getContext();
    if (!ctx) audioEngine.init();
    
    this.isRecording = true;
    this.startTime = audioEngine.getContext()?.currentTime || 0;
    this.currentTrackEvents = [];
    
    // If we have existing tracks, play them as backing
    if (this.tracks.length > 0) {
      this.playTracks(this.tracks, this.startTime);
    }
    
    this.notify();
  }

  public stopRecording() {
    this.isRecording = false;
    audioEngine.stopAll();
    
    if (this.currentTrackEvents.length > 0) {
      const newTrack: Track = {
        id: Date.now().toString(),
        name: `Дорожка ${this.tracks.length + 1}`,
        events: [...this.currentTrackEvents]
      };
      this.tracks.push(newTrack);
    }
    
    this.notify();
  }

  public togglePlayback() {
    if (this.isPlaying) {
      this.isPlaying = false;
      audioEngine.stopAll();
    } else {
      const ctx = audioEngine.getContext();
      if (!ctx) audioEngine.init();
      const now = audioEngine.getContext()?.currentTime || 0;
      this.isPlaying = true;
      this.playTracks(this.tracks, now);
      
      // Optional: Auto stop logic could be added here based on duration
    }
    this.notify();
  }

  private playTracks(tracks: Track[], startTime: number) {
    tracks.forEach(track => {
      if (!track.isMuted) {
        track.events.forEach(event => {
          audioEngine.scheduleEvent(event, startTime);
        });
      }
    });
  }

  public previewSong(song: Song) {
    this.isPlaying = false; // Ensure main playback state is off
    audioEngine.stopAll();
    
    const ctx = audioEngine.getContext();
    if (!ctx) audioEngine.init();
    const now = audioEngine.getContext()?.currentTime || 0;
    
    // Just play the sounds without changing recorder state
    this.playTracks(song.tracks, now);
  }

  public stopPreview() {
    audioEngine.stopAll();
  }

  public logEvent(instrument: string, note: string, type: 'note' | 'drum') {
    if (!this.isRecording) return;
    
    const ctx = audioEngine.getContext();
    const now = ctx?.currentTime || 0;
    const timestamp = now - this.startTime;

    this.currentTrackEvents.push({
      timestamp,
      instrument,
      note,
      type
    });
  }

  public clearSession() {
    this.tracks = [];
    this.currentTrackEvents = [];
    this.isRecording = false;
    this.isPlaying = false;
    audioEngine.stopAll();
    this.notify();
  }

  public deleteTrack(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      this.tracks.splice(index, 1);
      this.notify();
    }
  }

  public saveSong(title: string) {
    const song: Song = {
      id: Date.now().toString(),
      title,
      date: Date.now(),
      tracks: this.tracks
    };
    
    const existing = localStorage.getItem('vk_music_songs');
    const songs: Song[] = existing ? JSON.parse(existing) : [];
    songs.push(song);
    localStorage.setItem('vk_music_songs', JSON.stringify(songs));
    return song;
  }

  public mergeSongs(songsToMerge: Song[], newTitle: string) {
    const allTracks: Track[] = [];
    songsToMerge.forEach(song => {
      song.tracks.forEach(track => {
         // Create deep copy to avoid reference issues
         allTracks.push({
             ...track,
             id: Math.random().toString(36).substr(2, 9),
             name: `${song.title} - ${track.name}`
         });
      });
    });

    const newSong: Song = {
        id: Date.now().toString(),
        title: newTitle,
        date: Date.now(),
        tracks: allTracks
    };

    const existing = this.getSavedSongs();
    existing.push(newSong);
    localStorage.setItem('vk_music_songs', JSON.stringify(existing));
    return newSong;
  }

  public getSavedSongs(): Song[] {
    const existing = localStorage.getItem('vk_music_songs');
    return existing ? JSON.parse(existing) : [];
  }

  public deleteSong(id: string) {
    const existing = localStorage.getItem('vk_music_songs');
    if (!existing) return;
    const songs: Song[] = JSON.parse(existing);
    const newSongs = songs.filter(s => s.id !== id);
    localStorage.setItem('vk_music_songs', JSON.stringify(newSongs));
    this.notify();
  }

  public loadSong(song: Song) {
      this.clearSession();
      this.tracks = JSON.parse(JSON.stringify(song.tracks)); // Deep copy
      this.notify();
  }
}

export const recorder = new RecorderService();