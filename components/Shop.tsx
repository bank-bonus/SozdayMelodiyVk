
import React from 'react';
import { INSTRUMENTS_CATALOG } from '../constants';
import { ViewState } from '../types';

interface Props {
    unlockedItems: string[];
    onSelect: (id: ViewState) => void;
    onUnlock: (key: string, name: string) => void;
    onBack: () => void;
}

const Shop: React.FC<Props> = ({ unlockedItems, onSelect, onUnlock, onBack }) => {
    return (
        <div className="w-full max-w-2xl px-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <h2 className="text-3xl font-black text-white tracking-tight text-center flex-1 pr-10">
                    Магазин <span className="text-indigo-400">Инструментов</span>
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-24">
                {INSTRUMENTS_CATALOG.map(inst => {
                    const isLocked = inst.isPremium && !unlockedItems.includes(inst.key || '');
                    
                    return (
                        <button
                            key={inst.id}
                            onClick={() => isLocked ? onUnlock(inst.key!, inst.name) : onSelect(inst.id)}
                            className={`group relative aspect-[4/5] rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between p-4 ${isLocked ? 'grayscale-[0.3]' : 'shadow-xl'}`}
                            style={{ boxShadow: isLocked ? 'none' : `0 10px 30px -10px ${inst.shadow}` }}
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${inst.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                            
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

                            {/* Lock Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center backdrop-blur-[2px] transition-backdrop-filter duration-300 group-hover:backdrop-blur-none">
                                    <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center mb-2 animate-bounce">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-lg flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
                                        Смотреть
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="relative z-0">
                                <div className="text-4xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{inst.icon}</div>
                            </div>

                            <div className="relative z-0 text-left">
                                <h3 className="text-xl font-black text-white leading-none drop-shadow-md">{inst.name}</h3>
                                <p className="text-[10px] text-white/80 font-medium mt-1 uppercase tracking-wide opacity-90 line-clamp-1">{inst.description}</p>
                            </div>
                            
                            {/* Unlock Icon for Open items */}
                            {!isLocked && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center border border-white/20">
                                     <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Shop;
