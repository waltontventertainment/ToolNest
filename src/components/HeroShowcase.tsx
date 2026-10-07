import React, { useState } from 'react';
import { Palette, FileCode, QrCode, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

export const HeroShowcase: React.FC = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: 'Indigo Glow', hex: '#6366F1', bg: 'bg-indigo-500' },
    { name: 'Emerald Mint', hex: '#10B981', bg: 'bg-emerald-500' },
    { name: 'Vibrant Rose', hex: '#F43F5E', bg: 'bg-rose-500' },
    { name: 'Amber Sunset', hex: '#F59E0B', bg: 'bg-amber-500' }
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Color ${hex} copied to clipboard!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="w-full max-w-md relative aspect-square flex items-center justify-center select-none overflow-visible">
      {/* Decorative Glowing Ambient Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl animate-pulse [animation-duration:8s]" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-3xl animate-pulse [animation-duration:6s]" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl animate-pulse [animation-duration:7s]" />

      {/* Main Glassmorphic Panel Container */}
      <div className="w-full h-full rounded-3xl border border-border bg-gradient-to-br from-background/60 to-muted/40 dark:from-neutral-900/60 dark:to-neutral-950/40 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
        
        {/* Abstract Tech Grid Lines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,119,198,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-3xl" />
        
        {/* Floating Glowing Aura at corners */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent blur-xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Toolzaro Live Workspace</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">v2.4.0</span>
        </div>

        {/* 1. JSON & Syntax Formatter Glass Card */}
        <div className="w-[90%] self-start bg-card border border-border rounded-2xl p-4 shadow-lg backdrop-blur-md transform hover:-translate-y-1 transition-transform z-10">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/60">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-foreground">JSON Minifier & Formatter</span>
          </div>
          <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed overflow-x-auto select-all">
            <span className="text-pink-500">{"{"}</span>{'\n'}
            {'  '}<span className="text-sky-500">"status"</span>: <span className="text-emerald-500">"optimized"</span>,{'\n'}
            {'  '}<span className="text-sky-500">"processing"</span>: <span className="text-amber-500">"0.02ms"</span>,{'\n'}
            {'  '}<span className="text-sky-500">"active_tools"</span>: <span className="text-indigo-500">35</span>{'\n'}
            <span className="text-pink-500">{"}"}</span>
          </pre>
        </div>

        {/* 2. Interactive Color Swatches Glass Card */}
        <div className="w-[85%] self-end bg-card border border-border rounded-2xl p-3.5 shadow-lg backdrop-blur-md transform hover:-translate-y-1 transition-transform z-10 -mt-2">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-foreground">Interactive Palette</span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">Click to copy</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleCopyColor(c.hex)}
                className="group/btn flex flex-col items-center gap-1 cursor-pointer"
                title={`Copy ${c.hex}`}
              >
                <div className={`w-full aspect-square rounded-lg ${c.bg} shadow-inner transition-transform group-hover/btn:scale-110 active:scale-95 flex items-center justify-center`}>
                  {copiedColor === c.hex && (
                    <Check className="w-3.5 h-3.5 text-white filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                  )}
                </div>
                <span className="text-[9px] font-mono font-bold text-muted-foreground transition-colors group-hover/btn:text-foreground">
                  {c.hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. AI Copilot Badge & QR Floating Badge */}
        <div className="flex items-center justify-between mt-1 z-10">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-primary font-bold text-xs shadow-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Powered Tools Suite</span>
          </div>
          
          {/* Mock QR mini-card */}
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl shadow-md">
            <QrCode className="w-4 h-4 text-pink-500" />
            <span className="text-[10px] font-bold text-foreground">Scan QR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
