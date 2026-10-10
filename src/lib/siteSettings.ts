import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { tools } from './registry';

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
    heroTitle: '156+ High-Performance Browser Utilities',
    heroSubtitle: 'Free, instant, and 100% private. All transformations happen entirely inside your browser.',
    contactEmail: 'support@toolzaro.cyou',
    copyrightText: '© 2026 Toolzaro. All rights reserved. Zero-knowledge privacy guaranteed.'
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
    defaultTitle: 'Toolzaro - Premium Online Utility Suite',
    defaultDescription: '156 browser-based tools for developers, designers and creators. Fast, private, and 100% client-side.',
    canonicalBaseUrl: 'https://toolzaro.cyou',
    defaultOgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    googleVerificationCode: '',
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

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...parsed.announcement },
        branding: { ...DEFAULT_SITE_SETTINGS.branding, ...parsed.branding },
        ads: { ...DEFAULT_SITE_SETTINGS.ads, ...parsed.ads },
        seo: { ...DEFAULT_SITE_SETTINGS.seo, ...parsed.seo },
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
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>;
      const merged: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...data,
        announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...(data.announcement || {}) },
        branding: { ...DEFAULT_SITE_SETTINGS.branding, ...(data.branding || {}) },
        ads: { ...DEFAULT_SITE_SETTINGS.ads, ...(data.ads || {}) },
        seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(data.seo || {}) },
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
