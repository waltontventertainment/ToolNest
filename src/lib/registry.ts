import React from 'react';
import { Type, QrCode, Image as ImageIcon, KeyRound, Search, FileText, Binary, Code, Barcode, FileSearch, Timer, Scissors, ArrowDownAZ, Space, Filter, ArrowLeftRight, WrapText, SplitSquareHorizontal, Mail, Link, Hash, FileDiff, Replace, ListPlus, ShieldX, Calculator, Superscript, Clock, Palette, Database, Fingerprint, Scan, Crop, Globe, Heart, Activity, FileCode, Box, Share2, BarChart2, Tag, Zap, BookOpen, Layers as Hierarchy, Volume2, Keyboard, Monitor, Shuffle, Maximize2, Sliders, Stamp, Eye, EyeOff, Sparkles, Merge, RotateCw, ShieldAlert, CheckCircle2, Video, Briefcase, ShoppingBag, Users, GraduationCap, Globe2, Utensils, Scale, Calendar, MapPin, CloudSun, Cloud, Smile, Wifi, Download, User, Info, Map, Wind, Thermometer, ShieldCheck, Bookmark, RefreshCw } from 'lucide-react';
import { ToolDefinition, ToolCategory } from './types';

/**
 * Helper for route & tool-level code splitting with 0ms synchronous cache & instant hover/URL preloading.
 * Once a tool chunk is preloaded (on URL match or card hover), it renders synchronously in 0ms without triggering Suspense fallback.
 */
function lazyTool<T extends Record<string, any>>(
  loader: () => Promise<T>,
  exportName: keyof T
): React.ComponentType<any> & { preload?: () => Promise<any> } {
  let ResolvedComp: React.ComponentType<any> | null = null;
  let promise: Promise<{ default: React.ComponentType<any> }> | null = null;

  const load = () => {
    if (!promise) {
      promise = loader().then((mod) => {
        const comp = mod[exportName] as React.ComponentType<any>;
        ResolvedComp = comp;
        return { default: comp };
      });
    }
    return promise;
  };

  const LazyComp = React.lazy(load);

  const InstantOrLazyTool: React.FC<any> & { preload?: () => Promise<any> } = (props) => {
    if (ResolvedComp) {
      return React.createElement(ResolvedComp, props);
    }
    return React.createElement(LazyComp, props);
  };

  InstantOrLazyTool.preload = load;
  return InstantOrLazyTool;
}

const OpenMeteoWeatherTool = lazyTool(() => import('../tools/OpenMeteoWeatherTool'), 'OpenMeteoWeatherTool');

// 1. ConvertersBatch
const loadConvertersBatch = () => import('../tools/ConvertersBatch');
const TemperatureConverter = lazyTool(loadConvertersBatch, 'TemperatureConverter');
const LengthConverter = lazyTool(loadConvertersBatch, 'LengthConverter');
const WeightConverter = lazyTool(loadConvertersBatch, 'WeightConverter');
const VolumeConverter = lazyTool(loadConvertersBatch, 'VolumeConverter');
const DataStorageConverter = lazyTool(loadConvertersBatch, 'DataStorageConverter');
const AngleConverter = lazyTool(loadConvertersBatch, 'AngleConverter');
const Rot13Converter = lazyTool(loadConvertersBatch, 'Rot13Converter');
const TextToOctal = lazyTool(loadConvertersBatch, 'TextToOctal');
const OctalToText = lazyTool(loadConvertersBatch, 'OctalToText');
const RomanNumeralConverter = lazyTool(loadConvertersBatch, 'RomanNumeralConverter');

// 2. GeneratorsBatch
const loadGeneratorsBatch = () => import('../tools/GeneratorsBatch');
const CronGenerator = lazyTool(loadGeneratorsBatch, 'CronGenerator');
const CssGradientGenerator = lazyTool(loadGeneratorsBatch, 'CssGradientGenerator');
const PlaceholderImageGenerator = lazyTool(loadGeneratorsBatch, 'PlaceholderImageGenerator');
const MockDataGenerator = lazyTool(loadGeneratorsBatch, 'MockDataGenerator');
const SqlInsertGenerator = lazyTool(loadGeneratorsBatch, 'SqlInsertGenerator');
const IdGeneratorSuite = lazyTool(loadGeneratorsBatch, 'IdGeneratorSuite');
const SecretKeyGenerator = lazyTool(loadGeneratorsBatch, 'SecretKeyGenerator');
const AdvancedSlugGenerator = lazyTool(loadGeneratorsBatch, 'AdvancedSlugGenerator');
const FaviconManifestGenerator = lazyTool(loadGeneratorsBatch, 'FaviconManifestGenerator');
const BcryptHashGenerator = lazyTool(loadGeneratorsBatch, 'BcryptHashGenerator');

// 3. ScannerTools (html5-qrcode isolated chunk)
const loadScannerTools = () => import('../tools/ScannerTools');
const QrCodeScanner = lazyTool(loadScannerTools, 'QrCodeScanner');
const BarcodeScanner = lazyTool(loadScannerTools, 'BarcodeScanner');

// 4. NewToolsBatch
const loadNewToolsBatch = () => import('../tools/NewToolsBatch');
const ColorPickerPalette = lazyTool(loadNewToolsBatch, 'ColorPickerPalette');
const CssBoxShadowGenerator = lazyTool(loadNewToolsBatch, 'CssBoxShadowGenerator');
const JsonToTypescript = lazyTool(loadNewToolsBatch, 'JsonToTypescript');
const UnixCronHumanizer = lazyTool(loadNewToolsBatch, 'UnixCronHumanizer');
const SvgOptimizer = lazyTool(loadNewToolsBatch, 'SvgOptimizer');
const JwtGeneratorTester = lazyTool(loadNewToolsBatch, 'JwtGeneratorTester');
const DiscountTaxCalculator = lazyTool(loadNewToolsBatch, 'DiscountTaxCalculator');
const BmiCalorieCalculator = lazyTool(loadNewToolsBatch, 'BmiCalorieCalculator');
const TextCleanerPro = lazyTool(loadNewToolsBatch, 'TextCleanerPro');
const DomainIpLookup = lazyTool(loadNewToolsBatch, 'DomainIpLookup');

// 5. BatchExtraTools
const loadBatchExtraTools = () => import('../tools/BatchExtraTools');
const MarkdownToHtmlConverter = lazyTool(loadBatchExtraTools, 'MarkdownToHtmlConverter');
const JsonToXmlConverter = lazyTool(loadBatchExtraTools, 'JsonToXmlConverter');
const ScreenAspectRatioCalculator = lazyTool(loadBatchExtraTools, 'ScreenAspectRatioCalculator');
const ColorPaletteGenerator = lazyTool(loadBatchExtraTools, 'ColorPaletteGenerator');
const PxToRemConverter = lazyTool(loadBatchExtraTools, 'PxToRemConverter');
const TimeZoneConverter = lazyTool(loadBatchExtraTools, 'TimeZoneConverter');
const UserAgentParser = lazyTool(loadBatchExtraTools, 'UserAgentParser');
const FinancialEmiCalculator = lazyTool(loadBatchExtraTools, 'FinancialEmiCalculator');
const TextCaseCounterStats = lazyTool(loadBatchExtraTools, 'TextCaseCounterStats');
const SvgToPngConverter = lazyTool(loadBatchExtraTools, 'SvgToPngConverter');

