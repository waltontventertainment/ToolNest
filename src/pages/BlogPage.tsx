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
  Wrench, 
  ChevronRight, 
  Rss, 
  CheckCircle2, 
  ExternalLink, 
  ArrowDown 
} from 'lucide-react';
import { BlogPost, BUILTIN_BLOG_POSTS } from '../lib/blogData';
import { 
  getMergedPostsWithBlogger, 
  getNativeBloggerXmlPosts,
  getSavedBloggerUrl, 
  getLastSyncTime 
} from '../lib/bloggerSync';
import { getBloggerHeroSettings, applyBloggerPostOverrides } from '../lib/bloggerLayoutAdmin';
import { tools } from '../lib/registry';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const effectiveBuiltin = applyBloggerPostOverrides(BUILTIN_BLOG_POSTS);
    const native = getNativeBloggerXmlPosts();
    if (native.length > 0) {
      const combined = [...native, ...effectiveBuiltin];
      const seen = new Set<string>();
      return combined.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }
    return effectiveBuiltin;
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Responsive Pagination: 6 for mobile/tablet, 9 for desktop
  const [visiblePostsCount, setVisiblePostsCount] = useState(6);

  useEffect(() => {
    const defaultCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 9 : 6;
    setVisiblePostsCount(defaultCount);
  }, [selectedCategory, search]);

  const handleLoadMore = () => {
    const increment = typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 6;
    setVisiblePostsCount(prev => prev + increment);
  };

  const jumpToFooter = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Load merged posts automatically on mount (silently)
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await getMergedPostsWithBlogger();
      setPosts(allPosts);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const heroSettings = useMemo(() => getBloggerHeroSettings(), []);

  // Categories: ONLY actual categories of inbuilt posts + labels of Blogger posts!
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');

    // 1. Categories from inbuilt posts (only actual category field, no random internal tags)
    posts.forEach(post => {
      if (post.source === 'builtin' && post.category && post.category !== 'All') {
        const cat = post.category.trim();
        if (cat) set.add(cat);
      }
    });

    // 2. Categories from Blogger posts (primary category + custom labels)
    posts.forEach(post => {
      if (post.source === 'blogger') {
        if (post.category && post.category !== 'All') {
          const cat = post.category.trim();
          if (cat) set.add(cat);
        }
        if (Array.isArray(post.tags)) {
          post.tags.forEach(t => {
            if (t && t.trim() && t !== 'Articles' && t !== 'Blogger' && t !== 'All') {
              set.add(t.trim());
            }
          });
        }
      }
    });

    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = 
        selectedCategory === 'All' || 
        post.category === selectedCategory || 
        (Array.isArray(post.tags) && post.tags.includes(selectedCategory));
      const matchesSearch = 
        !search.trim() ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.category.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, search]);

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <Seo
        title="Toolzaro Knowledge Hub & Engineering Journal"
        description="Explore in-depth technical guides, developer cheatsheets, SEO optimization strategies, and modern web tool architectures."
        url="https://toolnest.com/blog"
      />

      <div className="mb-2 sm:mb-3">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Blog & Insights',
            },
          ]}
        />
      </div>

      {/* Hero Header (Customizable via Blogger Layout Settings) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-card via-card to-primary/5 border border-border p-6 sm:p-8 md:p-10 shadow-sm">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <BookOpen className="w-4 h-4" />
            <span>{heroSettings?.badge || 'Engineering Journal & Tech Insights'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display">
            {heroSettings?.title || 'Knowledge Hub & Engineering Journal'}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {heroSettings?.subtitle || 'In-depth guides, practical developer workflows, and technical SEO strategies to build faster and smarter.'}
          </p>

          <div className="pt-2 max-w-md w-full">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, topics, keywords..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-card text-muted-foreground border-border hover:border-border/80 hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Latest Publications Grid (All posts render in identical unified card boxes) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
              {selectedCategory === 'All' ? 'Latest Publications' : `${selectedCategory} Articles`}
            </h2>
            <span className="text-xs font-mono text-muted-foreground">({filteredPosts.length} Articles)</span>
          </div>

          <button
            type="button"
            onClick={jumpToFooter}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="Jump down to footer"
          >
            <span>Jump to Footer</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border/80 rounded-3xl space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <h3 className="text-sm font-bold text-foreground">No articles found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or category filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredPosts.slice(0, visiblePostsCount).map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs hover:shadow-md"
                >
                  <div>
                    <div className="aspect-16/10 overflow-hidden relative border-b border-border/60">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-background/90 backdrop-blur-xs text-[10px] font-bold text-foreground border border-border/60">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>{post.readTimeMinutes} min read</span>
                      </div>

                      <Link to={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 border-t border-border/40 mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                      />
                      <span className="text-[11px] font-medium text-foreground truncate max-w-[120px]">
                        {post.author.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group-hover:gap-1.5 transition-all"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Responsive Pagination & Load More Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 border border-border/60 rounded-2xl p-4">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing <strong className="text-foreground">{Math.min(visiblePostsCount, filteredPosts.length)}</strong> of <strong className="text-foreground">{filteredPosts.length}</strong> articles.
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center">
                {filteredPosts.length > visiblePostsCount ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="btn-signature-primary px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer w-full sm:w-auto justify-center shadow-xs"
                  >
                    <span>Load More Articles ({filteredPosts.length - visiblePostsCount} left)</span>
                  </button>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground py-1">
                    All articles loaded.
                  </span>
                )}

                <button
                  type="button"
                  onClick={jumpToFooter}
                  className="btn-signature-header px-3.5 py-2 text-xs font-bold gap-1.5 text-foreground cursor-pointer"
                  title="Jump to footer without scrolling"
                >
                  <span>Jump to Footer</span>
                  <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* AdSense Placement */}
      <div className="my-6">
        <AdSlot slot="blog-bottom" format="horizontal" />
      </div>
    </div>
  );
};

export default BlogPage;
