import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  ShieldCheck, 
  Lightbulb, 
  TrendingUp, 
  Copy, 
  Check, 
  Share2, 
  CloudUpload,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TechDigest, 
  TechHighlight,
  getInstantTechDigest, 
  getOrFetchTodayTechDigest, 
  getTodayKey,
  ensureDigestImages,
  getFallbackTopicImage,
  getFastTopicImage,
} from '../services/techDigestService';
import { useGoogleDrive } from '../context/GoogleDriveContext';

const TechDigestReaderModal = React.lazy(() =>
  import('./TechDigestReaderModal').then(m => ({ default: m.TechDigestReaderModal }))
);

export const DailyTechDigest: React.FC = () => {
  // Instant 0ms state initialization with guaranteed round topic images
  const [digest, setDigest] = useState<TechDigest>(() => ensureDigestImages(getInstantTechDigest()));
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savingDrive, setSavingDrive] = useState<boolean>(false);
  const [selectedHighlight, setSelectedHighlight] = useState<TechHighlight | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);

  const driveContext = useGoogleDrive();

  // 1. Background initial sync after first user interaction so cold load has 0 network/CPU overhead
  useEffect(() => {
    let isMounted = true;
    let triggered = false;

    const triggerSync = () => {
      if (triggered || !isMounted) return;
      triggered = true;
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerSync)
      );
      const shouldForce = digest.isFallback === true;
      getOrFetchTodayTechDigest(shouldForce)
        .then((data) => {
          if (isMounted && data) {
            setDigest(ensureDigestImages(data));
          }
        })
        .catch(() => {});
    };

    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
      window.addEventListener(evt, triggerSync, { once: true, passive: true })
    );

    return () => {
      isMounted = false;
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
        window.removeEventListener(evt, triggerSync)
      );
    };
  }, []);

  // 2. Automatic 2-minute live news refresh interval
  useEffect(() => {
    const timer = setInterval(() => {
      getOrFetchTodayTechDigest(true)
        .then((data) => {
          if (data) setDigest(ensureDigestImages(data));
        })
        .catch(() => {});
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getOrFetchTodayTechDigest(true);
      setDigest(ensureDigestImages(data));
      toast.success('Updated with fresh live Hacker News & Tech Digest!');
    } catch (err) {
      console.error('Refresh failed:', err);
      toast.error('Could not refresh tech digest.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = () => {
    if (!digest) return;
    const textToCopy = `🔥 Toolzaro Daily Tech Digest (${digest.dateFormatted})\n\n📌 ${digest.headline}\n\n📝 Summary: ${digest.summary}\n\n💡 Key Takeaway: ${digest.keyTakeaway}\n\n🏷️ Trending: ${digest.trendingTools.join(', ')}\n\nRead live tech insights: ${window.location.origin}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied Tech Digest to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!digest) return;
    if (navigator.share) {
      navigator.share({
        title: `Daily Tech Digest — ${digest.dateFormatted}`,
        text: `${digest.headline} — ${digest.summary}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSaveToDrive = async () => {
    if (!digest) return;
    if (!driveContext?.user || !driveContext?.accessToken) {
      toast.info('Opening Google Drive connection... Please sign in.');
      try {
        await driveContext?.signIn();
      } catch {
        return;
      }
    }

    setSavingDrive(true);
    try {
      const content = `# Toolzaro Daily Tech Digest (${digest.dateFormatted})\n\n**Headline:** ${digest.headline}\n\n**Summary:**\n${digest.summary}\n\n## Key Highlights\n${digest.highlights.map(h => `- **[${h.category}] ${h.title}:** ${h.detail}`).join('\n')}\n\n**Key Takeaway:**\n${digest.keyTakeaway}\n\n**Trending Tools:**\n${digest.trendingTools.join(', ')}\n\n*Synced via Live Hacker News & Dev.to APIs on ${digest.generatedAt}*`;

      const fileName = `TechDigest_${digest.id}.md`;
      const result = await driveContext?.uploadFile(fileName, content, 'text/markdown');

      if (result) {
        toast.success(`Saved "${fileName}" to Google Drive!`);
      } else {
        toast.error('Failed to save to Google Drive.');
      }
    } catch (err) {
      console.error('Drive upload error:', err);
      toast.error('Could not save to Google Drive.');
    } finally {
      setSavingDrive(false);
    }
  };

  const topicHighlights =
    digest.highlights && digest.highlights.length > 0
      ? digest.highlights
      : getInstantTechDigest().highlights;

  return (
    <div className="w-full bg-card border border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/50 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xs transition-colors duration-150 relative overflow-hidden">
      {/* Compact Box: 1 Sleek Horizontal Row on PC (lg+), Clean Stacked on Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 lg:gap-4 relative z-10">
        {/* Left: Badge & Date */}
        <div className="flex items-center justify-between lg:justify-start gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-700 text-white dark:bg-amber-500 dark:text-slate-950">
              <Flame className="w-3 h-3 fill-current" />
              <span>Daily Tech Digest</span>
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span>{digest.dateFormatted}</span>
            </span>
          </div>

          {/* Mobile-only Right Action Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors cursor-pointer border border-border/70 flex items-center justify-center gap-1 disabled:opacity-50"
              title="Sync latest live Hacker News & tech news"
              aria-label="Sync latest live tech news"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 dark:text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1 border border-amber-500/30"
              aria-label={expanded ? 'Hide details' : 'View details'}
            >
              <span>{expanded ? 'Hide' : 'Details'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center: Headline + Summary inline + Mobile Round Topic Thumbnails */}
        <div className="flex items-center justify-between gap-2.5 min-w-0 flex-1">
          <div
            onClick={() => {
              const link = topicHighlights[0]?.url;
              if (link) {
                window.open(link, '_blank');
                toast.success(`Opening live story: ${digest.headline}`);
              } else {
                setExpanded(!expanded);
              }
            }}
            className="cursor-pointer group/title flex items-center gap-2 min-w-0 flex-1"
            title="Click to open live article"
          >
            <h2 className="text-xs sm:text-sm font-bold text-foreground group-hover/title:text-amber-500 transition-colors truncate">
              {digest.headline}
            </h2>
            {!expanded && (
              <span className="hidden xl:inline text-xs text-muted-foreground truncate max-w-xs">
                — {digest.summary}
              </span>
            )}
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/title:text-amber-500 shrink-0" />
          </div>

          {/* Mobile & Tablet Round Topic Images (Unified Touch Target) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="flex lg:hidden items-center -space-x-1.5 shrink-0 pl-1 min-h-[48px] min-w-[48px] p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="View 6 daily tech digest topics"
            title="Click to view full tech highlights"
          >
            {topicHighlights.slice(0, 6).map((item, idx) => {
              const imgSrc = item.imageUrl || getFastTopicImage(item.title || item.category || `topic-${idx}`, idx);
              return (
                <span
                  key={`mob-topic-${idx}`}
                  style={{ contain: 'strict' }}
                  className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2 border-card ring-1 ring-amber-500/50 bg-muted shadow-2xs relative block"
                >
                  <img
                    src={imgSrc}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    width={28}
                    height={28}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getFallbackTopicImage(idx);
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                </span>
              );
            })}
          </button>
        </div>

        {/* Right on PC: Always-Visible Round Topic Thumbnails + Action Controls */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 pr-2 border-r border-border/60">
            {topicHighlights.slice(0, 6).map((item, idx) => {
              const imgSrc = item.imageUrl || getFastTopicImage(item.title || item.category || `topic-${idx}`, idx);
              return (
                <button
                  key={`pc-topic-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.url) {
                      window.open(item.url, '_blank');
                      toast.success(`Opening: ${item.title}`);
                    } else {
                      setExpanded(true);
                    }
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-full hover:bg-amber-500/10 transition-colors cursor-pointer relative"
                  aria-label={`${item.category}: ${item.title}`}
                  title={`${item.category}: ${item.title}`}
                >
                  <span 
                    style={{ contain: 'strict' }}
                    className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2 border-amber-500/45 hover:border-amber-500 bg-muted shadow-2xs block"
                  >
                    <img
                      src={imgSrc}
                      alt={item.title}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      width={28}
                      height={28}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getFallbackTopicImage(idx);
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-bold transition-colors cursor-pointer border border-border/70 flex items-center gap-1 disabled:opacity-50"
            title="Sync latest live Hacker News & tech news"
          >
            <RefreshCw className={`w-3 h-3 text-amber-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 border border-amber-500/30"
          >
            <span>{expanded ? 'Collapse' : 'Read Full'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Premium Drawer View */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-amber-500/20 space-y-3.5 animate-in fade-in-0 duration-150 relative z-10">
          {/* Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {digest.summary}
          </p>

          {/* Grid of Key Highlights */}
          {topicHighlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {topicHighlights.map((item, index) => {
                const imgSrc =
                  item.imageUrl ||
                  getFastTopicImage(item.title || item.category || `topic-${index}`, index);
                return (
                  <div 
                    key={index} 
                    onClick={() => {
                      if (item.url) {
                        window.open(item.url, '_blank');
                        toast.success(`Opening live story: ${item.title}`);
                      } else {
                        toast.info('No external link available for this item.');
                      }
                    }}
                    className="p-3 rounded-xl bg-card/80 border border-border/80 hover:border-amber-500/50 hover:bg-muted/50 transition-all space-y-1.5 shadow-2xs cursor-pointer group/card flex flex-col justify-between"
                    title="Click to open live article on original site"
                  >
                    <div>
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-muted/40 relative">
                        <img 
                          src={imgSrc} 
                          alt={item.title}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = getFallbackTopicImage(index);
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={imgSrc}
                            alt={item.category}
                            loading="eager"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            width={18}
                            height={18}
                            className="w-4.5 h-4.5 rounded-full object-cover border border-amber-500/40 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = getFallbackTopicImage(index);
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate">
                            {item.category}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/card:text-amber-500 transition-colors shrink-0" />
                      </div>
                      <h3 className="text-xs font-bold text-foreground group-hover/card:text-amber-500 transition-colors leading-tight pt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 pt-1">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Key Takeaway Callout */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500/20" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Developer Key Takeaway
              </span>
              <p className="text-xs font-medium text-foreground leading-relaxed">
                {digest.keyTakeaway}
              </p>
            </div>
          </div>

          {/* Trending Tools & Action Buttons Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Trending:
              </span>
              {digest.trendingTools.map((tool, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/50"
                >
                  #{tool}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-border/60 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={savingDrive}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-amber-500/30 shadow-2xs disabled:opacity-50"
              >
                <CloudUpload className={`w-3.5 h-3.5 ${savingDrive ? 'animate-bounce' : ''}`} />
                <span>{savingDrive ? 'Saving...' : 'Drive'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-border/60 shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-1"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isReaderOpen && (
        <React.Suspense fallback={null}>
          <TechDigestReaderModal
            item={selectedHighlight}
            digest={digest}
            isOpen={isReaderOpen}
            onClose={() => setIsReaderOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
