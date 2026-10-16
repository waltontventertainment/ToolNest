import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Code,
  Download,
  Copy,
  Check,
  Eye,
  Edit3,
  Columns,
  RefreshCw,
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  Maximize2,
  Minimize2,
  Trash2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. MARKDOWN STUDIO APP
// ==========================================

const SAMPLE_MARKDOWN = `# Welcome to Markdown Studio 📝
A clean, privacy-first markdown editor and documentation studio running 100% locally in your browser.

## Key Capabilities
- **Real-Time Split Preview**: Instant side-by-side rendering as you type.
- **100% Private**: Zero cloud sync, auto-saved safely to your browser's \`localStorage\`.
- **Export Ready**: Download formatted documents as \`.md\` or standalone \`.html\`.

### Formatting Cheat Sheet
You can format text with **bold**, *italics*, ~~strikethrough~~, or \`inline code\`.

#### Code Block Example
\`\`\`javascript
function calculateScore(items) {
  return items.reduce((acc, curr) => acc + curr.rating, 0);
}
console.log("Ready to ship!");
\`\`\`

#### Task List
- [x] Complete PDF Editor fix
- [x] Design mobile App Launcher grid
- [ ] Write documentation in Markdown Studio

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

Feel free to start typing or click **Clear** to start from scratch!
`;

export const MarkdownStudio: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tz_app_markdown_studio');
      if (saved) return saved;
    }
    return SAMPLE_MARKDOWN;
  });

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tz_app_markdown_studio', content);
    } catch {}
  }, [content]);

  // Statistics
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readTime = Math.ceil(words / 200) || 1;

  // Formatting actions
  const insertSyntax = (before: string, after: string = '', defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Markdown copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = (format: 'md' | 'html') => {
    let output = content;
    let mimeType = 'text/markdown';
    let filename = `Document_${Date.now()}.md`;

    if (format === 'html') {
      mimeType = 'text/html';
      filename = `Document_${Date.now()}.html`;
      output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Exported Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #475569; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
${renderSimpleMarkdownHtml(content)}
</body>
</html>`;
    }

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* App Action Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Quick Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertSyntax('**', '**', 'bold text')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs font-bold font-mono px-2"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*', '*', 'italic text')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs italic font-serif px-2"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('## ', '', 'Heading')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs font-bold px-2"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('> ', '', 'Quote')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs px-2"
            title="Quote"
          >
            " "
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('`', '`', 'code')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs font-mono px-2"
            title="Inline Code"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('```\n', '\n```', 'code block')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs font-mono px-2"
            title="Code Block"
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('- ', '', 'List item')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs px-2"
            title="Bulleted List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('[Link Title](', ')', 'https://example.com')}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground text-xs px-2"
            title="Link"
          >
            Link
          </button>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'edit' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'split' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'preview' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium flex items-center gap-1 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleDownload('md')}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .md</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-h-[500px]">
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            className={`flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs ${
              viewMode === 'edit' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="bg-secondary/40 border-b border-border/60 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Markdown Source</span>
              <button
                type="button"
                onClick={() => setContent('')}
                className="hover:text-destructive text-[11px] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write or paste markdown here..."
              className="w-full flex-1 p-4 font-mono text-sm leading-relaxed bg-transparent text-foreground border-none resize-none focus:outline-none min-h-[460px]"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Formatted Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs ${
              viewMode === 'preview' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="bg-secondary/40 border-b border-border/60 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Live Document View</span>
              <button
                type="button"
                onClick={() => handleDownload('html')}
                className="hover:text-primary text-[11px] flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export HTML</span>
              </button>
            </div>
            <div
              className="w-full flex-1 p-5 overflow-y-auto max-h-[550px] text-foreground text-sm leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderSimpleMarkdownHtml(content) }}
            />
          </div>
        )}
      </div>

      {/* Document Metrics Bar */}
      <div className="bg-card border border-border/80 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground shadow-2xs font-mono">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-foreground">{words}</strong></span>
          <span>Characters: <strong className="text-foreground">{chars}</strong></span>
          <span>Reading time: ~<strong className="text-foreground">{readTime} min</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Check className="w-3 h-3" />
          <span>Auto-saved locally</span>
        </div>
      </div>
    </div>
  );
};

// Safe markdown-to-html renderer
function renderSimpleMarkdownHtml(md: string): string {
  if (!md) return '<p class="text-muted-foreground italic">Nothing to preview yet.</p>';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-secondary/70 p-3.5 rounded-xl font-mono text-xs overflow-x-auto my-3 border border-border/60"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary font-semibold">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-foreground mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-extrabold text-foreground mt-5 mb-2.5 pb-1 border-b border-border/60">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-foreground mt-2 mb-3 pb-1.5 border-b border-border/80">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary/70 pl-3.5 my-3 italic text-muted-foreground bg-primary/5 py-1 rounded-r-lg">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-foreground/90 my-0.5">$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium hover:opacity-80">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="my-2.5 text-foreground/90">');

  return `<p class="my-2.5 text-foreground/90">${html}</p>`;
}


// ==========================================
// 2. LIVE CODE PLAYGROUND APP
// ==========================================

const SAMPLE_HTML = `<div class="card">
  <h2>Live Code Studio ✨</h2>
  <p>Test HTML, CSS, and JavaScript with instant client-side rendering.</p>
  <button id="counterBtn">Clicks: 0</button>
</div>`;

const SAMPLE_CSS = `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 360px;
  width: 90%;
}

h2 {
  margin-top: 0;
  color: #1e1b4b;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

button:hover {
  background: #4338ca;
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}`;

const SAMPLE_JS = `let count = 0;
const btn = document.getElementById('counterBtn');

if (btn) {
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = 'Clicks: ' + count;
    console.log('Button clicked! New count:', count);
  });
}`;

export const CodePlayground: React.FC = () => {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [css, setCss] = useState(SAMPLE_CSS);
  const [js, setJs] = useState(SAMPLE_JS);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [srcDoc, setSrcDoc] = useState('');

  // Update bundled preview on code changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
      setSrcDoc(fullDoc);
    }, 250);

    return () => clearTimeout(timer);
  }, [html, css, js]);

  const handleReset = () => {
    setHtml(SAMPLE_HTML);
    setCss(SAMPLE_CSS);
    setJs(SAMPLE_JS);
    toast.info('Playground reset to default template.');
  };

  const handleDownload = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Exported Web App</title>
  <style>${css}</style>
