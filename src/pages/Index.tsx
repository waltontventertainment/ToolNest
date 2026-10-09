import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Star, ShieldCheck, Zap, Layers, X, ArrowRight, BookOpen, Clock, Calendar, Home, ChevronRight, Trash2 } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { tools, categories } from '../lib/registry';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { useLocalStorage } from '../lib/toolkit';
import { useFavorites } from '../context/FavoritesContext';
import { BlogPost, BUILTIN_BLOG_POSTS, getMergedBlogPosts } from '../lib/blogData';
import { DailyTechDigest } from '../components/DailyTechDigest';
import { TypewriterHeading } from '../components/TypewriterHeading';
import { HeroShowcase } from '../components/HeroShowcase';
import { getBlogUrl, getBlogPostUrl } from '../lib/appUrls';

import heroImg from '../assets/images/hero_visual_premium_1791369917245.jpg';
import emptyImg from '../assets/images/empty_state_1785690459297.jpg';

export const Index: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('favorites') === 'true');
  const { favorites, clearFavorites } = useFavorites();

  // Show 24 tools initially on the homepage grid (22-25 range requested)
  const [displayCount, setDisplayCount] = useState(24);
  const [incrementCount, setIncrementCount] = useState(24);
  
  // Blog state with automatic Blogger synchronization
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>(BUILTIN_BLOG_POSTS);
  const [visibleBlogCount, setVisibleBlogCount] = useState(3);
  const [hasBloggerPosts, setHasBloggerPosts] = useState(false);

  useEffect(() => {
    getMergedBlogPosts().then(posts => {
      setAllBlogPosts(posts);
      setHasBloggerPosts(posts.some(p => p.source === 'blogger'));
    });
  }, []);

  useEffect(() => {
    const isFav = searchParams.get('favorites') === 'true';
    setShowFavoritesOnly(isFav);
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
    }
    if (isFav) {
      setActiveCategory('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const getCounts = () => {
      if (window.innerWidth >= 1280) return 24;
      if (window.innerWidth >= 1024) return 24;
      if (window.innerWidth >= 640) return 24;
      return 24;
    };
    const count = getCounts();
    setDisplayCount(count);
    setIncrementCount(count);
  }, []);

  const handleExitFavorites = () => {
    setActiveCategory('All');
    setSearch('');
    setShowFavoritesOnly(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('favorites');
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
  };

  const handleEnterFavorites = () => {
    setActiveCategory('All');
    setSearch('');
    setShowFavoritesOnly(true);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('favorites', 'true');
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
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
      'PDF', 'Text',
      'Developer', 'Converters', 'Generators',
      'Calculators', 'Color & Image', 'QR & Barcode',
      'SEO', 'Utility', 'Wikipedia', 'Universal Data Suite'
    ];
    const present = desiredOrder.filter(cat => categories.includes(cat as any));
    const remainder = categories.filter(cat => !desiredOrder.includes(cat));
    return [...present, ...remainder];
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      if (showFavoritesOnly && !favorites.includes(tool.slug)) {
        return false;
      }
      const matchesSearch = 
        tool.name.toLowerCase().includes(search.toLowerCase()) || 
        tool.metaDescription.toLowerCase().includes(search.toLowerCase()) ||
        tool.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
        
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, showFavoritesOnly, favorites]);

  useEffect(() => {
    setDisplayCount(incrementCount);
  }, [search, activeCategory, showFavoritesOnly, incrementCount]);

  const displayedTools = filteredTools.slice(0, displayCount);

  return (
    <>
      <Seo 
        title={showFavoritesOnly ? "Saved Bookmarked Tools - Toolzaro" : "Toolzaro - Professional Online Developer & Utility Tools"} 
        description={showFavoritesOnly ? "Your personal collection of bookmarked developer and utility tools on Toolzaro." : `A complete suite of ${tools.length} fast, browser-based tools including color tools, image resizers, QR generators, image compressors, and developer utilities.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Toolzaro",
          "url": "https://toolnest.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://toolnest.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {showFavoritesOnly ? (
        /* ============================================================ */
        /* DEDICATED PREMIUM SAVED BOOKMARKS WORKSPACE                  */
        /* (Clutter-free: Homepage Hero, Tech Digest, & full categories */
        /* are cleanly hidden to give immediate focus to saved tools)    */
        /* ============================================================ */
        <div className="pt-1 sm:pt-3 pb-8 space-y-6">
          {/* Breadcrumb Navigation & Back Action */}
          <div className="flex items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleExitFavorites}
                className="hover:text-primary transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <span className="font-bold text-foreground">Saved Bookmarks</span>
            </nav>

            <button
              type="button"
              onClick={handleExitFavorites}
              className="btn-signature-header px-3.5 py-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180 text-primary" />
              <span>Back to All Tools</span>
            </button>
          </div>

          {/* Premium Bookmarks Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 dark:border-amber-500/20 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 ring-4 ring-amber-500/10">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white drop-shadow-sm" />
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
                    Instant one-click access to your favorite developer & utility tools. Stored securely and privately in your browser.
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
                    className="btn-signature-header px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border-red-500/25 hover:border-red-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Clear all saved bookmarks"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500/80" />
                    <span>Clear All</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExitFavorites}
                  className="btn-signature-primary px-4 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 rounded-[0.875rem] shadow-2xs"
                >
                  <span>Explore All {tools.length} Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Search & Category Filter within Bookmarks */}
          {favorites.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Compact search for saved tools */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-card/90 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all placeholder:text-muted-foreground/75"
                    placeholder="Search in your saved tools..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute inset-y-0 right-2.5 my-auto w-6 h-6 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* If bookmarked tools span multiple categories, show smart category pills */}
                {bookmarkedCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('All')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                        activeCategory === 'All'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
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

          {/* Bookmarked Tools Grid or Empty State */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
              {filteredTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-card/50 rounded-3xl border-2 border-dashed border-border/80 flex flex-col items-center p-6 sm:p-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground">
                {search ? 'No matching bookmarked tools' : 'No bookmarked tools yet'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
                {search
                  ? `No saved tools match "${search}". Try clearing your search.`
                  : 'You haven\'t added any tools to your bookmarks yet. Click the star icon on any tool card to save it for quick access.'}
              </p>
              <div className="flex items-center gap-3">
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="btn-signature-primary px-5 py-2 text-xs font-bold cursor-pointer rounded-[0.875rem] shadow-2xs"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExitFavorites}
                    className="btn-signature-primary px-5 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 rounded-[0.875rem] shadow-2xs"
                  >
                    <span>Explore All {tools.length} Tools</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* STANDARD HOMEPAGE VIEW (Hero, Daily Digest, Categories, Grid) */
        /* ============================================================ */
        <>
          {/* Hero Section */}
          <section className="pt-1 sm:pt-3 md:pt-4 pb-6 sm:pb-7 md:pb-9 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-10">
            <div className="flex-1 w-full max-w-2xl flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 sm:mb-4 border border-primary/20 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="tracking-tight">{tools.length}+ Professional Browser Utilities • Client-Side Privacy</span>
              </div>
              
              {/* Real Keyboard Typewriter Animation Heading (centered on phone, left on md+) */}
              <div className="w-full">
                <TypewriterHeading />
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 leading-relaxed max-w-xl font-normal text-center md:text-left mx-auto md:mx-0">
                Browser-native processing. Resize images, extract color palettes, format JSON, generate QR codes, and convert files safely without cloud uploads.
              </p>
              
              {/* Quick Stats Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 md:gap-3 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-2xs backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant Execution</span>
                </div>
                <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-2xs backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-2xs backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>{tools.length} Utilities</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Banner Showcase on PC */}
            <div className="flex-1 w-full hidden md:flex justify-end relative">
              <HeroShowcase />
            </div>
          </section>

          {/* Full-Width Daily Tech Digest & Expansive Search Section */}
          <section className="w-full mb-6 sm:mb-8 md:mb-10 space-y-3 sm:space-y-3.5">
            {/* Daily Tech Digest Widget (Full Width across page) */}
            <div className="w-full">
              <DailyTechDigest />
            </div>

            {/* Search Box (Full Width across page) */}
            <div className="w-full relative group">
              <div className="absolute inset-y-0 left-3.5 sm:left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-focus-within:scale-105">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <input
                type="text"
                className="w-full h-13 sm:h-15 md:h-16 pl-14 sm:pl-16 pr-12 sm:pr-14 rounded-2xl border-2 border-border/80 bg-card/90 text-sm sm:text-base font-medium focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-muted-foreground/75"
                placeholder={`Search across ${tools.length} developer utilities (e.g., color, resizer, JSON, QR, PDF, countries)...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    if (searchParams.has('q')) {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('q');
                      setSearchParams(newParams);
                    }
                  }}
                  className="absolute inset-y-0 right-3.5 sm:right-4 my-auto w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>

          {/* Explore Categories Section */}
          <section className="mb-8 sm:mb-10 md:mb-12 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">Explore Categories</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                  activeCategory === 'All'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
                    : 'bg-card/90 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40 shadow-2xs'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 shrink-0 transition-colors ${activeCategory === 'All' ? 'text-white' : 'text-primary/70 group-hover:text-primary'}`} />
                <span>All Tools</span>
                <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-white/20 text-white'
                    : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  {tools.length}
                </span>
              </button>

              {orderedCategories.map((cat) => {
                const count = tools.filter(t => t.category === cat).length;
                const isActive = activeCategory === cat;
                const SampleIcon = tools.find(t => t.category === cat)?.icon || Layers;
                
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
                        : 'bg-card/90 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40 shadow-2xs'
                    }`}
                  >
                    <SampleIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary'}`} />
                    <span>{cat}</span>
                    <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tools Grid */}
          <section>
            {filteredTools.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
                  {displayedTools.map(tool => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>

                {displayCount < filteredTools.length && (
                  <button 
                    type="button"
                    onClick={() => setDisplayCount(prev => prev + incrementCount)}
                    className="mt-8 sm:mt-10 md:mt-12 px-8 py-3.5 rounded-2xl font-bold text-xs btn-signature-header hover:border-primary/50 text-foreground shadow-sm flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Show More Tools ({filteredTools.length - displayCount} remaining)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-primary" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-card/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center p-6">
                <img src={emptyImg} alt="No tools found" className="w-32 h-32 sm:w-36 sm:h-36 mb-4 opacity-80" />
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
          </section>
        </>
      )}

      {/* Ad slot after tools (self-collapses when not filled) */}
      <div className="my-8 sm:my-10 md:my-12">
        <AdSlot slot="home-after-tools" format="horizontal" />
      </div>

      {/* Featured Blog & Insights Section */}
      {allBlogPosts.length > 0 && !showFavoritesOnly && !search && (
        <section className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 border-t border-border/60 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Toolzaro Pulse &amp; Insights</span>
                </div>
                {hasBloggerPosts && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Live Blogger Sync Active</span>
                  </span>
                )}
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

          {/* Responsive Blog Grid: 1 col on mobile, 2 col on tablet, 3 col on PC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {allBlogPosts.slice(0, visibleBlogCount).map((post) => (
              <Link
                key={post.id}
                to={getBlogPostUrl(post.slug, post.url)}
                className="group flex flex-col justify-between rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer no-underline select-none"
              >
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl aspect-video relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                        {post.category}
                      </span>
                      {post.source === 'blogger' && (
                        <span className="px-2 py-0.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>New</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
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

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">
                    {post.author.name}
                  </span>
                  <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Bar for Home Blog Section */}
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
                <span>Blog Hub</span>
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
      <section className="mt-12 sm:mt-16 md:mt-20 py-8 sm:py-12 border-t border-border/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 text-center md:text-left">
          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">100% Private & Local</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your files and input strings stay inside your browser memory. Nothing is ever saved or sent to external servers.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">Instant Execution</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by standard HTML5 Web APIs, Canvas, and WebAssembly for instantaneous execution without network lag.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
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

