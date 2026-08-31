import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  Radio, 
  Search, 
  Play, 
  Pause, 
  Flame, 
  Sparkles, 
  PlusCircle, 
  ExternalLink,
  Disc3,
  TrendingUp,
  Volume2
} from 'lucide-react';

export const TrendingMusic = ({ onShareTrack, initialSearchQuery = '', onOpenAuth }) => {
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [query, setQuery] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Fetch trending tracks
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/music/trending');
        const data = await res.json();
        setTrendingTracks(data.trending || []);
      } catch (err) {
        console.error('Error fetching trending:', err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Perform search if initial query was passed from Navbar
  useEffect(() => {
    if (initialSearchQuery) {
      setQuery(initialSearchQuery);
      performSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const performSearch = async (searchStr) => {
    if (!searchStr.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchStr.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      
      {/* Search & Discovery Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-purple/20 via-brand-pink/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>Millions of Global Tracks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Explore & Discover Sounds
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Search any artist or song worldwide. Listen to 30-second studio previews and immediately broadcast your thoughts to the community.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search any artist, album, or song (e.g. Daft Punk, Radiohead, Dua Lipa)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-dark-900/90 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-violet to-brand-purple text-white text-xs font-bold shadow-lg shadow-brand-purple/25 hover:opacity-95 transition-all shrink-0"
            >
              {searching ? 'Searching...' : 'Explore'}
            </button>
          </form>
        </div>
      </div>

      {/* Search Results if any */}
      {searchResults.length > 0 && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-purple" />
              <span>Search Results ({searchResults.length})</span>
            </h3>
            <button
              onClick={() => setSearchResults([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((track) => {
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="p-3.5 rounded-2xl bg-dark-900/90 border border-white/5 flex items-center justify-between gap-3 hover:border-brand-purple/40 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img src={track.artwork} alt={track.title} className="w-13 h-13 rounded-xl object-cover shadow" />
                      <button
                        onClick={() => playTrack(track, searchResults)}
                        className={`absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white transition-all ${
                          isThisPlaying ? 'opacity-100 bg-brand-purple/80' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isThisPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-brand-purple transition-colors">{track.title}</p>
                      <p className="text-[11px] text-slate-300 truncate">{track.artist}</p>
                      <p className="text-[10px] text-slate-500 truncate">{track.album} • {track.genre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => playTrack(track, searchResults)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors"
                      title="Play Preview"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onShareTrack(track)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white text-xs font-semibold transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Trending & Community Favorites */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-display text-white">
            Community Heavy Rotation & Top Discoveries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingTracks.map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                className="glass-panel glass-panel-hover rounded-3xl p-4 border border-white/10 flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img src={track.artwork} alt={track.title} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                    <button
                      onClick={() => playTrack(track, trendingTracks)}
                      className={`absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white transition-all ${
                        isThisPlaying ? 'opacity-100 bg-brand-pink/80' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isThisPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                      {track.genre || 'Trending'}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate pt-1">{track.title}</h4>
                    <p className="text-[11px] text-slate-300 truncate">{track.artist}</p>
                    <p className="text-[10px] text-slate-500 truncate">{track.album}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={() => playTrack(track, trendingTracks)}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isThisPlaying ? 'Playing' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => onShareTrack(track)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-brand-violet to-brand-pink text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Drop Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
