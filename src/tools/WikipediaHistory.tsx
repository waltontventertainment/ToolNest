import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Search,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { WikipediaReaderModal } from '../components/WikipediaReaderModal';

interface HistoryEvent {
  year: number;
  text: string;
  pages: any[];
}

export const WikipediaHistory: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [historyMonth, setHistoryMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [historyDay, setHistoryDay] = useState<number>(() => new Date().getDate());
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [historyBirths, setHistoryBirths] = useState<HistoryEvent[]>([]);
  const [historyDeaths, setHistoryDeaths] = useState<HistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySubTab, setHistorySubTab] = useState<'events' | 'births' | 'deaths'>('events');
  const [readerArticle, setReaderArticle] = useState<string | null>(null);

  const fetchOnThisDay = async () => {
    setHistoryLoading(true);
    setHistoryEvents([]);
    setHistoryBirths([]);
    setHistoryDeaths([]);
    try {
      // Wikipedia onthisday feed works in English
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${String(historyMonth).padStart(2, '0')}/${String(historyDay).padStart(2, '0')}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryEvents(data.selected || []);
        setHistoryBirths(data.births || []);
        setHistoryDeaths(data.deaths || []);
      } else {
        throw new Error('Failed to fetch calendar events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve history items.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchOnThisDay();
  }, [historyMonth, historyDay]);

  return (
    <div className="space-y-6">
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Wikipedia History Engine</span>
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

      <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">
              {lang === 'bn' ? 'ইতিহাসের টাইমলাইন এক্সপ্লোরার' : 'History Timeline Selector'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <select
              value={historyMonth}
              onChange={(e) => setHistoryMonth(Number(e.target.value))}
              className="h-10 px-2 rounded-xl border border-border/80 bg-card text-xs focus:border-blue-500 focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1, 1).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={historyDay}
              onChange={(e) => setHistoryDay(Number(e.target.value))}
              className="h-10 px-2 rounded-xl border border-border/80 bg-card text-xs focus:border-blue-500 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              onClick={fetchOnThisDay}
              disabled={historyLoading}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 max-w-xs">
          <button
            onClick={() => setHistorySubTab('events')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              historySubTab === 'events' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setHistorySubTab('births')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              historySubTab === 'births' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Births
          </button>
          <button
            onClick={() => setHistorySubTab('deaths')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              historySubTab === 'deaths' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Deaths
          </button>
        </div>

        {historyLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Fetching history from Wikipedia API...</span>
          </div>
        )}

        {!historyLoading && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {historySubTab === 'events' && historyEvents.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all flex gap-4 items-start shadow-2xs">
                <span className="text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/25 shrink-0 min-w-[70px] text-center">
                  AD {item.year}
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {item.text}
                  </p>
                  {item.pages && item.pages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                      {item.pages.slice(0, 4).map((p: any) => (
                        <button
                          key={p.pageid}
                          onClick={() => setReaderArticle(p.title)}
                          className="inline-flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                          <span>{p.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {historySubTab === 'births' && historyBirths.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/20 transition-all flex gap-4 items-start shadow-2xs">
                <span className="text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/25 shrink-0 min-w-[70px] text-center">
                  {item.year}
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {item.text}
                  </p>
                  {item.pages && item.pages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                      {item.pages.slice(0, 4).map((p: any) => (
                        <button
                          key={p.pageid}
                          onClick={() => setReaderArticle(p.title)}
                          className="inline-flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{p.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {historySubTab === 'deaths' && historyDeaths.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border hover:border-red-500/20 transition-all flex gap-4 items-start shadow-2xs">
                <span className="text-xs font-black bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl border border-red-500/25 shrink-0 min-w-[70px] text-center">
                  {item.year}
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {item.text}
                  </p>
                  {item.pages && item.pages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                      {item.pages.slice(0, 4).map((p: any) => (
                        <button
                          key={p.pageid}
                          onClick={() => setReaderArticle(p.title)}
                          className="inline-flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-red-500" />
                          <span>{p.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/70 pt-4 text-[10px] text-muted-foreground italic">
          <span>License: Creative Commons Attribution-ShareAlike 3.0</span>
          <span>Source: Wikipedia (CC BY-SA 3.0)</span>
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
