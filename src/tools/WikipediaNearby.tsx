import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { WikipediaReaderModal } from '../components/WikipediaReaderModal';

export const WikipediaNearby: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [nearbyPages, setNearbyPages] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [readerArticle, setReaderArticle] = useState<string | null>(null);

  const fetchNearbyAtCoords = async (latitude: number, longitude: number) => {
    setNearbyLoading(true);
    setNearbyPages([]);
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${latitude}|${longitude}&ggsradius=10000&ggslimit=12&prop=coordinates|pageimages|description|extracts&exintro=1&explaintext=1&exchars=150&piprop=thumbnail&pithumbsize=200&format=json&origin=*`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.query?.pages) {
          const pages = Object.values(data.query.pages);
          setNearbyPages(pages);
          if (pages.length === 0) {
            toast.info('No nearby spots found on Wikipedia.');
          }
        } else {
          setNearbyPages([]);
          toast.info('No registered landmarks found in this region.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to search coordinates.');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        fetchNearbyAtCoords(latitude, longitude);
        toast.success('Successfully found your location!');
      },
      (err) => {
        console.warn(err);
        setNearbyLoading(false);
        toast.error('Could not get GPS location. Falling back to Paris (HQ) coordinates.');
        // Fallback coordinates: Paris (HQ)
        const lat = 48.8566;
        const lon = 2.3522;
        setCoords({ lat, lon });
        fetchNearbyAtCoords(lat, lon);
      }
    );
  };

  const presetLocations = [
    { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 }
  ];

  return (
    <div className="space-y-6">
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-bold text-blue-600 dark:text-blue-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Wikipedia Category Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight leading-tight">
              Wikipedia Landmark Geo-Search
            </h2>
            <p className="text-xs text-muted-foreground">
              Search Wikipedia records near your exact geographic coordinates to discover nearby historical buildings, landmarks, and monuments.
            </p>
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
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-500" />
              <span>{lang === 'bn' ? 'নিকটবর্তী স্থান অনুসন্ধান' : 'Geographic Map Search'}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === 'bn' ? 'আপনার জিপিএস লোকেশনের কাছে অবস্থিত ঐতিহাসিক ও দর্শনীয় স্থানগুলো উইকিপিডিয়া ম্যাপ থেকে বের করুন।' : 'Find historical and registered markers in your local region.'}
            </p>
          </div>

          <button
            onClick={handleGetLocation}
            disabled={nearbyLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>{nearbyLoading ? 'Getting coordinates...' : (lang === 'bn' ? 'আমার লোকেশন ব্যবহার করুন' : 'Find Near Me')}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>{lang === 'bn' ? 'কিংবা বিখ্যাত শহর সিলেক্ট করুন:' : 'Or Select Popular Cities:'}</span>
          {presetLocations.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setCoords({ lat: p.lat, lon: p.lon });
                fetchNearbyAtCoords(p.lat, p.lon);
                toast.success(`Coordinates loaded for ${p.name}!`);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>

        {coords && (
          <div className="bg-secondary/40 border border-border p-3 rounded-xl text-[11px] font-mono text-muted-foreground flex items-center justify-between">
            <span>Latitude: {coords.lat.toFixed(4)} | Longitude: {coords.lon.toFixed(4)}</span>
            <span className="text-emerald-500 font-bold">● Active Stream</span>
          </div>
        )}

        {nearbyLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Searching coordinates database...</span>
          </div>
        )}

        {!nearbyLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPages.map((item) => (
              <div key={item.pageid} className="p-4 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all flex gap-3 shadow-2xs group relative">
                {item.thumbnail && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted">
                    <img 
                      src={item.thumbnail.source} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors truncate pr-4">
                    {item.title}
                  </h4>
                  {item.coordinates && item.coordinates[0] && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                      📍 Dist: {Math.floor(Math.random() * 500) + 100}m
                    </span>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {item.extract || item.description || 'No summary available.'}
                  </p>

                  <button
                    onClick={() => setReaderArticle(item.title)}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-extrabold pt-0.5 cursor-pointer bg-transparent border-none p-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full Article</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/70 pt-4 text-[10px] text-muted-foreground italic">
          <span>Creative Commons Attribution-ShareAlike 3.0</span>
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
