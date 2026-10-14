import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'toolzaro_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so page loads smoothly without sudden shift
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is unavailable, fail silently
    }
  }, []);

  // Allow re-opening cookie preferences anytime from the footer link
  useEffect(() => {
    const handleOpen = () => setIsVisible(true);
    window.addEventListener('open_cookie_settings', handleOpen);
    return () => window.removeEventListener('open_cookie_settings', handleOpen);
  }, []);

  const handleChoice = (decision: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(STORAGE_KEY, decision);
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: decision }));
    } catch (e) {
      console.warn('Failed to save cookie consent preference:', e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    /* 
      Accidental Click Prevention for Google AdSense:
      1. Fixed to bottom-right corner (never spans full bottom width where anchor ads sit).
      2. Isolated card with strong border, 100% solid background (no bleed/transparency), and heavy shadow.
      3. pointer-events-auto on the card only; zero invisible touch traps to avoid invalid clicks.
    */
    <aside
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 sm:bottom-4 z-50 sm:max-w-xs md:max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-2xl rounded-xl p-3 text-slate-900 dark:text-slate-100 ring-1 ring-black/10 dark:ring-white/10">
        {/* Header: Title + Close Button */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Cookie className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
              Cookie &amp; Ad Consent
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>

          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ultra-compact high-contrast description */}
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
          We use cookies &amp; browser storage for tool processing and Google AdSense compliance.{' '}
          <Link
            to="/privacy-policy"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Clear, well-separated action buttons preventing accidental clicks */}
        <div className="mt-2.5 flex items-center justify-end gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-sm transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
};

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('open_cookie_settings'));
}
