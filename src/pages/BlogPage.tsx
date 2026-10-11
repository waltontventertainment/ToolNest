import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Filter, 
  Share2, 
  Tag, 
  CheckCircle2, 
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';
import { FirestoreBlog, getPublishedBlogs, getInstantPublishedBlogs, isSameBlogPost } from '../lib/firestoreBlogService';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { BlogAuthorBadge } from '../components/BlogAuthorBadge';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getBlogPostUrl } from '../lib/appUrls';

export const BlogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<FirestoreBlog[]>(() => getInstantPublishedBlogs());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Pagination
  const [visiblePostsCount, setVisiblePostsCount] = useState(9);

  useEffect(() => {
    const defaultCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 9 : 6;
    setVisiblePostsCount(defaultCount);
  }, [selectedCategory, search]);

  const handleLoadMore = () => {
    const increment = typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 6;
    setVisiblePostsCount(prev => prev + increment);
  };

  useEffect(() => {
    let isMounted = true;
    getPublishedBlogs()
      .then(data => {
        if (isMounted && data.length > 0) {
          setPosts(prev => {
            if (
              prev.length === data.length &&
              prev.every((item, idx) => isSameBlogPost(item, data[idx]))
            ) {
              return prev;
            }
            return data;
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive categories dynamically from actual published Firestore posts
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    posts.forEach(post => {
      if (post.category && post.category.trim()) {
        set.add(post.category.trim());
      }
    });
    return Array.from(set);
  }, [posts]);

  // Filter posts by category and search
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = !search || 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, search]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visiblePostsCount);
  }, [filteredPosts, visiblePostsCount]);

  const hasMore = visiblePostsCount < filteredPosts.length;

  return (
    <div className="space-y-8 sm:space-y-10">
      <Seo 
        title={`${settings.branding.siteName} Blog - Insights, Tutorials & Tech Articles`}
        description="Comprehensive technical guides, tutorials, and insights for developers, creators, and web practitioners."
        url={`${settings.seo.canonicalBaseUrl}/blog`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
        <BreadcrumbNavigation items={[{ label: 'Blog' }]} />
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-primary/20 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 border border-primary/40 text-primary-foreground backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Knowledge Hub & Insights</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Engineering Insights & In-Depth Guides
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover in-depth engineering breakdowns, client-side privacy architectures, and modern web development guides.
          </p>
        </div>
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs scale-102'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Top Ad Slot */}
      {settings.ads.enabled && (
        <AdSlot slot={settings.ads.topSlotId} format="horizontal" />
      )}

      {/* Post Grid (Instant 0ms Render - Never shows 'Loading from Firestore') */}
      {visiblePosts.length === 0 ? (
        <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No Articles Found</h3>
          <p className="text-xs text-muted-foreground">
            {search ? 'No articles match your search criteria. Try a different query.' : 'No blog posts published in the database yet.'}
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Go to Admin CMS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visiblePosts.map(post => (
            <Link
              key={post.id}
              to={getBlogPostUrl(post.slug)}
              className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors duration-200 hover:shadow-lg no-underline"
            >
              {/* Cover Image */}
              <div className="relative aspect-video overflow-hidden bg-muted block">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={270}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
                  {post.category}
                </span>
              </div>

              {/* Content Box */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author & Read More */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <BlogAuthorBadge author={post.author} size="sm" />

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform shrink-0">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            className="px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-2xs transition-all hover:scale-102"
          >
            Load More Articles ({filteredPosts.length - visiblePostsCount} remaining)
          </button>
        </div>
      )}

      {/* Bottom Ad Slot */}
      {settings.ads.enabled && (
        <AdSlot slot={settings.ads.bottomSlotId} format="rectangle" />
      )}
    </div>
  );
};
