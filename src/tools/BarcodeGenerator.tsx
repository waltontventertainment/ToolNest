import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { ToolPanel, DownloadButton } from '../lib/toolkit';
import { toast } from 'sonner';

export const BarcodeGenerator: React.FC = () => {
  const [data, setData] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data) {
      setError(null);
      return;
    }

    try {
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, data, {
          format,
          lineColor: color,
          background: bg,
          width: 2,
          height: 100,
          displayValue: true
        });
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid data for this barcode format');
    }
  }, [data, format, color, bg]);

  const handleDownload = () => {
    if (!canvasRef.current || error) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded Barcode');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ToolPanel className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Barcode Value</label>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter value..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="CODE128">CODE128 (Standard)</option>
            <option value="EAN13">EAN-13</option>
            <option value="UPC">UPC</option>
            <option value="EAN8">EAN-8</option>
            <option value="CODE39">CODE39</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Line Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded cursor-pointer border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 rounded cursor-pointer border" />
          </div>
        </div>
      </ToolPanel>
      
      <ToolPanel className="flex flex-col items-center justify-center space-y-6">
        <div className="bg-white p-4 rounded-md shadow-sm border overflow-x-auto max-w-full">
          <canvas ref={canvasRef} className={error ? 'hidden' : 'max-w-full'} />
          {error && (
            <div className="text-destructive text-sm text-center py-8">
              <span className="font-semibold block mb-1">Error Generating Barcode</span>
              {error}
            </div>
          )}
        </div>
        
        {!error && data && (
          <DownloadButton onClick={handleDownload} label="Download PNG" />
        )}
      </ToolPanel>
    </div>
  );
};
