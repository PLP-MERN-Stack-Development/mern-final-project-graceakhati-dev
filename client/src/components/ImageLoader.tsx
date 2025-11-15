import { useState, useEffect } from 'react';

export interface ImageLoaderProps {
  /**
   * Image source path (can be from imagePaths or custom path)
   */
  src: string;
  /**
   * Alt text for accessibility
   */
  alt?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Fallback image path if main image fails to load
   * Defaults to error-offline-plant.png
   */
  fallback?: string;
  /**
   * Whether to enable lazy loading (default: true)
   */
  lazy?: boolean;
}

/**
 * ImageLoader Component
 * 
 * A reusable image component with:
 * - Lazy loading support
 * - Error handling with fallback image
 * - Fade-in animation
 * - SVG support
 * 
 * @example
 * ```tsx
 * import { ImageLoader } from '@/components/ImageLoader';
 * import { heroImages } from '@/utils/imagePaths';
 * 
 * <ImageLoader 
 *   src={heroImages.landscape1} 
 *   alt="Planet Path landscape" 
 *   className="w-full h-64"
 * />
 * ```
 */
function ImageLoader({
  src,
  alt = '',
  className = '',
  fallback = '/assets/illustrations/error-offline-plant.png',
  lazy = true,
}: ImageLoaderProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSvg, setIsSvg] = useState<boolean>(src.endsWith('.svg'));

  // Update image source when src prop changes
  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
    setIsSvg(src.endsWith('.svg'));
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    if (!hasError && imageSrc !== fallback) {
      // Try fallback image
      setImageSrc(fallback);
      setHasError(true);
    } else {
      // Fallback also failed, show placeholder
      setIsLoaded(true);
    }
  };

  // Base classes for all images
  const baseClasses = `
    transition-opacity duration-500
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={baseClasses}
      loading={lazy && !isSvg ? 'lazy' : undefined}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        // Ensure image is visible even during loading
        minHeight: isLoaded ? undefined : '1px',
      }}
    />
  );
}

export default ImageLoader;

