import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { runAutoAiCompletion } from '../lib/aiService';

export interface TechHighlight {
  category: string;
  title: string;
  detail: string;
  url?: string;
}

export interface TechDigest {
  id: string; // e.g. "2026-10-07"
  dateFormatted: string; // e.g. "October 7, 2026"
  headline: string;
  summary: string;
  highlights: TechHighlight[];
  keyTakeaway: string;
  trendingTools: string[];
  generatedAt: string;
  isFallback?: boolean;
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string into readable English
 */
export function getFormattedDate(): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('en-US', options);
}

/**
 * Default instant zero-delay fallback digest
 */
const FALLBACK_DIGEST: TechDigest = {
  id: getTodayKey(),
  dateFormatted: getFormattedDate(),
  headline: "AI Model Efficiency Breakthroughs & Next-Gen Web Standards Lead Today's Tech Shift",
  summary: "Open-weights AI models continue to close the gap with proprietary systems while client-side WebAssembly and modern browser tools empower fast, private web utilities globally.",
  highlights: [
    {
      category: "AI & ML",
      title: "Open-Weights Efficiency Leap",
      detail: "Lightweight 7B & 14B models are outperforming last-year 70B benchmarks directly in browser & edge hardware."
    },
    {
      category: "Web Dev",
      title: "Vite & Client-First Architecture",
      detail: "Modern web apps shift towards zero-backend, client-heavy architectures to improve privacy and eliminate server bills."
    },
    {
      category: "Cloud & Security",
      title: "Zero-Trust Browser Sandboxing",
      detail: "Localized data processing and client-side processing become standard for developer utility suites."
    }
  ],
  keyTakeaway: "Building privacy-first, client-side tools with AI automation gives creators maximum speed with zero server overhead.",
  trendingTools: ["DeepSeek-R1", "Vite 6", "Tailwind CSS v4", "OpenRouter Free", "Firebase Web SDK"],
  generatedAt: new Date().toISOString(),
  isFallback: true
};

/**
 * Returns instant synchronous cached digest from LocalStorage or Fallback (0ms delay)
 */
