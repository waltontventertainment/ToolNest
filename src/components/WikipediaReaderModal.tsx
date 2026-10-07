import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Volume2, VolumeX, BookOpen, Sparkles, AlertTriangle, ArrowLeft, ChevronRight, Type, Download } from 'lucide-react';
import { toast } from 'sonner';

interface WikipediaReaderModalProps {
  title: string | null;
  isOpen: boolean;
  lang: 'en' | 'bn';
  onClose: () => void;
}

interface WikiHtmlContentProps {
  html: string;
}

const WikiHtmlContent: React.FC<WikiHtmlContentProps> = React.memo(({ html }) => {
  return (
    <div 
      className="wiki-styled-content prose prose-sm dark:prose-invert max-w-none leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
WikiHtmlContent.displayName = 'WikiHtmlContent';

export const WikipediaReaderModal: React.FC<WikipediaReaderModalProps> = ({ title, isOpen, lang, onClose }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [textSize, setTextSize] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'>('base');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (isOpen && title) {
      setCurrentTitle(title);
      setHistory([title]);
      loadArticle(title);
    } else {
      stopSpeech();
      setHtmlContent('');
      setTextSize('base'); // Reset font size when reader closes
      setHistory([]);
    }
  }, [isOpen, title]);

  const loadArticle = async (articleTitle: string) => {
    setLoading(true);
    setHtmlContent('');
    stopSpeech();
    try {
      // Fetch full parsed article from Wikipedia MediaWiki API
      const res = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
          articleTitle
        )}&prop=text|sections&format=json&origin=*`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.parse?.text?.['*']) {
          let rawHtml = data.parse.text['*'];

          // Clean Wikipedia's protocol-relative image URLs (//upload.wikimedia.org -> https://upload.wikimedia.org)
          rawHtml = rawHtml.replace(/src="\/\//g, 'src="https://');
          rawHtml = rawHtml.replace(/srcset="\/\//g, 'srcset="https://');

          setHtmlContent(rawHtml);
          if (contentRef.current) {
            contentRef.current.scrollTop = 0;
          }
        } else if (data.error?.info) {
          throw new Error(data.error.info);
        } else {
          throw new Error('Article content could not be parsed.');
        }
      } else {
        throw new Error('Wikipedia network response was not successful.');
      }
    } catch (err: any) {
      console.error(err);
      setHtmlContent(
        `<div class="p-6 text-center text-muted-foreground">
          <p class="font-bold text-red-500 flex items-center justify-center gap-2 mb-2">
            ⚠️ Content Loading Failed
          </p>
          <p class="text-xs">${err.message || 'The full text of this article is currently unavailable.'}</p>
        </div>`
      );
    } finally {
      setLoading(false);
    }
  };

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlayingSpeech(false);
  };

  const toggleSpeech = () => {
    if (!synthRef.current) return;

    if (isPlayingSpeech) {
      stopSpeech();
      return;
    }

    if (!contentRef.current) return;

    // Get plain text of the article
    const textToSpeak = contentRef.current.innerText
      .replace(/\[\d+\]/g, '') // remove reference numbers like [1]
      .substring(0, 3000); // limit to 3000 chars for speech synthesis to avoid buffer issues

    if (!textToSpeak.trim()) {
      toast.error('No readable text to speak.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    
    // Choose voice matching language if available
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsPlayingSpeech(false);
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
    };

    utteranceRef.current = utterance;
    setIsPlayingSpeech(true);
    synthRef.current.speak(utterance);
    toast.success(lang === 'bn' ? 'আর্টিকেলটি পড়ে শুনানো হচ্ছে...' : 'Reading article aloud...');
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const prev = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentTitle(prev);
      loadArticle(prev);
    }
  };

  // Intercept Wikipedia Internal Links click to load them inside our reader!
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      // Relative wiki links (e.g., /wiki/Albert_Einstein)
      if (href && href.startsWith('/wiki/') && !href.includes(':')) {
        e.preventDefault();
        const nextTitle = decodeURIComponent(href.substring(6)).replace(/_/g, ' ');
        setHistory(prev => [...prev, nextTitle]);
        setCurrentTitle(nextTitle);
        loadArticle(nextTitle);
      } else {
        // External links should open in a new tab
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    }
  };

  const handleDownload = () => {
    if (!contentRef.current) return;
    const plainText = `Wikipedia Article: ${currentTitle}\nLanguage: ${lang === 'bn' ? 'Bengali' : 'English'}\n\n` + 
                      contentRef.current.innerText;
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTitle.replace(/\s+/g, '_')}_Article.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded article plain text successfully!');
  };

  const getFontSizePx = () => {
    if (textSize === 'xs') return '11px';
    if (textSize === 'sm') return '13px';
    if (textSize === 'base') return '15px';
    if (textSize === 'lg') return '18px';
    if (textSize === 'xl') return '22px';
    if (textSize === '2xl') return '26px';
    return '15px';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex justify-end z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-background border-l border-border h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Reader Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {history.length > 1 && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-lg bg-card hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Go back to previous article"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  {lang === 'bn' ? 'উইকিপিডিয়া ফুল রিডার' : 'Wikipedia Native Reader'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground truncate max-w-xs sm:max-w-md">
                {currentTitle}
              </h3>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Text Size Controls */}
            <div className="flex items-center bg-card rounded-lg border border-border/80 px-1.5 py-1">
              <button
                onClick={() => {
                  if (textSize === '2xl') setTextSize('xl');
                  else if (textSize === 'xl') setTextSize('lg');
                  else if (textSize === 'lg') setTextSize('base');
                  else if (textSize === 'base') setTextSize('sm');
                  else if (textSize === 'sm') setTextSize('xs');
                }}
                className="p-1 text-xs hover:text-blue-500 font-bold cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <Type className="w-3.5 h-3.5 text-muted-foreground mx-1" />
              <button
                onClick={() => {
                  if (textSize === 'xs') setTextSize('sm');
                  else if (textSize === 'sm') setTextSize('base');
                  else if (textSize === 'base') setTextSize('lg');
                  else if (textSize === 'lg') setTextSize('xl');
                  else if (textSize === 'xl') setTextSize('2xl');
                }}
                className="p-1 text-xs hover:text-blue-500 font-bold cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                isPlayingSpeech
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title={isPlayingSpeech ? "Stop Speech Synthesis" : "Read Article Aloud (TTS)"}
            >
              {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Download Plain Text Article"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* View Source external */}
            <a
              href={`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(currentTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              title="View original on Wikipedia"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/15 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Body / Content Scrollable Area */}
        <div 
          ref={contentRef}
          onClick={handleContentClick}
          className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs py-24">
              <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching parsed full content from Wikipedia API...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Native styled article container wrapper */}
              <div style={{ '--wiki-font-size': getFontSizePx() } as React.CSSProperties}>
                <WikiHtmlContent html={htmlContent} />
              </div>
              
              {/* Attribution */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground tracking-tight">
                <span>Article Reader • Interactive Browser Engine v2.0</span>
                <span className="italic">
                  Source: Wikipedia (CC BY-SA 3.0)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom styled Wikipedia HTML support rules */}
      <style>{`
        .wiki-styled-content .mw-empty-elt {
          display: none !important;
        }
        
        /* ---------------------------------------------------- */
        /* LIGHT & DARK UNIVERSAL RESET RULES FOR HIGH CONTRAST */
        /* ---------------------------------------------------- */
        
        /* Force pixel-perfect font resizing via custom CSS variable */
        .wiki-styled-content,
        .wiki-styled-content p,
        .wiki-styled-content span,
        .wiki-styled-content li,
        .wiki-styled-content td,
        .wiki-styled-content th,
        .wiki-styled-content a {
          font-size: var(--wiki-font-size, 14.5px) !important;
        }

        /* Default light mode high contrast text */
        .wiki-styled-content {
          color: #171717 !important; /* neutral-900 */
        }
        
        /* High contrast tables & infoboxes in light mode */
        .wiki-styled-content .infobox, 
        .wiki-styled-content table,
        .wiki-styled-content table.ambox, 
        .wiki-styled-content table.metadata {
          background-color: #f8fafc !important; /* solid slate-50 */
          background: #f8fafc !important;
          color: #171717 !important;
          border: 1px solid #cbd5e1 !important; /* slate-300 */
          border-collapse: collapse !important;
          border-radius: 12px !important;
          padding: 12px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        /* Force transparent backgrounds on rows and cells in light mode so they inherit the solid table bg, preventing patchy alternating rows! */
        .wiki-styled-content td,
        .wiki-styled-content tr {
          background-color: transparent !important;
          background: transparent !important;
          color: #171717 !important;
          border-color: #e2e8f0 !important; /* slate-200 dividers */
        }
        
        .wiki-styled-content th {
          background-color: #f1f5f9 !important; /* slate-100 header */
          background: #f1f5f9 !important;
          color: #0f172a !important; /* slate-900 */
          font-weight: 800 !important;
          border-color: #cbd5e1 !important;
        }

        /* Dark Mode Overrides (when body/html has .dark class) */
        .dark .wiki-styled-content {
          color: #f3f4f6 !important; /* gray-100 */
        }
        
        /* Reset inline hardcoded color styles from Wikipedia in dark mode to ensure high readability */
        .dark .wiki-styled-content *:not(a):not(th):not(.reference) {
          color: #e5e7eb !important; /* gray-200 */
        }
        
        /* Force single, solid neutral-900 background for tables and infoboxes in dark mode */
        .dark .wiki-styled-content table,
        .dark .wiki-styled-content .infobox,
        .dark .wiki-styled-content table.ambox,
        .dark .wiki-styled-content table.metadata {
          background-color: #171717 !important; /* solid neutral-900 */
          background: #171717 !important;
          color: #e5e7eb !important; /* gray-200 */
          border: 1px solid #2e2e2e !important; /* neutral-800 */
          border-radius: 12px !important;
          padding: 12px !important;
        }
        
        /* Force transparent backgrounds on rows and cells in dark mode so they inherit the solid table bg, completely eliminating patchy zebra strips! */
        .dark .wiki-styled-content td,
        .dark .wiki-styled-content tr,
        .dark .wiki-styled-content div,
        .dark .wiki-styled-content li,
        .dark .wiki-styled-content caption {
          background-color: transparent !important;
          background: transparent !important;
          color: #e5e7eb !important; /* gray-200 */
          border-color: #262626 !important; /* neutral-850 dividers */
        }
        
        .dark .wiki-styled-content th {
          background-color: #262626 !important; /* neutral-800 header */
          background: #262626 !important;
          color: #ffffff !important;
          border-color: #1a1a1a !important;
        }
        
        .dark .wiki-styled-content a {
          color: #60a5fa !important; /* light blue */
          text-shadow: none !important;
        }
        
        .dark .wiki-styled-content a:hover {
          color: #93c5fd !important;
        }

        .wiki-styled-content table {
          display: block;
          width: 100% !important;
          overflow-x: auto !important;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .wiki-styled-content a {
          color: rgb(59, 130, 246) !important;
          text-decoration: none !important;
          font-weight: 700 !important;
        }
        
        .wiki-styled-content a:hover {
          text-decoration: underline !important;
        }
        
        .wiki-styled-content .thumb {
          margin: 15px 0 !important;
          float: none !important;
          text-align: center !important;
        }
        
        .wiki-styled-content .thumbinner {
          display: inline-block !important;
          max-width: 100% !important;
          background-color: var(--color-card) !important;
          border: 1px solid var(--color-border) !important;
          border-radius: 12px !important;
          padding: 8px !important;
        }
        
        .wiki-styled-content img {
          border-radius: 8px !important;
          margin: 0 auto !important;
          max-width: 100% !important;
          height: auto !important;
        }
        
        .wiki-styled-content h1, 
        .wiki-styled-content h2, 
        .wiki-styled-content h3 {
          font-family: var(--font-display) !important;
          font-weight: 900 !important;
          letter-spacing: -0.025em !important;
          color: var(--color-foreground) !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
          border-bottom: 1px solid var(--color-border) !important;
          padding-bottom: 4px !important;
        }
        
        .wiki-styled-content h2 {
          font-size: 1.35em !important;
        }
        
        .wiki-styled-content h3 {
          font-size: 1.15em !important;
        }
        
        .wiki-styled-content ul, .wiki-styled-content ol {
          margin-left: 20px !important;
          margin-bottom: 15px !important;
          list-style-type: disc !important;
        }
        
        .wiki-styled-content li {
          margin-bottom: 4px !important;
        }
        
        .wiki-styled-content p {
          margin-bottom: 12px !important;
          line-height: 1.625 !important;
        }
        
        .wiki-styled-content .reference {
          font-size: 9px !important;
          vertical-align: super !important;
          font-weight: bold !important;
          margin-left: 2px !important;
        }
        
        .wiki-styled-content .navbox, 
        .wiki-styled-content .hatnote, 
        .wiki-styled-content .printfooter {
          display: none !important;
        }
      `}</style>
    </div>
  );
};
