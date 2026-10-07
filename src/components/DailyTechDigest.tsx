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
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  TechDigest, 
  TechHighlight,
  getInstantTechDigest, 
  getOrFetchTodayTechDigest, 
  getTodayKey,
  getFormattedDate 
} from '../services/techDigestService';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { TechDigestReaderModal } from './TechDigestReaderModal';

export const DailyTechDigest: React.FC = () => {
  // Instant zero-delay state initialization
  const [digest, setDigest] = useState<TechDigest>(() => getInstantTechDigest());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savingDrive, setSavingDrive] = useState<boolean>(false);
  const [selectedHighlight, setSelectedHighlight] = useState<TechHighlight | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);

  const driveContext = useGoogleDrive();

  // 1. Background initial fetch / auto-sync if fallback
  useEffect(() => {
    let isMounted = true;
    const shouldForce = digest.isFallback === true;
    if (shouldForce) {
      setRefreshing(true);
    }
    getOrFetchTodayTechDigest(shouldForce)
      .then((data) => {
        if (isMounted && data) {
          setDigest(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setRefreshing(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Realtime Firebase Firestore listener (0ms live update across all users)
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const todayKey = getTodayKey();
      unsubscribe = onSnapshot(doc(db, 'tech_digests', todayKey), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as TechDigest;
          if (data && data.headline && data.summary) {
            setDigest(data);
          }
        }
      }, () => {});
    } catch {}

    return () => unsubscribe();
  }, []);

  // 3. Automatic 2-minute live news refresh interval
  useEffect(() => {
    const timer = setInterval(() => {
      getOrFetchTodayTechDigest(true).catch(() => {});
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getOrFetchTodayTechDigest(true);
      setDigest(data);
      toast.success('Updated with fresh live Hacker News & AI Tech Digest!');
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
      const content = `# Toolzaro Daily Tech Digest (${digest.dateFormatted})\n\n**Headline:** ${digest.headline}\n\n**Summary:**\n${digest.summary}\n\n## Key Highlights\n${digest.highlights.map(h => `- **[${h.category}] ${h.title}:** ${h.detail}`).join('\n')}\n\n**Key Takeaway:**\n${digest.keyTakeaway}\n\n**Trending Tools:**\n${digest.trendingTools.join(', ')}\n\n*Synced via Live Hacker News/Dev.to APIs & Toolzaro Neural Engine on ${digest.generatedAt}*`;

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

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-3 sm:p-4 shadow-md transition-all duration-200 relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />

      {/* 3-Line Compact Box */}
      <div className="flex flex-col gap-1.5 relative z-10">
        {/* Line 1: Header Badges & Live Status */}
        <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
              <Flame className="w-3 h-3 fill-current animate-pulse" />
              <span>Daily Tech Digest</span>
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>{digest.dateFormatted}</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              <Globe className="w-3 h-3 text-emerald-500" />
              <span>Hacker News & AI Synced</span>
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-bold transition-all cursor-pointer border border-border/70 flex items-center gap-1 disabled:opacity-50"
              title="Sync latest live Hacker News & AI news"
            >
              <RefreshCw className={`w-3 h-3 text-amber-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-amber-500/30"
            >
              <span>{expanded ? 'Collapse' : 'Read Full'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Line 2: Headline (1 line truncated in compact mode) */}
        <div 
          onClick={() => {
            const link = digest.highlights?.[0]?.url;
            if (link) {
              window.open(link, '_blank');
              toast.success(`Opening live story: ${digest.headline}`);
            } else {
              toast.info('No external link available.');
            }
          }}
          className="cursor-pointer group/title flex items-start justify-between gap-2 pt-0.5"
          title="Click to open live article"
        >
          <h3 className={`text-xs sm:text-sm font-bold text-foreground group-hover/title:text-amber-500 transition-colors leading-snug ${expanded ? '' : 'line-clamp-1'}`}>
            {digest.headline}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/title:text-amber-500 shrink-0 mt-0.5" />
        </div>

        {/* Line 3: Compact Executive Summary (1 line) */}
        {!expanded && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <p className="line-clamp-1 flex-1">
                {digest.summary}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-0.5"
              >
                <span>More Details</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Mini Box Thumbnail Strip for all topic images */}
            {digest.highlights && digest.highlights.filter(h => h.imageUrl).length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-0.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 shrink-0">Topics:</span>
                {digest.highlights.filter(h => h.imageUrl).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.url) {
                        window.open(item.url, '_blank');
                        toast.success(`Opening: ${item.title}`);
                      }
                    }}
                    className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-amber-500/40 cursor-pointer hover:scale-110 transition-transform shadow-2xs relative group/thumb"
                    title={item.title}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Premium Drawer View */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-amber-500/20 space-y-3.5 animate-in fade-in-0 duration-150 relative z-10">
          {/* Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {digest.summary}
          </p>

          {/* Grid of Key Highlights */}
          {digest.highlights && digest.highlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {digest.highlights.map((item, index) => (
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
                  className="p-3 rounded-xl bg-card/80 border border-border/80 hover:border-amber-500/50 hover:bg-muted/50 transition-all space-y-1 shadow-2xs cursor-pointer group/card flex flex-col justify-between"
                  title="Click to open live article on original site"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-muted/40 relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {item.category}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/card:text-amber-500 transition-colors" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground group-hover/card:text-amber-500 transition-colors leading-tight pt-0.5">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 pt-1">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Key Takeaway Callout */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500/20" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
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

      <TechDigestReaderModal
        item={selectedHighlight}
        digest={digest}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
};
