import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Sparkles } from 'lucide-react';
import { ToolDefinition } from '../lib/types';
import { useFavorites } from '../context/FavoritesContext';
import { getToolUrl } from '../lib/appUrls';
import { preloadToolBySlug } from '../lib/registry';

// Vibrant OS-grade application squircle gradient themes
const APP_ICON_PALETTES: Record<string, { bg: string; shadow: string; glow: string }> = {
  'pdf-editor': {
    bg: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700',
    shadow: 'shadow-lg shadow-rose-500/25 dark:shadow-rose-900/30',
    glow: 'from-rose-400/20 to-transparent',
  },
  'markdown-studio': {
    bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
    shadow: 'shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/30',
    glow: 'from-emerald-400/20 to-transparent',
  },
  'code-playground': {
    bg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700',
    shadow: 'shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/30',
    glow: 'from-indigo-400/20 to-transparent',
  },
};

const DEFAULT_APP_PALETTE = {
  bg: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700',
  shadow: 'shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/30',
  glow: 'from-indigo-400/20 to-transparent',
};

export const AppLauncherCard: React.FC<{ tool: ToolDefinition }> = React.memo(({ tool }) => {
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
  const palette = APP_ICON_PALETTES[tool.slug] || DEFAULT_APP_PALETTE;

  return (
    <Link
      to={getToolUrl(tool.slug)}
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      className="group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-card/60 hover:bg-card border border-border/60 hover:border-primary/40 transition-all duration-200 no-underline hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs hover:shadow-md cursor-pointer select-none"
    >
      {/* Floating Star / Bookmark Action */}
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark app'}
        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isFavorite
            ? 'bg-amber-500/15 text-amber-500 opacity-100'
            : 'bg-background/80 text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-500/10'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
      </button>

      {/* Modern Squircle App Icon (Phone & PC App Launcher Style) */}
      <div className="relative mt-1 mb-2">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[22%] ${palette.bg} ${palette.shadow} flex items-center justify-center text-white relative overflow-hidden transition-transform duration-200 group-hover:scale-105 group-active:scale-95 border border-white/20`}
        >
          {/* Subtle Glassmorphic Highlight Ring */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />

          {/* Central High-Fidelity Icon */}
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md relative z-10" />
        </div>

        {/* Tiny "App" Badge on Icon Corner */}
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-background/90 border border-border/80 text-[9px] font-mono font-bold text-foreground shadow-2xs">
          APP
        </span>
      </div>

      {/* App Name Underneath Icon */}
      <h3 className="w-full text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors tracking-tight px-1">
        {tool.name}
      </h3>

      {/* Clean Single-Line Kicker / Description */}
      <p className="w-full text-[11px] text-muted-foreground truncate px-1 mt-0.5 font-normal">
        {tool.metaDescription.split('.')[0] || 'Browser-native standalone web application'}
      </p>

      {/* Subtle Launch Affordance on Hover */}
      <div className="mt-2 text-[10px] font-semibold text-primary/0 group-hover:text-primary flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100">
        <span>Launch</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </div>
    </Link>
  );
});
