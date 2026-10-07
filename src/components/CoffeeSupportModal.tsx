import React, { useState, useEffect } from 'react';
import { Coffee, Heart, ExternalLink, X, Check, Copy, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CoffeeSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoffeeSupportModal: React.FC<CoffeeSupportModalProps> = ({ isOpen, onClose }) => {
  const [coffeeUrl, setCoffeeUrl] = useState(() => {
    return localStorage.getItem('toolnest_coffee_url') || 'https://buymeacoffee.com';
  });
  const [customInput, setCustomInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('toolnest_coffee_url');
    if (saved) {
      setCoffeeUrl(saved);
      setCustomInput(saved);
    }
  }, []);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = customInput.trim();
    if (trimmed) {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = `https://${trimmed}`;
      }
      localStorage.setItem('toolnest_coffee_url', trimmed);
      setCoffeeUrl(trimmed);
      toast.success('Updated Buy Me a Coffee link!');
      setShowSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-sm">
              <Coffee className="w-5 h-5 fill-amber-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
                <span>Support Toolzaro</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Buy Me a Coffee
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep Toolzaro 100% free, fast, and private for creators worldwide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Supporter Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Loved using Toolzaro today?</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Toolzaro runs client-side with zero subscription paywalls or hidden fees. If our tools helped you complete a task or saved your time, consider buying us a coffee!
              </p>
            </div>

            {/* Direct Support Button */}
            <div className="pt-2 flex justify-center">
              <a
                href={coffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6 py-3 rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Coffee className="w-5 h-5 fill-amber-950" />
                <span>Buy Me a Coffee ($3 or $5)</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>
            </div>
          </div>

          {/* Preset Tiers */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">Choose Coffee Tier</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { amount: '$3', label: '1 Coffee', desc: 'Quick Espresso' },
                { amount: '$5', label: '2 Coffees', desc: 'Double Shot' },
                { amount: '$10', label: 'Supporter', desc: 'Toolzaro Fan' }
              ].map((tier) => (
                <a
                  key={tier.amount}
                  href={coffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary/70 transition-all text-center group cursor-pointer"
                >
                  <div className="text-sm font-black text-amber-600 dark:text-amber-400">{tier.amount}</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{tier.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{tier.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Admin Custom Link Setup */}
          <div className="pt-2 border-t border-border/60 space-y-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showSettings ? '▲ Hide Link Configuration' : '⚙️ Custom Buy Me a Coffee Username/Link'}</span>
            </button>

            {showSettings && (
              <form onSubmit={handleSaveUrl} className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 space-y-2.5">
                <label className="text-[11px] font-bold text-foreground block">
                  Enter your personal Buy Me a Coffee or Ko-fi page URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="https://buymeacoffee.com/yourname"
                    className="flex-1 h-9 px-3 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 text-amber-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Secure Checkout via BuyMeACoffee.com</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
