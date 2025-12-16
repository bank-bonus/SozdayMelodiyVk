
import React, { useEffect, useState } from 'react';
import { recorder } from '../services/recorder';
import { Song } from '../types';

interface Props {
  onLoad: () => void;
}

interface ConfirmAction {
    type: 'load' | 'delete' | 'merge';
    song?: Song;
    ids?: string[];
}

const Library: React.FC<Props> = ({ onLoad }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const refreshSongs = () => {
    setSongs([...recorder.getSavedSongs()]); // Spread to ensure new ref triggers render
  };

  useEffect(() => {
    refreshSongs();
    // Subscribe to recorder updates (e.g. when storage loads)
    const unsubscribe = recorder.subscribe(refreshSongs);
    return () => unsubscribe();
  }, []);

  const handleLoadRequest = (song: Song) => {
    if (isSelectionMode) {
        toggleSelection(song.id);
        return;
    }
    setConfirmAction({ type: 'load', song });
  };

  const confirmLoad = () => {
      if (confirmAction?.song) {
        recorder.loadSong(confirmAction.song);
        onLoad();
      }
      setConfirmAction(null);
  };

  const toggleSelection = (id: string) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const handleDeleteRequest = (e: React.MouseEvent, song: Song) => {
      e.stopPropagation();
      setConfirmAction({ type: 'delete', song });
  };

  const confirmDelete = () => {
      if (confirmAction?.song) {
          recorder.deleteSong(confirmAction.song.id);
          // refreshSongs called via subscription in recorder
      }
      setConfirmAction(null);
  };

  const handlePreview = (e: React.MouseEvent, song: Song) => {
      e.stopPropagation();
      if (previewId === song.id) {
          recorder.stopPreview();
          setPreviewId(null);
      } else {
          recorder.stopPreview();
          recorder.previewSong(song);
          setPreviewId(song.id);
          setTimeout(() => {
              if (previewId === song.id) setPreviewId(null);
          }, 30000);
      }
  };

  const handleMergeRequest = () => {
      const songsToMerge = songs.filter(s => selectedIds.includes(s.id));
      if (songsToMerge.length < 2) return;
      setConfirmAction({ type: 'merge', ids: selectedIds });
  };

  const confirmMerge = (title: string) => {
      const songsToMerge = songs.filter(s => selectedIds.includes(s.id));
      if (songsToMerge.length > 0 && title) {
          recorder.mergeSongs(songsToMerge, title);
          // refreshSongs called via subscription
          setSelectedIds([]);
          setIsSelectionMode(false);
      }
      setConfirmAction(null);
  }

  return (
    <div className="w-full max-w-lg p-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="text-4xl">📂</span> Библиотека
        </h2>
        {songs.length > 1 && (
            <button 
                onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                }}
                className={`text-sm font-bold px-4 py-2 rounded-full border transition-all ${isSelectionMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'glass-panel border-white/10 text-slate-300 hover:bg-white/10'}`}
            >
                {isSelectionMode ? 'Отмена' : 'Выбрать'}
            </button>
        )}
      </div>

      {/* Instructions */}
      {!isSelectionMode && songs.length > 0 && (
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-400">
              <p>💡 <b>Совет:</b> Чтобы добавить новую дорожку к сохраненному треку, нажмите на него, выберите "Загрузить", а затем запишите новый инструмент поверх старых.</p>
          </div>
      )}

      {/* Merge Action Bar */}
      {isSelectionMode && selectedIds.length > 1 && (
          <div className="mb-6 p-4 bg-indigo-600/20 border border-indigo-500/50 rounded-2xl flex items-center justify-between animate-fade-in backdrop-blur-md">
              <span className="text-indigo-200 font-medium">Выбрано: {selectedIds.length}</span>
              <button 
                onClick={handleMergeRequest}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-colors"
              >
                  Объединить
              </button>
          </div>
      )}

      {songs.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-2 border-slate-700">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-slate-400 font-medium">Нет сохраненных записей</p>
              <p className="text-slate-600 text-sm mt-2">Запишите свой первый хит!</p>
          </div>
      ) : (
          <div className="grid gap-4">
              {songs.map(song => (
                  <div 
                    key={song.id} 
                    onClick={() => handleLoadRequest(song)}
                    className={`
                        group relative glass-panel rounded-2xl p-5 flex justify-between items-center cursor-pointer transition-all duration-300 hover:translate-x-1
                        ${selectedIds.includes(song.id) ? 'border-indigo-500 bg-indigo-900/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'hover:bg-slate-800/60 hover:shadow-lg'}
                    `}
                  >
                      <div className="flex items-center gap-5 min-w-0">
                          {isSelectionMode && (
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${selectedIds.includes(song.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 bg-black/20'}`}>
                                  {selectedIds.includes(song.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                              </div>
                          )}
                          
                          {/* Preview Button */}
                          <button
                            onClick={(e) => handlePreview(e, song)}
                            className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-md ${previewId === song.id ? 'bg-indigo-500 text-white shadow-indigo-500/40 scale-110' : 'bg-slate-700/50 text-slate-300 hover:bg-indigo-500 hover:text-white'}`}
                          >
                              {previewId === song.id ? (
                                  <div className="flex gap-1">
                                      <div className="w-1 h-3 bg-white animate-[bounce_1s_infinite]"/>
                                      <div className="w-1 h-3 bg-white animate-[bounce_1s_infinite_0.1s]"/>
                                      <div className="w-1 h-3 bg-white animate-[bounce_1s_infinite_0.2s]"/>
                                  </div>
                              ) : (
                                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              )}
                          </button>

                          <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-300 transition-colors truncate pr-2">{song.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs bg-black/30 px-2 py-0.5 rounded text-slate-400 border border-white/5 whitespace-nowrap">
                                   {new Date(song.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                                <span className="text-xs text-slate-400 whitespace-nowrap">{song.tracks.length} дорожек</span>
                              </div>
                          </div>
                      </div>

                      {!isSelectionMode && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {/* Share button removed per request */}
                            <button 
                                onClick={(e) => handleDeleteRequest(e, song)}
                                className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="Удалить"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      )}

      {/* Custom Modal for Confirmations */}
      {confirmAction && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  {confirmAction.type === 'merge' ? (
                      <>
                        <h3 className="text-xl font-bold text-white mb-4">Объединить треки?</h3>
                        <p className="text-slate-400 text-sm mb-4">Создайте название для нового микса:</p>
                        <input id="mergeTitleInput" defaultValue={`Микс из ${confirmAction.ids?.length} треков`} className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white mb-6 focus:outline-none focus:border-indigo-500"/>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 font-bold text-sm">Отмена</button>
                            <button onClick={() => confirmMerge((document.getElementById('mergeTitleInput') as HTMLInputElement).value)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">Создать</button>
                        </div>
                      </>
                  ) : (
                      <>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {confirmAction.type === 'load' ? 'Загрузить проект?' : 'Удалить запись?'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            {confirmAction.type === 'load' 
                             ? 'Текущий несохраненный прогресс будет потерян.' 
                             : 'Это действие нельзя будет отменить.'}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 font-bold text-sm">Отмена</button>
                            <button 
                                onClick={confirmAction.type === 'load' ? confirmLoad : confirmDelete} 
                                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg ${confirmAction.type === 'load' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-rose-600 shadow-rose-500/20'}`}
                            >
                                {confirmAction.type === 'load' ? 'Загрузить' : 'Удалить'}
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Library;
