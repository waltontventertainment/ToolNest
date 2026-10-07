import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from 'lucide-react';
import { ToolDefinition } from '../lib/types';
import { cn } from '../lib/utils';
import { useFavorites } from '../context/FavoritesContext';

export const ToolCard: React.FC<{ tool: ToolDefinition }> = React.memo(({ tool }) => {
  const { isFavorite: checkFavorite, toggleFavorite: authToggleFavorite } = useFavorites();
  
  const isFavorite = checkFavorite(tool.slug);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    authToggleFavorite(tool.slug);
  };

  const Icon = tool.icon;

  return (
    <Link 
      to={`/tools/${tool.slug}`}
      className="group relative flex flex-col p-4 sm:p-5 bg-card hover:bg-card border border-border/80 hover:border-primary/50 rounded-2xl md:rounded-3xl shadow-xs hover:shadow-xl transition-all duration-200 no-underline h-full hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
    >
      {/* Top ambient highlight line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-300" />

      <div className="flex items-start justify-between mb-3.5 sm:mb-4">
        {/* Signature Multi-Layer Icon Squircle */}
        <div className="icon-squircle w-11 h-11 sm:w-12 sm:h-12 text-primary shrink-0 shadow-xs">
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Category Tag */}
          <span className="text-[10px] font-bold tracking-tight text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60">
            {tool.category}
          </span>

          {/* Signature Micro Star Button */}
          <button 
            type="button"
            onClick={toggleFavorite}
            className={cn(
              "btn-micro-star w-8 h-8 shadow-2xs cursor-pointer",
              isFavorite 
                ? "bg-amber-500/15 border-amber-300/80 dark:border-amber-700 text-amber-500 shadow-amber-500/10" 
                : "text-muted-foreground/60 hover:text-amber-500 hover:border-amber-300/50"
            )}
            aria-label={isFavorite ? "Remove from bookmarks" : "Save to bookmarks"}
            title={isFavorite ? "Bookmarked" : "Bookmark tool"}
          >
            <Star 
              className={cn(
                "w-4 h-4 transition-transform duration-200", 
                isFavorite ? "scale-105 fill-amber-500" : "hover:scale-115"
              )} 
            />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
        <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
          {tool.name}
        </h3>
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
      </div>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mt-auto leading-relaxed">
        {tool.metaDescription}
      </p>
    </Link>
  );
});
