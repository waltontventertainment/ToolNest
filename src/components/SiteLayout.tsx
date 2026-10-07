import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Wrench, Star, ArrowRight, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../lib/toolkit';
import { categories, tools } from '../lib/registry';
import { HeaderSearch } from './HeaderSearch';
import { ThemeToggle3D } from './ThemeToggle3D';
import { useFavorites } from '../context/FavoritesContext';

export const SiteLayout: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('toolnest-theme', 'light');
  const { favorites } = useFavorites();
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border/80 shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 max-w-7xl">
          {/* 3D Extruded Logo on the left */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0" aria-label="ToolNest Home">
            <div className="logo-3d w-10 h-10 flex items-center justify-center text-white shrink-0">
              {/* Inner ambient light specular shine */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/35 pointer-events-none" />
              <Wrench className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-115 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-brand-gradient font-display font-black text-2xl tracking-[-0.035em] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                ToolNest
              </span>
              <span className="text-kicker text-[9px] text-muted-foreground/80 tracking-widest mt-0.5 font-bold">
                Online Utility Suite
              </span>
            </div>
          </Link>

          {/* Right-side toolbar: Blog, Search, Saved, Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Blog Hub Link */}
            <Link
              to="/blog"
              className={`btn-signature-header px-3 sm:px-3.5 gap-1.5 text-xs font-bold ${
                pathname.startsWith('/blog')
                  ? 'bg-primary/15 text-primary border-primary/40 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="ToolNest Pulse & Insights"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Blog</span>
            </Link>

            {/* 1. Search Trigger Button */}
            <HeaderSearch />

            {/* 2. Favorites / Saved Button */}
            <Link
              to={pathname === '/' && location.search.includes('favorites=true') ? '/' : '/?favorites=true'}
              className={`btn-signature-header px-3 sm:px-3.5 gap-2 text-xs font-bold ${
                location.search.includes('favorites=true')
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400 dark:border-amber-600 shadow-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="View Bookmarked Tools"
            >
              <Star 
                className={`w-4 h-4 transition-transform group-hover:scale-115 ${
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

            {/* 3. 3D Theme Toggle Button & Wave Animation */}
            <ThemeToggle3D theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-2 sm:pt-4 pb-10 md:pb-16">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/60 backdrop-blur-xs py-12 mt-16">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3 group" aria-label="ToolNest Home">
              <div className="logo-3d w-8 h-8 flex items-center justify-center text-white shrink-0">
                <Wrench className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
              </div>
              <span className="text-brand-gradient font-display font-black text-xl tracking-tight">ToolNest</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              100% free, browser-based utilities for developers, designers, and creators. Secure client-side processing with zero server uploads.
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
              <li><Link to="/about" className="hover:text-primary transition-colors">About ToolNest</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} ToolNest. All processing happens client-side in your browser.</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-muted-foreground">Fast • Private • Accessible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

