import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Minimize2, Download, Printer, RotateCw, Check, Sparkles, 
  FileText, ArrowDownToLine, RefreshCw, Layers
} from 'lucide-react';
import { toast } from 'sonner';

export function formatBytes(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ----------------------------------------------------
// UNIVERSAL HIGH-DEF PDF DOCUMENT VIEWER MODAL
// ----------------------------------------------------
interface PdfViewerModalProps {
  title: string;
  pdfBytes?: Uint8Array | null;
  pdfUrl?: string | null;
  initialPage?: number;
  onClose: () => void;
  onDownload?: () => void;
  downloadFilename?: string;
}

export const PdfDocumentViewerModal: React.FC<PdfViewerModalProps> = ({
  title,
  pdfBytes,
  pdfUrl,
  initialPage = 1,
  onClose,
  onDownload,
  downloadFilename
}) => {
  const [doc, setDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thumbnails, setThumbnails] = useState<{ [page: number]: string }>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function load() {
      try {
        let loadingTask;
        if (pdfBytes) {
          const safeData = new Uint8Array(pdfBytes.slice(0));
          loadingTask = pdfjsLib.getDocument({
            data: safeData,
            cMapUrl: '/cmaps/',
            cMapPacked: true,
          });
        } else if (pdfUrl) {
          loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: '/cmaps/',
            cMapPacked: true,
          });
        } else {
          return;
        }

        const loadedDoc = await loadingTask.promise;
        if (!isCancelled) {
          setDoc(loadedDoc);
          setNumPages(loadedDoc.numPages);
          setCurrentPage(Math.min(initialPage, loadedDoc.numPages));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF in viewer:', err);
        if (!isCancelled) {
          setIsLoading(false);
          toast.error('Could not render document preview.');
        }
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, pdfUrl, initialPage]);

  // Render Current Page
  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let renderTask: any = null;

    async function renderPage() {
      try {
        const page = await doc.getPage(currentPage);
        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
        });

        await renderTask.promise;

        // Cache thumbnail for filmstrip
        if (!thumbnails[currentPage]) {
          try {
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.6);
            setThumbnails(prev => ({ ...prev, [currentPage]: thumbUrl }));
          } catch {}
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Page render error:', err);
        }
      }
    }

    renderPage();
    return () => {
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [doc, currentPage, scale, rotation]);

  // Pre-fetch all small thumbnails for filmstrip
  useEffect(() => {
    if (!doc || numPages === 0) return;
    let isCancelled = false;

    async function generateThumbs() {
      for (let i = 1; i <= Math.min(numPages, 30); i++) {
        if (isCancelled) break;
        if (thumbnails[i]) continue;
        try {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 0.25 });
          const c = document.createElement('canvas');
          c.width = Math.floor(vp.width);
          c.height = Math.floor(vp.height);
          const cx = c.getContext('2d');
          if (cx) {
            cx.fillStyle = '#ffffff';
            cx.fillRect(0, 0, c.width, c.height);
            await page.render({ canvasContext: cx, viewport: vp }).promise;
            if (!isCancelled) {
              setThumbnails(prev => ({ ...prev, [i]: c.toDataURL('image/jpeg', 0.5) }));
            }
          }
        } catch {}
      }
    }

    generateThumbs();
    return () => {
      isCancelled = true;
    };
  }, [doc, numPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(p => Math.min(numPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, onClose]);

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${title}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;">
            <img src="${canvasRef.current.toDataURL()}" style="max-width:100%;height:auto;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } else {
      toast.info('Popup blocked. Use browser print (Ctrl+P).');
    }
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!isFullscreen) {
      if (modalContainerRef.current.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold truncate text-neutral-100 max-w-xs sm:max-w-md">{title}</h4>
            <span className="text-[10px] text-neutral-400">
              Page {currentPage} of {numPages || '...'} • {Math.round(scale * 100)}% Zoom
            </span>
          </div>
        </div>

        {/* Central Zoom & Page Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Page Turn */}
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-200 cursor-pointer"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-2 text-xs font-mono font-bold text-neutral-200 min-w-14 text-center">
              {currentPage} / {numPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-200 cursor-pointer"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}
              className="p-1 hover:bg-neutral-700 rounded text-neutral-200 cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-neutral-300 min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(3.0, +(s + 0.25).toFixed(2)))}
              className="p-1 hover:bg-neutral-700 rounded text-neutral-200 cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotate View on the Fly */}
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white cursor-pointer"
            title="Rotate View 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white cursor-pointer hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Direct Print */}
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white cursor-pointer hidden md:block"
            title="Print Current Page"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download Button in modal if available */}
          {(onDownload || pdfUrl) && (
            <button
              onClick={onDownload || (() => {
                if (pdfUrl) {
                  const a = document.createElement('a');
                  a.href = pdfUrl;
                  a.download = downloadFilename || 'document.pdf';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-lg cursor-pointer ml-1"
            title="Close Viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        ref={modalContainerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-neutral-950/80"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold tracking-wide">Rendering Crisp High-Res PDF...</span>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded-sm overflow-hidden border border-neutral-700/80 bg-white">
            <canvas ref={canvasRef} className="block max-w-full h-auto transition-transform duration-200" />
          </div>
        )}
      </div>

      {/* Bottom Filmstrip Thumbnails Navigation */}
      {numPages > 1 && (
        <div className="h-20 bg-neutral-900 border-t border-neutral-800 px-4 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
          {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`h-16 aspect-[1/1.4] rounded-md overflow-hidden border-2 shrink-0 relative transition-all cursor-pointer ${
                currentPage === pageNum 
                  ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-md bg-white' 
                  : 'border-neutral-700 hover:border-neutral-500 opacity-60 hover:opacity-100 bg-neutral-800'
              }`}
            >
              {thumbnails[pageNum] ? (
                <img 
                  src={thumbnails[pageNum]} 
                  alt={`Page ${pageNum}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                  {pageNum}
                </div>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center font-bold">
                {pageNum}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// UNIVERSAL DOWNLOAD READY CARD
// ----------------------------------------------------
interface DownloadReadyCardProps {
  title: string;
  filename: string;
  fileSizeBytes?: number;
  pageCount?: number;
  downloadUrl: string;
  onPreview?: () => void;
  onReset?: () => void;
  extraInfo?: string;
  actionLabel?: string;
}

export const DownloadReadyCard: React.FC<DownloadReadyCardProps> = ({
  title,
  filename,
  fileSizeBytes,
  pageCount,
  downloadUrl,
  onPreview,
  onReset,
  extraInfo,
  actionLabel = 'Download PDF'
}) => {
  const [downloadCount, setDownloadCount] = useState<number>(0);

  const handleDownloadClick = () => {
    setDownloadCount(c => c + 1);
    toast.success(`Downloading "${filename}"...`);
  };

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/30 border-2 border-primary/30 rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-foreground">{title}</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Ready to Save
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-sm sm:max-w-md">
              {filename}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-muted-foreground font-medium">
              {fileSizeBytes !== undefined && fileSizeBytes > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground font-bold">
                  {formatBytes(fileSizeBytes)}
                </span>
              )}
              {pageCount !== undefined && pageCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground font-bold">
                  {pageCount} Page{pageCount > 1 ? 's' : ''}
                </span>
              )}
              {extraInfo && (
                <span className="text-muted-foreground">{extraInfo}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onPreview && (
            <button
              onClick={onPreview}
              type="button"
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold border border-border cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>Preview Document</span>
            </button>
          )}

          {/* Primary Direct Download Link: Native anchor tag guaranteed to work anywhere */}
          <a
            href={downloadUrl}
            download={filename}
            onClick={handleDownloadClick}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md shadow-primary/20 hover:scale-[1.02]"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{actionLabel}</span>
            {downloadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </a>

          {onReset && (
            <button
              onClick={onReset}
              type="button"
              className="px-3 py-2.5 text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer hover:underline"
            >
              Process Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
