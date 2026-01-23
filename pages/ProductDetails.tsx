import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BackButton } from '../components/ui/BackButton';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/db';
import { useCart } from '../context/CartContext';

// Import newly created components
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { ProductPurchaseForm } from '../components/product/ProductPurchaseForm';
import { ProductDetailsSection } from '../components/product/ProductDetailsSection';
import { ProductShare } from '../components/product/ProductShare';
import { SimilarProducts } from '../components/product/SimilarProducts';
import { ProductReviews } from '../components/product/ProductReviews';
import { MobileStickyBar } from '../components/product/MobileStickyBar';
import { ImageExpandModal } from '../components/product/ImageExpandModal';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories, loading } = useShop();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const product = products.find(p => p.id === id);
  const category = categories.find(c => c.key === product?.categoryKey);

  // State lifted from form to be shared with MobileStickyBar
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isOrderingNow, setIsOrderingNow] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);
  
  const buySectionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  useEffect(() => {
     if (id && user) {
        api.getWishlist(user.id).then(ids => setIsWishlisted(ids.includes(id))).catch(console.error);
     }
  }, [id, user]);

  useEffect(() => {
    if (product) {
      document.title = product.seoTitle || `${product.title} | Jambo Apparels`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', product.seoDescription || product.description.substring(0, 160));
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && product.images && product.images.length > 0) {
        ogImage.setAttribute('content', product.images[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        setShowStickyBar(buySectionRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#reviews' && reviewsRef.current) {
      setTimeout(() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash, loading]);

  const handleWishlistToggle = useCallback(async () => {
     if (!user || !product) { showToast('Please sign in to save items', 'info'); return; }
     const added = await api.toggleWishlist(user.id, product.id);
     setIsWishlisted(added);
     showToast(added ? 'Saved to wishlist' : 'Removed from wishlist', 'success');
  }, [user, showToast, product]);
  
  const handleAddToCart = useCallback(async (redirect: boolean = false) => {
    if (!product || (product.stockQuantity ?? 0) <= 0) return;
    
    if (!selectedSize || (product.colors?.length && !selectedColor)) {
      if (window.innerWidth < 768 && optionsRef.current) {
        optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        optionsRef.current.classList.add('ring-4', 'ring-brand-green/20');
        setTimeout(() => optionsRef.current?.classList.remove('ring-4', 'ring-brand-green/20'), 2000);
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
  }, [product, selectedSize, selectedColor, quantity, showToast, addToCart, navigate]);

  const handleImageExpand = (index: number) => {
    setExpandedImageIndex(index);
    setIsExpanded(true);
  };

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.categoryKey === product.categoryKey && p.id !== product.id && p.isPublished !== false).slice(0, 4);
  }, [products, product]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found. <Link to="/shop" className="text-brand-green underline">Back to Shop</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      <MobileStickyBar 
        product={product} 
        show={showStickyBar && !isExpanded} 
        onAddToCart={() => handleAddToCart(false)}
      />
      
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 items-start">
        {/* Left Column: Image Gallery - Now Sticky to reduce dead space */}
        <div className="lg:col-span-7 lg:sticky lg:top-28">
          <ProductImageGallery 
            product={product}
            isWishlisted={isWishlisted}
            onWishlistToggle={handleWishlistToggle}
            onImageExpand={handleImageExpand}
          />
        </div>
        
        {/* Right Column: Information and Purchase */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
          <div className="bg-white lg:p-8 rounded-[2.5rem] lg:border border-slate-100 lg:shadow-xl lg:shadow-slate-200/40">
            <ProductInfo product={product} category={category} />
            <ProductPurchaseForm 
              product={product} 
              buySectionRef={buySectionRef}
              optionsRef={optionsRef}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              quantity={quantity}
              setQuantity={setQuantity}
              handleAddToCart={handleAddToCart}
              isAdding={isAdding}
              isOrderingNow={isOrderingNow}
            />
            <ProductDetailsSection />
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <ProductShare product={product} />
      <SimilarProducts similarProducts={similarProducts} />
      <ProductReviews productId={product.id} user={user} reviewsRef={reviewsRef} />

      {isExpanded && (
        <ImageExpandModal 
          images={product.images || []} 
          startIndex={expandedImageIndex} 
          productTitle={product.title} 
          onClose={() => setIsExpanded(false)} 
        />
      )}
    </div>
  );
};