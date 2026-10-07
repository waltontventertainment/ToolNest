import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, ShieldCheck, X, Cpu, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getLiveFreeModels } from '../lib/aiService';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('toolnest_custom_ai_key') || '';
      setApiKey(existing);
      setSavedKey(existing);
      
      setLoadingModels(true);
      getLiveFreeModels().then((models) => {
        setActiveModels(models);
        setLoadingModels(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('toolnest_custom_ai_key', trimmed);
      setSavedKey(trimmed);
      toast.success('Custom OpenRouter API key saved successfully!');
    } else {
      localStorage.removeItem('toolnest_custom_ai_key');
      setSavedKey('');
      toast.info('Reverted to ToolNest Built-in Unlimited Free AI Pool');
    }
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('toolnest_custom_ai_key');
    setApiKey('');
    setSavedKey('');
    toast.info('Using ToolNest Built-in Unlimited Free AI Engine');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                ToolNest Neural AI Engine
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Built-in 100% Free Unlimited Failover AI Pool
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

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Engine Status Banner */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Default Status: 100% Free & Unlimited</span>
              </span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ToolNest integrates a multi-model auto-failover engine. If one free model reaches a rate limit, the system automatically switches to another top-performing model in real-time.
            </p>
          </div>

          {/* Active Models Pool */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Active Free Models ({activeModels.length})</span>
              {loadingModels && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 max-h-32 overflow-y-auto space-y-1">
              {activeModels.map((model) => (
                <div key={model} className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom API Key Form */}
          <form onSubmit={handleSaveKey} className="space-y-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>Optional: Use Your Own Unlimited OpenRouter Key</span>
              </label>
              <p className="text-[11px] text-muted-foreground">
                If you have a personal OpenRouter API key, enter it below to use your personal quota.
              </p>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full h-10 px-3 pr-20 bg-secondary/60 focus:bg-background border border-border/80 focus:border-primary rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {savedKey && (
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedKey ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
                >
                  Clear Custom Key
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Key is stored securely in your browser
                </span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Engine: OpenRouter Dynamic Pool</span>
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
