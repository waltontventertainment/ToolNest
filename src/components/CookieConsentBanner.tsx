import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

// Bumped to v4 to ensure existing desktop sessions that answered previous prompts can see the fresh notice
export const COOKIE_STORAGE_KEY = 'toolzaro_cookie_consent_v4';
export const LEGACY_STORAGE_KEYS = [
  'toolzaro_cookie_consent',
  'toolzaro_cookie_consent_v2',
  'toolzaro_cookie_consent_v3',
];

export const CookieConsentBanner: React.FC = () => {
  const { settings } = useSiteSettings();
  const isEnabled = settings.cookieConsent?.enabled !== false;
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check consent status immediately on mount / settings change
  useEffect(() => {
    if (!isEnabled) {
      setIsVisible(false);
      return;
    }

    try {
      // Support URL debug flag (?preview_cookies or ?reset_cookies) for instant testing on any PC or mobile
      if (
        typeof window !== 'undefined' &&
        (window.location.search.includes('preview_cookies') ||
          window.location.search.includes('reset_cookies'))
      ) {
        localStorage.removeItem(COOKIE_STORAGE_KEY);
        setIsVisible(true);
        return;
      }

      const consentV4 = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consentV4) {
        setIsVisible(true);
      }
    } catch {
      // If localStorage is blocked in private browsing, show banner so user has consent UI
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
      LEGACY_STORAGE_KEYS.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {}
      });
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
    Responsive, AdSense-Safe & Anti-Adblock Layout for PC Desktop and Mobile:
    1. Rendered via document.body Portal to guarantee zero container clipping or transform stacking issues.
    2. PC Desktop: Fixed at bottom-right (bottom: 24px, right: 24px, width: 400px) with explicit coordinates.
    3. Mobile Phone: Fixed at bottom (bottom: 12px, left: 12px, right: 12px) with safe margins.
    4. AdSense Compliant: No full-screen backdrop or click interceptors to eliminate false/accidental ad clicks.
    5. Anti-Filter: Neutral DOM IDs and standard container hierarchy to avoid aggressive PC adblock false-positives.
    6. High contrast in both light mode and dark mode with accessible buttons.
  */
  const bannerContent = (
    <div
      role="region"
      aria-label="Privacy and storage preferences"
      id="tz-privacy-pref-dock"
      className="fixed z-[999999] bottom-3 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px] max-w-[calc(100vw-1.5rem)] pointer-events-auto transition-all duration-300 ease-out"
      style={{
        position: 'fixed',
        zIndex: 999999,
      }}
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl p-4 sm:p-5 ring-1 ring-black/10 dark:ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Cookie className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Cookie &amp; Privacy Notice
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Zero-Knowledge Client-Side Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              <span>GDPR</span>
            </span>
            <button
              type="button"
              onClick={() => handleChoice('declined')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Dismiss and decline non-essential cookies"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Contrast Description for Both Light & Dark Mode */}
        <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
          We use local browser storage and standard cookies to process files directly inside your browser and display compliant ads.{' '}
          <Link
            to="/privacy-policy"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Actions: Decline & Accept Buttons */}
        <div className="mt-3.5 flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(bannerContent, document.body) : null;
};

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('open_cookie_settings'));
}
