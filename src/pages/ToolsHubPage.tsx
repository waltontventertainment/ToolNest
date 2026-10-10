import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, Sparkles, ArrowRight, X, Grid, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { tools, categories } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { getCategoryUrl, getToolUrl } from '../lib/appUrls';

export const ToolsHubPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activeToolsList = useMemo(() => {
    return getEffectiveTools(tools, settings.toolOverrides, false);
  }, [settings.toolOverrides]);

  const orderedCategories = useMemo(() => {
    const desiredOrder = [
      'PDF', 'Text',
      'Developer', 'Converters', 'Generators',
      'Calculators', 'Color & Image', 'QR & Barcode',
      'SEO', 'Utility', 'Wikipedia', 'Universal Data Suite'
    ];
    const present = desiredOrder.filter(cat => categories.includes(cat as any));
    const remainder = categories.filter(cat => !desiredOrder.includes(cat));
    return [...present, ...remainder];
  }, []);

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeToolsList.filter(tool => {
      const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.metaDescription.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [activeToolsList, search, selectedCategory]);

  const baseUrl = settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou';

  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `All ${activeToolsList.length} Free Online Tools Directory | Toolzaro`,
    description: `Browse the complete directory of ${activeToolsList.length} browser-based developer, PDF, image, converter, and utility tools on Toolzaro.`,
    url: `${baseUrl}/tools`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: activeToolsList.length,
      itemListElement: activeToolsList.slice(0, 50).map((t, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: t.name,
        url: `${baseUrl}${getToolUrl(t.slug)}`
      }))
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <Seo
        title={`All ${activeToolsList.length} Online Tools Directory & Hub | Toolzaro`}
        description={`Explore our complete A-Z hub of ${activeToolsList.length} free browser utilities across ${orderedCategories.length} categories including PDF, Image, Developer, QR, and Converter tools.`}
        jsonLd={hubJsonLd}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
        <BreadcrumbNavigation
          items={[
            { label: 'All Tools Directory' }
          ]}
        />
      </div>

      {/* Hub Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/25">
            <Grid className="w-3.5 h-3.5" />
            <span>Complete Utility Hub • {activeToolsList.length} Tools in {orderedCategories.length} Categories</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground">
            All Tools Directory
          </h1>

          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Every utility on Toolzaro runs 100% locally in your browser with instant root-level access. Select any category below or search directly to launch a tool.
          </p>

          {/* Search Input */}
          <div className="pt-2 max-w-xl relative">
            <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none mt-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter ${activeToolsList.length} tools by name, keyword, or function...`}
              className="w-full h-12 sm:h-13 pl-12 pr-10 rounded-2xl border-2 border-border bg-background/95 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-xs transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Jump to Category</span>
          </h2>
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Show All Categories ({activeToolsList.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <span>All Categories</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {activeToolsList.length}
            </span>
          </button>

          {orderedCategories.map(cat => {
            const count = activeToolsList.filter(t => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span>{cat}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Sections (iLovePDF / Hub Layout) when showing All without search, or Filtered Grid */}
      {search.trim() || selectedCategory !== 'All' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
              {selectedCategory === 'All' ? 'Matching Tools' : `${selectedCategory} Tools`}{' '}
              <span className="text-sm font-mono text-muted-foreground">({filteredTools.length})</span>
            </h2>
            {(search || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
              <p className="text-sm font-bold text-foreground">No tools found matching "{search}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="btn-signature-primary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                Show All {activeToolsList.length} Tools
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          {orderedCategories.map(categoryName => {
            const catTools = activeToolsList.filter(t => t.category === categoryName);
            if (catTools.length === 0) return null;
            const catSlug = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            const CategoryIcon = catTools[0]?.icon || Layers;

            return (
              <section key={categoryName} id={`cat-${catSlug}`} className="space-y-4 scroll-mt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-display font-extrabold text-foreground tracking-tight">
                          {categoryName} Tools
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-secondary text-muted-foreground border border-border/60">
                          {catTools.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={getCategoryUrl(catSlug)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                  >
                    <span>View {categoryName} Category Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {catTools.map(tool => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <AdSlot slot="hub-bottom" format="auto" />
      </div>
    </div>
  );
};

export default ToolsHubPage;
