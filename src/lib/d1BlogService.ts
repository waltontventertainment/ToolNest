// Toolzaro Cloudflare D1 Blog Service
// Edge SQLite Blog API Adapter with seamless local dev, graceful fallback & robust diagnostics

import { FirestoreBlog } from './firestoreBlogService';
import { BUILTIN_BLOG_POSTS } from './blogData';

const D1_CACHE_KEY = 'toolzaro_d1_blogs_cache';
let memoryD1Cache: FirestoreBlog[] | null = null;

export const CLOUDFLARE_D1_SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  coverImage TEXT,
  author TEXT,
  category TEXT,
  tags TEXT,
  publishedAt TEXT,
  updatedAt TEXT,
  status TEXT DEFAULT 'published',
  featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  readingTime INTEGER DEFAULT 5,
  source TEXT DEFAULT 'd1'
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_publishedAt ON posts (publishedAt DESC);`;

export const CLOUDFLARE_AI_PROMPT_TEMPLATE = `Please execute this SQL on my Cloudflare D1 database named "toolzaro-blog" to create the posts table:

${CLOUDFLARE_D1_SQL_SCHEMA}`;

export const GIT_FUNCTIONS_DEPLOY_COMMANDS = `git add functions/ wrangler.jsonc schema.sql
git commit -m "feat: add Cloudflare Pages functions and D1 database binding"
git push origin main`;

export interface D1StatusResponse {
  isBound: boolean;
  postsCount: number;
  statusCode?: number;
  message?: string;
  instructions?: string[];
  latencyMs?: number;
  isFunctionsMissing?: boolean;
  isTableMissing?: boolean;
}

/**
 * Checks if the Cloudflare D1 Blog endpoint is available, bound, and populated.
 * Reliably handles HTML fallback responses when Cloudflare Pages Functions are not yet deployed.
 */
export async function checkD1Status(): Promise<D1StatusResponse> {
  const start = performance.now();
  try {
    const res = await fetch('/api/blog/posts', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    const latencyMs = Math.round(performance.now() - start);

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    // Check if the server returned HTML (Cloudflare Pages fallback to index.html when functions/ is missing)
    if (contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')) {
      return {
        isBound: false,
        postsCount: 0,
        statusCode: res.status,
        latencyMs,
        isFunctionsMissing: true,
        message: 'Cloudflare Pages Functions are not active yet (returned HTML page instead of JSON API). The "functions/" directory needs to be committed and pushed to your GitHub repository.',
        instructions: [
          'Push the "functions/" directory from this repo to GitHub (waltontventertainment/Toolzaro).',
          'In Cloudflare Dashboard, verify your Pages project "toolzaro" shows "Functions" enabled.',
          'Execute the SQL schema in Cloudflare D1 or send it to Cloudflare AI to create the "posts" table.',
          'Under Pages > Settings > Functions > D1 Database Bindings, ensure Variable name is "DB" and Database is "toolzaro-blog".'
        ]
      };
    }

    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      // If unable to parse, check status code
      return {
        isBound: false,
        postsCount: 0,
        statusCode: res.status,
        latencyMs,
        message: `API response could not be parsed: ${rawText.slice(0, 100)}`
      };
    }

    if (res.status === 503) {
      return {
        isBound: false,
        postsCount: 0,
        statusCode: 503,
        latencyMs,
        message: data.error || 'Cloudflare D1 database binding (DB) is not configured yet in Cloudflare Pages.',
        instructions: data.instructions || [
          'Go to Cloudflare Dashboard > Workers & Pages > Select your project',
          'Navigate to Settings > Functions > D1 Database Bindings',
          'Click Add binding > Variable name: DB > Database: select "toolzaro-blog"',
          'Save and redeploy your project'
        ]
      };
    }

    if (data.isTableMissing || (data.error && data.error.includes('no such table'))) {
      return {
        isBound: true,
        postsCount: 0,
        statusCode: res.status,
        latencyMs,
        isTableMissing: true,
        message: 'D1 database binding "DB" is connected, but the "posts" table does not exist yet.',
        instructions: [
          'Use the "Auto-create D1 Table" button below or copy the SQL schema into Cloudflare AI / D1 Console to create the table.'
        ]
      };
    }

    if (res.ok) {
      const count = Array.isArray(data) ? data.length : 0;
      return {
        isBound: true,
        postsCount: count,
        statusCode: 200,
        latencyMs,
        message: 'Cloudflare D1 Edge SQLite database is connected and active!'
      };
    }

    return {
      isBound: false,
      postsCount: 0,
      statusCode: res.status,
      latencyMs,
      message: data.error || `D1 API returned HTTP ${res.status}`
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      isBound: false,
      postsCount: 0,
      statusCode: 0,
      latencyMs,
      message: err.message || 'Network request failed'
    };
  }
}

/**
 * Automatically creates the `posts` table in Cloudflare D1
 */
export async function initializeD1Schema(): Promise<{ success: boolean; message: string; isFunctionsMissing?: boolean }> {
  try {
    const res = await fetch('/api/blog/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    if (contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')) {
      return {
        success: false,
        isFunctionsMissing: true,
        message: 'Pages Functions are not deployed yet. Please push the "functions/" folder to GitHub or execute the SQL schema in Cloudflare AI.'
      };
    }

    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
    }

    if (res.ok && data.success) {
      return { success: true, message: data.message || 'Table created successfully in Cloudflare D1.' };
    }
    return { success: false, message: data.error || 'Failed to initialize D1 schema' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to trigger schema initialization' };
  }
}

/**
 * Fetches all published blog posts from Cloudflare D1 (/api/blog/posts)
 * Falls back cleanly to local cached posts or built-in guides if offline or functions missing.
 */
export async function getAllD1Blogs(): Promise<FirestoreBlog[]> {
  try {
    const res = await fetch('/api/blog/posts', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && res.ok) {
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

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && res.ok) {
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
 * Gracefully reports pending bindings or missing functions while allowing Firestore dual-persistence to succeed.
 */
export async function saveBlogToD1(blog: Partial<FirestoreBlog>): Promise<{
  success: boolean;
  slug?: string;
  error?: string;
  isBindingPending?: boolean;
  isFunctionsMissing?: boolean;
}> {
  try {
    const res = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(blog),
      signal: AbortSignal.timeout(8000)
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    if (contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')) {
      return {
        success: false,
        isFunctionsMissing: true,
        error: 'Cloudflare Pages Functions are not deployed yet. Post saved to Firebase Firestore.'
      };
    }

    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
    }

    if (res.status === 503) {
      return {
        success: false,
        isBindingPending: true,
        error: data.error || 'Cloudflare D1 database (DB) is not bound in Cloudflare Pages.'
      };
    }

    if (res.ok && data.success) {
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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return { success: false, error: 'Functions not deployed' };
    }

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      memoryD1Cache = null;
      return { success: true };
    }
    return { success: false, error: data.error || 'Failed to delete from D1' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error deleting from D1' };
  }
}
