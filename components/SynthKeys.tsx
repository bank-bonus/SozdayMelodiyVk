import React, { useState, useEffect } from 'react';
import { PIANO_KEYS } from '../constants';
import { audioEngine } from '../services/audioEngine';
import { InstrumentPreset } from '../types';
import { recorder } from '../services/recorder';

interface Props {
    title?: string;
    forcedPreset?: InstrumentPreset;
    hidePresets?: boolean;
}

const SynthKeys: React.FC<Props> = ({ title = "СИНТЕЗАТОР", forcedPreset, hidePresets = false }) => {
  const [preset, setPreset] = useState<InstrumentPreset>(forcedPreset || 'piano');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
      if (forcedPreset) setPreset(forcedPreset);
  }, [forcedPreset]);

  const playNote = (note: string) => {
    audioEngine.playPreset(preset, note);
    recorder.logEvent(preset, note, 'note');
    setActiveKey(note);
    setTimeout(() => setActiveKey(null), 150);
  };

  const presets: {id: InstrumentPreset, label: string}[] = [
      { id: 'piano', label: 'Пианино' },
      { id: 'pad', label: 'Пад' },
      { id: '8bit', label: '8-Бит' },
      { id: 'sax', label: 'Саксофон' }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight uppercase">
        {title}
      </h2>
      
      {/* Preset Selector */}
      {!hidePresets && (
        <div className="flex gap-2 mb-10 glass-panel p-2 rounded-xl overflow-x-auto max-w-full">
            {presets.map((p) => (
            <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                preset === p.id 
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                {p.label}
            </button>
            ))}
        </div>
      )}

      {/* Keyboard */}
      <div className="relative flex justify-center select-none h-52 sm:h-72 w-full max-w-3xl overflow-hidden rounded-b-xl shadow-2xl shadow-black/50 bg-black/20 p-1 rounded-xl">
        {PIANO_KEYS.map((key) => {
          const isBlack = key.type === 'black';
          const isActive = activeKey === key.note;
          
          if (isBlack) {
              return (
                <div
                    key={key.note}
                    onMouseDown={() => playNote(key.note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }}
                    className={`
                        relative w-10 sm:w-12 h-32 sm:h-44 -mx-5 sm:-mx-6 z-20 rounded-b-lg cursor-pointer transition-all border-x border-b border-black/50
                        ${isActive 
                            ? 'bg-indigo-900 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-y-[0.98]' 
                            : 'bg-gradient-to-b from-slate-800 to-black shadow-lg'
                        }
                    `}
                >
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/10" />
                </div>
              );
          } else {
              return (
                <div
                    key={key.note}
                    onMouseDown={() => playNote(key.note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }}
                    className={`
                        relative flex-1 h-full rounded-b-md cursor-pointer transition-all border-l border-r border-b border-slate-300/10
                        ${isActive 
                            ? 'bg-indigo-100 scale-y-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.4)_inset]' 
                            : 'bg-gradient-to-b from-slate-100 to-slate-300 hover:to-slate-200'
                        }
                    `}
                >
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 font-bold text-xs sm:text-sm pointer-events-none">
                        {key.label}
                    </div>
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};

export default SynthKeys;