import React, { useState, useEffect } from 'react';
import { ToolPanel, OutputBox, DownloadButton, CopyButton } from '../lib/toolkit';
import { RefreshCw, Copy, Check, Sparkles, Sliders, Globe, Clock, Calculator, Code, Palette, Smartphone, DollarSign, FileCode, Monitor, Layers } from 'lucide-react';
import { toast } from 'sonner';

// 1. Markdown to HTML Converter
export const MarkdownToHtmlConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Hello World\n\nWelcome to **Toolzaro** Markdown Converter!\n\n- Feature 1: Live HTML generation\n- Feature 2: Clean formatting\n\n> "Simplicity is prerequisite for reliability."');
  const [htmlOutput, setHtmlOutput] = useState('');

  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
      .replace(/^\n+/, '')
      .replace(/\n$/g, '');

    // List items
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/sim, '<ul>$1</ul>');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<blockquote')) return p;
      return `<p>${p.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');

    return html;
  };

  useEffect(() => {
    setHtmlOutput(parseMarkdown(markdown));
  }, [markdown]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Markdown Input</label>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            className="w-full h-80 p-3 rounded-lg border bg-transparent font-mono text-sm leading-relaxed"
            placeholder="Type markdown here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Live Preview</label>
          <div 
            className="w-full h-80 p-4 rounded-lg border bg-secondary/10 overflow-auto prose dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </div>
      </div>

      <OutputBox value={htmlOutput} label="Generated HTML Code" />
    </div>
  );
};

// 2. JSON to XML Converter
export const JsonToXmlConverter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "company": "Toolzaro",\n  "version": 2.0,\n  "active": true,\n  "users": [\n    { "id": 1, "name": "Alice" },\n    { "id": 2, "name": "Bob" }\n  ]\n}');
  const [rootTag, setRootTag] = useState('root');
  const [xmlOutput, setXmlOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const jsonToXml = (obj: any, indent = '  '): string => {
    let xml = '';
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const value = obj[prop];
        if (Array.isArray(value)) {
          for (const item of value) {
            xml += `${indent}<${prop}>\n${jsonToXml(item, indent + '  ')}${indent}</${prop}>\n`;
          }
        } else if (typeof value === 'object' && value !== null) {
          xml += `${indent}<${prop}>\n${jsonToXml(value, indent + '  ')}${indent}</${prop}>\n`;
        } else {
          xml += `${indent}<${prop}>${value}</${prop}>\n`;
        }
      }
    }
    return xml;
  };

  useEffect(() => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonInput);
      const generated = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${jsonToXml(parsed, '  ')}</${rootTag}>`;
      setXmlOutput(generated);
    } catch (err: any) {
      setError('Invalid JSON format: ' + err.message);
      setXmlOutput('');
    }
  }, [jsonInput, rootTag]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Root XML Tag Name</label>
            <input 
              type="text" 
              value={rootTag} 
              onChange={e => setRootTag(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))} 
              className="w-full p-2 rounded border bg-transparent font-mono text-sm"
            />
          </div>
        </div>
      </ToolPanel>

      <div>
        <label className="block text-sm font-medium mb-1">JSON Input</label>
        <textarea
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          className="w-full h-48 p-3 rounded-lg border bg-transparent font-mono text-sm"
        />
      </div>

      {error ? (
        <div className="p-3 text-sm rounded bg-destructive/10 border border-destructive/20 text-destructive">{error}</div>
      ) : (
        <OutputBox value={xmlOutput} label="Generated XML Output" />
      )}
    </div>
  );
};

