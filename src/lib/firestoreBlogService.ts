import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

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
  status: 'published' | 'draft';
  contentType?: 'text' | 'code'; // 'text' for formatted editorial text, 'code' for custom HTML/CSS/JS design
  customHtml?: string;
  customCss?: string;
  customJs?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'blogs';
const LOCAL_STORAGE_CACHE_KEY = 'toolzaro_firestore_blogs_cache';

// Helper to get local cache
function getLocalCache(): FirestoreBlog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local cache
function setLocalCache(blogs: FirestoreBlog[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(blogs));
  } catch {}
}

/**
 * Fetch all published blogs for the public /blog page and search
 */
export async function getPublishedBlogs(): Promise<FirestoreBlog[]> {
  try {
    const blogsRef = collection(db, COLLECTION_NAME);
    const q = query(blogsRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    const blogs: FirestoreBlog[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as FirestoreBlog;
      blogs.push({
        ...data,
        id: docSnap.id,
      });
    });

    // Sort descending by publication date
    blogs.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

    if (blogs.length > 0) {
      setLocalCache(blogs);
      return blogs;
    }
  } catch (error) {
    console.warn('Firestore fetch failed, checking local cache:', error);
  }

  // Fallback to local cache if offline or initial setup
  const cached = getLocalCache();
  return cached.filter(b => b.status === 'published');
}

/**
 * Fetch all blogs (both published and drafts) for the Admin CMS
 */
export async function getAllAdminBlogs(): Promise<FirestoreBlog[]> {
  try {
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

    blogs.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

    if (blogs.length > 0) {
      setLocalCache(blogs);
      return blogs;
    }
  } catch (error) {
    console.warn('Failed to load admin blogs from Firestore:', error);
  }

  return getLocalCache();
}

/**
 * Fetch a single blog post by slug or ID
 */
export async function getBlogBySlug(slugOrId: string): Promise<FirestoreBlog | null> {
  const clean = slugOrId.toLowerCase().trim();

  try {
    // 1. Try direct ID doc fetch
    const docRef = doc(db, COLLECTION_NAME, clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...(docSnap.data() as FirestoreBlog), id: docSnap.id };
    }

    // 2. Query by slug
    const blogsRef = collection(db, COLLECTION_NAME);
    const q = query(blogsRef, where('slug', '==', clean), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      return { ...(first.data() as FirestoreBlog), id: first.id };
    }
  } catch (error) {
    console.warn('Firestore query by slug failed, checking cache:', error);
  }

  // Fallback to local cache
  const cached = getLocalCache();
  return cached.find(b => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean) || null;
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
      name: blog.author?.name || 'Admin',
      role: blog.author?.role || 'Lead Editor',
      avatar: blog.author?.avatar || 'https://ui-avatars.com/api/?name=Toolzaro+Admin&background=6366f1&color=ffffff&bold=true',
      profileUrl: blog.author?.profileUrl || ''
    },
    publishedAt: blog.publishedAt || new Date().toISOString().split('T')[0],
    readTimeMinutes: blog.readTimeMinutes || Math.max(1, Math.round((blog.content?.split(/\s+/).length || 200) / 200)),
    status: blog.status || 'published',
    createdAt: blog.createdAt || now,
    updatedAt: now
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, completeBlog, { merge: true });
  } catch (error: any) {
    console.warn('Firestore blog save note (safely stored in local cache):', error?.message || error);
  }

  // Update local cache
  const currentCache = getLocalCache().filter(b => b.id !== id);
  currentCache.unshift(completeBlog);
  setLocalCache(currentCache);

  return completeBlog;
}

/**
 * Delete a blog post from Firestore
 */
export async function deleteBlogFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn('Firestore blog delete note (safely removed from local cache):', error?.message || error);
  }

  const currentCache = getLocalCache().filter(b => b.id !== id);
  setLocalCache(currentCache);
  return true;
}

/**
 * Seed starter post into Firestore if the database is newly initialized
 */
export async function seedStarterPostIfEmpty(): Promise<FirestoreBlog[]> {
  const existing = await getAllAdminBlogs();
  if (existing.length > 0) {
    return existing;
  }

  const starterPost: Partial<FirestoreBlog> = {
    id: 'welcome-to-toolzaro-tech-hub',
    slug: 'welcome-to-toolzaro-tech-hub',
    title: 'Welcome to Toolzaro: Modern Client-Side Utilities for Developers and Creators',
    excerpt: 'Discover why Toolzaro was built to deliver over 156 zero-latency browser tools with complete zero-knowledge privacy and seamless Google Drive cloud integration.',
    content: `# Welcome to Toolzaro

Toolzaro is your all-in-one browser utility suite. Every single utility—from our high-performance **PDF Toolkit** and **Image Optimizers** to **JSON Formatters**, **Hash Generators**, and **Unit Converters**—executes entirely inside your browser.

## Key Highlights

- **100% Client-Side Privacy:** Your confidential documents, images, and keys never touch a remote backend server.
- **Instant Speed:** Powered by WebAssembly and native Web Cryptography for lightning-fast calculations.
- **Firebase Firestore Hub:** Dynamic blog content, updates, and custom tutorials hosted seamlessly.
- **High Resolution ImgBB CDN:** All media assets and illustrations are hosted and served globally.

> *"Great software simplifies repetitive tasks while respecting your privacy."*

Feel free to customize or delete this post from your new **/admin** control center!`,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    category: 'Developer Workflows',
    tags: ['Toolzaro', 'Privacy', 'WebAssembly', 'Client-Side'],
    author: {
      name: 'Toolzaro Editorial',
      role: 'Chief Editor',
      avatar: 'https://ui-avatars.com/api/?name=Toolzaro&background=6366f1&color=ffffff&bold=true'
    },
    publishedAt: new Date().toISOString().split('T')[0],
    readTimeMinutes: 4,
    status: 'published'
  };

  const created = await saveBlogToFirestore(starterPost);
  return [created];
}
