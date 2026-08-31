import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Music, User, ArrowRight, PlusCircle, Check } from 'lucide-react';

const AVAILABLE_GENRES = [
  'Indie Rock', 'Shoegaze', 'Dream Pop', 'Hip-Hop', 'Neo-Soul', 
  'Synthwave', 'French House', 'City Pop', 'Lofi', 'Psychedelic Rock',
  'Post-Punk', 'Electronic', 'Jazz Fusion', 'R&B', 'Alt-Rock', 'Ambient'
];

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, switchDemoUser, createCustomPersona, demoUsers } = useAuth();
  const [tab, setTab] = useState('switch'); // 'switch' | 'create'
  
  // Create Persona state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Indie Rock', 'Electronic']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPersona = (userId) => {
    switchDemoUser(userId);
    onClose();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createCustomPersona({
        name: name.trim(),
        username: username.trim() || name.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: bio.trim() || 'Music lover exploring sounds on SoundVibe 🎧',
        favoriteGenres: selectedGenres
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink text-white shadow-lg shadow-brand-purple/30 mb-3">
            <Music className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Choose Your Music Persona</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Switch personas or create your custom music taste profile instantly</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-dark-900/90 p-1 rounded-2xl border border-white/5 mb-6">
          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === 'switch'
                ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Select Listener Persona
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === 'create'
                ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + Create Custom Profile
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Persona List */}
        {tab === 'switch' && (
          <div className="space-y-2.5">
            <div className="grid gap-2.5">
              {demoUsers.map((dUser) => {
                const isActive = user?.id === dUser.id;
                return (
                  <button
                    key={dUser.id}
                    onClick={() => handleSelectPersona(dUser.id)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all group ${
                      isActive
                        ? 'bg-brand-purple/25 border-brand-purple text-white shadow-md shadow-brand-purple/20'
                        : 'bg-dark-850/80 hover:bg-dark-800 border-white/5 hover:border-brand-purple/40 text-slate-300'
                    }`}
                  >
                    <img
                      src={dUser.avatar}
                      alt={dUser.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-brand-purple/50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors truncate">
                          {dUser.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">@{dUser.username}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{dUser.bio}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(dUser.favoriteGenres || []).slice(0, 3).map((g, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/5">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-brand-purple group-hover:text-white text-slate-400 transition-all">
                      {isActive ? <Check className="w-4 h-4 text-brand-purple" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Create Custom Profile */}
        {tab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Handle</label>
                <input
                  type="text"
                  placeholder="alex_tunes"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Music Bio</label>
              <input
                type="text"
                placeholder="What sounds describe your taste?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Your Favorite Genres ({selectedGenres.length}/5)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-dark-900/50 rounded-xl border border-white/5">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-purple text-white shadow-sm'
                          : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {genre} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-brand-purple/25 transition-all mt-2"
            >
              {loading ? 'Setting Up...' : 'Start Exploring with this Profile'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
