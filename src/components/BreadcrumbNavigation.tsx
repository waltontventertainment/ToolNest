import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://toolzaro.com';

  // Generate Schema.org JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${origin}/`,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        'item': item.href ? `${origin}${item.href}` : undefined,
      })),
    ].filter((item) => item.item !== undefined || item.position === items.length + 1),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs text-muted-foreground py-1.5 flex-wrap gap-1.5 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
          {/* Home Link */}
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium transition-colors border border-border/50"
              title="Return to Toolzaro Home"
            >
              <Home className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Home</span>
            </Link>
          </li>

          {/* Breadcrumb Segments */}
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li key={idx} className="inline-flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="px-2 py-1 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="px-2 py-1 rounded-lg font-bold text-foreground bg-primary/10 text-primary border border-primary/20 truncate max-w-[200px] sm:max-w-xs"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
