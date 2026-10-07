import React, { useState } from 'react';
import { 
  Globe, BookOpen, CloudSun, QrCode, Image as ImageIcon, 
  Wifi, Smile, GraduationCap, Copy, Check, Download, ExternalLink, Search, Volume2, RefreshCw, Maximize2, ShieldCheck, X
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadBlob } from '../lib/downloadHelper';
import { UniversalDataReaderModal } from '../components/UniversalDataReaderModal';

// 1. Country Info Lookup
export const RestCountriesTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  const fetchCountries = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    const fields = 'name,flags,region,capital,population,currencies,subregion,status,continents,maps,idd,tld,car,unMember,languages,timezones,borders,area';
    const baseUrl = 'https://restcountries.com/v3.1';
    
    const performFetch = async (url: string) => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
        return null;
      } catch (err) {
        throw err;
      }
    };

    try {
      // Attempt 1: Search by name with fields
      let results = await performFetch(`${baseUrl}/name/${encodeURIComponent(searchTerm.trim())}?fields=${fields}`);
      
      // Attempt 2: If no results or 404, try fullText search
      if (!results || results.length === 0) {
        results = await performFetch(`${baseUrl}/name/${encodeURIComponent(searchTerm.trim())}?fullText=true&fields=${fields}`);
      }

      // Attempt 3: If still no results, maybe it's a code? (alpha search)
      if ((!results || results.length === 0) && searchTerm.length <= 3) {
        results = await performFetch(`${baseUrl}/alpha/${encodeURIComponent(searchTerm.trim())}?fields=${fields}`);
        if (results && !Array.isArray(results)) results = [results];
      }

      if (results && results.length > 0) {
        setCountries(results);
      } else {
        setCountries([]);
        toast.error(`Could not find "${searchTerm}". Check spelling or try a partial name.`);
      }
    } catch (err) {
      console.error('RestCountries Error:', err);
      // If it's a TypeError: Failed to fetch, it's likely a network or CORS issue
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        toast.error('Network Error: Could not connect to the country database. This may be due to an ad-blocker or unstable connection.');
      } else {
        toast.error('API connection failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = ['USA', 'Canada', 'United Kingdom', 'Bangladesh', 'India', 'Japan', 'France', 'Australia'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCountries(query)}
            placeholder="Search country (e.g. Canada, Germany)..."
            className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
          />
          <button
            type="button"
            onClick={() => fetchCountries(query)}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Popular:</span>
          {quickLinks.map(q => (
            <button
              key={q}
              onClick={() => { setQuery(q); fetchCountries(q); }}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-amber-500/10 hover:text-amber-600 border border-border text-[10px] font-bold transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {countries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countries.map((c, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedCountry(c)}
              className="p-5 rounded-2xl bg-secondary/50 border border-border space-y-4 shadow-sm hover:border-amber-500/50 cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={c.flags?.svg || c.flags?.png} 
                    alt={c.name?.common} 
                    className="w-16 h-10 object-cover rounded shadow border border-border/60"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-amber-500 transition-colors">{c.name?.common}</h3>
                    <p className="text-xs text-muted-foreground">{c.region} • {c.capital?.[0] || 'N/A'}</p>
                  </div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground block text-[10px]">Population</span>
                  <span className="font-bold text-foreground">{c.population?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground block text-[10px]">Currency</span>
                  <span className="font-bold text-foreground truncate block">
                    {c.currencies ? Object.values(c.currencies).map((cur: any) => cur?.name || 'N/A').join(', ') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && query && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
          <Globe className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">No results found for "{query}". Try a different name.</p>
        </div>
      )}

      <UniversalDataReaderModal
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry?.name?.common || 'Country Details'}
        category="Country Directory"
        content={selectedCountry && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
              <img 
                src={selectedCountry.flags?.svg || selectedCountry.flags?.png} 
                className="w-40 rounded-xl shadow-xl border-4 border-white dark:border-neutral-800" 
                alt="Flag"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black text-foreground leading-tight">{selectedCountry.name?.official || selectedCountry.name?.common}</h2>
                <p className="text-amber-500 font-bold text-lg">{selectedCountry.subregion || selectedCountry.region || 'Global Region'}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold uppercase">{selectedCountry.status || 'Independent'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold uppercase">{selectedCountry.continents?.[0] || 'Continent'}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Capital', value: selectedCountry.capital?.[0] },
                { label: 'Population', value: selectedCountry.population?.toLocaleString() },
                { label: 'Land Area', value: selectedCountry.area ? `${selectedCountry.area.toLocaleString()} km²` : null },
                { label: 'Native Name', value: selectedCountry.name?.nativeName ? Object.values(selectedCountry.name.nativeName).map((n: any) => n.common).join(', ') : null },
                { label: 'Languages', value: selectedCountry.languages ? Object.values(selectedCountry.languages).join(', ') : null },
                { label: 'Currencies', value: selectedCountry.currencies ? Object.values(selectedCountry.currencies).map((cur: any) => `${cur?.name || 'N/A'} (${cur?.symbol || ''})`).join(', ') : null },
                { label: 'Timezones', value: selectedCountry.timezones?.join(', ') },
                { label: 'Borders', value: selectedCountry.borders?.join(', ') || 'None' },
                { label: 'Calling Code', value: selectedCountry.idd?.root ? `${selectedCountry.idd.root}${selectedCountry.idd.suffixes?.[0] || ''}` : 'N/A' },
                { label: 'Top Level Domain', value: selectedCountry.tld?.[0] },
                { label: 'Car Side', value: selectedCountry.car?.side ? selectedCountry.car.side.toUpperCase() : 'N/A' },
                { label: 'UN Member', value: selectedCountry.unMember ? 'Yes' : 'No' },
              ].filter(i => i.value).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center space-y-3">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Geographic Navigation</span>
              <div className="flex gap-4 w-full">
                <a 
                  href={selectedCountry.maps?.googleMaps} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all shadow-md text-xs flex items-center justify-center gap-2"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={selectedCountry.maps?.openStreetMaps} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-foreground font-black hover:bg-muted border border-border transition-all text-xs flex items-center justify-center gap-2"
                >
                  <span>OpenStreetMap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

// 2. Dictionary API
export const LexiconDictionaryTool: React.FC = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReader, setShowReader] = useState(false);

  const fetchDictionary = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data[0] || null);
      } else {
        setResult(null);
        toast.error('Word not found.');
      }
    } catch (err) {
      toast.error('Failed to lookup word.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => toast.error('Audio unavailable.'));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex gap-2">
        <input 
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchDictionary(word)}
          placeholder="Type any word (e.g. Serendipity)..."
          className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
        />
        <button
          type="button"
          onClick={() => fetchDictionary(word)}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Define</span>
        </button>
      </div>

      {result && (
        <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-2xl font-black text-foreground">{result.word}</h3>
              <p className="text-xs text-amber-500 font-mono mt-0.5">{result.phonetic || result.phonetics?.[0]?.text}</p>
            </div>
            <div className="flex items-center gap-2">
              {result.phonetics?.find((p: any) => p.audio) && (
                <button
                  type="button"
                  onClick={() => playAudio(result.phonetics.find((p: any) => p.audio).audio)}
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowReader(true)}
                className="p-3 rounded-xl bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Open in full reader"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Full View</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result.meanings?.slice(0, 2).map((meaning: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {meaning.partOfSpeech}
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-foreground/90 pl-2">
                  {meaning.definitions?.slice(0, 2).map((def: any, dIdx: number) => (
                    <li key={dIdx} className="leading-relaxed">
                      <span>{def.definition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <UniversalDataReaderModal
        isOpen={showReader}
        onClose={() => setShowReader(false)}
        title={`Definition: ${result?.word}`}
        category="Lexicon"
        content={result && (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-4xl font-black text-foreground capitalize">{result.word}</h2>
                <p className="text-lg text-amber-500 font-mono mt-1">{result.phonetic}</p>
              </div>
              {result.phonetics?.find((p: any) => p.audio) && (
                <button
                  type="button"
                  onClick={() => playAudio(result.phonetics.find((p: any) => p.audio).audio)}
                  className="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen</span>
                </button>
              )}
            </div>

            <div className="space-y-10">
              {result.meanings?.map((meaning: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-secondary border border-border text-foreground">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <div className="space-y-6 pl-2">
                    {meaning.definitions?.map((def: any, dIdx: number) => (
                      <div key={dIdx} className="space-y-2 border-l-4 border-amber-500/20 pl-6 py-1">
                        <p className="text-foreground font-medium leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border/50">
                            "{def.example}"
                          </p>
                        )}
                        {def.synonyms?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase pt-1">Synonyms:</span>
                            {def.synonyms.slice(0, 5).map((syn: string, sIdx: number) => (
                              <span key={sIdx} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">{syn}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {result.sourceUrls && (
              <div className="pt-6 border-t border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Sources & References</span>
                <div className="flex flex-col gap-2">
                  {result.sourceUrls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline flex items-center gap-1.5 truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

// 3. Book Search
export const OpenLibraryTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showLiveReader, setShowLiveReader] = useState(false);

  const searchBooks = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        setBooks(Array.isArray(data.docs) ? data.docs : []);
      } else {
        setBooks([]);
        toast.error('No results found.');
      }
    } catch (err) {
      toast.error('Failed to search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex gap-2">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchBooks(query)}
          placeholder="Search book title or author (e.g. Harry Potter)..."
          className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
        />
        <button
          type="button"
          onClick={() => searchBooks(query)}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
      </div>

      {books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map((b, idx) => {
            const coverUrl = b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null;
            return (
              <div 
                key={idx} 
                onClick={() => { setSelectedBook(b); setShowLiveReader(false); }}
                className="p-4 rounded-2xl bg-secondary/50 border border-border flex gap-3 items-start shadow-sm hover:border-amber-500/50 cursor-pointer group transition-all"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={b.title} className="w-16 h-24 object-cover rounded shadow shrink-0 border border-border/60 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-16 h-24 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold">No Cover</div>
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-amber-500 transition-colors">{b.title}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">By {b.author_name?.[0] || 'Unknown Author'}</p>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 block pt-1">{b.first_publish_year || 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UniversalDataReaderModal
        isOpen={!!selectedBook}
        onClose={() => { setSelectedBook(null); setShowLiveReader(false); }}
        title={selectedBook?.title || 'Book Details'}
        category="Library"
        showDownload={false}
        content={selectedBook && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {selectedBook.cover_i ? (
                <img 
                  src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`} 
                  className="w-48 rounded-xl shadow-2xl border-4 border-white dark:border-neutral-800" 
                  alt="Cover" 
                />
              ) : (
                <div className="w-48 h-64 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black">No Cover</div>
              )}
              
              <div className="space-y-4 text-center sm:text-left flex-1">
                <h2 className="text-3xl font-black text-foreground leading-tight">{selectedBook.title}</h2>
                <p className="text-xl font-bold text-amber-500">By {selectedBook.author_name?.join(', ') || 'Unknown Author'}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {selectedBook.first_publish_year && (
                    <span className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold">First Published: {selectedBook.first_publish_year}</span>
                  )}
                  {selectedBook.language?.[0] && (
                    <span className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold uppercase">{selectedBook.language[0]}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Library Keys</span>
                <div className="text-xs font-mono space-y-1">
                  <p>ISBN: {selectedBook.isbn?.[0] || 'N/A'}</p>
                  <p>OLID: {selectedBook.key?.replace('/works/', '')}</p>
                  <p>Edition Count: {selectedBook.edition_count || 0}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subjects</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBook.subject?.slice(0, 8).map((s: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">{s}</span>
                  )) || 'No subjects listed.'}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Interactive Book Reader</span>
                </h4>
                {selectedBook.ebook_access === 'public' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold self-start sm:self-auto">
                    Public Domain • Full Book Free
                  </span>
                )}
                {selectedBook.ebook_access === 'borrowable' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold self-start sm:self-auto">
                    Library Lending • Free Preview
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                {selectedBook.ia && selectedBook.ia.length > 0 
                  ? "This edition is digitized in the official Internet Archive digital library. Click below to launch the full-screen interactive reader with seamless page-turning, zooming, and double-page view."
                  : "Online digital scan file is not available for this specific catalog edition. You can search other titles or author editions."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {selectedBook.ia && selectedBook.ia.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowLiveReader(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.875rem] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all shadow-md text-xs cursor-pointer active:scale-98"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Read Live Inside Website (Full Screen)</span>
                    </button>

                    <a
                      href={`https://archive.org/details/${selectedBook.ia[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[0.875rem] bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border/80 hover:border-amber-500/50 transition-all text-xs no-underline shadow-xs hover:shadow-sm active:scale-98"
                      title="Open and read the full original digital scan on official Internet Archive"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                      <span>Official Archive Edition ↗</span>
                    </a>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>No digital scan file available for this edition</span>
                    </div>
                    {selectedBook.key && (
                      <a
                        href={`https://openlibrary.org${selectedBook.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.875rem] bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border/80 hover:border-amber-500/50 transition-all text-xs no-underline shadow-xs"
                        title="View official catalog records and edition metadata on Open Library"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                        <span>Official Open Library Catalog ↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Safe Harbor Compliance Notice */}
              <div className="pt-2 border-t border-amber-500/15 text-[10px] text-muted-foreground/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Legal open-access book preview powered by Open Library & Internet Archive. No copyrighted files are hosted locally.</span>
              </div>
            </div>
          </div>
        )}
      />

      {/* Dedicated Full Screen Live Book Reader Overlay (100% AdSense & DMCA Safe) */}
      {showLiveReader && selectedBook?.ia && selectedBook.ia.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col animate-in fade-in duration-200">
          {/* Reader Top Bar */}
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-3 text-neutral-200 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                  {selectedBook.title}
                </h3>
                <p className="text-[11px] text-neutral-400 truncate">
                  {selectedBook.author_name?.[0] ? `By ${selectedBook.author_name[0]} • ` : ''}
                  {selectedBook.first_publish_year ? `First Published: ${selectedBook.first_publish_year} • ` : ''}
                  Internet Archive Official BookReader
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {selectedBook.ebook_access === 'public' ? (
                <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  Public Domain • Full Book Free
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                  Library Lending • Live Preview
                </span>
              )}

              {/* Unique Official Website / Archive Edition Button */}
              <a
                href={`https://archive.org/details/${selectedBook.ia[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-[0.875rem] transition-colors flex items-center gap-1.5 no-underline cursor-pointer"
                title="Read & borrow directly on the official Internet Archive website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Official Archive Edition</span>
                <span className="sm:hidden">Official Site</span>
              </a>

              <button
                type="button"
                onClick={() => setShowLiveReader(false)}
                className="btn-signature-header px-3.5 py-1.5 text-xs font-bold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border-neutral-700 cursor-pointer flex items-center gap-1.5 rounded-[0.875rem] transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Close Reader</span>
              </button>
            </div>
          </div>

          {/* Full Screen Live Iframe */}
          <div className="flex-1 w-full bg-black relative">
            <iframe
              src={`https://archive.org/embed/${selectedBook.ia[0]}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full border-0"
              title={`Read ${selectedBook.title} live in full screen`}
            />
          </div>

          {/* Compliance & AdSense Safe Footer */}
          <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-400 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Official open-access digital library viewer powered by Open Library & Internet Archive.</span>
            </div>
            <span className="text-neutral-500">Toolzaro does not host, upload, or store copyrighted ebook files.</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Live Weather Station
export const OpenMeteoWeatherTool: React.FC = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const coordinates: Record<string, { lat: number; lon: number; name: string }> = {
    'London': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
    'New York': { lat: 40.7128, lon: -74.0060, name: 'New York, USA' },
    'Tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
    'Dhaka': { lat: 23.8103, lon: 90.4125, name: 'Dhaka, Bangladesh' },
    'Sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
    'Dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' }
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    const loc = coordinates[cityName];
    if (!loc) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_2m,weather_code,apparent_temperature,precipitation,rain,showers,snowfall`);
      if (res.ok) {
        const data = await res.json();
        setWeather({ ...data.current, name: loc.name, units: data.current_units });
      } else {
        toast.error('Failed to fetch data.');
      }
    } catch (err) {
      toast.error('Service error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex flex-col items-center justify-center space-y-4">
        <p className="text-xs font-bold text-muted-foreground">Select a Global City for Real-Time Metrics</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.keys(coordinates).map((cName) => (
            <button
              key={cName}
              type="button"
              onClick={() => { setCity(cName); fetchWeather(cName); }}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${city === cName ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-secondary text-foreground hover:bg-muted border-border'} disabled:opacity-50`}
            >
              {cName}
            </button>
          ))}
        </div>
      </div>

      {weather && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-secondary/80 to-secondary border border-border space-y-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Satellite Feed Active
              </span>
              <h3 className="text-3xl font-black text-foreground pt-2">{weather.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Updated: {new Date(weather.time).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-6xl md:text-7xl font-black text-amber-500 tracking-tighter">{weather.temperature_2m}<span className="text-3xl align-top pt-2">°C</span></div>
              <p className="text-sm font-bold text-muted-foreground pt-1">Feels like {weather.apparent_temperature}°C</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Humidity', value: `${weather.relative_humidity_2m}%` },
              { label: 'Wind Speed', value: `${weather.wind_speed_2m} km/h` },
              { label: 'Precipitation', value: `${weather.precipitation} mm` },
              { label: 'Rain Intensity', value: `${weather.rain} mm` },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-background border border-border flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                <span className="text-base font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!weather && !loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
          <CloudSun className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">Please select a city to stream live atmospheric data.</p>
        </div>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-3xl">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-amber-500">Connecting to Meteorological Satellites...</p>
        </div>
      )}
    </div>
  );
};

// 5. Avatar Generator
export const AvatarGeneratorTool: React.FC = () => {
  const [seed, setSeed] = useState('User');
  const [style, setStyle] = useState('bottts');
  const [copied, setCopied] = useState(false);

  const styles = [
    { id: 'bottts', name: 'Robots' },
    { id: 'avataaars', name: 'Avatars' },
    { id: 'lorelei', name: 'Lorelei' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'identicon', name: 'Identicon' }
  ];

  const avatarUrl = style === 'robohash' 
    ? `https://robohash.org/${encodeURIComponent(seed)}.png?set=set1` 
    : `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(avatarUrl);
    setCopied(true);
    toast.success('Copied URL.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    fetch(avatarUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, `Avatar_${seed}_${style}.svg`);
        toast.success('Downloaded.');
      })
      .catch(() => toast.error('Failed.'));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1.5">Identifier</label>
          <input 
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Type word..."
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1.5">Select Style</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${style === s.id ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-secondary text-foreground hover:bg-muted border-border'}`}
              >
                {s.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setStyle('robohash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${style === 'robohash' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-secondary text-foreground hover:bg-muted border-border'}`}
            >
              Alternative
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center gap-4">
          <div className="w-32 h-32 rounded-2xl bg-card p-2 border border-border shadow-md flex items-center justify-center">
            <img src={avatarUrl} alt="Generated Avatar" className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold rounded-xl border border-border flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. QR Code Generator
export const QrServerGeneratorTool: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState('250');

  const qrUrl = text ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}` : null;

  const handleDownload = () => {
    if(!qrUrl) return;
    fetch(qrUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, `QRCode_${Date.now()}.png`);
        toast.success('Downloaded.');
      })
      .catch(() => toast.error('Failed.'));
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1.5">Content</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Type link or text..."
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
          />
        </div>

        {qrUrl && (
          <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow border border-border/60">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 object-contain" />
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Placeholder Image Generator
export const LoremPicsumTool: React.FC = () => {
  const [width, setWidth] = useState('600');
  const [height, setHeight] = useState('400');
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState('0');

  let imgUrl = `https://picsum.photos/${width}/${height}`;
  const params = [];
  if (grayscale) params.push('grayscale');
  if (blur !== '0') params.push(`blur=${blur}`);
  if (params.length > 0) imgUrl += `?${params.join('&')}`;

  const handleDownload = () => {
    fetch(imgUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, `Image_${width}x${height}.jpg`);
        toast.success('Downloaded.');
      })
      .catch(() => toast.error('Failed.'));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Width (px)</label>
            <input 
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Height (px)</label>
            <input 
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
            <input 
              type="checkbox"
              checked={grayscale}
              onChange={(e) => setGrayscale(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span>B&W Filter</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Blur (1-10):</span>
            <select
              value={blur}
              onChange={(e) => setBlur(e.target.value)}
              className="px-2 py-1 bg-secondary border border-border rounded-lg text-xs text-foreground"
            >
              <option value="0">None</option>
              <option value="2">Light</option>
              <option value="5">Medium</option>
              <option value="10">Heavy</option>
            </select>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-md h-48 rounded-xl overflow-hidden shadow border border-border/60 bg-card">
            <img src={imgUrl} alt="Placeholder" className="w-full h-full object-cover" />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 8. IP Inspector
export const IpifyInspectorTool: React.FC = () => {
  const [ipInfo, setIpInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchIp = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (res.ok) {
        const data = await res.json();
        setIpInfo(data.ip);
      } else {
        setIpInfo('Unavailable.');
      }
    } catch {
      setIpInfo('Error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ipInfo);
    setCopied(true);
    toast.success('Copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-6 rounded-2xl bg-secondary/50 border border-border text-center space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Detected Address
        </span>
        <div className="text-3xl font-black font-mono text-foreground tracking-wider">{ipInfo || '---'}</div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={fetchIp}
            disabled={loading}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold rounded-xl border border-border flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{ipInfo ? 'Refresh' : 'Lookup'}</span>
          </button>
          {ipInfo && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 9. Motivation & Fun Hub
export const JokeQuotableTool: React.FC = () => {
  const [joke, setJoke] = useState<{ setup: string; punchline: string } | null>(null);
  const [quote, setQuote] = useState<{ content: string; author: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [jokeRes, quoteRes] = await Promise.all([
        fetch('https://official-joke-api.appspot.com/random_joke').catch(() => null),
        fetch('https://api.quotable.io/random').catch(() => null)
      ]);

      if (jokeRes && jokeRes.ok) {
        setJoke(await jokeRes.json());
      }
      if (quoteRes && quoteRes.ok) {
        setQuote(await quoteRes.json());
      }
    } catch {
      toast.error('Failed to fetch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={fetchContent}
          disabled={loading}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Generate Mix</span>
        </button>
      </div>

      <div className="space-y-4">
        {quote && (
          <div className="p-5 rounded-2xl bg-secondary/50 border border-border space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Insight
            </span>
            <p className="text-sm font-medium italic text-foreground leading-relaxed">"{quote.content}"</p>
            <p className="text-xs font-bold text-muted-foreground text-right">— {quote.author}</p>
          </div>
        )}

        {joke && (
          <div className="p-5 rounded-2xl bg-secondary/50 border border-border space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Humor
            </span>
            <p className="text-xs sm:text-sm font-bold text-foreground">{joke.setup}</p>
            <p className="text-xs sm:text-sm font-extrabold text-amber-500 pt-1">{joke.punchline}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 10. University Directory
export const HipolabsUniversitiesTool: React.FC = () => {
  const [country, setCountry] = useState('');
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const countriesList = ['Bangladesh', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'India'];

  const fetchUniversities = async (cName: string) => {
    if (!cName) return;
    setLoading(true);
    try {
      const res = await fetch(`https://universities.hipolabs.com/search?country=${encodeURIComponent(cName)}`);
      if (res.ok) {
        const data = await res.json();
        setUniversities(Array.isArray(data) ? data.slice(0, 24) : []);
      } else {
        setUniversities([]);
        toast.error('No results found for this country.');
      }
    } catch {
      toast.error('Failed to connect to the University database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex flex-wrap gap-2">
        {countriesList.map((cName) => (
          <button
            key={cName}
            type="button"
            onClick={() => { setCountry(cName); fetchUniversities(cName); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${country === cName ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-secondary text-foreground hover:bg-muted border-border'}`}
          >
            {cName}
          </button>
        ))}
      </div>

      {universities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {universities.map((uni, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {uni.country}
                </span>
                <h4 className="text-xs font-bold text-foreground line-clamp-2 pt-1">{uni.name}</h4>
              </div>
              {uni.web_pages?.[0] && (
                <a 
                  href={uni.web_pages[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 11. Website Screenshot
export const WebsiteScreenshotTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const captureScreenshot = (targetUrl: string) => {
    if (!targetUrl.trim()) {
      toast.error('Please enter a valid URL.');
      return;
    }

    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setLoading(true);
    setScreenshotUrl(null);
    
    // Using WordPress mshots as a 100% reliable, unlimited screenshot API
    const api = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=1200&h=900`;
    
    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setScreenshotUrl(api);
      setLoading(false);
      toast.success('Screenshot captured successfully!');
    };
    img.onerror = () => {
      setLoading(false);
      toast.error('Failed to capture screenshot. Please ensure the URL is correct and public.');
    };
    img.src = api;
  };

  const handleDownload = () => {
    if (!screenshotUrl) return;
    fetch(screenshotUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, `Screenshot_${Date.now()}.jpg`);
        toast.success('Downloaded.');
      })
      .catch(() => toast.error('Download failed.'));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      <div className="flex gap-2">
        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && captureScreenshot(url)}
          placeholder="Enter website URL (e.g. google.com)..."
          className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
        />
        <button
          type="button"
          onClick={() => captureScreenshot(url)}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          <span>{loading ? 'Capturing...' : 'Capture'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {['google.com', 'wikipedia.org', 'github.com', 'reddit.com'].map(site => (
          <button
            key={site}
            onClick={() => { setUrl(site); captureScreenshot(site); }}
            className="px-3 py-1 rounded-lg bg-secondary hover:bg-amber-500/10 hover:text-amber-600 border border-border text-[10px] font-bold transition-all cursor-pointer"
          >
            {site}
          </button>
        ))}
      </div>

      {screenshotUrl && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative group rounded-xl overflow-hidden border border-border shadow-xl bg-muted">
            <img 
              src={screenshotUrl} 
              alt="Website Preview" 
              className="w-full h-auto aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={screenshotUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white text-black hover:scale-110 transition-transform"
              >
                <Maximize2 className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Screenshot</span>
            </button>
          </div>
        </div>
      )}

      {loading && !screenshotUrl && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <RefreshCw className="w-10 h-10 animate-spin opacity-20" />
          <p className="text-sm font-medium animate-pulse">Communicating with capture node...</p>
        </div>
      )}

      {!loading && !screenshotUrl && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <ImageIcon className="w-12 h-12 opacity-10" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground/70">Instant Website Snapshot</p>
            <p className="text-xs max-w-xs mx-auto">Enter any URL and click capture to generate a full-page high-resolution screenshot instantly.</p>
          </div>
        </div>
      )}
    </div>
  );
};
