import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { EditPostModal } from './EditPostModal';
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2, 
  Star, 
  Sparkles, 
  Quote, 
  ExternalLink,
  Send,
  UserPlus,
  UserCheck,
  Disc3,
  Bookmark,
  Check,
  Pencil
} from 'lucide-react';

const REACTION_CONFIG = [
  { key: 'fire', label: 'Fire', emoji: '🔥' },
  { key: 'vibe', label: 'Vibe', emoji: '🌊' },
  { key: 'heart', label: 'Love', emoji: '❤️' },
  { key: 'repeat', label: 'On Repeat', emoji: '🔁' },
  { key: 'mindblown', label: 'Mindblown', emoji: '🧠' },
  { key: 'overrated', label: 'Overrated', emoji: '😴' }
];

export const PostCard = ({ 
  post, 
  onTagClick, 
  onAuthorClick, 
  onOpenAuth,
  onPostUpdated,
  onPostDeleted
}) => {
  const { user, token, toggleFollowUser } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [currentPost, setCurrentPost] = useState(post);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setCurrentPost(post);
    setReactions(post.reactions || {});
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  const isThisTrackPlaying = currentTrack?.id === post.track.id && isPlaying;
  const author = post.author || { id: post.userId, name: 'Music Explorer', avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${post.userId}` };
  const authorIdentifier = author.id || author.username;
  const isFollowingAuthor = (user?.following || []).some(
    fId => fId === author.id || fId === author.username || (author.username && fId.toLowerCase().includes(author.username.toLowerCase()))
  );
  const isSelf = user && (user.id === author.id || user.username === author.username);

  const handlePlaySong = () => {
    playTrack(post.track);
  };

  const handleFollow = async () => {
    if (!user) {
      if (onOpenEditProfile) onOpenEditProfile();
      return;
    }
    try {
      await toggleFollowUser(author.id || author.username);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReaction = async (reactionKey) => {
    const activeUserId = user?.username || user?.id || 'guest_listener';

    // Optimistic UI update
    setReactions(prev => {
      const currentList = prev[reactionKey] || [];
      const hasReacted = currentList.includes(activeUserId);
      return {
        ...prev,
        [reactionKey]: hasReacted
          ? currentList.filter(id => id !== activeUserId)
          : [...currentList, activeUserId]
      };
    });

    try {
      const res = await fetch(`/api/posts/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: reactionKey, username: activeUserId })
      });
      const data = await res.json();
      if (data.reactions) {
        setReactions(data.reactions);
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const toggleCommentsDrawer = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (e) {
        console.error('Error fetching comments:', e);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const authorUsername = user?.username || 'music_listener';
    const authorDisplayName = user?.name || 'Music Explorer';
    const authorPhoto = user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=listener';

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentInput.trim(),
          username: authorUsername,
          authorName: authorDisplayName,
          authorAvatar: authorPhoto
        })
      });
      const data = await res.json();
      if (data.comment) {
        setComments(prev => [...prev, data.comment]);
        setCommentsCount(prev => prev + 1);
        setCommentInput('');
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(postUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-amber-400 fill-amber-400'
              : i < rating
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-slate-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <article className="glass-panel glass-panel-hover rounded-3xl p-5 sm:p-6 transition-all relative overflow-hidden border border-white/10">
      
      {/* Top Bar: Author info & Actions */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link 
          to={`/profile/${author.username || author.id}`}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-brand-purple transition-all"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors">
                {author.name || 'Anonymous Listener'}
              </h4>
              {(author.badges || []).slice(0, 1).map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-medium">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              @{author.username || 'user'} • <span className="text-[11px] text-slate-500">Recently</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isSelf ? (
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10 shadow-sm"
              title="Edit Vibe Drop"
            >
              <Pencil className="w-3 h-3 text-brand-purple" />
              <span>Edit</span>
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isFollowingAuthor
                  ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                  : 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/30'
              }`}
            >
              {isFollowingAuthor ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            title="Share post"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track Player Card */}
      <div className="p-3.5 rounded-2xl bg-dark-900/90 border border-white/5 mb-4 flex items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={post.track.artwork}
              alt={post.track.title}
              className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
            />
            <button
              onClick={handlePlaySong}
              className={`absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isThisTrackPlaying
                  ? 'bg-brand-pink ring-2 ring-white/50 scale-100'
                  : 'bg-black/60 hover:bg-brand-purple opacity-90 group-hover:opacity-100'
              }`}
            >
              {isThisTrackPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold text-white truncate hover:text-brand-purple cursor-pointer" onClick={handlePlaySong}>
                {post.track.title}
              </h5>
              {isThisTrackPlaying && (
                <span className="flex items-center gap-[2px] h-3">
                  <span className="sound-bar sound-bar-1 !h-3" />
                  <span className="sound-bar sound-bar-2 !h-4" />
                  <span className="sound-bar sound-bar-3 !h-2" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 truncate">{post.track.artist}</p>
            <p className="text-[11px] text-slate-500 truncate">{post.track.album} • {post.track.genre || 'Single'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={post.track.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(post.track.artist + ' ' + post.track.title)}`}
            target="_blank"
            rel="noreferrer"
            title="Listen on YouTube Music"
            className="p-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs transition-all flex items-center gap-1.5 border border-red-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline font-semibold">YT Music</span>
          </a>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2.5 mb-4">
        {/* Rating & Mood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex">{renderStars(currentPost.rating)}</div>
            <span className="text-xs font-bold text-amber-400 ml-1">{currentPost.rating?.toFixed(1)}</span>
          </div>
          {currentPost.mood && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-violet/20 to-brand-pink/20 text-brand-pink border border-brand-pink/30 font-medium">
              ✨ {currentPost.mood}
            </span>
          )}
        </div>

        {/* Headline */}
        {currentPost.headline && (
          <Link to={`/post/${currentPost.id}`} className="block group/head">
            <h3 className="text-base font-bold text-white font-display group-hover/head:text-brand-purple transition-colors">
              {currentPost.headline}
            </h3>
          </Link>
        )}

        {/* Review Text */}
        {currentPost.review && (
          <Link to={`/post/${currentPost.id}`} className="block group/rev">
            <p className="text-sm text-slate-300 leading-relaxed font-normal group-hover/rev:text-white transition-colors">
              {currentPost.review}
            </p>
          </Link>
        )}

        {/* Favorite Lyric Highlight */}
        {currentPost.favoriteLyric && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 border-l-4 border-brand-purple my-3">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm italic text-slate-200 font-medium">
                "{currentPost.favoriteLyric}"
              </p>
            </div>
          </div>
        )}

        {/* Vibe Tags */}
        {(currentPost.vibeTags || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentPost.vibeTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onTagClick(tag)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-dark-850 text-brand-purple hover:bg-brand-purple/20 hover:text-white border border-brand-purple/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Bar & Comments Trigger */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        {/* Emoji Reactions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {REACTION_CONFIG.map(({ key, label, emoji }) => {
            const userList = reactions[key] || [];
            const count = userList.length;
            const hasReacted = user ? userList.includes(user.id) : false;

            return (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  hasReacted
                    ? 'bg-brand-purple/30 text-white border border-brand-purple/50 scale-105 shadow-sm'
                    : count > 0
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    : 'bg-transparent text-slate-400 hover:bg-white/5'
                }`}
                title={label}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="font-mono text-[11px]">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Comment Drawer Button */}
        <button
          onClick={toggleCommentsDrawer}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
            showComments ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount} {commentsCount === 1 ? 'Thought' : 'Thoughts'}</span>
        </button>
      </div>

      {/* Copied link toast */}
      {copiedLink && (
        <div className="absolute top-3 right-3 bg-brand-purple text-white text-xs px-3 py-1 rounded-full shadow-lg animate-in fade-in">
          Link copied!
        </div>
      )}

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Discussion & Music Opinions
          </h5>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder={user ? "Share your thoughts on this track..." : "Sign in to join discussion"}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              disabled={!user || submittingComment}
              className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
            />
            <button
              type="submit"
              disabled={!user || !commentInput.trim() || submittingComment}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-purple text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {loadingComments ? (
              <p className="text-xs text-slate-500 text-center py-2">Loading conversation...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">No thoughts shared yet. Be the first to start the vibe!</p>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="p-3 rounded-2xl bg-dark-900/80 border border-white/5 flex items-start gap-2.5">
                  <img
                    src={comm.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={comm.author?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{comm.author?.name}</p>
                      <span className="text-[10px] text-slate-500">Just now</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{comm.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Post Modal with Locked Track */}
      <EditPostModal
        post={currentPost}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onPostUpdated={(updated) => {
          setCurrentPost(updated);
          if (onPostUpdated) onPostUpdated(updated);
        }}
        onPostDeleted={(deletedId) => {
          if (onPostDeleted) onPostDeleted(deletedId);
        }}
      />

    </article>
  );
};
