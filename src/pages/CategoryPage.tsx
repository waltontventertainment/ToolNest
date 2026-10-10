import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Zap, Layers, ArrowRight } from 'lucide-react';
import { tools, categories } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { ToolsHubPage } from './ToolsHubPage';
import { CATEGORY_SEO_DATA } from '../lib/seoHelper';
import { getToolUrl, getToolsHubUrl } from '../lib/appUrls';

export const CategoryPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const slug = (forcedSlug || routeSlug || searchParams.get('category') || '').toLowerCase().trim();
  
  const [displayCount, setDisplayCount] = React.useState(24);
  const [incrementCount, setIncrementCount] = React.useState(24);

  React.useEffect(() => {
    const getCounts = () => {
      if (window.innerWidth >= 1280) return 24;
      if (window.innerWidth >= 1024) return 24;
      if (window.innerWidth >= 640) return 16;
      return 12;
    };
    
    const count = getCounts();
    setDisplayCount(count);
    setIncrementCount(count);
  }, []);

  // Find real category name
  const categoryName = categories.find(c => {
    const catSlug = c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    return catSlug === slug || `${catSlug}-tools` === slug || c.toLowerCase() === slug;
  });

  React.useEffect(() => {
    setDisplayCount(incrementCount);
  }, [slug, incrementCount]);

  if (!categoryName) {
    return <ToolsHubPage />;
  }

  const { settings } = useSiteSettings();
  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const catSlug = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
  const categoryTools = getEffectiveTools(tools, settings.toolOverrides, false)
    .filter(t => t.category === categoryName);
  const displayedTools = categoryTools.slice(0, displayCount);

  const catSeo = CATEGORY_SEO_DATA[categoryName] || {
    title: `${categoryName} Tools – ${categoryTools.length} Free Online ${categoryName} Utilities | Toolzaro`,
    description: `Explore ${categoryTools.length} free online ${categoryName} tools on Toolzaro. Instant 100% client-side browser processing with zero sign-ups or cloud uploads.`,
    keywords: [`${categoryName.toLowerCase()} tools`, 'free online utilities', 'Toolzaro'],
    editorialSummary: `Every tool in our ${categoryName} collection runs 100% locally inside your browser for instant execution and complete data privacy.`
  };

  const categoryCanonicalUrl = `${baseUrl}/category/${catSlug}`;

  const categoryJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: catSeo.title,
      description: catSeo.description,
      url: categoryCanonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: categoryTools.length,
        itemListElement: categoryTools.map((t, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: t.name,
          description: t.metaDescription,
          url: `${baseUrl}${getToolUrl(t.slug)}`
        }))
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'All Tools',
          item: `${baseUrl}/tools`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${categoryName} Tools`,
          item: categoryCanonicalUrl
        }
      ]
    }
  ];

  return (
    <>
      <Seo 
        title={catSeo.title}
        description={catSeo.description}
        keywords={catSeo.keywords}
        url={categoryCanonicalUrl}
        jsonLd={categoryJsonLd}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
        <BreadcrumbNavigation
          items={[
            {
              label: `${categoryName} Tools`,
            },
          ]}
        />
      </div>

      <div className="mb-6 sm:mb-8 md:mb-10 bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/25 mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>{categoryTools.length} Free {categoryName} Utilities • 100% Client-Side</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tight mb-2 sm:mb-3 text-foreground">
          {categoryName} Tools
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {catSeo.description}
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
          {displayedTools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        {displayCount < categoryTools.length && (
          <button 
            onClick={() => setDisplayCount(prev => prev + incrementCount)}
            className="mt-8 sm:mt-10 md:mt-12 px-8 py-3.5 rounded-2xl font-bold text-xs btn-signature-header hover:border-primary/50 text-foreground shadow-sm cursor-pointer"
          >
            Load More Tools ({categoryTools.length - displayCount} remaining)
          </button>
        )}
      </div>

      {/* AdSense-Friendly Editorial Overview & Category Directory */}
      <section className="mt-12 sm:mt-16 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
            About Our {categoryName} Suite
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {catSeo.editorialSummary}
        </p>
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Zero server uploads • Works on desktop &amp; mobile browsers</span>
          </div>
          <Link
            to={getToolsHubUrl()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>Explore All {tools.length} Tools in Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <div className="mt-8 sm:mt-12">
        <AdSlot slot="category-bottom" format="auto" />
      </div>
    </>
  );
};
