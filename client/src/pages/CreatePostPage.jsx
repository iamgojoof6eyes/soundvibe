import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Play, 
  Pause, 
  Quote, 
  Sparkles, 
  Flame, 
  User, 
  RefreshCw,
  UserCheck,
  UserPlus,
  AlertCircle
} from 'lucide-react';

const SUGGESTED_VIBE_TAGS = [
  '#MidnightDrive', '#HeavyRotation', '#HiddenGem', '#Nostalgia',
  '#BasslineHeaven', '#GoldenHour', '#HeartbreakAnthem', '#StudyFlow',
  '#GymHype', '#RainyDay', '#Chillhop', '#Masterpiece'
];

const MOODS = [
  'Euphoric', 'Melancholy', 'Reflective', 'Energetic', 
  'Chill / Relaxed', 'Nostalgic', 'Psychedelic', 'Aggressive / Hype'
];

export const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user, lookupUserByUsername, saveUserIdentity } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  // Author identity state
  const [handleInput, setHandleInput] = useState(user?.username || '');
  const [activeAuthor, setActiveAuthor] = useState(user || null);
  const [lookingUp, setLookingUp] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isTypingHandle, setIsTypingHandle] = useState(!user);

  // Track & Review State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [review, setReview] = useState('');
  const [favoriteLyric, setFavoriteLyric] = useState('');
  const [selectedMood, setSelectedMood] = useState('Euphoric');
  const [vibeTags, setVibeTags] = useState(['#HeavyRotation', '#MidnightDrive']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setHandleInput(user.username || '');
      setActiveAuthor(user);
      setIsTypingHandle(false);
      setNotFound(false);
    } else {
      setIsTypingHandle(true);
    }
  }, [user]);

  const verifyHandle = async (rawHandle) => {
    const clean = (rawHandle || handleInput).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean) {
      setActiveAuthor(null);
      setNotFound(false);
      return;
    }

    setLookingUp(true);
    setNotFound(false);
    try {
      const found = await lookupUserByUsername(clean);
      if (found) {
        setActiveAuthor(found);
        setNotFound(false);
        saveUserIdentity(found);
      } else {
        setActiveAuthor(null);
        setNotFound(true);
      }
    } catch (e) {
      setNotFound(true);
    } finally {
      setLookingUp(false);
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      if (!data.results || data.results.length === 0) {
        setError(`No songs found matching "${searchQuery.trim()}". Try another title or artist.`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search tracks.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    if (!headline) {
      setHeadline(`${track.title} by ${track.artist}`);
    }
  };

  const toggleTag = (tag) => {
    if (vibeTags.includes(tag)) {
      setVibeTags(vibeTags.filter(t => t !== tag));
    } else {
      if (vibeTags.length < 5) {
        setVibeTags([...vibeTags, tag]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeAuthor) {
      if (notFound) {
        setError(`@${handleInput.trim()} is not registered yet. Please click "Set Name & Photo" to create your profile.`);
      } else {
        setError('Please enter your registered handle.');
      }
      return;
    }

    if (!selectedTrack) {
      setError('Please search and select a song to share');
      return;
    }
    if (!review.trim()) {
      setError('Please write your thoughts or review about the track');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeAuthor.username,
          authorName: activeAuthor.name,
          authorAvatar: activeAuthor.avatar,
          track: selectedTrack,
          rating,
          headline: headline || `${selectedTrack.title} by ${selectedTrack.artist}`,
          review,
          favoriteLyric,
          vibeTags,
          mood: selectedMood
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish post');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Composer Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink text-white shadow-lg shadow-brand-purple/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Drop a Musical Vibe</h1>
            <p className="text-xs text-slate-400">Share your music discovery, ratings, and thoughts</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1: Handle */}
          <div className="p-4 rounded-2xl bg-dark-900/90 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Your Handle</span>
              </label>
              {activeAuthor && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Profile Ready</span>
                </span>
              )}
            </div>

            {activeAuthor && !isTypingHandle ? (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-dark-850 border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeAuthor.avatar}
                    alt={activeAuthor.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-purple/40 shrink-0 bg-dark-800"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{activeAuthor.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">@{activeAuthor.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTypingHandle(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors shrink-0"
                >
                  Change Handle
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your unique handle (e.g. jatin)"
                    value={handleInput}
                    onChange={(e) => {
                      setHandleInput(e.target.value);
                      setActiveAuthor(null);
                      setNotFound(false);
                    }}
                    onBlur={() => verifyHandle(handleInput)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        verifyHandle(handleInput);
                      }
                    }}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl pl-8 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                  />
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {lookingUp && (
                      <RefreshCw className="w-3.5 h-3.5 text-brand-purple animate-spin" />
                    )}
                    <button
                      type="button"
                      onClick={() => verifyHandle(handleInput)}
                      className="px-2.5 py-1 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple text-[11px] font-semibold transition-colors"
                    >
                      Check
                    </button>
                  </div>
                </div>

                {notFound && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Handle "@{handleInput.trim()}" is not registered yet.</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      To share reviews under this handle, please set your display name and photo first.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/settings')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Set Name & Photo to Create Profile</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Choose Track with Enter key support */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Choose Track / Song
            </label>

            {!selectedTrack ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search song title or artist (Press Enter to search)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSearch(e);
                        }
                      }}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold shadow-md transition-all shrink-0"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-56 overflow-y-auto space-y-2 p-2 bg-dark-900/90 rounded-2xl border border-white/5">
                    {searchResults.map((t) => {
                      const isThisPlaying = currentTrack?.id === t.id && isPlaying;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 transition-all border border-transparent hover:border-brand-purple/40"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <img src={t.artwork} alt={t.title} className="w-11 h-11 rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => playTrack(t)}
                                className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white"
                              >
                                {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </button>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{t.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{t.artist} • {t.album}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectTrack(t)}
                            className="px-3 py-1.5 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white text-xs font-semibold transition-all"
                          >
                            Select
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-dark-900 border border-brand-purple/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={selectedTrack.artwork} alt={selectedTrack.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selectedTrack.title}</p>
                    <p className="text-xs text-slate-400 truncate">{selectedTrack.artist} • {selectedTrack.album}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playTrack(selectedTrack)}
                    className="p-2 rounded-xl bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white transition-all text-xs"
                  >
                    {currentTrack?.id === selectedTrack.id && isPlaying ? 'Pause' : 'Listen Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all text-xs"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Rating & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Star Rating ({rating.toFixed(1)} / 5.0)
              </label>
              <div className="flex items-center gap-1.5 p-2.5 bg-dark-900 rounded-xl border border-white/5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mood / Energy
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                {MOODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 4: Thoughts & Review */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              4. Headline / Hook
            </label>
            <input
              type="text"
              placeholder="e.g., That guitar riff altered my brain chemistry"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              5. Your Music Thoughts & Review
            </label>
            <textarea
              rows={3}
              required
              placeholder="What makes this track special to you?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple resize-none"
            />
          </div>

          {/* Standout Lyric */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Favorite Lyric Snippet (Optional)
            </label>
            <div className="relative">
              <Quote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple" />
              <input
                type="text"
                placeholder="e.g. And we will never be alone again..."
                value={favoriteLyric}
                onChange={(e) => setFavoriteLyric(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Vibe Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Vibe Tags ({vibeTags.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_VIBE_TAGS.map((tag) => {
                const active = vibeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-brand-purple text-white shadow-sm'
                        : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {tag} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !selectedTrack || (!activeAuthor && notFound)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white font-bold text-sm shadow-xl shadow-brand-purple/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Broadcasting...' : 'Broadcast to SoundVibe Feed'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
