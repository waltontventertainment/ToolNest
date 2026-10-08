import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

export const NotFound: React.FC = () => {
  React.useEffect(() => {
    // If opened from local file, downloads folder, or blogger without hash, recover to root
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const isStaticOrFile = 
        window.location.protocol === 'file:' || 
        window.location.protocol === 'content:' || 
        p.endsWith('.html') || 
        p.includes('/storage/') || 
        p.includes('/Download/') ||
        window.location.hostname.includes('blogspot.') || 
        window.location.hostname.includes('blogger.');

      if (isStaticOrFile && !window.location.hash) {
        window.location.hash = '#/';
      }
    }
  }, []);

  const handleReturnHome = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const isFile = window.location.protocol === 'file:' || window.location.protocol === 'content:';
      if (isFile) {
        e.preventDefault();
        window.location.hash = '#/';
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <BreadcrumbNavigation items={[{ label: '404 - Page Not Found' }]} />
      </div>
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <Seo title="Page Not Found | Toolzaro" description="The page you are looking for does not exist." />
        <h1 className="text-8xl font-display font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn't find the tool or page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          to="/" 
          onClick={handleReturnHome}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-brand shadow-sm"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};
