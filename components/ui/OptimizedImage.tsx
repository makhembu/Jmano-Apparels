import React, { useState } from 'react';
// @ts-ignore
import ReactLazyLoad from 'react-lazy-load-image-component';

// Handle ESM/CJS interop for the library: sometimes it's on .default, sometimes on the object itself
const LazyLoadImage = ReactLazyLoad.LazyLoadImage || ReactLazyLoad.default?.LazyLoadImage || ReactLazyLoad;

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  fit?: 'cover' | 'contain' | 'fill';
  priority?: boolean;
}

// Extend React.ImgHTMLAttributes to include fetchPriority
declare module 'react' {
  interface ImgHTMLAttributes<T> extends React.HTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width = 800, 
  height, 
  quality = 80,
  className,
  fit = 'cover',
  priority = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Helper to construct transformation URL
  const getOptimizedUrl = (url: string, targetWidth?: number) => {
    if (!url) return '';
    // Only optimize Supabase Storage URLs
    if (!url.includes('supabase.co/storage')) return url;

    // Supabase Image Transformation parameters
    const params = new URLSearchParams();
    if (targetWidth) params.append('width', targetWidth.toString());
    if (height && !targetWidth) params.append('height', height.toString()); // Only use height if no target width, to maintain aspect ratio
    
    params.append('quality', quality.toString());
    params.append('format', 'webp'); // Force WebP for size reduction
    params.append('resize', fit);

    return `${url}?${params.toString()}`;
  };

  // Generate srcSet for Supabase images to allow browser to choose appropriate size
  const generateSrcSet = (url: string) => {
    if (!url.includes('supabase.co/storage')) return undefined;
    
    const widths = [640, 768, 1024, 1280, 1536];
    return widths
      .map(w => `${getOptimizedUrl(url, w)} ${w}w`)
      .join(', ');
  };

  // Default sizes prop to help browser pre-allocate space
  const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  const optimizedSrc = error ? src : getOptimizedUrl(src, width);
  const srcSet = !error ? generateSrcSet(src) : undefined;
  
  // Default height to width if not provided to maintain aspect ratio and prevent CLS
  const renderHeight = height || width;

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* Blur Placeholder (CSS effect) - Only show if not loaded and no error */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      
      {priority ? (
        // For priority images (LCP candidates), use standard img with eager loading and high fetch priority
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={defaultSizes}
          alt={alt}
          width={width}
          height={renderHeight}
          className={`w-full h-full object-${fit} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          {...props}
        />
      ) : (
        // For off-screen images, use LazyLoadImage
        <LazyLoadImage
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={defaultSizes}
          alt={alt}
          width={width}
          height={renderHeight}
          className={`w-full h-full object-${fit} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          afterLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          threshold={300} // Start loading 300px before viewport
          {...props}
        />
      )}
    </div>
  );
};