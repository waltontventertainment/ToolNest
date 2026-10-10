// Universal URL & Route Bridge for Toolzaro (Blogger Hybrid Architecture - Option A)
// Ensures 100% clean URLs without '#' (hash) on Blogger and across all platforms
// Fully compatible with Googlebot indexing, Blogger native permalinks, and React SPA instant navigation.

export function isBloggerHost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('blogspot.') ||
    window.location.hostname.includes('blogger.') ||
    Boolean((window as any).__IS_BLOGGER__)
  );
}

/**
 * Generates an SEO-clean flat root-level tool URL without '#' or '/tools/' prefix
 * Clean flat path: /open-meteo-live-weather (like iLovePDF)
 * Works in React SPA on Cloudflare Pages, Blogger, and across all platforms without reload.
 */
export function getToolUrl(slug: string): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '').replace(/^tools\//i, '');
  if (isBloggerHost()) {
    return `/2026/10/${encodeURIComponent(cleanSlug)}.html`;
  }
  return `/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Generates All Tools Directory / Hub URL
 * /tools
 */
export function getToolsHubUrl(): string {
  return `/tools`;
}

/**
 * Generates an SEO-clean category URL
 * /category/image-tools
 */
export function getCategoryUrl(categorySlug: string): string {
  return `/category/${encodeURIComponent(categorySlug)}`;
}

/**
 * Generates blog hub link
 * /blog
 */
export function getBlogUrl(): string {
  return `/blog`;
}

/**
 * Generates blog post link
 * Prioritizes native Blogger .html permalink (e.g. /2026/10/post-name.html)
 * When published on Blogger, uses the exact official Blogger permalink so Googlebot
 * indexes it as a first-class citizen with maximum search authority.
 */
export function getBlogPostUrl(slug: string, nativeBloggerUrl?: string): string {
  if (nativeBloggerUrl) {
    try {
      // If full URL provided, extract pathname if on same domain or relative
      if (nativeBloggerUrl.startsWith('http://') || nativeBloggerUrl.startsWith('https://')) {
        const parsed = new URL(nativeBloggerUrl);
        if (parsed.pathname && parsed.pathname.endsWith('.html')) {
          return parsed.pathname;
        }
      } else if (nativeBloggerUrl.startsWith('/') && nativeBloggerUrl.endsWith('.html')) {
        return nativeBloggerUrl;
      }
    } catch (e) {
      if (nativeBloggerUrl.startsWith('/') && nativeBloggerUrl.endsWith('.html')) {
        return nativeBloggerUrl;
      }
    }
  }

  // Known fallback for built-in introductory post if native URL not yet attached
  if (slug === 'introducing-toolzaro-your-ultimate-free-online-web-tools-platform') {
    return '/2026/10/introducing-toolzaro-your-ultimate-free-online-web-tools-platform.html';
  }

  return `/blog/${encodeURIComponent(slug)}`;
}

/**
 * Generates static page link (about, privacy-policy, terms, disclaimer, contact)
 */
export function getStaticPageUrl(page: 'about' | 'privacy-policy' | 'terms' | 'disclaimer' | 'contact' | string): string {
  return `/${encodeURIComponent(page)}`;
}

/**
 * Extracts the slug from any native Blogger permalink or page pathname
 * e.g. "/2026/10/introducing-toolzaro-your-ultimate-free-online-web-tools-platform.html"
 * -> "introducing-toolzaro-your-ultimate-free-online-web-tools-platform"
 * e.g. "/p/privacy-policy.html" -> "privacy-policy"
 * e.g. "/2026/10/image-resizer.html" -> "image-resizer"
 */
export function extractSlugFromBloggerPath(pathname: string): string | null {
  if (!pathname || !pathname.endsWith('.html')) return null;

  // Match /YYYY/MM/slug.html
  const postMatch = pathname.match(/\/\d{4}\/\d{2}\/([^/]+)\.html$/i);
  if (postMatch && postMatch[1]) {
    return postMatch[1];
  }

  // Match /p/slug.html
  const pageMatch = pathname.match(/\/p\/([^/]+)\.html$/i);
  if (pageMatch && pageMatch[1]) {
    return pageMatch[1];
  }

  // Match /slug.html
  const generalMatch = pathname.match(/\/([^/]+)\.html$/i);
  if (generalMatch && generalMatch[1]) {
    return generalMatch[1];
  }

  return null;
}
