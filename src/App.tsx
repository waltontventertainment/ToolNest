import React, { useMemo, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { FavoritesProvider } from './context/FavoritesContext';
import { GoogleDriveProvider } from './context/GoogleDriveContext';
import { SiteLayout } from './components/SiteLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Index } from './pages/Index';
import { ToolPage } from './pages/ToolPage';
import { CategoryPage } from './pages/CategoryPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { About, PrivacyPolicy, TermsOfService, Disclaimer, Contact } from './pages/StaticPages';
import { NotFound } from './pages/NotFound';
import { isBloggerHost, extractSlugFromBloggerPath } from './lib/appUrls';
import { tools } from './lib/registry';

/**
 * Hash Routing is only strictly required for standalone offline local HTML files
 * (file:/// protocol or Android WebView content:// without any web server).
 * On Blogger, we use clean URL query routing and native Blogger permalinks (BrowserRouter)
 * so that Googlebot indexes all 160+ tools and blog posts without '#' (hash) fragments.
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

  return false;
}

/**
 * Seamlessly migrates legacy '#/' hash links to clean SEO URLs
 * without refreshing the page.
 */
function HashMigrationEffect() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const cleanPath = hash.slice(2).replace(/^\//, '');
      const target = cleanPath ? '/' + cleanPath : '/';
      window.history.replaceState(null, '', target);
    }
  }, []);

  return null;
}

/**
 * Universal Index Dispatcher:
 * Handles root URL requests on Blogger and standard servers.
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

  // 4. Static page queries: ?page=blog | about | privacy-policy | terms | disclaimer | contact
  const pageParam = searchParams.get('page');
  if (pageParam) {
    switch (pageParam) {
      case 'blog':
        return <BlogPage />;
      case 'about':
        return <About />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'disclaimer':
        return <Disclaimer />;
      case 'contact':
        return <Contact />;
      default:
        break;
    }
  }

  return <Index />;
}

/**
 * Smart SPA Link Interceptor (Option A - Zero Refresh Bridge):
 * Automatically intercepts clicks on any internal links (such as Blogger .html permalinks,
 * /tools/slug, /blog, /about, /p/about.html, etc.) and routes them through React Router
 * without a browser page reload or flash.
 */
function SmartSpaLinkInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Only handle regular left clicks without modifier keys
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

      // Ignore external tabs, downloads, or explicit external links
      if (anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.rel?.includes('external')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore anchor jumps (#top, #faq) and protocol schemes
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
      } catch (err) {
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
 * Universal Catch-All Route Handler:
 * Intelligently captures native Blogger permalinks (e.g. /2026/10/post-name.html),
 * Blogger static pages (/p/about.html), tool slugs, and standard fallback routes.
 */
function UniversalCatchAll() {
  const location = useLocation();
  const pathname = location.pathname;

  // 1. Native Blogger Post or Page Permalinks: /2026/10/post-title.html or /p/slug.html
  const bloggerSlug = extractSlugFromBloggerPath(pathname);
  if (bloggerSlug) {
    // Check if this slug matches a tool first!
    const matchedTool = tools.find(t => t.slug === bloggerSlug);
    if (matchedTool) {
      return <ToolPage forcedSlug={matchedTool.slug} />;
    }
    // Otherwise render blog post
    return <BlogPostPage forcedSlug={bloggerSlug} />;
  }

  // 2. Native Blogger Page URLs: /p/about.html, /p/privacy-policy.html
  if (pathname.includes('/p/about')) return <About />;
  if (pathname.includes('/p/privacy')) return <PrivacyPolicy />;
  if (pathname.includes('/p/terms')) return <TermsOfService />;
  if (pathname.includes('/p/disclaimer')) return <Disclaimer />;
  if (pathname.includes('/p/contact')) return <Contact />;
  if (pathname.includes('/p/blog')) return <BlogPage />;

  // 3. Deep path support when accessed directly
  const toolMatch = pathname.match(/\/tools\/([^/]+)/);
  if (toolMatch) return <ToolPage forcedSlug={toolMatch[1]} />;

  const catMatch = pathname.match(/\/category\/([^/]+)/);
  if (catMatch) return <CategoryPage forcedSlug={catMatch[1]} />;

  const blogMatch = pathname.match(/\/blog\/([^/]+)/);
  if (blogMatch) return <BlogPostPage forcedSlug={blogMatch[1]} />;

  if (pathname.endsWith('/blog')) return <BlogPage />;
  if (pathname.endsWith('/about')) return <About />;
  if (pathname.endsWith('/privacy-policy')) return <PrivacyPolicy />;
  if (pathname.endsWith('/terms')) return <TermsOfService />;
  if (pathname.endsWith('/disclaimer')) return <Disclaimer />;
  if (pathname.endsWith('/contact')) return <Contact />;

  // 4. Direct slug match (e.g. /image-resizer)
  const cleanSlug = pathname.replace(/^\/+|\/+$/g, '');
  const directTool = tools.find(t => t.slug === cleanSlug);
  if (directTool) {
    return <ToolPage forcedSlug={directTool.slug} />;
  }

  return <NotFound />;
}

export default function App() {
  const useHash = useMemo(() => isHashRoutingRequired(), []);
  const RouterComponent = useHash ? HashRouter : BrowserRouter;

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <FavoritesProvider>
          <GoogleDriveProvider>
            <RouterComponent>
              <HashMigrationEffect />
              <SmartSpaLinkInterceptor />
              <Routes>
                <Route path="/" element={<SiteLayout />}>
                  {/* Smart Root Dispatcher: handles Home, ?tool=, ?category=, ?page=, ?blog= */}
                  <Route index element={<UniversalIndexDispatcher />} />
                  
                  {/* Standard clean paths */}
                  <Route path="tools/:slug" element={<ToolPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:slug" element={<BlogPostPage />} />
                  <Route path="about" element={<About />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsOfService />} />
                  <Route path="disclaimer" element={<Disclaimer />} />
                  <Route path="contact" element={<Contact />} />
                  
                  {/* Smart Catch-All: captures Blogger /2026/10/...html and /p/...html */}
                  <Route path="*" element={<UniversalCatchAll />} />
                </Route>
              </Routes>
            </RouterComponent>
            <Toaster position="bottom-right" richColors />
          </GoogleDriveProvider>
        </FavoritesProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
