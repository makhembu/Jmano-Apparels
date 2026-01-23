import React, { useState, useEffect, useCallback } from 'react';
import { User, ProductReview } from '../../types';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

interface ProductReviewsProps {
  productId: string;
  user: User | null;
  reviewsRef: React.RefObject<HTMLElement>;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, user, reviewsRef }) => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
     if (productId) {
        api.getProductReviews(productId).then(setReviews).catch(console.error);
     }
  }, [productId]);

  const handleReviewSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showToast('Sign in to leave a review', 'info'); return; }
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.addProductReview({ productId, userId: user.id, rating, title: 'Customer Review', comment, verifiedPurchase: true });
      setComment('');
      setRating(5);
      showToast('Thank you for your feedback!', 'success');
      const updatedReviews = await api.getProductReviews(productId);
      setReviews(updatedReviews);
    } catch (e) {
      showToast('Failed to post review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  }, [user, showToast, comment, rating, productId]);
  
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) : 0;

  return (
    <section ref={reviewsRef} id="reviews" className="mt-32 border-t border-slate-100 pt-20 max-w-4xl mx-auto pb-10">
      <h2 className="text-4xl font-serif font-bold text-brand-dark mb-12 text-center">Community Testimonies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-xl shadow-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Average Rating</p>
            <p className="text-6xl font-serif font-bold text-brand-dark mb-2">{avgRating.toFixed(1)}</p>
            <div className="text-amber-400 text-2xl mb-4">{'★'.repeat(Math.round(avgRating)) || '☆☆☆☆☆'}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">From {reviews.length} Believers</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-12">
          {reviews.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 font-serif italic text-lg">No testimonies journalled yet.</p>
              <p className="text-xs text-slate-300 mt-2 uppercase tracking-widest">Be the first to share your journey</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b border-slate-50 pb-10 last:border-0 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block font-black text-slate-900 uppercase tracking-widest text-sm">{review.title}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="text-amber-400 text-sm tracking-tighter">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
                </div>
                <p className="text-slate-600 font-light leading-relaxed italic text-lg">"{review.comment}"</p>
                {review.verifiedPurchase && (
                  <div className="mt-4 flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-brand-green"></span>
                     <span className="text-[9px] font-black text-brand-green uppercase tracking-[0.2em]">Verified Ambassador</span>
                  </div>
                )}
              </div>
            ))
          )}

          {user && (
            <form onSubmit={handleReviewSubmit} className="mt-16 bg-brand-light/20 p-8 rounded-[2rem] border border-brand-green/10 shadow-inner">
              <h4 className="font-serif font-bold text-2xl text-brand-dark mb-6">Share Your Testimony</h4>
              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Spiritual Impact (Rating)</label>
                <select value={rating} onChange={e => setRating(+e.target.value)} className="w-full border-none bg-white rounded-2xl p-4 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm focus:ring-2 focus:ring-brand-green/10 outline-none">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Story</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="How does this apparel inspire your walk with the Lord?" className="w-full border-none bg-white rounded-3xl p-6 text-sm text-slate-700 font-light leading-relaxed shadow-sm focus:ring-2 focus:ring-brand-green/10 outline-none" required />
              </div>
              <Button type="submit" isLoading={isSubmittingReview} className="rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10">Post Testimony</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
