import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RotateCw, 
  Languages, 
  FileText, 
  Code, 
  Image as ImageIcon, 
  Mail, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Wand2,
  ArrowRight,
  Database,
  Zap
} from 'lucide-react';
import { runAutoAiCompletion } from '../lib/aiService';
import { toast } from 'sonner';
import { AiStreamingStatus, AiLiveCursor } from './AiToolsBatch2';
import { MarkdownRenderer, stripMarkdown } from '../components/MarkdownRenderer';
import { downloadBlob } from '../lib/downloadHelper';

// ============================================================================
// 1. AI Article & Blog Post Writer
// ============================================================================
export const AiArticleWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('engaging and informative');
  const [length, setLength] = useState('medium (approx 600 words)');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter an article topic or title.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Researching & outlining article...');

    const prompt = `Write a comprehensive, high-quality, SEO-friendly article on the following topic:
Topic: "${topic}"
Target Keywords: "${keywords || 'relevant natural keywords'}"
Tone: ${tone}
Target Length: ${length}
Language: ${language}

Format the output cleanly in Markdown with:
- A compelling H1 Title
- An engaging introduction
- Clear H2 and H3 subheadings with detailed, insightful paragraphs
- Bullet points or key takeaways where applicable
- A strong conclusion.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an expert content writer and journalist. Write well-structured, original, engaging articles in proper Markdown formatting.',
      temperature: 0.7,
      maxTokens: 2500,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Article generated successfully!');
    } else {
      toast.error(res.error || 'Failed to generate article.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean formatted article copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadArticle = () => {
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const filename = `${topic.slice(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '-') || 'article'}.md`;
    downloadBlob(blob, filename);
    toast.success('Article downloaded as Markdown file!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Wand2 className="w-4 h-4" />
            <span>Article Parameters</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Article Topic / Headline <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 10 Proven Strategies for Organic SaaS Growth"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Target SEO Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., SaaS growth, inbound marketing, customer retention"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Writing Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="engaging and informative">Engaging & Informative</option>
                <option value="professional and authoritative">Professional & Authoritative</option>
                <option value="friendly and casual">Friendly & Conversational</option>
                <option value="persuasive and sales-oriented">Persuasive / Copywriting</option>
                <option value="academic and research-backed">Academic & In-Depth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Article Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="short (approx 350-450 words)">Short (~400 words)</option>
                <option value="medium (approx 600-800 words)">Medium (~700 words)</option>
                <option value="long and comprehensive (1000+ words)">Long (1000+ words)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Output Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="English">English</option>
              <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
              <option value="Spanish (Español)">Spanish (Español)</option>
              <option value="French (Français)">French (Français)</option>
              <option value="German (Deutsch)">German (Deutsch)</option>
              <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              <option value="Arabic (العربية)">Arabic (العربية)</option>
              <option value="Portuguese (Português)">Portuguese (Português)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 px-4 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating Full Article...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Article with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Generated Article Output</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyResult}
                  className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={downloadArticle}
                  className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Download .md</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} />
                {loading && <AiLiveCursor />}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <FileText className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Your generated article will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">
                  Fill in your topic and click Generate. Our multi-model AI writes structured, SEO-friendly content automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. AI Text Summarizer & Key Takeaways
// ============================================================================
export const AiTextSummarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState('executive-bullets');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please paste or type text to summarize.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Distilling text & extracting takeaways...');

    let formatInstructions = 'Provide an executive summary followed by 5 clear bullet points and action items.';
    if (format === 'tldr') formatInstructions = 'Provide a short, punchy 2-3 sentence TL;DR summary.';
    if (format === 'in-depth') formatInstructions = 'Provide a structured in-depth breakdown covering Main Themes, Key Arguments, and Conclusions.';

    const prompt = `Please summarize the following text:
Format: ${formatInstructions}

