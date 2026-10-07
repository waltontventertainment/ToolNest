import React, { useState } from 'react';
import { X, ExternalLink, BookOpen, Download, Type } from 'lucide-react';
import { toast } from 'sonner';

interface UniversalDataReaderModalProps {
  title: string | null;
  content: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  sourceUrl?: string;
  category?: string;
}

export const UniversalDataReaderModal: React.FC<UniversalDataReaderModalProps> = ({ 
  title, content, isOpen, onClose, sourceUrl, category = 'Data Hub' 
}) => {
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  if (!isOpen) return null;

  const handleDownload = () => {
    const textToDownload = `Source: ${title}\nCategory: ${category}\n\n${typeof content === 'string' ? content : 'Structured Data'}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title?.replace(/\s+/g, '_')}_Full_Data.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data downloaded successfully!');
  };

  const getFontSizeClass = () => {
    if (textSize === 'sm') return 'text-[13px]';
    if (textSize === 'base') return 'text-[15px]';
    if (textSize === 'lg') return 'text-[18px]';
    if (textSize === 'xl') return 'text-[22px]';
    return 'text-[15px]';
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex justify-end z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-background border-l border-border h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  {category} Explorer
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground truncate max-w-xs">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Text Size */}
            <div className="flex items-center bg-card rounded-lg border border-border/80 px-1.5 py-1">
              <button
                onClick={() => {
                  if (textSize === 'xl') setTextSize('lg');
                  else if (textSize === 'lg') setTextSize('base');
                  else if (textSize === 'base') setTextSize('sm');
                }}
                className="p-1 text-xs hover:text-amber-500 font-bold cursor-pointer"
              >
                A-
              </button>
              <Type className="w-3.5 h-3.5 text-muted-foreground mx-1" />
              <button
                onClick={() => {
                  if (textSize === 'sm') setTextSize('base');
                  else if (textSize === 'base') setTextSize('lg');
                  else if (textSize === 'lg') setTextSize('xl');
                }}
                className="p-1 text-xs hover:text-amber-500 font-bold cursor-pointer"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Download Data"
            >
              <Download className="w-4 h-4" />
            </button>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                title="View Source"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/15 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 ${getFontSizeClass()} leading-relaxed text-foreground`}>
          {typeof content === 'string' ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};
