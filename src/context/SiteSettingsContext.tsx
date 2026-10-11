import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, DEFAULT_SITE_SETTINGS, getCachedSiteSettings, fetchSiteSettings, saveSiteSettings } from '../lib/siteSettings';

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings>;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  updateSettings: async () => DEFAULT_SITE_SETTINGS,
  refreshSettings: async () => {},
  loading: false
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => getCachedSiteSettings());
  const [loading, setLoading] = useState(false);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const latest = await fetchSiteSettings();
      setSettings(latest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let triggered = false;
    const triggerRefresh = () => {
      if (triggered) return;
      triggered = true;
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerRefresh)
      );
      refreshSettings();
    };

    const isAdminRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/sabbir') ||
        window.location.search.includes('page=sabbir'));

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isAdminRoute) {
      timer = setTimeout(triggerRefresh, 100);
    } else {
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.addEventListener(evt, triggerRefresh, { once: true, passive: true })
      );
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener('toolzaro_settings_updated', handleUpdate);
    return () => {
      if (timer) clearTimeout(timer);
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerRefresh)
      );
      window.removeEventListener('toolzaro_settings_updated', handleUpdate);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const updated = await saveSiteSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, refreshSettings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
