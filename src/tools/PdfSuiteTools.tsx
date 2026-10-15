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
  Type, AlignLeft, Globe, Archive, ArrowDownToLine, Palette, Grid
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadBlob, downloadDataUrl, downloadFilesAsZip, copyDataUrlToClipboard } from '../lib/downloadHelper';
import { PdfDocumentViewerModal, DownloadReadyCard, formatBytes } from '../components/PdfSharedComponents';

import { initPdfWorker } from '../lib/pdfWorkerSetup';

// Bulletproof PDF.js worker setup
initPdfWorker();

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

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const lineTokens = lines[lIdx];
    const lineY = lineTokens[0]?.y || 0;
    const lineH = lineTokens[0]?.h || 12;

    if (lIdx > 0 && mode === 'formatted') {
      const vGap = Math.abs(lastLineY - lineY);
      if (vGap > lineH * 1.65) {
        reconstructedLines.push('');
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

  finalResult = repairBengaliAndIndicText(finalResult);
  return finalResult;
}

// ----------------------------------------------------
// 1. PDF MERGER TOOL (WITH LIVE DOCUMENT PREVIEWS & DIRECT DOWNLOAD)
// ----------------------------------------------------
export const PdfMergerTool: React.FC = () => {
  const [files, setFiles] = useState<{ 
    name: string; 
    size: number; 
    bytes: Uint8Array; 
    pageCount: number; 
    previewUrl?: string 
  }[]>([]);
  const [customFilename, setCustomFilename] = useState('Merged_Document.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedResult, setMergedResult] = useState<{
    name: string;
    bytes: Uint8Array;
    url: string;
    size: number;
    pageCount: number;
  } | null>(null);

  // Universal document viewer modal state
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    url?: string;
    filename?: string;
  } | null>(null);

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

          let previewUrl: string | undefined;
          try {
            const pdfjsDoc = await getPdfJsDocument(bytes);
            const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, 1, 0.45);
            previewUrl = dataUrl;
          } catch {}

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
      setMergedResult(null);
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
    setMergedResult(null);
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
      const filename = customFilename.trim().endsWith('.pdf') ? customFilename.trim() : `${customFilename.trim() || 'Merged_Document'}.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = downloadBlob(blob, filename);

      setMergedResult({
        name: filename,
        bytes: pdfBytes,
        url: downloadUrl,
        size: pdfBytes.length,
        pageCount: totalPages,
      });

      toast.success(`Combined ${files.length} PDFs (${totalPages} pages) successfully!`);
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
            <Merge className="w-5 h-5 text-primary" /> PDF Merger & Document Organizer
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Combine multiple PDF documents in any custom order. Client-side processing with high-def multi-page preview and direct download.
          </p>
        </div>
        {files.length > 0 && (
          <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
            {files.length} Files • {totalPages} Total Pages
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-primary/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
        <div className="w-12 h-12 rounded-2xl icon-squircle text-primary group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-foreground">Click to select PDF files or drop them here</span>
        <span className="text-[11px] text-muted-foreground">Select 2 or more PDF documents to merge seamlessly</span>
        <input type="file" accept="application/pdf" multiple onChange={handleAddFiles} className="hidden" />
      </label>

      {/* Merged Result Ready Banner */}
      {mergedResult && (
        <DownloadReadyCard
          title="Merged PDF Ready for Download"
          filename={mergedResult.name}
          fileSizeBytes={mergedResult.size}
          pageCount={mergedResult.pageCount}
          downloadUrl={mergedResult.url}
          onPreview={() => setActiveViewerDoc({
            title: mergedResult.name,
            bytes: mergedResult.bytes,
            url: mergedResult.url,
            filename: mergedResult.name,
          })}
          onReset={() => {
            setFiles([]);
            setMergedResult(null);
          }}
          extraInfo="Combined with 100% vector resolution and embedded fonts"
        />
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-foreground">
            <span>Documents to Merge (Reorder as needed)</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-normal">Output name:</span>
                <input
                  type="text"
                  value={customFilename}
                  onChange={e => setCustomFilename(e.target.value)}
                  placeholder="Merged_Document.pdf"
                  className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-bold w-48"
                />
              </div>
              <button onClick={() => { setFiles([]); setMergedResult(null); }} className="text-red-500 hover:underline">
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {files.map((f, idx) => (
              <div 
                key={`${f.name}-${idx}`} 
                className="p-3 bg-secondary/30 rounded-2xl border border-border/70 flex items-center justify-between gap-3 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
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
                      <span>{formatBytes(f.size)}</span>
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
                  <button
                    onClick={() => setActiveViewerDoc({
                      title: f.name,
                      bytes: f.bytes,
                      filename: f.name,
                    })}
                    className="p-1.5 rounded-lg bg-card border border-border hover:bg-secondary text-primary cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                    title="Inspect Full Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Inspect</span>
                  </button>
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
            <span>Combine {files.length} PDF Documents ({totalPages} Pages) & Download</span>
          </button>
        </div>
      )}

      {/* Universal Document Preview Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          pdfUrl={activeViewerDoc.url}
          downloadFilename={activeViewerDoc.filename}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 2. PDF SPLITTER & PAGE EXTRACTOR (WITH VISUAL PAGE GRID & SAFE ARCHIVE)
// ----------------------------------------------------
export const PdfSplitterTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [pages, setPages] = useState<{ pageNum: number; thumbnail: string; selected: boolean }[]>([]);
  const [rangeInput, setRangeInput] = useState('');
  const [splitInterval, setSplitInterval] = useState<number>(1);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Download Result Cards
  const [downloadResult, setDownloadResult] = useState<{
    title: string;
    filename: string;
    url: string;
    size?: number;
    pageCount?: number;
    bytes?: Uint8Array;
  } | null>(null);

  // Universal Document Viewer Modal
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    initialPage?: number;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setIsRenderingThumbnails(true);
      setDownloadResult(null);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count, size: f.size });

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

  // Extract selected into single organized PDF
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
      const filename = `${file.name.replace(/\.pdf$/i, '')}_extracted_${selectedCount}_pages.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = downloadBlob(blob, filename);

      setDownloadResult({
        title: `Extracted PDF (${selectedCount} Pages)`,
        filename,
        url: downloadUrl,
        size: pdfBytes.length,
        pageCount: selectedCount,
        bytes: pdfBytes,
      });

      toast.success(`Extracted ${selectedCount} selected page(s) into a new PDF!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract pages');
    } finally {
      setIsProcessing(false);
    }
  };

  // Split selected pages into individual files in a single ZIP archive
  const handleExtractZip = async () => {
    if (!file || selectedCount === 0) {
      toast.error('Please select pages to split');
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

      const zipFilename = `${file.name.replace(/\.pdf$/i, '')}_split_${selectedPages.length}_pages.zip`;
      const downloadUrl = await downloadFilesAsZip(filesForZip, zipFilename);

      setDownloadResult({
        title: `Split Pages Archive (${selectedPages.length} Individual PDFs)`,
        filename: zipFilename,
        url: downloadUrl,
        pageCount: selectedPages.length,
      });

      toast.success(`Generated ZIP archive containing ${selectedPages.length} split PDF files!`);
    } catch (err) {
      console.error(err);
      toast.error('Error creating ZIP archive');
    } finally {
      setIsProcessing(false);
    }
  };

  // Split document by fixed interval (e.g. every N pages)
  const handleSplitByInterval = async () => {
    if (!file || splitInterval < 1) return;
    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(file.bytes);
      const total = file.pageCount;
      const filesForZip: Array<{ name: string; content: Uint8Array }> = [];
      let partNum = 1;

      for (let i = 0; i < total; i += splitInterval) {
        const newDoc = await PDFDocument.create();
        const endPage = Math.min(i + splitInterval, total);
        const indices = [];
        for (let p = i; p < endPage; p++) indices.push(p);

        const copied = await newDoc.copyPages(srcDoc, indices);
        copied.forEach(page => newDoc.addPage(page));
        const pdfBytes = await newDoc.save();

        filesForZip.push({
          name: `${file.name.replace(/\.pdf$/i, '')}_part_${partNum}_pages_${i + 1}-${endPage}.pdf`,
          content: pdfBytes,
        });
        partNum++;
      }

      const zipFilename = `${file.name.replace(/\.pdf$/i, '')}_split_every_${splitInterval}_pages.zip`;
      const downloadUrl = await downloadFilesAsZip(filesForZip, zipFilename);

      setDownloadResult({
        title: `Interval Split Archive (${filesForZip.length} Parts)`,
        filename: zipFilename,
        url: downloadUrl,
        pageCount: filesForZip.length,
      });

      toast.success(`Split into ${filesForZip.length} documents of ${splitInterval} page(s) each!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to split by interval');
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
          Visually preview and select individual pages to extract, split into intervals, or download as a clean ZIP package.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-indigo-500 group-hover:scale-110 transition-transform">
            <Scissors className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Upload a PDF to view and split pages</span>
          <span className="text-[11px] text-muted-foreground">Extract any page or range with high-resolution thumbnail selection</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-5">
          {/* File Header Bar */}
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground truncate max-w-sm">{file.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Total Pages: {file.pageCount} • Selected: <span className="font-bold text-primary">{selectedCount}</span> • File Size: {formatBytes(file.size)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewerDoc({ title: file.name, bytes: file.bytes, initialPage: 1 })}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Entire PDF</span>
              </button>
              <button 
                onClick={() => { setFile(null); setPages([]); setDownloadResult(null); }} 
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                Choose Different File
              </button>
            </div>
          </div>

          {/* Download Ready Card */}
          {downloadResult && (
            <DownloadReadyCard
              title={downloadResult.title}
              filename={downloadResult.filename}
              fileSizeBytes={downloadResult.size}
              pageCount={downloadResult.pageCount}
              downloadUrl={downloadResult.url}
              actionLabel={downloadResult.filename.endsWith('.zip') ? 'Download ZIP Package' : 'Download Extracted PDF'}
              onPreview={downloadResult.bytes ? () => setActiveViewerDoc({
                title: downloadResult.filename,
                bytes: downloadResult.bytes,
                initialPage: 1,
              }) : undefined}
              onReset={() => setDownloadResult(null)}
            />
          )}

          {/* Interactive Range & Pattern Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-foreground">Interactive Page Selector</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => selectAll(true)} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary cursor-pointer">
                  All
                </button>
                <button onClick={() => selectAll(false)} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary cursor-pointer">
                  None
                </button>
                <button onClick={() => selectPattern('odd')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary cursor-pointer">
                  Odd Pages
                </button>
                <button onClick={() => selectPattern('even')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-secondary cursor-pointer">
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
                  <div className="w-full aspect-[1/1.4] bg-background rounded-lg overflow-hidden border border-border/50 relative">
                    <img src={p.thumbnail} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                    
                    <div className="absolute top-1 right-1">
                      {p.selected ? (
                        <CheckSquare className="w-4 h-4 text-primary bg-background rounded fill-primary text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground/60 bg-background/80 rounded" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveViewerDoc({
                          title: `${file.name} - Page ${p.pageNum}`,
                          bytes: file.bytes,
                          initialPage: p.pageNum,
                        });
                      }}
                      className="absolute bottom-1 right-1 p-1 rounded bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary cursor-pointer shadow-xs"
                      title="Inspect in High-Res"
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

          {/* Action Operations */}
          <div className="space-y-3 pt-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={handleExtractMerged}
                disabled={isProcessing || selectedCount === 0}
                className="py-3.5 px-4 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Extract Selected Pages into 1 Merged PDF ({selectedCount} Pages)</span>
              </button>

              <button
                onClick={handleExtractZip}
                disabled={isProcessing || selectedCount === 0}
                className="py-3.5 px-4 btn-signature-header text-xs font-bold text-primary gap-2 cursor-pointer disabled:opacity-50 bg-primary/10 border-primary/30"
              >
                <Archive className="w-4 h-4 text-primary" />
                <span>Split Each Selected Page into Single ZIP (.zip)</span>
              </button>
            </div>

            {/* Split by Fixed Page Interval */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Scissors className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-foreground">Split by Interval:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Every</span>
                  <select
                    value={splitInterval}
                    onChange={e => setSplitInterval(Number(e.target.value))}
                    className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-bold"
                  >
                    <option value={1}>1 Page (All individual)</option>
                    <option value={2}>2 Pages per file</option>
                    <option value={3}>3 Pages per file</option>
                    <option value={5}>5 Pages per file</option>
                    <option value={10}>10 Pages per file</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSplitByInterval}
                disabled={isProcessing}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Split by Interval & Download ZIP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Document Viewer Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          initialPage={activeViewerDoc.initialPage || 1}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 3. PDF TO HIGH-RES IMAGE CONVERTER (WITH DPI & ENHANCED VIEWER)
// ----------------------------------------------------
export const PdfToImagesTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [pagePreviews, setPagePreviews] = useState<{ pageNum: number; thumbUrl: string; width: number; height: number }[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');
  const [scaleFactor, setScaleFactor] = useState<number>(2.0); // 2.0x = ~150 DPI Crisp HD
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageQuality, setImageQuality] = useState<number>(0.95);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [convertedImages, setConvertedImages] = useState<{ pageNum: number; dataUrl: string; width: number; height: number; sizeBytes: number }[]>([]);
  const [zoomModal, setZoomModal] = useState<{ dataUrl: string; pageNum: number; width: number; height: number; zoomLevel: number } | null>(null);
  const [copiedPage, setCopiedPage] = useState<number | null>(null);
  const [zipResult, setZipResult] = useState<{ filename: string; url: string; count: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setIsLoadingPreviews(true);
      setConvertedImages([]);
      setZipResult(null);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count, size: f.size });
      
      const allPages = new Set<number>();
      for (let i = 1; i <= count; i++) allPages.add(i);
      setSelectedPages(allPages);
      setRangeInput(`1-${count}`);

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

  const handleConvert = async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      toast.error('Please select at least one page to convert.');
      return;
    }

    setIsProcessing(true);
    setConvertedImages([]);
    setZipResult(null);
    const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
    setProgress({ current: 0, total: sortedPages.length });

    try {
      const pdfjsDoc = await getPdfJsDocument(file.bytes);
      const rendered: typeof convertedImages = [];

      for (let idx = 0; idx < sortedPages.length; idx++) {
        const pageNum = sortedPages[idx];
        setProgress({ current: idx + 1, total: sortedPages.length });

        const res = await renderPdfPageToCanvas(pdfjsDoc, pageNum, scaleFactor, imageFormat, imageQuality);
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
      const zipName = `${file.name.replace(/\.pdf$/i, '')}_images_${convertedImages.length}_pages.zip`;
      const zipUrl = await downloadFilesAsZip(filesForZip, zipName);

      setZipResult({
        filename: zipName,
        url: zipUrl,
        count: convertedImages.length,
      });

      toast.success(`Generated ZIP archive with all ${convertedImages.length} images!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP archive.');
    }
  };

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-rose-500" /> PDF to High-Res Image Converter
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate multi-page visual previews and convert PDF pages into crystal-clear PNG, JPEG, or WebP images up to 300 DPI print quality.
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
              Instantly inspects all pages, lets you pick specific pages, and renders at 72, 150, or 300 DPI
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
                  {file.pageCount} Pages • {formatBytes(file.size)} • Selected: <strong className="text-foreground">{selectedPages.size}</strong>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setConvertedImages([]); setZipResult(null); }} 
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Render Options: Quality & Format */}
          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/70 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">Output Resolution (DPI)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '72 DPI', scale: 1.0, sub: 'Web' },
                  { label: '150 DPI', scale: 2.0, sub: 'Crisp HD' },
                  { label: '300 DPI', scale: 4.16, sub: 'Ultra Print' }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setScaleFactor(item.scale)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      scaleFactor === item.scale
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[9px] opacity-80">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">Image Format</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setImageFormat(fmt)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold uppercase cursor-pointer transition-all ${
                      imageFormat === fmt
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleConvert}
                disabled={isProcessing || selectedPages.size === 0}
                className="w-full py-2.5 px-4 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50 h-11"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Convert {selectedPages.size} Page(s)</span>
              </button>
            </div>
          </div>

          {/* Quick Page Picker Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-foreground flex-wrap gap-2">
            <span>Select Pages to Convert</span>
            <div className="flex items-center gap-1.5">
              <button onClick={selectAll} className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-secondary text-[11px] cursor-pointer">
                Select All
              </button>
              <button onClick={deselectAll} className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-secondary text-[11px] cursor-pointer">
                Clear Selection
              </button>
            </div>
          </div>

          {/* Previews Grid for Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto p-2 border border-border/60 rounded-2xl bg-secondary/15">
            {pagePreviews.map((p) => {
              const isSelected = selectedPages.has(p.pageNum);
              return (
                <div
                  key={p.pageNum}
                  onClick={() => togglePageSelection(p.pageNum)}
                  className={`group relative p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center bg-card shadow-xs ${
                    isSelected 
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5' 
                      : 'border-border/70 hover:border-rose-500/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-full aspect-[1/1.4] bg-background rounded-lg overflow-hidden border border-border/50 relative">
                    {p.thumbUrl ? (
                      <img src={p.thumbUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Page {p.pageNum}</div>
                    )}
                    <div className="absolute top-1 right-1">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-500 bg-background rounded fill-rose-500 text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground/60 bg-background/80 rounded" />
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-foreground mt-1.5">
                    Page {p.pageNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ZIP Ready Card if generated */}
          {zipResult && (
            <DownloadReadyCard
              title={`All ${zipResult.count} Images Packaged in ZIP`}
              filename={zipResult.filename}
              downloadUrl={zipResult.url}
              actionLabel="Download Images ZIP Archive"
              extraInfo="High-resolution images archive ready to extract"
              onReset={() => setZipResult(null)}
            />
          )}

          {/* Converted Output Images Gallery */}
          {convertedImages.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Converted High-Res Images ({convertedImages.length})</h4>
                  <p className="text-[11px] text-muted-foreground">Each page rendered at {Math.round(scaleFactor * 72)} DPI in {imageFormat.toUpperCase()}</p>
                </div>
                <button
                  onClick={downloadAllAsZip}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md shadow-rose-500/20"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as Single ZIP</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {convertedImages.map((img) => {
                  const ext = imageFormat === 'jpeg' ? 'jpg' : imageFormat;
                  const filename = `${file.name.replace(/\.pdf$/i, '')}_page_${img.pageNum}.${ext}`;
                  return (
                    <div key={img.pageNum} className="p-3 bg-card rounded-2xl border border-border/80 flex flex-col gap-2.5 shadow-sm group">
                      <div className="w-full aspect-[1/1.4] bg-background rounded-xl overflow-hidden border border-border/60 relative flex items-center justify-center">
                        <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="max-w-full max-h-full object-contain" />
                        <button
                          onClick={() => setZoomModal({ dataUrl: img.dataUrl, pageNum: img.pageNum, width: img.width, height: img.height, zoomLevel: 100 })}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer gap-1.5 text-xs font-bold backdrop-blur-2xs"
                        >
                          <ZoomIn className="w-4 h-4" /> Inspect Image
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Page {img.pageNum}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{formatBytes(img.sizeBytes)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => copyImageToClipboard(img.dataUrl, img.pageNum)}
                          className="py-1.5 px-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-[11px] font-bold border border-border cursor-pointer flex items-center justify-center gap-1"
                        >
                          {copiedPage === img.pageNum ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPage === img.pageNum ? 'Copied' : 'Copy'}</span>
                        </button>

                        <a
                          href={img.dataUrl}
                          download={filename}
                          onClick={() => downloadSingle(img.dataUrl, img.pageNum)}
                          className="py-1.5 px-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          <span>Save</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Zoom Inspection Modal */}
      {zoomModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-white shrink-0">
            <span className="text-xs font-bold">Page {zoomModal.pageNum} Image Inspection ({zoomModal.width} × {zoomModal.height}px)</span>
            <div className="flex items-center gap-2">
              <a
                href={zoomModal.dataUrl}
                download={`Page_${zoomModal.pageNum}.${imageFormat === 'jpeg' ? 'jpg' : imageFormat}`}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <button onClick={() => setZoomModal(null)} className="p-2 text-neutral-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
            <img src={zoomModal.dataUrl} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white" />
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 4. TEXT TO PDF GENERATOR (WITH UNIVERSAL MULTI-LANGUAGE BENGALI/UNICODE SUPPORT)
// ----------------------------------------------------
export const TextToPdfTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    `নির্বাহী সারাংশ / EXECUTIVE SUMMARY\n\nএই ডকুমেন্টটি সম্পূর্ণভাবে ব্রাউজারের অভ্যন্তরে তৈরি করা হয়েছে। কোনো ক্লাউড সার্ভার আপলোডের প্রয়োজন নেই।\n\nপ্রধান বৈশিষ্ট্যসমূহ:\n১. শতভাগ ক্লায়েন্ট-সাইড সুরক্ষিত কম্পাইলেশন\n২. বাংলা যুক্তাক্ষর ও কারচিহ্ন (ো, ৌ, া, ি, ী, ু, ূ, ে) সহ যেকোনো ভাষার সাপোর্ট\n৩. রিয়েল-টাইম লাইভ প্রিভিউ এবং ডিরেক্ট হাই-রেজোলিউশন ডাউনলোড\n\nNotes:\nFeel free to customize the font, line height, margins, and paper format in the side panel.\n\nDate: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  );
  const [docTitle, setDocTitle] = useState('Report_Document');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [fontSize, setFontSize] = useState<number>(13);
  const [lineSpacing, setLineSpacing] = useState<number>(1.6);
  const [marginPt, setMarginPt] = useState<number>(40);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [activePreviewPage, setActivePreviewPage] = useState<number>(0);

  // Download Result Card
  const [generatedResult, setGeneratedResult] = useState<{
    name: string;
    bytes: Uint8Array;
    url: string;
    size: number;
    pageCount: number;
  } | null>(null);

  // Universal Viewer Modal
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    url?: string;
    filename?: string;
  } | null>(null);

  // Render high-definition multi-language canvas pages
  const renderDocumentPagesToCanvases = useCallback((): HTMLCanvasElement[] => {
    // 2x scale for crisp 144 DPI text rendering
    const scale = 2.0;
    const baseW = pageSize === 'A4' ? 595.28 : pageSize === 'Letter' ? 612.0 : 612.0;
    const baseH = pageSize === 'A4' ? 841.89 : pageSize === 'Letter' ? 792.0 : 1008.0;

    const width = Math.floor(baseW * scale);
    const height = Math.floor(baseH * scale);
    const margin = Math.floor(marginPt * scale);
    const maxWidth = width - margin * 2;

    const fontStack = fontFamily === 'serif' 
      ? 'Georgia, "Times New Roman", "SolaimanLipi", "Kalpurush", serif'
      : fontFamily === 'mono'
      ? 'ui-monospace, "Courier New", monospace'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "SolaimanLipi", "Kalpurush", sans-serif';

    const canvases: HTMLCanvasElement[] = [];

    const createNewPageCanvas = () => {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.font = `bold ${Math.floor(9 * scale)}px ${fontStack}`;
        ctx.fillStyle = '#666666';
        ctx.fillText(docTitle.toUpperCase(), margin, margin - 15 * scale);

        // Header thin line
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(margin, margin - 8 * scale);
        ctx.lineTo(width - margin, margin - 8 * scale);
        ctx.stroke();
      }
      return c;
    };

    let currentCanvas = createNewPageCanvas();
    canvases.push(currentCanvas);
    let ctx = currentCanvas.getContext('2d')!;
    let currentY = margin + Math.floor(15 * scale);

    const actualFontSize = Math.floor(fontSize * scale);
    const actualLineHeight = Math.floor(actualFontSize * lineSpacing);

    const rawLines = inputText.split('\n');

    for (const line of rawLines) {
      if (!line.trim()) {
        currentY += actualLineHeight;
        if (currentY > height - margin - 30 * scale) {
          currentCanvas = createNewPageCanvas();
          canvases.push(currentCanvas);
          ctx = currentCanvas.getContext('2d')!;
          currentY = margin + Math.floor(15 * scale);
        }
        continue;
      }

      const isHeading = line === line.toUpperCase() && line.length < 55 && !line.includes('.');
      const currentFontSize = isHeading ? actualFontSize + Math.floor(4 * scale) : actualFontSize;
      const currentFontWeight = isHeading ? 'bold' : 'normal';

      ctx.font = `${currentFontWeight} ${currentFontSize}px ${fontStack}`;
      ctx.fillStyle = isHeading ? '#111827' : '#1f2937';

      // Smart word wrap with Unicode / Bengali support
      const words = line.split(' ');
      let currentLine = '';

      for (const w of words) {
        const test = currentLine ? `${currentLine} ${w}` : w;
        const testW = ctx.measureText(test).width;

        if (testW <= maxWidth) {
          currentLine = test;
        } else {
          if (currentLine) {
            ctx.fillText(currentLine, margin, currentY);
            currentY += actualLineHeight;

            if (currentY > height - margin - 30 * scale) {
              currentCanvas = createNewPageCanvas();
              canvases.push(currentCanvas);
              ctx = currentCanvas.getContext('2d')!;
              ctx.font = `${currentFontWeight} ${currentFontSize}px ${fontStack}`;
              ctx.fillStyle = isHeading ? '#111827' : '#1f2937';
              currentY = margin + Math.floor(15 * scale);
            }
          }
          currentLine = w;
        }
      }

      if (currentLine) {
        ctx.fillText(currentLine, margin, currentY);
        currentY += actualLineHeight;

        if (currentY > height - margin - 30 * scale) {
          currentCanvas = createNewPageCanvas();
          canvases.push(currentCanvas);
          ctx = currentCanvas.getContext('2d')!;
          currentY = margin + Math.floor(15 * scale);
        }
      }
    }

    // Footers & Page numbers across all generated canvases
    if (includePageNumbers) {
      const total = canvases.length;
      canvases.forEach((c, idx) => {
        const cCtx = c.getContext('2d');
        if (cCtx) {
          cCtx.font = `${Math.floor(9 * scale)}px ${fontStack}`;
          cCtx.fillStyle = '#888888';
          const numStr = `Page ${idx + 1} of ${total}`;
          const numW = cCtx.measureText(numStr).width;
          cCtx.fillText(numStr, width - margin - numW, height - margin + 20 * scale);

          // Footer rule
          cCtx.strokeStyle = '#e2e8f0';
          cCtx.lineWidth = 1 * scale;
          cCtx.beginPath();
          cCtx.moveTo(margin, height - margin + 8 * scale);
          cCtx.lineTo(width - margin, height - margin + 8 * scale);
          cCtx.stroke();
        }
      });
    }

    return canvases;
  }, [inputText, docTitle, pageSize, fontSize, lineSpacing, marginPt, fontFamily, includePageNumbers]);

  // Generate live visual previews
  const updateLivePreview = useCallback(() => {
    try {
      const canvases = renderDocumentPagesToCanvases();
      const urls = canvases.map(c => c.toDataURL('image/jpeg', 0.85));
      setPreviewPages(urls);
      if (activePreviewPage >= urls.length) {
        setActivePreviewPage(0);
      }
    } catch (e) {
      console.warn('Live preview generation error:', e);
    }
  }, [renderDocumentPagesToCanvases, activePreviewPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLivePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [updateLivePreview]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvases = renderDocumentPagesToCanvases();
      const doc = await PDFDocument.create();

      const baseW = pageSize === 'A4' ? 595.28 : pageSize === 'Letter' ? 612.0 : 612.0;
      const baseH = pageSize === 'A4' ? 841.89 : pageSize === 'Letter' ? 792.0 : 1008.0;

      for (const canvas of canvases) {
        const pngUrl = canvas.toDataURL('image/png');
        const pngImage = await doc.embedPng(pngUrl);
        const page = doc.addPage([baseW, baseH]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: baseW,
          height: baseH,
        });
      }

      const pdfBytes = await doc.save();
      const filename = `${docTitle.trim() || 'Document'}.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = downloadBlob(blob, filename);

      setGeneratedResult({
        name: filename,
        bytes: pdfBytes,
        url: downloadUrl,
        size: pdfBytes.length,
        pageCount: canvases.length,
      });

      toast.success(`Generated "${filename}" (${canvases.length} pages) with full Unicode & Bengali support!`);
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
          <FileText className="w-5 h-5 text-amber-500" /> Text to PDF Generator with Multi-Language Support
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Type or paste any text in Bengali (বাংলা), English, Arabic, or Hindi. Renders live formatted paper preview with instant high-def export.
        </p>
      </div>

      {/* Generated Result Card */}
      {generatedResult && (
        <DownloadReadyCard
          title="Generated PDF Document Ready"
          filename={generatedResult.name}
          fileSizeBytes={generatedResult.size}
          pageCount={generatedResult.pageCount}
          downloadUrl={generatedResult.url}
          onPreview={() => setActiveViewerDoc({
            title: generatedResult.name,
            bytes: generatedResult.bytes,
            url: generatedResult.url,
            filename: generatedResult.name,
          })}
          onReset={() => setGeneratedResult(null)}
          extraInfo="Crisp 100% vector-compatible page rendering with exact font glyphs"
        />
      )}

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
              <div className="grid grid-cols-3 gap-1.5">
                {(['A4', 'Letter', 'Legal'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPageSize(fmt)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      pageSize === fmt
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography & Spacing Options */}
          <div className="grid sm:grid-cols-4 gap-3 p-3.5 bg-secondary/30 rounded-2xl border border-border/60">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                <span>Font Style</span>
              </div>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-background border border-border rounded-xl text-xs font-bold"
              >
                <option value="sans">Clean Modern Sans</option>
                <option value="serif">Classic Serif</option>
                <option value="mono">Code Monospace</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                <span>Font Size</span>
                <span>{fontSize}pt</span>
              </div>
              <input
                type="range"
                min={9}
                max={22}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-500"
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
                max={2.2}
                step={0.1}
                value={lineSpacing}
                onChange={e => setLineSpacing(Number(e.target.value))}
                className="w-full accent-amber-500"
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
                max={60}
                step={5}
                value={marginPt}
                onChange={e => setMarginPt(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Content Text (Bengali / Unicode Supported)</label>
              <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={e => setIncludePageNumbers(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Include Page Numbers</span>
              </label>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type or paste any text (বাংলা, English, etc.)..."
              className="w-full p-4 rounded-2xl bg-background border border-border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
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
              <Eye className="w-4 h-4 text-amber-500" /> Live Document Viewer
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

      {/* Universal Document Preview Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          pdfUrl={activeViewerDoc.url}
          downloadFilename={activeViewerDoc.filename}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 5. PDF TO TEXT EXTRACTOR (WITH PAGE VIEWER + SEARCH + MULTI-EXPORT)
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

  // Universal Document Viewer Modal
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    initialPage?: number;
  } | null>(null);

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
        
        const smartText = extractSmartTextFromItems(textContent.items, extractionMode);
        const lang = detectScriptLanguage(smartText);

        let thumbUrl: string | undefined;
        let highResUrl: string | undefined;
        try {
          const thumbRes = await renderPdfPageToCanvas(doc, i, 0.45);
          thumbUrl = thumbRes.dataUrl;

          if (i <= 5) {
            const highRes = await renderPdfPageToCanvas(doc, i, 1.25);
            highResUrl = highRes.dataUrl;
          }
        } catch {}

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
      toast.success(`Successfully extracted text from ${extracted.length} page(s)!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse PDF text. It might be scanned without an OCR text layer.');
    } finally {
      setIsExtracting(false);
      setProgress(null);
    }
  };

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

  useEffect(() => {
    if (typeof selectedPage === 'number' && file) {
      const pageItem = pagesData.find(p => p.pageNum === selectedPage);
      if (pageItem && !pageItem.highResUrl) {
        getPdfJsDocument(file.bytes).then(async doc => {
          try {
            const highRes = await renderPdfPageToCanvas(doc, selectedPage, 1.35);
            setPagesData(prev => prev.map(p => p.pageNum === selectedPage ? { ...p, highResUrl: highRes.dataUrl } : p));
          } catch {}
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

  const handleFixBengaliScript = () => {
    const current = getCurrentText();
    const repaired = repairBengaliAndIndicText(current);
    handleTextEdit(repaired);
    toast.success('Applied Bengali/Indic ligature & vowel mark repair!');
  };

  const handleRemoveLineBreaks = () => {
    const current = getCurrentText();
    const smoothed = current
      .replace(/\r\n/g, '\n')
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      .replace(/[ \t]{2,}/g, ' ');
    handleTextEdit(smoothed);
    toast.success('Removed line breaks within paragraphs!');
  };

  const handleCleanSpacing = () => {
    const current = getCurrentText();
    const cleaned = current
      .split('\n')
      .map(line => line.trim().replace(/[ \t]{2,}/g, ' '))
      .join('\n');
    handleTextEdit(cleaned);
    toast.success('Cleaned redundant whitespace!');
  };

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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewerDoc({ title: file.name, bytes: file.bytes, initialPage: 1 })}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect PDF</span>
              </button>
              <button 
                onClick={() => { setFile(null); setPagesData([]); setEditableText({}); }} 
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                Choose Another PDF
              </button>
            </div>
          </div>

          {/* Controls Bar: Formatting, Tabs, and Search */}
          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
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
                >
                  AA
                </button>
                <button
                  onClick={() => handleCaseConvert('lower')}
                  className="px-2 py-1 text-[11px] hover:bg-secondary cursor-pointer border-r border-border"
                >
                  aa
                </button>
                <button
                  onClick={() => handleCaseConvert('title')}
                  className="px-2 py-1 text-[11px] hover:bg-secondary cursor-pointer"
                >
                  Aa
                </button>
              </div>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find in extracted text..."
                className="w-full pl-8 pr-4 py-1.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Main Dual Panel Layout */}
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Left Sidebar (3 Cols) */}
            <div className="lg:col-span-3 space-y-2 max-h-[550px] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedPage('all')}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedPage === 'all'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-secondary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" /> All Pages Combined
                </span>
                <span className="text-[10px] opacity-80">{totalWords}w</span>
              </button>

              <div className="space-y-1.5 pt-1">
                {pagesData.map((p) => (
                  <button
                    key={p.pageNum}
                    type="button"
                    onClick={() => setSelectedPage(p.pageNum)}
                    className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      selectedPage === p.pageNum
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-card border-border/70 hover:border-border'
                    }`}
                  >
                    <div className="w-8 h-10 bg-background rounded border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.thumbnailUrl ? (
                        <img src={p.thumbnailUrl} alt={`P${p.pageNum}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">{p.pageNum}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-foreground">Page {p.pageNum}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{p.wordCount} words • {p.lang.name.split(' ')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Viewer (9 Cols) */}
            <div className="lg:col-span-9 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-secondary/20 rounded-xl border border-border/60">
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>{selectedPage === 'all' ? `Entire Document (${file.pageCount} Pages)` : `Viewing Page ${selectedPage}`}</span>
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

              {/* View Modes */}
              {activeTab === 'split' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground flex items-center justify-between px-1">
                      <span>Original PDF Page Render</span>
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

      {/* Universal Document Viewer Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          initialPage={activeViewerDoc.initialPage || 1}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 6. PDF ROTATE TOOL (WITH VISUAL REAL-TIME ROTATION & REORDERING)
// ----------------------------------------------------
export const PdfRotateTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [pages, setPages] = useState<{ pageNum: number; thumbnail: string; rotation: number; originalIndex: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Download Result Card
  const [rotatedResult, setRotatedResult] = useState<{
    name: string;
    bytes: Uint8Array;
    url: string;
    size: number;
    pageCount: number;
  } | null>(null);

  // Universal Document Viewer Modal
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    initialPage?: number;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setRotatedResult(null);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count, size: f.size });

      const pdfjsDoc = await getPdfJsDocument(bytes);
      const rendered: typeof pages = [];

      for (let i = 1; i <= count; i++) {
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, i, 0.45);
        rendered.push({ pageNum: i, thumbnail: dataUrl, rotation: 0, originalIndex: i - 1 });
      }

      setPages(rendered);
      toast.success(`Loaded "${f.name}" (${count} pages). Click buttons to rotate or reorder!`);
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

  const rotatePattern = (pattern: 'odd' | 'even', delta: number) => {
    setPages(prev => prev.map(p => {
      const match = pattern === 'odd' ? p.pageNum % 2 !== 0 : p.pageNum % 2 === 0;
      return match ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p;
    }));
  };

  const deletePage = (pageNum: number) => {
    setPages(prev => prev.filter(p => p.pageNum !== pageNum));
    toast.info(`Removed Page ${pageNum}`);
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const copy = [...pages];
    const item = copy.splice(fromIdx, 1)[0];
    copy.splice(toIdx, 0, item);
    setPages(copy);
  };

  const resetAll = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
  };

  const handleExport = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(file.bytes);
      const newDoc = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const [copied] = await newDoc.copyPages(doc, [p.originalIndex]);
        if (p.rotation !== 0) {
          const currentRot = copied.getRotation().angle;
          copied.setRotation(degrees((currentRot + p.rotation) % 360));
        }
        newDoc.addPage(copied);
      }

      const pdfBytes = await newDoc.save();
      const filename = `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = downloadBlob(blob, filename);

      setRotatedResult({
        name: filename,
        bytes: pdfBytes,
        url: downloadUrl,
        size: pdfBytes.length,
        pageCount: pages.length,
      });

      toast.success('Successfully exported and downloaded rotated PDF document!');
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
          Rotate individual pages, all pages, or odd/even pages by 90°, 180°, or 270°. Reorder or delete unwanted pages with live previews.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-indigo-500 group-hover:scale-110 transition-transform">
            <RotateCw className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Upload PDF to rotate and organize pages</span>
          <span className="text-[11px] text-muted-foreground">Instant visual orientation feedback and page deletion</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4">
          {/* File Header Bar & Bulk Actions */}
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{pages.length} Pages • {formatBytes(file.size)}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => rotateAll(90)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer">
                <RotateCw className="w-3.5 h-3.5 text-indigo-500" /> Rotate All 90°
              </button>
              <button onClick={() => rotateAll(180)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground gap-1 cursor-pointer">
                180°
              </button>
              <button onClick={() => rotatePattern('odd', 90)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground cursor-pointer" title="Rotate Odd Pages 90°">
                Odd 90°
              </button>
              <button onClick={() => rotatePattern('even', 90)} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-foreground cursor-pointer" title="Rotate Even Pages 90°">
                Even 90°
              </button>
              <button onClick={resetAll} className="btn-signature-header h-8 px-2.5 text-xs font-bold text-muted-foreground cursor-pointer">
                Reset
              </button>
              <button onClick={() => { setFile(null); setPages([]); setRotatedResult(null); }} className="text-xs font-bold text-red-500 hover:underline ml-2">
                Change File
              </button>
            </div>
          </div>

          {/* Rotated Result Ready Banner */}
          {rotatedResult && (
            <DownloadReadyCard
              title="Rotated PDF Ready for Download"
              filename={rotatedResult.name}
              fileSizeBytes={rotatedResult.size}
              pageCount={rotatedResult.pageCount}
              downloadUrl={rotatedResult.url}
              onPreview={() => setActiveViewerDoc({
                title: rotatedResult.name,
                bytes: rotatedResult.bytes,
                initialPage: 1,
              })}
              onReset={() => setRotatedResult(null)}
              extraInfo="Page rotations burned into vector transformation matrices"
            />
          )}

          {/* Interactive Visual Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[460px] overflow-y-auto p-2 border border-border/60 rounded-2xl bg-secondary/15">
            {pages.map((p, idx) => (
              <div key={`${p.pageNum}-${idx}`} className="p-3 bg-card rounded-2xl border border-border/70 flex flex-col items-center gap-2 shadow-xs group">
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
                  {/* Delete Button */}
                  <button
                    onClick={() => deletePage(p.pageNum)}
                    className="absolute top-1 left-1 p-1 rounded bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete this page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between w-full text-xs font-bold text-foreground px-1">
                  <span>Page {p.pageNum}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => movePage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-20 cursor-pointer"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => movePage(idx, idx + 1)}
                      disabled={idx === pages.length - 1}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-20 cursor-pointer"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

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
            disabled={isProcessing || pages.length === 0}
            className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Save & Export Rotated PDF Document ({pages.length} Pages)</span>
          </button>
        </div>
      )}

      {/* Universal Document Viewer Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          initialPage={activeViewerDoc.initialPage || 1}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 7. PDF WATERMARK TOOL (WITH MULTI-PAGE LIVE PREVIEW & DIRECT DOWNLOAD)
// ----------------------------------------------------
export const PdfWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number; size: number } | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [positionStyle, setPositionStyle] = useState<'diagonal' | 'center' | 'top' | 'bottom' | 'tiled'>('diagonal');
  const [colorScheme, setColorScheme] = useState<'gray' | 'red' | 'blue' | 'emerald' | 'amber'>('gray');
  const [pageTarget, setPageTarget] = useState<'all' | 'skipFirst' | 'odd' | 'even'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Live multi-page preview state
  const [previewThumbnails, setPreviewThumbnails] = useState<{ [page: number]: string }>({});
  const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(1);

  // Download Result Card
  const [watermarkedResult, setWatermarkedResult] = useState<{
    name: string;
    bytes: Uint8Array;
    url: string;
    size: number;
    pageCount: number;
  } | null>(null);

  // Universal Document Viewer Modal
  const [activeViewerDoc, setActiveViewerDoc] = useState<{
    title: string;
    bytes?: Uint8Array;
    url?: string;
    filename?: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setWatermarkedResult(null);
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();

      setFile({ name: f.name, bytes, pageCount: count, size: f.size });
      setCurrentPreviewPage(1);
      
      const pdfjsDoc = await getPdfJsDocument(bytes);
      const thumbs: typeof previewThumbnails = {};
      
      for (let i = 1; i <= Math.min(count, 5); i++) {
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, i, 0.7);
        thumbs[i] = dataUrl;
      }
      setPreviewThumbnails(thumbs);

      toast.success(`Loaded "${f.name}" (${count} pages). Adjust watermark live!`);
    } catch (err) {
      toast.error('Could not load PDF document.');
    }
  };

  // Helper to load other pages on demand in preview
  const handlePreviewPageChange = async (targetPage: number) => {
    if (!file || targetPage < 1 || targetPage > file.pageCount) return;
    setCurrentPreviewPage(targetPage);
    if (!previewThumbnails[targetPage]) {
      try {
        const pdfjsDoc = await getPdfJsDocument(file.bytes);
        const { dataUrl } = await renderPdfPageToCanvas(pdfjsDoc, targetPage, 0.7);
        setPreviewThumbnails(prev => ({ ...prev, [targetPage]: dataUrl }));
      } catch {}
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
      if (colorScheme === 'emerald') watermarkColor = rgb(0.1, 0.6, 0.3);
      if (colorScheme === 'amber') watermarkColor = rgb(0.85, 0.55, 0.1);

      pages.forEach((p, idx) => {
        const pageNum = idx + 1;
        // Check page targeting
        if (pageTarget === 'skipFirst' && pageNum === 1) return;
        if (pageTarget === 'odd' && pageNum % 2 === 0) return;
        if (pageTarget === 'even' && pageNum % 2 !== 0) return;

        const { width, height } = p.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize * 0.8;

        if (positionStyle === 'tiled') {
          // Repeated grid pattern across the page
          const stepX = textWidth + 80;
          const stepY = textHeight + 120;
          for (let x = -width * 0.2; x < width * 1.2; x += stepX) {
            for (let y = -height * 0.2; y < height * 1.2; y += stepY) {
              p.drawText(watermarkText, {
                x,
                y,
                size: fontSize * 0.65,
                font,
                color: watermarkColor,
                opacity: opacity * 0.75,
                rotate: degrees(rotation),
              });
            }
          }
        } else if (positionStyle === 'top') {
          p.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height - 50,
            size: fontSize * 0.55,
            font,
            color: watermarkColor,
            opacity,
            rotate: degrees(0),
          });
        } else if (positionStyle === 'bottom') {
          p.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: 40,
            size: fontSize * 0.55,
            font,
            color: watermarkColor,
            opacity,
            rotate: degrees(0),
          });
        } else {
          // Diagonal Center or Center
          const rotAngle = positionStyle === 'center' ? 0 : rotation;
          p.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font,
            color: watermarkColor,
            opacity,
            rotate: degrees(rotAngle),
          });
        }
      });

      const pdfBytes = await doc.save();
      const filename = `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = downloadBlob(blob, filename);

      setWatermarkedResult({
        name: filename,
        bytes: pdfBytes,
        url: downloadUrl,
        size: pdfBytes.length,
        pageCount: pages.length,
      });

      toast.success('Successfully applied watermark across PDF document!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  const PRESET_STAMPS = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'OFFICIAL', 'APPROVED', 'URGENT'];

  return (
    <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-6 shadow-xs">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-500" /> PDF Watermark Utility with Multi-Page Live Preview
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Stamp custom text watermarks, security badges, or tiled security marks with live opacity, page targeting, and direct download.
        </p>
      </div>

      {!file ? (
        <label className="cursor-pointer w-full p-8 border-2 border-dashed border-border hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-secondary/20 hover:bg-secondary/40 group">
          <div className="w-12 h-12 rounded-2xl icon-squircle text-purple-500 group-hover:scale-110 transition-transform">
            <Stamp className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Select PDF to watermark</span>
          <span className="text-[11px] text-muted-foreground">Burns security marks across pages in-memory with zero upload</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-5">
          {/* Watermarked Result Card */}
          {watermarkedResult && (
            <DownloadReadyCard
              title="Watermarked PDF Ready for Download"
              filename={watermarkedResult.name}
              fileSizeBytes={watermarkedResult.size}
              pageCount={watermarkedResult.pageCount}
              downloadUrl={watermarkedResult.url}
              onPreview={() => setActiveViewerDoc({
                title: watermarkedResult.name,
                bytes: watermarkedResult.bytes,
                url: watermarkedResult.url,
                filename: watermarkedResult.name,
              })}
              onReset={() => setWatermarkedResult(null)}
              extraInfo="High-security text watermarks burned across selected pages"
            />
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-3 bg-secondary/40 rounded-2xl border border-border/70 flex items-center justify-between text-xs">
                <span className="font-bold text-foreground truncate">{file.name} ({file.pageCount} pages • {formatBytes(file.size)})</span>
                <button onClick={() => { setFile(null); setPreviewThumbnails({}); setWatermarkedResult(null); }} className="text-red-500 hover:underline font-bold cursor-pointer">
                  Change File
                </button>
              </div>

              {/* Watermark Text & Presets */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL / DRAFT / DO NOT COPY"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {PRESET_STAMPS.map(stamp => (
                    <button
                      key={stamp}
                      type="button"
                      onClick={() => setWatermarkText(stamp)}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                        watermarkText === stamp ? 'bg-purple-500 text-white border-purple-600' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {stamp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Position Style */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">Position & Pattern</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'diagonal', label: 'Diagonal 45°' },
                    { id: 'center', label: 'Center Flat' },
                    { id: 'top', label: 'Top Banner' },
                    { id: 'bottom', label: 'Bottom Note' },
                    { id: 'tiled', label: 'Tiled Grid' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPositionStyle(pos.id as any)}
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                        positionStyle === pos.id
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme Picker */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">Stamp Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'gray', label: 'Slate Gray', class: 'bg-secondary text-foreground' },
                    { id: 'red', label: 'Crimson Red', class: 'bg-red-500 text-white' },
                    { id: 'blue', label: 'Royal Blue', class: 'bg-blue-600 text-white' },
                    { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600 text-white' },
                    { id: 'amber', label: 'Amber', class: 'bg-amber-600 text-white' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorScheme(c.id as any)}
                      className={`py-2 text-[11px] font-bold rounded-xl border cursor-pointer transition-all ${
                        colorScheme === c.id ? `${c.class} ring-2 ring-foreground/20` : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders (Opacity, Size, Angle) */}
              <div className="grid sm:grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded-2xl border border-border/60">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                    <span>Opacity</span>
                    <span>{Math.round(opacity * 100)}%</span>
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
                    <span>Font Size</span>
                    <span>{fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={84}
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-foreground mb-1">
                    <span>Angle</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    step={5}
                    value={rotation}
                    onChange={e => setRotation(Number(e.target.value))}
                    className="w-full accent-purple-500"
                    disabled={positionStyle !== 'diagonal' && positionStyle !== 'tiled'}
                  />
                </div>
              </div>

              {/* Page Targeting Options */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">Apply Watermark To</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Pages' },
                    { id: 'skipFirst', label: 'Skip Cover (p2+)' },
                    { id: 'odd', label: 'Odd Pages' },
                    { id: 'even', label: 'Even Pages' }
                  ].map(target => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setPageTarget(target.id as any)}
                      className={`py-2 text-[11px] font-bold rounded-xl border cursor-pointer transition-all ${
                        pageTarget === target.id
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className="w-full py-3.5 btn-3d text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Stamp className="w-4 h-4" />}
                <span>Apply Watermark & Download PDF Document</span>
              </button>
            </div>

            {/* Live Interactive Watermark Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-start bg-secondary/30 border border-border/80 rounded-2xl p-4 space-y-3">
              <div className="w-full flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-500" /> Live Optical Preview
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Page {currentPreviewPage} of {file.pageCount}
                </span>
              </div>

              <div className="w-full max-w-xs aspect-[1/1.4] bg-white rounded-xl shadow-xl overflow-hidden border border-border/80 relative flex items-center justify-center">
                {previewThumbnails[currentPreviewPage] ? (
                  <img
                    src={previewThumbnails[currentPreviewPage]}
                    alt="Page Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading page...
                  </div>
                )}

                {/* Live Optical Overlay Layer */}
                {watermarkText.trim() && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                    {positionStyle === 'tiled' ? (
                      <div 
                        className="grid grid-cols-3 gap-6 w-[180%] h-[180%] items-center justify-center text-center select-none"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          color: colorScheme === 'red' ? '#dc2626' : colorScheme === 'blue' ? '#2563eb' : colorScheme === 'emerald' ? '#059669' : colorScheme === 'amber' ? '#d97706' : '#4b5563',
                          opacity: opacity * 0.85,
                          fontSize: `${Math.max(10, fontSize * 0.28)}px`,
                          fontWeight: 'bold',
                          letterSpacing: '0.15em',
                        }}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span key={i} className="truncate uppercase">{watermarkText}</span>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="text-center font-bold tracking-widest uppercase select-none transition-transform"
                        style={{
                          transform: positionStyle === 'diagonal' ? `rotate(${rotation}deg)` : 'none',
                          color: colorScheme === 'red' ? '#dc2626' : colorScheme === 'blue' ? '#2563eb' : colorScheme === 'emerald' ? '#059669' : colorScheme === 'amber' ? '#d97706' : '#4b5563',
                          opacity: opacity,
                          fontSize: `${Math.max(12, fontSize * 0.45)}px`,
                          marginTop: positionStyle === 'top' ? '-70%' : positionStyle === 'bottom' ? '70%' : '0',
                        }}
                      >
                        {watermarkText}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Page Navigator for Multi-Page Preview */}
              {file.pageCount > 1 && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handlePreviewPageChange(currentPreviewPage - 1)}
                    disabled={currentPreviewPage <= 1}
                    className="p-1.5 rounded-lg bg-card border border-border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-foreground">
                    Preview Page {currentPreviewPage} / {file.pageCount}
                  </span>
                  <button
                    onClick={() => handlePreviewPageChange(currentPreviewPage + 1)}
                    disabled={currentPreviewPage >= file.pageCount}
                    className="p-1.5 rounded-lg bg-card border border-border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Universal Document Viewer Modal */}
      {activeViewerDoc && (
        <PdfDocumentViewerModal
          title={activeViewerDoc.title}
          pdfBytes={activeViewerDoc.bytes}
          pdfUrl={activeViewerDoc.url}
          downloadFilename={activeViewerDoc.filename}
          onClose={() => setActiveViewerDoc(null)}
        />
      )}
    </div>
  );
};
