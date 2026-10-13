import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { tools, categories } from '../src/lib/registry';
import { BUILTIN_BLOG_POSTS } from '../src/lib/blogData';
import { generateAll3DFavicons } from './render-3d-favicons';

const BASE_URL = (process.env.SITE_URL || 'https://toolzaro.cyou').replace(/\/+$/, '');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const ASSETS_IMG_DIR = path.resolve(process.cwd(), 'src/assets/images');
const TODAY = new Date().toISOString().split('T')[0];
const NOW_RFC822 = new Date().toUTCString();
const MAX_URLS_PER_SITEMAP = 40000; // Google limit is 50,000; 40,000 ensures safe unlimited chunking

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

/**
 * Clean, strict Google Search Console compliant XML urlset
 * (Avoids external XSD schemaLocation attributes that can trigger parser/fetch warnings in GSC)
 */
function buildUrlsetXml(entries: SitemapEntry[]): string {
  const urlsXml = entries
    .map(
      u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || TODAY}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

function buildSitemapIndexXml(sitemapUrls: string[]): string {
  const itemsXml = sitemapUrls
    .map(
      loc => `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itemsXml}
</sitemapindex>
`;
}

/**
 * Writes an SEO file to public/ AND also mirrors it directly to dist/ if dist/ already exists.
 * This guarantees that both pre-build and post-build invocations keep public/ and dist/ 100% synced.
 */
function writeSeoFile(fileName: string, content: string) {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(PUBLIC_DIR, fileName), content, 'utf8');

  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, fileName), content, 'utf8');
  }
}

