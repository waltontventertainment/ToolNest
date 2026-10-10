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
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  RefreshCw,
  Folder,
  User
} from 'lucide-react';
import { FirestoreBlog, getBlogBySlug, getPublishedBlogs } from '../lib/firestoreBlogService';
import { Seo } from '../components/Seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { AdSlot } from '../components/AdSlot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CustomCodeRenderer } from '../components/CustomCodeRenderer';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getBlogPostUrl } from '../lib/appUrls';
import { NotFound } from './NotFound';
import { toast } from 'sonner';

export const BlogPostPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const slug = forcedSlug || routeSlug || searchParams.get('blog') || '';
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const [post, setPost] = useState<FirestoreBlog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FirestoreBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getBlogBySlug(slug);
      setPost(data);

      // Load related posts from same category
      const all = await getPublishedBlogs();
      const others = all.filter(p => p.slug !== slug);
      setRelatedPosts(others.slice(0, 3));
    } catch (err) {
      console.error('Failed to load blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-sm font-semibold text-muted-foreground">Loading article from Firestore...</p>
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const postUrl = `${baseUrl}/${post.slug}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Seo
        title={`${post.title} - ${settings.branding.siteName}`}
        description={post.excerpt}
        url={postUrl}
        image={post.coverImage}
        type="article"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
        <BreadcrumbNavigation
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.title }
          ]}
        />
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {post.publishedAt}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {post.readTimeMinutes} min read
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/40 pl-4 py-1">
            {post.excerpt}
          </p>
        )}

        {/* Author Details & Share */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=6366f1&color=ffffff&bold=true`}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-sm font-bold text-foreground">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden aspect-video border border-border shadow-md bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Top Article Ad */}
      {settings.ads.enabled && (
        <div className="my-4">
          <AdSlot slot={settings.ads.inContentSlotId} format="horizontal" />
        </div>
      )}

      {/* Main Content Body: Rich Markdown or Custom Code Design */}
      {post.contentType === 'code' || post.customHtml ? (
        <div className="custom-post-wrapper my-6">
          <CustomCodeRenderer
            html={post.customHtml}
            css={post.customCss}
            js={post.customJs}
          />
          {post.content && post.content.trim() && (
            <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed mt-8 pt-8 border-t border-border">
              <MarkdownRenderer content={post.content} />
            </div>
          )}
        </div>
      ) : (
        <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed">
          <MarkdownRenderer content={post.content} />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-border space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="pt-10 border-t border-border space-y-6">
          <h2 className="text-xl font-bold text-foreground">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map(rel => (
              <Link
                key={rel.id}
                to={getBlogPostUrl(rel.slug)}
                className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {rel.category}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  Read article <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