// 3. Aspect Ratio Calculator
export const ScreenAspectRatioCalculator: React.FC = () => {
  const [srcWidth, setSrcWidth] = useState(1920);
  const [srcHeight, setSrcHeight] = useState(1080);
  const [targetWidth, setTargetWidth] = useState(1280);
  const [targetHeight, setTargetHeight] = useState(720);
  const [lockRatio, setLockRatio] = useState<'width' | 'height'>('width');

  // Greatest Common Divisor helper
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const divisor = gcd(srcWidth || 1, srcHeight || 1);
  const ratioW = (srcWidth || 1) / divisor;
  const ratioH = (srcHeight || 1) / divisor;

  useEffect(() => {
    if (lockRatio === 'width') {
      const calculatedH = Math.round((targetWidth * srcHeight) / srcWidth) || 0;
      setTargetHeight(calculatedH);
    } else {
      const calculatedW = Math.round((targetHeight * srcWidth) / srcHeight) || 0;
      setTargetWidth(calculatedW);
    }
  }, [srcWidth, srcHeight, targetWidth, targetHeight, lockRatio]);

  const presets = [
    { name: '16:9 Widescreen', w: 1920, h: 1080 },
    { name: '4:3 Standard', w: 1024, h: 768 },
    { name: '1:1 Square', w: 1080, h: 1080 },
    { name: '9:16 Mobile Vertical', w: 1080, h: 1920 },
    { name: '21:9 Ultrawide', w: 2560, h: 1080 },
  ];

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aspect Ratio Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => {
                    setSrcWidth(p.w);
                    setSrcHeight(p.h);
                  }}
                  className="px-3 py-1.5 rounded-md text-xs border bg-secondary/50 hover:bg-secondary font-medium"
                >
                  {p.name} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Original Dimensions</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Width (px)</label>
                  <input type="number" value={srcWidth} onChange={e => setSrcWidth(Number(e.target.value))} className="w-full p-2 rounded border bg-transparent font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Height (px)</label>
                  <input type="number" value={srcHeight} onChange={e => setSrcHeight(Number(e.target.value))} className="w-full p-2 rounded border bg-transparent font-mono text-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Target Calculated Dimensions</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Target Width (px)</label>
                  <input 
                    type="number" 
                    value={targetWidth} 
                    onChange={e => {
                      setTargetWidth(Number(e.target.value));
                      setLockRatio('width');
                    }} 
                    className="w-full p-2 rounded border bg-transparent font-mono text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Target Height (px)</label>
                  <input 
                    type="number" 
                    value={targetHeight} 
                    onChange={e => {
                      setTargetHeight(Number(e.target.value));
                      setLockRatio('height');
                    }} 
                    className="w-full p-2 rounded border bg-transparent font-mono text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ToolPanel>

      <div className="p-5 rounded-xl bg-card border flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1 font-semibold">Simplified Aspect Ratio</span>
          <span className="text-3xl font-extrabold font-mono text-primary">{ratioW} : {ratioH}</span>
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          CSS Rule: <code className="bg-muted px-2 py-1 rounded text-foreground">aspect-ratio: {ratioW} / {ratioH};</code>
        </div>
      </div>
    </div>
  );
};

// 4. Color Palette Generator
export const ColorPaletteGenerator: React.FC = () => {
  const [colors, setColors] = useState<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);
  const [scheme, setScheme] = useState<'random' | 'warm' | 'cool' | 'pastel'>('random');

  const generateRandomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  const generatePalette = () => {
    if (scheme === 'random') {
      setColors(Array.from({ length: 5 }, () => generateRandomHex()));
    } else if (scheme === 'warm') {
      setColors(['#f43f5e', '#fb923c', '#facc15', '#f87171', '#fbbf24']);
    } else if (scheme === 'cool') {
      setColors(['#0284c7', '#06b6d4', '#10b981', '#3b82f6', '#6366f1']);
    } else {
      setColors(['#fbcfe8', '#fef08a', '#bbf7d0', '#bae6fd', '#ddd6fe']);
    }
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Palette Style:</label>
            <select value={scheme} onChange={e => setScheme(e.target.value as any)} className="p-2 rounded border bg-transparent text-sm">
              <option value="random">Random Harmonious</option>
              <option value="warm">Warm Sunset</option>
              <option value="cool">Cool Ocean</option>
              <option value="pastel">Soft Pastel</option>
            </select>
          </div>

          <button
            onClick={generatePalette}
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Generate New Palette
          </button>
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {colors.map((col, idx) => (
          <div key={idx} className="space-y-2 group">
            <div 
              className="h-36 rounded-xl border shadow-sm transition-transform group-hover:scale-105 flex items-end p-3 cursor-pointer"
              style={{ backgroundColor: col }}
              onClick={() => {
                navigator.clipboard.writeText(col);
                toast.success(`Copied ${col} to clipboard`);
              }}
            >
              <span className="text-xs font-mono font-bold px-2 py-1 bg-black/60 text-white rounded">
                {col}
              </span>
            </div>
            <div className="text-center">
              <CopyButton text={col} className="w-full text-xs py-1" />
            </div>
          </div>
        ))}
      </div>

      <OutputBox 
        value={`:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`} 
        label="CSS Custom Variables" 
      />
    </div>
  );
};

