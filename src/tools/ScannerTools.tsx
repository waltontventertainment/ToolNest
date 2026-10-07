import React, { useState, useRef, useEffect } from 'react';
import { ToolPanel, OutputBox, DownloadButton, CopyButton } from '../lib/toolkit';
import { Camera, Upload, RefreshCw, ExternalLink, Check, Copy, AlertCircle, Sparkles, QrCode, Barcode, Search, Volume2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export const QrCodeScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ text: string; format?: string; type: 'url' | 'email' | 'phone' | 'text' } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    
    // Get camera list if camera permission is granted
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            // Prefer back/environment camera if available
            const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
          }
        })
        .catch(err => console.log('Camera enumeration error:', err));
    }

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraActive(true);
    setScanResult(null);
    setErrorMsg(null);

    try {
      const targetId = deviceId || selectedCameraId;
      if (!codeReaderRef.current) codeReaderRef.current = new BrowserMultiFormatReader();

      codeReaderRef.current.decodeFromVideoDevice(
        targetId || undefined,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const text = result.getText();
            processDecodedText(text, 'QR_CODE');
            toast.success('QR Code detected!');
            stopCamera();
          }
        }
      );
    } catch (err: any) {
      console.error('Camera start failed:', err);
      setErrorMsg('Unable to access camera. Please check camera permissions or upload an image instead.');
      setCameraActive(false);
    }
  };

  const processDecodedText = (text: string, format?: string) => {
    let type: 'url' | 'email' | 'phone' | 'text' = 'text';
    if (/^https?:\/\//i.test(text.trim()) || /^www\./i.test(text.trim())) {
      type = 'url';
    } else if (/^mailto:/i.test(text.trim()) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) {
      type = 'email';
    } else if (/^tel:/i.test(text.trim()) || /^\+?[0-9\s\-()]{7,20}$/.test(text.trim())) {
      type = 'phone';
    }

    setScanResult({
      text: text.trim(),
      format: format || 'QR_CODE',
      type
    });
  };

  // Robust multi-pass scanner for uploaded/captured image
  const processImageFile = async (file: File) => {
    setScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = async () => {
        try {
          let detectedText: string | null = null;

          // Pass 1: Browser Native BarcodeDetector (High precision for text-heavy photos)
          if ('BarcodeDetector' in window) {
            try {
              const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(img);
              if (barcodes && barcodes.length > 0) {
                detectedText = barcodes[0].rawValue;
              }
            } catch (nativeErr) {
              console.log('Native BarcodeDetector pass failed, trying ZXing/jsQR', nativeErr);
            }
          }

          // Pass 2: ZXing Library decode
          if (!detectedText && codeReaderRef.current) {
            try {
              const zxingResult = await codeReaderRef.current.decodeFromImageElement(img);
              if (zxingResult) {
                detectedText = zxingResult.getText();
              }
            } catch (zxingErr) {
              console.log('ZXing pass failed', zxingErr);
            }
          }

          // Pass 3: Canvas multi-scale & high-contrast pass with jsQR
          if (!detectedText) {
            detectedText = scanImageWithCanvas(img);
          }

          if (detectedText) {
            processDecodedText(detectedText, 'QR_CODE');
            toast.success('QR Code successfully detected and decoded!');
          } else {
            setErrorMsg('No QR Code detected in this image. Please ensure the QR code is clearly visible, not overly blurry or truncated.');
            toast.error('No QR code found in image.');
          }
        } catch (err) {
          console.error(err);
          setErrorMsg('An error occurred while scanning the image.');
        } finally {
          setScanning(false);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Multi-scale Canvas scan with contrast enhancement
  const scanImageWithCanvas = (img: HTMLImageElement): string | null => {
    const scales = [1.0, 0.75, 0.5, 1.5];

    for (const scale of scales) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const width = Math.floor(img.width * scale);
      const height = Math.floor(img.height * scale);
      if (width < 50 || height < 50) continue;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 1. Scan original image data
      let imageData = ctx.getImageData(0, 0, width, height);
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (code && code.data) return code.data;

      // 2. Scan inverted
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'onlyInvert'
      });
      if (code && code.data) return code.data;

      // 3. Contrast enhancement pass
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale + Contrast
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const v = avg < 128 ? Math.max(0, avg - 40) : Math.min(255, avg + 40);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
      ctx.putImageData(imageData, 0, 0);

      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (code && code.data) return code.data;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('upload'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload / Capture Photo
        </button>
        <button
          onClick={() => { setActiveTab('camera'); startCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'camera' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera Stream
        </button>
      </div>

      {activeTab === 'upload' && (
        <ToolPanel>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center cursor-pointer transition-colors bg-secondary/10 hover:bg-secondary/30 flex flex-col items-center justify-center min-h-[220px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Uploaded QR preview" className="max-h-56 mx-auto rounded-lg shadow border object-contain" />
                <p className="text-xs text-muted-foreground">Click or drop another image to scan</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary inline-block">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload or drag & drop image</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports images with complex text, documents, flyers, or photos containing QR codes</p>
                </div>
              </div>
            )}
          </div>
        </ToolPanel>
      )}

      {activeTab === 'camera' && (
        <ToolPanel>
          <div className="space-y-4">
            {cameras.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Select Camera:</label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="p-1.5 rounded border bg-transparent text-xs"
                >
                  {cameras.map((c, i) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none border-2 border-primary/60 rounded-xl flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg relative animate-pulse flex items-center justify-center bg-primary/5">
                  <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Position QR code inside box</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}
            </div>
          </div>
        </ToolPanel>
      )}

      {scanning && (
        <div className="p-4 rounded-lg bg-secondary/50 border flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Scanning image for QR Code...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Scan Unsuccessful</p>
            <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="space-y-4 p-5 rounded-xl bg-card border shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-base">QR Code Content</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase">
              {scanResult.type}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm break-all select-all">
            {scanResult.text}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <CopyButton text={scanResult.text} />

            {scanResult.type === 'url' && (
              <a
                href={scanResult.text.startsWith('http') ? scanResult.text : `https://${scanResult.text}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ExternalLink className="w-4 h-4" /> Open Link
              </a>
            )}

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(scanResult.text)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Search className="w-4 h-4" /> Search Google
            </a>

            <DownloadButton onClick={() => {
              const blob = new Blob([scanResult.text], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'qr-code-decoded.txt';
              a.click();
            }} label="Download Text" />
          </div>
        </div>
      )}
    </div>
  );
};

export const BarcodeScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ text: string; format: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
          }
        })
        .catch(err => console.log('Camera error:', err));
    }

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraActive(true);
    setScanResult(null);
    setErrorMsg(null);

    try {
      const targetId = deviceId || selectedCameraId;
      if (!codeReaderRef.current) codeReaderRef.current = new BrowserMultiFormatReader();

      codeReaderRef.current.decodeFromVideoDevice(
        targetId || undefined,
        videoRef.current!,
        (result, err) => {
          if (result) {
            setScanResult({
              text: result.getText(),
              format: result.getBarcodeFormat().toString() || 'BARCODE'
            });
            toast.success('Barcode detected!');
            stopCamera();
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unable to access camera.');
      setCameraActive(false);
    }
  };

  const processImageFile = async (file: File) => {
    setScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = async () => {
        try {
          let detectedText: string | null = null;
          let detectedFormat = 'BARCODE';

          // Pass 1: Browser Native BarcodeDetector (Supports 1D & 2D barcodes seamlessly in text-heavy images)
          if ('BarcodeDetector' in window) {
            try {
              const formats = ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e', 'codabar', 'data_matrix', 'pdf417', 'qr_code'];
              const detector = new (window as any).BarcodeDetector({ formats });
              const barcodes = await detector.detect(img);
              if (barcodes && barcodes.length > 0) {
                detectedText = barcodes[0].rawValue;
                detectedFormat = barcodes[0].format.toUpperCase();
              }
            } catch (nativeErr) {
              console.log('Native BarcodeDetector pass failed', nativeErr);
            }
          }

          // Pass 2: ZXing Library MultiFormat decode
          if (!detectedText && codeReaderRef.current) {
            try {
              const zxingResult = await codeReaderRef.current.decodeFromImageElement(img);
              if (zxingResult) {
                detectedText = zxingResult.getText();
                detectedFormat = zxingResult.getBarcodeFormat().toString();
              }
            } catch (zxingErr) {
              console.log('ZXing pass failed', zxingErr);
            }
          }

          // Pass 3: Multi-scale Canvas pass for low-resolution or high-contrast scans
          if (!detectedText) {
            const canvasResult = await scanCanvasMultiPass(img);
            if (canvasResult) {
              detectedText = canvasResult.text;
              detectedFormat = canvasResult.format;
            }
          }

          if (detectedText) {
            setScanResult({
              text: detectedText,
              format: detectedFormat
            });
            toast.success('Barcode detected and decoded!');
          } else {
            setErrorMsg('No barcode found in this image. Please make sure the barcode is un-blurred, properly oriented, and clearly visible.');
            toast.error('No barcode detected.');
          }
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to process image for barcodes.');
        } finally {
          setScanning(false);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const scanCanvasMultiPass = async (img: HTMLImageElement): Promise<{ text: string; format: string } | null> => {
    if (!codeReaderRef.current) return null;

    const scales = [1.0, 0.8, 1.2];
    for (const scale of scales) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const tmpImg = new Image();
        const decoded = await new Promise<{ text: string; format: string } | null>((resolve) => {
          tmpImg.onload = async () => {
            try {
              const res = await codeReaderRef.current!.decodeFromImageElement(tmpImg);
              if (res) {
                resolve({
                  text: res.getText(),
                  format: res.getBarcodeFormat().toString()
                });
                return;
              }
            } catch (e) {
              // Ignore
            }
            resolve(null);
          };
          tmpImg.onerror = () => resolve(null);
          tmpImg.src = dataUrl;
        });

        if (decoded) return decoded;
      } catch (e) {
        // Continue
      }
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('upload'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload / Capture Photo
        </button>
        <button
          onClick={() => { setActiveTab('camera'); startCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'camera' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera Stream
        </button>
      </div>

      {activeTab === 'upload' && (
        <ToolPanel>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center cursor-pointer transition-colors bg-secondary/10 hover:bg-secondary/30 flex flex-col items-center justify-center min-h-[220px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Uploaded Barcode preview" className="max-h-56 mx-auto rounded-lg shadow border object-contain" />
                <p className="text-xs text-muted-foreground">Click or drop another image to scan</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary inline-block">
                  <Barcode className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload or drop barcode image</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports EAN-13, EAN-8, Code 128, Code 39, UPC-A, UPC-E, ITF, DataMatrix, and PDF417</p>
                </div>
              </div>
            )}
          </div>
        </ToolPanel>
      )}

      {activeTab === 'camera' && (
        <ToolPanel>
          <div className="space-y-4">
            {cameras.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Select Camera:</label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="p-1.5 rounded border bg-transparent text-xs"
                >
                  {cameras.map((c, i) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-primary rounded-lg relative animate-pulse flex items-center justify-center bg-primary/5">
                  <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Align Barcode within rectangle</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}
            </div>
          </div>
        </ToolPanel>
      )}

      {scanning && (
        <div className="p-4 rounded-lg bg-secondary/50 border flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Detecting barcode in image...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Scan Unsuccessful</p>
            <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="space-y-4 p-5 rounded-xl bg-card border shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-base">Barcode Decoded</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase">
              {scanResult.format}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 font-mono text-lg font-bold text-center tracking-wider select-all">
            {scanResult.text}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <CopyButton text={scanResult.text} />

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(scanResult.text)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="w-4 h-4" /> Google Product Search
            </a>

            <a
              href={`https://www.amazon.com/s?k=${encodeURIComponent(scanResult.text)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <ExternalLink className="w-4 h-4" /> Search Amazon
            </a>

            <DownloadButton onClick={() => {
              const blob = new Blob([`Format: ${scanResult.format}\nValue: ${scanResult.text}`], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `barcode-${scanResult.text}.txt`;
              a.click();
            }} label="Download Details" />
          </div>
        </div>
      )}
    </div>
  );
};
