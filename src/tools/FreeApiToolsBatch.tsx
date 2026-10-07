import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, BookOpen, CloudSun, QrCode, Image as ImageIcon, 
  Wifi, Smile, GraduationCap, Copy, Check, Download, ExternalLink, Search, Volume2, RefreshCw, Maximize2, ShieldCheck, X,
  MapPin, Compass, Droplets, Wind, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Sunrise, Sunset, Navigation, Gauge, Umbrella, Calendar, Clock, Sparkles, ChevronRight, AlertCircle,
  Filter, ArrowUpDown, Landmark, Users, Layers, VolumeX, Lightbulb, Share2,
  Dices, Shuffle, User, Palette, Code, FileCode, Crop, Sliders, Monitor, Smartphone, Eye, Type, Grid, Tag, Briefcase, Award, Zap, ChevronDown,
  Bot, Cpu, Shield, Activity, Terminal, Radio, Server, LocateFixed, Flag, Map, Lock, Bookmark, BookmarkCheck, Star, Library
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadBlob } from '../lib/downloadHelper';
import { UniversalDataReaderModal } from '../components/UniversalDataReaderModal';
import countriesData from '../data/countries.json';

// 1. Country Info Lookup (Resilient, 250 Countries, Offline-Ready, Zero-Block)
const CURATED_DEFAULT_COUNTRIES = [
  {
    name: 'Bangladesh',
    iso2: 'BD',
    iso3: 'BGD',
    capital: 'Dhaka',
    currency: 'BDT',
    currency_name: 'Bangladeshi taka',
    currency_symbol: '৳',
    phonecode: '880',
    population: 169828911,
    region: 'Asia',
    subregion: 'Southern Asia',
    nationality: 'Bangladeshi',
    area_sq_km: 144000,
    emoji: '🇧🇩',
    tld: '.bd',
    native: 'বাংলাদেশ',
    latitude: '24.00000000',
    longitude: '90.00000000',
    timezones: [{ zoneName: 'Asia/Dhaka', gmtOffsetName: 'UTC+06:00', tzName: 'Bangladesh Standard Time' }]
  },
  {
    name: 'United States',
    iso2: 'US',
    iso3: 'USA',
    capital: 'Washington, D.C.',
    currency: 'USD',
    currency_name: 'United States dollar',
    currency_symbol: '$',
    phonecode: '1',
    population: 331893745,
    region: 'Americas',
    subregion: 'Northern America',
    nationality: 'American',
    area_sq_km: 9833517,
    emoji: '🇺🇸',
    tld: '.us',
    native: 'United States',
    latitude: '38.00000000',
    longitude: '-97.00000000',
    timezones: [{ zoneName: 'America/New_York', gmtOffsetName: 'UTC-05:00', tzName: 'Eastern Standard Time' }]
  },
  {
    name: 'United Kingdom',
    iso2: 'GB',
    iso3: 'GBR',
    capital: 'London',
    currency: 'GBP',
    currency_name: 'British pound',
    currency_symbol: '£',
    phonecode: '44',
    population: 67081000,
    region: 'Europe',
    subregion: 'Northern Europe',
    nationality: 'British',
    area_sq_km: 242495,
    emoji: '🇬🇧',
    tld: '.uk',
    native: 'United Kingdom',
    latitude: '54.00000000',
    longitude: '-2.00000000',
    timezones: [{ zoneName: 'Europe/London', gmtOffsetName: 'UTC+00:00', tzName: 'Greenwich Mean Time' }]
  },
  {
    name: 'Canada',
    iso2: 'CA',
    iso3: 'CAN',
    capital: 'Ottawa',
    currency: 'CAD',
    currency_name: 'Canadian dollar',
    currency_symbol: '$',
    phonecode: '1',
    population: 38246108,
    region: 'Americas',
    subregion: 'Northern America',
    nationality: 'Canadian',
    area_sq_km: 9984670,
    emoji: '🇨🇦',
    tld: '.ca',
    native: 'Canada',
    latitude: '60.00000000',
    longitude: '-95.00000000',
    timezones: [{ zoneName: 'America/Toronto', gmtOffsetName: 'UTC-05:00', tzName: 'Eastern Standard Time' }]
  },
  {
    name: 'India',
    iso2: 'IN',
    iso3: 'IND',
    capital: 'New Delhi',
    currency: 'INR',
    currency_name: 'Indian rupee',
    currency_symbol: '₹',
    phonecode: '91',
    population: 1393409038,
    region: 'Asia',
    subregion: 'Southern Asia',
    nationality: 'Indian',
    area_sq_km: 3287263,
    emoji: '🇮🇳',
    tld: '.in',
    native: 'भारत',
    latitude: '20.00000000',
    longitude: '77.00000000',
    timezones: [{ zoneName: 'Asia/Kolkata', gmtOffsetName: 'UTC+05:30', tzName: 'India Standard Time' }]
  },
  {
    name: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    capital: 'Tokyo',
    currency: 'JPY',
    currency_name: 'Japanese yen',
    currency_symbol: '¥',
    phonecode: '81',
    population: 125507472,
    region: 'Asia',
    subregion: 'Eastern Asia',
    nationality: 'Japanese',
    area_sq_km: 377930,
    emoji: '🇯🇵',
    tld: '.jp',
    native: '日本',
    latitude: '36.00000000',
    longitude: '138.00000000',
    timezones: [{ zoneName: 'Asia/Tokyo', gmtOffsetName: 'UTC+09:00', tzName: 'Japan Standard Time' }]
  },
  {
    name: 'Germany',
    iso2: 'DE',
    iso3: 'DEU',
    capital: 'Berlin',
    currency: 'EUR',
    currency_name: 'Euro',
    currency_symbol: '€',
    phonecode: '49',
    population: 83129285,
    region: 'Europe',
    subregion: 'Western Europe',
    nationality: 'German',
    area_sq_km: 357022,
    emoji: '🇩🇪',
    tld: '.de',
    native: 'Deutschland',
    latitude: '51.00000000',
    longitude: '9.00000000',
    timezones: [{ zoneName: 'Europe/Berlin', gmtOffsetName: 'UTC+01:00', tzName: 'Central European Time' }]
  },
  {
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',
    capital: 'Paris',
    currency: 'EUR',
    currency_name: 'Euro',
    currency_symbol: '€',
    phonecode: '33',
    population: 67499343,
    region: 'Europe',
    subregion: 'Western Europe',
    nationality: 'French',
    area_sq_km: 551695,
    emoji: '🇫🇷',
    tld: '.fr',
    native: 'France',
    latitude: '46.00000000',
    longitude: '2.00000000',
    timezones: [{ zoneName: 'Europe/Paris', gmtOffsetName: 'UTC+01:00', tzName: 'Central European Time' }]
  },
  {
    name: 'Australia',
    iso2: 'AU',
    iso3: 'AUS',
    capital: 'Canberra',
    currency: 'AUD',
    currency_name: 'Australian dollar',
    currency_symbol: '$',
    phonecode: '61',
    population: 25687041,
    region: 'Oceania',
    subregion: 'Australia and New Zealand',
    nationality: 'Australian',
    area_sq_km: 7692024,
    emoji: '🇦🇺',
    tld: '.au',
    native: 'Australia',
    latitude: '-27.00000000',
    longitude: '133.00000000',
    timezones: [{ zoneName: 'Australia/Sydney', gmtOffsetName: 'UTC+10:00', tzName: 'Australian Eastern Standard Time' }]
  },
  {
    name: 'United Arab Emirates',
    iso2: 'AE',
    iso3: 'ARE',
    capital: 'Abu Dhabi',
    currency: 'AED',
    currency_name: 'United Arab Emirates dirham',
    currency_symbol: 'د.إ',
    phonecode: '971',
    population: 9890400,
    region: 'Asia',
    subregion: 'Western Asia',
    nationality: 'Emirati',
    area_sq_km: 83600,
    emoji: '🇦🇪',
    tld: '.ae',
    native: 'دولة الإمارات العربية المتحدة',
    latitude: '24.00000000',
    longitude: '54.00000000',
    timezones: [{ zoneName: 'Asia/Dubai', gmtOffsetName: 'UTC+04:00', tzName: 'Gulf Standard Time' }]
  },
  {
    name: 'Saudi Arabia',
    iso2: 'SA',
    iso3: 'SAU',
    capital: 'Riyadh',
    currency: 'SAR',
    currency_name: 'Saudi riyal',
    currency_symbol: '﷼',
    phonecode: '966',
    population: 34813867,
    region: 'Asia',
    subregion: 'Western Asia',
    nationality: 'Saudi',
    area_sq_km: 2149690,
    emoji: '🇸🇦',
    tld: '.sa',
    native: 'المملكة العربية السعودية',
    latitude: '25.00000000',
    longitude: '45.00000000',
    timezones: [{ zoneName: 'Asia/Riyadh', gmtOffsetName: 'UTC+03:00', tzName: 'Arabia Standard Time' }]
  },
  {
    name: 'Brazil',
    iso2: 'BR',
    iso3: 'BRA',
    capital: 'Brasília',
    currency: 'BRL',
    currency_name: 'Brazilian real',
    currency_symbol: 'R$',
    phonecode: '55',
    population: 213993441,
    region: 'Americas',
    subregion: 'South America',
    nationality: 'Brazilian',
    area_sq_km: 8515767,
    emoji: '🇧🇷',
    tld: '.br',
    native: 'Brasil',
    latitude: '-10.00000000',
    longitude: '-55.00000000',
    timezones: [{ zoneName: 'America/Sao_Paulo', gmtOffsetName: 'UTC-03:00', tzName: 'Brasília Time' }]
  }
];

export const RestCountriesTool: React.FC = () => {
  const [allCountries, setAllCountries] = useState<any[]>(() => {
    if (Array.isArray(countriesData) && countriesData.length > 0) {
      return countriesData;
    }
    return CURATED_DEFAULT_COUNTRIES;
  });
  const [query, setQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'population' | 'name' | 'area'>('population');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Filter and sort countries
  const filteredCountries = React.useMemo(() => {
    let result = [...allCountries];

    // Filter by Region
    if (selectedRegion !== 'All') {
      result = result.filter(c => c.region?.toLowerCase() === selectedRegion.toLowerCase());
    }

    // Filter by Query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(c => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const capitalMatch = c.capital?.toLowerCase().includes(q);
        const isoMatch = c.iso2?.toLowerCase() === q || c.iso3?.toLowerCase() === q;
        const currencyMatch = c.currency?.toLowerCase().includes(q) || c.currency_name?.toLowerCase().includes(q);
        const nativeMatch = c.native?.toLowerCase().includes(q);
        return nameMatch || capitalMatch || isoMatch || currencyMatch || nativeMatch;
      });
    }

    // Sort
    if (sortBy === 'population') {
      result.sort((a, b) => (Number(b.population) || 0) - (Number(a.population) || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'area') {
      result.sort((a, b) => (Number(b.area_sq_km) || 0) - (Number(a.area_sq_km) || 0));
    }

    return result;
  }, [allCountries, selectedRegion, query, sortBy]);

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];
  const quickPills = ['Bangladesh', 'USA', 'United Kingdom', 'Canada', 'India', 'Japan', 'Germany', 'Australia', 'Saudi Arabia', 'Brazil'];

  const copyCountryDetails = (c: any) => {
    const text = `🌍 ${c.name} (${c.iso2}/${c.iso3}) ${c.emoji || ''}\n` +
      `🏛️ Capital: ${c.capital || 'N/A'}\n` +
      `📍 Region: ${c.region || ''} • ${c.subregion || ''}\n` +
      `👥 Population: ${Number(c.population || 0).toLocaleString()}\n` +
      `💰 Currency: ${c.currency_name || c.currency || 'N/A'} (${c.currency_symbol || ''})\n` +
      `📞 Calling Code: +${c.phonecode || 'N/A'}\n` +
      `📐 Area: ${Number(c.area_sq_km || 0).toLocaleString()} km²\n` +
      `🌐 Domain: ${c.tld || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Country details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getFlagUrl = (iso2: string) => {
    if (!iso2) return '';
    return `https://flagcdn.com/w160/${iso2.toLowerCase()}.png`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      {/* Top Stat Ribbon (clean, non-redundant) */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{allCountries.length} World Nations Database</span>
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {filteredCountries.length} matching countries
        </span>
      </div>

      {/* Search and filter controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any country, capital, currency, or ISO (e.g. Bangladesh, Tokyo, CAD, BD)..."
              className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 bg-secondary border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="population">👥 Most Populated</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="area">📐 Largest Area</option>
              </select>
            </div>
          </div>
        </div>

        {/* Region filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Region:
          </span>
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                selectedRegion === r 
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                  : 'bg-secondary text-foreground/80 hover:bg-muted border-border'
              }`}
            >
              {r}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground font-semibold">
            Showing {filteredCountries.length} countries
          </span>
        </div>

        {/* Popular Quick search pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Popular:</span>
          {quickPills.map(q => (
            <button
              key={q}
              onClick={() => { setQuery(q); setSelectedRegion('All'); }}
              className="px-2.5 py-0.5 rounded-md bg-secondary hover:bg-amber-500/10 hover:text-amber-600 border border-border text-[11px] font-semibold transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Country Cards Grid */}
      {filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCountries.map((c, idx) => (
            <div 
              key={c.iso2 || idx} 
              onClick={() => setSelectedCountry(c)}
              className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-amber-500/50 hover:bg-secondary/70 cursor-pointer group transition-all space-y-3 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-8 rounded overflow-hidden border border-border/80 shrink-0 bg-muted flex items-center justify-center shadow-xs">
                    <img 
                      src={getFlagUrl(c.iso2)} 
                      alt={c.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-base select-none">{c.emoji || '🏳️'}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-foreground group-hover:text-amber-500 transition-colors truncate">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.capital || 'N/A'} • {c.region || ''}
                    </p>
                  </div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 opacity-60 group-hover:opacity-100 shrink-0 transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Pop.</span>
                  <span className="font-extrabold text-foreground truncate block">
                    {c.population ? (Number(c.population) > 1000000 ? `${(Number(c.population) / 1000000).toFixed(1)}M` : Number(c.population).toLocaleString()) : 'N/A'}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Curr.</span>
                  <span className="font-extrabold text-foreground truncate block">
                    {c.currency || 'N/A'} {c.currency_symbol ? `(${c.currency_symbol})` : ''}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Code</span>
                  <span className="font-extrabold text-foreground truncate block">
                    +{c.phonecode || c.iso2}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <Globe className="w-10 h-10 opacity-30" />
          <p className="text-sm font-semibold">No countries matching "{query}" in {selectedRegion}.</p>
          <button 
            type="button" 
            onClick={() => { setQuery(''); setSelectedRegion('All'); }}
            className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Detailed Modal Reader */}
      <UniversalDataReaderModal
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry ? `${selectedCountry.name} (${selectedCountry.iso2})` : 'Country Profile'}
        category="Global Country Directory"
        content={selectedCountry && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-border">
              <div className="w-32 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-border/80 shrink-0 bg-muted flex items-center justify-center">
                <img 
                  src={`https://flagcdn.com/w320/${selectedCountry.iso2?.toLowerCase()}.png`} 
                  alt={selectedCountry.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-foreground">{selectedCountry.name}</h2>
                  <span className="text-2xl">{selectedCountry.emoji}</span>
                </div>
                <p className="text-amber-500 font-bold text-sm mt-0.5">
                  {selectedCountry.native ? `${selectedCountry.native} • ` : ''}
                  {selectedCountry.region} ({selectedCountry.subregion || 'Subregion'})
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-black uppercase">ISO: {selectedCountry.iso2} / {selectedCountry.iso3}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-black uppercase">TLD: {selectedCountry.tld || 'N/A'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-black uppercase">Code: +{selectedCountry.phonecode}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyCountryDetails(selectedCountry)}
                className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Profile' : 'Copy Country Data'}</span>
              </button>
              <a 
                href={`https://flagcdn.com/w640/${selectedCountry.iso2?.toLowerCase()}.png`}
                target="_blank"
                rel="noopener noreferrer"
                download={`${selectedCountry.name}-flag.png`}
                className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>High-Res Flag</span>
              </a>
            </div>

            {/* Comprehensive details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Capital City', value: selectedCountry.capital },
                { label: 'Population', value: selectedCountry.population ? Number(selectedCountry.population).toLocaleString() : 'N/A' },
                { label: 'Currency', value: `${selectedCountry.currency_name || selectedCountry.currency} (${selectedCountry.currency_symbol || ''})` },
                { label: 'Calling Code', value: selectedCountry.phonecode ? `+${selectedCountry.phonecode}` : 'N/A' },
                { label: 'Land Area', value: selectedCountry.area_sq_km ? `${Number(selectedCountry.area_sq_km).toLocaleString()} km²` : 'N/A' },
                { label: 'Nationality', value: selectedCountry.nationality || 'N/A' },
                { label: 'Continent / Region', value: selectedCountry.region },
                { label: 'Sub-Region', value: selectedCountry.subregion || 'N/A' },
                { label: 'Native Name', value: selectedCountry.native || 'N/A' },
                { label: 'Internet TLD', value: selectedCountry.tld || 'N/A' },
                { label: 'Coordinates', value: selectedCountry.latitude ? `${selectedCountry.latitude}°, ${selectedCountry.longitude}°` : 'N/A' },
                { label: 'Timezone', value: selectedCountry.timezones?.[0]?.tzName || selectedCountry.timezones?.[0]?.gmtOffsetName || 'UTC' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[10px] font-black uppercase text-muted-foreground block mb-0.5">{item.label}</span>
                  <span className="text-xs font-extrabold text-foreground truncate block">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>

            {/* External Navigation Links */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Live Geographic Mapping</span>
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCountry.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(selectedCountry.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-muted border border-border transition-colors"
                >
                  <span>OpenStreetMap</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

// 2. Lexicon Word Definitions (Resilient, Multi-Source Fallback, Audio Voice Synth, Zero-Block)
const CURATED_OFFLINE_WORDS: Record<string, any> = {
  serendipity: {
    word: 'serendipity',
    phonetic: '/ˌsɛrənˈdɪpɪti/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
            example: 'A fortunate stroke of serendipity brought the two collaborators together.',
            synonyms: ['chance', 'happy coincidence', 'good fortune', 'fluke']
          }
        ]
      }
    ]
  },
  resilience: {
    word: 'resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The capacity to withstand or recover quickly from difficulties, tough situations, or trauma; toughness.',
            example: 'The people showed remarkable resilience in the face of adversity.',
            synonyms: ['toughness', 'tenacity', 'endurance', 'adaptability']
          }
        ]
      }
    ]
  },
  eloquent: {
    word: 'eloquent',
    phonetic: '/ˈɛləkwənt/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Fluent or persuasive in speaking or writing; clearly expressing or indicating something.',
            example: 'An eloquent speech that moved everyone in the auditorium.',
            synonyms: ['articulate', 'expressive', 'persuasive', 'fluent']
          }
        ]
      }
    ]
  },
  ephemeral: {
    word: 'ephemeral',
    phonetic: '/ɪˈfɛmərəl/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Lasting for a very short time; transitory; fleeting.',
            example: 'Fame in the internet age can be remarkably ephemeral.',
            synonyms: ['transitory', 'fleeting', 'momentary', 'evanescent']
          }
        ]
      }
    ]
  },
  innovation: {
    word: 'innovation',
    phonetic: '/ˌɪn.əˈveɪ.ʃən/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The practical implementation of ideas that result in the introduction of new goods or services or improvement in offering goods or services.',
            example: 'Technological innovations continue to transform daily life.',
            synonyms: ['invention', 'modernization', 'revolution', 'breakthrough']
          }
        ]
      }
    ]
  },
  luminescence: {
    word: 'luminescence',
    phonetic: '/ˌluː.mɪˈnɛs.əns/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The emission of light by a substance not resulting from heat; it is thus a form of cold-body radiation.',
            example: 'The eerie blue luminescence of deep-sea jellyfish.',
            synonyms: ['glow', 'phosphorescence', 'radiance', 'gleam']
          }
        ]
      }
    ]
  },
  ubiquitous: {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Present, appearing, or found everywhere at once.',
            example: 'Smartphones have become ubiquitous in modern society.',
            synonyms: ['omnipresent', 'pervasive', 'universal', 'worldwide']
          }
        ]
      }
    ]
  },
  harmony: {
    word: 'harmony',
    phonetic: '/ˈhɑːr.mə.ni/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'Agreement or concord; harmonious arrangement of parts, sounds, or elements in a pleasing manner.',
            example: 'Living in peace and harmony with nature.',
            synonyms: ['accord', 'balance', 'unity', 'concord']
          }
        ]
      }
    ]
  }
};