export function getInstantTechDigest(): TechDigest {
  const todayKey = getTodayKey();
  try {
    const saved = localStorage.getItem(`toolnest_tech_digest_${todayKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.headline && parsed.summary) {
        return parsed;
      }
    }
  } catch {}
  return { ...FALLBACK_DIGEST, id: todayKey, dateFormatted: getFormattedDate() };
}

/**
 * Fetches real-time live tech news headlines from Hacker News & Dev.to public free APIs
 */
async function fetchRealLiveTechNews(): Promise<string[]> {
  const headlines: string[] = [];

  // 1. Fetch Hacker News Frontpage API (100% Free Public API)
  try {
    const hnRes = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=6');
    if (hnRes.ok) {
      const data = await hnRes.json();
      if (Array.isArray(data.hits)) {
        data.hits.forEach((item: any) => {
          if (item.title) headlines.push(`- ${item.title} (${item.points || 0} points, ${item.num_comments || 0} comments)`);
        });
      }
    }
  } catch {}

  // 2. Fetch Dev.to Top Articles API (100% Free Public API)
  try {
    const devRes = await fetch('https://dev.to/api/articles?top=1&per_page=5');
    if (devRes.ok) {
      const articles = await devRes.json();
      if (Array.isArray(articles)) {
        articles.forEach((item: any) => {
          if (item.title) headlines.push(`- ${item.title} (Tags: ${item.tag_list ? item.tag_list.join(', ') : 'Tech'})`);
        });
      }
    }
  } catch {}

  return headlines;
}

/**
 * Generates a fresh AI Tech Digest backed by REAL LIVE Hacker News & Dev.to news API data
 */
export async function generateAiTechDigest(): Promise<TechDigest> {
  const todayKey = getTodayKey();
  const todayDate = getFormattedDate();

  // Fetch real live news headlines from free public APIs
  const liveHeadlines = await fetchRealLiveTechNews();
  const liveNewsPromptText = liveHeadlines.length > 0 
    ? `Real Live Today Headlines:\n${liveHeadlines.join('\n')}` 
    : 'Focus on recent Web Development, AI Models, Cloud Computing, and Developer Tools.';

  const prompt = `Today is ${todayDate}. Based on these real live technology news stories and trending developer topics:

${liveNewsPromptText}

Summarize today's "Daily Tech Digest" into an executive developer briefing.

Return ONLY a valid JSON object strictly matching this format without markdown code fences or extra text:
{
  "headline": "A concise, engaging 1-sentence headline summarizing today's top story",
  "summary": "A 2-sentence executive summary of today's key technology shifts.",
  "highlights": [
    {
      "category": "AI & ML",
      "title": "Short title 1",
      "detail": "1-sentence summary"
    },
    {
      "category": "Web Dev",
      "title": "Short title 2",
      "detail": "1-sentence summary"
    },
    {
      "category": "Cloud & Tools",
      "title": "Short title 3",
      "detail": "1-sentence summary"
    }
  ],
  "keyTakeaway": "An inspiring, actionable 1-sentence key takeaway for creators & developers.",
  "trendingTools": ["Tool1", "Tool2", "Tool3", "Tool4", "Tool5"]
}`;

  try {
    const aiResult = await runAutoAiCompletion({
      prompt,
      systemPrompt: "You are an expert Tech Trends Analyst providing verified daily briefings to developers and creators. Output strict JSON only.",
      temperature: 0.5,
      maxTokens: 1000
    });

    if (aiResult.success && aiResult.text) {
      let rawJson = aiResult.text.trim();
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(rawJson);
      if (parsed.headline && parsed.summary && Array.isArray(parsed.highlights)) {
        const digest: TechDigest = {
          id: todayKey,
          dateFormatted: todayDate,
          headline: parsed.headline,
          summary: parsed.summary,
          highlights: parsed.highlights.slice(0, 3),
          keyTakeaway: parsed.keyTakeaway || "Keep building client-first, privacy-driven web applications.",
          trendingTools: Array.isArray(parsed.trendingTools) ? parsed.trendingTools.slice(0, 5) : ["Vite 6", "React 19", "AI SDK", "Tailwind v4"],
          generatedAt: new Date().toISOString()
        };

        // Cache locally for 0ms instant loading
        try {
          localStorage.setItem(`toolnest_tech_digest_${todayKey}`, JSON.stringify(digest));
        } catch {}

        // Save to Firebase Firestore for all visitors
        try {
          await setDoc(doc(db, 'tech_digests', todayKey), digest);
          
          // Auto-delete / prune historical digests older than 3 days to keep storage strictly under 100% free limits forever!
          try {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 3);
            const pastYear = pastDate.getFullYear();
            const pastMonth = String(pastDate.getMonth() + 1).padStart(2, '0');
            const pastDay = String(pastDate.getDate()).padStart(2, '0');
            const oldKey = `${pastYear}-${pastMonth}-${pastDay}`;
            
            await deleteDoc(doc(db, 'tech_digests', oldKey));
          } catch {}
        } catch {}

        return digest;
      }
    }
  } catch {}

  return { ...FALLBACK_DIGEST, id: todayKey, dateFormatted: todayDate };
}

/**
 * Fetches today's digest from Firestore or LocalStorage.
 * If not available or forceRefresh is true, fetches live APIs + AI model.
 */
export async function getOrFetchTodayTechDigest(forceRefresh = false): Promise<TechDigest> {
  const todayKey = getTodayKey();

  if (!forceRefresh) {
    // 1. Check local storage
    try {
      const saved = localStorage.getItem(`toolnest_tech_digest_${todayKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.headline && parsed.summary) return parsed;
      }
    } catch {}

    // 2. Check Firestore
    try {
      const docRef = doc(db, 'tech_digests', todayKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as TechDigest;
        if (data.headline && data.summary) {
          try {
            localStorage.setItem(`toolnest_tech_digest_${todayKey}`, JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch {}
  }

  // Generate via live APIs + AI
  return await generateAiTechDigest();
}
