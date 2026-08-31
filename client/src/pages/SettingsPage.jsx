import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { processImageFile } from '../utils/imageUpload';
import { 
  ArrowLeft, 
  User, 
  Check, 
  RefreshCw, 
  Upload, 
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';

const AVAILABLE_GENRES = [
  'Indie Rock', 'Shoegaze', 'Dream Pop', 'Hip-Hop', 'Neo-Soul', 
  'Synthwave', 'French House', 'City Pop', 'Lofi', 'Psychedelic Rock',
  'Post-Punk', 'Electronic', 'Jazz Fusion', 'R&B', 'Alt-Rock', 'Ambient'
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, saveUserIdentity, lookupUserByUsername } = useAuth();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState(['Indie Rock', 'Electronic']);
  const [lookingUp, setLookingUp] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setFavoriteGenres(user.favoriteGenres || ['Indie Rock', 'Electronic']);
      setIsExisting(true);
    } else {
      setUsername('');
      setName('');
      setBio('');
      setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=listener_${Math.floor(Math.random() * 1000)}`);
      setIsExisting(false);
    }
  }, [user]);

  const handleUsernameBlur = async () => {
    if (!username.trim()) return;
    setLookingUp(true);
    try {
      const found = await lookupUserByUsername(username.trim());
      if (found) {
        setName(found.name || '');
        setAvatar(found.avatar || '');
        setBio(found.bio || '');
        if (found.favoriteGenres?.length) setFavoriteGenres(found.favoriteGenres);
        setIsExisting(true);
      } else {
        setIsExisting(false);
      }
    } catch (e) {
      // ignore
    } finally {
      setLookingUp(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const dataUrl = await processImageFile(file);
      setAvatar(dataUrl);
    } catch (err) {
      setError(err.message || 'Failed to process image file');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const toggleGenre = (genre) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      if (favoriteGenres.length < 6) {
        setFavoriteGenres([...favoriteGenres, genre]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Unique Handle / ID');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your display name');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await saveUserIdentity({
        username: username.trim(),
        name: name.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
        favoriteGenres
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${username.trim()}`);
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto animate-in fade-in duration-200">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink text-white shadow-lg shadow-brand-purple/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">
              {user ? 'Edit Listener Profile' : 'Set Your Name & Photo'}
            </h1>
            <p className="text-xs text-slate-400">
              Your unique handle automatically remembers your uploaded picture and reviews across SoundVibe.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile saved successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Unique ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Unique Handle / ID
              </label>
              {isExisting && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ✓ Profile Loaded
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
              <input
                type="text"
                required
                placeholder="your_unique_id (e.g. jatin)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsExisting(false);
                }}
                onBlur={handleUsernameBlur}
                className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
              />
              {lookingUp && (
                <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple animate-spin" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Enter your ID anytime on any device to instantly load your photo and identity.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jatin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Photo / Avatar with Device Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Profile Photo
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group shrink-0">
                <img
                  src={avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt="Avatar"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-purple/40 shrink-0 bg-dark-800 shadow"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-dark-950/70 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-brand-purple animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[200px]">
                {/* Upload from device button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-3.5 py-2.5 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple border border-brand-purple/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>

                {/* Random Avatar button */}
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/5"
                  title="Generate new avatar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>

                {/* Paste URL Toggle */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1"
                  title="Paste Image URL"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{showUrlInput ? 'Hide URL' : 'Image URL'}</span>
                </button>
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-2.5 animate-in fade-in">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={avatar.startsWith('data:') ? '' : avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Bio / Music Tastes
            </label>
            <textarea
              rows={2}
              placeholder="What sonic frequencies or artists are you into?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple resize-none"
            />
          </div>

          {/* Favorite Genres */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Favorite Genres ({favoriteGenres.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_GENRES.map((genre) => {
                const active = favoriteGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-brand-purple text-white shadow-sm'
                        : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {genre} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white font-bold text-xs shadow-xl shadow-brand-purple/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Listener Identity'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
