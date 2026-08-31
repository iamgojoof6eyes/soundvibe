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
  Sparkles,
  Plus
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
  const isDropVibeActive = location.pathname === '/drop-vibe';
  const isProfileActive = location.pathname.startsWith('/profile') || location.pathname === '/settings';

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-dark-950/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-violet via-brand-blue to-sky-400 p-[2px] shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Disc3 className={`w-5 h-5 sm:w-6 sm:h-6 text-brand-blue ${isPlaying ? 'animate-spin-slow' : ''}`} />
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-brand-pink"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-blue bg-clip-text text-transparent">
                  SoundVibe
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-brand-blue/20 text-brand-blue rounded-md border border-brand-blue/30 uppercase tracking-wider">
                  Social
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">Share Your Taste • Feel the Music</p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracks, artists, or vibe tags (Press Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/40 transition-all"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
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
              <Users className="w-4 h-4 text-brand-blue" />
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
                className="p-2 sm:p-2.5 rounded-full bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/30 border border-brand-blue/30 transition-all flex items-center justify-center"
              >
                <div className="flex items-center gap-[2px] h-3.5 sm:h-4">
                  <span className="sound-bar sound-bar-1" />
                  <span className="sound-bar sound-bar-2" />
                  <span className="sound-bar sound-bar-3" />
                  <span className="sound-bar sound-bar-4" />
                </div>
              </button>
            )}

            {/* Desktop New Post Button */}
            <Link
              to="/drop-vibe"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-blue hover:bg-sky-400 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-blue/25 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Drop Vibe</span>
            </Link>

            {/* Profile / Active Identity */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full bg-dark-900 border border-white/10 hover:border-white/20 transition-all focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-brand-blue/50"
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
                        <User className="w-4 h-4 text-brand-blue" />
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all text-left"
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
                className="px-3 py-1.5 rounded-full bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-brand-blue text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Set Profile</span>
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Twitter Mobile Style) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        
        {/* Feed */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all min-w-[56px] ${
            isFeedActive ? 'text-brand-blue scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className={`w-5 h-5 ${isFeedActive ? 'text-amber-400 fill-amber-400/20' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Feed</span>
        </Link>

        {/* Following */}
        <Link
          to="/following"
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all min-w-[56px] ${
            isFollowingActive ? 'text-brand-blue scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className={`w-5 h-5 ${isFollowingActive ? 'text-brand-blue fill-brand-blue/20' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Following</span>
        </Link>

        {/* Center: Drop Vibe Action Button */}
        <Link
          to="/drop-vibe"
          className="flex flex-col items-center justify-center -mt-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-blue hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-brand-blue/40 transition-all group-active:scale-90 ring-4 ring-dark-950">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5">Drop</span>
        </Link>

        {/* Profile */}
        <Link
          to={user ? `/profile/${user.username || user.id}` : '/settings'}
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all min-w-[56px] ${
            isProfileActive ? 'text-brand-blue scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className={`w-5 h-5 rounded-full object-cover ring-1 ${isProfileActive ? 'ring-brand-blue' : 'ring-white/20'}`}
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-semibold mt-0.5">Profile</span>
        </Link>

      </nav>
    </>
  );
};
