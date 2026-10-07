import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ImageIcon, Download, Upload, RefreshCw, Copy, Check, Sliders, Crop, Palette,
  Eye, EyeOff, Sparkles, Stamp, ShieldCheck, CheckCircle2, XCircle, FileCode,
  Layers, Lock, Eraser, Sun, Moon, ZoomIn, ZoomOut, RotateCw, FlipHorizontal,
  FlipVertical, Wand2, Info, Plus, Trash2, Maximize2, Pipette
} from 'lucide-react';

const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// ============================================================================
// 1. Image Resizer & Format Converter
// ============================================================================
export const ImageResizerConverter: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [origSize, setOrigSize] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('image');

  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.9);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [resizedSizeBytes, setResizedSizeBytes] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    setOrigSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.width);
        setOrigHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
        setImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (lockAspect && aspectRatio) {
      setHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (lockAspect && aspectRatio) {
      setWidth(Math.round(newH * aspectRatio));
    }
  };

  useEffect(() => {
    if (!imageSrc || !width || !height) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle transparent background for JPEG
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      setResizedDataUrl(dataUrl);

      // Estimate byte size from data URL
      const head = `data:${outputFormat};base64,`;
      const base64Str = dataUrl.substring(head.length);
      const decodedLen = Math.round((base64Str.length * 3) / 4);
      setResizedSizeBytes(decodedLen);
    };
    img.src = imageSrc;
  }, [imageSrc, width, height, outputFormat, quality]);

  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="resizer-file-input"
          />
          <label htmlFor="resizer-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Click to upload or drag & drop image</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WebP, GIF, SVG</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" /> Resizer Controls
              </h3>
              <label
                htmlFor="resizer-file-input"
                className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold"
              >
                Change Image
              </label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="resizer-file-input" />
            </div>

            {/* Original Info */}
            <div className="bg-secondary/40 p-3 rounded-xl text-xs space-y-1 font-mono text-muted-foreground">
              <div>Original: {origWidth} x {origHeight} px</div>
              <div>File Size: {(origSize / 1024).toFixed(1)} KB</div>
            </div>

            {/* Dimensions Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">Target Dimensions (px)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-1">Width</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-1">Height</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Lock Aspect Ratio ({aspectRatio ? aspectRatio.toFixed(2) : '1.00'})
              </label>
            </div>

            {/* Target Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Convert Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'JPEG', value: 'image/jpeg' },
                  { label: 'PNG', value: 'image/png' },
                  { label: 'WebP', value: 'image/webp' },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setOutputFormat(fmt.value as any)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      outputFormat === fmt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPG & WebP) */}
            {outputFormat !== 'image/png' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Quality ({Math.round(quality * 100)}%)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            )}

            {/* Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-muted-foreground block">Quick Presets</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { label: '50%', scale: 0.5 },
                  { label: '25%', scale: 0.25 },
                  { label: '75%', scale: 0.75 },
                  { label: 'HD 1080p', w: 1920, h: 1080 },
                  { label: 'Social 1080x1080', w: 1080, h: 1080 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (p.scale) {
                        handleWidthChange(Math.round(origWidth * p.scale));
                      } else if (p.w && p.h) {
                        setWidth(p.w);
                        setHeight(p.h);
                      }
                    }}
                    className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Button */}
            {resizedDataUrl && (
              <a
                href={resizedDataUrl}
                download={`${fileName}_resized_${width}x${height}.${extMap[outputFormat]}`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Resized Image ({ (resizedSizeBytes / 1024).toFixed(1) } KB)
              </a>
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] border border-slate-800 relative overflow-hidden">
            <div className="absolute top-4 left-4 text-xs font-semibold text-muted-foreground bg-slate-800/80 px-3 py-1 rounded-full backdrop-blur-xs">
              Preview: {width} x {height} px ({extMap[outputFormat].toUpperCase()})
            </div>
            {resizedDataUrl ? (
              <img
                src={resizedDataUrl}
                alt="Resized preview"
                className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700"
              />
            ) : (
              <div className="text-muted-foreground text-xs">Processing preview...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. Image Cropper & Aspect Ratio Tool
// ============================================================================
export const ImageCropperRatio: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('cropped_image');
  const [cropAspect, setCropAspect] = useState<number | null>(1); // null = freeform
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setCroppedUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const applyCropAndTransform = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      // Adjust target dimensions if cropped aspect ratio selected
      if (cropAspect) {
        if (w / h > cropAspect) {
          w = h * cropAspect;
        } else {
          h = w / cropAspect;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw image centered
      const sx = (img.width - w) / 2;
      const sy = (img.height - h) / 2;

      ctx.drawImage(
        img,
        sx, sy, w, h,
        -w / 2, -h / 2, w, h
      );
      ctx.restore();

      setCroppedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    applyCropAndTransform();
  }, [imageSrc, cropAspect, rotation, flipH, flipV]);

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="cropper-file-input"
          />
          <label htmlFor="cropper-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Crop className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Upload Image to Crop & Transform</p>
              <p className="text-xs text-muted-foreground mt-1">Preset aspect ratios: 1:1, 16:9, 4:5, 9:16, 3:2</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Crop className="w-4 h-4 text-indigo-600" /> Crop & Aspect Ratio
              </h3>
              <label
                htmlFor="cropper-file-input"
                className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold"
              >
                Change
              </label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="cropper-file-input" />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Aspect Ratio Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Square (1:1)', val: 1 },
                  { label: 'Widescreen (16:9)', val: 16 / 9 },
                  { label: 'Story/Reel (9:16)', val: 9 / 16 },
                  { label: 'Insta Post (4:5)', val: 4 / 5 },
                  { label: 'Photo (3:2)', val: 3 / 2 },
                  { label: 'Original', val: null },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCropAspect(p.val)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition ${
                      cropAspect === p.val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation & Flips */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-foreground block">Transform & Rotate</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-2 text-xs font-semibold bg-secondary/60 hover:bg-secondary text-foreground rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
                <button
                  onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}
                  className="py-2 text-xs font-semibold bg-secondary/60 hover:bg-secondary text-foreground rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    flipH ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-secondary/60 text-foreground'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" /> Flip Horiz
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    flipV ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-secondary/60 text-foreground'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" /> Flip Vert
                </button>
              </div>
            </div>

            {/* Download */}
            {croppedUrl && (
              <a
                href={croppedUrl}
                download={`${fileName}_cropped.png`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Cropped PNG
              </a>
            )}
          </div>

          {/* Live Preview Canvas */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex items-center justify-center min-h-[400px] border border-slate-800">
            {croppedUrl ? (
              <img
                src={croppedUrl}
                alt="Cropped preview"
                className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700"
              />
            ) : (
              <div className="text-muted-foreground text-xs">Generating crop...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. Image Color Palette & Dominant Color Extractor
// ============================================================================
export const ImagePaletteExtractor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<{ hex: string; percentage: number; rgb: string }[]>([]);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 150;
      canvas.height = 150;
      ctx.drawImage(img, 0, 0, 150, 150);

      const imageData = ctx.getImageData(0, 0, 150, 150).data;
      const colorCounts: Record<string, number> = {};

      // Sample pixels with stride to extract dominant colors
      for (let i = 0; i < imageData.length; i += 16) {
        const r = Math.round(imageData[i] / 20) * 20;
        const g = Math.round(imageData[i + 1] / 20) * 20;
        const b = Math.round(imageData[i + 2] / 20) * 20;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      const totalSamples = sorted.reduce((sum, item) => sum + item[1], 0);

      const extracted = sorted.map(([hex, count]) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return {
          hex,
          percentage: Math.round((count / totalSamples) * 100),
          rgb: `rgb(${r}, ${g}, ${b})`,
        };
      });

      setColors(extracted);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    setPickedColor(hex);
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="palette-file-input"
          />
          <label htmlFor="palette-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Palette className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Extract Color Palette from Image</p>
              <p className="text-xs text-muted-foreground mt-1">Detect dominant hex codes & click image to pick exact pixel colors</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image & Click Eyedropper */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Pipette className="w-3.5 h-3.5 text-indigo-400" /> Click anywhere on image to pick exact pixel color
            </span>
            <img
              src={imageSrc}
              alt="Uploaded source"
              onClick={handleImageClick}
              className="max-h-[450px] max-w-full object-contain rounded-xl shadow-2xl cursor-crosshair border border-slate-700"
            />
            {pickedColor && (
              <div className="bg-slate-800 text-white text-xs px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: pickedColor }} />
                <span>Picked Color: <strong className="font-mono text-indigo-300">{pickedColor}</strong></span>
                <button
                  onClick={() => copyToClipboard(pickedColor, () => setCopiedColor(pickedColor))}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] rounded font-semibold transition"
                >
                  {copiedColor === pickedColor ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Palette Swatches */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" /> Extracted Dominant Colors
              </h3>
              <label
                htmlFor="palette-file-input"
                className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold"
              >
                Change Image
              </label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="palette-file-input" />
            </div>

            {/* Colors list */}
            <div className="space-y-3">
              {colors.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => copyToClipboard(c.hex, () => setCopiedColor(c.hex))}
                  className="p-3 bg-secondary/40 hover:bg-secondary/60 rounded-xl border border-border flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-border shadow-xs" style={{ backgroundColor: c.hex }} />
                    <div>
                      <div className="text-xs font-bold font-mono text-foreground">{c.hex}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.rgb}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{c.percentage}%</span>
                    <button className="p-1.5 text-muted-foreground group-hover:text-indigo-600 rounded transition">
                      {copiedColor === c.hex ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Export Palette CSS */}
            <button
              onClick={() => {
                const css = colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
                copyToClipboard(`:root {\n${css}\n}`, () => setCopiedColor('css'));
              }}
              className="w-full py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> {copiedColor === 'css' ? 'CSS Variables Copied!' : 'Export CSS Variables'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. Image Filters, Adjustments & Photo Studio
// ============================================================================
export const ImageFiltersAdjuster: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('edited_photo');

  // Filters state
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);

  const [filteredUrl, setFilteredUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => setImageSrc(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const applyPresets = (type: string) => {
    // Reset defaults first
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setHueRotate(0);
    setInvert(0);

    if (type === 'vintage') {
      setSepia(60);
      setContrast(110);
      setBrightness(95);
      setSaturation(85);
    } else if (type === 'cyberpunk') {
      setHueRotate(180);
      setContrast(140);
      setSaturation(160);
    } else if (type === 'noir') {
      setGrayscale(100);
      setContrast(130);
      setBrightness(90);
    } else if (type === 'dramatic') {
      setContrast(150);
      setSaturation(120);
      setBrightness(105);
    } else if (type === 'warm') {
      setSepia(30);
      setBrightness(105);
      setSaturation(115);
    }
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) invert(${invert}%)`;
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      setFilteredUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = imageSrc;
  }, [imageSrc, brightness, contrast, saturation, blur, sepia, grayscale, hueRotate, invert]);

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="filter-file-input" />
          <label htmlFor="filter-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Wand2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Photo Filters & Effects Studio</p>
              <p className="text-xs text-muted-foreground mt-1">Adjust brightness, contrast, saturation, blur, sepia, and cinematic presets</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Controls */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" /> Photo Adjustments
              </h3>
              <label htmlFor="filter-file-input" className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold">Change</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="filter-file-input" />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground block">Cinematic Presets</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { label: 'Normal', key: 'normal' },
                  { label: 'Vintage', key: 'vintage' },
                  { label: 'Cyberpunk', key: 'cyberpunk' },
                  { label: 'Film Noir', key: 'noir' },
                  { label: 'Dramatic HDR', key: 'dramatic' },
                  { label: 'Warm Glow', key: 'warm' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => applyPresets(p.key)}
                    className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Brightness</span><span>{brightness}%</span></div>
                <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Contrast</span><span>{contrast}%</span></div>
                <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Saturation</span><span>{saturation}%</span></div>
                <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Blur</span><span>{blur}px</span></div>
                <input type="range" min="0" max="20" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Sepia</span><span>{sepia}%</span></div>
                <input type="range" min="0" max="100" value={sepia} onChange={(e) => setSepia(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Grayscale</span><span>{grayscale}%</span></div>
                <input type="range" min="0" max="100" value={grayscale} onChange={(e) => setGrayscale(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Hue Rotate</span><span>{hueRotate}°</span></div>
                <input type="range" min="0" max="360" value={hueRotate} onChange={(e) => setHueRotate(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            </div>

            {/* Download */}
            {filteredUrl && (
              <a
                href={filteredUrl}
                download={`${fileName}_edited.jpg`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Photo
              </a>
            )}
          </div>

          {/* Canvas Preview */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex items-center justify-center min-h-[400px] border border-slate-800">
            {filteredUrl ? (
              <img src={filteredUrl} alt="Filtered result" className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700" />
            ) : (
              <div className="text-muted-foreground text-xs">Rendering preview...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. Image Watermark & Stamp Adder
// ============================================================================
export const ImageWatermarkAdder: React.FC = () => {
  const [baseSrc, setBaseSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('watermarked');
  const [watermarkText, setWatermarkText] = useState<string>('© CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [opacity, setOpacity] = useState<number>(0.5);
  const [position, setPosition] = useState<string>('center'); // center, bottom-right, tiled
  const [rotation, setRotation] = useState<number>(-25);

  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => setBaseSrc(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!baseSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Watermark settings
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (position === 'center') {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
      } else if (position === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - 30, canvas.height - 30);
      } else if (position === 'tiled') {
        ctx.rotate((rotation * Math.PI) / 180);
        const stepX = 250;
        const stepY = 150;
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.fillText(watermarkText, x, y);
          }
        }
      }

      ctx.restore();
      setOutputUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = baseSrc;
  }, [baseSrc, watermarkText, fontSize, textColor, opacity, position, rotation]);

  return (
    <div className="space-y-6">
      {!baseSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="wm-file-input" />
          <label htmlFor="wm-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Stamp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Add Text Watermark & Copyright Stamp</p>
              <p className="text-xs text-muted-foreground mt-1">Protect photos with customizable text, opacity, rotation & tiled patterns</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Stamp className="w-4 h-4 text-indigo-600" /> Watermark Controls
              </h3>
              <label htmlFor="wm-file-input" className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold">Change</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="wm-file-input" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Position Layout</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {[
                  { label: 'Center', val: 'center' },
                  { label: 'Bottom Right', val: 'bottom-right' },
                  { label: 'Tiled Pattern', val: 'tiled' },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setPosition(p.val)}
                    className={`py-2 rounded-lg border transition ${
                      position === p.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-secondary/40 border-border text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Font Size</span><span>{fontSize}px</span></div>
                <input type="range" min="12" max="120" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Opacity</span><span>{Math.round(opacity * 100)}%</span></div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div>
                <div className="flex justify-between font-bold text-foreground"><span>Rotation</span><span>{rotation}°</span></div>
                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Text Color</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
              </div>
            </div>

            {outputUrl && (
              <a
                href={outputUrl}
                download={`${fileName}_stamped.jpg`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Watermarked Image
              </a>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex items-center justify-center min-h-[400px] border border-slate-800">
            {outputUrl ? (
              <img src={outputUrl} alt="Watermark preview" className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700" />
            ) : (
              <div className="text-muted-foreground text-xs">Generating watermark...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. Color Contrast & WCAG Accessibility Checker
// ============================================================================
export const ColorContrastWcagChecker: React.FC = () => {
  const [fgColor, setFgColor] = useState<string>('#0F172A'); // Slate 900
  const [bgColor, setBgColor] = useState<string>('#F8FAFC'); // Slate 50

  const getLuminance = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const ratio = useMemo(() => {
    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const brightest = Math.max(l1, l2);
      const darkest = Math.min(l1, l2);
      return Math.round(((brightest + 0.05) / (darkest + 0.05)) * 100) / 100;
    } catch {
      return 1;
    }
  }, [fgColor, bgColor]);

  const passesAaNormal = ratio >= 4.5;
  const passesAaLarge = ratio >= 3.0;
  const passesAaaNormal = ratio >= 7.0;
  const passesAaaLarge = ratio >= 4.5;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Color Pickers */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Eye className="w-4 h-4 text-indigo-600" /> Color Inputs
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Foreground (Text Color)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-border rounded-lg font-mono uppercase font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-border rounded-lg font-mono uppercase font-bold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => { const temp = fgColor; setFgColor(bgColor); setBgColor(temp); }}
            className="w-full py-2 bg-secondary/60 hover:bg-secondary text-foreground font-bold text-xs rounded-lg transition"
          >
            🔄 Swap Colors
          </button>
        </div>

        {/* Contrast Score */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-foreground text-sm pb-3 border-b border-slate-100">WCAG Contrast Score</h3>

          <div className="text-center py-2">
            <div className="text-5xl font-black text-foreground font-mono tracking-tight">{ratio} : 1</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {ratio >= 7 ? '🌟 Outstanding AAA Contrast' : ratio >= 4.5 ? '✅ Great AA Compliant Contrast' : '⚠️ Poor Accessibility Contrast'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${passesAaNormal ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <span className="font-bold">AA Normal Text</span>
              {passesAaNormal ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${passesAaLarge ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <span className="font-bold">AA Large Text</span>
              {passesAaLarge ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${passesAaaNormal ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <span className="font-bold">AAA Normal</span>
              {passesAaaNormal ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${passesAaaLarge ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <span className="font-bold">AAA Large</span>
              {passesAaaLarge ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            </div>
          </div>
        </div>

        {/* Live UI Mockup */}
        <div className="lg:col-span-1 border rounded-2xl p-6 space-y-4 shadow-xs transition" style={{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor + '30' }}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">Live UI Preview</div>
          <h4 className="text-xl font-bold">Accessible UI Component</h4>
          <p className="text-xs leading-relaxed">
            This paragraph demonstrates real-time readability testing for body text using your selected foreground and background colors.
          </p>
          <div className="pt-2">
            <button
              className="px-4 py-2 text-xs font-bold rounded-lg transition border"
              style={{ backgroundColor: fgColor, color: bgColor, borderColor: fgColor }}
            >
              Action Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. SVG to Data URI & PNG Converter
// ============================================================================
export const SvgToCssDataUriConverter: React.FC = () => {
  const [svgInput, setSvgInput] = useState<string>(
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#4F46E5"/>
  <path d="M35 50L45 60L65 40" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dataUri = useMemo(() => {
    const encoded = encodeURIComponent(svgInput.trim().replace(/>\s+</g, '><'))
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }, [svgInput]);

  const cssBgImage = `background-image: url("${dataUri}");`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-xs">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" /> SVG Code Input
          </h3>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            rows={10}
            className="w-full p-3 font-mono text-xs border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-secondary/40"
            placeholder="Paste your raw <svg>...</svg> code here..."
          />
        </div>

        {/* Live SVG Preview */}
        <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-muted-foreground">Live Rendered SVG</span>
          <div
            className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl"
            dangerouslySetInnerHTML={{ __html: svgInput }}
          />
        </div>
      </div>

      {/* Outputs */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-foreground text-sm">Converted Embed Codes</h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between font-bold text-foreground mb-1">
              <span>CSS Background-Image</span>
              <button
                onClick={() => copyToClipboard(cssBgImage, () => setCopiedKey('css'))}
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'css' ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
            <pre className="p-3 bg-secondary/40 border border-border rounded-xl font-mono text-[11px] overflow-x-auto text-foreground">
              {cssBgImage}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between font-bold text-foreground mb-1">
              <span>Raw Data URI</span>
              <button
                onClick={() => copyToClipboard(dataUri, () => setCopiedKey('datauri'))}
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'datauri' ? 'Copied!' : 'Copy Data URI'}
              </button>
            </div>
            <pre className="p-3 bg-secondary/40 border border-border rounded-xl font-mono text-[11px] overflow-x-auto text-foreground">
              {dataUri}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. Color Gradient Mesh & CSS Background Studio
// ============================================================================
export const ColorGradientMeshGenerator: React.FC = () => {
  const [color1, setColor1] = useState<string>('#4F46E5'); // Indigo
  const [color2, setColor2] = useState<string>('#EC4899'); // Pink
  const [color3, setColor3] = useState<string>('#06B6D4'); // Cyan
  const [angle, setAngle] = useState<number>(135);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [copied, setCopied] = useState<boolean>(false);

  const cssCode = useMemo(() => {
    if (gradientType === 'linear') {
      return `background: linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3});`;
    } else if (gradientType === 'radial') {
      return `background: radial-gradient(circle at center, ${color1}, ${color2}, ${color3});`;
    } else {
      return `background: conic-gradient(from ${angle}deg, ${color1}, ${color2}, ${color3});`;
    }
  }, [gradientType, angle, color1, color2, color3]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-xs">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Gradient Controls
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">Gradient Mode</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {['linear', 'radial', 'conic'].map((t) => (
                <button
                  key={t}
                  onClick={() => setGradientType(t as any)}
                  className={`py-2 rounded-lg border uppercase transition ${
                    gradientType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-secondary/40 text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Color Node 1</span>
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Color Node 2</span>
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Color Node 3</span>
              <input type="color" value={color3} onChange={(e) => setColor3(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
            </div>
          </div>

          {gradientType !== 'radial' && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-foreground"><span>Angle</span><span>{angle}°</span></div>
              <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full accent-indigo-600" />
            </div>
          )}

          <button
            onClick={() => copyToClipboard(cssCode, setCopied)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> {copied ? 'CSS Copied!' : 'Copy CSS Background'}
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div
          className="lg:col-span-2 rounded-2xl min-h-[380px] shadow-2xl border border-border flex items-center justify-center p-8 transition-all duration-300"
          style={{
            backgroundImage:
              gradientType === 'linear'
                ? `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`
                : gradientType === 'radial'
                ? `radial-gradient(circle at center, ${color1}, ${color2}, ${color3})`
                : `conic-gradient(from ${angle}deg, ${color1}, ${color2}, ${color3})`,
          }}
        >
          <div className="bg-slate-900/80 backdrop-blur-md text-white p-6 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full text-center space-y-2">
            <h4 className="font-bold text-base">Live Background Preview</h4>
            <p className="text-xs font-mono text-indigo-300 break-all">{cssCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. Color Blindness & Vision Deficiency Simulator
// ============================================================================
export const ColorBlindnessSimulator: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [visionMode, setVisionMode] = useState<string>('normal');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImageSrc(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  // SVG filter matrix maps
  const filterStyles: Record<string, string> = {
    normal: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    protanopia: 'hue-rotate(240deg) saturate(70%)',
    deuteranopia: 'hue-rotate(180deg) saturate(80%)',
    tritanopia: 'hue-rotate(90deg) saturate(110%)',
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="cb-file-input" />
          <label htmlFor="cb-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Color Blindness Vision Simulator</p>
              <p className="text-xs text-muted-foreground mt-1">Test your graphics & UI designs for Protanopia, Deuteranopia & Tritanopia accessibility</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" /> Vision Filter
              </h3>
              <label htmlFor="cb-file-input" className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold">Change</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="cb-file-input" />
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Normal Vision', key: 'normal', desc: 'Standard trichromatic vision' },
                { label: 'Protanopia (Red-Blind)', key: 'protanopia', desc: 'Inability to perceive red light' },
                { label: 'Deuteranopia (Green-Blind)', key: 'deuteranopia', desc: 'Inability to perceive green light' },
                { label: 'Tritanopia (Blue-Blind)', key: 'tritanopia', desc: 'Inability to perceive blue light' },
                { label: 'Achromatopsia (Monochrome)', key: 'grayscale', desc: 'Total color blindness' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setVisionMode(m.key)}
                  className={`w-full p-3 rounded-xl border text-left transition ${
                    visionMode === m.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="font-bold">{m.label}</div>
                  <div className={`text-[10px] mt-0.5 ${visionMode === m.key ? 'text-indigo-100' : 'text-muted-foreground'}`}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Simulated View: <strong className="text-indigo-400 uppercase">{visionMode}</strong>
            </span>
            <img
              src={imageSrc}
              alt="Simulated vision"
              style={{ filter: filterStyles[visionMode] }}
              className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700 transition-all duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 10. Image Blur & Pixelate Anonymizer
// ============================================================================
export const ImageAnonymizerBlur: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('anonymized');
  const [blurMode, setBlurMode] = useState<'pixelate' | 'blur'>('pixelate');
  const [blurIntensity, setBlurIntensity] = useState<number>(15);

  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => setImageSrc(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (blurMode === 'blur') {
        ctx.filter = `blur(${blurIntensity}px)`;
        ctx.drawImage(img, 0, 0);
      } else {
        // Pixelate by downscaling and upscaling without smoothing
        const scaledW = Math.max(1, Math.floor(img.width / blurIntensity));
        const scaledH = Math.max(1, Math.floor(img.height / blurIntensity));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = scaledW;
        tempCanvas.height = scaledH;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(img, 0, 0, scaledW, scaledH);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, img.width, img.height);
      }

      setOutputUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = imageSrc;
  }, [imageSrc, blurMode, blurIntensity]);

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-border hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-secondary/40/50">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="anon-file-input" />
          <label htmlFor="anon-file-input" className="cursor-pointer space-y-3 block">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <EyeOff className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Image Blur & Pixelate Anonymizer</p>
              <p className="text-xs text-muted-foreground mt-1">Obfuscate sensitive documents, faces, credentials, or private details</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" /> Anonymizer Options
              </h3>
              <label htmlFor="anon-file-input" className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold">Change</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="anon-file-input" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Effect Style</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { label: 'Pixelate', val: 'pixelate' },
                  { label: 'Gaussian Blur', val: 'blur' },
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => setBlurMode(m.val as any)}
                    className={`py-2 rounded-lg border transition ${
                      blurMode === m.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-secondary/40 text-foreground'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-foreground">
                <span>Intensity / Block Size</span>
                <span>{blurIntensity}</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {outputUrl && (
              <a
                href={outputUrl}
                download={`${fileName}_anonymized.jpg`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Anonymized Image
              </a>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 flex items-center justify-center min-h-[400px] border border-slate-800">
            {outputUrl ? (
              <img src={outputUrl} alt="Anonymized preview" className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700" />
            ) : (
              <div className="text-muted-foreground text-xs">Rendering anonymized photo...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
