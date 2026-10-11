import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Wrench, Star, ArrowRight, BookOpen, Cloud, Bug, MessageSquarePlus, Sparkles, X, ArrowUp } from 'lucide-react';
import { useLocalStorage } from '../lib/toolkit';
import { categories, tools } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { HeaderSearch } from './HeaderSearch';
import { ThemeToggle3D } from './ThemeToggle3D';
import { useFavorites } from '../context/FavoritesContext';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { getBlogUrl, getCategoryUrl, getStaticPageUrl, getToolsHubUrl, getBookmarksUrl } from '../lib/appUrls';
import { useSiteSettings } from '../context/SiteSettingsContext';

const GoogleDriveModal = React.lazy(() => import('./GoogleDriveModal').then(m => ({ default: m.GoogleDriveModal })));
const FeedbackModal = React.lazy(() => import('./FeedbackModal').then(m => ({ default: m.FeedbackModal })));

function getDefaultTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {}
  return 'dark';
}

export const SiteLayout: React.FC = () => {
  const { settings } = useSiteSettings();
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('toolnest-theme', getDefaultTheme());
  const { favorites } = useFavorites();
  const { user, accessToken } = useGoogleDrive();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<boolean>('toolnest_top_banner_dismissed', false);
  const location = useLocation();
  const { pathname } = location;

  React.useEffect(() => {
    const isDark = theme === 'dark';
    const hasDark = document.documentElement.classList.contains('dark');
    if (isDark !== hasDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Reset scroll position ONLY on actual route navigation, never on initial mount (eliminates 206ms Forced Reflow)
  const prevRouteRef = React.useRef(pathname + location.search);
  React.useEffect(() => {
    if (prevRouteRef.current !== pathname + location.search) {
      prevRouteRef.current = pathname + location.search;
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, location.search]);

  const liveCount = React.useMemo(() => {
    try {
      return getEffectiveTools(tools, settings.toolOverrides, false).length;
    } catch {
      return tools.length;
    }
  }, [settings.toolOverrides]);

  const isAnnouncementActive = settings.announcement.enabled && !isBannerDismissed;
  const bannerBadge = settings.announcement.badge || 'Toolzaro 2.0';

  const bannerText = React.useMemo(() => {
    const raw = settings.announcement.text || '{count} Professional Browser Utilities • 100% Client-Side Privacy';
    return raw
      .replace(/\{count\}|\{total\}|\{tools\}/gi, `${liveCount}`)
      .replace(/\b(?:156|168|268|\d{2,3})\s*(?:\+|plus)\s*(?:professional\s*)?(?:browser\s*)?(?:tools?|utilities?)/gi, `${liveCount} Professional Browser Utilities`)
      .replace(/\b(?:156|168|268|\d{2,3})\s*(?:\+|plus|\b)/gi, `${liveCount}`);
  }, [settings.announcement.text, liveCount]);

  const bannerLinkText = settings.announcement.linkText || 'Explore All Tools';
  const bannerLinkUrl = settings.announcement.linkUrl || '/';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Premium Top Announcement Banner for Desktop / PC View */}
      {isAnnouncementActive && (
        <div className="hidden md:block w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-primary/30 text-white text-xs relative overflow-hidden shadow-xs">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/30 border border-primary/40 text-[10px] font-black uppercase tracking-wider text-white">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{bannerBadge}</span>
              </span>
              <p className="font-semibold text-slate-200 text-xs">
                {bannerText}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to={bannerLinkUrl} 
                onClick={() => {
                  if (bannerLinkUrl === '/') {
                    setTimeout(() => {
                      document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }, 60);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-white bg-primary/40 hover:bg-primary/70 px-3 py-1 rounded-lg border border-primary/50 transition-all shadow-2xs hover:scale-105"
              >
                <span>{bannerLinkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setIsBannerDismissed(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close top banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/95 border-b border-border/80 shadow-2xs">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 3D Extruded Logo on the left */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Toolzaro Home">
            <div className="logo-3d w-10 h-10 flex items-center justify-center text-white shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/35 pointer-events-none" />
              <Wrench className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-brand-gradient font-display font-black text-xl sm:text-2xl tracking-[-0.035em] leading-none">
                Toolzaro
              </span>
              <span className="text-kicker text-[9px] text-muted-foreground/80 tracking-widest mt-0.5 font-bold hidden sm:block">
                Online Utility Suite
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links (True PC App Header) */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-muted-foreground" aria-label="Primary Desktop Navigation">
            <Link
              to="/"
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname === '/' ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              Workspace
            </Link>
            <Link
              to={getToolsHubUrl()}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname === '/tools' ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              All Tools ({liveCount})
            </Link>
            <Link
              to={getCategoryUrl('pdf')}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname === '/pdf' ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              PDF Suite
            </Link>
            <Link
              to={getCategoryUrl('color-image')}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname === '/color-image' ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              Image &amp; Color
            </Link>
            <Link
              to={getCategoryUrl('developer')}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname === '/developer' ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              Developer
            </Link>
            <Link
              to={getBlogUrl()}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 border-b-2 ${
                pathname.startsWith('/blog') ? 'text-primary font-bold border-primary' : 'border-transparent'
              }`}
            >
              Guides &amp; Blog
            </Link>
          </nav>

          {/* Right-side toolbar: Blog (below xl), Search, Saved, Drive Sync, Report Bug, Dark Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Blog Hub Link (Visible below xl; xl uses Center Nav) */}
            <Link
              to={getBlogUrl()}
              className={`xl:hidden btn-signature-header px-2.5 sm:px-3.5 gap-1.5 text-xs font-bold ${
                pathname.startsWith('/blog') || (typeof window !== 'undefined' && window.location.search.includes('page=blog'))
                  ? 'bg-primary/15 text-primary border-primary/40 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Toolzaro Pulse & Insights"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="hidden sm:inline">Blog</span>
            </Link>

            {/* 1. Search Trigger Button */}
            <HeaderSearch />

            {/* 2. Favorites / Saved Button -> /bookmarks */}
            <Link
              to={pathname === '/bookmarks' || pathname === '/saved' || pathname === '/favorites' ? '/' : getBookmarksUrl()}
              className={`btn-signature-header px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 text-xs font-bold ${
                pathname === '/bookmarks' || pathname === '/saved' || pathname === '/favorites' || location.search.includes('favorites=true')
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-600 shadow-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="View Bookmarked Tools (/bookmarks)"
            >
              <Star 
                className={`w-4 h-4 transition-transform group-hover:scale-115 shrink-0 ${
                  favorites.length > 0 ? 'text-amber-500 fill-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-amber-600 dark:text-amber-400'
                }`} 
              />
              <span className="hidden sm:inline">Saved</span>
              {favorites.length > 0 && (
                <span className="text-[10px] font-bold text-amber-950 dark:text-amber-200 bg-amber-200/90 dark:bg-amber-950/90 px-1.5 py-0.2 rounded-md border border-amber-300/80 dark:border-amber-700/80 tabular-nums shadow-2xs">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* 3. Google Drive Sync Button */}
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className={`btn-signature-header px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 text-xs font-bold cursor-pointer relative ${
                accessToken
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/50 shadow-blue-500/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={accessToken ? `Connected as ${user?.displayName || user?.email}` : 'Connect Google Drive Cloud Sync'}
            >
              <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden sm:inline">Drive Sync</span>
              {accessToken && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
            </button>

            {/* 4. Report Bug Button (AdSense Safe Header Placement) */}
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="btn-signature-header px-2 sm:px-2.5 gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 cursor-pointer"
              title="Report a Bug or Send Feedback"
            >
              <Bug className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="hidden lg:inline">Report Bug</span>
            </button>

            {/* 5. 3D Theme Toggle Button & Wave Animation */}
            <ThemeToggle3D theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Google Drive Modal (Lazy-loaded on demand) */}
      {isDriveModalOpen && (
        <React.Suspense fallback={null}>
          <GoogleDriveModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} />
        </React.Suspense>
      )}

      {/* Feedback & Bug Report Modal (Lazy-loaded on demand) */}
      {isFeedbackModalOpen && (
        <React.Suspense fallback={null}>
          <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
        </React.Suspense>
      )}

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-12 sm:pb-16 md:pb-20">
        <React.Suspense
          fallback={
            <div className="w-full py-8 space-y-5 animate-pulse">
              <div className="h-6 w-44 rounded-lg bg-muted" />
              <div className="h-10 w-72 rounded-xl bg-muted" />
              <div className="h-64 w-full rounded-3xl bg-card border border-border/60" />
            </div>
          }
        >
          <Outlet />
        </React.Suspense>
      </main>

      <footer className="border-t border-border bg-card/60 py-10 sm:py-14 mt-12 sm:mt-16 md:mt-20">
        {/* Inline Safe Header with Back to Top */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 mb-8 border-b border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-semibold text-foreground">Toolzaro Directory &amp; Navigation</span>
            <span>•</span>
            <span>All utilities run locally in your browser</span>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-signature-header px-4 py-2 text-xs font-bold gap-2 text-foreground hover:text-primary cursor-pointer transition-all self-stretch sm:self-auto justify-center"
            title="Safe Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
            <span>Scroll to Top</span>
          </button>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3 group" aria-label="Toolzaro Home">
              <div className="logo-3d w-8 h-8 flex items-center justify-center text-white shrink-0">
                <Wrench className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
              </div>
              <span className="text-brand-gradient font-display font-black text-xl tracking-tight">Toolzaro</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Browser-based utilities for developers, designers, and creators. Secure client-side processing with zero server uploads.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              <span>{liveCount} Live Utilities Available</span>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Tool Categories</h2>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {categories.slice(0, 5).map((cat) => {
                const slug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                return (
                  <li key={cat}>
                    <Link to={getCategoryUrl(slug)} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" /> {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">More Categories</h2>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {categories.slice(5).map((cat) => {
                const slug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                return (
                  <li key={cat}>
                    <Link to={getCategoryUrl(slug)} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" /> {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Resources & Guides</h2>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li><Link to={getToolsHubUrl()} className="hover:text-primary transition-colors flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-primary" /> All Tools Directory</Link></li>
              <li><Link to={getBlogUrl()} className="hover:text-primary transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> Blog & Insights</Link></li>
              <li><Link to={getStaticPageUrl('about')} className="hover:text-primary transition-colors">About Toolzaro</Link></li>
              <li><Link to={getStaticPageUrl('contact')} className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to={getStaticPageUrl('privacy-policy')} className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to={getStaticPageUrl('terms')} className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to={getStaticPageUrl('disclaimer')} className="hover:text-primary transition-colors">Disclaimer</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer text-left font-semibold text-rose-700 dark:text-rose-300"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300 shrink-0" />
                  <span>Report Bug / Feedback</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Toolzaro. All processing happens client-side in your browser.</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-muted-foreground">Fast • Private • Accessible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

