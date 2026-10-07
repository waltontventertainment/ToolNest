import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ToolPanel, DownloadButton } from '../lib/toolkit';
import { toast } from 'sonner';

export const QRGenerator: React.FC = () => {
  const [data, setData] = useState('https://example.com');
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!data) {
      setQrDataUrl('');
      setError(null);
      return;
    }
    
    const timer = setTimeout(() => {
      QRCode.toDataURL(data, {
        color: { dark: color, light: bg },
        width: 300,
        margin: 2
      })
      .then(url => {
        setQrDataUrl(url);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setQrDataUrl('');
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [data, color, bg]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded QR Code');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ToolPanel className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payload (URL, Text, etc.)</label>
          <textarea
            className="w-full p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter URL or text..."
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Foreground</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
          </div>
        </div>
      </ToolPanel>
      
      <ToolPanel className="flex flex-col items-center justify-center space-y-4">
        {error ? (
          <div className="text-destructive text-sm text-center px-4">
            <span className="font-semibold block mb-1">Error Generating QR Code</span>
            {error}
          </div>
        ) : qrDataUrl ? (
          <>
            <img src={qrDataUrl} alt="Generated QR Code" className="w-48 h-48 sm:w-64 sm:h-64 rounded-md shadow-sm bg-white" />
            <DownloadButton onClick={handleDownload} label="Download PNG" />
          </>
        ) : (
          <div className="text-muted-foreground text-sm">Enter data to generate QR code</div>
        )}
      </ToolPanel>
    </div>
  );
};