function ensureFaviconsInPublic() {
  const heroBannerSrc = path.join(ASSETS_IMG_DIR, 'premium_hero_banner_1791390453868.jpg');

  // Always ensure high-resolution 32-bit RGBA 3D Toolzaro Wrench Logo favicons exist & mirror to dist/
  const markerFile = path.join(PUBLIC_DIR, '.favicon-3d-v3');
  if (!fs.existsSync(markerFile)) {
    generateAll3DFavicons(PUBLIC_DIR, DIST_DIR);
    fs.writeFileSync(markerFile, '3d-v3', 'utf8');
  } else if (fs.existsSync(DIST_DIR)) {
    const requiredFiles = [
      'favicon.svg',
      'favicon.ico',
      'favicon.png',
      'favicon-16x16.png',
      'favicon-32x32.png',
      'favicon-48x48.png',
      'favicon-96x96.png',
      'apple-touch-icon.png',
      'android-chrome-192x192.png',
      'android-chrome-512x512.png',
      'android-chrome-maskable-512x512.png',
      'logo.png',
      'og-banner.jpg',
    ];
    for (const f of requiredFiles) {
      const src = path.join(PUBLIC_DIR, f);
      const dest = path.join(DIST_DIR, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  if (fs.existsSync(heroBannerSrc) && !fs.existsSync(path.join(PUBLIC_DIR, 'og-banner.jpg'))) {
    try {
      execSync(
        `convert "${heroBannerSrc}" -gravity center -crop 1200x630+0+0 +repage -strip -interlace Plane -quality 78 "${path.join(PUBLIC_DIR, 'og-banner.jpg')}"`,
        { stdio: 'pipe' }
      );
    } catch {
      fs.copyFileSync(heroBannerSrc, path.join(PUBLIC_DIR, 'og-banner.jpg'));
    }
  }
  console.log('[SEO & Favicons] All root domain 3D favicons & OG images verified in public/.');
}

function generateAllSitemapsAndSeoFiles() {
  ensureFaviconsInPublic();

  // 1. Core & Static Pages (Flat Root-Level)
  const pageEntries: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/tools`, changefreq: 'daily', priority: '0.95' },
    { loc: `${BASE_URL}/bookmarks`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/sitemap`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/terms`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/disclaimer`, changefreq: 'monthly', priority: '0.6' },
  ];

  // 2. Category Pages (Flat Root-Level: https://toolzaro.cyou/category-slug)
  const categoryEntries: SitemapEntry[] = categories.map(cat => {
    const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    return {
      loc: `${BASE_URL}/${catSlug}`,
      changefreq: 'weekly',
      priority: '0.85',
    };
  });

  // 3. Unlimited Tool Pages (Flat Root-Level: https://toolzaro.cyou/tool-slug)
  const uniqueToolSlugs = new Set<string>();
  const toolEntries: SitemapEntry[] = [];
  for (const tool of tools) {
    if (!tool.slug || uniqueToolSlugs.has(tool.slug)) continue;
    uniqueToolSlugs.add(tool.slug);
    toolEntries.push({
      loc: `${BASE_URL}/${tool.slug}`,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  // 4. Blog Post Pages (Flat Root-Level: https://toolzaro.cyou/post-slug)
  const blogEntries: SitemapEntry[] = BUILTIN_BLOG_POSTS.map(post => ({
    loc: `${BASE_URL}/${post.slug}`,
    lastmod: post.publishedAt || TODAY,
    changefreq: 'monthly',
    priority: '0.8',
  }));

  // Write dedicated sub-sitemaps (to public/ and dist/ if present)
  writeSeoFile('sitemap-pages.xml', buildUrlsetXml(pageEntries));
  writeSeoFile('sitemap-categories.xml', buildUrlsetXml(categoryEntries));
  writeSeoFile('sitemap-blog.xml', buildUrlsetXml(blogEntries));

  // Unlimited Tools Sitemap Chunking Support
  const childSitemapUrls: string[] = [
    `${BASE_URL}/sitemap-pages.xml`,
    `${BASE_URL}/sitemap-categories.xml`,
  ];

  if (toolEntries.length <= MAX_URLS_PER_SITEMAP) {
    writeSeoFile('sitemap-tools.xml', buildUrlsetXml(toolEntries));
    childSitemapUrls.push(`${BASE_URL}/sitemap-tools.xml`);
  } else {
    writeSeoFile('sitemap-tools.xml', buildUrlsetXml(toolEntries.slice(0, MAX_URLS_PER_SITEMAP)));
    childSitemapUrls.push(`${BASE_URL}/sitemap-tools.xml`);
    let chunkIndex = 1;
    for (let i = 0; i < toolEntries.length; i += MAX_URLS_PER_SITEMAP) {
      const chunk = toolEntries.slice(i, i + MAX_URLS_PER_SITEMAP);
      const fileName = `sitemap-tools-${chunkIndex}.xml`;
      writeSeoFile(fileName, buildUrlsetXml(chunk));
      childSitemapUrls.push(`${BASE_URL}/${fileName}`);
      chunkIndex++;
    }
  }

  childSitemapUrls.push(`${BASE_URL}/sitemap-blog.xml`);

  // Write Sitemap Index (sitemap-index.xml)
  writeSeoFile('sitemap-index.xml', buildSitemapIndexXml(childSitemapUrls));

  // Write Complete Master Sitemap (sitemap.xml) containing all entries
  const allEntries: SitemapEntry[] = [
    ...pageEntries,
    ...categoryEntries,
    ...toolEntries,
    ...blogEntries,
  ];
  writeSeoFile('sitemap.xml', buildUrlsetXml(allEntries));

  // 5. Generate RSS 2.0 Feed (rss.xml & feed.xml) for Google Search Console / Discover / Feed Readers
  const rssItemsXml = [
    ...BUILTIN_BLOG_POSTS.map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${BASE_URL}/${post.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${BASE_URL}/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.publishedAt || TODAY).toUTCString()}</pubDate>
    </item>`
    ),
    ...tools.map(
      tool => `    <item>
      <title>${escapeXml(`${tool.name} - ${tool.metaTitle} | Toolzaro`)}</title>
      <link>${escapeXml(`${BASE_URL}/${tool.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${BASE_URL}/${tool.slug}`)}</guid>
      <description>${escapeXml(tool.metaDescription || `${tool.name} online utility on Toolzaro.`)}</description>
      <category>${escapeXml(tool.category)}</category>
      <pubDate>${NOW_RFC822}</pubDate>
    </item>`
    ),
  ].join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Toolzaro - ${tools.length}+ Free Online Developer, PDF &amp; Utility Tools</title>
    <link>${BASE_URL}/</link>
    <description>Complete suite of ${tools.length}+ fast, privacy-first browser utilities for developers, designers, and creators. 100% client-side execution.</description>
    <language>en-us</language>
    <lastBuildDate>${NOW_RFC822}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItemsXml}
  </channel>
</rss>
`;
  writeSeoFile('rss.xml', rssXml);
  writeSeoFile('feed.xml', rssXml);

  // 6. Generate llms.txt for AI Search Engines & Agent Skills (urn:air:agent-skills)
  const llmsLines: string[] = [
    `---`,
    `name: toolzaro-llms-index`,
    `description: Toolzaro (${BASE_URL}) is a privacy-first online utility platform offering ${tools.length}+ browser-native developer, PDF, image, calculator, converter, and SEO tools.`,
    `version: 1.0.0`,
    `---`,
    ``,
    `# Toolzaro - Free Online Developer, PDF, Image & Utility Suite`,
    `> Toolzaro (${BASE_URL}) is a privacy-first online utility platform offering ${tools.length}+ browser-native tools across ${categories.length} categories. All tools run 100% client-side with zero cloud uploads and flat root-level URLs.`,
    ``,
    `## Core Pages`,
    `- [Home](${BASE_URL}/): Main hub with instant search across ${tools.length}+ utilities.`,
    `- [All Tools Directory](${BASE_URL}/tools): Complete A-Z categorized directory of all ${tools.length} tools.`,
    `- [Saved Bookmarks](${BASE_URL}/bookmarks): Personal workspace for saved browser tools.`,
    `- [HTML Sitemap](${BASE_URL}/sitemap): Full index of all tools, categories, and guides.`,
    `- [Engineering Blog](${BASE_URL}/blog): Technical tutorials, privacy architecture guides, and developer articles.`,
    `- [About Us](${BASE_URL}/about): Client-first engineering standards and privacy commitment.`,
    `- [Contact Support](${BASE_URL}/contact): Direct email and WhatsApp engineering desk.`,
    `- [Privacy Policy](${BASE_URL}/privacy-policy): Zero-knowledge local processing, GDPR, CCPA, and Google AdSense disclosures.`,
    `- [Terms of Service](${BASE_URL}/terms): Fair use terms and conditions.`,
    `- [Disclaimer](${BASE_URL}/disclaimer): Accuracy and verification disclosures.`,
    ``,
    `## Tool Categories (${categories.length})`,
    ...categories.map(cat => {
      const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
      const count = tools.filter(t => t.category === cat).length;
      return `- [${cat} Tools (${count})](${BASE_URL}/${catSlug})`;
    }),
    ``,
    `## Complete Directory of ${tools.length} Tools (Flat Root-Level URLs)`,
    ...tools.map(t => `- [${t.name}](${BASE_URL}/${t.slug}): ${t.metaDescription} (Category: ${t.category})`),
    ``,
    `## Technical Guides & Articles (${BUILTIN_BLOG_POSTS.length})`,
    ...BUILTIN_BLOG_POSTS.map(p => `- [${p.title}](${BASE_URL}/${p.slug}): ${p.excerpt}`),
    ``,
  ];
  const llmsContent = llmsLines.join('\n');
  writeSeoFile('llms.txt', llmsContent);
  writeSeoFile('SKILL.md', llmsContent);

  // 6a. Generate A2A-compliant agent-card.json for autonomous agent discovery
  const agentCardJson = JSON.stringify(
    {
      name: 'Toolzaro Web Utilities Suite',
      description: `Privacy-first online platform offering ${tools.length}+ browser-native tools for PDF processing, image compression, developer formatting, QR generation, calculators, and real-time data.`,
      url: `${BASE_URL}/`,
      version: '1.0.0',
      documentationUrl: `${BASE_URL}/llms.txt`,
      provider: {
        organization: 'Toolzaro',
        url: `${BASE_URL}/`,
      },
      capabilities: {
        streaming: false,
        pushNotifications: false,
        stateTransitionHistory: false,
      },
      defaultInputModes: ['text/plain', 'application/json'],
      defaultOutputModes: ['text/plain', 'application/json', 'text/markdown'],
      skills: [
        {
          id: 'pdf-and-document-tools',
          name: 'PDF & Document Processing Suite',
          description: 'Merge, split, compress, rotate, watermark, and convert PDF files locally in the browser with zero server uploads.',
          tags: ['pdf', 'document', 'merge', 'compress', 'convert'],
          examples: [
            'Merge multiple PDF files into one document',
            'Compress a PDF file without losing quality',
          ],
        },
        {
          id: 'image-and-color-tools',
          name: 'Image & Color Optimization Suite',
          description: 'Compress, resize, crop, convert images (PNG, JPG, WebP) and generate accessible color palettes.',
          tags: ['image', 'compress', 'resize', 'webp', 'color'],
          examples: [
            'Compress and resize an image for web performance',
            'Convert PNG images to WebP format',
          ],
        },
        {
          id: 'developer-and-seo-utilities',
          name: 'Developer, JSON, QR & SEO Utilities',
          description: 'Format and validate JSON, encode Base64, generate QR codes and barcodes, inspect meta tags, and run technical SEO checks.',
          tags: ['developer', 'json', 'qrcode', 'seo', 'utilities'],
          examples: [
            'Format and validate a JSON payload',
            'Generate a custom QR code or barcode',
          ],
        },
      ],
    },
    null,
    2
  );
  writeSeoFile('agent-card.json', agentCardJson);

  // 6b. Generate ARD v1.0 (Agentic Resource Discovery) ai-catalog.json & ard.json (100% RFC 8141 URN + Standard Media Types + representativeQueries)
  const aiCatalogJson = JSON.stringify(
    {
      specVersion: '1.0',
      host: {
        identifier: 'toolzaro.cyou',
        displayName: 'Toolzaro',
        documentationUrl: `${BASE_URL}/about`,
        logoUrl: `${BASE_URL}/android-chrome-512x512.png`,
      },
      entries: [
        {
          identifier: 'urn:air:toolzaro.cyou:skills:toolzaro-llms-index',
          displayName: 'Toolzaro AI & LLM Documentation Index',
          type: 'text/markdown; profile="urn:air:agent-skills"',
          url: `${BASE_URL}/llms.txt`,
          representativeQueries: [
            'Find free client-side PDF, image, developer, and SEO browser utilities on Toolzaro',
            'Merge, split, compress, or convert PDF documents and images locally in the browser',
            'Format JSON, generate QR codes, inspect metadata, and run web developer tools online',
            'Read technical guides on client-side privacy architecture and web utility workflows',
          ],
        },
        {
          identifier: 'urn:air:toolzaro.cyou:agents:toolzaro-agent-card',
          displayName: 'Toolzaro Web Utilities Agent Card',
          type: 'application/agent-card+json',
          url: `${BASE_URL}/.well-known/agent-card.json`,
          representativeQueries: [
            'Discover Toolzaro browser utility capabilities, endpoints, and supported agent skills',
            'Query available client-side PDF, image, text, calculator, and developer tools',
            'Access zero-upload privacy-first online utilities and real-time data tools',
          ],
        },
      ],
    },
    null,
    2
  );
  writeSeoFile('ai-catalog.json', aiCatalogJson);
  writeSeoFile('ard.json', aiCatalogJson);
  const wellKnownPublicDir = path.join(PUBLIC_DIR, '.well-known');
  if (!fs.existsSync(wellKnownPublicDir)) {
    fs.mkdirSync(wellKnownPublicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(wellKnownPublicDir, 'ai-catalog.json'), aiCatalogJson, 'utf8');
  fs.writeFileSync(path.join(wellKnownPublicDir, 'ard.json'), aiCatalogJson, 'utf8');
  fs.writeFileSync(path.join(wellKnownPublicDir, 'agent-card.json'), agentCardJson, 'utf8');
  if (fs.existsSync(DIST_DIR)) {
    const wellKnownDistDir = path.join(DIST_DIR, '.well-known');
    if (!fs.existsSync(wellKnownDistDir)) {
      fs.mkdirSync(wellKnownDistDir, { recursive: true });
    }
    fs.writeFileSync(path.join(wellKnownDistDir, 'ai-catalog.json'), aiCatalogJson, 'utf8');
    fs.writeFileSync(path.join(wellKnownDistDir, 'ard.json'), aiCatalogJson, 'utf8');
    fs.writeFileSync(path.join(wellKnownDistDir, 'agent-card.json'), agentCardJson, 'utf8');
  }

  // 7. Update robots.txt with AdSense Mediapartners-Google, Googlebot, Bingbot & all sitemaps
  const robotsTxt = `# Toolzaro Official Robots.txt (${BASE_URL})
# 100% Google AdSense, Googlebot, Bingbot & AI Search Friendly

User-agent: Mediapartners-Google
Allow: /

User-agent: Googlebot
Allow: /
Allow: /assets/
Disallow: /sabbir
Disallow: /sabbir.html

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Allow: /assets/
Disallow: /sabbir
Disallow: /sabbir.html

User-agent: *
Allow: /
Allow: /assets/
Disallow: /sabbir
Disallow: /sabbir.html

# Sitemaps for Google Search Console & Bing Webmaster Tools
Sitemap: ${BASE_URL}/sitemap-index.xml
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-tools.xml
Sitemap: ${BASE_URL}/sitemap-categories.xml
Sitemap: ${BASE_URL}/sitemap-pages.xml
Sitemap: ${BASE_URL}/sitemap-blog.xml
Sitemap: ${BASE_URL}/rss.xml
`;
  writeSeoFile('robots.txt', robotsTxt);

  console.log(
    `[SEO Generator] Successfully generated in public/${fs.existsSync(DIST_DIR) ? ' & dist/' : ''}:\n` +
      `  - sitemap-index.xml (${childSitemapUrls.length} child sitemaps)\n` +
      `  - sitemap.xml (${allEntries.length} total URLs)\n` +
      `  - sitemap-tools.xml (${toolEntries.length} flat root-level tool URLs)\n` +
      `  - sitemap-categories.xml (${categoryEntries.length} category URLs)\n` +
      `  - sitemap-pages.xml (${pageEntries.length} core/static page URLs)\n` +
      `  - sitemap-blog.xml (${blogEntries.length} blog post URLs)\n` +
      `  - rss.xml & feed.xml (${tools.length + BUILTIN_BLOG_POSTS.length} feed items)\n` +
      `  - llms.txt & robots.txt`
  );
}

generateAllSitemapsAndSeoFiles();
