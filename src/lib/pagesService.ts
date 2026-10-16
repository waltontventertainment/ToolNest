// Dynamic Pages Service (Firestore + Local Storage Cache for 0ms First Paint)
import { app, db } from './firebase';

export interface DynamicPage {
  id: string;
  slug: string;
  title: string;
  content: string; // Rich HTML or Markdown
  excerpt?: string;
  coverImage?: string; // Auto-extracted from first image or manual
  thumbnailManual?: boolean;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string; // ISO date string
  placement: 'header' | 'footer' | 'both' | 'custom';
  metaTitle?: string;
  metaDescription?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'pages';
const LOCAL_STORAGE_CACHE_KEY = 'toolzaro_dynamic_pages_cache';

let memoryPagesCache: DynamicPage[] | null = null;
let inflightFetchPromise: Promise<DynamicPage[]> | null = null;

// Initial built-in starter pages metadata for seamless fallback
export const BUILTIN_PAGES_META: Partial<DynamicPage>[] = [
  { slug: 'about', title: 'About Us', placement: 'footer', status: 'published' },
  { slug: 'privacy-policy', title: 'Privacy Policy', placement: 'footer', status: 'published' },
  { slug: 'terms', title: 'Terms of Service', placement: 'footer', status: 'published' },
  { slug: 'disclaimer', title: 'Disclaimer', placement: 'footer', status: 'published' },
  { slug: 'contact', title: 'Contact Us', placement: 'both', status: 'published' },
];

function getLocalCache(): DynamicPage[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(pages: DynamicPage[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(pages));
  } catch {}
}

/**
 * Extract the first image URL from HTML content for automatic thumbnail generation
 */
export function extractFirstImageFromContent(htmlContent: string): string | null {
  if (!htmlContent) return null;
  try {
    // 1. Try HTML <img> regex
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = htmlContent.match(imgRegex);
    if (match && match[1]) {
      return match[1];
    }
    // 2. Try Markdown image ![alt](url)
    const mdImgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i;
    const mdMatch = htmlContent.match(mdImgRegex);
    if (mdMatch && mdMatch[1]) {
      return mdMatch[1];
    }
  } catch {}
  return null;
}

/**
 * Fetch all dynamic pages (public published) with local storage cache
 */
export async function getPublishedPages(): Promise<DynamicPage[]> {
  if (memoryPagesCache && memoryPagesCache.length > 0) {
    return memoryPagesCache.filter(p => p.status === 'published');
  }

  const cached = getLocalCache();
  if (cached.length > 0) {
    memoryPagesCache = cached;
  }

  if (inflightFetchPromise) return inflightFetchPromise;

  inflightFetchPromise = (async () => {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      const list: DynamicPage[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...(doc.data() as any) });
      });

      list.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));

      if (list.length > 0) {
        memoryPagesCache = list;
        setLocalCache(list);
        return list;
      }
      return cached;
    } catch (err) {
      console.warn('Pages fetch fallback to local cache:', err);
      return cached;
    } finally {
      inflightFetchPromise = null;
    }
  })();

  return inflightFetchPromise;
}

/**
 * Fetch all dynamic pages for Admin view (drafts, published, scheduled)
 */
export async function getAllAdminPages(): Promise<DynamicPage[]> {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const list: DynamicPage[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...(doc.data() as any) });
    });

    list.sort((a, b) => new Date(b.updatedAt || b.publishedAt || 0).getTime() - new Date(a.updatedAt || a.publishedAt || 0).getTime());

    memoryPagesCache = list;
    setLocalCache(list);
    return list;
  } catch (err) {
    console.warn('Admin pages fetch failed, reading cache:', err);
    return getLocalCache();
  }
}

/**
 * Fetch single page by slug
 */
export async function getPageBySlug(slug: string): Promise<DynamicPage | null> {
  const clean = slug.toLowerCase().trim();
  const cached = memoryPagesCache || getLocalCache();
  const found = cached.find(p => p.slug.toLowerCase() === clean);
  if (found) return found;

  try {
    const { collection, getDocs, query, where, limit } = await import('firebase/firestore');
    const q = query(collection(db, COLLECTION_NAME), where('slug', '==', clean), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0];
      const page = { id: doc.id, ...(doc.data() as any) } as DynamicPage;
      return page;
    }
  } catch (err) {
    console.warn('getPageBySlug error:', err);
  }
  return null;
}

/**
 * Save / Update page in Firestore & local cache
 */
export async function savePageToFirestore(page: Partial<DynamicPage>): Promise<DynamicPage> {
  const { doc, setDoc } = await import('firebase/firestore');
  const now = new Date().toISOString();
  const id = page.id || `page-${Date.now()}`;
  const slug = page.slug?.trim().toLowerCase() || `page-${Date.now()}`;

  // Auto detect thumbnail if not manually provided
  let coverImage = page.coverImage;
  if (!page.thumbnailManual || !coverImage) {
    const extracted = extractFirstImageFromContent(page.content || '');
    if (extracted) {
      coverImage = extracted;
    }
  }

  const finalPage: DynamicPage = {
    id,
    slug,
    title: page.title || 'Untitled Page',
    content: page.content || '',
    excerpt: page.excerpt || '',
    coverImage: coverImage || '',
    thumbnailManual: !!page.thumbnailManual,
    status: page.status || 'published',
    publishedAt: page.publishedAt || now,
    placement: page.placement || 'custom',
    metaTitle: page.metaTitle || page.title || 'Toolzaro Page',
    metaDescription: page.metaDescription || page.excerpt || '',
    orderIndex: page.orderIndex ?? 0,
    createdAt: page.createdAt || now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION_NAME, id), finalPage, { merge: true });

  // Update memory and local cache
  const cached = getLocalCache().filter(p => p.id !== id && p.slug !== slug);
  cached.unshift(finalPage);
  memoryPagesCache = cached;
  setLocalCache(cached);

  return finalPage;
}

/**
 * Delete a page from Firestore & cache
 */
export async function deletePageFromFirestore(id: string): Promise<boolean> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, COLLECTION_NAME, id));

  const cached = getLocalCache().filter(p => p.id !== id);
  memoryPagesCache = cached;
  setLocalCache(cached);
  return true;
}
