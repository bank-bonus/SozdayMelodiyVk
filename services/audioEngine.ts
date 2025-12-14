import { SoundType, InstrumentPreset, NoteEvent } from '../types';
import { NOTE_FREQUENCIES } from '../constants';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private scheduledNodes: AudioScheduledSourceNode[] = [];

  constructor() {
    // Lazy initialization handled in init()
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public stopAll() {
    this.scheduledNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    this.scheduledNodes = [];
  }

  // --- Playback Scheduler ---

  public scheduleEvent(event: NoteEvent, startTime: number) {
    this.init();
    if (!this.ctx) return;
    
    const playTime = startTime + event.timestamp;
    
    // Safety check: don't play events too far in the past
    if (playTime < this.ctx.currentTime - 0.1) return;

    if (event.type === 'drum') {
      this.playDrum(event.note as SoundType, playTime);
    } else if (event.type === 'note') {
      if (event.instrument === 'guitar') {
        this.playGuitarString(event.note, playTime);
      } else if (event.instrument === 'bass') {
        this.playBassString(event.note, playTime);
      } else if (event.instrument === 'violin') {
        this.playViolinString(event.note, playTime);
      } else if (event.instrument === 'cello') {
        this.playCelloString(event.note, playTime);
      } else if (event.instrument === 'ukulele') {
        this.playUkuleleString(event.note, playTime);
      } else {
        this.playPreset(event.instrument as InstrumentPreset, event.note, playTime);
      }
    }
  }

  // --- Drum Synthesis ---

  public playDrum(type: SoundType, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = time || this.ctx.currentTime;
    
    switch (type) {
      case SoundType.KICK: this.playKick(t); break;
      case SoundType.SNARE: this.playSnare(t); break;
      case SoundType.HIHAT_CLOSED: this.playHiHat(t, 0.05); break;
      case SoundType.HIHAT_OPEN: this.playHiHat(t, 0.4); break;
      case SoundType.TOM_LOW: this.playTom(t, 100); break;
      case SoundType.TOM_MID: this.playTom(t, 150); break;
      case SoundType.CLAP: this.playClap(t); break;
      case SoundType.CRASH: this.playCymbal(t, 1.5); break;
      case SoundType.RIDE: this.playCymbal(t, 1.0); break;
    }
  }

  private playKick(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.5);
    this.scheduledNodes.push(osc);
  }

  private playSnare(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.2);
    osc.stop(t + 0.2);
    this.scheduledNodes.push(noise, osc);
  }

  private playHiHat(t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(t);
    source.stop(t + duration);
    this.scheduledNodes.push(source);
  }

  private playTom(t: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.4);
    
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
    this.scheduledNodes.push(osc);
  }

  private playClap(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 1;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(t);
    source.stop(t + 0.2);
    this.scheduledNodes.push(source);
  }

  private playCymbal(t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fund = 40;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    gain.connect(this.masterGain);

    ratios.forEach(ratio => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = fund * ratio;
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + duration);
        this.scheduledNodes.push(osc);
    });

    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    noise.connect(filter);
    filter.connect(gain);
    noise.start(t);
    noise.stop(t + duration);
    this.scheduledNodes.push(noise);
  }

  // --- Melodic Synthesis ---

  public playPreset(preset: InstrumentPreset, note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;

    switch(preset) {
      case 'pad':
        this.playPad(freq, t);
        break;
      case '8bit':
        this.play8Bit(freq, t);
        break;
      case 'sax':
        this.playSax(freq, t);
        break;
      case 'violin':
        this.playViolinString(note, t);
        break;
      case 'cello':
        this.playCelloString(note, t);
        break;
      case 'ukulele':
        this.playUkuleleString(note, t);
        break;
      case 'flute':
        this.playFlute(freq, t);
        break;
      case 'piano':
      case 'sine':
      case 'square':
      case 'sawtooth':
      case 'triangle':
      default:
        this.playSimpleWave(freq, t, (['sine','square','sawtooth','triangle'].includes(preset) ? preset : 'sine') as OscillatorType);
        break;
    }
  }

  private playSimpleWave(freq: number, t: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Piano-ish envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.2);
    this.scheduledNodes.push(osc);
  }

  private playPad(freq: number, t: number) {
    if (!this.ctx || !this.masterGain) return;
    // Layered Detuned Sawtooths for breadth
    [0, 5, -5].forEach(detune => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.linearRampToValueAtTime(2000, t + 1.0); // Filter sweep

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 1.0); // Slow attack
        gain.gain.linearRampToValueAtTime(0, t + 2.5);   // Slow release

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 2.5);
        this.scheduledNodes.push(osc);
    });
  }

  private play8Bit(freq: number, t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    // Very fast snappy envelope
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
    this.scheduledNodes.push(osc);
  }

  private playSax(freq: number, t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth'; // Sax is complex, but filtered saw approximates reeds
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.Q.value = 4; // Resonance
    filter.frequency.setValueAtTime(freq * 2, t);
    filter.frequency.linearRampToValueAtTime(freq * 4, t + 0.2); // Swell

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.05);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);

    // Vibrato
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 5; // 5Hz vibrato
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.8);
    this.scheduledNodes.push(osc, lfo);
  }

  private playFlute(freq: number, t: number) {
    if (!this.ctx || !this.masterGain) return;
    // Flute: Sine wave + Breath noise
    
    // Tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 1.0);

    // Breath (Noise)
    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = freq * 1.5; // Breath around the tone
    noiseFilter.Q.value = 1;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.02); // Short burst of breath
    noiseGain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.0);
    noise.start(t);
    noise.stop(t + 0.3);
    
    this.scheduledNodes.push(osc, noise);
  }

  public playNote(note: string, waveType: string) {
      this.playPreset(waveType as InstrumentPreset, note);
  }

  public playGuitarString(note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;
    
    // Guitarish: Sawtooth with Lowpass Filter envelope
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.3); // "Pluck" sound

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Longer decay

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.5);
    this.scheduledNodes.push(osc);
  }

  public playBassString(note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;
    
    // Bass: Mixed Sawtooth/Triangle + Sub
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle'; // Thicker
    osc.frequency.value = freq;

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = freq / 2; // Sub bass

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    osc.connect(filter);
    subOsc.connect(filter); // Route both through filter
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.0);
    subOsc.stop(t + 1.0);
    this.scheduledNodes.push(osc, subOsc);
  }

  public playViolinString(note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;

    // Violin: Sawtooth with vibrato and bandpass to simulate body resonance
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Vibrato
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    // Slow attack (bowing)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.1); 
    gain.gain.linearRampToValueAtTime(0, t + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 1.5);
    lfo.stop(t + 1.5);
    this.scheduledNodes.push(osc, lfo);
  }

  public playCelloString(note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;

    // Cello: Deeper Sawtooth, slower attack
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Mellow
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.2); // Slower attack
    gain.gain.linearRampToValueAtTime(0, t + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.0);
    this.scheduledNodes.push(osc);
  }

  public playUkuleleString(note: string, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const t = time || this.ctx.currentTime;
    
    // Ukulele: Sine/Triangle mix, nylon string sound, quick decay
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8); // Short decay

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.8);
    this.scheduledNodes.push(osc);
  }

  // --- Utils ---

  private createNoiseBuffer(): AudioBuffer {
     if (!this.ctx) throw new Error("No Audio Context");
     const bufferSize = this.ctx.sampleRate * 2;
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
         data[i] = Math.random() * 2 - 1;
     }
     return buffer;
  }
}

export const audioEngine = new AudioEngine();