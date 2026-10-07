import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { FavoritesProvider } from './context/FavoritesContext';
import { GoogleDriveProvider } from './context/GoogleDriveContext';
import { SiteLayout } from './components/SiteLayout';
import { Index } from './pages/Index';
import { ToolPage } from './pages/ToolPage';
import { CategoryPage } from './pages/CategoryPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { About, PrivacyPolicy, TermsOfService, Disclaimer, Contact } from './pages/StaticPages';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <HelmetProvider>
      <FavoritesProvider>
        <GoogleDriveProvider>
          <BrowserRouter>
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
          </BrowserRouter>
          <Toaster position="bottom-right" richColors />
        </GoogleDriveProvider>
      </FavoritesProvider>
    </HelmetProvider>
  );
}

