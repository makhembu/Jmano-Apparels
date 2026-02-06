import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { BlogComment } from '../../types';

interface BlogCommentsProps {
  postId: string;
  initialLikes: number;
}

const LIKES_STORAGE_KEY = 'jambo_blog_likes';

export const BlogComments: React.FC<BlogCommentsProps> = ({ postId, initialLikes }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const fetchComments = useCallback(async () => {
    try {
      const data = await api.getBlogComments(postId);
      setComments(data);
    } catch (e) {
      console.error("Failed to fetch comments", e);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
    // Check local storage for like status
    const likedPosts = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || '[]');
    if (likedPosts.includes(postId)) {
        setHasLiked(true);
    }
  }, [fetchComments, postId]);

  const handleLike = async () => {
    if (hasLiked) return; // Already liked on this device
    
    setHasLiked(true);
    setLikes(prev => prev + 1);

    try {
      await api.incrementBlogPostLike(postId);
      // On success, save to local storage
      const likedPosts = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || '[]');
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...likedPosts, postId]));
    } catch (e) {
      // Revert on error
      setLikes(prev => prev - 1);
      setHasLiked(false);
      showToast("Could not register like.", "error");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return showToast("Please sign in to comment.", "info");
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.addBlogComment(postId, user.id, newComment);
      setNewComment('');
      showToast("Your testimony has been shared!", "success");
      fetchComments(); // Refresh comments
    } catch (e) {
      showToast("Failed to post comment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b border-t border-slate-100 py-8">
        <h3 className="text-2xl font-serif font-bold text-brand-dark">Join the Conversation</h3>
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all group ${hasLiked ? 'bg-brand-testament border-brand-testament text-white cursor-default' : 'bg-white border-slate-200 text-slate-500 hover:border-brand-testament hover:text-brand-testament'}`}
        >
          <svg className={`w-5 h-5 transition-colors ${hasLiked ? 'text-white' : 'text-slate-400 group-hover:text-brand-testament'}`} fill={hasLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
          <span className="font-bold text-sm">{likes}</span>
        </button>
      </div>

      {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-12">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts on this..."
            className="w-full border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-green/20"
          />
          <div className="text-right mt-4">
            <Button type="submit" isLoading={submitting} disabled={!newComment.trim()}>Post Comment</Button>
          </div>
        </form>
      ) : (
        <div className="mb-12 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800">Sign in to share your testimony.</h4>
            <p className="text-sm text-slate-500 mt-2">Join the Jambo family to engage with our community.</p>
            <Link to="/login">
                <Button className="mt-4">Sign In</Button>
            </Link>
        </div>
      )}

      <div className="space-y-8">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold flex-shrink-0">
              {comment.user.name?.[0] || '?'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-slate-900">{comment.user.name}</span>
                <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600 mt-1 text-base">{comment.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
