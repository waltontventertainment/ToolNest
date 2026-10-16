import { ToolDefinition, ToolCategory } from './types';
import { categories, tools } from './registry';

/**
 * Generates an SEO-optimized, high-CTR Page Title (50–65 chars ideal) for any Tool.
 * Ensures brand consistency, action keywords ("Free Online"), and category context.
 */
export function buildToolSeoTitle(tool: ToolDefinition, siteName = 'Toolzaro'): string {
  const baseTitle = (tool.metaTitle || tool.name).trim();
  const lowerTitle = baseTitle.toLowerCase();

  // If the user/admin already wrote a full branded title via Tool Overrides
  if (lowerTitle.includes(siteName.toLowerCase())) {
    return baseTitle;
  }

  // Clean, high-ranking, 100% unique title for every tool
  return `${baseTitle} | ${siteName}`;
}

/**
 * Generates a compelling, keyword-rich Meta Description for any Tool.
 * Preserves each tool's unique description without appending repetitive programmatic boilerplate.
 */
export function buildToolSeoDescription(tool: ToolDefinition, siteName = 'Toolzaro'): string {
  const rawDesc = (tool.metaDescription || tool.intro || '').trim().replace(/\.+$/, '');
  if (!rawDesc) {
    return `Use ${tool.name} free online on ${siteName}. Fast, private client-side browser utility with zero server uploads and instant processing.`;
  }

  // If already at ideal descriptive length, return cleanly
  if (rawDesc.length >= 115) {
    return `${rawDesc}.`;
  }

  // Expand short descriptions to 120-158 characters for optimal Google Search snippet visibility
  const categoryBenefits: Record<string, string> = {
    'PDF': 'Process documents locally in your browser with zero server uploads.',
    'Color & Image': 'Fast in-browser processing with zero cloud uploads and full privacy.',
    'Developer': 'Free, private developer utility that executes 100% locally in your browser.',
    'Text': 'Fast, private text transformation utility that executes 100% locally in your browser.',
    'Converters': 'Instant client-side converter with real-time bidirectional calculations and zero cloud uploads.',
    'Calculators': 'Fast, accurate calculations with instant real-time browser preview and zero tracking.',
    'Generators': 'Generate values securely and locally with zero tracking or server logs.',
    'QR & Barcode': 'Download high-resolution codes instantly with complete privacy.',
    'SEO': 'Inspect and optimize web metrics in real-time with zero data collection.',
    'Universal Data Suite': 'Access open data and live intelligence with instant in-browser lookup.',
    'Wikipedia': 'Explore curated knowledge and summaries with fast in-browser reading.',
    'Fun & Viral': 'Enjoy creative, entertaining utilities with zero registration required.',
    'Utility': 'Reliable browser-based utility that works offline with zero data uploads.',
    'App': 'Desktop-grade browser application that executes 100% locally with zero cloud uploads.',
  };

  const benefit = categoryBenefits[tool.category] || '100% free, private browser utility with zero cloud uploads.';
  const enriched = `${rawDesc}. ${benefit}`;

  if (enriched.length <= 170) {
    return enriched;
  }
  return `${rawDesc}. 100% free & private in your browser.`;
}

/**
 * Generates comprehensive SEO keywords array for any Tool.
 */
export function buildToolSeoKeywords(tool: ToolDefinition, siteName = 'Toolzaro'): string[] {
  const base = [
    tool.name,
    tool.metaTitle,
    `${tool.name.toLowerCase()} online`,
    `free ${tool.name.toLowerCase()}`,
    `${tool.category.toLowerCase()} tools`,
    ...(tool.keywords || []),
    siteName,
    'free online tools',
    'client-side browser utility',
  ];
  return Array.from(new Set(base.filter(Boolean)));
}

/**
 * Category-specific rich SEO metadata & editorial descriptions for Category Pages
 */
export const CATEGORY_SEO_DATA: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    editorialSummary: string;
  }
