import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/db';
import { ProductReview } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, loading } = useShop();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const product = products.find(p => p.id === id);
  const category = categories.find(c => c.key === product?.categoryKey);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isOrderingNow, setIsOrderingNow] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Mobile Sticky Bar Logic
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buySectionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Image Expansion State
  const [isExpanded, setIsExpanded] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
     if (id) {
        api.getProductReviews(id).then(setReviews).catch(console.error);
        if (user) {
           api.getWishlist(user.id).then(ids => setIsWishlisted(ids.includes(id))).catch(console.error);
        }
     }
  }, [id, user]);

  // Dynamic Product SEO
  useEffect(() => {
    if (product) {
      const title = product.seoTitle || `${product.title} | Jambo Apparels`;
      const desc = product.seoDescription || product.description.substring(0, 160);
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && product.image) ogImage.setAttribute('content', product.image);
    }
  }, [product]);

  // Sticky Bar Visibility Observer
  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        const rect = buySectionRef.current.getBoundingClientRect();
        // Show bar when the main buy button is scrolled out of view
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found. <Link to="/shop" className="text-brand-green underline">Back to Shop</Link></div>;

  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  const similarProducts = products
    .filter(p => p.categoryKey === product.categoryKey && p.id !== product.id && p.isPublished !== false)
    .slice(0, 4);

  const handleAddToCart = async (redirect: boolean = false) => {
    if (isOutOfStock) return;
    
    if (!selectedSize || (product.colors?.length && !selectedColor)) {
      if (window.innerWidth < 768) {
        // Smooth scroll to options on mobile if not selected
        optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse the options area to guide the user
        const el = optionsRef.current;
        if (el) {
           el.classList.add('ring-4', 'ring-brand-green/20');
           setTimeout(() => el.classList.remove('ring-4', 'ring-brand-green/20'), 2000);
        }
      }
      showToast(product.colors?.length ? "Please select size and color" : "Please select a size", 'error');
      return;
    }

    if (redirect) setIsOrderingNow(true);
    else setIsAdding(true);

    await new Promise(resolve => setTimeout(resolve, 400));
    addToCart(product, selectedSize, quantity, selectedColor);
    
    if (redirect) {
      navigate('/cart');
    } else {
      setIsAdding(false);
      showToast(`Added to cart: ${product.title}`, 'success', {
         label: 'GO TO CART',
         onClick: () => navigate('/cart')
      });
    }
  };

  const handleWishlist = async () => {
     if (!user) { showToast('Please sign in to save items', 'info'); return; }
     const added = await api.toggleWishlist(user.id, product.id);
     setIsWishlisted(added);
     showToast(added ? 'Saved to wishlist' : 'Removed from wishlist', 'success');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showToast('Sign in to leave a review', 'info'); return; }
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.addProductReview({
        productId: product.id,
        userId: user.id,
        rating,
        title: 'Customer Review',
        comment,
        verifiedPurchase: true
      });
      setComment('');
      setRating(5);
      showToast('Thank you for your feedback!', 'success');
      const updatedReviews = await api.getProductReviews(product.id);
      setReviews(updatedReviews);
    } catch (e) {
      showToast('Failed to post review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      
      {/* MOBILE STICKY TOP PURCHASE BAR - PREVENTS CLASH WITH FAB & BOTTOM NAV */}
      <div 
        className={`md:hidden fixed top-14 left-0 right-0 z-30 transition-all duration-500 ease-in-out transform ${showStickyBar && !isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
         <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
               <img src={product.image} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-slate-100" alt="" />
               <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tighter">{product.title}</p>
                  <p className="text-sm font-black text-brand-green">£{product.price.toFixed(2)}</p>
               </div>
            </div>
            <button 
               onClick={() => handleAddToCart(false)}
               disabled={isOutOfStock}
               className={`flex-shrink-0 h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-brand-green text-white shadow-md shadow-brand-green/10'}`}
            >
               {isOutOfStock ? 'Sold' : 'Buy Now'}
            </button>
         </div>
      </div>

      <button 
        onClick={() => navigate(-1)} 
        className="hidden md:flex items-center text-sm font-medium text-gray-500 hover:text-brand-green mb-6 transition-colors group"
      >
        <svg className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to collection
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl bg-white cursor-pointer group ring-1 ring-black/5"
            onClick={() => setIsExpanded(true)}
          >
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-center object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handleWishlist(); }} 
              className="absolute top-6 right-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95 z-20 border border-slate-100"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
               {isWishlisted ? <span className="text-red-500 text-2xl leading-none">♥</span> : <span className="text-slate-400 text-2xl leading-none">♡</span>}
            </button>
            {product.isOnSale && (
              <span className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg z-20 uppercase tracking-[0.2em]">
                Sale
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-widest">Tap to zoom</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-10 lg:mt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <nav className="flex mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]" aria-label="Breadcrumb">
                <Link to="/shop" className="hover:text-brand-green">Shop</Link>
                <span className="mx-2 opacity-30">/</span>
                <span className="text-brand-green">{category?.label}</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark leading-[1.1]">{product.title}</h1>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <p className="text-4xl font-bold text-brand-green font-serif">£{product.price.toFixed(2)}</p>
              {product.isOnSale && product.salePrice && (
                <p className="text-sm text-slate-400 line-through mt-1">Originally £{product.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Spiritually Threaded</h3>
            <div className="text-base text-slate-700 font-light leading-relaxed">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="space-y-10 transition-all duration-300 rounded-3xl" ref={optionsRef}>
            {/* Color Picker */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Choose Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                        selectedColor === color 
                        ? 'border-brand-green bg-brand-light/60 text-brand-green shadow-md scale-105' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Picker */}
            <div>
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[4rem] h-14 flex items-center justify-center rounded-2xl text-sm font-black border-2 transition-all duration-300 ${
                      selectedSize === size 
                      ? 'border-brand-green bg-brand-green text-white shadow-xl scale-105' 
                      : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4" ref={buySectionRef}>
              <div className="flex items-center border-2 border-slate-100 rounded-2xl bg-white w-full sm:w-fit h-14">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-6 h-full text-slate-400 hover:text-brand-green transition-colors text-xl font-bold"
                >
                  -
                </button>
                <span className="px-4 font-black text-slate-900 w-12 text-center text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-6 h-full text-slate-400 hover:text-brand-green transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handleAddToCart(false)}
                  isLoading={isAdding}
                  disabled={isOutOfStock || isOrderingNow}
                  variant="outline"
                  fullWidth
                  className="h-14 font-black uppercase tracking-widest text-xs rounded-2xl border-2"
                >
                  {isOutOfStock ? 'Sold Out' : 'Add to Basket'}
                </Button>

                {!isOutOfStock && (
                  <Button 
                    onClick={() => handleAddToCart(true)}
                    isLoading={isOrderingNow}
                    disabled={isAdding}
                    fullWidth
                    className="h-14 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-green/20"
                  >
                    Checkout Now
                  </Button>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 ring-1 ring-black/[0.02]">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Currently Out of Stock
                </div>
              ) : lowStock ? (
                <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
                  Low Stock: Only {stock} remaining
                </div>
              ) : (
                <div className="flex items-center gap-2 text-brand-green font-black text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  Divinely Stocked & Ready
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 border-t border-slate-100 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div className="flex items-start gap-4 p-4 rounded-3xl bg-brand-light/20 border border-brand-green/5">
                <div className="text-brand-green bg-white p-2 rounded-xl shadow-sm">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Ethically Threaded</p>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter opacity-70">Premium materials, made with integrity.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-3xl bg-brand-light/20 border border-brand-green/5">
                <div className="text-brand-green bg-white p-2 rounded-xl shadow-sm">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Divinely Inspired</p>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter opacity-70">Every design rooted in the scriptures.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <section className="mt-32 border-t border-slate-100 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
             <h2 className="text-3xl font-serif font-bold text-brand-dark">Complete the Testimony</h2>
             <Link to="/shop" className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] border-b-2 border-brand-green/20 pb-1">View Full Collection</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map(similar => (
              <ProductCard key={similar.id} product={similar} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="mt-32 border-t border-slate-100 pt-20 max-w-4xl mx-auto pb-10">
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-12 text-center">Community Testimonies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-xl shadow-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Average Rating</p>
              <p className="text-6xl font-serif font-bold text-brand-dark mb-2">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
                  : '0.0'}
              </p>
              <div className="text-amber-400 text-2xl mb-4">
                 {'★'.repeat(Math.round(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / (reviews.length || 1))) || '☆☆☆☆☆'}
              </div>
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
                    <div className="text-amber-400 text-sm tracking-tighter">
                      {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Spiritual Impact (Rating)</label>
                      <select 
                        value={rating} 
                        onChange={e => setRating(+e.target.value)}
                        className="w-full border-none bg-white rounded-2xl p-4 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm focus:ring-2 focus:ring-brand-green/10 outline-none"
                      >
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                   </div>
                </div>
                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Story</label>
                  <textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    placeholder="How does this apparel inspire your walk with the Lord?"
                    className="w-full border-none bg-white rounded-3xl p-6 text-sm text-slate-700 font-light leading-relaxed shadow-sm focus:ring-2 focus:ring-brand-green/10 outline-none"
                    required
                  />
                </div>
                <Button type="submit" isLoading={isSubmittingReview} className="rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10">Post Testimony</Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Full-Screen Image Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setIsExpanded(false)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-brand-hope transition-all z-[110] bg-white/10 p-3 rounded-full hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center">
            <img 
              src={product.image} 
              alt={product.title} 
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-8 text-center px-6">
              <h2 className="text-white font-serif text-2xl font-bold">{product.title}</h2>
              <p className="text-brand-light/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Jambo Apparels Collection</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