--- Text to Summarize ---
${text}`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an executive assistant specializing in rapid, crystal-clear information summarization. Output cleanly in Markdown.',
      temperature: 0.5,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Summary generated!');
    } else {
      toast.error(res.error || 'Failed to summarize.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean summary copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Original Text</span>
            <span className="text-[10px] font-mono text-muted-foreground">{text.length} characters</span>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, meeting notes, essay, or document text here..."
            className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-foreground">Format:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="executive-bullets">Executive Summary + Bullets</option>
                <option value="tldr">Quick 1-Minute TL;DR</option>
                <option value="in-depth">In-Depth Structured Breakdown</option>
              </select>
            </div>

            <button
              onClick={handleSummarize}
              disabled={loading}
              className="btn-3d px-5 py-2 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Summarizing...' : 'Summarize Text'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">AI Summary</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[300px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <FileText className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Summary will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Paste any text on the left and click Summarize.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. AI Smart Multilingual Translator
// ============================================================================
export const AiSmartTranslator: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('Bengali');
  const [tone, setTone] = useState('natural');
  const [translatedText, setTranslatedText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate.');
      return;
    }

    setLoading(true);
    setTranslatedText('');
    setStatus('Translating with cultural nuances...');

    const prompt = `Translate the following text accurately into ${targetLang}.
Desired Tone: ${tone} (Ensure natural idioms, correct grammar, and proper cultural context).

Text to Translate:
"""
${sourceText}
"""

