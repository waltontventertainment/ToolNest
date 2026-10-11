import React, { useState } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { 
  ChevronRight, 
  HelpCircle, 
  Star, 
  Share2, 
  Check, 
  ArrowLeft,
  Cpu,
  Zap,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Info
} from 'lucide-react';
import { tools, preloadToolBySlug } from '../lib/registry';
import { TOOL_DOCS_BY_SLUG } from '../lib/registryDocs';
import { getToolKnowledge } from '../lib/toolKnowledgeBase';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { useFavorites } from '../context/FavoritesContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { toast } from 'sonner';
import { getEffectiveTool } from '../lib/toolOverrides';
import { getToolUrl, getCategoryUrl } from '../lib/appUrls';
import { buildToolSeoTitle, buildToolSeoDescription, buildToolSeoKeywords } from '../lib/seoHelper';
import { NotFound } from './NotFound';

export const ToolPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const rawSlug = forcedSlug || routeSlug || searchParams.get('tool') || '';
  const cleanSlug = rawSlug.replace(/\.html$/i, '').replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  const { settings } = useSiteSettings();
  const rawBaseTool = tools.find(
    t =>
      t.slug.toLowerCase() === cleanSlug ||
      t.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug.replace(/[^a-z0-9]/g, '')
  );
  const rawDocs = rawBaseTool ? TOOL_DOCS_BY_SLUG[rawBaseTool.slug] : undefined;
  const baseTool = rawBaseTool && rawDocs
    ? {
        ...rawBaseTool,
        intro: rawBaseTool.intro || rawDocs.intro,
        howTo: rawBaseTool.howTo?.length ? rawBaseTool.howTo : rawDocs.howTo,
        faq: rawBaseTool.faq?.length ? rawBaseTool.faq : rawDocs.faq,
      }
    : rawBaseTool;
  const tool = baseTool ? getEffectiveTool(baseTool, settings.toolOverrides) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const { isFavorite: checkFavorite, toggleFavorite: authToggleFavorite } = useFavorites();

  if (!tool) {
    return <NotFound />;
  }

  // Trigger chunk preload immediately on render
  preloadToolBySlug(tool.slug);

  const isFavorite = checkFavorite(tool.slug);
  const knowledge = getToolKnowledge(tool);

  const toggleFavorite = () => {
    authToggleFavorite(tool.slug);
  };

  const copyToolLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Tool link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const { Component } = tool;
  const baseUrl = (settings.seo?.canonicalBaseUrl || 'https://toolzaro.cyou').replace(/\/+$/, '');
  const siteName = settings.branding?.siteName || 'Toolzaro';
  const catSlug = tool.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
  const toolCanonicalUrl = `${baseUrl}/${tool.slug}`;
  const seoTitle = buildToolSeoTitle(tool, siteName);
  const seoDescription = buildToolSeoDescription(tool, siteName);
  const seoKeywords = buildToolSeoKeywords(tool, siteName);

  // Rich Schema.org structured data (WebApplication, BreadcrumbList, FAQPage, HowTo)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "headline": seoTitle,
    "description": seoDescription,
    "url": toolCanonicalUrl,
    "applicationCategory": "BrowserApplication",
    "applicationSubCategory": tool.category,
    "operatingSystem": "All",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript and modern HTML5 browser",
    "featureList": knowledge.features.map(f => f.title),
    "author": {
      "@type": "Organization",
      "name": siteName,
      "url": `${baseUrl}/`
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${baseUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${tool.category} Tools`,
        "item": `${baseUrl}/${catSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.name,
        "item": toolCanonicalUrl
      }
    ]
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...(tool.faq || []), ...knowledge.extendedFaqs].map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${tool.name} online`,
    "description": seoDescription,
    "step": tool.howTo.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step
    }))
  };

  return (
    <>
      <Seo 
        title={seoTitle} 
        description={seoDescription} 
        keywords={seoKeywords}
        url={toolCanonicalUrl}
        jsonLd={[jsonLd, breadcrumbLd, faqLd, howToLd]}
      />
      
      {/* Breadcrumbs & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/60">
        <BreadcrumbNavigation
          items={[
            {
              label: tool.category,
              href: getCategoryUrl(tool.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')),
            },
            {
              label: tool.name,
            },
          ]}
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleFavorite}
            className={`btn-signature-header h-9 px-3 sm:px-3.5 gap-2 text-xs font-semibold cursor-pointer transition-all ${
              isFavorite
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className={`w-4 h-4 transition-transform hover:scale-115 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-amber-500/80'}`} />
            <span>{isFavorite ? 'Saved' : 'Bookmark'}</span>
          </button>

          <button
            onClick={copyToolLink}
            className="btn-signature-header h-9 px-3 sm:px-3.5 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Compact Desktop Studio Header & Tool Intro */}
      <div className="mb-5 sm:mb-6 bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="icon-squircle w-12 h-12 sm:w-13 sm:h-13 text-primary shrink-0 shadow-xs">
            <tool.icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight text-foreground">
                {tool.name}
              </h1>
              {tool.customBadge && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                  ★ {tool.customBadge}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 max-w-3xl">
              {tool.intro}
            </p>
          </div>
        </div>

        {/* Desktop Trust Indicator Pill */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 text-xs font-semibold text-muted-foreground bg-secondary/50 border border-border/60 px-3 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>100% Client-Side Sandbox</span>
        </div>
      </div>

      {/* Admin Custom Injected Code (if any) */}
      {tool.customCode && (
        <div className="mb-6 tool-custom-injected-snippet">
          <div dangerouslySetInnerHTML={{ __html: tool.customCode }} />
        </div>
      )}

      {/* Main Interactive Tool Component or Disabled Notice */}
      {tool.disabled ? (
        <div className="p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-3 mb-10">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Tool Temporarily Offline for Upgrades</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The administrator has temporarily paused this tool for scheduled maintenance. Please check back shortly or explore our other available utilities.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
          >
            Browse Other Tools →
          </Link>
        </div>
      ) : (
        <section className="mb-8 sm:mb-10 md:mb-12 min-h-[280px]">
          <React.Suspense
            fallback={
              <div className="w-full rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-8 space-y-5 animate-pulse">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-6 w-48 rounded-lg bg-muted" />
                  <div className="h-8 w-24 rounded-xl bg-muted" />
                </div>
                <div className="h-44 sm:h-56 w-full rounded-2xl bg-muted/70 border border-border/50" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-36 rounded-xl bg-primary/20" />
                  <div className="h-10 w-28 rounded-xl bg-muted" />
                </div>
              </div>
            }
          >
            <Component />
          </React.Suspense>
        </section>
      )}

      {/* Mid-Page Ad Slot (Compliant content-to-ad ratio) */}
      <div className="my-6 sm:my-8">
        <AdSlot slot="tool-mid" format="horizontal" />
      </div>

      {/* High-Value Editorial Documentation Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          {/* Section 1: Technical Overview & Architecture */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Overview & Technical Principles
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {knowledge.technicalOverview}
            </p>
            <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">Privacy & Zero-Knowledge Architecture</p>
                <p className="text-muted-foreground">
                  Toolzaro executes calculations, file parsing, and transformations directly inside your browser’s isolated JavaScript sandbox. Zero inputs are stored on remote servers or logged to third-party databases.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Step-by-Step Workflow Guide */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Step-by-Step Practical Guide
              </h2>
            </div>
            <ol className="space-y-3 pt-1">
              {tool.howTo.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center font-mono text-[11px] mt-0.5 border border-primary/20">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 text-foreground/90 font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Section 3: Key Features & Technical Specifications */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Key Features & Capabilities
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {knowledge.features.map((feat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat.title}</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Real-World Industry Use Cases */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Real-World Applications & Use Cases
              </h2>
            </div>
            <div className="space-y-3 pt-1">
              {knowledge.useCases.map((uc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {uc.audience}
                    </span>
                    <h3 className="text-xs font-bold text-foreground">{uc.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {uc.scenario}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Best Practices & Pro-Tips */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Best Practices & Pro-Tips
              </h2>
            </div>
            <div className="space-y-3 pt-1">
              {knowledge.bestPractices.map((bp, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-foreground">{bp.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{bp.advice}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Interactive FAQ Accordion */}
          <section className="bg-card border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-2.5 pt-1">
              {knowledge.extendedFaqs.map((f, idx) => (
                <div key={idx} className="border border-border/80 rounded-xl overflow-hidden bg-background/50">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <span className="pr-2">{f.q}</span>
                    <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center shrink-0">
                      <HelpCircle className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-3.5 text-xs text-muted-foreground border-t border-border/50 pt-2.5 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Sticky PC Sidebar Column */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>More {tool.category} Tools</span>
              </h3>
              <Link
                to={getCategoryUrl(catSlug)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <ul className="space-y-1">
              {tools.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 8).map(t => (
                <li key={t.slug}>
                  <Link 
                    to={getToolUrl(t.slug)} 
                    onMouseEnter={() => preloadToolBySlug(t.slug)}
                    onTouchStart={() => preloadToolBySlug(t.slug)}
                    className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-secondary/60 border border-transparent hover:border-border/60"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <t.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{t.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <AdSlot slot="tool-sidebar" format="rectangle" />
        </aside>
      </div>
    </>
  );
};

export default ToolPage;
