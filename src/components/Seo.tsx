import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  googleVerificationCode?: string;
}

export const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  url, 
  type = 'website', 
  image = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  jsonLd,
  googleVerificationCode
}) => {
  const { settings } = useSiteSettings();
  const baseUrl = settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href.replace(/#.*$/, '') : `${baseUrl}/`);

  // Parse Google Search Console verification code (handles raw token or full <meta> tag)
  const rawGsc = googleVerificationCode || settings.seo?.googleVerificationCode || '';
  const cleanGscCode = rawGsc.includes('content=')
    ? rawGsc.match(/content=["']([^"']+)["']/)?.[1] || rawGsc
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
      <link rel="canonical" href={currentUrl} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

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
