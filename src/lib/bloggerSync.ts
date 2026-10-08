import { BlogPost, BUILTIN_BLOG_POSTS } from './blogData';
import { applyBloggerPostOverrides } from './bloggerLayoutAdmin';

const DEFAULT_BLOGGER_KEY = 'toolnest_custom_blogger_url';
const BLOGGER_POSTS_CACHE_KEY = 'toolnest_cached_blogger_posts';
const BLOGGER_LAST_SYNC_KEY = 'toolnest_blogger_last_sync';

export const TARGET_BLOGGER_URL = 'https://toolzaro.blogspot.com';

export function getSavedBloggerUrl(): string {
  try {
    return localStorage.getItem(DEFAULT_BLOGGER_KEY) || TARGET_BLOGGER_URL;
  } catch {
    return TARGET_BLOGGER_URL;
  }
}

export function saveBloggerUrl(url: string): void {
  try {
    let clean = url.trim();
    if (clean) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      clean = clean.replace(/\/+$/, '');
    }
    localStorage.setItem(DEFAULT_BLOGGER_KEY, clean);
  } catch {}
}

export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(BLOGGER_LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export function getCachedBloggerPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(BLOGGER_POSTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export interface RawBloggerXmlPost {
  id?: string;
  title?: string;
  url?: string;
  snippet?: string;
  date?: string;
  author?: string;
  authorAvatar?: string;
  authorProfile?: string;
  thumbnail?: string;
  labels?: string[];
  body?: string;
}

/**
 * Resolves the author avatar:
 * 1. If Blogger provides a real photo, upgrades to high-res (/s160-c/)
 * 2. If Blogger returns the default generic silhouette or empty, generates a personalized
 *    avatar with the author's real initials and Toolzaro's brand palette.
 */
export function resolveAuthorAvatar(rawAvatarUrl?: string, authorName?: string): string {
  const cleanName = (authorName || 'Toolzaro Author').trim();

  if (rawAvatarUrl && rawAvatarUrl.trim()) {
    let url = rawAvatarUrl.trim();
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }

    const isGenericIcon = 
      url.includes('b16-rounded.gif') || 
      url.includes('blank.gif') || 
      url.includes('pixel.gif') ||
      url.includes('avatar_blue_m_96.png') ||
      url.includes('g.co/blogger/avatar');

    if (!isGenericIcon && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Upgrade Google / Blogger photo thumbnail to high resolution
      return url
        .replace(/\/s\d+(-c)?\//, '/s160-c/')
        .replace(/\/w\d+-h\d+[^/]*\//, '/s160-c/')
        .replace(/=s\d+(-c)?$/, '=s160-c');
    }
  }

  // Generate crisp brand avatar with the author's real initials
  const encodedName = encodeURIComponent(cleanName);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=8b5cf6&color=ffffff&bold=true&size=160&rounded=true`;
}

export function getNativeBloggerXmlPosts(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  const rawPosts: RawBloggerXmlPost[] = (window as any).__BLOGGER_POSTS__;
  if (!Array.isArray(rawPosts) || rawPosts.length === 0) return [];

  return rawPosts.map((p, index) => {
    const title = (p.title || 'Untitled Post').trim();
    const content = p.body || p.snippet || '';
    const date = p.date ? p.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const authorName = (p.author || 'Toolzaro Author').trim();
    const url = p.url || '';
    const tags = Array.isArray(p.labels) && p.labels.length > 0 ? p.labels : ['Developer Workflows'];
    const category = tags[0] || 'Developer Workflows';

    const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(2, Math.ceil(wordCount / 200));
    const id = p.id ? `blogger-${p.id}` : `blogger-native-${index}`;
    const slug = slugify(title) || id;

    let coverImage = p.thumbnail || '';
    if (!coverImage && content) {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        coverImage = imgMatch[1];
      }
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';
    }

    return {
      id,
      slug,
      title,
      excerpt: p.snippet || createExcerpt(content),
      content,
      category,
      author: {
        name: authorName,
        role: 'Blogger Author',
        avatar: resolveAuthorAvatar(p.authorAvatar, authorName),
        profileUrl: p.authorProfile || undefined
      },
      publishedAt: date,
      readTimeMinutes: readTime,
      coverImage,
      tags,
      source: 'blogger' as const,
      bloggerUrl: url
    };
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// Extract high-res thumbnail from Blogger entry or body HTML
function extractThumbnail(entry: any, contentHtml: string): string {
  if (entry?.media$thumbnail?.url) {
    // Replace Blogger small s72-c thumbnail with high-res s1600
    return entry.media$thumbnail.url
      .replace(/\/s\d+(-c)?\//, '/s1600/')
      .replace(/\/w\d+-h\d+[^/]*\//, '/s1600/');
  }

  // Look for first <img> tag in HTML body
  const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  // Fallback high-res editorial banner
  return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';
}

// Strip HTML tags for clean excerpt
function createExcerpt(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Strategy 1: JSONP Fetch
 * Blogger natively supports `alt=json-in-script&callback=fn`.
 * This executes purely in the browser using a dynamic <script> tag,
 * which 100% bypasses CORS restrictions on any static hosting (GitHub Pages, Vercel, cPanel, etc.).
 */
function fetchViaJsonp(cleanBaseUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('JSONP only supported in browser environment'));
    }

    const callbackName = 'blogger_cb_' + Math.random().toString(36).slice(2, 10);
    const script = document.createElement('script');

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, 8000);

    const cleanup = () => {
      clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch {}
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP load error'));
    };

    script.src = `${cleanBaseUrl}/feeds/posts/default?alt=json-in-script&callback=${callbackName}&max-results=50`;
    document.head.appendChild(script);
  });
}

/**
 * Strategy 2: Direct Fetch
 */
async function fetchViaDirect(cleanBaseUrl: string): Promise<any> {
  const url = `${cleanBaseUrl}/feeds/posts/default?alt=json&max-results=50`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Strategy 3: Server-side Proxy (if running under Node / Express server)
 */
async function fetchViaServerProxy(cleanBaseUrl: string): Promise<any> {
  const url = `/api/blogger-feed?url=${encodeURIComponent(cleanBaseUrl)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Strategy 4: Public CORS Proxy Fallback
 */
async function fetchViaPublicProxy(cleanBaseUrl: string): Promise<any> {
  const target = `${cleanBaseUrl}/feeds/posts/default?alt=json&max-results=50`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch and parse posts from any Blogger / Blogspot URL using a multi-strategy pipeline.
 */
export async function fetchBloggerPosts(bloggerUrl?: string): Promise<BlogPost[]> {
  const targetUrl = (bloggerUrl || getSavedBloggerUrl()).trim();
  if (!targetUrl) return [];

  const cleanBase = targetUrl.replace(/\/+$/, '');
  let feedData: any = null;

  // 1. Try JSONP in browser (zero CORS issues)
  try {
    feedData = await fetchViaJsonp(cleanBase);
  } catch {
    // Continue to next strategy
  }

  // 2. Try direct fetch
  if (!feedData) {
    try {
      feedData = await fetchViaDirect(cleanBase);
    } catch {
      // Continue to next strategy
    }
  }

  // 3. Try server proxy (if available)
  if (!feedData) {
    try {
      feedData = await fetchViaServerProxy(cleanBase);
    } catch {
      // Continue to next strategy
    }
  }

  // 4. Try public CORS proxy
  if (!feedData) {
    try {
      feedData = await fetchViaPublicProxy(cleanBase);
    } catch (err: any) {
      console.warn('All Blogger feed fetch strategies exhausted:', err.message);
    }
  }

  if (!feedData || !feedData.feed || !Array.isArray(feedData.feed.entry)) {
    return [];
  }

  const entries = feedData.feed.entry;
  const parsedPosts: BlogPost[] = entries.map((entry: any, index: number) => {
    const title = entry.title?.$t || 'Untitled Post';
    const contentHtml = entry.content?.$t || entry.summary?.$t || '';
    const publishedAt = entry.published?.$t ? entry.published.$t.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const authorName = entry.author?.[0]?.name?.$t || 'Toolzaro Contributor';
    const rawAvatar = entry.author?.[0]?.gd$image?.src;
    const authorAvatar = resolveAuthorAvatar(rawAvatar, authorName);
    const authorProfile = entry.author?.[0]?.uri?.$t;
    
    // Find original Blogger post link
    const alternateLink = (entry.link || []).find((l: any) => l.rel === 'alternate')?.href || cleanBase;
    
    // Extract categories/labels
    const rawCategories = Array.isArray(entry.category) 
      ? entry.category.map((c: any) => c.term || c.label).filter(Boolean)
      : [];
    const tags = rawCategories.length > 0 ? rawCategories : ['Developer Workflows'];
    const category = tags[0] || 'Developer Workflows';

    const wordCount = contentHtml.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(2, Math.ceil(wordCount / 200));

    const id = `blogger-${entry.id?.$t?.split('.post-')?.[1] || index}`;
    const slug = slugify(title) || id;

    return {
      id,
      slug,
      title,
      excerpt: createExcerpt(contentHtml),
      content: contentHtml,
      category,
      author: {
        name: authorName,
        role: 'Blogger Author',
        avatar: authorAvatar,
        profileUrl: authorProfile || undefined
      },
      publishedAt,
      readTimeMinutes: readTime,
      coverImage: extractThumbnail(entry, contentHtml),
      tags,
      source: 'blogger' as const,
      bloggerUrl: alternateLink
    };
  });

  // Cache in localStorage for immediate offline/refresh access
  try {
    localStorage.setItem(BLOGGER_POSTS_CACHE_KEY, JSON.stringify(parsedPosts));
    localStorage.setItem(BLOGGER_LAST_SYNC_KEY, new Date().toLocaleTimeString());
  } catch {}

  return parsedPosts;
}

/**
 * Get merged posts: Live Blogger posts + Built-in high-value guides.
 * Blogger posts appear first so new articles are immediately visible at the top!
 */
export async function getMergedPostsWithBlogger(): Promise<BlogPost[]> {
  // Apply any edits/overrides configured from Blogger Dashboard -> Layout widgets
  const effectiveBuiltinPosts = applyBloggerPostOverrides(BUILTIN_BLOG_POSTS);

  // 1. Highest Priority: Native Blogger XML posts injected by Blogger's theme engine!
  const nativeXmlPosts = getNativeBloggerXmlPosts();
  if (nativeXmlPosts.length > 0) {
    const combined = [...nativeXmlPosts, ...effectiveBuiltinPosts];
    const seenSlugs = new Set<string>();
    const seenIds = new Set<string>();
    return combined.filter(post => {
      if (seenSlugs.has(post.slug) || seenIds.has(post.id)) return false;
      seenSlugs.add(post.slug);
      seenIds.add(post.id);
      return true;
    });
  }

  // 2. Standalone / Preview environment fallback:
  const savedUrl = getSavedBloggerUrl();
  let bloggerPosts: BlogPost[] = getCachedBloggerPosts();

  if (savedUrl) {
    try {
      const live = await fetchBloggerPosts(savedUrl);
      if (live.length > 0) {
        bloggerPosts = live;
      }
    } catch {
      // Keep cached posts if offline
    }
  }

  // Merge: Live Blogger posts first, followed by built-in authoritative guides
  const combined = [...bloggerPosts, ...effectiveBuiltinPosts];
  
  // Deduplicate by slug and id
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();
  return combined.filter(post => {
    if (seenSlugs.has(post.slug) || seenIds.has(post.id)) return false;
    seenSlugs.add(post.slug);
    seenIds.add(post.id);
    return true;
  });
}
