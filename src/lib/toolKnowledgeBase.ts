import { ToolDefinition, ToolCategory } from './types';

export interface ToolKnowledge {
  technicalOverview: string;
  features: { title: string; description: string }[];
  useCases: { audience: string; title: string; scenario: string }[];
  bestPractices: { title: string; advice: string }[];
  extendedFaqs: { q: string; a: string }[];
}

// Category-based baseline knowledge with rich technical depth
const categoryKnowledgeDefaults: Record<ToolCategory, Omit<ToolKnowledge, 'features' | 'useCases'>> = {
  'Universal Data Suite': {
    technicalOverview: 
      'The Universal Data Suite connects directly to high-reliability, open public APIs and verified reference datasets without requiring user authentication or proprietary keys. Requests are executed with modern asynchronous fetch pipelines, client-side caching, and strict data sanitization. By processing responses directly in the browser runtime, data lookups occur with sub-100ms response times while preserving user anonymity.',
    bestPractices: [
      { title: 'Leverage Search Filters', advice: 'Use specific sub-string searches and country or parameter codes to instantly narrow down large response payloads.' },
      { title: 'Export Clean Data', advice: 'Always verify data schemas before downstream ingestion into analytical notebooks, spreadsheets, or database seed scripts.' },
      { title: 'Offline Awareness', advice: 'While historical cached queries remain accessible in memory, live API lookups require an active internet connection.' }
    ],
    extendedFaqs: [
      { q: 'Where does the data in this suite originate?', a: 'Data is pulled directly from verified, open public APIs and established open-source reference datasets (including REST Countries, Open-Meteo, and Open Library) with zero middleman modification.' },
      { q: 'Are my search queries or IP addresses logged?', a: 'No. Queries run directly between your browser and the public API endpoints. Toolzaro maintains no server-side query databases, trackers, or telemetry.' },
      { q: 'Can I use this data for commercial or research projects?', a: 'Yes. The underlying datasets are governed by open public licenses (such as CC-BY, Open Database License, and MIT). Always consult source citations for specific attribution guidelines.' }
    ]
  },
  'Wikipedia': {
    technicalOverview: 
      'Our Wikipedia integration leverages Wikimedia REST API v1 endpoints with client-side DOM sanitization and structured extraction. It bypasses heavy page overhead, trackers, and unneeded media to deliver clean summaries, revision timelines, and coordinates-based nearby discovery in pure Markdown and plain text.',
    bestPractices: [
      { title: 'Cross-Reference Citations', advice: 'Always verify claims by checking primary footnotes linked in the original Wikipedia articles for academic or journalistic use.' },
      { title: 'Export Structured Summaries', advice: 'Copy cleaned summaries directly into documentation or note-taking systems without manual HTML formatting cleanup.' },
      { title: 'Explore Multi-Language Editions', advice: 'Search topics using native language scripts for culturally nuanced historical and geographical context.' }
    ],
    extendedFaqs: [
      { q: 'How up-to-date is the Wikipedia data shown here?', a: 'Data is queried in real-time directly from Wikimedia servers, ensuring you receive the latest revisions and edits published by community contributors.' },
      { q: 'Is Wikimedia affiliation claimed?', a: 'No. Toolzaro uses the open, public Wikimedia REST APIs. Wikipedia is a registered trademark of the Wikimedia Foundation.' },
      { q: 'Can I save articles for offline reading?', a: 'Yes. You can copy the plain text, save as Markdown, or export directly to Google Drive for offline reference.' }
    ]
  },
  'PDF': {
    technicalOverview: 
      'Toolzaro’s PDF processing suite is powered entirely by client-side WebAssembly (pdf-lib and pdfjs-dist) running inside your browser’s sandboxed JavaScript Virtual Machine. Unlike conventional online PDF converters that transmit files to remote cloud servers, your sensitive contracts, financial statements, and IDs never leave your device’s local memory (RAM).',
    bestPractices: [
      { title: 'Keep Original Backups', advice: 'Always keep a copy of your original document before applying irreversible redactions, rotation, or compression.' },
      { title: 'Memory Management for Large Files', advice: 'For documents over 100 pages, ensure your browser tab has sufficient available memory for smooth WebAssembly rendering.' },
      { title: 'Check Password-Protected Files', advice: 'Unlock encrypted PDF files prior to merging, splitting, or extracting pages.' }
    ],
    extendedFaqs: [
      { q: 'Do my PDF files get uploaded to your server?', a: 'Never. Every operation—splitting, merging, watermarking, text extraction, and page rotation—executes 100% locally on your device via client-side WebAssembly.' },
      { q: 'Is there a limit on file size or page count?', a: 'Toolzaro enforces no artificial limits. Constraints are governed solely by your device hardware and browser memory capacity.' },
      { q: 'Does this comply with HIPAA, GDPR, and enterprise NDA policies?', a: 'Yes. Because zero bytes of data are transferred over the network to any third-party server, Toolzaro provides the highest standard of data sovereignty and privacy compliance.' }
    ]
  },
  'Text': {
    technicalOverview: 
      'Our text manipulation engine utilizes modern JavaScript ES2024 string algorithms, regular expression engines with Unicode property escapes, and high-performance buffer handling. Text processing happens in linear time O(N) without external network dependencies, ensuring instantaneous transformations even for multi-megabyte text documents.',
    bestPractices: [
      { title: 'Verify Regex Flags', advice: 'When using regular expression tools, always check whether global (g), case-insensitive (i), and multiline (m) flags are enabled.' },
      { title: 'Preserve Newlines When Needed', advice: 'Be mindful of stripping carriage returns (`\\r\\n` vs `\\n`) when preparing text for Unix-based servers or cross-platform codebases.' },
      { title: 'Use Non-Destructive Transforms', advice: 'Take advantage of our instant copy buttons to retain your original draft in your system clipboard or scratchpad.' }
    ],
    extendedFaqs: [
      { q: 'Can I process sensitive source code or proprietary text?', a: 'Yes. All text manipulation runs strictly client-side in your browser. No strings are ever stored, logged, or sent to a remote server.' },
      { q: 'Does the tool support non-Latin scripts (Arabic, Bengali, Cyrillic, Kanji)?', a: 'Yes. Our string processors are fully UTF-8 and UTF-16 compliant, correctly handling multi-byte Unicode glyphs, accents, and emojis.' },
      { q: 'Is there an undo option for accidental changes?', a: 'You can easily reset to the original input or use your browser’s standard Ctrl+Z (Cmd+Z) undo hotkey within the text input fields.' }
    ]
  },
  'Developer': {
    technicalOverview: 
      'Built specifically for software engineers, DevOps practitioners, and system architects, our Developer tools execute parsing, AST formatting, encoding, and regex testing using client-side JavaScript interpreters. JSON, XML, and SQL formatters validate syntax with strict error boundary reporting to eliminate silent data corruption.',
    bestPractices: [
      { title: 'Validate Formats Before Deployment', advice: 'Always format and validate JSON configurations before committing them into CI/CD pipelines to prevent build breaks.' },
      { title: 'Mask Secrets and API Keys', advice: 'Although Toolzaro operates client-side, make it a standard security practice to sanitize production passwords and API keys.' },
      { title: 'Understand Encoding Nuances', advice: 'Distinguish clearly between encoding (Base64, URL), hashing (SHA, MD5), and encryption (AES) depending on your application requirements.' }
    ],
    extendedFaqs: [
      { q: 'Are my code snippets or database queries visible to anyone else?', a: 'No. Everything stays strictly inside your browser sandbox. Your queries, JSON schemas, and code snippets are never transmitted over the internet.' },
      { q: 'Does the JSON formatter catch syntax errors?', a: 'Yes. It pinpoints the exact line number, column, and token where malformed commas, quotes, or brackets violate RFC 8259 specifications.' },
      { q: 'Can I format minified code without losing string escapes?', a: 'Yes. The formatter strictly preserves internal string escape sequences (`\\n`, `\\t`, Unicode escape sequences) while beautifying code indentation.' }
    ]
  },
  'Converters': {
    technicalOverview: 
      'Our unit and numerical conversion tools use high-precision floating-point arithmetic with roundoff error mitigation based on IEEE 754 standards. Whether converting SI scientific units, binary/hexadecimal representations, or Roman numerals, values are computed bidirectionally with instantaneous reactivity.',
    bestPractices: [
      { title: 'Consider Floating Point Limits', advice: 'For calculations requiring extreme precision (financial or scientific), verify significant decimal digits against formal standard tables.' },
      { title: 'Check Base Representation', advice: 'When converting bases, ensure your input only contains characters valid for that numeral system (e.g. only 0-7 for octal).' },
      { title: 'Leverage Bidirectional Sync', advice: 'Edit either the input or output field to immediately see corresponding inverse transformations.' }
    ],
    extendedFaqs: [
      { q: 'How accurate are the scientific and unit conversions?', a: 'Conversions use official NIST and BIPM conversion constants, accurate up to 12 decimal places for scientific and engineering calculations.' },
      { q: 'Can I convert negative numbers and fractions?', a: 'Yes. The converter handles negative values and fractional decimals wherever mathematically permissible.' },
      { q: 'Does the tool work offline?', a: 'Yes. Once the page is loaded, all conversion logic is cached in your browser and works completely without an internet connection.' }
    ]
  },
  'Generators': {
    technicalOverview: 
      'Our generator suite leverages cryptographically secure pseudorandom number generators (`window.crypto.getRandomValues`) and deterministic algorithm state machines. From UUIDv4 and secure passwords to cron expressions, color gradients, and mock datasets, generation is non-blocking and zero-latency.',
    bestPractices: [
      { title: 'Store Generated Passwords Securely', advice: 'Immediately transfer generated master passwords and API secrets into a certified password manager.' },
      { title: 'Review Cron Intervals', advice: 'Double-check timezone assumptions (UTC vs local server time) when applying generated cron expressions to production servers.' },
      { title: 'Customize Mock Data Schemas', advice: 'Tailor placeholder data to reflect your actual production data types and field names for realistic staging tests.' }
    ],
    extendedFaqs: [
      { q: 'Are generated passwords truly random?', a: 'Yes. They are generated using the browser’s native Cryptographically Secure Pseudorandom Number Generator (CSPRNG), making them resistant to prediction attacks.' },
      { q: 'Can anyone else see the UUIDs or keys I generate?', a: 'No. They are computed in your browser memory and never broadcast to any server or shared log.' },
      { q: 'Does the Cron Generator support all standard syntax variations?', a: 'Yes. It outputs standard 5-part POSIX/Unix cron syntax compatible with crontab, Linux systemd, and major cloud job schedulers.' }
    ]
  },
  'QR & Barcode': {
    technicalOverview: 
      'Our barcode and QR suite integrates industrial-standard barcode synthesis (JsBarcode) and matrix QR rendering (QRCode.js) with HTML5 Canvas and SVG export engines. Barcodes comply with ISO/IEC 18004 (QR Code) and GS1-128 specifications, ensuring universal scannability across hardware laser scanners and smartphone cameras.',
    bestPractices: [
      { title: 'Test Contrast and Inversion', advice: 'Ensure high contrast between dark modules and light background (minimum 4:1 contrast ratio) for reliable camera scanning.' },
      { title: 'Select Appropriate Error Correction', advice: 'Use Level M (15%) for standard digital displays and Level H (30%) if applying custom logos or printing on textured physical surfaces.' },
      { title: 'Export in Vector SVG for Print', advice: 'For physical packaging, signage, or merchandise, always export in SVG format to maintain crisp vector edges at any resolution.' }
    ],
    extendedFaqs: [
      { q: 'Do generated QR codes ever expire?', a: 'No. The generated QR codes are static, meaning the data (URL, text, WiFi credentials) is encoded directly into the pattern. They will work forever without external dependencies.' },
      { q: 'Can I scan barcodes using my phone or webcam?', a: 'Yes. Our integrated scanner tools utilize your device camera with real-time video stream processing to decode barcodes directly in the browser.' },
      { q: 'What is the maximum data capacity of a QR code?', a: 'A standard QR code can store up to 7,089 numeric characters or 4,296 alphanumeric characters, though shorter payloads result in simpler, more easily scannable patterns.' }
    ]
  },
  'Color & Image': {
    technicalOverview: 
      'Our color and image studio operates directly on raw pixel bitstreams via the HTML5 2D Canvas Context and WebGL hardware acceleration. Image resizing, bicubic interpolation, color space conversions (HEX, RGB, HSL, CMYK, OKLCH), and contrast audits run with zero server round-trips.',
    bestPractices: [
      { title: 'Check WCAG Contrast Standards', advice: 'Ensure foreground text achieves at least a 4.5:1 contrast ratio against background elements to satisfy WCAG AA accessibility requirements.' },
      { title: 'Select Modern Formats', advice: 'Convert legacy JPEG and PNG images to WebP for significant file size savings without visible fidelity loss.' },
      { title: 'Inspect Aspect Ratios', advice: 'Lock aspect ratio constraints during image cropping to prevent unintended distortion across responsive screen sizes.' }
    ],
    extendedFaqs: [
      { q: 'Will my uploaded photos be compressed or sent to the cloud?', a: 'No. Your photos remain 100% on your device. All pixel transformations and palette extractions execute locally in browser memory.' },
      { q: 'Does image conversion reduce photo quality?', a: 'You have full slider control over compression quality. Lossless formats (PNG, WebP lossless) preserve exact pixel fidelity.' },
      { q: 'Can I extract color palettes from photographs?', a: 'Yes. The Image Palette Extractor analyzes color clusters using spatial quantization algorithms to deliver dominant color swatches.' }
    ]
  },
  'Calculators': {
    technicalOverview: 
      'Toolzaro calculators provide robust mathematical evaluation using custom parsing tokenizers and Math.js libraries. They mitigate common JavaScript IEEE 754 floating-point inaccuracies (such as `0.1 + 0.2 = 0.30000000000000004`) to deliver reliable financial, engineering, and everyday quantitative results.',
    bestPractices: [
      { title: 'Review Input Units', advice: 'Confirm whether financial inputs represent monthly or annual interest rates to avoid skewed compounding calculations.' },
      { title: 'Check Operator Precedence', advice: 'Use explicit parentheses `(...)` in complex scientific equations to guarantee intended mathematical evaluation order.' },
      { title: 'Compare Amortization Breakdowns', advice: 'In loan and EMI calculations, examine the interest-vs-principal schedule to understand long-term cost impacts.' }
    ],
    extendedFaqs: [
      { q: 'How does the calculator handle floating point errors?', a: 'We employ decimal rounding normalizers and high-precision math libraries that eliminate standard JavaScript precision quirks.' },
      { q: 'Can I compute compound interest and loan schedules?', a: 'Yes. Our financial calculators compute full periodic amortization schedules with monthly interest and principal splits.' },
      { q: 'Are scientific formulas (trigonometry, logarithms, exponents) supported?', a: 'Yes. The advanced calculator fully supports trigonometric functions (in radians and degrees), powers, square roots, and natural logarithms.' }
    ]
  },
  'SEO': {
    technicalOverview: 
      'Our technical SEO suite analyzes HTML structures, generates standards-compliant XML sitemaps, formats `robots.txt` directives, and previews OpenGraph/Twitter social cards. It verifies compliance with Google Search Essentials, Schema.org vocabulary, and Bing Webmaster guidelines.',
    bestPractices: [
      { title: 'Keep Title Tags Under 60 Characters', advice: 'Search engines typically truncate titles longer than 60 characters or ~600px width on desktop search result pages.' },
      { title: 'Write Actionable Meta Descriptions', advice: 'Keep descriptions between 120 and 160 characters, including a clear value proposition and natural keyword placement.' },
      { title: 'Validate Schema Markup', advice: 'Always run generated JSON-LD through Google’s Rich Results Test tool to confirm syntax and eligibility for enhanced SERP features.' }
    ],
    extendedFaqs: [
      { q: 'What is the purpose of Schema.org markup?', a: 'Schema markup provides search engines with explicit structured context regarding your page content (e.g. FAQ, Product, HowTo, Article), increasing the likelihood of rich snippet features in search results.' },
      { q: 'Does generating a sitemap guarantee Google indexing?', a: 'A sitemap guides search engine crawlers to discover all your priority URLs, but actual indexing depends on content quality, originality, and website authority.' },
      { q: 'Why is OpenGraph metadata important?', a: 'OpenGraph tags control how your links appear when shared on social networks (Twitter, LinkedIn, Facebook, Slack), directly impacting social click-through rates.' }
    ]
  },
  'Utility': {
    technicalOverview: 
      'Our general utilities provide reliable, everyday productivity tools including timers, stopwatches, webcam/mic hardware testing, device screen inspection, and scratchpad note taking. Built with Web APIs (Fullscreen API, MediaDevices API, Web Audio API), they deliver native-like desktop performance within your browser.',
    bestPractices: [
      { title: 'Grant Camera/Mic Permissions Only When Testing', advice: 'Device tests only access hardware while the active tab is open; you can revoke permissions at any time via browser settings.' },
      { title: 'Keep Browser Tab Active for Timers', advice: 'While audio alarms will sound, browsers may throttle background tabs; keep the tab open for critical precision timing.' },
      { title: 'Export Scratchpad Notes', advice: 'Download or copy important notes from the scratchpad before clearing your browser cache or switching devices.' }
    ],
    extendedFaqs: [
      { q: 'Does the webcam tester record or stream my video anywhere?', a: 'Never. The webcam tester runs entirely through your browser’s local MediaStream API. No video, audio, or metadata ever leaves your computer.' },
      { q: 'Do timers continue working if my computer goes to sleep?', a: 'System sleep halts CPU cycles; ensure your operating system sleep settings accommodate extended alarm or countdown durations.' },
      { q: 'Is the Scratchpad saved across page refreshes?', a: 'Yes. Scratchpad text is automatically saved in your browser’s HTML5 `localStorage` so you can return to your notes at any time.' }
    ]
  },
  'Fun & Viral': {
    technicalOverview:
      'Toolzaro’s Fun & Viral Suite connects directly to curated, open-source public REST APIs (including Memegen.link, Agify, Nationalize, Open Trivia DB, PokéAPI, YesNo.wtf, TheMealDB, and RickAndMortyAPI) from your browser. Every interaction—whether generating watermark-free memes, running live trivia quizzes, or simulating Pokémon battles—happens with zero sign-ups or account tracking.',
    bestPractices: [
      { title: 'Download High-Resolution Memes', advice: 'Use the Download Meme PNG button to save full-resolution graphics directly to your device for sharing on Discord, Reddit, or X.' },
      { title: 'Combine First Names Only for Predictors', advice: 'When using the Name Age & Origin Predictor, enter a single given name without titles or middle initials for the highest statistical accuracy.' },
      { title: 'Use Read Aloud for Comedy & Trivia', advice: 'Enable voice playback on the Dad Joke Generator during team standups or study breaks for instant icebreakers.' }
    ],
    extendedFaqs: [
      { q: 'Are these Fun & Viral tools completely free to use?', a: 'Yes. Every tool in the Fun & Viral category is 100% free with unlimited usage and zero watermarks.' },
      { q: 'Where does the data come from?', a: 'Each tool queries verified open-source community APIs (such as PokéAPI v2, Open Trivia Database, and Memegen) directly over HTTPS.' },
      { q: 'Can I share generated memes and results on social media?', a: 'Absolutely. All generated memes, trivia scores, and vibe checks are designed for instant sharing across social platforms.' }
    ]
  },
  'App': {
    technicalOverview:
      'The App category delivers standalone, full-featured web applications directly inside your browser. Built entirely on client-side web standards (HTML5 Canvas, WebAssembly, and modern JavaScript APIs), every application operates 100% offline-ready in your device’s memory (RAM) with zero telemetry, zero server-side file uploads, and complete user sovereignty.',
    bestPractices: [
      { title: 'Local Device Backups', advice: 'Always keep local copies of original documents before making extensive redactions or modifications.' },
      { title: 'Use Full-Screen Focus Mode', advice: 'Toggle full-screen focus mode on desktop screens for an immersive, distraction-free document editing experience.' },
      { title: 'Hardware Acceleration', advice: 'Ensure browser hardware acceleration is enabled for smooth multi-page canvas rendering and instantaneous stroke response.' }
    ],
    extendedFaqs: [
      { q: 'Do these apps send my files or data to an external server?', a: 'Never. Every document, annotation, drawing, and digital signature is processed 100% locally on your computer or phone using client-side WebAssembly.' },
      { q: 'Can I use these apps offline?', a: 'Yes. Once loaded in your browser tab, the web applications execute completely within your local browser sandbox even without an active internet connection.' },
      { q: 'Are there any usage limits or paywalls?', a: 'No. All applications under the App suite are completely free, open-source inspired, and unlimited with zero subscriptions.' }
    ]
  }
};

