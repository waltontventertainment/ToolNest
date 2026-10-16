import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Search,
  X,
  LayoutGrid,
  List,
  ArrowDownAZ,
  FolderOpen,
} from 'lucide-react';
import { tools, categories } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ToolCard } from '../components/ToolCard';
import { AppLauncherCard } from '../components/AppLauncherCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { ToolsHubPage } from './ToolsHubPage';
import { CATEGORY_SEO_DATA } from '../lib/seoHelper';
import { getCategoryUrl, getToolUrl, getToolsHubUrl } from '../lib/appUrls';
import { useLocalStorage } from '../lib/toolkit';

export const CategoryPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const slug = (forcedSlug || routeSlug || searchParams.get('category') || '').toLowerCase().trim();

  const { settings } = useSiteSettings();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'az'>('featured');
  const [pcViewMode, setPcViewMode] = useLocalStorage<'grid' | 'compact'>('toolzaro_pc_view_mode', 'grid');

  // Find real category name
  const categoryName = categories.find(c => {
    const catSlug = c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    return catSlug === slug || `${catSlug}-tools` === slug || c.toLowerCase() === slug;
  });

  const activeToolsList = useMemo(() => {
    return getEffectiveTools(tools, settings.toolOverrides, false);
  }, [settings.toolOverrides]);

  const orderedCategories = useMemo(() => {
    const desiredOrder = [
      'App',
      'PDF', 'Text',
      'Developer', 'Converters', 'Generators',
      'Calculators', 'Color & Image', 'QR & Barcode',
      'SEO', 'Utility', 'Fun & Viral', 'Wikipedia', 'Universal Data Suite'
    ];
    const present = desiredOrder.filter(cat => categories.includes(cat as any));
    const remainder = categories.filter(cat => !desiredOrder.includes(cat));
    return [...present, ...remainder];
  }, []);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const icons: Record<string, any> = {};
    for (const cat of orderedCategories) counts[cat] = 0;
    for (const t of activeToolsList) {
      counts[t.category] = (counts[t.category] || 0) + 1;
      if (!icons[t.category]) icons[t.category] = t.icon;
    }
    return { counts, icons };
  }, [activeToolsList, orderedCategories]);

  if (!categoryName) {
    return <ToolsHubPage />;
  }

  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const catSlug = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

  const categoryTools = activeToolsList.filter(t => t.category === categoryName);

  const filteredTools = categoryTools
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.metaDescription.toLowerCase().includes(q) ||
        t.keywords.some(k => k.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (sortBy === 'az' ? a.name.localeCompare(b.name) : 0));

  const catSeo = CATEGORY_SEO_DATA[categoryName] || {
    title: `${categoryName} Tools – ${categoryTools.length} Free Online ${categoryName} Utilities | Toolzaro`,
    description: `Explore ${categoryTools.length} free online ${categoryName} tools on Toolzaro. Instant 100% client-side browser processing with zero sign-ups or cloud uploads.`,
    keywords: [`${categoryName.toLowerCase()} tools`, 'free online utilities', 'Toolzaro'],
    editorialSummary: `Every tool in our ${categoryName} collection runs 100% locally inside your browser for instant execution and complete data privacy.`
  };

  const categoryCanonicalUrl = `${baseUrl}/${catSlug}`;

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
    <div className="space-y-6">
      <Seo
        title={catSeo.title}
        description={catSeo.description}
        keywords={catSeo.keywords}
        url={categoryCanonicalUrl}
        jsonLd={categoryJsonLd}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-border/60">
        <BreadcrumbNavigation items={[{ label: `${categoryName} Tools` }]} />
      </div>

      {/* Compact Desktop Category Header */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Layers className="w-3.5 h-3.5" />
            <span>{categoryTools.length} Free {categoryName} Utilities · 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
            {categoryName} Tools
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {catSeo.description}
          </p>
        </div>

        {/* Inline Category Search on PC */}
        <div className="w-full lg:w-80 relative shrink-0">
          <Search className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${categoryName}...`}
            className="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-background text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2-Pane Desktop Category Workspace */}
      <div className="lg:flex lg:items-start lg:gap-7">
        {/* Left Sticky Suite Switcher on PC */}
        <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-20">
          <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-xs space-y-1">
            <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Switch Category
              </span>
              <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                {orderedCategories.length}
              </span>
            </div>

            {orderedCategories.map(cat => {
              const count = categoryStats.counts[cat] || 0;
              const isSelected = categoryName === cat;
              const SampleIcon = categoryStats.icons[cat] || Layers;
              const targetSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

              return (
                <Link
                  key={cat}
                  to={getCategoryUrl(targetSlug)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors no-underline ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <SampleIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-primary/80'}`} />
                    <span className="truncate">{cat}</span>
                  </span>
                  <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-muted/80 text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </Link>
              );
            })}

            <div className="mt-3 pt-2.5 border-t border-border/60">
              <Link
                to={getToolsHubUrl()}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Full A–Z Directory</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Category Tools Grid */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Desktop Control Bar */}
          <div className="bg-card border border-border/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-display font-extrabold text-foreground">
                {categoryName} Suite
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                · {filteredTools.length} utilities
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setSortBy(prev => (prev === 'featured' ? 'az' : 'featured'))}
                className={`h-8 px-2.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  sortBy === 'az'
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
                <span>{sortBy === 'az' ? 'Sorted A–Z' : 'Featured'}</span>
              </button>

              <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-muted border border-border/80">
                <button
                  type="button"
                  onClick={() => setPcViewMode('grid')}
                  className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    pcViewMode === 'grid'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPcViewMode('compact')}
                  className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    pcViewMode === 'compact'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Compact</span>
                </button>
              </div>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            categoryName === 'App' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">
                {filteredTools.map(tool => (
                  <AppLauncherCard key={tool.slug} tool={tool} />
                ))}
              </div>
            ) : (
              <div
                className={
                  pcViewMode === 'compact'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full'
                }
              >
                {filteredTools.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} compact={pcViewMode === 'compact'} />
                ))}
              </div>
            )
          ) : (
            <div className="p-10 text-center rounded-2xl bg-card border border-dashed border-border space-y-3">
              <p className="text-sm font-bold text-foreground">No tools in {categoryName} match "{search}"</p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="btn-signature-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Editorial Overview */}
          <section className="mt-8 bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
                About Our {categoryName} Suite
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {catSeo.editorialSummary}
            </p>
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Zero server uploads · Works on desktop &amp; mobile browsers</span>
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
        </div>
      </div>

      <div className="mt-8">
        <AdSlot slot="category-bottom" format="auto" />
      </div>
    </div>
  );
};
