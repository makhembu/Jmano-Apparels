import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// @ts-ignore
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BackButton } from '../components/ui/BackButton';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/db';
import { useCart } from '../context/CartContext';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { ProductPurchaseForm } from '../components/product/ProductPurchaseForm';
import { ProductDetailsSection } from '../components/product/ProductDetailsSection';
import { ProductShare } from '../components/product/ProductShare';
import { SimilarProducts } from '../components/product/SimilarProducts';
import { ProductReviews } from '../components/product/ProductReviews';
import { MobileStickyBar } from '../components/product/MobileStickyBar';
import { ImageExpandModal } from '../components/product/ImageExpandModal';
import { SEO } from '../components/SEO';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories, settings, loading } = useShop();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const product = products.find(p => p.id === id || p.slug === id);
  const category = categories.find(c => c.key === product?.categoryKey);

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
     if (product && user) {
        api.getWishlist(user.id).then(ids => setIsWishlisted(ids.includes(product.id))).catch(console.error);
     }
  }, [product, user]);

  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        // Show sticky bar when the buy section scrolls out of view at the top
        const rect = buySectionRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#reviews' && reviewsRef.current) {
      requestAnimationFrame(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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

  const hasAnnouncement = settings.isAnnouncementEnabled && settings.announcementText;
  // Increased top spacing for desktop sticky behavior
  const galleryTopClass = hasAnnouncement ? 'lg:top-[10rem]' : 'lg:top-32';

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found. <Link to="/shop" className="text-brand-green underline">Back to Shop</Link></div>;

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={product.seoTitle || product.title}
        description={product.seoDescription || product.description.substring(0, 160)}
        image={product.images[0]}
        type="product"
        canonical={product.canonicalUrl}
        noindex={product.isNoIndex}
        nofollow={product.isNoFollow}
        keywords={product.keywords}
        schema={{
          "@type": "Product",
          "name": product.title,
          "image": product.images,
          "description": product.description,
          "sku": product.sku || product.id,
          "brand": { "@type": "Brand", "name": "Jambo Apparels" },
          "offers": {
            "@type": "Offer",
            "url": `https://jamboapparels.com/#/product/${product.slug || product.id}`,
            "priceCurrency": settings.currency || "GBP",
            "price": product.isOnSale ? product.salePrice : product.price,
            "availability": (product.stockQuantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }}
      />

      <MobileStickyBar 
        product={product} 
        show={showStickyBar && !isExpanded} 
        onAddToCart={() => handleAddToCart(false)}
      />

      {/* Breadcrumb Navigation - Desktop Only */}
      <div className="hidden lg:block border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-4">
           <nav className="flex text-xs font-medium text-gray-500 uppercase tracking-widest">
              <Link to="/" className="hover:text-brand-dark">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/shop" className="hover:text-brand-dark">Shop</Link>
              <span className="mx-2">/</span>
              <span className="text-brand-green font-bold">{product.title}</span>
           </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative z-20 animate-fade-in">
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-6">
           <BackButton to="/shop" />
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 items-start">
          
          {/* Left Column: Gallery (Sticky on Desktop) */}
          <div className={`lg:col-span-7 lg:sticky ${galleryTopClass} self-start transition-all duration-300`}>
            <ProductImageGallery 
              product={product}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onImageExpand={handleImageExpand}
            />
          </div>
          
          {/* Right Column: Details */}
          <div className="lg:col-span-5 mt-12 lg:mt-0">
            <div className="relative">
              <ProductInfo product={product} category={category} />
              
              <div className="my-10 h-px bg-gray-100"></div>

              <ProductPurchaseForm 
                product={product}
                category={category}
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
              
              <ProductShare product={product} />
            </div>
          </div>
        </div>

        <SimilarProducts similarProducts={similarProducts} />
        {settings.enableReviews && (
          <ProductReviews productId={product.id} user={user} reviewsRef={reviewsRef} />
        )}
      </div>

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