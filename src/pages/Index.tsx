import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Star, ShieldCheck, Zap, Layers, X, ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { tools, categories } from '../lib/registry';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { useLocalStorage } from '../lib/toolkit';
import { useFavorites } from '../context/FavoritesContext';
import { BlogPost, BUILTIN_BLOG_POSTS, getMergedBlogPosts } from '../lib/blogData';

import heroImg from '../assets/images/hero_visual_1785690377657.jpg';
import emptyImg from '../assets/images/empty_state_1785690459297.jpg';

export const Index: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('favorites') === 'true');
  const { favorites } = useFavorites();

  // Show 24 tools initially on the homepage grid (22-25 range requested)
  const [displayCount, setDisplayCount] = useState(24);
  const [incrementCount, setIncrementCount] = useState(24);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BUILTIN_BLOG_POSTS.slice(0, 3));

  useEffect(() => {
    getMergedBlogPosts().then(posts => {
      setBlogPosts(posts.slice(0, 3));
    });
  }, []);

  useEffect(() => {
    setShowFavoritesOnly(searchParams.get('favorites') === 'true');
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
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
        title="ToolNest - Free Online Developer & Utility Tools" 
        description="A complete suite of 35+ free, fast, browser-based tools including color tools, image resizers, QR generators, image compressors, and developer utilities."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ToolNest",
          "url": "https://toolnest.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://toolnest.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Hero Section */}
      <section className="text-center md:text-left py-8 md:py-14 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="tracking-tight">{tools.length}+ Free Browser Utilities • Client-Side Privacy</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-[-0.035em] mb-4 text-foreground leading-[1.12]">
            Every web tool you need.<br />
            <span className="text-brand-gradient">
              Zero installation required.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-xl font-normal">
            100% free, browser-native processing. Resize images, extract color palettes, format JSON, generate QR codes, and convert files safely without cloud uploads.
          </p>
          
          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xs backdrop-blur-xs">
              <div className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>Instant Execution</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xs backdrop-blur-xs">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xs backdrop-blur-xs">
              <div className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>{tools.length} Utilities</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="w-full relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-focus-within:scale-105">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <input
              type="text"
              className="w-full h-14 pl-14 pr-12 rounded-2xl border-2 border-border/80 bg-card/90 text-sm font-medium focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
              placeholder={`Search ${tools.length} tools (e.g., color, resizer, JSON, QR)...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  if (searchParams.has('q')) {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('q');
                    setSearchParams(newParams);
                  }
                }}
                className="absolute inset-y-0 right-3.5 my-auto w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 hidden md:flex justify-end relative">
          <div className="relative">
            <img 
              src={heroImg} 
              alt="ToolNest Visual" 
              className="w-full max-w-md rounded-3xl shadow-xl border border-border object-cover" 
            />
            <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Color & Image Suite</div>
                <div className="text-[11px] text-muted-foreground">10 New High-Speed Tools Added</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Favorites Tabs */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Explore Categories</h2>
          {favorites.length > 0 && (
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                if (searchParams.has('favorites')) {
                  setSearchParams({});
                }
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                showFavoritesOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                  : 'bg-card/80 text-muted-foreground border-border hover:border-amber-400 hover:text-amber-500'
              }`}
            >
              <Star className="w-3.5 h-3.5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              <span>Bookmarked ({favorites.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveCategory('All'); setShowFavoritesOnly(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeCategory === 'All' && !showFavoritesOnly
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-card/90 text-muted-foreground border-border hover:border-border/80 hover:text-foreground hover:bg-muted/40'
            }`}
          >
            All Tools ({tools.length})
          </button>

          {categories.map((cat) => {
            const count = tools.filter(t => t.category === cat).length;
            const isActive = activeCategory === cat && !showFavoritesOnly;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setShowFavoritesOnly(false); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                    : 'bg-card/90 text-muted-foreground border-border hover:border-border/80 hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
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
        {showFavoritesOnly && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <Star className="w-5 h-5" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Saved Bookmarked Tools</h3>
                <p className="text-xs text-muted-foreground">
                  Displaying {filteredTools.length} bookmarked {filteredTools.length === 1 ? 'tool' : 'tools'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowFavoritesOnly(false);
                if (searchParams.has('favorites')) {
                  setSearchParams({});
                }
              }}
              className="btn-signature-header px-4 py-2 text-xs font-bold text-foreground cursor-pointer"
            >
              Show All {tools.length} Tools
            </button>
          </div>
        )}

        {filteredTools.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
              {displayedTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>

            {displayCount < filteredTools.length && (
              <button 
                onClick={() => setDisplayCount(prev => prev + incrementCount)}
                className="mt-10 px-8 py-3.5 rounded-2xl font-bold text-xs btn-signature-header hover:border-primary/50 text-foreground shadow-sm flex items-center gap-2 group cursor-pointer"
              >
                <span>Show More Tools ({filteredTools.length - displayCount} remaining)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-primary" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-card/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center p-6">
            <img src={emptyImg} alt="No tools found" className="w-36 h-36 mb-4 opacity-80" />
            <h3 className="text-base font-bold mb-1">No matching tools found</h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-sm">
              {showFavoritesOnly ? "You haven't bookmarked any tools yet. Click the star on any tool card to add it here." : `We couldn't find anything matching "${search}".`}
            </p>
            <button 
              onClick={() => { 
                setSearch(''); 
                setActiveCategory('All'); 
                setShowFavoritesOnly(false); 
                if (searchParams.has('q') || searchParams.has('favorites')) {
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

      {/* Featured Blog & Insights Section */}
      {blogPosts.length > 0 && !showFavoritesOnly && !search && (
        <section className="mt-20 pt-10 border-t border-border/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ToolNest Pulse & Insights</span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-display">
                Latest Guides & Developer Dispatches
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Technical tutorials, free AI workflows, and client-side web utility architectures.
              </p>
            </div>

            <Link
              to="/blog"
              className="btn-signature-header px-4 py-2.5 text-xs font-bold gap-2 text-foreground self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-3xl bg-card border border-border hover:border-primary/40 transition-all p-5 shadow-2xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl aspect-video relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                      {post.category}
                    </span>
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

                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">
                    {post.author.name}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      
      {/* Platform Features Section */}
      <section className="mt-20 py-12 border-t border-border/60">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="bg-card border border-border/80 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">100% Private & Local</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your files and input strings stay inside your browser memory. Nothing is ever saved or sent to external servers.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">Instant Execution</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by standard HTML5 Web APIs, Canvas, and WebAssembly for instantaneous execution without network lag.
            </p>
          </div>

          <div className="bg-card border border-border/80 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto md:mx-0 mb-3 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1">No Account Needed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Free to use forever without annoying popups, signups, or paywalls. Simply open and complete your task.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