// 5. PX to REM / EM Converter
export const PxToRemConverter: React.FC = () => {
  const [baseSize, setBaseSize] = useState(16);
  const [pxValue, setPxValue] = useState(24);
  const [remValue, setRemValue] = useState(1.5);

  const handlePxChange = (px: number) => {
    setPxValue(px);
    setRemValue(Number((px / baseSize).toFixed(4)));
  };

  const handleRemChange = (rem: number) => {
    setRemValue(rem);
    setPxValue(Math.round(rem * baseSize));
  };

  const quickTable = [8, 12, 14, 16, 18, 20, 24, 32, 48, 64];

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Root Font Size (px)</label>
            <input 
              type="number" 
              value={baseSize} 
              onChange={e => {
                const b = Number(e.target.value) || 16;
                setBaseSize(b);
                setRemValue(Number((pxValue / b).toFixed(4)));
              }} 
              className="w-full p-2 rounded border bg-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pixels (px)</label>
            <input 
              type="number" 
              value={pxValue} 
              onChange={e => handlePxChange(Number(e.target.value))} 
              className="w-full p-2 rounded border bg-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">REM / EM</label>
            <input 
              type="number" 
              step="0.0625"
              value={remValue} 
              onChange={e => handleRemChange(Number(e.target.value))} 
              className="w-full p-2 rounded border bg-transparent font-mono text-sm"
            />
          </div>
        </div>
      </ToolPanel>

      <div className="p-4 rounded-xl bg-card border">
        <h4 className="text-sm font-semibold mb-3">Quick Pixel-to-REM Conversion Table</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          {quickTable.map(p => (
            <div 
              key={p} 
              onClick={() => handlePxChange(p)}
              className={`p-2.5 rounded border text-center cursor-pointer transition-colors ${pxValue === p ? 'bg-primary text-primary-foreground font-bold' : 'bg-secondary/40 hover:bg-secondary'}`}
            >
              {p}px = {(p / baseSize).toFixed(3)}rem
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Global Time Zone Converter
export const TimeZoneConverter: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState(new Date().toISOString().slice(0, 16));

  const timeZones = [
    { label: 'UTC (Coordinated Universal Time)', zone: 'UTC' },
    { label: 'EST / New York (US East)', zone: 'America/New_York' },
    { label: 'PST / San Francisco (US West)', zone: 'America/Los_Angeles' },
    { label: 'GMT / London (UK)', zone: 'Europe/London' },
    { label: 'CET / Berlin (Central Europe)', zone: 'Europe/Berlin' },
    { label: 'BST / Dhaka (Bangladesh)', zone: 'Asia/Dhaka' },
    { label: 'IST / New Delhi (India)', zone: 'Asia/Kolkata' },
    { label: 'JST / Tokyo (Japan)', zone: 'Asia/Tokyo' },
    { label: 'AEST / Sydney (Australia)', zone: 'Australia/Sydney' },
  ];

  const formatInZone = (zone: string) => {
    try {
      const date = new Date(selectedTime);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        dateStyle: 'full',
        timeStyle: 'medium'
      }).format(date);
    } catch (e) {
      return 'Invalid Time';
    }
  };

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div>
          <label className="block text-sm font-medium mb-1">Select Date & Time</label>
          <input 
            type="datetime-local" 
            value={selectedTime} 
            onChange={e => setSelectedTime(e.target.value)}
            className="p-2.5 rounded border bg-transparent text-sm font-mono"
          />
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {timeZones.map(tz => (
          <div key={tz.zone} className="p-4 rounded-xl border bg-card space-y-1">
            <span className="text-xs text-muted-foreground font-medium">{tz.label}</span>
            <p className="text-sm font-bold font-mono text-primary">{formatInZone(tz.zone)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. User-Agent String Parser
export const UserAgentParser: React.FC = () => {
  const [ua, setUa] = useState(typeof navigator !== 'undefined' ? navigator.userAgent : '');

  const parseUA = (string: string) => {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let device = 'Desktop';

    if (/chrome|crios/i.test(string) && !/edg/i.test(string)) browser = 'Google Chrome';
    else if (/safari/i.test(string) && !/chrome/i.test(string)) browser = 'Apple Safari';
    else if (/firefox|fxios/i.test(string)) browser = 'Mozilla Firefox';
    else if (/edg/i.test(string)) browser = 'Microsoft Edge';

    if (/windows/i.test(string)) os = 'Windows OS';
    else if (/macintosh|mac os/i.test(string)) os = 'macOS';
    else if (/android/i.test(string)) { os = 'Android'; device = 'Mobile/Tablet'; }
    else if (/iphone|ipad|ipod/i.test(string)) { os = 'iOS'; device = 'Mobile/Tablet'; }
    else if (/linux/i.test(string)) os = 'Linux';

    return { browser, os, device };
  };

  const parsed = parseUA(ua);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="space-y-3">
          <label className="block text-sm font-medium">User-Agent String</label>
          <textarea 
            value={ua} 
            onChange={e => setUa(e.target.value)}
            className="w-full h-24 p-2.5 rounded border bg-transparent font-mono text-xs leading-relaxed"
          />
          <button
            onClick={() => setUa(navigator.userAgent)}
            className="text-xs px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
          >
            Insert My Current Browser User-Agent
          </button>
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Browser</span>
          <span className="text-base font-bold text-primary">{parsed.browser}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Operating System</span>
          <span className="text-base font-bold text-primary">{parsed.os}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Device Type</span>
          <span className="text-base font-bold text-primary">{parsed.device}</span>
        </div>
      </div>
    </div>
  );
};

// 8. Loan EMI Calculator
export const FinancialEmiCalculator: React.FC = () => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);

  const tenureMonths = tenureYears * 12;
  const monthlyRate = rate / 12 / 100;

  const emi = monthlyRate > 0 
    ? Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
    : Math.round(amount / tenureMonths);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - amount;

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loan Amount ($ / BDT)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2.5 rounded border bg-transparent font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Interest Rate (% per annum)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full p-2.5 rounded border bg-transparent font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenure (Years)</label>
            <input type="number" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} className="w-full p-2.5 rounded border bg-transparent font-mono text-sm" />
          </div>
        </div>
      </ToolPanel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border bg-primary/10 border-primary/20 text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">Monthly EMI</span>
          <span className="text-2xl font-black text-primary font-mono">{emi.toLocaleString()}</span>
        </div>
        <div className="p-5 rounded-xl border bg-card text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">Total Interest</span>
          <span className="text-2xl font-bold font-mono text-amber-500">{totalInterest.toLocaleString()}</span>
        </div>
        <div className="p-5 rounded-xl border bg-card text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">Total Payment</span>
          <span className="text-2xl font-bold font-mono">{totalPayment.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// 9. Text Case & Readability Stats
export const TextCaseCounterStats: React.FC = () => {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog. Writing clear and accessible documentation helps software engineers build better products efficiently!');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <label className="block text-sm font-medium mb-1">Text Analysis Input</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full h-40 p-3 rounded border bg-transparent text-sm leading-relaxed"
          placeholder="Paste text here to analyze..."
        />
      </ToolPanel>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card text-center">
          <span className="text-xs text-muted-foreground block font-semibold uppercase">Words</span>
          <span className="text-2xl font-bold text-primary font-mono">{words}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <span className="text-xs text-muted-foreground block font-semibold uppercase">Characters</span>
          <span className="text-2xl font-bold text-primary font-mono">{chars}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <span className="text-xs text-muted-foreground block font-semibold uppercase">Sentences</span>
          <span className="text-2xl font-bold text-primary font-mono">{sentences}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <span className="text-xs text-muted-foreground block font-semibold uppercase">Est. Read Time</span>
          <span className="text-2xl font-bold text-primary font-mono">{readingTime} min</span>
        </div>
      </div>
    </div>
  );
};

// 10. SVG to PNG Converter
export const SvgToPngConverter: React.FC = () => {
  const [svgInput, setSvgInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="45" fill="#3b82f6" />\n  <polygon points="35,30 75,50 35,70" fill="#ffffff" />\n</svg>');
  const [scale, setScale] = useState(2);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const blob = new Blob([svgInput], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (img.width || 300) * scale;
        canvas.height = (img.height || 300) * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPngDataUrl(canvas.toDataURL('image/png'));
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (e) {
      setPngDataUrl(null);
    }
  }, [svgInput, scale]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Paste SVG Code</label>
            <textarea
              value={svgInput}
              onChange={e => setSvgInput(e.target.value)}
              className="w-full h-36 p-3 rounded border bg-transparent font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Export Scale Multiplier:</label>
            <div className="flex gap-2">
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${scale === s ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </ToolPanel>

      {pngDataUrl && (
        <div className="p-6 rounded-xl border bg-card text-center space-y-4">
          <h4 className="text-sm font-semibold">Rendered PNG Preview</h4>
          <img src={pngDataUrl} alt="SVG converted PNG" className="max-h-48 mx-auto shadow-sm rounded border object-contain bg-muted/20 p-2" />
          <DownloadButton onClick={() => {
            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = 'vector-export.png';
            a.click();
          }} label="Download PNG Image" />
        </div>
      )}
    </div>
  );
};
