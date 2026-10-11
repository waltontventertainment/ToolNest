import { tools } from './registry';

let firestoreDepsPromise: Promise<{
  doc: typeof import('firebase/firestore').doc;
  getDoc: typeof import('firebase/firestore').getDoc;
  setDoc: typeof import('firebase/firestore').setDoc;
  db: typeof import('./firebase').db;
}> | null = null;

function loadFirestoreDeps() {
  if (!firestoreDepsPromise) {
    firestoreDepsPromise = Promise.all([
      import('firebase/firestore'),
      import('./firebase'),
    ]).then(([fsMod, fbMod]) => ({
      doc: fsMod.doc,
      getDoc: fsMod.getDoc,
      setDoc: fsMod.setDoc,
      db: fbMod.db,
    }));
  }
  return firestoreDepsPromise;
}

export interface ToolOverride {
  customName?: string;
  customCategory?: string;
  customDescription?: string;
  customBadge?: 'Popular' | 'New' | 'Pro' | 'Featured' | 'Updated' | '';
  disabled?: boolean;
  customCode?: string; // Custom HTML/CSS/JS snippet or banner for this tool
  updatedAt?: string;
}

export interface SiteSettings {
  // Announcement Bar
  announcement: {
    enabled: boolean;
    badge: string;
    text: string;
    linkText: string;
    linkUrl: string;
  };
  // Site Branding & Identity
  branding: {
    siteName: string;
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    contactEmail: string;
    copyrightText: string;
    blogAuthorName?: string;
    blogAuthorRole?: string;
    showBlogAuthorRole?: boolean;
    blogAuthorAvatar?: string;
  };
  // AdSense & Monetization
  ads: {
    enabled: boolean;
    publisherId: string;
    topSlotId: string;
    sidebarSlotId: string;
    inContentSlotId: string;
    bottomSlotId: string;
  };
  // SEO & Cloudflare
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    canonicalBaseUrl: string;
    defaultOgImage: string;
    googleVerificationCode?: string;
    bingVerificationCode?: string;
  };
  // Tool Overrides (custom titles, badges, disabled state, custom code)
  toolOverrides: Record<string, ToolOverride>;
  // Admin & Integrations
  admin: {
    allowedEmails: string[];
    masterAdminUid?: string;
    masterAdminEmail?: string;
    imgbbApiKey: string;
    passwordHash?: string;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    badge: 'Toolzaro 2.0',
    text: '{count} Professional Browser Utilities • 100% Client-Side Privacy • Live Tech Digest & Drive Sync',
    linkText: 'Explore All Tools',
    linkUrl: '/'
  },
  branding: {
    siteName: 'Toolzaro',
    tagline: 'Premium Online Utility Suite',
    heroTitle: `${tools.length}+ High-Performance Browser Utilities`,
    heroSubtitle: 'Free, instant, and 100% private. All transformations happen entirely inside your browser.',
    contactEmail: 'support@toolzaro.cyou',
    copyrightText: '© 2026 Toolzaro. All rights reserved. Zero-knowledge privacy guaranteed.',
    blogAuthorName: 'Toolzaro',
    blogAuthorRole: 'Admin',
    showBlogAuthorRole: true,
    blogAuthorAvatar: ''
  },
  ads: {
    enabled: true,
    publisherId: 'ca-pub-8769496591745522',
    topSlotId: '',
    sidebarSlotId: '',
    inContentSlotId: '',
    bottomSlotId: ''
  },
  seo: {
    defaultTitle: `Toolzaro – ${tools.length}+ Free Online Developer, PDF, Image & Utility Tools`,
    defaultDescription: `Access ${tools.length}+ free, fast, and 100% private browser tools on Toolzaro. Merge PDFs, compress & resize images, format JSON, generate QR codes, and convert files with zero uploads.`,
    canonicalBaseUrl: 'https://toolzaro.cyou',
    defaultOgImage: 'https://toolzaro.cyou/og-banner.jpg',
    googleVerificationCode: 'googlea0fb90138c92702a.html',
    bingVerificationCode: ''
  },
  toolOverrides: {},
  admin: {
    allowedEmails: [],
    masterAdminEmail: '',
    imgbbApiKey: '1ba7e3014ff726df236cef13ca1a79f3',
    passwordHash: 'admin123'
  }
};

const SETTINGS_DOC_ID = 'general';
const SETTINGS_COLLECTION = 'site_settings';
const LOCAL_STORAGE_KEY = 'toolzaro_site_settings_cache';

/**
 * Format any string containing hardcoded counts or {count} placeholder with the live tool count
 */
export function formatDynamicToolCount(text?: string, count: number = tools.length): string {
  if (!text) return '';
  return text
    .replace(/\{count\}|\{total\}|\{tools\}/gi, `${count}`)
    .replace(/\b(?:156|168|268|\d{2,3})\s*(?:\+|plus)\s*(?:professional\s*)?(?:browser\s*)?(?:tools?|utilities?)/gi, `${count}+ Free Browser Utilities`)
    .replace(/\b(?:156|168|268)\s*(?:\+|plus)\s*/gi, `${count}+ `)
    .replace(/\b(?:156|168|268)\s*(?:tools?|utilities?)\b/gi, `${count} utilities`);
}

/**
 * Get current site settings with synchronous local fallback
 */
