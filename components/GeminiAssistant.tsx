import React, { useState } from 'react';
import { generateSongIdea } from '../services/gemini';
import { SongIdea } from '../types';

const GeminiAssistant: React.FC = () => {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [songIdea, setSongIdea] = useState<SongIdea | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood || !genre) return;

    setLoading(true);
    setSongIdea(null);
    const result = await generateSongIdea(mood, genre);
    setSongIdea(result);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-2xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl w-full shadow-xl">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          AI SONGWRITER
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Mood / Vibe</label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., Melancholic, Energetic, Cyberpunk"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Genre</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Lo-Fi, Metal, Pop"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-slate-600"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !mood || !genre}
            className={`
              w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all
              ${loading 
                ? 'bg-slate-600 cursor-wait' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-purple-500/25'
              }
            `}
          >
            {loading ? 'Thinking...' : 'Generate Song Idea ✨'}
          </button>
        </form>

        {songIdea && (
          <div className="mt-8 animate-fade-in bg-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                <h3 className="text-xl font-bold text-white">{songIdea.title}</h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-600">
                    {songIdea.genre}
                </span>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Chords</p>
              <div className="flex gap-2 flex-wrap">
                {songIdea.chords.map((chord, idx) => (
                  <span key={idx} className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-md border border-indigo-500/30">
                    {chord}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Lyrics</p>
              <p className="text-slate-300 whitespace-pre-line italic leading-relaxed">
                "{songIdea.lyrics}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiAssistant;