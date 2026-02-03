
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
  
  // FIX: Lookup product by ID OR Slug to support SEO-friendly URLs
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
        setShowStickyBar(buySectionRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#reviews' && reviewsRef.current) {
      // Small tick to allow layout to settle
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

    // REMOVED: Artificial 400ms delay. Action should be instant.
    addToCart(product, selectedSize, quantity, selectedColor);
    
    if (redirect) {
      navigate('/cart');
    } else {
      setIsAdding(false);
      // Optional: Add a small visual feedback logic here if needed, but not blocking.
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

  // Calculate dynamic top position for sticky gallery based on header height
  const hasAnnouncement = settings.isAnnouncementEnabled && settings.announcementText;
  const galleryTopClass = hasAnnouncement ? 'lg:top-[8.5rem]' : 'lg:top-24';

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found. <Link to="/shop" className="text-brand-green underline">Back to Shop</Link></div>;

  return (
    <div className="bg-slate-50 min-h-screen">
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
          },
          "aggregateRating": product.reviewCount && product.reviewCount > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.averageRating,
            "reviewCount": product.reviewCount
          } : undefined
        }}
      />

      <MobileStickyBar 
        product={product} 
        show={showStickyBar && !isExpanded} 
        onAddToCart={() => handleAddToCart(false)}
      />

      <header className="relative bg-brand-dark pt-12 pb-32 md:pt-24 md:pb-40 overflow-hidden text-center border-b border-brand-green/20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-hope/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <Link to="/shop" className="inline-block">
            <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-6 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer">
              Back to Collection
            </span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            {category?.label || 'Ethically Threaded'}
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic border-l-4 md:border-l-0 border-brand-hope pl-6 md:pl-0">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-20 animate-fade-in">
        <div className="mb-8 hidden md:block">
          <BackButton className="text-white hover:text-brand-hope" />
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 items-start">
          {/* Dynamic sticky class for Desktop Gallery */}
          <div className={`lg:col-span-6 lg:sticky ${galleryTopClass} transition-all duration-300`}>
            <ProductImageGallery 
              product={product}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onImageExpand={handleImageExpand}
            />
          </div>
          
          <div className="lg:col-span-6 mt-12 lg:mt-0">
            <div className="bg-white lg:p-10 p-6 rounded-[2.5rem] lg:border border-slate-100 lg:shadow-xl lg:shadow-slate-200/40">
              <ProductInfo product={product} category={category} />
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
            </div>
          </div>
        </div>

        <ProductShare product={product} />
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
