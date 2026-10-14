import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const COOKIE_STORAGE_KEY = 'toolzaro_cookie_consent_v2';
const LEGACY_STORAGE_KEY = 'toolzaro_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const { settings } = useSiteSettings();
  const isEnabled = settings.cookieConsent?.enabled !== false;
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setIsVisible(false);
      return;
    }

    try {
      // Check v2 consent first
      const consentV2 = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consentV2) {
        // Show banner smoothly after brief initial page paint
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is blocked in private browsing, show banner so user can consent
      setIsVisible(true);
    }
  }, [isEnabled]);

  // Listen to re-open requests (from Footer 'Cookie Preferences' or Admin Panel 'Preview Banner')
  useEffect(() => {
    const handleOpen = () => {
      if (settings.cookieConsent?.enabled !== false) {
        setIsVisible(true);
      }
    };
    window.addEventListener('open_cookie_settings', handleOpen);
    return () => window.removeEventListener('open_cookie_settings', handleOpen);
  }, [settings.cookieConsent?.enabled]);

  const handleChoice = (decision: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, decision);
      localStorage.setItem(LEGACY_STORAGE_KEY, decision);
      localStorage.setItem(`${COOKIE_STORAGE_KEY}_timestamp`, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: decision }));
    } catch (e) {
      console.warn('Failed to save cookie consent preference:', e);
    }
    setIsVisible(false);
  };

  if (!isMounted || !isVisible || !isEnabled) {
    return null;
  }

  /*
    Responsive & AdSense-Safe Layout for both PC Desktop and Mobile:
    1. Rendered via document.body Portal to prevent any parent container overflow clipping on desktop.
    2. PC Desktop: Pinned to bottom-right (bottom-6 right-6) with fixed width (w-[390px]), fully visible.
    3. Mobile Phone: Pinned to bottom with 12px safe margins (inset-x-3 bottom-3).
    4. 100% solid background (white in light mode, slate-900 in dark mode) with high-contrast text.
    5. pointer-events-auto on the dialog card only; zero invisible touch traps or backdrop overlays to prevent accidental ad clicks.
    6. z-[99999] guarantees it stays above all desktop layout elements.
  */
  const bannerContent = (
    <aside
      role="region"
      aria-label="Cookie & Privacy Consent"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[390px] md:w-[410px] max-w-[calc(100vw-1.5rem)] z-[99999] pointer-events-auto transition-all duration-300 ease-out"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800/60">
              <Cookie className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                Cookie &amp; Privacy Consent
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Toolzaro Client-Side Privacy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              <span>GDPR</span>
            </span>
            <button
              type="button"
              onClick={() => handleChoice('declined')}
              className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close and decline non-essential cookies"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High-Contrast Description for Both Light & Dark Mode */}
        <p className="mt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
          We use local browser storage and standard cookies to process files directly on your device and serve compliant ads.{' '}
          <Link
            to="/privacy-policy"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Actions: Decline & Accept Buttons */}
        <div className="mt-3.5 flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return createPortal(bannerContent, document.body);
};

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('open_cookie_settings'));
}
