import React, { useEffect, useState } from 'react';
import { recorder } from '../services/recorder';
import { ViewState } from '../types';

interface Props {
  onSaveRequest: () => void;
  currentView: ViewState;
}

const StudioControls: React.FC<Props> = ({ onSaveRequest, currentView }) => {
  const [isRec, setIsRec] = useState(recorder.isRec);
  const [isPlay, setIsPlay] = useState(recorder.isPlay);
  const [hasTracks, setHasTracks] = useState(recorder.hasTracks);
  const [trackCount, setTrackCount] = useState(0);
  const [showTracksModal, setShowTracksModal] = useState(false);

  useEffect(() => {
    return recorder.subscribe(() => {
      setIsRec(recorder.isRec);
      setIsPlay(recorder.isPlay);
      setHasTracks(recorder.hasTracks);
      setTrackCount(recorder.currentTracks.length);
    });
  }, []);

  const toggleRecord = () => {
    if (isRec) {
      recorder.stopRecording();
    } else {
      recorder.startRecording();
    }
  };

  const togglePlay = () => {
    recorder.togglePlayback();
  };

  const handleDeleteTrack = (index: number) => {
      if (confirm('Удалить эту дорожку?')) {
          recorder.deleteTrack(index);
      }
  };

  if (currentView === ViewState.MENU || currentView === ViewState.LIBRARY) return null;

  return (
    <>
    {/* Floating Dock */}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="glass-panel rounded-3xl p-3 shadow-2xl shadow-black/50 border border-white/10 relative overflow-hidden">
        
        {/* Status Line */}
        {hasTracks && (
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        )}

        <div className="flex items-center justify-between gap-4 px-2">
           
           {/* Left: Tracks Info */}
           <div className="flex flex-col items-start gap-1 w-20">
              {hasTracks ? (
                <>
                  <button 
                    onClick={() => setShowTracksModal(true)}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    {trackCount} Дорож.
                  </button>
                  <button 
                    onClick={() => { if(confirm('Очистить все?')) recorder.clearSession(); }} 
                    className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Сброс
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Студия</span>
              )}
           </div>

           {/* Center: Main Controls */}
           <div className="flex items-center gap-4">
                {/* Play Button */}
                <button 
                    onClick={togglePlay}
                    disabled={isRec || !hasTracks}
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isPlay 
                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white border border-white/5'
                    }
                    ${(isRec || !hasTracks) ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                    `}
                >
                    {isPlay ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                        <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>

                {/* Record Button */}
                <button 
                    onClick={toggleRecord}
                    disabled={isPlay}
                    className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-[3px]
                        ${isRec 
                            ? 'bg-rose-600 border-rose-400 shadow-[0_0_30px_rgba(225,29,72,0.6)] scale-110' 
                            : 'bg-slate-800 border-slate-600 hover:border-slate-400 hover:bg-slate-700'
                        }
                        ${isPlay ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                >
                    <div className={`transition-all duration-300 ${isRec ? 'w-6 h-6 rounded-sm bg-white' : 'w-6 h-6 rounded-full bg-rose-500'}`} />
                </button>
           </div>

           {/* Right: Save */}
           <div className="w-20 flex justify-end">
                <button 
                    onClick={onSaveRequest}
                    disabled={!hasTracks || isRec || isPlay}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-indigo-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 transition-all
                        ${(!hasTracks || isRec || isPlay) ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                </button>
           </div>

        </div>
      </div>
    </div>

    {/* Tracks Manager Modal */}
    {showTracksModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col border border-white/10">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white text-lg">Слои и Дорожки</h3>
                    <button onClick={() => setShowTracksModal(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 flex flex-col gap-3">
                    {recorder.currentTracks.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Нет записанных дорожек</p>
                    ) : (
                        recorder.currentTracks.map((track, idx) => (
                            <div key={idx} className="bg-slate-900/60 rounded-xl p-3 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 text-sm flex items-center justify-center font-bold border border-white/5">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <div className="text-white font-bold text-sm">{track.name}</div>
                                        <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                            {track.events.length} событий
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteTrack(idx)}
                                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-3xl">
                    <button 
                        onClick={() => setShowTracksModal(false)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                        Готово
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default StudioControls;