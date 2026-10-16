import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PenTool,
  Highlighter,
  Type,
  Square,
  Circle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Stamp as StampIcon,
  Eraser,
  Move,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';

import { initPdfWorker } from '../lib/pdfWorkerSetup';

// Ensure PDF.js worker is registered
initPdfWorker();

// Annotation types
export type AnnotationTool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'signature'
  | 'stamp';

export interface FreehandStroke {
  id: string;
  type: 'stroke';
  tool: 'pen' | 'highlighter';
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  isBold?: boolean;
}

export interface ShapeAnnotation {
  id: string;
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  filled?: boolean;
}

export interface StampAnnotation {
  id: string;
  type: 'stamp';
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureAnnotation {
  id: string;
  type: 'signature';
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PageAnnotation =
  | FreehandStroke
  | TextAnnotation
  | ShapeAnnotation
  | StampAnnotation
  | SignatureAnnotation;

export interface PageMeta {
  pageNum: number;
  rotation: number; // 0, 90, 180, 270
  originalIndex: number;
  thumbnailUrl?: string;
  width: number;
  height: number;
}

const PRESET_COLORS = [
  '#000000',
  '#dc2626',
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#9333ea',
  '#0891b2',
  '#ffffff',
];

const PRESET_STAMPS = [
  { text: 'APPROVED', color: '#16a34a' },
  { text: 'CONFIDENTIAL', color: '#dc2626' },
  { text: 'DRAFT', color: '#64748b' },
  { text: 'REVIEWED', color: '#2563eb' },
  { text: 'SIGN HERE', color: '#d97706' },
  { text: 'VOID', color: '#991b1b' },
];

export const PdfEditorAppTool: React.FC = () => {
  // Document state
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; size: number } | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pdfJsDoc, setPdfJsDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Zoom & View
  const [zoomScale, setZoomScale] = useState<number>(1.25);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Active Tooling
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#dc2626');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(18);
  const [isTextBold, setIsTextBold] = useState<boolean>(true);

  // Annotations organized per original page index
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, PageAnnotation[]>>({});
  const [history, setHistory] = useState<Record<number, PageAnnotation[]>[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Signature Modal State
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSignature, setTypedSignature] = useState<string>('');
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSignatureDrawing, setIsSignatureDrawing] = useState<boolean>(false);

  // Stamp Modal State
  const [showStampModal, setShowStampModal] = useState<boolean>(false);

  // Canvas references
  const mainPdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceContainerRef = useRef<HTMLDivElement | null>(null);
  const currentRenderTaskRef = useRef<any>(null);

