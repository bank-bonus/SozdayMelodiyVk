import React, { useCallback, useEffect, useState } from 'react';
import { DRUM_PADS } from '../constants';
import { audioEngine } from '../services/audioEngine';
import { SoundType } from '../types';
import { recorder } from '../services/recorder';

const DrumPad: React.FC = () => {
  const [activePad, setActivePad] = useState<SoundType | null>(null);

  const playSound = useCallback((padId: SoundType) => {
    audioEngine.playDrum(padId);
    recorder.logEvent('drums', padId, 'drum');
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 100);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const pad = DRUM_PADS.find(p => p.keyTrigger === e.key.toUpperCase());
    if (pad) {
      playSound(pad.id);
    }
  }, [playSound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getGradient = (colorClass: string) => {
      // Map basic tailwind classes to nicer gradients
      if (colorClass.includes('yellow')) return 'from-amber-400 to-orange-500 shadow-orange-500/40';
      if (colorClass.includes('blue')) return 'from-cyan-400 to-blue-600 shadow-blue-500/40';
      if (colorClass.includes('red')) return 'from-rose-500 to-red-600 shadow-red-500/40';
      if (colorClass.includes('orange')) return 'from-orange-400 to-red-500 shadow-orange-500/40';
      if (colorClass.includes('pink')) return 'from-fuchsia-400 to-pink-600 shadow-pink-500/40';
      return 'from-slate-400 to-slate-600';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-8 tracking-tight drop-shadow-sm">
        БАРАБАНЫ
      </h2>
      <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg">
        {DRUM_PADS.map((pad) => {
          const isActive = activePad === pad.id;
          const gradient = getGradient(pad.color);
          
          return (
            <button
              key={pad.id}
              onClick={() => playSound(pad.id)}
              className={`
                relative aspect-square w-full rounded-2xl flex flex-col items-center justify-center
                transition-all duration-100 border-t border-white/20
                bg-gradient-to-br ${gradient}
                ${isActive 
                    ? 'transform scale-95 brightness-125 shadow-[0_0_30px_inset_rgba(255,255,255,0.3)]' 
                    : 'hover:-translate-y-1 hover:brightness-110 shadow-lg'
                }
              `}
            >
              <div className="absolute inset-0 bg-black/10 rounded-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                  <span className="text-white font-black text-xl sm:text-2xl drop-shadow-md tracking-wide uppercase">{pad.label}</span>
                  <span className="text-white/60 font-mono text-sm mt-1 border border-white/20 rounded px-1.5 bg-black/20">{pad.keyTrigger}</span>
              </div>
              
              {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-white/40 animate-ping duration-75" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-8 px-6 py-2 glass-panel rounded-full text-slate-400 text-sm font-medium">
         Клавиши: Q W E A S D Z X C
      </div>
    </div>
  );
};

export default DrumPad;