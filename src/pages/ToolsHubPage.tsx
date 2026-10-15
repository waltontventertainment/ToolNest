import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  ArrowRight,
  X,
  Grid,
  LayoutGrid,
  List,
  ArrowDownAZ,
} from 'lucide-react';
import { tools, categories } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { getCategoryUrl, getToolUrl } from '../lib/appUrls';
import { useLocalStorage } from '../lib/toolkit';

export const ToolsHubPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'az'>('featured');
  const [pcViewMode, setPcViewMode] = useLocalStorage<'grid' | 'compact'>('toolzaro_pc_view_mode', 'grid');

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

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = activeToolsList.filter(tool => {
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
    if (sortBy === 'az') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [activeToolsList, search, selectedCategory, sortBy]);

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
    <div className="space-y-6 sm:space-y-8">
      <Seo
        title={`All ${activeToolsList.length} Online Tools Directory & Hub | Toolzaro`}
        description={`Explore our complete A-Z hub of ${activeToolsList.length} free browser utilities across ${orderedCategories.length} categories including PDF, Image, Developer, QR, and Converter tools.`}
        jsonLd={hubJsonLd}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-border/60">
        <BreadcrumbNavigation items={[{ label: 'All Tools Directory' }]} />
      </div>

      {/* Compact Desktop Hub Header */}
      <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-7 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Grid className="w-3.5 h-3.5" />
            <span>Complete Utility Hub · {activeToolsList.length} Tools in {orderedCategories.length} Categories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
            All Tools Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every utility on Toolzaro runs 100% locally in your browser with instant root-level access. Select a suite on the left or filter directly below.
          </p>
        </div>

        {/* Search Input on Right of Header on PC */}
        <div className="w-full lg:w-96 relative shrink-0">
          <Search className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeToolsList.length} utilities...`}
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

      {/* Mobile & Tablet Horizontal Category Filter (< 1024px) */}
      <div className="lg:hidden flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          <span>All Categories ({activeToolsList.length})</span>
        </button>

        {orderedCategories.map(cat => {
          const count = categoryStats.counts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* True 2-Pane Desktop Directory Layout (Sticky Sidebar + Main Workspace) */}
      <div className="lg:flex lg:items-start lg:gap-7">
        {/* Left Sticky Sidebar on PC */}
        <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-20">
          <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-xs space-y-1">
            <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Directory Suites
              </span>
              <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                {orderedCategories.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-foreground/80 hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Layers className={`w-4 h-4 shrink-0 ${selectedCategory === 'All' ? 'text-white' : 'text-primary'}`} />
                <span className="truncate">All Categories</span>
              </span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md shrink-0 ${
                selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {activeToolsList.length}
              </span>
            </button>

            <div className="my-1.5 border-t border-border/60" />

            {orderedCategories.map(cat => {
              const count = categoryStats.counts[cat] || 0;
              const isSelected = selectedCategory === cat;
              const SampleIcon = categoryStats.icons[cat] || Layers;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
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
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Hub Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Desktop Control Toolbar */}
          <div className="bg-card border border-border/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-display font-extrabold text-foreground">
                {selectedCategory === 'All' ? 'Complete Directory' : `${selectedCategory} Suite`}
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                · {filteredTools.length} tools
              </span>
              {(search.trim() !== '' || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                  <span>Reset</span>
                </button>
              )}
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

          {search.trim() || selectedCategory !== 'All' || sortBy === 'az' ? (
            filteredTools.length > 0 ? (
              <div
                className={
                  pcViewMode === 'compact'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                }
              >
                {filteredTools.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} compact={pcViewMode === 'compact'} />
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
            )
          ) : (
            <div className="space-y-10">
              {orderedCategories.map(categoryName => {
                const catTools = activeToolsList.filter(t => t.category === categoryName);
                if (catTools.length === 0) return null;
                const catSlug = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                const CategoryIcon = catTools[0]?.icon || Layers;

                return (
                  <section key={categoryName} id={`cat-${catSlug}`} className="space-y-4 scroll-mt-24">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-display font-extrabold text-foreground tracking-tight">
                          {categoryName} Tools
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground">
                          · {catTools.length}
                        </span>
                      </div>

                      <Link
                        to={getCategoryUrl(catSlug)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                      >
                        <span>Open {categoryName} Suite</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div
                      className={
                        pcViewMode === 'compact'
                          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'
                          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                      }
                    >
                      {catTools.map(tool => (
                        <ToolCard key={tool.slug} tool={tool} compact={pcViewMode === 'compact'} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <AdSlot slot="hub-bottom" format="auto" />
      </div>
    </div>
  );
};

export default ToolsHubPage;
