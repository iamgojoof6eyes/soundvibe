import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Users, Disc3, ArrowLeft, PlusCircle, Sparkles, RefreshCw, LogIn } from 'lucide-react';
import { getFirestorePosts } from '../services/firestoreService';
import { cacheService } from '../services/cacheService';

export const FollowingPage = () => {
  const { user, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchFollowingPosts = async (pageToFetch = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const clusterResult = await getFirestorePosts({
        filter: 'following',
        currentUserId: user?.id || user?.uid || user?.username,
        page: pageToFetch,
        limit: 10,
        returnCluster: true
      });

      const fetchedList = Array.isArray(clusterResult) ? clusterResult : (clusterResult.posts || []);
      const moreAvailable = clusterResult.hasMore ?? false;
      const totalCount = clusterResult.total ?? fetchedList.length;

      if (isLoadMore) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = fetchedList.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setPosts(fetchedList);
      }
      setHasMore(moreAvailable);
      setTotalPosts(totalCount);
      setPage(pageToFetch);
    } catch (err) {
      console.error('Error fetching following posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFollowingPosts(1, false);
  }, [user]);

  const handleRefresh = () => {
    cacheService.invalidateFeed();
    fetchFollowingPosts(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFollowingPosts(page + 1, true);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 sm:p-2.5 rounded-2xl bg-dark-900 border border-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Back to All Feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white truncate">Following</h1>
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-brand-blue/20 text-brand-blue rounded-full border border-brand-blue/30 shrink-0">
                {posts.length} Vibes
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Vibes from curators you follow.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          title="Refresh Feed"
          className="p-2 sm:p-2.5 rounded-2xl bg-dark-900 border border-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4 py-16 text-center">
          <div className="inline-block p-4 rounded-2xl bg-dark-900 border border-white/5 animate-pulse">
            <Disc3 className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
          <p className="text-xs text-slate-400">Loading vibes from your curators...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-white/10 space-y-4 max-w-lg mx-auto my-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mx-auto text-brand-blue shadow-lg shadow-brand-blue/10">
            {user ? <Users className="w-7 h-7 sm:w-8 sm:h-8" /> : <LogIn className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">
              {user ? 'No Vibes From People You Follow Yet' : 'Sign In to View Following Feed'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {user
                ? 'You are not following any listeners yet or they have not dropped reviews yet. Click "+ Follow" on any review card to see their recommendations here!'
                : 'Sign in with your Google account to follow music curators and build your personalized following stream.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-sky-400 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-sky-400 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Explore All Vibes
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
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

          {/* Clustered Stream Pagination (Load More) */}
          {hasMore && (
            <div className="pt-4 pb-2 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-2xl bg-dark-900/90 hover:bg-dark-850 text-white border border-white/10 hover:border-brand-blue/30 shadow-lg text-xs font-bold transition-all flex items-center gap-2 mx-auto disabled:opacity-60 cursor-pointer active:scale-95"
              >
                {loadingMore ? (
                  <>
                    <Disc3 className="w-4 h-4 text-brand-blue animate-spin" />
                    <span>Streaming Next Cluster...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Load More Vibes</span>
                    {totalPosts > posts.length && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({posts.length} of {totalPosts})
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 5 && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-slate-600" />
                <span>You're all caught up with your following feed</span>
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};
