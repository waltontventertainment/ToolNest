import React, { useState, useRef, ChangeEvent } from 'react';
import { ToolPanel, DownloadButton } from '../lib/toolkit';
import { toast } from 'sonner';

export const ImageCompressor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedDataUrl, setCompressedDataUrl] = useState('');
  const [quality, setQuality] = useState(0.8);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      setOriginalFile(file);
      processImage(file, quality);
    }
  };

  const processImage = (file: File, q: number) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', q);
        setCompressedDataUrl(dataUrl);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    setQuality(q);
    if (originalFile) {
      processImage(originalFile, q);
    }
  };

  const handleDownload = () => {
    if (!compressedDataUrl) return;
    const a = document.createElement('a');
    a.href = compressedDataUrl;
    a.download = `compressed-${originalFile?.name || 'image.jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded compressed image');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ToolPanel className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-2">Images are processed entirely in your browser.</p>
        </div>
        
        {originalFile && (
          <div>
            <label className="block text-sm font-medium mb-2">Quality: {Math.round(quality * 100)}%</label>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={quality} 
              onChange={handleQualityChange}
              className="w-full accent-primary"
            />
          </div>
        )}
      </ToolPanel>

      <ToolPanel className="flex flex-col items-center justify-center space-y-4">
        <canvas ref={canvasRef} className="hidden" />
        {compressedDataUrl ? (
          <>
            <img src={compressedDataUrl} alt="Compressed preview" className="max-w-full max-h-[300px] rounded-md shadow-sm" />
            <DownloadButton onClick={handleDownload} label="Download Compressed" />
          </>
        ) : (
          <div className="text-muted-foreground text-sm">Upload an image to see preview</div>
        )}
      </ToolPanel>
    </div>
  );
};
