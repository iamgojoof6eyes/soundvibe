import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Music, Sparkles, Check, Search, Plus, Trash2 } from 'lucide-react';

const AVAILABLE_GENRES = [
  'Indie Rock', 'Shoegaze', 'Dream Pop', 'Hip-Hop', 'Neo-Soul', 
  'Synthwave', 'French House', 'City Pop', 'Lofi', 'Psychedelic Rock',
  'Post-Punk', 'Electronic', 'Jazz Fusion', 'R&B', 'Alt-Rock', 'Ambient'
];

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [favoriteGenres, setFavoriteGenres] = useState(user?.favoriteGenres || []);
  
  // Track search for Top Tracks
  const [topTracks, setTopTracks] = useState(user?.topTracks || []);
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const toggleGenre = (genre) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      if (favoriteGenres.length < 6) {
        setFavoriteGenres([...favoriteGenres, genre]);
      }
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackSearchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trackSearchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addTopTrack = (track) => {
    if (topTracks.length < 4 && !topTracks.some(t => t.id === track.id)) {
      setTopTracks([...topTracks, track]);
      setSearchResults([]);
      setTrackSearchQuery('');
    }
  };

  const removeTopTrack = (index) => {
    setTopTracks(topTracks.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name,
        bio,
        avatar,
        favoriteGenres,
        topTracks
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">Customize Taste Profile</h2>
            <p className="text-xs text-slate-400">Update your musical bio, avatar, favorite genres and top 4 desert island tracks</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Music Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What genres, instruments, or feelings define your musical world?"
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple resize-none"
            />
          </div>

          {/* Favorite Genres Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Favorite Genres ({favoriteGenres.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-dark-900/60 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
              {AVAILABLE_GENRES.map((g) => {
                const active = favoriteGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-brand-purple text-white'
                        : 'bg-dark-850 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {g} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desert Island Discs (Top 4) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Desert Island Discs / Top 4 Rotation ({topTracks.length}/4)
            </label>
            
            {/* Existing top tracks */}
            <div className="space-y-1.5 mb-2">
              {topTracks.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={t.artwork} alt={t.title} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTopTrack(idx)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Track Search if less than 4 */}
            {topTracks.length < 4 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search song to add to Top 4..."
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                  <button
                    type="button"
                    onClick={handleTrackSearch}
                    disabled={searching}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    {searching ? '...' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 p-1 bg-dark-900 rounded-xl border border-white/5">
                    {searchResults.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-dark-850 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={t.artwork} alt={t.title} className="w-7 h-7 rounded object-cover" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{t.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addTopTrack(t)}
                          className="px-2 py-1 rounded bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white text-[11px] font-semibold"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white font-bold text-xs shadow-lg shadow-brand-purple/25 hover:opacity-95 transition-all mt-3"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>

      </div>
    </div>
  );
};
