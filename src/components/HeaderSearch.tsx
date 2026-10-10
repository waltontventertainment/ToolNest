import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Command } from 'lucide-react';
import { tools } from '../lib/registry';
import { ToolDefinition } from '../lib/types';

export const HeaderSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Sync with URL query parameter if user is on homepage
  useEffect(() => {
    if (location.pathname === '/') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) {
        setQuery(q);
      }
    }
  }, [location]);

  // Global keyboard shortcut (⌘K, Ctrl+K, or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input/textarea (unless it's ⌘K)
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Default curated popular tools
      return tools.slice(0, 6);
    }

    return tools
      .filter((tool) => {
        const nameMatch = tool.name.toLowerCase().includes(trimmed);
        const catMatch = tool.category.toLowerCase().includes(trimmed);
        const descMatch = tool.metaDescription.toLowerCase().includes(trimmed);
        const kwMatch = tool.keywords.some((k) => k.toLowerCase().includes(trimmed));
        return nameMatch || catMatch || descMatch || kwMatch;
      })
      .slice(0, 8);
  }, [query]);

  // Reset selected index when filtered tools change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTools]);

  const handleSelectTool = (tool: ToolDefinition) => {
    setIsOpen(false);
    navigate(`/tools/${tool.slug}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();

    if (filteredTools.length > 0 && selectedIndex >= 0 && selectedIndex < filteredTools.length && trimmed) {
      handleSelectTool(filteredTools[selectedIndex]);
      return;
    }

    setIsOpen(false);
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTools.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Search Trigger Button in the Right-Side Toolbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-signature-header px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 text-foreground/80 hover:text-foreground text-xs font-bold group cursor-pointer"
        title="Search tools (⌘K or /)"
        aria-label="Search tools"
      >
        <div className="w-5 h-5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-115 text-primary">
          <Search className="w-4 h-4 transition-transform group-hover:rotate-6 drop-shadow-[0_1px_2px_rgba(99,102,241,0.3)]" />
        </div>
        <span className="hidden sm:inline font-bold">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md border border-border shadow-2xs group-hover:border-primary/50 group-hover:text-primary transition-all">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      {/* Spotlight Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-background/70 backdrop-blur-md animate-in fade-in-0 duration-150">
          <div
            ref={dialogRef}
            className="w-full max-w-xl bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative border-b border-border/70 p-3 sm:p-4 bg-card">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-primary shrink-0 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${tools.length} tools (e.g. PDF, Image, QR)...`}
                  className="w-full h-11 pl-11 pr-32 sm:pr-36 bg-secondary/50 focus:bg-background border border-border/80 focus:border-primary/60 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-primary/15 transition-all"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded-md">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-border/60 ml-1"
                    title="Close search"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Suggestions Header */}
            <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>{query.trim() ? `Matching Tools (${filteredTools.length})` : 'Popular Tools'}</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] lowercase font-normal">
                <span>use</span>
                <kbd className="px-1 py-0.2 bg-muted rounded border text-[9px]">↑↓</kbd>
                <span>to navigate</span>
              </span>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-border/20">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool, idx) => {
                  const Icon = tool.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={tool.slug}
                      type="button"
                      onClick={() => handleSelectTool(tool)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3.5 transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30 shadow-2xs'
                          : 'hover:bg-muted/60 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {tool.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0 border border-border/50">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-relaxed mt-0.5">
                          {tool.metaDescription}
                        </p>
                      </div>

                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-primary translate-x-1' : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="py-12 px-4 text-center">
                  <p className="text-xs text-muted-foreground mb-3">No tools matching &ldquo;{query}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Search all on home page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-3 bg-muted/40 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              {query.trim() && filteredTools.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-primary hover:underline font-semibold flex items-center gap-1 text-xs"
                >
                  <span>View all results on homepage for &ldquo;{query}&rdquo;</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              ) : (
                <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-card border rounded text-[10px]">ESC</kbd> to exit search</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
