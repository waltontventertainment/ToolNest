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
  Tag,
  Plus,
  Trash2,
  X,
  Edit2,
  Check
} from 'lucide-react';
import { ToolDefinition, ToolCategory } from '../../lib/types';
import { categories } from '../../lib/registry';
import { ToolOverride } from '../../lib/siteSettings';
import { getEffectiveToolKeywords } from '../../lib/seoKeywordsDatabase';
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

  // SEO Keywords state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    if (tool) {
      setCustomName(currentOverride?.customName || tool.name);
      setCustomCategory((currentOverride?.customCategory as ToolCategory) || tool.category);
      setCustomDescription(currentOverride?.customDescription || tool.intro || '');
      setCustomBadge(currentOverride?.customBadge || '');
      setDisabled(currentOverride?.disabled || false);
      setCustomCode(currentOverride?.customCode || '');

      const effectiveKeywords = getEffectiveToolKeywords(
        tool.slug, 
        tool.keywords || [], 
        currentOverride?.customKeywords
      );
      setKeywords(effectiveKeywords);
      setEditingIndex(null);
      setNewKeywordInput('');
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
      !!currentOverride.customCode ||
      (currentOverride.customKeywords && currentOverride.customKeywords.length > 0));

  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const parts = newKeywordInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = Array.from(new Set([...keywords, ...parts]));
    setKeywords(updated);
    setNewKeywordInput('');
    toast.success(`Added ${parts.length} keyword(s)`);
  };

  const handleStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditingValue(keywords[idx]);
  };

  const handleSaveEdit = (idx: number) => {
    if (!editingValue.trim()) {
      handleDeleteKeyword(idx);
      return;
    }
    const updated = [...keywords];
    updated[idx] = editingValue.trim();
    setKeywords(updated);
    setEditingIndex(null);
  };

  const handleDeleteKeyword = (idx: number) => {
    const updated = keywords.filter((_, i) => i !== idx);
    setKeywords(updated);
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
  };

  const handleResetKeywords = () => {
    const defaults = getEffectiveToolKeywords(tool.slug, tool.keywords || []);
    setKeywords(defaults);
    toast.success('Reset keywords to initial SEO plan defaults');
  };

  const handleSave = () => {
    const override: ToolOverride = {
      customName: customName.trim() !== tool.name ? customName.trim() : undefined,
      customCategory: customCategory !== tool.category ? customCategory : undefined,
      customDescription:
        customDescription.trim() !== tool.intro ? customDescription.trim() : undefined,
      customBadge: customBadge || undefined,
      disabled: disabled ? true : false,
      customCode: customCode.trim() ? customCode.trim() : undefined,
      customKeywords: keywords.length > 0 ? keywords : undefined,
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
                rows={4}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Explain how this tool helps visitors..."
                className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Dedicated Multi-Keyword SEO Management Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>SEO Multi-Keywords ({keywords.length})</span>
              </h2>

              <button
                type="button"
                onClick={handleResetKeywords}
                className="text-[11px] font-bold text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Restore original keywords from the master SEO blueprint"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to SEO Plan Defaults</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Manage multi-keywords for this tool. Add primary, secondary, and long-tail keywords to optimize search rankings and Google snippet targeting.
            </p>

            {/* Add Keyword Input Field */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Type a new keyword (or comma-separated keywords) and press Enter..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Keyword</span>
              </button>
            </div>

            {/* Active Keyword Chips with Edit and Delete */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Active Keywords (Click to Edit or Delete)</span>
                <span>{keywords.length} total</span>
              </div>

              {keywords.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 text-center text-xs text-slate-500">
                  No keywords assigned yet. Add some keywords above to boost this tool's search ranking!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
                  {keywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-medium text-slate-200 transition-colors"
                    >
                      {editingIndex === idx ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(idx);
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            autoFocus
                            className="px-2 py-0.5 rounded bg-slate-900 border border-sky-500 text-white text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="p-1 hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            onClick={() => handleStartEdit(idx)}
                            className="cursor-pointer hover:text-sky-300"
                            title="Click to edit keyword"
                          >
                            #{kw}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-0.5 rounded text-slate-500 hover:text-sky-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Edit keyword"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKeyword(idx)}
                            className="p-0.5 rounded text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete keyword"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
