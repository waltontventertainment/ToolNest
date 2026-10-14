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
        // Small delay so it smoothly slides in without blocking initial paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is disabled or throws, do nothing
    }
  }, []);

  // Listen for custom trigger to re-open cookie settings from footer
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
      console.warn('Failed to persist cookie consent preference:', e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-background/95 dark:bg-slate-900/95 backdrop-blur-md border border-border shadow-2xl rounded-xl p-4 sm:p-5 text-foreground transition-all">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-sm tracking-tight flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cookie &amp; Privacy Choices
              </h3>
              <button
                type="button"
                onClick={() => handleChoice('declined')}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md -mr-1"
                aria-label="Close cookie consent banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              We use essential cookies and browser storage to ensure private local processing, remember your preferences, and serve relevant Google AdSense ads in compliance with GDPR.
            </p>

            <div className="mt-2 text-xs">
              <Link 
                to="/privacy-policy" 
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                Read our Privacy Policy &amp; Ad Disclosure &rarr;
              </Link>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => handleChoice('accepted')}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleChoice('declined')}
                className="px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-border"
              >
                Decline Non-Essential
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('open_cookie_settings'));
}
