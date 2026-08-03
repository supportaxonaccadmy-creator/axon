interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  blur?: number;
}

class ImageOptimizationService {
  getOptimizedUrl(url: string, options: ImageOptions = {}): string {
    if (!url) return '';
    const params = new URLSearchParams();
    if (options.width) params.set('w', String(options.width));
    if (options.height) params.set('h', String(options.height));
    if (options.quality) params.set('q', String(options.quality));
    if (options.format) params.set('f', options.format);
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  getResponsiveSrcSet(url: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
    return widths.map((w) => `${this.getOptimizedUrl(url, { width: w })} ${w}w`).join(', ');
  }

  getSizes(breakpoints: { maxWidth?: number; size: string }[] = [{ maxWidth: 640, size: '100vw' }, { size: '50vw' }]): string {
    return breakpoints.map((bp) => bp.maxWidth ? `(max-width: ${bp.maxWidth}px) ${bp.size}` : bp.size).join(', ');
  }

  getBlurPlaceholder(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';
  }

  getAvatarUrl(url: string | null | undefined, size: number = 80): string {
    if (!url) return '';
    return this.getOptimizedUrl(url, { width: size, height: size, quality: 80, format: 'webp' });
  }

  getThumbnailUrl(url: string, width: number = 320): string {
    return this.getOptimizedUrl(url, { width, quality: 70, format: 'webp' });
  }

  preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Image === 'undefined') { resolve(); return; }
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }
}

export const imageOptimization = new ImageOptimizationService();