// Bespoke in-depth knowledge for key high-traffic tools
const bespokeToolKnowledge: Record<string, Partial<ToolKnowledge>> = {
  'pdf-editor': {
    technicalOverview:
      'The PDF Editor Suite is a full-featured browser-native document workstation inspired by open-source desktop software. Utilizing PDF.js for canvas rendering and pdf-lib for binary document manipulation, users can visually inspect, annotate, draw, insert text, append digital signatures, apply verification stamps, and reorder pages in real time—all with zero cloud uploads or third-party servers.',
    features: [
      { title: 'Multi-Page Visual Canvas', description: 'Interactive canvas rendering each PDF page with zooming, page thumbnails, and seamless navigation.' },
      { title: 'Vector Markup & Freehand Pen', description: 'Annotate documents with smooth freehand pen strokes, translucent highlighters, geometric shapes, and arrows.' },
      { title: 'Typography & Text Insertion', description: 'Add customizable text boxes with font sizing, color palette selection, and precise positioning.' },
      { title: 'Digital Signatures & Stamps', description: 'Draw handwritten signatures on an interactive signature pad, type stylized script names, or apply official verification stamps.' },
      { title: 'Page Organization & Rotation', description: 'Rotate individual pages 90° clockwise/counter-clockwise, delete unwanted pages, and reorder document sequences.' },
      { title: '100% Private Client-Side Export', description: 'Generates a flattened, pristine PDF file directly in your browser memory for immediate local download.' }
    ],
    useCases: [
      { audience: 'Professionals & Remote Workers', title: 'Contract Signing & Form Completion', scenario: 'Fill out agreements, add signature fields, and return completed PDF contracts in seconds without printing or scanning.' },
      { audience: 'Students & Educators', title: 'Lecture & Assignment Annotation', scenario: 'Highlight reading materials, add margin notes, and annotate study guides directly on the PDF canvas.' },
      { audience: 'Legal & Accounting Teams', title: 'Document Stamping & Redaction', scenario: 'Mark sensitive paperwork with Confidential or Approved verification stamps and blackout private records.' }
    ],
    bestPractices: [
      { title: 'Preview Before Final Export', advice: 'Review all pages and annotations in the filmstrip view before clicking Download PDF.' },
      { title: 'Use High-Contrast Ink', advice: 'Select bold primary colors for annotations to ensure clarity when documents are printed or shared.' }
    ],
    extendedFaqs: [
      { q: 'Is my uploaded PDF stored anywhere online?', a: 'No. The PDF never leaves your device. It is parsed and rendered entirely inside your browser’s JavaScript engine.' },
      { q: 'Can I edit multiple pages in one session?', a: 'Yes. You can navigate between pages, add annotations on each, and export all pages in a single combined PDF.' },
      { q: 'What is the maximum file size supported?', a: 'Since processing occurs in client memory, files up to 100MB work smoothly on standard laptops and modern mobile phones.' }
    ]
  },
  'image-compressor': {
    technicalOverview:
      'The Toolzaro Image Compressor executes entirely within your browser using HTML5 Canvas pixel manipulation and native image encoding APIs. By converting source image bitstreams into customizable canvas contexts, it applies variable lossy compression algorithms without sending your sensitive photographs or company graphics to an external server.',
    features: [
      { title: '100% Client-Side Privacy', description: 'Your photos never upload to the cloud. All compression happens directly in your computer or phone RAM.' },
      { title: 'Interactive Quality Slider', description: 'Fine-tune image compression percentage from 10% to 100% with real-time file size previews.' },
      { title: 'Multi-Format Support', description: 'Compress JPEG, PNG, and WebP images with instant format conversion.' },
      { title: 'Batch Processing Ready', description: 'Rapidly optimize multiple assets in seconds for websites, emails, and social media.' }
    ],
    useCases: [
      { audience: 'Web Developers', title: 'Core Web Vitals Optimization', scenario: 'Shrink hero banners and product photos to under 100KB to achieve 95+ Google PageSpeed and Lighthouse performance scores.' },
      { audience: 'Job Applicants & Students', title: 'Portal File Size Compliance', scenario: 'Reduce government application IDs, resumes, and photo uploads to meet strict 2MB or 500KB portal upload limits.' },
      { audience: 'E-commerce Store Owners', title: 'Fast-Loading Catalogues', scenario: 'Compress hundreds of product photography shots to accelerate mobile shopping experiences and improve conversion rates.' }
    ],
    bestPractices: [
      { title: 'Balance Compression vs Artifacts', advice: 'A quality setting of 75% to 85% typically reduces file size by 60–80% with zero perceptible visual degradation.' },
      { title: 'Choose WebP for Superior Ratios', advice: 'WebP provides 25–35% smaller file sizes than standard JPEG at equivalent visual quality.' },
      { title: 'Keep Master Originals', advice: 'Always keep your uncompressed RAW or high-resolution PNG originals saved in an archive before resizing for web delivery.' }
    ],
    extendedFaqs: [
      { q: 'Are my private photos uploaded to a server?', a: 'No. Toolzaro performs all compression locally in your browser. Even if you turn off your internet connection, the compressor continues to work.' },
      { q: 'Will compressing an image blur text or fine details?', a: 'At recommended quality levels (75–85%), text and sharp lines remain crisp. For line art and text graphics, PNG or high-quality WebP is recommended.' },
      { q: 'What is the maximum file size supported?', a: 'Because compression runs in browser memory, you can compress images up to 50MB+ depending on your device hardware.' }
    ]
  },
  'pdf-merger': {
    technicalOverview:
      'Our PDF Merger uses pdf-lib compiled to client-side WebAssembly to parse PDF document catalogs, cross-reference tables (XREFs), and page object trees entirely in local memory. Individual pages are merged into a newly constructed document without rasterization, preserving vector typography, hyperlinks, and document metadata.',
    features: [
      { title: 'Zero Cloud Uploads', description: 'Legal agreements, financial audits, and personal tax returns never leave your device.' },
      { title: 'Drag-and-Drop Page Ordering', description: 'Easily rearrange files in your desired sequence before generating the final combined PDF.' },
      { title: 'Vector & Text Fidelity', description: 'Preserves crisp scalable fonts, vector illustrations, and selectable text without flattening to lossy images.' },
      { title: 'Instant Processing', description: 'Merges multi-megabyte documents in seconds using local multi-core CPU acceleration.' }
    ],
    useCases: [
      { audience: 'Legal & Compliance Professionals', title: 'Confidential Contract Compilations', scenario: 'Merge multi-part NDAs, annexures, and signed signature pages without risking client confidentiality on unverified web servers.' },
      { audience: 'Accountants & Tax Filers', title: 'Tax Dossier Consolidation', scenario: 'Combine bank statements, expense receipts, and W-2/1099 tax forms into a single consolidated PDF submission.' },
      { audience: 'Students & Academics', title: 'Thesis & Paper Submissions', scenario: 'Combine research papers, bibliography pages, and appendices into a uniform dissertation file.' }
    ],
    bestPractices: [
      { title: 'Verify Document Sequence', advice: 'Double-check the file list order before clicking merge to ensure page numbering flows logically.' },
      { title: 'Remove Password Protection First', advice: 'Ensure input PDFs are unlocked; encrypted PDFs cannot be manipulated without authorization credentials.' },
      { title: 'Inspect Final Page Count', advice: 'Open the downloaded merged file in your default PDF viewer to verify that all appendices and signatures are intact.' }
    ],
    extendedFaqs: [
      { q: 'Is it safe to merge sensitive business documents here?', a: 'Yes. Because Toolzaro operates 100% client-side, your files never leave your device. It is safe for confidential client files, medical records, and legal contracts.' },
      { q: 'Does merging compress or degrade the PDF quality?', a: 'No. The underlying vector graphics, high-resolution embedded images, and embedded fonts are copied verbatim without lossy re-encoding.' },
      { q: 'How many PDF files can I merge at once?', a: 'You can merge dozens of files simultaneously, limited only by your available computer RAM.' }
    ]
  },
  'password-generator': {
    technicalOverview:
      'The Toolzaro Password Generator relies on the Web Cryptography API (`crypto.getRandomValues`) to obtain cryptographically strong entropy from your operating system’s hardware entropy pool. It eliminates modulo bias during character selection to produce passwords that withstand modern dictionary, rainbow table, and brute-force GPU attacks.',
    features: [
      { title: 'Hardware Entropy Pool', description: 'Uses OS-level cryptographic random number generation rather than predictable pseudo-random seeds.' },
      { title: 'Customizable Character Sets', description: 'Toggle uppercase, lowercase, numbers, and high-entropy symbols, with options to avoid ambiguous characters (l, 1, I, O, 0).' },
      { title: 'NIST & OWASP Compliant', description: 'Generates passwords exceeding 16+ characters to satisfy modern zero-trust enterprise security standards.' },
      { title: 'Zero Storage Guarantee', description: 'Passwords are generated into ephemeral component state and immediately wiped upon page refresh.' }
    ],
    useCases: [
      { audience: 'SysAdmins & DevOps Engineers', title: 'Root Credentials & Database Keys', scenario: 'Generate 32-character high-entropy secret keys for PostgreSQL databases, SSH credentials, and AWS IAM roles.' },
      { audience: 'Everyday Internet Users', title: 'Account Protection', scenario: 'Create unique, uncrackable passwords for banking, social media, and email accounts to prevent credential-stuffing attacks.' },
      { audience: 'Security Auditors', title: 'Test Token Generation', scenario: 'Quickly generate random strings for mock authentication environments and penetration testing.' }
    ],
    bestPractices: [
      { title: 'Aim for 16+ Characters', advice: 'Modern GPUs can crack 8-character passwords in minutes; 16+ characters with mixed symbols requires billions of years to brute-force.' },
      { title: 'Never Reuse Passwords', advice: 'Always use a unique password for every web service to contain the impact of third-party data breaches.' },
      { title: 'Store in a Certified Vault', advice: 'Pair this tool with a reputable password manager (e.g. Bitwarden, 1Password) rather than writing secrets on unencrypted sticky notes.' }
    ],
    extendedFaqs: [
      { q: 'Are generated passwords saved in your database?', a: 'Never. Toolzaro has no database of generated passwords. The moment you refresh or navigate away, the password vanishes completely from memory.' },
      { q: 'Why does crypto.getRandomValues matter?', a: 'Standard Math.random() is predictable and vulnerable to cryptanalysis. crypto.getRandomValues draws from thermal noise and hardware entropy, guaranteeing unpredictable randomness.' },
      { q: 'Should I avoid symbols on certain legacy websites?', a: 'Some legacy banking portals restrict special characters. You can toggle off symbols while increasing password length to 20+ characters to maintain strong entropy.' }
    ]
  },
  'json-formatter': {
    technicalOverview:
      'The Toolzaro JSON Formatter, Beautifier & Validator processes structured JavaScript Object Notation (RFC 8259 compliant) using recursive descent parsing. It immediately detects syntax defects such as trailing commas, single-quoted keys, unescaped control characters, and unbalanced brackets with exact character indices and line numbers. Code beautification supports 2-space, 4-space, and tab indentation, as well as ultra-compact minification for high-throughput API payloads.',
    features: [
      { title: 'RFC 8259 Strict Syntax Verification', description: 'Highlights syntax violations, malformed quotes, and invalid types with precise line-by-line debugging.' },
      { title: 'Instant Indentation Customization', description: 'Switch between compact single-line minification, 2-space clean formatting, or 4-space enterprise styles.' },
      { title: '100% In-Memory Sandbox', description: 'Proprietary payloads, JSON API secrets, and sensitive tokens never exit your local device browser.' },
      { title: 'Tree & Table Visualization', description: 'Expand and collapse deeply nested objects and arrays with clear structural breadcrumbs.' }
    ],
    useCases: [
      { audience: 'Backend Developers & API Architects', title: 'REST & GraphQL Debugging', scenario: 'Inspect and format raw JSON responses from Postman, curl, or microservice gateways to locate nested errors in seconds.' },
      { audience: 'DevOps & Cloud Engineers', title: 'Infrastructure Configuration', scenario: 'Format AWS CloudFormation policies, Kubernetes manifests, and Docker daemon configurations before committing to Git.' },
      { audience: 'QA Engineers', title: 'Payload Validation', scenario: 'Ensure test datasets conform strictly to JSON schema standards without risking customer PII leakage.' }
    ],
    bestPractices: [
      { title: 'Double Quotes for RFC Standards', advice: 'Always verify keys and strings are enclosed in double quotes (""), as single quotes (\'\') are invalid in RFC 8259 JSON.' },
      { title: 'Remove Trailing Commas', advice: 'Standard JSON forbids commas after the final key in an object or array; the validator highlights these immediately.' },
      { title: 'Minify Before Network Transmission', advice: 'Use the 1-click Minify option to eliminate whitespace overhead when transmitting large JSON structures over low-bandwidth connections.' }
    ],
    extendedFaqs: [
      { q: 'Is my JSON payload logged or saved?', a: 'No. The JSON formatter executes entirely in your browser JavaScript thread. No data is sent over HTTP/HTTPS to any server.' },
      { q: 'Can this tool format multi-megabyte JSON files?', a: 'Yes. Thanks to virtualized rendering and native JSON.parse engines, the tool handles 10MB+ JSON structures smoothly.' },
      { q: 'What causes the "Unexpected token in JSON" error?', a: 'This commonly happens when your input contains unescaped double quotes inside strings, trailing commas, single quotes, or comment lines (//) which are not permitted in strict JSON.' }
    ]
  },
  'qr-code-generator': {
    technicalOverview:
      'Toolzaro’s QR Code Generator synthesizes ISO/IEC 18004 compliant two-dimensional matrix symbologies with selectable Reed-Solomon Error Correction Code (ECC) levels (7% L, 15% M, 25% Q, and 30% H). Generated barcodes are drawn dynamically to high-DPI HTML5 Canvases and vector SVG nodes, allowing infinite lossless scaling for billboard print, packaging, and digital displays.',
    features: [
      { title: 'Reed-Solomon Error Correction', description: 'Configurable ECC resilience up to Level H (30%), allowing damaged or covered QR codes to remain completely scannable.' },
      { title: 'Universal Payload Formatting', description: 'Generate QR codes for Web URLs, Wi-Fi credentials (WPA/WPA2), vCard contacts, SMS, Email, and plain text.' },
      { title: 'Lossless Vector SVG Export', description: 'Download production-ready vector graphics (.svg) or high-resolution PNG images for print design.' },
      { title: 'Zero Cloud Round-Trip', description: 'QR codes render instantly in 0ms using client-side algorithms without tracking pixels or redirection redirects.' }
    ],
    useCases: [
      { audience: 'Retail & Restaurant Operators', title: 'Contactless Digital Menus', scenario: 'Create permanent QR codes linking to digital menus, promotional tables, and guest Wi-Fi login networks.' },
      { audience: 'Marketing Professionals', title: 'Print Collateral & Billboards', scenario: 'Export Level H QR codes in SVG format for billboards, exhibition banners, flyers, and business cards.' },
      { audience: 'Event Organizers', title: 'Ticket Check-in & Schedules', scenario: 'Embed session links and ticketing information for attendees to scan instantly with iOS and Android camera apps.' }
    ],
    bestPractices: [
      { title: 'Maintain Sufficient Contrast', advice: 'Ensure the dark modules have high contrast against the light background (at least 4:1 ratio); avoid light-on-light color palettes.' },
      { title: 'Leave a Quiet Zone Border', advice: 'Always preserve a margin of at least 4 module widths around the QR code so camera sensors can isolate the pattern.' },
      { title: 'Choose Level H When Adding Logos', advice: 'If you plan to place a logo in the center of the QR code, select Error Correction Level H (30%) to prevent scan failure.' }
    ],
    extendedFaqs: [
      { q: 'Do these QR codes ever expire or require subscription renewal?', a: 'No! These are 100% static QR codes. The encoded data is directly embedded inside the black-and-white grid. They will work indefinitely as long as your destination link exists.' },
      { q: 'Can iPhone and Android cameras scan this natively without an app?', a: 'Yes. All generated codes follow ISO/IEC 18004 standards and are recognized immediately by the standard Camera app on both iOS and Android.' },
      { q: 'What is the ideal print size for a QR code?', a: 'For handheld materials (business cards, flyers), a minimum size of 2cm x 2cm (0.8in x 0.8in) is recommended. For posters, scale up based on scanning distance.' }
    ]
  },
  'sitemap-generator': {
    technicalOverview:
      'The Toolzaro XML Sitemap Generator creates standardized Sitemaps.org Protocol 0.9 XML documents for search engine bots. It automates `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` tagging while ensuring all URLs are strictly absolute, canonicalized, and UTF-8 encoded to satisfy Google Search Console and Bing Webmaster guidelines.',
    features: [
      { title: 'Sitemaps.org 0.9 Specification', description: 'Outputs schema-compliant XML that search crawlers parse without schema validation warnings.' },
      { title: 'Automated Canonical Normalization', description: 'Forces HTTPS protocol, trims trailing slashes, and formats ISO 8601 timestamps (YYYY-MM-DD).' },
      { title: 'Priority & Frequency Mapping', description: 'Assign logical crawl frequencies and priority weights (0.1 to 1.0) to highlight core landing pages.' },
      { title: 'One-Click Copy & Download', description: 'Instantly download sitemap.xml or copy to clipboard for immediate upload to web hosting root.' }
    ],
    useCases: [
      { audience: 'SEO Specialists & Webmasters', title: 'Full Indexation Acceleration', scenario: 'Generate clean XML sitemaps to submit via Google Search Console and Bing Webmaster Tools for rapid crawling.' },
      { audience: 'Developers & Agency Teams', title: 'Client Site Launches', scenario: 'Build complete XML sitemaps during staging audits to ensure zero orphan pages before going live.' },
      { audience: 'Bloggers & Publishers', title: 'Content Discovery', scenario: 'Map out new editorial categories and articles to ensure search engine spiders discover updates in minutes.' }
    ],
    bestPractices: [
      { title: 'Submit Sitemap to Search Console', advice: 'After downloading sitemap.xml, place it in your website root and submit the URL in Google Search Console under Indexing > Sitemaps.' },
      { title: 'Keep URLs Strictly Canonical', advice: 'Never include redirecting URLs (301/302) or parameterized duplicate URLs in your sitemap; include only status 200 final canonical links.' },
      { title: 'Reference in robots.txt', advice: 'Add `Sitemap: https://yourdomain.com/sitemap.xml` at the bottom of your robots.txt file to guide all search crawlers automatically.' }
    ],
    extendedFaqs: [
      { q: 'Why is an XML sitemap essential for SEO?', a: 'An XML sitemap tells search engines which pages exist, when they were last modified, and their relative priority, preventing deep pages from being missed.' },
      { q: 'How many URLs can a single XML sitemap contain?', a: 'Search engines permit up to 50,000 URLs or 50MB uncompressed per sitemap file. Larger sites can use a Sitemap Index file to link multiple sitemaps.' },
      { q: 'How frequently should I update my sitemap?', a: 'Whenever new pages, tools, or articles are added, or when existing content receives a major overhaul, update the sitemap and lastmod date.' }
    ]
  }
};

