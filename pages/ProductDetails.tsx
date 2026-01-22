
import React, { useState, useEffect } from 'react';
// Fix: Added Link to the imports from react-router-dom to resolve "Cannot find name 'Link'" errors
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/db';
import { ProductReview, Order } from '../types';

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
    // Visual feedback delay
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">
        {/* Image Gallery Mock */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <img src={product.image} alt={product.title} className="w-full h-full object-center object-cover" />
            <button 
              onClick={handleWishlist} 
              className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95"
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

        {/* Product Details */}
        <div className="mt-10 lg:mt-0">
          <nav className="flex mb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
            <Link to="/shop" className="hover:text-brand-green">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-green">{category?.label || product.categoryKey}</span>
          </nav>
          
          <h1 className="text-4xl font-extrabold text-gray-900 font-serif mb-4 leading-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <p className="text-3xl text-brand-green font-bold">£{product.price.toFixed(2)}</p>
            {product.isOnSale && product.salePrice && (
              <p className="text-xl text-gray-400 line-through">£{product.salePrice.toFixed(2)}</p>
            )}
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 border-b pb-6">
            <p className="text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-8">
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color 
                        ? 'bg-brand-dark text-white border-brand-dark shadow-md ring-2 ring-brand-green ring-offset-2' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-green'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Select Size</h3>
                <button className="text-xs text-brand-green hover:underline">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-lg border flex items-center justify-center text-sm font-bold uppercase transition-all ${
                      selectedSize === size 
                      ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-brand-green'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and CTA */}
            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
                 <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-32">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-12 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold border-r"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      readOnly 
                      className="w-12 h-12 text-center text-sm font-bold bg-white"
                    />
                    <button 
                      onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                      className="w-10 h-12 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold border-l"
                    >
                      +
                    </button>
                 </div>
              </div>
              
              <div className="flex-[2]">
                <Button 
                  onClick={handleAddToCart} 
                  isLoading={isAdding} 
                  fullWidth 
                  disabled={isOutOfStock}
                  variant={isOutOfStock ? 'outline' : 'primary'}
                  className="h-12 rounded-lg"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
            
            {stock > 0 && (
              <p className={`text-xs font-medium ${lowStock ? 'text-orange-600' : 'text-green-600'}`}>
                {lowStock ? `Hurry! Only ${stock} left in stock.` : `In stock and ready to ship.`}
              </p>
            )}
          </div>
          
          {/* Trust Badges */}
          <div className="mt-10 grid grid-cols-2 gap-4 py-6 border-t border-gray-100">
             <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-green font-bold text-sm">✓</span>
                <span>Fast UK Delivery</span>
             </div>
             <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-green font-bold text-sm">↺</span>
                <span>30-Day Returns</span>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Content / Tabs */}
      <div className="mt-16 border-t pt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-6">Customer Reflections</h2>
          <p className="text-gray-600 mb-12 italic">Join the community of believers sharing their testimony through fashion.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
                  <p className="text-gray-400">Be the first to share your testimony for this piece.</p>
                </div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex text-brand-hope text-lg">
                        {'★'.repeat(r.rating || 0)}{'☆'.repeat(5-(r.rating || 0))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{r.title}</h4>
                    <p className="text-gray-600 italic">"{r.comment}"</p>
                    {r.verifiedPurchase && (
                      <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-brand-green uppercase tracking-widest">
                        <span className="w-4 h-4 bg-brand-green text-white rounded-full flex items-center justify-center text-[8px]">✓</span>
                        Verified Purchase
                      </div>
                    )}
                  </div>
                ))
              )}
           </div>

           <div className="bg-brand-light/30 p-8 rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold text-brand-dark mb-6">Write a Reflection</h3>
              {user ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api.addProductReview({ productId: product.id, userId: user.id, rating, comment, title: 'Reflection' });
                    setComment('');
                    showToast('Thank you for your reflection!', 'success');
                    api.getProductReviews(product.id).then(setReviews);
                  } catch(e) { showToast('Submission failed', 'error'); }
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rating</label>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(star => (
                         <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${rating >= star ? 'text-brand-hope' : 'text-gray-300'}`}>★</button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Thoughts</label>
                    <textarea 
                      value={comment} 
                      onChange={e => setComment(e.target.value)} 
                      rows={4} 
                      required
                      className="w-full rounded-lg border-gray-200 p-3 text-sm focus:ring-brand-green focus:border-brand-green bg-white"
                      placeholder="How has this piece blessed you?"
                    />
                  </div>
                  <Button type="submit" fullWidth>Submit Reflection</Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Please sign in to share your reflection.</p>
                  <Link to="/login" className="text-brand-green font-bold hover:underline">Sign In &rarr;</Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