export function getCachedSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If settings don't have a verified master admin UID or are uninitialized, allow first user to claim
      const adminData = { ...DEFAULT_SITE_SETTINGS.admin, ...(parsed.admin || {}) };
      if (adminData.masterAdminEmail && !adminData.masterAdminUid) {
        // Unverified legacy placeholder - clear so genuine first Google login claims admin
        adminData.masterAdminEmail = '';
        adminData.allowedEmails = [];
      }

      const branding = {
        ...DEFAULT_SITE_SETTINGS.branding,
        ...(parsed.branding || {}),
        heroTitle: formatDynamicToolCount(parsed.branding?.heroTitle || DEFAULT_SITE_SETTINGS.branding.heroTitle)
      };

      const seo = {
        ...DEFAULT_SITE_SETTINGS.seo,
        ...(parsed.seo || {}),
        defaultTitle: formatDynamicToolCount(parsed.seo?.defaultTitle || DEFAULT_SITE_SETTINGS.seo.defaultTitle),
        defaultDescription: formatDynamicToolCount(parsed.seo?.defaultDescription || DEFAULT_SITE_SETTINGS.seo.defaultDescription)
      };

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...(parsed.announcement || {}) },
        branding,
        ads: { ...DEFAULT_SITE_SETTINGS.ads, ...(parsed.ads || {}) },
        seo,
        toolOverrides: { ...DEFAULT_SITE_SETTINGS.toolOverrides, ...(parsed.toolOverrides || {}) },
        admin: adminData
      };
    }
  } catch {}
  return DEFAULT_SITE_SETTINGS;
}

export interface FirestoreSyncStatus {
  hasPermissionError: boolean;
  lastErrorMessage?: string;
  isOnline: boolean;
}

let currentSyncStatus: FirestoreSyncStatus = {
  hasPermissionError: false,
  isOnline: true
};

export function getFirestoreSyncStatus(): FirestoreSyncStatus {
  return currentSyncStatus;
}

/**
 * Fetch latest site settings from Firestore
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { doc, getDoc, db } = await loadFirestoreDeps();
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>;
      const branding = {
        ...DEFAULT_SITE_SETTINGS.branding,
        ...(data.branding || {}),
        heroTitle: formatDynamicToolCount(data.branding?.heroTitle || DEFAULT_SITE_SETTINGS.branding.heroTitle)
      };
      const seo = {
        ...DEFAULT_SITE_SETTINGS.seo,
        ...(data.seo || {}),
        defaultTitle: formatDynamicToolCount(data.seo?.defaultTitle || DEFAULT_SITE_SETTINGS.seo.defaultTitle),
        defaultDescription: formatDynamicToolCount(data.seo?.defaultDescription || DEFAULT_SITE_SETTINGS.seo.defaultDescription)
      };

      const merged: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...data,
        announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...(data.announcement || {}) },
        branding,
        ads: { ...DEFAULT_SITE_SETTINGS.ads, ...(data.ads || {}) },
        seo,
        toolOverrides: { ...DEFAULT_SITE_SETTINGS.toolOverrides, ...(data.toolOverrides || {}) },
        admin: { ...DEFAULT_SITE_SETTINGS.admin, ...(data.admin || {}) }
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      currentSyncStatus = { hasPermissionError: false, isOnline: true };
      return merged;
    }
  } catch (e: any) {
    const isPermission = e?.code === 'permission-denied' || e?.message?.includes('Missing or insufficient permissions');
    if (isPermission) {
      currentSyncStatus = {
        hasPermissionError: true,
        lastErrorMessage: 'Firestore rules in toolzaro-56fe1 need to allow read/write access.',
        isOnline: false
      };
      window.dispatchEvent(new CustomEvent('toolzaro_sync_status', { detail: currentSyncStatus }));
    }
    console.warn('Firestore fetch notice (using cached settings):', e?.message || e);
  }

  return getCachedSiteSettings();
}

/**
 * Save site settings to Firestore and local cache
 */
export async function saveSiteSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getCachedSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...newSettings,
    announcement: { ...current.announcement, ...(newSettings.announcement || {}) },
    branding: { ...current.branding, ...(newSettings.branding || {}) },
    ads: { ...current.ads, ...(newSettings.ads || {}) },
    seo: { ...current.seo, ...(newSettings.seo || {}) },
    admin: { ...current.admin, ...(newSettings.admin || {}) }
  };

  // 1. Immediately update local storage and notify all components across the app
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('toolzaro_settings_updated', { detail: updated }));
  } catch {}

  // 2. Persist to Firestore in toolzaro-56fe1
  try {
    const { doc, setDoc, db } = await loadFirestoreDeps();
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, updated, { merge: true });
    currentSyncStatus = { hasPermissionError: false, isOnline: true };
    window.dispatchEvent(new CustomEvent('toolzaro_sync_status', { detail: currentSyncStatus }));
  } catch (e: any) {
    const isPermission = e?.code === 'permission-denied' || e?.message?.includes('Missing or insufficient permissions');
    currentSyncStatus = {
      hasPermissionError: !!isPermission,
      lastErrorMessage: e?.message || 'Firestore write permission error',
      isOnline: false
    };
    window.dispatchEvent(new CustomEvent('toolzaro_sync_status', { detail: currentSyncStatus }));
    console.warn('Firestore sync notice (settings saved safely in local storage):', e?.message || e);
  }

  return updated;
}
