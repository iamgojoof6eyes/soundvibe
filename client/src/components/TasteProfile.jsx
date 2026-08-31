import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { PostCard } from './PostCard';
import { 
  User, 
  Disc3, 
  Sparkles, 
  Heart, 
  Radio, 
  Edit3, 
  UserPlus, 
  UserCheck, 
  ArrowLeft,
  Flame,
  Play,
  Pause,
  Award
} from 'lucide-react';

export const TasteProfile = ({ userId, onBack, onOpenCreatePost, onOpenEditProfile }) => {
  const { user: currentUser, toggleFollowUser } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetId || (currentUser?.username && currentUser.username === userId);

  const fetchProfile = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = currentUser?.id ? { 'x-user-id': currentUser.id } : {};
      const res = await fetch(`/api/users/${targetId}`, { headers });
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      onOpenEditProfile();
      return;
    }
    try {
      await toggleFollowUser(targetId);
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Disc3 className="w-10 h-10 text-brand-purple animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading music taste profile...</p>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white">User profile not found</h3>
        <button onClick={onBack} className="text-xs text-brand-purple hover:underline">
          Return to Feed
        </button>
      </div>
    );
  }

  const { user, posts = [], isFollowing, tasteMatch } = profileData;

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </button>

      {/* Profile Header Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-violet/20 via-brand-pink/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-brand-purple/30 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-dark-900 rounded-xl border border-white/10 text-brand-purple">
                <Disc3 className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-white">{user.name}</h1>
                <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">{user.bio}</p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {(user.badges || []).map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30"
                  >
                    <Award className="w-3 h-3" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 self-stretch sm:self-center">
            {isOwnProfile ? (
              <button
                onClick={onOpenEditProfile}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isFollowing
                    ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                    : 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-brand-purple/25'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Stats & Genres strip */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-white font-mono">{posts.length}</p>
              <p className="text-[11px] text-slate-400">Vibe Drops</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <p className="text-lg font-bold text-white font-mono">{(user.followers || []).length}</p>
              <p className="text-[11px] text-slate-400">Followers</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <p className="text-lg font-bold text-white font-mono">{(user.following || []).length}</p>
              <p className="text-[11px] text-slate-400">Following</p>
            </div>
          </div>

          {/* Favorite Genres Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Favorite Genres:</span>
            {(user.favoriteGenres || []).map((g, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-dark-850 text-slate-200 border border-white/5 font-medium">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Desert Island Discs / Top 4 Tracks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold font-display text-white">
            Desert Island Discs (Heavy Rotation Favorites)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(user.topTracks || []).length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2">No desert island tracks selected yet.</p>
          ) : (
            user.topTracks.map((track) => {
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="p-3.5 rounded-2xl bg-dark-900/80 border border-white/5 flex items-center justify-between gap-3 hover:border-brand-purple/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img src={track.artwork} alt={track.title} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                      <button
                        onClick={() => playTrack(track)}
                        className={`absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white transition-all ${
                          isThisPlaying ? 'opacity-100 bg-brand-purple/70' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{track.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      <p className="text-[10px] text-slate-500 truncate">{track.album}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => playTrack(track)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-brand-purple text-slate-300 hover:text-white text-xs transition-all shrink-0"
                  >
                    {isThisPlaying ? 'Playing' : 'Play'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-purple" />
            <h2 className="text-base font-bold font-display text-white">
              Music Reviews & Vibe Drops by {user.name.split(' ')[0]} ({posts.length})
            </h2>
          </div>
          {isOwnProfile && (
            <button
              onClick={onOpenCreatePost}
              className="text-xs font-semibold text-brand-purple hover:underline"
            >
              + Add New Review
            </button>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border border-white/5 space-y-2">
            <p className="text-xs text-slate-400">No music reviews dropped yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, author: user }}
                onTagClick={() => {}}
                onAuthorClick={() => {}}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
