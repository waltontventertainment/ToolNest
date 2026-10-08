import React, { useMemo } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
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

/**
 * Intelligent Router Selection:
 * Standalone offline HTML files, Android file:/// or content:// URLs,
 * and static blog hosts like Blogger (Blogger Pages/Posts) cannot handle
 * HTML5 History API routing (BrowserRouter) without a server routing all paths to /index.html.
 * In those environments, HashRouter is mandatory to ensure all 160+ tools and subpages
 * function flawlessly without 404 errors or security restrictions.
 */
function isHashRoutingRequired(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Direct file or content protocol (local file on Android Chrome / Desktop)
  if (
    window.location.protocol === 'file:' ||
    window.location.protocol === 'content:' ||
    window.location.protocol === ''
  ) {
    return true;
  }

  // 2. Blogger / Blogspot hosting
  if (
    window.location.hostname.includes('blogspot.') ||
    window.location.hostname.includes('blogger.')
  ) {
    return true;
  }

  // 3. GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return true;
  }

  // 4. File ending with .html (e.g., toolzaro-single.html or index.html)
  if (
    window.location.pathname.endsWith('.html') ||
    window.location.pathname.includes('.html')
  ) {
    return true;
  }

  // 5. Mobile storage or download paths
  if (
    window.location.pathname.includes('/storage/') ||
    window.location.pathname.includes('/Download/') ||
    window.location.pathname.includes('/Android/')
  ) {
    return true;
  }

  // 6. Existing hash routing in URL
  if (window.location.hash.startsWith('#/')) {
    return true;
  }

  // 7. Single-file build or environment flag
  if (
    (import.meta as any).env?.BUILD_SINGLEFILE === 'true' ||
    (import.meta as any).env?.VITE_ROUTER_MODE === 'hash'
  ) {
    return true;
  }

  return false;
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
              <Routes>
                <Route path="/" element={<SiteLayout />}>
                  <Route index element={<Index />} />
                  <Route path="tools/:slug" element={<ToolPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:slug" element={<BlogPostPage />} />
                  <Route path="about" element={<About />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsOfService />} />
                  <Route path="disclaimer" element={<Disclaimer />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
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
