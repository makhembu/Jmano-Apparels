import React, { useState, useEffect } from 'react';
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
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
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

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found. <Link to="/shop" className="text-brand-green underline">Back to Shop</Link></div>;

  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  // Similar Products Logic
  const similarProducts = products
    .filter(p => p.categoryKey === product.categoryKey && p.id !== product.id && p.isPublished !== false)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (!selectedSize) {
      showToast("Please select a size", 'error');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showToast("Please select a color", 'error');
      return;
    }

    setIsAdding(true);
    // Simulate brief network delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 400));
    addToCart(product, selectedSize, quantity, selectedColor);
    setIsAdding(false);
    showToast(`Added to cart: ${product.title}`, 'success', {
       label: 'GO TO CART',
       onClick: () => navigate('/cart')
    });
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
      // Refresh reviews
      const updatedReviews = await api.getProductReviews(product.id);
      setReviews(updatedReviews);
    } catch (e) {
      showToast('Failed to post review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Back Button for Touch Users */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-green mb-6 transition-colors group"
      >
        <svg className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <img src={product.image} alt={product.title} className="w-full h-full object-center object-cover" />
            <button 
              onClick={handleWishlist} 
              className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
               {isWishlisted ? <span className="text-red-500 text-xl">♥</span> : <span className="text-gray-400 text-xl">♡</span>}
            </button>
            {product.isOnSale && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                SALE
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-10 lg:mt-0">
          <div className="flex justify-between items-start">
            <div>
              <nav className="flex mb-4 text-xs font-medium text-gray-500 uppercase tracking-widest" aria-label="Breadcrumb">
                <Link to="/shop" className="hover:text-brand-green">Shop</Link>
                <span className="mx-2">/</span>
                <span className="text-brand-green">{category?.label}</span>
              </nav>
              <h1 className="text-3xl font-serif font-bold text-brand-dark leading-tight">{product.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-green">£{product.price.toFixed(2)}</p>
              {product.isOnSale && product.salePrice && (
                <p className="text-sm text-gray-400 line-through">was £{product.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-4 font-light leading-relaxed">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {/* Color Picker */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${
                        selectedColor === color 
                        ? 'border-brand-green bg-brand-light text-brand-green shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-12 flex items-center justify-center rounded-md text-sm font-bold border-2 transition-all ${
                      selectedSize === size 
                      ? 'border-brand-green bg-brand-green text-white shadow-md' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-gray-300 rounded-md bg-white w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-500 hover:text-brand-green transition"
                >
                  -
                </button>
                <span className="px-4 font-bold text-gray-900 w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-500 hover:text-brand-green transition"
                >
                  +
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                isLoading={isAdding}
                disabled={isOutOfStock}
                fullWidth
                className="h-12 text-lg font-bold"
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </Button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {isOutOfStock ? (
                <span className="text-red-500 font-bold uppercase tracking-widest">Out of Stock</span>
              ) : lowStock ? (
                <span className="text-orange-600 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></span>
                  Only {stock} left - order soon!
                </span>
              ) : (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-600"></span>
                  In Stock & ready to ship
                </span>
              )}
            </div>
          </div>

          {/* Key Features / Values */}
          <div className="mt-12 border-t border-gray-100 pt-8 grid grid-cols-2 gap-4">
             <div className="flex items-start gap-3">
                <div className="text-brand-green text-xl">✓</div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Ethically Threaded</p>
                   <p className="text-xs text-gray-500">Premium materials, made with care.</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <div className="text-brand-green text-xl">✓</div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Divinely Inspired</p>
                   <p className="text-xs text-gray-500">Every design based on scripture.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <section className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(similar => (
              <ProductCard key={similar.id} product={similar} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="mt-20 border-t pt-12 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-10">Customer Testimonies</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Summary */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-2xl text-center">
              <p className="text-5xl font-bold text-brand-dark mb-2">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
                  : '0.0'}
              </p>
              <div className="text-yellow-500 text-xl mb-4">★★★★★</div>
              <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2 space-y-8">
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet. Be the first to share your testimony!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">{review.title}</span>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-yellow-500 text-sm mb-2">
                    {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                  </div>
                  <p className="text-gray-600 text-sm italic font-light">"{review.comment}"</p>
                  {review.verifiedPurchase && (
                    <span className="mt-2 inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                      Verified Purchase
                    </span>
                  )}
                </div>
              ))
            )}

            {/* Review Form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-4">Share Your Experience</h4>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Rating</label>
                  <select 
                    value={rating} 
                    onChange={e => setRating(+e.target.value)}
                    className="w-full border rounded p-2 bg-white"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Testimony</label>
                  <textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    placeholder="How does this apparel inspire you?"
                    className="w-full border rounded p-3 text-sm focus:ring-brand-green"
                    required
                  />
                </div>
                <Button type="submit" isLoading={isSubmittingReview} variant="outline" fullWidth>Post Review</Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