// 6. SeoToolsBatch
const loadSeoToolsBatch = () => import('../tools/SeoToolsBatch');
const RobotsTxtGenerator = lazyTool(loadSeoToolsBatch, 'RobotsTxtGenerator');
const SitemapXmlGenerator = lazyTool(loadSeoToolsBatch, 'SitemapXmlGenerator');
const OpenGraphPreviewer = lazyTool(loadSeoToolsBatch, 'OpenGraphPreviewer');
const SchemaMarkupGenerator = lazyTool(loadSeoToolsBatch, 'SchemaMarkupGenerator');
const KeywordDensityAnalyzer = lazyTool(loadSeoToolsBatch, 'KeywordDensityAnalyzer');
const SerpSnippetOptimizer = lazyTool(loadSeoToolsBatch, 'SerpSnippetOptimizer');
const HrefLangRedirectGenerator = lazyTool(loadSeoToolsBatch, 'HrefLangRedirectGenerator');
const HeadingStructureAnalyzer = lazyTool(loadSeoToolsBatch, 'HeadingStructureAnalyzer');
const SeoSlugHealthChecker = lazyTool(loadSeoToolsBatch, 'SeoSlugHealthChecker');
const SeoContentReadabilityAudit = lazyTool(loadSeoToolsBatch, 'SeoContentReadabilityAudit');

// 7. UtilityToolsBatch
const loadUtilityToolsBatch = () => import('../tools/UtilityToolsBatch');
const CountdownTimerAlarm = lazyTool(loadUtilityToolsBatch, 'CountdownTimerAlarm');
const WorldClockScheduler = lazyTool(loadUtilityToolsBatch, 'WorldClockScheduler');
const RandomChoicePicker = lazyTool(loadUtilityToolsBatch, 'RandomChoicePicker');
const UnitPriceComparator = lazyTool(loadUtilityToolsBatch, 'UnitPriceComparator');
const ScreenWebcamTester = lazyTool(loadUtilityToolsBatch, 'ScreenWebcamTester');
const AudioToneGenerator = lazyTool(loadUtilityToolsBatch, 'AudioToneGenerator');
const FileHashCalculator = lazyTool(loadUtilityToolsBatch, 'FileHashCalculator');
const KeyboardKeyTester = lazyTool(loadUtilityToolsBatch, 'KeyboardKeyTester');
const ImageToBase64Converter = lazyTool(loadUtilityToolsBatch, 'ImageToBase64Converter');
const QuickScratchpadNotes = lazyTool(loadUtilityToolsBatch, 'QuickScratchpadNotes');

// 8. ColorImageToolsBatch
const loadColorImageToolsBatch = () => import('../tools/ColorImageToolsBatch');
const ImageResizerConverter = lazyTool(loadColorImageToolsBatch, 'ImageResizerConverter');
const ImageCropperRatio = lazyTool(loadColorImageToolsBatch, 'ImageCropperRatio');
const ImagePaletteExtractor = lazyTool(loadColorImageToolsBatch, 'ImagePaletteExtractor');
const ImageFiltersAdjuster = lazyTool(loadColorImageToolsBatch, 'ImageFiltersAdjuster');
const ImageWatermarkAdder = lazyTool(loadColorImageToolsBatch, 'ImageWatermarkAdder');
const ColorContrastWcagChecker = lazyTool(loadColorImageToolsBatch, 'ColorContrastWcagChecker');
const SvgToCssDataUriConverter = lazyTool(loadColorImageToolsBatch, 'SvgToCssDataUriConverter');
const ColorGradientMeshGenerator = lazyTool(loadColorImageToolsBatch, 'ColorGradientMeshGenerator');
const ColorBlindnessSimulator = lazyTool(loadColorImageToolsBatch, 'ColorBlindnessSimulator');
const ImageAnonymizerBlur = lazyTool(loadColorImageToolsBatch, 'ImageAnonymizerBlur');

// 9. Standalone Media & Wikipedia Tools
const YoutubeTranscriptTool = lazyTool(() => import('../tools/YoutubeTranscriptTool'), 'YoutubeTranscriptTool');
const WikipediaSummarizer = lazyTool(() => import('../tools/WikipediaSummarizer'), 'WikipediaSummarizer');
const WikipediaHistory = lazyTool(() => import('../tools/WikipediaHistory'), 'WikipediaHistory');
const WikipediaNearby = lazyTool(() => import('../tools/WikipediaNearby'), 'WikipediaNearby');

// 10. FreeApiToolsBatch
const loadFreeApiToolsBatch = () => import('../tools/FreeApiToolsBatch');
const RestCountriesTool = lazyTool(loadFreeApiToolsBatch, 'RestCountriesTool');
const LexiconDictionaryTool = lazyTool(loadFreeApiToolsBatch, 'LexiconDictionaryTool');
const OpenLibraryTool = lazyTool(loadFreeApiToolsBatch, 'OpenLibraryTool');
const AvatarGeneratorTool = lazyTool(loadFreeApiToolsBatch, 'AvatarGeneratorTool');
const QrServerGeneratorTool = lazyTool(loadFreeApiToolsBatch, 'QrServerGeneratorTool');
const LoremPicsumTool = lazyTool(loadFreeApiToolsBatch, 'LoremPicsumTool');
const IpifyInspectorTool = lazyTool(loadFreeApiToolsBatch, 'IpifyInspectorTool');
const JokeQuotableTool = lazyTool(loadFreeApiToolsBatch, 'JokeQuotableTool');
const HipolabsUniversitiesTool = lazyTool(loadFreeApiToolsBatch, 'HipolabsUniversitiesTool');
const WebsiteScreenshotTool = lazyTool(loadFreeApiToolsBatch, 'WebsiteScreenshotTool');

// 11. Core Single-File Tools
const CaseConverter = lazyTool(() => import('../tools/CaseConverter'), 'CaseConverter');
const QRGenerator = lazyTool(() => import('../tools/QRGenerator'), 'QRGenerator');
const ImageCompressor = lazyTool(() => import('../tools/ImageCompressor'), 'ImageCompressor');
const PasswordGenerator = lazyTool(() => import('../tools/PasswordGenerator'), 'PasswordGenerator');
const WordCounter = lazyTool(() => import('../tools/WordCounter'), 'WordCounter');
const Base64Converter = lazyTool(() => import('../tools/Base64Converter'), 'Base64Converter');
const BaseConverter = lazyTool(() => import('../tools/BaseConverter'), 'BaseConverter');
const BarcodeGenerator = lazyTool(() => import('../tools/BarcodeGenerator'), 'BarcodeGenerator');
const MetaTagGenerator = lazyTool(() => import('../tools/MetaTagGenerator'), 'MetaTagGenerator');
const Stopwatch = lazyTool(() => import('../tools/Stopwatch'), 'Stopwatch');
const SimpleCalculator = lazyTool(() => import('../tools/SimpleCalculator'), 'SimpleCalculator');
const AdvancedCalculator = lazyTool(() => import('../tools/AdvancedCalculator'), 'AdvancedCalculator');

