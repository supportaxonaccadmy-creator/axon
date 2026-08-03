import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { imageOptimization } from '@/services/pwa';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  threshold?: number;
}

function LazyImageComponent({ src, alt, className, width, height, sizes, threshold = 0.01 }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold },
    );
    const img = document.getElementById(`lazy-${src}`);
    if (img) observer.observe(img);
    return () => observer.disconnect();
  }, [src, threshold]);
  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);
  const responsiveSrc = width ? imageOptimization.getOptimizedUrl(src, { width, quality: 80, format: 'webp' }) : src;
  const srcSet = imageOptimization.getResponsiveSrcSet(src);
  const blurPlaceholder = imageOptimization.getBlurPlaceholder();
  return (
    <div id={`lazy-${src}`} className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {!loaded && !error && (<div className="absolute inset-0 animate-pulse bg-neutral-200" style={{ backgroundImage: `url(${blurPlaceholder})`, backgroundSize: 'cover' }} />)}
      {error ? (<div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400"><span className="text-xs">Failed to load</span></div>) : (
        inView && (<img src={responsiveSrc} srcSet={srcSet} sizes={sizes ?? '100vw'} alt={alt} loading="lazy" decoding="async" onLoad={handleLoad} onError={handleError} className={cn('h-full w-full transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0', className)} />)
      )}
    </div>
  );
}
export const LazyImage = memo(LazyImageComponent);
