import React from 'react';
import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';
import { tools, categories } from '../lib/registry';
import { ToolCard } from '../components/ToolCard';
import { Seo } from '../components/Seo';
import { AdSlot } from '../components/AdSlot';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

export const CategoryPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const slug = forcedSlug || routeSlug || searchParams.get('category') || '';
  
  const [displayCount, setDisplayCount] = React.useState(12);
  const [incrementCount, setIncrementCount] = React.useState(12);

  React.useEffect(() => {
    const getCounts = () => {
      if (window.innerWidth >= 1280) return 16; // 4 columns
      if (window.innerWidth >= 1024) return 12; // 3 columns
      if (window.innerWidth >= 640) return 10; // 2 columns
      return 8; // 1 column
    };
    
    const count = getCounts();
    setDisplayCount(count);
    setIncrementCount(count);
  }, []);

  // Find real category name
  const categoryName = categories.find(c => c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === slug);

  React.useEffect(() => {
    setDisplayCount(incrementCount);
  }, [slug, incrementCount]);

  if (!categoryName) {
    return <Navigate to="/404" replace />;
  }

  const categoryTools = tools.filter(t => t.category === categoryName);
  const displayedTools = categoryTools.slice(0, displayCount);

  return (
    <>
      <Seo 
        title={`${categoryName} Tools - Free Online Utilities | Toolzaro`}
        description={`Explore our collection of free ${categoryName} tools. No sign-ups, runs locally in your browser.`}
      />
      
      <div className="mb-4 sm:mb-6">
        <BreadcrumbNavigation
          items={[
            {
              label: categoryName,
            },
          ]}
        />
      </div>

      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tight mb-2 sm:mb-3 text-foreground">
          {categoryName} Tools
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          A curated collection of {categoryTools.length} free browser utilities to help with your {categoryName.toLowerCase()} workflows.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
          {displayedTools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        {displayCount < categoryTools.length && (
          <button 
            onClick={() => setDisplayCount(prev => prev + incrementCount)}
            className="mt-8 sm:mt-10 md:mt-12 px-8 py-3.5 rounded-2xl font-bold text-xs btn-signature-header hover:border-primary/50 text-foreground shadow-sm cursor-pointer"
          >
            Load More Tools ({categoryTools.length - displayCount} remaining)
          </button>
        )}
      </div>

      <div className="mt-8 sm:mt-12">
        <AdSlot slot="category-bottom" format="auto" />
      </div>
    </>
  );
};
