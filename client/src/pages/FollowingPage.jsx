import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Users, Disc3, ArrowLeft, PlusCircle, Sparkles, RefreshCw } from 'lucide-react';

export const FollowingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowingPosts = async () => {
    setLoading(true);
    try {
      const headers = user?.id || user?.username ? { 'x-user-id': user.id || user.username } : {};
      const res = await fetch('/api/posts?filter=following', { headers });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching following posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowingPosts();
  }, [user]);

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-2xl bg-dark-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
            title="Back to All Feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">Following Feed</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-brand-purple/20 text-brand-purple rounded-full border border-brand-purple/30">
                {posts.length} Vibes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Music reviews and drops exclusively from creators and curators you follow.
            </p>
          </div>
        </div>

        <button
          onClick={fetchFollowingPosts}
          title="Refresh Feed"
          className="p-2.5 rounded-2xl bg-dark-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4 py-16 text-center">
          <div className="inline-block p-4 rounded-2xl bg-dark-900 border border-white/5 animate-pulse">
            <Disc3 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
          <p className="text-xs text-slate-400">Loading vibes from your curators...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-violet/20 to-brand-pink/20 border border-brand-purple/30 flex items-center justify-center mx-auto text-brand-purple shadow-lg shadow-brand-purple/10">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white font-display">
              {user ? 'No Vibes From People You Follow Yet' : 'Personal Following Feed'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {user
                ? 'You are not following any listeners yet or they have not dropped reviews yet. Click "+ Follow" on any review card to see their recommendations here!'
                : 'Set your listener handle to follow music curators and build your personalized following stream.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {!user ? (
              <button
                onClick={() => navigate('/settings')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-purple text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Set Name & Photo
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-purple text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Explore All Vibes
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onTagClick={(tag) => navigate(`/?genre=${encodeURIComponent(tag.replace('#', ''))}`)}
              onAuthorClick={(uid) => navigate(`/profile/${post.author?.username || post.userId}`)}
              onOpenEditProfile={() => navigate('/settings')}
              onPostUpdated={(updated) => {
                setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onPostDeleted={(deletedId) => {
                setPosts(prev => prev.filter(p => p.id !== deletedId));
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
};
