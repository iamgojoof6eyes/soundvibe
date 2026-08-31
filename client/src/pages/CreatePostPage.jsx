import React, { useState } from 'react';
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
  Tag,
  LogIn,
  Lock
} from 'lucide-react';
import { createFirestorePost } from '../services/firestoreService';

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
  const { user, loading, setAuthModalOpen } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

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
    setSearchResults([]);
    setSearchQuery('');
  };

  const toggleTag = (tag) => {
    if (vibeTags.includes(tag)) {
      setVibeTags(vibeTags.filter(t => t !== tag));
    } else {
      if (vibeTags.length < 6) {
        setVibeTags([...vibeTags, tag]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!selectedTrack) {
      setError('Please search and select a track to review');
      return;
    }
    if (!review.trim()) {
      setError('Please write a brief review or thoughts on this track');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const postPayload = {
        userId: user.id || user.uid,
        author: {
          id: user.id || user.uid,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          badges: user.badges || ['Curator']
        },
        track: selectedTrack,
        rating: Number(rating),
        headline: headline.trim(),
        review: review.trim(),
        favoriteLyric: favoriteLyric.trim(),
        mood: selectedMood,
        vibeTags
      };

      await createFirestorePost(postPayload);

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

  // If user is not logged in, show access restricted sign-in view
  if (!loading && !user) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-28 max-w-md mx-auto animate-in fade-in duration-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to timeline</span>
        </button>

        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 text-brand-blue flex items-center justify-center mx-auto shadow-lg shadow-brand-blue/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-white">Sign In to Drop a Vibe</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only signed-in listeners can broadcast reviews, rate songs, and share musical discoveries with the community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-sky-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-blue/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Join</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to timeline</span>
      </button>

      {/* Main Composer Box */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">Drop a Musical Vibe</h1>
            <p className="text-[11px] sm:text-xs text-slate-400">Share your music discovery, ratings, and thoughts</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Authenticated Author Badge */}
        {user && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-900/90 border border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-blue/40 shrink-0 bg-dark-800"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verified Creator</span>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* STEP: Search and Pick Track */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-dark-900/90 border border-white/10 space-y-3">
            <label className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Choose Song / Album</span>
            </label>

            {!selectedTrack ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search title, artist, or album (Press Enter)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e);
                        }
                      }}
                      className="w-full bg-dark-850 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2.5 bg-brand-blue hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5"
                  >
                    {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar pt-2">
                    {searchResults.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTrack(t)}
                        className="p-2.5 rounded-xl bg-dark-850 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={t.artwork} alt={t.title} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-brand-blue truncate">{t.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{t.artist} • {t.album}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-brand-blue group-hover:underline shrink-0">
                          Select
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Track Card */
              <div className="p-3 rounded-xl bg-dark-850 border border-brand-blue/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img src={selectedTrack.artwork} alt={selectedTrack.title} className="w-12 h-12 rounded-xl object-cover shadow" />
                    <button
                      type="button"
                      onClick={() => playTrack(selectedTrack)}
                      className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {currentTrack?.id === selectedTrack.id && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{selectedTrack.title}</p>
                    <p className="text-[11px] text-slate-300 truncate">{selectedTrack.artist}</p>
                    <p className="text-[10px] text-slate-500 truncate">{selectedTrack.album} • {selectedTrack.genre || 'Music'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTrack(null)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors shrink-0"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Rating & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rating Stars */}
            <div className="p-3.5 rounded-xl bg-dark-900/90 border border-white/10 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Vibe Rating ({rating.toFixed(1)} / 5.0)
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 hover:text-amber-400/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Dropdown */}
            <div className="p-3.5 rounded-xl bg-dark-900/90 border border-white/10 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Listening Mood
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue"
              >
                {MOODS.map((m) => (
                  <option key={m} value={m} className="bg-dark-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Headline
            </label>
            <input
              type="text"
              placeholder="e.g. The best guitar solo of the decade"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Your Review / Sonic Thoughts *
            </label>
            <textarea
              required
              rows={3}
              placeholder="What makes this track special? Production, vocals, emotional resonance..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue resize-none"
            />
          </div>

          {/* Standout Lyric */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Favorite Lyric Snippet (Optional)
            </label>
            <div className="relative">
              <Quote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue" />
              <input
                type="text"
                placeholder="e.g. And we will never be alone again..."
                value={favoriteLyric}
                onChange={(e) => setFavoriteLyric(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Vibe Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Vibe Tags ({vibeTags.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_VIBE_TAGS.map((tag) => {
                const active = vibeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {tag} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedTrack}
            className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-brand-blue hover:bg-sky-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-blue/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Broadcasting...' : 'Broadcast to SoundVibe Feed'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
