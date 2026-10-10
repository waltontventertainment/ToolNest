import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[] | string;
  url?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  googleVerificationCode?: string;
}

export const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  keywords,
  url, 
  type = 'website', 
  image,
  noindex = false,
  jsonLd,
  googleVerificationCode
}) => {
  const { settings } = useSiteSettings();
  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const siteName = settings.branding?.siteName || 'Toolzaro';

  const currentUrl = React.useMemo(() => {
    if (url) return url;
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '');
      return `${baseUrl}${cleanPath}`;
    }
    return `${baseUrl}/`;
  }, [url, baseUrl]);

  const resolvedImage = image || settings.seo?.defaultOgImage || `${baseUrl}/og-banner.jpg`;
  const keywordsContent = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || 'Toolzaro, free online tools, developer utilities, pdf tools, image compressor, qr generator, converters';

  // Parse Google Search Console verification code (handles raw token or full <meta> tag)
  const rawGsc = googleVerificationCode || settings.seo?.googleVerificationCode || '';
  const cleanGscCode = rawGsc.includes('content=')
    ? rawGsc.match(/content=["']([^"']+)["']/)?.[1] || ''
    : rawGsc.endsWith('.html')
    ? ''
    : rawGsc.replace(/<[^>]*>/g, '').trim();

  // Parse Bing Webmaster verification code
  const rawBing = settings.seo?.bingVerificationCode || '';
  const cleanBingCode = rawBing.includes('content=')
    ? rawBing.match(/content=["']([^"']+)["']/)?.[1] || rawBing
    : rawBing.replace(/<[^>]*>/g, '').trim();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsContent} />
      <link rel="canonical" href={currentUrl} />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      {/* OpenGraph Social Cards */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={title} />

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Google Search Console Verification Meta Tag */}
      {cleanGscCode && (
        <meta name="google-site-verification" content={cleanGscCode} />
      )}

      {/* Bing Webmaster Tools Verification Meta Tag */}
      {cleanBingCode && (
        <meta name="msvalidate.01" content={cleanBingCode} />
      )}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