</head>
<body>
${html}
<script>${js}</script>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WebApp_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded standalone Web App HTML!');
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* App Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Code Tabs */}
        <div className="flex items-center gap-1.5 bg-secondary/80 p-0.5 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'html' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
            }`}
          >
            HTML
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'css' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
            }`}
          >
            CSS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('js')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'js' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
            }`}
          >
            JS
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-h-[520px]">
        {/* Editor Area */}
        <div className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-secondary/40 border-b border-border/60 px-4 py-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Editor ({activeTab.toUpperCase()})</span>
            <span className="text-[11px]">Instant Live Compile</span>
          </div>
          {activeTab === 'html' && (
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              placeholder="<!-- Write HTML here -->"
              className="w-full flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-foreground border-none resize-none focus:outline-none min-h-[460px]"
              spellCheck={false}
            />
          )}
          {activeTab === 'css' && (
            <textarea
              value={css}
              onChange={e => setCss(e.target.value)}
              placeholder="/* Write CSS styles here */"
              className="w-full flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-foreground border-none resize-none focus:outline-none min-h-[460px]"
              spellCheck={false}
            />
          )}
          {activeTab === 'js' && (
            <textarea
              value={js}
              onChange={e => setJs(e.target.value)}
              placeholder="// Write JavaScript code here"
              className="w-full flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-foreground border-none resize-none focus:outline-none min-h-[460px]"
              spellCheck={false}
            />
          )}
        </div>

        {/* Live Sandboxed Iframe Preview */}
        <div className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-secondary/40 border-b border-border/60 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              <span>Live Web Sandbox</span>
            </span>
            <span className="text-[11px] font-mono">Isolated IFrame</span>
          </div>
          <iframe
            title="Live Sandbox Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full flex-1 min-h-[460px] border-none bg-white rounded-b-2xl"
          />
        </div>
      </div>
    </div>
  );
};
