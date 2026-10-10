import React, { useMemo, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useSearchParams, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { FavoritesProvider } from './context/FavoritesContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { GoogleDriveProvider } from './context/GoogleDriveContext';
import { SiteLayout } from './components/SiteLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Index } from './pages/Index';
import { ToolPage } from './pages/ToolPage';
import { CategoryPage } from './pages/CategoryPage';
import { ToolsHubPage } from './pages/ToolsHubPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AdminPage } from './pages/AdminPage';
import { About, PrivacyPolicy, TermsOfService, Disclaimer, Contact, HtmlSitemap } from './pages/StaticPages';
import { NotFound } from './pages/NotFound';
import { isBloggerHost, extractSlugFromBloggerPath } from './lib/appUrls';
import { tools, categories } from './lib/registry';

/**
 * Hash Routing is only strictly required for standalone offline local HTML files
 * (file:/// protocol or Android WebView content:// without any web server).
 * On Cloudflare Pages, standard web servers, and Blogger, we use BrowserRouter
 * so that all 156+ tools work at flat root-level URLs (domain.com/tool-name)
 * without '#' (hash) fragments or '/tools/' prefixes.
 */
function isHashRoutingRequired(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Direct file or content protocol (local offline HTML on Android / Desktop)
  if (
    window.location.protocol === 'file:' ||
    window.location.protocol === 'content:' ||
    window.location.protocol === ''
  ) {
    return true;
  }

  // 2. Mobile storage or local file download paths
  if (
    window.location.pathname.includes('/storage/') ||
    window.location.pathname.includes('/Download/') ||
    window.location.pathname.includes('/Android/')
  ) {
    return true;
  }

  // 3. Single-file offline build flag
  if ((import.meta as any).env?.BUILD_SINGLEFILE === 'true') {
    return true;
  }

  // 4. Explicit Blogger embed hash flag
  if (Boolean((window as any).__USE_HASH_ROUTER__)) {
    return true;
  }

  return false;
}

/**
 * Helper to match a slug against the 156+ tools in the registry
 */
function findMatchingTool(rawSlug: string) {
  const normalized = rawSlug
    .replace(/\.html$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();
  if (!normalized) return undefined;

  const exact = tools.find(t => t.slug.toLowerCase() === normalized);
  if (exact) return exact;

  const alphaNum = normalized.replace(/[^a-z0-9]/g, '');
  if (!alphaNum) return undefined;

  return tools.find(
    t =>
      t.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === alphaNum ||
      normalized.startsWith(t.slug.toLowerCase())
  );
}

/**
 * Helper to match a slug against tool categories
 */
function findMatchingCategorySlug(rawSlug: string): string | null {
  const normalized = rawSlug
    .replace(/\.html$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  for (const cat of categories) {
    const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    if (
      catSlug === normalized ||
      `${catSlug}-tools` === normalized ||
      cat.toLowerCase() === normalized
    ) {
      return catSlug;
    }
  }
  return null;
}

/**
 * Seamlessly migrates legacy '#/' hash links and legacy '/tools/slug' paths
 * to clean flat root-level SEO URLs ('/slug') without refreshing the page.
 */
function UrlNormalizationEffect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const cleanPath = hash.slice(2).replace(/^\//, '').replace(/^tools\//i, '');
      const target = cleanPath ? '/' + cleanPath : '/';
      window.history.replaceState(null, '', target);
      navigate(target, { replace: true });
    }
  }, [navigate]);

  // Normalize trailing slashes on non-root paths (e.g. /open-meteo-live-weather/ -> /open-meteo-live-weather)
  useEffect(() => {
    if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
      const trimmed = location.pathname.replace(/\/+$/, '');
      navigate(trimmed + location.search + location.hash, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

/**
 * Universal Index Dispatcher:
 * Handles root URL requests on Cloudflare Pages, Blogger, and standard servers.
 * Resolves ?tool=slug, ?category=slug, ?page=blog, ?blog=slug, ?page=privacy-policy
 * instantly without 404s, page reloads, or '#' hash symbols.
 */
function UniversalIndexDispatcher() {
  const [searchParams] = useSearchParams();

  // 1. Tool query: ?tool=image-resizer
  const toolSlug = searchParams.get('tool');
  if (toolSlug) {
    return <ToolPage forcedSlug={toolSlug} />;
  }

  // 2. Category query: ?category=image-tools
  const categorySlug = searchParams.get('category');
  if (categorySlug) {
    return <CategoryPage forcedSlug={categorySlug} />;
  }

  // 3. Blog post query: ?blog=post-slug
  const blogSlug = searchParams.get('blog');
  if (blogSlug) {
    return <BlogPostPage forcedSlug={blogSlug} />;
  }

  // 4. Static page queries: ?page=blog | tools | about | privacy-policy | terms | disclaimer | contact
  const pageParam = searchParams.get('page');
  if (pageParam) {
    switch (pageParam.toLowerCase()) {
      case 'tools':
      case 'all-tools':
      case 'directory':
      case 'hub':
        return <ToolsHubPage />;
      case 'blog':
        return <BlogPage />;
      case 'about':
        return <About />;
      case 'privacy-policy':
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
      case 'tos':
        return <TermsOfService />;
      case 'disclaimer':
        return <Disclaimer />;
      case 'contact':
        return <Contact />;
      case 'sitemap':
        return <HtmlSitemap />;
      case 'sabbir':
        return <AdminPage />;
      default:
        break;
    }
  }

  return <Index />;
}

/**
 * Smart SPA Link Interceptor (Zero Refresh Bridge):
 * Automatically intercepts clicks on any internal links (such as flat root-level /tool-name,
 * legacy /tools/slug, Blogger .html permalinks, /blog, /about, etc.) and routes them
 * through React Router without a browser page reload or flash.
 */
function SmartSpaLinkInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      if (anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.rel?.includes('external')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#') && !href.startsWith('#/')) return;
      if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin) {
          event.preventDefault();
          const targetPath = url.pathname + url.search + url.hash;
          navigate(targetPath);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        // Fallback to normal navigation
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [navigate]);

  return null;
}

/**
 * Legacy /tools/:slug Route Redirector:
 * Seamlessly redirects legacy `/tools/tool-name` URLs to flat root-level `/tool-name`
 * (like iLovePDF) so there is zero duplicate content and old bookmarks/links never break.
 */
function LegacyToolRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  if (!slug) {
    return <ToolsHubPage />;
  }
  const matchedTool = findMatchingTool(slug);
  if (matchedTool && !isBloggerHost()) {
    return <Navigate to={`/${matchedTool.slug}`} replace />;
  }
  return <ToolPage forcedSlug={matchedTool ? matchedTool.slug : slug} />;
}

/**
 * Root-Level Flat URL Dispatcher (`domain.com/:slug`):
 * Resolves flat root-level tool URLs (e.g. `/open-meteo-live-weather`, `/pdf-merge`),
 * directory hub aliases (`/tools`, `/directory`, `/all-tools`), category slugs (`/pdf`),
 * static page aliases, and blog posts.
 */
function RootSlugDispatcher() {
  const { slug } = useParams<{ slug?: string }>();
  const rawSlug = (slug || '').replace(/\.html$/i, '').trim();
  const lower = rawSlug.toLowerCase();

  // 1. Directory / Hub aliases
  if (
    lower === 'tools' ||
    lower === 'all-tools' ||
    lower === 'directory' ||
    lower === 'hub' ||
    lower === 'categories' ||
    lower === 'category' ||
    lower === 'index' ||
    lower === 'home'
  ) {
    return lower === 'index' || lower === 'home' ? <Index /> : <ToolsHubPage />;
  }

  // 2. Static page aliases
  if (lower === 'about' || lower === 'about-us') return <About />;
  if (lower === 'privacy-policy' || lower === 'privacy') return <PrivacyPolicy />;
  if (lower === 'terms' || lower === 'terms-of-service' || lower === 'tos') return <TermsOfService />;
  if (lower === 'disclaimer') return <Disclaimer />;
  if (lower === 'contact' || lower === 'contact-us') return <Contact />;
  if (lower === 'sitemap' || lower === 'site-map') return <HtmlSitemap />;
  if (lower === 'blog' || lower === 'blogs' || lower === 'articles') return <BlogPage />;
  if (lower === 'sabbir') return <AdminPage />;

  // 3. Direct flat root-level Tool match (e.g. /open-meteo-live-weather)
  const matchedTool = findMatchingTool(rawSlug);
  if (matchedTool) {
    return <ToolPage forcedSlug={matchedTool.slug} />;
  }

  // 4. Direct root-level Category match (e.g. /pdf, /developer, /color-image)
  const matchedCatSlug = findMatchingCategorySlug(rawSlug);
  if (matchedCatSlug) {
    return <CategoryPage forcedSlug={matchedCatSlug} />;
  }

  // 5. Fallback to UniversalCatchAll
  return <UniversalCatchAll />;
}

/**
 * Dedicated Viewer for Blogger Post Permalinks:
 * Matches /:year/:month/:postSlug (e.g. /2026/10/dicebear-robohash-avatar.html or /2026/10/article.html)
 * Dynamically resolves whether this permalink belongs to an interactive Tool or a Blog Publication.
 */
function ToolOrPostViewer() {
  const { postSlug } = useParams<{ year?: string; month?: string; postSlug?: string }>();
  const [searchParams] = useSearchParams();
  const rawSlug = (postSlug || searchParams.get('tool') || searchParams.get('blog') || '')
    .replace(/\.html$/i, '')
    .trim();

  const matchedTool = findMatchingTool(rawSlug);
  if (matchedTool) {
    return <ToolPage forcedSlug={matchedTool.slug} />;
  }

  return <BlogPostPage forcedSlug={rawSlug} />;
}

/**
 * Dedicated Viewer for Blogger Static Pages:
 * Matches /p/:pageSlug (e.g. /p/about.html, /p/privacy-policy.html, /p/terms.html, etc.)
 */
function StaticPageView() {
  const { pageSlug } = useParams<{ pageSlug?: string }>();
  const [searchParams] = useSearchParams();
  const raw = (pageSlug || searchParams.get('page') || '')
    .replace(/\.html$/i, '')
    .toLowerCase()
    .trim();

  if (raw === 'tools' || raw === 'all-tools' || raw === 'directory') return <ToolsHubPage />;
  if (raw === 'about' || raw.includes('about')) return <About />;
  if (raw === 'privacy' || raw.includes('privacy')) return <PrivacyPolicy />;
  if (raw === 'terms' || raw.includes('term') || raw.includes('tos')) return <TermsOfService />;
  if (raw === 'disclaimer' || raw.includes('disclaimer')) return <Disclaimer />;
  if (raw === 'contact' || raw.includes('contact')) return <Contact />;
  if (raw === 'blog' || raw.includes('blog')) return <BlogPage />;

  const matchedTool = findMatchingTool(raw);
  if (matchedTool) {
    return <ToolPage forcedSlug={matchedTool.slug} />;
  }

  return <UniversalCatchAll />;
}

/**
 * Universal Catch-All Route Handler:
 * Intelligently captures native Blogger permalinks, deep links, and fallback routes.
 */
function UniversalCatchAll() {
  const location = useLocation();
  const pathname = location.pathname;

  // 1. Native Blogger Static Page URLs: /p/about.html, /p/privacy-policy.html
  if (pathname.includes('/p/about')) return <About />;
  if (pathname.includes('/p/privacy')) return <PrivacyPolicy />;
  if (pathname.includes('/p/terms')) return <TermsOfService />;
  if (pathname.includes('/p/disclaimer')) return <Disclaimer />;
  if (pathname.includes('/p/contact')) return <Contact />;
  if (pathname.includes('/p/blog')) return <BlogPage />;
  if (pathname.includes('/p/tools')) return <ToolsHubPage />;

  // 2. Native Blogger Post or Page Permalinks: /2026/10/post-title.html
  const bloggerSlug = extractSlugFromBloggerPath(pathname);
  if (bloggerSlug) {
    const matchedTool = findMatchingTool(bloggerSlug);
    if (matchedTool) {
      return <ToolPage forcedSlug={matchedTool.slug} />;
    }
    return <BlogPostPage forcedSlug={bloggerSlug} />;
  }

  // 3. Deep path support when accessed directly
  const toolMatch = pathname.match(/\/tools\/([^/]+)/);
  if (toolMatch) {
    const matched = findMatchingTool(toolMatch[1]);
    return <ToolPage forcedSlug={matched ? matched.slug : toolMatch[1]} />;
  }

  const catMatch = pathname.match(/\/category\/([^/]+)/);
  if (catMatch) return <CategoryPage forcedSlug={catMatch[1]} />;

  const blogMatch = pathname.match(/\/blog\/([^/]+)/);
  if (blogMatch) return <BlogPostPage forcedSlug={blogMatch[1]} />;

  if (pathname.endsWith('/tools') || pathname.endsWith('/all-tools') || pathname.endsWith('/directory')) {
    return <ToolsHubPage />;
  }
  if (pathname.endsWith('/blog')) return <BlogPage />;
  if (pathname.endsWith('/about')) return <About />;
  if (pathname.endsWith('/privacy-policy') || pathname.endsWith('/privacy')) return <PrivacyPolicy />;
  if (pathname.endsWith('/terms')) return <TermsOfService />;
  if (pathname.endsWith('/disclaimer')) return <Disclaimer />;
  if (pathname.endsWith('/contact')) return <Contact />;
  if (pathname.endsWith('/sitemap')) return <HtmlSitemap />;
  if (pathname === '/sabbir' || pathname.endsWith('/sabbir') || pathname === '/sabbir.html' || pathname.endsWith('/sabbir.html')) {
    return <AdminPage />;
  }

  // 4. Direct slug match (e.g. /open-meteo-live-weather or /image-resizer)
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const candidate = segments[i];
    const directTool = findMatchingTool(candidate);
    if (directTool) {
      return <ToolPage forcedSlug={directTool.slug} />;
    }
    const directCat = findMatchingCategorySlug(candidate);
    if (directCat) {
      return <CategoryPage forcedSlug={directCat} />;
    }
  }

  return <NotFound />;
}

export default function App() {
  const useHash = useMemo(() => isHashRoutingRequired(), []);
  const RouterComponent = useHash ? HashRouter : BrowserRouter;

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <SiteSettingsProvider>
          <FavoritesProvider>
            <GoogleDriveProvider>
              <RouterComponent>
                <UrlNormalizationEffect />
                <SmartSpaLinkInterceptor />
                <Routes>
                  {/* Secret Admin Portal (/sabbir & /sabbir.html) - completely isolated from public SiteLayout */}
                  <Route path="sabbir" element={<AdminPage />} />
                  <Route path="sabbir.html" element={<AdminPage />} />

                  {/* Public Site Layout with standard Header, Announcement, and Footer */}
                  <Route path="/" element={<SiteLayout />}>
                    {/* Smart Root Dispatcher: handles Home, ?tool=, ?category=, ?page=, ?blog= */}
                    <Route index element={<UniversalIndexDispatcher />} />

                    {/* All Tools Hub & Directory Routes (Never 404 on directory/root visits) */}
                    <Route path="tools" element={<ToolsHubPage />} />
                    <Route path="all-tools" element={<ToolsHubPage />} />
                    <Route path="directory" element={<ToolsHubPage />} />
                    <Route path="hub" element={<ToolsHubPage />} />
                    <Route path="categories" element={<ToolsHubPage />} />
                    <Route path="category" element={<ToolsHubPage />} />

                    {/* Legacy /tools/:slug redirect to flat /:slug */}
                    <Route path="tools/:slug" element={<LegacyToolRedirect />} />

                    {/* Category & Blog Routes */}
                    <Route path="category/:slug" element={<CategoryPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogPostPage />} />

                    {/* Static Pages */}
                    <Route path="about" element={<About />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="terms" element={<TermsOfService />} />
                    <Route path="disclaimer" element={<Disclaimer />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="sitemap" element={<HtmlSitemap />} />

                    {/* Official Blogger Post Permalinks: /:year/:month/:postSlug (with or without .html) */}
                    <Route path=":year/:month/:postSlug" element={<ToolOrPostViewer />} />

                    {/* Official Blogger Static Pages: /p/:pageSlug (with or without .html) */}
                    <Route path="p/:pageSlug" element={<StaticPageView />} />

                    {/* Flat Root-Level Tool & Category Route (e.g. /open-meteo-live-weather) */}
                    <Route path=":slug" element={<RootSlugDispatcher />} />

                    {/* Smart Catch-All: captures any additional paths */}
                    <Route path="*" element={<UniversalCatchAll />} />
                  </Route>
                </Routes>
              </RouterComponent>
              <Toaster position="bottom-right" richColors />
            </GoogleDriveProvider>
          </FavoritesProvider>
        </SiteSettingsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
