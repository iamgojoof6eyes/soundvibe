import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  X, 
  Search, 
  Music, 
  Star, 
  Play, 
  Pause, 
  Quote, 
  Tag, 
  Sparkles, 
  Check,
  Disc3,
  Flame,
  Layers
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

export const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialTrack = null }) => {
  const { user, token } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(initialTrack);

  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [review, setReview] = useState('');
  const [favoriteLyric, setFavoriteLyric] = useState('');
  const [selectedMood, setSelectedMood] = useState('Euphoric');
  const [vibeTags, setVibeTags] = useState(['#HeavyRotation', '#MidnightDrive']);
  const [customTag, setCustomTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search tracks. Please check connection.');
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

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (!customTag.trim()) return;
    const cleanTag = customTag.trim().startsWith('#') ? customTag.trim() : `#${customTag.trim()}`;
    if (!vibeTags.includes(cleanTag) && vibeTags.length < 6) {
      setVibeTags([...vibeTags, cleanTag]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      setError('Please search and select a track to share');
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
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

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onPostCreated(data.post);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink text-white shadow-lg shadow-brand-purple/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">Drop a Musical Vibe</h2>
            <p className="text-xs text-slate-400">Share your music discovery, star rating, and review with the world</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1: Search and select song */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Choose Track / Song
            </label>

            {!selectedTrack ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search song title or artist (e.g. Tame Impala, Frank Ocean)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Search Results List */}
                {searchResults.length > 0 && (
                  <div className="max-h-52 overflow-y-auto space-y-2 p-2 bg-dark-900/90 rounded-2xl border border-white/5">
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
              /* Selected Track Banner */
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

          {/* STEP 2: Rating & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. Star Rating ({rating.toFixed(1)} / 5.0)
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

          {/* STEP 3: Review Text & Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Headline / Hook
            </label>
            <input
              type="text"
              placeholder="e.g., That bridge at 2:30 altered my brain chemistry forever"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              4. Your Music Thoughts & Review
            </label>
            <textarea
              rows={3}
              required
              placeholder="What makes this song special? Share details on the production, lyrics, bassline, memories, or vibes..."
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

          {/* STEP 4: Vibe Tags */}
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
            disabled={submitting || !selectedTrack}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white font-bold text-sm shadow-xl shadow-brand-purple/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Publishing Vibe...' : 'Broadcast to SoundVibe Feed'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