// 12. TextUtilities
const loadTextUtilities = () => import('../tools/TextUtilities');
const RemoveDuplicateLines = lazyTool(loadTextUtilities, 'RemoveDuplicateLines');
const SortLines = lazyTool(loadTextUtilities, 'SortLines');
const RemoveExtraSpaces = lazyTool(loadTextUtilities, 'RemoveExtraSpaces');
const RemoveEmptyLines = lazyTool(loadTextUtilities, 'RemoveEmptyLines');
const ReverseText = lazyTool(loadTextUtilities, 'ReverseText');
const ReverseLines = lazyTool(loadTextUtilities, 'ReverseLines');
const HtmlStripper = lazyTool(loadTextUtilities, 'HtmlStripper');
const ExtractEmails = lazyTool(loadTextUtilities, 'ExtractEmails');
const ExtractUrls = lazyTool(loadTextUtilities, 'ExtractUrls');
const TextToBinary = lazyTool(loadTextUtilities, 'TextToBinary');
const BinaryToText = lazyTool(loadTextUtilities, 'BinaryToText');
const TextToHex = lazyTool(loadTextUtilities, 'TextToHex');
const HexToText = lazyTool(loadTextUtilities, 'HexToText');
const TextToAscii = lazyTool(loadTextUtilities, 'TextToAscii');
const AsciiToText = lazyTool(loadTextUtilities, 'AsciiToText');
const ShuffleLines = lazyTool(loadTextUtilities, 'ShuffleLines');
const AddLineNumbers = lazyTool(loadTextUtilities, 'AddLineNumbers');
const PrefixSuffixLines = lazyTool(loadTextUtilities, 'PrefixSuffixLines');
const TextDiff = lazyTool(loadTextUtilities, 'TextDiff');
const FindAndReplace = lazyTool(loadTextUtilities, 'FindAndReplace');

// 13. MoreDeveloperTools
const loadMoreDeveloperTools = () => import('../tools/MoreDeveloperTools');
const JsonFormatter = lazyTool(loadMoreDeveloperTools, 'JsonFormatter');
const UrlEncoder = lazyTool(loadMoreDeveloperTools, 'UrlEncoder');
const HtmlEntityEncoder = lazyTool(loadMoreDeveloperTools, 'HtmlEntityEncoder');
const Md5Generator = lazyTool(loadMoreDeveloperTools, 'Md5Generator');
const JwtDecoder = lazyTool(loadMoreDeveloperTools, 'JwtDecoder');
const UuidGenerator = lazyTool(loadMoreDeveloperTools, 'UuidGenerator');
const LoremIpsumGenerator = lazyTool(loadMoreDeveloperTools, 'LoremIpsumGenerator');
const UnixTimestampConverter = lazyTool(loadMoreDeveloperTools, 'UnixTimestampConverter');
const CssMinifier = lazyTool(loadMoreDeveloperTools, 'CssMinifier');
const ColorConverter = lazyTool(loadMoreDeveloperTools, 'ColorConverter');

// 14. EvenMoreDeveloperTools
const loadEvenMoreDeveloperTools = () => import('../tools/EvenMoreDeveloperTools');
const HtmlEditor = lazyTool(loadEvenMoreDeveloperTools, 'HtmlEditor');
const RegexTester = lazyTool(loadEvenMoreDeveloperTools, 'RegexTester');
const UrlParser = lazyTool(loadEvenMoreDeveloperTools, 'UrlParser');
const ShaGenerator = lazyTool(loadEvenMoreDeveloperTools, 'ShaGenerator');
const JsonMinifier = lazyTool(loadEvenMoreDeveloperTools, 'JsonMinifier');
const XmlFormatter = lazyTool(loadEvenMoreDeveloperTools, 'XmlFormatter');
const SqlMinifier = lazyTool(loadEvenMoreDeveloperTools, 'SqlMinifier');
const HtmlMinifier = lazyTool(loadEvenMoreDeveloperTools, 'HtmlMinifier');
const ChmodCalculator = lazyTool(loadEvenMoreDeveloperTools, 'ChmodCalculator');
const TextToSlugConverter = lazyTool(loadEvenMoreDeveloperTools, 'TextToSlugConverter');

// 15. DeveloperToolsBatch3
const loadDeveloperToolsBatch3 = () => import('../tools/DeveloperToolsBatch3');
const CsvToJson = lazyTool(loadDeveloperToolsBatch3, 'CsvToJson');
const JsonToCsv = lazyTool(loadDeveloperToolsBatch3, 'JsonToCsv');
const StringEscape = lazyTool(loadDeveloperToolsBatch3, 'StringEscape');
const HmacGenerator = lazyTool(loadDeveloperToolsBatch3, 'HmacGenerator');
const Ipv4SubnetCalc = lazyTool(loadDeveloperToolsBatch3, 'Ipv4SubnetCalc');
const MimeTypeLookup = lazyTool(loadDeveloperToolsBatch3, 'MimeTypeLookup');
const JsKeycodeInfo = lazyTool(loadDeveloperToolsBatch3, 'JsKeycodeInfo');
const QueryStringParser = lazyTool(loadDeveloperToolsBatch3, 'QueryStringParser');
const MacAddressGenerator = lazyTool(loadDeveloperToolsBatch3, 'MacAddressGenerator');
const Ipv4Generator = lazyTool(loadDeveloperToolsBatch3, 'Ipv4Generator');

// 16. DeveloperToolsBatch4
const loadDeveloperToolsBatch4 = () => import('../tools/DeveloperToolsBatch4');
const Ipv6Generator = lazyTool(loadDeveloperToolsBatch4, 'Ipv6Generator');
const HttpStatusCodes = lazyTool(loadDeveloperToolsBatch4, 'HttpStatusCodes');
const TextToMorse = lazyTool(loadDeveloperToolsBatch4, 'TextToMorse');
const MorseToText = lazyTool(loadDeveloperToolsBatch4, 'MorseToText');
const RandomStringGenerator = lazyTool(loadDeveloperToolsBatch4, 'RandomStringGenerator');
const DeviceResolutionLookup = lazyTool(loadDeveloperToolsBatch4, 'DeviceResolutionLookup');
const PasswordStrengthChecker = lazyTool(loadDeveloperToolsBatch4, 'PasswordStrengthChecker');
const TextToDecimal = lazyTool(loadDeveloperToolsBatch4, 'TextToDecimal');
const DecimalToText = lazyTool(loadDeveloperToolsBatch4, 'DecimalToText');
const BasicJsMinifier = lazyTool(loadDeveloperToolsBatch4, 'BasicJsMinifier');

// 17. PdfSuiteTools (pdf-lib & pdfjs-dist isolated chunk)
const loadPdfSuiteTools = () => import('../tools/PdfSuiteTools');
const PdfMergerTool = lazyTool(loadPdfSuiteTools, 'PdfMergerTool');
const PdfSplitterTool = lazyTool(loadPdfSuiteTools, 'PdfSplitterTool');
const PdfToTextTool = lazyTool(loadPdfSuiteTools, 'PdfToTextTool');
const TextToPdfTool = lazyTool(loadPdfSuiteTools, 'TextToPdfTool');
const PdfToImagesTool = lazyTool(loadPdfSuiteTools, 'PdfToImagesTool');
const PdfRotateTool = lazyTool(loadPdfSuiteTools, 'PdfRotateTool');
const PdfWatermarkTool = lazyTool(loadPdfSuiteTools, 'PdfWatermarkTool');

