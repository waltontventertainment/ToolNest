import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Moon,
  Sun,
  Wrench,
  Star,
  ArrowRight,
  BookOpen,
  Cloud,
  Bug,
  MessageSquarePlus,
  Sparkles,
  X,
  ArrowUp,
  ChevronDown,
  FileText,
  Code,
  Image as ImageIcon,
  Type,
  ArrowLeftRight,
  Calculator,
  QrCode,
  Search,
  Database,
  Sliders,
  Info,
  ShieldCheck,
  Scale,
  ShieldAlert,
  Mail,
  Layers,
  Menu,
} from 'lucide-react';
import { useLocalStorage } from '../lib/toolkit';
import { categories, tools } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { HeaderSearch } from './HeaderSearch';
import { ThemeToggle3D } from './ThemeToggle3D';
import { useFavorites } from '../context/FavoritesContext';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { getBlogUrl, getCategoryUrl, getStaticPageUrl, getToolsHubUrl, getBookmarksUrl } from '../lib/appUrls';
import { useSiteSettings } from '../context/SiteSettingsContext';

const HEADER_CATEGORIES = [
  { name: 'PDF Suite', categoryName: 'PDF', slug: 'pdf', icon: FileText },
  { name: 'Developer', categoryName: 'Developer', slug: 'developer', icon: Code },
  { name: 'Color & Image', categoryName: 'Color & Image', slug: 'color-image', icon: ImageIcon },
  { name: 'Text Utilities', categoryName: 'Text', slug: 'text', icon: Type },
  { name: 'Converters', categoryName: 'Converters', slug: 'converters', icon: ArrowLeftRight },
  { name: 'Generators', categoryName: 'Generators', slug: 'generators', icon: Sparkles },
  { name: 'Calculators', categoryName: 'Calculators', slug: 'calculators', icon: Calculator },
  { name: 'QR & Barcode', categoryName: 'QR & Barcode', slug: 'qr-barcode', icon: QrCode },
  { name: 'SEO Tools', categoryName: 'SEO', slug: 'seo', icon: Search },
  { name: 'Universal Data', categoryName: 'Universal Data Suite', slug: 'universal-data-suite', icon: Database },
  { name: 'Utility Suite', categoryName: 'Utility', slug: 'utility', icon: Sliders },
  { name: 'Wikipedia', categoryName: 'Wikipedia', slug: 'wikipedia', icon: BookOpen },
];

