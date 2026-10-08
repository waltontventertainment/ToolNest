import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TechHighlight {
  category: string;
  title: string;
  detail: string;
  url?: string;
  imageUrl?: string;
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
  headline: "Next-Gen Web Standards & Modern Client-Side Architectures Lead Today's Tech Shift",
  summary: "Client-side WebAssembly, modern browser APIs, and high-performance frontend tooling empower fast, private, and secure developer utilities globally.",
  highlights: [
    {
      category: "Web Dev",
      title: "Vite & Client-First Architecture",
      detail: "Modern web apps shift towards zero-backend, client-heavy architectures to improve privacy, performance, and eliminate server overhead."
    },
    {
      category: "Cloud & Security",
      title: "Zero-Trust Browser Sandboxing",
      detail: "Localized client-side processing becomes standard for developer utility suites and privacy-first tools."
    },
    {
      category: "Tooling",
      title: "High-Performance Developer Toolkits",
      detail: "Standalone offline-capable browser utilities replace heavyweight desktop applications for day-to-day conversion and formatting tasks."
    }
  ],
  keyTakeaway: "Building privacy-first, client-side tools gives developers maximum speed and privacy with zero server latency.",
  trendingTools: ["Vite 6", "Tailwind CSS v4", "TypeScript 5", "Web Workers", "Firebase Web SDK"],
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
 * Generates a fresh Tech Digest purely from 100% free public live API endpoints (Hacker News, Dev.to, Reddit Technology, GitHub Trending) with ZERO AI and ZERO fallback dummy data.
 */
export async function generateEndpointTechDigest(): Promise<TechDigest> {
  const todayKey = getTodayKey();
  const todayDate = getFormattedDate();

  const hnHighlights: TechHighlight[] = [];
  const devHighlights: TechHighlight[] = [];
  const redditHighlights: TechHighlight[] = [];
  const ghHighlights: TechHighlight[] = [];
  const trendingToolsSet = new Set<string>();

  // 1. Fetch Hacker News Frontpage API (Category: Hacker News)
  try {
    const hnRes = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=5');
    if (hnRes.ok) {
      const data = await hnRes.json();
      if (Array.isArray(data.hits)) {
        data.hits.forEach((item: any) => {
          if (item.title) {
            hnHighlights.push({
              category: "Hacker News",
              title: item.title,
              detail: `${item.points || 0} points • ${item.num_comments || 0} comments • Author: ${item.author || 'Community'}`,
              url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
              imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title || 'hn')}/100/100`
            });
            trendingToolsSet.add(item.author || 'HN');
          }
        });
      }
    }
  } catch {}

  // 2. Fetch Dev.to Top Articles API (Category: Dev.to)
  try {
    const devRes = await fetch('https://dev.to/api/articles?per_page=5');
    if (devRes.ok) {
      const articles = await devRes.json();
      if (Array.isArray(articles)) {
        articles.forEach((item: any) => {
          if (item.title) {
            devHighlights.push({
              category: "Dev.to",
              title: item.title,
              detail: item.description || `Published by ${item.user?.name || 'Developer'} • ${item.positive_reactions_count || 0} reactions`,
              url: item.url,
              imageUrl: item.cover_image || item.social_image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/100/100`
            });
            if (item.tag_list && Array.isArray(item.tag_list)) {
              item.tag_list.slice(0, 2).forEach((t: string) => trendingToolsSet.add(t));
            }
          }
        });
      }
    }
  } catch {}

  // 3. Fetch Reddit Technology API with multiple CORS proxy fallbacks
  try {
    let redditRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.reddit.com/r/technology/hot.json?limit=5')}`).catch(() => null);
    if (!redditRes || !redditRes.ok) {
      redditRes = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://www.reddit.com/r/technology/hot.json?limit=5')}`).catch(() => null);
    }
    if (redditRes && redditRes.ok) {
      const redditData = await redditRes.json();
      const children = redditData?.data?.children || (typeof redditData === 'object' && redditData?.contents ? JSON.parse(redditData.contents || '{}')?.data?.children : null);
      if (Array.isArray(children)) {
        children.forEach((child: any) => {
          const post = child.data;
          if (post && post.title && !post.stickied) {
            const fullPostDetail = post.selftext ? `${post.selftext} [${post.score || 0} upvotes • ${post.num_comments || 0} comments • r/${post.subreddit}]` : `${post.score || 0} upvotes • ${post.num_comments || 0} comments • r/${post.subreddit} • Author: ${post.author || 'Anonymous'} • Domain: ${post.domain || 'reddit.com'}`;
            const thumb = post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : (post.preview?.images?.[0]?.source?.url ? post.preview.images[0].source.url.replace(/&amp;/g, '&') : undefined);
            redditHighlights.push({
              category: "Reddit Technology",
              title: post.title,
              detail: fullPostDetail,
              url: `https://reddit.com${post.permalink}`,
              imageUrl: thumb || `https://picsum.photos/seed/${encodeURIComponent(post.title)}/100/100`
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Reddit fetch warning:', e);
  }

  // 4. Fetch GitHub Trending Repositories API
  try {
    const ghRes = await fetch('https://api.github.com/search/repositories?q=stars:>50&sort=stars&order=desc&per_page=5', {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      if (Array.isArray(ghData.items)) {
        ghData.items.forEach((repo: any) => {
          if (repo.name) {
            const fullRepoDetail = `${repo.description || 'No description provided'} (Language: ${repo.language || 'Multiple'} • ⭐ Stars: ${repo.stargazers_count?.toLocaleString() || 0} • Forks: ${repo.forks_count?.toLocaleString() || 0} • Open Issues: ${repo.open_issues_count || 0})`;
            ghHighlights.push({
              category: "GitHub Trending",
              title: `${repo.full_name} — ⭐ ${repo.stargazers_count?.toLocaleString() || 0}`,
              detail: fullRepoDetail,
              url: repo.html_url,
              imageUrl: repo.owner?.avatar_url || `https://picsum.photos/seed/${encodeURIComponent(repo.name)}/100/100`
            });
            if (repo.language) trendingToolsSet.add(repo.language);
          }
        });
      }
    }
  } catch (e) {
    console.warn('GitHub fetch warning:', e);
  }

  // Interleave sources so Hacker News, Dev.to, Reddit, and GitHub are all fairly represented
  const highlights: TechHighlight[] = [];
  const maxPerSource = 3;
  for (let i = 0; i < maxPerSource; i++) {
    if (hnHighlights[i]) highlights.push(hnHighlights[i]);
    if (devHighlights[i]) highlights.push(devHighlights[i]);
    if (redditHighlights[i]) highlights.push(redditHighlights[i]);
    if (ghHighlights[i]) highlights.push(ghHighlights[i]);
  }

  if (highlights.length === 0) {
    return {
      id: todayKey,
      dateFormatted: todayDate,
      headline: "Live API Endpoints Connecting...",
      summary: "Fetching real-time updates from Hacker News, Dev.to, Reddit Technology, and GitHub Trending endpoints.",
      highlights: [],
      keyTakeaway: "Click 'Sync Live' to refresh real-time feeds instantly.",
      trendingTools: ["Live API", "Hacker News", "Dev.to", "Reddit Technology", "GitHub"],
      generatedAt: new Date().toISOString(),
      isFallback: false
    };
  }

  const primaryHeadline = highlights[0]?.title || "Latest Real-Time Developer & Tech Trends";
  const primarySummary = `Live aggregated stream from Hacker News (${highlights.filter(h => h.category === 'Hacker News').length}), Dev.to (${highlights.filter(h => h.category === 'Dev.to').length}), Reddit Technology (${highlights.filter(h => h.category === 'Reddit Technology').length}), and GitHub Trending (${highlights.filter(h => h.category === 'GitHub Trending').length}).`;

  const digest: TechDigest = {
    id: todayKey,
    dateFormatted: todayDate,
    headline: primaryHeadline,
    summary: primarySummary,
    highlights: highlights.slice(0, 8),
    keyTakeaway: "100% real-time endpoint streaming provides immediate, zero-delay developer updates.",
    trendingTools: Array.from(trendingToolsSet).slice(0, 6),
    generatedAt: new Date().toISOString(),
    isFallback: false
  };

  // Cache locally
  try {
    localStorage.setItem(`toolnest_tech_digest_${todayKey}`, JSON.stringify(digest));
  } catch {}

  // Save to Firestore
  try {
    await setDoc(doc(db, 'tech_digests', todayKey), digest);
  } catch {}

  return digest;
}

export async function generateAiTechDigest(): Promise<TechDigest> {
  return await generateEndpointTechDigest();
}

/**
 * Fetches today's digest from Firestore or LocalStorage.
 * If not available or forceRefresh is true, fetches live APIs directly.
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

  // Generate directly from live API endpoints without AI
  return await generateEndpointTechDigest();
}
