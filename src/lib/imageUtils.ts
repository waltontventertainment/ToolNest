/**
 * Responsive WebP Image Optimization Helpers
 * Automatically transforms Unsplash & external image URLs to provide responsive WebP sizing,
 * eliminating Lighthouse image payload penalties and preventing layout shifts.
 */

export interface ResponsiveImageAttrs {
  src: string;
  srcSet?: string;
  sizes?: string;
}

export function cleanUnsplashBase(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('images.unsplash.com')) return null;
  const qIdx = url.indexOf('?');
  return qIdx !== -1 ? url.slice(0, qIdx) : url;
}

/**
 * Returns optimized WebP src, srcSet, and sizes for Blog & Tool cards (366px mobile, 480px desktop)
 */
export function getResponsiveCardImage(url: string): ResponsiveImageAttrs {
  const base = cleanUnsplashBase(url);
  if (!base) {
    return { src: url };
  }

  return {
    src: `${base}?w=600&auto=format&fit=crop&q=75&fm=webp`,
    srcSet: `${base}?w=400&auto=format&fit=crop&q=75&fm=webp 400w, ${base}?w=800&auto=format&fit=crop&q=75&fm=webp 800w`,
    sizes: '(max-width: 640px) 366px, (max-width: 1024px) 480px, 600px',
  };
}

/**
 * Returns optimized WebP src, srcSet, and sizes for Article Hero / Cover photos (896px max width)
 */
export function getResponsiveHeroCover(url: string): ResponsiveImageAttrs {
  const base = cleanUnsplashBase(url);
  if (!base) {
    return { src: url };
  }

  return {
    src: `${base}?w=896&auto=format&fit=crop&q=75&fm=webp`,
    srcSet: `${base}?w=640&auto=format&fit=crop&q=75&fm=webp 640w, ${base}?w=896&auto=format&fit=crop&q=75&fm=webp 896w, ${base}?w=1280&auto=format&fit=crop&q=75&fm=webp 1280w`,
    sizes: '(max-width: 768px) 100vw, 896px',
  };
}