const HEADER_PAGES = [
  {
    name: 'About Us',
    path: '/about',
    icon: Info,
    desc: 'Mission, local architecture & privacy sandbox',
  },
  {
    name: 'Privacy Policy',
    path: '/privacy-policy',
    icon: ShieldCheck,
    desc: '100% Client-side sandbox & zero data logging',
  },
  {
    name: 'Terms of Service',
    path: '/terms',
    icon: Scale,
    desc: 'Free utilities licensing & acceptable use terms',
  },
  {
    name: 'Disclaimer',
    path: '/disclaimer',
    icon: ShieldAlert,
    desc: 'Local browser sandbox & security boundaries',
  },
  {
    name: 'Contact Us',
    path: '/contact',
    icon: Mail,
    desc: 'Feedback, bug reports & feature requests',
  },
];

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

  const [openDropdown, setOpenDropdown] = useState<'categories' | 'pages' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const categoriesDropdownRef = React.useRef<HTMLDivElement>(null);
  const pagesDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        openDropdown === 'categories' &&
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
      if (
        openDropdown === 'pages' &&
        pagesDropdownRef.current &&
        !pagesDropdownRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  // Close dropdown whenever route changes
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tools) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, []);

  const isHomeActive = pathname === '/' && !location.search.includes('favorites=true');
  const isDirectoryActive = pathname === '/tools' || pathname === '/all-tools' || pathname === '/directory';
  const isCategoriesActive = HEADER_CATEGORIES.some(cat => pathname === `/${cat.slug}`);
  const isPagesActive = HEADER_PAGES.some(p => pathname === p.path);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground max-w-full overflow-x-hidden">
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

      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/95 border-b border-border/80 shadow-2xs max-w-full overflow-x-clip">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* 3D Extruded Logo on the left */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" aria-label="Toolzaro Home">
            <div className="logo-3d w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/35 pointer-events-none" />
              <Wrench className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white" />
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

          {/* Desktop Center Navigation: Home | Directory | Categories ▾ | Company ▾ (Visible on all PC and tablet screens >= 768px) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs font-semibold text-muted-foreground" aria-label="Primary Desktop Navigation">
            {/* 1. Home */}
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap border flex items-center gap-1.5 cursor-pointer font-bold ${
                isHomeActive
                  ? 'text-primary bg-primary/10 border-primary/30 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-transparent'
              }`}
            >
              Home
            </Link>

            {/* 2. Directory */}
            <Link
              to={getToolsHubUrl()}
              className={`px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap border flex items-center gap-1.5 cursor-pointer font-bold ${
                isDirectoryActive
                  ? 'text-primary bg-primary/10 border-primary/30 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-transparent'
              }`}
            >
              Directory
            </Link>

            {/* 3. Categories ▾ Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => prev === 'categories' ? null : 'categories')}
                className={`px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap border flex items-center gap-1.5 cursor-pointer font-bold select-none ${
                  isCategoriesActive || openDropdown === 'categories'
                    ? 'text-primary bg-primary/10 border-primary/30 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-transparent'
                }`}
                aria-expanded={openDropdown === 'categories'}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'categories' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openDropdown === 'categories' && (
                <div className="absolute top-full left-0 mt-2 w-[430px] max-w-[92vw] p-3 rounded-2xl bg-card/98 backdrop-blur-xl border border-border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 mb-2 border-b border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tool Suites &amp; Categories
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {liveCount} Utilities
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {HEADER_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const count = categoryCounts[cat.categoryName] || 0;
                      const isCatActive = pathname === `/${cat.slug}`;
                      return (
                        <Link
                          key={cat.slug}
                          to={getCategoryUrl(cat.slug)}
                          onClick={() => setOpenDropdown(null)}
                          className={`p-2 rounded-xl flex items-center gap-2.5 transition-all duration-150 group border ${
                            isCatActive
                              ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                              : 'border-transparent hover:border-border hover:bg-secondary/70 text-foreground'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isCatActive
                              ? 'bg-primary text-white'
                              : 'bg-muted group-hover:bg-primary/15 text-muted-foreground group-hover:text-primary'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                              {cat.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {count} {count === 1 ? 'tool' : 'tools'}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between px-2">
                    <Link
                      to={getToolsHubUrl()}
                      onClick={() => setOpenDropdown(null)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Browse All {liveCount} Tools Directory</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Company ▾ Dropdown (About Us, Privacy Policy, Terms, Disclaimer, Contact) */}
            <div className="relative" ref={pagesDropdownRef}>
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => prev === 'pages' ? null : 'pages')}
                className={`px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap border flex items-center gap-1.5 cursor-pointer font-bold select-none ${
                  isPagesActive || openDropdown === 'pages'
                    ? 'text-primary bg-primary/10 border-primary/30 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-transparent'
                }`}
                aria-expanded={openDropdown === 'pages'}
                aria-haspopup="true"
              >
                <span>Company</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'pages' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openDropdown === 'pages' && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 p-2.5 rounded-2xl bg-card/98 backdrop-blur-xl border border-border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 mb-2 border-b border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Company &amp; Legal
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Information
                    </span>
                  </div>

                  <div className="space-y-1">
                    {HEADER_PAGES.map(item => {
                      const Icon = item.icon;
                      const isPageActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenDropdown(null)}
                          className={`p-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group border ${
                            isPageActive
                              ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                              : 'border-transparent hover:border-border hover:bg-secondary/70 text-foreground'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isPageActive
                              ? 'bg-primary text-white'
                              : 'bg-muted group-hover:bg-primary/15 text-muted-foreground group-hover:text-primary'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold group-hover:text-primary transition-colors">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        setIsFeedbackModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 text-foreground cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 transition-colors">
                        <Bug className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          Report Bug &amp; Feedback
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Direct engineering help &amp; suggestions
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right-side toolbar: Blog, Search, Saved, Drive Sync, Report Bug, Theme & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Blog Hub Button (Tactile 3D Keycap style - Desktop only, on mobile it's in the mobile menu) */}
            <div className="hidden md:flex">
              <Link
                to={getBlogUrl()}
                className={`btn-signature-header px-2.5 sm:px-3 gap-1.5 text-xs font-bold ${
                  pathname.startsWith('/blog') || (typeof window !== 'undefined' && window.location.search.includes('page=blog'))
                    ? 'bg-primary/15 text-primary border-primary/40 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Toolzaro Pulse & Tech Insights"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Blog</span>
              </Link>
            </div>

            {/* 1. Search Trigger Button (Always visible on mobile & desktop) */}
            <HeaderSearch />

            {/* 2. Favorites / Saved Button -> /bookmarks (Desktop only, on mobile it's in the mobile menu) */}
            <div className="hidden md:flex">
              <Link
                to={pathname === '/bookmarks' || pathname === '/saved' || pathname === '/favorites' ? '/' : getBookmarksUrl()}
                className={`btn-signature-header px-2 sm:px-3 gap-1.5 text-xs font-bold ${
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
            </div>

            {/* 3. Google Drive Sync Button (Desktop only, on mobile it's in the mobile menu) */}
            <div className="hidden md:flex">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(true)}
                className={`btn-signature-header px-2 sm:px-2.5 gap-1.5 text-xs font-bold cursor-pointer relative ${
                  accessToken
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/50 shadow-blue-500/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={accessToken ? `Connected as ${user?.displayName || user?.email}` : 'Connect Google Drive Cloud Sync'}
              >
                <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="hidden lg:inline">Drive</span>
                {accessToken && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
              </button>
            </div>

            {/* 4. Report Bug Button (Desktop XL only) */}
            <div className="hidden xl:flex">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="btn-signature-header px-2 sm:px-2.5 gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 cursor-pointer"
                title="Report a Bug or Send Feedback"
              >
                <Bug className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Report Bug</span>
              </button>
            </div>

            {/* 5. 3D Theme Toggle Button & Wave Animation (Always visible on mobile & desktop) */}
            <ThemeToggle3D theme={theme} setTheme={setTheme} />

            {/* 6. Mobile Menu Hamburger Toggle (Visible ONLY on md:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden btn-signature-header w-10 h-10 p-0 flex items-center justify-center text-foreground cursor-pointer shrink-0"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              title="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Menu (Rendered on md:hidden) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 bg-background/98 backdrop-blur-xl px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  isHomeActive
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-card border-border/70 text-foreground hover:bg-secondary'
                }`}
              >
                <Wrench className="w-4 h-4 text-primary" />
                <span>Home</span>
              </Link>

              <Link
                to={getToolsHubUrl()}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  isDirectoryActive
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-card border-border/70 text-foreground hover:bg-secondary'
                }`}
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>All Directory</span>
              </Link>

              <Link
                to={getBlogUrl()}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  pathname.startsWith('/blog')
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-card border-border/70 text-foreground hover:bg-secondary'
                }`}
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Blog Articles</span>
              </Link>

              <Link
                to={getBookmarksUrl()}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  pathname === '/bookmarks'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                    : 'bg-card border-border/70 text-foreground hover:bg-secondary'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Saved ({favorites.length})</span>
              </Link>
            </div>

            {/* Categories in Mobile Drawer */}
            <div>
              <div className="px-1 py-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Tool Suites &amp; Categories</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {liveCount} Tools
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {HEADER_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const count = categoryCounts[cat.categoryName] || 0;
                  const isCatActive = pathname === `/${cat.slug}`;
                  return (
                    <Link
                      key={cat.slug}
                      to={getCategoryUrl(cat.slug)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 rounded-xl flex items-center gap-2 text-xs transition-colors border ${
                        isCatActive
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                          : 'bg-card/70 border-border/60 hover:bg-secondary text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Company & Legal in Mobile Drawer */}
            <div>
              <div className="px-1 py-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Company &amp; Legal</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {HEADER_PAGES.map(item => {
                  const Icon = item.icon;
                  const isPageActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 rounded-xl flex items-center gap-2 text-xs transition-colors border ${
                        isPageActive
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                          : 'bg-card/70 border-border/60 hover:bg-secondary text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Buttons in Mobile Drawer */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDriveModalOpen(true);
                }}
                className="btn-signature-header flex-1 py-2 text-xs font-bold justify-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>Drive Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsFeedbackModalOpen(true);
                }}
                className="btn-signature-header flex-1 py-2 text-xs font-bold justify-center gap-2 text-rose-500 cursor-pointer"
              >
                <Bug className="w-4 h-4 text-rose-500" />
                <span>Report Bug</span>
              </button>
            </div>
          </div>
        )}
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

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-12 sm:pb-16 md:pb-20 overflow-x-clip">
        <React.Suspense fallback={null}>
          <Outlet />
        </React.Suspense>
      </main>

      <footer className="border-t border-border bg-card/60 py-10 sm:py-14 mt-12 sm:mt-16 md:mt-20 max-w-full overflow-x-hidden">
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

