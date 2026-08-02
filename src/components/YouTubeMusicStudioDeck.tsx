import React, { useState, useEffect, useCallback } from 'react';
import { Search, Music, Play, Disc, Sparkles, Loader2, Volume2, Radio, CheckCircle2, Tv } from 'lucide-react';

export interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

const PRESET_GENRES = [
  { label: '🔥 Top Hits', query: 'today top hits' },
  { label: '☕ Lofi Girl', query: 'lofi hip hop radio beats' },
  { label: '🎤 Hip Hop', query: 'top rap hip hop songs' },
  { label: '⚡ Synthwave', query: 'synthwave retrowave 80s' },
  { label: '🎷 Chill Jazz', query: 'chill jazz cafe instrumental' },
  { label: '🎸 Rock Classics', query: 'classic rock anthems' },
  { label: '💃 Latin & Reggaeton', query: 'reggaeton latin hits' },
  { label: '🏎️ Phonk Beats', query: 'drift phonk music' },
  { label: '🎮 Gaming Music', query: 'gaming music mix' },
  { label: '📻 80s Nostalgia', query: '80s pop hits' },
];

export const YouTubeMusicStudioDeck: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<YouTubeTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTrack, setActiveTrack] = useState<YouTubeTrack>({
    id: 'jfKfPfyJRdk', // Default Lofi Girl stream
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  });
  const [activeGenre, setActiveGenre] = useState('☕ Lofi Girl');

  // Perform search against backend API proxy
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.results && data.results.length > 0) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      }
    } catch (err) {
      console.error('Failed to search YouTube tracks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load search
  useEffect(() => {
    performSearch('today top music hits');
  }, [performSearch]);

  const handleSelectTrack = (track: YouTubeTrack) => {
    setActiveTrack(track);
  };

  const handleGenreClick = (genre: { label: string; query: string }) => {
    setActiveGenre(genre.label);
    setSearchQuery(genre.query);
    performSearch(genre.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveGenre('');
      performSearch(searchQuery);
    }
  };

  return (
    <div className="bg-[#0b130e] border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-2xl shadow-emerald-950/20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shrink-0">
            <Tv className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide uppercase">
                YOUTUBE MUSIC LIVE STUDIO DECK
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold border border-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                INSTANT SONG SEARCH
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Type any song, artist, or album name below — click to play immediately in your broadcast
            </p>
          </div>
        </div>
      </div>

      {/* Instant Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any song or artist (e.g. Taylor Swift, Drake, Kendrick, Lofi, Synthwave)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060a07] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>SEARCHING...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH MUSIC</span>
            </>
          )}
        </button>
      </form>

      {/* Genre Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
          One-Click Genre Stations:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-800">
          {PRESET_GENRES.map((genre) => (
            <button
              key={genre.label}
              type="button"
              onClick={() => handleGenreClick(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                activeGenre === genre.label
                  ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/20'
                  : 'bg-[#09120c] text-emerald-300/80 border-emerald-500/20 hover:bg-emerald-900/30 hover:text-white'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results List (Song Cards) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase">
          <span>Search Results ({results.length} songs found):</span>
          <span className="text-emerald-400 font-mono text-[10px]">Click any track to play</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            <span>Finding songs on YouTube Music...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[210px] overflow-y-auto pr-1 custom-scrollbar">
            {results.map((track) => {
              const isPlaying = activeTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer group relative overflow-hidden ${
                    isPlaying
                      ? 'bg-gradient-to-r from-red-950/80 to-emerald-950/80 border-red-500 shadow-lg shadow-red-500/10'
                      : 'bg-[#070e09] border-emerald-500/20 hover:border-red-500/40 hover:bg-[#0c180f]'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                        isPlaying ? 'bg-black/60 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isPlaying ? (
                        <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isPlaying ? 'text-red-400' : 'text-white group-hover:text-emerald-300'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
                    {track.duration && (
                      <span className="text-[9px] font-mono text-neutral-500">{track.duration}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase shrink-0 transition-all ${
                      isPlaying
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-red-600 group-hover:text-white'
                    }`}
                  >
                    {isPlaying ? 'PLAYING' : 'PLAY'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-neutral-400 border border-dashed border-emerald-500/20 rounded-xl">
            No songs found for "{searchQuery}". Try typing an artist or track name above!
          </div>
        )}
      </div>

      {/* Active Embedded Player Frame */}
      <div className="space-y-2 pt-2 border-t border-emerald-500/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-neutral-400 font-mono text-[10px] uppercase shrink-0">NOW PLAYING:</span>
            <span className="text-white font-bold truncate">{activeTrack.title}</span>
            <span className="text-emerald-400 text-[11px] truncate shrink-0">({activeTrack.artist})</span>
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden border border-red-500/30 bg-black/80 aspect-video max-h-[220px]">
          <iframe
            key={activeTrack.id}
            src={`https://www.youtube-nocookie.com/embed/${activeTrack.id}?autoplay=1&enablejsapi=1`}
            title={activeTrack.title}
            className="w-full h-full min-h-[180px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