  // Interactive drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Text insertion state
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Push history snapshot
  const pushHistory = useCallback((newAnnotations: Record<number, PageAnnotation[]>) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyStep + 1);
      return [...upToCurrent, JSON.parse(JSON.stringify(newAnnotations))];
    });
    setHistoryStep(prev => prev + 1);
  }, [historyStep]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setPageAnnotations(JSON.parse(JSON.stringify(history[prevStep])));
      setHistoryStep(prevStep);
    }
  }, [history, historyStep]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setPageAnnotations(JSON.parse(JSON.stringify(history[nextStep])));
      setHistoryStep(nextStep);
    }
  }, [history, historyStep]);

  // Load PDF file from Uint8Array
  const loadPdfBytes = async (bytes: Uint8Array, fileName: string) => {
    setIsLoading(true);
    try {
      const safeData = new Uint8Array(bytes.slice(0));
      let doc;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: safeData,
          cMapUrl: '/cmaps/',
          cMapPacked: true,
          enableXfa: true,
        });
        doc = await loadingTask.promise;
      } catch {
        const fallbackTask = pdfjsLib.getDocument({
          data: safeData,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.4.299'}/cmaps/`,
          cMapPacked: true,
          enableXfa: true,
        });
        doc = await fallbackTask.promise;
      }

      setPdfJsDoc(doc);
      setFile({ name: fileName, bytes, size: bytes.byteLength });

      const count = doc.numPages;
      const initialPages: PageMeta[] = [];

      for (let i = 1; i <= count; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        initialPages.push({
          pageNum: i,
          rotation: 0,
          originalIndex: i - 1,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(initialPages);
      setCurrentPageIndex(0);
      setPageAnnotations({});
      setHistory([{}]);
      setHistoryStep(0);

      // Render thumbnail for first few pages in background
      renderThumbnails(doc, initialPages);
      toast.success(`Loaded "${fileName}" (${count} pages). Ready for editing!`);
    } catch (err: any) {
      console.error('PDF Load Error:', err);
      toast.error('Failed to parse PDF: ' + (err?.message || 'Invalid or corrupted file.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Render thumbnails for sidebar
  const renderThumbnails = async (doc: any, pageList: PageMeta[]) => {
    const updated = [...pageList];
    for (let i = 0; i < Math.min(updated.length, 12); i++) {
      try {
        const page = await doc.getPage(updated[i].pageNum);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          updated[i].thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        }
      } catch {}
    }
    setPages([...updated]);
  };

  // Generate Sample Demo PDF
  const handleLoadDemoPdf = async () => {
    try {
      setIsLoading(true);
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

      // Page 1: Professional NDA Agreement
      const page1 = doc.addPage([595, 842]);
      page1.drawText('MUTUAL NON-DISCLOSURE AGREEMENT', {
        x: 50,
        y: 770,
        size: 18,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.2),
      });

      page1.drawText('Confidentiality & Intellectual Property Protection Record', {
        x: 50,
        y: 745,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.5),
      });

      page1.drawLine({
        start: { x: 50, y: 730 },
        end: { x: 545, y: 730 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.85),
      });

      const bodyText = [
        '1. Purpose: The parties wish to explore a business relationship regarding software technology.',
        '2. Confidential Information: Includes all data, source code, designs, and product blueprints.',
        '3. Obligations: The Recipient shall hold all Confidential Information in strict confidence.',
        '4. Term: This agreement shall remain effective for a period of five (5) years from signing.',
        '5. Jurisdiction: This Agreement shall be governed by international commercial trade laws.',
        '',
        'Signatures below indicate full mutual agreement to the stated terms:',
      ];

      let yPos = 690;
      for (const line of bodyText) {
        page1.drawText(line, {
          x: 50,
          y: yPos,
          size: 10.5,
          font,
          color: rgb(0.2, 0.2, 0.25),
        });
        yPos -= 28;
      }

      // Signature line placeholders
      page1.drawRectangle({
        x: 50,
        y: 400,
        width: 220,
        height: 60,
        borderColor: rgb(0.8, 0.8, 0.85),
        borderWidth: 1,
      });
      page1.drawText('Authorized Signature: Party A', { x: 55, y: 445, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

      page1.drawRectangle({
        x: 325,
        y: 400,
        width: 220,
        height: 60,
        borderColor: rgb(0.8, 0.8, 0.85),
        borderWidth: 1,
      });
      page1.drawText('Authorized Signature: Party B', { x: 330, y: 445, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

      // Page 2: Summary Specification Sheet
      const page2 = doc.addPage([595, 842]);
      page2.drawText('APPENDIX A - SYSTEM ARCHITECTURE SPECIFICATIONS', {
        x: 50,
        y: 770,
        size: 15,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.2),
      });

      page2.drawText('Verify all hardware parameters before signing off for release deployment.', {
        x: 50,
        y: 745,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.5),
      });

      const samplePdfBytes = await doc.save();
      await loadPdfBytes(samplePdfBytes, 'Sample_Agreement_Contract.pdf');
    } catch (e: any) {
      toast.error('Could not generate sample PDF: ' + e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
      toast.error('Please upload a valid PDF document (.pdf)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = reader.result as ArrayBuffer;
      await loadPdfBytes(new Uint8Array(buffer), uploadedFile.name);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // Redraw all annotations for current page
  const redrawAnnotations = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || pages.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;

    const annotations = pageAnnotations[currentPage.originalIndex] || [];

    for (const ann of annotations) {
      if (ann.type === 'stroke') {
        if (ann.points.length < 2) continue;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size * zoomScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = ann.opacity || 1.0;

        ctx.moveTo(ann.points[0].x * zoomScale, ann.points[0].y * zoomScale);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x * zoomScale, ann.points[i].y * zoomScale);
        }
        ctx.stroke();
        ctx.restore();
      } else if (ann.type === 'text') {
        ctx.save();
        ctx.font = `${ann.isBold ? 'bold ' : ''}${Math.round(ann.fontSize * zoomScale)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, ann.x * zoomScale, ann.y * zoomScale);
        ctx.restore();
      } else if (ann.type === 'shape') {
        ctx.save();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.strokeWidth * zoomScale;
        ctx.fillStyle = ann.color;

        const x = ann.x * zoomScale;
        const y = ann.y * zoomScale;
        const w = ann.width * zoomScale;
        const h = ann.height * zoomScale;

        if (ann.shape === 'rectangle') {
          ctx.strokeRect(x, y, w, h);
          if (ann.filled) {
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, y, w, h);
          }
        } else if (ann.shape === 'circle') {
          ctx.beginPath();
          ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (ann.filled) {
            ctx.globalAlpha = 0.2;
            ctx.fill();
          }
        } else if (ann.shape === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(h, w);
          const headLen = 14 * zoomScale;
          ctx.beginPath();
          ctx.moveTo(x + w, y + h);
          ctx.lineTo(
            x + w - headLen * Math.cos(angle - Math.PI / 6),
            y + h - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(x + w, y + h);
          ctx.lineTo(
            x + w - headLen * Math.cos(angle + Math.PI / 6),
            y + h - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        ctx.restore();
      } else if (ann.type === 'stamp') {
        ctx.save();
        const x = ann.x * zoomScale;
        const y = ann.y * zoomScale;
        const w = ann.width * zoomScale;
        const h = ann.height * zoomScale;

        // Stamp container
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = 3 * zoomScale;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = ann.color;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;

        ctx.font = `bold ${Math.round(14 * zoomScale)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ann.text, x + w / 2, y + h / 2);
        ctx.restore();
      } else if (ann.type === 'signature') {
        const img = new Image();
        img.src = ann.dataUrl;
        const x = ann.x * zoomScale;
        const y = ann.y * zoomScale;
        const w = ann.width * zoomScale;
        const h = ann.height * zoomScale;

        if (img.complete) {
          ctx.drawImage(img, x, y, w, h);
        } else {
          img.onload = () => {
            ctx.drawImage(img, x, y, w, h);
          };
        }
      }
    }
  }, [pages, currentPageIndex, pageAnnotations, zoomScale]);

  // Render current PDF page on canvas with strict single-task locking
  const renderCurrentPage = useCallback(async () => {
    if (!pdfJsDoc || pages.length === 0 || currentPageIndex >= pages.length) return;

    // 1. Cancel previous in-flight render operation on this canvas
    if (currentRenderTaskRef.current) {
      try {
        currentRenderTaskRef.current.cancel();
      } catch {}
      currentRenderTaskRef.current = null;
    }

    const pageMeta = pages[currentPageIndex];
    if (!pageMeta) return;

    let page;
    try {
      page = await pdfJsDoc.getPage(pageMeta.pageNum);
    } catch {
      return;
    }

    const viewport = page.getViewport({
      scale: zoomScale,
      rotation: pageMeta.rotation,
    });

    const canvas = mainPdfCanvasRef.current;
    if (!canvas) return;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Execute render task and track reference
    try {
      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });
      currentRenderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      // PDF.js throws RenderingCancelledException when cancelled intentionally
      if (err?.name === 'RenderingCancelledException' || err?.message?.includes('cancelled')) {
        return;
      }
      console.warn('PDF Page Render Notice:', err?.message || err);
      return;
    } finally {
      currentRenderTaskRef.current = null;
    }

    // 3. Synchronize drawing overlay canvas
    const drawCanvas = drawingCanvasRef.current;
    if (drawCanvas) {
      drawCanvas.width = canvas.width;
      drawCanvas.height = canvas.height;
      redrawAnnotations();
    }
  }, [pdfJsDoc, pages, currentPageIndex, zoomScale, redrawAnnotations]);

  useEffect(() => {
    renderCurrentPage();

    return () => {
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {}
        currentRenderTaskRef.current = null;
      }
    };
  }, [renderCurrentPage]);


  // Page Operations
  const handleRotatePage = (direction: 'cw' | 'ccw') => {
    if (pages.length === 0) return;
    setPages(prev => {
      const copy = [...prev];
      const cur = copy[currentPageIndex];
      const delta = direction === 'cw' ? 90 : -90;
      cur.rotation = (cur.rotation + delta + 360) % 360;
      return copy;
    });
    toast.success(`Rotated page ${currentPageIndex + 1} ${direction === 'cw' ? '90° CW' : '90° CCW'}`);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last remaining page.');
      return;
    }
    const targetNum = pages[currentPageIndex].pageNum;
    setPages(prev => prev.filter((_, idx) => idx !== currentPageIndex));
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
    toast.success(`Deleted page ${targetNum}.`);
  };

  // Mouse / Pointer Event Coordinates on overlay canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: clientX / zoomScale,
      y: clientY / zoomScale,
    };
  };

  // Drawing event handlers
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'text') {
      setActiveTextInput({ x: coords.x, y: coords.y, text: '' });
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      currentStrokeRef.current = [coords];
      return;
    }

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'arrow') {
      setIsDrawing(true);
      shapeStartRef.current = coords;
      return;
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentStrokeRef.current.push(coords);
      redrawAnnotations();

      // Draw active in-progress stroke
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = (activeTool === 'highlighter' ? 16 : brushSize) * zoomScale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1.0;

      const pts = currentStrokeRef.current;
      if (pts.length > 1) {
        ctx.moveTo(pts[0].x * zoomScale, pts[0].y * zoomScale);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * zoomScale, pts[i].y * zoomScale);
        }
        ctx.stroke();
      }
      ctx.restore();
    } else if (shapeStartRef.current) {
      redrawAnnotations();
      // Draw live shape guide
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize * zoomScale;

      const startX = shapeStartRef.current.x * zoomScale;
      const startY = shapeStartRef.current.y * zoomScale;
      const curX = coords.x * zoomScale;
      const curY = coords.y * zoomScale;
      const w = curX - startX;
      const h = curY - startY;

      if (activeTool === 'rectangle') {
        ctx.strokeRect(startX, startY, w, h);
      } else if (activeTool === 'circle') {
        ctx.beginPath();
        ctx.ellipse(startX + w / 2, startY + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    const pageIdx = currentPage.originalIndex;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      if (currentStrokeRef.current.length > 1) {
        const newStroke: FreehandStroke = {
          id: `stroke-${Date.now()}`,
          type: 'stroke',
          tool: activeTool,
          points: [...currentStrokeRef.current],
          color: currentColor,
          size: activeTool === 'highlighter' ? 16 : brushSize,
          opacity: activeTool === 'highlighter' ? 0.35 : 1.0,
        };

        const next = {
          ...pageAnnotations,
          [pageIdx]: [...(pageAnnotations[pageIdx] || []), newStroke],
        };
        setPageAnnotations(next);
        pushHistory(next);
      }
      currentStrokeRef.current = [];
    } else if (shapeStartRef.current) {
      const coords = getCanvasCoords(e);
      const start = shapeStartRef.current;
      const w = coords.x - start.x;
      const h = coords.y - start.y;

      if (Math.abs(w) > 4 && Math.abs(h) > 4) {
        const newShape: ShapeAnnotation = {
          id: `shape-${Date.now()}`,
          type: 'shape',
          shape: activeTool as 'rectangle' | 'circle' | 'arrow',
          x: Math.min(start.x, coords.x),
          y: Math.min(start.y, coords.y),
          width: Math.abs(w),
          height: Math.abs(h),
          color: currentColor,
          strokeWidth: brushSize,
        };

        const next = {
          ...pageAnnotations,
          [pageIdx]: [...(pageAnnotations[pageIdx] || []), newShape],
        };
        setPageAnnotations(next);
        pushHistory(next);
      }
      shapeStartRef.current = null;
    }
    redrawAnnotations();
  };

  // Submit Text Annotation
  const handleCommitText = () => {
    if (!activeTextInput || !activeTextInput.text.trim()) {
      setActiveTextInput(null);
      return;
    }
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    const pageIdx = currentPage.originalIndex;

    const newText: TextAnnotation = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: activeTextInput.x,
      y: activeTextInput.y,
      text: activeTextInput.text,
      color: currentColor,
      fontSize,
      isBold: isTextBold,
    };

    const next = {
      ...pageAnnotations,
      [pageIdx]: [...(pageAnnotations[pageIdx] || []), newText],
    };
    setPageAnnotations(next);
    pushHistory(next);
    setActiveTextInput(null);
    redrawAnnotations();
  };

  // Append Stamp
  const handleAddStamp = (stamp: { text: string; color: string }) => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    const pageIdx = currentPage.originalIndex;

    const newStamp: StampAnnotation = {
      id: `stamp-${Date.now()}`,
      type: 'stamp',
      text: stamp.text,
      color: stamp.color,
      x: 60,
      y: 60,
      width: 140,
      height: 48,
    };

    const next = {
      ...pageAnnotations,
      [pageIdx]: [...(pageAnnotations[pageIdx] || []), newStamp],
    };
    setPageAnnotations(next);
    pushHistory(next);
    setShowStampModal(false);
    redrawAnnotations();
    toast.success(`Added "${stamp.text}" stamp.`);
  };

  // Append Signature
  const handleApplySignature = (dataUrl: string) => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    const pageIdx = currentPage.originalIndex;

    const newSig: SignatureAnnotation = {
      id: `sig-${Date.now()}`,
      type: 'signature',
      dataUrl,
      x: 80,
      y: currentPage.height - 180,
      width: 180,
      height: 60,
    };

    const next = {
      ...pageAnnotations,
      [pageIdx]: [...(pageAnnotations[pageIdx] || []), newSig],
    };
    setPageAnnotations(next);
    pushHistory(next);
    setShowSignatureModal(false);
    redrawAnnotations();
    toast.success('Signature placed on current page.');
  };

  // Signature Pad Drawing events
  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsSignatureDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const moveSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSignatureDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopSigDraw = () => {
    setIsSignatureDrawing(false);
  };

  const clearSigCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = () => {
    if (signatureMode === 'draw') {
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      handleApplySignature(canvas.toDataURL('image/png'));
    } else if (signatureMode === 'type') {
      if (!typedSignature.trim()) {
        toast.error('Please enter a name to generate signature.');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = 'italic bold 42px "Brush Script MT", "Caveat", cursive, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSignature, 200, 60);
        handleApplySignature(canvas.toDataURL('image/png'));
      }
    }
  };

  // Export modified PDF using pdf-lib
  const handleExportPdf = async () => {
    if (!file || pages.length === 0) return;
    setIsExporting(true);

    try {
      const srcDoc = await PDFDocument.load(file.bytes);
      const outDoc = await PDFDocument.create();

      // Copy and transform selected pages in their configured order and rotation
      for (const pageMeta of pages) {
        const [copiedPage] = await outDoc.copyPages(srcDoc, [pageMeta.originalIndex]);

        // Apply page rotation
        if (pageMeta.rotation !== 0) {
          copiedPage.setRotation(degrees(pageMeta.rotation));
        }

        const annotations = pageAnnotations[pageMeta.originalIndex] || [];

        // If page has annotations, render them to an overlay image and embed
        if (annotations.length > 0) {
          const overlayCanvas = document.createElement('canvas');
          overlayCanvas.width = Math.floor(pageMeta.width * 2);
          overlayCanvas.height = Math.floor(pageMeta.height * 2);
          const oCtx = overlayCanvas.getContext('2d');

          if (oCtx) {
            oCtx.scale(2, 2);

            for (const ann of annotations) {
              if (ann.type === 'stroke') {
                if (ann.points.length < 2) continue;
                oCtx.save();
                oCtx.beginPath();
                oCtx.strokeStyle = ann.color;
                oCtx.lineWidth = ann.size;
                oCtx.lineCap = 'round';
                oCtx.lineJoin = 'round';
                oCtx.globalAlpha = ann.opacity || 1.0;

                oCtx.moveTo(ann.points[0].x, ann.points[0].y);
                for (let i = 1; i < ann.points.length; i++) {
                  oCtx.lineTo(ann.points[i].x, ann.points[i].y);
                }
                oCtx.stroke();
                oCtx.restore();
              } else if (ann.type === 'text') {
                oCtx.save();
                oCtx.font = `${ann.isBold ? 'bold ' : ''}${ann.fontSize}px sans-serif`;
                oCtx.fillStyle = ann.color;
                oCtx.fillText(ann.text, ann.x, ann.y);
                oCtx.restore();
              } else if (ann.type === 'shape') {
                oCtx.save();
                oCtx.strokeStyle = ann.color;
                oCtx.lineWidth = ann.strokeWidth;
                oCtx.fillStyle = ann.color;

                if (ann.shape === 'rectangle') {
                  oCtx.strokeRect(ann.x, ann.y, ann.width, ann.height);
                } else if (ann.shape === 'circle') {
                  oCtx.beginPath();
                  oCtx.ellipse(
                    ann.x + ann.width / 2,
                    ann.y + ann.height / 2,
                    Math.abs(ann.width / 2),
                    Math.abs(ann.height / 2),
                    0,
                    0,
                    2 * Math.PI
                  );
                  oCtx.stroke();
                } else if (ann.shape === 'arrow') {
                  oCtx.beginPath();
                  oCtx.moveTo(ann.x, ann.y);
                  oCtx.lineTo(ann.x + ann.width, ann.y + ann.height);
                  oCtx.stroke();
                }
                oCtx.restore();
              } else if (ann.type === 'stamp') {
                oCtx.save();
                oCtx.strokeStyle = ann.color;
                oCtx.lineWidth = 3;
                oCtx.strokeRect(ann.x, ann.y, ann.width, ann.height);
                oCtx.fillStyle = ann.color;
                oCtx.globalAlpha = 0.08;
                oCtx.fillRect(ann.x, ann.y, ann.width, ann.height);
                oCtx.globalAlpha = 1;
                oCtx.font = `bold 14px sans-serif`;
                oCtx.textAlign = 'center';
                oCtx.textBaseline = 'middle';
                oCtx.fillText(ann.text, ann.x + ann.width / 2, ann.y + ann.height / 2);
                oCtx.restore();
              } else if (ann.type === 'signature') {
                const img = new Image();
                img.src = ann.dataUrl;
                await new Promise(resolve => {
                  if (img.complete) resolve(true);
                  else img.onload = () => resolve(true);
                });
                oCtx.drawImage(img, ann.x, ann.y, ann.width, ann.height);
              }
            }

            const overlayPngData = overlayCanvas.toDataURL('image/png');
            const embeddedPng = await outDoc.embedPng(overlayPngData);
            copiedPage.drawImage(embeddedPng, {
              x: 0,
              y: 0,
              width: pageMeta.width,
              height: pageMeta.height,
            });
          }
        }

        outDoc.addPage(copiedPage);
      }

      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Edited_${file.name.replace(/\.pdf$/i, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Successfully exported PDF (${(outBytes.length / (1024 * 1024)).toFixed(2)} MB)!`);
    } catch (err: any) {
      console.error('Export Error:', err);
      toast.error('Failed to export PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={workspaceContainerRef}
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-[999999] rounded-none' : 'w-full min-h-[780px]'
      }`}
    >
      {/* Top Application Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white font-display">PDF Editor Suite</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Client-Side App
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {file ? `${file.name} · ${pages.length} Pages` : 'Visual Editor, Annotation & Signing Suite'}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {!file && (
            <button
              onClick={handleLoadDemoPdf}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample PDF</span>
            </button>
          )}

          <label className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>{file ? 'Change PDF' : 'Open PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          {file && (
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download PDF</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Focus Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {file ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Secondary Toolbar: Annotation tools & Viewport controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
            {/* Mode selection buttons */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTool('select')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'select' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Pan / Select Mode"
              >
                <MousePointer className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('pen')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'pen' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Freehand Pen"
              >
                <PenTool className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('highlighter')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'highlighter' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Highlighter"
              >
                <Highlighter className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('text')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'text' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Text Box"
              >
                <Type className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('rectangle')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'rectangle' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Rectangle Box"
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('circle')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'circle' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('arrow')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'arrow' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Arrow"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stamps & Signature Triggers */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowStampModal(true)}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5"
              >
                <StampIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Stamps</span>
              </button>

              <button
                onClick={() => setShowSignatureModal(true)}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>Digital Sign</span>
              </button>
            </div>

            {/* Color Palette & Brush Sizing */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrentColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full border transition ${
                      currentColor === c ? 'ring-2 ring-indigo-400 scale-110' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Stroke Size slider */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[10px]">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-16 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition"
                  title="Undo"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition"
                  title="Redo"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.2))}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.2))}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Editing Viewport & Sidebar */}
          <div className="flex flex-1 min-h-[620px] relative overflow-hidden">
            {/* Collapsible Left Thumbnail Sidebar */}
            <div
              className={`bg-slate-950/90 border-r border-slate-800 flex flex-col transition-all duration-200 ${
                sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'
              }`}
            >
              <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Pages ({pages.length})</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRotatePage('ccw')}
                    className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
                    title="Rotate CCW"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRotatePage('cw')}
                    className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
                    title="Rotate CW"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeletePage}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded transition"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
                {pages.map((p, idx) => (
                  <div
                    key={`page-thumb-${idx}`}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`group relative p-2 rounded-xl cursor-pointer transition border text-center ${
                      currentPageIndex === idx
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[1/1.4] bg-white rounded-md overflow-hidden flex items-center justify-center shadow-inner">
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-contain"
                          style={{ transform: `rotate(${p.rotation}deg)` }}
                        />
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">Page {idx + 1}</span>
                      )}
                    </div>
                    <span className="block mt-1 text-[11px] font-semibold text-slate-300">Page {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas Work Area */}
            <div className="flex-1 bg-slate-950 relative overflow-auto flex flex-col items-center p-6">
              {/* Floating Page Navigator Header */}
              <div className="sticky top-2 z-20 mb-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-lg text-xs text-slate-300">
                <button
                  onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-1 hover:text-white disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium px-2">
                  Page <strong className="text-white">{currentPageIndex + 1}</strong> of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                  className="p-1 hover:text-white disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Layered PDF & Annotation Canvas */}
              <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white select-none">
                {/* PDF Page Rendering Canvas */}
                <canvas ref={mainPdfCanvasRef} className="block pointer-events-none" />

                {/* Interactive Annotation Canvas Overlay */}
                <canvas
                  ref={drawingCanvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  className={`absolute inset-0 z-10 ${
                    activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
                  }`}
                />

                {/* Inline Text Box Input Overlay */}
                {activeTextInput && (
                  <div
                    style={{
                      left: activeTextInput.x * zoomScale,
                      top: activeTextInput.y * zoomScale,
                    }}
                    className="absolute z-20 flex flex-col gap-1 bg-slate-900 p-2 rounded-lg border border-indigo-500 shadow-2xl"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Type text here..."
                      value={activeTextInput.text}
                      onChange={e => setActiveTextInput(prev => (prev ? { ...prev, text: e.target.value } : null))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCommitText();
                        if (e.key === 'Escape') setActiveTextInput(null);
                      }}
                      className="px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                      <span className="text-slate-400">Press Enter to place</span>
                      <button
                        onClick={handleCommitText}
                        className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Welcome Dropzone */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
          <div className="max-w-md w-full p-8 bg-slate-900/80 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-display">Open or Drop a PDF Document</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add text, annotations, freehand sketches, digital signatures, and official stamps directly in your
                browser with 100% privacy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              <label className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition">
                <FolderOpen className="w-4 h-4" />
                <span>Choose PDF File</span>
                <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleLoadDemoPdf}
                disabled={isLoading}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Try Sample Agreement</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Server Uploads</span>
              </span>
              <span>·</span>
              <span>Unlimited Pages</span>
              <span>·</span>
              <span>No Watermarks</span>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Create Digital Signature</span>
              </h4>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSignatureMode('draw')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                  signatureMode === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Draw
              </button>
              <button
                onClick={() => setSignatureMode('type')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                  signatureMode === 'type' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Type
              </button>
            </div>

            {/* Draw Pad */}
            {signatureMode === 'draw' ? (
              <div className="space-y-2">
                <div className="border border-slate-700 bg-white rounded-xl overflow-hidden">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startSigDraw}
                    onMouseMove={moveSigDraw}
                    onMouseUp={stopSigDraw}
                    onMouseLeave={stopSigDraw}
                    className="w-full h-40 cursor-crosshair block"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={clearSigCanvas}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear Pad</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Type Signature */
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Type your full name..."
                  value={typedSignature}
                  onChange={e => setTypedSignature(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="p-4 bg-white rounded-xl text-center min-h-[90px] flex items-center justify-center">
                  <span className="font-['Brush_Script_MT',cursive] text-3xl text-slate-900 italic font-bold">
                    {typedSignature || 'Signature Preview'}
                  </span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSignature}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md"
              >
                Insert Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stamp Modal */}
      {showStampModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <StampIcon className="w-4 h-4 text-rose-400" />
                <span>Choose Verification Stamp</span>
              </h4>
              <button onClick={() => setShowStampModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_STAMPS.map(stamp => (
                <button
                  key={stamp.text}
                  onClick={() => handleAddStamp(stamp)}
                  style={{ borderColor: stamp.color, color: stamp.color }}
                  className="p-3 bg-slate-950 rounded-xl border-2 text-center font-bold text-xs tracking-wider hover:scale-[1.03] active:scale-[0.98] transition shadow-md"
                >
                  {stamp.text}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowStampModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfEditorAppTool;
