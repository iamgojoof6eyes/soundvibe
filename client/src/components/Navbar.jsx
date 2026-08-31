import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  Flame, 
  Users, 
  PlusCircle, 
  LogOut, 
  User, 
  Disc3, 
  Search, 
  ChevronDown,
  Settings,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUserIdentity } = useAuth();
  const { isPlaying, currentTrack, setIsVisualizerOpen } = useAudioPlayer();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isFeedActive = location.pathname === '/' || location.pathname === '/feed';
  const isFollowingActive = location.pathname === '/following';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-dark-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet via-brand-purple to-brand-pink p-[2px] shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Disc3 className={`w-6 h-6 text-brand-purple ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-pink"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-purple bg-clip-text text-transparent">
                SoundVibe
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-purple/20 text-brand-purple rounded-md border border-brand-purple/30 uppercase tracking-wider">
                Social
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Share Your Taste • Feel the Music</p>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracks, artists, or vibe tags (Press Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-850/90 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-purple/60 focus:ring-1 focus:ring-brand-purple/40 transition-all"
          />
        </form>

        {/* Navigation Tabs (Multi-Page Route Links) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isFeedActive
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Feed</span>
          </Link>

          <Link
            to="/following"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isFollowingActive
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-brand-purple" />
            <span>Following</span>
          </Link>
        </nav>

        {/* Action & User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Visualizer Trigger if audio is loaded */}
          {currentTrack && (
            <button
              onClick={() => setIsVisualizerOpen(true)}
              title="Open Sound Visualizer"
              className="p-2 rounded-full bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 border border-brand-purple/30 transition-all flex items-center justify-center"
            >
              <div className="flex items-center gap-[2px] h-4">
                <span className="sound-bar sound-bar-1" />
                <span className="sound-bar sound-bar-2" />
                <span className="sound-bar sound-bar-3" />
                <span className="sound-bar sound-bar-4" />
              </div>
            </button>
          )}

          {/* New Post Button */}
          <Link
            to="/drop-vibe"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-brand-purple/25 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Drop Vibe</span>
          </Link>

          {/* Profile / Active Identity */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-dark-850 border border-white/10 hover:border-white/20 transition-all focus:outline-none"
              >
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-purple/40"
                />
                <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-60 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-white/10 shadow-2xl">
                    
                    {/* User Header */}
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        navigate(`/profile/${user.username || user.id}`);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-left"
                    >
                      <User className="w-4 h-4 text-brand-purple" />
                      <span>My Profile & Records</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-left"
                    >
                      <Settings className="w-4 h-4 text-brand-pink" />
                      <span>Edit Name & Photo</span>
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button
                      onClick={() => {
                        navigate('/drop-vibe');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-purple hover:bg-brand-purple/10 rounded-xl transition-all text-left"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Drop New Review</span>
                    </button>

                    <button
                      onClick={() => {
                        clearUserIdentity();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Switch / Clear ID</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/settings"
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-brand-purple" />
              <span>Set Name & Photo</span>
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};