Output only the translated text. Do not add redundant meta commentary unless necessary for disambiguation.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a master polyglot translator. Provide natural, accurate, high-fidelity translations.',
      temperature: 0.3,
      onChunk: (chunk) => setTranslatedText(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setTranslatedText(res.text);
      toast.success('Translation completed!');
    } else {
      toast.error(res.error || 'Translation failed.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(translatedText));
    setCopied(true);
    toast.success('Clean translation copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Original Text</span>
            <span className="text-[10px] text-muted-foreground font-mono">{sourceText.length} chars</span>
          </div>

          <textarea
            rows={8}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste any text to translate..."
            className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary"
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                <option value="English">English</option>
                <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="Arabic (العربية)">Arabic (العربية)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
                <option value="Japanese (日本語)">Japanese (日本語)</option>
                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                <option value="Russian (Русский)">Russian (Русский)</option>
                <option value="Portuguese (Português)">Portuguese (Português)</option>
                <option value="Urdu (اردو)">Urdu (اردو)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Tone & Formality</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="natural and fluent">Natural & Fluent</option>
                <option value="formal and polite">Formal & Professional</option>
                <option value="casual and friendly">Casual & Conversational</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            <span>{loading ? 'Translating...' : `Translate to ${targetLang}`}</span>
          </button>
        </div>

        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Translation Result</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {translatedText && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[280px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {translatedText ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={translatedText} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Languages className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Translation will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Context-aware, idiom-safe multilingual AI translation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. AI Grammar & Tone Polisher
// ============================================================================
export const AiGrammarPolisher: React.FC = () => {
  const [input, setInput] = useState('');
  const [goal, setGoal] = useState('fix-grammar');
  const [polished, setPolished] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePolish = async () => {
    if (!input.trim()) {
      toast.error('Please enter text to polish.');
      return;
    }

    setLoading(true);
    setPolished('');
    setNotes([]);
    setStatus('Polishing grammar & tone...');

    const prompt = `Review and improve the following text.
Goal: ${goal}

--- Original Text ---
${input}

Please format your response strictly as:
POLISHED_TEXT:
[The improved version here]

IMPROVEMENTS_MADE:
- [Point 1]
- [Point 2]
- [Point 3]`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an elite proofreader and copy editor. Perfect grammar, elevate vocabulary, and improve clarity.',
      temperature: 0.4,
      onChunk: (chunk) => {
        const parts = chunk.split('IMPROVEMENTS_MADE:');
        const livePolished = parts[0]?.replace('POLISHED_TEXT:', '').trim();
        setPolished(livePolished || chunk);
        if (parts[1]) {
          const improvements = parts[1].split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
          setNotes(improvements);
        }
      },
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      const parts = res.text.split('IMPROVEMENTS_MADE:');
      const polishedText = parts[0]?.replace('POLISHED_TEXT:', '').trim();
      const improvements = parts[1]?.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean) || [];

      setPolished(polishedText || res.text);
      setNotes(improvements);
      toast.success('Text polished successfully!');
    } else {
      toast.error(res.error || 'Failed to polish text.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(polished));
    setCopied(true);
    toast.success('Clean polished text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Draft Text</span>
            <span className="text-[10px] text-muted-foreground font-mono">{input.length} chars</span>
          </div>

          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your draft email, essay, message, or article text here..."
            className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-foreground">Enhance Goal:</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Fix grammar, spelling, and punctuation errors only">Fix Grammar & Punctuation</option>
                <option value="Make it sound professional, crisp, and executive">Make Professional & Crisp</option>
                <option value="Simplify language for effortless readability">Simplify for Easy Reading</option>
                <option value="Make it persuasive, confident, and impactful">Make Persuasive & Confident</option>
                <option value="Elevate vocabulary for academic and scholarly writing">Academic & Scholarly</option>
              </select>
            </div>

            <button
              onClick={handlePolish}
              disabled={loading}
              className="btn-3d px-5 py-2 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Polishing...' : 'Polish Text'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Polished Output</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {polished && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[220px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {polished ? (
              <div className="space-y-4">
                <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                  <MarkdownRenderer content={polished} liveCursor={loading} />
                </div>

                {notes.length > 0 && (
                  <div className="pt-3 border-t border-border space-y-1.5">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Key Improvements Made:
                    </span>
                    <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                      {notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <FileText className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Polished version will appear here</p>
                <p className="text-[11px] max-w-xs mt-1">Instant typo removal, vocabulary elevation, and flow enhancement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. AI Code Explainer & Bug Fixer
// ============================================================================
export const AiCodeExplainer: React.FC = () => {
  const [code, setCode] = useState('');
  const [action, setAction] = useState('explain-and-fix');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please paste code to analyze.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Analyzing code structure & potential bugs...');

    let prompt = '';
    if (action === 'explain-and-fix') {
      prompt = `Analyze the following code. 
1. Explain what it does step-by-step.
2. Identify potential bugs, security flaws, or edge-case failures.
3. Provide the corrected, optimized version of the code.

Code:
\`\`\`
${code}
\`\`\``;
    } else if (action === 'refactor-optimize') {
      prompt = `Refactor the following code for maximum performance, readability, and modern clean architecture. Provide the refactored code and explain what was improved.

Code:
\`\`\`
${code}
\`\`\``;
    } else {
      prompt = `Write comprehensive unit tests with edge cases for the following code snippet.

Code:
\`\`\`
${code}
\`\`\``;
    }

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a principal software engineer. Provide clear, precise code explanations, bug diagnoses, and optimized code blocks in Markdown.',
      temperature: 0.3,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Code analysis completed!');
    } else {
      toast.error(res.error || 'Failed to analyze code.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean analysis copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Input Code Snippet</span>
            <span className="text-[10px] text-muted-foreground font-mono">{code.split('\n').length} lines</span>
          </div>

          <textarea
            rows={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste any JavaScript, Python, C++, SQL, Rust, Go, or PHP code here..."
            className="w-full p-3 text-xs border border-border rounded-xl font-mono focus:outline-hidden focus:border-primary leading-relaxed bg-background"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-foreground">Task:</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="explain-and-fix">Explain + Find & Fix Bugs</option>
                <option value="refactor-optimize">Refactor for Performance</option>
                <option value="generate-tests">Generate Unit Tests</option>
              </select>
            </div>

            <button
              onClick={handleAnalyzeCode}
              disabled={loading}
              className="btn-3d px-5 py-2 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
              <span>{loading ? 'Analyzing...' : 'Analyze Code with AI'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">AI Engineering Breakdown</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[300px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Code className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Code analysis will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get line-by-line breakdown, bug detection, and instant refactoring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. AI Image Prompt Generator (Midjourney / DALL-E / Flux)
// ============================================================================
export const AiImagePromptGenerator: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [platform, setPlatform] = useState('Midjourney v6');
  const [style, setStyle] = useState('Cinematic Photorealistic (8K)');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePrompts = async () => {
    if (!concept.trim()) {
      toast.error('Please enter an image concept or description.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Crafting visual prompt tags & camera parameters...');

    const prompt = `Create 3 distinct, hyper-detailed, professional image generation prompts based on this idea:
Concept: "${concept}"
Target Generator: ${platform}
Art Style: ${style}
Aspect Ratio: ${aspectRatio}

For each variant:
1. Provide the complete Positive Prompt (including camera lens, lighting, atmospheric details, textures, rendering engine parameters).
2. Provide a Negative Prompt.
3. Include the exact parameter tags (e.g. --ar ${aspectRatio} --v 6.0 --style raw for Midjourney).`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an award-winning AI prompt engineer specializing in Midjourney, DALL-E 3, Stable Diffusion, and Flux prompts.',
      temperature: 0.8,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Prompts generated successfully!');
    } else {
      toast.error(res.error || 'Failed to generate prompts.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean prompts copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ImageIcon className="w-4 h-4" />
            <span>Prompt Configuration</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Image Concept / Idea <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Cyberpunk street market in rainy Tokyo with glowing neon signs and holographic cat"
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Engine</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Midjourney v6">Midjourney v6</option>
                <option value="DALL-E 3">DALL-E 3</option>
                <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                <option value="Flux.1">Flux.1</option>
                <option value="Leonardo AI">Leonardo AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden font-mono"
              >
                <option value="16:9">16:9 (Landscape / Wallpaper)</option>
                <option value="1:1">1:1 (Square / Instagram)</option>
                <option value="9:16">9:16 (Story / Reel / Mobile)</option>
                <option value="4:5">4:5 (Portrait)</option>
                <option value="21:9">21:9 (Ultrawide Cinema)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Aesthetic Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Cinematic Photorealistic (8K)">Cinematic Photorealistic (8K)</option>
              <option value="Anime / Studio Ghibli Aesthetic">Anime / Studio Ghibli</option>
              <option value="3D Pixar / Unreal Engine 5 Render">3D Pixar / Unreal Engine 5</option>
              <option value="Dark Fantasy & Oil Painting">Dark Fantasy & Oil Painting</option>
              <option value="Cyberpunk & Neon Noir">Cyberpunk & Neon Noir</option>
              <option value="Minimalist Vector Illustration">Minimalist Vector Art</option>
            </select>
          </div>

          <button
            onClick={handleGeneratePrompts}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Generating Prompts...' : 'Generate 3 Detailed Prompts'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Engineered Prompts</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[350px] p-5 rounded-2xl bg-card border border-border overflow-y-auto font-mono text-xs">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6 font-sans">
                <ImageIcon className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Generated prompts will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get production-grade lighting, camera tags, and negative prompts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. AI Email & Pitch Writer
// ============================================================================
export const AiEmailWriter: React.FC = () => {
  const [purpose, setPurpose] = useState('Cold Sales Pitch & Product Outreach');
  const [recipient, setRecipient] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState('Professional & Persuasive');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateEmail = async () => {
    if (!keyPoints.trim()) {
      toast.error('Please provide some key points to include in the email.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Drafting subject lines & body...');

    const prompt = `Write a high-converting, professional email for the following purpose:
Purpose: ${purpose}
Recipient: ${recipient || 'Prospective client / Manager'}
Tone: ${tone}
Key Points & Details to include:
"""
${keyPoints}
"""

Please provide:
1. 3 Catchy Subject Line Options (High Open Rate)
2. The Full Polished Email Body with placeholders like [Name] clearly marked.
3. A 1-sentence Follow-Up Email template.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are an executive communication and email copy expert. Write concise, compelling emails that drive responses.',
      temperature: 0.7,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Email draft ready!');
    } else {
      toast.error(res.error || 'Failed to generate email.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean email copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>Email Brief</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Email Category</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Cold Sales Pitch & Product Outreach">Cold Sales Outreach</option>
              <option value="Job Application & Cover Letter Intro">Job Application / Cover Letter</option>
              <option value="Client Follow-up on Proposal / Invoice">Follow-up on Proposal / Invoice</option>
              <option value="Meeting Request & Schedule Intro">Meeting Request & Intro</option>
              <option value="Formal Resignation or Leave Request">Formal Resignation / Leave Request</option>
              <option value="Partnership & Collaboration Inquiry">Partnership & Collaboration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Recipient Name / Role (optional)</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g., Marketing Director at TechCorp"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Key Points & Details to Mention <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g., Mention our new AI tool, offer a 15-minute quick demo next Tuesday, reference their recent company milestone..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            >
              <option value="Professional & Persuasive">Professional & Persuasive</option>
              <option value="Warm & Friendly">Warm & Friendly</option>
              <option value="Direct, Concise & Executive">Direct & Concise (Under 100 words)</option>
              <option value="Formal & Respectful">Formal & Respectful</option>
            </select>
          </div>

          <button
            onClick={handleGenerateEmail}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Drafting Email...' : 'Generate Email & Subjects'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">AI Email Draft</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[350px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Mail className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Drafted email will stream in real time</p>
                <p className="text-[11px] max-w-xs mt-1">Get high-open-rate subject lines and formatted body copy instantly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. AI SEO Meta & Keyword Generator
// ============================================================================
export const AiSeoGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSeo = async () => {
    if (!topic.trim()) {
      toast.error('Please enter your page topic or product description.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Generating high-CTR SEO titles & meta descriptions...');

    const prompt = `Generate comprehensive SEO metadata and keyword strategy for the following:
Page Topic / Product: "${topic}"
Target Audience: "${targetAudience || 'General online users'}"

Please provide:
1. 5 High-CTR SEO Titles (Strictly under 60 characters with pixel width optimization)
2. 3 Compelling Meta Descriptions (Strictly under 155 characters with call-to-actions)
3. Primary Focus Keyword + 8 High-Volume Long-Tail Keywords
4. Recommended H2 and H3 Content Outline for maximum search engine ranking.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a senior SEO strategist. Provide actionable, high-CTR metadata strictly within character limits.',
      temperature: 0.6,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('SEO metadata generated!');
    } else {
      toast.error(res.error || 'Failed to generate SEO metadata.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean SEO package copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>SEO Target Info</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Page Topic / Product / Article Idea <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Free online PDF converter tools for students and professionals to merge, compress, and edit PDFs..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Target Audience / Country (optional)</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Global developers, students, small businesses"
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleGenerateSeo}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Generating SEO Package...' : 'Generate Titles, Meta & Keywords'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">SEO Metadata & Keyword Strategy</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[350px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Search className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">SEO recommendations will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Get pixel-perfect titles, 155-character descriptions, and ranking keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. AI Regex & SQL Query Generator
// ============================================================================
export const AiRegexSqlGenerator: React.FC = () => {
  const [mode, setMode] = useState<'regex' | 'sql'>('regex');
  const [description, setDescription] = useState('');
  const [flavor, setFlavor] = useState('javascript');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe the regex or SQL query you want.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus(`Synthesizing ${mode === 'regex' ? 'regular expression' : 'SQL query'}...`);

    const prompt = mode === 'regex' 
      ? `Generate a regular expression for the following requirement:
Requirement: "${description}"
Regex Flavor: ${flavor}

Please provide:
1. The exact Regular Expression Pattern (with flags)
2. Breakdown and explanation of each token/part
3. Positive test cases (strings that should match)
4. Negative test cases (strings that should NOT match)
5. Practical code usage example in ${flavor}.`
      : `Generate an optimized SQL query for the following database requirement:
Requirement: "${description}"
SQL Dialect: ${flavor} (PostgreSQL / MySQL / SQLite / SQL Server)

Please provide:
1. The complete, optimized SQL Query (formatted cleanly with uppercase keywords)
2. Step-by-step query explanation (clauses, indexes used, joins, performance tips)
3. Sample table schema assumptions
4. Expected output format.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: mode === 'regex' 
        ? 'You are a regex and parsing specialist. Write bulletproof regex patterns with clear explanations.' 
        : 'You are a senior database architect. Write high-performance, secure SQL queries with explanations.',
      temperature: 0.3,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success(`${mode === 'regex' ? 'Regex' : 'SQL'} generated successfully!`);
    } else {
      toast.error(res.error || 'Failed to generate query.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean output copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Code className="w-4 h-4" />
            <span>Generator Settings</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setMode('regex'); setFlavor('javascript'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                mode === 'regex' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              Regex Pattern
            </button>
            <button
              onClick={() => { setMode('sql'); setFlavor('PostgreSQL / MySQL'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                mode === 'sql' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              SQL Query
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Describe What You Need in Plain English <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={mode === 'regex' 
                ? "e.g., Match valid international phone numbers with optional country code, spaces, and hyphens..." 
                : "e.g., Select the top 5 customers with highest total order spend in the last 30 days including user names and email..."}
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {mode === 'regex' ? 'Language / Regex Engine' : 'Database Dialect'}
            </label>
            <input
              type="text"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              placeholder={mode === 'regex' ? 'e.g., JavaScript (ES2024), Python re, PCRE, Go' : 'e.g., PostgreSQL, MySQL, SQLite, Oracle'}
              className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Generating...' : `Generate ${mode === 'regex' ? 'Regex' : 'SQL Query'}`}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                {mode === 'regex' ? 'Regex Pattern & Explanation' : 'SQL Query & Analysis'}
              </span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[350px] p-5 rounded-2xl bg-card border border-border overflow-y-auto font-mono">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6 font-sans">
                <Code className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Generated code will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Get precise regular expressions and optimized SQL queries in seconds.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 10. AI Social Media Post & Hashtag Generator
// ============================================================================
export const AiSocialPostGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter / X');
  const [tone, setTone] = useState('Viral & Catchy');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter the topic or idea for your social post.');
      return;
    }

    setLoading(true);
    setResult('');
    setStatus('Crafting viral hooks & social variations...');

    const prompt = `Write engaging social media posts for the following platform:
Platform: ${platform}
Topic / Link / Announcement: "${topic}"
Tone: ${tone}
Include Trending Hashtags: ${includeHashtags ? 'Yes' : 'No'}

Please generate:
1. 3 Different Post Variations (Short/Punchy, Story-Driven, and Value/Question-Driven)
2. Eye-catching Hook first lines
3. Clear Call to Action (CTA)
4. Relevant hashtags categorized by niche and broad appeal.`;

    const res = await runAutoAiCompletion({
      prompt,
      systemPrompt: 'You are a top social media growth strategist. Write viral, scroll-stopping hooks and engaging posts.',
      temperature: 0.8,
      onChunk: (chunk) => setResult(chunk),
      onStatus: (st) => setStatus(st)
    });

    setLoading(false);
    setStatus('');
    if (res.success) {
      setResult(res.text);
      toast.success('Social posts generated!');
    } else {
      toast.error(res.error || 'Failed to generate posts.');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(stripMarkdown(result));
    setCopied(true);
    toast.success('Clean posts copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Social Post Builder</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Topic / Announcement / Product Idea <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Just launched ToolNest — an all-in-one free toolkit with 50+ tools for developers and creators. No signups required..."
              className="w-full p-3 text-xs border border-border rounded-xl focus:outline-hidden focus:border-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Twitter / X (Thread & Tweets)">Twitter / X</option>
                <option value="LinkedIn (Thought Leadership)">LinkedIn</option>
                <option value="Instagram Caption">Instagram</option>
                <option value="Facebook Page">Facebook</option>
                <option value="YouTube Community / Description">YouTube</option>
                <option value="Threads">Threads</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Vibe & Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-border rounded-xl focus:outline-hidden"
              >
                <option value="Viral & Catchy">Viral & Catchy</option>
                <option value="Professional & Thought Leadership">Professional</option>
                <option value="Casual & Humorous">Casual / Witty</option>
                <option value="Storytelling & Personal">Storytelling</option>
                <option value="Promotional & Urgent">Hype / Launch</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Include high-engagement hashtags</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-3d py-2.5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Crafting Posts...' : 'Generate Viral Social Posts'}</span>
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Generated Social Posts & Variations</span>
              <AiStreamingStatus loading={loading} status={status} />
            </div>
            {result && (
              <button onClick={copyResult} className="btn-signature-header px-2.5 py-1 text-xs gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[350px] p-5 rounded-2xl bg-card border border-border overflow-y-auto">
            {result ? (
              <div className="text-xs md:text-sm text-foreground leading-relaxed font-sans">
                <MarkdownRenderer content={result} liveCursor={loading} />
              </div>
            ) : (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                <Sparkles className="w-8 h-8 mb-2 opacity-40 text-primary" />
                <p className="font-semibold text-xs text-foreground">Social media posts will stream live</p>
                <p className="text-[11px] max-w-xs mt-1">Generate hooks, body copy, and hashtags tailored for any network.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
