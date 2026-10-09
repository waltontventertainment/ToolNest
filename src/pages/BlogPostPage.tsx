import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Tag, 
  Wrench, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { BlogPost, BUILTIN_BLOG_POSTS } from '../lib/blogData';
import { getMergedPostsWithBlogger, getNativeBloggerXmlPosts } from '../lib/bloggerSync';
import { tools } from '../lib/registry';
import { Seo } from '../components/Seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { AdSlot } from '../components/AdSlot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { cleanPostContentHtml } from '../lib/bloggerContentCleaner';
import { extractSlugFromBloggerPath, getBlogPostUrl, getToolUrl } from '../lib/appUrls';
import { toast } from 'sonner';

export const BlogPostPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const pathSlug = typeof window !== 'undefined' ? extractSlugFromBloggerPath(window.location.pathname) : null;
  const slug = forcedSlug || routeSlug || searchParams.get('blog') || pathSlug || '';
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(BUILTIN_BLOG_POSTS);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const posts = await getMergedPostsWithBlogger();
      setAllPosts(posts);

      const targetSlug = slug.toLowerCase().trim();

      // 1. Direct match by slug or id
      let found = posts.find(p => p.slug.toLowerCase() === targetSlug || p.id.toLowerCase() === targetSlug);

      // 2. URL slug match from p.url or p.bloggerUrl
      if (!found) {
        found = posts.find(p => {
          const uSlug = p.url ? extractSlugFromBloggerPath(p.url)?.toLowerCase() : null;
          const bSlug = p.bloggerUrl ? extractSlugFromBloggerPath(p.bloggerUrl)?.toLowerCase() : null;
          return uSlug === targetSlug || bSlug === targetSlug;
        });
      }

      // 3. Normalized similarity match (handles trailing hyphens, length truncation by Blogger)
      if (!found && targetSlug) {
        const cleanTarget = targetSlug.replace(/[^a-z0-9]/g, '');
        if (cleanTarget.length >= 3) {
          found = posts.find(p => {
            const pClean = p.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
            return pClean.includes(cleanTarget) || cleanTarget.includes(pClean);
          });
        }
      }

      // 4. Native Blogger Fallback: On a single post page, Blogger only prints that exact post!
      if (!found && typeof window !== 'undefined') {
        const nativePosts = getNativeBloggerXmlPosts();
        if (nativePosts.length === 1) {
          found = nativePosts[0];
        } else if (nativePosts.length > 0) {
          found = nativePosts.find(np => {
            const npSlug = np.url ? extractSlugFromBloggerPath(np.url)?.toLowerCase() : null;
            return npSlug === targetSlug || np.slug.toLowerCase() === targetSlug;
          }) || nativePosts[0];
        }
      }

      setPost(found || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const copyTarget = post?.url || window.location.href.replace(/#.*$/, '');
    navigator.clipboard.writeText(copyTarget);
    setCopied(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50" />
        <h2 className="text-xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The article you are looking for might have been moved or removed.
        </p>
        <Link to="/blog" className="btn-signature-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog Hub</span>
        </Link>
      </div>
    );
  }

  // Find related tools from registry if defined
  const relatedTools = (post.relatedToolSlugs || [])
    .map(slug => tools.find(t => t.slug === slug))
    .filter(Boolean);

  // Find next and previous posts
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
      <Seo
        title={`${post.title} - Toolzaro Pulse`}
        description={post.excerpt}
        url={post.url || post.bloggerUrl || (typeof window !== 'undefined' ? window.location.href.replace(/#.*$/, '') : undefined)}
        image={post.coverImage}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'description': post.excerpt,
          'image': post.coverImage,
          'datePublished': post.publishedAt,
          'author': {
            '@type': 'Person',
            'name': post.author.name
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Toolzaro',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://toolnest.com/logo.png'
            }
          }
        }}
      />

      {/* Breadcrumbs Navigation */}
      <BreadcrumbNavigation
        items={[
          { label: 'Blog & Insights', href: '/blog' },
          { label: post.title },
        ]}
        className="mb-3 sm:mb-4"
      />

      {/* Back Button */}
      <div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Articles</span>
        </Link>
      </div>

      {/* Header Info */}
      <header className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="px-3 sm:px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            {post.category}
          </span>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground">
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
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-display leading-tight">
          {post.title}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author & Share Bar */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground">{post.author.name}</p>
                {post.author.profileUrl && (
                  <a
                    href={post.author.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    title="View Blogger Profile"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="btn-signature-header px-3.5 py-2 text-xs font-semibold gap-1.5 cursor-pointer"
              title="Copy link to share"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>
          </div>
        </div>
      </header>

      <AdSlot slot="blog-article-top" format="horizontal" />

      {/* Featured Image */}
      <div className="rounded-3xl overflow-hidden aspect-video border border-border shadow-md">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xs">
        {post.source === 'blogger' ? (
          <div 
            className="prose dark:prose-invert max-w-none text-xs md:text-sm text-foreground leading-relaxed space-y-4 [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-extrabold [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: cleanPostContentHtml(post.content, post.coverImage) }} 
          />
        ) : (
          <MarkdownRenderer content={post.content} />
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
            <Tag className="w-3.5 h-3.5" /> Tags:
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <AdSlot slot="blog-article-bottom" format="auto" />

      {/* Related Tools Interactive Box */}
      {relatedTools.length > 0 && (
        <section className="rounded-3xl bg-linear-to-br from-primary/10 via-card to-card border border-primary/20 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Wrench className="w-4 h-4" />
            <span>Tools Mentioned in This Guide</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Try these free browser-native utilities directly on Toolzaro:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {relatedTools.map((tool: any) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to={getToolUrl(tool.slug)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {tool.metaDescription}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Post Navigation */}
      <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
        {prevPost ? (
          <Link
            to={getBlogPostUrl(prevPost.slug, prevPost.url || prevPost.bloggerUrl)}
            className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between group"
          >
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous Article
            </span>
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {prevPost.title}
            </span>
          </Link>
        ) : <div />}

        {nextPost ? (
          <Link
            to={getBlogPostUrl(nextPost.slug, nextPost.url || nextPost.bloggerUrl)}
            className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between items-end text-right group md:col-start-2"
          >
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
              Next Article <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {nextPost.title}
            </span>
          </Link>
        ) : <div />}
      </nav>
    </article>
  );
};
