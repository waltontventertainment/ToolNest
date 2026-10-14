// Toolzaro Cloudflare D1 Blog Service
// Edge SQLite Blog API Adapter with seamless local dev & offline fallback

import { FirestoreBlog } from './firestoreBlogService';
import { BUILTIN_BLOG_POSTS } from './blogData';

const D1_CACHE_KEY = 'toolzaro_d1_blogs_cache';
let memoryD1Cache: FirestoreBlog[] | null = null;

export interface D1StatusResponse {
  isBound: boolean;
  postsCount: number;
  message?: string;
}

/**
 * Checks if the Cloudflare D1 Blog endpoint is available and populated.
 */
export async function checkD1Status(): Promise<D1StatusResponse> {
  try {
    const res = await fetch('/api/blog/posts', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (res.status === 503) {
      return { isBound: false, postsCount: 0, message: 'D1 database binding (DB) not configured yet.' };
    }

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return { isBound: true, postsCount: data.length, message: 'Cloudflare D1 is connected and active.' };
      }
    }
    return { isBound: false, postsCount: 0, message: `API responded with HTTP ${res.status}` };
  } catch (err: any) {
    return { isBound: false, postsCount: 0, message: err.message || 'Network error' };
  }
}

/**
 * Automatically creates the `posts` table in Cloudflare D1
 */
export async function initializeD1Schema(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/blog/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'Table created successfully.' };
    }
    return { success: false, message: data.error || 'Failed to initialize D1 schema' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to trigger schema initialization' };
  }
}

/**
 * Fetches all published blog posts from Cloudflare D1 (/api/blog/posts)
 * Falls back cleanly to local cached posts or built-in guides if offline.
 */
export async function getAllD1Blogs(): Promise<FirestoreBlog[]> {
  try {
    const res = await fetch('/api/blog/posts', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryD1Cache = data;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(D1_CACHE_KEY, JSON.stringify(data));
          } catch {}
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloudflare D1 API unavailable, falling back to local cache/starter posts:', err);
  }

  // Fallback 1: LocalStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(D1_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryD1Cache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  // Fallback 2: In-memory built-in posts
  return BUILTIN_BLOG_POSTS.map(p => ({
    ...p,
    status: 'published' as const
  }));
}

/**
 * Fetches a single blog post by slug from Cloudflare D1 (/api/blog/posts/:slug)
 */
export async function getD1BlogBySlug(slug: string): Promise<FirestoreBlog | null> {
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const res = await fetch(`/api/blog/posts/${encodeURIComponent(cleanSlug)}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const post = await res.json();
      if (post && post.slug) return post as FirestoreBlog;
    }
  } catch (err) {
    console.warn(`D1 fetch failed for slug "${cleanSlug}":`, err);
  }

  // Fallback: search in cached or builtin
  const all = await getAllD1Blogs();
  const matched = all.find(p => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug);
  return matched || null;
}

/**
 * Saves or updates a blog post in Cloudflare D1
 */
export async function saveBlogToD1(blog: Partial<FirestoreBlog>): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const res = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blog),
      signal: AbortSignal.timeout(8000)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Invalidate memory cache
      memoryD1Cache = null;
      return { success: true, slug: data.slug };
    }
    return { success: false, error: data.error || 'Failed to save to D1 database' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saving to D1' };
  }
}

/**
 * Deletes a blog post from Cloudflare D1
 */
export async function deleteBlogFromD1(slugOrId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/blog/posts/${encodeURIComponent(slugOrId)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      memoryD1Cache = null;
      return { success: true };
    }
    return { success: false, error: data.error || 'Failed to delete from D1' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error deleting from D1' };
  }
}
