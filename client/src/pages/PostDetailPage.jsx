import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { ArrowLeft, Disc3 } from 'lucide-react';
import { getFirestorePostById } from '../services/firestoreService';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    try {
      const fetched = await getFirestorePostById(id);
      if (!fetched) {
        throw new Error('Post not found');
      }
      setPost(fetched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-2xl mx-auto">
        <Disc3 className="w-10 h-10 text-brand-purple animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading music vibe...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-lg mx-auto my-12">
        <h3 className="text-xl font-bold text-white font-display">Vibe Not Found</h3>
        <p className="text-xs text-slate-400">This post may have been deleted or the link is invalid.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold transition-all shadow"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto animate-in fade-in duration-200">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </button>

      <PostCard
        post={post}
        defaultShowComments={true}
        onTagClick={(tag) => navigate(`/?genre=${encodeURIComponent(tag.replace('#', ''))}`)}
        onAuthorClick={(uid) => navigate(`/profile/${post.author?.username || post.userId}`)}
        onOpenEditProfile={() => navigate('/settings')}
        onPostUpdated={(updated) => setPost(updated)}
        onPostDeleted={() => navigate('/')}
      />
    </div>
  );
};
