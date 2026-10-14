import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from 'lucide-react';
import { ToolDefinition } from '../lib/types';
import { cn } from '../lib/utils';
import { useFavorites } from '../context/FavoritesContext';
import { getToolUrl } from '../lib/appUrls';
import { preloadToolBySlug } from '../lib/registry';
import { buildToolSeoDescription } from '../lib/seoHelper';

const CATEGORY_VISUAL_THEMES: Record<string, { iconBox: string; categoryText: string }> = {
  'PDF': {
    iconBox: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30 border border-white/25',
    categoryText: 'text-rose-700 dark:text-rose-400 font-extrabold',
  },
  'Color & Image': {
    iconBox: 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 text-white shadow-md shadow-cyan-500/30 border border-white/25',
    categoryText: 'text-cyan-800 dark:text-cyan-400 font-extrabold',
  },
  'Developer': {
    iconBox: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-white/25',
    categoryText: 'text-indigo-800 dark:text-indigo-400 font-extrabold',
  },
  'QR & Barcode': {
    iconBox: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/30 border border-white/25',
    categoryText: 'text-amber-800 dark:text-amber-400 font-extrabold',
  },
  'Text': {
    iconBox: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 border border-white/25',
    categoryText: 'text-violet-800 dark:text-violet-400 font-extrabold',
  },
  'Generators': {
    iconBox: 'bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 text-white shadow-md shadow-purple-500/30 border border-white/25',
    categoryText: 'text-purple-800 dark:text-purple-400 font-extrabold',
  },
  'Converters': {
    iconBox: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-500/30 border border-white/25',
    categoryText: 'text-emerald-800 dark:text-emerald-400 font-extrabold',
  },
  'Calculators': {
    iconBox: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-white/25',
    categoryText: 'text-blue-800 dark:text-blue-400 font-extrabold',
  },
  'SEO': {
    iconBox: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-600 text-white shadow-md shadow-teal-500/30 border border-white/25',
    categoryText: 'text-teal-800 dark:text-teal-400 font-extrabold',
  },
  'Utility': {
    iconBox: 'bg-gradient-to-br from-fuchsia-500 via-pink-600 to-rose-600 text-white shadow-md shadow-fuchsia-500/30 border border-white/25',
    categoryText: 'text-fuchsia-800 dark:text-fuchsia-400 font-extrabold',
  },
  'Universal Data Suite': {
    iconBox: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-500/30 border border-white/25',
    categoryText: 'text-sky-800 dark:text-sky-400 font-extrabold',
  },
  'Wikipedia': {
    iconBox: 'bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-orange-500/30 border border-white/25',
    categoryText: 'text-orange-800 dark:text-orange-400 font-extrabold',
  },
  'Fun & Viral': {
    iconBox: 'bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 text-white shadow-md shadow-pink-500/30 border border-white/25',
    categoryText: 'text-pink-800 dark:text-pink-400 font-extrabold',
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
    iconBox: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 border border-white/25',
    categoryText: 'text-indigo-800 dark:text-indigo-400 font-extrabold',
  };

  const displayDescription = buildToolSeoDescription(tool);

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
            <Icon className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
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
              {displayDescription}
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
          <Icon className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
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
        {displayDescription}
      </p>
    </Link>
  );
});