// 18. FunViralToolsBatch (Fun & Viral Open API Suite)
const loadFunViralToolsBatch = () => import('../tools/FunViralToolsBatch');
const MemeGeneratorStudioTool = lazyTool(loadFunViralToolsBatch, 'MemeGeneratorStudioTool');
const NameAgeNationalityPredictorTool = lazyTool(loadFunViralToolsBatch, 'NameAgeNationalityPredictorTool');
const YesNoMagicGifOracleTool = lazyTool(loadFunViralToolsBatch, 'YesNoMagicGifOracleTool');
const LiveTriviaQuizArenaTool = lazyTool(loadFunViralToolsBatch, 'LiveTriviaQuizArenaTool');
const PokemonPokedexBattleTool = lazyTool(loadFunViralToolsBatch, 'PokemonPokedexBattleTool');
const DadJokeComedyMachineTool = lazyTool(loadFunViralToolsBatch, 'DadJokeComedyMachineTool');
const WeirdUselessFactsExplorerTool = lazyTool(loadFunViralToolsBatch, 'WeirdUselessFactsExplorerTool');
const RandomExcuseGeneratorTool = lazyTool(loadFunViralToolsBatch, 'RandomExcuseGeneratorTool');
const CuteDogCatMoodBoosterTool = lazyTool(loadFunViralToolsBatch, 'CuteDogCatMoodBoosterTool');
const FoodRecipeRouletteTool = lazyTool(loadFunViralToolsBatch, 'FoodRecipeRouletteTool');
const RickMortyMultiverseScannerTool = lazyTool(loadFunViralToolsBatch, 'RickMortyMultiverseScannerTool');
const PirateShakespeareTranslatorTool = lazyTool(loadFunViralToolsBatch, 'PirateShakespeareTranslatorTool');

export const categories: ToolCategory[] = [
  'Universal Data Suite', 'Wikipedia', 'PDF', 'Text', 'Developer', 'Converters', 'Generators', 'QR & Barcode', 'Color & Image', 'Calculators', 'SEO', 'Utility', 'Fun & Viral'
];

