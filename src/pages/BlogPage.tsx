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
  Rss
} from 'lucide-react';
import { BlogPost, BUILTIN_BLOG_POSTS, getMergedBlogPosts } from '../lib/blogData';
import { tools } from '../lib/registry';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(BUILTIN_BLOG_POSTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load merged posts automatically in background
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await getMergedBlogPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'AI & Machine Learning', 'Developer Workflows', 'SEO & Growth', 'Security & Privacy', 'Design & UX'];

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

  const featuredPost = posts[0];
  const gridPosts = filteredPosts.filter(p => p.id !== (selectedCategory === 'All' && !search ? featuredPost?.id : ''));

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <Seo
        title="Toolzaro Pulse & Insights - Web, AI & Developer Guides"
        description="Explore in-depth technical guides, free AI workflows, developer cheatsheets, and SEO optimization strategies."
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
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Rss className="w-3.5 h-3.5" />
            <span>Toolzaro Pulse & Insights</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display">
            Knowledge Hub & Engineering Journal
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            In-depth guides, practical developer workflows, free AI model tutorials, and technical SEO strategies designed for modern creators.
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

      {/* Featured Hero Article (when showing all and no search query) */}
      {selectedCategory === 'All' && !search && featuredPost && (
        <section className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-primary/40 transition-all shadow-xs hover:shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 p-5 sm:p-6 md:p-8 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {featuredPost.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readTimeMinutes} min read
                </span>
              </div>

              <Link to={`/blog/${featuredPost.slug}`}>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{featuredPost.author.name}</p>
                    <p className="text-[11px] text-muted-foreground">{featuredPost.publishedAt}</p>
                  </div>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 overflow-hidden rounded-2xl aspect-video lg:aspect-auto lg:h-72">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Blog Cards Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`} ({filteredPosts.length})
          </h2>
        </div>

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {gridPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col justify-between rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer no-underline select-none"
              >
                <div className="space-y-3.5">
                  <div className="overflow-hidden rounded-2xl aspect-video relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTimeMinutes} min read
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {post.author.name}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border p-6">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No articles found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try searching for a different keyword or select another category.
            </p>
          </div>
        )}
      </section>

      {/* Bottom AdSense Slot */}
      <AdSlot slot="blog-hub-bottom" format="auto" />
    </div>
  );
};
