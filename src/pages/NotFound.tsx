import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Grid, ArrowRight } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ToolsHubPage } from './ToolsHubPage';

export const NotFound: React.FC = () => {
  React.useEffect(() => {
    // If opened from local offline file without hash, recover to root
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const isLocalFile =
        window.location.protocol === 'file:' ||
        window.location.protocol === 'content:' ||
        p.includes('/storage/') ||
        p.includes('/Download/');

      if (isLocalFile && !window.location.hash) {
        window.location.hash = '#/';
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <Seo
        title="Explore All Online Tools Directory | Toolzaro"
        description="Browse and search our complete directory of 156+ browser-based developer, PDF, image, converter, and utility tools."
      />

      {/* Helpful Notice Banner + Direct Hub Directory */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary">
            <Grid className="w-4 h-4" />
            <span>Toolzaro Interactive Hub Directory</span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
            Looking for a specific utility? Browse our complete tools directory below
          </h2>
          <p className="text-xs text-muted-foreground">
            Select any tool from our categorized directory or use the instant filter bar.
          </p>
        </div>

        <Link
          to="/"
          className="btn-signature-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Render the full Interactive Tools Hub Page directly so visitors never hit a dead end */}
      <ToolsHubPage />
    </div>
  );
};