> = {
  'PDF': {
    title: 'Free Online PDF Tools – Merge, Split, Convert & Watermark PDF | Toolzaro',
    description:
      'Merge, split, rotate, watermark, extract text, and convert PDFs to images 100% locally in your browser. Zero cloud uploads, free & private on Toolzaro.',
    keywords: ['pdf tools', 'merge pdf online', 'split pdf', 'pdf to image', 'pdf to text', 'rotate pdf', 'free pdf utilities', 'client-side pdf'],
    editorialSummary:
      'Toolzaro’s PDF Suite processes sensitive contracts, invoices, and academic documents directly inside your device memory using WebAssembly (pdf-lib and PDF.js). Unlike cloud PDF websites, your files are never uploaded to any external server.',
  },
  'Text': {
    title: 'Free Online Text Tools – Word Counter, Case Converter & Diff | Toolzaro',
    description:
      'Format, clean, compare, and analyze text instantly. Includes Word Counter, Case Converter, Text Diff, Remove Duplicates, Regex & Line Sorter on Toolzaro.',
    keywords: ['text tools', 'word counter', 'case converter', 'remove duplicate lines', 'text diff checker', 'sort lines online', 'string utilities'],
    editorialSummary:
      'Built for writers, editors, data analysts, and software engineers, our Text Manipulation Suite transforms multi-megabyte strings in milliseconds with full UTF-8/Unicode support.',
  },
  'Developer': {
    title: 'Free Online Developer Tools – JSON Formatter, JWT, Regex & Minifiers | Toolzaro',
    description:
      'Essential web developer utilities: JSON Formatter, JWT Decoder, Regex Tester, HTML/CSS/JS/SQL Minifiers, Cron & Chmod Calculators — 100% browser-based.',
    keywords: ['developer tools', 'json formatter', 'jwt decoder', 'regex tester', 'code minifier', 'url encoder', 'chmod calculator', 'uuid generator'],
    editorialSummary:
      'Debug, format, encode, and validate production payloads without exposing staging credentials or proprietary code to third-party servers.',
  },
  'Converters': {
    title: 'Free Online Unit & Data Converters – Base64, Binary, CSV, JSON & Units | Toolzaro',
    description:
      'Convert units, number bases, encodings, and data formats instantly: Base64, Binary, Hex, CSV to JSON, Markdown to HTML, PX to REM, and scientific units.',
    keywords: ['online converters', 'base64 converter', 'csv to json', 'markdown to html', 'unit converter', 'binary to text', 'px to rem'],
    editorialSummary:
      'High-precision bidirectional converters engineered with IEEE 754 floating-point accuracy and RFC-compliant data parsers.',
  },
  'Generators': {
    title: 'Free Online Generators – Password, UUID, Hash, Cron & CSS Gradient | Toolzaro',
    description:
      'Generate cryptographically secure passwords, UUIDs, SHA/MD5/Bcrypt hashes, Cron schedules, CSS gradients, and mock test data locally in your browser.',
    keywords: ['password generator', 'uuid generator', 'hash generator', 'cron expression generator', 'css gradient generator', 'mock data generator'],
    editorialSummary:
      'Powered by your operating system’s native Web Cryptography entropy pool (window.crypto.getRandomValues) for true cryptographic randomness.',
  },
  'QR & Barcode': {
    title: 'Free QR Code & Barcode Generator + Camera Scanner Online | Toolzaro',
    description:
      'Create custom high-resolution QR codes and industrial barcodes (Code128, EAN, UPC) or scan QR & barcodes directly from your webcam or image files.',
    keywords: ['qr code generator', 'barcode generator', 'qr code scanner', 'barcode scanner online', 'free static qr code', 'svg qr generator'],
    editorialSummary:
      'Generate permanent, non-expiring static QR codes and ISO-compliant barcodes with instant PNG/SVG downloads and built-in camera decoding.',
  },
  'Color & Image': {
    title: 'Free Online Image & Color Tools – Compressor, Resizer, Cropper & Palette | Toolzaro',
    description:
      'Compress, resize, crop, watermark, blur, and convert images (WebP, PNG, JPG, SVG) or extract color palettes and test WCAG contrast locally in your browser.',
    keywords: ['image compressor', 'image resizer', 'image cropper', 'color palette generator', 'wcag contrast checker', 'svg to png', 'image watermark'],
    editorialSummary:
      'Hardware-accelerated HTML5 Canvas image studio and CSS Color Level 4 design toolkit with zero quality loss and complete local privacy.',
  },
  'Calculators': {
    title: 'Free Online Calculators – Scientific, EMI Loan, Discount, Tax & BMI | Toolzaro',
    description:
      'Accurate online calculators for finance, math, and daily life: Scientific Calculator, Financial EMI & Loan Calculator, Discount/Tax, Aspect Ratio & BMI.',
    keywords: ['scientific calculator online', 'emi calculator', 'discount calculator', 'bmi calorie calculator', 'aspect ratio calculator', 'unit price'],
    editorialSummary:
      'Precision mathematical and financial calculators featuring full amortization breakdowns, trigonometric expressions, and instant visual metrics.',
  },
  'SEO': {
    title: 'Free Online SEO Tools – Meta Tag, Sitemap XML, Schema & SERP Optimizer | Toolzaro',
    description:
      'Boost search rankings with free technical SEO tools: Meta Tag Generator, Sitemap XML & Robots.txt Builder, Schema.org JSON-LD, OpenGraph & Keyword Density.',
    keywords: ['seo tools online', 'meta tag generator', 'sitemap xml generator', 'robots txt generator', 'schema markup generator', 'serp simulator'],
    editorialSummary:
      'Audit on-page content structure, simulate Google SERP snippets, validate OpenGraph social cards, and generate clean technical SEO configurations.',
  },
  'Utility': {
    title: 'Free Online Everyday Utilities – Stopwatch, World Clock, File Hash & Notes | Toolzaro',
    description:
      'Handy browser utilities: Stopwatch, Countdown Timer, World Clock, File Hash Checksum Calculator, Webcam/Screen Tester, Audio Tone & Quick Scratchpad.',
    keywords: ['online stopwatch', 'countdown timer', 'world clock', 'file hash calculator', 'keyboard tester', 'webcam tester', 'online notepad'],
    editorialSummary:
      'Fast, distraction-free productivity and hardware diagnostic utilities that work immediately on desktop and mobile browsers.',
  },
  'Wikipedia': {
    title: 'Wikipedia Research Tools – Article Summarizer, On This Day & Nearby | Toolzaro',
    description:
      'Explore Wikimedia knowledge faster: extract clean Markdown article summaries, discover historical events On This Day, and find geo-located Wikipedia entries.',
    keywords: ['wikipedia summarizer', 'wikipedia on this day', 'wikipedia nearby explorer', 'wikimedia research tools'],
    editorialSummary:
      'Connects directly to official Wikimedia REST APIs to deliver clean, ad-free research summaries, timelines, and geographic discovery.',
  },
  'Universal Data Suite': {
    title: 'Universal Data Suite – Live Weather, Countries, Dictionary & IP Lookup | Toolzaro',
    description:
      'Instant live lookups powered by open APIs: Global Country Directory, Live Weather Station, English Audio Dictionary, Book Search, IP Lookup & Avatars.',
    keywords: ['country directory', 'live weather online', 'english dictionary audio', 'ip address lookup', 'book search', 'avatar generator'],
    editorialSummary:
      'Real-time global reference tools combining open public datasets (Open-Meteo, REST Countries, Open Library, Dictionary API) with zero sign-ups.',
  },
  'Fun & Viral': {
    title: 'Fun & Viral Tools – Meme Generator, Trivia Quiz, Pokémon & Name Predictor | Toolzaro',
    description:
      'Explore 12 free interactive Fun & Viral web tools powered by open APIs: Meme Generator Studio, Name Age & Country Predictor, Live Trivia Quiz, Pokémon Battle, Dad Jokes, and Food Roulette.',
    keywords: ['fun online tools', 'viral meme generator', 'name age predictor', 'online trivia quiz', 'pokemon battle simulator', 'dad joke generator', 'yes no oracle gif', 'random excuse generator'],
    editorialSummary:
      'Powered by free, open-source public APIs (Memegen, Agify, Nationalize, Open Trivia DB, PokéAPI, YesNo.wtf, TheMealDB, and RickAndMortyAPI) for instant entertainment and viral social sharing.',
  },
  'App': {
    title: 'Free Web Apps – PDF Editor, Markdown Studio & Code Playground | Toolzaro',
    description:
      'Explore powerful, standalone web applications running 100% locally in your browser. Edit PDFs, write documentation in Markdown Studio, and prototype in Live Code Playground with zero uploads.',
    keywords: ['free web apps', 'pdf editor online', 'markdown studio', 'code playground', 'browser apps', 'open source web apps', 'offline web tools', 'private client side apps'],
    editorialSummary:
      'Standalone, desktop-grade web applications running completely inside your browser, delivering private in-browser document editing, markdown writing, and code prototyping.',
  },
};

