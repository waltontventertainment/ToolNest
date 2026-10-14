import { BUILTIN_BLOG_POSTS } from './blogData';

let firestoreDepsPromise: Promise<{
  collection: typeof import('firebase/firestore').collection;
  doc: typeof import('firebase/firestore').doc;
  getDocs: typeof import('firebase/firestore').getDocs;
  getDoc: typeof import('firebase/firestore').getDoc;
  setDoc: typeof import('firebase/firestore').setDoc;
  deleteDoc: typeof import('firebase/firestore').deleteDoc;
  query: typeof import('firebase/firestore').query;
  where: typeof import('firebase/firestore').where;
  limit: typeof import('firebase/firestore').limit;
  db: typeof import('./firebase').db;
}> | null = null;

function loadFirestoreDeps() {
  if (!firestoreDepsPromise) {
    firestoreDepsPromise = Promise.all([
      import('firebase/firestore'),
      import('./firebase'),
    ]).then(([fsMod, fbMod]) => ({
      collection: fsMod.collection,
      doc: fsMod.doc,
      getDocs: fsMod.getDocs,
      getDoc: fsMod.getDoc,
      setDoc: fsMod.setDoc,
      deleteDoc: fsMod.deleteDoc,
      query: fsMod.query,
      where: fsMod.where,
      limit: fsMod.limit,
      db: fbMod.db,
    }));
  }
  return firestoreDepsPromise;
}

export interface FirestoreBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or rich HTML
  coverImage: string; // ImgBB hosted image URL
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
    profileUrl?: string;
  };
  publishedAt: string; // YYYY-MM-DD
  readTimeMinutes: number;
  status: 'published' | 'draft' | 'deleted';
  contentType?: 'text' | 'code'; // 'text' for formatted editorial text, 'code' for custom HTML/CSS/JS design
  customHtml?: string;
  customCss?: string;
  customJs?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'blogs';
const LOCAL_STORAGE_CACHE_KEY = 'toolzaro_firestore_blogs_cache';

// Ultra-fast in-memory cache so blog pages and post readers render in 0.0ms without any loading state
let memoryBlogsCache: FirestoreBlog[] | null = null;
let inflightFetchPromise: Promise<FirestoreBlog[]> | null = null;
let lastFirestoreSyncTime = 0;
const CACHE_FRESH_TTL_MS = 45_000; // 45s in-memory freshness window to prevent redundant network jumps on every click

function getBuiltinAsFirestoreBlogs(): FirestoreBlog[] {
  return BUILTIN_BLOG_POSTS.map(p => ({
    ...p,
    status: 'published' as const,
  }));
}

// Helper to get local cache
function getLocalCache(): FirestoreBlog[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local cache
function setLocalCache(blogs: FirestoreBlog[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(blogs));
  } catch {}
}

/**
 * Checks if two blog objects have identical renderable content to avoid unnecessary React re-renders/jumps.
 */
export function isSameBlogPost(a: FirestoreBlog | null | undefined, b: FirestoreBlog | null | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.slug === b.slug &&
    a.title === b.title &&
    a.excerpt === b.excerpt &&
    a.content === b.content &&
    a.coverImage === b.coverImage &&
    a.category === b.category &&
    a.status === b.status &&
    a.contentType === b.contentType &&
    (a.customHtml || '') === (b.customHtml || '') &&
    (a.customCss || '') === (b.customCss || '') &&
    (a.customJs || '') === (b.customJs || '') &&
    (a.updatedAt || '') === (b.updatedAt || '')
  );
}

/**
 * Merges Firestore/cached posts with built-in posts without duplicates.
 * Earlier items in `firestoreBlogs` take priority over later items and built-in defaults.
 */
function mergeWithBuiltinBlogs(firestoreBlogs: FirestoreBlog[]): FirestoreBlog[] {
  const uniqueMap = new Map<string, FirestoreBlog>();
  const seenSlugs = new Set<string>();

  for (const post of firestoreBlogs) {
    if (!post || !post.id) continue;
    const idKey = post.id.toLowerCase();
    const slugKey = (post.slug || '').toLowerCase();
    if (!uniqueMap.has(idKey) && (!slugKey || !seenSlugs.has(slugKey))) {
      uniqueMap.set(idKey, post);
      if (slugKey) seenSlugs.add(slugKey);
    }
  }

  for (const builtin of getBuiltinAsFirestoreBlogs()) {
    const idKey = builtin.id.toLowerCase();
    const slugKey = builtin.slug.toLowerCase();
    if (!uniqueMap.has(idKey) && !seenSlugs.has(slugKey)) {
      uniqueMap.set(idKey, builtin);
      seenSlugs.add(slugKey);
    }
  }

  const merged = Array.from(uniqueMap.values());
  merged.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  return merged;
}

