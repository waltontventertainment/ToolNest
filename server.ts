import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract YouTube Video ID
function extractVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON bodies
  app.use(express.json());

  // In-memory cache for Firebase anonymous auth token
  let cachedIoToken: string | null = null;
  let cachedIoTokenExpiry = 0;

  async function getIoAuthToken(): Promise<string | null> {
    const now = Date.now();
    if (cachedIoToken && cachedIoTokenExpiry > now + 60000) {
      return cachedIoToken;
    }

    try {
      const apiKey = "AIzaSyC02AJ8YNuHAUKTf8e8u8orfZwTrLmqBeo";
      const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
        signal: AbortSignal.timeout(6000)
      });

      if (authRes.ok) {
        const data = await authRes.json();
        if (data.idToken) {
          cachedIoToken = data.idToken;
          cachedIoTokenExpiry = now + (Number(data.expiresIn || 3600) * 1000);
          return cachedIoToken;
        }
      }
    } catch (err: any) {
      console.warn('Failed to retrieve IO auth token:', err.message);
    }
    return null;
  }

  // 100% Free & Unlimited YouTube Transcript Multi-Engine API
  app.get('/api/youtube-transcript', async (req, res) => {
    const { v: videoUrl, lang: requestedLang } = req.query;
    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({ error: 'Missing "v" query parameter representing YouTube URL or Video ID.' });
    }

    const videoId = extractVideoId(videoUrl);
    if (videoId.length !== 11) {
      return res.status(400).json({ error: 'Invalid YouTube URL or Video ID. Must be exactly 11 characters.' });
    }

    const formatTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return [
        h > 0 ? String(h).padStart(2, '0') : null,
        String(m).padStart(2, '0'),
        String(s).padStart(2, '0')
      ].filter(Boolean).join(':');
    };

    let lines: { text: string; start: number; duration: number; timestamp: string }[] = [];
    let selectedLanguageCode = (typeof requestedLang === 'string' && requestedLang) ? requestedLang : 'en';
    let selectedLanguageName = 'English';
    let videoTitle = '';
    let authorName = '';
    let availableLanguages: { label: string; languageCode: string }[] = [];

    // --- Provider 1: High-Speed Primary Provider (youtube-transcript.io engine) ---
    try {
      const idToken = await getIoAuthToken();
      if (idToken) {
        const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const ioRes = await fetch('https://www.youtube-transcript.io/api/transcripts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Authorization': 'Bearer ' + idToken,
            'X-Hash': hex
          },
          body: JSON.stringify({ ids: [videoId] }),
          signal: AbortSignal.timeout(8000)
        });

        if (ioRes.ok) {
          const rawData = await ioRes.json();
          const item = Array.isArray(rawData) ? rawData[0] : rawData;
          if (item && Array.isArray(item.tracks) && item.tracks.length > 0) {
            videoTitle = item.title || '';
            authorName = item.author || '';

            // Map available languages
            if (Array.isArray(item.languages) && item.languages.length > 0) {
              availableLanguages = item.languages.map((l: any) => ({
                label: l.label || l.languageCode,
                languageCode: l.languageCode
              }));
            } else {
              availableLanguages = item.tracks.map((t: any) => ({
                label: t.language || 'Default',
                languageCode: t.language?.toLowerCase().includes('english') ? 'en' : (t.language || 'en')
              }));
            }

            // Find best matching track
            let track = item.tracks[0];
            if (requestedLang && typeof requestedLang === 'string') {
              const reqLower = requestedLang.toLowerCase();
              const langEntry = (item.languages || []).find((l: any) => 
                (l.languageCode && l.languageCode.toLowerCase() === reqLower) ||
                (l.label && l.label.toLowerCase() === reqLower)
              );
              if (langEntry) {
                const byLabel = item.tracks.find((t: any) => t.language === langEntry.label);
                if (byLabel) track = byLabel;
              } else {
                const byCode = item.tracks.find((t: any) => 
                  (t.languageCode && t.languageCode.toLowerCase() === reqLower) ||
                  (t.language && t.language.toLowerCase().startsWith(reqLower))
                );
                if (byCode) track = byCode;
              }
            } else {
              // Default: prefer English, then first available
              const enEntry = (item.languages || []).find((l: any) => (l.languageCode === 'en' || (l.label || '').toLowerCase().includes('english')));
              if (enEntry) {
                const enTrack = item.tracks.find((t: any) => t.language === enEntry.label);
                if (enTrack) track = enTrack;
              }
            }

            if (track && Array.isArray(track.transcript) && track.transcript.length > 0) {
              selectedLanguageName = track.language || 'Default';
              const matchedLangObj = (item.languages || []).find((l: any) => l.label === track.language);
              selectedLanguageCode = matchedLangObj?.languageCode || (selectedLanguageName.toLowerCase().includes('english') ? 'en' : requestedLang || 'en');

              lines = track.transcript.map((cue: any) => {
                const start = typeof cue.start === 'number' ? cue.start : parseFloat(cue.start || '0');
                const duration = typeof cue.dur === 'number' ? cue.dur : parseFloat(cue.dur || cue.duration || '0');
                return {
                  text: String(cue.text || '')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .trim(),
                  start,
                  duration,
                  timestamp: formatTime(start)
                };
              }).filter((l: any) => Boolean(l.text));
            }
          }
        }
      }
    } catch (ioErr: any) {
      console.warn('Primary transcript provider failed, trying InnerTube fallback:', ioErr.message);
    }

    // --- Provider 2: InnerTube Android Mobile Client ---
    if (lines.length === 0) {
      try {
        const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'ANDROID',
                clientVersion: '20.10.38',
                hl: 'en',
                gl: 'US'
              }
            },
            videoId
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (innertubeRes.ok) {
          const ytData = await innertubeRes.json();
          videoTitle = videoTitle || ytData?.videoDetails?.title || '';
          authorName = authorName || ytData?.videoDetails?.author || '';

          const captionTracks = ytData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
          if (Array.isArray(captionTracks) && captionTracks.length > 0) {
            availableLanguages = captionTracks.map((t: any) => ({
              label: t.name?.runs?.[0]?.text || t.name?.simpleText || t.languageCode,
              languageCode: t.languageCode
            }));

            let chosenTrack = captionTracks[0];
            if (requestedLang && typeof requestedLang === 'string') {
              const matched = captionTracks.find((t: any) => t.languageCode === requestedLang);
              if (matched) chosenTrack = matched;
            } else {
              const en = captionTracks.find((t: any) => t.languageCode === 'en');
              if (en) chosenTrack = en;
            }

            if (chosenTrack && chosenTrack.baseUrl) {
              selectedLanguageCode = chosenTrack.languageCode || 'en';
              selectedLanguageName = chosenTrack.name?.runs?.[0]?.text || chosenTrack.name?.simpleText || 'Default';

              // Fetch timedtext XML via direct or proxy cascade
              const xmlUrls = [
                chosenTrack.baseUrl,
                `https://api.allorigins.win/raw?url=${encodeURIComponent(chosenTrack.baseUrl)}`
              ];

              for (const targetUrl of xmlUrls) {
                try {
                  const xRes = await fetch(targetUrl, { signal: AbortSignal.timeout(4000) });
                  if (xRes.ok) {
                    const xml = await xRes.text();
                    if (xml && (xml.includes('<p ') || xml.includes('<text '))) {
                      // Format 3: <p t="18640" d="3240">text</p>
                      const pRegex = /<p t="(\d+)"(?: d="(\d+)")?[^>]*>(.*?)<\/p>/g;
                      let m;
                      while ((m = pRegex.exec(xml)) !== null) {
                        const startMs = parseFloat(m[1]);
                        const durMs = m[2] ? parseFloat(m[2]) : 2000;
                        const startSec = startMs / 1000;
                        const durSec = durMs / 1000;
                        const text = m[3]
                          .replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .replace(/<[^>]*>/g, '')
                          .trim();

                        if (text) {
                          lines.push({
                            text,
                            start: startSec,
                            duration: durSec,
                            timestamp: formatTime(startSec)
                          });
                        }
                      }

                      // Format Standard: <text start="12.34" dur="2.1">text</text>
                      if (lines.length === 0) {
                        const textRegex = /<text start="([\d.]+)" dur="([\d.]+)".*?>(.*?)<\/text>/g;
                        while ((m = textRegex.exec(xml)) !== null) {
                          const start = parseFloat(m[1]);
                          const duration = parseFloat(m[2]);
                          const text = m[3]
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/<[^>]*>/g, '')
                            .trim();

                          if (text) {
                            lines.push({
                              text,
                              start,
                              duration,
                              timestamp: formatTime(start)
                            });
                          }
                        }
                      }

                      if (lines.length > 0) break;
                    }
                  }
                } catch {}
              }
            }
          }
        }
      } catch (innerErr: any) {
        console.warn('InnerTube extraction failed:', innerErr.message);
      }
    }

    // --- Provider 3: Web Page Scraping Fallback ---
    if (lines.length === 0) {
      try {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const response = await fetch(youtubeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const html = await response.text();
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          if (titleMatch && !videoTitle) {
            videoTitle = titleMatch[1].replace('- YouTube', '').trim();
          }

          const captionRegex = /"captionTracks":\s*(\[.*?\])/;
          const captionMatch = html.match(captionRegex);
          if (captionMatch) {
            const tracks = JSON.parse(captionMatch[1]);
            if (Array.isArray(tracks) && tracks[0]?.baseUrl) {
              const resXml = await fetch(tracks[0].baseUrl, { signal: AbortSignal.timeout(4000) });
              if (resXml.ok) {
                const xml = await resXml.text();
                const textRegex = /<text start="([\d.]+)" dur="([\d.]+)".*?>(.*?)<\/text>/g;
                let match;
                while ((match = textRegex.exec(xml)) !== null) {
                  const start = parseFloat(match[1]);
                  const duration = parseFloat(match[2]);
                  const text = match[3]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/<[^>]*>/g, '')
                    .trim();

                  if (text) {
                    lines.push({
                      text,
                      start,
                      duration,
                      timestamp: formatTime(start)
                    });
                  }
                }
              }
            }
          }
        }
      } catch (pageErr: any) {
        console.warn('Web page scraping fallback failed:', pageErr.message);
      }
    }

    if (lines.length === 0) {
      return res.status(404).json({
        error: 'No subtitles/transcripts available for this YouTube video. Ensure the video is public and has captions enabled, or use the manual transcript import option.'
      });
    }

    const fullParagraph = lines.map(l => l.text).join(' ');

    return res.json({
      videoId,
      videoTitle: videoTitle || `YouTube Video (${videoId})`,
      author: authorName,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      languageCode: selectedLanguageCode,
      languageName: selectedLanguageName,
      availableLanguages: availableLanguages.length > 0 ? availableLanguages : [{ label: selectedLanguageName, languageCode: selectedLanguageCode }],
      linesCount: lines.length,
      lines,
      fullParagraph
    });
  });

  // CORS-Safe Image / Screenshot Download Proxy
  app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url as string;
    const filename = (req.query.filename as string) || `Snapshot_${Date.now()}.png`;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing image url query parameter' });
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Remote image fetch failed: ${response.statusText}` });
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch (err: any) {
      console.error('Image proxy error:', err.message);
      return res.status(500).json({ error: 'Failed to proxy image download', details: err.message });
    }
  });

  // Blogger Feed Server-Side Proxy
  app.get('/api/blogger-feed', async (req, res) => {
    const rawUrl = (req.query.url as string) || 'https://toolzaro.blogspot.com';
    try {
      let cleanBase = rawUrl.trim();
      if (!cleanBase.startsWith('http://') && !cleanBase.startsWith('https://')) {
        cleanBase = 'https://' + cleanBase;
      }
      cleanBase = cleanBase.replace(/\/+$/, '');
      const feedUrl = `${cleanBase}/feeds/posts/default?alt=json&max-results=50`;

      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Blogger returned HTTP ${response.status}` });
      }

      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(data);
    } catch (err: any) {
      console.error('Blogger feed proxy error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve Blogger feed', details: err.message });
    }
  });

  // --- Cloudflare D1 Local Dev & Preview Blog Store ---
  let localD1Posts: any[] = [
    {
      id: 'guide-1',
      slug: 'definitive-guide-client-side-privacy-web-utilities',
      title: 'The Definitive Guide to Client-Side Web Privacy: How WebAssembly & Web Crypto Eliminate Cloud Leaks',
      excerpt: 'An architectural deep-dive into zero-knowledge browser utilities. Learn how Web Cryptography, Canvas APIs, and WebAssembly enable military-grade encryption, PDF manipulation, and image processing without transmitting a single byte to remote servers.',
      category: 'Security & Privacy',
      tags: ['Client-Side Privacy', 'Web Cryptography', 'WebAssembly', 'Zero Trust'],
      author: { name: 'Toolzaro', role: 'Admin', avatar: '' },
      readTimeMinutes: 12,
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=75&fm=webp',
      status: 'published',
      contentType: 'text',
      content: 'Zero-knowledge client-side processing represents the pinnacle of modern web security...',
      createdAt: new Date('2026-10-04').toISOString()
    },
    {
      id: 'guide-2',
      slug: 'technical-seo-blueprint-2026-schema-meta-opengraph',
      title: 'Technical SEO in 2026: The Complete Blueprint for Schema Markup, OpenGraph, and Rich Snippets',
      excerpt: 'A comprehensive, step-by-step masterclass on technical search optimization. Learn how to construct multi-type Schema.org JSON-LD trees, prevent canonical cannibalization, optimize social cards, and satisfy Google Search Essentials.',
      category: 'SEO & Growth',
      tags: ['SEO', 'Structured Data', 'Schema.org', 'OpenGraph'],
      author: { name: 'Toolzaro', role: 'Admin', avatar: '' },
      readTimeMinutes: 14,
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=75&fm=webp',
      status: 'published',
      contentType: 'text',
      content: 'Search engines in 2026 evaluate websites on semantic understanding and speed...',
      createdAt: new Date('2026-10-03').toISOString()
    }
  ];

  app.get('/api/blog/posts', (req, res) => {
    return res.json(localD1Posts.filter(p => p.status === 'published'));
  });

  app.get('/api/blog/posts/:slug', (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const post = localD1Posts.find(p => p.slug.toLowerCase() === slug || p.id === slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(post);
  });

  app.post('/api/blog/posts', (req, res) => {
    const payload = req.body;
    if (!payload.title || !payload.slug) {
      return res.status(400).json({ error: 'Missing title or slug' });
    }
    const slug = String(payload.slug).trim().toLowerCase();
    const existingIndex = localD1Posts.findIndex(p => p.slug.toLowerCase() === slug);
    const post = {
      ...payload,
      id: payload.id || `post-${Date.now()}`,
      slug,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      localD1Posts[existingIndex] = post;
    } else {
      localD1Posts.unshift(post);
    }
    return res.json({ success: true, slug, id: post.id });
  });

  app.delete('/api/blog/posts/:slug', (req, res) => {
    const slug = req.params.slug.toLowerCase();
    localD1Posts = localD1Posts.filter(p => p.slug.toLowerCase() !== slug && p.id !== slug);
    return res.json({ success: true, deletedSlug: slug });
  });

  app.all('/api/blog/init', (req, res) => {
    return res.json({ success: true, message: 'D1 schema initialized and seeded.' });
  });

  // Mount Vite development middlewares in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted successfully.');
  } else {
    // Serve static built files from Vite dist directory (including /.well-known/* discovery manifests)
    app.use(express.static(path.join(__dirname, 'dist'), { dotfiles: 'allow' }));

    // SPA client-side router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Toolzaro full-stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
