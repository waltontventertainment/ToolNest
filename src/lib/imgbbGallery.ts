// Real ImgBB Media Library Store
// Tracks real images uploaded via ImgBB for instant reuse, inserting at cursor, or deletion
// Dual-persisted in Firebase Firestore ('imgbb_gallery') and local browser storage.

export interface GalleryImage {
  id: string;
  url: string;
  thumbUrl?: string;
  name?: string;
  alt?: string;
  uploadedAt: string;
  deleteUrl?: string;
}

const STORAGE_KEY = 'toolzaro_imgbb_real_media_gallery';
const FIRESTORE_COLLECTION = 'imgbb_gallery';

let memoryGallery: GalleryImage[] | null = null;
let firestoreFetchDone = false;

// Dynamic loader for Firebase Firestore
async function getFirestoreModule() {
  try {
    const [fs, fb] = await Promise.all([
      import('firebase/firestore'),
      import('./firebase'),
    ]);
    return {
      db: fb.db,
      collection: fs.collection,
      doc: fs.doc,
      getDocs: fs.getDocs,
      setDoc: fs.setDoc,
      deleteDoc: fs.deleteDoc,
      query: fs.query,
      orderBy: fs.orderBy,
      limit: fs.limit,
    };
  } catch (err) {
    console.warn('Firestore module load note:', err);
    return null;
  }
}

/**
 * Returns the currently cached real ImgBB gallery images synchronously (0ms delay).
 * No built-in or mock Unsplash demo images.
 */
export function getImgBBGallery(): GalleryImage[] {
  if (memoryGallery) return memoryGallery;

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy unsplash URLs if they lingered in old localstorage
          const realImages = parsed.filter(img => !img.url?.includes('images.unsplash.com'));
          memoryGallery = realImages;
          return realImages;
        }
      }
    }
  } catch {}

  memoryGallery = [];
  return [];
}

/**
 * Fetches real uploaded ImgBB gallery items from Firebase Firestore and syncs local cache.
 */
export async function fetchRemoteImgBBGallery(): Promise<GalleryImage[]> {
  try {
    const fs = await getFirestoreModule();
    if (!fs) return getImgBBGallery();

    const q = fs.query(
      fs.collection(fs.db, FIRESTORE_COLLECTION),
      fs.orderBy('uploadedAt', 'desc'),
      fs.limit(100)
    );

    const snapshot = await fs.getDocs(q);
    const remoteItems: GalleryImage[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.url) {
        remoteItems.push({
          id: docSnap.id,
          url: data.url,
          thumbUrl: data.thumbUrl || data.url,
          name: data.name || 'Uploaded Image',
          alt: data.alt || '',
          uploadedAt: data.uploadedAt || new Date().toISOString(),
          deleteUrl: data.deleteUrl,
        });
      }
    });

    // Merge with any local offline uploads
    const current = getImgBBGallery();
    const map = new Map<string, GalleryImage>();
    remoteItems.forEach(item => map.set(item.url, item));
    current.forEach(item => {
      if (!map.has(item.url)) {
        map.set(item.url, item);
      }
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    memoryGallery = combined;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      } catch {}
    }
    firestoreFetchDone = true;
    return combined;
  } catch (err) {
    console.warn('ImgBB remote gallery sync note:', err);
    return getImgBBGallery();
  }
}

/**
 * Adds a new real uploaded image to both local storage and Firestore.
 */
export function addImgBBGalleryItem(
  item: Omit<GalleryImage, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }
): GalleryImage[] {
  const current = getImgBBGallery();
  const id = item.id || `imgbb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const uploadedAt = item.uploadedAt || new Date().toISOString();

  const newEntry: GalleryImage = {
    id,
    url: item.url,
    thumbUrl: item.thumbUrl || item.url,
    name: item.name || 'Uploaded Asset',
    alt: item.alt || '',
    uploadedAt,
    deleteUrl: item.deleteUrl,
  };

  // Prepend to list, deduping by URL
  const filtered = current.filter(img => img.url !== item.url);
  const updated = [newEntry, ...filtered];
  memoryGallery = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  // Dual-persist to Firestore in background
  getFirestoreModule().then(fs => {
    if (fs) {
      fs.setDoc(fs.doc(fs.db, FIRESTORE_COLLECTION, id), newEntry, { merge: true }).catch(err => {
        console.warn('ImgBB Firestore persist note:', err?.message || err);
      });
    }
  }).catch(() => {});

  return updated;
}

/**
 * Removes an image from both local storage and Firestore.
 */
export function removeImgBBGalleryItem(idOrUrl: string): GalleryImage[] {
  const current = getImgBBGallery();
  const itemToRemove = current.find(img => img.id === idOrUrl || img.url === idOrUrl);
  const updated = current.filter(img => img.id !== idOrUrl && img.url !== idOrUrl);
  memoryGallery = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  if (itemToRemove) {
    getFirestoreModule().then(fs => {
      if (fs) {
        fs.deleteDoc(fs.doc(fs.db, FIRESTORE_COLLECTION, itemToRemove.id)).catch(() => {});
      }
    }).catch(() => {});
  }

  return updated;
}
