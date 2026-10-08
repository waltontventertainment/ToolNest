import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Play, 
  Languages, 
  FileDown, 
  X, 
  Upload, 
  Sparkles,
  ChevronDown,
  Film,
  AlertTriangle,
  RotateCcw
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

interface LanguageTrack {
  label: string;
  languageCode: string;
}

interface TranscriptData {
  videoId: string;
  videoTitle?: string;
  author?: string;
  videoUrl: string;
  languageCode: string;
  languageName: string;
  availableLanguages: LanguageTrack[];
  linesCount: number;
  lines: TranscriptLine[];
  fullParagraph: string;
  isLocalVideo?: boolean;
}

// Convert seconds to standard SubRip (.srt) timecode: 00:01:23,456
function toSrtTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// Convert seconds to WebVTT (.vtt) timecode: 00:01:23.456
function toVttTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Format seconds to mm:ss or hh:mm:ss
function formatTimestamp(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = Math.floor(safeSec % 60);
  return [
    h > 0 ? String(h).padStart(2, '0') : null,
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].filter(Boolean).join(':');
}

// Pure text parser for SRT, VTT, and timestamped lines
function parseRawSubtitles(rawText: string): TranscriptLine[] {
  const rawLines = rawText.split('\n');
  const parsedLines: TranscriptLine[] = [];
  let currentStart = 0;

  const timestampRegex = /^(?:\[?(\d{1,2}:)?(\d{1,2}):(\d{2})\]?|\b(\d+)\s*sec\b)\s*(.*)$/i;

  const parseSec = (timeStr: string) => {
    const cleanStr = timeStr.trim().replace(',', '.');
    const segs = cleanStr.split(':').map(Number);
    if (segs.length === 3) return segs[0] * 3600 + segs[1] * 60 + segs[2];
    if (segs.length === 2) return segs[0] * 60 + segs[1];
    return 0;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE')) continue;

    // Skip pure numeric index lines (SRT cue numbers)
    if (/^\d+$/.test(line) && i + 1 < rawLines.length && rawLines[i + 1].includes('-->')) {
      continue;
    }

    // Check SRT / VTT timecode line: 00:00:18,800 --> 00:00:26,039
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseSec(parts[0]);
      const end = parseSec(parts[1]);
      const nextContent = rawLines[++i]?.trim() || '';
      if (nextContent) {
        parsedLines.push({
          text: nextContent.replace(/<[^>]*>/g, ''),
          start,
          duration: Math.max(1, end - start),
          timestamp: formatTimestamp(start)
        });
      }
      currentStart = end;
      continue;
    }

    const match = line.match(timestampRegex);
    if (match) {
      const hours = match[1] ? parseInt(match[1].replace(':', '')) : 0;
      const mins = parseInt(match[2] || '0');
      const secs = parseInt(match[3] || '0');
      const start = hours * 3600 + mins * 60 + secs;
      const text = match[5]?.trim() || '';
      if (text) {
        parsedLines.push({
          text,
          start,
          duration: 3,
          timestamp: formatTimestamp(start)
        });
      }
      currentStart = start + 3;
    } else {
      // Plain sentence/line
      parsedLines.push({
        text: line,
        start: currentStart,
        duration: 3,
        timestamp: formatTimestamp(currentStart)
      });
      currentStart += 3;
    }
  }

  return parsedLines;
}