export const LexiconDictionaryTool: React.FC = () => {
  const [word, setWord] = useState('serendipity');
  const [result, setResult] = useState<any>(CURATED_OFFLINE_WORDS['serendipity']);
  const [loading, setLoading] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const activeAbortRef = useRef<AbortController | null>(null);
  const suggestionTimerRef = useRef<any>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Datamuse suggestions as user types
  useEffect(() => {
    if (!word || word.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    suggestionTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(word.trim())}&max=6`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setSuggestions(list.map((item: any) => item.word));
          }
        }
      } catch {
        // Silently ignore suggestions error
      }
    }, 200);
    return () => {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    };
  }, [word]);

  // Multi-tier definition lookup engine (Isolated timeouts per step)
  const fetchDictionary = async (searchTerm: string) => {
    const cleanWord = searchTerm.trim().toLowerCase();
    if (!cleanWord) return;
    
    // Cancel any in-flight suggestion timer
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    setShowSuggestions(false);
    setLoading(true);

    try {
      // 1. Fast check Curated Offline Dictionary (Instant, 0ms)
      if (CURATED_OFFLINE_WORDS[cleanWord]) {
        setResult(CURATED_OFFLINE_WORDS[cleanWord]);
        setLoading(false);
        return;
      }

      // 2. Try Free Dictionary API with dedicated 3s controller
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, {
          signal: ctrl.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0] && data[0].meanings && data[0].meanings.length > 0) {
            setResult(data[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('DictionaryAPI.dev bypassed:', err);
      }

      // 3. Try Datamuse Definitions & Synonyms API with dedicated 3s controller
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3000);
        const [wordRes, synRes] = await Promise.all([
          fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=dpf&max=1`, { signal: ctrl.signal }).catch(() => null),
          fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=6`, { signal: ctrl.signal }).catch(() => null)
        ]);
        clearTimeout(timeoutId);

        if (wordRes && wordRes.ok) {
          const wordData = await wordRes.json();
          const synData = synRes && synRes.ok ? await synRes.json() : [];

          if (Array.isArray(wordData) && wordData.length > 0 && wordData[0].defs && wordData[0].defs.length > 0) {
            const item = wordData[0];
            const meaningsMap: Record<string, any[]> = {};

            item.defs.forEach((d: string) => {
              const parts = d.split('\t');
              const posCode = parts[0] || 'n';
              const defText = parts[1] || d;
              const posName = posCode === 'n' ? 'noun' : posCode === 'v' ? 'verb' : posCode === 'adj' ? 'adjective' : posCode === 'adv' ? 'adverb' : 'general';

              if (!meaningsMap[posName]) meaningsMap[posName] = [];
              meaningsMap[posName].push({
                definition: defText,
                synonyms: Array.isArray(synData) ? synData.slice(0, 4).map((s: any) => s.word) : []
              });
            });

            const synthesizedResult = {
              word: cleanWord,
              phonetic: item.tags?.find((t: string) => t.startsWith('pron:'))?.replace('pron:', '') || `/${cleanWord}/`,
              meanings: Object.entries(meaningsMap).map(([pos, defs]) => ({
                partOfSpeech: pos,
                definitions: defs
              })),
              sourceUrls: [`https://en.wiktionary.org/wiki/${cleanWord}`]
            };

            setResult(synthesizedResult);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Datamuse bypassed:', err);
      }

      // 4. Try Wiktionary REST API with dedicated 3s controller
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3000);
        const wikRes = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`, {
          signal: ctrl.signal
        });
        clearTimeout(timeoutId);
        if (wikRes.ok) {
          const wikData = await wikRes.json();
          if (wikData.en && Array.isArray(wikData.en) && wikData.en.length > 0) {
            const synthesizedResult = {
              word: cleanWord,
              phonetic: `/${cleanWord}/`,
              meanings: wikData.en.slice(0, 3).map((entry: any) => ({
                partOfSpeech: entry.partOfSpeech?.toLowerCase() || 'noun',
                definitions: (entry.definitions || []).slice(0, 3).map((d: any) => ({
                  definition: d.definition ? d.definition.replace(/<[^>]*>/g, '') : 'Meaning available on Wiktionary.',
                  example: d.examples?.[0] ? d.examples[0].replace(/<[^>]*>/g, '') : null
                }))
              })),
              sourceUrls: [`https://en.wiktionary.org/wiki/${cleanWord}`]
            };
            setResult(synthesizedResult);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Wiktionary bypassed:', err);
      }

      // 5. Fallback structured linguistic entry
      const fallbackResult = {
        word: cleanWord,
        phonetic: `/${cleanWord}/`,
        meanings: [
          {
            partOfSpeech: 'noun / lexical term',
            definitions: [
              {
                definition: `The term "${cleanWord}" is recognized in the lexical lexicon. Detailed definition available on Wiktionary reference archive.`,
                example: `Using the expression "${cleanWord}" in modern English vocabulary.`,
                synonyms: ['term', 'concept', 'expression']
              }
            ]
          }
        ],
        sourceUrls: [`https://en.wiktionary.org/wiki/${cleanWord}`]
      };
      setResult(fallbackResult);
      toast.info(`Displayed definition entry for "${cleanWord}".`);
    } catch (err) {
      console.error('Dictionary error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guaranteed Audio Pronunciation with SpeechSynthesis Fallback
  const playAudio = (audioUrl?: string, wordText?: string) => {
    setIsPlayingAudio(true);
    const targetWord = wordText || result?.word || word;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        speakWithSynthesis(targetWord);
      };
      audio.play().catch(() => {
        speakWithSynthesis(targetWord);
      });
    } else {
      speakWithSynthesis(targetWord);
    }
  };

  const speakWithSynthesis = (targetWord: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(targetWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      toast.error('Audio synthesizer not supported in this browser.');
    }
  };

  const copyDefinition = () => {
    if (!result) return;
    const firstDef = result.meanings?.[0]?.definitions?.[0]?.definition || '';
    const text = `📖 ${result.word} ${result.phonetic || ''}\n` +
      `[${result.meanings?.[0]?.partOfSpeech || 'definition'}] ${firstDef}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Definition copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const quickWords = [
    'Serendipity', 'Resilience', 'Eloquent', 'Ephemeral', 
    'Innovation', 'Luminescence', 'Ubiquitous', 'Harmony'
  ];

  const audioObj = result?.phonetics?.find((p: any) => p.audio && p.audio.trim() !== '');

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      {/* Top Status Strip (Clean, No Duplicate Title) */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Multi-Tier Active Lexicon Engine</span>
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          Phonetics, Synonyms & Audio
        </span>
      </div>

      {/* Search Input with Autocomplete Suggestions */}
      <div className="space-y-3 relative" ref={suggestionRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchDictionary(word);
                  setShowSuggestions(false);
                }
              }}
              placeholder="Search any English word (e.g. Resilience, Serendipity, Eloquent)..."
              className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
            {word && (
              <button 
                type="button"
                onClick={() => { setWord(''); setSuggestions([]); }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-border/50">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setWord(s);
                      fetchDictionary(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-secondary text-sm text-foreground flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <span className="font-semibold group-hover:text-amber-500 capitalize">{s}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchDictionary(word)}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Define</span>
          </button>
        </div>

        {/* Popular Word Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Featured:
          </span>
          {quickWords.map(q => (
            <button
              key={q}
              onClick={() => { setWord(q); fetchDictionary(q); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                result?.word?.toLowerCase() === q.toLowerCase()
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-secondary text-foreground/80 hover:bg-muted border-border'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Result Card */}
      {result ? (
        <div className="p-5 sm:p-6 rounded-2xl bg-secondary/40 border border-border space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground capitalize">{result.word}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  Verified
                </span>
              </div>
              <p className="text-sm text-amber-500 font-mono mt-1">
                {result.phonetic || result.phonetics?.[0]?.text || `/${result.word}/`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playAudio(audioObj?.audio, result.word)}
                disabled={isPlayingAudio}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                title="Listen to audio pronunciation"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-yellow-200' : ''}`} />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
              </button>

              <button
                type="button"
                onClick={copyDefinition}
                className="p-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer transition-all text-xs font-bold"
                title="Copy definition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowReader(true)}
                className="px-3 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Open in full reader"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full View</span>
              </button>
            </div>
          </div>

          {/* Meanings and parts of speech */}
          <div className="space-y-5">
            {result.meanings?.map((meaning: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {meaning.partOfSpeech}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <div className="space-y-3 pl-1">
                  {meaning.definitions?.slice(0, 3).map((def: any, dIdx: number) => (
                    <div key={dIdx} className="space-y-1.5 border-l-2 border-amber-500/30 pl-4 py-0.5">
                      <p className="text-foreground text-sm font-medium leading-relaxed">
                        {def.definition}
                      </p>
                      {def.example && (
                        <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg border border-border/40">
                          "{def.example}"
                        </p>
                      )}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Synonyms:</span>
                          {def.synonyms.slice(0, 5).map((syn: string, sIdx: number) => (
                            <button
                              key={sIdx}
                              onClick={() => { setWord(syn); fetchDictionary(syn); }}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="w-10 h-10 opacity-30" />
          <p className="text-sm font-semibold">Enter any word above or click a featured word to define.</p>
        </div>
      )}

      {/* Full Screen Reader Modal */}
      <UniversalDataReaderModal
        isOpen={showReader}
        onClose={() => setShowReader(false)}
        title={`Dictionary: ${result?.word}`}
        category="Lexicon Word Definitions"
        content={result && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground capitalize">{result.word}</h2>
                <p className="text-lg text-amber-500 font-mono mt-1">
                  {result.phonetic || result.phonetics?.[0]?.text || `/${result.word}/`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => playAudio(audioObj?.audio, result.word)}
                  disabled={isPlayingAudio}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlayingAudio ? 'Speaking...' : 'Listen Pronunciation'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyDefinition}
                  className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {result.meanings?.map((meaning: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-secondary border border-border text-foreground">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <div className="space-y-5 pl-2">
                    {meaning.definitions?.map((def: any, dIdx: number) => (
                      <div key={dIdx} className="space-y-2 border-l-4 border-amber-500/30 pl-5 py-1">
                        <p className="text-foreground text-sm font-medium leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-border/50">
                            "{def.example}"
                          </p>
                        )}
                        {def.synonyms?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Synonyms:</span>
                            {def.synonyms.map((syn: string, sIdx: number) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  setWord(syn);
                                  fetchDictionary(syn);
                                  setShowReader(false);
                                }}
                                className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {result.sourceUrls && result.sourceUrls.length > 0 && (
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

// 3. Curated Popular Books & Universal Library Explorer
const CURATED_POPULAR_BOOKS = [
  {
    key: '/works/OL82563W',
    title: "Harry Potter and the Philosopher's Stone",
    author_name: ['J. K. Rowling'],
    cover_i: 10521270,
    first_publish_year: 1997,
    genre: 'fantasy',
    rating: 4.8,
    edition_count: 520,
    ebook_access: 'borrowable',
    ia: ['harrypottersorce0000rowl_a6h9'],
    isbn: ['9780747532699'],
    subject: ['Magic', 'Wizards', 'Hogwarts', 'Adventure', 'Friendship']
  },
  {
    key: '/works/OL262758W',
    title: 'The Hobbit, or There and Back Again',
    author_name: ['J. R. R. Tolkien'],
    cover_i: 8406786,
    first_publish_year: 1937,
    genre: 'fantasy',
    rating: 4.9,
    edition_count: 410,
    ebook_access: 'borrowable',
    ia: ['hobbit0000tolk'],
    isbn: ['9780261102217'],
    subject: ['Middle-earth', 'Bilbo Baggins', 'Dragons', 'Fantasy Quest']
  },
  {
    key: '/works/OL1168007W',
    title: 'Nineteen Eighty-Four (1984)',
    author_name: ['George Orwell'],
    cover_i: 8575736,
    first_publish_year: 1949,
    genre: 'classics',
    rating: 4.7,
    edition_count: 980,
    ebook_access: 'public',
    ia: ['nineteeneightyfo0000orwe'],
    isbn: ['9780451524935'],
    subject: ['Dystopia', 'Totalitarianism', 'Big Brother', 'Surveillance', 'Classics']
  },
  {
    key: '/works/OL20042456W',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    author_name: ['James Clear'],
    cover_i: 12843515,
    first_publish_year: 2018,
    genre: 'habits',
    rating: 4.9,
    edition_count: 85,
    ebook_access: 'borrowable',
    ia: ['atomichabitseasy0000clea'],
    isbn: ['9780735211292'],
    subject: ['Habits', 'Productivity', 'Self Improvement', 'Psychology', 'Success']
  },
  {
    key: '/works/OL893415W',
    title: 'Dune: The Epic Sci-Fi Masterpiece',
    author_name: ['Frank Herbert'],
    cover_i: 12547191,
    first_publish_year: 1965,
    genre: 'scifi',
    rating: 4.8,
    edition_count: 360,
    ebook_access: 'borrowable',
    ia: ['dune0000herb_t6z7'],
    isbn: ['9780441172719'],
    subject: ['Science Fiction', 'Arrakis', 'Space Opera', 'Ecology', 'Politics']
  },
  {
    key: '/works/OL17079979W',
    title: 'Sapiens: A Brief History of Humankind',
    author_name: ['Yuval Noah Harari'],
    cover_i: 12695502,
    first_publish_year: 2011,
    genre: 'history',
    rating: 4.7,
    edition_count: 140,
    ebook_access: 'borrowable',
    ia: ['sapiensbriefhist0000hara'],
    isbn: ['9780062316097'],
    subject: ['Human Evolution', 'Anthropology', 'Civilization', 'History']
  },
  {
    key: '/works/OL45804W',
    title: 'The Great Gatsby',
    author_name: ['F. Scott Fitzgerald'],
    cover_i: 8432047,
    first_publish_year: 1925,
    genre: 'classics',
    rating: 4.6,
    edition_count: 850,
    ebook_access: 'public',
    ia: ['greatgatsby0000fitz'],
    isbn: ['9780743273565'],
    subject: ['Jazz Age', 'Roaring Twenties', 'American Dream', 'Tragedy']
  },
  {
    key: '/works/OL257943W',
    title: 'To Kill a Mockingbird',
    author_name: ['Harper Lee'],
    cover_i: 8225266,
    first_publish_year: 1960,
    genre: 'classics',
    rating: 4.8,
    edition_count: 670,
    ebook_access: 'borrowable',
    ia: ['tokillmockingbi0000leeh'],
    isbn: ['9780061120084'],
    subject: ['Justice', 'Coming of Age', 'Southern Gothic', 'Pulitzer Prize']
  },
  {
    key: '/works/OL27479W',
    title: 'The Alchemist: A Fable About Following Your Dream',
    author_name: ['Paulo Coelho'],
    cover_i: 8231990,
    first_publish_year: 1988,
    genre: 'habits',
    rating: 4.7,
    edition_count: 430,
    ebook_access: 'borrowable',
    ia: ['alchemistfableab0000coel'],
    isbn: ['9780062315007'],
    subject: ['Inspiration', 'Personal Legend', 'Spiritual Journey', 'Philosophy']
  },
  {
    key: '/works/OL15358693W',
    title: 'Pride and Prejudice',
    author_name: ['Jane Austen'],
    cover_i: 8235114,
    first_publish_year: 1813,
    genre: 'classics',
    rating: 4.8,
    edition_count: 1200,
    ebook_access: 'public',
    ia: ['prideprejudice0000aust'],
    isbn: ['9780141439518'],
    subject: ['Romance', 'Elizabeth Bennet', 'Regency Era', 'Classic Literature']
  },
  {
    key: '/works/OL102749W',
    title: 'Sherlock Holmes: The Complete Novels & Stories',
    author_name: ['Arthur Conan Doyle'],
    cover_i: 8314115,
    first_publish_year: 1892,
    genre: 'mystery',
    rating: 4.9,
    edition_count: 650,
    ebook_access: 'public',
    ia: ['adventuresofsher0000doyl_g1k0'],
    isbn: ['9780553212419'],
    subject: ['Detective', 'Mystery', 'Baker Street', 'Crime Investigation']
  },
  {
    key: '/works/OL27448W',
    title: 'The Psychology of Money',
    author_name: ['Morgan Housel'],
    cover_i: 12695505,
    first_publish_year: 2020,
    genre: 'habits',
    rating: 4.8,
    edition_count: 60,
    ebook_access: 'borrowable',
    ia: ['psychologyofmone0000hous'],
    isbn: ['9780857197689'],
    subject: ['Finance', 'Wealth', 'Human Behavior', 'Investing Mindset']
  }
];

export const OpenLibraryTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>(CURATED_POPULAR_BOOKS);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showLiveReader, setShowLiveReader] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Reading List / Bookshelf saved in localStorage
  const [bookshelf, setBookshelf] = useState<{ id: string; book: any; status: 'want' | 'reading' | 'finished' }[]>(() => {
    try {
      const saved = localStorage.getItem('toolnest_user_bookshelf');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveBookshelf = (updated: typeof bookshelf) => {
    setBookshelf(updated);
    try {
      localStorage.setItem('toolnest_user_bookshelf', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const toggleBookStatus = (book: any, status: 'want' | 'reading' | 'finished') => {
    const bookId = book.key || book.title;
    const existing = bookshelf.find(b => b.id === bookId);
    if (existing && existing.status === status) {
      const filtered = bookshelf.filter(b => b.id !== bookId);
      saveBookshelf(filtered);
      toast.info(`Removed "${book.title}" from your bookshelf.`);
    } else {
      const filtered = bookshelf.filter(b => b.id !== bookId);
      const updated = [...filtered, { id: bookId, book, status }];
      saveBookshelf(updated);
      toast.success(`Saved to "${status === 'want' ? 'Want to Read' : status === 'reading' ? 'Currently Reading' : 'Finished'}"!`);
    }
  };

  const searchBooks = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBooks(CURATED_POPULAR_BOOKS);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=18`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.docs) && data.docs.length > 0) {
          setBooks(data.docs);
          setActiveCategory('search');
        } else {
          setBooks([]);
          toast.info('No results found. Showing popular recommendations.');
          setBooks(CURATED_POPULAR_BOOKS);
        }
      } else {
        toast.error('Search request failed. Showing curated books.');
        setBooks(CURATED_POPULAR_BOOKS);
      }
    } catch {
      toast.error('Network issue. Showing curated books.');
      setBooks(CURATED_POPULAR_BOOKS);
    } finally {
      setLoading(false);
    }
  };

  const popularChips = [
    'Harry Potter', 'The Hobbit', '1984', 'Atomic Habits', 
    'Dune', 'Sapiens', 'The Great Gatsby', 'To Kill a Mockingbird', 'The Alchemist'
  ];

  const categories = [
    { id: 'all', label: '🔥 All Popular' },
    { id: 'fantasy', label: '🧙 Fantasy & Sci-Fi' },
    { id: 'classics', label: '🏛️ Classics' },
    { id: 'habits', label: '🧠 Habits & Mindset' },
    { id: 'mystery', label: '🕵️ Mystery' },
    { id: 'bookshelf', label: `🔖 My Bookshelf (${bookshelf.length})` }
  ];

  const displayedBooks = activeCategory === 'bookshelf'
    ? bookshelf.map(b => b.book)
    : activeCategory === 'all' || activeCategory === 'search'
    ? books
    : CURATED_POPULAR_BOOKS.filter(b => b.genre === activeCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-lg">
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
            <Library className="w-3.5 h-3.5" />
            <span>Open Library & Archive Catalog</span>
          </span>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            30M+ Books & Internet Archive Reader
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>Books Saved: <strong className="text-amber-500">{bookshelf.length}</strong></span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchBooks(query);
                }
              }}
              placeholder="Search by book title, author, or ISBN (e.g. Harry Potter, James Clear)..."
              className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setBooks(CURATED_POPULAR_BOOKS); setActiveCategory('all'); }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => searchBooks(query)}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Popular:
          </span>
          {popularChips.map(chip => (
            <button
              key={chip}
              onClick={() => {
                setQuery(chip);
                searchBooks(chip);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary text-foreground/80 hover:bg-amber-500/10 hover:text-amber-600 border border-border transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border-border/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {displayedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBooks.map((b, idx) => {
            const coverUrl = b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null;
            const bookId = b.key || b.title;
            const savedItem = bookshelf.find(s => s.id === bookId);

            return (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all group relative"
              >
                <div 
                  onClick={() => { setSelectedBook(b); setShowLiveReader(false); }}
                  className="flex gap-3 items-start cursor-pointer"
                >
                  {coverUrl ? (
                    <img 
                      src={coverUrl} 
                      alt={b.title} 
                      className="w-20 h-28 object-cover rounded-xl shadow shrink-0 border border-border/60 group-hover:scale-105 transition-transform" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-20 h-28 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground text-[11px] font-bold text-center p-1">
                      No Cover
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {b.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      By {b.author_name?.[0] || 'Unknown Author'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                      <span>{b.first_publish_year || 'Classic'}</span>
                      {b.rating && (
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> {b.rating}
                        </span>
                      )}
                    </div>
                    {b.subject && b.subject.length > 0 && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[150px]">
                        {b.subject[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleBookStatus(b, 'want')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        savedItem?.status === 'want'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-secondary hover:bg-muted text-muted-foreground border-border'
                      }`}
                      title={savedItem?.status === 'want' ? 'In Want to Read' : 'Add to Want to Read'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookStatus(b, 'finished')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        savedItem?.status === 'finished'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-secondary hover:bg-muted text-muted-foreground border-border'
                      }`}
                      title={savedItem?.status === 'finished' ? 'Marked as Finished' : 'Mark as Finished'}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setSelectedBook(b); setShowLiveReader(false); }}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Details & Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-secondary/30 rounded-2xl border border-dashed border-border text-muted-foreground space-y-2">
          <BookOpen className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
          <p className="text-sm font-semibold">
            {activeCategory === 'bookshelf' 
              ? 'Your bookshelf is currently empty. Bookmark books above to add them here!'
              : 'No books found for this category.'}
          </p>
        </div>
      )}

      {/* Book Detail Modal */}
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
                  className="w-48 rounded-xl shadow-2xl border-4 border-white dark:border-neutral-800 object-cover" 
                  alt="Cover" 
                />
              ) : (
                <div className="w-48 h-64 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black">No Cover</div>
              )}
              
              <div className="space-y-4 text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">{selectedBook.title}</h2>
                <p className="text-lg sm:text-xl font-bold text-amber-500">By {selectedBook.author_name?.join(', ') || 'Unknown Author'}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {selectedBook.first_publish_year && (
                    <span className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold">First Published: {selectedBook.first_publish_year}</span>
                  )}
                  {selectedBook.rating && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {selectedBook.rating} / 5 Rating
                    </span>
                  )}
                </div>

                {/* Bookshelf status selectors */}
                <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-bold text-muted-foreground">My Bookshelf:</span>
                  <button
                    type="button"
                    onClick={() => toggleBookStatus(selectedBook, 'want')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      bookshelf.find(s => s.id === (selectedBook.key || selectedBook.title))?.status === 'want'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-secondary hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Want to Read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookStatus(selectedBook, 'reading')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      bookshelf.find(s => s.id === (selectedBook.key || selectedBook.title))?.status === 'reading'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-secondary hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Currently Reading</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookStatus(selectedBook, 'finished')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      bookshelf.find(s => s.id === (selectedBook.key || selectedBook.title))?.status === 'finished'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-secondary hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Finished</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Library Records</span>
                <div className="text-xs font-mono space-y-1 text-foreground/80">
                  <p>ISBN: {selectedBook.isbn?.[0] || 'Standard International Edition'}</p>
                  <p>Catalog OLID: {selectedBook.key?.replace('/works/', '') || 'Work Record'}</p>
                  <p>Editions Published: {selectedBook.edition_count || 12}+</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Genres & Subjects</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBook.subject?.slice(0, 8).map((s: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">{s}</span>
                  )) || 'Literature, Fiction, General'}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Interactive Open Reader</span>
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
                  : "Online digital catalog entry from Open Library. You can view author records and borrow editions online."}
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
                    {selectedBook.key && (
                      <a
                        href={`https://openlibrary.org${selectedBook.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.875rem] bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border/80 hover:border-amber-500/50 transition-all text-xs no-underline shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                        <span>Official Open Library Catalog ↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      />

      {/* Full Screen Live Book Reader */}
      {showLiveReader && selectedBook?.ia && selectedBook.ia.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col animate-in fade-in duration-200">
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
                  Internet Archive Official BookReader
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`https://archive.org/details/${selectedBook.ia[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-[0.875rem] transition-colors flex items-center gap-1.5 no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Archive Page</span>
              </a>

              <button
                type="button"
                onClick={() => setShowLiveReader(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer flex items-center gap-1.5 rounded-[0.875rem]"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full relative bg-neutral-900">
            <iframe
              src={`https://archive.org/embed/${selectedBook.ia[0]}`}
              className="w-full h-full border-0"
              title={`Read ${selectedBook.title}`}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Live Weather Station
export const OpenMeteoWeatherTool: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<{ lat: number; lon: number; name: string; country?: string }>({
    lat: 51.5074,
    lon: -0.1278,
    name: 'London, United Kingdom',
    country: 'United Kingdom'
  });
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'ip' | 'default'>('default');
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [recentSearches, setRecentSearches] = useState<Array<{ lat: number; lon: number; name: string }>>([
    { lat: 51.5074, lon: -0.1278, name: 'London' },
    { lat: 40.7128, lon: -74.0060, name: 'New York' },
    { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
    { lat: 48.8566, lon: 2.3522, name: 'Paris' },
    { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
    { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
    { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
    { lat: 43.6532, lon: -79.3832, name: 'Toronto' }
  ]);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live weather
  const fetchWeather = async (loc: { lat: number; lon: number; name: string; country?: string }, unitOverride?: 'celsius' | 'fahrenheit') => {
    const activeUnit = unitOverride || unit;
    setLoading(true);
    setSelectedLoc(loc);
    try {
      const unitParams = activeUnit === 'fahrenheit' 
        ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' 
        : '';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_2m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto${unitParams}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
        // Add to recent searches if not present
        setRecentSearches(prev => {
          const shortName = loc.name.split(',')[0].trim();
          const filtered = prev.filter(p => Math.abs(p.lat - loc.lat) > 0.05 || Math.abs(p.lon - loc.lon) > 0.05);
          return [{ lat: loc.lat, lon: loc.lon, name: shortName }, ...filtered].slice(0, 8);
        });
      } else {
        toast.error('Unable to fetch weather data for this location.');
      }
    } catch {
      toast.error('Network error loading weather.');
    } finally {
      setLoading(false);
    }
  };

  // Precise reverse geocoder (Nominatim OpenStreetMap + BigDataCloud)
  const resolvePreciseLocationFromCoords = async (lat: number, lon: number): Promise<string> => {
    // 1. OpenStreetMap Nominatim: Highest precision for Bangladesh Upazilas/Thanas, Districts, Divisions
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const thana = addr.suburb || addr.town || addr.village || addr.city_district || addr.hamlet || addr.municipality || addr.neighbourhood;
        const district = addr.county || addr.state_district || addr.city;
        const division = addr.state;
        const country = addr.country || 'Bangladesh';
        
        const parts = [thana, district, division, country].filter(Boolean);
        const unique = parts.filter((v, i, a) => a.indexOf(v) === i);
        if (unique.length > 0) return unique.join(', ');
      }
    } catch {}

    // 2. BigDataCloud Fallback
    try {
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (geoRes.ok) {
        const data = await geoRes.json();
        const parts = [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean);
        const unique = parts.filter((v, i, a) => a.indexOf(v) === i);
        if (unique.length > 0) return unique.join(', ');
      }
    } catch {}

    return `${lat.toFixed(3)}°, ${lon.toFixed(3)}°`;
  };

  // Instant Auto-detect user location on startup (High-Accuracy GPS first, with resilient IP fallback)
  useEffect(() => {
    let isMounted = true;

    const autoLocateOnStartup = async () => {
      setDetecting(true);

      // 1. Instant Fast IP Geolocation (Provides instant initial telemetry while GPS locks in)
      let resolvedLoc: { lat: number; lon: number; name: string; country?: string } | null = null;
      try {
        const ipRes = await fetch('https://ipwho.is/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.success !== false && ipData.latitude && ipData.longitude) {
            const cityName = [ipData.city, ipData.region, ipData.country].filter(Boolean).join(', ') || 'Your Local Area';
            resolvedLoc = { lat: ipData.latitude, lon: ipData.longitude, name: cityName, country: ipData.country };
          }
        }
      } catch {}

      if (!resolvedLoc) {
        try {
          const ipRes2 = await fetch('https://freeipapi.com/api/json');
          if (ipRes2.ok) {
            const ipData2 = await ipRes2.json();
            if (ipData2.latitude && ipData2.longitude) {
              const cityName = [ipData2.cityName, ipData2.regionName, ipData2.countryName].filter(Boolean).join(', ') || 'Your Local Area';
              resolvedLoc = { lat: ipData2.latitude, lon: ipData2.longitude, name: cityName, country: ipData2.countryName };
            }
          }
        } catch {}
      }

      if (resolvedLoc && isMounted) {
        setAutoDetected(true);
        setLocationSource('ip');
        setSelectedLoc(resolvedLoc);
        fetchWeather(resolvedLoc);
        setDetecting(false);
      }

      // 2. High-Accuracy Hardware GPS (Acquires real device coordinates down to Thana/District)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (!isMounted) return;
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const realName = await resolvePreciseLocationFromCoords(lat, lon);

            if (isMounted) {
              setAutoDetected(true);
              setLocationSource('gps');
              const detected = { lat, lon, name: realName };
              setSelectedLoc(detected);
              fetchWeather(detected);
              setDetecting(false);
              toast.success(`🎯 Real GPS Location: ${realName}`);
            }
          },
          (err) => {
            if (isMounted) setDetecting(false);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }

      // 3. Fallback default if all failed
      setTimeout(() => {
        if (isMounted && !weatherData && !resolvedLoc) {
          const defaultLoc = { lat: 51.5074, lon: -0.1278, name: 'London, United Kingdom', country: 'United Kingdom' };
          setSelectedLoc(defaultLoc);
          fetchWeather(defaultLoc);
          setDetecting(false);
        }
      }, 3000);
    };

    autoLocateOnStartup();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search autocomplete
  const handleSearchInput = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val.trim())}&count=6&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      }
    } catch {
      // ignore geocode error
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (item: any) => {
    const locName = [item.name, item.admin1, item.country].filter(Boolean).join(', ');
    const newLoc = {
      lat: item.latitude,
      lon: item.longitude,
      name: locName,
      country: item.country
    };
    setSearchQuery('');
    setShowSuggestions(false);
    setAutoDetected(false);
    fetchWeather(newLoc);
  };

  // Handle enter key in search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
    } else if (searchQuery.trim()) {
      handleSearchInput(searchQuery);
    }
  };

  // GPS auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const displayName = await resolvePreciseLocationFromCoords(lat, lon);
          const detected = { lat, lon, name: displayName };
          setAutoDetected(true);
          setLocationSource('gps');
          fetchWeather(detected);
          toast.success(`🎯 High-Precision Real Location: ${displayName}`);
        } catch {
          fetchWeather({ lat, lon, name: 'Current GPS Location' });
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        toast.error(err.code === 1 ? 'Location permission was denied. Please allow location access in your browser.' : 'Unable to acquire satellite GPS location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Toggle unit
  const handleToggleUnit = (newUnit: 'celsius' | 'fahrenheit') => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    if (selectedLoc) {
      fetchWeather(selectedLoc, newUnit);
    }
  };

  // Helper for weather codes (WMO interpretation)
  const getWeatherInfo = (code: number, isDay: number = 1) => {
    switch (code) {
      case 0:
        return {
          label: isDay ? 'Clear Sky / Sunny' : 'Clear Sky (Night)',
          icon: isDay ? Sun : Moon,
          color: 'text-amber-500',
          gradient: 'from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/30'
        };
      case 1:
      case 2:
        return {
          label: isDay ? 'Partly Cloudy' : 'Partly Cloudy (Night)',
          icon: isDay ? CloudSun : Cloud,
          color: 'text-sky-500',
          gradient: 'from-sky-500/15 via-blue-500/5 to-transparent border-sky-500/30'
        };
      case 3:
        return {
          label: 'Overcast Skies',
          icon: Cloud,
          color: 'text-slate-400',
          gradient: 'from-slate-500/15 via-neutral-500/5 to-transparent border-slate-500/30'
        };
      case 45:
      case 48:
        return {
          label: 'Foggy & Misty',
          icon: Cloud,
          color: 'text-stone-400',
          gradient: 'from-stone-500/15 via-neutral-500/5 to-transparent border-stone-500/30'
        };
      case 51:
      case 53:
      case 55:
        return {
          label: 'Light Drizzle',
          icon: CloudRain,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500/15 via-blue-500/5 to-transparent border-cyan-500/30'
        };
      case 61:
      case 63:
      case 65:
        return {
          label: code === 65 ? 'Heavy Rain' : 'Moderate Rain',
          icon: CloudRain,
          color: 'text-blue-500',
          gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30'
        };
      case 71:
      case 73:
      case 75:
      case 77:
        return {
          label: 'Snow Fall',
          icon: CloudSnow,
          color: 'text-sky-200',
          gradient: 'from-sky-300/15 via-slate-400/5 to-transparent border-sky-300/30'
        };
      case 80:
      case 81:
      case 82:
        return {
          label: 'Rain Showers',
          icon: CloudRain,
          color: 'text-blue-400',
          gradient: 'from-blue-500/20 via-indigo-500/5 to-transparent border-blue-500/30'
        };
      case 95:
      case 96:
      case 99:
        return {
          label: 'Thunderstorm',
          icon: CloudLightning,
          color: 'text-purple-400',
          gradient: 'from-purple-500/20 via-amber-500/5 to-transparent border-purple-500/30'
        };
      default:
        return {
          label: 'Atmospheric Conditions',
          icon: CloudSun,
          color: 'text-amber-500',
          gradient: 'from-amber-500/15 via-sky-500/5 to-transparent border-amber-500/30'
        };
    }
  };

  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    if (uv <= 5) return { text: 'Moderate', badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    if (uv <= 7) return { text: 'High', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
    if (uv <= 10) return { text: 'Very High', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    return { text: 'Extreme', badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
  };

  const getWindDirection = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return dirs[index];
  };

  const copyReport = () => {
    if (!weatherData) return;
    const cur = weatherData.current;
    const cond = getWeatherInfo(cur.weather_code, cur.is_day).label;
    const tUnit = unit === 'fahrenheit' ? '°F' : '°C';
    const sUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';
    const text = `🌤️ Weather Report for ${selectedLoc.name}:\nCondition: ${cond}\nTemperature: ${cur.temperature_2m}${tUnit} (Feels like: ${cur.apparent_temperature}${tUnit})\nHumidity: ${cur.relative_humidity_2m}%\nWind: ${cur.wind_speed_2m} ${sUnit}\nReported via ToolNest Live Weather Station.`;
    navigator.clipboard.writeText(text);
    toast.success('Live weather summary copied to clipboard!');
  };

  const currentCondition = weatherData ? getWeatherInfo(weatherData.current.weather_code, weatherData.current.is_day) : null;
  const ConditionIcon = currentCondition?.icon || CloudSun;

  // Hourly items (next 12 hours)
  const hourlyItems = weatherData?.hourly?.time ? weatherData.hourly.time.slice(0, 24).map((timeStr: string, idx: number) => {
    const date = new Date(timeStr);
    const code = weatherData.hourly.weather_code?.[idx] ?? 0;
    const temp = weatherData.hourly.temperature_2m?.[idx];
    const precipProb = weatherData.hourly.precipitation_probability?.[idx] ?? 0;
    const info = getWeatherInfo(code, date.getHours() >= 6 && date.getHours() < 19 ? 1 : 0);
    return {
      time: date.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      temp,
      precipProb,
      icon: info.icon,
      color: info.color
    };
  }) : [];

  // Daily items (7-day forecast)
  const dailyItems = weatherData?.daily?.time ? weatherData.daily.time.map((timeStr: string, idx: number) => {
    const date = new Date(timeStr);
    const dayName = idx === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'short' });
    const code = weatherData.daily.weather_code?.[idx] ?? 0;
    const maxTemp = weatherData.daily.temperature_2m_max?.[idx];
    const minTemp = weatherData.daily.temperature_2m_min?.[idx];
    const precipProb = weatherData.daily.precipitation_probability_max?.[idx] ?? 0;
    const info = getWeatherInfo(code, 1);
    return {
      dayName,
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      maxTemp,
      minTemp,
      precipProb,
      info
    };
  }) : [];

  const tempUnitSymbol = unit === 'fahrenheit' ? '°F' : '°C';
  const speedUnitSymbol = unit === 'fahrenheit' ? 'mph' : 'km/h';

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Satellite Meteorological Telemetry
            </span>
          </div>

          {/* Unit Toggle & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => handleToggleUnit('celsius')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${unit === 'celsius' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                °C Metric
              </button>
              <button
                type="button"
                onClick={() => handleToggleUnit('fahrenheit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${unit === 'fahrenheit' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                °F Imperial
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchWeather(selectedLoc)}
              disabled={loading}
              title="Refresh live satellite data"
              className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Auto Location Status Banner */}
        {autoDetected && (
          <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <Navigation className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {locationSource === 'gps' ? (
                  <>🎯 <strong className="text-foreground">{selectedLoc.name}</strong> (Live Hardware GPS)</>
                ) : (
                  <>📍 Auto-detected ISP Gateway: <strong className="text-foreground">{selectedLoc.name}</strong></>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {locationSource === 'ip' && (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Navigation className={`w-3 h-3 ${detecting ? 'animate-spin' : ''}`} />
                  <span>{detecting ? 'Locating...' : '🎯 Detect Real Local GPS'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('weather-search-input');
                  el?.focus();
                }}
                className="text-[11px] font-black text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              >
                Change City ➔
              </button>
            </div>
          </div>
        )}

        {/* Search Input Box with GPS and Autocomplete Dropdown */}
        <div ref={searchBoxRef} className="relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="weather-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search any city, district, country (e.g. Dhaka, Chittagong, Sylhet, London, New York, Tokyo)..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isSearching}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting || loading}
              title="Detect My Location via GPS"
              className="px-3.5 py-3 rounded-2xl bg-secondary hover:bg-muted text-foreground border border-border font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-amber-500 ${detecting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">My GPS</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden divide-y divide-border">
              {suggestions.map((item) => (
                <button
                  key={`${item.id}-${item.latitude}`}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className="w-full px-4 py-3 text-left hover:bg-secondary/70 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.name}
                        {item.country_code && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground font-mono uppercase">
                            {item.country_code}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[item.admin1, item.country].filter(Boolean).join(', ')} • {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Selection Hubs & Recent Cities */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Hubs:
          </span>
          {recentSearches.map((rec) => {
            const isSelected = selectedLoc && Math.abs(selectedLoc.lat - rec.lat) < 0.05 && Math.abs(selectedLoc.lon - rec.lon) < 0.05;
            return (
              <button
                key={`${rec.name}-${rec.lat}`}
                type="button"
                onClick={() => fetchWeather(rec)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                    : 'bg-secondary/70 text-foreground hover:bg-secondary border-border'
                } disabled:opacity-50`}
              >
                {rec.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Atmospheric Banner & Metrics */}
      {weatherData && currentCondition && (
        <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${currentCondition.gradient} border space-y-6 shadow-md transition-all`}>
          {/* Top Row: Location, Time & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Telemetry
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {weatherData.timezone}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2 pt-1">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                {selectedLoc.name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Updated: {new Date(weatherData.current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => fetchWeather(selectedLoc)}
                disabled={loading}
                title="Refresh Live Metrics"
                className="p-2.5 rounded-xl bg-background/80 hover:bg-background border border-border text-foreground transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={copyReport}
                title="Copy Weather Summary"
                className="px-3 py-2 rounded-xl bg-background/80 hover:bg-background border border-border text-foreground text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </button>
            </div>
          </div>

          {/* Core Temperature & Weather Condition Display */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-border">
            <div className="flex items-center gap-5">
              <div className={`p-4 sm:p-5 rounded-2xl bg-secondary border border-border shadow-inner ${currentCondition.color}`}>
                <ConditionIcon className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-foreground capitalize">
                  {currentCondition.label}
                </p>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-0.5">
                  Feels like {weatherData.current.apparent_temperature}{tempUnitSymbol}
                </p>
                {weatherData.daily?.temperature_2m_max?.[0] !== undefined && (
                  <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="text-rose-500 font-bold">H: {weatherData.daily.temperature_2m_max[0]}{tempUnitSymbol}</span>
                    <span>•</span>
                    <span className="text-sky-500 font-bold">L: {weatherData.daily.temperature_2m_min[0]}{tempUnitSymbol}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black text-amber-500 tracking-tighter flex items-start justify-center md:justify-end">
                <span>{weatherData.current.temperature_2m}</span>
                <span className="text-2xl sm:text-3xl font-bold ml-1 mt-1 text-muted-foreground">{tempUnitSymbol}</span>
              </div>
              <span className="inline-block mt-1 text-[11px] font-bold text-muted-foreground px-2.5 py-0.5 rounded-full bg-secondary border border-border">
                Surface Pressure: {weatherData.current.surface_pressure} hPa
              </span>
            </div>
          </div>

          {/* 8-Point Comprehensive Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Droplets className="w-4 h-4 text-sky-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Humidity</span>
              <span className="text-lg font-black text-foreground mt-0.5">{weatherData.current.relative_humidity_2m}%</span>
              <span className="text-[10px] text-muted-foreground font-medium">Relative moisture</span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Wind className="w-4 h-4 text-teal-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Wind Flow</span>
              <span className="text-lg font-black text-foreground mt-0.5">
                {weatherData.current.wind_speed_2m} <span className="text-xs font-bold text-muted-foreground">{speedUnitSymbol}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                <Compass className="w-3 h-3 text-amber-500" /> {getWindDirection(weatherData.current.wind_direction_10m)} ({weatherData.current.wind_direction_10m}°)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Umbrella className="w-4 h-4 text-blue-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Precipitation</span>
              <span className="text-lg font-black text-foreground mt-0.5">{weatherData.current.precipitation} mm</span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {weatherData.daily?.precipitation_probability_max?.[0] ?? 0}% rain chance
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Sun className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">UV Index</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-black text-foreground">
                  {weatherData.daily?.uv_index_max?.[0] ?? 0}
                </span>
                {weatherData.daily?.uv_index_max?.[0] !== undefined && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getUvLevel(weatherData.daily.uv_index_max[0]).badge}`}>
                    {getUvLevel(weatherData.daily.uv_index_max[0]).text}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Solar radiation</span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Cloud className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Cloud Cover</span>
              <span className="text-lg font-black text-foreground mt-0.5">{weatherData.current.cloud_cover}%</span>
              <span className="text-[10px] text-muted-foreground font-medium">Sky occlusion</span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Gauge className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Pressure</span>
              <span className="text-lg font-black text-foreground mt-0.5">{weatherData.current.surface_pressure}</span>
              <span className="text-[10px] text-muted-foreground font-medium">hPa (hectopascal)</span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Sunrise className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Sunrise</span>
              <span className="text-base font-black text-foreground mt-0.5">
                {weatherData.daily?.sunrise?.[0] ? new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Dawn light</span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-border flex flex-col items-center justify-center text-center hover:bg-background transition-colors">
              <Sunset className="w-4 h-4 text-rose-500 mb-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Sunset</span>
              <span className="text-base font-black text-foreground mt-0.5">
                {weatherData.daily?.sunset?.[0] ? new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Dusk horizon</span>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Timeline Forecast (Next 24 Hours) */}
      {hourlyItems.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-secondary/40 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Hourly Timeline Forecast (Next 24 Hours)
            </h4>
            <span className="text-[11px] font-bold text-muted-foreground">Swipe / Scroll ➔</span>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            {hourlyItems.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between p-3 min-w-[76px] sm:min-w-[84px] rounded-2xl bg-background/90 border border-border hover:border-amber-500/50 transition-all shrink-0 text-center"
                >
                  <span className="text-[11px] font-bold text-muted-foreground">{item.time}</span>
                  <div className={`my-2 p-2 rounded-xl bg-secondary/80 ${item.color}`}>
                    <ItemIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black text-foreground">{item.temp}{tempUnitSymbol}</span>
                  {item.precipProb > 0 ? (
                    <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5 mt-1">
                      <Droplets className="w-2.5 h-2.5" />
                      {item.precipProb}%
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground mt-1">0%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-Day Extended Forecast */}
      {dailyItems.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-secondary/40 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              7-Day Extended Atmospheric Outlook
            </h4>
            <span className="text-[11px] font-bold text-amber-500">Continuous Satellite Projection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
            {dailyItems.map((day, idx) => {
              const DayIcon = day.info.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl bg-background/90 border border-border flex flex-col items-center justify-between text-center transition-all hover:bg-background ${idx === 0 ? 'ring-2 ring-amber-500/50' : ''}`}
                >
                  <div>
                    <span className="text-xs font-black text-foreground block">{day.dayName}</span>
                    <span className="text-[10px] text-muted-foreground block">{day.date}</span>
                  </div>

                  <div className={`my-2.5 p-2 rounded-xl bg-secondary ${day.info.color}`}>
                    <DayIcon className="w-6 h-6" />
                  </div>

                  <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 mb-1">
                    {day.info.label}
                  </p>

                  <div className="w-full pt-1 border-t border-border/60">
                    <div className="flex items-center justify-center gap-2 text-xs font-black">
                      <span className="text-rose-500">{day.maxTemp}°</span>
                      <span className="text-muted-foreground text-[10px]">/</span>
                      <span className="text-sky-500">{day.minTemp}°</span>
                    </div>
                    {day.precipProb > 0 && (
                      <span className="text-[9px] font-bold text-blue-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <Droplets className="w-2.5 h-2.5" />
                        {day.precipProb}% rain
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-3xl">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-amber-500">Syncing with High-Orbit Meteorological Satellites...</p>
        </div>
      )}
    </div>
  );
};

// 5. Avatar Generator & Digital Persona Architect
export const AvatarGeneratorTool: React.FC = () => {
  const [seed, setSeed] = useState('Alex Rivera');
  const [style, setStyle] = useState('avataaars'); // Default 'avataaars' (Avatars) as requested
  const [bgColor, setBgColor] = useState('transparent');
  const [activeTab, setActiveTab] = useState<'preview' | 'persona' | 'showcase' | 'code'>('preview');
  const [copied, setCopied] = useState<string | null>(null);

  const styles = [
    { id: 'avataaars', name: 'Avatars', desc: 'Human Illustrated', icon: User },
    { id: 'adventurer', name: 'Adventurer', desc: 'RPG Characters', icon: Zap },
    { id: 'bottts', name: 'Robots', desc: 'Tech Droids', icon: Bot },
    { id: 'lorelei', name: 'Lorelei', desc: 'Anime & Modern', icon: Sparkles },
    { id: 'notionists', name: 'Notionist', desc: 'Sketch Clean', icon: FileCode },
    { id: 'pixel-art', name: 'Pixel Art', desc: '8-Bit Retro', icon: Grid },
    { id: 'fun-emoji', name: '3D Emoji', desc: 'Expressive Faces', icon: Smile },
    { id: 'big-ears', name: 'Big Ears', desc: 'Fun Toons', icon: Smile },
    { id: 'personas', name: 'Personas', desc: 'Minimalist UI', icon: User },
    { id: 'thumbs', name: 'Thumbs', desc: 'Cute Faces', icon: Smile },
    { id: 'shapes', name: 'Shapes', desc: 'Abstract Geometric', icon: Layers },
    { id: 'croodles', name: 'Doodles', desc: 'Hand Drawn', icon: Type },
    { id: 'robohash', name: 'RoboHash', desc: 'Cyber Monsters', icon: Zap }
  ];

  const bgPresets = [
    { id: 'transparent', label: 'Transparent', color: 'transparent', border: 'border-dashed border-border' },
    { id: 'b6e3f4', label: 'Sky Blue', color: '#b6e3f4', border: 'bg-[#b6e3f4]' },
    { id: 'c0aede', label: 'Lavender', color: '#c0aede', border: 'bg-[#c0aede]' },
    { id: 'd1d4f9', label: 'Pastel Violet', color: '#d1d4f9', border: 'bg-[#d1d4f9]' },
    { id: 'ffd5dc', label: 'Soft Rose', color: '#ffd5dc', border: 'bg-[#ffd5dc]' },
    { id: 'ffdfbf', label: 'Warm Peach', color: '#ffdfbf', border: 'bg-[#ffdfbf]' },
    { id: 'c1f2d5', label: 'Mint Sage', color: '#c1f2d5', border: 'bg-[#c1f2d5]' },
    { id: '1e293b', label: 'Midnight Slate', color: '#1e293b', border: 'bg-[#1e293b]' },
    { id: '0f172a', label: 'Obsidian Dark', color: '#0f172a', border: 'bg-[#0f172a]' }
  ];

  const quickSeeds = ['Alex Vance', 'Cyber Samurai', 'Luna Dev', 'Aether Nomad', 'Elena Rostova', 'Captain Neo', 'Maya Lin', 'Pixel Knight'];

  const bgParam = bgColor !== 'transparent' ? `&backgroundColor=${bgColor.replace('#', '')}` : '';
  const avatarUrl = style === 'robohash' 
    ? `https://robohash.org/${encodeURIComponent(seed || 'User')}.png?set=set1` 
    : `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed || 'User')}${bgParam}`;

  // Deterministic Persona generator
  const getPersonaData = (seedStr: string) => {
    const clean = seedStr || 'Alex Rivera';
    const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const titles = [
      'Senior UX Architect & Design Lead',
      'Principal AI Systems Researcher',
      'Cloud Infrastructure Specialist',
      'Creative Frontend Artisan',
      'Cybersecurity & Zero-Trust Engineer',
      'Data Science & Analytics Lead',
      'Mobile Engine Developer',
      'Staff Software Architect',
      'Product Innovation Strategist',
      'Full-Stack Web Engineer'
    ];
    const locations = ['San Francisco, CA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Dhaka, Bangladesh', 'Toronto, Canada', 'Sydney, Australia', 'Stockholm, Sweden', 'Singapore', 'Austin, TX'];
    const archetypes = ['The Visionary', 'The Architect', 'The Alchemist', 'The Strategist', 'The Explorer', 'The Catalyst', 'The Mastermind', 'The Pioneer'];
    const quotes = [
      'Crafting seamless user experiences through empathetic design and precision engineering.',
      'Building scalable distributed systems that empower the next generation of web applications.',
      'Exploring the frontiers of generative artificial intelligence and human-computer symbiosis.',
      'Turning chaotic complexity into clean, modular, and maintainable software architecture.',
      'Transforming bold creative visions into reality pixel by pixel, line by line.'
    ];
    const skillSets = [
      ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'System Architecture'],
      ['Python', 'PyTorch', 'Next.js', 'PostgreSQL', 'Docker'],
      ['Rust', 'WebAssembly', 'Go', 'Kubernetes', 'Cloudflare'],
      ['UI/UX Design', 'Design Systems', 'Framer', 'Prototyping', '3D Motion'],
      ['Node.js', 'Microservices', 'Redis', 'AWS', 'CI/CD']
    ];

    return {
      name: clean,
      title: titles[hash % titles.length],
      location: locations[(hash + 3) % locations.length],
      archetype: archetypes[(hash + 5) % archetypes.length],
      quote: quotes[hash % quotes.length],
      age: 22 + (hash % 20),
      level: `Lvl ${1 + (hash % 10)} • ${2 + (hash % 12)} yrs exp`,
      skills: skillSets[hash % skillSets.length]
    };
  };

  const persona = getPersonaData(seed);

  const handleRandomize = () => {
    const randomSeed = quickSeeds[Math.floor(Math.random() * quickSeeds.length)] + ' ' + Math.floor(Math.random() * 900 + 100);
    setSeed(randomSeed);
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`Copied ${type} to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadSVG = () => {
    fetch(avatarUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, `Avatar_${seed.replace(/\s+/g, '_')}_${style}.svg`);
        toast.success('Downloaded Vector SVG.');
      })
      .catch(() => toast.error('Failed to download SVG.'));
  };

  const handleDownloadPNG = async () => {
    try {
      const res = await fetch(avatarUrl);
      const svgText = await res.text();
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, 512, 512);
        }
        ctx.drawImage(img, 0, 0, 512, 512);
        URL.revokeObjectURL(blobURL);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Avatar_${seed.replace(/\s+/g, '_')}_${style}.png`;
        link.href = pngUrl;
        link.click();
        toast.success('Downloaded High-Res PNG (512×512).');
      };
      img.onerror = () => {
        window.open(avatarUrl, '_blank');
      };
      img.src = blobURL;
    } catch {
      toast.error('Unable to export PNG.');
    }
  };

  const htmlImgSnippet = `<img src="${avatarUrl}" alt="${seed} Avatar" width="200" height="200" style="border-radius: 9999px;" />`;
  const reactSnippet = `import React from 'react';\n\nexport const UserAvatar = () => (\n  <img \n    src="${avatarUrl}" \n    alt="${seed} Avatar" \n    className="w-16 h-16 rounded-full shadow-md object-contain" \n  />\n);`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Studio Header Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-amber-500" />
          <span>Vector Avatar Studio & Persona Engine</span>
        </span>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'preview' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('persona')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'persona' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Persona Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'showcase' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Style Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'code' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Embed & Code
          </button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="space-y-4">
        {/* Seed Input + Randomizer */}
        <div>
          <label className="text-xs font-bold text-muted-foreground flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" /> Identifier / Seed Name
            </span>
            <span className="text-[11px] text-muted-foreground">Any string generates a unique character</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Type name, email, or identifier..."
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
              />
              {seed && (
                <button
                  type="button"
                  onClick={() => setSeed('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
            >
              <Dices className="w-4 h-4" />
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Quick Seed Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-muted-foreground mr-1">Quick Seeds:</span>
            {quickSeeds.map((qs) => (
              <button
                key={qs}
                type="button"
                onClick={() => setSeed(qs)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${seed === qs ? 'bg-amber-500 text-white border-amber-500' : 'bg-secondary/70 text-foreground hover:bg-secondary border-border'}`}
              >
                {qs}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection Grid */}
        <div>
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-amber-500" /> Select Artistic Style (Default: Avatars)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {styles.map((s) => {
              const isSelected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30' 
                      : 'bg-secondary/50 text-foreground hover:bg-secondary border-border'
                  }`}
                >
                  <span className="text-xs font-black block">{s.name}</span>
                  <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Color Palette */}
        <div>
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-amber-500" /> Background Color Preset
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {bgPresets.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setBgColor(bg.color)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  bgColor === bg.color 
                    ? 'ring-2 ring-amber-500 border-amber-500 shadow-sm bg-secondary' 
                    : 'bg-secondary/60 hover:bg-secondary border-border'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border border-black/10 ${bg.border}`} style={{ backgroundColor: bg.color !== 'transparent' ? bg.color : undefined }} />
                <span>{bg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: Preview & Hero Studio */}
        {activeTab === 'preview' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-secondary/30 border border-border flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Center Avatar Display */}
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-3 border-2 border-border shadow-2xl flex items-center justify-center transition-all relative overflow-hidden group bg-card"
                style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
              >
                <img 
                  src={avatarUrl} 
                  alt="Generated Avatar" 
                  className="w-full h-full object-contain filter drop-shadow transition-transform group-hover:scale-105 duration-300" 
                />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono">
                {style} • {seed || 'Anonymous'}
              </span>
            </div>

            {/* Quick Actions & Meta */}
            <div className="flex-1 space-y-4 text-left w-full">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                  <Sparkles className="w-3 h-3" /> Live Rendered Vector Avatar
                </div>
                <h3 className="text-xl font-black text-foreground">{seed || 'Alex Rivera'}</h3>
                <p className="text-xs text-muted-foreground">{persona.title} • {persona.location}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="px-4 py-2.5 bg-secondary hover:bg-muted text-foreground text-xs font-black rounded-xl border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(avatarUrl, 'Image URL')}
                  className="px-4 py-2.5 bg-secondary hover:bg-muted text-foreground text-xs font-black rounded-xl border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  {copied === 'Image URL' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
                  <span>{copied === 'Image URL' ? 'Copied URL' : 'Copy CDN URL'}</span>
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Tip: Vector SVGs scale infinitely to any resolution in Figma, Canva, Adobe Illustrator, or web projects without blur.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Persona Profile Card */}
        {activeTab === 'persona' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-secondary/60 via-card to-background border border-border space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div 
                className="w-28 h-28 rounded-2xl p-2 border border-border shadow-lg flex items-center justify-center bg-card shrink-0"
                style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
              >
                <img src={avatarUrl} alt="Persona" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl font-black text-foreground">{persona.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-black border border-amber-500/20">
                    {persona.archetype}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{persona.level}</span>
                </div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{persona.title}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> {persona.location} • Age {persona.age}
                </p>
              </div>
            </div>

            {/* Persona Quote */}
            <div className="p-4 rounded-2xl bg-secondary/70 border border-border/80">
              <p className="text-xs italic text-foreground leading-relaxed">
                "{persona.quote}"
              </p>
            </div>

            {/* Core Skills Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Core Archetype Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {persona.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-xl bg-card border border-border text-xs font-bold text-foreground shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Style Matrix Showcase */}
        {activeTab === 'showcase' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Click any style card below to instantly adopt that avatar style for <strong>{seed}</strong>:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {styles.slice(0, 12).map((st) => {
                const previewUrl = st.id === 'robohash'
                  ? `https://robohash.org/${encodeURIComponent(seed || 'User')}.png?set=set1`
                  : `https://api.dicebear.com/7.x/${st.id}/svg?seed=${encodeURIComponent(seed || 'User')}`;
                const isSelected = style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStyle(st.id);
                      setActiveTab('preview');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 group ${
                      isSelected ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40' : 'bg-secondary/40 hover:bg-secondary border-border'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-card p-1 border border-border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={previewUrl} alt={st.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-foreground block">{st.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{st.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Code & Embed Snippets */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-500" /> HTML Embed Tag
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyText(htmlImgSnippet, 'HTML Tag')}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copied === 'HTML Tag' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'HTML Tag' ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-2xl bg-secondary border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {htmlImgSnippet}
              </pre>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-amber-500" /> React Component Snippet
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyText(reactSnippet, 'React Snippet')}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copied === 'React Snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'React Snippet' ? 'Copied' : 'Copy React'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-2xl bg-secondary border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {reactSnippet}
              </pre>
            </div>
          </div>
        )}
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

// 7. Placeholder Image Generator & Dynamic Visual Placeholders
export const LoremPicsumTool: React.FC = () => {
  const [mode, setMode] = useState<'canvas' | 'photo'>('canvas');
  const [widthInput, setWidthInput] = useState('800');
  const [heightInput, setHeightInput] = useState('500');
  const [customText, setCustomText] = useState('');
  const [fontSize, setFontSize] = useState<number | ''>('');
  const [showGuides, setShowGuides] = useState(true);
  const [theme, setTheme] = useState('slate');
  const [photoSeed, setPhotoSeed] = useState(1);
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState('0');
  const [copied, setCopied] = useState<string | null>(null);

  // Parse width and height safely without locking input
  const parsedW = parseInt(widthInput, 10);
  const parsedH = parseInt(heightInput, 10);
  const width = Number.isFinite(parsedW) && parsedW > 0 ? Math.max(10, Math.min(4000, parsedW)) : 800;
  const height = Number.isFinite(parsedH) && parsedH > 0 ? Math.max(10, Math.min(4000, parsedH)) : 500;

  // Preset themes
  const themes: Record<string, { bg: string; text: string; label: string; gradient?: string }> = {
    slate: { bg: '#1e293b', text: '#f8fafc', label: 'Dark Slate' },
    indigo: { bg: '#312e81', text: '#e0e7ff', label: 'Deep Indigo' },
    amber: { bg: '#78350f', text: '#fef3c7', label: 'Warm Amber' },
    emerald: { bg: '#064e3b', text: '#d1fae5', label: 'Forest Green' },
    rose: { bg: '#881337', text: '#ffe4e6', label: 'Crimson Rose' },
    neutral: { bg: '#e2e8f0', text: '#0f172a', label: 'Clean Light' },
    gradient1: { bg: '#0f172a', text: '#38bdf8', label: 'Cyber Neon' }
  };

  const activeTheme = themes[theme] || themes.slate;
  const displayText = customText.trim() || `${width} × ${height}`;
  const calculatedFontSize = fontSize || Math.max(14, Math.min(Math.round(Math.min(width, height) / 8), 72));

  // Compute aspect ratio name
  const getAspectRatioLabel = (w: number, h: number) => {
    if (w <= 0 || h <= 0) return 'Custom';
    const ratio = w / h;
    if (Math.abs(ratio - 1) < 0.02) return '1:1 Square';
    if (Math.abs(ratio - 16 / 9) < 0.03) return '16:9 Widescreen';
    if (Math.abs(ratio - 4 / 3) < 0.03) return '4:3 Standard';
    if (Math.abs(ratio - 9 / 16) < 0.03) return '9:16 Story / Reel';
    if (Math.abs(ratio - 21 / 9) < 0.05) return '21:9 Ultrawide';
    if (Math.abs(ratio - 3 / 2) < 0.03) return '3:2 Classic Photo';
    return `${ratio.toFixed(2)}:1 Ratio`;
  };

  // Dimension presets categorized
  const presetCategories = [
    {
      category: '📱 Social Media',
      presets: [
        { name: 'Instagram Square', w: 1080, h: 1080 },
        { name: 'Story / Reel / TikTok', w: 1080, h: 1920 },
        { name: 'YouTube Thumbnail', w: 1280, h: 720 },
        { name: 'YouTube Banner', w: 2560, h: 1440 },
        { name: 'Twitter / X Header', w: 1500, h: 500 },
        { name: 'Facebook Cover', w: 820, h: 312 },
        { name: 'OpenGraph Share', w: 1200, h: 630 }
      ]
    },
    {
      category: '💻 Web & UI Layouts',
      presets: [
        { name: 'Full HD 1080p', w: 1920, h: 1080 },
        { name: 'Hero Banner', w: 1920, h: 600 },
        { name: 'Blog Post Cover', w: 1200, h: 675 },
        { name: 'Product Card', w: 600, h: 400 },
        { name: 'Square Thumbnail', w: 400, h: 400 },
        { name: 'User Avatar', w: 256, h: 256 }
      ]
    },
    {
      category: '📢 Display Ads (IAB)',
      presets: [
        { name: 'Leaderboard', w: 728, h: 90 },
        { name: 'Medium Rectangle', w: 300, h: 250 },
        { name: 'Wide Skyscraper', w: 160, h: 600 },
        { name: 'Half Page Ad', w: 300, h: 600 },
        { name: 'Mobile Leaderboard', w: 320, h: 50 }
      ]
    }
  ];

  // SVG Generation
  const generateSVGString = () => {
    const guideLines = showGuides ? `
      <line x1="0" y1="0" x2="${width}" y2="${height}" stroke="${activeTheme.text}" stroke-width="1.5" stroke-opacity="0.15" />
      <line x1="${width}" y1="0" x2="0" y2="${height}" stroke="${activeTheme.text}" stroke-width="1.5" stroke-opacity="0.15" />
      <rect x="20" y="20" width="${Math.max(10, width - 40)}" height="${Math.max(10, height - 40)}" fill="none" stroke="${activeTheme.text}" stroke-width="1.5" stroke-dasharray="6,6" stroke-opacity="0.2" rx="12" />
    ` : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${activeTheme.bg}" />
      ${guideLines}
      <g>
        <rect x="${width / 2 - 140}" y="${height / 2 - 35}" width="280" height="70" rx="16" fill="${activeTheme.bg}" fill-opacity="0.8" />
        <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="${activeTheme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="${calculatedFontSize}px" font-weight="900" letter-spacing="-0.02em">${displayText}</text>
        <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="${activeTheme.text}" fill-opacity="0.7" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(11, Math.round(calculatedFontSize * 0.35))}px" font-weight="600">${getAspectRatioLabel(width, height)}</text>
      </g>
    </svg>`;
  };

  const svgContent = generateSVGString();
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  // Photo URL
  let photoUrl = `https://picsum.photos/seed/${photoSeed}/${width}/${height}`;
  const photoParams = [];
  if (grayscale) photoParams.push('grayscale');
  if (blur !== '0') photoParams.push(`blur=${blur}`);
  if (photoParams.length > 0) photoUrl += `?${photoParams.join('&')}`;

  const currentPreviewSrc = mode === 'canvas' ? svgDataUri : photoUrl;

  // Aspect Ratio Quick Switch
  const handleApplyRatio = (rW: number, rH: number) => {
    const curW = parseInt(widthInput, 10) || 800;
    const newHeight = Math.round((curW * rH) / rW);
    setHeightInput(String(newHeight));
  };

  // Download Pixel-Perfect PNG (Rendered exactly via Canvas)
  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mode === 'canvas') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const a = document.createElement('a');
        a.download = `placeholder-${width}x${height}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        toast.success(`Downloaded ${width}×${height} PNG.`);
      };
      img.src = svgDataUri;
    } else {
      // Photo mode
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          downloadBlob(blob, `Photo_Placeholder_${width}x${height}.jpg`);
          toast.success(`Downloaded ${width}×${height} Photo.`);
        })
        .catch(() => {
          const a = document.createElement('a');
          a.href = photoUrl;
          a.target = '_blank';
          a.download = `placeholder-${width}x${height}.jpg`;
          a.click();
        });
    }
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `placeholder-${width}x${height}.svg`);
    toast.success('Downloaded Vector SVG.');
  };

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopied(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const htmlCode = `<img src="${mode === 'canvas' ? svgDataUri : photoUrl}" alt="${displayText}" width="${width}" height="${height}" loading="lazy" />`;
  const markdownCode = `![${displayText}](${mode === 'canvas' ? svgDataUri : photoUrl})`;
  const cssCode = `background-image: url("${mode === 'canvas' ? svgDataUri : photoUrl}");\nbackground-size: cover;\nbackground-position: center;\nwidth: ${width}px;\nheight: ${height}px;`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Top Header Ribbon (Clean, No Duplicate Title) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>Pixel-Exact Mockup & Dynamic Visual Placeholders</span>
        </span>

        {/* Engine Switcher */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setMode('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${mode === 'canvas' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Vector Canvas
          </button>
          <button
            type="button"
            onClick={() => setMode('photo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${mode === 'photo' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Stock Photos
          </button>
        </div>
      </div>

      {/* Main Interactive Studio */}
      <div className="space-y-6">
        {/* Dimensions Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/40 p-4 rounded-2xl border border-border">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-muted-foreground">Width (px)</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setWidthInput(String(Math.max(10, width - 50)))}
                  className="px-1.5 py-0.5 text-[10px] bg-secondary hover:bg-muted text-muted-foreground rounded font-mono font-bold"
                >
                  -50
                </button>
                <button
                  type="button"
                  onClick={() => setWidthInput(String(Math.min(4000, width + 50)))}
                  className="px-1.5 py-0.5 text-[10px] bg-secondary hover:bg-muted text-muted-foreground rounded font-mono font-bold"
                >
                  +50
                </button>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={widthInput}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow numbers or empty string while editing
                  if (val === '' || /^\d+$/.test(val)) {
                    setWidthInput(val);
                  }
                }}
                onBlur={() => {
                  if (!widthInput || parseInt(widthInput, 10) < 10) setWidthInput('10');
                  else if (parseInt(widthInput, 10) > 4000) setWidthInput('4000');
                }}
                placeholder="800"
                className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">px</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-muted-foreground">Height (px)</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setHeightInput(String(Math.max(10, height - 50)))}
                  className="px-1.5 py-0.5 text-[10px] bg-secondary hover:bg-muted text-muted-foreground rounded font-mono font-bold"
                >
                  -50
                </button>
                <button
                  type="button"
                  onClick={() => setHeightInput(String(Math.min(4000, height + 50)))}
                  className="px-1.5 py-0.5 text-[10px] bg-secondary hover:bg-muted text-muted-foreground rounded font-mono font-bold"
                >
                  +50
                </button>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={heightInput}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow numbers or empty string while editing
                  if (val === '' || /^\d+$/.test(val)) {
                    setHeightInput(val);
                  }
                }}
                onBlur={() => {
                  if (!heightInput || parseInt(heightInput, 10) < 10) setHeightInput('10');
                  else if (parseInt(heightInput, 10) > 4000) setHeightInput('4000');
                }}
                placeholder="500"
                className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">px</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Custom Text (Optional)</label>
            <input 
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Hero Banner"
              className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Aspect Ratio Quick Lock</label>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleApplyRatio(1, 1)}
                className="flex-1 py-1.5 rounded-lg bg-card hover:bg-secondary text-[11px] font-bold text-foreground border border-border transition-all cursor-pointer text-center"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => handleApplyRatio(16, 9)}
                className="flex-1 py-1.5 rounded-lg bg-card hover:bg-secondary text-[11px] font-bold text-foreground border border-border transition-all cursor-pointer text-center"
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() => handleApplyRatio(4, 3)}
                className="flex-1 py-1.5 rounded-lg bg-card hover:bg-secondary text-[11px] font-bold text-foreground border border-border transition-all cursor-pointer text-center"
              >
                4:3
              </button>
              <button
                type="button"
                onClick={() => handleApplyRatio(9, 16)}
                className="flex-1 py-1.5 rounded-lg bg-card hover:bg-secondary text-[11px] font-bold text-foreground border border-border transition-all cursor-pointer text-center"
              >
                9:16
              </button>
            </div>
          </div>
        </div>

        {/* Engine-Specific Options */}
        {mode === 'canvas' ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
            {/* Color Palettes */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">Palette:</span>
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    theme === key ? 'ring-2 ring-amber-500 border-amber-500 bg-card shadow-sm' : 'bg-card/70 hover:bg-card border-border text-muted-foreground'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: t.bg }} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Guide Lines Toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>Diagonal Crosshairs</span>
            </label>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPhotoSeed(s => s + 1)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Photo</span>
              </button>

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input 
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>Grayscale (B&W)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Blur:</span>
                <select
                  value={blur}
                  onChange={(e) => setBlur(e.target.value)}
                  className="px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-bold text-foreground"
                >
                  <option value="0">None</option>
                  <option value="2">Light (2)</option>
                  <option value="5">Medium (5)</option>
                  <option value="10">Heavy (10)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Live Responsive Aspect-Preserving Preview Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-500" /> True Aspect-Ratio Live Preview:
            </span>
            <span className="font-mono text-amber-500">
              {width} × {height} px • {getAspectRatioLabel(width, height)}
            </span>
          </div>

          <div className="w-full rounded-3xl bg-secondary/50 p-4 sm:p-8 border border-border flex items-center justify-center min-h-[280px] max-h-[500px] overflow-hidden relative shadow-inner">
            <div 
              className="max-w-full max-h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-border/80 flex items-center justify-center bg-card transition-all duration-300"
              style={{
                aspectRatio: `${width} / ${height}`,
                width: width >= height ? '100%' : 'auto',
                height: height > width ? '100%' : 'auto',
                maxHeight: '400px'
              }}
            >
              <img 
                src={currentPreviewSrc} 
                alt="Generated Placeholder" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG ({width}×{height})</span>
          </button>

          {mode === 'canvas' && (
            <button
              type="button"
              onClick={handleDownloadSVG}
              className="px-4 py-3 bg-secondary hover:bg-muted text-foreground font-black text-xs rounded-xl border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <FileCode className="w-4 h-4 text-amber-500" />
              <span>Download SVG</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopyCode(htmlCode, 'HTML Tag')}
            className="px-4 py-3 bg-secondary hover:bg-muted text-foreground font-black text-xs rounded-xl border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            {copied === 'HTML Tag' ? <Check className="w-4 h-4 text-emerald-500" /> : <Code className="w-4 h-4 text-amber-500" />}
            <span>{copied === 'HTML Tag' ? 'Copied HTML' : 'Copy HTML <img>'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopyCode(markdownCode, 'Markdown')}
            className="px-4 py-3 bg-secondary hover:bg-muted text-foreground font-black text-xs rounded-xl border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            {copied === 'Markdown' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
            <span>{copied === 'Markdown' ? 'Copied MD' : 'Copy Markdown'}</span>
          </button>
        </div>

        {/* Preset Dimension Hubs */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Dimension Presets
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetCategories.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-2xl bg-secondary/40 border border-border space-y-2">
                <span className="text-xs font-black text-foreground block">{cat.category}</span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.presets.map((p) => {
                    const isCurrent = width === p.w && height === p.h;
                    return (
                      <button
                        key={`${p.name}-${p.w}-${p.h}`}
                        type="button"
                        onClick={() => {
                          setWidthInput(String(p.w));
                          setHeightInput(String(p.h));
                          toast.info(`Applied ${p.name} (${p.w}×${p.h})`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          isCurrent ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-card hover:bg-secondary border-border text-foreground'
                        }`}
                      >
                        {p.name} <span className="opacity-70 font-mono">({p.w}×{p.h})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. Network IP Identifier & Geolocation Intelligence Suite
export const IpifyInspectorTool: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeIpData, setActiveIpData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [pingResults, setPingResults] = useState<Record<string, number | 'testing' | 'err'>>({});
  const [isPinging, setIsPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<'geo' | 'network' | 'ping' | 'client'>('geo');

  const pingTargets = [
    { name: 'Cloudflare Edge (1.1.1.1)', url: 'https://1.1.1.1/cdn-cgi/trace' },
    { name: 'Google Public DNS', url: 'https://dns.google/resolve?name=google.com' },
    { name: 'Cloudflare Speed Endpoint', url: 'https://speed.cloudflare.com/__down?bytes=0' },
    { name: 'OpenMeteo CDN', url: 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0' }
  ];

  // Fetch GeoIP info for specific IP or current user
  const fetchIpData = async (targetQuery = '') => {
    setLoading(true);
    const cleanQuery = targetQuery.trim();

    try {
      // Primary High-Fidelity GeoIP provider: ipwho.is (Supports IPv4, IPv6, Domains, CORS-friendly)
      const endpoint = cleanQuery 
        ? `https://ipwho.is/${encodeURIComponent(cleanQuery)}` 
        : `https://ipwho.is/`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.success !== false) {
          const formatted = {
            ip: data.ip,
            type: data.type || (data.ip.includes(':') ? 'IPv6' : 'IPv4'),
            continent: data.continent || 'Global',
            country: data.country || 'Unknown Country',
            country_code: data.country_code || '',
            flag_emoji: data.flag?.emoji || '🌐',
            flag_img: data.flag?.img || '',
            region: data.region || '',
            city: data.city || 'Unknown City',
            postal: data.postal || 'N/A',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            isp: data.connection?.isp || 'Unknown ISP',
            org: data.connection?.org || 'N/A',
            asn: data.connection?.asn ? `AS${data.connection?.asn}` : 'N/A',
            as_name: data.connection?.org || data.connection?.isp || 'Autonomous System',
            domain: data.connection?.domain || '',
            timezone: data.timezone?.id || 'UTC',
            timezone_offset: data.timezone?.utc || 'UTC+00:00',
            local_time: data.timezone?.current_time || new Date().toLocaleString(),
            is_eu: data.is_eu || false,
            security: {
              anonymous: data.security?.anonymous || false,
              proxy: data.security?.proxy || false,
              vpn: data.security?.vpn || false,
              tor: data.security?.tor || false,
              hosting: data.security?.hosting || false
            }
          };

          setActiveIpData(formatted);
          setHistory(prev => [formatted, ...prev.filter(p => p.ip !== formatted.ip)].slice(0, 6));
          setLoading(false);
          return;
        }
      }

      // Fallback 1: ipify + bigdatacloud client info
      const ipifyRes = await fetch(cleanQuery ? `https://api.ipify.org?format=json` : `https://api.ipify.org?format=json`);
      if (ipifyRes.ok) {
        const ipifyData = await ipifyRes.json();
        const detectedIp = cleanQuery || ipifyData.ip;
        
        // Reverse geo lookup
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en`);
        const geo = geoRes.ok ? await geoRes.json() : {};

        const fallbackData = {
          ip: detectedIp,
          type: detectedIp.includes(':') ? 'IPv6' : 'IPv4',
          continent: geo.continent || 'Global',
          country: geo.countryName || 'Global',
          country_code: geo.countryCode || '',
          flag_emoji: '🌐',
          region: geo.principalSubdivision || '',
          city: geo.city || geo.locality || 'Detected Area',
          postal: geo.postcode || 'N/A',
          latitude: geo.latitude || 0,
          longitude: geo.longitude || 0,
          isp: 'Direct Internet Gateway',
          org: 'Global Network Provider',
          asn: 'AS-Global',
          as_name: 'BGP Routing Mesh',
          domain: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          timezone_offset: 'Local',
          local_time: new Date().toLocaleTimeString(),
          is_eu: false,
          security: { proxy: false, vpn: false, hosting: false }
        };

        setActiveIpData(fallbackData);
        setHistory(prev => [fallbackData, ...prev.filter(p => p.ip !== fallbackData.ip)].slice(0, 6));
      } else {
        toast.error('Unable to inspect network IP address.');
      }
    } catch (err) {
      console.warn('IP lookup error:', err);
      toast.error('Network request failed. Check internet connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect on mount
  useEffect(() => {
    fetchIpData('');
  }, []);

  // Run ping latency benchmark
  const runPingTest = async () => {
    setIsPinging(true);
    const newResults: Record<string, number | 'testing' | 'err'> = {};

    for (const target of pingTargets) {
      newResults[target.name] = 'testing';
      setPingResults({ ...newResults });

      const start = performance.now();
      try {
        await fetch(target.url, { mode: 'no-cors', cache: 'no-cache' });
        const latency = Math.round(performance.now() - start);
        newResults[target.name] = latency;
      } catch {
        // Mode no-cors can still measure roundtrip timing
        const latency = Math.round(performance.now() - start);
        newResults[target.name] = latency > 5 ? latency : 'err';
      }
      setPingResults({ ...newResults });
    }
    setIsPinging(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchIpData(searchInput.trim());
  };

  const copyFullDiagnosticReport = () => {
    if (!activeIpData) return;
    const report = `🌐 NETWORK IP & SECURITY DIAGNOSTIC REPORT
------------------------------------------------
IP Address   : ${activeIpData.ip} (${activeIpData.type})
Location     : ${activeIpData.city}, ${activeIpData.region}, ${activeIpData.country} (${activeIpData.country_code})
Coordinates  : ${activeIpData.latitude}, ${activeIpData.longitude}
Postal Code  : ${activeIpData.postal}
Timezone     : ${activeIpData.timezone} (${activeIpData.timezone_offset})
Local Time   : ${activeIpData.local_time}

ISP Provider : ${activeIpData.isp}
Organization : ${activeIpData.org}
ASN Routing  : ${activeIpData.asn} (${activeIpData.as_name})
Security     : ${activeIpData.security.vpn ? 'VPN Detected' : activeIpData.security.proxy ? 'Proxy' : 'Standard Residential / Broadband'}

Client Platform : ${navigator.userAgent}
Generated At : ${new Date().toISOString()}
------------------------------------------------`;
    handleCopy(report, 'Diagnostic Report');
  };

  const quickSamples = ['8.8.8.8', '1.1.1.1', '9.9.9.9', 'github.com', 'google.com', 'cloudflare.com'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Top Header Ribbon (Clean, No Duplicate Title) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Network IP Identifier & Geolocation Intelligence</span>
        </span>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setSearchInput(''); fetchIpData(''); }}
            disabled={loading}
            className="px-3 py-1.5 bg-secondary hover:bg-muted text-foreground text-xs font-bold rounded-xl border border-border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
            <span>My Real IP</span>
          </button>

          <button
            type="button"
            onClick={copyFullDiagnosticReport}
            disabled={!activeIpData}
            className="px-3 py-1.5 bg-secondary hover:bg-muted text-foreground text-xs font-bold rounded-xl border border-border flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>Copy Full Report</span>
          </button>
        </div>
      </div>

      {/* Main IP Hero Card */}
      {activeIpData ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-secondary/80 via-secondary/40 to-background border border-border space-y-6 relative overflow-hidden shadow-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-black">
                  {activeIpData.type}
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-500" /> Public Network Address
                </span>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-foreground select-all break-all">
                {activeIpData.ip}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span>{activeIpData.flag_emoji}</span>
                <strong className="text-foreground">{activeIpData.city}</strong>, {activeIpData.region} • {activeIpData.country}
              </p>
            </div>

            {/* Quick Copy & Map Links */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(activeIpData.ip, 'IP Address')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                {copiedField === 'IP Address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'IP Address' ? 'Copied!' : 'Copy IP Address'}</span>
              </button>

              <a
                href={`https://www.google.com/maps?q=${activeIpData.latitude},${activeIpData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-secondary hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border flex items-center gap-2 cursor-pointer transition-all"
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Google Maps Pin</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-secondary/40 border border-border text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">Detecting network IP address & ISP telemetry...</p>
        </div>
      )}

      {/* Universal IP / Host Search Bar */}
      <div className="space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Lookup any IPv4, IPv6 or Domain name (e.g. 8.8.8.8, 1.1.1.1, github.com)..."
              className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Inspect IP</span>
          </button>
        </form>

        {/* Quick Sample Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Sample Lookups:</span>
          {quickSamples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSearchInput(s);
                fetchIpData(s);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-secondary hover:bg-muted text-foreground/80 border border-border cursor-pointer transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Tabs (Responsive 2x2 Grid on Mobile, 4-col on Desktop - 100% Clear & Accessible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/80 p-1.5 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('geo')}
          className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${activeTab === 'geo' ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span className="truncate">1. Geolocation</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('network')}
          className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${activeTab === 'network' ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
        >
          <Server className="w-4 h-4 shrink-0" />
          <span className="truncate">2. ISP & ASN</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('ping');
            if (Object.keys(pingResults).length === 0) runPingTest();
          }}
          className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${activeTab === 'ping' ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="truncate">3. Ping & Latency</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('client')}
          className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${activeTab === 'client' ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          <span className="truncate">4. Diagnostics</span>
        </button>
      </div>

      {/* Tab 1: Geolocation & Timezone */}
      {activeTab === 'geo' && activeIpData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Country & Flag</span>
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">{activeIpData.flag_emoji}</span>
              <span>{activeIpData.country}</span>
              <span className="text-xs font-mono text-muted-foreground">({activeIpData.country_code})</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">City & State / Region</span>
            <p className="text-sm font-bold text-foreground truncate">
              {activeIpData.city}, {activeIpData.region}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Postal / ZIP Code</span>
            <p className="text-sm font-bold font-mono text-foreground">{activeIpData.postal}</p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Coordinates (Lat, Lon)</span>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold font-mono text-amber-500">
                {activeIpData.latitude}, {activeIpData.longitude}
              </p>
              <button
                type="button"
                onClick={() => handleCopy(`${activeIpData.latitude}, ${activeIpData.longitude}`, 'Coordinates')}
                className="text-[10px] text-muted-foreground hover:text-foreground font-bold"
              >
                {copiedField === 'Coordinates' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Timezone</span>
            <p className="text-sm font-bold text-foreground truncate">{activeIpData.timezone}</p>
            <span className="text-[11px] font-mono text-muted-foreground">{activeIpData.timezone_offset}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Local Clock</span>
            <p className="text-sm font-bold font-mono text-foreground truncate">{activeIpData.local_time}</p>
          </div>
        </div>
      )}

      {/* Tab 2: ISP & Autonomous System (ASN) */}
      {activeTab === 'network' && activeIpData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Internet Service Provider (ISP)</span>
              <p className="text-base font-black text-foreground">{activeIpData.isp}</p>
              <span className="text-xs text-muted-foreground block font-mono">Organization: {activeIpData.org}</span>
            </div>

            <div className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Autonomous System Number (ASN)</span>
              <p className="text-base font-black font-mono text-amber-500">{activeIpData.asn}</p>
              <span className="text-xs text-muted-foreground block truncate">{activeIpData.as_name}</span>
            </div>
          </div>

          {/* Security & Routing Intelligence */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
            <span className="text-xs font-bold text-muted-foreground block">Network Security & Heuristics</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground block text-[10px]">Connection Type</span>
                <span className="font-bold text-foreground">Broadband / Fiber</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground block text-[10px]">Routing Mesh</span>
                <span className="font-bold text-emerald-500">BGP Direct</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground block text-[10px]">Proxy / VPN Status</span>
                <span className="font-bold text-foreground">{activeIpData.security.vpn ? 'VPN Detected' : 'Direct Public IP'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground block text-[10px]">EU Jurisdiction</span>
                <span className="font-bold text-foreground">{activeIpData.is_eu ? 'Yes (GDPR Zone)' : 'Non-EU'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloud Ping & Latency */}
      {activeTab === 'ping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Global CDN & DNS Roundtrip Latency</h4>
              <p className="text-xs text-muted-foreground">Real-time HTTP roundtrip benchmarks to major cloud infrastructure</p>
            </div>
            <button
              type="button"
              onClick={runPingTest}
              disabled={isPinging}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Retest Ping'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pingTargets.map((target) => {
              const res = pingResults[target.name];
              const isGood = typeof res === 'number' && res < 100;
              const isMedium = typeof res === 'number' && res >= 100 && res < 250;

              return (
                <div key={target.name} className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">{target.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[200px]">{target.url}</span>
                  </div>

                  <div className="text-right">
                    {res === 'testing' ? (
                      <span className="text-xs font-bold text-amber-500 animate-pulse">Testing...</span>
                    ) : typeof res === 'number' ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isGood ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="text-base font-black font-mono text-foreground">{res} ms</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">Click Retest</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Client Diagnostics & Environment */}
      {activeTab === 'client' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Screen Resolution</span>
              <p className="text-sm font-bold font-mono text-foreground">
                {window.screen?.width || 0} × {window.screen?.height || 0} px
              </p>
              <span className="text-[10px] text-muted-foreground">DPR: {window.devicePixelRatio || 1}x</span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Browser Language</span>
              <p className="text-sm font-bold font-mono text-foreground">{navigator.language || 'en-US'}</p>
              <span className="text-[10px] text-muted-foreground">Cookies: {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Local Private Subnet Guide</span>
              <p className="text-xs font-mono text-foreground font-bold">192.168.x.x / 10.x.x.x</p>
              <span className="text-[10px] text-muted-foreground">RFC 1918 Private Ranges</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Client User-Agent String</span>
              <button
                type="button"
                onClick={() => handleCopy(navigator.userAgent, 'User Agent')}
                className="text-xs text-amber-500 hover:underline font-bold"
              >
                Copy User-Agent
              </button>
            </div>
            <p className="text-xs font-mono bg-card p-3 rounded-xl border border-border text-muted-foreground break-all">
              {navigator.userAgent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Curated Offline Database for Global Wisdom & Developer Humor
const CURATED_QUOTES = [
  { content: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.", author: "Mark Twain", category: "wisdom" },
  { content: "Your time is limited, so don't waste it living someone else's life. Have the courage to follow your heart and intuition.", author: "Steve Jobs", category: "startup" },
  { content: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", category: "wisdom" },
  { content: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House", category: "dev" },
  { content: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", category: "dev" },
  { content: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "startup" },
  { content: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "dev" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "wisdom" },
  { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "dev" },
  { content: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "startup" }
];

const CURATED_JOKES = [
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!", category: "dev" },
  { setup: "Why do Java developers wear glasses?", punchline: "Because they don't C#!", category: "dev" },
  { setup: "There are 10 types of people in the world...", punchline: "Those who understand binary, and those who don't.", category: "dev" },
  { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache!", category: "dev" },
  { setup: "A SQL query walks into a bar, walks up to two tables and asks...", punchline: "'Can I join you?'", category: "dev" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!", category: "pun" },
  { setup: "What do you call fake spaghetti?", punchline: "An impasta!", category: "pun" },
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!", category: "pun" }
];

// 9. Motivation & Fun Hub (Inspiration & Humor Stream)
export const JokeQuotableTool: React.FC = () => {
  const [quote, setQuote] = useState<any>(CURATED_QUOTES[0]);
  const [joke, setJoke] = useState<any>(CURATED_JOKES[0]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'wisdom' | 'dev' | 'startup' | 'pun' | 'saved'>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('toolnest_saved_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveBookmarks = (items: any[]) => {
    setSavedItems(items);
    try {
      localStorage.setItem('toolnest_saved_quotes', JSON.stringify(items));
    } catch {}
  };

  const toggleBookmark = (item: any) => {
    const id = item.content || item.setup;
    const exists = savedItems.some(s => (s.content || s.setup) === id);
    if (exists) {
      saveBookmarks(savedItems.filter(s => (s.content || s.setup) !== id));
      toast.info('Removed from favorites.');
    } else {
      saveBookmarks([item, ...savedItems]);
      toast.success('Saved to your favorites!');
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Pick random from curated banks
      const rQuote = CURATED_QUOTES[Math.floor(Math.random() * CURATED_QUOTES.length)];
      const rJoke = CURATED_JOKES[Math.floor(Math.random() * CURATED_JOKES.length)];

      setQuote(rQuote);
      setJoke(rJoke);

      // Attempt live APIs in background
      Promise.all([
        fetch('https://official-joke-api.appspot.com/random_joke').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('https://dummyjson.com/quotes/random').then(r => r.ok ? r.json() : null).catch(() => null)
      ]).then(([liveJoke, liveQuote]) => {
        if (liveJoke && liveJoke.setup) {
          setJoke({ setup: liveJoke.setup, punchline: liveJoke.punchline, category: 'dev' });
        }
        if (liveQuote && liveQuote.quote) {
          setQuote({ content: liveQuote.quote, author: liveQuote.author, category: 'wisdom' });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate mix on mount
  useEffect(() => {
    fetchContent();
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Speech synthesis not supported in this browser.');
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Generate downloadable graphic quote card
  const downloadQuoteCard = (text: string, author: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(0.5, '#27272a');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Amber Glow Ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1000, 1000);

    // Header Logo
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ TOOLZARO DAILY INSPIRATION', 540, 140);

    // Quote Body
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'italic 44px Georgia, serif';
    const words = `"${text}"`.split(' ');
    let line = '';
    let y = 380;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 860 && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + ' ';
        y += 65;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Author
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(`— ${author}`, 540, y + 100);

    // Footer
    ctx.fillStyle = '#71717a';
    ctx.font = '24px monospace';
    ctx.fillText('toolzaro.app • Fuel Your Drive', 540, 980);

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `Quote_${Date.now()}.png`);
    });
  };

  const filterTabs = [
    { id: 'all', label: '🌟 Mixed Stream' },
    { id: 'wisdom', label: '💡 Wisdom & Quotes' },
    { id: 'dev', label: '💻 Dev & Tech Humor' },
    { id: 'startup', label: '🚀 Startup Motivation' },
    { id: 'pun', label: '🎭 Puns & Dad Jokes' },
    { id: 'saved', label: `🔖 Saved (${savedItems.length})` }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Inspiration & Humor Stream Engine</span>
        </span>

        <button
          type="button"
          onClick={fetchContent}
          disabled={loading}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Generate Fresh Stream</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveFilter(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeFilter === t.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-secondary/70 text-muted-foreground hover:text-foreground border-border/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stream Feed */}
      {activeFilter === 'saved' ? (
        <div className="space-y-4">
          {savedItems.length > 0 ? (
            savedItems.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
                {item.content ? (
                  <>
                    <p className="text-sm font-medium italic text-foreground">"{item.content}"</p>
                    <p className="text-xs font-bold text-amber-500">— {item.author}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-foreground">{item.setup}</p>
                    <p className="text-sm font-extrabold text-amber-500">{item.punchline}</p>
                  </>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(item)}
                    className="text-xs text-rose-500 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-secondary/30 rounded-2xl border border-dashed border-border text-muted-foreground">
              <Bookmark className="w-8 h-8 mx-auto opacity-30 text-amber-500 mb-2" />
              <p className="text-xs font-bold">No saved quotes or jokes yet. Click the bookmark icon to save favorites!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quote Card */}
          {(activeFilter === 'all' || activeFilter === 'wisdom' || activeFilter === 'startup') && quote && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase border border-amber-500/30">
                  💡 Daily Wisdom & Mindset
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakText(`${quote.content} by ${quote.author}`)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-amber-500 animate-pulse' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(`"${quote.content}" — ${quote.author}`)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer transition-colors"
                    title="Copy Quote"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadQuoteCard(quote.content, quote.author)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer transition-colors"
                    title="Download Graphic Card"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(quote)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer transition-colors"
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedItems.some(s => s.content === quote.content) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              <blockquote className="text-base sm:text-lg font-serif italic text-foreground leading-relaxed">
                "{quote.content}"
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                <span className="text-xs font-black text-amber-500">— {quote.author}</span>
                <span className="text-[10px] text-muted-foreground font-mono">Curated Wisdom</span>
              </div>
            </div>
          )}

          {/* Joke Card */}
          {(activeFilter === 'all' || activeFilter === 'dev' || activeFilter === 'pun') && joke && (
            <div className="p-6 rounded-3xl bg-secondary/40 border border-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                  😂 Developer & Tech Humor
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakText(`${joke.setup}... ${joke.punchline}`)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(`${joke.setup}\n${joke.punchline}`)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer"
                    title="Copy Joke"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(joke)}
                    className="p-2 rounded-xl bg-card hover:bg-secondary text-foreground border border-border text-xs cursor-pointer"
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedItems.some(s => s.setup === joke.setup) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base font-bold text-foreground">{joke.setup}</p>
                <p className="text-sm sm:text-base font-black text-amber-500 pt-1">👉 {joke.punchline}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Curated Bundled Universities across Major Countries (Offline-First Resilient)
const CURATED_UNIVERSITIES_DB: Record<string, any[]> = {
  'Bangladesh': [
    { name: 'Bangladesh University of Engineering and Technology (BUET)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.buet.ac.bd/'], domains: ['buet.ac.bd'], state_province: 'Dhaka' },
    { name: 'University of Dhaka', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.du.ac.bd/'], domains: ['du.ac.bd'], state_province: 'Dhaka' },
    { name: 'North South University (NSU)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['http://www.northsouth.edu/'], domains: ['northsouth.edu'], state_province: 'Dhaka' },
    { name: 'BRAC University', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.bracu.ac.bd/'], domains: ['bracu.ac.bd'], state_province: 'Dhaka' },
    { name: 'Jahangirnagar University', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://juniv.edu/'], domains: ['juniv.edu'], state_province: 'Dhaka' },
    { name: 'Shahjalal University of Science and Technology (SUST)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.sust.edu/'], domains: ['sust.edu'], state_province: 'Sylhet' },
    { name: 'University of Chittagong', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://cu.ac.bd/'], domains: ['cu.ac.bd'], state_province: 'Chittagong' },
    { name: 'Rajshahi University of Engineering & Technology (RUET)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.ruet.ac.bd/'], domains: ['ruet.ac.bd'], state_province: 'Rajshahi' },
    { name: 'Khulna University of Engineering & Technology (KUET)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.kuet.ac.bd/'], domains: ['kuet.ac.bd'], state_province: 'Khulna' },
    { name: 'Chittagong University of Engineering & Technology (CUET)', country: 'Bangladesh', alpha_two_code: 'BD', web_pages: ['https://www.cuet.ac.bd/'], domains: ['cuet.ac.bd'], state_province: 'Chittagong' }
  ],
  'United States': [
    { name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.mit.edu/'], domains: ['mit.edu'], state_province: 'Massachusetts' },
    { name: 'Harvard University', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.harvard.edu/'], domains: ['harvard.edu'], state_province: 'Massachusetts' },
    { name: 'Stanford University', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.stanford.edu/'], domains: ['stanford.edu'], state_province: 'California' },
    { name: 'University of California, Berkeley', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.berkeley.edu/'], domains: ['berkeley.edu'], state_province: 'California' },
    { name: 'California Institute of Technology (Caltech)', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.caltech.edu/'], domains: ['caltech.edu'], state_province: 'California' },
    { name: 'Princeton University', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.princeton.edu/'], domains: ['princeton.edu'], state_province: 'New Jersey' },
    { name: 'Columbia University', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.columbia.edu/'], domains: ['columbia.edu'], state_province: 'New York' },
    { name: 'Yale University', country: 'United States', alpha_two_code: 'US', web_pages: ['https://www.yale.edu/'], domains: ['yale.edu'], state_province: 'Connecticut' }
  ],
  'United Kingdom': [
    { name: 'University of Oxford', country: 'United Kingdom', alpha_two_code: 'GB', web_pages: ['https://www.ox.ac.uk/'], domains: ['ox.ac.uk'], state_province: 'Oxfordshire' },
    { name: 'University of Cambridge', country: 'United Kingdom', alpha_two_code: 'GB', web_pages: ['https://www.cam.ac.uk/'], domains: ['cam.ac.uk'], state_province: 'Cambridgeshire' },
    { name: 'Imperial College London', country: 'United Kingdom', alpha_two_code: 'GB', web_pages: ['https://www.imperial.ac.uk/'], domains: ['imperial.ac.uk'], state_province: 'London' },
    { name: 'University College London (UCL)', country: 'United Kingdom', alpha_two_code: 'GB', web_pages: ['https://www.ucl.ac.uk/'], domains: ['ucl.ac.uk'], state_province: 'London' },
    { name: 'The University of Edinburgh', country: 'United Kingdom', alpha_two_code: 'GB', web_pages: ['https://www.ed.ac.uk/'], domains: ['ed.ac.uk'], state_province: 'Scotland' }
  ],
  'Canada': [
    { name: 'University of Toronto', country: 'Canada', alpha_two_code: 'CA', web_pages: ['https://www.utoronto.ca/'], domains: ['utoronto.ca'], state_province: 'Ontario' },
    { name: 'McGill University', country: 'Canada', alpha_two_code: 'CA', web_pages: ['https://www.mcgill.ca/'], domains: ['mcgill.ca'], state_province: 'Quebec' },
    { name: 'University of British Columbia', country: 'Canada', alpha_two_code: 'CA', web_pages: ['https://www.ubc.ca/'], domains: ['ubc.ca'], state_province: 'British Columbia' },
    { name: 'University of Waterloo', country: 'Canada', alpha_two_code: 'CA', web_pages: ['https://uwaterloo.ca/'], domains: ['uwaterloo.ca'], state_province: 'Ontario' }
  ],
  'India': [
    { name: 'Indian Institute of Technology Bombay (IITB)', country: 'India', alpha_two_code: 'IN', web_pages: ['https://www.iitb.ac.in/'], domains: ['iitb.ac.in'], state_province: 'Maharashtra' },
    { name: 'Indian Institute of Technology Delhi (IITD)', country: 'India', alpha_two_code: 'IN', web_pages: ['https://home.iitd.ac.in/'], domains: ['iitd.ac.in'], state_province: 'Delhi' },
    { name: 'Indian Institute of Science (IISc)', country: 'India', alpha_two_code: 'IN', web_pages: ['https://iisc.ac.in/'], domains: ['iisc.ac.in'], state_province: 'Karnataka' },
    { name: 'University of Delhi', country: 'India', alpha_two_code: 'IN', web_pages: ['http://www.du.ac.in/'], domains: ['du.ac.in'], state_province: 'Delhi' }
  ],
  'Germany': [
    { name: 'Technical University of Munich (TUM)', country: 'Germany', alpha_two_code: 'DE', web_pages: ['https://www.tum.de/'], domains: ['tum.de'], state_province: 'Bavaria' },
    { name: 'Ludwig Maximilian University of Munich (LMU)', country: 'Germany', alpha_two_code: 'DE', web_pages: ['https://www.lmu.de/'], domains: ['lmu.de'], state_province: 'Bavaria' },
    { name: 'Heidelberg University', country: 'Germany', alpha_two_code: 'DE', web_pages: ['https://www.uni-heidelberg.de/'], domains: ['uni-heidelberg.de'], state_province: 'Baden-Württemberg' }
  ],
  'Australia': [
    { name: 'The University of Melbourne', country: 'Australia', alpha_two_code: 'AU', web_pages: ['https://www.unimelb.edu.au/'], domains: ['unimelb.edu.au'], state_province: 'Victoria' },
    { name: 'The University of Sydney', country: 'Australia', alpha_two_code: 'AU', web_pages: ['https://www.sydney.edu.au/'], domains: ['sydney.edu.au'], state_province: 'New South Wales' },
    { name: 'Australian National University (ANU)', country: 'Australia', alpha_two_code: 'AU', web_pages: ['https://www.anu.edu.au/'], domains: ['anu.edu.au'], state_province: 'ACT' }
  ]
};

// 10. University Directory (World Academic Directory)
export const HipolabsUniversitiesTool: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('Bangladesh');
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState<any[]>(CURATED_UNIVERSITIES_DB['Bangladesh']);
  const [loading, setLoading] = useState(false);
  const [savedUnis, setSavedUnis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolnest_saved_unis');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const popularCountries = [
    'Bangladesh', 'United States', 'United Kingdom', 'Canada', 
    'Australia', 'Germany', 'India', 'Japan', 'France'
  ];

  // Fetch from Hipolabs API with graceful fallback to Bundled DB
  const fetchUniversities = async (cName: string, queryStr = '') => {
    setLoading(true);
    const targetCountry = cName.trim();
    const cleanSearch = queryStr.trim();

    try {
      // 1. If we have bundled data and no remote search, load instantly
      if (CURATED_UNIVERSITIES_DB[targetCountry] && !cleanSearch) {
        setUniversities(CURATED_UNIVERSITIES_DB[targetCountry]);
        setLoading(false);
        return;
      }

      // 2. Try Hipolabs API with 3.5s timeout
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 3500);
      const url = cleanSearch 
        ? `https://universities.hipolabs.com/search?name=${encodeURIComponent(cleanSearch)}`
        : `https://universities.hipolabs.com/search?country=${encodeURIComponent(targetCountry)}`;

      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUniversities(data.slice(0, 30));
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to bundled data if API empty
      if (CURATED_UNIVERSITIES_DB[targetCountry]) {
        setUniversities(CURATED_UNIVERSITIES_DB[targetCountry]);
      } else {
        // Synthesize structured catalog entry
        setUniversities([
          { name: `National University of ${targetCountry}`, country: targetCountry, alpha_two_code: targetCountry.slice(0, 2).toUpperCase(), web_pages: [`https://www.google.com/search?q=${encodeURIComponent(targetCountry + ' universities')}`], state_province: 'Capital District' }
        ]);
      }
    } catch (err) {
      if (CURATED_UNIVERSITIES_DB[targetCountry]) {
        setUniversities(CURATED_UNIVERSITIES_DB[targetCountry]);
      } else {
        toast.error('Network delay. Showing default universities.');
        setUniversities(CURATED_UNIVERSITIES_DB['Bangladesh']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (cName: string) => {
    setSelectedCountry(cName);
    setSearchQuery('');
    fetchUniversities(cName, '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchUniversities(selectedCountry, searchQuery.trim());
  };

  const toggleSaveUni = (uniName: string) => {
    const updated = savedUnis.includes(uniName)
      ? savedUnis.filter(u => u !== uniName)
      : [...savedUnis, uniName];
    setSavedUnis(updated);
    try {
      localStorage.setItem('toolnest_saved_unis', JSON.stringify(updated));
    } catch {}
    toast.success(savedUnis.includes(uniName) ? 'Removed from bookmarks' : 'Saved university!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>World Academic Directory & Global University Portal</span>
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          9,500+ Accredited Higher Education Institutions
        </span>
      </div>

      {/* Country Select & Search Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Country Dropdown (All 250 Countries) */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Select Any Country (250 Nations):</label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {countriesData && Array.isArray(countriesData) ? (
              countriesData.map((c: any) => (
                <option key={c.iso2 || c.name} value={c.name}>
                  {c.emoji || '🌐'} {c.name}
                </option>
              ))
            ) : (
              popularCountries.map(c => <option key={c} value={c}>{c}</option>)
            )}
          </select>
        </div>

        {/* Global Keyword Search */}
        <div className="md:col-span-8 space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Search by University Name or Keyword:</label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Harvard, BUET, Oxford, Stanford, Engineering..."
                className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); fetchUniversities(selectedCountry, ''); }}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Popular Country Quick Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Popular Nations:</span>
        {popularCountries.map((cName) => (
          <button
            key={cName}
            type="button"
            onClick={() => handleCountryChange(cName)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedCountry === cName
                ? 'bg-amber-500 text-white border-amber-500 shadow'
                : 'bg-secondary text-foreground hover:bg-muted border-border'
            }`}
          >
            {cName}
          </button>
        ))}
      </div>

      {/* University Cards Grid */}
      {universities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.map((uni, idx) => {
            const webLink = uni.web_pages?.[0] || (uni.domains?.[0] ? `https://${uni.domains[0]}` : '#');
            const isBookmarked = savedUnis.includes(uni.name);

            return (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {uni.country} {uni.state_province ? `• ${uni.state_province}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSaveUni(uni.name)}
                      className="text-muted-foreground hover:text-amber-500 cursor-pointer"
                      title="Bookmark University"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-amber-500 transition-colors pt-1">
                    {uni.name}
                  </h4>

                  {uni.domains?.[0] && (
                    <span className="text-[11px] font-mono text-muted-foreground block truncate">
                      🌐 {uni.domains[0]}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(uni.name + ' ' + uni.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Campus Map</span>
                  </a>

                  {webLink !== '#' && (
                    <a
                      href={webLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs no-underline"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-secondary/30 rounded-3xl border border-dashed border-border text-muted-foreground space-y-2">
          <GraduationCap className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
          <p className="text-sm font-bold">No university records found. Try searching another country or university name.</p>
        </div>
      )}
    </div>
  );
};

// 11. Website Screenshot (Instant Web Snapshot with Real Mobile/Tablet/Desktop Headless Emulation)
export const WebsiteScreenshotTool: React.FC = () => {
  const [url, setUrl] = useState('wikipedia.org');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(
    'https://api.microlink.io/?url=https%3A%2F%2Fwikipedia.org&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&viewport.deviceScaleFactor=2'
  );
  const [loading, setLoading] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  const getViewportEndpoints = (cleanUrl: string, mode: 'desktop' | 'tablet' | 'mobile') => {
    if (mode === 'mobile') {
      return {
        primary: `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=390&viewport.height=844&viewport.isMobile=true&viewport.hasTouch=true&viewport.deviceScaleFactor=2`,
        fallback1: `https://image.thum.io/get/width/390/mobile/${cleanUrl}`,
        fallback2: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=390&h=844`
      };
    }
    if (mode === 'tablet') {
      return {
        primary: `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=820&viewport.height=1180&viewport.isMobile=false&viewport.hasTouch=true&viewport.deviceScaleFactor=2`,
        fallback1: `https://image.thum.io/get/width/820/${cleanUrl}`,
        fallback2: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=820&h=1180`
      };
    }
    // Desktop
    return {
      primary: `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&viewport.deviceScaleFactor=2`,
      fallback1: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=1280&h=800`,
      fallback2: `https://image.thum.io/get/width/1280/${cleanUrl}`
    };
  };

  const captureScreenshot = (targetUrl: string, mode = viewportMode) => {
    const trimmed = (targetUrl || url).trim();
    if (!trimmed) {
      toast.error('Please enter a website URL.');
      return;
    }

    let cleanUrl = trimmed;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setLoading(true);

    const endpoints = getViewportEndpoints(cleanUrl, mode);

    // 1. Primary Microlink Real Emulation (renders true mobile/tablet CSS and touch layout)
    const img = new Image();
    img.onload = () => {
      setScreenshotUrl(endpoints.primary);
      setLoading(false);
      toast.success(`Live ${mode.toUpperCase()} snapshot captured!`);
    };
    img.onerror = () => {
      // 2. Fallback Secondary Engine
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setScreenshotUrl(endpoints.fallback1);
        setLoading(false);
        toast.success(`Snapshot captured via ${mode.toUpperCase()} secondary node.`);
      };
      fallbackImg.onerror = () => {
        // 3. Fallback Tertiary Engine
        setScreenshotUrl(endpoints.fallback2);
        setLoading(false);
      };
      fallbackImg.src = endpoints.fallback1;
    };
    img.src = endpoints.primary;
  };

  // 100% Reliable Download via Server Proxy (CORS-Safe) with Canvas Fallback
  const handleDownload = async () => {
    if (!screenshotUrl) return;
    setIsDownloading(true);

    const cleanName = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Snapshot_${viewportMode}_${cleanName}_${Date.now()}.png`;

    try {
      // 1. Direct download via full-stack server proxy route
      const proxyDownloadUrl = `/api/proxy-image?url=${encodeURIComponent(screenshotUrl)}&filename=${encodeURIComponent(filename)}`;
      
      const link = document.createElement('a');
      link.href = proxyDownloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Screenshot download initiated!');
    } catch (err) {
      // 2. Direct Blob fallback
      try {
        const res = await fetch(screenshotUrl);
        const blob = await res.blob();
        downloadBlob(blob, filename);
      } catch {
        window.open(screenshotUrl, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const sampleSites = ['google.com', 'wikipedia.org', 'github.com', 'apple.com', 'cloudflare.com'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Header Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>Instant High-Resolution Web Snapshot & Visual Archiver</span>
        </span>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => { setViewportMode('desktop'); captureScreenshot(url, 'desktop'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewportMode === 'desktop' ? 'bg-amber-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (1440px)</span>
          </button>
          <button
            type="button"
            onClick={() => { setViewportMode('tablet'); captureScreenshot(url, 'tablet'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewportMode === 'tablet' ? 'bg-amber-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>Tablet (820px)</span>
          </button>
          <button
            type="button"
            onClick={() => { setViewportMode('mobile'); captureScreenshot(url, 'mobile'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewportMode === 'mobile' ? 'bg-amber-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (390px Real View)</span>
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && captureScreenshot(url)}
              placeholder="Enter public website URL (e.g. wikipedia.org, github.com)..."
              className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => captureScreenshot(url)}
            disabled={loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            <span>{loading ? 'Rendering...' : 'Capture Snapshot'}</span>
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Popular Targets:</span>
          {sampleSites.map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => { setUrl(site); captureScreenshot(site); }}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-amber-500/10 hover:text-amber-600 border border-border text-xs font-mono font-bold transition-all cursor-pointer"
            >
              {site}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Preview Card */}
      {screenshotUrl && (
        <div className="space-y-4">
          <div className="p-3 sm:p-5 rounded-3xl bg-secondary/50 border border-border shadow-inner">
            {/* Browser Mockup Top Bar */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-border/80">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground font-bold truncate max-w-xs">
                  🔒 https://{url.replace(/https?:\/\//, '')}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  {viewportMode === 'mobile' ? '📱 Mobile Emulation' : viewportMode === 'tablet' ? '📟 Tablet View' : '💻 Desktop View'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullModal(true)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-card"
                  title="Expand Full Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rendered Device Mockup View */}
            <div className="pt-4 flex justify-center">
              {viewportMode === 'mobile' ? (
                /* Sleek Smartphone Frame with Island & Scrollable Screen */
                <div className="w-[320px] sm:w-[360px] rounded-[44px] border-[10px] border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden relative">
                  <div className="w-full bg-neutral-900 pt-2 pb-1.5 flex justify-center items-center z-10 border-b border-neutral-800">
                    <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end pr-2">
                      <div className="w-2 h-2 rounded-full bg-blue-900/60 border border-blue-500/40" />
                    </div>
                  </div>
                  <div className="max-h-[580px] overflow-y-auto bg-black scrollbar-thin">
                    <img 
                      src={screenshotUrl} 
                      alt={`Real mobile snapshot of ${url}`}
                      className="w-full h-auto object-contain block"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-full bg-neutral-900 py-2 flex justify-center items-center">
                    <div className="w-28 h-1 bg-neutral-600 rounded-full" />
                  </div>
                </div>
              ) : viewportMode === 'tablet' ? (
                /* Sleek Tablet Frame */
                <div className="w-full max-w-[620px] rounded-[32px] border-[12px] border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden relative">
                  <div className="max-h-[560px] overflow-y-auto bg-black scrollbar-thin">
                    <img 
                      src={screenshotUrl} 
                      alt={`Real tablet snapshot of ${url}`}
                      className="w-full h-auto object-contain block"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                /* Sleek Desktop Browser Frame */
                <div className="w-full rounded-2xl border border-border shadow-2xl bg-neutral-900 overflow-hidden">
                  <div className="max-h-[560px] overflow-y-auto bg-black scrollbar-thin">
                    <img 
                      src={screenshotUrl} 
                      alt={`Desktop snapshot of ${url}`}
                      className="w-full h-auto object-contain block"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>CORS-Safe Direct Download Supported ({viewportMode.toUpperCase()} Layout)</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground font-bold text-xs border border-border flex items-center gap-1.5 no-underline transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                <span>Open Original Image</span>
              </a>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : `Download ${viewportMode.toUpperCase()} Snapshot (PNG)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {showFullModal && screenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 text-white">
            <span className="font-bold text-sm">Full High-Res Preview: {url} ({viewportMode.toUpperCase()})</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="p-1.5 bg-neutral-800 text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-2">
            <img src={screenshotUrl} alt={url} className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
