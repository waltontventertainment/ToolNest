import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
  Layers,
  X,
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  Trash2,
  LayoutGrid,
  List,
  ArrowDownAZ,
  FolderOpen,
} from 'lucide-react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { tools, categories, getInterleavedTools } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { ToolCard } from '../components/ToolCard';
import { AppLauncherCard } from '../components/AppLauncherCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { useLocalStorage } from '../lib/toolkit';
import { useFavorites } from '../context/FavoritesContext';
import { FirestoreBlog, getPublishedBlogs, getInstantPublishedBlogs, isSameBlogPost } from '../lib/firestoreBlogService';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { DailyTechDigest } from '../components/DailyTechDigest';
import { TypewriterHeading } from '../components/TypewriterHeading';
import { HeroShowcase } from '../components/HeroShowcase';
import { BlogAuthorBadge } from '../components/BlogAuthorBadge';
import { getBlogUrl, getBlogPostUrl, getBookmarksUrl, getToolsHubUrl } from '../lib/appUrls';
import { getHomeSeoData } from '../lib/seoHelper';
import { getResponsiveCardImage } from '../lib/imageUtils';

const POPULAR_SEARCH_TAGS = ['PDF', 'Image', 'JSON', 'QR Code', 'Password', 'Base64', 'Weather'];

