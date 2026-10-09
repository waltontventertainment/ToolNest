import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  url, 
  type = 'website', 
  image = 'https://toolnest.com/og-image.jpg',
  jsonLd 
}) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href.replace(/#.*$/, '') : 'https://toolzaro.blogspot.com/');

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

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
