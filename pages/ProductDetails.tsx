import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
     if (id) {
        api.getProductReviews(id).then(setReviews).catch(console.error);
        if (user) {
           api.getWishlist(user.id).then(ids => setIsWishlisted(ids.includes(id))).catch(console.error);
           api.getOrders(user.id).then(setUserOrders).catch(console.error);
        }
     }
  }, [id, user]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center">Product not found</div>;

  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    if (!selectedSize) {
      showToast("Please select a size", 'error');
      return;
    }
    // Check if colors exist and one is selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showToast("Please select a color", 'error');
      return;
    }

    if (quantity > stock) {
       showToast(`Only ${stock} items available`, 'error');
       return;
    }

    setIsAdding(true);
    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addToCart(product, selectedSize, quantity, selectedColor);
    
    setIsAdding(false);
    
    // UX Requirement: Do NOT redirect. Show Toast with action to go to cart.
    showToast(`Added to cart: ${product.title}`, 'success', {
       label: 'CHECKOUT NOW',
       onClick: () => navigate('/cart')
    });
  };

  const handleWishlist = async () => {
     if (!user) { showToast('Login required', 'info'); return; }
     const added = await api.toggleWishlist(user.id, product.id);
     setIsWishlisted(added);
     showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
  };

  const submitReview = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user) return;
     
     // Verify purchase
     const hasPurchased = userOrders.some(o => 
        o.products.some(p => p.productId === product.id)
     );

     try {
        await api.addProductReview({
           productId: product.id,
           userId: user.id,
           rating,
           comment,
           title: 'Customer Review',
           verifiedPurchase: hasPurchased
        });
        setComment('');
        showToast('Review submitted!', 'success');
        const updated = await api.getProductReviews(product.id);
        setReviews(updated);
     } catch (e) {
        showToast('Failed to submit review', 'error');
     }
  };

  return (
    <>
      <Helmet>
        <title>{product.seoTitle || product.title} | Jambo Apparels</title>
        <meta name="description" content={product.seoDescription || product.description} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative">
            <img src={product.image} alt={product.title} className="w-full h-full object-center object-cover" />
            <button onClick={handleWishlist} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-transform hover:scale-110">
               {isWishlisted ? <span className="text-red-500">♥</span> : '♡'}
            </button>
          </div>

          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif">{product.title}</h1>
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium mt-3 ${category?.bgColorClass || 'bg-gray-100'} text-white`}>
               {category?.label || product.categoryKey}
            </span>
            <div className="mt-4 flex items-baseline gap-3">
              {product.salePrice ? (
                 <>
                   <p className="text-3xl text-red-600 font-bold">£{product.salePrice.toFixed(2)}</p>
                   <p className="text-xl text-gray-400 line-through">£{product.price.toFixed(2)}</p>
                 </>
              ) : (
                 <p className="text-3xl text-brand-green font-bold">£{product.price.toFixed(2)}</p>
              )}
            </div>
            
            <p className="mt-6 text-base text-gray-700">{product.description}</p>

            <div className="mt-4">
               {isOutOfStock ? (
                  <span className="text-red-600 font-bold">Out of Stock</span>
               ) : (
                  <span className={`${lowStock ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                     {lowStock ? `Only ${stock} left in stock` : 'In Stock'}
                  </span>
               )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-medium text-gray-900">Color</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`border rounded-md py-2 px-4 text-sm font-medium transition-colors ${selectedColor === color ? 'bg-brand-dark text-white ring-2 ring-offset-2 ring-brand-green' : 'bg-white hover:bg-gray-50 text-gray-900'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm font-medium text-gray-900">Size</h2>
              <div className="grid grid-cols-4 gap-4 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-md py-3 text-sm font-medium uppercase transition-colors ${selectedSize === size ? 'bg-brand-dark text-white' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
               <input 
                 type="number" 
                 min="1" 
                 max={stock} 
                 value={quantity} 
                 onChange={(e) => setQuantity(Math.min(stock, Math.max(1, +e.target.value)))} 
                 disabled={isOutOfStock}
                 className="w-24 border rounded-md p-2 text-center bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400" 
               />
               <Button 
                 onClick={handleAddToCart} 
                 isLoading={isAdding} 
                 fullWidth 
                 disabled={isOutOfStock}
                 variant={isOutOfStock ? 'outline' : 'primary'}
               >
                 {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
               </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t pt-10">
           <h2 className="text-2xl font-bold font-serif mb-6">Customer Reviews ({reviews.length})</h2>
           
           {user && (
              <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-lg mb-8">
                 <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                 <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <select value={rating} onChange={e => setRating(+e.target.value)} className="border rounded p-2 bg-white text-gray-900">
                       <option value="5">5 - Excellent</option>
                       <option value="4">4 - Good</option>
                       <option value="3">3 - Average</option>
                       <option value="2">2 - Poor</option>
                       <option value="1">1 - Terrible</option>
                    </select>
                 </div>
                 <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Comment</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full border rounded p-2 bg-white text-gray-900" required />
                 </div>
                 <Button type="submit">Submit Review</Button>
              </form>
           )}

           <div className="space-y-6">
              {reviews.length === 0 ? <p className="text-gray-500">No reviews yet.</p> : reviews.map(r => (
                 <div key={r.id} className="border-b pb-6">
                    <div className="flex items-center mb-2">
                       <div className="flex text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                       <span className="ml-2 font-bold text-gray-900">{r.title}</span>
                    </div>
                    <p className="text-gray-600">{r.comment}</p>
                    <p className="text-sm text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()} {r.verifiedPurchase && '• Verified Purchase'}</p>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </>
  );
};