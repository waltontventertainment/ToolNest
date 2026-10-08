import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { WikipediaReaderModal } from '../components/WikipediaReaderModal';

interface WikiSummary {
  title: string;
  displaytitle: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop?: {
      page: string;
    };
  };
  description?: string;
}

export const WikipediaSummarizer: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WikiSummary | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [readerArticle, setReaderArticle] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search topic');
      return;
    }
    setSearchLoading(true);
    setSearchResults([]);
    setSelectedArticle(null);

    try {
      const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=1&format=json&origin=*`);
      if (res.ok) {
        const data = await res.json();
        if (data.query?.search) {
          setSearchResults(data.query.search);
          if (data.query.search.length === 0) {
            toast.info('No matching Wikipedia articles found.');
          }
        }
      } else {
        throw new Error('Wikipedia search failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch articles. Please check your internet connection.');
    } finally {
      setSearchLoading(false);
    }
  };

  const selectArticle = async (title: string) => {
    setArticleLoading(true);
    setSelectedArticle(null);
    try {
      const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedArticle(data);
      } else {
        throw new Error('Failed to fetch summary');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load article details.');
    } finally {
      setArticleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-bold text-blue-600 dark:text-blue-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wikipedia Article & Summary Explorer</span>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border/50 shrink-0">
            <button
              onClick={() => { setLang('en'); toast.success('Language switched to English'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => { setLang('bn'); toast.success('ভাষা পরিবর্তন করা হয়েছে (বাংলা)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'bn' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 bg-card border border-border/80 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            <span>{lang === 'bn' ? 'আর্টিকেল অনুসন্ধান' : 'Search Articles'}</span>
          </h3>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'bn' ? 'যেকোনো বিষয় লিখুন...' : 'Enter keyword (e.g. Einstein, Physics)'}
              className="w-full h-11 pl-4 pr-12 rounded-xl border border-border/80 bg-card focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {searchLoading && (
              <div className="text-center py-6 text-muted-foreground text-xs flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            )}

            {searchResults.map((item) => (
              <button
                key={item.pageid}
                onClick={() => selectArticle(item.title)}
                className="w-full text-left p-3 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-blue-500/30 transition-all group flex items-start justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 truncate transition-colors">
                    {item.title}
                  </h4>
                  <p 
                    className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.snippet + '...' }}
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          {articleLoading && (
            <div className="bg-card border border-border/80 rounded-2xl p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching summary details from Wikipedia API...</span>
            </div>
          )}

          {!articleLoading && !selectedArticle && (
            <div className="bg-card border border-border/80 rounded-2xl p-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 text-muted-foreground/45 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-foreground">
                {lang === 'bn' ? 'কোনো আর্টিকেল সিলেক্ট করা নেই' : 'No Article Selected'}
              </h4>
              <p className="text-xs mt-1">
                {lang === 'bn' ? 'বাম পাশের সার্চ বক্স ব্যবহার করে আর্টিকেল সিলেক্ট করুন।' : 'Search for a topic on the left and select an article to read the summary and generate facts.'}
              </p>
            </div>
          )}

          {selectedArticle && (
            <div className="space-y-4 animate-in fade-in-0 duration-150">
              <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row gap-5">
                  {selectedArticle.thumbnail && (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted">
                      <img 
                        src={selectedArticle.thumbnail.source} 
                        alt={selectedArticle.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2 min-w-0 flex-1">
                    <h3 className="text-lg font-black text-foreground leading-tight">
                      {selectedArticle.title}
                    </h3>
                    {selectedArticle.description && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                        {selectedArticle.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedArticle.extract}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                      <button
                        onClick={() => handleCopyText(selectedArticle.extract, 'wiki_sum')}
                        className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all flex items-center gap-1 cursor-pointer border border-border"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                        <span>{lang === 'bn' ? 'কপি করুন' : 'Copy Summary'}</span>
                      </button>
                      <button
                        onClick={() => setReaderArticle(selectedArticle.title)}
                        className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-500/20"
                      >
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>{lang === 'bn' ? 'সম্পূর্ণ আর্টিকেল পড়ুন' : 'Read Full Article'}</span>
                      </button>
                      {selectedArticle.content_urls?.desktop && (
                        <a
                          href={selectedArticle.content_urls.desktop.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold transition-all flex items-center gap-1 border border-blue-500/20"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'উইকিপিডিয়ায় দেখুন' : 'View on Wikipedia'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <WikipediaReaderModal
        title={readerArticle}
        isOpen={readerArticle !== null}
        lang={lang}
        onClose={() => setReaderArticle(null)}
      />
    </div>
  );
};
