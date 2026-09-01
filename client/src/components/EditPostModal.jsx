import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Star, 
  Quote, 
  Tag, 
  Sparkles, 
  Lock, 
  Play, 
  Pause, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { updateFirestorePost, deleteFirestorePost } from '../services/firestoreService';

const MOODS = [
  'Euphoric', 'Melancholic', 'Late Night Drive', 'Deep Focus', 
  'High Energy', 'Chill & Relaxed', 'Nostalgic', 'Atmospheric'
];

export const EditPostModal = ({ post, isOpen, onClose, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const [rating, setRating] = useState(post?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [headline, setHeadline] = useState(post?.headline || '');
  const [review, setReview] = useState(post?.review || '');
  const [favoriteLyric, setFavoriteLyric] = useState(post?.favoriteLyric || '');
  const [selectedMood, setSelectedMood] = useState(post?.mood || 'Vibing');
  const [vibeTagsInput, setVibeTagsInput] = useState((post?.vibeTags || []).join(' '));

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !post) return null;

  const track = post.track;
  const isThisTrackPlaying = isPlaying && currentTrack?.id === track?.id;

  const handleTogglePlayTrack = () => {
    if (!track) return;
    if (isThisTrackPlaying) {
      togglePlay();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        previewUrl: track.previewUrl
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedTags = (vibeTagsInput || '')
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    try {
      const updateData = {
        rating,
        headline: headline.trim(),
        review: review.trim(),
        favoriteLyric: favoriteLyric.trim(),
        mood: selectedMood,
        vibeTags: parsedTags
      };

      const updated = await updateFirestorePost(post.id, updateData);

      if (onPostUpdated) {
        onPostUpdated(updated || { ...post, ...updateData });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteFirestorePost(post.id);

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="glass-dropdown border border-white/15 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto bg-dark-950/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 border-b border-white/10 flex items-start justify-between gap-4 shrink-0">
          <div className="pr-4">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Edit Your Vibe Drop</h2>
            <p className="text-xs text-slate-400 mt-1">
              Update your review, lyric highlight, tags, or rating. The music track is locked.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleUpdate} className="flex-1 flex flex-col min-h-0">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 custom-scrollbar">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* LOCKED MUSIC TRACK CARD */}
            <div className="p-4 rounded-2xl bg-dark-900 border border-white/10 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Track (Locked)</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  Cannot be changed
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track?.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'}
                    alt={track?.title}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{track?.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{track?.artist}</p>
                  </div>
                </div>

                {track?.previewUrl && (
                  <button
                    type="button"
                    onClick={handleTogglePlayTrack}
                    className="p-2.5 rounded-xl bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/30 border border-brand-blue/30 transition-all shrink-0 active:scale-95"
                    title="Play Preview"
                  >
                    {isThisTrackPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Your Rating ({rating} / 5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mood / Sonic Energy */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Sonic Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => {
                  const active = selectedMood === m.split(' ')[0] || selectedMood === m;
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSelectedMood(m.split(' ')[0])}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                        active
                          ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                          : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Headline / Hook */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Headline / Hook
              </label>
              <input
                type="text"
                placeholder="e.g. Pure sonic bliss from start to finish..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Review Deep Dive */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Review & Impressions
              </label>
              <textarea
                rows={3}
                placeholder="What makes this song hit different? What feelings does it give you?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue resize-none"
              />
            </div>

            {/* Favorite Lyric */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Quote className="w-3 h-3 text-brand-blue" />
                <span>Favorite Lyric Quote</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 'I’ll be your boyfriend in your wet dreams tonight...'"
                value={favoriteLyric}
                onChange={(e) => setFavoriteLyric(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Vibe Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-brand-pink" />
                <span>Vibe Tags (Space-separated)</span>
              </label>
              <input
                type="text"
                placeholder="#MidnightDrive #SynthLovers #Nostalgia"
                value={vibeTagsInput}
                onChange={(e) => setVibeTagsInput(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>

          </div>

          {/* Clean Anchored Full-Width Footer */}
          <div className="p-4 sm:p-6 py-4 border-t border-white/10 bg-dark-900/90 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0">
            
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all flex items-center gap-1.5 border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-brand-blue/25 hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
