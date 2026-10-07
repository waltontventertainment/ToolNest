import { Type, QrCode, Image as ImageIcon, KeyRound, Search, FileText, Binary, Code, Barcode, FileSearch, Timer, Scissors, ArrowDownAZ, Space, Filter, ArrowLeftRight, WrapText, SplitSquareHorizontal, Mail, Link, Hash, FileDiff, Replace, ListPlus, ShieldX, Calculator, Superscript, Clock, Palette, Database, Fingerprint, Scan, Crop, Globe, Heart, Activity, FileCode, Box, Share2, BarChart2, Tag, Zap, BookOpen, Layers as Hierarchy, Volume2, Keyboard, Monitor, Shuffle, Maximize2, Sliders, Stamp, Eye, EyeOff, Sparkles, Merge, RotateCw, ShieldAlert, CheckCircle2, Video, Briefcase, ShoppingBag, Users, GraduationCap, Globe2, Utensils, Scale } from 'lucide-react';
import { ToolDefinition, ToolCategory } from './types';
import {
  TemperatureConverter, LengthConverter, WeightConverter, VolumeConverter, DataStorageConverter, AngleConverter, Rot13Converter, TextToOctal, OctalToText, RomanNumeralConverter
} from '../tools/ConvertersBatch';
import {
  CronGenerator, CssGradientGenerator, PlaceholderImageGenerator, MockDataGenerator, SqlInsertGenerator, IdGeneratorSuite, SecretKeyGenerator, AdvancedSlugGenerator, FaviconManifestGenerator, BcryptHashGenerator
} from '../tools/GeneratorsBatch';
import { QrCodeScanner, BarcodeScanner } from '../tools/ScannerTools';
import {
  ColorPickerPalette, CssBoxShadowGenerator, JsonToTypescript, UnixCronHumanizer, SvgOptimizer, JwtGeneratorTester, DiscountTaxCalculator, BmiCalorieCalculator, TextCleanerPro, DomainIpLookup
} from '../tools/NewToolsBatch';
import {
  MarkdownToHtmlConverter, JsonToXmlConverter, ScreenAspectRatioCalculator, ColorPaletteGenerator, PxToRemConverter, TimeZoneConverter, UserAgentParser, FinancialEmiCalculator, TextCaseCounterStats, SvgToPngConverter
} from '../tools/BatchExtraTools';
import {
  RobotsTxtGenerator, SitemapXmlGenerator, OpenGraphPreviewer, SchemaMarkupGenerator, KeywordDensityAnalyzer, SerpSnippetOptimizer, HrefLangRedirectGenerator, HeadingStructureAnalyzer, SeoSlugHealthChecker, SeoContentReadabilityAudit
} from '../tools/SeoToolsBatch';
import {
  CountdownTimerAlarm, WorldClockScheduler, RandomChoicePicker, UnitPriceComparator, ScreenWebcamTester, AudioToneGenerator, FileHashCalculator, KeyboardKeyTester, ImageToBase64Converter, QuickScratchpadNotes
} from '../tools/UtilityToolsBatch';
import {
  ImageResizerConverter, ImageCropperRatio, ImagePaletteExtractor, ImageFiltersAdjuster, ImageWatermarkAdder, ColorContrastWcagChecker, SvgToCssDataUriConverter, ColorGradientMeshGenerator, ColorBlindnessSimulator, ImageAnonymizerBlur
} from '../tools/ColorImageToolsBatch';
import {
  AiArticleWriter, AiTextSummarizer, AiSmartTranslator, AiGrammarPolisher, AiCodeExplainer,
  AiImagePromptGenerator, AiEmailWriter, AiSeoGenerator, AiRegexSqlGenerator, AiSocialPostGenerator
} from '../tools/AiToolsBatch';
import {
  AiYoutubeScriptGenerator, AiResumeBioBuilder, AiProductDescription, AiInterviewPrep,
  AiStoryPlotGenerator, AiMathProblemSolver, AiQuizFlashcardMaker, AiDomainStartupNamer,
  AiRecipeMealPlanner, AiContractLegalExplainer
} from '../tools/AiToolsBatch2';

import { 
  CaseConverter, QRGenerator, ImageCompressor, PasswordGenerator, WordCounter, 
  Base64Converter, BaseConverter, BarcodeGenerator, MetaTagGenerator, Stopwatch,
  RemoveDuplicateLines, SortLines, RemoveExtraSpaces, RemoveEmptyLines, ReverseText,
  ReverseLines, HtmlStripper, ExtractEmails, ExtractUrls, TextToBinary, BinaryToText,
  TextToHex, HexToText, TextToAscii, AsciiToText, ShuffleLines, AddLineNumbers,
  PrefixSuffixLines, TextDiff, FindAndReplace,
  SimpleCalculator, AdvancedCalculator,
  JsonFormatter, UrlEncoder, HtmlEntityEncoder, Md5Generator, JwtDecoder, UuidGenerator, LoremIpsumGenerator, UnixTimestampConverter, CssMinifier, ColorConverter,
  HtmlEditor, RegexTester, UrlParser, ShaGenerator, JsonMinifier, XmlFormatter, SqlMinifier, HtmlMinifier, ChmodCalculator, TextToSlugConverter,
  CsvToJson, JsonToCsv, StringEscape, HmacGenerator, Ipv4SubnetCalc, MimeTypeLookup, JsKeycodeInfo, QueryStringParser, MacAddressGenerator, Ipv4Generator,
  Ipv6Generator, HttpStatusCodes, TextToMorse, MorseToText, RandomStringGenerator, DeviceResolutionLookup, PasswordStrengthChecker, TextToDecimal, DecimalToText, BasicJsMinifier,
  PdfMergerTool, PdfSplitterTool, PdfToTextTool, TextToPdfTool, PdfToImagesTool, PdfRotateTool, PdfWatermarkTool
} from '../tools';

export const categories: ToolCategory[] = [
  'AI', 'PDF', 'Text', 'Developer', 'Converters', 'Generators', 'QR & Barcode', 'Color & Image', 'Calculators', 'SEO', 'Utility'
];