/**
 * Returns complete, high-value technical documentation, workflows, use cases,
 * and FAQs for any given tool.
 */
export function getToolKnowledge(tool: ToolDefinition): ToolKnowledge {
  const categoryBaseline = categoryKnowledgeDefaults[tool.category] || categoryKnowledgeDefaults['Universal Data Suite'];
  const bespoke = bespokeToolKnowledge[tool.slug] || {};

  // Construct default features if not bespoke
  const defaultFeatures = [
    {
      title: '100% In-Browser Execution',
      description: `All operations for ${tool.name} execute entirely on your local machine using modern browser engines. Zero data leaves your device.`
    },
    {
      title: 'High-Performance React Engine',
      description: 'Instant reactive feedback with linear O(N) computational efficiency and hardware-accelerated processing.'
    },
    {
      title: 'Zero Account Requirement',
      description: 'Free and unlimited access without registration, email capture, or rate limits.'
    },
    {
      title: 'Cross-Device & Mobile Ready',
      description: 'Fully responsive interface designed for desktop workstations, tablets, and mobile smartphones alike.'
    }
  ];

  // Construct default use cases based on category
  const defaultUseCases = [
    {
      audience: 'Engineers & Developers',
      title: 'Automated Workflows & Verification',
      scenario: `Use ${tool.name} during development, debugging, and testing to rapidly inspect, transform, and validate data payloads without terminal overhead.`
    },
    {
      audience: 'Digital Creators & Marketers',
      title: 'Rapid Asset Preparation',
      scenario: `Streamline day-to-day digital publishing workflows, ensuring all output meets modern web specifications and compliance guidelines.`
    },
    {
      audience: 'Students & Professionals',
      title: 'Daily Productivity & Study',
      scenario: `Solve complex calculations, format text, and manage documents with reliable, accurate, and completely private browser utilities.`
    }
  ];

  return {
    technicalOverview: bespoke.technicalOverview || categoryBaseline.technicalOverview,
    features: bespoke.features || defaultFeatures,
    useCases: bespoke.useCases || defaultUseCases,
    bestPractices: bespoke.bestPractices || categoryBaseline.bestPractices,
    extendedFaqs: [
      ...tool.faq,
      ...(bespoke.extendedFaqs || categoryBaseline.extendedFaqs)
    ]
  };
}
