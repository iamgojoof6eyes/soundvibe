import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { processImageFile } from '../utils/imageUpload';
import { X, User, Check, Upload, Link as LinkIcon } from 'lucide-react';

const AVAILABLE_GENRES = [
  'Indie Rock', 'Shoegaze', 'Dream Pop', 'Hip-Hop', 'Neo-Soul', 
  'Synthwave', 'French House', 'City Pop', 'Lofi', 'Psychedelic Rock',
  'Post-Punk', 'Electronic', 'Jazz Fusion', 'R&B', 'Alt-Rock', 'Ambient'
];

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState(['Indie Rock', 'Electronic']);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setFavoriteGenres(user.favoriteGenres || ['Indie Rock', 'Electronic']);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

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
    if (!name.trim()) {
      setError('Please enter your display name');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      await updateUserProfile({
        username: cleanUsername || user?.username || 'curator',
        name: name.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
        favoriteGenres
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-dropdown border border-white/10 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar bg-dark-950">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Edit Profile</h2>
              <p className="text-xs text-slate-400">Update your listener identity on SoundVibe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Handle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Username (@handle)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
              <input
                type="text"
                required
                placeholder="your_handle"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="Your full listener name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Profile Picture
            </label>
            
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-dark-900 border border-white/10">
              <img
                src={avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Avatar Preview"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-blue/30 shrink-0 bg-dark-800"
              />
              
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue text-xs font-semibold border border-brand-blue/30 transition-all flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Processing...' : 'Upload'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                >
                  Random
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Bio
            </label>
            <textarea
              rows={2}
              placeholder="Tell other listeners about your taste..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue resize-none"
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
                        ? 'bg-brand-blue text-white shadow-sm'
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
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-brand-blue/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
