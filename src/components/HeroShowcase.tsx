import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Code,
  QrCode,
  KeyRound,
  CloudSun,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Command,
  Layers,
} from 'lucide-react';
import { getToolUrl, getToolsHubUrl } from '../lib/appUrls';
import { tools, preloadToolBySlug } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';

const QUICK_LAUNCH_TOOLS = [
  {
    slug: 'pdf-merger',
    name: 'Merge PDF',
    category: 'PDF Suite',
    icon: FileText,
    accent: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20',
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'Image & Color',
    icon: ImageIcon,
    accent: 'text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    category: 'Developer',
    icon: Code,
    accent: 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    slug: 'qr-generator',
    name: 'QR Code Maker',
    category: 'QR & Barcode',
    icon: QrCode,
    accent: 'text-amber-800 dark:text-amber-300 bg-amber-500/10 border-amber-500/20',
  },
  {
    slug: 'password-generator',
    name: 'Password Gen',
    category: 'Security',
    icon: KeyRound,
    accent: 'text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20',
  },
  {
    slug: 'open-meteo-live-weather',
    name: 'Live Weather',
    category: 'Global Data',
    icon: CloudSun,
    accent: 'text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  },
];

export const HeroShowcase: React.FC = () => {
  const { settings } = useSiteSettings();
  const activeCount = React.useMemo(() => {
    try {
      return getEffectiveTools(tools, settings.toolOverrides, false).length;
    } catch {
      return tools.length;
    }
  }, [settings.toolOverrides]);

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
    );
  };

  return (
    <div className="w-full max-w-[540px] select-none">
      {/* Crisp Desktop Workstation Quick-Launch Console (Zero heavy blur/image overhead, 0ms paint) */}
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Console Window Top Bar */}
        <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-bold text-foreground ml-1.5 tracking-tight">
              Quick-Launch Workspace
            </span>
          </div>

          <button
            type="button"
            onClick={triggerCommandPalette}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background hover:bg-secondary border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Open Instant Command Search (Ctrl+K)"
          >
            <Command className="w-3 h-3 text-primary" />
            <span>Quick Find</span>
            <kbd className="font-mono text-[10px] px-1 bg-muted rounded border border-border/80">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Interactive 6-Tool Quick Launch Grid */}
        <div className="p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-card">
          {QUICK_LAUNCH_TOOLS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.slug}
                to={getToolUrl(item.slug)}
                onMouseEnter={() => preloadToolBySlug(item.slug)}
                onTouchStart={() => preloadToolBySlug(item.slug)}
                className="group p-3 rounded-xl border border-border/80 bg-background/60 hover:bg-secondary/40 hover:border-primary/50 transition-[transform,border-color,background-color] duration-150 hover:-translate-y-0.5 flex flex-col justify-between gap-2 no-underline"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center ${item.accent}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {item.category}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Console Bottom Status Strip */}
        <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3 text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-950 dark:text-emerald-200 font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Local Sandbox</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-amber-950 dark:text-amber-200 font-extrabold">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Zero Cloud Upload</span>
            </span>
          </div>

          <Link
            to={getToolsHubUrl()}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline whitespace-nowrap"
          >
            <Layers className="w-3 h-3" />
            <span>All {activeCount} Tools →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