export function getHomeSeoData(baseUrl = 'https://toolzaro.cyou', toolCount = tools.length) {
  const title = `Toolzaro – ${toolCount}+ Free Online Developer, PDF, Image & Utility Tools`;
  const description = `Access ${toolCount}+ free, fast, and 100% private browser tools on Toolzaro. Merge PDFs, compress & resize images, format JSON, generate QR codes, and convert files with zero uploads.`;
  const keywords = [
    'Toolzaro',
    'free online tools',
    'developer tools',
    'online pdf tools',
    'image compressor',
    'image resizer',
    'json formatter',
    'qr code generator',
    'password generator',
    'word counter',
    'unit converter',
    'seo tools',
    'client-side web utilities',
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: 'Toolzaro',
      alternateName: 'Toolzaro Online Utility Suite',
      url: `${baseUrl}/`,
      description,
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Toolzaro',
      url: `${baseUrl}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/android-chrome-512x512.png`,
        contentUrl: `${baseUrl}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
      image: `${baseUrl}/og-banner.jpg`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@toolzaro.cyou',
        contactType: 'customer support',
        availableLanguage: ['English', 'Bengali'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Toolzaro Online Utility Categories',
      description: `Browse ${toolCount}+ browser-based utilities across ${categories.length} specialized categories.`,
      numberOfItems: categories.length,
      itemListElement: categories.map((cat, idx) => {
        const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        return {
          '@type': 'ListItem',
          position: idx + 1,
          name: `${cat} Tools`,
          url: `${baseUrl}/${catSlug}`,
        };
      }),
    },
  ];

  return { title, description, keywords, jsonLd };
}
