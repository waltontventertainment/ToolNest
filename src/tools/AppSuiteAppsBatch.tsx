import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  Image as ImageIcon,
  PenTool,
  Grid,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Upload,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  Play,
  Sparkles,
  Sliders,
  Type,
  Square,
  Circle,
  ArrowRight,
  Move,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Eye,
  Eraser,
  Layers,
  HelpCircle,
  Award,
  Timer,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 1. SPREADSHEET STUDIO APP
// ============================================================================

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROW_COUNT = 30;

export const SpreadsheetApp: React.FC = () => {
  const [data, setData] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tz_app_spreadsheet');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      'A1': 'Item', 'B1': 'Quantity', 'C1': 'Price ($)', 'D1': 'Total ($)',
      'A2': 'App Hosting', 'B2': '1', 'C2': '0', 'D2': '=B2*C2',
      'A3': 'Domain (.cyou)', 'B3': '1', 'C3': '4.50', 'D3': '=B3*C3',
      'A4': 'SSL Certificate', 'B4': '1', 'C4': '0', 'D4': '=B4*C4',
      'A5': 'CDN Bandwidth', 'B5': '100', 'C5': '0', 'D5': '=B5*C5',
      'A6': 'Subtotal', 'B6': '', 'C6': '', 'D6': '=SUM(D2:D5)',
    };
  });

  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaInput, setFormulaInput] = useState<string>('Item');

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tz_app_spreadsheet', JSON.stringify(data));
    } catch {}
  }, [data]);

  const evaluateFormula = useCallback((cellId: string, visited = new Set<string>()): string => {
    const raw = data[cellId] || '';
    if (!raw.startsWith('=')) return raw;
    if (visited.has(cellId)) return '#CIRCULAR!';
    visited.add(cellId);

    const expr = raw.substring(1).trim().toUpperCase();

    // SUM function
    const sumMatch = expr.match(/^SUM\(([A-J]\d+):([A-J]\d+)\)$/);
    if (sumMatch) {
      const startCol = sumMatch[1].charCodeAt(0);
      const startRow = parseInt(sumMatch[1].substring(1), 10);
      const endCol = sumMatch[2].charCodeAt(0);
      const endRow = parseInt(sumMatch[2].substring(1), 10);

      let sum = 0;
      for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
          const id = `${String.fromCharCode(c)}${r}`;
          const val = parseFloat(evaluateFormula(id, new Set(visited))) || 0;
          sum += val;
        }
      }
      return sum.toFixed(2).replace(/\.00$/, '');
    }

    // Basic arithmetic (+, -, *, /)
    try {
      const sanitized = expr.replace(/[A-J]\d+/g, (match) => {
        const val = parseFloat(evaluateFormula(match, new Set(visited))) || 0;
        return val.toString();
      });
      // Safe numeric evaluation
      if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${sanitized})`)();
        return typeof result === 'number' && !isNaN(result)
          ? result.toFixed(2).replace(/\.00$/, '')
          : '#ERROR';
      }
    } catch {
      return '#ERROR';
    }
    return raw;
  }, [data]);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    setFormulaInput(data[cellId] || '');
  };

  const handleValueChange = (val: string) => {
    setFormulaInput(val);
    setData(prev => ({ ...prev, [selectedCell]: val }));
  };

  const handleClearAll = () => {
    setData({});
    setFormulaInput('');
    toast.info('Spreadsheet cleared.');
  };

  const handleExportCSV = () => {
    let csv = '';
    for (let r = 1; r <= ROW_COUNT; r++) {
      const rowVals = COLS.map(c => {
        const val = evaluateFormula(`${c}${r}`);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csv += rowVals.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sheet_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded CSV spreadsheet!');
  };

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Top Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Cell Position Indicator & Formula Input */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="px-2.5 py-1 rounded-lg bg-secondary font-mono text-xs font-bold text-primary min-w-[42px] text-center">
            {selectedCell}
          </span>
          <div className="relative flex-1">
            <input
              type="text"
              value={formulaInput}
              onChange={e => handleValueChange(e.target.value)}
              placeholder="Enter value or formula (e.g., =SUM(D2:D5), =B2*C2)..."
              className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-destructive text-xs transition-colors"
            title="Clear Sheet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-x-auto shadow-2xs max-h-[560px]">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/60 sticky top-0 z-10 border-b border-border/80">
              <th className="w-12 p-2 border-r border-border text-center text-muted-foreground font-mono font-semibold">
                #
              </th>
              {COLS.map(col => (
                <th
                  key={col}
                  className="min-w-[110px] p-2 border-r border-border text-center font-mono font-bold text-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROW_COUNT }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <tr key={rowNum} className="hover:bg-muted/30 border-b border-border/40">
                  <td className="p-1.5 border-r border-border bg-secondary/30 text-center font-mono text-muted-foreground font-medium text-[11px]">
                    {rowNum}
                  </td>
                  {COLS.map(col => {
                    const cellId = `${col}${rowNum}`;
                    const isSelected = selectedCell === cellId;
                    const displayVal = evaluateFormula(cellId);
                    const isHeaderRow = rowNum === 1;

                    return (
                      <td
                        key={cellId}
                        onClick={() => handleCellClick(cellId)}
                        className={`p-1.5 border-r border-border font-mono text-xs cursor-cell transition-colors truncate max-w-[140px] ${
                          isSelected
                            ? 'bg-primary/10 ring-2 ring-primary ring-inset font-bold text-foreground'
                            : isHeaderRow
                            ? 'font-bold bg-secondary/10 text-foreground'
                            : 'text-foreground/90'
                        }`}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// ============================================================================
// 2. PHOTO STUDIO APP
// ============================================================================

export const PhotoStudioApp: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load default demo photo
  useEffect(() => {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 800;
    demoCanvas.height = 500;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(0.5, '#06b6d4');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 36px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Toolzaro Photo Studio 📸', 400, 230);
      ctx.font = '18px -apple-system, sans-serif';
      ctx.fillText('Upload your own photo or tweak adjustments below!', 400, 280);
      setImageSrc(demoCanvas.toDataURL('image/jpeg', 0.9));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      handleReset();
      toast.success('Image loaded into Photo Studio!');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isSideways = rotation % 180 !== 0;
      canvas.width = isSideways ? img.height : img.width;
      canvas.height = isSideways ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.92);
      a.download = `Photo_${Date.now()}.jpg`;
      a.click();
      toast.success('Exported edited photo!');
    };
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`,
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold flex items-center gap-1.5 text-foreground transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors"
            title="Rotate 90° CW"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFlipH(f => !f)}
            className={`p-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-medium transition-colors ${
              flipH ? 'bg-primary/10 text-primary border-primary/40' : 'text-foreground'
            }`}
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFlipV(f => !f)}
            className={`p-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-medium transition-colors ${
              flipV ? 'bg-primary/10 text-primary border-primary/40' : 'text-foreground'
            }`}
            title="Flip Vertical"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Image</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
        {/* Visual Preview Frame */}
        <div className="lg:col-span-3 bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-center min-h-[420px] max-h-[560px] overflow-hidden shadow-2xs relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Photo Canvas"
              className="max-h-[500px] max-w-full object-contain rounded-lg transition-all duration-100 shadow-md"
              style={filterStyle}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Upload an image to start editing</p>
          )}
        </div>

        {/* Adjustments Sidebar */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-xs font-bold text-foreground">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Visual Adjustments</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Brightness</span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Contrast</span>
                <span className="font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={e => setContrast(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Saturation</span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={e => setSaturation(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Blur</span>
                <span className="font-mono">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={blur}
                onChange={e => setBlur(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Grayscale</span>
                <span className="font-mono">{grayscale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={e => setGrayscale(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Sepia Vintage</span>
                <span className="font-mono">{sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sepia}
                onChange={e => setSepia(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Invert Negative</span>
                <span className="font-mono">{invert}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={invert}
                onChange={e => setInvert(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 3. WHITEBOARD STUDIO APP
// ============================================================================

export const WhiteboardApp: React.FC = () => {
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rect' | 'circle'>('pen');
  const [color, setColor] = useState<string>('#4f46e5');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [gridEnabled, setGridEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPointRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentX, currentY);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = { x: currentX, y: currentY };
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast.info('Whiteboard cleared');
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `Whiteboard_${Date.now()}.png`;
    a.click();
    toast.success('Downloaded Whiteboard artwork!');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Action Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Tool Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              tool === 'pen' ? 'bg-primary text-primary-foreground shadow-2xs' : 'hover:bg-secondary text-foreground'
            }`}
            title="Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              tool === 'eraser' ? 'bg-primary text-primary-foreground shadow-2xs' : 'hover:bg-secondary text-foreground'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          {/* Color Presets */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/60">
            {['#4f46e5', '#dc2626', '#16a34a', '#0284c7', '#000000'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border border-white/40 transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-destructive text-xs transition-colors"
            title="Clear Board"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>

      {/* Drawing Canvas Frame */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-border/80 shadow-2xs bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-[520px] cursor-crosshair block"
        />
      </div>
    </div>
  );
};


// ============================================================================
// 4. VECTOR STUDIO APP (SVG)
// ============================================================================

export const VectorStudioApp: React.FC = () => {
  const [elements, setElements] = useState<Array<{
    id: string;
    type: 'rect' | 'circle' | 'line';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  }>>([
    { id: '1', type: 'rect', x: 80, y: 80, width: 140, height: 100, fill: '#4f46e5', stroke: '#312e81', strokeWidth: 2 },
    { id: '2', type: 'circle', x: 280, y: 130, width: 60, height: 60, fill: '#ec4899', stroke: '#be185d', strokeWidth: 2 },
  ]);

  const [activeShape, setActiveShape] = useState<'rect' | 'circle'>('rect');
  const [fillColor, setFillColor] = useState<string>('#06b6d4');

  const addShape = () => {
    const newEl = {
      id: Date.now().toString(),
      type: activeShape,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      width: activeShape === 'circle' ? 50 : 120,
      height: activeShape === 'circle' ? 50 : 80,
      fill: fillColor,
      stroke: '#0f172a',
      strokeWidth: 2,
    };
    setElements(prev => [...prev, newEl]);
    toast.success(`Added ${activeShape} vector element`);
  };

  const handleDownloadSvg = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#ffffff"/>
      ${elements.map(el => {
        if (el.type === 'rect') {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" rx="8"/>`;
        }
        if (el.type === 'circle') {
          return `<circle cx="${el.x}" cy="${el.y}" r="${el.width}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
        }
        return '';
      }).join('\n')}
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vector_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded clean SVG asset!');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveShape('rect')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeShape === 'rect' ? 'bg-primary text-primary-foreground shadow-2xs' : 'hover:bg-secondary text-foreground'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Rectangle</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveShape('circle')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeShape === 'circle' ? 'bg-primary text-primary-foreground shadow-2xs' : 'hover:bg-secondary text-foreground'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Circle</span>
          </button>

          <input
            type="color"
            value={fillColor}
            onChange={e => setFillColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border border-border"
            title="Fill Color"
          />

          <button
            type="button"
            onClick={addShape}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold text-foreground transition-colors"
          >
            + Place Shape
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setElements([])}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-destructive text-xs transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .SVG</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full h-[500px] bg-white rounded-2xl border border-border/80 shadow-2xs overflow-hidden relative">
        <svg className="w-full h-full" viewBox="0 0 800 500">
          <rect width="100%" height="100%" fill="#ffffff" />
          {elements.map(el => {
            if (el.type === 'rect') {
              return (
                <rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill={el.fill}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  rx={8}
                  className="cursor-move hover:opacity-90 transition-opacity"
                />
              );
            }
            if (el.type === 'circle') {
              return (
                <circle
                  key={el.id}
                  cx={el.x}
                  cy={el.y}
                  r={el.width}
                  fill={el.fill}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  className="cursor-move hover:opacity-90 transition-opacity"
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};


// ============================================================================
// 5. CHESS MASTER APP
// ============================================================================

type Piece = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | null;

const INITIAL_BOARD: Piece[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_GLYPHS: Record<string, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
};

export const ChessApp: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);

  const handleSquareClick = (r: number, c: number) => {
    if (selectedSquare) {
      const [fromR, fromC] = selectedSquare;
      if (fromR === r && fromC === c) {
        setSelectedSquare(null);
        return;
      }

      // Move piece
      const nextBoard = board.map(row => [...row]);
      const piece = nextBoard[fromR][fromC];
      nextBoard[fromR][fromC] = null;
      nextBoard[r][c] = piece;

      setBoard(nextBoard);
      setSelectedSquare(null);
      setTurn(turn === 'white' ? 'black' : 'white');
      setMoveCount(m => m + 1);
    } else {
      const piece = board[r][c];
      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) {
          setSelectedSquare([r, c]);
        }
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn('white');
    setSelectedSquare(null);
    setMoveCount(0);
    toast.info('New Chess game started!');
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Game Bar */}
      <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={`w-3 h-3 rounded-full ${turn === 'white' ? 'bg-amber-400' : 'bg-slate-900 border border-border'}`} />
            <span>Turn: {turn === 'white' ? 'White' : 'Black'}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Moves: {moveCount}</span>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="px-3 py-1 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold text-foreground transition-colors"
        >
          Reset Game
        </button>
      </div>

      {/* Chessboard */}
      <div className="p-3 bg-amber-950/80 rounded-3xl shadow-xl border-4 border-amber-900">
        <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden border border-amber-900/60">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleSquareClick(r, c)}
                  className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500'
                      : isDark
                      ? 'bg-amber-800 text-amber-100 hover:bg-amber-700'
                      : 'bg-amber-100 text-amber-950 hover:bg-amber-50'
                  }`}
                >
                  {cell ? PIECE_GLYPHS[cell] : ''}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 6. SUDOKU STUDIO APP
// ============================================================================

const SAMPLE_SUDOKU = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export const SudokuApp: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(SAMPLE_SUDOKU);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);

  const handleInputDigit = (digit: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const next = grid.map(row => [...row]);
    next[r][c] = digit;
    setGrid(next);
  };

  const handleReset = () => {
    setGrid(SAMPLE_SUDOKU);
    setSelectedCell([0, 2]);
    toast.info('Sudoku board reset');
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Top Header */}
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Sudoku Master</span>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold text-foreground transition-colors"
        >
          Reset Puzzle
        </button>
      </div>

      {/* 9x9 Board */}
      <div className="p-3 bg-card border-2 border-border/80 rounded-3xl shadow-lg">
        <div className="grid grid-cols-9 gap-0 border-2 border-foreground/80 rounded-xl overflow-hidden">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isBorderRight = (c + 1) % 3 === 0 && c !== 8;
              const isBorderBottom = (r + 1) % 3 === 0 && r !== 8;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => setSelectedCell([r, c])}
                  className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center font-mono font-bold text-base border-border border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-black'
                      : 'hover:bg-secondary/70 text-foreground'
                  } ${isBorderRight ? 'border-r-2 border-r-foreground/80' : ''} ${
                    isBorderBottom ? 'border-b-2 border-b-foreground/80' : ''
                  }`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Pad for Mobile & Fast Desktop Input */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => handleInputDigit(n)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground font-mono font-bold text-sm transition-colors cursor-pointer shadow-2xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleInputDigit(0)}
          className="px-3 h-9 sm:h-10 rounded-xl border border-border bg-card hover:bg-destructive hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
