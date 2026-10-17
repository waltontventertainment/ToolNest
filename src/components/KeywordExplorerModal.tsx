import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Search,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Check
} from 'lucide-react';
import { tools } from '../lib/registry';
import { ToolDefinition } from '../lib/types';
import { toast } from 'sonner';

interface KeywordExplorerModalProps {
  isOpen: boolean;
  keyword: string | null;
  currentToolSlug?: string;
  onClose: () => void;
}

export const KeywordExplorerModal: React.FC<KeywordExplorerModalProps> = ({
  isOpen,
  keyword,
  currentToolSlug,
  onClose,
}) => {
  if (!isOpen || !keyword) return null;

  const cleanKeyword = keyword.replace(/^#/, '').trim();
  const lowerKw = cleanKeyword.toLowerCase();

  // Find matching tools across the 189+ registry
  const matchingTools = useMemo(() => {
    const scored: { tool: ToolDefinition; score: number }[] = [];

    for (const t of tools) {
      let score = 0;
      const tName = t.name.toLowerCase();
      const tSlug = t.slug.toLowerCase();
      const tDesc = t.metaDescription.toLowerCase();

      // Exact slug or name match
      if (tSlug === lowerKw || tName === lowerKw) score += 50;
      else if (tName.includes(lowerKw)) score += 30;
      else if (tSlug.includes(lowerKw)) score += 25;

      // Keyword match
      if (t.keywords) {
        for (const k of t.keywords) {
          const lk = k.toLowerCase();
          if (lk === lowerKw) score += 40;
          else if (lk.includes(lowerKw) || lowerKw.includes(lk)) score += 15;
        }
      }

      // Description match
      if (tDesc.includes(lowerKw)) score += 10;

      // Word-level partial overlap
      const kwWords = lowerKw.split(/\s+/).filter(w => w.length > 2);
      for (const w of kwWords) {
        if (tName.includes(w)) score += 5;
        if (t.keywords.some(k => k.toLowerCase().includes(w))) score += 5;
      }

      if (score > 0) {
        scored.push({ tool: t, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    // If current tool is at the top, keep it and prioritize alternatives right after
    const results = scored.map(s => s.tool);
    return results.slice(0, 6);
  }, [lowerKw]);

  const handleCopyKeyword = () => {
    navigator.clipboard.writeText(cleanKeyword);
    toast.success(`Copied keyword "${cleanKeyword}" to clipboard!`);
  };

  const handleCopyGoogleQuery = () => {
    const q = `${cleanKeyword} Toolzaro`;
    navigator.clipboard.writeText(q);
    toast.success(`Copied Google search query: "${q}"`);
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanKeyword + ' Toolzaro')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-foreground truncate">
                #{cleanKeyword}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Search Topic &amp; Related In-Browser Tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Search Intent & Privacy Assurance */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Search Intent &amp; Tool Capabilities</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Users searching for <strong className="text-foreground">"{cleanKeyword}"</strong> seek fast, private, and zero-install online utilities. Toolzaro processes all tasks 100% inside your browser using client-side WebAssembly, Canvas, and Web Cryptography without server uploads.
            </p>
          </div>

          {/* Related Tools Matching this Keyword */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-foreground text-xs uppercase tracking-wider">
                Matching Tools in Toolzaro ({matchingTools.length})
              </span>
              <Link
                to={`/tools?q=${encodeURIComponent(cleanKeyword)}`}
                onClick={onClose}
                className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>View all in Hub</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {matchingTools.length === 0 ? (
              <div className="p-4 rounded-xl border border-border bg-muted/20 text-center text-muted-foreground text-xs">
                No direct single tool match, but you can search our 189+ utilities directory below.
              </div>
            ) : (
              <div className="space-y-2">
                {matchingTools.map(t => {
                  const isCurrent = t.slug === currentToolSlug;
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.slug}
                      to={`/${t.slug}`}
                      onClick={onClose}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border bg-card hover:bg-muted/50 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-primary shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-xs truncate">{t.name}</h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{t.category} • Free &amp; Private</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions (Copy, Google Search) */}
          <div className="pt-2 border-t border-border/60 space-y-2">
            <span className="font-bold text-foreground text-xs block">
              Quick Actions &amp; Ranking Verification:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyKeyword}
                className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted font-medium text-xs text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-primary" />
                <span>Copy Keyword</span>
              </button>

              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted font-medium text-xs text-foreground flex items-center justify-center gap-1.5 transition-colors no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span>Check on Google</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Private In-Browser</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-medium"
            >
              Close
            </button>
            <Link
              to={`/tools?q=${encodeURIComponent(cleanKeyword)}`}
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Toolzaro</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
