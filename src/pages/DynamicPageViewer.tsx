import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { getPageBySlug, DynamicPage } from '../lib/pagesService';
import { getCustomTools, CustomAdminTool } from '../lib/customToolsService';
import { CustomToolRunner } from '../components/admin/CustomToolRunner';
import { BlogPostPage } from './BlogPostPage';
import { NotFound } from './NotFound';
import { RefreshCw, FileText } from 'lucide-react';

export const DynamicPageViewer: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = (forcedSlug || routeSlug || '').toLowerCase().trim();

  const [page, setPage] = useState<DynamicPage | null>(null);
  const [customTool, setCustomTool] = useState<CustomAdminTool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);

      // Check if it's a custom tool first
      try {
        const tools = await getCustomTools();
        const foundTool = tools.find(t => t.slug.toLowerCase() === slug && t.enabled);
        if (foundTool && isMounted) {
          setCustomTool(foundTool);
          setLoading(false);
          return;
        }
      } catch {}

      // Check if it's a dynamic page
      try {
        const foundPage = await getPageBySlug(slug);
        if (foundPage && isMounted) {
          setPage(foundPage);
          setLoading(false);
          return;
        }
      } catch {}

      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        <span>Loading...</span>
      </div>
    );
  }

  // Render Custom Tool in responsive sandbox
  if (customTool) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Seo
          title={`${customTool.metaTitle || customTool.name} – Toolzaro`}
          description={customTool.metaDescription || customTool.description}
          url={`https://toolzaro.cyou/${customTool.slug}`}
        />

        <BreadcrumbNavigation items={[{ label: 'Tools', href: '/tools' }, { label: customTool.name }]} />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
            {customTool.name}
          </h1>
          {customTool.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {customTool.description}
            </p>
          )}
        </div>

        <CustomToolRunner
          customHtml={customTool.customHtml}
          name={customTool.name}
          description={customTool.description}
        />
      </div>
    );
  }

  // Render Dynamic Page
  if (page) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Seo
          title={`${page.metaTitle || page.title} – Toolzaro`}
          description={page.metaDescription || page.excerpt}
          url={`https://toolzaro.cyou/${page.slug}`}
        />

        <BreadcrumbNavigation items={[{ label: page.title }]} />

        <header className="space-y-2 border-b border-border/80 pb-6">
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {page.excerpt}
            </p>
          )}
          <p className="text-xs text-muted-foreground font-mono">
            Last Updated: {new Date(page.updatedAt || page.publishedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {page.coverImage && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xs">
            <img src={page.coverImage} alt={page.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="prose dark:prose-invert max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content || '<p>Content in progress...</p>' }}
        />
      </div>
    );
  }

  return <BlogPostPage forcedSlug={slug} />;
};
