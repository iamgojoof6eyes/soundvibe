import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  Sparkles, 
  Users, 
  Disc3, 
  Play, 
  Pause, 
  ArrowRight, 
  CheckCircle, 
  Heart, 
  Compass, 
  Layers, 
  Flame,
  Zap
} from 'lucide-react';

export const TasteMatcher = ({ onOpenAuth, onOpenProfile }) => {
  const { user, token, demoUsers } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [allUsers, setAllUsers] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all community members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const usersList = (data.users || []).filter(u => u.id !== user?.id);
        setAllUsers(usersList);
        if (usersList.length > 0 && !selectedTargetId) {
          setSelectedTargetId(usersList[0].id);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [user]);

  // Calculate match when selectedTargetId changes
  useEffect(() => {
    if (!user || !selectedTargetId) return;

    const fetchMatch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${selectedTargetId}/match`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMatchData(data);
      } catch (err) {
        console.error('Match error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [selectedTargetId, user, token]);

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mx-auto text-brand-pink">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-white">Music Taste Compatibility Matcher</h2>
        <p className="text-xs text-slate-300">
          Sign in or select a demo persona to run real-time sonic compatibility comparisons across community members.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-pink text-white text-xs font-bold shadow-lg transition-all"
        >
          Sign In / Choose Persona
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Hero Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-pink/20 via-brand-purple/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/20 border border-brand-pink/30 text-brand-pink text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Sonic Frequency Analyzer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Music Taste Compatibility Matcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Compare your musical DNA with other listeners. Discover shared affinities, shared genres, and songs they love that will blow your mind.
          </p>
        </div>
      </div>

      {/* Select Match Partner */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Choose a Listener to Compare With:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allUsers.map((u) => {
            const isSelected = selectedTargetId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedTargetId(u.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/20 scale-[1.02]'
                    : 'bg-dark-900/80 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
              >
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white">{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">@{u.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Result Presentation */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 space-y-3">
          <Disc3 className="w-8 h-8 text-brand-pink animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Harmonizing musical frequencies...</p>
        </div>
      ) : matchData ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Compatibility Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              
              {/* User 1 Avatar */}
              <div className="flex flex-col items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-purple shadow-lg" />
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">You</p>
                </div>
              </div>

              {/* Big Score Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full bg-dark-900 border-4 border-dark-800 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
                      {matchData.matchPercentage}%
                    </span>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Match</p>
                  </div>
                  {/* Glowing ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-brand-pink/40 animate-pulse-slow pointer-events-none" />
                </div>
                <div className="mt-2 text-center">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-pink/20 text-brand-pink border border-brand-pink/30">
                    {matchData.tier}
                  </span>
                </div>
              </div>

              {/* User 2 Avatar */}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onOpenProfile(matchData.user2.id)}>
                <img src={matchData.user2.avatar} alt={matchData.user2.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan shadow-lg hover:scale-105 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-white hover:text-brand-cyan">{matchData.user2.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">@{matchData.user2.username}</p>
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="mt-6 p-4 rounded-2xl bg-dark-900/90 border border-white/5 text-center">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                "{matchData.description}"
              </p>
            </div>
          </div>

          {/* Shared vs Unique Genres Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Shared DNA */}
            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-pink" />
                <h3 className="text-sm font-bold text-white font-display">Shared Musical Affinities</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchData.sharedGenres.length === 0 ? (
                  <p className="text-xs text-slate-400">No overlapping genre tags yet. A great chance to explore new sonic styles!</p>
                ) : (
                  matchData.sharedGenres.map((g, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-brand-pink/20 text-brand-pink border border-brand-pink/30 text-xs font-semibold">
                      {g} ✨
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Other User's Taste Palette */}
            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-bold text-white font-display">
                  {matchData.user2.name.split(' ')[0]}'s Musical World
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(matchData.user2.favoriteGenres || []).map((g, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-dark-850 text-slate-300 border border-white/5 text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Discovery: Tracks recommended from other user */}
          {(matchData.user2.topTracks || []).length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Recommended Tracks from {matchData.user2.name.split(' ')[0]}'s Desert Island Discs
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchData.user2.topTracks.map((track) => {
                  const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                  return (
                    <div
                      key={track.id}
                      className="p-3.5 rounded-2xl bg-dark-900/90 border border-white/5 flex items-center justify-between gap-3 hover:border-brand-purple/40 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <img src={track.artwork} alt={track.title} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                          <button
                            onClick={() => playTrack(track)}
                            className={`absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white transition-all ${
                              isThisPlaying ? 'opacity-100 bg-brand-purple/80' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{track.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => playTrack(track)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-brand-purple text-slate-300 hover:text-white text-xs font-medium transition-all shrink-0"
                      >
                        {isThisPlaying ? 'Playing' : 'Listen'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
