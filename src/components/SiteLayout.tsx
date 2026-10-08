import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Wrench, Star, ArrowRight, BookOpen, Cloud, Bug, MessageSquarePlus, Sparkles, X, ArrowUp } from 'lucide-react';
import { useLocalStorage } from '../lib/toolkit';
import { categories, tools } from '../lib/registry';
import { HeaderSearch } from './HeaderSearch';
import { ThemeToggle3D } from './ThemeToggle3D';
import { useFavorites } from '../context/FavoritesContext';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { GoogleDriveModal } from './GoogleDriveModal';
import { FeedbackModal } from './FeedbackModal';
import { getBloggerAnnouncement } from '../lib/bloggerLayoutAdmin';

export const SiteLayout: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('toolnest-theme', 'light');
  const { favorites } = useFavorites();
  const { user, accessToken } = useGoogleDrive();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<boolean>('toolnest_top_banner_dismissed', false);
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const bloggerAnnouncement = React.useMemo(() => getBloggerAnnouncement(), []);
  const bannerBadge = bloggerAnnouncement?.badge || 'Toolzaro 2.0';
  const bannerText = bloggerAnnouncement?.text || '161+ Professional Browser Utilities • 100% Client-Side Privacy • Live Tech Digest & Drive Sync';
  const bannerLinkText = bloggerAnnouncement?.linkText || 'Explore All Tools';
  const bannerLinkUrl = bloggerAnnouncement?.linkUrl || '/';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Premium Top Announcement Banner for Desktop / PC View */}
      {!isBannerDismissed && (
        <div className="hidden md:block w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-primary/30 text-white text-xs relative overflow-hidden transition-all duration-300 shadow-sm">
          {/* Ambient Specular Glass Reflection Shimmer */}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%)] bg-[length:250%_100%] animate-[shimmer_8s_infinite] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/30 border border-primary/40 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
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

      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border/80 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 3D Extruded Logo on the left */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0" aria-label="Toolzaro Home">
            <div className="logo-3d w-10 h-10 flex items-center justify-center text-white shrink-0">
              {/* Inner ambient light specular shine */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/35 pointer-events-none" />
              <Wrench className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-115 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-brand-gradient font-display font-black text-xl sm:text-2xl tracking-[-0.035em] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                Toolzaro
              </span>
              <span className="text-kicker text-[9px] text-muted-foreground/80 tracking-widest mt-0.5 font-bold hidden sm:block">
                Online Utility Suite
              </span>
            </div>
          </Link>

          {/* Right-side toolbar: Blog, Search, Saved, Dark Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Blog Hub Link */}
            <Link
              to="/blog"
              className={`btn-signature-header px-2.5 sm:px-3.5 gap-1.5 text-xs font-bold ${
                pathname.startsWith('/blog')
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

            {/* 2. Favorites / Saved Button */}
            <Link
              to={pathname === '/' && location.search.includes('favorites=true') ? '/' : '/?favorites=true'}
              className={`btn-signature-header px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 text-xs font-bold ${
                location.search.includes('favorites=true')
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400 dark:border-amber-600 shadow-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="View Bookmarked Tools"
            >
              <Star 
                className={`w-4 h-4 transition-transform group-hover:scale-115 shrink-0 ${
                  favorites.length > 0 ? 'text-amber-500 fill-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-amber-500/80'
                }`} 
              />
              <span className="hidden sm:inline">Saved</span>
              {favorites.length > 0 && (
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/90 dark:bg-amber-950/90 px-1.5 py-0.2 rounded-md border border-amber-300/80 dark:border-amber-700/80 tabular-nums shadow-2xs">
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
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/50 shadow-blue-500/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={accessToken ? `Connected as ${user?.displayName || user?.email}` : 'Connect Google Drive Cloud Sync'}
            >
              <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="hidden sm:inline">Drive Sync</span>
              {accessToken && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
            </button>

            {/* 4. Report Bug Button (AdSense Safe Header Placement) */}
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="btn-signature-header px-2 sm:px-2.5 gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 cursor-pointer"
              title="Report a Bug or Send Feedback"
            >
              <Bug className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="hidden lg:inline">Report Bug</span>
            </button>

            {/* 5. 3D Theme Toggle Button & Wave Animation */}
            <ThemeToggle3D theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Google Drive Modal */}
      <GoogleDriveModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} />

      {/* Feedback & Bug Report Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-12 sm:pb-16 md:pb-20">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/60 backdrop-blur-xs py-10 sm:py-14 mt-12 sm:mt-16 md:mt-20">
        {/* Inline Safe Header with Back to Top */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 mb-8 border-b border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
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

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
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
              <span>{tools.length} Live Utilities Available</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Tool Categories</h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {categories.slice(0, 5).map((cat) => {
                const slug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                return (
                  <li key={cat}>
                    <Link to={`/category/${slug}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" /> {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">More Categories</h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {categories.slice(5).map((cat) => {
                const slug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                return (
                  <li key={cat}>
                    <Link to={`/category/${slug}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" /> {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Resources & Guides</h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li><Link to="/blog" className="hover:text-primary transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> Blog & Insights</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Toolzaro</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer text-left font-semibold text-rose-500"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Report Bug / Feedback</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Toolzaro. All processing happens client-side in your browser.</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-muted-foreground">Fast • Private • Accessible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

