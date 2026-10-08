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
  RefreshCw,
  Globe,
  CheckCircle2,
  ExternalLink,
  Edit3,
  ArrowDown
} from 'lucide-react';
import { BlogPost, BUILTIN_BLOG_POSTS } from '../lib/blogData';
import { 
  getMergedPostsWithBlogger, 
  getSavedBloggerUrl, 
  saveBloggerUrl, 
  fetchBloggerPosts,
  getLastSyncTime 
} from '../lib/bloggerSync';
import { tools } from '../lib/registry';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { toast } from 'sonner';

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(BUILTIN_BLOG_POSTS);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Blogger configuration modal & status
  const [bloggerUrl, setBloggerUrl] = useState(getSavedBloggerUrl());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(getSavedBloggerUrl());
  const [lastSync, setLastSync] = useState(getLastSyncTime());

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

  // Load merged posts automatically on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (showToast = false) => {
    setLoading(true);
    try {
      const allPosts = await getMergedPostsWithBlogger();
      setPosts(allPosts);
      setLastSync(getLastSyncTime());
      if (showToast) {
        const bloggerCount = allPosts.filter(p => p.source === 'blogger').length;
        toast.success(`Synced with Blogger! ${bloggerCount > 0 ? `Loaded ${bloggerCount} posts from ${bloggerUrl}` : 'No new posts found on blog.'}`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) toast.error('Failed to sync with Blogger.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const liveBloggerPosts = await fetchBloggerPosts(bloggerUrl);
      const allPosts = await getMergedPostsWithBlogger();
      setPosts(allPosts);
      setLastSync(new Date().toLocaleTimeString());
      toast.success(`Synced with ${bloggerUrl.replace('https://', '')}! Found ${liveBloggerPosts.length} posts.`);
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveBloggerConfig = () => {
    if (!inputUrl.trim()) {
      toast.error('Please enter your Blogspot address.');
      return;
    }
    saveBloggerUrl(inputUrl);
    setBloggerUrl(getSavedBloggerUrl());
    setShowConfigModal(false);
    toast.success('Blogger address updated!');
    loadPosts(true);
  };

  const categories = ['All', 'Developer Workflows', 'SEO & Growth', 'Security & Privacy', 'Design & UX'];

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, search]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.filter(p => p.id !== (selectedCategory === 'All' && !search ? featuredPost?.id : ''));

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <Seo
        title="Toolzaro Pulse & Insights - Web, Technology & Developer Guides"
        description="Explore in-depth technical guides, developer cheatsheets, and SEO optimization strategies synchronized live with toolzaro.blogspot.com."
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

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-card via-card to-primary/5 border border-border p-6 sm:p-8 md:p-10 shadow-sm">
        <div className="max-w-3xl space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Rss className="w-3.5 h-3.5" />
              <span>Toolzaro Pulse & Insights</span>
            </div>

            {/* Live Blogger Sync Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced with {bloggerUrl.replace('https://', '')}</span>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="hover:text-foreground transition-colors p-0.5 cursor-pointer ml-1"
                title="Sync latest posts from Blogger now"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputUrl(bloggerUrl);
                  setShowConfigModal(true);
                }}
                className="hover:text-foreground transition-colors p-0.5 cursor-pointer"
                title="Edit Blogger address"
              >
                <Edit3 className="w-3 h-3 opacity-70 hover:opacity-100" />
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display">
            Knowledge Hub & Engineering Journal
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            In-depth guides, practical developer workflows, and technical SEO strategies. Every post published on <strong className="text-foreground">{bloggerUrl.replace('https://', '')}</strong> automatically synchronizes here in real time.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, topics, keywords..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all border border-border/80 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-primary' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Blogger'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Blogger Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Configure Blogger (Blogspot) Address</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-muted-foreground font-semibold">Your Blogspot or Custom Domain URL:</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://toolzaro.blogspot.com"
                className="w-full h-10 px-3 rounded-xl border border-border bg-secondary/50 text-xs font-mono focus:border-primary focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Whenever you publish new articles in this Blogger account, Toolzaro will automatically pull the posts via Blogger's free, unlimited public feed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-xs font-semibold hover:bg-secondary/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBloggerConfig}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                Save & Sync
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Featured Hero Article (when showing all and no search query) */}
      {selectedCategory === 'All' && !search && featuredPost && (
        <section className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-primary/40 transition-all shadow-xs hover:shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 p-5 sm:p-6 md:p-8 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {featuredPost.category}
                </span>
                {featuredPost.source === 'blogger' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                    Live Blogger
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{featuredPost.publishedAt}</span>
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredPost.readTimeMinutes} min read</span>
                </span>
              </div>

              <Link to={`/blog/${featuredPost.slug}`} className="block group-hover:text-primary transition-colors">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight leading-snug">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{featuredPost.author.name}</p>
                    <p className="text-[10px] text-muted-foreground">{featuredPost.author.role}</p>
                  </div>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="btn-signature-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm group-hover:gap-2.5 transition-all"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 overflow-hidden rounded-2xl aspect-16/10 border border-border/80">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Grid of Remaining Articles */}
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
              {gridPosts.slice(0, visiblePostsCount).map((post) => (
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
                        {post.source === 'blogger' && (
                          <span className="px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Live Blogger</span>
                          </span>
                        )}
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
                      {post.bloggerUrl && (
                        <a
                          href={post.bloggerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Open original Blogger post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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
                Showing <strong className="text-foreground">{Math.min(visiblePostsCount, gridPosts.length)}</strong> of <strong className="text-foreground">{gridPosts.length}</strong> articles.
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center">
                {gridPosts.length > visiblePostsCount ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="btn-signature-primary px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer w-full sm:w-auto justify-center shadow-xs"
                  >
                    <span>Load More Articles ({gridPosts.length - visiblePostsCount} left)</span>
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
