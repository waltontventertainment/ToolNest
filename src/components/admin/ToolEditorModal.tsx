import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Code, 
  Tag, 
  Sparkles, 
  Sliders, 
  Eye, 
  EyeOff, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ToolDefinition, ToolCategory } from '../../lib/types';
import { categories } from '../../lib/registry';
import { ToolOverride } from '../../lib/siteSettings';
import { toast } from 'sonner';

interface ToolEditorModalProps {
  tool: ToolDefinition | null;
  currentOverride?: ToolOverride;
  isOpen: boolean;
  onClose: () => void;
  onSave: (slug: string, override: ToolOverride | null) => void;
}

export const ToolEditorModal: React.FC<ToolEditorModalProps> = ({
  tool,
  currentOverride,
  isOpen,
  onClose,
  onSave
}) => {
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ToolCategory>('Utility');
  const [customDescription, setCustomDescription] = useState('');
  const [customBadge, setCustomBadge] = useState<ToolOverride['customBadge']>('');
  const [disabled, setDisabled] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'code'>('info');

  useEffect(() => {
    if (tool) {
      setCustomName(currentOverride?.customName || tool.name);
      setCustomCategory((currentOverride?.customCategory as ToolCategory) || tool.category);
      setCustomDescription(currentOverride?.customDescription || tool.intro || '');
      setCustomBadge(currentOverride?.customBadge || '');
      setDisabled(currentOverride?.disabled || false);
      setCustomCode(currentOverride?.customCode || '');
      setActiveTab('info');
    }
  }, [tool, currentOverride, isOpen]);

  if (!isOpen || !tool) return null;

  const isCustomized = !!currentOverride && (
    !!currentOverride.customName || 
    !!currentOverride.customCategory || 
    !!currentOverride.customDescription || 
    !!currentOverride.customBadge || 
    currentOverride.disabled !== undefined || 
    !!currentOverride.customCode
  );

  const handleSave = () => {
    // If everything equals defaults, we can clear the override or save
    const override: ToolOverride = {
      customName: customName.trim() !== tool.name ? customName.trim() : undefined,
      customCategory: customCategory !== tool.category ? customCategory : undefined,
      customDescription: customDescription.trim() !== tool.intro ? customDescription.trim() : undefined,
      customBadge: customBadge || undefined,
      disabled: disabled ? true : false,
      customCode: customCode.trim() ? customCode.trim() : undefined,
      updatedAt: new Date().toISOString()
    };

    onSave(tool.slug, override);
    toast.success(`Customization saved for "${tool.name}"!`);
    onClose();
  };

  const handleReset = () => {
    onSave(tool.slug, null);
    toast.success(`Reset "${tool.name}" to official default settings!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <tool.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Customize Tool: {tool.name}
                </h2>
                {isCustomized && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Modified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Slug: /{tool.slug}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border px-6 bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Tool Information & Badges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Custom Code & Script Injection
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'info' ? (
            <>
              {/* Tool Status Switch */}
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Tool Availability Status</h4>
                  <p className="text-xs text-muted-foreground">
                    {disabled 
                      ? 'Disabled: Hidden from public tool directory and search' 
                      : 'Active: Visible to all visitors across the site'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDisabled(!disabled)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    disabled
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {disabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{disabled ? 'Disabled / Hidden' : 'Active & Published'}</span>
                </button>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground">Original: {tool.name}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as ToolCategory)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-muted-foreground">Original: {tool.category}</span>
                </div>
              </div>

              {/* Custom Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Custom Ribbon / Highlight Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['', 'Popular', 'New', 'Pro', 'Featured', 'Updated'] as const).map(badge => (
                    <button
                      key={badge || 'none'}
                      type="button"
                      onClick={() => setCustomBadge(badge)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        customBadge === badge
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {badge ? `★ ${badge}` : 'None'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tool Description / Intro Text
                </label>
                <textarea
                  rows={4}
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="Explain how this tool helps visitors..."
                  className="w-full p-3.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </>
          ) : (
            <>
              {/* Custom Code Injection */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">💡 Tool Page Custom Code Injection</p>
                  <p>
                    Add custom HTML, style overrides (&lt;style&gt;), or custom analytics/scripts (&lt;script&gt;)
                    specifically for this tool. This will be automatically injected on the tool's page.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider">Custom HTML / CSS / JS Code</span>
                    <span className="font-mono text-[11px]">{customCode.length} chars</span>
                  </div>
                  <textarea
                    rows={12}
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    placeholder="<!-- Custom notice banner or styles -->\n<div class='p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 mb-4'>\n  Notice: Pro tip for using this tool efficiently!\n</div>"
                    className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
          <div>
            {isCustomized && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
