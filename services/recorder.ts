
import { NoteEvent, Song, Track } from '../types';
import { audioEngine } from './audioEngine';

class RecorderService {
  private isRecording = false;
  private isPlaying = false;
  private startTime = 0;
  private currentTrackEvents: NoteEvent[] = [];
  private tracks: Track[] = [];
  
  // In-memory cache of saved songs
  private savedSongs: Song[] = [];
  
  // Quick listeners for UI updates
  private listeners: (() => void)[] = [];

  constructor() {
    // Initialization is now explicit via init() called from App.tsx
  }

  public async init() {
      // Try to load from VK Storage first
      if (window.vkBridge) {
          try {
              const data = await window.vkBridge.send('VKWebAppStorageGet', { keys: ['vk_music_songs'] });
              const value = data.keys.find((k: any) => k.key === 'vk_music_songs')?.value;
              if (value) {
                  this.savedSongs = JSON.parse(value);
                  this.notify();
                  return; 
              }
          } catch (e) {
              console.error("VK Storage Init Error (Songs):", e);
          }
      }

      // Fallback to localStorage if VK Storage failed or is empty (and we are in dev/offline)
      try {
          const existing = localStorage.getItem('vk_music_songs');
          if (existing) {
              this.savedSongs = JSON.parse(existing);
              this.notify();
          }
      } catch (e) {
          console.error("Local Storage Init Error:", e);
      }
  }

  private syncStorage() {
      const json = JSON.stringify(this.savedSongs);
      
      // Sync to VK Cloud
      if (window.vkBridge) {
          window.vkBridge.send('VKWebAppStorageSet', {
              key: 'vk_music_songs',
              value: json
          }).catch((e: any) => console.error("Failed to sync songs to VK", e));
      }

      // Sync to LocalStorage (backup/dev)
      try {
        localStorage.setItem('vk_music_songs', json);
      } catch (e) {}
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
    
    this.savedSongs.push(song);
    this.syncStorage();
    this.notify();
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

    this.savedSongs.push(newSong);
    this.syncStorage();
    this.notify();
    return newSong;
  }

  public getSavedSongs(): Song[] {
    return this.savedSongs;
  }

  public deleteSong(id: string) {
    this.savedSongs = this.savedSongs.filter(s => s.id !== id);
    this.syncStorage();
    this.notify();
  }

  public loadSong(song: Song) {
      this.clearSession();
      try {
          this.tracks = JSON.parse(JSON.stringify(song.tracks)); // Deep copy
      } catch(e) {
          console.error("Failed to load song tracks", e);
          this.tracks = [];
      }
      this.notify();
  }
}

export const recorder = new RecorderService();
