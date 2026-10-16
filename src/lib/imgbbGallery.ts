// ImgBB Media Library Store
// Tracks all images uploaded via ImgBB for instant reuse, inserting at cursor, or deletion

export interface GalleryImage {
  id: string;
  url: string;
  thumbUrl?: string;
  name?: string;
  alt?: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'toolzaro_imgbb_media_gallery';

const DEFAULT_SEEDED_IMAGES: GalleryImage[] = [
  {
    id: 'seed-1',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=240&auto=format&fit=crop&q=70',
    name: 'Cybersecurity & Privacy Hero',
    alt: 'Zero-Knowledge Privacy and Cryptography in Web Browsers',
    uploadedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'seed-2',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=240&auto=format&fit=crop&q=70',
    name: 'Technical SEO Blueprint',
    alt: 'Search Engine Optimization and Schema Graphs',
    uploadedAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'seed-3',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=240&auto=format&fit=crop&q=70',
    name: 'Modern Web Architecture',
    alt: 'Client-Side Web Development Architecture',
    uploadedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'seed-4',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=240&auto=format&fit=crop&q=70',
    name: 'Matrix Data Security',
    alt: 'Hardware Cryptography and Data Sovereignty',
    uploadedAt: '2026-10-01T08:00:00Z',
  }
];

export function getImgBBGallery(): GalleryImage[] {
  try {
    if (typeof window === 'undefined') return DEFAULT_SEEDED_IMAGES;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_IMAGES));
      return DEFAULT_SEEDED_IMAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEEDED_IMAGES;
  } catch {
    return DEFAULT_SEEDED_IMAGES;
  }
}

export function addImgBBGalleryItem(item: Omit<GalleryImage, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }): GalleryImage[] {
  try {
    const current = getImgBBGallery();
    // Prevent duplicate URLs
    const filtered = current.filter(img => img.url !== item.url);
    const newEntry: GalleryImage = {
      id: item.id || `imgbb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: item.url,
      thumbUrl: item.thumbUrl || item.url,
      name: item.name || 'Uploaded Asset',
      alt: item.alt || '',
      uploadedAt: item.uploadedAt || new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return getImgBBGallery();
  }
}

export function removeImgBBGalleryItem(idOrUrl: string): GalleryImage[] {
  try {
    const current = getImgBBGallery();
    const updated = current.filter(img => img.id !== idOrUrl && img.url !== idOrUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return getImgBBGallery();
  }
}
