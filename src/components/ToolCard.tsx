import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from 'lucide-react';
import { ToolDefinition } from '../lib/types';
import { cn } from '../lib/utils';
import { useFavorites } from '../context/FavoritesContext';
import { getToolUrl } from '../lib/appUrls';
import { preloadToolBySlug } from '../lib/registry';

const CATEGORY_VISUAL_THEMES: Record<string, { iconBox: string; categoryText: string }> = {
  'PDF': {
    iconBox: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25',
    categoryText: 'text-rose-700 dark:text-rose-300',
  },
  'Color & Image': {
    iconBox: 'bg-cyan-500/12 text-cyan-800 dark:text-cyan-300 border-cyan-500/25',
    categoryText: 'text-cyan-800 dark:text-cyan-300',
  },
  'Developer': {
    iconBox: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    categoryText: 'text-indigo-700 dark:text-indigo-300',
  },
  'QR & Barcode': {
    iconBox: 'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/25',
    categoryText: 'text-amber-800 dark:text-amber-300',
  },
  'Text': {
    iconBox: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25',
    categoryText: 'text-violet-700 dark:text-violet-300',
  },
  'Generators': {
    iconBox: 'bg-purple-500/12 text-purple-700 dark:text-purple-300 border-purple-500/25',
    categoryText: 'text-purple-700 dark:text-purple-300',
  },
  'Converters': {
    iconBox: 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
    categoryText: 'text-emerald-800 dark:text-emerald-300',
  },
  'Calculators': {
    iconBox: 'bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25',
    categoryText: 'text-blue-700 dark:text-blue-300',
  },
  'SEO': {
    iconBox: 'bg-teal-500/12 text-teal-800 dark:text-teal-300 border-teal-500/25',
    categoryText: 'text-teal-800 dark:text-teal-300',
  },
  'Utility': {
    iconBox: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/25',
    categoryText: 'text-fuchsia-700 dark:text-fuchsia-300',
  },
  'Universal Data Suite': {
    iconBox: 'bg-sky-500/12 text-sky-800 dark:text-sky-300 border-sky-500/25',
    categoryText: 'text-sky-800 dark:text-sky-300',
  },
  'Wikipedia': {
    iconBox: 'bg-orange-500/12 text-orange-800 dark:text-orange-300 border-orange-500/25',
    categoryText: 'text-orange-800 dark:text-orange-300',
  },
  'Fun & Viral': {
    iconBox: 'bg-pink-500/12 text-pink-700 dark:text-pink-300 border-pink-500/25',
    categoryText: 'text-pink-700 dark:text-pink-300',
  },
};

export const ToolCard: React.FC<{ tool: ToolDefinition; compact?: boolean }> = React.memo(({ tool, compact = false }) => {
  const { isFavorite: checkFavorite, toggleFavorite: authToggleFavorite } = useFavorites();
  
  const isFavorite = checkFavorite(tool.slug);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    authToggleFavorite(tool.slug);
  };

  const handlePreload = () => {
    preloadToolBySlug(tool.slug);
    import('../pages/ToolPage').catch(() => {});
  };

  const Icon = tool.icon;
  const theme = CATEGORY_VISUAL_THEMES[tool.category] || {
    iconBox: 'bg-primary/12 text-primary border-primary/25',
    categoryText: 'text-primary',
  };

  if (compact) {
    return (
      <Link
        to={getToolUrl(tool.slug)}
        onMouseEnter={handlePreload}
        onTouchStart={handlePreload}
        className="group relative flex items-center justify-between gap-3 p-3.5 bg-card border border-border/80 hover:border-primary/50 rounded-2xl shadow-2xs hover:shadow-md transition-[transform,border-color,box-shadow] duration-150 no-underline hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105", theme.iconBox)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors tracking-tight truncate">
                {tool.name}
              </h3>
              <span className={cn("text-[10px] font-bold shrink-0", theme.categoryText)}>
                · {tool.category}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {tool.metaDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleFavorite}
            className={cn(
              "btn-micro-star w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl cursor-pointer",
              isFavorite
                ? "bg-amber-500/15 border-amber-300/80 dark:border-amber-700 text-amber-500"
                : "text-muted-foreground/60 hover:text-amber-500 hover:border-amber-300/50"
            )}
            aria-label={isFavorite ? `Remove ${tool.name} from bookmarks` : `Save ${tool.name} to bookmarks`}
            title={isFavorite ? "Bookmarked" : "Bookmark tool"}
          >
            <Star className={cn("w-4 h-4", isFavorite ? "fill-amber-500" : "")} />
          </button>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={getToolUrl(tool.slug)}
      onMouseEnter={handlePreload}
      onTouchStart={handlePreload}
      className="group relative flex flex-col p-4 sm:p-5 bg-card border border-border/80 hover:border-primary/50 rounded-2xl shadow-xs hover:shadow-lg transition-[transform,border-color,box-shadow] duration-150 no-underline h-full hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3.5">
        {/* Category-Themed Icon Squircle */}
        <div className={cn("w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105", theme.iconBox)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Clean Category Label */}
          <span className={cn("text-[11px] font-bold tracking-tight px-1.5 py-0.5", theme.categoryText)}>
            {tool.category}
          </span>

          {/* Signature Micro Star Button */}
          <button 
            type="button"
            onClick={toggleFavorite}
            className={cn(
              "btn-micro-star w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl shadow-2xs cursor-pointer",
              isFavorite 
                ? "bg-amber-500/15 border-amber-300/80 dark:border-amber-700 text-amber-500 shadow-amber-500/10" 
                : "text-muted-foreground/60 hover:text-amber-500 hover:border-amber-300/50"
            )}
            aria-label={isFavorite ? `Remove ${tool.name} from bookmarks` : `Save ${tool.name} to bookmarks`}
            title={isFavorite ? "Bookmarked" : "Bookmark tool"}
          >
            <Star 
              className={cn(
                "w-4 h-4 transition-transform duration-150", 
                isFavorite ? "scale-105 fill-amber-500" : "hover:scale-110"
              )} 
            />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
            {tool.name}
          </h3>
          {(tool as any).customBadge && (
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 shrink-0">
              {(tool as any).customBadge}
            </span>
          )}
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
      </div>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mt-auto leading-relaxed">
        {tool.metaDescription}
      </p>
    </Link>
  );
});