export const tools: ToolDefinition[] = [
  {
    slug: 'ai-article-writer',
    name: 'AI Article & Blog Writer',
    category: 'AI',
    icon: Sparkles,
    keywords: ['ai writer', 'ai article generator', 'blog post generator', 'ai content writer', 'seo article generator'],
    metaTitle: 'AI Article & Blog Post Writer - Free AI Content Generator',
    metaDescription: 'Generate full-length, SEO-optimized articles, blog posts, and guides instantly with our multi-model AI engine.',
    intro: 'Produce well-researched, high-ranking blog posts and articles in seconds. Features intelligent outline generation, tone adjustment, and multilingual support powered by high-speed AI models.',
    howTo: [
      'Enter your article topic or headline.',
      'Specify your target SEO keywords and desired writing tone.',
      'Choose output length and language.',
      'Click Generate Article to receive structured Markdown content.'
    ],
    faq: [
      { q: 'Is this AI writer completely free?', a: 'Yes! It runs on free models with automatic multi-model failover.' },
      { q: 'Can I write articles in different languages?', a: 'Yes, it supports English, Bengali, Spanish, French, German, Hindi, Arabic, and more.' }
    ],
    Component: AiArticleWriter
  },
  {
    slug: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    category: 'AI',
    icon: FileText,
    keywords: ['ai summarizer', 'text summary', 'summarize article', 'key takeaways', 'bullet point summarizer'],
    metaTitle: 'AI Text Summarizer - Condense Long Articles & Documents',
    metaDescription: 'Quickly summarize long documents, meeting notes, essays, and articles into bullet points or executive summaries.',
    intro: 'Distill lengthy text, transcripts, and reports into clear, actionable bullet points and concise summaries without losing vital information.',
    howTo: [
      'Paste your raw text or article into the input box.',
      'Select your desired summary format (Executive Bullets, TL;DR, or Paragraph).',
      'Click Summarize Text to generate an instant briefing.'
    ],
    faq: [
      { q: 'What is the maximum text length?', a: 'You can paste thousands of words, and the AI model will extract key insights.' }
    ],
    Component: AiTextSummarizer
  },
  {
    slug: 'ai-smart-translator',
    name: 'AI Smart Translator',
    category: 'AI',
    icon: Globe,
    keywords: ['ai translator', 'smart translation', 'contextual translator', 'multilingual ai', 'translate text'],
    metaTitle: 'AI Smart Translator - Context-Aware Multilingual Translation',
    metaDescription: 'Translate text naturally across 20+ languages with nuance and cultural context preservation.',
    intro: 'Go beyond literal word-for-word translation. Our AI understands idioms, slang, and technical context to deliver fluent, human-like translations.',
    howTo: [
      'Choose source and target languages.',
      'Paste or type the text you want translated.',
      'Click Translate with AI and copy the output.'
    ],
    faq: [
      { q: 'Does it support Bengali and non-Latin scripts?', a: 'Yes, full support for Bengali (বাংলা), Hindi, Arabic, Japanese, Chinese, and European languages.' }
    ],
    Component: AiSmartTranslator
  },
  {
    slug: 'ai-grammar-polisher',
    name: 'AI Grammar & Paraphraser',
    category: 'AI',
    icon: CheckCircle2,
    keywords: ['grammar checker', 'ai paraphraser', 'sentence rewriter', 'proofreading ai', 'fix grammar'],
    metaTitle: 'AI Grammar Checker & Paraphraser - Polish Your Writing',
    metaDescription: 'Instantly fix grammar mistakes, improve sentence flow, and rephrase text for academic, professional, or casual clarity.',
    intro: 'Elevate your writing with intelligent grammar correction, vocabulary enhancement, and tone adaptation for emails, essays, and publications.',
    howTo: [
      'Paste your draft text.',
      'Choose whether to fix grammar, simplify, expand, or rewrite formally.',
      'Click Polish & Paraphrase to view the perfected version.'
    ],
    faq: [
      { q: 'Does it explain the corrections?', a: 'Yes, it provides an edited version along with concise bullet points explaining key grammar and flow improvements.' }
    ],
    Component: AiGrammarPolisher
  },
  {
    slug: 'ai-code-explainer',
    name: 'AI Code Generator & Explainer',
    category: 'AI',
    icon: Code,
    keywords: ['ai code generator', 'code explainer', 'debug code ai', 'code converter', 'programming assistant'],
    metaTitle: 'AI Code Generator & Explainer - Debug, Convert & Write Code',
    metaDescription: 'Write code snippets, explain complex functions, find bugs, and convert code between programming languages.',
    intro: 'Accelerate your programming workflow. Ask AI to write code, explain algorithms line-by-line, diagnose runtime bugs, or refactor legacy code.',
    howTo: [
      'Select your task (Generate Code, Explain Code, Debug / Fix, or Convert Language).',
      'Enter your prompt or paste existing code.',
      'Click Process with AI to get syntax-highlighted code and analysis.'
    ],
    faq: [
      { q: 'Which programming languages are supported?', a: 'All major languages including JavaScript, TypeScript, Python, Go, Rust, Java, C++, PHP, and SQL.' }
    ],
    Component: AiCodeExplainer
  },
  {
    slug: 'ai-image-prompt-generator',
    name: 'AI Image Prompt Crafter',
    category: 'AI',
    icon: ImageIcon,
    keywords: ['midjourney prompt generator', 'dall-e prompt', 'stable diffusion prompt', 'ai art prompt', 'flux prompt'],
    metaTitle: 'AI Image Prompt Crafter - Midjourney & DALL-E Prompt Builder',
    metaDescription: 'Turn simple ideas into rich, cinematic prompts optimized for Midjourney v6, DALL-E 3, Stable Diffusion, and Flux.',
    intro: 'Craft breathtaking AI art prompts with lighting modifiers, camera lenses, aspect ratios, artist styles, and rendering engine tags.',
    howTo: [
      'Type a simple concept (e.g. "futuristic cyberpunk market").',
      'Select target model (Midjourney, DALL-E 3, Flux) and artistic style.',
      'Click Craft Prompts to generate 4 detailed variations with prompt parameters.'
    ],
    faq: [
      { q: 'Does it include negative prompts?', a: 'Yes, it provides both positive prompts with parameters and recommended negative prompts.' }
    ],
    Component: AiImagePromptGenerator
  },
  {
    slug: 'ai-email-writer',
    name: 'AI Email & Letter Writer',
    category: 'AI',
    icon: Mail,
    keywords: ['ai email writer', 'professional email generator', 'cold email generator', 'resignation letter ai', 'reply assistant'],
    metaTitle: 'AI Email & Letter Writer - Craft Professional Emails Quickly',
    metaDescription: 'Draft persuasive sales outreach, client replies, cover letters, and formal inquiries with perfect etiquette.',
    intro: 'Never struggle with blank email drafts again. Generate polished, context-appropriate emails for any workplace or personal situation in seconds.',
    howTo: [
      'Describe the purpose of your email (e.g., "Follow up after interview").',
      'Select tone (Professional, Friendly, Urgent, Persuasive).',
      'Click Generate Email to get subject lines and complete email body.'
    ],
    faq: [
      { q: 'Can it generate multiple subject lines?', a: 'Yes, it generates 3 high-open-rate subject lines plus the full email body.' }
    ],
    Component: AiEmailWriter
  },
  {
    slug: 'ai-seo-generator',
    name: 'AI SEO Meta & Title Suite',
    category: 'AI',
    icon: Search,
    keywords: ['seo title generator', 'meta description ai', 'keyword generator', 'seo metadata tool', 'serp optimizer'],
    metaTitle: 'AI SEO Meta & Title Generator - Rank #1 on Google',
    metaDescription: 'Generate high-CTR title tags, 155-character meta descriptions, and keyword clusters for any webpage.',
    intro: 'Maximize your search engine click-through rate with pixel-perfect titles, compelling meta descriptions, and long-tail keyword clusters.',
    howTo: [
      'Enter your page topic, product, or target keyword.',
      'Click Generate SEO Package to get title variations and meta descriptions.'
    ],
    faq: [
      { q: 'Are character limits strictly enforced?', a: 'Yes, titles stay under 60 characters and meta descriptions under 155 characters.' }
    ],
    Component: AiSeoGenerator
  },
  {
    slug: 'ai-regex-sql-generator',
    name: 'AI Regex & SQL Generator',
    category: 'AI',
    icon: Database,
    keywords: ['ai regex generator', 'ai sql generator', 'regex builder', 'sql query writer', 'natural language to sql'],
    metaTitle: 'AI Regex & SQL Query Generator - Plain English to Code',
    metaDescription: 'Convert plain English instructions into complex Regular Expressions or optimized SQL queries with explanations.',
    intro: 'Transform natural language descriptions into bulletproof regular expressions and high-performance SQL queries for PostgreSQL, MySQL, and SQLite.',
    howTo: [
      'Choose Regex Pattern or SQL Query mode.',
      'Describe what pattern or database query you need.',
      'Click Generate to view the query, explanations, and test cases.'
    ],
    faq: [
      { q: 'Does it provide test cases for Regex?', a: 'Yes, it includes positive and negative test cases to verify your pattern.' }
    ],
    Component: AiRegexSqlGenerator
  },
  {
    slug: 'ai-social-post-generator',
    name: 'AI Social Post & Hashtag Crafter',
    category: 'AI',
    icon: Zap,
    keywords: ['social media post generator', 'twitter thread generator', 'linkedin post ai', 'hashtag generator', 'viral hook writer'],
    metaTitle: 'AI Social Media Post & Hashtag Crafter - Viral Content Generator',
    metaDescription: 'Create high-engagement posts, hooks, and hashtags for Twitter/X, LinkedIn, Instagram, Facebook, and Threads.',
    intro: 'Generate viral hooks, engaging captions, and trending hashtags customized for any social network to boost your organic reach and engagement.',
    howTo: [
      'Enter your topic, product launch, or announcement.',
      'Select your platform (Twitter/X, LinkedIn, Instagram, etc.).',
      'Click Generate Viral Social Posts and copy your favorite version.'
    ],
    faq: [
      { q: 'Does it format specifically for LinkedIn?', a: 'Yes, LinkedIn mode formats with proper line breaks, storytelling pacing, and professional formatting.' }
    ],
    Component: AiSocialPostGenerator
  },
  {
    slug: 'ai-youtube-script',
    name: 'AI YouTube & Video Scriptwriter',
    category: 'AI',
    icon: Video,
    keywords: ['youtube script generator', 'video script ai', 'shorts script generator', 'tiktok script writer', 'video hook generator'],
    metaTitle: 'AI YouTube & Video Script Generator - Write Viral Scripts',
    metaDescription: 'Generate scene-by-scene YouTube video scripts, viral hooks, visual B-roll prompts, and CTAs in seconds.',
    intro: 'Create high-retention YouTube, Shorts, TikTok, and documentary scripts with structured scene timestamps, voiceover copy, and B-roll instructions.',
    howTo: [
      'Enter your video topic or headline idea.',
      'Select video format (YouTube Long-form, Shorts/Reels, or Documentary).',
      'Click Generate Full Video Script to stream your scene-by-scene script.'
    ],
    faq: [
      { q: 'Does it include B-roll and visual cues?', a: 'Yes! Every scene includes timestamp markers, visual director notes, and spoken dialogue.' }
    ],
    Component: AiYoutubeScriptGenerator
  },
  {
    slug: 'ai-resume-bio-builder',
    name: 'AI Resume & LinkedIn Bio Builder',
    category: 'AI',
    icon: Briefcase,
    keywords: ['resume builder ai', 'linkedin bio generator', 'ats resume bullets', 'executive summary writer', 'cv writer'],
    metaTitle: 'AI Resume & LinkedIn Bio Builder - ATS-Friendly Bullets & Summaries',
    metaDescription: 'Craft metric-driven XYZ-formula resume bullet points, ATS keywords, and executive LinkedIn summary bios.',
    intro: 'Transform your career history into powerful, metric-driven accomplishments using Google-style XYZ formulas that pass Applicant Tracking Systems.',
    howTo: [
      'Enter your target job role and brief background experience.',
      'Add key skills and tools you want highlighted.',
      'Click Generate ATS-Ready Content and copy your polished resume sections.'
    ],
    faq: [
      { q: 'Is this formatted for ATS systems?', a: 'Yes, it outputs clean text with standard bullet formatting and dense keyword clusters.' }
    ],
    Component: AiResumeBioBuilder
  },
  {
    slug: 'ai-product-description',
    name: 'AI Product Copywriter',
    category: 'AI',
    icon: ShoppingBag,
    keywords: ['product description generator', 'shopify copywriter', 'amazon listing copy', 'ecommerce sales copy', 'etsy description ai'],
    metaTitle: 'AI Product Copywriter - High-Converting E-Commerce Copy',
    metaDescription: 'Generate emotional, benefit-driven product listings for Shopify, Amazon, and Etsy with high-converting buyer triggers.',
    intro: 'Boost conversion rates with persuasive product descriptions. Features emotional storytelling hooks, benefit-driven feature bullets, and SEO keywords.',
    howTo: [
      'Enter your product name and key specs or features.',
      'Select target marketplace (Shopify, Amazon, Etsy).',
      'Click Generate Product Copy to receive headlines, feature bullets, and guarantee copy.'
    ],
    faq: [
      { q: 'Does it include SEO keywords?', a: 'Yes, every generated product listing includes a list of top commercial-intent search keywords.' }
    ],
    Component: AiProductDescription
  },
  {
    slug: 'ai-interview-prep',
    name: 'AI Job Interview STAR Coach',
    category: 'AI',
    icon: Users,
    keywords: ['interview question generator', 'star method answers', 'job interview prep', 'mock interview ai', 'behavioral interview'],
    metaTitle: 'AI Job Interview Coach - STAR Method Answers & Questions',
    metaDescription: 'Master any job interview with expected behavioral questions, model STAR answers, and reverse-interview questions.',
    intro: 'Prepare for high-stakes interviews with tailored behavioral and technical questions, battle-tested STAR answers, and smart questions to ask recruiters.',
    howTo: [
      'Enter your target job title and company or industry.',
      'Select interview round (Behavioral, Technical, or HR Screening).',
      'Click Generate Interview Answers to study model responses.'
    ],
    faq: [
      { q: 'What is the STAR method?', a: 'STAR stands for Situation, Task, Action, and Result—the standard structure used by top employers like Google, Amazon, and Fortune 500s.' }
    ],
    Component: AiInterviewPrep
  },
  {
    slug: 'ai-story-generator',
    name: 'AI Creative Story & Plot Crafter',
    category: 'AI',
    icon: BookOpen,
    keywords: ['story generator', 'creative writing ai', 'novel plot generator', 'sci fi story writer', 'fiction generator'],
    metaTitle: 'AI Creative Story & Plot Crafter - Fiction & Novel Generator',
    metaDescription: 'Generate immersive creative stories, character arcs, three-act plot outlines, and dialogue in any genre.',
    intro: 'Unleash your imagination. Generate captivating fiction stories, rich world-building descriptions, plot twists, and multi-layered characters.',
    howTo: [
      'Type your creative story premise or idea.',
      'Choose genre (Sci-Fi, Fantasy, Thriller, Horror, Romance).',
      'Click Generate Creative Story to stream rich prose and dialogue.'
    ],
    faq: [
      { q: 'Can I choose specific narrative formats?', a: 'Yes, you can generate complete short stories, opening chapters, or three-act plot outlines.' }
    ],
    Component: AiStoryPlotGenerator
  },
  {
    slug: 'ai-math-solver',
    name: 'AI Step-by-Step Math Solver',
    category: 'AI',
    icon: Calculator,
    keywords: ['math problem solver', 'step by step math ai', 'calculus solver', 'algebra solver', 'word problem solver'],
    metaTitle: 'AI Step-by-Step Math & Logic Solver - Detailed Derivations',
    metaDescription: 'Solve complex math equations, calculus integrals, geometry proofs, and word problems with clear step-by-step logic.',
    intro: 'Demystify mathematics. Get clear, step-by-step derivations, verified proofs, and alternative shortcuts for algebra, calculus, and logic puzzles.',
    howTo: [
      'Type or paste your math equation or word problem.',
      'Select difficulty or subject level (Algebra, Calculus, Statistics, etc.).',
      'Click Solve Math Problem to stream the step-by-step derivation.'
    ],
    faq: [
      { q: 'Does it support word problems?', a: 'Yes! It translates complex natural language word problems into algebraic equations and solves them step-by-step.' }
    ],
    Component: AiMathProblemSolver
  },
  {
    slug: 'ai-quiz-flashcard-maker',
    name: 'AI Quiz & Flashcard Generator',
    category: 'AI',
    icon: GraduationCap,
    keywords: ['quiz generator', 'flashcard maker ai', 'test prep ai', 'multiple choice maker', 'study card generator'],
    metaTitle: 'AI Quiz & Flashcard Generator - Instant Test Prep & Study Aids',
    metaDescription: 'Transform study notes and textbook passages into multiple-choice quizzes, flashcards, and summary study sheets.',
    intro: 'Accelerate your learning. Turn any study topic or pasted text into interactive 4-choice questions, concept flashcards, and key takeaways.',
    howTo: [
      'Enter your study topic or paste a lecture transcript/article.',
      'Select number of questions and difficulty level.',
      'Click Generate Quiz & Flashcards to create your custom study set.'
    ],
    faq: [
      { q: 'Are correct answers explained?', a: 'Yes, each question includes the correct answer along with an explanation of why other choices are incorrect.' }
    ],
    Component: AiQuizFlashcardMaker
  },
  {
    slug: 'ai-brand-startup-namer',
    name: 'AI Startup & Brand Namer',
    category: 'AI',
    icon: Globe2,
    keywords: ['startup name generator', 'brand name generator', 'company name ideas', 'domain name generator', 'slogan generator'],
    metaTitle: 'AI Startup & Brand Name Generator - Catchy Names & Slogans',
    metaDescription: 'Generate 15+ modern brandable company names, domain extension ideas, and catchy taglines for your next project.',
    intro: 'Find the perfect identity for your venture. Brainstorm punchy, pronounceable brand names, available domain ideas, and viral taglines.',
    howTo: [
      'Describe your startup or project idea.',
      'Select naming vibe (Modern SaaS, Short 4-Letter, Playful, or Elite).',
      'Click Generate Startup Names to view candidate names with slogans.'
    ],
    faq: [
      { q: 'Does it provide domain extension suggestions?', a: 'Yes, it provides .com, .io, .ai, and .app domain candidate pairs for each name.' }
    ],
    Component: AiDomainStartupNamer
  },
  {
    slug: 'ai-recipe-meal-planner',
    name: 'AI Recipe & Meal Planner',
    category: 'AI',
    icon: Utensils,
    keywords: ['recipe generator ai', 'meal planner ai', 'fridge leftover recipe', 'macro meal planner', 'custom cooking ai'],
    metaTitle: 'AI Recipe & Meal Planner - Gourmet Meals from Leftover Ingredients',
    metaDescription: 'Turn whatever is in your fridge into gourmet, macro-balanced recipes with precise cooking steps and nutrition info.',
    intro: 'Cook delicious meals without grocery runs. Input the ingredients in your pantry to generate customized recipes with macro estimates and chef tips.',
    howTo: [
      'List whatever ingredients you have in your fridge/pantry.',
      'Select dietary goal (High Protein, Keto, Vegetarian, Vegan).',
      'Click Generate Recipe & Macros to receive cooking steps and nutrition facts.'
    ],
    faq: [
      { q: 'Does it calculate calories and macros?', a: 'Yes, it provides estimated protein, carbs, fats, and total calories per serving.' }
    ],
    Component: AiRecipeMealPlanner
  },
  {
    slug: 'ai-contract-legal-explainer',
    name: 'AI Legal & Contract Explainer',
    category: 'AI',
    icon: Scale,
    keywords: ['legal document explainer', 'contract summary ai', 'terms of service simplifier', 'nda reader ai', 'contract red flags'],
    metaTitle: 'AI Legal Contract & Terms Explainer - Spot Hidden Red Flags',
    metaDescription: 'Translate complex legalese into plain English. Detect arbitration clauses, auto-renewals, and liability risks instantly.',
    intro: 'Never sign blind agreements again. Audit Terms of Service, client contracts, and NDAs to uncover hidden red flags, IP clauses, and termination terms.',
    howTo: [
      'Paste the text of the legal contract or Terms of Service.',
      'Select document type (Terms of Service, Freelance Contract, NDA).',
      'Click Explain in Plain English to receive risk ratings and summary clauses.'
    ],
    faq: [
      { q: 'Is this legal advice?', a: 'No, this tool provides informational plain-English summaries and highlights common risk clauses to assist in your review.' }
    ],
    Component: AiContractLegalExplainer
  },
  {
    slug: 'pdf-merge',
    name: 'PDF Merger',
    category: 'PDF',
    icon: Merge,
    keywords: ['pdf merge', 'combine pdfs', 'join pdf', 'merge pdf files', 'pdf joiner'],
    metaTitle: 'PDF Merger - Combine Multiple PDF Files Online',
    metaDescription: 'Combine multiple PDF files into a single organized PDF document quickly and securely in your browser.',
    intro: 'Combine multiple PDF documents into a single document in any custom order. 100% private, browser-based PDF merging with zero server uploads.',
    howTo: [
      'Click or drag & drop two or more PDF files into the uploader.',
      'Reorder the files using the move up and move down buttons.',
      'Click "Merge PDFs into Single Document" and download your combined PDF.'
    ],
    faq: [
      { q: 'Is there a limit on the number of PDF files I can merge?', a: 'No, you can merge as many PDF files as your web browser memory supports.' },
      { q: 'Are my PDF files kept private?', a: 'Yes! All merging is done locally in your browser memory.' }
    ],
    Component: PdfMergerTool
  },
  {
    slug: 'pdf-split',
    name: 'PDF Splitter & Page Extractor',
    category: 'PDF',
    icon: Scissors,
    keywords: ['pdf split', 'extract pdf pages', 'split pdf', 'separate pdf pages', 'pdf range extractor'],
    metaTitle: 'PDF Splitter & Page Extractor - Split PDF Pages Online',
    metaDescription: 'Split a PDF document into separate page files or extract specific page ranges quickly and securely.',
    intro: 'Separate a PDF into individual page files or extract custom page ranges (e.g. 1-3, 5) instantly with local processing.',
    howTo: [
      'Upload the PDF file you wish to split.',
      'Select whether to extract all pages into individual files or specify a page range (e.g. 1-3, 5).',
      'Click Extract/Split to generate and download the output PDF files.'
    ],
    faq: [
      { q: 'Can I extract non-consecutive pages?', a: 'Yes! Enter comma-separated ranges like "1-3, 5, 8-10" to extract specific pages.' }
    ],
    Component: PdfSplitterTool
  },
  {
    slug: 'pdf-to-text',
    name: 'PDF to Text Extractor',
    category: 'PDF',
    icon: FileCode,
    keywords: ['pdf to text', 'extract text from pdf', 'pdf reader text', 'pdf string parser', 'pdf txt converter'],
    metaTitle: 'PDF to Text Extractor - Convert PDF to Plain Text Online',
    metaDescription: 'Extract raw text and string contents from any PDF file quickly and convert it to readable text or .txt file.',
    intro: 'Extract plain text content from any PDF document without layout image clutter. Download as a text file or copy directly to clipboard.',
    howTo: [
      'Upload a PDF document.',
      'The extractor parses all pages and presents the full plain text.',
      'Copy the text to clipboard or save as a .txt file.'
    ],
    faq: [
      { q: 'Does this work on scanned image PDFs?', a: 'It extracts selectable embedded text. For scanned images without optical text layers, text might be limited.' }
    ],
    Component: PdfToTextTool
  },
  {
    slug: 'text-to-pdf',
    name: 'Text to PDF Generator',
    category: 'PDF',
    icon: FileText,
    keywords: ['text to pdf', 'convert txt to pdf', 'create pdf from text', 'notes to pdf', 'generate pdf text'],
    metaTitle: 'Text to PDF Generator - Convert Plain Text & Notes to PDF',
    metaDescription: 'Convert plain text, notes, or articles into styled A4 PDF documents with custom font sizes.',
    intro: 'Convert notes, plain text, or formatted articles into a clean A4 PDF file with custom font size controls.',
    howTo: [
      'Type or paste your text into the content box.',
      'Adjust font size and specify the output filename.',
      'Click "Generate & Download PDF" to get your styled document.'
    ],
    faq: [
      { q: 'What page format is created?', a: 'Standard A4 document with auto-wrapping margins.' }
    ],
    Component: TextToPdfTool
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Image Converter',
    category: 'PDF',
    icon: ImageIcon,
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'pdf page renderer', 'pdf document images'],
    metaTitle: 'PDF to Image Converter - Convert PDF Pages to PNG/JPG',
    metaDescription: 'Render PDF pages into high-resolution PNG images for easy viewing, sharing, or embedding.',
    intro: 'Convert PDF document pages into crisp PNG images. Render and download individual page snapshots with a single click.',
    howTo: [
      'Upload your PDF file.',
      'All pages will be rendered into image canvases.',
      'Click "Save PNG" on any page snapshot to download it.'
    ],
    faq: [
      { q: 'What image format is produced?', a: 'High-resolution PNG images rendered at 1.5x crisp density.' }
    ],
    Component: PdfToImagesTool
  },
  {
    slug: 'pdf-rotate',
    name: 'PDF Page Rotator & Organizer',
    category: 'PDF',
    icon: RotateCw,
    keywords: ['rotate pdf', 'pdf page rotator', 'turn pdf pages', 'rotate pdf 90 degrees', 'fix upside down pdf'],
    metaTitle: 'PDF Page Rotator - Rotate & Turn PDF Pages Online',
    metaDescription: 'Rotate specific PDF pages or all pages by 90, 180, or 270 degrees and download the updated PDF.',
    intro: 'Fix orientation issues by rotating individual PDF pages or all pages 90°, 180°, or 270° instantly.',
    howTo: [
      'Upload your PDF document.',
      'Click "Rotate 90°" on specific page thumbnails or "Rotate All 90°".',
      'Download your updated PDF with permanent page rotation applied.'
    ],
    faq: [
      { q: 'Is the quality preserved?', a: 'Yes! Page rotation is applied directly to the vector document structure without quality loss.' }
    ],
    Component: PdfRotateTool
  },
  {
    slug: 'pdf-watermark',
    name: 'PDF Watermark & Stamp Utility',
    category: 'PDF',
    icon: ShieldAlert,
    keywords: ['pdf watermark', 'add watermark to pdf', 'pdf stamp', 'confidential watermark pdf', 'draft stamp pdf'],
    metaTitle: 'PDF Watermark & Stamp Utility - Add Text Watermarks to PDF',
    metaDescription: 'Add custom text watermarks, stamps, or security notices across all pages of your PDF document.',
    intro: 'Burn custom security watermarks (e.g. CONFIDENTIAL, DRAFT, DO NOT COPY) across every page of your PDF.',
    howTo: [
      'Upload your PDF document.',
      'Enter custom watermark text and customize transparency opacity and angle.',
      'Click "Apply Watermark to All Pages" and download your protected document.'
    ],
    faq: [
      { q: 'Can I adjust the watermark angle and transparency?', a: 'Yes! Sliders allow precise control over opacity and rotation angle.' }
    ],
    Component: PdfWatermarkTool
  },
  {
    slug: 'qr-code-scanner',
    name: 'QR Code Scanner & Reader',
    category: 'QR & Barcode',
    icon: Scan,
    keywords: ['qr code scanner', 'scan qr code', 'read qr code image', 'qr camera reader', 'detect qr code'],
    metaTitle: 'QR Code Scanner & Reader - Camera & Image Upload',
    metaDescription: 'Scan and decode QR codes instantly from uploaded document images, camera photo captures, or live webcam video feed with contrast auto-enhancement.',
    intro: 'Instantly scan and read QR codes from image files, document screenshots, or direct camera streams. Smart image preprocessing detects QR codes even in text-heavy documents.',
    howTo: [
      'Upload an image file containing a QR code OR switch to Camera mode for direct scanning.',
      'Auto-enhancement contrast filter helps detect QR codes in busy or low quality documents.',
      'View decoded URL, raw payload string, or structured contact data.',
      'Copy the decoded result or open links directly.'
    ],
    faq: [
      { q: 'Can this scan QR codes embedded in documents or screenshots?', a: 'Yes, our smart detection engine handles QR codes anywhere within complex images.' },
      { q: 'Are uploaded images saved on a server?', a: 'No, all image decoding happens 100% locally in your browser.' }
    ],
    Component: QrCodeScanner
  },
  {
    slug: 'barcode-scanner',
    name: 'Barcode Scanner & Reader',
    category: 'QR & Barcode',
    icon: Barcode,
    keywords: ['barcode scanner', 'scan barcode image', 'ean13 scanner', 'upc reader', 'code128 scanner'],
    metaTitle: 'Barcode Scanner & Reader - EAN, UPC, Code 128 Scanner',
    metaDescription: 'Scan and decode 1D and 2D product barcodes (EAN-13, UPC-A, Code 128, Code 39, ITF, DataMatrix) from camera or uploaded photos.',
    intro: 'Decode product barcodes directly from camera photos or uploaded images. Identifies EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, and Data Matrix standards.',
    howTo: [
      'Upload a product image with a barcode OR use your camera.',
      'The engine automatically detects the barcode boundaries and decodes the number.',
      'View the detected barcode standard and raw barcode digits.',
      'Search product info on Google or copy the number with one click.'
    ],
    faq: [
      { q: 'What barcode formats are supported?', a: 'EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, Codabar, PDF417, and DataMatrix.' }
    ],
    Component: BarcodeScanner
  },
  {
    slug: 'color-picker-palette',
    name: 'Color Picker & Palette Generator',
    category: 'Color & Image',
    icon: Palette,
    keywords: ['color picker', 'color palette', 'color harmony', 'hex rgb hsl', 'css variables'],
    metaTitle: 'Color Picker & Palette Generator - Color Harmonies & CSS Vars',
    metaDescription: 'Extract color harmonies, complementary colors, RGB/HSL values, and generated CSS custom properties.',
    intro: 'Design harmonious color schemes. Pick primary colors, explore complementary, analog, and triadic harmonies, and export ready-to-use CSS custom properties.',
    howTo: [
      'Pick a color using the visual color picker or enter a HEX code.',
      'Explore automatically calculated complementary and triadic color palettes.',
      'Click any color swatch to copy its HEX code instantly.',
      'Copy generated CSS custom properties for your stylesheet.'
    ],
    faq: [
      { q: 'Does it calculate HSL and RGB values?', a: 'Yes, HEX, RGB, and HSL formats are calculated simultaneously.' }
    ],
    Component: ColorPickerPalette
  },
  {
    slug: 'css-box-shadow-generator',
    name: 'CSS Box Shadow Generator',
    category: 'Color & Image',
    icon: Box,
    keywords: ['css box shadow', 'shadow generator', 'box shadow css', 'drop shadow designer'],
    metaTitle: 'CSS Box Shadow Generator - Custom Shadows & Live Preview',
    metaDescription: 'Design custom CSS box shadows with live visual preview, offsets, blur, spread, opacity, and inset controls.',
    intro: 'Design elegant CSS box shadow effects. Tweak offsets, blur radius, spread, color opacity, and inset modes with live visual preview.',
    howTo: [
      'Adjust horizontal and vertical offsets using slider controls.',
      'Modify blur radius and spread radius for softer or crisp shadow elevation.',
      'Toggle inset shadow mode for sunken input or button states.',
      'Copy generated CSS box-shadow code for your stylesheet.'
    ],
    faq: [
      { q: 'Is the generated CSS compatible with modern browsers?', a: 'Yes, standard CSS box-shadow properties are universally supported.' }
    ],
    Component: CssBoxShadowGenerator
  },
  {
    slug: 'image-resizer-converter',
    name: 'Image Resizer & Format Converter',
    category: 'Color & Image',
    icon: Maximize2,
    keywords: ['image resizer', 'resize photo', 'convert jpg png webp', 'change image dimensions', 'scale image'],
    metaTitle: 'Image Resizer & Format Converter - Resize JPG, PNG, WebP',
    metaDescription: 'Resize image dimensions in pixels, scale aspect ratios, and convert between JPEG, PNG, and WebP formats.',
    intro: 'Instantly resize images and convert file formats directly in your browser. Lock aspect ratios, adjust output quality, and reduce image sizes with high quality HTML5 canvas processing.',
    howTo: [
      'Upload any PNG, JPG, WebP, or GIF image.',
      'Enter custom width and height or select a percentage scaling preset.',
      'Select your desired target format (JPEG, PNG, or WebP) and quality level.',
      'Download the resized and converted image instantly.'
    ],
    faq: [
      { q: 'Are my images uploaded to any server?', a: 'No, all image resizing and format conversion happens locally in your browser.' },
      { q: 'What happens to transparent backgrounds when converting PNG to JPEG?', a: 'Transparent backgrounds are automatically filled with clean white color.' }
    ],
    Component: ImageResizerConverter
  },
  {
    slug: 'image-cropper-ratio',
    name: 'Image Cropper & Aspect Ratio Frame',
    category: 'Color & Image',
    icon: Crop,
    keywords: ['image cropper', 'crop photo', 'aspect ratio frame', 'rotate photo', 'flip image'],
    metaTitle: 'Image Cropper & Aspect Ratio Frame - Crop 1:1, 16:9, 9:16',
    metaDescription: 'Crop images with preset aspect ratios (1:1, 16:9, 4:5, 9:16, 3:2), rotate 90 degrees, and flip horizontally or vertically.',
    intro: 'Crop and frame photos for Instagram, YouTube, TikTok, or web banners. Apply standard aspect ratio presets, rotate, flip, and download cropped PNGs.',
    howTo: [
      'Upload your image.',
      'Choose an aspect ratio preset such as 1:1 Square, 16:9 YouTube, or 9:16 Story.',
      'Rotate 90° or flip horizontally/vertically if needed.',
      'Download your cropped image.'
    ],
    faq: [
      { q: 'What presets are available?', a: 'Square 1:1, Widescreen 16:9, Vertical Story 9:16, Instagram Post 4:5, and Photo 3:2.' }
    ],
    Component: ImageCropperRatio
  },
  {
    slug: 'image-palette-extractor',
    name: 'Image Color Palette & Eyedropper',
    category: 'Color & Image',
    icon: Palette,
    keywords: ['image color palette', 'extract colors from image', 'dominant color picker', 'image eyedropper', 'hex code extractor'],
    metaTitle: 'Image Color Palette & Eyedropper - Extract Dominant Colors',
    metaDescription: 'Extract prominent dominant colors and hex codes from any image or click pixels directly with the eyedropper.',
    intro: 'Extract beautiful color schemes from photos and graphics. Automatically detects dominant hex codes, RGB values, percentage distribution, and exports CSS custom properties.',
    howTo: [
      'Upload any photo or illustration.',
      'View automatically extracted dominant color swatches with percentage breakdowns.',
      'Click anywhere on the uploaded image to pick exact pixel colors with the eyedropper.',
      'Copy HEX codes or export all colors as CSS variables.'
    ],
    faq: [
      { q: 'Can I click specific pixels to get exact colors?', a: 'Yes, clicking anywhere on the source image retrieves the exact pixel HEX color.' }
    ],
    Component: ImagePaletteExtractor
  },
  {
    slug: 'image-filters-adjuster',
    name: 'Image Filters & Photo Studio',
    category: 'Color & Image',
    icon: Sliders,
    keywords: ['photo filters', 'image adjustments', 'brightness contrast', 'vintage photo filter', 'cyberpunk filter'],
    metaTitle: 'Image Filters & Photo Studio - Vintage, Cyberpunk, Film Noir',
    metaDescription: 'Adjust photo brightness, contrast, saturation, blur, sepia, grayscale, and apply cinematic style presets.',
    intro: 'Transform photos with browser-based photo studio adjustments. Tweak exposure controls, apply vintage, cyberpunk, or film noir presets, and download edited photos.',
    howTo: [
      'Upload your photo.',
      'Select a cinematic preset or manually adjust brightness, contrast, saturation, blur, and sepia.',
      'Preview real-time canvas edits.',
      'Download high-resolution edited JPEG.'
    ],
    faq: [
      { q: 'Does this preserve image quality?', a: 'Yes, images are processed at native resolution using canvas filtering.' }
    ],
    Component: ImageFiltersAdjuster
  },
  {
    slug: 'image-watermark-adder',
    name: 'Image Watermark & Stamp Adder',
    category: 'Color & Image',
    icon: Stamp,
    keywords: ['add watermark', 'watermark image', 'copyright stamp', 'photo protection', 'tiled watermark'],
    metaTitle: 'Image Watermark & Stamp Adder - Protect Photos with Text',
    metaDescription: 'Add customizable text watermarks, copyright stamps, opacity, rotation, and tiled patterns to protect images.',
    intro: 'Protect your creative work and photos with text watermarks and copyright stamps. Customize font size, color opacity, angle, and tiled repetition layouts.',
    howTo: [
      'Upload the target image.',
      'Enter your copyright or brand name watermark text.',
      'Adjust text placement (Center, Bottom Right, or Tiled Pattern), rotation angle, and opacity.',
      'Download watermarked image.'
    ],
    faq: [
      { q: 'Can I create tiled watermarks across the entire photo?', a: 'Yes, select Tiled Pattern layout for repeating background protection.' }
    ],
    Component: ImageWatermarkAdder
  },
  {
    slug: 'color-contrast-wcag-checker',
    name: 'Color Contrast & WCAG Checker',
    category: 'Color & Image',
    icon: Eye,
    keywords: ['color contrast checker', 'wcag accessibility', 'contrast ratio', 'accessible color pair', 'aa aaa compliance'],
    metaTitle: 'Color Contrast & WCAG Checker - Test AA & AAA Compliance',
    metaDescription: 'Calculate precise WCAG 2.1 color contrast ratios (e.g. 4.5:1, 7:1) for accessible text and UI components.',
    intro: 'Ensure your design meets WCAG 2.1 accessibility guidelines. Test foreground and background color combinations for AA and AAA compliance with live UI previews.',
    howTo: [
      'Select or type foreground (text) and background HEX colors.',
      'Review calculated contrast ratio (e.g., 4.5:1, 7:1).',
      'Check pass/fail indicators for AA Normal, AA Large, AAA Normal, and AAA Large text.',
      'Preview live UI mockup elements.'
    ],
    faq: [
      { q: 'What is the minimum contrast ratio for standard text?', a: 'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal body text.' }
    ],
    Component: ColorContrastWcagChecker
  },
  {
    slug: 'svg-to-css-data-uri',
    name: 'SVG to Data URI & CSS Converter',
    category: 'Color & Image',
    icon: FileCode,
    keywords: ['svg to data uri', 'svg to css background', 'encode svg', 'inline svg to dataurl', 'svg string converter'],
    metaTitle: 'SVG to Data URI & CSS Converter - Clean Data URLs',
    metaDescription: 'Convert inline SVG markup into clean, URL-encoded Data URIs and CSS background-image rules.',
    intro: 'Encode raw SVG code into compact Data URIs for CSS stylesheets and HTML image tags without base64 overhead.',
    howTo: [
      'Paste raw <svg> markup into the input field.',
      'View real-time rendered SVG preview.',
      'Copy generated CSS background-image property or raw Data URI.'
    ],
    faq: [
      { q: 'Why use UTF-8 URL encoding instead of Base64 for SVGs?', a: 'URL encoding is smaller, faster to render, and easily editable in CSS files.' }
    ],
    Component: SvgToCssDataUriConverter
  },
  {
    slug: 'color-gradient-mesh-generator',
    name: 'Color Gradient Mesh & CSS Generator',
    category: 'Color & Image',
    icon: Sparkles,
    keywords: ['css gradient generator', 'linear radial conic gradient', 'gradient mesh', 'css background generator', 'color blend'],
    metaTitle: 'Color Gradient Mesh & CSS Generator - Linear, Radial & Conic',
    metaDescription: 'Design linear, radial, and conic CSS background gradients with customizable color stops and angle controls.',
    intro: 'Design rich CSS background gradients visually. Switch between linear, radial, and conic modes, customize color stops, adjust angles, and copy CSS code.',
    howTo: [
      'Choose gradient mode (Linear, Radial, or Conic).',
      'Select 3 custom color nodes using visual color pickers.',
      'Adjust gradient direction angle slider.',
      'Copy the generated CSS background snippet.'
    ],
    faq: [
      { q: 'Is the CSS background cross-browser compatible?', a: 'Yes, modern standard CSS gradient syntax is supported across all browsers.' }
    ],
    Component: ColorGradientMeshGenerator
  },
  {
    slug: 'color-blindness-simulator',
    name: 'Color Blindness & Vision Simulator',
    category: 'Color & Image',
    icon: Eye,
    keywords: ['color blindness simulator', 'protanopia test', 'deuteranopia simulator', 'tritanopia filter', 'accessible graphic design'],
    metaTitle: 'Color Blindness Simulator - Protanopia, Deuteranopia & Tritanopia',
    metaDescription: 'Simulate how graphics and photos appear to individuals with Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.',
    intro: 'Simulate color vision deficiencies on your uploaded photos and web graphics to ensure accessible visual design for all users.',
    howTo: [
      'Upload a design or screenshot.',
      'Select vision deficiency mode (Protanopia, Deuteranopia, Tritanopia, or Achromatopsia).',
      'Inspect simulated visual results to verify color distinction.'
    ],
    faq: [
      { q: 'Why is color blindness simulation important in UI design?', a: 'It helps ensure users who cannot distinguish red/green or blue/yellow can still navigate your interface.' }
    ],
    Component: ColorBlindnessSimulator
  },
  {
    slug: 'image-anonymizer-blur',
    name: 'Image Blur & Pixelate Anonymizer',
    category: 'Color & Image',
    icon: EyeOff,
    keywords: ['blur image', 'pixelate photo', 'anonymize photo', 'obfuscate text image', 'censor screenshot'],
    metaTitle: 'Image Blur & Pixelate Anonymizer - Protect Private Info',
    metaDescription: 'Blur or pixelate photos and screenshots to anonymize sensitive text, faces, credentials, or personal info.',
    intro: 'Obfuscate sensitive screenshots, personal details, faces, and credentials with pixelation or Gaussian blur effects before sharing online.',
    howTo: [
      'Upload screenshot or document photo.',
      'Select effect style (Pixelate or Gaussian Blur).',
      'Adjust intensity slider to control obfuscation strength.',
      'Download anonymized image.'
    ],
    faq: [
      { q: 'Can anonymized images be reversed back?', a: 'No, pixelation and blur irrevocably destroy pixel information in the output file.' }
    ],
    Component: ImageAnonymizerBlur
  },
  {
    slug: 'json-to-typescript',
    name: 'JSON to TypeScript Interface Generator',
    category: 'Developer',
    icon: Code,
    keywords: ['json to typescript', 'ts interface generator', 'type generator', 'json to ts'],
    metaTitle: 'JSON to TypeScript Interface Generator - Strongly Typed TS',
    metaDescription: 'Convert raw JSON objects into clean, strongly typed TypeScript interfaces with optional nested types.',
    intro: 'Instantly generate clean TypeScript interface declarations from raw JSON responses. Handles nested objects, primitive arrays, and custom type naming.',
    howTo: [
      'Paste raw JSON object or API response.',
      'Provide a root interface name.',
      'Copy the formatted TypeScript interface code for your codebase.'
    ],
    faq: [
      { q: 'Does it support nested objects?', a: 'Yes, nested objects are converted into clean TypeScript interface properties.' }
    ],
    Component: JsonToTypescript
  },
  {
    slug: 'cron-schedule-humanizer',
    name: 'Cron Schedule Humanizer',
    category: 'Developer',
    icon: Clock,
    keywords: ['cron humanizer', 'cron to natural text', 'cron schedule reader', 'crontab explain'],
    metaTitle: 'Cron Schedule Humanizer - Plain English Schedule Translator',
    metaDescription: 'Translate cryptic 5-field cron schedule expressions into natural, easy-to-understand English sentences.',
    intro: 'Translate raw cron schedule expressions into human-readable plain English descriptions so you can verify schedule timings instantly.',
    howTo: [
      'Enter any standard 5-field cron expression.',
      'View immediate natural language translation.',
      'Check schedule breakdown across minute, hour, day, and weekday dimensions.'
    ],
    faq: [
      { q: 'Does it support standard 5-field crontabs?', a: 'Yes, minute, hour, day of month, month, and day of week fields are decoded.' }
    ],
    Component: UnixCronHumanizer
  },
  {
    slug: 'svg-optimizer',
    name: 'SVG Code Optimizer & Cleaner',
    category: 'Developer',
    icon: FileCode,
    keywords: ['svg optimizer', 'clean svg', 'minify svg', 'compress svg code'],
    metaTitle: 'SVG Code Optimizer - Clean & Minify Vector Markup',
    metaDescription: 'Remove comments, editor tags, and extra whitespace from inline SVG code to reduce payload size.',
    intro: 'Clean up inline SVG code exported from Illustrator or Figma. Removes comments, redundant attributes, and whitespace to shrink SVG file sizes.',
    howTo: [
      'Paste raw SVG code into the input field.',
      'The tool strips XML comments, unnecessary group IDs, and extra spacing.',
      'Compare byte savings percentage and copy optimized SVG code.'
    ],
    faq: [
      { q: 'Will optimizing break visual rendering?', a: 'No, visual rendering tags and coordinates remain completely intact.' }
    ],
    Component: SvgOptimizer
  },
  {
    slug: 'jwt-generator',
    name: 'JWT Token Generator & Tester',
    category: 'Developer',
    icon: KeyRound,
    keywords: ['jwt generator', 'jwt token creator', 'jwt secret tester', 'jwt encoder'],
    metaTitle: 'JWT Token Generator & Tester - Test JSON Web Tokens',
    metaDescription: 'Create custom JWT tokens with custom header, claims payload, and secret key for development testing.',
    intro: 'Generate and sign standard JSON Web Tokens (JWT) for authentication testing. Customize payload claims, subject, and secret keys.',
    howTo: [
      'Edit the JSON payload claims (user ID, roles, expiration).',
      'Enter a secret key for HS256 signature calculation.',
      'Copy the three-part Base64URL encoded JWT token string.'
    ],
    faq: [
      { q: 'Are these tokens safe for development testing?', a: 'Yes, tokens are generated locally in your browser session.' }
    ],
    Component: JwtGeneratorTester
  },
  {
    slug: 'discount-tax-calculator',
    name: 'Discount & Sales Tax Calculator',
    category: 'Calculators',
    icon: Calculator,
    keywords: ['discount calculator', 'sales tax calculator', 'vat calculator', 'final price calculator'],
    metaTitle: 'Discount & Sales Tax Calculator - Final Sale Price',
    metaDescription: 'Calculate final prices after applying percentage discounts and sales tax / VAT additions.',
    intro: 'Calculate exact savings and final cost for discounted products with applicable sales tax or VAT.',
    howTo: [
      'Enter original item price.',
      'Input discount percentage and sales tax percentage.',
      'View discount savings amount, tax amount, and final total.'
    ],
    faq: [
      { q: 'Does tax apply before or after discount?', a: 'Tax is accurately calculated on the discounted net subtotal.' }
    ],
    Component: DiscountTaxCalculator
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI & Metabolic Health Calculator',
    category: 'Calculators',
    icon: Activity,
    keywords: ['bmi calculator', 'bmr calculator', 'ideal body weight', 'calorie intake'],
    metaTitle: 'BMI & Health Metrics Calculator - BMI & Maintenance Calories',
    metaDescription: 'Calculate Body Mass Index (BMI), weight categories, Basal Metabolic Rate (BMR), and daily calorie needs.',
    intro: 'Check your Body Mass Index (BMI) and Basal Metabolic Rate (BMR). Understand daily calorie requirements based on age, gender, and weight.',
    howTo: [
      'Enter weight in kg and height in cm.',
      'Input age and select gender.',
      'View BMI classification, resting BMR, and recommended daily maintenance calorie target.'
    ],
    faq: [
      { q: 'What is BMR?', a: 'Basal Metabolic Rate is the number of calories your body burns at complete rest to maintain vital functions.' }
    ],
    Component: BmiCalorieCalculator
  },
  {
    slug: 'text-case-cleaner-pro',
    name: 'Text Case Converter Pro & Cleaner',
    category: 'Text',
    icon: Type,
    keywords: ['text cleaner', 'camelcase converter', 'snakecase', 'remove emojis', 'strip accents'],
    metaTitle: 'Text Case Converter Pro & Cleaner - Advanced Text Formatting',
    metaDescription: 'Transform text to camelCase, snake_case, kebab-case, strip emojis, and remove accent marks.',
    intro: 'Advanced code-friendly text transformations. Switch between camelCase, snake_case, kebab-case, remove special accents, and strip emojis.',
    howTo: [
      'Paste your string or paragraph into the editor.',
      'Click camelCase, snake_case, or kebab-case transform buttons.',
      'Use Strip Accents or Remove Emojis for quick text normalization.'
    ],
    faq: [
      { q: 'Is it useful for programming variable naming?', a: 'Yes, it rapidly converts natural text into clean variable and database column names.' }
    ],
    Component: TextCleanerPro
  },
  {
    slug: 'domain-ip-lookup',
    name: 'IP & Client Network Inspector',
    category: 'Developer',
    icon: Globe,
    keywords: ['ip lookup', 'client network info', 'user agent checker', 'ip validator'],
    metaTitle: 'IP & Client Network Inspector - Network Diagnostics',
    metaDescription: 'Validate IPv4 addresses, inspect user agent strings, and review client screen & network details.',
    intro: 'Inspect client network environment details, validate IPv4 address formats, check user agent string details, and screen metrics.',
    howTo: [
      'Enter an IPv4 address to validate format.',
      'View client user agent, screen resolution, and browser language settings.'
    ],
    faq: [
      { q: 'Is any network data transmitted off-device?', a: 'No, validation and environment checks run entirely inside your browser.' }
    ],
    Component: DomainIpLookup
  },
  {
    slug: 'cron-generator',
    name: 'Cron Expression Generator',
    category: 'Generators',
    icon: Clock,
    keywords: ['cron generator', 'cron expression', 'crontab', 'cron schedule'],
    metaTitle: 'Cron Expression Generator - Visual Schedule Builder',
    metaDescription: 'Generate and translate cron schedule expressions with human-readable descriptions.',
    intro: 'Easily build and test cron expressions for crontab, GitHub Actions, AWS EventBridge, and automated job schedulers. Visual selection allows instant conversion to human-readable format.',
    howTo: [
      'Select a common preset or customize schedule fields.',
      'Adjust minute, hour, day, month, and day-of-week inputs.',
      'View the generated 5-part cron syntax.',
      'Copy the expression for your server configuration.'
    ],
    faq: [
      { q: 'What is a cron expression?', a: 'A cron expression is a string comprising 5 or 6 fields that represent a set of times to execute a command or job.' },
      { q: 'Where can I use this expression?', a: 'You can use it in Linux crontab files, Kubernetes CronJobs, AWS EventBridge, and CI/CD pipelines.' }
    ],
    Component: CronGenerator
  },
  {
    slug: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    category: 'Generators',
    icon: Palette,
    keywords: ['css gradient', 'gradient generator', 'linear gradient', 'radial gradient'],
    metaTitle: 'CSS Gradient Generator - Interactive Color Blends',
    metaDescription: 'Create custom linear, radial, and conic CSS gradients with live preview and instant CSS code output.',
    intro: 'Design rich CSS gradients visually. Choose linear, radial, or conic gradients, adjust angles, set custom color stops, and preview your designs live.',
    howTo: [
      'Select the gradient type (linear, radial, or conic).',
      'Pick primary and secondary colors using the color pickers.',
      'Adjust the gradient angle slider.',
      'Copy the generated CSS background rule.'
    ],
    faq: [
      { q: 'Does this code work across all modern browsers?', a: 'Yes, standard CSS gradient syntax is supported across all modern web browsers.' }
    ],
    Component: CssGradientGenerator
  },
  {
    slug: 'placeholder-image-generator',
    name: 'Placeholder Image Generator',
    category: 'Generators',
    icon: ImageIcon,
    keywords: ['placeholder image', 'dummy image', 'svg placeholder', 'image generator'],
    metaTitle: 'Placeholder Image Generator - Custom Dummy Images',
    metaDescription: 'Create custom dimensions SVG and PNG placeholder images with text labels and custom background colors.',
    intro: 'Generate lightweight SVG and PNG placeholder images for web development and mockups. Customize exact dimensions, background colors, text labels, and download instantly.',
    howTo: [
      'Enter the target width and height in pixels.',
      'Customize background and text colors.',
      'Add custom overlay text if desired.',
      'Copy the Data URL, HTML tag, or download as PNG.'
    ],
    faq: [
      { q: 'Can I use these images for commercial projects?', a: 'Yes, generated placeholders are completely free to use anywhere.' }
    ],
    Component: PlaceholderImageGenerator
  },
  {
    slug: 'mock-data-generator',
    name: 'Mock Data Generator',
    category: 'Generators',
    icon: FileText,
    keywords: ['mock data', 'dummy json', 'sample data', 'test data generator'],
    metaTitle: 'Mock Data Generator - Fake JSON & CSV Datasets',
    metaDescription: 'Generate realistic mock datasets (names, emails, dates, cities, salaries) in JSON or CSV format.',
    intro: 'Generate mock datasets for software testing, database seeding, and frontend prototyping. Supports customizable row counts and instant JSON/CSV exports.',
    howTo: [
      'Select the number of rows to generate.',
      'Choose between JSON Array and CSV output format.',
      'Click Regenerate to refresh randomized data.',
      'Copy or download the output for your application.'
    ],
    faq: [
      { q: 'Is the generated data realistic?', a: 'Yes, field values are randomized using realistic name lists, emails, cities, and numbers.' }
    ],
    Component: MockDataGenerator
  },
  {
    slug: 'sql-insert-generator',
    name: 'SQL Seed Data Generator',
    category: 'Generators',
    icon: Database,
    keywords: ['sql generator', 'insert statement', 'sql seed data', 'database dummy data'],
    metaTitle: 'SQL Seed Data Generator - Generate INSERT Queries',
    metaDescription: 'Create formatted SQL INSERT INTO statements for database testing and initial database seeding.',
    intro: 'Generate structured SQL INSERT INTO statements for relational databases like PostgreSQL, MySQL, and SQLite. Ideal for fast database populating during development.',
    howTo: [
      'Specify the target database table name.',
      'Set the desired number of SQL INSERT records.',
      'Click Generate SQL to produce formatted queries.',
      'Copy the generated SQL script into your database client.'
    ],
    faq: [
      { q: 'Which SQL dialects are supported?', a: 'The generated INSERT syntax is standard SQL compatible with MySQL, PostgreSQL, SQLite, and SQL Server.' }
    ],
    Component: SqlInsertGenerator
  },
  {
    slug: 'id-generator-suite',
    name: 'UUID & Unique ID Suite',
    category: 'Generators',
    icon: Fingerprint,
    keywords: ['uuid generator', 'ulid generator', 'nanoid', 'cuid', 'unique id'],
    metaTitle: 'UUID & Unique ID Suite - Multi-Standard ID Generator',
    metaDescription: 'Generate batch unique identifiers including UUID v4, ULID, NanoID, and CUID style keys.',
    intro: 'Generate batches of unique identifiers across multiple modern standards. Supports UUID v4, ULID, NanoID, and CUID keys with one-click bulk copy.',
    howTo: [
      'Select the identifier standard (UUID v4, ULID, NanoID, or CUID).',
      'Choose the batch size.',
      'Click Generate New IDs.',
      'Copy the list of unique IDs.'
    ],
    faq: [
      { q: 'Are UUIDs guaranteed to be unique?', a: 'UUID v4 uses cryptographically secure random numbers with a negligible probability of collision.' }
    ],
    Component: IdGeneratorSuite
  },
  {
    slug: 'secret-key-generator',
    name: 'API Key & Secret Generator',
    category: 'Generators',
    icon: ShieldX,
    keywords: ['secret key', 'api key generator', 'jwt secret', 'bearer token'],
    metaTitle: 'API Key & Secret Generator - Secure Tokens',
    metaDescription: 'Generate high-entropy cryptographically secure API keys, secret tokens, and hex strings.',
    intro: 'Create high-entropy secret keys and tokens for API authentication, session signing, and environment variables. Powered by Web Crypto API for maximum security.',
    howTo: [
      'Enter an optional key prefix (e.g. sk_live_).',
      'Select byte length and encoding format (Hex, Base64, Alphanumeric).',
      'Click Generate Secret Key.',
      'Copy the generated secret.'
    ],
    faq: [
      { q: 'Is my secret key generated safely?', a: 'Yes, all keys are generated locally in your browser using the Web Crypto API and never sent to any server.' }
    ],
    Component: SecretKeyGenerator
  },
  {
    slug: 'advanced-slug-generator',
    name: 'Advanced URL Slug Generator',
    category: 'Generators',
    icon: Link,
    keywords: ['slug generator', 'url slug', 'seo slug', 'permalink creator'],
    metaTitle: 'Advanced URL Slug Generator - Clean Permalinks',
    metaDescription: 'Convert any article title or text into clean, SEO-friendly URL slugs with custom separators and stop-word filters.',
    intro: 'Transform headlines and article titles into clean, search-engine-optimized URL permalinks. Strip accents, special characters, and common stop words.',
    howTo: [
      'Type or paste your title or headline.',
      'Select separator type (hyphen, underscore, dot).',
      'Toggle lowercase and stop word removal options.',
      'Copy the clean URL slug.'
    ],
    faq: [
      { q: 'Why should I remove stop words?', a: 'Removing stop words like "a", "the", and "and" creates shorter, more focused URL slugs for SEO.' }
    ],
    Component: AdvancedSlugGenerator
  },
  {
    slug: 'favicon-manifest-generator',
    name: 'Web App Manifest & Favicon Generator',
    category: 'Generators',
    icon: Code,
    keywords: ['webmanifest generator', 'pwa manifest', 'favicon meta tags'],
    metaTitle: 'Web App Manifest & Favicon Generator - PWA Config',
    metaDescription: 'Generate site.webmanifest JSON files and HTML favicon meta tags for web apps and PWAs.',
    intro: 'Generate complete web app manifests and HTML meta tags required for Progressive Web Apps (PWAs) and modern mobile browser bookmarks.',
    howTo: [
      'Fill in application name, short name, and start URL.',
      'Select theme and background colors.',
      'Choose the app display mode.',
      'Copy the generated site.webmanifest JSON and HTML head tags.'
    ],
    faq: [
      { q: 'Where do I put site.webmanifest?', a: 'Place site.webmanifest in your web root directory and reference it in your HTML <head>.' }
    ],
    Component: FaviconManifestGenerator
  },
  {
    slug: 'bcrypt-hash-generator',
    name: 'Bcrypt & Secure Hash Generator',
    category: 'Generators',
    icon: KeyRound,
    keywords: ['bcrypt generator', 'password hash', 'pbkdf2 hash', 'salt hash'],
    metaTitle: 'Bcrypt & Secure Hash Generator - Password Hashes',
    metaDescription: 'Generate secure salted password hashes with customizable cost rounds directly in your browser.',
    intro: 'Generate cryptographically secure salted hashes for passwords using PBKDF2 and SHA-256 with customizable cost rounds. Runs 100% locally in browser.',
    howTo: [
      'Enter a password or plain text string.',
      'Select the cost rounds slider.',
      'Click Compute Secure Hash.',
      'Copy the generated hash string.'
    ],
    faq: [
      { q: 'Are my passwords sent to a server?', a: 'No, all hashing operations are processed locally in your browser.' }
    ],
    Component: BcryptHashGenerator
  },

  {
    slug: 'temperature-converter',
    name: 'Temperature Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin'],
    metaTitle: 'Temperature Converter',
    metaDescription: 'Convert between Celsius, Fahrenheit, and Kelvin.',
    intro: 'Instantly convert temperature values between Celsius, Fahrenheit, and Kelvin.',
    howTo: ['Enter the value.', 'Select the units.', 'See the result.'],
    faq: [],
    Component: TemperatureConverter
  },
  {
    slug: 'length-converter',
    name: 'Length Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['length', 'meters', 'feet', 'inches'],
    metaTitle: 'Length Converter',
    metaDescription: 'Convert length between various units.',
    intro: 'Quickly convert between meters, feet, inches, kilometers, miles, and more.',
    howTo: ['Enter the length.', 'Select source and target units.', 'View the converted length.'],
    faq: [],
    Component: LengthConverter
  },
  {
    slug: 'weight-converter',
    name: 'Weight Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['weight', 'kg', 'pounds', 'lbs'],
    metaTitle: 'Weight Converter',
    metaDescription: 'Convert weight between various units.',
    intro: 'Quickly convert between kilograms, pounds, ounces, grams, and more.',
    howTo: ['Enter the weight.', 'Select source and target units.', 'View the converted weight.'],
    faq: [],
    Component: WeightConverter
  },
  {
    slug: 'volume-converter',
    name: 'Volume Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['volume', 'liters', 'gallons'],
    metaTitle: 'Volume Converter',
    metaDescription: 'Convert volume between various units.',
    intro: 'Quickly convert between liters, gallons, milliliters, and more.',
    howTo: ['Enter the volume.', 'Select source and target units.', 'View the converted volume.'],
    faq: [],
    Component: VolumeConverter
  },
  {
    slug: 'data-storage-converter',
    name: 'Data Storage Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['data storage', 'bytes', 'mb', 'gb', 'tb'],
    metaTitle: 'Data Storage Converter',
    metaDescription: 'Convert digital data storage sizes.',
    intro: 'Convert between bytes, kilobytes, megabytes, gigabytes, and terabytes.',
    howTo: ['Enter the value.', 'Select source and target units.', 'View the converted size.'],
    faq: [],
    Component: DataStorageConverter
  },
  {
    slug: 'angle-converter',
    name: 'Angle Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['angle', 'degrees', 'radians'],
    metaTitle: 'Angle Converter',
    metaDescription: 'Convert between degrees, radians, and gradians.',
    intro: 'Quickly convert angle measurements between different units.',
    howTo: ['Enter the angle.', 'Select source and target units.', 'View the converted angle.'],
    faq: [],
    Component: AngleConverter
  },
  {
    slug: 'rot13-converter',
    name: 'ROT13 Converter',
    category: 'Converters',
    icon: Replace,
    keywords: ['rot13', 'cipher', 'encode', 'decode'],
    metaTitle: 'ROT13 Converter',
    metaDescription: 'Encode and decode text using ROT13 cipher.',
    intro: 'Quickly apply the ROT13 substitution cipher to your text.',
    howTo: ['Paste your text.', 'View the ROT13 output instantly.'],
    faq: [],
    Component: Rot13Converter
  },
  {
    slug: 'text-to-octal',
    name: 'Text to Octal',
    category: 'Converters',
    icon: Binary,
    keywords: ['text to octal', 'octal encoder'],
    metaTitle: 'Text to Octal Converter',
    metaDescription: 'Convert text to octal values.',
    intro: 'Convert any text string into its octal representation.',
    howTo: ['Paste your text.', 'Copy the generated octal code.'],
    faq: [],
    Component: TextToOctal
  },
  {
    slug: 'octal-to-text',
    name: 'Octal to Text',
    category: 'Converters',
    icon: Binary,
    keywords: ['octal to text', 'octal decoder'],
    metaTitle: 'Octal to Text Converter',
    metaDescription: 'Convert octal values back to text.',
    intro: 'Decode octal values back into readable text.',
    howTo: ['Paste your space-separated octal values.', 'View the decoded text.'],
    faq: [],
    Component: OctalToText
  },
  {
    slug: 'roman-numeral-converter',
    name: 'Roman Numeral Converter',
    category: 'Converters',
    icon: ArrowLeftRight,
    keywords: ['roman numerals', 'numbers to roman'],
    metaTitle: 'Roman Numeral Converter',
    metaDescription: 'Convert between standard numbers and Roman numerals.',
    intro: 'Instantly convert numbers to Roman numerals and vice versa.',
    howTo: ['Select the conversion mode.', 'Enter the number or Roman numeral.', 'View the result.'],
    faq: [],
    Component: RomanNumeralConverter
  }