export const Index: React.FC<{ forcedBookmarks?: boolean }> = ({ forcedBookmarks = false }) => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'az'>('featured');
  const [pcViewMode, setPcViewMode] = useLocalStorage<'grid' | 'compact'>('toolzaro_pc_view_mode', 'grid');

  const isBookmarksRoute =
    forcedBookmarks ||
    location.pathname === '/bookmarks' ||
    location.pathname === '/saved' ||
    location.pathname === '/favorites' ||
    searchParams.get('favorites') === 'true';
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(isBookmarksRoute);
  const { favorites, clearFavorites } = useFavorites();

  // Show 12 curated tools initially on the homepage grid (optimizes initial DOM element count for 100/100 Lighthouse)
  const [displayCount, setDisplayCount] = useState(12);
  const [incrementCount, setIncrementCount] = useState(24);
  
  // Blog state initialized synchronously with instant cache + built-in posts (0ms render, zero Firestore loading flash)
  const [allBlogPosts, setAllBlogPosts] = useState<FirestoreBlog[]>(() => getInstantPublishedBlogs());
  const [visibleBlogCount, setVisibleBlogCount] = useState(3);

  useEffect(() => {
    let isMounted = true;
    let triggered = false;

    const triggerBlogSync = () => {
      if (triggered || !isMounted) return;
      triggered = true;
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerBlogSync)
      );
      getPublishedBlogs()
        .then(posts => {
          if (isMounted && posts.length > 0) {
            setAllBlogPosts(prev => {
              if (
                prev.length === posts.length &&
                prev.every((item, idx) => isSameBlogPost(item, posts[idx]))
              ) {
                return prev;
              }
              return posts;
            });
          }
        })
        .catch(() => {});
    };

    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
      window.addEventListener(evt, triggerBlogSync, { once: true, passive: true })
    );

    return () => {
      isMounted = false;
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerBlogSync)
      );
    };
  }, []);

  useEffect(() => {
    const isFav =
      forcedBookmarks ||
      location.pathname === '/bookmarks' ||
      location.pathname === '/saved' ||
      location.pathname === '/favorites' ||
      searchParams.get('favorites') === 'true';
    setShowFavoritesOnly(isFav);
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
    }
    if (isFav) {
      setActiveCategory('All');
    }
  }, [forcedBookmarks, location.pathname, searchParams]);

  useEffect(() => {
    const count = 12;
    setDisplayCount(count);
    setIncrementCount(24);
  }, []);

  const handleExitFavorites = () => {
    setActiveCategory('All');
    setSearch('');
    setShowFavoritesOnly(false);
    navigate('/');
  };

  const handleEnterFavorites = () => {
    setActiveCategory('All');
    setSearch('');
    setShowFavoritesOnly(true);
    navigate(getBookmarksUrl());
  };

  // Only categories represented in user's saved bookmarks
  const bookmarkedCategories = useMemo(() => {
    const userBookmarked = tools.filter(t => favorites.includes(t.slug));
    const set = new Set<string>();
    userBookmarked.forEach(t => set.add(t.category));
    return Array.from(set);
  }, [favorites]);

  // Curated category order for intuitive exploration
  const orderedCategories = useMemo(() => {
    const desiredOrder = [
      'App',
      'Games',
      'PDF', 'Text',
      'Developer', 'Converters', 'Generators',
      'Calculators', 'Color & Image', 'QR & Barcode',
      'SEO', 'Utility', 'Fun & Viral', 'Wikipedia', 'Universal Data Suite'
    ];
    const present = desiredOrder.filter(cat => categories.includes(cat as any));
    const remainder = categories.filter(cat => !desiredOrder.includes(cat));
    return [...present, ...remainder];
  }, []);

  const activeToolsList = useMemo(() => {
    return getEffectiveTools(tools, settings.toolOverrides, false);
  }, [settings.toolOverrides]);

  // Interleaved multi-category mix for 'All' view so tools of the same category are never bunched together
  const mixedAllToolsList = useMemo(() => {
    return getInterleavedTools(activeToolsList);
  }, [activeToolsList]);

  // Precomputed category counts & sample icons for 0ms sidebar rendering
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const icons: Record<string, any> = {};
    for (const cat of orderedCategories) {
      counts[cat] = 0;
    }
    for (const t of activeToolsList) {
      counts[t.category] = (counts[t.category] || 0) + 1;
      if (!icons[t.category]) {
        icons[t.category] = t.icon;
      }
    }
    return { counts, icons };
  }, [activeToolsList, orderedCategories]);

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Use the balanced multi-category mix when viewing 'All' tools; otherwise use the category's list
    const sourceList = activeCategory === 'All' && !showFavoritesOnly ? mixedAllToolsList : activeToolsList;

    const list = sourceList.filter(tool => {
      if (showFavoritesOnly && !favorites.includes(tool.slug)) {
        return false;
      }
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.metaDescription.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.toLowerCase().includes(q));

      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'az') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [activeToolsList, mixedAllToolsList, search, activeCategory, showFavoritesOnly, favorites, sortBy]);

  useEffect(() => {
    setDisplayCount(incrementCount);
  }, [search, activeCategory, showFavoritesOnly, incrementCount]);

  const displayedTools = filteredTools.slice(0, displayCount);
  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const homeSeo = useMemo(() => getHomeSeoData(baseUrl, activeToolsList.length), [baseUrl, activeToolsList.length]);

  const clearSearchQuery = () => {
    setSearch('');
    if (searchParams.has('q')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams);
    }
  };

  return (
    <>
      <Seo 
        title={showFavoritesOnly ? `Saved Bookmarked Tools (${favorites.length}) – Personal Workspace | Toolzaro` : homeSeo.title} 
        description={showFavoritesOnly ? "Access your personal collection of bookmarked developer, PDF, image, and utility tools on Toolzaro — stored 100% privately in your browser." : homeSeo.description}
        keywords={homeSeo.keywords}
        url={showFavoritesOnly ? `${baseUrl}/bookmarks` : `${baseUrl}/`}
        jsonLd={homeSeo.jsonLd}
      />
      
      {showFavoritesOnly ? (
        /* ============================================================ */
        /* DEDICATED PREMIUM SAVED BOOKMARKS WORKSPACE                  */
        /* ============================================================ */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
            <BreadcrumbNavigation
              items={[{ label: 'Saved Bookmarks' }]}
              onHomeClick={handleExitFavorites}
            />

            <button
              type="button"
              onClick={handleExitFavorites}
              className="btn-signature-header h-9 px-3.5 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center cursor-pointer self-start sm:self-auto"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180 text-primary" />
              <span>Back to All Tools</span>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 dark:border-amber-500/20 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0 ring-4 ring-amber-500/10">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-display">
                      Saved Bookmarked Tools
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      {favorites.length} {favorites.length === 1 ? 'Tool' : 'Tools'} Saved
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                    Instant one-click access to your favorite developer &amp; utility tools. Stored securely and privately in your browser.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                {favorites.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all your saved bookmarks?')) {
                        clearFavorites();
                      }
                    }}
                    className="btn-signature-header px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border-red-500/25 hover:border-red-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Clear all saved bookmarks"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500/80" />
                    <span>Clear All</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExitFavorites}
                  className="btn-signature-primary px-4 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 rounded-[0.875rem]"
                >
                  <span>Explore All {activeToolsList.length} Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-card/90 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors placeholder:text-muted-foreground/75"
                    placeholder="Search in your saved tools..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute inset-y-0 right-1 my-auto w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <span className="w-6 h-6 rounded-md bg-muted/80 hover:bg-muted flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  )}
                </div>

                {bookmarkedCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('All')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer shrink-0 ${
                        activeCategory === 'All'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-card text-muted-foreground border-border hover:border-amber-400 hover:text-foreground'
                      }`}
                    >
                      All Saved ({favorites.length})
                    </button>
                    {bookmarkedCategories.map(cat => {
                      const count = tools.filter(t => favorites.includes(t.slug) && t.category === cat).length;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                              : 'bg-card text-muted-foreground border-border hover:border-amber-400 hover:text-foreground'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
              {filteredTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-card/50 rounded-3xl border-2 border-dashed border-border/80 flex flex-col items-center p-6 sm:p-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground">
                {search ? 'No matching bookmarked tools' : 'No bookmarked tools yet'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
                {search
                  ? `No saved tools match "${search}". Try clearing your search.`
                  : "You haven't added any tools to your bookmarks yet. Click the star icon on any tool card to save it for quick access."}
              </p>
              <div className="flex items-center gap-3">
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="btn-signature-primary px-5 py-2 text-xs font-bold cursor-pointer rounded-[0.875rem]"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExitFavorites}
                    className="btn-signature-primary px-5 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 rounded-[0.875rem]"
                  >
                    <span>Explore All {activeToolsList.length} Tools</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* STANDARD HOMEPAGE VIEW (Desktop Workstation + Mobile View)   */
        /* ============================================================ */
        <>
          {/* Hero Section: Balanced 12-Column Desktop Split */}
          <section className="pt-1 sm:pt-2 lg:pt-4 pb-5 sm:pb-6 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">
            <div className="lg:col-span-7 w-full flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2.5 tracking-tight">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{activeToolsList.length} Browser Utilities</span>
                <span aria-hidden="true" className="text-muted-foreground">·</span>
                <span className="text-muted-foreground font-semibold">Client-Side Privacy</span>
              </div>
              
              {/* Locked Single-Line Keyboard Typewriter Heading (Zero 2-Line Wrap or Vertical Jump) */}
              <div className="w-full min-w-0">
                <TypewriterHeading toolCount={activeToolsList.length} />
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 leading-relaxed max-w-xl font-normal text-center lg:text-left">
                Browser-native processing. Merge PDFs, resize images, format JSON, generate QR codes, and convert files safely without cloud uploads.
              </p>

              {/* Integrated Desktop Hero Search Bar (Visible on PC lg+ for immediate command access) */}
              <div className="hidden lg:block w-full max-w-2xl mb-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </div>
                  </div>
                  <input
                    type="text"
                    className="w-full h-12 pl-13 pr-24 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 shadow-xs transition-colors placeholder:text-muted-foreground/75"
                    placeholder={`Search ${activeToolsList.length} utilities (e.g., PDF merger, image resizer, JSON, QR)...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
                    {search ? (
                      <button
                        type="button"
                        onClick={clearSearchQuery}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Clear search query"
                        title="Clear search"
                      >
                        <span className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border">
                        ⌘K
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Filter Tags on PC */}
                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground flex-wrap">
                  <span className="font-semibold text-[11px] text-muted-foreground/80 mr-1">Popular:</span>
                  {POPULAR_SEARCH_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearch(tag);
                        document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        search.toLowerCase() === tag.toLowerCase()
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card/80 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Clean Unboxed Trust Metrics */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs font-bold text-foreground/90">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Instant Execution</span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Private Sandbox</span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{activeToolsList.length} Free Utilities</span>
                </span>
              </div>
            </div>

            {/* Right Column on PC: Interactive Quick-Launch Console */}
            <div className="lg:col-span-5 w-full hidden lg:flex justify-end">
              <HeroShowcase />
            </div>
          </section>

          {/* Daily Tech Digest & Mobile Search Bar */}
          <section className="w-full mb-6 sm:mb-8 space-y-3">
            <div className="w-full">
              <DailyTechDigest />
            </div>

            {/* Mobile & Tablet Search Input (Hidden on lg+ since PC has Hero + Workspace Toolbar search) */}
            <div className="w-full relative group lg:hidden">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <input
                type="text"
                className="w-full h-13 pl-14 pr-12 rounded-2xl border-2 border-border/80 bg-card text-sm font-medium focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 shadow-xs transition-colors placeholder:text-muted-foreground/75"
                placeholder={`Search across ${activeToolsList.length} utilities (e.g., PDF, image, JSON, QR)...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearchQuery}
                  className="absolute inset-y-0 right-1.5 my-auto w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search query"
                  title="Clear search"
                >
                  <span className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </span>
                </button>
              )}
            </div>
          </section>

          {/* Mobile & Tablet Horizontal Category Filter (< 1024px) */}
          <section className="lg:hidden mb-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explore Categories</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer select-none ${
                  activeCategory === 'All'
                    ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                    : 'bg-card text-foreground border-border hover:border-primary/40'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'All' ? 'text-white' : 'text-primary'}`} />
                <span>All Tools</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeCategory === 'All' ? 'bg-blue-950/60 text-white' : 'bg-muted text-foreground'
                }`}>
                  {activeToolsList.length}
                </span>
              </button>

              {orderedCategories.map((cat) => {
                const count = categoryStats.counts[cat] || 0;
                const isActive = activeCategory === cat;
                const SampleIcon = categoryStats.icons[cat] || Layers;
                
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer select-none ${
                      isActive
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-card text-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    <SampleIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-blue-950/60 text-white' : 'bg-muted text-foreground'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ============================================================ */}
          {/* TRUE DESKTOP 2-PANE WORKSPACE LAYOUT (Sidebar + Main Grid)   */}
          {/* ============================================================ */}
          <section id="tools-grid" className="lg:flex lg:items-start lg:gap-7">
            {/* Left Sticky Category Sidebar (Visible on Desktop lg+) */}
            <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-20 space-y-3">
              <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-xs">
                <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                    {orderedCategories.length} Suites
                  </span>
                </div>

                <div className="space-y-1">
                  {/* All Tools Item */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory('All')}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                      activeCategory === 'All' && !showFavoritesOnly
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-foreground hover:bg-secondary/70'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Layers className={`w-4 h-4 shrink-0 ${activeCategory === 'All' ? 'text-white' : 'text-primary'}`} />
                      <span className="truncate">All Tools</span>
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                        activeCategory === 'All'
                          ? 'bg-blue-950/60 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {activeToolsList.length}
                    </span>
                  </button>

                  {/* Saved Bookmarks Shortcut */}
                  <button
                    type="button"
                    onClick={handleEnterFavorites}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Star className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 fill-amber-500/30" />
                      <span className="truncate">Saved Bookmarks</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shrink-0">
                      {favorites.length}
                    </span>
                  </button>

                  <div className="my-1.5 border-t border-border/60" />

                  {/* Category List */}
                  {orderedCategories.map((cat) => {
                    const count = categoryStats.counts[cat] || 0;
                    const isActive = activeCategory === cat;
                    const SampleIcon = categoryStats.icons[cat] || Layers;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-blue-700 text-white font-bold shadow-xs'
                            : 'text-foreground hover:bg-secondary/70'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <SampleIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                          <span className="truncate">{cat}</span>
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                            isActive
                              ? 'bg-blue-950/60 text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <Link
                    to={getToolsHubUrl()}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Full A–Z Directory</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Main Tools Workspace */}
            <div className="flex-1 min-w-0">
              {/* Desktop Workspace Control Bar */}
              <div className="bg-card border border-border/80 rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-sm sm:text-base font-display font-extrabold text-foreground tracking-tight">
                    {activeCategory === 'All' ? 'All Browser Utilities' : `${activeCategory} Tools`}
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground">
                    · {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
                  </span>

                  {(activeCategory !== 'All' || search.trim() !== '') && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('All');
                        clearSearchQuery();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                      <span>Reset Filter</span>
                    </button>
                  )}
                </div>

                {/* Right Controls: Inline Filter, Sort A-Z, and PC Grid/Compact View Switcher */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Inline quick filter on PC */}
                  <div className="hidden xl:flex relative items-center">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Filter list..."
                      className="h-8 w-44 pl-8 pr-7 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:border-primary"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={clearSearchQuery}
                        className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Sort Toggle */}
                  <button
                    type="button"
                    onClick={() => setSortBy(prev => (prev === 'featured' ? 'az' : 'featured'))}
                    className={`h-8 px-2.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      sortBy === 'az'
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    }`}
                    title="Toggle Alphabetical A-Z Sort"
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                    <span>{sortBy === 'az' ? 'Sorted A–Z' : 'Featured'}</span>
                  </button>

                  {/* PC View Density Switcher (Grid vs Compact) */}
                  <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-muted border border-border/80">
                    <button
                      type="button"
                      onClick={() => setPcViewMode('grid')}
                      className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        pcViewMode === 'grid'
                          ? 'bg-card text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Standard Card Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPcViewMode('compact')}
                      className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        pcViewMode === 'compact'
                          ? 'bg-card text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="High-Density Compact PC View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Compact</span>
                    </button>
                  </div>
                </div>
              </div>

              {filteredTools.length > 0 ? (
                <div className="flex flex-col items-center w-full">
                  {activeCategory === 'App' || activeCategory === 'Games' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">
                      {displayedTools.map(tool => (
                        <AppLauncherCard key={tool.slug} tool={tool} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={
                        pcViewMode === 'compact'
                          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full'
                          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full'
                      }
                    >
                      {displayedTools.map(tool => (
                        <ToolCard key={tool.slug} tool={tool} compact={pcViewMode === 'compact'} />
                      ))}
                    </div>
                  )}

                  {displayCount < filteredTools.length && (
                    <button 
                      type="button"
                      onClick={() => setDisplayCount(prev => prev + incrementCount)}
                      className="mt-8 sm:mt-10 px-8 py-3.5 rounded-2xl font-bold text-xs btn-signature-header hover:border-primary/50 text-foreground shadow-xs flex items-center gap-2 group cursor-pointer"
                    >
                      <span>Show More Tools ({filteredTools.length - displayCount} remaining)</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-primary" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 bg-card/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4 text-muted-foreground border border-border">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold mb-1">No matching tools found</h3>
                  <p className="text-xs text-muted-foreground mb-5 max-w-sm">
                    We couldn't find anything matching "{search}".
                  </p>
                  <button 
                    type="button"
                    onClick={() => { 
                      setSearch(''); 
                      setActiveCategory('All'); 
                      if (searchParams.has('q')) {
                        setSearchParams({});
                      }
                    }} 
                    className="btn-signature-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Ad slot after tools (self-collapses when not filled) */}
      <div className="my-8 sm:my-10 md:my-12">
        <AdSlot slot="home-after-tools" format="horizontal" />
      </div>

      {/* Featured Blog & Insights Section */}
      {allBlogPosts.length > 0 && !showFavoritesOnly && !search && (
        <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-border/60 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
                <span className="font-bold text-primary inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Toolzaro Pulse &amp; Insights</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Technical Architecture &amp; Guides</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display">
                Latest Guides &amp; Developer Dispatches
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Practical web utility architectures, client-side encryption guides, and SEO optimization dispatches.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <Link
                to={getBlogUrl()}
                className="btn-signature-primary px-4 py-2 text-xs font-bold gap-2 cursor-pointer"
              >
                <span>Explore All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {allBlogPosts.slice(0, visibleBlogCount).map((post) => (
              <Link
                key={post.id}
                to={getBlogPostUrl(post.slug)}
                aria-label={`Read article: ${post.title}`}
                className="group flex flex-col justify-between rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-[transform,border-color,box-shadow] duration-150 p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 cursor-pointer no-underline select-none"
              >
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl aspect-video relative bg-muted">
                    {(() => {
                      const imgAttrs = getResponsiveCardImage(post.coverImage);
                      return (
                        <img
                          src={imgAttrs.src}
                          srcSet={imgAttrs.srcSet}
                          sizes={imgAttrs.sizes}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          width={480}
                          height={270}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=75&fm=webp';
                          }}
                        />
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                  <BlogAuthorBadge author={post.author} size="sm" />
                  <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 border border-border/60 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Showing <strong className="text-foreground">{Math.min(visibleBlogCount, allBlogPosts.length)}</strong> of <strong className="text-foreground">{allBlogPosts.length}</strong> published guides &amp; articles.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
              {allBlogPosts.length > visibleBlogCount ? (
                <button
                  type="button"
                  onClick={() => setVisibleBlogCount(prev => Math.min(prev + 3, allBlogPosts.length))}
                  className="btn-signature-primary px-5 py-2 text-xs font-bold gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span>Load More Articles ({allBlogPosts.length - visibleBlogCount} left)</span>
                </button>
              ) : (
                <span className="text-xs font-medium text-muted-foreground py-1">
                  All articles displayed.
                </span>
              )}

              <Link
                to={getBlogUrl()}
                className="btn-signature-header px-4 py-2 text-xs font-bold gap-1.5 text-foreground cursor-pointer shrink-0"
              >
                <span>View Blog Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ad slot before platform features (self-collapsing) */}
      <div className="my-8 sm:my-10">
        <AdSlot slot="home-before-features" format="auto" />
      </div>
      
      {/* Platform Features Section */}
      <section className="mt-12 sm:mt-16 py-8 sm:py-12 border-t border-border/60">
        <h2 className="sr-only">Platform Security and Performance Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 text-center md:text-left">
          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">100% Private &amp; Local</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your files and input strings stay inside your browser memory. Nothing is ever saved or sent to external servers.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">Instant Execution</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by standard HTML5 Web APIs, Canvas, and WebAssembly for instantaneous execution without network lag.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">No Account Needed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use forever without annoying popups, signups, or paywalls. Simply open and complete your task.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
