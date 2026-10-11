import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Code,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ToolDefinition, ToolCategory } from '../../lib/types';
import { categories } from '../../lib/registry';
import { ToolOverride } from '../../lib/siteSettings';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
  onSave,
}) => {
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ToolCategory>('Utility');
  const [customDescription, setCustomDescription] = useState('');
  const [customBadge, setCustomBadge] = useState<ToolOverride['customBadge']>('');
  const [disabled, setDisabled] = useState(false);
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    if (tool) {
      setCustomName(currentOverride?.customName || tool.name);
      setCustomCategory((currentOverride?.customCategory as ToolCategory) || tool.category);
      setCustomDescription(currentOverride?.customDescription || tool.intro || '');
      setCustomBadge(currentOverride?.customBadge || '');
      setDisabled(currentOverride?.disabled || false);
      setCustomCode(currentOverride?.customCode || '');
    }
  }, [tool, currentOverride, isOpen]);

  if (!isOpen || !tool) return null;

  const isCustomized =
    !!currentOverride &&
    (!!currentOverride.customName ||
      !!currentOverride.customCategory ||
      !!currentOverride.customDescription ||
      !!currentOverride.customBadge ||
      currentOverride.disabled !== undefined ||
      !!currentOverride.customCode);

  const handleSave = () => {
    const override: ToolOverride = {
      customName: customName.trim() !== tool.name ? customName.trim() : undefined,
      customCategory: customCategory !== tool.category ? customCategory : undefined,
      customDescription:
        customDescription.trim() !== tool.intro ? customDescription.trim() : undefined,
      customBadge: customBadge || undefined,
      disabled: disabled ? true : false,
      customCode: customCode.trim() ? customCode.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(tool.slug, override);
    toast.success(`Customization saved for "${tool.name}"!`);
    onClose();
  };

  const handleReset = () => {
    onSave(tool.slug, null);
    toast.success(`Reset "${tool.name}" to default settings!`);
    onClose();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      {/* FULL-SCREEN TOOL CUSTOMIZER HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools Manager</span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <tool.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  Customize Tool: {tool.name}
                </h1>
                {isCustomized && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    MODIFIED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Root URL: /{tool.slug}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <span>Open Tool Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {isCustomized && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Tool Settings</span>
          </button>
        </div>
      </header>

      {/* FULL-SCREEN WORKSPACE BODY */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Metadata, Status & Badges */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4" />
              <span>Tool Identity, Visibility &amp; SEO Metadata</span>
            </h2>

            {/* Tool Status Switch */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Public Availability Status</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {disabled
                    ? 'Disabled: Hidden from public tool directory and search'
                    : 'Active: Live and accessible to all visitors'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDisabled(!disabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  disabled
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {disabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{disabled ? 'Disabled / Hidden' : 'Active & Published'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Display Title
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 block">Default: {tool.name}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Suite Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as ToolCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 block">Default: {tool.category}</span>
              </div>
            </div>

            {/* Custom Ribbon Badge */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Highlight Badge
              </label>
              <div className="flex flex-wrap gap-2">
                {(['', 'Popular', 'New', 'Pro', 'Featured', 'Updated'] as const).map((badge) => (
                  <button
                    key={badge || 'none'}
                    type="button"
                    onClick={() => setCustomBadge(badge)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      customBadge === badge
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {badge ? `★ ${badge}` : 'No Badge'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Tool Subtitle / Intro Description
              </label>
              <textarea
                rows={5}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Explain how this tool helps visitors..."
                className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Custom HTML / CSS / JS Injection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Code className="w-4 h-4" />
              <span>Custom HTML / CSS / Script Injection</span>
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Inject custom HTML banners, extra instructions, custom CSS (&lt;style&gt;), or widgets
              directly above this tool on <code className="text-indigo-300">/{tool.slug}</code>.
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-bold">Custom Code Snippet</span>
                <span className="font-mono text-[11px]">{customCode.length} chars</span>
              </div>
              <textarea
                rows={14}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder={`<!-- Optional custom banner or HTML widget for /${tool.slug} -->\n<div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs mb-4">\n  <strong>Pro Tip:</strong> All files are processed 100% locally in your browser.\n</div>`}
                className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950 text-emerald-300 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