,
  {
    slug: 'case-converter',
    name: 'Case Converter',
    category: 'Text',
    icon: Type,
    keywords: ['uppercase', 'lowercase', 'title case', 'camel case', 'text format'],
    metaTitle: 'Free Case Converter - Upper, Lower, Camel Case',
    metaDescription: 'Quickly convert text between uppercase, lowercase, title case, camel case, snake case, and kebab case online.',
    intro: 'The Case Converter is a quick and simple online tool that allows you to change the capitalization of your text instantly. Whether you need to convert a block of text to entirely uppercase, lowercase, or format programmer-friendly styles like camelCase, snake_case, and kebab-case, this tool runs entirely in your browser to ensure your data stays private and secure.',
    howTo: [
      'Type or paste your text into the input area.',
      'Select the desired case format from the buttons below the input.',
      'The converted text will instantly appear in the output box.',
      'Click the "Copy" button to copy the result to your clipboard.'
    ],
    faq: [
      { q: 'Is my text sent to a server?', a: 'No, all text processing happens locally in your browser. No data is sent to our servers.' },
      { q: 'What is camelCase?', a: 'camelCase is a naming convention where the first letter is lowercase, and each subsequent word starts with an uppercase letter without spaces (e.g., myVariableName).' }
    ],
    Component: CaseConverter
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'Text',
    icon: FileText,
    keywords: ['word count', 'character count', 'letter counter', 'text statistics'],
    metaTitle: 'Free Word & Character Counter - Online Text Tool',
    metaDescription: 'Instantly count words, characters, lines, and paragraphs in your text. 100% free and processes locally in your browser.',
    intro: 'Need to know exactly how long your essay, tweet, or article is? Our Word Counter provides instant, real-time statistics as you type or paste your text. It accurately counts total words, characters (both with and without spaces), lines, and paragraphs. Best of all, your text is never uploaded to any server.',
    howTo: [
      'Type or paste your text into the large input box.',
      'Watch the statistics update automatically in real-time.',
      'Use the "Clear" button to start over.',
      'Click "Copy" to quickly copy your entire text back to the clipboard.'
    ],
    faq: [
      { q: 'Does it count spaces as characters?', a: 'We provide two metrics: total characters (including spaces) and characters without spaces, so you have exactly the data you need.' },
      { q: 'Is there a word limit?', a: 'No! Because the processing happens locally on your device, you can paste thousands of words without worrying about server limits or timeouts.' }
    ],
    Component: WordCounter
  },
  {
    slug: 'html-viewer-editor',
    name: 'HTML Viewer & Editor',
    category: 'Developer',
    icon: Code,
    keywords: ['html editor', 'html viewer', 'live html', 'code editor'],
    metaTitle: 'Free Live HTML Editor & Viewer',
    metaDescription: 'Write HTML code and see the live preview instantly. A fast, browser-based HTML viewer.',
    intro: 'This HTML Viewer & Editor allows you to write HTML, CSS, and basic JavaScript in the browser and instantly see the rendered output. Perfect for quickly testing UI components, debugging layouts, or prototyping designs locally.',
    howTo: [
      'Type or paste your HTML code in the left editor pane.',
      'The live preview on the right will update automatically as you type.',
      'Use inline CSS or <style> tags to style your HTML.'
    ],
    faq: [],
    Component: HtmlEditor
  },
  {
    slug: 'base64-converter',
    name: 'Base64 Encode/Decode',
    category: 'Developer',
    icon: Code,
    keywords: ['base64 encoder', 'base64 decoder', 'btoa', 'atob', 'encode string'],
    metaTitle: 'Free Base64 Encoder & Decoder - Online Developer Tool',
    metaDescription: 'Instantly encode or decode text using Base64. A secure, browser-based developer utility that keeps your data private.',
    intro: 'Base64 encoding is widely used in web development and data transmission. Our Base64 Converter allows you to instantly encode standard text into Base64 format, or decode a Base64 string back into readable text. Everything runs locally in your browser using native APIs, ensuring sensitive strings remain strictly on your device.',
    howTo: [
      'Select whether you want to Encode or Decode using the toggle buttons.',
      'Paste your text or Base64 string into the input box.',
      'The converted result will appear instantly in the output box below.',
      'Click the copy icon to copy the result to your clipboard.'
    ],
    faq: [
      { q: 'Is it safe to decode sensitive tokens here?', a: 'Yes. The conversion uses the browser\'s native `btoa` and `atob` functions. Data is never transmitted over the network.' },
      { q: 'Why do I get an error when decoding?', a: 'This usually happens if the input string is not valid Base64 or contains characters outside the Base64 alphabet.' }
    ],
    Component: Base64Converter
  },
  {
    slug: 'number-base-converter',
    name: 'Number Base Converter',
    category: 'Converters',
    icon: Binary,
    keywords: ['hex converter', 'binary to decimal', 'octal', 'hexadecimal', 'base converter'],
    metaTitle: 'Number Base Converter - Hex, Binary, Decimal, Octal',
    metaDescription: 'Convert numbers instantly between Decimal, Hexadecimal, Binary, and Octal bases. Free online utility.',
    intro: 'Whether you are reverse engineering, programming, or just studying computer science, our Number Base Converter makes it effortless to translate values between numeral systems. Enter a number in Decimal (Base 10), Binary (Base 2), Hexadecimal (Base 16), or Octal (Base 8), and watch all other fields update simultaneously in real-time.',
    howTo: [
      'Find the input field corresponding to the base of your starting number.',
      'Type or paste your number into that specific field.',
      'All other fields (Binary, Hex, Octal, Decimal) will update automatically.',
      'Use the copy button next to any field to grab the converted value.'
    ],
    faq: [
      { q: 'What happens if I type an invalid character?', a: 'The tool automatically strips out characters that are invalid for the specific base (e.g., typing a "9" in the octal field will be ignored).' },
      { q: 'Is there a limit to how large the number can be?', a: 'Yes, because it uses standard JavaScript numbers, extremely large inputs may lose precision. It is best suited for standard integer conversions.' }
    ],
    Component: BaseConverter
  },
  {
    slug: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines',
    category: 'Text',
    icon: Scissors,
    keywords: ['remove duplicates', 'unique lines', 'dedupe text'],
    metaTitle: 'Remove Duplicate Lines - Free Online Tool',
    metaDescription: 'Easily remove duplicate lines from your text. Fast, free, and secure deduplication in your browser.',
    intro: 'Remove all duplicate lines from a list or text block instantly. Perfect for cleaning up email lists, data dumps, or any repetitive text.',
    howTo: ['Paste your text into the input.', 'Duplicates are automatically removed.', 'Copy the unique lines from the output.'],
    faq: [{ q: 'Is it case sensitive?', a: 'Yes, exact string matching is used.' }],
    Component: RemoveDuplicateLines
  },
  {
    slug: 'sort-lines',
    name: 'Sort Lines',
    category: 'Text',
    icon: ArrowDownAZ,
    keywords: ['alphabetize', 'sort text', 'order lines'],
    metaTitle: 'Sort Lines Alphabetically - Online Tool',
    metaDescription: 'Sort text lines in alphabetical order instantly. Free browser-based utility.',
    intro: 'Quickly organize your lists by sorting all lines alphabetically.',
    howTo: ['Paste your list.', 'Lines are sorted instantly.', 'Copy the result.'],
    faq: [{ q: 'Does it sort numbers?', a: 'Yes, it sorts alphabetically, meaning "10" comes before "2".' }],
    Component: SortLines
  },
  {
    slug: 'remove-extra-spaces',
    name: 'Remove Extra Spaces',
    category: 'Text',
    icon: Space,
    keywords: ['clean spaces', 'trim text', 'remove whitespace'],
    metaTitle: 'Remove Extra Spaces - Free Text Cleaner',
    metaDescription: 'Remove double spaces, tabs, and trailing whitespaces from your text.',
    intro: 'Clean up messy text formatting by removing double spaces, tabs, and extra whitespaces.',
    howTo: ['Paste text.', 'Spaces are cleaned automatically.', 'Copy the result.'],
    faq: [{ q: 'Does it remove line breaks?', a: 'No, it preserves your line breaks but cleans horizontal spacing.' }],
    Component: RemoveExtraSpaces
  },
  {
    slug: 'remove-empty-lines',
    name: 'Remove Empty Lines',
    category: 'Text',
    icon: Filter,
    keywords: ['delete blank lines', 'trim empty lines', 'clean text'],
    metaTitle: 'Remove Empty Lines - Online Text Tool',
    metaDescription: 'Delete all blank and empty lines from your text files instantly.',
    intro: 'Quickly condense code or text by stripping out all blank lines.',
    howTo: ['Paste text.', 'Empty lines are removed.', 'Copy the condensed text.'],
    faq: [{ q: 'Does it remove lines with only spaces?', a: 'Yes, lines containing only whitespace are removed.' }],
    Component: RemoveEmptyLines
  },
  {
    slug: 'reverse-text',
    name: 'Reverse Text',
    category: 'Text',
    icon: ArrowLeftRight,
    keywords: ['backward text', 'reverse string', 'flip text'],
    metaTitle: 'Reverse Text Generator - Flip Text Backwards',
    metaDescription: 'Reverse any text string backwards instantly with this free online tool.',
    intro: 'Flip your text entirely backwards, reversing the order of every single character.',
    howTo: ['Paste text.', 'Text is reversed instantly.', 'Copy the output.'],
    faq: [{ q: 'What is this used for?', a: 'Often used for puzzles, encodings, or just for fun.' }],
    Component: ReverseText
  },
  {
    slug: 'reverse-lines',
    name: 'Reverse Lines',
    category: 'Text',
    icon: WrapText,
    keywords: ['flip list', 'reverse order', 'bottom to top'],
    metaTitle: 'Reverse Line Order - Free Online Tool',
    metaDescription: 'Reverse the order of lines in a list or text document.',
    intro: 'Flip your list upside down. The last line becomes the first line.',
    howTo: ['Paste list.', 'Order is reversed.', 'Copy the result.'],
    faq: [{ q: 'Does it reverse the text inside the lines?', a: 'No, only the order of the lines themselves.' }],
    Component: ReverseLines
  },
  {
    slug: 'html-stripper',
    name: 'Strip HTML Tags',
    category: 'Text',
    icon: ShieldX,
    keywords: ['remove html', 'clean html', 'text only'],
    metaTitle: 'Strip HTML Tags - Convert HTML to Plain Text',
    metaDescription: 'Remove all HTML tags from a text block, leaving only the plain text content.',
    intro: 'Extract readable text from HTML code by stripping out all tags.',
    howTo: ['Paste HTML.', 'Tags are removed.', 'Copy the plain text.'],
    faq: [{ q: 'Is it perfect?', a: 'It uses a regex approach, which is good for basic cleanup but might not parse complex nested scripts perfectly.' }],
    Component: HtmlStripper
  },
  {
    slug: 'extract-emails',
    name: 'Extract Emails',
    category: 'Text',
    icon: Mail,
    keywords: ['find emails', 'email extractor', 'scrape emails'],
    metaTitle: 'Extract Emails from Text - Free Online Tool',
    metaDescription: 'Find and extract all email addresses from a block of text.',
    intro: 'Instantly pull every email address out of a messy block of text or document.',
    howTo: ['Paste text.', 'Emails are extracted into a list.', 'Copy the emails.'],
    faq: [{ q: 'Is my data saved?', a: 'No, all extraction happens locally in your browser.' }],
    Component: ExtractEmails
  },
  {
    slug: 'extract-urls',
    name: 'Extract URLs',
    category: 'Text',
    icon: Link,
    keywords: ['find links', 'url extractor', 'scrape urls'],
    metaTitle: 'Extract URLs from Text - Free Online Tool',
    metaDescription: 'Find and extract all HTTP and HTTPS links from text.',
    intro: 'Instantly pull every website link out of a block of text.',
    howTo: ['Paste text.', 'URLs are extracted into a list.', 'Copy the links.'],
    faq: [{ q: 'Does it find links without http?', a: 'It specifically looks for standard http:// and https:// patterns.' }],
    Component: ExtractUrls
  },
  {
    slug: 'text-to-binary',
    name: 'Text to Binary',
    category: 'Text',
    icon: Binary,
    keywords: ['text to binary', 'binary encoder', 'convert to binary'],
    metaTitle: 'Text to Binary Converter - Free Tool',
    metaDescription: 'Convert plain text into binary code instantly.',
    intro: 'Translate human-readable text into computer binary (1s and 0s).',
    howTo: ['Paste text.', 'Binary is generated.', 'Copy the code.'],
    faq: [{ q: 'What encoding is used?', a: 'Standard 8-bit character encoding.' }],
    Component: TextToBinary
  },
  {
    slug: 'binary-to-text',
    name: 'Binary to Text',
    category: 'Text',
    icon: Type,
    keywords: ['binary decoder', 'binary to text', 'read binary'],
    metaTitle: 'Binary to Text Converter - Free Tool',
    metaDescription: 'Convert binary code back into human-readable plain text.',
    intro: 'Decode a string of 1s and 0s back into readable characters.',
    howTo: ['Paste binary (space separated).', 'Text is generated.', 'Copy the text.'],
    faq: [{ q: 'What if it says invalid?', a: 'Ensure your binary is properly formatted with spaces between 8-bit blocks.' }],
    Component: BinaryToText
  },
  {
    slug: 'text-to-hex',
    name: 'Text to Hex',
    category: 'Text',
    icon: Hash,
    keywords: ['text to hex', 'hex encoder', 'hexadecimal'],
    metaTitle: 'Text to Hex Converter - Free Tool',
    metaDescription: 'Convert plain text into hexadecimal format.',
    intro: 'Translate human-readable text into hexadecimal string format.',
    howTo: ['Paste text.', 'Hex is generated.', 'Copy the code.'],
    faq: [{ q: 'What encoding is used?', a: 'Standard character encoding.' }],
    Component: TextToHex
  },
  {
    slug: 'hex-to-text',
    name: 'Hex to Text',
    category: 'Text',
    icon: Type,
    keywords: ['hex decoder', 'hex to text', 'read hex'],
    metaTitle: 'Hex to Text Converter - Free Tool',
    metaDescription: 'Convert hexadecimal strings back into plain text.',
    intro: 'Decode a hex string back into readable characters.',
    howTo: ['Paste hex (space separated).', 'Text is generated.', 'Copy the text.'],
    faq: [{ q: 'What if it says invalid?', a: 'Ensure your hex is properly formatted with spaces.' }],
    Component: HexToText
  },
  {
    slug: 'text-to-ascii',
    name: 'Text to ASCII',
    category: 'Text',
    icon: Hash,
    keywords: ['text to ascii', 'ascii encoder'],
    metaTitle: 'Text to ASCII Converter',
    metaDescription: 'Convert plain text into ASCII character codes.',
    intro: 'Translate text into its corresponding ASCII numeric values.',
    howTo: ['Paste text.', 'ASCII is generated.', 'Copy the code.'],
    faq: [{ q: 'Are unicode characters supported?', a: 'It extracts the charCode, so basic Unicode is represented as numbers.' }],
    Component: TextToAscii
  },
  {
    slug: 'ascii-to-text',
    name: 'ASCII to Text',
    category: 'Text',
    icon: Type,
    keywords: ['ascii decoder', 'ascii to text'],
    metaTitle: 'ASCII to Text Converter',
    metaDescription: 'Convert ASCII numeric codes back into text.',
    intro: 'Decode a sequence of ASCII numbers back into readable text.',
    howTo: ['Paste ASCII codes (space separated).', 'Text is generated.', 'Copy the text.'],
    faq: [{ q: 'Does it support extended ASCII?', a: 'Yes, based on the browser\'s String.fromCharCode.' }],
    Component: AsciiToText
  },
  {
    slug: 'shuffle-lines',
    name: 'Shuffle Lines',
    category: 'Text',
    icon: ArrowLeftRight,
    keywords: ['randomize list', 'shuffle text', 'random order'],
    metaTitle: 'Shuffle Lines - Randomize List Order',
    metaDescription: 'Randomize the order of lines in a list or text document.',
    intro: 'Instantly shuffle your list into a completely random order.',
    howTo: ['Paste list.', 'List is randomized.', 'Copy the result.'],
    faq: [{ q: 'Is it truly random?', a: 'It uses standard Math.random() for a basic Fisher-Yates shuffle.' }],
    Component: ShuffleLines
  },
  {
    slug: 'add-line-numbers',
    name: 'Add Line Numbers',
    category: 'Text',
    icon: ListPlus,
    keywords: ['number lines', 'list numbering', 'add numbers to text'],
    metaTitle: 'Add Line Numbers to Text - Free Tool',
    metaDescription: 'Automatically add sequential line numbers to the beginning of every line.',
    intro: 'Quickly format a list or code block by prepending line numbers.',
    howTo: ['Paste text.', 'Numbers are added.', 'Copy the text.'],
    faq: [{ q: 'Does it number blank lines?', a: 'Yes, every line break creates a new numbered line.' }],
    Component: AddLineNumbers
  },
  {
    slug: 'prefix-suffix-lines',
    name: 'Add Prefix & Suffix',
    category: 'Text',
    icon: SplitSquareHorizontal,
    keywords: ['add prefix', 'add suffix', 'wrap lines', 'prepend append'],
    metaTitle: 'Add Prefix & Suffix to Lines - Free Tool',
    metaDescription: 'Add text to the beginning (prefix) and end (suffix) of every line instantly.',
    intro: 'Quickly modify a list by wrapping every line with specific text.',
    howTo: ['Paste your list.', 'Enter the prefix and suffix.', 'Copy the result.'],
    faq: [{ q: 'Can I use spaces?', a: 'Yes, any characters including spaces work.' }],
    Component: PrefixSuffixLines
  },
  {
    slug: 'text-diff',
    name: 'Text Difference Compare',
    category: 'Text',
    icon: FileDiff,
    keywords: ['compare text', 'text diff', 'find differences'],
    metaTitle: 'Text Difference Checker - Compare Texts',
    metaDescription: 'Compare two text blocks and highlight the differences, additions, and deletions.',
    intro: 'Find exactly what changed between two versions of a document or code.',
    howTo: ['Paste the original text.', 'Paste the new text.', 'View the highlighted differences below.'],
    faq: [{ q: 'Is it line by line?', a: 'Yes, it compares line by line.' }],
    Component: TextDiff
  },
  {
    slug: 'find-and-replace',
    name: 'Find & Replace',
    category: 'Text',
    icon: Replace,
    keywords: ['search replace', 'regex replace', 'find text'],
    metaTitle: 'Find and Replace Text Online - Regex Support',
    metaDescription: 'Find and replace text with optional Regular Expression (Regex) support.',
    intro: 'Quickly find and replace occurrences of words or patterns in your text.',
    howTo: ['Paste text.', 'Enter find and replace terms.', 'Check Regex if needed.', 'Copy the result.'],
    faq: [{ q: 'What regex flavor?', a: 'Standard JavaScript Regular Expressions.' }],
    Component: FindAndReplace
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'QR & Barcode',
    icon: QrCode,
    keywords: ['qr code', 'make qr', 'generate qr', 'url to qr'],
    metaTitle: 'Free QR Code Generator - High Quality PNG/SVG',
    metaDescription: 'Generate custom QR codes instantly for URLs, text, Wi-Fi, and more. Customize colors and download high-quality PNGs.',
    intro: 'Create high-quality, scannable QR codes instantly for free. Our QR Code Generator allows you to encode URLs, plain text, and other data into a customizable QR code. You can easily adjust the foreground and background colors to match your brand. Everything is generated directly on your device, ensuring maximum privacy and no watermarks.',
    howTo: [
      'Enter the URL or text you want to encode in the payload field.',
      'Optionally, select custom foreground and background colors.',
      'The QR code preview will update instantly.',
      'Click "Download PNG" to save the high-resolution image to your device.'
    ],
    faq: [
      { q: 'Do these QR codes expire?', a: 'No. The QR codes generated here are static and encode your raw data directly. They will work forever as long as the destination (like a URL) remains active.' },
      { q: 'Are there any watermarks?', a: 'No, our generator provides clean, watermark-free images.' }
    ],
    Component: QRGenerator
  },
  {
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'QR & Barcode',
    icon: Barcode,
    keywords: ['barcode creator', 'generate barcode', 'code128', 'ean13', 'upc'],
    metaTitle: 'Free Barcode Generator - CODE128, EAN, UPC',
    metaDescription: 'Generate standard barcodes online instantly. Supports CODE128, EAN-13, UPC, and more. Download high-quality PNGs for free.',
    intro: 'Generate professional, scannable barcodes in seconds with our free Barcode Generator. Ideal for inventory, retail, and logistical tagging, this tool supports multiple industry-standard formats including CODE128, EAN-13, and UPC. You can customize the colors and instantly download the output as a high-quality PNG—all processed securely within your browser.',
    howTo: [
      'Select the desired barcode format from the dropdown menu (CODE128 is a good default).',
      'Enter the value you want to encode. Make sure it matches the format requirements.',
      'Customize the line color and background color if desired.',
      'Click "Download PNG" to save the barcode image.'
    ],
    faq: [
      { q: 'Why is it showing an error?', a: 'Certain barcode formats require specific input lengths or character types. For example, EAN-13 requires exactly 12 or 13 numeric digits.' },
      { q: 'Can I use these for commercial products?', a: 'Yes, if you own the corresponding UPC or EAN number registered via GS1, you can use these generated graphics on your product packaging.' }
    ],
    Component: BarcodeGenerator
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'Color & Image',
    icon: ImageIcon,
    keywords: ['compress image', 'reduce file size', 'optimize image', 'shrink photo'],
    metaTitle: 'Free Online Image Compressor - Reduce File Size',
    metaDescription: 'Compress and optimize images directly in your browser. Reduce file sizes of JPEGs and PNGs without losing quality.',
    intro: 'The Image Compressor helps you significantly reduce the file size of your photos and graphics without visible quality loss. This tool is completely client-side, meaning your images are never uploaded to a server—compression happens directly in your browser using standard HTML5 Canvas technologies, ensuring your files remain 100% private.',
    howTo: [
      'Click "Choose File" and select an image from your device.',
      'Use the quality slider to adjust the compression level (lower % means a smaller file but less quality).',
      'Preview the compressed image instantly on the right.',
      'Click "Download Compressed" to save the optimized image.'
    ],
    faq: [
      { q: 'Are my images secure?', a: 'Yes. Processing happens entirely within your web browser. We never upload, store, or see your images.' },
      { q: 'Which formats are supported?', a: 'You can upload most standard web image formats (JPEG, PNG, WebP) and the tool will output a compressed JPEG.' }
    ],
    Component: ImageCompressor
  },
  {
    slug: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'SEO',
    icon: FileSearch,
    keywords: ['meta tags', 'seo tags', 'open graph', 'twitter cards', 'html head'],
    metaTitle: 'Free Meta Tag Generator - SEO & Open Graph',
    metaDescription: 'Create optimized HTML meta tags, Open Graph tags, and Twitter cards for your website to boost SEO and social sharing.',
    intro: 'Proper HTML meta tags are crucial for Search Engine Optimization (SEO) and ensuring your website looks great when shared on social media like Facebook and Twitter. Our Meta Tag Generator takes the guesswork out of formatting by automatically generating standards-compliant `<meta>` tags, Open Graph properties, and Twitter Card data based on your simple inputs.',
    howTo: [
      'Fill in the title, description, and keywords for your webpage.',
      'Add a URL and an image link to enable rich social media previews.',
      'Select whether you want search engines to index the page.',
      'Copy the generated HTML code and paste it inside the `<head>` section of your website.'
    ],
    faq: [
      { q: 'Where do I put this code?', a: 'The generated meta tags should be pasted into the HTML of your webpage, specifically inside the `<head> ... </head>` section.' },
      { q: 'What is Open Graph?', a: 'Open Graph is a protocol originally created by Facebook that standardizes how web pages are represented when shared on social media, allowing for rich previews with images and descriptions.' }
    ],
    Component: MetaTagGenerator
  },
  {
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator & Validator',
    category: 'SEO',
    icon: FileText,
    keywords: ['robots.txt generator', 'crawl directives', 'disallow bot', 'googlebot rules', 'sitemap directive'],
    metaTitle: 'Robots.txt Generator & Validator - Free Online SEO Tool',
    metaDescription: 'Create and validate custom robots.txt files. Set disallow/allow crawl rules for Googlebot, GPTBot, and other crawlers with real-time URL testing.',
    intro: 'Generate standard-compliant robots.txt files to manage search engine crawler access to your website. Test rule outcomes, block AI bots, and specify sitemap locations with single-click export.',
    howTo: [
      'Select a quick template preset or configure custom rules manually.',
      'Set Disallow or Allow paths for specific web crawlers or all user-agents (*).',
      'Add your XML sitemap URL and optional crawl delay directives.',
      'Test URLs with the live rule simulator and download your robots.txt file.'
    ],
    faq: [
      { q: 'Where should I place the robots.txt file?', a: 'Place robots.txt in the root directory of your domain (e.g., example.com/robots.txt).' },
      { q: 'Can I block AI crawlers like GPTBot?', a: 'Yes! Use the AI block preset to restrict web scraping bots.' }
    ],
    Component: RobotsTxtGenerator
  },
  {
    slug: 'sitemap-xml-generator',
    name: 'XML Sitemap Generator & Visualizer',
    category: 'SEO',
    icon: Globe,
    keywords: ['xml sitemap generator', 'sitemap creator', 'google sitemap', 'sitemap.xml builder'],
    metaTitle: 'XML Sitemap Generator & Visualizer - Free Online Tool',
    metaDescription: 'Create valid XML sitemaps for Google and Bing. Bulk import URLs, set priority, change frequency, and download sitemap.xml instantly.',
    intro: 'Build XML sitemaps for search engine indexing. Manage URL priorities, change frequency tags, and bulk import pages with instant XML syntax validation and sitemap.xml export.',
    howTo: [
      'Enter your website domain URL.',
      'Add individual pages or paste a list of relative URLs in bulk.',
      'Configure lastmod dates, change frequency, and priority values.',
      'Download the generated sitemap.xml file.'
    ],
    faq: [
      { q: 'How many URLs can a single XML sitemap hold?', a: 'Up to 50,000 URLs or 50MB uncompressed file size.' }
    ],
    Component: SitemapXmlGenerator
  },
  {
    slug: 'open-graph-previewer',
    name: 'Open Graph & Social Card Previewer',
    category: 'SEO',
    icon: Share2,
    keywords: ['open graph previewer', 'social card tester', 'twitter card preview', 'og tags generator'],
    metaTitle: 'Open Graph & Social Media Card Previewer - Free SEO Tool',
    metaDescription: 'Preview how your web page looks when shared on Facebook, Twitter/X, LinkedIn, Discord, and Google. Generate verified OG meta tags.',
    intro: 'Visualize and test your Open Graph and Twitter card meta tags across major social platforms. Ensure high click-through rates on Facebook, Twitter/X, and LinkedIn.',
    howTo: [
      'Enter meta title, description, and share image URL.',
      'Switch between Facebook, Twitter, LinkedIn, Google, and Discord previews.',
      'Check character count limits to prevent title truncation.',
      'Copy the generated Open Graph HTML tags.'
    ],
    faq: [
      { q: 'Why is my social share image not displaying?', a: 'Ensure your image URL is publicly accessible and meets recommended dimensions (1200x630px).' }
    ],
    Component: OpenGraphPreviewer
  },
  {
    slug: 'schema-markup-generator',
    name: 'Schema.org Structured Data Generator',
    category: 'SEO',
    icon: Code,
    keywords: ['schema markup generator', 'json-ld generator', 'structured data', 'google rich snippets'],
    metaTitle: 'Schema.org Structured Data & JSON-LD Generator',
    metaDescription: 'Generate valid JSON-LD structured data schema markup for Articles, Products, FAQ Pages, and Local Businesses for Google Rich Snippets.',
    intro: 'Create Google-compliant JSON-LD structured data markup to qualify for rich search results. Build schema for articles, products, FAQ accordions, and business listings.',
    howTo: [
      'Select your target Schema type (Article, Product, or FAQ Page).',
      'Fill in required schema properties in the interactive form.',
      'Verify output JSON-LD code in the live editor.',
      'Copy and paste the script tag inside your HTML head.'
    ],
    faq: [
      { q: 'What is JSON-LD schema markup?', a: 'JSON-LD is a structured format recommended by Google to describe web page content to search engines.' }
    ],
    Component: SchemaMarkupGenerator
  },
  {
    slug: 'keyword-density-analyzer',
    name: 'Keyword Density & N-Gram Analyzer',
    category: 'SEO',
    icon: BarChart2,
    keywords: ['keyword density checker', 'n-gram analyzer', 'seo word frequency', 'text keyword counter'],
    metaTitle: 'Keyword Density & N-Gram Phrase Analyzer - Free SEO Tool',
    metaDescription: 'Analyze word frequency and keyword density percentages for 1-gram and 2-gram phrases in your text to prevent keyword stuffing.',
    intro: 'Audit keyword density and phrase frequency in web content. Filter stop words, identify top single and two-word phrases, and maintain ideal 1-3% keyword ratios for optimal rankings.',
    howTo: [
      'Paste your article or webpage copy into the text editor.',
      'Toggle stop word filtering and set minimum word length.',
      'Review the top single keywords and 2-word phrase density tables.',
      'Adjust content to maintain optimal keyword distributions.'
    ],
    faq: [
      { q: 'What is ideal keyword density for SEO?', a: 'Most SEO experts recommend maintaining 1% to 3% density for primary target keywords.' }
    ],
    Component: KeywordDensityAnalyzer
  },
  {
    slug: 'serp-snippet-optimizer',
    name: 'SERP Snippet Optimizer & CTR Checker',
    category: 'SEO',
    icon: Search,
    keywords: ['serp snippet simulator', 'google title preview', 'meta description pixel counter', 'ctr score'],
    metaTitle: 'Google SERP Snippet Simulator & Pixel Width Optimizer',
    metaDescription: 'Preview Google desktop and mobile search snippets. Check pixel widths and optimize titles and meta descriptions for maximum CTR.',
    intro: 'Simulate how your webpage appears in Google search results. Measure title and description pixel widths to prevent character truncation and maximize organic click-through rates.',
    howTo: [
      'Enter your SEO title, meta description, and target keyword.',
      'Switch between Google desktop and mobile search previews.',
      'Monitor pixel width bars and character limits.',
      'Follow the CTR optimization score checklist to improve rankings.'
    ],
    faq: [
      { q: 'What is Google title pixel truncation?', a: 'Google truncates search titles that exceed ~580 pixels on desktop browsers.' }
    ],
    Component: SerpSnippetOptimizer
  },
  {
    slug: 'hreflang-redirect-generator',
    name: 'Hreflang Tags & 301 Redirect Generator',
    category: 'SEO',
    icon: Tag,
    keywords: ['hreflang generator', 'multilingual seo', '301 redirect generator', 'htaccess redirect'],
    metaTitle: 'Hreflang Tag & 301 Redirect Rules Generator',
    metaDescription: 'Generate HTML hreflang tags for multi-language websites and Apache .htaccess 301 redirect rules.',
    intro: 'Build multi-language hreflang link tags and server 301 redirect rules. Ensure correct search localization and preserve page rank during URL migrations.',
    howTo: [
      'Choose Hreflang Tags or 301 Redirect Rules mode.',
      'Specify language/region codes and URL mappings.',
      'Copy generated HTML link tags or .htaccess rules.'
    ],
    faq: [
      { q: 'Why is x-default hreflang important?', a: 'The x-default tag directs users without a matching language region to your default page.' }
    ],
    Component: HrefLangRedirectGenerator
  },
  {
    slug: 'heading-structure-analyzer',
    name: 'Heading Tag & Content Hierarchy Analyzer',
    category: 'SEO',
    icon: Hierarchy,
    keywords: ['heading structure checker', 'h1 h2 h3 hierarchy', 'seo header analyzer', 'html outline auditor'],
    metaTitle: 'Heading Tag (H1-H6) Structure & Hierarchy Analyzer',
    metaDescription: 'Audit HTML heading tags (H1-H6) for correct content hierarchy. Detect missing H1 tags, skipped heading levels, and SEO structure issues.',
    intro: 'Analyze HTML heading tag structures (H1 through H6). Detect duplicate H1 tags, skipped heading levels, and structural flaws to improve document outline clarity.',
    howTo: [
      'Paste HTML code or article outline into the editor.',
      'Inspect the visual heading hierarchy tree.',
      'Review warning alerts for missing or multiple H1 tags.',
      'Ensure heading levels step down logically (H1 -> H2 -> H3).'
    ],
    faq: [
      { q: 'Can a page have more than one H1 tag?', a: 'While HTML5 permits multiple H1s, SEO best practices strongly recommend using a single clear H1 per page.' }
    ],
    Component: HeadingStructureAnalyzer
  },
  {
    slug: 'seo-slug-health-checker',
    name: 'SEO Slug & URL Health Generator',
    category: 'SEO',
    icon: Zap,
    keywords: ['seo slug generator', 'url slug cleaner', 'friendly url maker', 'slug sanitizer'],
    metaTitle: 'SEO Slug & Clean URL Health Generator - Free Tool',
    metaDescription: 'Convert article titles into clean, search-friendly SEO URL slugs. Strip special characters, spaces, and non-SEO parameters.',
    intro: 'Transform article headlines and page titles into clean, concise, SEO-optimized URL slugs. Automatically remove special characters, spaces, and punctuation.',
    howTo: [
      'Enter your article or page title.',
      'The tool instantly cleans special characters and converts spaces to hyphens.',
      'Copy the generated SEO slug for your URL structure.'
    ],
    faq: [
      { q: 'Why should URLs use hyphens instead of underscores?', a: 'Google treats hyphens (-) as word separators, while underscores (_) join words together.' }
    ],
    Component: SeoSlugHealthChecker
  },
  {
    slug: 'seo-content-readability-audit',
    name: 'SEO Content Readability & Text Audit',
    category: 'SEO',
    icon: BookOpen,
    keywords: ['flesch reading ease', 'seo readability audit', 'content readability score', 'text statistics'],
    metaTitle: 'SEO Content Readability & Flesch Score Audit Tool',
    metaDescription: 'Calculate Flesch Reading Ease score, average sentence length, and readability grade level for web content to lower bounce rates.',
    intro: 'Measure the readability of your web copy with the Flesch Reading Ease formula. Improve engagement and dwell time by keeping content accessible to search engine visitors.',
    howTo: [
      'Paste your article text into the analyzer.',
      'Review the Flesch Reading Ease score and readability category.',
      'Check sentence length and total word counts.',
      'Refine copy to achieve plain-English readability (60-70 score).'
    ],
    faq: [
      { q: 'How does readability impact SEO?', a: 'Easier-to-read content lowers bounce rates and increases dwell time, signaling value to search engines.' }
    ],
    Component: SeoContentReadabilityAudit
  },
  {
    slug: 'stopwatch-timer',
    name: 'Stopwatch & Timer',
    category: 'Utility',
    icon: Timer,
    keywords: ['stopwatch', 'online timer', 'lap timer', 'time tracker'],
    metaTitle: 'Free Online Stopwatch & Lap Timer',
    metaDescription: 'A precise online stopwatch with lap tracking capabilities. Perfect for timing exercises, presentations, or sprints.',
    intro: 'Keep track of time with precision using our Online Stopwatch. Designed with a clean, distraction-free interface, it allows you to start, pause, and record lap times with millisecond accuracy. Whether you are timing a workout, tracking a presentation, or managing a development sprint, this utility runs entirely in your browser without any network delays.',
    howTo: [
      'Click the "Start" button to begin the timer.',
      'Click "Lap" while the timer is running to record a split time without stopping the clock.',
      'Click "Pause" to temporarily halt the timer.',
      'Click "Reset" to clear the timer and all recorded laps.'
    ],
    faq: [
      { q: 'Is it accurate?', a: 'Yes, it uses the device\'s native system clock to calculate the elapsed time (Date.now()), meaning it remains accurate even if the browser tab is momentarily throttled.' },
      { q: 'Will the timer keep running if I switch tabs?', a: 'Most modern browsers throttle background tabs to save battery. While the displayed UI might pause, the underlying elapsed time will mathematically "catch up" accurately once you return to the tab.' }
    ],
    Component: Stopwatch
  },
  {
    slug: 'countdown-timer-alarm',
    name: 'Countdown Timer & Alarm',
    category: 'Utility',
    icon: Clock,
    keywords: ['countdown timer', 'alarm clock', 'pomodoro timer', 'online alarm'],
    metaTitle: 'Online Countdown Timer & Audio Alarm Clock',
    metaDescription: 'Customizable online countdown timer with Web Audio synthesized alarms and Pomodoro presets for focus and workouts.',
    intro: 'Stay on track with our versatile Countdown Timer & Alarm. Set custom hours, minutes, and seconds or pick from preset intervals like Pomodoro focus sessions and breaks. Features a visual circular progress ring and synthesized Web Audio alarms that ring clearly when time expires.',
    howTo: [
      'Select a preset duration (e.g., 25m Pomodoro) or enter custom hours, minutes, and seconds.',
      'Click "Start" to begin the countdown timer.',
      'Watch the circular ring progress as time ticks down.',
      'Hear the Web Audio alarm beep when the timer hits zero.'
    ],
    faq: [
      { q: 'Does the alarm work without internet?', a: 'Yes, the alarm sound is generated dynamically using your browser\'s native Web Audio API oscillators without loading external audio files.' },
      { q: 'Can I pause and resume?', a: 'Yes, click the "Pause" button at any time to freeze the timer, and click "Start" to resume.' }
    ],
    Component: CountdownTimerAlarm
  },
  {
    slug: 'world-clock-scheduler',
    name: 'World Clock & Timezone Hub',
    category: 'Utility',
    icon: Globe,
    keywords: ['world clock', 'timezone converter', 'global time', 'meeting planner'],
    metaTitle: 'World Clock & Multi-Timezone Scheduler',
    metaDescription: 'Track live local times across major global cities and timezones. Add cities, compare current times, and coordinate remote meetings.',
    intro: 'Effortlessly keep track of current local times across international cities with our World Clock Hub. Add your primary business locations, remote team cities, or travel destinations to view live digital clocks side by side with real-time day and date indicators.',
    howTo: [
      'Choose a timezone or city from the dropdown selector.',
      'Click "Add City" to display its live digital clock card.',
      'View current hours, minutes, seconds, and dates across all selected cities simultaneously.',
      'Click the trash icon to remove any city card from your dashboard.'
    ],
    faq: [
      { q: 'Are daylight saving time changes accounted for?', a: 'Yes, all time calculations rely on standard Intl.DateTimeFormat specifications provided by your device OS.' },
      { q: 'How many cities can I add?', a: 'You can add as many global timezones as you need for your workflow.' }
    ],
    Component: WorldClockScheduler
  },
  {
    slug: 'random-choice-picker',
    name: 'Random Choice Picker',
    category: 'Utility',
    icon: Shuffle,
    keywords: ['random picker', 'name picker', 'randomizer', 'decision maker'],
    metaTitle: 'Random Choice Picker & Item Selector',
    metaDescription: 'Make unbiased decisions instantly. Input a list of items or names to pick a random winner or shuffle choices.',
    intro: 'Can’t decide what to eat, who goes first, or which task to tackle next? Use our Random Choice Picker to select a fair, unbiased option instantly. Enter your options line by line, click "Pick Random Choice", and watch the quick selector reveal your winner.',
    howTo: [
      'Enter your list of options or names into the text box, one item per line.',
      'Click "Pick Random Choice" to trigger the randomized selection process.',
      'View the highlighted winning choice on screen.',
      'Use "Shuffle" to reorder your input list randomly.'
    ],
    faq: [
      { q: 'Is the pick genuinely random?', a: 'Yes, selection utilizes JavaScript Math.random() cryptography to guarantee standard uniform probability for all items.' },
      { q: 'Does it save recent picks?', a: 'Yes, recent winning picks are displayed in the history panel below.' }
    ],
    Component: RandomChoicePicker
  },
  {
    slug: 'unit-price-comparator',
    name: 'Unit Price Cost Comparator',
    category: 'Utility',
    icon: Calculator,
    keywords: ['unit price calculator', 'cost comparison', 'best value calculator', 'grocery price comparer'],
    metaTitle: 'Unit Price Cost Comparator - Compare Best Value',
    metaDescription: 'Find the true best value product when shopping. Compare price per unit, gram, ounce, or pound between two different package sizes.',
    intro: 'Determine which product size or deal offers the best monetary value with our Unit Price Comparator. Simply enter the package prices and quantities of two competing products. The utility calculates the exact cost per unit and highlights the most cost-effective deal with exact percentage savings.',
    howTo: [
      'Enter the price and quantity for Option A (e.g., $4.99 for 500g).',
      'Enter the price and quantity for Option B (e.g., $7.49 for 800g).',
      'Review the calculated unit prices per standard unit.',
      'Look for the green "BEST VALUE" badge highlighting the cheaper option.'
    ],
    faq: [
      { q: 'Can I compare different measurement units?', a: 'As long as both options use comparable volume/weight quantities (e.g., grams vs grams), unit rates will accurately reflect value.' },
      { q: 'Does it support decimal prices?', a: 'Yes, prices can be entered down to cents and fractions of a cent.' }
    ],
    Component: UnitPriceComparator
  },
  {
    slug: 'screen-webcam-tester',
    name: 'Screen & Display Diagnostics',
    category: 'Utility',
    icon: Monitor,
    keywords: ['dead pixel test', 'screen diagnostic', 'fps meter', 'display specs'],
    metaTitle: 'Screen & Display Diagnostic Tester - Dead Pixel Check',
    metaDescription: 'Test your computer monitor for dead pixels, check screen resolution, monitor color depth, and measure live render FPS.',
    intro: 'Inspect your display monitor for dead, stuck, or hot pixels and review hardware display metrics using our Screen Diagnostics tool. Run full-screen primary color tests (Red, Green, Blue, White, Black) and monitor real-time rendering frame rates (FPS).',
    howTo: [
      'Click any color button (e.g. Red, Blue, White) to enter full-screen color mode.',
      'Inspect your screen closely for any unlit or miscolored pixel dots.',
      'Click anywhere or press ESC to exit full-screen inspection mode.',
      'Check the top diagnostic cards for resolution, pixel ratio, color depth, and live FPS.'
    ],
    faq: [
      { q: 'How do I detect a dead pixel?', a: 'On a solid color background, a dead pixel will appear as a permanently dark spot or wrong-colored dot.' },
      { q: 'Is any software download required?', a: 'No, all display diagnostics run directly inside your web browser.' }
    ],
    Component: ScreenWebcamTester
  },
  {
    slug: 'audio-tone-generator',
    name: 'Audio Frequency Tone Synthesizer',
    category: 'Utility',
    icon: Volume2,
    keywords: ['tone generator', 'audio frequency synth', 'sine wave generator', 'sound frequency test'],
    metaTitle: 'Online Audio Frequency & Tone Generator',
    metaDescription: 'Generate custom audio frequencies and sound waves from 20Hz to 5,000Hz using sine, square, sawtooth, and triangle waveforms.',
    intro: 'Produce precise audio frequencies for speaker testing, sound calibration, or audio experimentation. Our Audio Tone Synthesizer leverages native Web Audio API oscillators to emit clean sound waves across custom frequency ranges and waveforms.',
    howTo: [
      'Select a waveform type: Sine, Square, Sawtooth, or Triangle.',
      'Drag the frequency slider or select a quick preset (e.g., 440Hz A4 concert pitch).',
      'Click "Play Synthesized Tone" to emit sound.',
      'Click "Stop Tone" to halt playback.'
    ],
    faq: [
      { q: 'What is 440Hz used for?', a: '440Hz (A4) is the international standard musical tuning pitch for acoustic instruments.' },
      { q: 'Are lower frequencies safe for speakers?', a: 'Avoid playing extremely low frequencies (below 30Hz) at max volume on small speakers to prevent driver distortion.' }
    ],
    Component: AudioToneGenerator
  },
  {
    slug: 'file-hash-calculator',
    name: 'File Hash Checksum Calculator',
    category: 'Utility',
    icon: Hash,
    keywords: ['file hash', 'sha256 calculator', 'sha1 checksum', 'file integrity check'],
    metaTitle: 'File Hash Checksum Calculator - SHA-256 & SHA-1',
    metaDescription: 'Calculate SHA-256, SHA-1, and SHA-512 cryptographic hash checksums for any local file directly in your browser.',
    intro: 'Verify file integrity and authenticity by computing cryptographic hash checksums. Upload any local file to calculate its SHA-256, SHA-1, and SHA-512 hashes using browser-native Web Crypto algorithms without uploading your file to any server.',
    howTo: [
      'Click "Choose File" and select any document, image, zip, or executable from your computer.',
      'Wait a moment while the browser calculates cryptographic hashes locally.',
      'View the computed SHA-256, SHA-1, and SHA-512 hash values.',
      'Click the "Copy" button to save the checksum string to your clipboard.'
    ],
    faq: [
      { q: 'Is my file uploaded to an online server?', a: 'No! The hash calculation runs 100% locally in your browser using the Web Crypto API. Your file never leaves your computer.' },
      { q: 'Why check file hashes?', a: 'File hashes verify that a downloaded file has not been corrupted or tampered with.' }
    ],
    Component: FileHashCalculator
  },
  {
    slug: 'keyboard-key-tester',
    name: 'Keyboard Key Code & Press Tester',
    category: 'Utility',
    icon: Keyboard,
    keywords: ['keyboard tester', 'key code checker', 'event key detector', 'js keycode'],
    metaTitle: 'Keyboard Key Code & Press Event Tester',
    metaDescription: 'Test physical keyboard keys and inspect JavaScript event key, event code, keyCode, and modifier key states in real-time.',
    intro: 'Debug hardware keyboard keys and inspect JavaScript keyboard event parameters in real-time. Simply press any key on your physical keyboard to reveal its exact event.key, event.code, keyCode value, and active modifier key combinations (Shift, Ctrl, Alt).',
    howTo: [
      'Click anywhere on the utility page to ensure input focus.',
      'Press any key or key combination on your physical keyboard.',
      'View live property readings for event.key, event.code, and numeric keyCode.',
      'Verify if modifier keys like Shift, Ctrl, or Alt register correctly.'
    ],
    faq: [
      { q: 'Why are key codes useful for web developers?', a: 'Developers use key codes and event.code to build accessible keyboard shortcuts and web game controls.' },
      { q: 'Does it work with multimedia keys?', a: 'Yes, media controls, function keys (F1-F12), and arrow keys register their corresponding browser event names.' }
    ],
    Component: KeyboardKeyTester
  },
  {
    slug: 'image-to-base64-converter',
    name: 'Image to Base64 Data URI',
    category: 'Utility',
    icon: ImageIcon,
    keywords: ['image to base64', 'data uri converter', 'embed image css', 'base64 image encoder'],
    metaTitle: 'Image to Base64 Data URI Converter',
    metaDescription: 'Convert PNG, JPG, WebP, SVG, or GIF images into inline Base64 Data URIs for CSS and HTML embedding.',
    intro: 'Embed images directly inside HTML files, CSS stylesheets, or JSON payloads by converting them into Base64 Data URIs. Select any local image file to generate clean Data URI strings instantly with a live visual image preview.',
    howTo: [
      'Select or drag-and-drop an image file (PNG, JPG, SVG, WebP, GIF).',
      'Preview the uploaded image and view file metadata.',
      'Review the generated `data:image/...` Base64 string in the output code box.',
      'Click "Copy Data URI" to store the string in your clipboard.'
    ],
    faq: [
      { q: 'Why convert images to Base64?', a: 'Base64 strings let you inline small images directly in CSS background properties or single-file HTML without extra HTTP requests.' },
      { q: 'Does Base64 increase file size?', a: 'Yes, Base64 encoding typically increases raw binary size by approximately 33%.' }
    ],
    Component: ImageToBase64Converter
  },
  {
    slug: 'quick-scratchpad-notes',
    name: 'Quick Scratchpad & Notes',
    category: 'Utility',
    icon: FileText,
    keywords: ['scratchpad', 'quick notes', 'browser notepad', 'auto save notepad'],
    metaTitle: 'Quick Browser Scratchpad & Notepad - Auto-Save',
    metaDescription: 'Distraction-free online browser notepad with instant automatic saving to local storage and live word counter.',
    intro: 'Jot down quick thoughts, code snippets, temporary text, or task reminders with our distraction-free Scratchpad. Every keystroke auto-saves instantly to your browser\'s local storage so your work persists even if you close the browser or refresh.',
    howTo: [
      'Click inside the scratchpad text area.',
      'Type or paste your text, code snippets, or notes.',
      'Notice the live word count, character count, and "Saved to LocalStorage" indicator.',
      'Return to this tool anytime to resume editing your saved notes.'
    ],
    faq: [
      { q: 'Where are my notes stored?', a: 'Notes are saved locally inside your browser\'s local storage space. They are never sent to external servers.' },
      { q: 'Will my notes disappear when I close the tab?', a: 'No, local storage persists across browser sessions until you clear your browser data.' }
    ],
    Component: QuickScratchpadNotes
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'Generators',
    icon: KeyRound,
    keywords: ['secure password', 'random password', 'strong password creator'],
    metaTitle: 'Secure Password Generator - Create Strong Passwords',
    metaDescription: 'Generate strong, secure, and random passwords instantly. Customize length and character types right in your browser.',
    intro: 'Creating strong, unique passwords for every account is the best way to protect your digital identity. Our Secure Password Generator creates highly randomized passwords directly in your browser using cryptographically secure random number generators (Web Crypto API). Because it runs locally, your passwords are never transmitted over the internet.',
    howTo: [
      'Adjust the slider to choose your desired password length (12-16 characters is recommended).',
      'Toggle the checkboxes to include uppercase, lowercase, numbers, or symbols.',
      'The secure password will be generated automatically.',
      'Click the copy icon to copy it securely to your clipboard.'
    ],
    faq: [
      { q: 'Is this password generator safe to use?', a: 'Absolutely. It uses the browser\'s native Crypto API to ensure genuine randomness, and because it runs 100% locally, the generated password is known only to you.' },
      { q: 'What makes a strong password?', a: 'A strong password is long (12+ characters), unique to the account, and uses a mix of uppercase, lowercase, numbers, and symbols to maximize entropy.' }
    ],
    Component: PasswordGenerator
  },
  {
    slug: 'advanced-calculator',
    name: 'Scientific Pro Calculator',
    category: 'Calculators',
    icon: Superscript,
    keywords: ['advanced calculator', 'scientific calculator', 'math solver', 'expression evaluator', 'mathjs'],
    metaTitle: 'Advanced Scientific Calculator - Pro Level Math Solver',
    metaDescription: 'Solve complex math problems, equations, matrices, complex numbers, and unit conversions with this advanced scientific calculator.',
    intro: 'Our Master Pro Level Calculator is powered by a robust math engine capable of solving virtually any mathematical expression. From basic arithmetic to complex numbers, trigonometry, matrix operations, derivatives, and unit conversions, it handles everything seamlessly. Includes a live history log so you never lose your calculations.',
    howTo: [
      'Type your mathematical expression into the input field (e.g. "sin(45 deg) * 2").',
      'Use the quick-insert buttons for advanced operators like matrices or complex numbers.',
      'Press Enter or the "=" button to evaluate the expression.',
      'Click on any previous calculation in the History panel to reuse it.'
    ],
    faq: [
      { q: 'Can it convert units?', a: 'Yes! You can type expressions like "5.08 cm to inch" or "2 kg to lb".' },
      { q: 'Are complex numbers supported?', a: 'Yes, just use "i" for imaginary numbers, for example "2 + 3i".' }
    ],
    Component: AdvancedCalculator
  },
  {
    slug: 'simple-calculator',
    name: 'Simple Calculator',
    category: 'Calculators',
    icon: Calculator,
    keywords: ['basic calculator', 'simple math', 'apple calculator', 'standard calculator'],
    metaTitle: 'Free Simple Calculator - Easy & Accurate',
    metaDescription: 'A clean, simple, and highly accurate basic calculator for everyday use. Designed with a familiar interface.',
    intro: 'Sometimes you just need a straightforward, highly accurate calculator without the clutter. Designed to resemble familiar mobile calculators (like Apple iOS), this simple calculator is perfect for quick everyday arithmetic.',
    howTo: [
      'Click the numbers and operator buttons to build your calculation.',
      'Click the "=" button to compute the result.',
      'Use "AC" to clear all current inputs.'
    ],
    faq: [
      { q: 'Is it accurate for decimals?', a: 'Yes, it mitigates common floating-point errors to give you precise standard calculations.' }
    ],
    Component: SimpleCalculator
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    category: 'Developer',
    icon: Code,
    keywords: ['json', 'format', 'beautify', 'pretty print'],
    metaTitle: 'Free JSON Formatter & Beautifier',
    metaDescription: 'Format and beautify your JSON data online. Easily make unreadable JSON readable.',
    intro: 'The JSON Formatter takes minified or ugly JSON strings and formats them with proper indentation, making them easy to read and debug.',
    howTo: ['Paste your JSON in the input.', 'The formatted JSON will appear in the output box instantly.'],
    faq: [{ q: 'Is my data secure?', a: 'Yes, it is processed entirely in your browser.' }],
    Component: JsonFormatter
  },
  {
    slug: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    category: 'Developer',
    icon: Link,
    keywords: ['url encode', 'url decode', 'uri component'],
    metaTitle: 'URL Encoder and Decoder Tool',
    metaDescription: 'Quickly encode or decode URLs and URI components online.',
    intro: 'Encode URL parameters so they can be safely transmitted over the internet, or decode them back into human-readable text.',
    howTo: ['Select Encode or Decode.', 'Paste your text or URL.', 'The result is updated automatically.'],
    faq: [],
    Component: UrlEncoder
  },
  {
    slug: 'html-entity-encoder',
    name: 'HTML Entity Encoder',
    category: 'Developer',
    icon: Code,
    keywords: ['html entities', 'encode', 'escape html'],
    metaTitle: 'HTML Entity Encoder & Decoder',
    metaDescription: 'Escape HTML tags or decode HTML entities back to text.',
    intro: 'Convert characters like <, >, and & into their corresponding HTML entities to display code on websites without the browser executing it.',
    howTo: ['Select your mode.', 'Enter text and copy the output.'],
    faq: [],
    Component: HtmlEntityEncoder
  },
  {
    slug: 'md5-generator',
    name: 'MD5 Hash Generator',
    category: 'Developer',
    icon: Hash,
    keywords: ['md5', 'hash generator', 'crypto'],
    metaTitle: 'MD5 Hash Generator - Online Tool',
    metaDescription: 'Generate an MD5 hash from any text instantly.',
    intro: 'Create a 128-bit MD5 hash for any string of text. MD5 is commonly used to verify data integrity.',
    howTo: ['Type or paste text into the input.', 'Copy the generated 32-character hex hash.'],
    faq: [{ q: 'Can MD5 be decrypted?', a: 'No, MD5 is a one-way cryptographic hash function.' }],
    Component: Md5Generator
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'Developer',
    icon: ShieldX,
    keywords: ['jwt', 'json web token', 'decode jwt'],
    metaTitle: 'JWT Decoder - Decode JSON Web Tokens',
    metaDescription: 'Decode JSON Web Tokens (JWT) payload and header instantly without sending data to a server.',
    intro: 'Easily decode your JWTs to inspect the header and payload claims. This tool runs client-side so your sensitive tokens are never transmitted to our servers.',
    howTo: ['Paste your JWT token (starts with ey...).', 'View the decoded JSON header and payload in the output box.'],
    faq: [{ q: 'Is the signature verified?', a: 'No, this tool only decodes the Base64 header and payload; it does not verify the signature.' }],
    Component: JwtDecoder
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'Developer',
    icon: KeyRound,
    keywords: ['uuid', 'guid', 'uuid v4', 'random id'],
    metaTitle: 'UUID v4 Generator - Create Random GUIDs',
    metaDescription: 'Generate random UUIDs (Universally Unique Identifiers) instantly.',
    intro: 'Generate one or multiple random UUID v4 strings for use in database keys, testing, or development.',
    howTo: ['Enter how many UUIDs you need.', 'Click Regenerate for a fresh batch.'],
    faq: [],
    Component: UuidGenerator
  },
  {
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    category: 'Developer',
    icon: FileText,
    keywords: ['lorem ipsum', 'dummy text', 'placeholder text'],
    metaTitle: 'Lorem Ipsum Dummy Text Generator',
    metaDescription: 'Generate Lorem Ipsum dummy text for your web and design projects.',
    intro: 'Quickly generate placeholder text (Lorem Ipsum) to use in your mockups, wireframes, and prototypes.',
    howTo: ['Select the number of paragraphs.', 'Copy the generated text.'],
    faq: [],
    Component: LoremIpsumGenerator
  },
  {
    slug: 'unix-timestamp-converter',
    name: 'Unix Timestamp Converter',
    category: 'Developer',
    icon: Timer,
    keywords: ['unix time', 'epoch', 'timestamp converter'],
    metaTitle: 'Unix Timestamp to Date Converter',
    metaDescription: 'Convert Unix timestamps (epoch) to human-readable dates and times.',
    intro: 'Convert a Unix timestamp (seconds since Jan 1, 1970) into your local date and time format.',
    howTo: ['Enter a timestamp in seconds.', 'The tool will automatically display the local date and time.'],
    faq: [],
    Component: UnixTimestampConverter
  },
  {
    slug: 'css-minifier',
    name: 'CSS Minifier',
    category: 'Developer',
    icon: Code,
    keywords: ['css minify', 'compress css', 'css optimizer'],
    metaTitle: 'CSS Minifier - Compress CSS Code',
    metaDescription: 'Minify your CSS code to reduce file size and improve website load times.',
    intro: 'Strip unnecessary whitespace, line breaks, and comments from your CSS to make it load faster in production.',
    howTo: ['Paste your uncompressed CSS into the input.', 'Copy the minified output.'],
    faq: [],
    Component: CssMinifier
  },
  {
    slug: 'color-converter',
    name: 'HEX & RGB Color Converter',
    category: 'Developer',
    icon: ImageIcon,
    keywords: ['color picker', 'hex to rgb', 'rgb converter'],
    metaTitle: 'HEX to RGB Color Converter',
    metaDescription: 'Convert HEX color codes to RGB and use a visual color picker.',
    intro: 'Easily convert HEX color codes to RGB format. Includes a visual color picker for easy selection.',
    howTo: ['Click the color swatch to pick a color, or type a HEX code.', 'The RGB value is updated automatically.'],
    faq: [],
    Component: ColorConverter
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'Developer',
    icon: Code,
    keywords: ['regex', 'regular expression', 'test regex'],
    metaTitle: 'Free Regular Expression Tester',
    metaDescription: 'Test your regular expressions in the browser instantly.',
    intro: 'Test and debug your JavaScript regular expressions. Enter your regex pattern, flags, and a test string to see the matches updated in real-time.',
    howTo: ['Enter your Regex pattern and flags.', 'Type the test string.', 'Matches will appear below.'],
    faq: [],
    Component: RegexTester
  },
  {
    slug: 'url-parser',
    name: 'URL Parser',
    category: 'Developer',
    icon: Link,
    keywords: ['url parser', 'parse url', 'breakdown url'],
    metaTitle: 'URL Parser & Analyzer',
    metaDescription: 'Break down a URL into its components: protocol, host, path, parameters.',
    intro: 'Analyze any URL by breaking it down into its individual components. Easily see the hostname, pathname, search parameters, and hash fragments.',
    howTo: ['Paste a valid URL.', 'View the parsed JSON object with all components.'],
    faq: [],
    Component: UrlParser
  },
  {
    slug: 'sha-generator',
    name: 'SHA Hash Generator',
    category: 'Developer',
    icon: Hash,
    keywords: ['sha1', 'sha256', 'sha512', 'hash generator'],
    metaTitle: 'Secure SHA Hash Generator',
    metaDescription: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes online.',
    intro: 'Generate cryptographic hashes for your text strings securely in your browser using the Web Crypto API. Supports SHA-1, SHA-256, SHA-384, and SHA-512.',
    howTo: ['Type your string in the input field.', 'The computed hashes will appear instantly.'],
    faq: [],
    Component: ShaGenerator
  },
  {
    slug: 'json-minifier',
    name: 'JSON Minifier',
    category: 'Developer',
    icon: Code,
    keywords: ['json minify', 'compress json'],
    metaTitle: 'JSON Minifier & Compressor',
    metaDescription: 'Minify and compress your JSON data by removing whitespace.',
    intro: 'Instantly minify your JSON data by stripping out whitespace, newlines, and indentation to reduce file sizes for production.',
    howTo: ['Paste valid JSON.', 'Copy the minified output.'],
    faq: [],
    Component: JsonMinifier
  },
  {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    category: 'Developer',
    icon: Code,
    keywords: ['xml format', 'pretty print xml', 'xml beautifier'],
    metaTitle: 'XML Formatter & Beautifier',
    metaDescription: 'Format and beautify your XML data online.',
    intro: 'Make unreadable, single-line XML strings easily readable by automatically adding appropriate indentation and newlines.',
    howTo: ['Paste your XML code.', 'The formatted XML is generated automatically.'],
    faq: [],
    Component: XmlFormatter
  },
  {
    slug: 'sql-minifier',
    name: 'SQL Minifier',
    category: 'Developer',
    icon: Code,
    keywords: ['sql minify', 'compress sql'],
    metaTitle: 'SQL Minifier',
    metaDescription: 'Minify your SQL queries by removing comments and extra spaces.',
    intro: 'Compress SQL queries into a single line by removing single/multi-line comments, tabs, and excess whitespace.',
    howTo: ['Paste your SQL code.', 'Copy the resulting single-line query.'],
    faq: [],
    Component: SqlMinifier
  },
  {
    slug: 'html-minifier',
    name: 'HTML Minifier',
    category: 'Developer',
    icon: Code,
    keywords: ['html minify', 'compress html'],
    metaTitle: 'HTML Minifier',
    metaDescription: 'Compress your HTML files by removing whitespace and comments.',
    intro: 'Reduce your HTML file size by stripping out comments and unneeded spaces between tags.',
    howTo: ['Paste HTML code.', 'Copy the compressed output.'],
    faq: [],
    Component: HtmlMinifier
  },
  {
    slug: 'chmod-calculator',
    name: 'Chmod Calculator',
    category: 'Developer',
    icon: Code,
    keywords: ['chmod', 'permissions', 'linux permissions'],
    metaTitle: 'Linux Chmod Permissions Calculator',
    metaDescription: 'Easily calculate Linux file permissions in octal and symbolic notation.',
    intro: 'A simple interactive calculator for Linux file permissions. Select the Read, Write, and Execute bits for Owner, Group, and Public to instantly see the octal and symbolic string.',
    howTo: ['Check or uncheck the permission boxes.', 'The octal (e.g. 755) and symbolic (e.g. rwxr-xr-x) notations update instantly.'],
    faq: [],
    Component: ChmodCalculator
  },
  {
    slug: 'text-to-slug',
    name: 'Text to URL Slug',
    category: 'Developer',
    icon: Link,
    keywords: ['slug generator', 'url slug', 'text to slug'],
    metaTitle: 'Text to URL Slug Converter',
    metaDescription: 'Convert any text string into a clean, SEO-friendly URL slug.',
    intro: 'Quickly transform titles, headlines, or sentences into clean URL slugs. It automatically lowercases text, removes special characters, and replaces spaces with hyphens.',
    howTo: ['Enter your text.', 'Copy the generated slug.'],
    faq: [],
    Component: TextToSlugConverter
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON Converter',
    category: 'Developer',
    icon: Code,
    keywords: ['csv to json', 'convert csv'],
    metaTitle: 'CSV to JSON Converter',
    metaDescription: 'Quickly convert CSV text data into a JSON array.',
    intro: 'Instantly transform your comma-separated values (CSV) text into a structured JSON array of objects.',
    howTo: ['Paste CSV data in the input.', 'Copy the generated JSON array from the output.'],
    faq: [],
    Component: CsvToJson
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV Converter',
    category: 'Developer',
    icon: Code,
    keywords: ['json to csv', 'convert json'],
    metaTitle: 'JSON to CSV Converter',
    metaDescription: 'Quickly convert an array of JSON objects into a CSV string.',
    intro: 'Easily flatten JSON arrays into comma-separated values (CSV) format for spreadsheet applications.',
    howTo: ['Paste your JSON array of objects.', 'Copy the generated CSV text.'],
    faq: [],
    Component: JsonToCsv
  },
  {
    slug: 'string-escape',
    name: 'String Escape / Unescape',
    category: 'Developer',
    icon: Code,
    keywords: ['escape string', 'unescape', 'json escape'],
    metaTitle: 'String Escaper & Unescaper',
    metaDescription: 'Escape strings for use in JSON or unescape them back to plain text.',
    intro: 'Add or remove escape characters (like quotes and newlines) from your strings so they can be safely parsed or displayed.',
    howTo: ['Select Escape or Unescape.', 'Paste your string and copy the result.'],
    faq: [],
    Component: StringEscape
  },
  {
    slug: 'hmac-generator',
    name: 'HMAC Generator',
    category: 'Developer',
    icon: ShieldX,
    keywords: ['hmac', 'hash based message authentication code'],
    metaTitle: 'HMAC Generator - Secure Hash',
    metaDescription: 'Generate HMAC hashes securely using your secret key and text.',
    intro: 'Compute HMAC signatures directly in your browser using the Web Crypto API. Support for SHA-1, SHA-256, SHA-384, and SHA-512.',
    howTo: ['Enter your secret key.', 'Choose an algorithm.', 'Enter your text to generate the HMAC hash.'],
    faq: [],
    Component: HmacGenerator
  },
  {
    slug: 'ipv4-subnet-calc',
    name: 'IPv4 Subnet Calculator',
    category: 'Developer',
    icon: Code,
    keywords: ['subnet', 'cidr', 'ipv4', 'calculator'],
    metaTitle: 'IPv4 CIDR Subnet Calculator',
    metaDescription: 'Calculate network ranges, broadcast addresses, and usable hosts from a CIDR notation.',
    intro: 'Quickly determine network address, broadcast address, netmask, and usable IP range for any given IPv4 address and CIDR block.',
    howTo: ['Enter the base IP address.', 'Enter the CIDR routing prefix (/24).'],
    faq: [],
    Component: Ipv4SubnetCalc
  },
  {
    slug: 'mime-type-lookup',
    name: 'MIME Type Lookup',
    category: 'Developer',
    icon: Search,
    keywords: ['mime type', 'content-type', 'extension'],
    metaTitle: 'MIME Type & Content-Type Lookup',
    metaDescription: 'Find the standard MIME type for any common file extension.',
    intro: 'Quickly look up the correct Content-Type header string (MIME type) for popular web file extensions.',
    howTo: ['Enter a file extension like "json" or "html".', 'See the associated MIME type instantly.'],
    faq: [],
    Component: MimeTypeLookup
  },
  {
    slug: 'js-keycode-info',
    name: 'JS Keycode Info',
    category: 'Developer',
    icon: Code,
    keywords: ['keycode', 'event.key', 'javascript key event'],
    metaTitle: 'JavaScript Keycode & Event Info',
    metaDescription: 'Press any key to get its JavaScript event.keyCode, event.code, and event.key.',
    intro: 'A simple interactive tool for developers to instantly find the key codes and key identifiers for keyboard events.',
    howTo: ['Click into the box and press any key.', 'Read the corresponding JS event properties.'],
    faq: [],
    Component: JsKeycodeInfo
  },
  {
    slug: 'query-string-parser',
    name: 'Query String Parser',
    category: 'Developer',
    icon: Link,
    keywords: ['query string', 'url parameters', 'parse query'],
    metaTitle: 'URL Query String Parser',
    metaDescription: 'Parse URL query string parameters into a formatted JSON object.',
    intro: 'Easily extract and decode URL search parameters into a clean, readable JSON format.',
    howTo: ['Paste a query string like "?foo=bar".', 'View the extracted key-value pairs.'],
    faq: [],
    Component: QueryStringParser
  },
  {
    slug: 'mac-address-generator',
    name: 'MAC Address Generator',
    category: 'Developer',
    icon: Hash,
    keywords: ['mac address', 'generator', 'random mac'],
    metaTitle: 'Random MAC Address Generator',
    metaDescription: 'Generate random, valid MAC addresses for testing and networking.',
    intro: 'Instantly generate one or multiple randomized MAC addresses in various formats.',
    howTo: ['Select the number of addresses.', 'Choose a format (colon, hyphen, or none).'],
    faq: [],
    Component: MacAddressGenerator
  },
  {
    slug: 'ipv4-generator',
    name: 'IPv4 Generator',
    category: 'Developer',
    icon: Hash,
    keywords: ['ipv4', 'random ip', 'generator'],
    metaTitle: 'Random IPv4 Address Generator',
    metaDescription: 'Generate random IPv4 addresses instantly.',
    intro: 'Generate one or multiple random, syntactically valid IPv4 addresses for use in testing and simulations.',
    howTo: ['Select the quantity.', 'Click Generate.'],
    faq: [],
    Component: Ipv4Generator
  },
  {
    slug: 'ipv6-generator',
    name: 'IPv6 Generator',
    category: 'Developer',
    icon: Hash,
    keywords: ['ipv6', 'random ip', 'generator'],
    metaTitle: 'Random IPv6 Address Generator',
    metaDescription: 'Generate random IPv6 addresses instantly.',
    intro: 'Generate one or multiple random, syntactically valid IPv6 addresses.',
    howTo: ['Select the quantity.', 'Click Generate.'],
    faq: [],
    Component: Ipv6Generator
  },
  {
    slug: 'http-status-codes',
    name: 'HTTP Status Codes',
    category: 'Developer',
    icon: Search,
    keywords: ['http status', 'status code', '404', '500'],
    metaTitle: 'HTTP Status Codes Reference',
    metaDescription: 'A searchable reference for HTTP response status codes.',
    intro: 'Quickly find the meaning and category of standard HTTP response status codes used on the web.',
    howTo: ['Type a code or word into the search bar.', 'View the matching status codes.'],
    faq: [],
    Component: HttpStatusCodes
  },
  {
    slug: 'text-to-morse',
    name: 'Text to Morse Code',
    category: 'Developer',
    icon: Replace,
    keywords: ['morse code', 'text to morse', 'translator'],
    metaTitle: 'Text to Morse Code Translator',
    metaDescription: 'Translate standard text strings into Morse code dots and dashes.',
    intro: 'Instantly convert your English text into international standard Morse code.',
    howTo: ['Type your text in the input box.', 'Copy the generated Morse code.'],
    faq: [],
    Component: TextToMorse
  },
  {
    slug: 'morse-to-text',
    name: 'Morse Code to Text',
    category: 'Developer',
    icon: Replace,
    keywords: ['morse to text', 'morse decoder', 'translator'],
    metaTitle: 'Morse Code to Text Translator',
    metaDescription: 'Decode Morse code dots and dashes back into English text.',
    intro: 'Instantly decode international Morse code strings back into readable letters and numbers.',
    howTo: ['Type or paste Morse code.', 'Use a slash (/) to indicate spaces between words.'],
    faq: [],
    Component: MorseToText
  },
  {
    slug: 'random-string-generator',
    name: 'Random String Generator',
    category: 'Developer',
    icon: KeyRound,
    keywords: ['random string', 'generator', 'random characters'],
    metaTitle: 'Random String & Password Generator',
    metaDescription: 'Generate completely random strings of any length and character set.',
    intro: 'Create highly customizable random strings for use as mock data, temporary passwords, or tokens.',
    howTo: ['Set your desired length.', 'Customize the allowed characters.', 'Click Regenerate.'],
    faq: [],
    Component: RandomStringGenerator
  },
  {
    slug: 'device-resolution-lookup',
    name: 'Device Resolution Lookup',
    category: 'Developer',
    icon: Search,
    keywords: ['screen size', 'resolution', 'aspect ratio'],
    metaTitle: 'Device Screen Resolutions & Sizes',
    metaDescription: 'Search standard screen resolutions and aspect ratios for popular devices.',
    intro: 'A quick reference cheat sheet for the logical screen resolutions and aspect ratios of popular phones, tablets, and displays.',
    howTo: ['Search for a device name (e.g. iPhone).', 'View its screen dimensions in points.'],
    faq: [],
    Component: DeviceResolutionLookup
  },
  {
    slug: 'password-strength-checker',
    name: 'Password Strength Checker',
    category: 'Developer',
    icon: ShieldX,
    keywords: ['password strength', 'password tester', 'security'],
    metaTitle: 'Password Strength Checker',
    metaDescription: 'Test the strength and complexity of your passwords locally.',
    intro: 'Check the security strength of a password by analyzing its length, character variety, and complexity without ever sending the data over the internet.',
    howTo: ['Type a password into the input field.', 'Observe the strength score indicator.'],
    faq: [],
    Component: PasswordStrengthChecker
  },
  {
    slug: 'text-to-decimal',
    name: 'Text to Decimal',
    category: 'Developer',
    icon: Binary,
    keywords: ['text to decimal', 'ascii to decimal'],
    metaTitle: 'Text to Decimal Converter',
    metaDescription: 'Convert plain text into its numeric decimal byte values.',
    intro: 'Instantly encode ASCII or UTF-8 text strings into an array of space-separated decimal values.',
    howTo: ['Type your text in the input box.', 'Copy the decimal values.'],
    faq: [],
    Component: TextToDecimal
  },
  {
    slug: 'decimal-to-text',
    name: 'Decimal to Text',
    category: 'Developer',
    icon: Binary,
    keywords: ['decimal to text', 'decimal to ascii'],
    metaTitle: 'Decimal to Text Converter',
    metaDescription: 'Decode numeric decimal byte values back into plain text.',
    intro: 'Convert an array of space-separated decimal bytes back into human-readable characters.',
    howTo: ['Paste your space-separated decimal values.', 'Copy the resulting text.'],
    faq: [],
    Component: DecimalToText
  },
  {
    slug: 'basic-js-minifier',
    name: 'Basic JS Minifier',
    category: 'Developer',
    icon: Code,
    keywords: ['js minify', 'javascript compressor'],
    metaTitle: 'Basic JavaScript Minifier',
    metaDescription: 'Compress your JavaScript code by removing comments and whitespace.',
    intro: 'A basic, regex-based JavaScript minifier designed to quickly strip comments, collapse spaces, and reduce the overall footprint of your scripts.',
    howTo: ['Paste your uncompressed JS code.', 'Copy the minified output.'],
    faq: [{ q: 'Is it safe for complex apps?', a: 'This is a basic regex-based tool and does not parse the AST. It is best used on simple scripts.' }],
    Component: BasicJsMinifier
  }
];