export const YoutubeTranscriptTool: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [switchingLang, setSwitchingLang] = useState(false);
  const [data, setData] = useState<TranscriptData | null>(null);
  
  // Interactive Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlaybackTime, setActivePlaybackTime] = useState<number | null>(null);
  const [playerSeekTime, setPlayerSeekTime] = useState<number>(0);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  
  // Local Video Player
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  
  // Export & UI state
  const [copiedFormat, setCopiedFormat] = useState<'plain' | 'timestamps' | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [mainTab, setMainTab] = useState<'url' | 'upload'>('url');
  const [uploadSubTab, setUploadSubTab] = useState<'subtitles' | 'video' | 'paste'>('subtitles');
  
  // Manual text & file states
  const [manualText, setManualText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Google Drive
  const [savingDrive, setSavingDrive] = useState(false);
  const driveContext = useGoogleDrive();
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
    };
  }, [localVideoUrl]);

  // Fetch transcript from server
  const handleFetchTranscript = async (forcedLang?: string) => {
    const targetInput = videoUrl.trim();
    if (!targetInput && mainTab === 'url') {
      toast.error('Please enter a YouTube Video URL or Video ID');
      return;
    }

    if (forcedLang) {
      setSwitchingLang(true);
    } else {
      setLoading(true);
    }

    try {
      let queryUrl = `/api/youtube-transcript?v=${encodeURIComponent(targetInput)}`;
      if (forcedLang) {
        queryUrl += `&lang=${encodeURIComponent(forcedLang)}`;
      }

      const response = await fetch(queryUrl);
      const responseText = await response.text();
      
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || 'Invalid response from server.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transcript.');
      }

      setData(result);
      setPlayerSeekTime(0);
      setPlayerPlaying(false);
      setLocalVideoUrl(null);
      setSearchQuery('');
      
      if (forcedLang) {
        toast.success(`Switched language to ${result.languageName}!`);
      } else {
        toast.success(`Transcript extracted successfully (${result.linesCount} lines)!`);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error(err.message || 'No captions or transcript track available for this video.');
    } finally {
      setLoading(false);
      setSwitchingLang(false);
    }
  };

  // Language track change
  const handleLanguageChange = (langCode: string) => {
    if (!langCode || langCode === data?.languageCode) return;
    handleFetchTranscript(langCode);
  };

  // Handle subtitle file upload (.srt, .vtt, .txt, .json)
  const handleSubtitleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error('Selected file is empty.');
        return;
      }

      const parsedLines = parseRawSubtitles(text);
      if (parsedLines.length === 0) {
        toast.error('Could not parse any transcript cues from this file.');
        return;
      }

      const fileTitle = file.name.replace(/\.[^/.]+$/, '');
      setData({
        videoId: 'upload',
        videoTitle: fileTitle,
        author: 'Uploaded File',
        videoUrl: '',
        languageCode: 'custom',
        languageName: 'Uploaded Subtitles',
        availableLanguages: [{ label: 'Uploaded Subtitles', languageCode: 'custom' }],
        linesCount: parsedLines.length,
        lines: parsedLines,
        fullParagraph: parsedLines.map(l => l.text).join(' '),
        isLocalVideo: Boolean(localVideoUrl)
      });
      toast.success(`Loaded ${parsedLines.length} lines from "${file.name}"!`);
    };
    reader.readAsText(file);
  };

  // Handle local video file upload (.mp4, .webm, .mov)
  const handleVideoFileUpload = (file: File) => {
    if (!file) return;
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    setLocalVideoUrl(blobUrl);

    // If data already exists, mark local video
    if (data) {
      setData({
        ...data,
        isLocalVideo: true
      });
    } else {
      // Seed initial container
      const fileTitle = file.name.replace(/\.[^/.]+$/, '');
      setData({
        videoId: 'local',
        videoTitle: fileTitle,
        author: 'Local Video',
        videoUrl: '',
        languageCode: 'local',
        languageName: 'Local Video',
        availableLanguages: [{ label: 'Local Video', languageCode: 'local' }],
        linesCount: 0,
        lines: [],
        fullParagraph: '',
        isLocalVideo: true
      });
    }
    toast.success(`Loaded video: "${file.name}". You can now upload or paste subtitles to sync with it!`);
  };

  // Manual transcript parser from text area
  const handleParseManualText = () => {
    if (!manualText.trim()) {
      toast.error('Please paste subtitle or transcript text first.');
      return;
    }

    const parsedLines = parseRawSubtitles(manualText);
    if (parsedLines.length === 0) {
      toast.error('Could not parse any valid lines from the provided text.');
      return;
    }

    const title = manualTitle.trim() || 'Manual Imported Transcript';
    setData({
      videoId: localVideoUrl ? 'local' : 'manual',
      videoTitle: title,
      author: 'Manual Input',
      videoUrl: '',
      languageCode: 'custom',
      languageName: 'Imported',
      availableLanguages: [{ label: 'Imported', languageCode: 'custom' }],
      linesCount: parsedLines.length,
      lines: parsedLines,
      fullParagraph: parsedLines.map(l => l.text).join(' '),
      isLocalVideo: Boolean(localVideoUrl)
    });
    toast.success(`Imported ${parsedLines.length} lines successfully!`);
  };

  // Seek video playback to specific timestamp
  const handleSeekToTime = (seconds: number) => {
    setPlayerSeekTime(Math.floor(seconds));
    setActivePlaybackTime(seconds);
    setPlayerPlaying(true);

    if (localVideoUrl && videoElementRef.current) {
      videoElementRef.current.currentTime = seconds;
      videoElementRef.current.play().catch(() => {});
    }
  };

  // Filtered transcript lines based on search
  const filteredLines = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data.lines;
    const query = searchQuery.toLowerCase().trim();
    return data.lines.filter(l => l.text.toLowerCase().includes(query));
  }, [data, searchQuery]);

  // Copy plain or timestamped text
  const handleCopy = (format: 'plain' | 'timestamps') => {
    if (!data) return;
    let content = '';
    if (format === 'plain') {
      content = data.fullParagraph;
    } else {
      content = data.lines.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    }
    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    toast.success(format === 'plain' ? 'Plain transcript text copied!' : 'Timestamped transcript copied!');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Download files
  const handleDownloadTxt = () => {
    if (!data) return;
    const content = `YouTube Transcript: ${data.videoTitle || data.videoId}\nLanguage: ${data.languageName}\nURL: ${data.videoUrl}\n\n` +
      data.lines.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), `Transcript_${data.videoId}_${data.languageCode}.txt`);
    setExportMenuOpen(false);
  };

  const handleDownloadSrt = () => {
    if (!data) return;
    const srtBlocks = data.lines.map((line, idx) => {
      const start = toSrtTime(line.start);
      const end = toSrtTime(line.start + (line.duration || 3));
      return `${idx + 1}\n${start} --> ${end}\n${line.text}\n`;
    }).join('\n');
    downloadBlob(new Blob([srtBlocks], { type: 'text/plain;charset=utf-8' }), `Subtitles_${data.videoId}_${data.languageCode}.srt`);
    setExportMenuOpen(false);
  };

  const handleDownloadVtt = () => {
    if (!data) return;
    let vtt = `WEBVTT\n\nNOTE YouTube Video: ${data.videoTitle || data.videoId}\n\n`;
    vtt += data.lines.map((line) => {
      const start = toVttTime(line.start);
      const end = toVttTime(line.start + (line.duration || 3));
      return `${start} --> ${end}\n${line.text}\n`;
    }).join('\n');
    downloadBlob(new Blob([vtt], { type: 'text/vtt;charset=utf-8' }), `Subtitles_${data.videoId}_${data.languageCode}.vtt`);
    setExportMenuOpen(false);
  };

  const handleDownloadMarkdown = () => {
    if (!data) return;
    let md = `# ${data.videoTitle || 'YouTube Video Transcript'}\n\n`;
    md += `- **Video ID**: \`${data.videoId}\`\n`;
    md += `- **Channel**: ${data.author || 'Unknown'}\n`;
    md += `- **Language**: ${data.languageName} (\`${data.languageCode}\`)\n`;
    if (data.videoUrl) md += `- **URL**: [Watch on YouTube](${data.videoUrl})\n\n`;
    md += `## Full Text\n\n${data.fullParagraph}\n\n`;
    md += `## Timestamped Dialogue\n\n`;
    md += data.lines.map(l => `- **\`${l.timestamp}\`** ${l.text}`).join('\n');
    downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `Transcript_${data.videoId}.md`);
    setExportMenuOpen(false);
  };

  // Google Drive integration
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
      let content = `# ${data.videoTitle || 'YouTube Video Transcript'}\n\n`;
      content += `- **Video ID**: \`${data.videoId}\`\n`;
      content += `- **Channel**: ${data.author || 'Unknown'}\n`;
      content += `- **Language**: ${data.languageName}\n`;
      if (data.videoUrl) content += `- **URL**: ${data.videoUrl}\n\n`;
      content += `## Full Transcript\n\n${data.fullParagraph}\n\n`;
      content += `## Timestamped Breakdown\n\n` + data.lines.map(l => `- **[${l.timestamp}]** ${l.text}`).join('\n');

      const fileName = `YouTube_Transcript_${data.videoId}_${data.languageCode}.md`;
      const result = await driveContext?.uploadFile(fileName, content, 'text/markdown');

      if (result) {
        toast.success(`Saved "${fileName}" to your Google Drive!`);
      } else {
        toast.error('Failed to save to Google Drive.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error saving to Google Drive: ' + err.message);
    } finally {
      setSavingDrive(false);
      setExportMenuOpen(false);
    }
  };

  // Direct YouTube Watch Link with active timestamp
  const youtubeWatchUrl = data?.videoId && data.videoId.length === 11
    ? `https://www.youtube.com/watch?v=${data.videoId}&t=${Math.floor(playerSeekTime)}s`
    : (data?.videoUrl || '');

  return (
    <div className="space-y-6">
      {/* Mode Switcher & Input Banner */}
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">YouTube Transcript & Subtitles Extractor</h3>
                <p className="text-xs text-muted-foreground">Extract, search, sync, and export captions in multiple languages</p>
              </div>
            </div>

            {/* Segmented Mode Control */}
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setMainTab('url')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mainTab === 'url' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                YouTube URL
              </button>
              <button
                type="button"
                onClick={() => setMainTab('upload')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mainTab === 'upload' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upload Video / Subtitles
              </button>
            </div>
          </div>

          {mainTab === 'url' ? (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste YouTube Video URL or ID (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
                    className="w-full h-11 pl-11 pr-8 rounded-xl border border-border/80 bg-card/60 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 text-xs font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchTranscript()}
                  />
                  {videoUrl && (
                    <button
                      onClick={() => setVideoUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleFetchTranscript()}
                  disabled={loading}
                  className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Extract Transcript</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample quick tries */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span>Quick try:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                  }}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Rick Astley (English CC)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('https://www.youtube.com/watch?v=kJQP7kiw5Fk');
                  }}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Multilingual (Despacito)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('https://www.youtube.com/watch?v=TPi1Q0ZxGEY');
                  }}
                  className="text-xs text-primary hover:underline cursor-pointer truncate max-w-xs"
                >
                  Bengali Drama (Tomar Thikanay)
                </button>
              </div>
            </div>
          ) : (
            /* Upload Video / Subtitles Tab */
            <div className="space-y-4">
              {/* Sub-tab selection */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadSubTab('subtitles')}
                  className={`pb-1.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 ${
                    uploadSubTab === 'subtitles' ? 'border-red-600 text-red-600' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload Subtitle File (.srt, .vtt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadSubTab('video')}
                  className={`pb-1.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 ${
                    uploadSubTab === 'video' ? 'border-red-600 text-red-600' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Upload Local Video File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadSubTab('paste')}
                  className={`pb-1.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 ${
                    uploadSubTab === 'paste' ? 'border-red-600 text-red-600' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Paste Text</span>
                </button>
              </div>

              {/* Subtitle File Upload Area */}
              {uploadSubTab === 'subtitles' && (
                <div className="space-y-3">
                  <input
                    ref={subtitleInputRef}
                    type="file"
                    accept=".srt,.vtt,.txt,.sbv,.json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleSubtitleFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => subtitleInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleSubtitleFileUpload(e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-border/80 hover:border-red-500/60 bg-card/40 hover:bg-card/70 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Click to browse or drag & drop subtitle file</p>
                      <p className="text-[11px] text-muted-foreground">Supports .SRT, .VTT, .TXT, and .SBV with auto-detected timestamps</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Local Video Upload Area */}
              {uploadSubTab === 'video' && (
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleVideoFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleVideoFileUpload(e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-border/80 hover:border-red-500/60 bg-card/40 hover:bg-card/70 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Click to upload a video file (.mp4, .webm, .mov)</p>
                      <p className="text-[11px] text-muted-foreground">Plays directly in the video player with timestamp sync</p>
                    </div>
                  </div>

                  {localVideoUrl && (
                    <div className="p-3 bg-secondary/60 rounded-xl border border-border/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Local video loaded and ready</span>
                      </span>
                      <button
                        onClick={() => {
                          if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
                          setLocalVideoUrl(null);
                        }}
                        className="text-muted-foreground hover:text-red-500 text-[11px] font-semibold cursor-pointer"
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Paste Text Area */}
              {uploadSubTab === 'paste' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Optional title (e.g. My Presentation / Lesson)"
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:border-red-500 focus:outline-none"
                  />
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={4}
                    placeholder="Paste subtitle text, SRT format, or transcript lines (e.g. '01:25 Hello world' or standard paragraph)..."
                    className="w-full p-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:border-red-500 focus:outline-none font-mono"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleParseManualText}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Load Transcript</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Results View */}
      {data && (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          {/* Header Info & Actions Toolbar */}
          <div className="card-ambient p-4 rounded-2xl border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground truncate max-w-xs">{data.author || 'YouTube Video'}</span>
                {data.videoId && data.videoId.length === 11 && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-[11px]">ID: {data.videoId}</span>
                  </>
                )}
                <span>·</span>
                <span className="tabular-nums font-semibold">{data.linesCount} lines</span>
              </div>
              <h2 className="text-base font-bold text-foreground leading-snug truncate">
                {data.videoTitle || 'YouTube Video Transcript'}
              </h2>
            </div>

            {/* Language Selector & Export Suite */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Language Dropdown Selector */}
              {data.availableLanguages && data.availableLanguages.length > 0 && (
                <div className="relative">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border/80 text-xs font-medium">
                    <Languages className="w-3.5 h-3.5 text-primary" />
                    <select
                      value={data.languageCode}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={switchingLang}
                      className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none cursor-pointer pr-1"
                    >
                      {data.availableLanguages.map((lang, idx) => (
                        <option key={idx} value={lang.languageCode} className="bg-card text-foreground">
                          {lang.label} ({lang.languageCode})
                        </option>
                      ))}
                    </select>
                    {switchingLang && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
                  </div>
                </div>
              )}

              {/* Copy plain vs timestamped */}
              <button
                type="button"
                onClick={() => handleCopy('plain')}
                className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-border/60"
                title="Copy clean paragraph without timestamps"
              >
                {copiedFormat === 'plain' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copiedFormat === 'plain' ? 'Copied Text' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy('timestamps')}
                className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-border/60"
                title="Copy with timestamps"
              >
                {copiedFormat === 'timestamps' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copiedFormat === 'timestamps' ? 'Copied Timestamps' : 'With Timestamps'}</span>
              </button>

              {/* Export Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-30 p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-100">
                    <button
                      onClick={handleDownloadTxt}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-secondary flex items-center gap-2 text-foreground cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Plain Text (.txt)</span>
                    </button>
                    <button
                      onClick={handleDownloadSrt}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-secondary flex items-center gap-2 text-foreground cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>SubRip Subtitles (.srt)</span>
                    </button>
                    <button
                      onClick={handleDownloadVtt}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-secondary flex items-center gap-2 text-foreground cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WebVTT Subtitles (.vtt)</span>
                    </button>
                    <button
                      onClick={handleDownloadMarkdown}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-secondary flex items-center gap-2 text-foreground cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Markdown (.md)</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleSaveToDrive}
                      disabled={savingDrive}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-secondary flex items-center gap-2 text-primary cursor-pointer disabled:opacity-50"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>{savingDrive ? 'Saving...' : 'Save to Google Drive'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Player & Transcript Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Player Column (Only shown for YouTube videos or when local video is uploaded) */}
            {(data.videoId?.length === 11 || localVideoUrl) && (
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                  {/* Player Top Bar */}
                  <div className="p-3 bg-secondary/50 border-b border-border/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-red-600 fill-current" />
                      <span>{localVideoUrl ? 'Local Video Player' : 'Synchronized Video Player'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPlayer(!showPlayer)}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                    >
                      {showPlayer ? 'Hide Video' : 'Show Video'}
                    </button>
                  </div>

                  {/* Player Body */}
                  {showPlayer && (
                    <div className="aspect-video w-full bg-black relative">
                      {localVideoUrl ? (
                        <video
                          ref={videoElementRef}
                          src={localVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                          onTimeUpdate={() => {
                            if (videoElementRef.current) {
                              setActivePlaybackTime(videoElementRef.current.currentTime);
                            }
                          }}
                        />
                      ) : (
                        <iframe
                          key={`${data.videoId}-${playerSeekTime}`}
                          src={`https://www.youtube-nocookie.com/embed/${data.videoId}?start=${playerSeekTime}&autoplay=${playerPlaying ? 1 : 0}&playsinline=1&rel=0`}
                          title={data.videoTitle || 'YouTube Video'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          className="w-full h-full border-none"
                        />
                      )}
                    </div>
                  )}

                  {/* Direct Watch / Seek Controls Bar */}
                  <div className="p-3 space-y-2.5 text-xs bg-card/60">
                    {/* Direct Watch on YouTube Quick-Action */}
                    {data.videoId?.length === 11 && (
                      <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Play Directly on YouTube</span>
                          </span>
                          <span className="font-mono text-[11px] font-bold text-red-600 dark:text-red-400 tabular-nums">
                            {formatTimestamp(playerSeekTime)}
                          </span>
                        </div>

                        <a
                          href={youtubeWatchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>Watch on YouTube App/Web at {formatTimestamp(playerSeekTime)}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Notice: If YouTube displays a TV graphic above ("Playback disabled by owner"), click the red button to watch directly on YouTube at this exact moment.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <span>Tap any transcript line to jump:</span>
                      {activePlaybackTime !== null && (
                        <span className="font-mono font-bold text-primary tabular-nums">
                          Jumped to {formatTimestamp(activePlaybackTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Info Summary Box */}
                <div className="card-ambient p-4 rounded-2xl border border-border/80 space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground">Transcript Metrics</span>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div className="p-2 rounded-xl bg-secondary/60 border border-border/40">
                      <p className="text-[10px] text-muted-foreground uppercase">Language</p>
                      <p className="font-bold text-foreground text-xs truncate">{data.languageName}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-secondary/60 border border-border/40">
                      <p className="text-[10px] text-muted-foreground uppercase">Word Count</p>
                      <p className="font-bold text-foreground text-xs">{data.fullParagraph.split(/\s+/).length} words</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript Viewer Column */}
            <div className={(data.videoId?.length === 11 || localVideoUrl) ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[70vh]">
                {/* Search Bar Toolbar */}
                <div className="p-3 bg-secondary/30 border-b border-border/60 flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search within transcript (e.g. key words, phrases)..."
                      className="w-full h-8 pl-8 pr-7 rounded-lg border border-border/60 bg-card text-xs font-medium focus:outline-none focus:border-red-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {searchQuery && (
                    <span className="text-xs font-bold text-primary shrink-0 tabular-nums">
                      {filteredLines.length} match{filteredLines.length === 1 ? '' : 'es'}
                    </span>
                  )}
                </div>

                {/* Scrollable Dialogue List */}
                <div 
                  ref={transcriptContainerRef}
                  className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 scrollbar-thin"
                >
                  {filteredLines.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <Search className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-xs font-semibold">No matches found for "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-primary hover:underline mt-1 font-semibold cursor-pointer"
                      >
                        Clear search query
                      </button>
                    </div>
                  ) : (
                    filteredLines.map((line, idx) => {
                      const isActive = activePlaybackTime !== null && 
                        activePlaybackTime >= line.start && 
                        activePlaybackTime < line.start + (line.duration || 3);

                      // Search text highlighter
                      let renderedText: React.ReactNode = line.text;
                      if (searchQuery.trim()) {
                        const parts = line.text.split(new RegExp(`(${searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
                        renderedText = parts.map((part, i) => 
                          part.toLowerCase() === searchQuery.toLowerCase().trim() ? (
                            <mark key={i} className="bg-amber-300/40 text-foreground dark:bg-amber-500/40 px-0.5 rounded">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        );
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSeekToTime(line.start)}
                          className={`group flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'hover:bg-secondary/60 border-transparent hover:border-border/40'
                          }`}
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 tabular-nums border border-border/60"
                          >
                            <Play className="w-2.5 h-2.5 fill-current opacity-80" />
                            <span>{line.timestamp}</span>
                          </button>

                          <p className="text-xs font-normal text-foreground leading-relaxed pt-0.5 flex-1 select-text">
                            {renderedText}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeTranscriptTool;
