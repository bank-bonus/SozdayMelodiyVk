import React, { useState, useEffect } from 'react';
import DrumPad from './components/DrumPad';
import SynthKeys from './components/SynthKeys';
import StringInstrument from './components/StringInstrument';
import StudioControls from './components/StudioControls';
import Library from './components/Library';
import { ViewState } from './types';
import { audioEngine } from './services/audioEngine';
import { recorder } from './services/recorder';
import { GUITAR_TUNING, BASS_TUNING, VIOLIN_TUNING, CELLO_TUNING, UKULELE_TUNING } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.MENU);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [songName, setSongName] = useState('');
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Initialize VK Bridge
    if (window.vkBridge) {
      window.vkBridge.send('VKWebAppInit');
      // Show Banner Ad
      window.vkBridge.send('VKWebAppShowBannerAd', {
        banner_location: 'bottom'
      }).catch((e: any) => console.log('Ad error:', e));
    }

    // Load unlocked items (mock persistence) with error handling
    try {
        const stored = localStorage.getItem('vk_music_unlocked');
        if (stored) {
            setUnlockedItems(JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to parse unlocked items", e);
        // If corrupted, reset
        localStorage.removeItem('vk_music_unlocked');
    }
  }, []);

  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  };

  const handleNav = (target: ViewState) => {
    // Check locked status - DISABLED FOR NOW per user request (Unlocked mode)
    /* 
    if (target === ViewState.VIOLIN && !unlockedItems.includes('violin')) {
        handleBuy('violin', 'Скрипка');
        return;
    }
    if (target === ViewState.FLUTE && !unlockedItems.includes('flute')) {
        handleBuy('flute', 'Флейта');
        return;
    }
    if (target === ViewState.CELLO && !unlockedItems.includes('cello')) {
        handleBuy('cello', 'Виолончель');
        return;
    }
    // ... others ...
    */

    // Initialize audio context on first user interaction
    audioEngine.init();
    setView(target);
  };

  const handleBuy = (itemId: string, itemName: string) => {
      if (window.vkBridge) {
          window.vkBridge.send('VKWebAppShowOrderBox', { 
              type: 'item', 
              item: itemId 
          })
          .then(() => {
              // Success
              unlockItem(itemId);
          })
          .catch(() => {
              // For demo purposes or if user cancels/fails payment
              // In production, you would handle the error gracefully without a confirm dialog
              showToast("Покупка отменена или не удалась", "error");
          });
      } else {
          // Fallback for browser testing (Dev mode)
          // Directly unlock to avoid native confirm alert
          unlockItem(itemId);
          showToast(`[DEV] ${itemName} куплен`, "success");
      }
  };

  const unlockItem = (itemId: string) => {
      const newUnlocked = [...unlockedItems, itemId];
      setUnlockedItems(newUnlocked);
      localStorage.setItem('vk_music_unlocked', JSON.stringify(newUnlocked));
      showToast('Инструмент разблокирован!', 'success');
      if (itemId === 'violin') setView(ViewState.VIOLIN);
      if (itemId === 'flute') setView(ViewState.FLUTE);
      if (itemId === 'cello') setView(ViewState.CELLO);
      if (itemId === 'ukulele') setView(ViewState.UKULELE);
      if (itemId === 'sax') setView(ViewState.SAXOPHONE);
      if (itemId === '8bit') setView(ViewState.EIGHT_BIT);
  };

  const handleSave = () => {
    if (!songName.trim()) return;
    recorder.saveSong(songName);
    setShowSaveModal(false);
    setSongName('');
    if (window.vkBridge) {
       window.vkBridge.send('VKWebAppTapticNotificationOccurred', { type: 'success' });
    }
    showToast('Проект сохранен в библиотеку!', 'success');
  };

  const handleInvite = () => {
    if (window.vkBridge) {
      // Try standard invite box first
      window.vkBridge.send('VKWebAppShowInviteBox', {})
        .then((data: any) => {
            if (!data.success) {
                 // If success is false, try fallback
                 fallbackShare();
            }
        })
        .catch((e: any) => {
            console.log('Invite box failed, using fallback:', e);
            fallbackShare();
        });
    } else {
      showToast("Функция доступна внутри ВКонтакте", "error");
    }
  };

  const fallbackShare = () => {
      if (window.vkBridge) {
          window.vkBridge.send('VKWebAppShare', {
              link: 'https://vk.com/app54060719'
          }).catch((e: any) => {
              showToast("Не удалось открыть окно приглашения", "error");
          });
      }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.DRUMS:
        return <DrumPad />;
      case ViewState.SYNTH:
        return <SynthKeys />;
      case ViewState.GUITAR:
        return <StringInstrument type="guitar" tuning={GUITAR_TUNING} />;
      case ViewState.BASS:
        return <StringInstrument type="bass" tuning={BASS_TUNING} />;
      case ViewState.VIOLIN:
        return <StringInstrument type="violin" tuning={VIOLIN_TUNING} />;
      case ViewState.CELLO:
        return <StringInstrument type="cello" tuning={CELLO_TUNING} />;
      case ViewState.UKULELE:
        return <StringInstrument type="ukulele" tuning={UKULELE_TUNING} />;
      case ViewState.FLUTE:
        return <SynthKeys title="ФЛЕЙТА" forcedPreset="flute" hidePresets={true} />;
      case ViewState.SAXOPHONE:
        return <SynthKeys title="САКСОФОН" forcedPreset="sax" hidePresets={true} />;
      case ViewState.EIGHT_BIT:
        return <SynthKeys title="8-BIT КОНСОЛЬ" forcedPreset="8bit" hidePresets={true} />;
      case ViewState.LIBRARY:
        return <Library onLoad={() => setView(ViewState.MENU)} />;
      case ViewState.MENU:
      default:
        return (
          <div className="grid grid-cols-1 gap-6 w-full max-w-sm px-4 perspective-1000">
            {/* Existing Instruments */}
            <button
              onClick={() => handleNav(ViewState.DRUMS)}
              className="group relative p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-orange-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
              <div className="relative flex items-center gap-6">
                <div className="text-5xl drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300">🥁</div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white tracking-tight drop-shadow-md">Барабаны</div>
                  <div className="text-rose-100 font-medium text-sm mt-1 opacity-90">Биты и ритмы</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleNav(ViewState.SYNTH)}
              className="group relative p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              <div className="relative flex items-center gap-6">
                <div className="text-5xl drop-shadow-lg transform group-hover:-rotate-12 transition-transform duration-300">🎹</div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white tracking-tight drop-shadow-md">Синтезатор</div>
                  <div className="text-indigo-100 font-medium text-sm mt-1 opacity-90">Пианино, Пад, 8-Бит</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNav(ViewState.GUITAR)}
              className="group relative p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-overlay" />
              <div className="relative flex items-center gap-6">
                <div className="text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white tracking-tight drop-shadow-md">Гитара</div>
                  <div className="text-amber-100 font-medium text-sm mt-1 opacity-90">Акустика и Соло</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNav(ViewState.BASS)}
              className="group relative p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-700 to-purple-800 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-6">
                <div className="text-5xl drop-shadow-lg transform group-hover:translate-x-2 transition-transform duration-300">🎸</div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white tracking-tight drop-shadow-md">Бас-гитара</div>
                  <div className="text-purple-100 font-medium text-sm mt-1 opacity-90">Грув и Бас</div>
                </div>
              </div>
            </button>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-2" />
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-1">Магазин Инструментов</div>

            <div className="grid grid-cols-2 gap-4">
                {/* Premium Instruments */}
                {[
                  { id: ViewState.VIOLIN, icon: '🎻', name: 'Скрипка', color: 'from-yellow-600 to-amber-700', shadow: 'rgba(234,179,8,0.6)', key: 'violin' },
                  { id: ViewState.CELLO, icon: '🎻', name: 'Виолончель', color: 'from-amber-800 to-orange-900', shadow: 'rgba(234,88,12,0.6)', key: 'cello' },
                  { id: ViewState.FLUTE, icon: '🎼', name: 'Флейта', color: 'from-teal-500 to-emerald-600', shadow: 'rgba(20,184,166,0.6)', key: 'flute' },
                  { id: ViewState.SAXOPHONE, icon: '🎷', name: 'Саксофон', color: 'from-amber-400 to-yellow-500', shadow: 'rgba(250,204,21,0.6)', key: 'sax' },
                  { id: ViewState.UKULELE, icon: '🥥', name: 'Укулеле', color: 'from-lime-500 to-green-600', shadow: 'rgba(132,204,22,0.6)', key: 'ukulele' },
                  { id: ViewState.EIGHT_BIT, icon: '👾', name: '8-Bit', color: 'from-pink-500 to-rose-500', shadow: 'rgba(244,63,94,0.6)', key: '8bit' },
                ].map(inst => (
                    <button
                        key={inst.id}
                        onClick={() => handleNav(inst.id)}
                        className={`group relative p-4 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_20px_-5px_${inst.shadow}] h-36 flex flex-col justify-between`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${inst.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative flex justify-between items-start">
                             <div className="text-3xl drop-shadow-md">{inst.icon}</div>
                             {/* Always show checkmark for now as per "unlocked" request, or show lock if strictly following logic but bypassing. Let's show check to indicate availability */}
                             <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center border border-white/20">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                             </div>
                        </div>
                        <div className="relative text-left">
                            <div className="text-lg font-black text-white tracking-tight drop-shadow-md leading-none">{inst.name}</div>
                            <div className="text-white/80 font-medium text-[10px] mt-1 flex items-center gap-1">
                                Бесплатно
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />

            <div className="flex gap-4">
              <button
                onClick={() => handleNav(ViewState.LIBRARY)}
                className="flex-1 glass-panel p-4 rounded-2xl hover:bg-slate-800/60 transition-all flex flex-col items-center justify-center gap-2 text-slate-200 font-bold border border-white/10 shadow-lg group"
              >
                 <span className="text-2xl group-hover:scale-110 transition-transform">📂</span> 
                 <span className="text-sm">Библиотека</span>
              </button>
              
              <button
                onClick={handleInvite}
                className="flex-1 glass-panel p-4 rounded-2xl hover:bg-slate-800/60 transition-all flex flex-col items-center justify-center gap-2 text-slate-200 font-bold border border-white/10 shadow-lg group"
              >
                 <span className="text-2xl group-hover:scale-110 transition-transform">👥</span> 
                 <span className="text-sm">Пригласить</span>
              </button>
            </div>
            {/* Spacer for Ad */}
            <div className="h-20"></div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/50">
      {/* Notifications */}
      {notification && (
        <div className="fixed top-6 left-0 w-full z-[100] flex justify-center pointer-events-none animate-slide-in-top px-4">
            <div className={`
                w-full max-w-sm p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-4
                ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-red-900/90 border-red-500/50 text-red-100'}
            `}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {notification.type === 'success' ? (
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-white leading-tight">{notification.type === 'success' ? 'Успешно' : 'Ошибка'}</h4>
                    <p className="text-sm opacity-90 leading-tight">{notification.message}</p>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b-0 border-white/5 pt-4">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView(ViewState.MENU)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-300">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
              СОЗДАЙ<span className="text-indigo-400"> МЕЛОДИЮ</span>
            </h1>
          </div>
          
          {view !== ViewState.MENU && (
             <button 
               onClick={() => setView(ViewState.MENU)}
               className="px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-sm font-bold text-slate-300 transition-all border border-white/10 backdrop-blur-md"
             >
               Меню
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pb-36">
        {renderContent()}
      </main>

      {/* Studio Controls */}
      <StudioControls 
        onSaveRequest={() => setShowSaveModal(true)} 
        currentView={view} 
      />

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl w-full max-w-sm shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
             
             <h3 className="text-2xl font-black text-white mb-2 relative z-10">Сохранить трек</h3>
             <p className="text-slate-400 text-sm mb-6 relative z-10">Дайте название вашему шедевру</p>
             
             <input
               autoFocus
               type="text"
               placeholder="Название..."
               className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-8 transition-all relative z-10"
               value={songName}
               onChange={(e) => setSongName(e.target.value)}
             />
             <div className="flex gap-4 relative z-10">
               <button 
                 onClick={() => setShowSaveModal(false)}
                 className="flex-1 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors"
               >
                 Отмена
               </button>
               <button 
                 onClick={handleSave}
                 className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
               >
                 Сохранить
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;