import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { uploadToImgBB, IMGBB_API_KEY } from '../../lib/imgbb';
import { toast } from 'sonner';

interface ImgBBUploaderProps {
  onImageUploaded?: (url: string) => void;
  apiKey?: string;
  className?: string;
  buttonLabel?: string;
}

export const ImgBBUploader: React.FC<ImgBBUploaderProps> = ({
  onImageUploaded,
  apiKey = IMGBB_API_KEY,
  className = '',
  buttonLabel = 'Upload to ImgBB'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error('Image size must be under 32MB');
      return;
    }

    // Set preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    setError(null);

    try {
      const result = await uploadToImgBB(file, apiKey, file.name);
      if (result.success && result.url) {
        setUploadedUrl(result.url);
        toast.success('Image successfully uploaded to ImgBB!');
        if (onImageUploaded) {
          onImageUploaded(result.url);
        }
      } else {
        setError(result.error || 'Upload failed');
        toast.error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Error uploading image');
      toast.error('Failed to upload to ImgBB');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyUrl = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-center ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground">Uploading image to ImgBB...</p>
          <p className="text-xs text-muted-foreground">Generating high-resolution CDN link</p>
        </div>
      ) : uploadedUrl ? (
        <div className="py-3 flex flex-col items-center justify-center space-y-3">
          <div className="relative group w-32 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <img src={uploadedUrl} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-white p-1 hover:text-primary">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Uploaded to ImgBB
            </span>
            <button
              type="button"
              onClick={copyUrl}
              className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-foreground flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy URL
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2 py-1 bg-primary text-white hover:bg-primary/90 rounded transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <div className="py-4 flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:scale-102 flex items-center gap-2 mx-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              {buttonLabel}
            </button>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Powered by ImgBB CDN • PNG, JPG, WebP, GIF up to 32MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-rose-500 flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
};
