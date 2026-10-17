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
import {
  FirestoreBlog,
  getBlogBySlug,
  getPublishedBlogs,
  getInstantBlogBySlug,
  getInstantPublishedBlogs,
  getRelatedBlogs,
  isSameBlogPost,
} from '../lib/firestoreBlogService';
import { BUILTIN_BLOG_CONTENT_BY_ID } from '../lib/blogContentData';
import { Seo } from '../components/Seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { AdSlot } from '../components/AdSlot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CustomCodeRenderer } from '../components/CustomCodeRenderer';
import { BlogAuthorBadge } from '../components/BlogAuthorBadge';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getBlogPostUrl } from '../lib/appUrls';
import { getResponsiveHeroCover } from '../lib/imageUtils';
import { KeywordExplorerModal } from '../components/KeywordExplorerModal';
import { NotFound } from './NotFound';
import { toast } from 'sonner';

const DEFAULT_THUMB_FALLBACK =
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80';
const DEFAULT_COVER_FALLBACK =
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80';

export const BlogPostPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const slug = (forcedSlug || routeSlug || searchParams.get('blog') || '').replace(/\.html$/i, '').trim();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const instantPost = React.useMemo(() => getInstantBlogBySlug(slug), [slug]);

  const [remotePost, setRemotePost] = useState<FirestoreBlog | null>(instantPost);
  const [allBlogs, setAllBlogs] = useState<FirestoreBlog[]>(() => getInstantPublishedBlogs());
  const [resolvingRemote, setResolvingRemote] = useState(!instantPost);
  const [copied, setCopied] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // Synchronously resolve active post on the very first render pass (0.0ms, zero stale state flash)
  const post = React.useMemo(() => {
    const raw =
      remotePost &&
      (remotePost.slug.toLowerCase() === slug.toLowerCase() ||
        remotePost.id.toLowerCase() === slug.toLowerCase())
        ? remotePost
        : instantPost;
    if (!raw) return null;
    if (!raw.content && BUILTIN_BLOG_CONTENT_BY_ID[raw.id]) {
      return { ...raw, content: BUILTIN_BLOG_CONTENT_BY_ID[raw.id] };
    }
    return raw;
  }, [remotePost, instantPost, slug]);

  const relatedPosts = React.useMemo(
    () => getRelatedBlogs(post, allBlogs, 4),
    [post, allBlogs]
  );

  // Reset scroll position synchronously BEFORE browser paint so opening a blog post never jumps
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);

  useEffect(() => {
    const cached = getInstantBlogBySlug(slug);
    if (cached) {
      setRemotePost(prev => (isSameBlogPost(prev, cached) ? prev : cached));
      setResolvingRemote(false);
    } else {
      setResolvingRemote(true);
    }

    let isMounted = true;
    getBlogBySlug(slug)
      .then(data => {
        if (!isMounted || !data) return;
        setRemotePost(prev => (isSameBlogPost(prev, data) ? prev : data));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setResolvingRemote(false);
      });

    getPublishedBlogs()
      .then(all => {
        if (!isMounted || !all || all.length === 0) return;
        setAllBlogs(prev => {
          if (
            prev.length === all.length &&
            prev.every((item, idx) => isSameBlogPost(item, all[idx]))
          ) {
            return prev;
          }
          return all;
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post && resolvingRemote) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-48 rounded-lg bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-10 w-4/5 rounded-xl bg-muted" />
            <div className="aspect-video w-full rounded-2xl bg-muted/70" />
            <div className="space-y-2.5 pt-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-11/12 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </div>
          <div className="lg:col-span-4 h-64 rounded-2xl bg-card border border-border/80" />
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const postUrl = `${baseUrl}/${post.slug}`;

  return (
    <div className="space-y-6">
      <Seo
        title={`${post.title} - ${settings.branding.siteName}`}
        description={post.excerpt}
        url={postUrl}
        image={post.coverImage}
        type="article"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-border/60">
        <BreadcrumbNavigation
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.title }
          ]}
        />
      </div>

      {/* 12-Column Desktop Editorial Layout (8-Col Article + 4-Col Sticky PC Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <article className="lg:col-span-8 space-y-6 bg-card border border-border/80 rounded-2xl p-5 sm:p-8 shadow-2xs">
          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold text-primary">
                {post.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <div className="text-sm sm:text-base text-muted-foreground leading-relaxed bg-secondary/40 border border-border/70 rounded-xl p-4">
                {/<[a-z][\s\S]*>/i.test(post.excerpt) ? (
                  <CustomCodeRenderer html={post.excerpt} />
                ) : (
                  <p>{post.excerpt}</p>
                )}
              </div>
            )}

            {/* Author Details (Toolzaro + Admin + Header 3D Wrench Logo) & Share */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
              <BlogAuthorBadge author={post.author} size="md" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="rounded-2xl overflow-hidden aspect-video border border-border shadow-xs bg-muted relative">
              {(() => {
                const imgAttrs = getResponsiveHeroCover(post.coverImage);
                return (
                  <img
                    src={imgAttrs.src}
                    srcSet={imgAttrs.srcSet}
                    sizes={imgAttrs.sizes}
                    alt={post.title}
                    loading="eager"
                    decoding="async"
                    width={896}
                    height={504}
                    onError={e => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_COVER_FALLBACK) {
                        target.src = DEFAULT_COVER_FALLBACK;
                      }
                    }}
                    className="w-full h-full object-cover block"
                  />
                );
              })()}
            </div>
          )}

          {/* Top Article Ad (Zero-gap when unfilled) */}
          {settings.ads.enabled && (
            <AdSlot slot={settings.ads.inContentSlotId} format="horizontal" />
          )}

          {/* Main Content Body: Rich Markdown/HTML or Custom Code + CSS Design */}
          {(post.contentType === 'code' && post.customHtml?.trim()) ||
          (!post.content?.trim() && post.customHtml?.trim()) ? (
            <div className="custom-post-wrapper my-6">
              <CustomCodeRenderer
                html={post.customHtml}
                css={post.customCss}
                js={post.customJs}
              />
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed">
              {post.customCss?.trim() && (
                <style dangerouslySetInnerHTML={{ __html: post.customCss }} />
              )}
              {post.customHtml?.trim() && (
                <div className="mb-6">
                  <CustomCodeRenderer
                    html={post.customHtml}
                    css={post.customCss}
                    js={post.customJs}
                  />
                </div>
              )}
              <MarkdownRenderer
                content={(post.content || '').replace(/^\s*#\s+[^\n]+\n+/, '')}
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Associated Topics &amp; Keywords
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Click any topic to explore matching tools
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {post.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedKeyword(tag)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border transition-all cursor-pointer hover:scale-102 flex items-center gap-1"
                    title={`Explore tools related to "${tag}"`}
                  >
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sticky Right Sidebar on PC */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {relatedPosts.length > 0 && (
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                  <span>Related Dispatches</span>
                </h2>
                <Link to="/blog" className="text-[11px] font-bold text-primary hover:underline">
                  All Guides →
                </Link>
              </div>
              <div className="space-y-3">
                {relatedPosts.map(rel => {
                  const isSameCategory =
                    rel.category?.trim().toLowerCase() === post.category?.trim().toLowerCase();
                  return (
                    <Link
                      key={rel.id}
                      to={getBlogPostUrl(rel.slug)}
                      className="group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl border border-border/80 bg-background/60 hover:bg-muted/40 hover:border-primary/50 hover:shadow-md transition-all duration-300 no-underline"
                    >
                      {/* Compact Rounded-Corner Thumbnail Image */}
                      <div 
                        style={{ contain: 'strict' }}
                        className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/80 ring-2 ring-primary/15 group-hover:ring-primary/45 shadow-xs"
                      >
                        <img
                          src={rel.coverImage || DEFAULT_THUMB_FALLBACK}
                          alt={rel.title}
                          loading="lazy"
                          decoding="async"
                          width={72}
                          height={72}
                          onError={e => {
                            const target = e.currentTarget;
                            if (target.src !== DEFAULT_THUMB_FALLBACK) {
                              target.src = DEFAULT_THUMB_FALLBACK;
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                      </div>

                      {/* Related Post Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary truncate">
                            {rel.category}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {rel.readTimeMinutes}m
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-[13px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h3>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1 transition-colors">
                            <span>Read guide</span>
                            <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          {isSameCategory && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              Matched
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Explore Browser Utilities
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Put these guides into practice with our 100% client-side PDF, image, and developer tools.
            </p>
            <Link
              to="/tools"
              className="w-full btn-signature-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 no-underline"
            >
              <span>Open All Tools Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* Interactive Keyword Explorer Modal */}
      <KeywordExplorerModal
        isOpen={Boolean(selectedKeyword)}
        keyword={selectedKeyword}
        onClose={() => setSelectedKeyword(null)}
      />
    </div>
  );
};
