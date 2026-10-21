import { useState, useEffect, useRef } from 'react';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

/**
 * ProgressiveImage
 * Lazy-loads images using IntersectionObserver.
 * The `priority` prop forces eager loading for LCP elements (e.g., Hero).
 *
 * Design note:
 * - Automatically splits classes to avoid double-application.
 * - The wrapper div gets sizing, layout, padding, borders, background, and shadows.
 * - The img gets object-fit, scales, and transition effects.
 * - Correctly maintains a layout box so IntersectionObserver triggers perfectly.
 */
export function ProgressiveImage({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
  style,
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Extract classes
  const classes = className.split(' ');
  const isAutoHeight = classes.includes('h-auto');
  
  const imgClasses = classes.filter(c => 
    c.startsWith('object-') || 
    c.includes('scale-') || 
    c.includes('rotate-') ||
    c.startsWith('duration-') ||
    c.startsWith('transition-') ||
    c === 'h-auto'
  ).join(' ');

  const wrapperClasses = classes.filter(c => 
    !c.startsWith('object-') && 
    !c.includes('scale-') && 
    !c.includes('rotate-') &&
    !c.startsWith('duration-') &&
    !c.startsWith('transition-') &&
    c !== 'h-auto'
  ).join(' ');

  return (
    <div 
      className={`relative overflow-hidden ${wrapperClasses}`} 
      ref={containerRef}
      style={{ ...style, width, height }}
    >
      {/* Placeholder shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200/60 skeleton-shimmer" aria-hidden="true" />
      )}
      
      {isInView && (
        <img
          src={src || undefined}
          alt={alt}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          width={width}
          height={height}
          className={`${isAutoHeight ? 'w-full h-auto block' : 'absolute inset-0 w-full h-full'} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClasses}`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
}
