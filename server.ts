import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON bodies
  app.use(express.json());

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