export const tools: ToolDefinition[] = [
  {
    slug: 'rest-countries-explorer',
    name: 'Global Country Directory',
    category: 'Universal Data Suite',
    icon: Globe,
    previewIcons: [Map, Users, Info],
    keywords: ['countries explorer', 'country info', 'country flag', 'currency api', 'population lookup'],
    metaTitle: 'Global Country Directory',
    metaDescription: 'Instantly lookup details, flags, capitals, and currencies of 200+ countries.',
    intro: '',
    howTo: [],
    faq: [],
    Component: RestCountriesTool
  },
  {
    slug: 'free-dictionary-lookup',
    name: 'Lexicon Word Definitions',
    category: 'Universal Data Suite',
    icon: BookOpen,
    previewIcons: [Volume2, Type, Search],
    keywords: ['dictionary', 'word definitions', 'synonyms', 'audio pronunciation'],
    metaTitle: 'English Dictionary & Audio Pronunciation',
    metaDescription: 'Lookup English word definitions, phonetic spellings, synonyms, and audio pronunciation.',
    intro: '',
    howTo: [],
    faq: [],
    Component: LexiconDictionaryTool
  },
  {
    slug: 'open-library-book-search',
    name: 'Universal Library Explorer',
    category: 'Universal Data Suite',
    icon: BookOpen,
    previewIcons: [BookOpen, Users, Bookmark],
    keywords: ['library', 'book search', 'author lookup', 'book covers'],
    metaTitle: 'Book & Author Search Engine',
    metaDescription: 'Search millions of books, authors, and cover art seamlessly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: OpenLibraryTool
  },
  {
    slug: 'open-meteo-live-weather',
    name: 'Real-Time Weather Station',
    category: 'Universal Data Suite',
    icon: CloudSun,
    previewIcons: [Cloud, Thermometer, Wind],
    keywords: ['weather', 'live weather', 'temperature forecast'],
    metaTitle: 'Global Live Weather Station',
    metaDescription: 'Get real-time weather and temperature for any city.',
    intro: '',
    howTo: [],
    faq: [],
    Component: OpenMeteoWeatherTool
  },
  {
    slug: 'dicebear-robohash-avatar',
    name: 'Digital Persona Architect',
    category: 'Universal Data Suite',
    icon: Smile,
    previewIcons: [User, Smile, Zap],
    keywords: ['avatar', 'profile picture', 'generator', 'cartoon avatars'],
    metaTitle: 'Avatar & Profile Picture Generator',
    metaDescription: 'Generate unique cartoon and robot avatars from text instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: AvatarGeneratorTool
  },
  {
    slug: 'qr-server-code-maker',
    name: 'Advanced QR Suite',
    category: 'Universal Data Suite',
    icon: QrCode,
    previewIcons: [Link, QrCode, Download],
    keywords: ['qr', 'qr code', 'code generator'],
    metaTitle: 'QR Code Generator',
    metaDescription: 'Generate high-resolution QR codes from URLs or text instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: QrServerGeneratorTool
  },
  {
    slug: 'lorem-picsum-placeholder-images',
    name: 'Dynamic Visual Placeholders',
    category: 'Universal Data Suite',
    icon: ImageIcon,
    previewIcons: [ImageIcon, Crop, Download],
    keywords: ['placeholder', 'images', 'dummy photos', 'image generator'],
    metaTitle: 'Placeholder Image Generator',
    metaDescription: 'Generate unlimited dummy placeholder photos with custom dimensions and filters.',
    intro: '',
    howTo: [],
    faq: [],
    Component: LoremPicsumTool
  },
  {
    slug: 'ipify-public-ip-inspector',
    name: 'Network IP Identifier',
    category: 'Universal Data Suite',
    icon: Wifi,
    previewIcons: [Wifi, ShieldCheck, Globe],
    keywords: ['ip', 'public ip address', 'my ip', 'ip lookup'],
    metaTitle: 'Public IP Address Inspector',
    metaDescription: 'Instantly inspect your public IP address, ISP network details, and geographical location in real-time.',
    intro: '',
    howTo: [],
    faq: [],
    Component: IpifyInspectorTool
  },
  {
    slug: 'joke-motivation-hub',
    name: 'Inspiration & Humor Stream',
    category: 'Universal Data Suite',
    icon: Sparkles,
    previewIcons: [Sparkles, Smile, RefreshCw],
    keywords: ['jokes', 'motivation', 'random jokes', 'quotes'],
    metaTitle: 'Motivation & Fun Hub',
    metaDescription: 'Enjoy random tech jokes and inspirational quotes.',
    intro: '',
    howTo: [],
    faq: [],
    Component: JokeQuotableTool
  },
  {
    slug: 'hipolabs-universities-list',
    name: 'World Academic Directory',
    category: 'Universal Data Suite',
    icon: GraduationCap,
    previewIcons: [GraduationCap, Globe2, Link],
    keywords: ['universities', 'college', 'directory', 'world universities'],
    metaTitle: 'Global University Directory',
    metaDescription: 'Directory of universities and colleges across 200+ countries.',
    intro: '',
    howTo: [],
    faq: [],
    Component: HipolabsUniversitiesTool
  },
  {
    slug: 'website-screenshot-capture',
    name: 'Instant Web Snapshot',
    category: 'Universal Data Suite',
    icon: ImageIcon,
    previewIcons: [Monitor, ImageIcon, Download],
    keywords: ['screenshot', 'website capture', 'web page snapshot', 'url to image'],
    metaTitle: 'Website Screenshot Generator',
    metaDescription: 'Generate high-quality full-page screenshots of any website from a URL instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WebsiteScreenshotTool
  },
  {
    slug: 'wikipedia-summarizer',
    name: 'Wikipedia Article & Summary Explorer',
    category: 'Wikipedia',
    icon: BookOpen,
    keywords: ['wikipedia api', 'wikipedia summarizer', 'summarize article', 'wiki search', 'article reader'],
    metaTitle: 'Wikipedia Article & Summary Explorer',
    metaDescription: 'Search any Wikipedia article globally, extract high-precision summaries, and read full articles in English or Bengali.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WikipediaSummarizer
  },
  {
    slug: 'wikipedia-on-this-day-history',
    name: '"On This Day" History Timeline',
    category: 'Wikipedia',
    icon: Calendar,
    keywords: ['on this day', 'wikipedia history', 'today in history', 'timeline finder', 'historical events calculator'],
    metaTitle: '"On This Day" History Timeline Explorer - Wikipedia',
    metaDescription: 'Explore historically logged events, notable births, and deaths for any date of the year. Completely free timeline search.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WikipediaHistory
  },
  {
    slug: 'wikipedia-landmark-geosearch',
    name: 'Wikipedia Landmark Geo-Search',
    category: 'Wikipedia',
    icon: MapPin,
    keywords: ['wikipedia geosearch', 'nearby landmarks', 'locate monuments', 'historical spots GPS', 'nearby explorer'],
    metaTitle: 'Wikipedia Landmark Geo-Search - Locate Landmarks Near Me',
    metaDescription: 'Locate historical buildings, landmark coordinates, and registered monuments near your GPS coordinates or preset global cities.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WikipediaNearby
  },
  {
    slug: 'youtube-transcript-extractor',
    name: 'YouTube Transcript Extractor',
    category: 'Universal Data Suite',
    icon: Video,
    keywords: ['youtube transcript', 'youtube subtitles downloader', 'extract youtube text', 'youtube video to text'],
    metaTitle: 'YouTube Transcript Extractor - Video Subtitles Downloader',
    metaDescription: 'Extract, download, and copy subtitles or transcripts from any YouTube video in milliseconds. Powered by high-speed scraping with direct caption fetching.',
    intro: '',
    howTo: [],
    faq: [],
    Component: YoutubeTranscriptTool
  },
  {
    slug: 'pdf-merge',
    name: 'PDF Merger',
    category: 'PDF',
    icon: Merge,
    keywords: ['pdf merge', 'combine pdfs', 'join pdf', 'merge pdf files', 'pdf joiner'],
    metaTitle: 'PDF Merger - Combine Multiple PDF Files Online',
    metaDescription: 'Combine multiple PDF files into a single organized PDF document quickly and securely in your browser.',
    intro: '',
    howTo: [],
    faq: [],
    Component: PdfMergerTool
  },
  {
    slug: 'pdf-split',
    name: 'PDF Splitter & Page Extractor',
    category: 'PDF',
    icon: Scissors,
    keywords: ['pdf split', 'extract pdf pages', 'split pdf', 'separate pdf pages', 'pdf range extractor'],
    metaTitle: 'PDF Splitter & Page Extractor',
    metaDescription: 'Split a PDF document into separate page files or extract specific page ranges quickly and securely.',
    intro: '',
    howTo: [],
    faq: [],
    Component: PdfSplitterTool
  },
  {
    slug: 'pdf-to-text',
    name: 'PDF to Text Extractor',
    category: 'PDF',
    icon: FileCode,
    keywords: ['pdf to text', 'extract text from pdf', 'pdf reader text', 'pdf string parser', 'pdf txt converter'],
    metaTitle: 'PDF to Text Extractor',
    metaDescription: 'Extract raw text and string contents from any PDF file quickly and convert it to readable text or .txt file.',
    intro: '',
    howTo: [],
    faq: [],
    Component: PdfToTextTool
  },
  {
    slug: 'text-to-pdf',
    name: 'Text to PDF Generator',
    category: 'PDF',
    icon: FileText,
    keywords: ['text to pdf', 'convert txt to pdf', 'create pdf from text', 'notes to pdf', 'generate pdf text'],
    metaTitle: 'Text to PDF Generator',
    metaDescription: 'Convert plain text, notes, or articles into styled A4 PDF documents with custom font sizes.',
    intro: '',
    howTo: [],
    faq: [],
    Component: TextToPdfTool
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Image Converter',
    category: 'PDF',
    icon: ImageIcon,
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'pdf page renderer', 'pdf document images'],
    metaTitle: 'PDF to Image Converter',
    metaDescription: 'Render PDF pages into high-resolution PNG images for easy viewing, sharing, or embedding.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    metaTitle: 'Case Converter - Upper, Lower, Camel Case',
    metaDescription: 'Quickly convert text between uppercase, lowercase, title case, camel case, snake case, and kebab case online.',
    intro: '',
    howTo: [],
    faq: [],
    Component: CaseConverter
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'Text',
    icon: FileText,
    keywords: ['word count', 'character count', 'letter counter', 'text statistics'],
    metaTitle: 'Word & Character Counter - Online Text Tool',
    metaDescription: 'Instantly count words, characters, lines, and paragraphs in your text. 100% free and processes locally in your browser.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WordCounter
  },
  {
    slug: 'html-viewer-editor',
    name: 'HTML Viewer & Editor',
    category: 'Developer',
    icon: Code,
    keywords: ['html editor', 'html viewer', 'live html', 'code editor'],
    metaTitle: 'Live HTML Editor & Viewer',
    metaDescription: 'Write HTML code and see the live preview instantly. A fast, browser-based HTML viewer.',
    intro: '',
    howTo: [],
    faq: [],
    Component: HtmlEditor
  },
  {
    slug: 'base64-converter',
    name: 'Base64 Encode/Decode',
    category: 'Developer',
    icon: Code,
    keywords: ['base64 encoder', 'base64 decoder', 'btoa', 'atob', 'encode string'],
    metaTitle: 'Base64 Encoder & Decoder - Online Developer Tool',
    metaDescription: 'Instantly encode or decode text using Base64. A secure, browser-based developer utility that keeps your data private.',
    intro: '',
    howTo: [],
    faq: [],
    Component: Base64Converter
  },
  {
    slug: 'number-base-converter',
    name: 'Number Base Converter',
    category: 'Converters',
    icon: Binary,
    keywords: ['hex converter', 'binary to decimal', 'octal', 'hexadecimal', 'base converter'],
    metaTitle: 'Number Base Converter - Hex, Binary, Decimal, Octal',
    metaDescription: 'Convert numbers instantly between Decimal, Hexadecimal, Binary, and Octal bases. online utility.',
    intro: '',
    howTo: [],
    faq: [],
    Component: BaseConverter
  },
  {
    slug: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines',
    category: 'Text',
    icon: Scissors,
    keywords: ['remove duplicates', 'unique lines', 'dedupe text'],
    metaTitle: 'Remove Duplicate Lines - Online Tool',
    metaDescription: 'Easily remove duplicate lines from your text. Fast, free, and secure deduplication in your browser.',
    intro: '',
    howTo: [],
    faq: [],
    Component: RemoveDuplicateLines
  },
  {
    slug: 'sort-lines',
    name: 'Sort Lines',
    category: 'Text',
    icon: ArrowDownAZ,
    keywords: ['alphabetize', 'sort text', 'order lines'],
    metaTitle: 'Sort Lines Alphabetically - Online Tool',
    metaDescription: 'Sort text lines in alphabetical order instantly. browser-based utility.',
    intro: '',
    howTo: [],
    faq: [],
    Component: SortLines
  },
  {
    slug: 'remove-extra-spaces',
    name: 'Remove Extra Spaces',
    category: 'Text',
    icon: Space,
    keywords: ['clean spaces', 'trim text', 'remove whitespace'],
    metaTitle: 'Remove Extra Spaces - Text Cleaner',
    metaDescription: 'Remove double spaces, tabs, and trailing whitespaces from your text.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: ReverseText
  },
  {
    slug: 'reverse-lines',
    name: 'Reverse Lines',
    category: 'Text',
    icon: WrapText,
    keywords: ['flip list', 'reverse order', 'bottom to top'],
    metaTitle: 'Reverse Line Order - Online Tool',
    metaDescription: 'Reverse the order of lines in a list or text document.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: HtmlStripper
  },
  {
    slug: 'extract-emails',
    name: 'Extract Emails',
    category: 'Text',
    icon: Mail,
    keywords: ['find emails', 'email extractor', 'scrape emails'],
    metaTitle: 'Extract Emails from Text - Online Tool',
    metaDescription: 'Find and extract all email addresses from a block of text.',
    intro: '',
    howTo: [],
    faq: [],
    Component: ExtractEmails
  },
  {
    slug: 'extract-urls',
    name: 'Extract URLs',
    category: 'Text',
    icon: Link,
    keywords: ['find links', 'url extractor', 'scrape urls'],
    metaTitle: 'Extract URLs from Text - Online Tool',
    metaDescription: 'Find and extract all HTTP and HTTPS links from text.',
    intro: '',
    howTo: [],
    faq: [],
    Component: ExtractUrls
  },
  {
    slug: 'text-to-binary',
    name: 'Text to Binary',
    category: 'Text',
    icon: Binary,
    keywords: ['text to binary', 'binary encoder', 'convert to binary'],
    metaTitle: 'Text to Binary Converter - Tool',
    metaDescription: 'Convert plain text into binary code instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: TextToBinary
  },
  {
    slug: 'binary-to-text',
    name: 'Binary to Text',
    category: 'Text',
    icon: Type,
    keywords: ['binary decoder', 'binary to text', 'read binary'],
    metaTitle: 'Binary to Text Converter - Tool',
    metaDescription: 'Convert binary code back into human-readable plain text.',
    intro: '',
    howTo: [],
    faq: [],
    Component: BinaryToText
  },
  {
    slug: 'text-to-hex',
    name: 'Text to Hex',
    category: 'Text',
    icon: Hash,
    keywords: ['text to hex', 'hex encoder', 'hexadecimal'],
    metaTitle: 'Text to Hex Converter - Tool',
    metaDescription: 'Convert plain text into hexadecimal format.',
    intro: '',
    howTo: [],
    faq: [],
    Component: TextToHex
  },
  {
    slug: 'hex-to-text',
    name: 'Hex to Text',
    category: 'Text',
    icon: Type,
    keywords: ['hex decoder', 'hex to text', 'read hex'],
    metaTitle: 'Hex to Text Converter - Tool',
    metaDescription: 'Convert hexadecimal strings back into plain text.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: ShuffleLines
  },
  {
    slug: 'add-line-numbers',
    name: 'Add Line Numbers',
    category: 'Text',
    icon: ListPlus,
    keywords: ['number lines', 'list numbering', 'add numbers to text'],
    metaTitle: 'Add Line Numbers to Text - Tool',
    metaDescription: 'Automatically add sequential line numbers to the beginning of every line.',
    intro: '',
    howTo: [],
    faq: [],
    Component: AddLineNumbers
  },
  {
    slug: 'prefix-suffix-lines',
    name: 'Add Prefix & Suffix',
    category: 'Text',
    icon: SplitSquareHorizontal,
    keywords: ['add prefix', 'add suffix', 'wrap lines', 'prepend append'],
    metaTitle: 'Add Prefix & Suffix to Lines - Tool',
    metaDescription: 'Add text to the beginning (prefix) and end (suffix) of every line instantly.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: FindAndReplace
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'QR & Barcode',
    icon: QrCode,
    keywords: ['qr code', 'make qr', 'generate qr', 'url to qr'],
    metaTitle: 'QR Code Generator - High Quality PNG/SVG',
    metaDescription: 'Generate custom QR codes instantly for URLs, text, Wi-Fi, and more. Customize colors and download high-quality PNGs.',
    intro: '',
    howTo: [],
    faq: [],
    Component: QRGenerator
  },
  {
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'QR & Barcode',
    icon: Barcode,
    keywords: ['barcode creator', 'generate barcode', 'code128', 'ean13', 'upc'],
    metaTitle: 'Barcode Generator - CODE128, EAN, UPC',
    metaDescription: 'Generate standard barcodes online instantly. Supports CODE128, EAN-13, UPC, and more. Download high-quality PNGs for free.',
    intro: '',
    howTo: [],
    faq: [],
    Component: BarcodeGenerator
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'Color & Image',
    icon: ImageIcon,
    keywords: ['compress image', 'reduce file size', 'optimize image', 'shrink photo'],
    metaTitle: 'Online Image Compressor - Reduce File Size',
    metaDescription: 'Compress and optimize images directly in your browser. Reduce file sizes of JPEGs and PNGs without losing quality.',
    intro: '',
    howTo: [],
    faq: [],
    Component: ImageCompressor
  },
  {
    slug: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'SEO',
    icon: FileSearch,
    keywords: ['meta tags', 'seo tags', 'open graph', 'twitter cards', 'html head'],
    metaTitle: 'Meta Tag Generator - SEO & Open Graph',
    metaDescription: 'Create optimized HTML meta tags, Open Graph tags, and Twitter cards for your website to boost SEO and social sharing.',
    intro: '',
    howTo: [],
    faq: [],
    Component: MetaTagGenerator
  },
  {
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator & Validator',
    category: 'SEO',
    icon: FileText,
    keywords: ['robots.txt generator', 'crawl directives', 'disallow bot', 'googlebot rules', 'sitemap directive'],
    metaTitle: 'Robots.txt Generator & Validator - Online SEO Tool',
    metaDescription: 'Create and validate custom robots.txt files. Set disallow/allow crawl rules for Googlebot, GPTBot, and other crawlers with real-time URL testing.',
    intro: '',
    howTo: [],
    faq: [],
    Component: RobotsTxtGenerator
  },
  {
    slug: 'sitemap-xml-generator',
    name: 'XML Sitemap Generator & Visualizer',
    category: 'SEO',
    icon: Globe,
    keywords: ['xml sitemap generator', 'sitemap creator', 'google sitemap', 'sitemap.xml builder'],
    metaTitle: 'XML Sitemap Generator & Visualizer - Online Tool',
    metaDescription: 'Create valid XML sitemaps for Google and Bing. Bulk import URLs, set priority, change frequency, and download sitemap.xml instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: SitemapXmlGenerator
  },
  {
    slug: 'open-graph-previewer',
    name: 'Open Graph & Social Card Previewer',
    category: 'SEO',
    icon: Share2,
    keywords: ['open graph previewer', 'social card tester', 'twitter card preview', 'og tags generator'],
    metaTitle: 'Open Graph & Social Media Card Previewer - SEO Tool',
    metaDescription: 'Preview how your web page looks when shared on Facebook, Twitter/X, LinkedIn, Discord, and Google. Generate verified OG meta tags.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: SchemaMarkupGenerator
  },
  {
    slug: 'keyword-density-analyzer',
    name: 'Keyword Density & N-Gram Analyzer',
    category: 'SEO',
    icon: BarChart2,
    keywords: ['keyword density checker', 'n-gram analyzer', 'seo word frequency', 'text keyword counter'],
    metaTitle: 'Keyword Density & N-Gram Phrase Analyzer - SEO Tool',
    metaDescription: 'Analyze word frequency and keyword density percentages for 1-gram and 2-gram phrases in your text to prevent keyword stuffing.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: HeadingStructureAnalyzer
  },
  {
    slug: 'seo-slug-health-checker',
    name: 'SEO Slug & URL Health Generator',
    category: 'SEO',
    icon: Zap,
    keywords: ['seo slug generator', 'url slug cleaner', 'friendly url maker', 'slug sanitizer'],
    metaTitle: 'SEO Slug & Clean URL Health Generator - Tool',
    metaDescription: 'Convert article titles into clean, search-friendly SEO URL slugs. Strip special characters, spaces, and non-SEO parameters.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: SeoContentReadabilityAudit
  },
  {
    slug: 'stopwatch-timer',
    name: 'Stopwatch & Timer',
    category: 'Utility',
    icon: Timer,
    keywords: ['stopwatch', 'online timer', 'lap timer', 'time tracker'],
    metaTitle: 'Online Stopwatch & Lap Timer',
    metaDescription: 'A precise online stopwatch with lap tracking capabilities. Perfect for timing exercises, presentations, or sprints.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: AdvancedCalculator
  },
  {
    slug: 'simple-calculator',
    name: 'Simple Calculator',
    category: 'Calculators',
    icon: Calculator,
    keywords: ['basic calculator', 'simple math', 'apple calculator', 'standard calculator'],
    metaTitle: 'Simple Calculator - Easy & Accurate',
    metaDescription: 'A clean, simple, and highly accurate basic calculator for everyday use. Designed with a familiar interface.',
    intro: '',
    howTo: [],
    faq: [],
    Component: SimpleCalculator
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    category: 'Developer',
    icon: Code,
    keywords: ['json', 'format', 'beautify', 'pretty print'],
    metaTitle: 'JSON Formatter & Beautifier',
    metaDescription: 'Format and beautify your JSON data online. Easily make unreadable JSON readable.',
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
    faq: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: ColorConverter
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'Developer',
    icon: Code,
    keywords: ['regex', 'regular expression', 'test regex'],
    metaTitle: 'Regular Expression Tester',
    metaDescription: 'Test your regular expressions in the browser instantly.',
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
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
    intro: '',
    howTo: [],
    faq: [],
    Component: BasicJsMinifier
  },
  // ==========================================================================
  // FUN & VIRAL SUITE (12 Interactive Open-API Tools)
  // ==========================================================================
  {
    slug: 'viral-meme-generator',
    name: 'Viral Meme Studio',
    category: 'Fun & Viral',
    icon: Smile,
    previewIcons: [Smile, ImageIcon, Download],
    keywords: ['meme generator', 'make memes online', 'drake meme generator', 'memegen', 'funny meme maker'],
    metaTitle: 'Free Viral Meme Generator Studio Online',
    metaDescription: 'Create custom viral memes instantly using 100+ popular meme templates and download high-res PNGs.',
    intro: '',
    howTo: [],
    faq: [],
    Component: MemeGeneratorStudioTool
  },
  {
    slug: 'name-age-nationality-predictor',
    name: 'Name Vibe & Origin Predictor',
    category: 'Fun & Viral',
    icon: Sparkles,
    previewIcons: [Sparkles, Globe, Users],
    keywords: ['name age predictor', 'name nationality predictor', 'agify', 'nationalize', 'genderize', 'name vibe check'],
    metaTitle: 'Name Age, Nationality & Vibe Predictor',
    metaDescription: 'Enter any first name to predict statistical age, top country origins, demographic match, and personality vibe.',
    intro: '',
    howTo: [],
    faq: [],
    Component: NameAgeNationalityPredictorTool
  },
  {
    slug: 'yes-no-magic-gif-oracle',
    name: 'Yes/No Magic GIF Oracle',
    category: 'Fun & Viral',
    icon: Eye,
    previewIcons: [Eye, Sparkles, Video],
    keywords: ['yes or no oracle', 'magic 8 ball gif', 'yesno wtf', 'random decision maker gif'],
    metaTitle: 'Yes or No Magic GIF Decision Oracle',
    metaDescription: 'Ask any Yes or No question and get an instant verdict paired with a hilarious reaction GIF.',
    intro: '',
    howTo: [],
    faq: [],
    Component: YesNoMagicGifOracleTool
  },
  {
    slug: 'live-trivia-quiz-arena',
    name: 'Live Trivia & Brain Quiz',
    category: 'Fun & Viral',
    icon: GraduationCap,
    previewIcons: [GraduationCap, Zap, CheckCircle2],
    keywords: ['online trivia quiz', 'brain quiz game', 'open trivia db', 'general knowledge quiz'],
    metaTitle: 'Live Trivia & General Knowledge Quiz Arena',
    metaDescription: 'Test your IQ with live multiple-choice trivia questions, streak counters, and instant scoring.',
    intro: '',
    howTo: [],
    faq: [],
    Component: LiveTriviaQuizArenaTool
  },
  {
    slug: 'pokemon-pokedex-battle',
    name: 'Pokémon Battle Simulator',
    category: 'Fun & Viral',
    icon: Zap,
    previewIcons: [Zap, Activity, ShieldCheck],
    keywords: ['pokemon battle simulator', 'pokedex lookup', 'pokeapi', 'pokemon stats comparator'],
    metaTitle: 'Interactive Pokédex & Pokémon Battle Simulator',
    metaDescription: 'Compare official Pokémon artwork, base HP/Attack/Speed stats, and simulate head-to-head arena battles.',
    intro: '',
    howTo: [],
    faq: [],
    Component: PokemonPokedexBattleTool
  },
  {
    slug: 'dad-joke-generator',
    name: 'Dad Joke & Comedy Machine',
    category: 'Fun & Viral',
    icon: Volume2,
    previewIcons: [Smile, Volume2, RefreshCw],
    keywords: ['dad joke generator', 'funny jokes online', 'icanhazdadjoke', 'random pun generator'],
    metaTitle: 'Random Dad Joke & Pun Generator with Voice',
    metaDescription: 'Generate hilarious dad jokes and puns with one click, complete with text-to-speech voice playback.',
    intro: '',
    howTo: [],
    faq: [],
    Component: DadJokeComedyMachineTool
  },
  {
    slug: 'weird-useless-facts',
    name: 'Weird & Useless Facts',
    category: 'Fun & Viral',
    icon: Info,
    previewIcons: [Info, Sparkles, BookOpen],
    keywords: ['weird facts generator', 'useless facts', 'random fun facts', 'true trivia facts'],
    metaTitle: 'Weird & Useless True Facts Explorer',
    metaDescription: 'Discover mind-blowing, weird, and 100% verified useless facts from science, history, and nature.',
    intro: '',
    howTo: [],
    faq: [],
    Component: WeirdUselessFactsExplorerTool
  },
  {
    slug: 'random-excuse-generator',
    name: 'Smart Excuse & Alibi Maker',
    category: 'Fun & Viral',
    icon: ShieldAlert,
    previewIcons: [ShieldAlert, Briefcase, RefreshCw],
    keywords: ['random excuse generator', 'funny alibi maker', 'developer excuses', 'office excuse generator'],
    metaTitle: 'Funny Excuse & Developer Alibi Generator',
    metaDescription: 'Generate clever, hilarious excuses for developers, office meetings, college assignments, and parties.',
    intro: '',
    howTo: [],
    faq: [],
    Component: RandomExcuseGeneratorTool
  },
  {
    slug: 'cute-dog-cat-generator',
    name: 'Cute Dog & Cat Booster',
    category: 'Fun & Viral',
    icon: Heart,
    previewIcons: [Heart, ImageIcon, Smile],
    keywords: ['random dog pictures', 'random cat pictures', 'cute pet generator', 'cat facts', 'dog ceo api'],
    metaTitle: 'Random Cute Dog & Cat Photo Mood Booster',
    metaDescription: 'Instant mood booster featuring random adorable dog and cat photos paired with fun pet facts.',
    intro: '',
    howTo: [],
    faq: [],
    Component: CuteDogCatMoodBoosterTool
  },
  {
    slug: 'what-to-eat-food-roulette',
    name: 'What Should I Eat? Roulette',
    category: 'Fun & Viral',
    icon: Utensils,
    previewIcons: [Utensils, Globe2, Video],
    keywords: ['what should i eat', 'random meal picker', 'food roulette', 'recipe generator', 'themealdb'],
    metaTitle: 'What Should I Eat? Random Meal & Recipe Roulette',
    metaDescription: 'Spin the Food Roulette wheel to discover a random global dish with photo, instructions, and video recipe.',
    intro: '',
    howTo: [],
    faq: [],
    Component: FoodRecipeRouletteTool
  },
  {
    slug: 'rick-and-morty-character-explorer',
    name: 'Multiverse Character Scanner',
    category: 'Fun & Viral',
    icon: Users,
    previewIcons: [Users, Search, Sparkles],
    keywords: ['rick and morty api', 'character explorer', 'multiverse scanner', 'cartoon character lookup'],
    metaTitle: 'Rick & Morty Multiverse Character Scanner',
    metaDescription: 'Search and explore hundreds of multiverse characters, origins, species, and avatars instantly.',
    intro: '',
    howTo: [],
    faq: [],
    Component: RickMortyMultiverseScannerTool
  },
  {
    slug: 'pirate-shakespeare-translator',
    name: 'Funny Dialect Translator',
    category: 'Fun & Viral',
    icon: Replace,
    previewIcons: [Replace, Type, Smile],
    keywords: ['pirate translator', 'shakespeare translator', 'uwu translator', 'leet speak converter'],
    metaTitle: 'Pirate, Shakespeare, UwU & 1337 Dialect Translator',
    metaDescription: 'Convert ordinary English sentences into Pirate talk, Shakespearean English, Cute UwU, or 1337 Hacker speak.',
    intro: '',
    howTo: [],
    faq: [],
    Component: PirateShakespeareTranslatorTool
  }
];

