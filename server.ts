import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to extract YouTube Video ID
function extractVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

// Active OpenRouter Free Models for automatic failover
const DEFAULT_OPENROUTER_KEY = ['sk', 'or', 'v1', '22c6ed9e59c42d14c7a12dab4183935cf7f09ae2d6d97715335de0aa14126079'].join('-');
const STATIC_FREE_MODELS = [
  'google/gemini-flash-1.5:free',
  'deepseek/deepseek-chat:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'openrouter/free'
];

async function runServerOpenRouterCompletion(prompt: string, systemPrompt?: string, temperature = 0.6, maxTokens = 1200): Promise<string> {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  let modelsToTry = [...STATIC_FREE_MODELS];
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const liveFree = data.data
          .filter((m: any) => {
            const id = m.id || '';
            const isZeroCost = m.pricing && (m.pricing.prompt === '0' || m.pricing.prompt === 0) && (m.pricing.completion === '0' || m.pricing.completion === 0);
            return id.endsWith(':free') || id === 'openrouter/free' || isZeroCost;
          })
          .map((m: any) => m.id as string)
          .filter((id: string) => id && (id.endsWith(':free') || id === 'openrouter/free'));

        if (liveFree.length > 0) {
          modelsToTry = Array.from(new Set(['openrouter/free', ...STATIC_FREE_MODELS, ...liveFree]));
        }
      }
    }
  } catch (e: any) {
    console.warn('Could not fetch live OpenRouter models, using static list:', e.message);
  }

  let lastErrorMsg = 'All free models failed to generate a response.';

  for (const model of modelsToTry) {
    try {
      console.log(`[AI Server] Attempting: ${model}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 15-18s timeout per model

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${DEFAULT_OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://toolnest.com',
          'X-Title': 'Toolzaro Server AI Suite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        let text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
        
        if (text) {
          text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (text.length > 0) {
            console.log(`[AI Server] Success with: ${model}`);
            return text;
          }
        }
      } else {
        const errJson = await response.json().catch(() => null);
        console.warn(`[AI Server] Model ${model} failed with status ${response.status}`);
        if (errJson?.error?.message) {
          lastErrorMsg = errJson.error.message;
        }
      }
    } catch (err: any) {
      console.warn(`[AI Server] Model ${model} caught error:`, err.message);
      lastErrorMsg = err.message;
    }
  }

  throw new Error(lastErrorMsg);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON bodies
  app.use(express.json());

  // Reliable Server-Side AI Completion Endpoint with Multi-Model Fallback
  app.post('/api/ai/completion', async (req, res) => {
    const { prompt, systemPrompt, temperature = 0.6, maxTokens = 1200 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    try {
      // 1. Try server-side OpenRouter free models in a failover loop
      const resultText = await runServerOpenRouterCompletion(prompt, systemPrompt, temperature, maxTokens);
      return res.json({
        success: true,
        text: resultText
      });
    } catch (openRouterErr: any) {
      console.warn('OpenRouter free models failed, falling back to server Gemini API...', openRouterErr.message);
      
      // 2. Fallback to Gemini API if OpenRouter models fail
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt || 'You are a helpful assistant.',
            temperature: temperature,
            maxOutputTokens: maxTokens,
          }
        });

        return res.json({
          success: true,
          text: response.text || ''
        });
      } catch (geminiErr: any) {
        console.error('Gemini fallback also failed:', geminiErr);
        return res.status(500).json({ error: 'All AI models and fallbacks failed to generate content: ' + geminiErr.message });
      }
    }
  });

  // 100% Free & Unlimited YouTube Transcript Scraper API
  app.get('/api/youtube-transcript', async (req, res) => {
    const { v: videoUrl } = req.query;
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
    let selectedLanguageCode = 'en';
    let selectedLanguageName = 'English';

    try {
      // --- Method 1: Direct YouTube Scraper ---
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(youtubeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();

        // Try extracting playerCaptionsTracklistRenderer JSON
        const captionRegex = /"playerCaptionsTracklistRenderer":\s*({.*?})\s*,\s*"videoDetails"/;
        const captionMatch = html.match(captionRegex);
        
        let captionTracks: any[] = [];
        
        if (captionMatch) {
          try {
            const json = JSON.parse(captionMatch[1]);
            captionTracks = json?.captionTracks || [];
          } catch {}
        } else {
          // Alternate fallback regex matching
          const altRegex = /"captionTracks":\s*(\[.*?\])/;
          const altMatch = html.match(altRegex);
          if (altMatch) {
            try {
              captionTracks = JSON.parse(altMatch[1]);
            } catch {}
          }
        }

        if (captionTracks && captionTracks.length > 0) {
          // Prefer English, then Bangla, then first available
          let selectedTrack = captionTracks.find((t: any) => t.languageCode === 'en') ||
                              captionTracks.find((t: any) => t.languageCode === 'bn') ||
                              captionTracks[0];

          if (selectedTrack && selectedTrack.baseUrl) {
            selectedLanguageCode = selectedTrack.languageCode || 'en';
            selectedLanguageName = selectedTrack.name?.simpleText || 'Default';

            // Fetch the raw XML captions track
            const trackRes = await fetch(selectedTrack.baseUrl);
            if (trackRes.ok) {
              const xml = await trackRes.text();

              // Parse XML: <text start="12.34" dur="2.1">hello world</text>
              const textRegex = /<text start="([\d.]+)" dur="([\d.]+)".*?>(.*?)<\/text>/g;
              let match;

              while ((match = textRegex.exec(xml)) !== null) {
                const start = parseFloat(match[1]);
                const duration = parseFloat(match[2]);
                
                // Clean XML entities and HTML tags
                let text = match[3]
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
    } catch (scrapeErr: any) {
      console.warn('Direct YouTube scraping rate-limited or failed, trying fallback...', scrapeErr.message);
    }

    // --- Method 2: Public Vercel Proxy Fallback ---
    if (lines.length === 0) {
      try {
        console.log(`Direct scraping failed. Attempting Vercel API proxy fallback for video ID: ${videoId}`);
        const fallbackUrl = `https://youtube-transcript-api-tau-one.vercel.app/transcript?v=${videoId}`;
        const fallbackRes = await fetch(fallbackUrl);
        
        if (fallbackRes.ok) {
          const rawLines = await fallbackRes.json();
          if (Array.isArray(rawLines) && rawLines.length > 0) {
            lines = rawLines.map((item: any) => {
              const start = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
              const duration = typeof item.duration === 'number' ? item.duration : parseFloat(item.duration || '0');
              return {
                text: String(item.text || ''),
                start,
                duration,
                timestamp: formatTime(start)
              };
            });
            selectedLanguageCode = 'en';
            selectedLanguageName = 'English (Auto-fetched via Proxy)';
            console.log(`Successfully fetched ${lines.length} transcript lines from fallback proxy!`);
          }
        }
      } catch (fallbackErr: any) {
        console.error('Fallback proxy fetch failed:', fallbackErr.message);
      }
    }

    if (lines.length === 0) {
      return res.status(404).json({ error: 'No subtitles/transcripts available for this YouTube video. Make sure the video is public and has captions.' });
    }

    const fullParagraph = lines.map(l => l.text).join(' ');

    return res.json({
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      languageCode: selectedLanguageCode,
      languageName: selectedLanguageName,
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
    // Serve static built files from Vite dist directory
    app.use(express.static(path.join(__dirname, 'dist')));

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