/**
 * Synchronous 0ms getter for published blogs (combines in-memory cache, localStorage cache, and built-in posts).
 * Guarantees that Blog sections and /blog never show a "Loading from Firestore..." screen.
 */
export function getInstantPublishedBlogs(): FirestoreBlog[] {
  if (memoryBlogsCache && memoryBlogsCache.length > 0) {
    return memoryBlogsCache.filter(b => b.status === 'published');
  }
  const cached = getLocalCache();
  const merged = mergeWithBuiltinBlogs(cached);
  memoryBlogsCache = merged;
  return merged.filter(b => b.status === 'published');
}

/**
 * Synchronous 0ms getter for a single blog post by slug or ID.
 * Checks memoryCache, localStorage cache, and built-in blog posts immediately.
 */
export function getInstantBlogBySlug(slugOrId: string): FirestoreBlog | null {
  const clean = (slugOrId || '').toLowerCase().trim();
  if (!clean) return null;

  const allInstant = getInstantPublishedBlogs();
  const found = allInstant.find(
    b => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean
  );
  if (found) return found;

  const cachedAll = getLocalCache();
  return cachedAll.find(
    b => b.status !== 'deleted' && (b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean)
  ) || null;
}

/**
 * Fetch all published blogs and silently update memory + localStorage cache
 */
export async function getPublishedBlogs(forceRefresh = false): Promise<FirestoreBlog[]> {
  if (
    !forceRefresh &&
    memoryBlogsCache &&
    memoryBlogsCache.length > 0 &&
    Date.now() - lastFirestoreSyncTime < CACHE_FRESH_TTL_MS
  ) {
    return memoryBlogsCache.filter(b => b.status === 'published');
  }

  if (inflightFetchPromise) {
    return inflightFetchPromise;
  }

  inflightFetchPromise = (async () => {
    // 1. Attempt Cloudflare D1 Edge Query first (/api/blog/posts)
    try {
      const d1Res = await fetch('/api/blog/posts', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      if (d1Res.ok) {
        const d1Data = await d1Res.json();
        if (Array.isArray(d1Data) && d1Data.length > 0) {
          const merged = mergeWithBuiltinBlogs(d1Data);
          memoryBlogsCache = merged;
          lastFirestoreSyncTime = Date.now();
          setLocalCache(merged);
          return merged.filter(b => b.status === 'published');
        }
      }
    } catch {
      // D1 query fallback to Firestore
    }

    try {
      const { collection, getDocs, db } = await loadFirestoreDeps();
      const blogsRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(blogsRef);

      const firestoreBlogs: FirestoreBlog[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as FirestoreBlog;
        firestoreBlogs.push({
          ...data,
          id: docSnap.id,
        });
      });

      const merged = mergeWithBuiltinBlogs(firestoreBlogs);
      memoryBlogsCache = merged;
      lastFirestoreSyncTime = Date.now();
      setLocalCache(merged);
      return merged.filter(b => b.status === 'published');
    } catch {
      // Silently fallback to instant cache
    } finally {
      inflightFetchPromise = null;
    }

    return getInstantPublishedBlogs();
  })();

  return inflightFetchPromise;
}

/**
 * Fetch all blogs (both published and drafts, including editable built-in posts) for the Admin CMS
 */
export async function getAllAdminBlogs(): Promise<FirestoreBlog[]> {
  try {
    const { collection, getDocs, db } = await loadFirestoreDeps();
    const blogsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(blogsRef);

    const blogs: FirestoreBlog[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as FirestoreBlog;
      blogs.push({
        ...data,
        id: docSnap.id,
      });
    });

    const merged = mergeWithBuiltinBlogs(blogs);
    memoryBlogsCache = merged;
    lastFirestoreSyncTime = Date.now();
    setLocalCache(merged);
    return merged.filter(b => b.status !== 'deleted');
  } catch (error) {
    console.warn('Failed to load admin blogs from Firestore:', error);
  }

  return mergeWithBuiltinBlogs(getLocalCache()).filter(b => b.status !== 'deleted');
}

/**
 * Fetch a single blog post by slug or ID (returns instant cached post if available, and refreshes in background)
 */
