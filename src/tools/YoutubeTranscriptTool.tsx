import React, { useState } from 'react';
import { 
  Video, 
  FileText, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  CloudUpload,
  ExternalLink,
  Zap,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { downloadBlob } from '../lib/downloadHelper';

interface TranscriptLine {
  text: string;
  start: number;
  duration: number;
  timestamp: string;
}

interface TranscriptData {
  videoId: string;
  videoUrl: string;
  languageCode: string;
  languageName: string;
  lines: TranscriptLine[];
  fullParagraph: string;
}

export const YoutubeTranscriptTool: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TranscriptData | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Google Drive
  const [savingDrive, setSavingDrive] = useState(false);
  const driveContext = useGoogleDrive();

  const handleFetchTranscript = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a YouTube Video URL or Video ID');
      return;
    }

    setLoading(true);
    setData(null);
    
    try {
      const response = await fetch(`/api/youtube-transcript?v=${encodeURIComponent(videoUrl.trim())}`);
      
      // Read the raw response as text to prevent JSON parse crashes on text errors
      const responseText = await response.text();
      
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (jsonErr) {
        // Handle common plain text rate-limiting messages from the proxy or platform
        if (responseText.includes('Rate exceeded') || response.status === 429) {
          throw new Error('Server rate limit or quota exceeded. Please wait a minute and click "Get Transcript" again!');
        }
        throw new Error(responseText || 'Invalid response format received from the server.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transcript');
      }

      setData(result);
      toast.success('Transcript successfully extracted in milliseconds!');
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error(err.message || 'No captions or transcript track available for this video.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = data.lines.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Transcript copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!data) return;
    const text = `YouTube Video Transcript (ID: ${data.videoId})\nURL: ${data.videoUrl}\n\n` + 
                 data.lines.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    downloadBlob(new Blob([text], { type: 'text/plain' }), `Transcript_${data.videoId}.txt`);
  };

  const handleSaveToDrive = async () => {
    if (!data) return;
    if (!driveContext?.user || !driveContext?.accessToken) {
      toast.info('Connecting to Google Drive... Please sign in.');
      try {
        await driveContext?.signIn();
      } catch {
        return;
      }
    }

    setSavingDrive(true);
    try {
      let content = `# YouTube Video Transcript (ID: ${data.videoId})\nVideo URL: ${data.videoUrl}\n\n`;
      content += `## Transcript\n` + data.lines.map(l => `- **[${l.timestamp}]** ${l.text}`).join('\n');

      const fileName = `YouTube_Transcript_${data.videoId}.md`;
      const result = await driveContext?.uploadFile(fileName, content, 'text/markdown');

      if (result) {
        toast.success(`Saved "${fileName}" to Google Drive!`);
      } else {
        toast.error('Failed to save transcript to Google Drive.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving to Google Drive.');
    } finally {
      setSavingDrive(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400">
              <Video className="w-3.5 h-3.5 animate-pulse" />
              <span>Direct Multilingual Video Engine</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">No API Key Required</span>
          </div>

          {/* Search/Url Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <div className="relative flex-1">
              <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube Video URL or ID (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/80 bg-card/60 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 text-xs font-semibold"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchTranscript()}
              />
            </div>
            <button
              onClick={handleFetchTranscript}
              disabled={loading}
              className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Get Transcript</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in-0 duration-200">
          {/* Main Transcript Display Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[75vh]">
              {/* Header actions */}
              <div className="p-4 border-b border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Language: {data.languageName} ({data.languageCode})</span>
                  <p className="text-xs font-bold text-foreground">Video ID: {data.videoId}</p>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-border/60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToDrive}
                    disabled={savingDrive}
                    className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-primary/20 disabled:opacity-50"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{savingDrive ? 'Saving...' : 'Drive'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-border/60"
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {data.lines.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 hover:bg-muted/30 p-1.5 rounded-lg transition-colors">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-secondary text-primary px-2 py-0.5 rounded border border-border">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {line.timestamp}
                    </span>
                    <p className="text-xs font-medium text-foreground leading-relaxed pt-0.5">
                      {line.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Video Stats & Cover */}
            <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm space-y-4 text-center sm:text-left">
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-border relative bg-secondary">
                <img 
                  src={`https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg`} 
                  alt="YouTube Preview" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-500 fill-current filter drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Extracted Track Specs</h4>
                <p className="text-sm font-bold text-foreground">Subtitle Lines: {data.lines.length}</p>
                <p className="text-xs text-muted-foreground">Approx. Word Count: {data.fullParagraph.split(/\s+/).length} words</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default YoutubeTranscriptTool;
