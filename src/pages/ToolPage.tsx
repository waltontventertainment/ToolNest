import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, HelpCircle, Star, Share2, Check, ArrowLeft } from 'lucide-react';
import { tools } from '../lib/registry';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from 'sonner';

export const ToolPage: React.FC = () => {
  const { slug } = useParams();
  const tool = tools.find(t => t.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const { isFavorite: checkFavorite, toggleFavorite: authToggleFavorite } = useFavorites();

  if (!tool) {
    return <Navigate to="/404" replace />;
  }

  const isFavorite = checkFavorite(tool.slug);

  const toggleFavorite = () => {
    authToggleFavorite(tool.slug);
    if (isFavorite) {
      toast.info('Removed from saved tools');
    } else {
      toast.success('Saved to bookmarked tools');
    }
  };

  const copyToolLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Tool link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const { Component } = tool;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.metaDescription,
    "applicationCategory": "BrowserApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      <Seo 
        title={tool.metaTitle} 
        description={tool.metaDescription} 
        jsonLd={[jsonLd, faqLd]}
      />
      
      {/* Breadcrumbs & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
        <nav className="flex items-center text-xs font-medium text-muted-foreground flex-wrap gap-1.5">
          <Link to="/" className="btn-signature-header h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5 text-primary" /> <span>All Tools</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <Link to={`/category/${tool.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:text-primary transition-colors">
            {tool.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground font-bold">{tool.name}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className={`btn-signature-header h-9 px-3.5 gap-2 text-xs font-semibold cursor-pointer ${
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
            className="btn-signature-header h-9 px-3.5 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="icon-squircle w-14 h-14 text-primary shrink-0 shadow-sm">
            <tool.icon className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
              {tool.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight text-foreground mt-1">
              {tool.name}
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          {tool.intro}
        </p>
      </div>

      {/* Main Tool Component View */}
      <section className="mb-16">
        <Component />
      </section>

      <AdSlot slot="tool-mid" className="mb-12 min-h-[90px] w-full" />

      {/* Instructions & FAQs */}
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl">
        <div className="md:col-span-2 space-y-10">
          {/* How to use */}
          <section className="bg-card border border-border/80 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 font-display">How to use {tool.name}</h2>
            <ol className="space-y-3">
              {tool.howTo.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg icon-squircle text-primary font-bold flex items-center justify-center font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section className="bg-card border border-border/80 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 font-display">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {tool.faq.map((f, idx) => (
                <div key={idx} className="border border-border/80 rounded-xl overflow-hidden bg-background/50">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <span className="pr-2">{f.q}</span>
                    <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center shrink-0">
                      <HelpCircle className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-3 text-xs text-muted-foreground border-t border-border/50 pt-2 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">More {tool.category} Tools</h3>
            <ul className="space-y-2">
              {tools.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 6).map(t => (
                <li key={t.slug}>
                  <Link to={`/tools/${t.slug}`} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-secondary/50">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <t.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{t.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <AdSlot slot="tool-sidebar" className="min-h-[250px] w-full" />
        </aside>
      </div>
    </>
  );
};

