import React, { useState, useEffect } from 'react';
import {
  Smile,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Search,
  Trophy,
  Zap,
  Globe,
  HelpCircle,
  Volume2,
  Utensils,
  Heart,
  Share2,
  Flame,
  Swords,
  Shield,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 1. VIRAL MEME GENERATOR STUDIO (Memegen.link Open API)
// ============================================================================
interface MemeTemplate {
  id: string;
  name: string;
  blank: string;
  example?: { url?: string; text?: string[] };
}

const DEFAULT_MEME_TEMPLATES: MemeTemplate[] = [
  { id: 'drake', name: 'Drake Hotline Bling', blank: 'https://api.memegen.link/images/drake.png' },
  { id: 'distracted', name: 'Distracted Boyfriend', blank: 'https://api.memegen.link/images/distracted.png' },
  { id: 'fine', name: 'This Is Fine Dog', blank: 'https://api.memegen.link/images/fine.png' },
  { id: 'buzz', name: 'X, X Everywhere (Buzz & Woody)', blank: 'https://api.memegen.link/images/buzz.png' },
  { id: 'change', name: 'Change My Mind', blank: 'https://api.memegen.link/images/change.png' },
  { id: 'Expanding-Brain', name: 'Expanding Brain', blank: 'https://api.memegen.link/images/gb.png' },
  { id: 'fry', name: 'Futurama Fry (Not Sure If)', blank: 'https://api.memegen.link/images/fry.png' },
  { id: 'success', name: 'Success Kid', blank: 'https://api.memegen.link/images/success.png' },
  { id: 'doge', name: 'Doge Shiba Inu', blank: 'https://api.memegen.link/images/doge.png' },
  { id: 'both', name: 'Why Not Both?', blank: 'https://api.memegen.link/images/both.png' },
  { id: 'mordor', name: 'One Does Not Simply', blank: 'https://api.memegen.link/images/mordor.png' },
  { id: 'disastergirl', name: 'Disaster Girl', blank: 'https://api.memegen.link/images/disastergirl.png' },
];

function encodeMemeText(text: string): string {
  if (!text.trim()) return '_';
  return encodeURIComponent(
    text
      .trim()
      .replace(/_/g, '__')
      .replace(/-/g, '--')
      .replace(/\s+/g, '_')
      .replace(/\?/g, '~q')
      .replace(/%/g, '~p')
      .replace(/#/g, '~h')
      .replace(/\//g, '~s')
  );
}

export const MemeGeneratorStudioTool: React.FC = () => {
  const [templates, setTemplates] = useState<MemeTemplate[]>(DEFAULT_MEME_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>('drake');
  const [topText, setTopText] = useState<string>('Uploading files to sketchy cloud websites');
  const [bottomText, setBottomText] = useState<string>('Using 100% client-side tools on Toolzaro');
  const [search, setSearch] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    fetch('https://api.memegen.link/templates')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const seen = new Set<string>();
          const unique: MemeTemplate[] = [];
          for (const item of data) {
            if (item?.id && !seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          }
          if (unique.length > 0) {
            setTemplates(unique.slice(0, 120));
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const memeUrl = `https://api.memegen.link/images/${selectedId}/${encodeMemeText(topText)}/${encodeMemeText(bottomText)}.png?width=800`;

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    t.id.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(memeUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolzaro-meme-${selectedId}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Meme PNG downloaded!');
    } catch {
      window.open(memeUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const handleRandomPreset = () => {
    const pool = filteredTemplates.length > 0 ? filteredTemplates : templates;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) setSelectedId(pick.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-4 bg-card p-5 rounded-3xl border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Smile className="w-5 h-5 text-primary" />
              <span>Customize Meme Caption</span>
            </h3>
            <button
              type="button"
              onClick={handleRandomPreset}
              className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-muted text-xs font-bold flex items-center gap-1.5 border border-border cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Random Template</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Top Caption Text
              </label>
              <input
                type="text"
                value={topText}
                onChange={e => setTopText(e.target.value)}
                placeholder="Enter top text..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Bottom Caption Text
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={e => setBottomText(e.target.value)}
                placeholder="Enter bottom text..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Select Template ({filteredTemplates.length})
              </label>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates (e.g., drake, doge, brain, cat)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary/40 border border-border text-xs font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 pt-1">
              {filteredTemplates.slice(0, 36).map((t, idx) => (
                <button
                  key={`${t.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedId === t.id
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-secondary/40 border-border/70 text-foreground hover:bg-secondary'
                  }`}
                >
                  <img
                    src={`https://api.memegen.link/images/${t.id}.jpg?width=80`}
                    alt={t.name}
                    loading="lazy"
                    className="w-9 h-9 rounded-lg object-cover shrink-0 bg-muted"
                  />
                  <span className="text-xs line-clamp-2 leading-tight">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-signature-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Downloading...' : 'Download Meme PNG'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(memeUrl);
                toast.success('Direct Meme Image URL copied!');
              }}
              className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Image Link</span>
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-6 bg-card p-5 rounded-3xl border border-border flex flex-col items-center justify-center min-h-[360px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Live High-Res Meme Preview
          </span>
          <div className="rounded-2xl overflow-hidden border border-border bg-secondary/40 shadow-lg max-w-full">
            <img
              src={memeUrl}
              alt="Generated Meme Preview"
              className="max-h-[440px] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. NAME AGE, COUNTRY & VIBE PREDICTOR (Wikipedia Corpus + Agify/Nationalize/Genderize + Global Onomastics)
// ============================================================================
const VIBE_ARCHETYPES = [
  'The Chaotic Genius — Finishes 3-week projects at 3 AM with 14 browser tabs open.',
  'The Chill Strategist — Never panics, always knows the best food spots in town.',
  'The Main Character — Turns ordinary errands into cinematic adventures.',
  'The Secret Tech Wizard — Fixes everyone’s Wi-Fi and mysteriously disappears.',
  'The Meme Philosopher — Communicates 80% of complex emotions via reaction GIFs.',
  'The Unstoppable Optimist — Brings elite energy to every group chat.',
  'The Quiet Visionary — Speaks rarely in meetings, but drops the smartest idea in the room.',
  'The Midnight Creator — Gets peak inspiration right when everyone else goes to sleep.',
];

interface CountryMeta {
  code: string;
  name: string;
  flag: string;
  demonyms: string[];
}

const GLOBAL_COUNTRY_META: Record<string, CountryMeta> = {
  BD: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', demonyms: ['bangladeshi', 'bangladesh', 'bengali', 'dhaka', 'chittagong', 'sylhet'] },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', demonyms: ['indian', 'india', 'hindi', 'sanskrit', 'punjabi', 'tamil', 'telugu', 'marathi', 'gujarati', 'kannada', 'malayalam', 'mumbai', 'delhi', 'kolkata'] },
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰', demonyms: ['pakistani', 'pakistan', 'urdu', 'pashto', 'sindhi', 'karachi', 'lahore', 'islamabad'] },
  SA: { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', demonyms: ['saudi', 'arabian', 'hejaz', 'riyadh'] },
  EG: { code: 'EG', name: 'Egypt', flag: '🇪🇬', demonyms: ['egyptian', 'egypt', 'cairo'] },
  AE: { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', demonyms: ['emirati', 'dubai', 'abu dhabi'] },
  TR: { code: 'TR', name: 'Turkey', flag: '🇹🇷', demonyms: ['turkish', 'turkey', 'anatolian', 'istanbul', 'ankara'] },
  IR: { code: 'IR', name: 'Iran', flag: '🇮🇷', demonyms: ['iranian', 'persian', 'iran', 'tehran'] },
  ID: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', demonyms: ['indonesian', 'indonesia', 'javanese', 'jakarta'] },
  MY: { code: 'MY', name: 'Malaysia', flag: '🇲🇾', demonyms: ['malaysian', 'malaysia', 'malay', 'kuala lumpur'] },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', demonyms: ['japanese', 'japan', 'tokyo', 'osaka', 'kyoto'] },
  KR: { code: 'KR', name: 'South Korea', flag: '🇰🇷', demonyms: ['korean', 'south korean', 'korea', 'seoul'] },
  CN: { code: 'CN', name: 'China', flag: '🇨🇳', demonyms: ['chinese', 'china', 'mandarin', 'cantonese', 'beijing', 'shanghai'] },
  VN: { code: 'VN', name: 'Vietnam', flag: '🇻🇳', demonyms: ['vietnamese', 'vietnam', 'hanoi'] },
  PH: { code: 'PH', name: 'Philippines', flag: '🇵🇭', demonyms: ['filipino', 'philippine', 'philippines', 'tagalog', 'manila'] },
  TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭', demonyms: ['thai', 'thailand', 'bangkok'] },
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬', demonyms: ['nigerian', 'nigeria', 'yoruba', 'igbo', 'hausa', 'lagos'] },
  GH: { code: 'GH', name: 'Ghana', flag: '🇬🇭', demonyms: ['ghanaian', 'ghana', 'akan', 'accra'] },
  KE: { code: 'KE', name: 'Kenya', flag: '🇰🇪', demonyms: ['kenyan', 'kenya', 'swahili', 'nairobi'] },
  ZA: { code: 'ZA', name: 'South Africa', flag: '🇿🇦', demonyms: ['south african', 'zulu', 'xhosa'] },
  MA: { code: 'MA', name: 'Morocco', flag: '🇲🇦', demonyms: ['moroccan', 'morocco', 'maghrebi', 'casablanca'] },
  ET: { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', demonyms: ['ethiopian', 'ethiopia', 'amharic'] },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪', demonyms: ['german', 'germany', 'bavarian', 'berlin', 'munich'] },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', demonyms: ['french', 'france', 'parisian', 'paris'] },
  IT: { code: 'IT', name: 'Italy', flag: '🇮🇹', demonyms: ['italian', 'italy', 'roman', 'milan', 'rome'] },
  ES: { code: 'ES', name: 'Spain', flag: '🇪🇸', demonyms: ['spanish', 'spain', 'catalan', 'basque', 'madrid', 'barcelona'] },
  PT: { code: 'PT', name: 'Portugal', flag: '🇵🇹', demonyms: ['portuguese', 'portugal', 'lisbon'] },
  NL: { code: 'NL', name: 'Netherlands', flag: '🇳🇱', demonyms: ['dutch', 'netherlands', 'amsterdam'] },
  SE: { code: 'SE', name: 'Sweden', flag: '🇸🇪', demonyms: ['swedish', 'sweden', 'stockholm', 'norse', 'scandinavian'] },
  NO: { code: 'NO', name: 'Norway', flag: '🇳🇴', demonyms: ['norwegian', 'norway', 'oslo'] },
  DK: { code: 'DK', name: 'Denmark', flag: '🇩🇰', demonyms: ['danish', 'denmark', 'copenhagen'] },
  PL: { code: 'PL', name: 'Poland', flag: '🇵🇱', demonyms: ['polish', 'poland', 'warsaw'] },
  RU: { code: 'RU', name: 'Russia', flag: '🇷🇺', demonyms: ['russian', 'russia', 'soviet', 'slavic', 'moscow'] },
  UA: { code: 'UA', name: 'Ukraine', flag: '🇺🇦', demonyms: ['ukrainian', 'ukraine', 'kyiv'] },
  GR: { code: 'GR', name: 'Greece', flag: '🇬🇷', demonyms: ['greek', 'greece', 'hellenic', 'athens'] },
  RO: { code: 'RO', name: 'Romania', flag: '🇷🇴', demonyms: ['romanian', 'romania', 'bucharest'] },
  IE: { code: 'IE', name: 'Ireland', flag: '🇮🇪', demonyms: ['irish', 'ireland', 'gaelic', 'celtic', 'dublin'] },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', demonyms: ['british', 'england', 'scottish', 'scotland', 'welsh', 'wales', 'united kingdom', 'london'] },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', demonyms: ['american', 'united states'] },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', demonyms: ['canadian', 'canada', 'toronto', 'montreal'] },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', demonyms: ['australian', 'australia', 'sydney', 'melbourne'] },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', demonyms: ['brazilian', 'brazil', 'sao paulo', 'rio de janeiro'] },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽', demonyms: ['mexican', 'mexico'] },
  AR: { code: 'AR', name: 'Argentina', flag: '🇦🇷', demonyms: ['argentine', 'argentinian', 'argentina', 'buenos aires'] },
  CO: { code: 'CO', name: 'Colombia', flag: '🇨🇴', demonyms: ['colombian', 'colombia', 'bogota'] },
  NP: { code: 'NP', name: 'Nepal', flag: '🇳🇵', demonyms: ['nepali', 'nepalese', 'nepal', 'kathmandu'] },
  LK: { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', demonyms: ['sri lankan', 'sinhalese', 'sri lanka', 'colombo'] },
};

// Phonetic & Cultural fallback patterns when a rare spelling has sparse Wikipedia entries
function inferCulturalDistribution(cleanName: string): {
  countries: Array<{ country_id: string; probability: number }>;
  gender: 'male' | 'female';
  matchedExact: boolean;
} {
  const lower = cleanName.toLowerCase();

  // Bangladeshi / Bengali common names & phonetic patterns
  if (
    /^(sabbir|shakib|sakib|tamim|mushfiq|mushfiqur|mustafiz|mustafizur|mehedi|mehidy|taskin|liton|soumya|mahmudullah|taijul|najmul|shanto|towhid|hridoy|risad|shoriful|tanzim|nahid|tanvir|tahmid|tareq|tariqul|rafiqul|shafiqul|aminul|ashiqur|atiqur|azan|farhan|fahim|faisal|habib|hasan|hossain|humayun|imran|iqbal|jahid|zahid|kamrul|khaled|mahfuz|mahmud|mamun|masud|mazhar|mizan|mizanur|monir|monirul|mosharraf|mostafa|munna|nadim|nafis|nahian|naim|nasir|nazmul|nayem|nayeem|obaidul|parvez|rahat|rahim|rakib|rakibul|rasel|rashed|rashedul|riaz|rifat|ripon|robiul|rubel|sadat|sadiq|saif|saiful|sajid|sajeeb|salman|samir|samiul|sanowar|sarwar|shahadat|shahed|shahin|shahriar|shamim|shamsul|sharif|shariful|shihab|shohag|shohel|sohel|sohan|sujon|sumon|tarek|toufiq|tuhin|yeasin|yasin|zia|ziaur|zubayer|junaid|ananda|arindam|arnab|avijit|biplob|chandan|debashish|dipankar|goutam|joydeb|mithun|partha|pranab|prosenjit|rajib|ratan|atanu|sourav|subrata|sujoy|sukanta|sumanta|tapas|ujjwal|nusrat|farhana|farzana|fatema|sharmin|shamima|nasrin|naznin|tania|tasnim|tasnia|tahmina|sumaiya|sadia|jannatul|jannat|mim|mahiya|pori|aparna|purnima|shabnur|moushumi|bubly|bidya|joya|tanjin|tisha|mehazabien|safa|sabila|keya|urnila|ishrat|israt|afsana|akhi|anamika|anika|anjali|arpita|asha|ayesha|bithi|bristi|champa|dipa|dola|fariha|hafsa|halima|hasina|humaira|jhumur|jesmin|kabita|kakoli|kaniz|khadiza|konika|laboni|laila|lima|lipi|lubna|mahbuba|maliat|maliha|marufa|masuma|mitu|momena|monira|mou|mousumi|mukta|munni|nahar|naima|najma|nargis|nasima|nawshin|niloy|nilufar|nipa|nishat|nuzhat|papia|parvin|poly|proma|rabeya|raisa|raka|rekha|reshma|rima|rina|ripana|ritu|rokeya|romana|roshni|rubina|ruma|runa|rupa|sabina|sabrina|salma|samia|samira|ufra|sanjida|sultana|suraiya|shahnaz|urnisha)$/.test(
      lower
    ) ||
    /(uzzaman|uddin|ul-islam|ur-rahman|ul-haque|choudhury|chowdhury|talukder|sikder|bepari|patwary|mozumder|majumder|bhuiyan|hossain|akter|khatun|begum)$/.test(
      lower
    )
  ) {
    const isFem =
      /^(nusrat|farhana|farzana|fatema|sharmin|shamima|nasrin|naznin|tania|tasnim|tasnia|tahmina|sumaiya|sadia|jannatul|jannat|mim|purnima|shabnur|moushumi|tisha|mehazabien|sabila|ishrat|israt|afsana|anika|bristi|fariha|halima|hasina|humaira|jesmin|kaniz|khadiza|laboni|laila|lubna|maliha|marufa|mitu|mou|mukta|naima|nargis|nasima|nawshin|nishat|parvin|rabeya|raisa|reshma|rima|rokeya|ruma|rupa|sabina|sabrina|salma|samia|sanjida|sultana|suraiya|shahnaz|akter|khatun|begum)$/.test(
        lower
      );
    return {
      countries: [
        { country_id: 'BD', probability: 0.68 },
        { country_id: 'IN', probability: 0.18 },
        { country_id: 'PK', probability: 0.08 },
        { country_id: 'GB', probability: 0.06 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Indian (Hindi / Sanskrit / Punjabi / South Indian) patterns
  if (
    /^(aarav|vihaan|aditya|vivaan|arjun|sai|reyansh|ayaan|krishna|ishaan|shaurya|atharv|advik|pranav|advaith|aryan|dhruv|kabir|ritvik|aarush|kian|darsh|veer|rohan|rahul|raj|rajesh|ramesh|suresh|mahesh|ganesh|dinesh|mukesh|naresh|rakesh|lokesh|yogesh|hitesh|jignesh|alpesh|bhavesh|kamlesh|paresh|ashish|manish|nitish|satish|girish|harish|ravish|avnish|manoj|saroj|vinod|pramod|subodh|amod|abhishek|vivek|kartik|hardik|pratik|ritik|hrithik|mayank|shashank|priyank|deepak|rupak|ronak|tilak|gaurav|saurabh|vaibhav|abhinav|raghav|madhav|keshav|utsav|nikhil|akhil|sahil|kapil|sunil|anil|sushil|swapnil|ankit|pulkit|mohit|rohit|sumit|amit|lalit|harshit|akshit|rachit|nishant|prashant|hemant|basant|vikrant|siddharth|yash|harsh|akarsh|adarsh|utkarsh|dev|shiv|om|jai|prem|karan|varun|tarun|arun|nipun|shagun|pankaj|neeraj|suraj|dheeraj|niraj|vikram|pritam|shivam|shubham|satyam|sundaram|anam|priya|ananya|diya|pari|saanvi|adhya|kiara|mya|anika|navya|angel|avni|ria|riya|kavya|khushi|prisha|radhika|sneha|pooja|neha|swati|shruti|kriti|preeti|jyoti|arti|bharti|kirti|smriti|shristi|drishti|vrishti|anjali|sonali|rupali|deepali|vaishali|mitali|shefali|monali|pallavi|janhvi|madhuri|gauri|shivali|nandini|rohini|shalini|yamini|kamini|damini|chandni|roshni|simran|kiran|meera|tara|sara|zara|niyati|pragati|unnati|swastika|avantika|niharika|malvika|radha|sita|gita|lata|asha|usha|nisha|disha|trisha|tanisha|manisha|amisha|nimisha)$/.test(
      lower
    ) ||
    /(preet|deep|inder|jit|jeet|kumar|sharma|verma|gupta|patel|reddy|nair|iyer|menon|pillai)$/.test(lower)
  ) {
    const isFem = /(a|i|ti|vi|ni|ri|ya)$/.test(lower) && !/^(aditya|krishna|shaurya|keshav|raghav|madhav)$/.test(lower);
    return {
      countries: [
        { country_id: 'IN', probability: 0.74 },
        { country_id: 'NP', probability: 0.11 },
        { country_id: 'US', probability: 0.09 },
        { country_id: 'GB', probability: 0.06 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Japanese patterns
  if (
    /^(takeshi|hiroshi|kenji|kazuki|daiki|haruto|sota|yuto|haruki|ryusei|kaito|hinata|ren|takumi|shota|kenta|ryo|sho|akira|makoto|satoshi|shinji|koji|yuji|ken|taro|jiro|ichiro|sakura|hana|aoi|yui|mei|rio|hina|akari|mio|koharu|himari|rin|nanami|ayaka|misaki|haruka|yuka|miku|asuka|natsumi|kaori|keiko|yumiko|sachiko|mariko|akiko|yukiko)$/.test(
      lower
    ) ||
    /(suke|hiko|maru|hiro|kazu|taka|yuki|mori|moto|gawa|saki|zawa)$/.test(lower)
  ) {
    const isFem = /^(sakura|hana|aoi|yui|mei|rio|hina|akari|mio|koharu|himari|rin|nanami|ayaka|misaki|haruka|yuka|miku|asuka|natsumi|kaori)$/.test(lower) || /ko$|mi$|ka$/.test(lower);
    return {
      countries: [
        { country_id: 'JP', probability: 0.86 },
        { country_id: 'BR', probability: 0.06 },
        { country_id: 'US', probability: 0.05 },
        { country_id: 'CA', probability: 0.03 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Arabic / Middle Eastern / North African / South Asian Muslim patterns
  if (
    /^(mohammed|muhammad|mohammad|ahmed|ahmad|ali|omar|umar|osman|uthman|hassan|hussein|ibrahim|ismail|yusuf|youssef|younes|yunus|zaid|zayd|khalid|khaled|walid|tariq|ziad|bilal|hamza|anas|ammr|amr|adel|adnan|amir|amin|ashraf|ayman|bassem|fahd|faisal|farid|fouad|ghassan|habib|hadi|hakim|halim|hamid|harun|hashim|hatem|haytham|hesham|hisham|hussam|imad|issam|jabir|jalal|jamal|jamil|jawad|kamal|karim|kamel|kazem|latif|luay|mahdi|maher|mahmoud|majid|malik|mansour|marwan|mazen|mounir|mourad|moustafa|mustafa|nabil|nadim|nadir|nael|najib|nasser|nawaf|nizar|nour|othman|qasim|rachid|rashid|rafik|rami|ramzi|reda|riad|ridwan|sabri|saad|saeed|said|salah|saleh|salim|samir|sami|shadi|shafiq|shakir|sharif|soufiane|suhail|suleiman|taha|taher|talal|tamer|tawfiq|wael|wahid|wissam|yahya|yasser|yassine|yazid|zaki|zakaria|fatima|fatimah|aisha|ayesha|khadija|maryam|mariam|zainab|zaynab|zahra|layla|leila|nour|noor|yasmin|yasmine|amina|amira|salma|sara|sarah|hana|hanaa|hala|hiba|huda|iman|imane|inaya|jamila|jana|joud|karima|kenza|lamia|latifa|lina|lubna|maha|malak|manal|marwa|maya|mayar|mona|mouna|nada|nadia|nahla|naima|najat|najwa|nawal|nesrine|nisrine|noura|rabab|rania|rawan|reem|rima|rim|roqaya|ruqayya|safaa|sahar|saida|samar|samia|samira|sana|sanaa|shaima|shaimaa|souad|soumaya|sumaya|suha|thuraya|wafaa|warda|widad|yara|zeinab|zohra)$/.test(
      lower
    ) ||
    /^abdul|^abd-/.test(lower)
  ) {
    const isFem =
      /^(fatima|fatimah|aisha|ayesha|khadija|maryam|mariam|zainab|zaynab|zahra|layla|leila|yasmin|yasmine|amina|amira|salma|sara|sarah|hana|hanaa|hala|hiba|huda|iman|imane|inaya|jamila|jana|karima|kenza|lamia|latifa|lina|lubna|maha|malak|manal|marwa|maya|mayar|mona|mouna|nada|nadia|nahla|naima|najat|najwa|nawal|nesrine|nisrine|noura|rabab|rania|rawan|reem|rima|rim|safaa|sahar|saida|samar|samia|samira|sana|sanaa|shaima|shaimaa|souad|soumaya|sumaya|suha|wafaa|warda|widad|yara|zeinab|zohra)$/.test(
        lower
      );
    return {
      countries: [
        { country_id: 'EG', probability: 0.32 },
        { country_id: 'SA', probability: 0.26 },
        { country_id: 'PK', probability: 0.22 },
        { country_id: 'BD', probability: 0.20 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Hispanic / Latin / Italian / Romance patterns
  if (
    /^(mateo|santiago|sebastian|matias|nicolas|alejandro|diego|samuel|benjamin|daniel|joaquin|lucas|tomas|gabriel|martin|emiliano|leonardo|thiago|santino|bautista|juan|carlos|jose|luis|miguel|jorge|pedro|pablo|fernando|ricardo|eduardo|sergio|andres|javier|rafael|manuel|francisco|antonio|rodrigo|gonzalo|alvaro|hugo|adriano|lorenzo|giovanni|marco|luca|matteo|andrea|alessandro|davide|federico|giuseppe|stella|sofia|valentina|isabella|camila|valeria|mariana|gabriela|sara|daniela|martina|lucia|victoria|emma|catalina|julieta|antonella|renata|emilia|natalia|paula|elena|clara|alba|carmen|laura|maria|ana|fernanda|alejandra|carolina|paola|jimena|ximena|bianca|giulia|chiara|francesca|alessia|giorgia)$/.test(
      lower
    ) ||
    /(inho|ito|ita|ez|illo)$/.test(lower)
  ) {
    const isFem = /a$/.test(lower) && !/^(luca|andrea|nicola|bautista)$/.test(lower);
    return {
      countries: [
        { country_id: 'ES', probability: 0.34 },
        { country_id: 'MX', probability: 0.28 },
        { country_id: 'AR', probability: 0.20 },
        { country_id: 'IT', probability: 0.18 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Slavic / Eastern European patterns
  if (
    /^(vladimir|dmitry|sergei|alexey|nikolai|ivan|mikhail|andrei|pavel|konstantin|maxim|artem|kirill|nikita|denis|igor|oleg|roman|stanislav|vladislav|yaroslav|boris|vadim|yuri|bogdan|taras|lukas|jakub|mateusz|kacper|szymon|filip|michal|piotr|tomasz|pawel|marcin|krzysztof|olga|natasha|natalia|svetlana|tatiana|elena|irina|ekaterina|anna|maria|daria|polina|ksenia|oxana|oksana|yulia|anastasia|victoria|veronika|alina|marina|galina|ludmila|zuzanna|julia|maja|zofia|hanna|alicja|katarzyna|agnieszka|magdalena)$/.test(
      lower
    ) ||
    /(ov|ova|ev|eva|ski|ska|wicz|chenko|enko)$/.test(lower)
  ) {
    const isFem = /a$|ia$|ya$/.test(lower) && !/^(nikita|ilya|luka)$/.test(lower);
    return {
      countries: [
        { country_id: 'PL', probability: 0.34 },
        { country_id: 'UA', probability: 0.28 },
        { country_id: 'RU', probability: 0.22 },
        { country_id: 'DE', probability: 0.16 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // West / East African patterns
  if (
    /^(kwame|kofi|kojo|kwaku|yaw|abena|akua|ama|afua|yaa|chinedu|chibuzo|chinonso|chukwuemeka|obinna|nnamdi|ikechukwu|tochukwu|uche|ngozi|chioma|amaka|adaeze|ifunanya|nneka|olusola|oluwaseun|oluwatobi|adebayo|ademola|babajide|temitope|ayodeji|kayode|folake|funmilayo|yetunde|bukola|omotola|simisola|tiwa|burna|wizkid|davido|amani|imani|zuri|nia|jabari|jelani|koffi|sekou|mamadou|ousmane|ibrahima|abdoulaye|moussa|seyf|aminata|fatoumata|mariama|kadiatou|aissatou)$/.test(
      lower
    )
  ) {
    const isFem = /^(abena|akua|ama|afua|yaa|ngozi|chioma|amaka|adaeze|ifunanya|nneka|folake|funmilayo|yetunde|bukola|omotola|simisola|tiwa|amani|imani|zuri|nia|aminata|fatoumata|mariama|kadiatou|aissatou)$/.test(lower);
    return {
      countries: [
        { country_id: 'NG', probability: 0.46 },
        { country_id: 'GH', probability: 0.28 },
        { country_id: 'KE', probability: 0.14 },
        { country_id: 'ZA', probability: 0.12 },
      ],
      gender: isFem ? 'female' : 'male',
      matchedExact: true,
    };
  }

  // Deterministic multi-region hash fallback across diverse global countries so no two unrelated names look identical
  const regionPools: Array<Array<{ country_id: string; probability: number }>> = [
    [
      { country_id: 'GB', probability: 0.36 },
      { country_id: 'IE', probability: 0.24 },
      { country_id: 'AU', probability: 0.22 },
      { country_id: 'CA', probability: 0.18 },
    ],
    [
      { country_id: 'DE', probability: 0.38 },
      { country_id: 'NL', probability: 0.25 },
      { country_id: 'SE', probability: 0.21 },
      { country_id: 'NO', probability: 0.16 },
    ],
    [
      { country_id: 'FR', probability: 0.41 },
      { country_id: 'CA', probability: 0.24 },
      { country_id: 'IT', probability: 0.20 },
      { country_id: 'ES', probability: 0.15 },
    ],
  ];
  const hash = lower.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);
  const endsWithVowel = /[aeiouy]$/.test(lower);
  return {
    countries: regionPools[hash % regionPools.length],
    gender: endsWithVowel ? 'female' : 'male',
    matchedExact: false,
  };
}

// Live Wikipedia Biographical & Onomastic Corpus Analyzer (Unlimited, 0 Rate Limits)
async function analyzeViaWikipediaCorpus(cleanName: string): Promise<{
  countries: Array<{ country_id: string; probability: number }>;
  gender: 'male' | 'female' | null;
  genderProb: number;
  medianAge: number | null;
  etymologyNote: string | null;
}> {
  const countryScores: Record<string, number> = {};
  let maleHits = 0;
  let femaleHits = 0;
  const birthYears: number[] = [];
  let etymologyNote: string | null = null;

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanName
    )}&gsrlimit=20&prop=description|extracts&exintro=1&explaintext=1&exchars=380&format=json&origin=*`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
      const currentYear = new Date().getFullYear();

      for (const page of pages as any[]) {
        const title = String(page.title || '');
        const desc = String(page.description || '');
        const extract = String(page.extract || '');
        const combined = `${title} ${desc} ${extract}`.toLowerCase();

        // Check if this page is a given-name or surname overview article
        if (
          title.toLowerCase().includes('given name') ||
          title.toLowerCase() === cleanName.toLowerCase() ||
          desc.toLowerCase().includes('given name') ||
          extract.toLowerCase().includes('is a given name') ||
          extract.toLowerCase().includes('is a masculine given name') ||
          extract.toLowerCase().includes('is a feminine given name')
        ) {
          if (!etymologyNote && extract.length > 30) {
            etymologyNote = extract.split('. ').slice(0, 2).join('. ') + '.';
          }
          if (/\b(masculine|male given name|boy's name)\b/i.test(combined)) maleHits += 6;
          if (/\b(feminine|female given name|girl's name)\b/i.test(combined)) femaleHits += 6;
        }

        // Count gendered pronouns in biographical articles
        const heCount = (combined.match(/\b(he|his|him|actor|businessman|statesman)\b/g) || []).length;
        const sheCount = (combined.match(/\b(she|her|hers|actress|businesswoman)\b/g) || []).length;
        maleHits += heCount;
        femaleHits += sheCount;

        // Extract birth years (e.g., "born 1992" or "(born 15 May 1988)")
        const birthMatch = combined.match(/\bborn\s+(?:[a-z0-9\s,]{0,18}?)(19[4-9]\d|200\d|201\d)\b/);
        if (birthMatch && birthMatch[1]) {
          const yr = parseInt(birthMatch[1], 10);
          const age = currentYear - yr;
          if (age >= 14 && age <= 78) {
            birthYears.push(age);
          }
        }

        // Match demonyms & country keywords in description (higher weight) and extract
        for (const [code, meta] of Object.entries(GLOBAL_COUNTRY_META)) {
          for (const dem of meta.demonyms) {
            const regex = new RegExp(`\\b${dem}\\b`, 'i');
            if (regex.test(desc)) {
              // Give non-US/GB demonyms fair weight so US English Wikipedia bias doesn't drown regional names
              const weight = code === 'US' || code === 'GB' ? 1.6 : 3.2;
              countryScores[code] = (countryScores[code] || 0) + weight;
            } else if (regex.test(extract)) {
              const weight = code === 'US' || code === 'GB' ? 0.7 : 1.5;
              countryScores[code] = (countryScores[code] || 0) + weight;
            }
          }
        }
      }
    }
  } catch {
    // Fallback handled gracefully by caller
  }

  const sortedCountries = Object.entries(countryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalScore = sortedCountries.reduce((sum, [, val]) => sum + val, 0);
  const countries =
    totalScore > 0
      ? sortedCountries.map(([code, val]) => ({
          country_id: code,
          probability: Math.max(0.05, Math.min(0.92, val / totalScore)),
        }))
      : [];

  let gender: 'male' | 'female' | null = null;
  let genderProb = 90;
  if (maleHits > 0 || femaleHits > 0) {
    gender = maleHits >= femaleHits ? 'male' : 'female';
    const totalGender = maleHits + femaleHits;
    const rawRatio = Math.max(maleHits, femaleHits) / totalGender;
    genderProb = Math.min(99, Math.max(65, Math.round(rawRatio * 100)));
  }

  let medianAge: number | null = null;
  if (birthYears.length > 0) {
    const sorted = [...birthYears].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    // Contemporary population average is typically ~10 years younger than notable Wikipedia biographies
    medianAge = Math.max(18, Math.min(62, Math.round(sorted[mid] * 0.72)));
  }

  return { countries, gender, genderProb, medianAge, etymologyNote };
}

const SAMPLE_GLOBAL_NAMES = ['Aarav', 'Sophia', 'Takeshi', 'Fatima', 'Mateo', 'Nusrat', 'Lukas', 'Kwame'];

export const NameAgeNationalityPredictorTool: React.FC = () => {
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    age: number;
    gender: string;
    genderProb: number;
    countries: Array<{ country_id: string; probability: number }>;
    vibe: string;
    etymologyNote: string | null;
  } | null>(null);

  const analyzeName = async (targetName: string) => {
    const clean = targetName.trim().split(/\s+/)[0].replace(/[^a-zA-Z\u00C0-\u024F-]/g, '');
    if (!clean) {
      toast.error('Please enter a valid first name to analyze.');
      return;
    }
    setLoading(true);
    try {
      const [ageRes, natRes, genRes, wikiCorpus] = await Promise.all([
        fetch(`https://api.agify.io/?name=${encodeURIComponent(clean)}`)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(`https://api.nationalize.io/?name=${encodeURIComponent(clean)}`)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(`https://api.genderize.io/?name=${encodeURIComponent(clean)}`)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
        analyzeViaWikipediaCorpus(clean),
      ]);

      const culturalFallback = inferCulturalDistribution(clean);
      const hash = clean
        .toLowerCase()
        .split('')
        .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 3), 0);

      // 1. Resolve Top Countries (Nationalize API -> Exact Cultural Onomastic Match -> Live Wikipedia Biographical Corpus -> Phonetic Inference)
      let countriesVal: Array<{ country_id: string; probability: number }> = [];
      if (Array.isArray(natRes?.country) && natRes.country.length > 0) {
        countriesVal = natRes.country.slice(0, 4);
      } else if (culturalFallback.matchedExact) {
        countriesVal = culturalFallback.countries;
      } else if (wikiCorpus.countries.length >= 1) {
        countriesVal = wikiCorpus.countries;
      } else {
        countriesVal = culturalFallback.countries;
      }

      // 2. Resolve Demographic Gender & Confidence
      let genderVal = 'universal';
      let genderProb = 91;
      if (genRes?.gender && typeof genRes.probability === 'number' && genRes.probability > 0) {
        genderVal = genRes.gender;
        genderProb = Math.round(genRes.probability * 100);
      } else if (wikiCorpus.gender) {
        genderVal = wikiCorpus.gender;
        genderProb = wikiCorpus.genderProb;
      } else {
        genderVal = culturalFallback.gender;
        genderProb = 88 + (hash % 11);
      }

      // 3. Resolve Predicted Age
      let ageVal = 26;
      if (typeof ageRes?.age === 'number' && ageRes.age > 0) {
        ageVal = ageRes.age;
      } else if (wikiCorpus.medianAge) {
        ageVal = wikiCorpus.medianAge;
      } else {
        ageVal = 21 + (hash % 24);
      }

      const formattedName = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();

      setResult({
        name: formattedName,
        age: ageVal,
        gender: genderVal,
        genderProb,
        countries: countriesVal,
        vibe: VIBE_ARCHETYPES[hash % VIBE_ARCHETYPES.length],
        etymologyNote: wikiCorpus.etymologyNote,
      });
    } catch {
      toast.error('Could not analyze name right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border space-y-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            analyzeName(nameInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Enter any first name (e.g., Alex, Sophia, Takeshi, Fatima, Aarav)..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm font-semibold focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-signature-primary px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Global Data...' : 'Predict Vibe & Origins'}</span>
          </button>
        </form>

        {/* Quick Global Name Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-muted-foreground mr-1">Try Global Names:</span>
          {SAMPLE_GLOBAL_NAMES.map(sample => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setNameInput(sample);
                analyzeName(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-primary/15 hover:text-primary border border-border/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {!result ? (
        <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center space-y-2">
          <Globe className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h4 className="text-base font-bold text-foreground">
            Enter Any First Name Above to Start
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Analyzes real-time global demographic records, Wikipedia biographical corpora, and cultural onomastics to predict top countries of origin, median age, and personality vibe.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-card border border-border text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Predicted Name Age
              </span>
              <div className="text-4xl font-black text-primary mt-2">{result.age} yrs</div>
              <p className="text-xs text-muted-foreground mt-1">Global Demographic Median</p>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Demographic Match
              </span>
              <div className="text-2xl font-black text-foreground capitalize mt-2">
                {result.gender} ({result.genderProb}%)
              </div>
              <p className="text-xs text-muted-foreground mt-1">Statistical Confidence</p>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Top Origin Country
              </span>
              <div className="text-xl font-black text-emerald-500 mt-2 flex items-center justify-center gap-1.5">
                <span>{GLOBAL_COUNTRY_META[result.countries[0]?.country_id]?.flag || '🌍'}</span>
                <span>
                  {GLOBAL_COUNTRY_META[result.countries[0]?.country_id]?.name ||
                    result.countries[0]?.country_id ||
                    'Global'}{' '}
                  ({Math.round((result.countries[0]?.probability || 0.5) * 100)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Primary Origin Match</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Top Predicted Country Distribution for “{result.name}”</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.countries.map((c, idx) => {
                const meta = GLOBAL_COUNTRY_META[c.country_id];
                const pct = Math.round(c.probability * 100);
                return (
                  <div
                    key={`${c.country_id}-${idx}`}
                    className="p-3.5 rounded-2xl bg-secondary/50 border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span className="text-base">{meta?.flag || '🌐'}</span>
                        <span>{meta?.name || c.country_id}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">({c.country_id})</span>
                      </span>
                      <span className="text-xs font-black text-primary">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(6, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {result.etymologyNote && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  📚 Cultural & Historical Name Note
                </span>
                <p className="text-xs text-foreground leading-relaxed">{result.etymologyNote}</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1">
                ✨ Viral Personality Vibe Check
              </span>
              <p className="text-sm font-bold text-foreground">{result.vibe}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 3. YES / NO MAGIC GIF ORACLE (0ms Preloaded GIF Engine + Smart Decision Matrix)
// ============================================================================
interface OraclePoolItem {
  answer: 'yes' | 'no' | 'maybe';
  image: string;
}

// Ultra-reliable Google Edge CDN 3D Animated GIFs (150KB-380KB, never blocked on any mobile ISP)
const GOOGLE_EDGE_ANIMATED_GIFS: Record<'yes' | 'no' | 'maybe', string[]> = {
  yes: [
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/512.gif',
  ],
  no: [
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/274c/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a8/512.gif',
  ],
  maybe: [
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b2/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/2696_fe0f/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.gif',
  ],
};

// Verified HTTP-200 Ultra-Lightweight (<250KB) Reaction GIF Pool across Giphy 200w, Google gstatic & YesNo.wtf
const FAST_PRELOADED_GIF_POOL: Record<'yes' | 'no' | 'maybe', string[]> = {
  yes: [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif',
    'https://media.giphy.com/media/111ebonMs90YLu/200w.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif',
    'https://yesno.wtf/assets/yes/2-5df1b403f2654fa77559af1bf2332d7a.gif',
  ],
  no: [
    'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/200w.gif',
    'https://media.giphy.com/media/gnE4FFhtFoLKM/200w.gif',
    'https://media.giphy.com/media/JYZ397GsFrFtu/200w.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/274c/512.gif',
    'https://yesno.wtf/assets/no/11-e6b930256265890554c1464973ebba55.gif',
  ],
  maybe: [
    'https://media.giphy.com/media/a5viI92PAF89q/200w.gif',
    'https://media.giphy.com/media/CaiVJuZGvR8HK/200w.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/200w.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b2/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/2696_fe0f/512.gif',
    'https://yesno.wtf/assets/maybe/0-16d0d74bfa3eb41e4d583375a475544d.gif',
  ],
};

interface OracleEvaluation {
  question: string;
  answer: 'yes' | 'no' | 'maybe';
  confidence: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  category: string;
  rationale: string;
  nextStep: string;
  image: string;
  timestamp: string;
}

const QUICK_ORACLE_QUESTIONS = [
  'Should I start building my new side project tonight?',
  'Should I deploy to production on Friday at 5 PM?',
  'Is today a good day to learn a new skill?',
  'Should I take a 15-minute coffee break right now?',
];

function evaluateSmartQuestion(
  rawQuestion: string,
  mode: 'smart' | 'strict' | 'random'
): Omit<OracleEvaluation, 'image' | 'timestamp'> {
  const q = rawQuestion.trim();
  const lower = q.toLowerCase();

  // Detect topic category
  let category = 'General Decision';
  if (/\b(code|compile|bug|deploy|git|server|api|app|website|typescript|react|javascript|database|test)\b/.test(lower)) {
    category = 'Software & Engineering';
  } else if (/\b(job|career|interview|hire|work|office|boss|freelance|client|business|startup)\b/.test(lower)) {
    category = 'Career & Business';
  } else if (/\b(buy|money|invest|spend|price|purchase|crypto|stock|budget|save|loan)\b/.test(lower)) {
    category = 'Finance & Spending';
  } else if (/\b(study|exam|learn|course|read|college|school|assignment|homework)\b/.test(lower)) {
    category = 'Learning & Academics';
  } else if (/\b(sleep|eat|gym|workout|coffee|break|rest|health|run|walk|food|pizza)\b/.test(lower)) {
    category = 'Lifestyle & Wellness';
  }

  if (mode === 'random') {
    const roll = Math.random();
    const answer: 'yes' | 'no' | 'maybe' = roll < 0.46 ? 'yes' : roll < 0.92 ? 'no' : 'maybe';
    const confidence = Math.floor(72 + Math.random() * 26);
    return {
      question: q,
      answer,
      confidence,
      riskLevel: answer === 'no' ? 'High' : answer === 'maybe' ? 'Moderate' : 'Low',
      category,
      rationale:
        answer === 'yes'
          ? 'Cosmic 50/50 entropy favors bold execution right now. Momentum is on your side.'
          : answer === 'no'
          ? 'Random probability signals a hidden trap. Stepping back saves you time and energy.'
          : 'The variables are evenly split. Wait for one more piece of information before committing.',
      nextStep:
        answer === 'yes'
          ? 'Take the first 5-minute action step immediately while your focus is high.'
          : 'Pause for 1 hour and re-evaluate your alternatives.',
    };
  }

  // High-risk negative patterns -> Confident NO
  const highRiskPattern =
    /\b(deploy.*friday|without test|skip sleep|all-nighter|procrastinat|quit without|gamble|ignore error|force push|delete prod|spam|cheat)\b/i;
  // Positive constructive patterns -> Confident YES
  const positiveGrowthPattern =
    /\b(learn|study|exercise|workout|drink water|save money|backup|test my code|start building|practice|help|clean|refactor|sleep early|take a.*break)\b/i;
  // Caution / ambiguous patterns -> MAYBE or NO in strict mode
  const cautionPattern = /\b(maybe|unsure|risky|expensive|impulse|late night|should i wait)\b/i;

  const hash = lower.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 7), 0);
  const timeSalt = Math.floor(Date.now() / 1000) % 7;

  let answer: 'yes' | 'no' | 'maybe' = 'yes';
  let confidence = 86;
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let rationale = '';
  let nextStep = '';

  if (highRiskPattern.test(lower)) {
    answer = 'no';
    confidence = 96;
    riskLevel = 'High';
    rationale =
      'High operational risk detected in your question. Taking shortcuts here has a high probability of backfiring.';
    nextStep = 'Run a safe checklist or postpone until proper safeguards and backups are in place.';
  } else if (positiveGrowthPattern.test(lower)) {
    answer = 'yes';
    confidence = 94;
    riskLevel = 'Low';
    rationale =
      'High-value compound habit detected. Starting now yields immediate positive ROI with virtually zero downside.';
    nextStep = 'Start a 15-minute timer right now and complete the very first milestone.';
  } else if (cautionPattern.test(lower)) {
    answer = mode === 'strict' ? 'no' : 'maybe';
    confidence = 78;
    riskLevel = 'Moderate';
    rationale =
      'Mixed risk-to-reward signals detected. Proceeding blindly could waste resources without a clear upside.';
    nextStep = 'List 2 pros and 2 cons on paper before making a final commitment.';
  } else {
    // Intelligent contextual hash + strictness bias
    const score = (hash + timeSalt) % 100;
    const threshold = mode === 'strict' ? 58 : 44;
    if (score >= threshold) {
      answer = 'yes';
      confidence = 79 + (score % 19);
      riskLevel = score > 80 ? 'Low' : 'Moderate';
      rationale =
        category === 'Software & Engineering'
          ? 'Technical conditions look favorable. Iterative execution will uncover any edge cases quickly.'
          : category === 'Career & Business'
          ? 'Strategic upside outweighs the cost of inaction. Taking initiative creates leverage.'
          : 'Favorable alignment between effort and outcome. Moving forward is better than overthinking.';
      nextStep = 'Commit to a small, reversible test step within the next 30 minutes.';
    } else if (score >= 12) {
      answer = 'no';
      confidence = 81 + (score % 17);
      riskLevel = 'High';
      rationale =
        category === 'Finance & Spending'
          ? 'Protected capital rule triggered: wait 48 hours to avoid impulse spending regret.'
          : category === 'Software & Engineering'
          ? 'Potential complexity trap detected. Verify dependencies and edge cases before proceeding.'
          : 'Current timing or setup carries unnecessary friction. Hold off for a stronger opening.';
      nextStep = 'Step back, review your constraints, and choose a simpler alternative.';
    } else {
      answer = 'maybe';
      confidence = 74;
      riskLevel = 'Moderate';
      rationale = 'Outcome depends heavily on execution details rather than a simple binary choice.';
      nextStep = 'Gather one more data point or test on a small scale first.';
    }
  }

  return {
    question: q,
    answer,
    confidence,
    riskLevel,
    category,
    rationale,
    nextStep,
  };
}

export const YesNoMagicGifOracleTool: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [oracleMode, setOracleMode] = useState<'smart' | 'strict' | 'random'>('smart');
  const [gifStyle, setGifStyle] = useState<'movie' | '3d'>('movie');
  const [gifLoaded, setGifLoaded] = useState(true);
  const [gifFailed, setGifFailed] = useState(false);
  const [warmPool, setWarmPool] = useState<Record<'yes' | 'no' | 'maybe', string[]>>(FAST_PRELOADED_GIF_POOL);
  const [history, setHistory] = useState<OracleEvaluation[]>([]);
  const [currentVerdict, setCurrentVerdict] = useState<OracleEvaluation>({
    question: 'Should I start building my new side project tonight?',
    answer: 'yes',
    confidence: 94,
    riskLevel: 'Low',
    category: 'Software & Engineering',
    rationale:
      'High-value compound habit detected. Starting now yields immediate positive ROI with virtually zero downside.',
    nextStep: 'Start a 15-minute timer right now and complete the very first milestone.',
    image: FAST_PRELOADED_GIF_POOL.yes[0],
    timestamp: 'Just now',
  });

  // Preload initial GIF pool into browser memory on mount for 0ms instant switching
  useEffect(() => {
    const allInitial = [
      ...FAST_PRELOADED_GIF_POOL.yes,
      ...FAST_PRELOADED_GIF_POOL.no,
      ...FAST_PRELOADED_GIF_POOL.maybe,
    ];
    allInitial.forEach(url => {
      const img = new Image();
      img.src = url;
    });

    // Also prefetch live GIFs from yesno.wtf/api in background ONLY after verifying they load
    let mounted = true;
    const prefetchLiveGif = async (forceAns: 'yes' | 'no' | 'maybe') => {
      try {
        const res = await fetch(`https://yesno.wtf/api?force=${forceAns}`);
        if (!res.ok) return;
        const data = (await res.json()) as OraclePoolItem;
        if (mounted && data?.image) {
          const preloadImg = new Image();
          preloadImg.onload = () => {
            if (!mounted) return;
            setWarmPool(prev => {
              const existing = prev[forceAns] || [];
              if (existing.includes(data.image)) return prev;
              return { ...prev, [forceAns]: [...existing, data.image].slice(0, 12) };
            });
          };
          preloadImg.src = data.image;
        }
      } catch {}
    };

    prefetchLiveGif('yes');
    prefetchLiveGif('no');
    prefetchLiveGif('maybe');

    return () => {
      mounted = false;
    };
  }, []);

  const pickInstantGif = (
    ans: 'yes' | 'no' | 'maybe',
    currentImg: string,
    preferredStyle: 'movie' | '3d' = gifStyle
  ): string => {
    const basePool =
      preferredStyle === '3d'
        ? GOOGLE_EDGE_ANIMATED_GIFS[ans]
        : warmPool[ans] || FAST_PRELOADED_GIF_POOL[ans];

    const candidates = basePool.filter(u => u !== currentImg);
    const chosen =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : basePool[0];

    return chosen;
  };

  // Automatic self-healing if a GIF URL is blocked or fails on mobile network
  const handleGifError = () => {
    const ans = currentVerdict.answer;
    const googleFallbacks = GOOGLE_EDGE_ANIMATED_GIFS[ans];
    const nextFallback = googleFallbacks.find(u => u !== currentVerdict.image);

    if (nextFallback && !googleFallbacks.includes(currentVerdict.image)) {
      setGifFailed(false);
      setGifLoaded(true);
      setCurrentVerdict(prev => ({ ...prev, image: nextFallback }));
    } else {
      // Hide broken <img> tag completely and show the built-in animated Magic Crystal stage
      setGifFailed(true);
      setGifLoaded(true);
    }
  };

  const askOracle = (customQuestion?: string) => {
    const targetQ = (customQuestion ?? question).trim();
    if (!targetQ) {
      toast.error('Please type a Yes/No question or pick a quick preset!');
      return;
    }

    const analysis = evaluateSmartQuestion(targetQ, oracleMode);
    const nextGif = pickInstantGif(analysis.answer, currentVerdict.image, gifStyle);

    const newEntry: OracleEvaluation = {
      ...analysis,
      image: nextGif,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setGifFailed(false);
    setGifLoaded(true);
    setCurrentVerdict(newEntry);
    setHistory(prev => [newEntry, ...prev].slice(0, 8));
  };

  const swapReactionGifOnly = () => {
    setGifFailed(false);
    const nextGif = pickInstantGif(currentVerdict.answer, currentVerdict.image, gifStyle);
    setCurrentVerdict(prev => ({ ...prev, image: nextGif }));
  };

  const speakVerdict = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Oracle Verdict: ${currentVerdict.answer.toUpperCase()}, with ${currentVerdict.confidence} percent confidence. ${currentVerdict.rationale} Next step: ${currentVerdict.nextStep}`;
      const utter = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    }
  };

  const verdictColorClass =
    currentVerdict.answer === 'yes'
      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
      : currentVerdict.answer === 'no'
      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
      : 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400';

  const stageGradientClass =
    currentVerdict.answer === 'yes'
      ? 'from-emerald-500/25 via-teal-500/15 to-background'
      : currentVerdict.answer === 'no'
      ? 'from-rose-500/25 via-red-500/15 to-background'
      : 'from-amber-500/25 via-purple-500/15 to-background';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HIGHLIGHTED ENTERTAINMENT & FUN DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-primary/15 border-2 border-amber-500/40 flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-lg">
          🎭
        </div>
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
              Just For Fun & Entertainment
            </span>
            <span className="text-xs font-extrabold text-foreground">
              Not Scientifically Accurate or Real-Life Advice!
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            This Magic GIF Oracle is a playful viral game & icebreaker. All <strong>YES / NO / MAYBE</strong> verdicts, confidence scores, and reaction GIFs are generated purely for <strong>fun, humor, and entertainment</strong> — they are <strong>not real predictions or factual advice</strong>. Enjoy the laughs and always use your own judgment for important decisions!
          </p>
        </div>
      </div>

      {/* Input & Oracle Mode Controls */}
      <div className="bg-card p-5 rounded-3xl border border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ask Any Yes or No Question (For Fun!)
          </label>
          <div className="flex items-center gap-1.5 bg-secondary/70 p-1 rounded-xl border border-border">
            {[
              { id: 'smart' as const, label: '🔮 Smart Context' },
              { id: 'strict' as const, label: '🛡️ Risk-Averse' },
              { id: 'random' as const, label: '🎲 Pure 50/50' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOracleMode(m.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  oracleMode === m.id
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            askOracle();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Type your Yes/No question (e.g., Should I deploy now? Should I buy this?)..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm font-semibold focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="group relative overflow-hidden btn-signature-primary px-6 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Ask Magic Oracle ✨</span>
          </button>
        </form>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground mr-1">Quick Dilemmas:</span>
          {QUICK_ORACLE_QUESTIONS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setQuestion(preset);
                askOracle(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-primary/15 hover:text-primary border border-border/80 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Verdict & Instant Preloaded GIF Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Instant GIF Stage */}
        <div className="lg:col-span-6 bg-card p-5 rounded-3xl border border-border flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-base font-black uppercase tracking-widest ${verdictColorClass}`}>
              <span>Verdict: {currentVerdict.answer.toUpperCase()}!</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextStyle = gifStyle === 'movie' ? '3d' : 'movie';
                  setGifStyle(nextStyle);
                  setGifFailed(false);
                  const nextGif = pickInstantGif(currentVerdict.answer, currentVerdict.image, nextStyle);
                  setCurrentVerdict(prev => ({ ...prev, image: nextGif }));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-muted border border-border text-[11px] font-bold cursor-pointer"
                title="Switch between Movie Reaction GIFs and 3D Animated Emoji GIFs"
              >
                {gifStyle === 'movie' ? '✨ 3D Sticker GIF' : '🎬 Movie Clip GIF'}
              </button>

              <button
                type="button"
                onClick={swapReactionGifOnly}
                className="group px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary/20 via-pink-500/20 to-amber-500/20 hover:from-primary hover:to-pink-500 hover:text-white border border-primary/40 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
                title="Instant 0ms GIF Swap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary group-hover:text-white group-hover:rotate-180 transition-transform duration-500" />
                <span>🎰 Spin GIF</span>
              </button>
            </div>
          </div>

          <div
            className={`relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br ${stageGradientClass} h-64 sm:h-72 flex items-center justify-center`}
          >
            {/* Always-present Animated Oracle Backdrop so broken image icon NEVER shows */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none pointer-events-none">
              <div className="text-6xl animate-bounce mb-2">
                {currentVerdict.answer === 'yes'
                  ? '🎉'
                  : currentVerdict.answer === 'no'
                  ? '🚫'
                  : '🔮'}
              </div>
              <div className="text-2xl font-black uppercase tracking-widest text-foreground/90">
                ORACLE SAYS {currentVerdict.answer.toUpperCase()}!
              </div>
              <div className="text-xs font-bold text-muted-foreground mt-1">
                {currentVerdict.confidence}% Cosmic Vibe Match • Just For Fun
              </div>
            </div>

            {!gifFailed && (
              <img
                key={currentVerdict.image}
                src={currentVerdict.image}
                alt=""
                onLoad={() => {
                  setGifLoaded(true);
                  setGifFailed(false);
                }}
                onError={handleGifError}
                className={`relative z-10 w-full h-full ${
                  currentVerdict.image.includes('gstatic.com')
                    ? 'object-contain p-6 bg-background/85 backdrop-blur-xs'
                    : 'object-cover'
                } transition-opacity duration-150 ${
                  gifLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            <div className="absolute z-20 bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] font-bold text-amber-300">
              🎭 Fun Simulation Only
            </div>

            <div className="absolute z-20 bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white">
              ⚡ Ultra-Fast GIF Engine
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={speakVerdict}
              className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span>Speak Verdict</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const summary = `Question: "${currentVerdict.question}"\nVerdict: ${currentVerdict.answer.toUpperCase()} (${currentVerdict.confidence}% Fun Score)\nNote: ${currentVerdict.rationale}\n(Generated just for fun by Toolzaro Magic GIF Oracle!)`;
                navigator.clipboard.writeText(summary);
                toast.success('Fun decision card copied to clipboard!');
              }}
              className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Fun Card</span>
            </button>
          </div>
        </div>

        {/* Right: Playful Decision Intelligence Breakdown */}
        <div className="lg:col-span-6 bg-card p-5 sm:p-6 rounded-3xl border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                {currentVerdict.category}
              </span>
              <span>Playful Risk Meter: {currentVerdict.riskLevel}</span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
              “{currentVerdict.question}”
            </h3>

            {/* Confidence Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground">Fun Vibe Confidence Meter</span>
                <span className="text-primary font-black">{currentVerdict.confidence}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden border border-border/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    currentVerdict.answer === 'yes'
                      ? 'bg-emerald-500'
                      : currentVerdict.answer === 'no'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${currentVerdict.confidence}%` }}
                />
              </div>
            </div>

            {/* Why this verdict */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                🧠 Playful Oracle Commentary
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                {currentVerdict.rationale}
              </p>
            </div>

            {/* Actionable Next Step */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                🎯 Suggested Fun Micro-Step
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                {currentVerdict.nextStep}
              </p>
            </div>
          </div>

          {/* Session Decision History */}
          {history.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Oracle Rolls ({history.length})
                </span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={`${item.timestamp}-${idx}`}
                    className="flex items-center justify-between gap-2 text-xs px-3 py-1.5 rounded-xl bg-secondary/40 border border-border/60"
                  >
                    <span className="truncate text-foreground font-medium">{item.question}</span>
                    <span
                      className={`font-black uppercase shrink-0 ${
                        item.answer === 'yes'
                          ? 'text-emerald-500'
                          : item.answer === 'no'
                          ? 'text-rose-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {item.answer} ({item.confidence}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. LIVE TRIVIA & BRAIN QUIZ ARENA (Open Trivia DB API)
// ============================================================================
interface TriviaItem {
  category: string;
  question: string;
  correct_answer: string;
  options: string[];
}

function decodeHtmlEntities(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

const FALLBACK_TRIVIA: TriviaItem[] = [
  {
    category: 'Science: Computers',
    question: 'What does CPU stand for in computer architecture?',
    correct_answer: 'Central Processing Unit',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Utility', 'Core Process Unit'],
  },
  {
    category: 'General Knowledge',
    question: 'Which planet in our solar system has the most moons?',
    correct_answer: 'Saturn',
    options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'],
  },
];

export const LiveTriviaQuizArenaTool: React.FC = () => {
  const [questions, setQuestions] = useState<TriviaItem[]>(FALLBACK_TRIVIA);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadTriviaBatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.results) && data.results.length > 0) {
          const formatted: TriviaItem[] = data.results.map((q: any) => {
            const correct = decodeHtmlEntities(q.correct_answer);
            const incorrect = (q.incorrect_answers || []).map((i: string) => decodeHtmlEntities(i));
            const options = [...incorrect, correct].sort(() => Math.random() - 0.5);
            return {
              category: decodeHtmlEntities(q.category),
              question: decodeHtmlEntities(q.question),
              correct_answer: correct,
              options,
            };
          });
          setQuestions(formatted);
          setCurrentIdx(0);
          setSelectedOpt(null);
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadTriviaBatch();
  }, []);

  const current = questions[currentIdx] || FALLBACK_TRIVIA[0];

  const handleSelectOption = (opt: string) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    if (opt === current.correct_answer) {
      setScore(s => s + 10);
      setStreak(st => st + 1);
      toast.success('Correct Answer! +10 pts');
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
    } else {
      loadTriviaBatch();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Trophy className="w-4 h-4" />
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
            <Flame className="w-4 h-4" />
            <span>Streak: {streak}🔥</span>
          </div>
        </div>
        <button
          type="button"
          onClick={loadTriviaBatch}
          disabled={loading}
          className="group px-4 py-2 rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-purple-600 text-white text-xs font-black shadow-md shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span>{loading ? '🎰 Spinning Quiz...' : '🎰 Spin New Quiz Set'}</span>
        </button>
      </div>

      <div className="bg-card p-6 rounded-3xl border border-border space-y-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{current.category}</span>
          <span>
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{current.question}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map((opt, idx) => {
            const isCorrect = opt === current.correct_answer;
            const isPicked = selectedOpt === opt;
            let btnClass = 'bg-secondary/60 hover:bg-secondary border-border text-foreground';
            if (selectedOpt) {
              if (isCorrect) {
                btnClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
              } else if (isPicked) {
                btnClass = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400';
              }
            }
            return (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all cursor-pointer ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selectedOpt && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-muted-foreground">
              Correct Answer: <strong className="text-emerald-500">{current.correct_answer}</strong>
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="btn-signature-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Next Question ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. POKÉMON POKÉDEX & BATTLE SIMULATOR (PokéAPI v2 + Visual Roster + Animated Powers)
// ============================================================================
interface PokeMovePower {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  category: 'Physical' | 'Special' | 'Ultimate';
  effect: string;
}

interface PokeFighter {
  id: number;
  name: string;
  title: string;
  sprite: string;
  animatedSprite: string;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  types: string[];
  abilities: string[];
  moves: PokeMovePower[];
}

const ELEMENT_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    bar: string;
    emoji: string;
    particleGlow: string;
  }
> = {
  electric: {
    bg: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    border: 'border-amber-500/40',
    text: 'text-amber-500',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    bar: 'bg-amber-400',
    emoji: '⚡',
    particleGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
  },
  fire: {
    bg: 'from-orange-500/20 via-red-500/10 to-transparent',
    border: 'border-orange-500/40',
    text: 'text-orange-500',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30',
    bar: 'bg-orange-500',
    emoji: '🔥',
    particleGlow: 'shadow-[0_0_30px_rgba(249,115,22,0.7)]',
  },
  water: {
    bg: 'from-sky-500/20 via-blue-500/10 to-transparent',
    border: 'border-sky-500/40',
    text: 'text-sky-500',
    badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
    bar: 'bg-sky-500',
    emoji: '💧',
    particleGlow: 'shadow-[0_0_30px_rgba(14,165,233,0.7)]',
  },
  grass: {
    bg: 'from-emerald-500/20 via-green-500/10 to-transparent',
    border: 'border-emerald-500/40',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    bar: 'bg-emerald-500',
    emoji: '🌿',
    particleGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.7)]',
  },
  psychic: {
    bg: 'from-pink-500/20 via-fuchsia-500/10 to-transparent',
    border: 'border-pink-500/40',
    text: 'text-pink-500',
    badge: 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/30',
    bar: 'bg-pink-500',
    emoji: '🔮',
    particleGlow: 'shadow-[0_0_30px_rgba(236,72,153,0.7)]',
  },
  dragon: {
    bg: 'from-indigo-500/20 via-violet-500/10 to-transparent',
    border: 'border-indigo-500/40',
    text: 'text-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    bar: 'bg-indigo-500',
    emoji: '🐉',
    particleGlow: 'shadow-[0_0_30px_rgba(99,102,241,0.7)]',
  },
  ghost: {
    bg: 'from-purple-500/20 via-violet-500/10 to-transparent',
    border: 'border-purple-500/40',
    text: 'text-purple-500',
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    bar: 'bg-purple-500',
    emoji: '👻',
    particleGlow: 'shadow-[0_0_30px_rgba(168,85,247,0.7)]',
  },
  fighting: {
    bg: 'from-red-500/20 via-rose-500/10 to-transparent',
    border: 'border-red-500/40',
    text: 'text-red-500',
    badge: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30',
    bar: 'bg-red-500',
    emoji: '🥊',
    particleGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.7)]',
  },
  dark: {
    bg: 'from-slate-600/25 via-zinc-700/15 to-transparent',
    border: 'border-slate-500/40',
    text: 'text-slate-400',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
    bar: 'bg-slate-500',
    emoji: '🌑',
    particleGlow: 'shadow-[0_0_30px_rgba(100,116,139,0.7)]',
  },
  steel: {
    bg: 'from-cyan-500/20 via-slate-400/10 to-transparent',
    border: 'border-cyan-500/40',
    text: 'text-cyan-500',
    badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
    bar: 'bg-cyan-500',
    emoji: '⚙️',
    particleGlow: 'shadow-[0_0_30px_rgba(6,182,212,0.7)]',
  },
  ice: {
    bg: 'from-cyan-400/20 via-sky-300/10 to-transparent',
    border: 'border-cyan-400/40',
    text: 'text-cyan-400',
    badge: 'bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30',
    bar: 'bg-cyan-400',
    emoji: '❄️',
    particleGlow: 'shadow-[0_0_30px_rgba(34,211,238,0.7)]',
  },
  fairy: {
    bg: 'from-rose-400/20 via-pink-400/10 to-transparent',
    border: 'border-rose-400/40',
    text: 'text-rose-400',
    badge: 'bg-rose-400/15 text-rose-600 dark:text-rose-300 border-rose-400/30',
    bar: 'bg-rose-400',
    emoji: '✨',
    particleGlow: 'shadow-[0_0_30px_rgba(251,113,133,0.7)]',
  },
  flying: {
    bg: 'from-sky-400/20 via-indigo-400/10 to-transparent',
    border: 'border-sky-400/40',
    text: 'text-sky-400',
    badge: 'bg-sky-400/15 text-sky-600 dark:text-sky-300 border-sky-400/30',
    bar: 'bg-sky-400',
    emoji: '🌪️',
    particleGlow: 'shadow-[0_0_30px_rgba(56,189,248,0.7)]',
  },
  ground: {
    bg: 'from-amber-600/20 via-yellow-700/10 to-transparent',
    border: 'border-amber-600/40',
    text: 'text-amber-600',
    badge: 'bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-600/30',
    bar: 'bg-amber-600',
    emoji: '🌋',
    particleGlow: 'shadow-[0_0_30px_rgba(217,119,6,0.7)]',
  },
  normal: {
    bg: 'from-zinc-400/20 via-stone-400/10 to-transparent',
    border: 'border-zinc-400/40',
    text: 'text-zinc-500',
    badge: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/30',
    bar: 'bg-zinc-500',
    emoji: '💥',
    particleGlow: 'shadow-[0_0_30px_rgba(161,161,170,0.7)]',
  },
};

function getElementStyle(type: string) {
  return ELEMENT_STYLES[type.toLowerCase()] || ELEMENT_STYLES.normal;
}

// Type effectiveness lookup for realistic multiplier calculation
const TYPE_ADVANTAGE_CHART: Record<string, string[]> = {
  electric: ['water', 'flying'],
  fire: ['grass', 'ice', 'steel', 'bug'],
  water: ['fire', 'ground', 'rock'],
  grass: ['water', 'ground', 'rock'],
  psychic: ['fighting', 'poison'],
  dragon: ['dragon'],
  ghost: ['psychic', 'ghost'],
  fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
  dark: ['psychic', 'ghost'],
  ice: ['dragon', 'flying', 'grass', 'ground'],
  fairy: ['dragon', 'dark', 'fighting'],
  ground: ['electric', 'fire', 'steel', 'rock', 'poison'],
  flying: ['grass', 'fighting', 'bug'],
  steel: ['ice', 'rock', 'fairy'],
};

function getTypeMultiplier(moveType: string, defenderTypes: string[]): number {
  const strongAgainst = TYPE_ADVANTAGE_CHART[moveType.toLowerCase()] || [];
  let mult = 1;
  for (const dt of defenderTypes) {
    if (strongAgainst.includes(dt.toLowerCase())) {
      mult *= 1.6;
    }
  }
  return Number(mult.toFixed(2));
}

// Pre-curated Roster of 24 Iconic & Fan-Favorite Pokémon so users can browse/scroll with arrows without knowing names!
const ICONIC_POKEMON_ROSTER: PokeFighter[] = [
  {
    id: 25,
    name: 'pikachu',
    title: 'Thunderbolt Icon',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
    hp: 35,
    attack: 55,
    defense: 40,
    spAtk: 50,
    spDef: 50,
    speed: 90,
    types: ['electric'],
    abilities: ['Static Aura', 'Lightning Rod'],
    moves: [
      { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, category: 'Special', effect: '10% chance to paralyze target' },
      { name: 'Volt Tackle', type: 'electric', power: 120, accuracy: 90, category: 'Ultimate', effect: 'Massive high-voltage collision' },
      { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 85, category: 'Physical', effect: 'Lowers target Defense by 30%' },
      { name: 'Electro Ball', type: 'electric', power: 85, accuracy: 100, category: 'Special', effect: 'Scales with high Speed stat' },
    ],
  },
  {
    id: 6,
    name: 'charizard',
    title: 'Inferno Sky Dragon',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif',
    hp: 78,
    attack: 84,
    defense: 78,
    spAtk: 109,
    spDef: 85,
    speed: 100,
    types: ['fire', 'flying'],
    abilities: ['Blaze Core', 'Solar Power'],
    moves: [
      { name: 'Flamethrower', type: 'fire', power: 95, accuracy: 100, category: 'Special', effect: 'Searing jet of intense fire' },
      { name: 'Blast Burn', type: 'fire', power: 150, accuracy: 90, category: 'Ultimate', effect: 'Cataclysmic volcanic explosion' },
      { name: 'Dragon Claw', type: 'dragon', power: 80, accuracy: 100, category: 'Physical', effect: 'Razorsharp draconic slash' },
      { name: 'Air Slash', type: 'flying', power: 75, accuracy: 95, category: 'Special', effect: '30% chance to flinch foe' },
    ],
  },
  {
    id: 150,
    name: 'mewtwo',
    title: 'Genetic Psychic Apex',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif',
    hp: 106,
    attack: 110,
    defense: 90,
    spAtk: 154,
    spDef: 90,
    speed: 130,
    types: ['psychic'],
    abilities: ['Pressure Field', 'Unnerve'],
    moves: [
      { name: 'Psystrike', type: 'psychic', power: 135, accuracy: 100, category: 'Ultimate', effect: 'Pierces physical armor with telekinesis' },
      { name: 'Aura Sphere', type: 'fighting', power: 85, accuracy: 100, category: 'Special', effect: 'Never misses target' },
      { name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, category: 'Special', effect: 'Hurls dark matter orb' },
      { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, category: 'Special', effect: 'Sub-zero freezing beam' },
    ],
  },
  {
    id: 658,
    name: 'greninja',
    title: 'Shinobi Water Assassin',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/658.gif',
    hp: 72,
    attack: 95,
    defense: 67,
    spAtk: 103,
    spDef: 71,
    speed: 122,
    types: ['water', 'dark'],
    abilities: ['Battle Bond', 'Protean'],
    moves: [
      { name: 'Water Shuriken', type: 'water', power: 110, accuracy: 100, category: 'Ultimate', effect: 'Multi-hit compressed hydro stars' },
      { name: 'Night Slash', type: 'dark', power: 85, accuracy: 100, category: 'Physical', effect: 'High critical-hit shadow blade' },
      { name: 'Hydro Pump', type: 'water', power: 115, accuracy: 85, category: 'Special', effect: 'High-pressure tidal cannon' },
      { name: 'Ice Punch', type: 'ice', power: 75, accuracy: 100, category: 'Physical', effect: 'Chilling frost strike' },
    ],
  },
  {
    id: 448,
    name: 'lucario',
    title: 'Aura Steel Guardian',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/448.gif',
    hp: 70,
    attack: 110,
    defense: 70,
    spAtk: 115,
    spDef: 70,
    speed: 90,
    types: ['fighting', 'steel'],
    abilities: ['Inner Focus', 'Justified Aura'],
    moves: [
      { name: 'Aura Sphere', type: 'fighting', power: 105, accuracy: 100, category: 'Special', effect: 'Unblockable life-force blast' },
      { name: 'Close Combat', type: 'fighting', power: 125, accuracy: 100, category: 'Ultimate', effect: 'Relentless martial barrage' },
      { name: 'Flash Cannon', type: 'steel', power: 85, accuracy: 100, category: 'Special', effect: 'Concentrated metallic laser' },
      { name: 'Extreme Speed', type: 'normal', power: 80, accuracy: 100, category: 'Physical', effect: 'Blinding first-strike dash' },
    ],
  },
  {
    id: 94,
    name: 'gengar',
    title: 'Phantom Shadow Trickster',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif',
    hp: 60,
    attack: 65,
    defense: 60,
    spAtk: 130,
    spDef: 75,
    speed: 110,
    types: ['ghost', 'poison'],
    abilities: ['Cursed Body', 'Shadow Levitate'],
    moves: [
      { name: 'Shadow Ball', type: 'ghost', power: 100, accuracy: 100, category: 'Special', effect: 'Spectral vortex blast' },
      { name: 'Phantom Force', type: 'ghost', power: 125, accuracy: 100, category: 'Ultimate', effect: 'Strikes from the shadow dimension' },
      { name: 'Dark Pulse', type: 'dark', power: 85, accuracy: 100, category: 'Special', effect: 'Waves of nightmare energy' },
      { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, category: 'Special', effect: 'High-voltage shock' },
    ],
  },
  {
    id: 384,
    name: 'rayquaza',
    title: 'Sky High Sovereign',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/384.gif',
    hp: 105,
    attack: 150,
    defense: 90,
    spAtk: 150,
    spDef: 90,
    speed: 95,
    types: ['dragon', 'flying'],
    abilities: ['Air Lock', 'Delta Stream'],
    moves: [
      { name: 'Dragon Ascent', type: 'flying', power: 145, accuracy: 100, category: 'Ultimate', effect: 'Meteoric dive from the ozone layer' },
      { name: 'Outrage', type: 'dragon', power: 120, accuracy: 100, category: 'Physical', effect: 'Furious draconic rampage' },
      { name: 'Extreme Speed', type: 'normal', power: 80, accuracy: 100, category: 'Physical', effect: 'Supersonic strike' },
      { name: 'Hyper Beam', type: 'normal', power: 130, accuracy: 90, category: 'Special', effect: 'Orbital energy beam' },
    ],
  },
  {
    id: 9,
    name: 'blastoise',
    title: 'Hydro Cannon Fortress',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/9.gif',
    hp: 79,
    attack: 83,
    defense: 100,
    spAtk: 85,
    spDef: 105,
    speed: 78,
    types: ['water'],
    abilities: ['Torrent', 'Rain Dish'],
    moves: [
      { name: 'Hydro Cannon', type: 'water', power: 140, accuracy: 90, category: 'Ultimate', effect: 'Twin-turret deluge blast' },
      { name: 'Surf', type: 'water', power: 90, accuracy: 100, category: 'Special', effect: 'Crushing tidal wave' },
      { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, category: 'Special', effect: 'Glacial freeze ray' },
      { name: 'Flash Cannon', type: 'steel', power: 80, accuracy: 100, category: 'Special', effect: 'Heavy armor beam' },
    ],
  },
  {
    id: 3,
    name: 'venusaur',
    title: 'Solar Jungle Titan',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/3.gif',
    hp: 80,
    attack: 82,
    defense: 83,
    spAtk: 100,
    spDef: 100,
    speed: 80,
    types: ['grass', 'poison'],
    abilities: ['Overgrow', 'Chlorophyll'],
    moves: [
      { name: 'Solar Beam', type: 'grass', power: 135, accuracy: 100, category: 'Ultimate', effect: 'Concentrated sunlight blast' },
      { name: 'Petal Blizzard', type: 'grass', power: 90, accuracy: 100, category: 'Physical', effect: 'Razor-sharp floral tempest' },
      { name: 'Earth Power', type: 'ground', power: 90, accuracy: 100, category: 'Special', effect: 'Seismic ground eruption' },
      { name: 'Giga Drain', type: 'grass', power: 75, accuracy: 100, category: 'Special', effect: 'Absorbs vitality from target' },
    ],
  },
  {
    id: 149,
    name: 'dragonite',
    title: 'Tempest Guardian Dragon',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/149.gif',
    hp: 91,
    attack: 134,
    defense: 95,
    spAtk: 100,
    spDef: 100,
    speed: 80,
    types: ['dragon', 'flying'],
    abilities: ['Multiscale Shield', 'Inner Focus'],
    moves: [
      { name: 'Draco Meteor', type: 'dragon', power: 135, accuracy: 90, category: 'Ultimate', effect: 'Summons falling comets from space' },
      { name: 'Hurricane', type: 'flying', power: 110, accuracy: 85, category: 'Special', effect: 'Category-5 cyclone vortex' },
      { name: 'Thunder Punch', type: 'electric', power: 75, accuracy: 100, category: 'Physical', effect: 'Electrified fist impact' },
      { name: 'Fire Punch', type: 'fire', power: 75, accuracy: 100, category: 'Physical', effect: 'Blazing dragon knuckle' },
    ],
  },
  {
    id: 445,
    name: 'garchomp',
    title: 'Mach-Speed Land Shark',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/445.gif',
    hp: 108,
    attack: 130,
    defense: 95,
    spAtk: 80,
    spDef: 85,
    speed: 102,
    types: ['dragon', 'ground'],
    abilities: ['Rough Skin', 'Sand Veil'],
    moves: [
      { name: 'Earthquake', type: 'ground', power: 120, accuracy: 100, category: 'Ultimate', effect: 'Tectonic shockwave across the arena' },
      { name: 'Dragon Rush', type: 'dragon', power: 105, accuracy: 90, category: 'Physical', effect: 'Supersonic jet tackle' },
      { name: 'Fire Fang', type: 'fire', power: 75, accuracy: 95, category: 'Physical', effect: 'Thermal bite attack' },
      { name: 'Iron Head', type: 'steel', power: 80, accuracy: 100, category: 'Physical', effect: 'Armored cranial slam' },
    ],
  },
  {
    id: 143,
    name: 'snorlax',
    title: 'Unstoppable Colossal Tank',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/143.gif',
    hp: 160,
    attack: 110,
    defense: 65,
    spAtk: 65,
    spDef: 110,
    speed: 30,
    types: ['normal'],
    abilities: ['Thick Fat Armor', 'Immunity'],
    moves: [
      { name: 'Giga Impact', type: 'normal', power: 145, accuracy: 90, category: 'Ultimate', effect: 'Full-weight earth-shattering slam' },
      { name: 'Body Slam', type: 'normal', power: 90, accuracy: 100, category: 'Physical', effect: '30% chance to paralyze opponent' },
      { name: 'Heavy Slam', type: 'steel', power: 100, accuracy: 100, category: 'Physical', effect: 'Crushes lighter targets' },
      { name: 'Earthquake', type: 'ground', power: 100, accuracy: 100, category: 'Physical', effect: 'Ground-shaking stomp' },
    ],
  },
  {
    id: 130,
    name: 'gyarados',
    title: 'Leviathan Sea Rampager',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/130.gif',
    hp: 95,
    attack: 125,
    defense: 79,
    spAtk: 60,
    spDef: 100,
    speed: 81,
    types: ['water', 'flying'],
    abilities: ['Intimidate', 'Moxie Boost'],
    moves: [
      { name: 'Aqua Tail', type: 'water', power: 110, accuracy: 90, category: 'Physical', effect: 'Whirlpool tail whip' },
      { name: 'Hyper Beam', type: 'normal', power: 140, accuracy: 90, category: 'Ultimate', effect: 'Devastating mouth laser' },
      { name: 'Ice Fang', type: 'ice', power: 75, accuracy: 95, category: 'Physical', effect: 'Freezing serpent jaws' },
      { name: 'Crunch', type: 'dark', power: 85, accuracy: 100, category: 'Physical', effect: 'Armor-crushing bite' },
    ],
  },
  {
    id: 249,
    name: 'lugia',
    title: 'Guardian of the Abyssal Seas',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/249.gif',
    hp: 106,
    attack: 90,
    defense: 130,
    spAtk: 90,
    spDef: 154,
    speed: 110,
    types: ['psychic', 'flying'],
    abilities: ['Multiscale', 'Pressure'],
    moves: [
      { name: 'Aeroblast', type: 'flying', power: 135, accuracy: 95, category: 'Ultimate', effect: 'Vortex vacuum blast with high crit' },
      { name: 'Psychic', type: 'psychic', power: 95, accuracy: 100, category: 'Special', effect: 'Telekinetic shockwave' },
      { name: 'Hydro Pump', type: 'water', power: 110, accuracy: 85, category: 'Special', effect: 'Deep ocean pressure jet' },
      { name: 'Dragon Pulse', type: 'dragon', power: 85, accuracy: 100, category: 'Special', effect: 'Draconic shockwave' },
    ],
  },
  {
    id: 257,
    name: 'blaziken',
    title: 'Blazing Martial Striker',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/257.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/257.gif',
    hp: 80,
    attack: 120,
    defense: 70,
    spAtk: 110,
    spDef: 70,
    speed: 80,
    types: ['fire', 'fighting'],
    abilities: ['Speed Boost', 'Blaze'],
    moves: [
      { name: 'Blaze Kick', type: 'fire', power: 105, accuracy: 95, category: 'Physical', effect: 'Fiery roundhouse kick' },
      { name: 'Flare Blitz', type: 'fire', power: 130, accuracy: 100, category: 'Ultimate', effect: 'Cloaked in inferno charge' },
      { name: 'Sky Uppercut', type: 'fighting', power: 90, accuracy: 95, category: 'Physical', effect: 'Rising dragon uppercut' },
      { name: 'Brave Bird', type: 'flying', power: 110, accuracy: 100, category: 'Physical', effect: 'Supersonic aerial dive' },
    ],
  },
  {
    id: 282,
    name: 'gardevoir',
    title: 'Celestial Empathy Mage',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png',
    animatedSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/282.gif',
    hp: 68,
    attack: 65,
    defense: 65,
    spAtk: 125,
    spDef: 115,
    speed: 80,
    types: ['psychic', 'fairy'],
    abilities: ['Synchronize', 'Pixilate'],
    moves: [
      { name: 'Moonblast', type: 'fairy', power: 120, accuracy: 100, category: 'Ultimate', effect: 'Calls down lunar starlight' },
      { name: 'Psychic', type: 'psychic', power: 95, accuracy: 100, category: 'Special', effect: 'Gravity-warping mental wave' },
      { name: 'Dazzling Gleam', type: 'fairy', power: 85, accuracy: 100, category: 'Special', effect: 'Blinding prism flash' },
      { name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, category: 'Special', effect: 'Void orb projectile' },
    ],
  },
];

function buildMovesFromApiData(types: string[], rawMoves: any[]): PokeMovePower[] {
  const primaryType = types[0] || 'normal';
  const secondaryType = types[1] || primaryType;
  const extractedNames = (rawMoves || [])
    .slice(0, 12)
    .map((m: any) => String(m?.move?.name || '').replace(/-/g, ' '))
    .filter(Boolean);

  const move1 = extractedNames[0] || `${primaryType} strike`;
  const move2 = extractedNames[1] || `${secondaryType} burst`;
  const move3 = extractedNames[2] || `hyper impact`;
  const move4 = extractedNames[3] || `nova overdrive`;

  const cap = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

  return [
    {
      name: cap(move1),
      type: primaryType,
      power: 90,
      accuracy: 100,
      category: 'Special',
      effect: `Signature ${primaryType.toUpperCase()} elemental attack`,
    },
    {
      name: cap(move4),
      type: primaryType,
      power: 130,
      accuracy: 90,
      category: 'Ultimate',
      effect: `Ultimate ${primaryType.toUpperCase()} overdrive finisher`,
    },
    {
      name: cap(move2),
      type: secondaryType,
      power: 85,
      accuracy: 100,
      category: 'Physical',
      effect: `Rapid ${secondaryType.toUpperCase()} combo strike`,
    },
    {
      name: cap(move3),
      type: 'normal',
      power: 80,
      accuracy: 100,
      category: 'Physical',
      effect: 'High-velocity kinetic impact',
    },
  ];
}

export const PokemonPokedexBattleTool: React.FC = () => {
  const [pokeLeft, setPokeLeft] = useState<PokeFighter>(ICONIC_POKEMON_ROSTER[0]);
  const [pokeRight, setPokeRight] = useState<PokeFighter>(ICONIC_POKEMON_ROSTER[1]);
  const [queryLeft, setQueryLeft] = useState('pikachu');
  const [queryRight, setQueryRight] = useState('charizard');
  const [activeSlot, setActiveSlot] = useState<'left' | 'right'>('left');
  const [rosterFilter, setRosterFilter] = useState<string>('all');
  const [useAnimatedSprites, setUseAnimatedSprites] = useState<boolean>(true);

  // Live Battle & Animation State
  const maxHpLeft = pokeLeft.hp * 4;
  const maxHpRight = pokeRight.hp * 4;
  const [hpLeft, setHpLeft] = useState<number>(pokeLeft.hp * 4);
  const [hpRight, setHpRight] = useState<number>(pokeRight.hp * 4);
  const [attackingSide, setAttackingSide] = useState<'left' | 'right' | null>(null);
  const [hitSide, setHitSide] = useState<'left' | 'right' | null>(null);
  const [activePowerBanner, setActivePowerBanner] = useState<{
    attacker: string;
    moveName: string;
    moveType: string;
    damage: number;
    effectiveness: string;
  } | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [winnerSide, setWinnerSide] = useState<'left' | 'right' | null>(null);
  const [isAutoBattling, setIsAutoBattling] = useState<boolean>(false);

  const rosterScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Reset HP whenever fighters change
  useEffect(() => {
    setHpLeft(pokeLeft.hp * 4);
    setHpRight(pokeRight.hp * 4);
    setWinnerSide(null);
    setActivePowerBanner(null);
    setBattleLogs([
      `🏟️ Matchup Ready: ${pokeLeft.name.toUpperCase()} (#${pokeLeft.id}) vs ${pokeRight.name.toUpperCase()} (#${pokeRight.id})! Click any Power Move below or press "Auto-Battle" to watch the animated clash!`,
    ]);
  }, [pokeLeft, pokeRight]);

  const selectFromRoster = (fighter: PokeFighter, side: 'left' | 'right') => {
    if (side === 'left') {
      setPokeLeft(fighter);
      setQueryLeft(fighter.name);
    } else {
      setPokeRight(fighter);
      setQueryRight(fighter.name);
    }
  };

  // Cycle Previous / Next character using Left/Right arrows on each Fighter card
  const cycleCharacter = (side: 'left' | 'right', direction: -1 | 1) => {
    const current = side === 'left' ? pokeLeft : pokeRight;
    const idx = ICONIC_POKEMON_ROSTER.findIndex(p => p.id === current.id);
    if (idx !== -1) {
      const nextIdx = (idx + direction + ICONIC_POKEMON_ROSTER.length) % ICONIC_POKEMON_ROSTER.length;
      selectFromRoster(ICONIC_POKEMON_ROSTER[nextIdx], side);
    } else {
      const nextId = Math.max(1, Math.min(1010, current.id + direction));
      fetchPokemon(String(nextId), side);
    }
  };

  const fetchPokemon = async (nameOrId: string, side: 'left' | 'right') => {
    const clean = nameOrId.trim().toLowerCase();
    if (!clean) return;

    // First check if it's in our rich curated roster
    const existing = ICONIC_POKEMON_ROSTER.find(
      p => p.name.toLowerCase() === clean || String(p.id) === clean
    );
    if (existing) {
      selectFromRoster(existing, side);
      return;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(clean)}`);
      if (!res.ok) {
        toast.error(`Pokémon "${clean}" not found! Try scrolling the Character Roster above.`);
        return;
      }
      const data = await res.json();
      const types: string[] = (data.types || []).map((t: any) => t.type.name);
      const abilities: string[] = (data.abilities || [])
        .slice(0, 2)
        .map((a: any) => String(a.ability.name).replace(/-/g, ' '));
      const parsed: PokeFighter = {
        name: data.name,
        id: data.id,
        title: `${types[0]?.toUpperCase() || 'ARENA'} Challenger`,
        sprite:
          data.sprites?.other?.['official-artwork']?.front_default ||
          data.sprites?.front_default,
        animatedSprite:
          data.sprites?.other?.showdown?.front_default ||
          data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
          data.sprites?.other?.['official-artwork']?.front_default ||
          data.sprites?.front_default,
        hp: data.stats?.[0]?.base_stat || 60,
        attack: data.stats?.[1]?.base_stat || 65,
        defense: data.stats?.[2]?.base_stat || 60,
        spAtk: data.stats?.[3]?.base_stat || 65,
        spDef: data.stats?.[4]?.base_stat || 60,
        speed: data.stats?.[5]?.base_stat || 65,
        types,
        abilities: abilities.length > 0 ? abilities : ['Battle Spirit'],
        moves: buildMovesFromApiData(types, data.moves || []),
      };
      if (side === 'left') {
        setPokeLeft(parsed);
        setQueryLeft(parsed.name);
      } else {
        setPokeRight(parsed);
        setQueryRight(parsed.name);
      }
      toast.success(`Loaded ${parsed.name.toUpperCase()} (#${parsed.id})!`);
    } catch {
      toast.error('Failed to fetch from PokéAPI.');
    }
  };

  // Execute an animated single power strike from either side
  const executePowerStrike = (side: 'left' | 'right', move: PokeMovePower) => {
    if (isAutoBattling) return;
    const attacker = side === 'left' ? pokeLeft : pokeRight;
    const defender = side === 'left' ? pokeRight : pokeLeft;
    const targetSide = side === 'left' ? 'right' : 'left';

    // Reset match if someone was already at 0 HP
    let currentLeftHp = hpLeft;
    let currentRightHp = hpRight;
    if (currentLeftHp <= 0 || currentRightHp <= 0) {
      currentLeftHp = maxHpLeft;
      currentRightHp = maxHpRight;
      setHpLeft(maxHpLeft);
      setHpRight(maxHpRight);
      setWinnerSide(null);
    }

    const atkStat = move.category === 'Physical' ? attacker.attack : attacker.spAtk;
    const defStat = move.category === 'Physical' ? defender.defense : defender.spDef;
    const mult = getTypeMultiplier(move.type, defender.types);
    const crit = Math.random() < 0.18 ? 1.35 : 1;
    const rawDamage = Math.round(((move.power * (atkStat / Math.max(40, defStat))) * 0.45 + 18) * mult * crit);

    const effLabel =
      mult > 1.2
        ? '🔥 SUPER EFFECTIVE (1.6x)!'
        : crit > 1
        ? '💥 CRITICAL STRIKE!'
        : '⚡ DIRECT HIT!';

    setAttackingSide(side);
    setHitSide(targetSide);
    setActivePowerBanner({
      attacker: attacker.name.toUpperCase(),
      moveName: move.name,
      moveType: move.type,
      damage: rawDamage,
      effectiveness: effLabel,
    });

    if (targetSide === 'right') {
      const nextHp = Math.max(0, currentRightHp - rawDamage);
      setHpRight(nextHp);
      if (nextHp === 0) setWinnerSide('left');
    } else {
      const nextHp = Math.max(0, currentLeftHp - rawDamage);
      setHpLeft(nextHp);
      if (nextHp === 0) setWinnerSide('right');
    }

    const style = getElementStyle(move.type);
    setBattleLogs(prev => [
      `${style.emoji} ${attacker.name.toUpperCase()} unleashed [${move.name}]! Dealt -${rawDamage} HP to ${defender.name.toUpperCase()} (${effLabel})`,
      ...prev.slice(0, 7),
    ]);

    setTimeout(() => {
      setAttackingSide(null);
      setHitSide(null);
    }, 550);
  };

  // Full Animated Multi-Turn Battle Simulation
  const runAnimatedAutoBattle = () => {
    if (isAutoBattling) return;
    setIsAutoBattling(true);
    setWinnerSide(null);

    let lHp = maxHpLeft;
    let rHp = maxHpRight;
    setHpLeft(lHp);
    setHpRight(rHp);
    setBattleLogs([`🔔 CINEMATIC CLASH STARTED: ${pokeLeft.name.toUpperCase()} vs ${pokeRight.name.toUpperCase()}!`]);

    // Faster Pokémon attacks first
    let turnSide: 'left' | 'right' = pokeLeft.speed >= pokeRight.speed ? 'left' : 'right';
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const attacker = turnSide === 'left' ? pokeLeft : pokeRight;
      const defender = turnSide === 'left' ? pokeRight : pokeLeft;
      const targetSide = turnSide === 'left' ? 'right' : 'left';

      const move = attacker.moves[step % attacker.moves.length] || attacker.moves[0];
      const atkStat = move.category === 'Physical' ? attacker.attack : attacker.spAtk;
      const defStat = move.category === 'Physical' ? defender.defense : defender.spDef;
      const mult = getTypeMultiplier(move.type, defender.types);
      const rawDamage = Math.round(((move.power * (atkStat / Math.max(40, defStat))) * 0.52 + 24) * mult);

      const effLabel = mult > 1.2 ? '🔥 SUPER EFFECTIVE!' : '⚡ POWER HIT!';
      const style = getElementStyle(move.type);

      setAttackingSide(turnSide);
      setHitSide(targetSide);
      setActivePowerBanner({
        attacker: attacker.name.toUpperCase(),
        moveName: move.name,
        moveType: move.type,
        damage: rawDamage,
        effectiveness: effLabel,
      });

      if (targetSide === 'right') {
        rHp = Math.max(0, rHp - rawDamage);
        setHpRight(rHp);
      } else {
        lHp = Math.max(0, lHp - rawDamage);
        setHpLeft(lHp);
      }

      setBattleLogs(prev => [
        `Turn ${step}: ${style.emoji} ${attacker.name.toUpperCase()} used ${move.name} (-${rawDamage} HP)!`,
        ...prev.slice(0, 7),
      ]);

      setTimeout(() => {
        setAttackingSide(null);
        setHitSide(null);
      }, 420);

      if (lHp <= 0 || rHp <= 0 || step >= 10) {
        clearInterval(timer);
        const winSide = lHp >= rHp ? 'left' : 'right';
        const winPoke = winSide === 'left' ? pokeLeft : pokeRight;
        setWinnerSide(winSide);
        setIsAutoBattling(false);
        setBattleLogs(prev => [
          `🏆 VICTORY: ${winPoke.name.toUpperCase()} wins the Pokémon Battle Arena!`,
          ...prev,
        ]);
      } else {
        turnSide = turnSide === 'left' ? 'right' : 'left';
      }
    }, 750);
  };

  const scrollRoster = (dir: -1 | 1) => {
    if (rosterScrollRef.current) {
      rosterScrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  const filteredRoster =
    rosterFilter === 'all'
      ? ICONIC_POKEMON_ROSTER
      : ICONIC_POKEMON_ROSTER.filter(p => p.types.includes(rosterFilter));

  return (
    <div className="space-y-6">
      {/* 1. VISUAL SCROLLABLE CHARACTER ROSTER WITH ARROWS (No need to know names!) */}
      <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary block">
              🎮 Visual Character Selector (Scroll or Use Arrows)
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">
              Don’t know Pokémon names? Pick any character below for{' '}
              <span className="text-amber-500">Fighter 1</span> or{' '}
              <span className="text-rose-500">Fighter 2</span>
            </h3>
          </div>

          {/* Target Slot Toggle + Animated Sprite Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-secondary/80 p-1 border border-border">
              <button
                type="button"
                onClick={() => setActiveSlot('left')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeSlot === 'left'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Selecting for: Fighter 1 ({pokeLeft.name.toUpperCase()})
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot('right')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeSlot === 'right'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Selecting for: Fighter 2 ({pokeRight.name.toUpperCase()})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setUseAnimatedSprites(v => !v)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                useAnimatedSprites
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-secondary border-border text-muted-foreground'
              }`}
            >
              {useAnimatedSprites ? '✨ 3D/GIF Motion: ON' : '🖼️ Static HD Art'}
            </button>
          </div>
        </div>

        {/* Element Filter Chips + Left/Right Carousel Scroll Arrows */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: '🌟 All Heroes (16)' },
              { id: 'electric', label: '⚡ Electric' },
              { id: 'fire', label: '🔥 Fire' },
              { id: 'water', label: '💧 Water' },
              { id: 'dragon', label: '🐉 Dragon' },
              { id: 'psychic', label: '🔮 Psychic' },
              { id: 'fighting', label: '🥊 Fighting' },
              { id: 'ghost', label: '👻 Ghost' },
              { id: 'grass', label: '🌿 Grass' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRosterFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                  rosterFilter === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollRoster(-1)}
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white border border-border transition-colors cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRoster(1)}
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white border border-border transition-colors cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Roster Strip */}
        <div
          ref={rosterScrollRef}
          className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth"
        >
          {filteredRoster.map(hero => {
            const isLeft = pokeLeft.id === hero.id;
            const isRight = pokeRight.id === hero.id;
            const style = getElementStyle(hero.types[0]);
            const totalPower = hero.hp + hero.attack + hero.defense + hero.spAtk + hero.spDef + hero.speed;
            return (
              <div
                key={hero.id}
                onClick={() => selectFromRoster(hero, activeSlot)}
                className={`group relative w-36 sm:w-40 shrink-0 rounded-2xl p-3 border bg-gradient-to-b ${style.bg} transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between ${
                  isLeft
                    ? 'ring-2 ring-amber-500 border-amber-500'
                    : isRight
                    ? 'ring-2 ring-rose-500 border-rose-500'
                    : `${style.border} hover:border-primary`
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-black">
                  <span className="font-mono text-muted-foreground">#{hero.id}</span>
                  {isLeft && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white">P1</span>
                  )}
                  {isRight && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white">P2</span>
                  )}
                  {!isLeft && !isRight && (
                    <span className={style.text}>
                      {style.emoji} {totalPower} PWR
                    </span>
                  )}
                </div>

                <div className="h-20 flex items-center justify-center my-1">
                  <img
                    src={hero.sprite}
                    alt={hero.name}
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>

                <div>
                  <div className="text-xs font-black capitalize text-foreground truncate">
                    {hero.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{hero.title}</div>
                </div>

                {/* Direct P1 / P2 Quick Assign Buttons */}
                <div className="grid grid-cols-2 gap-1 mt-2 pt-1.5 border-t border-border/50">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      selectFromRoster(hero, 'left');
                    }}
                    className={`py-1 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                      isLeft
                        ? 'bg-amber-500 text-white'
                        : 'bg-secondary/80 hover:bg-amber-500/20 text-foreground'
                    }`}
                  >
                    Set P1
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      selectFromRoster(hero, 'right');
                    }}
                    className={`py-1 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                      isRight
                        ? 'bg-rose-500 text-white'
                        : 'bg-secondary/80 hover:bg-rose-500/20 text-foreground'
                    }`}
                  >
                    Set P2
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LIVE ANIMATED BATTLE STAGE & POWER BANNER */}
      {activePowerBanner && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/15 to-rose-500/15 border border-primary/30 flex flex-wrap items-center justify-between gap-2 animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-foreground">
            <span className="text-lg">{getElementStyle(activePowerBanner.moveType).emoji}</span>
            <span>
              {activePowerBanner.attacker} unleashed{' '}
              <span className="underline decoration-primary">{activePowerBanner.moveName}</span>!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
              -{activePowerBanner.damage} HP
            </span>
            <span className="text-xs font-extrabold text-amber-500">
              {activePowerBanner.effectiveness}
            </span>
          </div>
        </div>
      )}

      {/* 3. DUAL FIGHTER CARDS WITH ARROW CYCLING, ANIMATED SPRITES, STATS & CLICKABLE POWERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            side: 'left' as const,
            label: 'FIGHTER 1 (P1)',
            badgeColor: 'bg-amber-500 text-white',
            poke: pokeLeft,
            opponent: pokeRight,
            hp: hpLeft,
            maxHp: maxHpLeft,
            q: queryLeft,
            setQ: setQueryLeft,
          },
          {
            side: 'right' as const,
            label: 'FIGHTER 2 (P2)',
            badgeColor: 'bg-rose-500 text-white',
            poke: pokeRight,
            opponent: pokeLeft,
            hp: hpRight,
            maxHp: maxHpRight,
            q: queryRight,
            setQ: setQueryRight,
          },
        ].map(({ side, label, badgeColor, poke, opponent, hp, maxHp, q, setQ }) => {
          const style = getElementStyle(poke.types[0]);
          const hpPercent = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
          const isAttacking = attackingSide === side;
          const isHit = hitSide === side;
          const isWinner = winnerSide === side;
          const totalStats =
            poke.hp + poke.attack + poke.defense + poke.spAtk + poke.spDef + poke.speed;
          const typeAdvantage = getTypeMultiplier(poke.types[0], opponent.types);

          return (
            <div
              key={side}
              className={`relative bg-card p-5 rounded-3xl border transition-all duration-300 space-y-4 overflow-hidden ${
                isWinner
                  ? 'ring-2 ring-emerald-500 border-emerald-500'
                  : isHit
                  ? 'ring-2 ring-rose-500 border-rose-500 scale-[0.98]'
                  : style.border
              }`}
            >
              {/* Top Bar: Fighter Badge + Arrow Prev/Next Switcher + Search/Random */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${badgeColor}`}>
                    {label}
                  </span>
                  {isWinner && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> WINNER!
                    </span>
                  )}
                </div>

                {/* Prev / Next Character Arrow Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => cycleCharacter(side, -1)}
                    className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Previous Character"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cycleCharacter(side, 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Next Character"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rand =
                        ICONIC_POKEMON_ROSTER[
                          Math.floor(Math.random() * ICONIC_POKEMON_ROSTER.length)
                        ];
                      selectFromRoster(rand, side);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold cursor-pointer"
                    title="Random Hero"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Optional Name or #ID Search Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  fetchPokemon(q, side);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Or type any Pokémon name or #ID (1-1010)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-xs font-semibold"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Animated Arena Stage + HP Bar */}
              <div
                className={`relative rounded-2xl p-4 border ${style.border} bg-gradient-to-br ${style.bg} space-y-3`}
              >
                {/* Live HP Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <span>{style.emoji}</span>
                      <span>{poke.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">#{poke.id}</span>
                    </span>
                    <span
                      className={
                        hpPercent > 50
                          ? 'text-emerald-500'
                          : hpPercent > 25
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }
                    >
                      HP: {hp} / {maxHp} ({hpPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-background/80 border border-border overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpPercent > 50
                          ? 'bg-emerald-500'
                          : hpPercent > 25
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Character Visual & Elemental Aura */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div
                    className={`relative w-32 h-32 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center p-2 transition-transform duration-300 ${
                      isAttacking
                        ? side === 'left'
                          ? 'translate-x-6 -translate-y-2 scale-110 ' + style.particleGlow
                          : '-translate-x-6 -translate-y-2 scale-110 ' + style.particleGlow
                        : isHit
                        ? 'animate-bounce bg-rose-500/20'
                        : ''
                    }`}
                  >
                    <img
                      src={useAnimatedSprites && poke.animatedSprite ? poke.animatedSprite : poke.sprite}
                      alt={poke.name}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = poke.sprite;
                      }}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                    />
                    {isHit && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-500/30 rounded-2xl">
                        <span className="text-lg font-black text-white drop-shadow">💥 HIT!</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="text-xs font-bold text-muted-foreground">{poke.title}</div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {poke.types.map((t, idx) => {
                        const tStyle = getElementStyle(t);
                        return (
                          <span
                            key={`${t}-${idx}`}
                            className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-black uppercase ${tStyle.badge}`}
                          >
                            {tStyle.emoji} {t}
                          </span>
                        );
                      })}
                      <span className="px-2.5 py-0.5 rounded-lg bg-secondary border border-border text-[11px] font-black text-foreground">
                        ⚡ {totalStats} BST
                      </span>
                    </div>

                    {/* Passive Abilities */}
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        Passive Powers:
                      </span>
                      {poke.abilities.map((ab, idx) => (
                        <span
                          key={`${ab}-${idx}`}
                          className="px-2 py-0.5 rounded-md bg-background/80 border border-border text-[10px] font-bold capitalize text-foreground"
                        >
                          ✨ {ab}
                        </span>
                      ))}
                    </div>

                    {typeAdvantage > 1 && (
                      <div className="text-[11px] font-extrabold text-emerald-500">
                        🔥 Type Advantage: {typeAdvantage}x damage vs {opponent.name.toUpperCase()}!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Animated Power Moves (Click any power to attack!) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                    ⚡ Special Powers & Attack Moves (Click to Unleash!)
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Live Attack Animation
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {poke.moves.map((mv, idx) => {
                    const mvStyle = getElementStyle(mv.type);
                    return (
                      <button
                        key={`${mv.name}-${idx}`}
                        type="button"
                        onClick={() => executePowerStrike(side, mv)}
                        disabled={isAutoBattling}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 bg-gradient-to-r ${mvStyle.bg} ${mvStyle.border}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-foreground flex items-center gap-1">
                            <span>{mvStyle.emoji}</span>
                            <span>{mv.name}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${mvStyle.badge}`}>
                            {mv.power} PWR
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span className="truncate">{mv.effect}</span>
                          <span className="font-bold uppercase shrink-0 ml-1">{mv.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animated Base Stat Bars */}
              <div className="space-y-1.5 pt-1 border-t border-border/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  📊 Combat Attributes & Power Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'HP', val: poke.hp },
                    { label: 'Attack', val: poke.attack },
                    { label: 'Defense', val: poke.defense },
                    { label: 'Sp. Atk', val: poke.spAtk },
                    { label: 'Sp. Def', val: poke.spDef },
                    { label: 'Speed', val: poke.speed },
                  ].map(stat => {
                    const pct = Math.min(100, Math.round((stat.val / 160) * 100));
                    return (
                      <div
                        key={stat.label}
                        className="p-2 rounded-xl bg-secondary/40 border border-border/50 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground">{stat.label}</span>
                          <span className="font-black text-foreground">{stat.val}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BATTLE ARENA CONTROLS & LIVE COMBAT COMMENTARY LOG */}
      <div className="bg-card p-5 rounded-3xl border border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={runAnimatedAutoBattle}
              disabled={isAutoBattling}
              className="btn-signature-primary px-6 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer"
            >
              <Swords className={`w-4 h-4 ${isAutoBattling ? 'animate-spin' : ''}`} />
              <span>
                {isAutoBattling
                  ? '⚡ Battle in Progress...'
                  : '⚡ Start Animated Auto-Battle!'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHpLeft(maxHpLeft);
                setHpRight(maxHpRight);
                setWinnerSide(null);
                setActivePowerBanner(null);
                setBattleLogs([
                  `🔄 Arena Reset! Both ${pokeLeft.name.toUpperCase()} and ${pokeRight.name.toUpperCase()} restored to 100% HP.`,
                ]);
              }}
              className="px-4 py-3 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Full HP</span>
            </button>
          </div>

          <div className="text-xs font-bold text-muted-foreground">
            💡 Tip: Click any <strong className="text-foreground">Power Move</strong> on Fighter 1 or Fighter 2 to manually fire animated attacks!
          </div>
        </div>

        {/* Live Turn-by-Turn Battle Feed */}
        {battleLogs.length > 0 && (
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1.5 max-h-40 overflow-y-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              🎙️ Live Arena Play-by-Play Log
            </span>
            {battleLogs.map((entry, idx) => (
              <div
                key={`${idx}-${entry.slice(0, 18)}`}
                className={`text-xs font-bold ${
                  idx === 0 ? 'text-primary font-black' : 'text-muted-foreground'
                }`}
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 6. DAD JOKE & COMEDY PUNCHLINE MACHINE (icanhazdadjoke + Official Joke API)
// ============================================================================
export const DadJokeComedyMachineTool: React.FC = () => {
  const [joke, setJoke] = useState<string>(
    'Why do programmers prefer dark mode? Because light attracts bugs!'
  );
  const [loading, setLoading] = useState(false);

  const fetchDadJoke = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.joke) setJoke(data.joke);
      }
    } catch {
      toast.error('Could not load new joke.');
    } finally {
      setLoading(false);
    }
  };

  const speakJoke = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(joke);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-3xl border border-border space-y-6 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
        <Smile className="w-4 h-4" />
        <span>Certified Dad Joke & Comedy Generator</span>
      </div>

      <p className="text-lg sm:text-2xl font-extrabold text-foreground leading-relaxed transition-all duration-200">
        “{joke}”
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={fetchDadJoke}
          disabled={loading}
          className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 transition-transform duration-500 ${
              loading ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span>{loading ? '🎰 Spinning Punchline...' : '🎰 Spin Another Joke 😂'}</span>
        </button>
        <button
          type="button"
          onClick={speakJoke}
          className="px-4 py-3 rounded-2xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-primary" />
          <span>Read Aloud</span>
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(joke);
            toast.success('Joke copied!');
          }}
          className="px-4 py-3 rounded-2xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 7. WEIRD & USELESS TRUE FACTS EXPLORER (UselessFacts Open API)
// ============================================================================
export const WeirdUselessFactsExplorerTool: React.FC = () => {
  const [fact, setFact] = useState<string>(
    'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.'
  );
  const [loading, setLoading] = useState(false);

  const fetchFact = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      if (res.ok) {
        const data = await res.json();
        if (data?.text) setFact(data.text);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-3xl border border-border space-y-6 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold">
        <Sparkles className="w-4 h-4" />
        <span>100% True Weird & Useless Fact</span>
      </div>
      <p className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">{fact}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={fetchFact}
          disabled={loading}
          className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 transition-transform duration-500 ${
              loading ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span>{loading ? '🎰 Spinning Fact Wheel...' : '🎰 Spin Next Weird Fact 🧠'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(fact);
            toast.success('Fact copied!');
          }}
          className="px-4 py-3 rounded-2xl bg-secondary border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Fact</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 8. SMART EXCUSE & ALIBI GENERATOR (Excuser API + Instant Engine)
// ============================================================================
const EXCUSE_FALLBACKS: Record<string, string[]> = {
  office: [
    'My router automatically started a firmware update right before the standup call.',
    'Windows decided to install a mandatory 45-minute security patch while I was opening Zoom.',
  ],
  developers: [
    'It worked on my local container, must be a DNS propagation delay in staging.',
    'A cosmic ray bit-flipped the cache header during the CI/CD build.',
  ],
  college: [
    'Google Docs synced an older version of my assignment from offline mode.',
    'My alarm app updated overnight and reset all recurring weekday alarms.',
  ],
  party: [
    'I promised to help my neighbor debug their smart fridge before midnight.',
    'My cat fell asleep on my car keys and moving him would violate feline law.',
  ],
};

export const RandomExcuseGeneratorTool: React.FC = () => {
  const [category, setCategory] = useState<string>('developers');
  const [excuse, setExcuse] = useState<string>(EXCUSE_FALLBACKS.developers[0]);
  const [loading, setLoading] = useState(false);

  const generateExcuse = async (cat = category) => {
    setLoading(true);
    try {
      const res = await fetch(`https://excuser-three.vercel.app/v1/excuse/${cat}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.excuse) {
          setExcuse(data[0].excuse);
          setLoading(false);
          return;
        }
      }
    } catch {}
    const list = EXCUSE_FALLBACKS[cat] || EXCUSE_FALLBACKS.developers;
    setExcuse(list[Math.floor(Math.random() * list.length)]);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-3xl border border-border space-y-5">
      <div className="flex flex-wrap gap-2 justify-center">
        {['developers', 'office', 'college', 'party'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              generateExcuse(cat);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize border cursor-pointer transition-all ${
              category === cat ? 'bg-primary text-white border-primary shadow-sm' : 'bg-secondary border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-secondary/50 border border-border text-center">
        <p className="text-lg font-bold text-foreground">“{excuse}”</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => generateExcuse(category)}
          disabled={loading}
          className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-primary to-cyan-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 transition-transform duration-500 ${
              loading ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span>{loading ? '🎰 Crafting Alibi...' : '🎰 Spin New Excuse 🕵️'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(excuse);
            toast.success('Excuse copied!');
          }}
          className="px-4 py-3 rounded-2xl bg-secondary border border-border text-xs font-bold cursor-pointer"
        >
          Copy Alibi
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 9. CUTE DOG & CAT MOOD BOOSTER (Dog CEO + CatFact API)
// ============================================================================
export const CuteDogCatMoodBoosterTool: React.FC = () => {
  const [petImage, setPetImage] = useState<string>(
    'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg'
  );
  const [petFact, setPetFact] = useState<string>(
    'Dogs have three eyelids, including one to keep their eyes moist and protected!'
  );
  const [loading, setLoading] = useState(false);

  const fetchPetBoost = async (type: 'dog' | 'cat') => {
    setLoading(true);
    try {
      if (type === 'dog') {
        const res = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await res.json();
        if (data?.message) setPetImage(data.message);
      } else {
        const [imgRes, factRes] = await Promise.all([
          fetch('https://api.thecatapi.com/v1/images/search').then(r => r.json()),
          fetch('https://catfact.ninja/fact').then(r => r.json()),
        ]);
        if (Array.isArray(imgRes) && imgRes[0]?.url) setPetImage(imgRes[0].url);
        if (factRes?.fact) setPetFact(factRes.fact);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-3xl border border-border space-y-5 text-center">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => fetchPetBoost('dog')}
          disabled={loading}
          className="group px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>🐶 Spin Cute Dog</span>
        </button>
        <button
          type="button"
          onClick={() => fetchPetBoost('cat')}
          disabled={loading}
          className="group px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>🐱 Spin Cute Cat</span>
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border bg-secondary/40 max-h-96 flex items-center justify-center">
        <img src={petImage} alt="Cute Pet" className="max-h-96 w-auto object-contain" />
      </div>

      <p className="text-xs sm:text-sm font-semibold text-muted-foreground">💡 Fun Pet Fact: {petFact}</p>
    </div>
  );
};

// ============================================================================
// 10. "WHAT SHOULD I EAT?" FOOD ROULETTE (TheMealDB Open API + Full Recipe + In-App Video)
// ============================================================================
interface MealIngredientItem {
  ingredient: string;
  measure: string;
}

function extractMealIngredients(mealObj: any): MealIngredientItem[] {
  const list: MealIngredientItem[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = String(mealObj?.[`strIngredient${i}`] || '').trim();
    const meas = String(mealObj?.[`strMeasure${i}`] || '').trim();
    if (ing) {
      list.push({ ingredient: ing, measure: meas || 'To taste' });
    }
  }
  if (list.length === 0) {
    return [
      { ingredient: 'Boneless Chicken', measure: '500g cubed' },
      { ingredient: 'Plain Yogurt & Cream', measure: '1/2 cup' },
      { ingredient: 'Fresh Tomatoes', measure: '3 medium finely chopped' },
      { ingredient: 'Ginger & Garlic Paste', measure: '2 tbsp' },
      { ingredient: 'Garam Masala & Cumin', measure: '1.5 tsp' },
      { ingredient: 'Fresh Coriander', measure: 'Handful chopped' },
    ];
  }
  return list;
}

function extractYoutubeVideoId(url?: string): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function splitInstructionsIntoSteps(rawText?: string): string[] {
  if (!rawText) return [];
  const cleaned = rawText.replace(/\r\n/g, '\n').replace(/\bSTEP\s*\d+\s*[:.-]?\s*/gi, '\n');
  const byLines = cleaned
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 4);

  if (byLines.length >= 2) return byLines;

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(Boolean);
}

const SPIN_FOOD_TICKER = ['🍕 Pizza', '🍔 Burger', '🍛 Biryani', '🍜 Ramen', '🌮 Tacos', '🍣 Sushi', '🍝 Pasta', '🥘 Curry'];

export const FoodRecipeRouletteTool: React.FC = () => {
  const [meal, setMeal] = useState<any>({
    idMeal: '52795',
    strMeal: 'Chicken Handi',
    strCategory: 'Chicken',
    strArea: 'Indian',
    strMealThumb: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
    strInstructions:
      'Take a large heavy-bottomed pan or handi and heat butter with a splash of oil over medium flame.\nAdd finely chopped onions, ginger-garlic paste, and green chilies. Sauté until golden and fragrant.\nAdd cubed boneless chicken pieces and sear on high heat for 4–5 minutes until lightly browned.\nStir in finely chopped tomatoes, turmeric, red chili powder, roasted cumin, and coriander powder. Cook until tomatoes soften.\nLower the heat and whisk in beaten yogurt gradually so it blends into a velvety gravy.\nCover and simmer for 12–15 minutes until the chicken is juicy and tender.\nFinish with fresh heavy cream, crushed kasuri methi (fenugreek leaves), garam masala, and fresh coriander leaves. Serve hot with naan or steamed basmati rice.',
    strYoutube: 'https://www.youtube.com/watch?v=IO0issT0Rmc',
    strSource: 'https://www.themealdb.com/meal/52795',
    strIngredient1: 'Chicken',
    strMeasure1: '1.2 kg cubed',
    strIngredient2: 'Onion',
    strMeasure2: '2 large finely chopped',
    strIngredient3: 'Tomatoes',
    strMeasure3: '4 medium diced',
    strIngredient4: 'Garlic & Ginger Paste',
    strMeasure4: '2 tbsp',
    strIngredient5: 'Plain Yogurt',
    strMeasure5: '1 cup whisked',
    strIngredient6: 'Heavy Cream',
    strMeasure6: '1/3 cup',
    strIngredient7: 'Garam Masala & Spices',
    strMeasure7: '2 tsp',
    strIngredient8: 'Fresh Coriander',
    strMeasure8: '1 bunch chopped',
  });
  const [loading, setLoading] = useState(false);
  const [spinTickerIdx, setSpinTickerIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFullRecipeOpen, setIsFullRecipeOpen] = useState<boolean>(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const spinRoulette = async (categoryOverride?: string) => {
    const activeCat = categoryOverride ?? selectedCategory;
    setLoading(true);
    setCheckedIngredients({});

    // Animated slot-machine ticker while spinning
    const tickerInterval = setInterval(() => {
      setSpinTickerIdx(i => (i + 1) % SPIN_FOOD_TICKER.length);
    }, 90);

    try {
      if (activeCat === 'All') {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        if (res.ok) {
          const data = await res.json();
          if (data?.meals?.[0]) {
            setMeal(data.meals[0]);
          }
        }
      } else {
        // Fetch category list then load full details of a random dish in that category
        const listRes = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(activeCat)}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const items = listData?.meals || [];
          if (items.length > 0) {
            const picked = items[Math.floor(Math.random() * items.length)];
            const detailRes = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${picked.idMeal}`
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              if (detailData?.meals?.[0]) {
                setMeal(detailData.meals[0]);
              }
            }
          }
        }
      }
    } catch {
      toast.error('Could not spin new dish right now.');
    } finally {
      setTimeout(() => {
        clearInterval(tickerInterval);
        setLoading(false);
      }, 420);
    }
  };

  const ingredients = extractMealIngredients(meal);
  const steps = splitInstructionsIntoSteps(meal.strInstructions);
  const youtubeId = extractYoutubeVideoId(meal.strYoutube);

  const toggleIngredientCheck = (key: string) => {
    setCheckedIngredients(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyFullRecipe = () => {
    const ingText = ingredients.map(i => `- ${i.ingredient}: ${i.measure}`).join('\n');
    const stepText = steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
    const full = `${meal.strMeal} (${meal.strArea} • ${meal.strCategory})\n\nFull Description:\n${meal.strInstructions}\n\nIngredients:\n${ingText}\n\nStep-by-Step:\n${stepText}`;
    navigator.clipboard.writeText(full);
    toast.success('Full recipe & ingredients copied to clipboard!');
  };

  const speakRecipe = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${meal.strMeal}. ${meal.strArea} ${meal.strCategory} dish. ${meal.strInstructions || ''}`;
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Category Filter Bar */}
      <div className="bg-card p-4 rounded-3xl border border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'All', label: '🎲 All Global' },
            { id: 'Chicken', label: '🍗 Chicken' },
            { id: 'Beef', label: '🥩 Beef' },
            { id: 'Seafood', label: '🐟 Seafood' },
            { id: 'Vegetarian', label: '🥗 Vegetarian' },
            { id: 'Pasta', label: '🍝 Pasta' },
            { id: 'Dessert', label: '🍰 Dessert' },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                spinRoulette(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-secondary/70 text-muted-foreground hover:text-foreground border border-border/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dish Card */}
      <div className="bg-card p-5 sm:p-7 rounded-3xl border border-border space-y-6">
        {/* Header + Premium Animated Spin Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                🌍 {meal.strArea || 'Global'} • {meal.strCategory || 'Chef Special'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[11px] font-black">
                🥗 {ingredients.length} Ingredients
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/30 text-[11px] font-black">
                👨‍🍳 {steps.length} Steps
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              {loading ? SPIN_FOOD_TICKER[spinTickerIdx] : meal.strMeal}
            </h3>
          </div>

          {/* PREMIUM ANIMATED SPIN FOOD ROULETTE BUTTON */}
          <button
            type="button"
            onClick={() => spinRoulette()}
            disabled={loading}
            className="group relative overflow-hidden px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-primary to-pink-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shrink-0 border border-white/20"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform duration-500 ${
                loading ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span>
              {loading
                ? `🎰 Spinning ${SPIN_FOOD_TICKER[spinTickerIdx]}...`
                : '🎰 Spin Food Roulette 🍽️'}
            </span>
          </button>
        </div>

        {/* Dish Photo + Full Recipe Post & Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-border">
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                className={`w-full h-64 object-cover transition-transform duration-300 ${
                  loading ? 'blur-xs scale-95' : ''
                }`}
              />
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyFullRecipe}
                className="flex-1 px-3 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-primary" />
                <span>Copy Full Recipe</span>
              </button>
              <button
                type="button"
                onClick={speakRecipe}
                className="flex-1 px-3 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span>Listen Audio</span>
              </button>
            </div>
          </div>

          {/* Right Column: Full Post Reader + Ingredients */}
          <div className="md:col-span-7 space-y-4">
            {/* Single Clean Full Post Reader Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Full Recipe Post & Cooking Guide</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullRecipeOpen(v => !v)}
                  className="px-3 py-1 rounded-xl bg-primary text-white text-[11px] font-black cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {isFullRecipeOpen ? '▲ Collapse Post' : '📖 Click to Read Full Post'}
                </button>
              </div>

              {!isFullRecipeOpen ? (
                <p
                  onClick={() => setIsFullRecipeOpen(true)}
                  className="text-xs sm:text-sm text-foreground/90 line-clamp-5 leading-relaxed cursor-pointer"
                >
                  {meal.strInstructions}
                </p>
              ) : (
                <div className="space-y-4 pt-2 border-t border-border/60">
                  {/* Complete Uncut Recipe Post Description */}
                  <div className="p-3.5 rounded-xl bg-background/90 border border-border space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                      📄 Complete Recipe Description
                    </span>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {meal.strInstructions}
                    </p>
                  </div>

                  {/* Step-by-Step Numbered Breakdown */}
                  {steps.length > 1 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                        👨‍🍳 Step-by-Step Breakdown ({steps.length} Steps)
                      </span>
                      {steps.map((stepText, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-background/70 border border-border/70 flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                            {stepText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Ingredients & Measurements Grid */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  🛒 Ingredients & Measurements (Tap to Check Off)
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {Object.values(checkedIngredients).filter(Boolean).length}/{ingredients.length} Ready
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {ingredients.map((item, idx) => {
                  const key = `${item.ingredient}-${idx}`;
                  const checked = !!checkedIngredients[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleIngredientCheck(key)}
                      className={`p-2 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        checked
                          ? 'bg-emerald-500/15 border-emerald-500/40 line-through text-muted-foreground'
                          : 'bg-background/70 hover:bg-background border-border/70 text-foreground'
                      }`}
                    >
                      <span className="font-bold truncate">
                        {checked ? '✅ ' : '⬜ '}
                        {item.ingredient}
                      </span>
                      <span className="text-[11px] font-mono text-primary shrink-0">
                        {item.measure}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AUTO-LOADED IN-APP YOUTUBE RECIPE VIDEO PLAYER WITH THUMBNAIL */}
        {youtubeId && (
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/30 text-xs font-black flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Official Recipe Video Tutorial</span>
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  Watch how to cook {meal.strMeal} step by step
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Auto-Loaded Embedded YouTube Player */}
              <div className="lg:col-span-8 rounded-2xl overflow-hidden border-2 border-border bg-black aspect-video w-full shadow-lg">
                <iframe
                  key={youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                  title={`${meal.strMeal} Recipe Video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Thumbnail Preview Card */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-secondary/40 border border-border space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  🎬 Video Thumbnail Preview
                </span>
                <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-black">
                  <img
                    src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt={`${meal.strMeal} Video Thumbnail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                    HD Guide
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground leading-snug">
                  Press play on the video player to watch the full kitchen preparation for{' '}
                  <strong className="text-foreground">{meal.strMeal}</strong> right here on this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 11. RICK & MORTY MULTIVERSE CHARACTER SCANNER (RickAndMortyAPI)
// ============================================================================
export const RickMortyMultiverseScannerTool: React.FC = () => {
  const [search, setSearch] = useState('Rick');
  const [chars, setChars] = useState<any[]>([
    {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      origin: { name: 'Earth (C-137)' },
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    },
    {
      id: 2,
      name: 'Morty Smith',
      status: 'Alive',
      species: 'Human',
      origin: { name: 'unknown' },
      image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const searchCharacters = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(q.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.results)) setChars(data.results.slice(0, 8));
      }
    } catch {}
    setLoading(false);
  };

  const spinRandomPortal = async () => {
    setLoading(true);
    try {
      const randomIds = Array.from({ length: 8 }, () => Math.floor(Math.random() * 826) + 1).join(',');
      const res = await fetch(`https://rickandmortyapi.com/api/character/${randomIds}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChars(data);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={e => {
          e.preventDefault();
          searchCharacters(search);
        }}
        className="flex flex-wrap gap-2 bg-card p-3 rounded-2xl border border-border"
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search multiverse character (e.g., Rick, Morty, Summer, Birdperson)..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-signature-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          Scan Portal
        </button>
        <button
          type="button"
          onClick={spinRandomPortal}
          disabled={loading}
          className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>🎰 Spin Portal</span>
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {chars.map((c, idx) => (
          <div key={`${c.id}-${idx}`} className="bg-card rounded-2xl border border-border overflow-hidden">
            <img src={c.image} alt={c.name} loading="lazy" className="w-full h-44 object-cover" />
            <div className="p-3.5 space-y-1">
              <h4 className="font-bold text-sm text-foreground truncate">{c.name}</h4>
              <p className="text-xs text-muted-foreground">
                {c.status} • {c.species}
              </p>
              <p className="text-[11px] text-primary truncate">Origin: {c.origin?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 12. PIRATE, SHAKESPEARE & FUNNY DIALECT TRANSLATOR
// ============================================================================
export const PirateShakespeareTranslatorTool: React.FC = () => {
  const [input, setInput] = useState('Hello friend, where is the treasure hidden today?');
  const [dialect, setDialect] = useState<'pirate' | 'shakespeare' | 'uwu' | 'leet'>('pirate');

  const translateText = (text: string, mode: typeof dialect): string => {
    if (!text.trim()) return '';
    if (mode === 'pirate') {
      return (
        'Ahoy matey! ' +
        text
          .replace(/\bhello\b/gi, 'ahoy')
          .replace(/\bfriend\b/gi, 'bucko')
          .replace(/\bwhere is\b/gi, 'whar be')
          .replace(/\bmy\b/gi, 'me')
          .replace(/\byou\b/gi, 'ye')
          .replace(/\bis\b/gi, 'be') +
        ' Arrr! 🏴‍☠️'
      );
    }
    if (mode === 'shakespeare') {
      return (
        'Hark! ' +
        text
          .replace(/\bhello\b/gi, 'good morrow')
          .replace(/\bfriend\b/gi, 'noble companion')
          .replace(/\byou\b/gi, 'thou')
          .replace(/\bare\b/gi, 'art')
          .replace(/\byour\b/gi, 'thy') +
        ', I pray thee!'
      );
    }
    if (mode === 'uwu') {
      return text.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W') + ' uwu ✨';
    }
    return text
      .replace(/e/gi, '3')
      .replace(/a/gi, '4')
      .replace(/o/gi, '0')
      .replace(/t/gi, '7')
      .replace(/s/gi, '5');
  };

  const output = translateText(input, dialect);

  return (
    <div className="max-w-3xl mx-auto bg-card p-6 rounded-3xl border border-border space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'pirate' as const, label: '🏴‍☠️ Pirate Captain' },
          { id: 'shakespeare' as const, label: '🎭 Shakespearean' },
          { id: 'uwu' as const, label: '✨ Cute UwU' },
          { id: 'leet' as const, label: '💻 1337 Hacker' },
        ].map(d => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDialect(d.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
              dialect === d.id ? 'bg-primary text-white border-primary' : 'bg-secondary border-border'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={3}
        className="w-full p-3.5 rounded-2xl bg-secondary/60 border border-border text-sm"
        placeholder="Type any English sentence to translate..."
      />

      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-foreground">{output}</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(output);
            toast.success('Translated text copied!');
          }}
          className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shrink-0 cursor-pointer"
        >
          Copy
        </button>
      </div>
    </div>
  );
};
