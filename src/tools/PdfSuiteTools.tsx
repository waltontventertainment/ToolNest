// Global polyfills for modern JS features required by pdfjs-dist
if (typeof Map !== 'undefined') {
  if (!('getOrInsertComputed' in Map.prototype)) {
    (Map.prototype as any).getOrInsertComputed = function (key: any, callbackFunction: (k: any) => any) {
      if (this.has(key)) {
        return this.get(key);
      }
      const value = callbackFunction(key);
      this.set(key, value);
      return value;
    };
  }
  if (!('getOrInsert' in Map.prototype)) {
    (Map.prototype as any).getOrInsert = function (key: any, defaultValue: any) {
      if (this.has(key)) {
        return this.get(key);
      }
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}

if (typeof WeakMap !== 'undefined') {
  if (!('getOrInsertComputed' in WeakMap.prototype)) {
    (WeakMap.prototype as any).getOrInsertComputed = function (key: any, callbackFunction: (k: any) => any) {
      if (this.has(key)) {
        return this.get(key);
      }
      const value = callbackFunction(key);
      this.set(key, value);
      return value;
    };
  }
}

if (typeof Promise !== 'undefined' && !('withResolvers' in Promise)) {
  (Promise as any).withResolvers = function () {
    let resolve: any, reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Global polyfills for TypedArray toHex
const installToHex = (target: any) => {
  if (target && !('toHex' in target.prototype)) {
    try {
      Object.defineProperty(target.prototype, 'toHex', {
        value: function toHex(): string {
          let hex = '';
          const len = this && typeof this.length === 'number' ? this.length : 0;
          for (let i = 0; i < len; i++) {
            const byte = Number(this[i]) & 0xff;
            hex += byte.toString(16).padStart(2, '0');
          }
          return hex;
        },
        writable: true,
        configurable: true,
      });
    } catch {
      // safe ignore
    }
  }
};
if (typeof Uint8Array !== 'undefined') installToHex(Uint8Array);
if (typeof Uint8ClampedArray !== 'undefined') installToHex(Uint8ClampedArray);

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, Merge, Scissors, FileCode, Image as ImageIcon, RotateCw, RotateCcw,
  Stamp, Download, Upload, Trash2, Copy, Check, RefreshCw, FilePlus, 
  ArrowRight, ShieldAlert, Layers, Eye, ZoomIn, ZoomOut, Printer, Search,
  Sliders, ChevronLeft, ChevronRight, Maximize2, CheckSquare, Square,
  MoveUp, MoveDown, Sparkles, X, Filter, BookOpen, ExternalLink, Settings,
  Type, AlignLeft, Globe, Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadBlob, downloadDataUrl, downloadFilesAsZip, copyDataUrlToClipboard } from '../lib/downloadHelper';

// Bulletproof PDF.js worker setup: prefer self-contained local worker with polyfills
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/legacy/build/pdf.worker.min.mjs`;
  }
}

// ----------------------------------------------------
// SHARED ROBUST PDF HELPER FUNCTIONS
// ----------------------------------------------------
async function getPdfJsDocument(bytes: Uint8Array) {
  const safeData = new Uint8Array(bytes.slice(0));
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: safeData,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      enableXfa: true,
      standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/standard_fonts/`
    });
    return await loadingTask.promise;
  } catch {
    const fallbackTask = pdfjsLib.getDocument({
      data: safeData,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/cmaps/`,
      cMapPacked: true,
      enableXfa: true,
    });
    return await fallbackTask.promise;
  }
}

async function renderPdfPageToCanvas(
  pdfDoc: any, 
  pageNum: number, 
  scale: number = 2.0, 
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNum);
  const safeScale = Math.min(Math.max(scale || 1.5, 0.5), 3.5);
  const viewport = page.getViewport({ scale: safeScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');
  
  // Paint crisp white background so JPEG and transparent PDF layers render perfectly
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const renderTask = page.render({
    canvasContext: ctx,
    viewport: viewport
  });
  await renderTask.promise;

  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  let dataUrl = '';
  try {
    dataUrl = canvas.toDataURL(mime, quality);
  } catch {
    dataUrl = canvas.toDataURL('image/png');
  }

  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height
  };
}

// Combining marks in Bengali, Devanagari, Arabic and other scripts
const BENGALI_COMBINING_REGEX = /[\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7]/;
const GENERAL_COMBINING_REGEX = /[\p{M}\p{Diacritic}\u0900-\u0D7F]/u;
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
}

// Dedicated repair for Bengali and Indic script anomalies produced by PDF font encoders
export function repairBengaliAndIndicText(text: string): string {
  if (!text) return '';
  let s = text.normalize('NFC');

  // 1. Repair split O-kar (ে + া -> ো) and OU-kar (ে + ৗ -> ৌ)
  s = s.replace(/\u09C7\s*\u09BE/g, '\u09CB');
  s = s.replace(/\u09C7\s*\u09D7/g, '\u09CC');

  // 2. Remove whitespace between consonant/vowel and Bengali vowel signs / diacritics
  s = s.replace(/([^\s\n\r])\s+([\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7])/g, '$1$2');

  // 3. Remove whitespace around hasanta (্) when joining consonants into conjuncts (যুক্তবর্ণ)
  s = s.replace(/([\u09CD])\s+([\u0985-\u09B9\u09CE\u09DC-\u09DF])/g, '$1$2');
  s = s.replace(/([\u0985-\u09B9\u09CE\u09DC-\u09DF])\s+([\u09CD])/g, '$1$2');

  // 4. Heal fragmented words where individual Bengali letters are separated by single spaces:
  // e.g. "ব া ং ল া" -> "বাংলা", "আ ল া দ া" -> "আলাদা"
  s = s.replace(/(?:[\u0985-\u09B9\u09CE\u09DC-\u09DF][\u09BE-\u09CD\u09D7\u0981-\u0983]?\s+){2,}[\u0985-\u09B9\u09CE\u09DC-\u09DF][\u09BE-\u09CD\u09D7\u0981-\u0983]?/gu, (match) => {
    const parts = match.split(' ');
    if (parts.length >= 2 && parts.every(p => p.length <= 2)) {
      return parts.join('');
    }
    return match;
  });

  // 5. Clean stray multiple spaces
  s = s.replace(/[ \t]{2,}/g, ' ');

  return s.normalize('NFC');
}

export function detectScriptLanguage(text: string): { name: string; isRTL: boolean; flag: string } {
  if (!text || !text.trim()) return { name: 'Unknown', isRTL: false, flag: '📄' };
  const sample = text.slice(0, 2000);
  
  if (/[\u0980-\u09FF]/.test(sample)) {
    return { name: 'Bengali (বাংলা)', isRTL: false, flag: '🇧🇩' };
  }
  if (ARABIC_REGEX.test(sample)) {
    return { name: 'Arabic / Urdu', isRTL: true, flag: '🌐' };
  }
  if (/[\u0900-\u097F]/.test(sample)) {
    return { name: 'Hindi (हिन्दी)', isRTL: false, flag: '🇮🇳' };
  }
  if (/[\u4E00-\u9FFF]/.test(sample)) {
    return { name: 'Chinese (中文)', isRTL: false, flag: '🇨🇳' };
  }
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(sample)) {
    return { name: 'Japanese (日本語)', isRTL: false, flag: '🇯🇵' };
  }
  if (/[\uAC00-\uD7AF]/.test(sample)) {
    return { name: 'Korean (한국어)', isRTL: false, flag: '🇰🇷' };
  }
  if (/[\u0E00-\u0E7F]/.test(sample)) {
    return { name: 'Thai (ไทย)', isRTL: false, flag: '🇹🇭' };
  }
  if (/[\u0400-\u04FF]/.test(sample)) {
    return { name: 'Cyrillic (Русский)', isRTL: false, flag: '🇷🇺' };
  }
  return { name: 'Latin / English', isRTL: false, flag: '🌐' };
}

function extractSmartTextFromItems(
  items: any[], 
  mode: 'formatted' | 'exact' | 'continuous' | 'indic' = 'formatted'
): string {
  if (!items || !items.length) return '';

  const rawTokens: RawTextItem[] = [];
  for (const it of items) {
    if (!it.str && it.str !== ' ') continue;
    const transform = it.transform || [1, 0, 0, 1, 0, 0];
    const fontSize = Math.hypot(transform[0], transform[1]) || it.height || 12;
    rawTokens.push({
      str: it.str,
      x: transform[4],
      y: transform[5],
      w: it.width || 0,
      h: it.height || fontSize,
      fontSize,
    });
  }

  if (!rawTokens.length) return '';

  // Sort by Y descending (top-to-bottom) then X ascending (left-to-right)
  rawTokens.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: RawTextItem[][] = [];
  let currentLine: RawTextItem[] = [];
  let currentLineY: number = rawTokens[0].y;
  let currentLineHeight: number = rawTokens[0].h;

  for (const token of rawTokens) {
    const yDelta = Math.abs(token.y - currentLineY);
    const threshold = Math.max(currentLineHeight, token.h, 4) * 0.52;

    if (yDelta <= threshold) {
      currentLine.push(token);
    } else {
      if (currentLine.length) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
      }
      currentLine = [token];
      currentLineY = token.y;
      currentLineHeight = token.h;
    }
  }
  if (currentLine.length) {
    currentLine.sort((a, b) => a.x - b.x);
    lines.push(currentLine);
  }

  const reconstructedLines: string[] = [];
  let lastLineY = lines[0]?.[0]?.y || 0;
  let avgLineSpacing = 14;

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const lineTokens = lines[lIdx];
    const lineY = lineTokens[0]?.y || 0;
    const lineH = lineTokens[0]?.h || 12;

    // Detect paragraph breaks if vertical gap is unusually large
    if (lIdx > 0 && mode === 'formatted') {
      const vGap = Math.abs(lastLineY - lineY);
      if (vGap > lineH * 1.65) {
        reconstructedLines.push(''); // blank line for paragraph separation
      }
    }
    lastLineY = lineY;

    let lineStr = '';
    let prevToken: RawTextItem | null = null;

    for (let i = 0; i < lineTokens.length; i++) {
      const tok = lineTokens[i];
      const tokStr = tok.str;

      if (!prevToken) {
        lineStr += tokStr;
        prevToken = tok;
        continue;
      }

      const prevEnd = prevToken.x + prevToken.w;
      const gap = tok.x - prevEnd;
      const avgFontSize = (prevToken.fontSize + tok.fontSize) / 2 || 12;
      const isSpaceChar = tokStr === ' ' || lineStr.endsWith(' ');

      const firstChar = tokStr[0];
      const lastChar = lineStr[lineStr.length - 1];
      const isCombiningMark = BENGALI_COMBINING_REGEX.test(firstChar) || GENERAL_COMBINING_REGEX.test(firstChar);
      const isPrevCombiningOrHasanta = lastChar === '\u09CD' || BENGALI_COMBINING_REGEX.test(lastChar);

      if (isSpaceChar || isCombiningMark || isPrevCombiningOrHasanta) {
        lineStr += tokStr;
      } else if (gap > avgFontSize * 0.28) {
        lineStr += ' ' + tokStr;
      } else {
        lineStr += tokStr;
      }

      prevToken = tok;
    }

    let cleanedLine = lineStr.replace(/[ \t]{2,}/g, ' ').trim();
    // Clean spaces before Bengali matras / combining marks if any slipped through
    cleanedLine = cleanedLine.replace(/ ([\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7])/g, '$1');
    cleanedLine = cleanedLine.replace(/([\u09CD]) /g, '$1');

    if (cleanedLine || mode === 'exact') {
      reconstructedLines.push(cleanedLine.normalize('NFC'));
    }
  }

  let finalResult = '';
  if (mode === 'continuous') {
    finalResult = reconstructedLines.filter(Boolean).join(' ');
  } else {
    finalResult = reconstructedLines.join('\n');
  }

  // Always apply Bengali/Indic healing
  finalResult = repairBengaliAndIndicText(finalResult);

  return finalResult;
}

// ----------------------------------------------------
// 1. PDF MERGER TOOL (WITH LIVE DOCUMENT PREVIEWS)
// ----------------------------------------------------
export const PdfMergerTool: React.FC = () => {
  const [files, setFiles] = useState<{ 
    name: string; 
    size: number; 
    bytes: Uint8Array; 
    pageCount: number; 
    previewUrl?: string 
  }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ title: string; url: string } | null>(null);

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setIsProcessing(true);
    const newItems: typeof files = [];
    try {
      for (const f of selected) {
        if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
          const buf = await f.arrayBuffer();
          const bytes = new Uint8Array(buf);
          const doc = await PDFDocument.load(bytes);
          const pageCount = doc.getPageCount();

          // Render first page preview thumbnail
          let previewUrl: string | undefined;
          try {
            const pdfjsDoc = await getPdfJsDocument(bytes);
            const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, 1, 0.5);
            previewUrl = dataUrl;
          } catch {
            // non-fatal thumbnail fallback
          }

          newItems.push({ 
            name: f.name, 
            size: f.size, 
            bytes, 
            pageCount, 
            previewUrl 
          });
        }
      }
      setFiles(prev => [...prev, ...newItems]);
      toast.success(`Loaded ${newItems.length} PDF file(s)`);
    } catch (err) {
      console.error(err);
      toast.error('Could not parse one or more PDF files. Ensure they are unencrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const copy = [...files];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    setFiles(copy);
  };

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of files) {
        const doc = await PDFDocument.load(item.bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach(p => mergedPdf.addPage(p));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `Merged_Document_${files.length}_files.pdf`);
      toast.success(`Successfully combined ${files.length} PDFs (${totalPages} total pages)!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to merge PDFs. One of the documents may be password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Merge className="w-5 h-5 text-primary" /> PDF Merger with Document Viewer
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Combine multiple PDF documents in custom order. Client-side, confidential processing with page count validation.
          </p>
        </div>
        {files.length > 0 && (
          <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
            {files.length} Files • {totalPages} Total Pages
          </div>
        )}
      </div>

      <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-primary/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
        <div className="w-12 h-12 rounded-2xl icon-squircle text-primary group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-foreground">Click to select PDF files or drop them here</span>
        <span className="text-[11px] text-muted-foreground">Select 2 or more PDF documents to merge</span>
        <input type="file" accept="application/pdf" multiple onChange={handleAddFiles} className="hidden" />
      </label>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Documents to Merge (Drag / Order)</span>
            <button onClick={() => setFiles([])} className="text-red-500 hover:underline">Clear All</button>
          </div>

          <div className="space-y-2.5">
            {files.map((f, idx) => (
              <div 
                key={`${f.name}-${idx}`} 
                className="p-3 bg-secondary/30 rounded-2xl border border-border/70 flex items-center justify-between gap-3 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-10 h-14 bg-background border border-border rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">{f.pageCount} {f.pageCount === 1 ? 'page' : 'pages'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveFile(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-card border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, idx + 1)}
                    disabled={idx === files.length - 1}
                    className="p-1.5 rounded-lg bg-card border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  {f.previewUrl && (
                    <button
                      onClick={() => setPreviewModal({ title: f.name, url: f.previewUrl! })}
                      className="p-1.5 rounded-lg bg-card border border-border hover:bg-secondary text-primary cursor-pointer"
                      title="Inspect First Page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1.5 rounded-lg bg-card border border-border hover:bg-red-500/10 text-red-500 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleMerge}
            disabled={isProcessing || files.length < 2}
            className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
            <span>Combine {files.length} PDF Documents ({totalPages} Pages)</span>
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="bg-card border border-border p-4 rounded-2xl max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold truncate">{previewModal.title}</span>
              <button onClick={() => setPreviewModal(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewModal.url} alt="PDF Preview" className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-border/80 shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 2. PDF SPLITTER & PAGE EXTRACTOR (WITH VISUAL PAGE GRID)
// ----------------------------------------------------
export const PdfSplitterTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [pages, setPages] = useState<{ pageNum: number; thumbnail: string; selected: boolean }[]>([]);
  const [rangeInput, setRangeInput] = useState('');
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspectModal, setInspectModal] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setIsRenderingThumbnails(true);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count });

      // Render thumbnails for each page
      const pdfjsDoc = await getPdfJsDocument(bytes);
      const rendered: { pageNum: number; thumbnail: string; selected: boolean }[] = [];

      for (let i = 1; i <= count; i++) {
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, i, 0.45);
        rendered.push({ pageNum: i, thumbnail: dataUrl, selected: true });
      }

      setPages(rendered);
      setRangeInput(`1-${count}`);
      toast.success(`Loaded "${f.name}" with ${count} visual pages`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load PDF pages');
    } finally {
      setIsRenderingThumbnails(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setPages(prev => {
      const updated = prev.map(p => p.pageNum === pageNum ? { ...p, selected: !p.selected } : p);
      // Update text range
      const selectedNums = updated.filter(p => p.selected).map(p => p.pageNum);
      setRangeInput(formatPageRanges(selectedNums));
      return updated;
    });
  };

  const selectAll = (select: boolean) => {
    setPages(prev => {
      const updated = prev.map(p => ({ ...p, selected: select }));
      setRangeInput(select && file ? `1-${file.pageCount}` : '');
      return updated;
    });
  };

  const selectPattern = (pattern: 'odd' | 'even') => {
    if (!file) return;
    setPages(prev => {
      const updated = prev.map(p => ({
        ...p,
        selected: pattern === 'odd' ? p.pageNum % 2 !== 0 : p.pageNum % 2 === 0
      }));
      const selectedNums = updated.filter(p => p.selected).map(p => p.pageNum);
      setRangeInput(formatPageRanges(selectedNums));
      return updated;
    });
  };

  function formatPageRanges(arr: number[]): string {
    if (!arr.length) return '';
    arr.sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = arr[0];
    let end = arr[0];

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === end + 1) {
        end = arr[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = arr[i];
        end = arr[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  }

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    if (!file) return;

    // Parse entered string into page set
    const set = new Set<number>();
    const parts = val.split(',');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.includes('-')) {
        const [s, e] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(s) && !isNaN(e)) {
          for (let i = s; i <= e; i++) {
            if (i >= 1 && i <= file.pageCount) set.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed);
        if (!isNaN(num) && num >= 1 && num <= file.pageCount) {
          set.add(num);
        }
      }
    }

    setPages(prev => prev.map(p => ({ ...p, selected: set.has(p.pageNum) })));
  };

  const selectedCount = pages.filter(p => p.selected).length;

  const handleExtractMerged = async () => {
    if (!file || selectedCount === 0) {
      toast.error('Please select at least 1 page to extract');
      return;
    }
    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(file.bytes);
      const newDoc = await PDFDocument.create();
      const pageIndices = pages.filter(p => p.selected).map(p => p.pageNum - 1);

      const copied = await newDoc.copyPages(srcDoc, pageIndices);
      copied.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}_extracted_${selectedCount}_pages.pdf`);
      toast.success(`Extracted ${selectedCount} selected page(s) into a new PDF!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract pages');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractZip = async () => {
    if (!file || selectedCount === 0) {
      toast.error('Please select pages to split as ZIP');
      return;
    }
    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(file.bytes);
      const selectedPages = pages.filter(p => p.selected);
      const filesForZip: Array<{ name: string; content: Uint8Array }> = [];

      for (const p of selectedPages) {
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [p.pageNum - 1]);
        newDoc.addPage(copied);
        const pdfBytes = await newDoc.save();
        filesForZip.push({
          name: `${file.name.replace(/\.pdf$/i, '')}_page_${p.pageNum}.pdf`,
          content: pdfBytes
        });
      }

      await downloadFilesAsZip(filesForZip, `${file.name.replace(/\.pdf$/i, '')}_split_pages.zip`);
      toast.success(`Downloaded ${selectedPages.length} split PDF pages as a single ZIP archive!`);
    } catch (err) {
      console.error(err);
      toast.error('Error creating ZIP archive');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitIndividual = async () => {
    if (!file || selectedCount === 0) {
      toast.error('Please select pages to split');
      return;
    }
    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(file.bytes);
      const selectedPages = pages.filter(p => p.selected);

      for (let i = 0; i < selectedPages.length; i++) {
        const p = selectedPages[i];
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [p.pageNum - 1]);
        newDoc.addPage(copied);

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setTimeout(() => {
          downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}_page_${p.pageNum}.pdf`);
        }, i * 200);
      }
      toast.success(`Downloaded ${selectedPages.length} individual page PDF files!`);
    } catch (err) {
      console.error(err);
      toast.error('Error during split operation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scissors className="w-5 h-5 text-indigo-500" /> PDF Splitter & Visual Page Extractor
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Visually preview and select individual pages to extract, delete, or split into separate PDFs.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-indigo-500 group-hover:scale-110 transition-transform">
            <Scissors className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Upload a PDF to view and split pages</span>
          <span className="text-[11px] text-muted-foreground">Extract any page or range with visual thumbnail selection</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-5">
          {/* File Header Bar */}
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground truncate max-w-sm">{file.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Total Pages: {file.pageCount} • Selected: <span className="font-bold text-primary">{selectedCount}</span>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setPages([]); }} 
              className="btn-signature-header h-8 px-3 text-xs text-red-500 hover:text-red-600 cursor-pointer"
            >
              Choose Different File
            </button>
          </div>

          {/* Range input & fast selection buttons */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-foreground">Interactive Page Selector</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => selectAll(true)} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary">
                  All
                </button>
                <button onClick={() => selectAll(false)} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary">
                  None
                </button>
                <button onClick={() => selectPattern('odd')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary">
                  Odd Pages
                </button>
                <button onClick={() => selectPattern('even')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary">
                  Even Pages
                </button>
              </div>
            </div>

            <input
              type="text"
              value={rangeInput}
              onChange={e => handleRangeInputChange(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
              className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Visual Page Grid Viewer */}
          {isRenderingThumbnails ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-primary font-bold">
              <RefreshCw className="w-5 h-5 animate-spin" /> Generating high-resolution page thumbnails...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 max-h-[460px] overflow-y-auto p-2 border border-border/60 rounded-2xl bg-secondary/15">
              {pages.map((p) => (
                <div
                  key={p.pageNum}
                  onClick={() => togglePageSelection(p.pageNum)}
                  className={`group relative p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center bg-card shadow-xs ${
                    p.selected 
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                      : 'border-border/70 hover:border-primary/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Page Preview Image */}
                  <div className="w-full aspect-[1/1.4] bg-background rounded-lg overflow-hidden border border-border/50 relative">
                    <img src={p.thumbnail} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                    
                    {/* Checkmark badge */}
                    <div className="absolute top-1 right-1">
                      {p.selected ? (
                        <CheckSquare className="w-4 h-4 text-primary bg-background rounded fill-primary text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground/60 bg-background/80 rounded" />
                      )}
                    </div>

                    {/* Zoom preview button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectModal(p.thumbnail);
                      }}
                      className="absolute bottom-1 right-1 p-1 rounded bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Inspect"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-[11px] font-bold text-foreground mt-2">
                    Page {p.pageNum}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={handleExtractMerged}
              disabled={isProcessing || selectedCount === 0}
              className="py-3 px-3 btn-3d text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Merged PDF ({selectedCount} Pages)</span>
            </button>

            <button
              onClick={handleExtractZip}
              disabled={isProcessing || selectedCount === 0}
              className="py-3 px-3 btn-signature-header text-xs font-bold text-primary gap-1.5 cursor-pointer disabled:opacity-50 bg-primary/10 border-primary/30"
            >
              <Archive className="w-3.5 h-3.5 text-primary" />
              <span>Download as ZIP Archive (.zip)</span>
            </button>

            <button
              onClick={handleSplitIndividual}
              disabled={isProcessing || selectedCount === 0}
              className="py-3 px-3 btn-3d-secondary text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
              <span>Separate Files ({selectedCount} PDFs)</span>
            </button>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="bg-card border border-border p-4 rounded-2xl max-w-lg w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Page Inspection</span>
              <button onClick={() => setInspectModal(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={inspectModal} alt="Preview" className="w-full h-auto max-h-[75vh] object-contain rounded-xl border border-border/80 shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 3. PDF TO HIGH-RES IMAGE CONVERTER (WITH DPI & VIEWER)
// ----------------------------------------------------
export const PdfToImagesTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [pagePreviews, setPagePreviews] = useState<{ pageNum: number; thumbUrl: string; width: number; height: number }[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');
  const [scaleFactor, setScaleFactor] = useState<number>(2.0); // 2.0x = ~150 DPI Crisp HD Default
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageQuality, setImageQuality] = useState<number>(0.95);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentUrl?: string } | null>(null);
  const [convertedImages, setConvertedImages] = useState<{ pageNum: number; dataUrl: string; width: number; height: number; sizeBytes: number }[]>([]);
  const [zoomModal, setZoomModal] = useState<{ dataUrl: string; pageNum: number; width: number; height: number; zoomLevel: number } | null>(null);
  const [copiedPage, setCopiedPage] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setIsLoadingPreviews(true);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count, size: f.size });
      setConvertedImages([]);
      
      // Select all pages by default
      const allPages = new Set<number>();
      for (let i = 1; i <= count; i++) allPages.add(i);
      setSelectedPages(allPages);
      setRangeInput(`1-${count}`);

      // Rapidly render quick thumbnails for EVERY page so user immediately sees all pages
      const pdfjsDoc = await getPdfJsDocument(bytes);
      const previews: typeof pagePreviews = [];

      for (let i = 1; i <= count; i++) {
        try {
          const res = await renderPdfPageToCanvas(pdfjsDoc, i, 0.45);
          previews.push({
            pageNum: i,
            thumbUrl: res.dataUrl,
            width: res.width,
            height: res.height,
          });
        } catch {
          previews.push({ pageNum: i, thumbUrl: '', width: 300, height: 420 });
        }
      }

      setPagePreviews(previews);
      toast.success(`Loaded "${f.name}" with ${count} page preview(s)!`);
    } catch (err) {
      console.error(err);
      toast.error('Could not load or parse PDF document.');
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!file) return;
    const all = new Set<number>();
    for (let i = 1; i <= file.pageCount; i++) all.add(i);
    setSelectedPages(all);
    setRangeInput(`1-${file.pageCount}`);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
    setRangeInput('');
  };

  const selectOdd = () => {
    if (!file) return;
    const next = new Set<number>();
    for (let i = 1; i <= file.pageCount; i += 2) next.add(i);
    setSelectedPages(next);
  };

  const selectEven = () => {
    if (!file) return;
    const next = new Set<number>();
    for (let i = 2; i <= file.pageCount; i += 2) next.add(i);
    setSelectedPages(next);
  };

  const applyRangeInput = (val: string) => {
    setRangeInput(val);
    if (!file) return;
    const pages = new Set<number>();
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(startStr) && !isNaN(endStr)) {
          const s = Math.max(1, Math.min(startStr, endStr));
          const e = Math.min(file.pageCount, Math.max(startStr, endStr));
          for (let p = s; p <= e; p++) pages.add(p);
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= file.pageCount) {
          pages.add(p);
        }
      }
    }
    setSelectedPages(pages);
  };

  const handleConvert = async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      toast.error('Please select at least one page to convert.');
      return;
    }

    setIsProcessing(true);
    setConvertedImages([]);
    const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
    setProgress({ current: 0, total: sortedPages.length });

    try {
      const pdfjsDoc = await getPdfJsDocument(file.bytes);
      const rendered: typeof convertedImages = [];

      for (let idx = 0; idx < sortedPages.length; idx++) {
        const pageNum = sortedPages[idx];
        setProgress({ current: idx + 1, total: sortedPages.length });

        const res = await renderPdfPageToCanvas(pdfjsDoc, pageNum, scaleFactor, imageFormat, imageQuality);
        
        // Approximate bytes from base64
        const base64Len = res.dataUrl.length - (res.dataUrl.indexOf(',') + 1);
        const sizeBytes = Math.floor(base64Len * 0.75);

        rendered.push({
          pageNum,
          dataUrl: res.dataUrl,
          width: res.width,
          height: res.height,
          sizeBytes,
        });
      }

      setConvertedImages(rendered);
      toast.success(`Converted ${rendered.length} page(s) to High-Res ${imageFormat.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to render one or more pages. Please retry.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const downloadSingle = async (dataUrl: string, pageNum: number) => {
    if (!file) return;
    const ext = imageFormat === 'jpeg' ? 'jpg' : imageFormat;
    const filename = `${file.name.replace(/\.pdf$/i, '')}_page_${pageNum}_${Math.round(scaleFactor * 72)}dpi.${ext}`;
    await downloadDataUrl(dataUrl, filename);
    toast.success(`Downloaded Page ${pageNum} image!`);
  };

  const copyImageToClipboard = async (dataUrl: string, pageNum: number) => {
    const success = await copyDataUrlToClipboard(dataUrl);
    if (success) {
      setCopiedPage(pageNum);
      toast.success(`Copied Page ${pageNum} image to clipboard!`);
      setTimeout(() => setCopiedPage(null), 2500);
    } else {
      toast.error('Clipboard copy failed. Try saving the image directly.');
    }
  };

  const downloadAllAsZip = async () => {
    if (!convertedImages.length || !file) return;
    try {
      const ext = imageFormat === 'jpeg' ? 'jpg' : imageFormat;
      const filesForZip = convertedImages.map(img => ({
        name: `${file.name.replace(/\.pdf$/i, '')}_page_${img.pageNum}_${Math.round(scaleFactor * 72)}dpi.${ext}`,
        content: img.dataUrl,
        isBase64: true
      }));
      await downloadFilesAsZip(filesForZip, `${file.name.replace(/\.pdf$/i, '')}_all_pages_images.zip`);
      toast.success(`Downloaded all ${convertedImages.length} images as a ZIP archive!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP archive. You can download images individually.');
    }
  };

  const downloadAllIndividual = () => {
    if (!convertedImages.length) return;
    convertedImages.forEach((img, idx) => {
      setTimeout(() => {
        downloadSingle(img.dataUrl, img.pageNum);
      }, idx * 400);
    });
    toast.success(`Downloading ${convertedImages.length} images one by one!`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-rose-500" /> PDF to High-Res Image Converter
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate multi-page visual previews and convert PDF pages into crystal-clear PNG, JPEG, or WebP images up to 400 DPI print quality.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-10 border-2 border-dashed border-border hover:border-rose-500 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all bg-secondary/15 hover:bg-secondary/35 group">
          <div className="w-14 h-14 rounded-2xl icon-squircle text-rose-500 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-sm font-bold text-foreground block">Select PDF to Generate Image Previews</span>
            <span className="text-xs text-muted-foreground block">
              Instantly inspects all pages, lets you pick specific pages, and renders at 72 to 400 DPI
            </span>
          </div>
          <div className="mt-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20">
            Browse PDF File
          </div>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl icon-squircle text-rose-500 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground truncate max-w-sm sm:max-w-md">{file.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {file.pageCount} Pages • {formatFileSize(file.size)} • <span className="font-bold text-rose-500">{selectedPages.size} Selected</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setPagePreviews([]); setConvertedImages([]); }} 
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              Change PDF
            </button>
          </div>

          {/* Settings Control Panel */}
          <div className="p-5 bg-secondary/20 rounded-2xl border border-border/70 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-foreground pb-2 border-b border-border/50">
              <span className="flex items-center gap-1.5"><Sliders className="w-4 h-4 text-primary" /> Render & Quality Settings</span>
              <span className="text-muted-foreground text-[11px] font-normal">Approx. {Math.round(scaleFactor * 72)} DPI</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* DPI / Resolution */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-2">Resolution / DPI Quality</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Web Fast', scale: 1.25, dpi: '90 DPI' },
                    { label: 'Crisp HD', scale: 2.0, dpi: '150 DPI' },
                    { label: 'Print Ultra', scale: 3.0, dpi: '220 DPI' },
                    { label: 'Maximum 4K', scale: 3.5, dpi: '250 DPI' },
                  ].map((opt) => (
                    <button
                      key={opt.scale}
                      type="button"
                      onClick={() => setScaleFactor(opt.scale)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                        scaleFactor === opt.scale
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] opacity-80">{opt.dpi}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & Compression */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-2">Image Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { fmt: 'png' as const, title: 'PNG', subtitle: 'Lossless & Crisp' },
                    { fmt: 'jpeg' as const, title: 'JPEG', subtitle: '95% Photo Quality' },
                    { fmt: 'webp' as const, title: 'WEBP', subtitle: 'Compact Modern' },
                  ].map((f) => (
                    <button
                      key={f.fmt}
                      type="button"
                      onClick={() => setImageFormat(f.fmt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                        imageFormat === f.fmt
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      <span>{f.title}</span>
                      <span className="text-[10px] opacity-80">{f.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Selection Toolbar */}
            <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground mr-1">Selection:</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary cursor-pointer"
                >
                  All ({file.pageCount})
                </button>
                <button
                  type="button"
                  onClick={selectOdd}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary cursor-pointer"
                >
                  Odd
                </button>
                <button
                  type="button"
                  onClick={selectEven}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary cursor-pointer"
                >
                  Even
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary cursor-pointer text-muted-foreground"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-foreground whitespace-nowrap">Page Range:</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => applyRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="w-28 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* PAGE PREVIEW GALLERY (INSTANT VIEW OF ALL DOCUMENT PAGES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-rose-500" />
                <span>Document Page Gallery ({file.pageCount} Pages Available)</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Click any page card to toggle selection</span>
            </div>

            {isLoadingPreviews ? (
              <div className="p-8 text-center bg-secondary/15 rounded-2xl border border-border">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                <span className="text-xs font-bold text-foreground">Generating live page previews...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {pagePreviews.map((p) => {
                  const isSelected = selectedPages.has(p.pageNum);
                  return (
                    <div
                      key={p.pageNum}
                      onClick={() => togglePageSelection(p.pageNum)}
                      className={`relative rounded-2xl border p-2 cursor-pointer transition-all group flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/5 shadow-xs ring-2 ring-rose-500/20'
                          : 'border-border/70 bg-card hover:border-border hover:bg-secondary/20 opacity-60'
                      }`}
                    >
                      {/* Checkbox badge */}
                      <div className="flex items-center justify-between mb-1.5 px-0.5">
                        <span className="text-[11px] font-bold text-foreground">P. {p.pageNum}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-muted-foreground/40'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Thumbnail Image */}
                      <div className="aspect-[1/1.4] bg-background rounded-xl overflow-hidden border border-border/60 relative shadow-2xs">
                        {p.thumbUrl ? (
                          <img src={p.thumbUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                            Page {p.pageNum}
                          </div>
                        )}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.thumbUrl) {
                              setZoomModal({ dataUrl: p.thumbUrl, pageNum: p.pageNum, width: p.width, height: p.height, zoomLevel: 1 });
                            }
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1"
                        >
                          <ZoomIn className="w-3.5 h-3.5" /> Inspect
                        </div>
                      </div>

                      <div className="text-center pt-1.5 text-[10px] text-muted-foreground">
                        {isSelected ? '✓ Selected' : 'Excluded'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN CONVERT BUTTON */}
          <button
            onClick={handleConvert}
            disabled={isProcessing || selectedPages.size === 0}
            className="w-full py-4 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {progress 
                ? `Rendering Page ${progress.current} of ${progress.total}...` 
                : `Convert Selected (${selectedPages.size} Pages) to High-Res Images`}
            </span>
          </button>

          {/* RENDERED HIGH-RES IMAGES SECTION */}
          {convertedImages.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span>High-Res Output Images ({convertedImages.length})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">
                      {imageFormat.toUpperCase()} • ~{Math.round(scaleFactor * 72)} DPI
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Click any image to inspect at 100% resolution, copy to clipboard, or save to disk.
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={downloadAllAsZip}
                    className="btn-signature-header h-9 px-3.5 text-xs font-bold text-primary gap-1.5 cursor-pointer bg-primary/10 border-primary/30 shadow-xs"
                  >
                    <Archive className="w-3.5 h-3.5 text-primary" /> Download All as ZIP (.zip)
                  </button>
                  <button
                    onClick={downloadAllIndividual}
                    className="btn-signature-header h-9 px-3.5 text-xs font-bold text-rose-500 gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Separate Images ({convertedImages.length})
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {convertedImages.map((img) => (
                  <div key={img.pageNum} className="p-3 bg-secondary/25 border border-border/80 rounded-2xl space-y-2.5 group">
                    {/* Image Preview Container */}
                    <div 
                      onClick={() => setZoomModal({ dataUrl: img.dataUrl, pageNum: img.pageNum, width: img.width, height: img.height, zoomLevel: 1 })}
                      className="aspect-[1/1.4] bg-background rounded-xl overflow-hidden border border-border/60 relative cursor-pointer shadow-xs group-hover:shadow-md transition-shadow"
                    >
                      <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn className="w-5 h-5" />
                        <span>Inspect Full-Res</span>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        Page {img.pageNum}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">
                          {img.width} × {img.height} px
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {formatFileSize(img.sizeBytes)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => copyImageToClipboard(img.dataUrl, img.pageNum)}
                          className={`btn-signature-header h-8 px-2 text-[11px] font-bold gap-1 cursor-pointer ${
                            copiedPage === img.pageNum ? 'text-emerald-500 border-emerald-500' : 'text-foreground'
                          }`}
                        >
                          {copiedPage === img.pageNum ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPage === img.pageNum ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => downloadSingle(img.dataUrl, img.pageNum)}
                          className="btn-signature-header h-8 px-2 text-[11px] font-bold text-rose-500 gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN ZOOM & INSPECT MODAL */}
      {zoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in-0">
          <div className="bg-card border border-border p-4 rounded-3xl max-w-4xl w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Page {zoomModal.pageNum} Inspection</span>
                <span className="text-[10px] text-muted-foreground">({zoomModal.width} × {zoomModal.height} px)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomModal(prev => prev ? { ...prev, zoomLevel: Math.max(0.5, prev.zoomLevel - 0.25) } : null)}
                  className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-foreground w-12 text-center">
                  {Math.round(zoomModal.zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomModal(prev => prev ? { ...prev, zoomLevel: Math.min(3, prev.zoomLevel + 0.25) } : null)}
                  className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomModal(prev => prev ? { ...prev, zoomLevel: 1 } : null)}
                  className="px-2 py-1 rounded-lg border border-border text-[11px] font-bold hover:bg-secondary cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => downloadSingle(zoomModal.dataUrl, zoomModal.pageNum)}
                  className="btn-signature-header h-8 px-2.5 text-[11px] font-bold text-rose-500 gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Save
                </button>
                <button onClick={() => setZoomModal(null)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-auto max-h-[75vh] rounded-2xl border border-border bg-secondary/30 p-2 flex items-center justify-center">
              <img 
                src={zoomModal.dataUrl} 
                alt={`Zoom page ${zoomModal.pageNum}`} 
                style={{ transform: `scale(${zoomModal.zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
                className="max-w-full h-auto rounded-lg shadow-md" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 4. TEXT TO PDF GENERATOR (WITH REAL-TIME LIVE VIEWER)
// ----------------------------------------------------
export const TextToPdfTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    `EXECUTIVE SUMMARY\n\nThis document was generated directly inside the browser with zero cloud server uploads.\n\nKey Highlights:\n1. 100% Client-Side Private Compilation\n2. Real-Time Dynamic Page Layout\n3. Scalable Vector Fonts and Custom Margins\n\nNotes:\nFeel free to customize the font, line height, margins, and paper format in the side panel.\n\nDate: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  );
  const [docTitle, setDocTitle] = useState('Report_Document');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [fontSize, setFontSize] = useState<number>(12);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [marginPt, setMarginPt] = useState<number>(40);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [activePreviewPage, setActivePreviewPage] = useState<number>(0);

  // Generate live preview canvases whenever options or text change
  const updateLivePreview = useCallback(async () => {
    try {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = pageSize === 'A4' ? 595.28 : 612.0;
      const pageHeight = pageSize === 'A4' ? 841.89 : 792.0;
      const margin = marginPt;
      const maxWidth = pageWidth - margin * 2;

      let currentPage = doc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Header line
      currentPage.drawText(docTitle.toUpperCase(), {
        x: margin,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 20;

      const lines = inputText.split('\n');

      for (const line of lines) {
        if (!line.trim()) {
          currentY -= fontSize * lineSpacing;
          if (currentY < margin + 30) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          continue;
        }

        const isHeading = line === line.toUpperCase() && line.length < 50;
        const currentFont = isHeading ? fontBold : font;
        const currentFontSize = isHeading ? fontSize + 2 : fontSize;

        const words = line.split(' ');
        let currentLine = '';

        for (const w of words) {
          const test = currentLine ? `${currentLine} ${w}` : w;
          const wWidth = currentFont.widthOfTextAtSize(test, currentFontSize);

          if (wWidth <= maxWidth) {
            currentLine = test;
          } else {
            if (currentLine) {
              currentPage.drawText(currentLine, {
                x: margin,
                y: currentY,
                size: currentFontSize,
                font: currentFont,
                color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.15, 0.15, 0.15),
              });
              currentY -= currentFontSize * lineSpacing;
              if (currentY < margin + 30) {
                currentPage = doc.addPage([pageWidth, pageHeight]);
                currentY = pageHeight - margin;
              }
            }
            currentLine = w;
          }
        }

        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: currentFontSize,
            font: currentFont,
            color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.15, 0.15, 0.15),
          });
          currentY -= currentFontSize * lineSpacing;
          if (currentY < margin + 30) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
        }
      }

      // Add page numbers
      if (includePageNumbers) {
        const total = doc.getPageCount();
        doc.getPages().forEach((p, idx) => {
          const numStr = `Page ${idx + 1} of ${total}`;
          const numW = font.widthOfTextAtSize(numStr, 9);
          p.drawText(numStr, {
            x: pageWidth - margin - numW,
            y: margin - 15,
            size: 9,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        });
      }

      const pdfBytes = await doc.save();
      const pdfjsDoc = await getPdfJsDocument(pdfBytes);
      const totalRendered = doc.getPageCount();
      const renderedScreens: string[] = [];

      for (let i = 1; i <= totalRendered; i++) {
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, i, 1.2);
        renderedScreens.push(dataUrl);
      }

      setPreviewPages(renderedScreens);
      if (activePreviewPage >= renderedScreens.length) {
        setActivePreviewPage(0);
      }
    } catch (e) {
      console.warn('Preview generation warning:', e);
    }
  }, [inputText, docTitle, pageSize, fontSize, lineSpacing, marginPt, includePageNumbers, activePreviewPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLivePreview();
    }, 400);
    return () => clearTimeout(timer);
  }, [updateLivePreview]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = pageSize === 'A4' ? 595.28 : 612.0;
      const pageHeight = pageSize === 'A4' ? 841.89 : 792.0;
      const margin = marginPt;
      const maxWidth = pageWidth - margin * 2;

      let currentPage = doc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      currentPage.drawText(docTitle.toUpperCase(), {
        x: margin,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 20;

      const lines = inputText.split('\n');
      for (const line of lines) {
        if (!line.trim()) {
          currentY -= fontSize * lineSpacing;
          if (currentY < margin + 30) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          continue;
        }

        const isHeading = line === line.toUpperCase() && line.length < 50;
        const currentFont = isHeading ? fontBold : font;
        const currentFontSize = isHeading ? fontSize + 2 : fontSize;
        const words = line.split(' ');
        let currentLine = '';

        for (const w of words) {
          const test = currentLine ? `${currentLine} ${w}` : w;
          const wWidth = currentFont.widthOfTextAtSize(test, currentFontSize);
          if (wWidth <= maxWidth) {
            currentLine = test;
          } else {
            if (currentLine) {
              currentPage.drawText(currentLine, {
                x: margin,
                y: currentY,
                size: currentFontSize,
                font: currentFont,
                color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.15, 0.15, 0.15),
              });
              currentY -= currentFontSize * lineSpacing;
              if (currentY < margin + 30) {
                currentPage = doc.addPage([pageWidth, pageHeight]);
                currentY = pageHeight - margin;
              }
            }
            currentLine = w;
          }
        }
        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: currentFontSize,
            font: currentFont,
            color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.15, 0.15, 0.15),
          });
          currentY -= currentFontSize * lineSpacing;
          if (currentY < margin + 30) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
        }
      }

      if (includePageNumbers) {
        const total = doc.getPageCount();
        doc.getPages().forEach((p, idx) => {
          const numStr = `Page ${idx + 1} of ${total}`;
          const numW = font.widthOfTextAtSize(numStr, 9);
          p.drawText(numStr, {
            x: pageWidth - margin - numW,
            y: margin - 15,
            size: 9,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `${docTitle.trim() || 'Document'}.pdf`);
      toast.success('Successfully downloaded generated PDF document!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" /> Text to PDF Generator with Live Paper Viewer
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Type or paste text and watch your formatted PDF paper preview render in real-time.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Editor & Controls Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Page Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageSize('A4')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    pageSize === 'A4' ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-border'
                  }`}
                >
                  A4 Paper
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize('Letter')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    pageSize === 'Letter' ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-border'
                  }`}
                >
                  US Letter
                </button>
              </div>
            </div>
          </div>

          {/* Quick Slider Options */}
          <div className="grid sm:grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded-2xl border border-border/60">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                <span>Font Size</span>
                <span>{fontSize}pt</span>
              </div>
              <input
                type="range"
                min={9}
                max={20}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                <span>Line Spacing</span>
                <span>{lineSpacing}x</span>
              </div>
              <input
                type="range"
                min={1.2}
                max={2.0}
                step={0.1}
                value={lineSpacing}
                onChange={e => setLineSpacing(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                <span>Margin</span>
                <span>{marginPt}pt</span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                step={5}
                value={marginPt}
                onChange={e => setMarginPt(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Content Text</label>
              <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={e => setIncludePageNumbers(e.target.checked)}
                  className="rounded text-primary"
                />
                <span>Include Page Numbers</span>
              </label>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type or paste text..."
              className="w-full p-4 rounded-2xl bg-background border border-border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export & Download PDF Document</span>
          </button>
        </div>

        {/* Live Visual Paper Viewer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start bg-secondary/30 border border-border/80 rounded-2xl p-4 space-y-3">
          <div className="w-full flex items-center justify-between text-xs font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" /> Live Document Viewer
            </span>
            {previewPages.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-mono">
                Page {activePreviewPage + 1} of {previewPages.length}
              </span>
            )}
          </div>

          {previewPages.length > 0 ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="w-full max-w-sm aspect-[1/1.41] bg-white text-black rounded-xl shadow-xl overflow-hidden border border-border/80 relative">
                <img 
                  src={previewPages[activePreviewPage]} 
                  alt="Live PDF Page" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Page Navigator */}
              {previewPages.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePreviewPage(prev => Math.max(0, prev - 1))}
                    disabled={activePreviewPage === 0}
                    className="p-1.5 rounded-lg bg-card border border-border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-foreground">
                    {activePreviewPage + 1} / {previewPages.length}
                  </span>
                  <button
                    onClick={() => setActivePreviewPage(prev => Math.min(previewPages.length - 1, prev + 1))}
                    disabled={activePreviewPage === previewPages.length - 1}
                    className="p-1.5 rounded-lg bg-card border border-border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[1/1.4] flex items-center justify-center text-xs text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Rendering live paper...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. PDF TO TEXT EXTRACTOR (WITH PAGE VIEWER + SEARCH)
// ----------------------------------------------------
export const PdfToTextTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [pagesData, setPagesData] = useState<{ 
    pageNum: number; 
    text: string; 
    rawItems: any[];
    thumbnailUrl?: string;
    highResUrl?: string;
    lang: { name: string; isRTL: boolean; flag: string };
    wordCount: number;
    charCount: number;
  }[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'split' | 'text' | 'visual'>('split');
  const [extractionMode, setExtractionMode] = useState<'formatted' | 'continuous' | 'exact'>('formatted');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editableText, setEditableText] = useState<{ [key: string]: string }>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    setIsExtracting(true);
    setPagesData([]);
    setEditableText({});

    try {
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await getPdfJsDocument(bytes);
      const totalPages = doc.numPages;

      setFile({ name: f.name, bytes, pageCount: totalPages, size: f.size });
      setProgress({ current: 0, total: totalPages });

      const extracted: typeof pagesData = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i, total: totalPages });
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Smart formatted extraction with Bengali & Indic script handling
        const smartText = extractSmartTextFromItems(textContent.items, extractionMode);
        const lang = detectScriptLanguage(smartText);

        // Render visual thumbnail and high-res view for side-by-side inspection
        let thumbUrl: string | undefined;
        let highResUrl: string | undefined;
        try {
          const thumbRes = await renderPdfPageToCanvas(doc, i, 0.45);
          thumbUrl = thumbRes.dataUrl;

          // For the first few pages or on demand, generate clear view
          if (i <= 5) {
            const highRes = await renderPdfPageToCanvas(doc, i, 1.25);
            highResUrl = highRes.dataUrl;
          }
        } catch {
          // ignore render error
        }

        const words = smartText.split(/\s+/).filter(Boolean).length;
        const chars = smartText.length;

        extracted.push({
          pageNum: i,
          text: smartText,
          rawItems: textContent.items,
          thumbnailUrl: thumbUrl,
          highResUrl,
          lang,
          wordCount: words,
          charCount: chars,
        });
      }

      setPagesData(extracted);
      setSelectedPage('all');
      toast.success(`Successfully extracted and parsed ${extracted.length} page(s) with script formatting!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse PDF text. It might be scanned without an OCR text layer.');
    } finally {
      setIsExtracting(false);
      setProgress(null);
    }
  };

  // Re-run extraction whenever mode changes
  const handleModeChange = (newMode: 'formatted' | 'continuous' | 'exact') => {
    setExtractionMode(newMode);
    if (!pagesData.length) return;

    const updated = pagesData.map(p => {
      const reExtracted = extractSmartTextFromItems(p.rawItems, newMode);
      return {
        ...p,
        text: reExtracted,
        wordCount: reExtracted.split(/\s+/).filter(Boolean).length,
        charCount: reExtracted.length,
      };
    });
    setPagesData(updated);
    setEditableText({});
    toast.success(`Switched to ${newMode === 'formatted' ? 'Smart Formatted' : newMode === 'continuous' ? 'Clean Reading Flow' : 'Exact Spacing'} mode!`);
  };

  // Ensure current page high-res visual is loaded when user selects a specific page
  useEffect(() => {
    if (typeof selectedPage === 'number' && file) {
      const pageItem = pagesData.find(p => p.pageNum === selectedPage);
      if (pageItem && !pageItem.highResUrl) {
        getPdfJsDocument(file.bytes).then(async doc => {
          try {
            const highRes = await renderPdfPageToCanvas(doc, selectedPage, 1.35);
            setPagesData(prev => prev.map(p => p.pageNum === selectedPage ? { ...p, highResUrl: highRes.dataUrl } : p));
          } catch {
            // ignore
          }
        });
      }
    }
  }, [selectedPage, file, pagesData]);

  const getCurrentText = useCallback((): string => {
    if (selectedPage === 'all') {
      const key = 'all';
      if (editableText[key] !== undefined) return editableText[key];
      return pagesData.map(p => `--- PAGE ${p.pageNum} (${p.wordCount} words) ---\n${p.text}`).join('\n\n');
    }
    const key = `p_${selectedPage}`;
    if (editableText[key] !== undefined) return editableText[key];
    const found = pagesData.find(p => p.pageNum === selectedPage);
    return found ? found.text : '';
  }, [selectedPage, pagesData, editableText]);

  const handleTextEdit = (val: string) => {
    const key = selectedPage === 'all' ? 'all' : `p_${selectedPage}`;
    setEditableText(prev => ({ ...prev, [key]: val }));
  };

  // Dedicated Bengali & Indic Script Fixer
  const handleFixBengaliScript = () => {
    const current = getCurrentText();
    const repaired = repairBengaliAndIndicText(current);
    handleTextEdit(repaired);
    toast.success('Applied Bengali/Indic ligature & vowel mark repair!');
  };

  // Remove line breaks into continuous text
  const handleRemoveLineBreaks = () => {
    const current = getCurrentText();
    const smoothed = current
      .replace(/\r\n/g, '\n')
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      .replace(/[ \t]{2,}/g, ' ');
    handleTextEdit(smoothed);
    toast.success('Removed line breaks within paragraphs!');
  };

  // Clean extra whitespace
  const handleCleanSpacing = () => {
    const current = getCurrentText();
    const cleaned = current
      .split('\n')
      .map(line => line.trim().replace(/[ \t]{2,}/g, ' '))
      .join('\n');
    handleTextEdit(cleaned);
    toast.success('Cleaned redundant whitespace!');
  };

  // Case conversions
  const handleCaseConvert = (type: 'upper' | 'lower' | 'title') => {
    const current = getCurrentText();
    let res = current;
    if (type === 'upper') {
      res = current.toUpperCase();
    } else if (type === 'lower') {
      res = current.toLowerCase();
    } else if (type === 'title') {
      res = current.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
    handleTextEdit(res);
  };

  const copyText = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    toast.success('Copied text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = (format: 'txt' | 'json' | 'md' | 'doc') => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(pagesData.map(p => ({
        page: p.pageNum,
        language: p.lang.name,
        wordCount: p.wordCount,
        characterCount: p.charCount,
        text: p.text
      })), null, 2);
      mime = 'application/json';
      ext = 'json';
    } else if (format === 'md') {
      content = `# ${baseName}\n\n` + pagesData.map(p => `## Page ${p.pageNum}\n*Language: ${p.lang.name} • ${p.wordCount} Words*\n\n${p.text}`).join('\n\n---\n\n');
      mime = 'text/markdown';
      ext = 'md';
    } else if (format === 'doc') {
      // Clean HTML doc representation for Word
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;padding:40px;}h2{color:#333;border-bottom:1px solid #ccc;padding-bottom:5px;page-break-before:always;}p{margin:10px 0;}</style></head><body><h1>${baseName}</h1>` +
        pagesData.map(p => `<h2>Page ${p.pageNum}</h2><div>${p.text.replace(/\n/g, '<br/>')}</div>`).join('') +
        `</body></html>`;
      mime = 'application/msword';
      ext = 'doc';
    } else {
      content = getCurrentText();
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    downloadBlob(blob, `${baseName}_extracted.${ext}`);
    toast.success(`Downloaded .${ext.toUpperCase()} file!`);
  };

  // Search matches calculation
  const currentContent = getCurrentText();
  const searchMatchesCount = searchQuery.trim()
    ? (currentContent.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  // Language summaries
  const overallLanguages = Array.from(new Set(pagesData.map(p => p.lang.name))).join(', ') || 'Auto-detected';
  const totalWords = pagesData.reduce((acc, p) => acc + p.wordCount, 0);
  const totalChars = pagesData.reduce((acc, p) => acc + p.charCount, 0);
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  const activePageItem = typeof selectedPage === 'number' 
    ? pagesData.find(p => p.pageNum === selectedPage) 
    : pagesData[0];

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-500" /> PDF to Text Extractor with Visual Page Viewer
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Extract Unicode text with full Bengali (বাংলা) vowel & ligature preservation, side-by-side visual PDF viewer, and multi-format exports.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-10 border-2 border-dashed border-border hover:border-emerald-500 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all bg-secondary/15 hover:bg-secondary/35 group">
          <div className="w-14 h-14 rounded-2xl icon-squircle text-emerald-500 group-hover:scale-110 transition-transform">
            <FileCode className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-sm font-bold text-foreground block">Select PDF to Extract & Inspect Text</span>
            <span className="text-xs text-muted-foreground block">
              Supports Bengali, Arabic, Hindi, English, and multilingual documents with side-by-side page rendering
            </span>
          </div>
          <div className="mt-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20">
            Browse PDF File
          </div>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-5">
          {/* File Header Bar & Analytics */}
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <span className="truncate max-w-sm sm:max-w-md">{file.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                  {overallLanguages}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
                <span>{file.pageCount} Pages</span>
                <span>•</span>
                <span><strong className="text-foreground">{totalWords}</strong> Words</span>
                <span>•</span>
                <span><strong className="text-foreground">{totalChars}</strong> Characters</span>
                <span>•</span>
                <span>~{readingTimeMinutes} min reading time</span>
              </div>
            </div>

            <button 
              onClick={() => { setFile(null); setPagesData([]); setEditableText({}); }} 
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              Choose Another PDF
            </button>
          </div>

          {/* Controls Bar: Extraction Modes, View Mode Tabs, and In-Text Search */}
          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            {/* Extraction Mode Segmented Control */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1 hidden sm:inline">Formatting:</span>
              <button
                type="button"
                onClick={() => handleModeChange('formatted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  extractionMode === 'formatted'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                Smart Formatted
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('continuous')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  extractionMode === 'continuous'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                Clean Flow
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('exact')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  extractionMode === 'exact'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                Exact Layout
              </button>
            </div>

            {/* View Mode Tabs (Split, Text Only, Visual Only) */}
            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'split' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'text' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Text Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'visual' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Page Canvas
              </button>
            </div>
          </div>

          {/* Quick Script & Text Repair Actions Ribbon */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-bold">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleFixBengaliScript}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Repair broken Bengali letters, vowel signs (ো, ৌ, া, ি, ী, ু, ূ, ে), and hasanta conjuncts"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>বাংলা / Indic ফিক্সার</span>
              </button>

              <button
                onClick={handleRemoveLineBreaks}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary cursor-pointer transition-colors"
              >
                Join Lines
              </button>

              <button
                onClick={handleCleanSpacing}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary cursor-pointer transition-colors"
              >
                Clean Spaces
              </button>

              <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden">
                <button
                  onClick={() => handleCaseConvert('upper')}
                  className="px-2 py-1 text-[11px] hover:bg-secondary cursor-pointer border-r border-border"
                  title="UPPERCASE"
                >
                  AA
                </button>
                <button
                  onClick={() => handleCaseConvert('lower')}
                  className="px-2 py-1 text-[11px] hover:bg-secondary cursor-pointer border-r border-border"
                  title="lowercase"
                >
                  aa
                </button>
                <button
                  onClick={() => handleCaseConvert('title')}
                  className="px-2 py-1 text-[11px] hover:bg-secondary cursor-pointer"
                  title="Title Case"
                >
                  Aa
                </button>
              </div>
            </div>

            {/* In-Text Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find in extracted text..."
                className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <span className="absolute right-2.5 top-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {searchMatchesCount}
                </span>
              )}
            </div>
          </div>

          {/* MAIN WORKSPACE: Page Rail (Left) + Content (Right) */}
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Left Page Thumbnails Navigator (3 Cols) */}
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground px-1">
                <span>Document Pages</span>
                <button
                  onClick={() => setSelectedPage('all')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedPage === 'all' 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  All ({file.pageCount})
                </button>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto p-1.5 border border-border/70 rounded-2xl bg-secondary/15">
                {pagesData.map(p => {
                  const isSelected = selectedPage === p.pageNum;
                  return (
                    <button
                      key={p.pageNum}
                      onClick={() => setSelectedPage(p.pageNum)}
                      className={`w-full p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30'
                          : 'border-border/60 hover:bg-card bg-card/60'
                      }`}
                    >
                      <div className="w-10 h-14 bg-background border border-border/70 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 m-auto mt-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">Page {p.pageNum}</span>
                          <span className="text-[10px] text-muted-foreground">{p.lang.flag}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {p.wordCount} words • {p.lang.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 line-clamp-1 italic font-serif">
                          {p.text.slice(0, 35) || '(No selectable text)'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Main Viewer (9 Cols) */}
            <div className="lg:col-span-9 space-y-3">
              {/* Export Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-secondary/20 rounded-xl border border-border/60">
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>{selectedPage === 'all' ? `Entire Document (${file.pageCount} Pages)` : `Viewing Page ${selectedPage}`}</span>
                  {selectedPage !== 'all' && activePageItem && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                      {activePageItem.lang.flag} {activePageItem.lang.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={copyText}
                    className={`btn-signature-header h-8 px-3 text-xs font-bold gap-1 cursor-pointer transition-all ${
                      copied ? 'text-emerald-500 border-emerald-500' : 'text-foreground'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => downloadText('txt')}
                    className="btn-signature-header h-8 px-2.5 text-xs font-bold text-emerald-500 gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> .TXT
                  </button>

                  <button
                    onClick={() => downloadText('md')}
                    className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer"
                  >
                    .MD
                  </button>

                  <button
                    onClick={() => downloadText('doc')}
                    className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer"
                  >
                    .DOC
                  </button>

                  <button
                    onClick={() => downloadText('json')}
                    className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer"
                  >
                    .JSON
                  </button>
                </div>
              </div>

              {/* DUAL PANEL SPLIT / TEXT / VISUAL MODES */}
              {activeTab === 'split' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left: Rendered PDF Canvas */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground flex items-center justify-between px-1">
                      <span>Original PDF Page Render</span>
                      {selectedPage === 'all' && <span>(Showing Page 1)</span>}
                    </div>
                    <div className="aspect-[1/1.4] bg-secondary/30 rounded-2xl border border-border/80 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                      {activePageItem?.highResUrl || activePageItem?.thumbnailUrl ? (
                        <img 
                          src={activePageItem.highResUrl || activePageItem.thumbnailUrl} 
                          alt="Rendered page" 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm border border-border/60"
                        />
                      ) : (
                        <div className="text-center text-xs text-muted-foreground p-4">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                          <span>Rendering page view...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Extracted Editable Text */}
                  <div className="space-y-1.5 flex flex-col justify-between">
                    <div className="text-[11px] font-bold text-muted-foreground flex items-center justify-between px-1">
                      <span>Extracted Unicode Content</span>
                      <span>{getCurrentText().split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                    <textarea
                      value={getCurrentText()}
                      onChange={e => handleTextEdit(e.target.value)}
                      rows={20}
                      className="w-full h-full min-h-[460px] p-4 rounded-2xl bg-background border border-border text-xs font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-y shadow-inner"
                      placeholder="Extracted text will appear here..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground flex items-center justify-between px-1">
                    <span>Full Workspace Text Editor</span>
                    <span>{getCurrentText().split(/\s+/).filter(Boolean).length} words • {getCurrentText().length} chars</span>
                  </div>
                  <textarea
                    value={getCurrentText()}
                    onChange={e => handleTextEdit(e.target.value)}
                    rows={22}
                    className="w-full p-4 rounded-2xl bg-background border border-border text-xs font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-y shadow-inner"
                    placeholder="Extracted text will appear here..."
                  />
                </div>
              )}

              {activeTab === 'visual' && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground px-1">
                    Original Document Page View
                  </div>
                  <div className="w-full min-h-[500px] bg-secondary/20 rounded-2xl border border-border flex items-center justify-center p-4">
                    {activePageItem?.highResUrl || activePageItem?.thumbnailUrl ? (
                      <img 
                        src={activePageItem.highResUrl || activePageItem.thumbnailUrl} 
                        alt="High Res Page" 
                        className="max-h-[650px] object-contain rounded-xl shadow-md border border-border/70"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">No preview available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 6. PDF ROTATE TOOL (WITH VISUAL REAL-TIME ROTATION)
// ----------------------------------------------------
export const PdfRotateTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [pages, setPages] = useState<{ pageNum: number; thumbnail: string; rotation: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count });

      const pdfjsDoc = await getPdfJsDocument(bytes);
      const rendered: typeof pages = [];

      for (let i = 1; i <= count; i++) {
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, i, 0.45);
        rendered.push({ pageNum: i, thumbnail: dataUrl, rotation: 0 });
      }

      setPages(rendered);
      toast.success(`Loaded "${f.name}" (${count} pages). Click buttons to rotate!`);
    } catch (err) {
      toast.error('Failed to load PDF document');
    }
  };

  const rotatePage = (pageNum: number, delta: number) => {
    setPages(prev => prev.map(p => 
      p.pageNum === pageNum ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p
    ));
  };

  const rotateAll = (delta: number) => {
    setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + delta + 360) % 360 })));
  };

  const resetAll = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
  };

  const handleExport = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(file.bytes);
      const pdfPages = doc.getPages();

      pages.forEach((p, idx) => {
        if (p.rotation !== 0 && pdfPages[idx]) {
          const currentRot = pdfPages[idx].getRotation().angle;
          pdfPages[idx].setRotation(degrees((currentRot + p.rotation) % 360));
        }
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`);
      toast.success('Successfully downloaded rotated PDF document!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export rotated PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-indigo-500" /> PDF Page Rotator & Visual Organizer
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rotate individual pages or all pages 90°, 180°, or 270° with real-time visual thumbnail orientation.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-indigo-500 group-hover:scale-110 transition-transform">
            <RotateCw className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Upload PDF to rotate pages</span>
          <span className="text-[11px] text-muted-foreground">Instant visual orientation feedback</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{file.pageCount} Pages Loaded</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => rotateAll(90)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer">
                <RotateCw className="w-3.5 h-3.5 text-indigo-500" /> Rotate All 90°
              </button>
              <button onClick={() => rotateAll(180)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer">
                180°
              </button>
              <button onClick={resetAll} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-muted-foreground cursor-pointer">
                Reset
              </button>
              <button onClick={() => { setFile(null); setPages([]); }} className="text-xs font-bold text-red-500 hover:underline ml-2">
                Change File
              </button>
            </div>
          </div>

          {/* Interactive Visual Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[460px] overflow-y-auto p-2 border border-border/60 rounded-2xl bg-secondary/15">
            {pages.map((p) => (
              <div key={p.pageNum} className="p-3 bg-card rounded-2xl border border-border/70 flex flex-col items-center gap-2 shadow-xs">
                {/* Rotated Canvas Preview */}
                <div className="w-full aspect-[1/1.4] bg-background rounded-xl overflow-hidden border border-border/60 flex items-center justify-center relative">
                  <img
                    src={p.thumbnail}
                    alt={`Page ${p.pageNum}`}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 shadow-sm"
                  />
                  {p.rotation !== 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-mono font-bold">
                      {p.rotation}°
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-foreground">Page {p.pageNum}</div>

                {/* Individual Rotate Controls */}
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => rotatePage(p.pageNum, -90)}
                    className="flex-1 py-1 px-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    title="Rotate 90° Left"
                  >
                    <RotateCcw className="w-3 h-3" /> 90°
                  </button>
                  <button
                    onClick={() => rotatePage(p.pageNum, 90)}
                    className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    title="Rotate 90° Right"
                  >
                    <RotateCw className="w-3 h-3" /> 90°
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Save & Export Rotated PDF Document</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 7. PDF WATERMARK TOOL (WITH LIVE WATERMARK VIEWER)
// ----------------------------------------------------
export const PdfWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [colorScheme, setColorScheme] = useState<'gray' | 'red' | 'blue'>('gray');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count });
      
      const pdfjsDoc = await getPdfJsDocument(bytes);
      const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, 1, 0.7);
      setPreviewThumb(dataUrl);

      toast.success(`Loaded "${f.name}" (${count} pages). Adjust watermark live!`);
    } catch (err) {
      toast.error('Could not load PDF document.');
    }
  };

  const handleApplyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(file.bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      let watermarkColor = rgb(0.4, 0.4, 0.4);
      if (colorScheme === 'red') watermarkColor = rgb(0.85, 0.15, 0.15);
      if (colorScheme === 'blue') watermarkColor = rgb(0.15, 0.35, 0.85);

      pages.forEach(p => {
        const { width, height } = p.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        p.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: watermarkColor,
          opacity: opacity,
          rotate: degrees(rotation),
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`);
      toast.success('Successfully applied watermark across all pages!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-500" /> PDF Watermark Utility with Live Preview
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Stamp custom text watermarks or security badges with live optical opacity and rotation preview.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-purple-500 group-hover:scale-110 transition-transform">
            <Stamp className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Select PDF to watermark</span>
          <span className="text-[11px] text-muted-foreground">Burns security marks across all pages in memory</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-3 bg-secondary/40 rounded-2xl border border-border/70 flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{file.name} ({file.pageCount} pages)</span>
              <button onClick={() => { setFile(null); setPreviewThumb(null); }} className="text-red-500 hover:underline font-bold">
                Change
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL / DRAFT / DO NOT COPY"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setColorScheme('gray')}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  colorScheme === 'gray' ? 'bg-secondary text-foreground border-foreground/40' : 'border-border text-muted-foreground'
                }`}
              >
                Slate Gray
              </button>
              <button
                type="button"
                onClick={() => setColorScheme('red')}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  colorScheme === 'red' ? 'bg-red-500 text-white border-red-600' : 'border-border text-muted-foreground'
                }`}
              >
                Crimson Red
              </button>
              <button
                type="button"
                onClick={() => setColorScheme('blue')}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  colorScheme === 'blue' ? 'bg-blue-600 text-white border-blue-700' : 'border-border text-muted-foreground'
                }`}
              >
                Royal Blue
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded-2xl border border-border/60">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                  <span>Opacity</span>
                  <span>{(opacity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.8}
                  step={0.05}
                  value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                  <span>Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={15}
                  value={rotation}
                  onChange={e => setRotation(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                  <span>Font Size</span>
                  <span>{fontSize}pt</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  step={2}
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleApplyWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Stamp className="w-4 h-4" />}
              <span>Apply & Download Watermarked PDF ({file.pageCount} Pages)</span>
            </button>
          </div>

          {/* Live Preview Canvas (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start bg-secondary/30 border border-border/80 rounded-2xl p-4 space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-500" /> Live Overlay Preview
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Page 1 Sample</span>
            </div>

            {previewThumb && (
              <div className="w-full max-w-sm aspect-[1/1.4] bg-white rounded-xl shadow-xl overflow-hidden border border-border/80 relative flex items-center justify-center">
                <img src={previewThumb} alt="Base page preview" className="w-full h-full object-contain" />
                
                {/* Simulated Live Watermark Layer */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <span
                    style={{
                      opacity: opacity,
                      fontSize: `${fontSize * 0.75}px`,
                      color: colorScheme === 'red' ? '#dc2626' : colorScheme === 'blue' ? '#2563eb' : '#4b5563',
                    }}
                    className="font-black uppercase tracking-widest text-center select-none"
                  >
                    {watermarkText}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