export async function getBlogBySlug(slugOrId: string): Promise<FirestoreBlog | null> {
  const clean = slugOrId.toLowerCase().trim();
  if (!clean) return null;

  const instant = getInstantBlogBySlug(clean);
  if (instant && Date.now() - lastFirestoreSyncTime < CACHE_FRESH_TTL_MS) {
    return instant;
  }

  // 0. Try Cloudflare D1 query (/api/blog/posts/:slug)
  try {
    const d1Res = await fetch(`/api/blog/posts/${encodeURIComponent(clean)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (d1Res.ok) {
      const d1Post = await d1Res.json();
      if (d1Post && d1Post.slug) {
        const updated = mergeWithBuiltinBlogs([d1Post, ...getLocalCache()]);
        memoryBlogsCache = updated;
        setLocalCache(updated);
        return d1Post;
      }
    }
  } catch {
    // D1 fallback to Firestore
  }

  try {
    const { collection, doc, getDoc, getDocs, query, where, limit, db } = await loadFirestoreDeps();
    // 1. Try direct ID doc fetch
    const docRef = doc(db, COLLECTION_NAME, clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const post = { ...(docSnap.data() as FirestoreBlog), id: docSnap.id };
      const updated = mergeWithBuiltinBlogs([post, ...getLocalCache()]);
      memoryBlogsCache = updated;
      setLocalCache(updated);
      return post;
    }

    // 2. Query by slug
    const blogsRef = collection(db, COLLECTION_NAME);
    const q = query(blogsRef, where('slug', '==', clean), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      const post = { ...(first.data() as FirestoreBlog), id: first.id };
      const updated = mergeWithBuiltinBlogs([post, ...getLocalCache()]);
      memoryBlogsCache = updated;
      setLocalCache(updated);
      return post;
    }
  } catch {
    // Fallback to instant cache
  }

  return instant;
}

/**
 * Create or update a blog post in Firestore
 */
export async function saveBlogToFirestore(blog: Partial<FirestoreBlog>): Promise<FirestoreBlog> {
  const now = new Date().toISOString();
  const id = blog.id || (blog.slug ? blog.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : `blog-${Date.now()}`);
  const slug = (blog.slug || id).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');

  const completeBlog: FirestoreBlog = {
    id,
    slug: slug || `post-${Date.now()}`,
    title: blog.title || 'Untitled Blog Post',
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    coverImage: blog.coverImage || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    category: blog.category || 'Developer Workflows',
    tags: Array.isArray(blog.tags) ? blog.tags : ['Toolzaro', 'Web Utilities'],
    author: {
      name: blog.author?.name || 'Toolzaro',
      role: blog.author?.role !== undefined ? blog.author.role : 'Admin',
      avatar: blog.author?.avatar || '',
      profileUrl: blog.author?.profileUrl || ''
    },
    publishedAt: blog.publishedAt || new Date().toISOString().split('T')[0],
    readTimeMinutes: blog.readTimeMinutes || Math.max(1, Math.round((blog.content?.split(/\s+/).length || 200) / 200)),
    status: blog.status || 'published',
    contentType: blog.contentType,
    customHtml: blog.customHtml,
    customCss: blog.customCss,
    customJs: blog.customJs,
    createdAt: blog.createdAt || now,
    updatedAt: now
  };

  // Update memory & local cache immediately (0ms optimistic update)
  const currentCache = getLocalCache().filter(b => b.id !== id && b.slug !== completeBlog.slug);
  currentCache.unshift(completeBlog);
  const merged = mergeWithBuiltinBlogs(currentCache);
  memoryBlogsCache = merged;
  lastFirestoreSyncTime = Date.now();
  setLocalCache(merged);

  try {
    const { doc, setDoc, db } = await loadFirestoreDeps();
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, completeBlog, { merge: true });
  } catch (error: any) {
    console.warn('Firestore blog save note (safely stored in local cache):', error?.message || error);
  }

  // Also sync to Cloudflare D1 edge database
  fetch('/api/blog/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(completeBlog),
  }).catch(() => {});

  return completeBlog;
}

/**
 * Delete a blog post from Firestore (also supports deleting built-in starter posts via a tombstone in Firestore)
 */
export async function deleteBlogFromFirestore(id: string): Promise<boolean> {
  const isBuiltin = BUILTIN_BLOG_POSTS.some(b => b.id.toLowerCase() === id.toLowerCase());
  const existing = getLocalCache().find(b => b.id === id) || getBuiltinAsFirestoreBlogs().find(b => b.id === id);

  // Also sync deletion with Cloudflare D1
  fetch(`/api/blog/posts/${encodeURIComponent(existing?.slug || id)}`, {
    method: 'DELETE',
  }).catch(() => {});

  if (isBuiltin && existing) {
    const tombstone: FirestoreBlog = {
      ...existing,
      status: 'deleted',
      updatedAt: new Date().toISOString(),
    };
    const nextCache = [tombstone, ...getLocalCache().filter(b => b.id !== id)];
    memoryBlogsCache = mergeWithBuiltinBlogs(nextCache);
    lastFirestoreSyncTime = Date.now();
    setLocalCache(memoryBlogsCache);

    try {
      const { doc, setDoc, db } = await loadFirestoreDeps();
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, tombstone, { merge: true });
    } catch (error: any) {
      console.warn('Firestore built-in delete note:', error?.message || error);
    }
    return true;
  }

  const currentCache = getLocalCache().filter(b => b.id !== id);
  memoryBlogsCache = mergeWithBuiltinBlogs(currentCache);
  setLocalCache(memoryBlogsCache);

  try {
    const { doc, deleteDoc, db } = await loadFirestoreDeps();
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn('Firestore blog delete note (safely removed from local cache):', error?.message || error);
  }

  return true;
}

/**
 * Syncs/seeds the 4 built-in starter posts into Firestore Database so they can be managed directly in Firestore
 */
export async function seedStarterPostIfEmpty(): Promise<FirestoreBlog[]> {
  const builtins = getBuiltinAsFirestoreBlogs();
  for (const post of builtins) {
    try {
      const { doc, getDoc, setDoc, db } = await loadFirestoreDeps();
      const docRef = doc(db, COLLECTION_NAME, post.id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, post, { merge: true });
      }
    } catch {
      // Ignore if offline or restricted
    }
  }
  return getAllAdminBlogs();
}

const RELATED_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'how', 'your', 'from', 'that', 'this', 'into',
  'using', 'guide', 'complete', 'best', 'modern', 'toolzaro', 'web', 'online',
  'free', 'tools', 'tool', 'what', 'why', 'when', 'where', 'who', 'will', 'can',
  'are', 'was', 'were', 'have', 'has', 'had', 'not', 'but', 'all', 'any', 'new'
]);

function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !RELATED_STOPWORDS.has(w));
}

function deterministicPairHash(a: string, b: string): number {
  const str = `${a}::${b}`;
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Computes genuinely related blog posts based on category match, shared tags,
 * title/topic keyword overlap, and content similarity.
 */
export function getRelatedBlogs(
  currentPost: FirestoreBlog | null | undefined,
  allBlogs: FirestoreBlog[],
  maxCount: number = 4
): FirestoreBlog[] {
  const published = (allBlogs || []).filter(b => b && b.status === 'published');
  if (!currentPost) {
    return published.slice(0, maxCount);
  }

  const currentSlug = (currentPost.slug || '').toLowerCase();
  const currentId = (currentPost.id || '').toLowerCase();

  const candidates = published.filter(
    b =>
      b.slug.toLowerCase() !== currentSlug &&
      b.id.toLowerCase() !== currentId
  );

  if (candidates.length === 0) return [];

  const targetCategory = (currentPost.category || '').trim().toLowerCase();
  const targetCategoryWords = new Set(extractKeywords(targetCategory));
  const targetTags = new Set(
    (currentPost.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean)
  );
  const targetTitleKeywords = new Set([
    ...extractKeywords(currentPost.title),
    ...extractKeywords(currentPost.slug.replace(/-/g, ' ')),
  ]);
  const targetExcerptKeywords = new Set(extractKeywords(currentPost.excerpt));

  const scored = candidates.map(candidate => {
    let score = 0;
    const candCategory = (candidate.category || '').trim().toLowerCase();
    const candCategoryWords = extractKeywords(candCategory);
    const candTags = (candidate.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);
    const candTitleWords = extractKeywords(
      `${candidate.title} ${candidate.slug.replace(/-/g, ' ')}`
    );
    const candExcerptWords = extractKeywords(candidate.excerpt);

    // 1. Exact or partial Category match (strongest signal)
    if (targetCategory && candCategory === targetCategory) {
      score += 65;
    } else {
      for (const w of candCategoryWords) {
        if (targetCategoryWords.has(w) || targetTitleKeywords.has(w)) {
          score += 22;
        }
      }
    }

    // 2. Shared Tags (high signal)
    for (const tag of candTags) {
      if (targetTags.has(tag)) {
        score += 38;
      } else {
        for (const tTag of targetTags) {
          if (tag.includes(tTag) || tTag.includes(tag)) {
            score += 18;
          }
        }
        const tagWords = extractKeywords(tag);
        for (const tw of tagWords) {
          if (targetTitleKeywords.has(tw) || targetCategoryWords.has(tw)) {
            score += 12;
          }
        }
      }
    }

    // 3. Title & Slug keyword overlap
    for (const word of candTitleWords) {
      if (targetTitleKeywords.has(word)) {
        score += 16;
      } else if (targetExcerptKeywords.has(word)) {
        score += 7;
      }
    }

    // 4. Excerpt keyword overlap
    for (const word of candExcerptWords) {
      if (targetTitleKeywords.has(word)) {
        score += 8;
      } else if (targetExcerptKeywords.has(word)) {
        score += 4;
      }
    }

    const tieBreaker = deterministicPairHash(currentSlug, candidate.slug.toLowerCase()) % 1000;

    return {
      blog: candidate,
      score,
      tieBreaker,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.tieBreaker - a.tieBreaker;
  });

  return scored.slice(0, maxCount).map(item => item.blog);
}
