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
  onHomeClick?: () => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = '',
  onHomeClick,
}) => {
  // Automatically filter out any duplicate "Home" item passed by callers
  const cleanItems = React.useMemo(
    () => (items || []).filter(item => item && item.label.trim().toLowerCase() !== 'home'),
    [items]
  );

  if (cleanItems.length === 0) return null;

  const origin =
    typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://toolzaro.cyou';

  // Generate Schema.org JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      ...cleanItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `${origin}${item.href}` : undefined,
      })),
    ].filter(item => item.item !== undefined || item.position === cleanItems.length + 1),
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
            {onHomeClick ? (
              <button
                type="button"
                onClick={onHomeClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium transition-colors border border-border/50 cursor-pointer"
                title="Return to Toolzaro Home"
              >
                <Home className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Home</span>
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium transition-colors border border-border/50"
                title="Return to Toolzaro Home"
              >
                <Home className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Home</span>
              </Link>
            )}
          </li>

          {/* Breadcrumb Segments */}
          {cleanItems.map((item, idx) => {
            const isLast = idx === cleanItems.length - 1;

            return (
              <li key={idx} className="inline-flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium transition-colors border border-border/50 truncate max-w-[150px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="px-2.5 py-1 rounded-lg font-bold text-foreground bg-primary/10 text-primary border border-primary/20 truncate max-w-[190px] sm:max-w-xs"
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