/**
 * Preloads a tool's JS chunk into memory by slug so navigation or page refresh renders in 0ms.
 */
export function preloadToolBySlug(rawSlug: string): void {
  if (!rawSlug) return;
  const clean = rawSlug
    .replace(/\.html$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/^tools\//i, '')
    .trim()
    .toLowerCase();
  if (!clean) return;
  const found = tools.find(t => t.slug.toLowerCase() === clean);
  if (found && typeof (found.Component as any)?.preload === 'function') {
    (found.Component as any).preload();
    import('../pages/ToolPage').catch(() => {});
  }
}

// Immediately preload the matching tool chunk at 0ms when refreshing or landing directly on domain.com/tool-name
if (typeof window !== 'undefined') {
  try {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/^tools\//i, '');
    if (pathname && !pathname.includes('/')) {
      preloadToolBySlug(pathname);
    }
    const params = new URLSearchParams(window.location.search);
    const qTool = params.get('tool');
    if (qTool) {
      preloadToolBySlug(qTool);
    }
  } catch {}
}

const FLAGSHIP_INTERLEAVED_SLUGS = [
  'pdf-merger',               // PDF
  'image-compressor',         // Color & Image
  'json-formatter',           // Developer
  'qr-generator',             // QR & Barcode
  'word-counter',             // Text
  'password-generator',       // Generators
  'open-meteo-live-weather',  // Universal Data Suite
  'scientific-calculator',    // Calculators
  'temperature-converter',    // Converters
  'meta-tag-generator',       // SEO
  'stopwatch',                // Utility
  'viral-meme-generator',     // Fun & Viral
  'wikipedia-summarizer',     // Wikipedia
];

const INTERLEAVE_CATEGORY_ROTATION = [
  'PDF',
  'Color & Image',
  'Developer',
  'QR & Barcode',
  'Text',
  'Generators',
  'Universal Data Suite',
  'Calculators',
  'Converters',
  'SEO',
  'Utility',
  'Fun & Viral',
  'Wikipedia',
];

/**
 * Mixes tools across all categories using Round-Robin + Priority Balancing so that
 * under the Home 'All Tools' view, tools from every category are interleaved and
 * two tools of the same category never appear consecutively.
 */
export function getInterleavedTools(toolsList: ToolDefinition[]): ToolDefinition[] {
  if (toolsList.length <= 1) return toolsList;

  const result: ToolDefinition[] = [];
  const usedSlugs = new Set<string>();

  // 1. Place the 12 flagship tools first (each from a distinct category)
  for (const slug of FLAGSHIP_INTERLEAVED_SLUGS) {
    const found = toolsList.find(t => t.slug === slug);
    if (found && !usedSlugs.has(found.slug)) {
      result.push(found);
      usedSlugs.add(found.slug);
    }
  }

  // 2. Group remaining tools into per-category queues
  const buckets: Record<string, ToolDefinition[]> = {};
  for (const cat of INTERLEAVE_CATEGORY_ROTATION) {
    buckets[cat] = [];
  }
  for (const tool of toolsList) {
    if (usedSlugs.has(tool.slug)) continue;
    if (!buckets[tool.category]) {
      buckets[tool.category] = [];
    }
    buckets[tool.category].push(tool);
  }

  const allCats: string[] = Object.keys(buckets);
  let rotationCursor = 0;
  let lastCategory = result.length > 0 ? result[result.length - 1].category : '';

  const totalRemaining = () => {
    let sum = 0;
    for (const c of allCats) sum += buckets[c].length;
    return sum;
  };

  // 3. Interleave remaining tools so no two consecutive tools share a category
  while (totalRemaining() > 0) {
    const availableCats = allCats.filter(c => (buckets[c]?.length || 0) > 0);
    if (availableCats.length === 0) break;

    const nonRepeatingCats = availableCats.filter(c => c !== lastCategory);
    const pool = nonRepeatingCats.length > 0 ? nonRepeatingCats : availableCats;

    // If one bucket is getting disproportionately large (> 45% of remaining), drain it first
    const rem = totalRemaining();
    let chosenCat: string | null = null;
    for (const c of pool) {
      const len = buckets[c].length;
      if (len > rem * 0.42) {
        chosenCat = c;
        break;
      }
    }

    // Otherwise advance smoothly along the category rotation wheel
    if (!chosenCat) {
      for (let step = 0; step < allCats.length; step++) {
        const candidate = allCats[(rotationCursor + step) % allCats.length];
        if (pool.includes(candidate)) {
          chosenCat = candidate;
          rotationCursor = (rotationCursor + step + 1) % allCats.length;
          break;
        }
      }
    }

    if (!chosenCat) {
      chosenCat = pool[0];
    }

    const nextTool = buckets[chosenCat].shift()!;
    result.push(nextTool);
    lastCategory = nextTool.category;
  }

  return result;
}

