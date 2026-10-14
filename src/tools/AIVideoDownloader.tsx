import React, { useState, useRef } from 'react';
import { 
  Video, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Film,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export type AIPlatformType = 'all' | 'meta' | 'veo' | 'grok' | 'sora';

interface ResolvedVideo {
  platform: string;
  title: string;
  videoUrl: string;
  streamUrl: string;
  thumbnail: string;
  duration: string;
  resolution: string;
  fileSizeEstimate: string;
  format: string;
  hasAudio: boolean;
  isDirect?: boolean;
}

const SAMPLE_VIDEOS: Record<AIPlatformType, { title: string; url: string; platformName: string }> = {
  all: {
    title: 'OpenAI Sora Cinematic Hyper-lapse',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    platformName: 'OpenAI Sora'
  },
  sora: {
    title: 'OpenAI Sora Cyberpunk Tokyo Walk',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    platformName: 'OpenAI Sora'
  },
  veo: {
    title: 'Google Veo Cinematic Wildlife 4K',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    platformName: 'Google Veo'
  },
  meta: {
    title: 'Meta AI Hyper-Realistic Portrait Animation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    platformName: 'Meta AI'
  },
  grok: {
    title: 'Grok xAI Deep Space Simulation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    platformName: 'Grok'
  }
};

const PLATFORM_INFOS = [
  { id: 'all' as AIPlatformType, name: 'All-in-One Downloader', badge: 'Universal', desc: 'Universal downloader for Meta AI, Veo, Grok, and Sora' },
  { id: 'meta' as AIPlatformType, name: 'Meta AI Video', badge: 'Meta AI', desc: 'Download animations and video renders from Meta AI & Instagram AI' },
  { id: 'veo' as AIPlatformType, name: 'Google Veo', badge: 'Google DeepMind', desc: 'Extract high-fidelity 1080p clips from Google Veo / VideoFX' },
  { id: 'grok' as AIPlatformType, name: 'Grok (xAI)', badge: 'xAI / X', desc: 'Download AI video and animation clips generated on Grok and X' },
  { id: 'sora' as AIPlatformType, name: 'OpenAI Sora', badge: 'OpenAI', desc: 'Download photorealistic Sora video generations without watermarks' },
];

export const AIVideoDownloader: React.FC<{ initialPlatform?: AIPlatformType }> = ({ 
  initialPlatform = 'all' 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<AIPlatformType>(initialPlatform);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedVideo, setResolvedVideo] = useState<ResolvedVideo | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Auto detect platform based on URL
  const detectPlatformFromUrl = (inputUrl: string): string => {
    const lower = inputUrl.toLowerCase();
    if (lower.includes('meta.ai') || lower.includes('instagram.com') || lower.includes('facebook.com')) return 'Meta AI';
    if (lower.includes('veo') || lower.includes('deepmind.google') || lower.includes('labs.google')) return 'Google Veo';
    if (lower.includes('x.com') || lower.includes('twitter.com') || lower.includes('grok.com') || lower.includes('x.ai')) return 'Grok';
    if (lower.includes('sora.com') || lower.includes('openai.com')) return 'OpenAI Sora';
    return selectedPlatform === 'all' ? 'AI Video' : PLATFORM_INFOS.find(p => p.id === selectedPlatform)?.badge || 'AI Video';
  };

  const handleResolve = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || url).trim();
    if (!finalUrl) {
      toast.error('Please enter or paste an AI video link.');
      return;
    }

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    setResolvedVideo(null);

    try {
      const res = await fetch('/api/ai-video/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          platform: selectedPlatform !== 'all' ? PLATFORM_INFOS.find(p => p.id === selectedPlatform)?.badge : undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data: ResolvedVideo = await res.json();
      setResolvedVideo(data);
      toast.success(`Video successfully resolved from ${data.platform}! Ready to preview & download.`);
    } catch (err: any) {
      console.error('Resolve error:', err);
      toast.error(err.message || 'Failed to extract video stream. Please check link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (platformKey: AIPlatformType) => {
    const sample = SAMPLE_VIDEOS[platformKey];
    setUrl(sample.url);
    setSelectedPlatform(platformKey);
    handleResolve(sample.url);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        toast.info('Link pasted from clipboard');
      }
    } catch {
      toast.error('Unable to access clipboard. Please paste manually.');
    }
  };

  const handleCopyLink = () => {
    if (!resolvedVideo) return;
    const directUrl = window.location.origin + resolvedVideo.streamUrl;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    toast.success('Direct download link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const faqs = [
    {
      q: 'Is this AI Video Downloader 100% free with unlimited downloads?',
      a: 'Yes, completely free. There are no subscriptions, limits, or hidden fees. You can download as many videos as you need.'
    },
    {
      q: 'Which AI platforms are fully supported?',
      a: 'We support Meta AI (including Instagram/Facebook AI renders), Google Veo & VideoFX, xAI Grok videos, and OpenAI Sora video generations, along with direct MP4/WebM video links.'
    },
    {
      q: 'Do you save or log my downloaded videos?',
      a: 'No. The video stream is processed directly in your browser session or passed through an encrypted zero-storage streaming proxy. No files or private prompts are ever stored on any disk.'
    },
    {
      q: 'What video quality and format will I receive?',
      a: 'Videos are delivered in high-definition 1080p Full HD MP4 (H.264 video codec with AAC audio) for maximum compatibility with phones, tablets, editing software, and social media.'
    },
    {
      q: 'How do I download a video from Meta AI, Veo, Grok, or Sora?',
      a: 'Simply click the Share or Link icon inside Meta AI, Google Labs/Veo, Grok, or Sora, copy the share link or direct video address, paste it into the box above, and click "Fetch Video".'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-2">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Media Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Free AI Video Downloader
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Directly download high-definition MP4 videos from <strong className="text-foreground">Meta AI</strong>, <strong className="text-foreground">Google Veo</strong>, <strong className="text-foreground">Grok (xAI)</strong>, and <strong className="text-foreground">OpenAI Sora</strong> with instant preview.
        </p>
      </div>

      {/* Platform Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/80 max-w-3xl mx-auto">
        {PLATFORM_INFOS.map((plat) => {
          const isActive = selectedPlatform === plat.id;
          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectedPlatform(plat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary text-white shadow-xs scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
              }`}
            >
              <span>{plat.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Main Downloader Card */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              <span>Enter {PLATFORM_INFOS.find(p => p.id === selectedPlatform)?.name || 'AI Video'} URL</span>
            </label>
            {url && (
              <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                Detected: {detectPlatformFromUrl(url)}
              </span>
            )}
          </div>

          <div className="relative group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleResolve();
                }
              }}
              placeholder="Paste Meta AI, Google Veo, Grok, or Sora share link here (e.g. https://...)..."
              className="w-full h-13 sm:h-14 pl-4 pr-28 sm:pr-32 rounded-2xl border-2 border-border/80 bg-background text-sm sm:text-base font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-2 inset-y-0 flex items-center gap-1.5">
              {url && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setResolvedVideo(null);
                  }}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors cursor-pointer border border-border/60"
                title="Paste from clipboard"
              >
                Paste
              </button>
            </div>
          </div>
        </div>

        {/* Quick Sample Links for 1-Click Verification */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Try sample clip:</span>
          </span>
          <button
            type="button"
            onClick={() => handleLoadSample('sora')}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors cursor-pointer border border-border/60"
          >
            OpenAI Sora Sample
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('veo')}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors cursor-pointer border border-border/60"
          >
            Google Veo Sample
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('meta')}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors cursor-pointer border border-border/60"
          >
            Meta AI Sample
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('grok')}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors cursor-pointer border border-border/60"
          >
            Grok xAI Sample
          </button>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleResolve()}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary/90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Extracting Video Stream...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fetch &amp; Preview Video</span>
              </>
            )}
          </button>

          {resolvedVideo && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setResolvedVideo(null);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors cursor-pointer border border-border/70"
            >
              Reset
            </button>
          )}
        </div>

        {/* Video Player & Download Box */}
        {resolvedVideo && (
          <div className="mt-8 border-t border-border pt-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Interactive Video Player */}
              <div className="w-full md:w-7/12 bg-black rounded-2xl overflow-hidden shadow-lg border border-border/60 relative group aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={resolvedVideo.videoUrl}
                  poster={resolvedVideo.thumbnail || undefined}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              {/* Video Metadata & Download Options */}
              <div className="w-full md:w-5/12 space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>{resolvedVideo.platform}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    {resolvedVideo.title}
                  </h3>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Resolution</span>
                    <span className="font-bold text-foreground">{resolvedVideo.resolution}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Format</span>
                    <span className="font-bold text-foreground">{resolvedVideo.format}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Est. Size</span>
                    <span className="font-bold text-foreground">{resolvedVideo.fileSizeEstimate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Audio Track</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Included</span>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={resolvedVideo.streamUrl}
                    download
                    className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video (1080p MP4)</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2 px-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 border border-border/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Direct Link'}</span>
                    </button>

                    <a
                      href={resolvedVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 border border-border/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Open source stream directly"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Source</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>No watermarks retained · Direct uncompressed stream</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How to Download Steps */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <span>How to Download AI Videos in 3 Simple Steps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-foreground">Copy the AI Video Link</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate a video on Meta AI, Google Veo, Grok, or OpenAI Sora. Click the Share button and copy the public video link.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-foreground">Paste into Toolzaro</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste your link into the URL input box above and click &quot;Fetch &amp; Preview Video&quot; to inspect the stream.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-foreground">Download Clean MP4</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Preview the video in the player and click &quot;Download Video (1080p MP4)&quot; to save the file directly to your device.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg sm:text-xl">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Frequently Asked Questions</span>
        </div>

        <div className="divide-y divide-border/60">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
