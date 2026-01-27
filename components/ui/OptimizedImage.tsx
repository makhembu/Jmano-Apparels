import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  fit?: 'cover' | 'contain' | 'fill';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width = 800, 
  height, 
  quality = 80,
  className,
  fit = 'cover',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Helper to construct transformation URL
  const getOptimizedUrl = (url: string) => {
    if (!url) return '';
    // Only optimize Supabase Storage URLs
    if (!url.includes('supabase.co/storage')) return url;

    // Supabase Image Transformation parameters
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', 'origin'); // Auto-detect webp/avif support
    params.append('resize', fit);

    return `${url}?${params.toString()}`;
  };

  const optimizedSrc = error ? src : getOptimizedUrl(src);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* Blur Placeholder (CSS effect) */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      
      <img
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-${fit} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};