// Universal Flat Root-Level URL & Route Bridge for Toolzaro
// Ensures every tool, category, blog article, bookmark page, and static page
// uses clean root-level URLs (domain.com/name) without sub-folders or query strings.

export function isBloggerHost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('blogspot.') ||
    window.location.hostname.includes('blogger.') ||
    Boolean((window as any).__IS_BLOGGER__)
  );
}

/**
 * Generates an SEO-clean flat root-level tool URL: /tool-name
 */
export function getToolUrl(slug: string): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '').replace(/^tools\//i, '');
  if (isBloggerHost()) {
    return `/2026/10/${encodeURIComponent(cleanSlug)}.html`;
  }
  return `/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Generates All Tools Directory / Hub URL: /tools
 */
export function getToolsHubUrl(): string {
  return `/tools`;
}

/**
 * Generates Saved Bookmarks URL: /bookmarks
 */
export function getBookmarksUrl(): string {
  return `/bookmarks`;
}

/**
 * Generates an SEO-clean flat root-level category URL: /category-name
 * e.g. /universal-data-suite, /pdf, /developer, /color-image
 */
export function getCategoryUrl(categorySlug: string): string {
  const cleanSlug = categorySlug.replace(/^\/+|\/+$/g, '').replace(/^category\//i, '');
  return `/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Generates blog hub link: /blog
 */
export function getBlogUrl(): string {
  return `/blog`;
}

/**
 * Generates flat root-level blog post link: /post-slug
 */
export function getBlogPostUrl(slug: string, nativeBloggerUrl?: string): string {
  if (isBloggerHost() && nativeBloggerUrl) {
    try {
      if (nativeBloggerUrl.startsWith('http://') || nativeBloggerUrl.startsWith('https://')) {
        const parsed = new URL(nativeBloggerUrl);
        if (parsed.pathname && parsed.pathname.endsWith('.html')) {
          return parsed.pathname;
        }
      } else if (nativeBloggerUrl.startsWith('/') && nativeBloggerUrl.endsWith('.html')) {
        return nativeBloggerUrl;
      }
    } catch {
      if (nativeBloggerUrl.startsWith('/') && nativeBloggerUrl.endsWith('.html')) {
        return nativeBloggerUrl;
      }
    }
  }

  const cleanSlug = slug
    .replace(/^\/+|\/+$/g, '')
    .replace(/^blog\//i, '')
    .replace(/\.html$/i, '');
  return `/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Generates flat root-level static page link (/about, /privacy-policy, /terms, /disclaimer, /contact, /bookmarks)
 */
export function getStaticPageUrl(
  page: 'about' | 'privacy-policy' | 'terms' | 'disclaimer' | 'contact' | 'bookmarks' | string
): string {
  const cleanPage = page.replace(/^\/+|\/+$/g, '');
  return `/${encodeURIComponent(cleanPage)}`;
}

/**
 * Extracts the slug from any native Blogger permalink or page pathname
 */
export function extractSlugFromBloggerPath(pathname: string): string | null {
  if (!pathname || !pathname.endsWith('.html')) return null;

  const postMatch = pathname.match(/\/\d{4}\/\d{2}\/([^/]+)\.html$/i);
  if (postMatch && postMatch[1]) {
    return postMatch[1];
  }

  const pageMatch = pathname.match(/\/p\/([^/]+)\.html$/i);
  if (pageMatch && pageMatch[1]) {
    return pageMatch[1];
  }

  const generalMatch = pathname.match(/\/([^/]+)\.html$/i);
  if (generalMatch && generalMatch[1]) {
    return generalMatch[1];
  }

  return null;
}
