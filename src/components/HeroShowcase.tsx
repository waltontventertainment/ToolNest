import React from 'react';
import { Sparkles, Shield, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import heroBannerImg from '../assets/images/premium_hero_banner_1791390453868.jpg';

export const HeroShowcase: React.FC = () => {
  return (
    <div className="w-full max-w-[480px] lg:max-w-[520px] relative select-none">
      {/* Decorative Glowing Ambient Backdrops */}
      <div className="absolute -top-6 -left-6 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl animate-pulse [animation-duration:8s] pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl animate-pulse [animation-duration:6s] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />

      {/* Main Premium Banner Showcase Container */}
      <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-2.5 shadow-2xl shadow-indigo-500/10 group overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-primary/20">
        
        {/* Banner Image Frame */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-950">
          <img
            src={heroBannerImg}
            alt="Toolzaro Professional Developer & Web Utility Suite"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle gradient overlay at top and bottom for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40 pointer-events-none" />

          {/* Top Floating Badge inside Image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2 bg-neutral-900/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">Toolzaro Pro Suite</span>
            </div>

            <div className="flex items-center gap-1.5 bg-primary/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>v2.5 High-Speed</span>
            </div>
          </div>

          {/* Bottom Floating Bar inside Image */}
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
            <div className="bg-neutral-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Client-Side Privacy</div>
                  <div className="text-[10px] text-neutral-400">Zero Server Storage • Instant Execution</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
