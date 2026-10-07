import React, { useState } from 'react';
import { Copy, Check, Download, FileText, CloudUpload } from 'lucide-react';
import { MarkdownRenderer, stripMarkdown } from './MarkdownRenderer';
import { toast } from 'sonner';
import { downloadBlob } from '../lib/downloadHelper';
import { useGoogleDrive } from '../context/GoogleDriveContext';

interface AiOutputBoxProps {
  content: string;
  loading?: boolean;
  title?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  filename?: string;
  minHeightClass?: string;
}

export const AiOutputBox: React.FC<AiOutputBoxProps> = ({
  content,
  loading = false,
  title = 'AI Generated Output',
  emptyIcon,
  emptyTitle = 'Output will stream here in real time',
  emptySubtitle = 'Fill in your inputs and click Generate to see instant AI results.',
  filename = 'ai-output.md',
  minHeightClass = 'min-h-[340px]'
}) => {
  const [copied, setCopied] = useState(false);
  const [savingDrive, setSavingDrive] = useState(false);
  const { accessToken, uploadFile, signIn } = useGoogleDrive();

  const handleCopyClean = () => {
    if (!content) return;
    const cleanText = stripMarkdown(content);
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    toast.success('Clean formatted text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, filename);
    toast.success('File downloaded!');
  };

  const handleSaveToDrive = async () => {
    if (!content) return;
    if (!accessToken) {
      toast.info('Connecting to Google Drive...');
      await signIn();
      return;
    }

    setSavingDrive(true);
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      await uploadFile(filename, blob, 'text/markdown');
    } finally {
      setSavingDrive(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-2.5">
      {/* Output Header Bar */}
      {content && (
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-foreground">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyClean}
              className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer"
              title="Copy clean text without raw symbols"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer"
              title="Download content"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={handleSaveToDrive}
              disabled={savingDrive}
              className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer text-blue-600 dark:text-blue-400 border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20"
              title="Upload file directly to Google Drive"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${savingDrive ? 'animate-bounce' : ''}`} />
              <span>Drive</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Box */}
      <div className={`w-full ${minHeightClass} p-5 rounded-2xl bg-card border border-border shadow-xs overflow-y-auto`}>
        {content ? (
          <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
            <MarkdownRenderer content={content} liveCursor={loading} />
          </div>
        ) : (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-muted-foreground p-6 space-y-2">
            {emptyIcon || <FileText className="w-10 h-10 opacity-35 text-primary mb-1" />}
            <p className="font-bold text-xs md:text-sm text-foreground">{emptyTitle}</p>
            <p className="text-[11px] md:text-xs text-muted-foreground max-w-xs">
              {emptySubtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
